import { validateChallengeItem } from './adaptive-core.js';

const DEFAULT_ENDPOINT = 'local-provider';
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
    return localStorage.getItem('gnosys_active_llm') || localStorage.getItem('chemistry_llm') || DEFAULT_MODEL;
}

function getTagsEndpoint(generateEndpoint) {
    return generateEndpoint;
}

function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function pickAvailableModel(requestedModel, models) {
    if (!Array.isArray(models) || models.length === 0) return requestedModel;

    const exact = models.find((model) => model?.name === requestedModel);
    if (exact?.name) return exact.name;

    const preferred = models.find((model) => typeof model?.name === 'string' && model.name.toLowerCase().includes('gemma'));
    if (preferred?.name) return preferred.name;

    const first = models.find((model) => typeof model?.name === 'string' && model.name.trim());
    return first?.name || requestedModel;
}

async function fetchAvailableModels(endpoint) {
    const model = getConfiguredModel();
    return model ? [{ name: model }] : [];
}

function parseJsonObject(rawText) {
    const text = typeof rawText === 'string' ? rawText.trim() : '';
    if (!text) {
        throw new Error('Model returned empty response text.');
    }

    const escapeInvalidJsonBackslashes = (input) => {
        let output = '';
        let inString = false;

        for (let i = 0; i < input.length; i += 1) {
            const ch = input[i];

            if (ch === '"') {
                let slashCount = 0;
                let j = i - 1;
                while (j >= 0 && input[j] === '\\') {
                    slashCount += 1;
                    j -= 1;
                }
                if (slashCount % 2 === 0) {
                    inString = !inString;
                }
                output += ch;
                continue;
            }

            if (!inString || ch !== '\\') {
                output += ch;
                continue;
            }

            const next = input[i + 1];
            if (!next) {
                output += '\\\\';
                continue;
            }

            const validSimpleEscapes = '"\\/bfnrt';
            if (validSimpleEscapes.includes(next)) {
                output += ch;
                continue;
            }

            if (next === 'u') {
                const unicodeDigits = input.slice(i + 2, i + 6);
                if (/^[0-9a-fA-F]{4}$/.test(unicodeDigits)) {
                    output += ch;
                    continue;
                }
            }

            // Preserve literal backslash content by escaping invalid JSON escape starts.
            output += '\\\\';
        }

        return output;
    };

    const tryParse = (candidate) => {
        try {
            return JSON.parse(candidate);
        } catch (_err) {
            return null;
        }
    };

    const directParsed = tryParse(text);
    if (directParsed) {
        return directParsed;
    }

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('No JSON object found in model response.');
    }

    const objectSlice = text.slice(start, end + 1);
    const slicedParsed = tryParse(objectSlice);
    if (slicedParsed) {
        return slicedParsed;
    }

    const sanitized = escapeInvalidJsonBackslashes(objectSlice);
    const recoveredParsed = tryParse(sanitized);
    if (recoveredParsed) {
        return recoveredParsed;
    }

    throw new Error('Failed to parse model JSON response after sanitation attempts.');
}

