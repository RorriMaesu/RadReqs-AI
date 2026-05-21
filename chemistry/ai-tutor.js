const CONFIG = { endpoint: 'http://localhost:11434/api/generate', model: 'gemma' };

const TUTOR_ERROR_RESPONSE = {
    passed: false,
    feedback: 'Error: Clinical Link interrupted. Please try again or click Regenerate.',
    nextStage: null
};

const TUTOR_OFFLINE_MOCK = {
    passed: false,
    feedback: '[MOCK OFFLINE MODE] That is incorrect. Protons are positive. Try again.',
    nextStage: null
};

const STRICT_JSON_DIRECTIVE = [
    'Return ONLY a raw JSON object with this exact schema:',
    '{"passed": boolean, "feedback": "string", "nextStage": "string or null"}.',
    'Do not include markdown.',
    'Do not wrap with backticks.',
    'Do not include any text before or after the JSON object.'
].join(' ');

function getConfiguredEndpoint() {
    const override = localStorage.getItem('chemistry_ollama_endpoint');
    return override && override.trim() ? override.trim() : CONFIG.endpoint;
}

function getChemistryModel() {
    return localStorage.getItem('chemistry_llm') || 'gemma4:e4b';
}

function pickAvailableModel(requestedModel, models) {
    if (!Array.isArray(models) || models.length === 0) {
        return requestedModel;
    }

    const exact = models.find((m) => typeof m?.name === 'string' && m.name === requestedModel);
    if (exact) return exact.name;

    const startsWith = models.find((m) => typeof m?.name === 'string' && m.name.startsWith(requestedModel));
    if (startsWith) return startsWith.name;

    const gemma = models.find((m) => typeof m?.name === 'string' && m.name.toLowerCase().includes('gemma'));
    if (gemma) return gemma.name;

    const first = models.find((m) => typeof m?.name === 'string' && m.name.trim());
    return first ? first.name : requestedModel;
}

