import { validateChallengeItem } from './adaptive-core.js';

const DEFAULT_ENDPOINT = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'gemma4:e4b';

const GENERATION_RESPONSE_FALLBACK = {
    problem_id: 'fallback-problem',
    stage_id: 'stage1',
    lesson_id: 'L1.1',
    competency_id: 'mole-concept',
    difficulty: 'foundation',
    prompt: 'Fallback challenge: compute 3 + 4.',
    answer_format: 'numeric',
    answer_key: 7,
    rubric: {
        scoring: 'exact-match',
        max_points: 1
    },
    hint_chain: [
        'Count up from 3 by four steps.',
        '3 + 1 = 4, 4 + 1 = 5, 5 + 1 = 6, 6 + 1 = 7.'
    ],
    worked_solution: '3 + 4 = 7',
    tags: ['fallback', 'addition']
};

function getConfiguredEndpoint() {
    const override = localStorage.getItem('chemistry_ollama_endpoint');
    return override && override.trim() ? override.trim() : DEFAULT_ENDPOINT;
}

function getConfiguredModel() {
    return localStorage.getItem('chemistry_llm') || DEFAULT_MODEL;
}

function getTagsEndpoint(generateEndpoint) {
    return generateEndpoint.replace('/api/generate', '/api/tags');
}

function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function pickAvailableModel(requestedModel, models) {
    if (!Array.isArray(models) || models.length === 0) return requestedModel;

    const exact = models.find((model) => model?.name === requestedModel);
    if (exact?.name) return exact.name;

    const gemma = models.find((model) => typeof model?.name === 'string' && model.name.toLowerCase().includes('gemma'));
    if (gemma?.name) return gemma.name;

    const first = models.find((model) => typeof model?.name === 'string' && model.name.trim());
    return first?.name || requestedModel;
}

async function fetchAvailableModels(endpoint) {
    const response = await fetch(getTagsEndpoint(endpoint), { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
        throw new Error(`Tags endpoint failed with status ${response.status}`);
    }
    const payload = await response.json();
    return Array.isArray(payload?.models) ? payload.models : [];
}

function parseJsonObject(rawText) {
    const text = typeof rawText === 'string' ? rawText.trim() : '';
    if (!text) {
        throw new Error('Model returned empty response text.');
    }

    try {
        return JSON.parse(text);
    } catch (_err) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) {
            throw new Error('No JSON object found in model response.');
        }
        return JSON.parse(text.slice(start, end + 1));
    }
}