async function runGenerateCall(prompt, system, options = {}) {
    let model = getConfiguredModel();

    try {
        const models = await fetchAvailableModels(getConfiguredEndpoint());
        model = pickAvailableModel(model, models);
        localStorage.setItem('gnosys_active_llm', model);
        localStorage.setItem('chemistry_llm', model);
    } catch (_err) {
        // Keep existing model when tag lookup is unavailable.
    }

    const requestOptions = {
        temperature: typeof options.temperature === 'number' ? options.temperature : 0.5,
        num_ctx: typeof options.num_ctx === 'number' ? options.num_ctx : 4096
    };

    const result = await window.GnosysLLM.generateResponse(system, prompt, {
        moduleKey: 'chemistry_llm',
        model,
        stream: false,
        requestOptions
    });
    const parsed = parseJsonObject(result?.text || '');
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

export const QUESTION_TEMPLATES = {
    // Stage 1
    's1-comparison-a': {
        description: 'Comparison between a single digit number and another single digit number.',
        schema: '{"left": number, "right": number, "answerKey": "lt"|"gt"|"eq"}',
        defaults: { left: 9, right: 7, answerKey: 'gt' }
    },
    's1-comparison-b': {
        description: 'Comparison between an addition expression (e.g. A + B) and a single sum C.',
        schema: '{"leftText": "string", "right": number, "leftVal": number, "rightVal": number, "answerKey": "lt"|"gt"|"eq"}',
        defaults: { leftText: '3 + 2', right: 5, leftVal: 5, rightVal: 5, answerKey: 'eq' }
    },
    's1-addition': {
        description: 'Multi-digit vertical addition with no carrying. Sum of columns must not exceed 9.',
        schema: '{"left": number, "right": number, "answerKey": string|number, "text": "string", "rubric": {"scoring": "string", "max_points": number}, "workedSolution": "string"}',
        defaults: {
            left: 143,
            right: 25,
            answerKey: '168',
            text: '  143\\n+  25',
            rubric: {
                scoring: 'exact-match',
                max_points: 1
            },
            workedSolution: 'Add ones, tens, and hundreds by column: 143 + 25 = 168.'
        }
    },
    's1-applied-tare': {
        description: 'Free-response: conceptual understanding of relative zero (tare) versus absolute scales (Kelvin). Generated prompts must be unique and require learner explanation.',
        schema: '{"responseMode": "free-response", "questionText": "string", "answerKey": "string", "rubric": {"scoring": "string", "max_points": number}, "workedSolution": "string"}',
        defaults: {
            responseMode: 'free-response',
            questionText: 'A flask on a balance reads 3.12 g before reagent is added, then Tare resets the display to 0.00 g for net-mass measurement. Explain why this reset is a relative zero and how that differs from Kelvin absolute zero.',
            answerKey: 'Tare resets the instrument reference baseline for that measurement setup, while Kelvin remains an absolute thermodynamic scale anchored at 0 K.',
            rubric: {
                scoring: 'concept-match',
                max_points: 1
            },
            workedSolution: 'Strong response should state that tare creates a relative reference for displayed mass differences, not a physical absence of mass, while Kelvin zero corresponds to absolute thermodynamic zero.'
        }
    },
    // Stage 2
    's2-partition': {
        description: 'Dividing stock solution volume/concentration by portion size to get integer partition count.',
        schema: '{"stock": number, "portion": number, "answerKey": string}',
        defaults: { stock: 1.20, portion: 0.05, answerKey: '24' }
    },
    's2-estimate': {
        description: 'Free response: estimate a stoichiometric mass-to-moles ratio and provide a numeric benchmark answer key.',
        schema: '{"questionText": "string", "answerKey": "string|number", "rubric": {"scoring": "string", "max_points": number}, "workedSolution": "string"}',
        defaults: {
            questionText: 'Estimate the ratio: 48.2 g of carbon divided by 12.01 g/mol molar mass. How many moles is this approximately?',
            answerKey: 'about 4 moles',
            rubric: {
                scoring: 'reasonableness-check',
                max_points: 1
            },
            workedSolution: '48.2/12.01 is approximately 48/12, so the estimate is about 4 moles.'
        }
    },
    's2-division': {
        description: 'Long division resulting in an integer quotient with no remainders.',
        schema: '{"dividend": number, "divisor": number, "answerKey": string}',
        defaults: { dividend: 456, divisor: 4, answerKey: '114' }
    },
    // Stage 3
    's3-calorimeter': {
        description: 'Computing signed temperature difference: deltaT = Tf - Ti.',
        schema: '{"ti": number, "tf": number, "answerKey": string}',
        defaults: { ti: -15, tf: 25, answerKey: '40' }
    },
    's3-absolute': {
        description: 'Evaluating comparison using absolute value: |A| vs |B|.',
        schema: '{"a": number, "b": number, "answerKey": "lt"|"gt"|"eq"}',
        defaults: { a: -8, b: 8, answerKey: 'eq' }
    },
    's3-signdiffs': {
        description: 'Summing ion charges to find net charge (e.g. A Fe3+ and B Cl-).',
        schema: '{"cation": "string", "cationCharge": number, "cationCount": number, "anion": "string", "anionCharge": number, "anionCount": number, "answerKey": string}',
        defaults: { cation: 'Fe', cationCharge: 3, cationCount: 1, anion: 'Cl', anionCharge: -1, anionCount: 3, answerKey: '0' }
    },
    // Stage 4
    's4-mixture': {
        description: 'Mole fraction of helium in a helium-neon atomic gas mixture.',
        schema: '{"molesHe": number, "molesNe": number, "answerKey": string}',
        defaults: { molesHe: 3, molesNe: 7, answerKey: '0.3' }
    },
    's4-fractions': {
        description: 'Equivalent fractions equation: num/denom = X/targetDenom.',
        schema: '{"num": number, "denom": number, "targetDenom": number, "answerKey": string}',
        defaults: { num: 3, denom: 6, targetDenom: 12, answerKey: '6' }
    },
    's4-stoich-ratio': {
        description: 'Calculating atomic mass ratio vs atom composition ratio in a molecule (e.g. CO2).',
        schema: '{"molecule": "string", "atomCount1": number, "atomMass1": number, "atomCount2": number, "atomMass2": number, "atomRatioKey": string, "massRatioKey": string}',
        defaults: { molecule: 'CO2', atomCount1: 1, atomMass1: 12.01, atomCount2: 2, atomMass2: 16.00, atomRatioKey: '1:2', massRatioKey: '3:8' }
    },
    // Stage 5
    's5-sigfigs': {
        description: 'Significant figures identification for an inexact decimal value.',
        schema: '{"value": "string", "answerKey": string}',
        defaults: { value: '0.00340', answerKey: '3' }
    },
    's5-multistep': {
        description: 'Solving multi-step decimal arithmetic with sig fig rules: (A - B) * C.',
        schema: '{"a": number, "b": number, "c": number, "intermediate": string, "answerKey": string}',
        defaults: { a: 14.28, b: 11.2, c: 1.503, intermediate: '3.1', answerKey: '4.7' }
    },
    // Stage 6
    's6-cube': {
        description: '3D cube metric volume scaling: A meters to B decimeters.',
        schema: '{"meters": number, "decimeters": number, "answerKey": string}',
        defaults: { meters: 1, decimeters: 10, answerKey: '1000' }
    },
    's6-density': {
        description: 'Density compound unit conversion: g/cm³ to kg/m³.',
        schema: '{"density": number, "answerKey": string}',
        defaults: { density: 2.7, answerKey: '2700' }
    },
    // Stage 7
    's7-drag': {
        description: 'Algebraic isolate: clearance of a denominator block.',
        schema: '{"equation": "string", "isolate": "string", "answerKey": "string"}',
        defaults: { equation: 'q = m * c * (Tf - Ti)', isolate: 'Tf - Ti', answerKey: 'q / (m * c)' }
    },
    's7-calorimetry': {
        description: 'Solving calorimetry equation q = m * c * (Tf - Ti) for final temperature Tf.',
        schema: '{"q": number, "m": number, "c": number, "ti": number, "answerKey": string}',
        defaults: { q: 836, m: 10.0, c: 4.184, ti: 20.0, answerKey: '40.0' }
    },
    // Stage 8
    's8-extrapolate': {
        description: 'Extrapolating a linear Charles\'s Law graph to find absolute zero.',
        schema: '{"slope": number, "intercept": number, "answerKey": string}',
        defaults: { slope: 0.366, intercept: 100, answerKey: '-273.15' }
    },
    // Stage 9
    's9-bal': {
        description: 'Balancing coefficients of a hydrocarbon combustion reaction (e.g. Butane).',
        schema: '{"reaction": "string", "a": number, "b": number, "c": number, "d": number}',
        defaults: { reaction: 'C4H10 + O2 -> CO2 + H2O', a: 2, b: 13, c: 8, d: 10 }
    },
    's9-factoring': {
        description: 'Factoring a quadratic trinomial x^2 + Bx + C into (x + p)(x + q).',
        schema: '{"b": number, "c": number, "p": number, "q": number}',
        defaults: { b: 5, c: 6, p: 2, q: 3 }
    },
    // Stage 10
    's10-antilog': {
        description: 'Logarithmic antilog calculation: solving for H3O+ concentration from pH.',
        schema: '{"ph": number, "answerKey": string}',
        defaults: { ph: 3.45, answerKey: '3.5e-4' }
    },
    // Stage 11
    's11-linear': {
        description: 'Beer\'s Law saturation limit identification from data points.',
        schema: '{"limit": "string", "cutoff": number}',
        defaults: { limit: '0.010', cutoff: 0.010 }
    },
    's11-arrhenius': {
        description: 'Arrhenius plot activation energy (Ea) from slope. Slope is -Ea/R.',
        schema: '{"x1": number, "y1": number, "x2": number, "y2": number, "slope": number, "answerKey": string}',
        defaults: { x1: 0.0030, y1: -2.0, x2: 0.0035, y2: -4.0, slope: -4000, answerKey: '33.2' }
    },
    // Stage 12
    's12-spec': {
        description: 'Isotopic weighted average calculation for average mass (e.g. Boron).',
        schema: '{"mass1": number, "mass2": number, "abundance1": number, "abundance2": number, "averageMass": number}',
        defaults: { mass1: 10.0, mass2: 11.0, abundance1: 19, abundance2: 81, averageMass: 10.81 }
    },
    's12-salt': {
        description: 'Calculating Kb and pH of a weak base salt solution (e.g. acetate salt).',
        schema: '{"ka": number, "kb": number, "concentration": number, "ph": number}',
        defaults: { ka: 1.8e-5, kb: 5.6e-10, concentration: 0.10, ph: 8.87 }
    }
};

export async function generateQuestionVariant(questionId, phaseId) {
    const template = QUESTION_TEMPLATES[questionId];
    if (!template) {
        throw new Error(`No template found for question ID: ${questionId}`);
    }

    const system = [
        'You are a professional chemistry and math question generator.',
        'Your goal is to generate a new variation of a chemistry math problem.',
        'You MUST return a strict JSON object containing the new parameters.',
        'Return ONLY JSON. No markdown backticks or formatting outside the JSON.',
        `Target JSON Schema: ${template.schema}`
    ].join('\n');

    const prompt = [
        `Question ID: ${questionId}`,
        `Description: ${template.description}`,
        `Original Parameters: ${JSON.stringify(template.defaults)}`,
        'Please generate a mathematically valid, new variation of this question.',
        'The new variation must be semantically distinct from the original wording and scenario details.',
        'Ensure the values are realistic for general chemistry experiments.',
        'Double-check all calculations and ensure the answerKey is perfectly accurate.'
    ].join('\n');

    const { parsed, model } = await runGenerateCall(prompt, system, { temperature: 0.7 });
    return {
        ok: true,
        model,
        data: parsed
    };
}