async function fetchOllamaTags(endpoint) {
    const tagsUrl = endpoint.replace('/api/generate', '/api/tags');
    const response = await fetch(tagsUrl, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
        throw new Error(`Ollama tags response status ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data?.models) ? data.models : [];
}

function buildTutorPrompt(systemPrompt, messageHistory, userInput) {
    const safeHistory = Array.isArray(messageHistory) ? messageHistory : [];

    const historyBlock = safeHistory
        .map((msg, idx) => {
            const role = typeof msg?.role === 'string' ? msg.role.toUpperCase() : 'UNKNOWN';
            const content = typeof msg?.content === 'string' ? msg.content : '';
            return `${idx + 1}. [${role}] ${content}`;
        })
        .join('\n');

    return [
        'CLINICAL TUTOR SYSTEM PROMPT:',
        systemPrompt || '',
        '',
        'CONVERSATION HISTORY (oldest to newest):',
        historyBlock || '[No previous messages]',
        '',
        'CURRENT LEARNER INPUT:',
        userInput || '',
        '',
        STRICT_JSON_DIRECTIVE
    ].join('\n');
}

function parseModelJson(rawText) {
    const text = typeof rawText === 'string' ? rawText.trim() : '';
    if (!text) {
        throw new Error('Empty model response');
    }

    // First try direct parse for strict responders.
    try {
        return JSON.parse(text);
    } catch (_directErr) {
        // Fallback: extract first JSON object block if model prepends/appends text.
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) {
            throw new Error('No JSON object found in model response');
        }
        return JSON.parse(text.slice(start, end + 1));
    }
}

function normalizeTutorResponse(parsed) {
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Parsed response is not an object');
    }

    return {
        passed: Boolean(parsed.passed),
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : 'No feedback provided.',
        nextStage: typeof parsed.nextStage === 'string' || parsed.nextStage === null
            ? parsed.nextStage
            : null
    };
}

async function fetchLocalTutor(systemPrompt, messageHistory, userInput) {
    const maxAttempts = 3;
    const prompt = buildTutorPrompt(systemPrompt, messageHistory, userInput);
    const endpoint = getConfiguredEndpoint();
    let activeModel = getChemistryModel();

    try {
        const models = await fetchOllamaTags(endpoint);
        const fallback = pickAvailableModel(activeModel, models);
        if (fallback !== activeModel) {
            activeModel = fallback;
            localStorage.setItem('chemistry_llm', activeModel);
        }
    } catch (_err) {
        // Keep requested model when tags endpoint is unavailable.
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        let response;
        let responseData;

        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: activeModel,
                    stream: false,
                    prompt
                })
            });
        } catch (fetchErr) {
            console.warn('Local tutor offline/unreachable. Using mock fallback.', fetchErr);
            return { ...TUTOR_OFFLINE_MOCK };
        }

        if (!response.ok) {
            // Retry on non-OK responses, then fail gracefully.
            if (attempt === maxAttempts) {
                return { ...TUTOR_ERROR_RESPONSE };
            }
            continue;
        }

        try {
            responseData = await response.json();
        } catch (_jsonErr) {
            if (attempt === maxAttempts) {
                return { ...TUTOR_ERROR_RESPONSE };
            }
            continue;
        }

        try {
            const rawModelText = typeof responseData?.response === 'string'
                ? responseData.response
                : '';
            const parsed = parseModelJson(rawModelText);
            return normalizeTutorResponse(parsed);
        } catch (_parseErr) {
            // Silent retry for malformed model JSON.
            if (attempt === maxAttempts) {
                return { ...TUTOR_ERROR_RESPONSE };
            }
        }
    }

    return { ...TUTOR_ERROR_RESPONSE };
}

async function fetchGeneratedLesson(lesson, onProgress) {
    const endpoint = getConfiguredEndpoint();
    let activeModel = getChemistryModel();
    
    const systemPrompt = `You are a Senior Principal Frontend Developer and an Expert Professor of Clinical Medical Education.`;
    const prompt = [
        `Write a clinical chemistry micro-lecture (~300 words) for Radiologic Technology and Dosimetry students.`,
        `You MUST use the exact concept, clinical tie-in, interactive target, and feynman prompt details below:`,
        `- Concept: ${lesson.concept}`,
        `- Clinical Tie-In: ${lesson.clinical_tie_in}`,
        `- Interactive Target: ${lesson.interactive_target}`,
        `- Feynman Prompt: ${lesson.feynman_prompt}`,
        ``,
        `Structure the lecture with clear headings or markdown paragraphs. Limit the lecture to 300 words. Focus on the chemical principles and explain their direct clinical relevance (why this matters for dosimetry/radiology, patient safety, etc.).`,
        `Do not include introductory greetings, filler text, or sign-offs. Return ONLY the markdown content of the micro-lecture.`
    ].join('\n');

    // 1. Connection Step
    onProgress('connect', 'running', `Connecting to Ollama endpoint at ${endpoint}...`);
    let models = [];
    try {
        models = await fetchOllamaTags(endpoint);
        onProgress('connect', 'success', `Successfully connected to Ollama.`);
    } catch (err) {
        console.warn('Ollama tags check failed:', err);
        onProgress('connect', 'warning', `Ollama connection warning: ${err.message}. Proceeding...`);
    }

    // 2. Model Check Step
    onProgress('model', 'running', `Verifying model '${activeModel}' status...`);
    try {
        if (models.length > 0) {
            const selected = pickAvailableModel(activeModel, models);
            if (selected !== activeModel) {
                onProgress('model', 'warning', `Model '${activeModel}' not found. Using '${selected}' instead.`);
                activeModel = selected;
                localStorage.setItem('chemistry_llm', activeModel);
            } else {
                onProgress('model', 'success', `Model '${activeModel}' is available.`);
            }
        } else {
            onProgress('model', 'warning', 'Unable to list models. Proceeding with saved chemistry model.');
        }
    } catch (err) {
        console.warn('Model verification failed:', err);
        onProgress('model', 'warning', `Model verification warning: ${err.message}. Proceeding...`);
    }

    // 3. Generation Step
    onProgress('generate', 'running', `Submitting prompt for '${lesson.title}'...`);
    
    let responseText = '';
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: activeModel,
                    stream: false,
                    prompt: prompt,
                    system: systemPrompt,
                    options: {
                        num_ctx: 2048,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama returned status ${response.status}`);
            }

            const data = await response.json();
            responseText = typeof data?.response === 'string' ? data.response.trim() : '';
            if (!responseText) {
                throw new Error('Empty response received from Ollama');
            }
            break; // Success
        } catch (err) {
            if (attempt === maxAttempts) {
                throw err; // Re-throw if final attempt fails
            }
            onProgress('generate', 'running', `Attempt ${attempt} failed. Retrying generate call...`);
        }
    }

    onProgress('generate', 'success', `Lecture generated successfully (${responseText.split(/\s+/).length} words).`);

    // 4. Rendering Step
    onProgress('render', 'running', `Formatting and parsing Markdown...`);
    onProgress('render', 'success', `Ready to display.`);
    return responseText;
}

window.CLINICAL_TUTOR = {
    CONFIG,
    fetchLocalTutor,
    fetchGeneratedLesson
};