async function runGenerateCall(prompt, system, options = {}) {
    const endpoint = getConfiguredEndpoint();
    let model = getConfiguredModel();

    try {
        const models = await fetchAvailableModels(endpoint);
        model = pickAvailableModel(model, models);
        localStorage.setItem('chemistry_llm', model);
    } catch (_err) {
        // Keep existing model when tag lookup is unavailable.
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            stream: false,
            prompt,
            system,
            options: {
                temperature: typeof options.temperature === 'number' ? options.temperature : 0.5,
                num_ctx: typeof options.num_ctx === 'number' ? options.num_ctx : 4096
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Generate call failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseJsonObject(data?.response || '');
    return {
        parsed,
        model
    };
}

function buildGenerationPrompt(context) {
    const stageId = context?.stageId || 'stage1';
    const lessonId = context?.lessonId || 'L1.1';
    const competencyId = context?.competencyId || 'mole-concept';
    const difficulty = context?.difficulty || 'foundation';
    const learnerSnapshot = isObject(context?.learnerSnapshot) ? context.learnerSnapshot : {};

    return [
        'Create exactly one adaptive math challenge as a strict JSON object.',
        'Return only JSON. No markdown. No prose before or after JSON.',
        'Schema:',
        '{',
        '  "problem_id": "string",',
        '  "stage_id": "string",',
        '  "lesson_id": "string",',
        '  "competency_id": "string",',
        '  "difficulty": "string",',
        '  "prompt": "string",',
        '  "answer_format": "string",',
        '  "answer_key": "any JSON value",',
        '  "rubric": {"scoring": "string", "max_points": number},',
        '  "hint_chain": ["string"],',
        '  "worked_solution": "string",',
        '  "tags": ["string"]',
        '}',
        `Target stage_id: ${stageId}`,
        `Target lesson_id: ${lessonId}`,
        `Target competency_id: ${competencyId}`,
        `Target difficulty: ${difficulty}`,
        `Learner snapshot: ${JSON.stringify(learnerSnapshot)}`,
        'Write the problem to be unambiguous and solvable.'
    ].join('\n');
}

function buildGradingPrompt(input) {
    return [
        'Grade this learner response and return strict JSON only.',
        'Return schema:',
        '{"isCorrect": boolean, "score": number, "confidence": number, "feedback": "string", "rationale": "string"}',
        'No markdown and no extra text.',
        `Problem prompt: ${input?.prompt || ''}`,
        `Expected answer key: ${JSON.stringify(input?.answerKey ?? null)}`,
        `Rubric: ${JSON.stringify(input?.rubric || {})}`,
        `Learner response: ${input?.learnerResponse || ''}`
    ].join('\n');
}

function buildRegradePrompt(input, firstPass) {
    return [
        'Regrade this learner response due to low confidence in the first pass.',
        'Return strict JSON only with schema:',
        '{"isCorrect": boolean, "score": number, "confidence": number, "feedback": "string", "rationale": "string"}',
        'No markdown and no extra text.',
        `Problem prompt: ${input?.prompt || ''}`,
        `Expected answer key: ${JSON.stringify(input?.answerKey ?? null)}`,
        `Rubric: ${JSON.stringify(input?.rubric || {})}`,
        `Learner response: ${input?.learnerResponse || ''}`,
        `First pass result for reference: ${JSON.stringify(firstPass || {})}`,
        'Be conservative and consistent with the rubric.'
    ].join('\n');
}

function normalizeGradeResult(parsed, fallbackFeedback = 'No feedback provided.') {
    return {
        isCorrect: Boolean(parsed?.isCorrect),
        score: Number(parsed?.score) || 0,
        confidence: Number(parsed?.confidence) || 0,
        feedback: typeof parsed?.feedback === 'string' ? parsed.feedback : fallbackFeedback,
        rationale: typeof parsed?.rationale === 'string' ? parsed.rationale : 'No rationale provided.'
    };
}

export async function generateAdaptiveChallenge(context = {}) {
    try {
        const prompt = buildGenerationPrompt(context);
        const { parsed, model } = await runGenerateCall(prompt, 'You are a precise adaptive math problem generator.');
        const validation = validateChallengeItem(parsed);

        if (!validation.valid) {
            return {
                ok: false,
                model,
                errors: validation.errors,
                item: { ...GENERATION_RESPONSE_FALLBACK }
            };
        }

        return {
            ok: true,
            model,
            item: parsed,
            errors: []
        };
    } catch (error) {
        return {
            ok: false,
            model: getConfiguredModel(),
            item: { ...GENERATION_RESPONSE_FALLBACK },
            errors: [error.message]
        };
    }
}

export async function gradeAdaptiveResponse(input = {}) {
    try {
        const prompt = buildGradingPrompt(input);
        const { parsed, model } = await runGenerateCall(
            prompt,
            'You are a strict math grader. Return only JSON.',
            { temperature: 0.2, num_ctx: 4096 }
        );

        const firstPass = normalizeGradeResult(parsed);
        const regradeThreshold = typeof input?.regradeThreshold === 'number' ? input.regradeThreshold : 0.7;

        if (firstPass.confidence < regradeThreshold) {
            const regradePrompt = buildRegradePrompt(input, firstPass);
            const second = await runGenerateCall(
                regradePrompt,
                'You are a strict math grader doing a second-pass regrade. Return only JSON.',
                { temperature: 0, num_ctx: 4096 }
            );
            const secondPass = normalizeGradeResult(second.parsed, firstPass.feedback);

            return {
                ok: true,
                model: second.model || model,
                result: {
                    ...secondPass,
                    regraded: true,
                    firstPass,
                    regradeReason: `Low confidence first pass (${firstPass.confidence.toFixed(2)} < ${regradeThreshold.toFixed(2)}).`
                }
            };
        }

        return {
            ok: true,
            model,
            result: {
                ...firstPass,
                regraded: false,
                firstPass,
                regradeReason: null
            }
        };
    } catch (error) {
        return {
            ok: false,
            model: getConfiguredModel(),
            result: {
                isCorrect: false,
                score: 0,
                confidence: 0,
                feedback: 'Unable to grade response. Falling back to manual review path.',
                rationale: error.message
            }
        };
    }
}
