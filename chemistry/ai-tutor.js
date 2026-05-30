const CONFIG = { endpoint: 'local-provider', model: 'gemma' };

function cleanMathAndLaTeX(text) {
    if (typeof text !== 'string') return '';
    
    let cleaned = text.trim();

    // 1. Strip global markdown code block wrappers if they wrap the entire response
    if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
        cleaned = cleaned.replace(/\n?```$/, '');
        cleaned = cleaned.trim();
    }

    // 2. Normalize degrees and temperature units before stripping commands
    cleaned = cleaned.replace(/\\text\{[FCK]\}\^\{\\circ\}/g, (m) => m.includes('F') ? '°F' : m.includes('C') ? '°C' : '°K');
    cleaned = cleaned.replace(/\\text\{[FCK]\}\^\\circ/g, (m) => m.includes('F') ? '°F' : m.includes('C') ? '°C' : '°K');
    cleaned = cleaned.replace(/\^\{\\circ\}\\text\{[FC]\}/g, (m) => m.includes('F') ? '°F' : '°C');
    cleaned = cleaned.replace(/\^\\circ\\text\{[FC]\}/g, (m) => m.includes('F') ? '°F' : '°C');
    cleaned = cleaned.replace(/\^\{\\circ\}/g, '°');
    cleaned = cleaned.replace(/\^\\circ/g, '°');
    cleaned = cleaned.replace(/\\degree/g, '°');

    // Clean up LaTeX spacing commands
    cleaned = cleaned.replace(/\\(quad|qquad|space)\b/g, ' ');
    cleaned = cleaned.replace(/\\(,|;|!)/g, '');

    // Clean up mathematical function commands
    cleaned = cleaned.replace(/\\(log|ln|exp|sin|cos|tan|lim|max|min|det)\b/g, '$1');

    // Clean up percent sign escapes
    cleaned = cleaned.replace(/\\%/g, '%');

    // Clean up left/right sizing commands first
    cleaned = cleaned.replace(/\\left\(/g, '(');
    cleaned = cleaned.replace(/\\right\)/g, ')');
    cleaned = cleaned.replace(/\\left\[/g, '[');
    cleaned = cleaned.replace(/\\right\]/g, ']');

    // Strip math delimiters \[ \] \( \)
    cleaned = cleaned.replace(/\\+[\[\]()]/g, '');

    // 3. Combined loop for nested structures: commands, subscripts, fractions, square roots
    let prev;
    do {
        prev = cleaned;
        // Strip text/formatting commands
        cleaned = cleaned.replace(/\\(text|mathrm|mathit|mathbf|ce|underline|bar|hat|tilde|vec|dot|ddot)\{([^{}]+)\}/g, '$2');
        // Convert braced superscripts & subscripts to HTML
        cleaned = cleaned.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
        cleaned = cleaned.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
        // Convert fractions
        cleaned = cleaned.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 / $2');
        // Convert square roots
        cleaned = cleaned.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');
    } while (cleaned !== prev);

    // Convert non-braced subscripts and superscripts safely
    // Match letters/digits/parentheses, then _, then digits or simple chemical/state signs
    cleaned = cleaned.replace(/([A-Za-z0-9)])_([0-9]+|[a-z]{1,2})/g, '$1<sub>$2</sub>');
    cleaned = cleaned.replace(/([A-Za-z0-9)])\^([0-9+\-]+)/g, '$1<sup>$2</sup>');

    // Clean up spacing around parentheses
    cleaned = cleaned.replace(/\(\s+/g, '(');
    cleaned = cleaned.replace(/\s+\)/g, ')');

    // Math symbols
    cleaned = cleaned.replace(/\\times/g, '×');
    cleaned = cleaned.replace(/\\cdot/g, '·');
    cleaned = cleaned.replace(/\\pm/g, '±');
    cleaned = cleaned.replace(/\\Delta/g, 'Δ');
    cleaned = cleaned.replace(/\\delta/g, 'δ');
    cleaned = cleaned.replace(/\\alpha/g, 'α');
    cleaned = cleaned.replace(/\\beta/g, 'β');
    cleaned = cleaned.replace(/\\mu/g, 'μ');
    cleaned = cleaned.replace(/\\rightarrow/g, '→');
    cleaned = cleaned.replace(/\\to/g, '→');
    cleaned = cleaned.replace(/\\approx/g, '≈');
    cleaned = cleaned.replace(/\\geq/g, '≥');
    cleaned = cleaned.replace(/\\leq/g, '≤');
    cleaned = cleaned.replace(/\\neq/g, '≠');
    cleaned = cleaned.replace(/\\rightleftharpoons/g, '⇌');
    cleaned = cleaned.replace(/\\leftrightarrow/g, '↔');
    cleaned = cleaned.replace(/\\partial/g, '∂');
    cleaned = cleaned.replace(/\\infty/g, '∞');
    cleaned = cleaned.replace(/\\pi/g, 'π');
    cleaned = cleaned.replace(/\\theta/g, 'θ');
    cleaned = cleaned.replace(/\\lambda/g, 'λ');
    cleaned = cleaned.replace(/\\sigma/g, 'σ');
    cleaned = cleaned.replace(/\\omega/g, 'ω');
    cleaned = cleaned.replace(/\\phi/g, 'φ');
    cleaned = cleaned.replace(/\\gamma/g, 'γ');

    // Remove dollar signs (both block $$ and inline $)
    cleaned = cleaned.replace(/\$\$/g, '');
    cleaned = cleaned.replace(/\$/g, '');

    // Strip extra backslashes (e.g. escaped symbols that aren't valid LaTeX but might confuse readers)
    cleaned = cleaned.replace(/\\([#*_`[\]()])/g, '$1');

    return cleaned.trim();
}

const TUTOR_ERROR_RESPONSE = {
    passed: false,
    feedback: 'Error: Connection link interrupted. Please try again or click Regenerate.',
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

function getConfiguredChatEndpoint() {
    return 'local-provider';
}

function getChemistryModel() {
    if (typeof window.getGnosysModel === 'function') {
        return window.getGnosysModel('chemistry_llm');
    }
    return localStorage.getItem('gnosys_active_llm') || localStorage.getItem('chemistry_llm') || 'gemma4:e4b';
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
    const model = getChemistryModel();
    return model ? [{ name: model }] : [];
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
        'CHEMISTRY TUTOR SYSTEM PROMPT:',
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

    let feedback = typeof parsed.feedback === 'string' ? parsed.feedback : 'No feedback provided.';
    feedback = cleanMathAndLaTeX(feedback);

    return {
        passed: Boolean(parsed.passed),
        feedback: feedback,
        nextStage: typeof parsed.nextStage === 'string' || parsed.nextStage === null
            ? parsed.nextStage
            : null
    };
}

async function fetchLocalTutor(systemPrompt, messageHistory, userInput) {
    const activeModel = getChemistryModel();
    const prompt = buildTutorPrompt(systemPrompt, messageHistory, userInput);

    if (!window.GnosysLLM || typeof window.GnosysLLM.generateResponse !== 'function') {
        return { ...TUTOR_OFFLINE_MOCK };
    }

    try {
        const result = await window.GnosysLLM.generateResponse('', prompt, {
            moduleKey: 'chemistry_llm',
            model: activeModel,
            stream: false,
        });
        const parsed = parseModelJson(result && typeof result.text === 'string' ? result.text : '');
        return normalizeTutorResponse(parsed);
    } catch (routerErr) {
        if (window.gnosysActiveModelsCache) {
            delete window.gnosysActiveModelsCache[activeModel];
        }
        console.warn('Chemistry tutor failed to respond via shared provider.', routerErr);
        return { ...TUTOR_ERROR_RESPONSE };
    }
}

async function streamPeriodicTableTutor(systemPrompt, messageHistory, userInput, onToken) {
    const activeModel = getChemistryModel();
    if (!window.GnosysLLM || typeof window.GnosysLLM.generateResponse !== 'function') {
        throw new Error('Shared LLM router is unavailable.');
    }

    const result = await window.GnosysLLM.generateResponse(systemPrompt, userInput, {
        moduleKey: 'chemistry_llm',
        model: activeModel,
        history: Array.isArray(messageHistory) ? messageHistory : [],
        stream: true,
        onToken,
    });
    return { raw: result.text || '', model: result.model || activeModel };
}

async function fetchGeneratedLesson(lesson, onProgress, variationIndex = 0) {
    let activeModel = getChemistryModel();
    
    const systemPrompt = `You are an Expert Professor of General and Introductory Chemistry.`;
    const variationInstruction = variationIndex > 0
        ? `This is Lecture Variation #${variationIndex + 1} for this topic. You MUST create a completely different general chemistry scenario/context and use different real-world applications/scientific scenarios compared to previous variations to ensure variety.`
        : '';
    const prompt = [
        `Write a comprehensive, college-level general chemistry lecture (approximately 600-800 words) for introductory chemistry students.`,
        variationInstruction,
        `You MUST use the exact concept, clinical tie-in, interactive target, and feynman prompt details below:`,
        `- Concept: ${lesson.concept}`,
        `- Real-World Hook: ${lesson.clinical_tie_in}`,
        `- Interactive Target: ${lesson.interactive_target}`,
        `- Feynman Prompt: ${lesson.feynman_prompt}`,
        ``,
        `Structure the lecture using clear markdown headers (###) into the following four sections:`,
        `1. ### Real-World Application & Scenario (introduce a realistic, detailed real-world, industrial, or laboratory scenario illustrating the concept)`,
        `2. ### Core Chemical Principles (explain the underlying molecular mechanisms and chemistry concepts in depth)`,
        `3. ### Mathematical Frameworks & Calculations (provide a step-by-step mathematical breakdown, detailing conversion chains or dimensional analysis)`,
        `4. ### Environmental, Laboratory, or Industrial Significance (discuss safety protocols, practical applications, or real-world impacts)`,
        ``,
        `CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math formatting (such as $, $$, \\frac, \\text, \\times, etc.) in your response. Write all mathematical equations, equations, conversions, and units in simple plain text (e.g. use "deg F" or "°F", "*", "/", "^", and standard parentheses) so they render cleanly in standard markdown.`,
        ``,
        `Ensure the lecture is highly educational, rigorous, and meets the 600-800 word length requirement. Do not include introductory greetings, filler text, or sign-offs. Return ONLY the markdown content.`
    ].join('\n');

    // 1. Connection Step
    onProgress('connect', 'running', 'Checking local AI provider...');
    let models = [];
    try {
        await window.GnosysLLM?.init?.();
        models = await fetchOllamaTags(getConfiguredEndpoint());
        onProgress('connect', 'success', 'Successfully connected to local provider.');
    } catch (err) {
        console.warn('Local provider readiness check failed:', err);
        onProgress('connect', 'warning', `Local provider warning: ${err.message}. Proceeding...`);
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
            const result = await window.GnosysLLM.generateResponse(systemPrompt, prompt, {
                moduleKey: 'chemistry_llm',
                model: activeModel,
                stream: false,
            });
            responseText = typeof result?.text === 'string' ? result.text.trim() : '';
            if (!responseText) {
                throw new Error('Empty response received from local provider');
            }
            break; // Success
        } catch (err) {
            if (window.gnosysActiveModelsCache) {
                delete window.gnosysActiveModelsCache[activeModel];
            }
            if (attempt === maxAttempts) {
                throw err; // Re-throw if final attempt fails
            }
            onProgress('generate', 'running', `Attempt ${attempt} failed. Retrying generation call...`);
        }
    }

    onProgress('generate', 'success', `Lecture generated successfully (${responseText.split(/\s+/).length} words).`);

    // 4. Rendering Step
    onProgress('render', 'running', `Formatting and parsing Markdown...`);
    const cleanedText = cleanMathAndLaTeX(responseText);
    onProgress('render', 'success', `Ready to display.`);
    return cleanedText;
}

async function fetchGeneratedQuestion(lesson, mode) {
    let activeModel = getChemistryModel();
    await window.GnosysLLM?.init?.();
    
    let systemPrompt = `You are an Expert Professor of General Chemistry.`;
    let prompt = '';

    if (mode === 'socratic') {
        prompt = [
            `Generate a single, unique, challenging, scenario-based question to test a student's understanding of the concept: "${lesson.concept}".`,
            `The context must relate to the real-world/industrial hook: "${lesson.clinical_tie_in}".`,
            `The question must require the student to explain the chemical principles and make critical lab safety/practical decisions.`,
            `CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math formatting (such as $, $$, \\frac, \\text, etc.). Write all mathematical equations, conversions, formulas, and units in simple plain text (e.g. use "deg F" or "°F", "*", "/", "^", and standard parentheses).`,
            `Return ONLY the question text itself. Do not include any introductory greetings, markdown headers, markdown code blocks, JSON wrapper, or conversational filler.`
        ].join('\n');
    } else if (mode === 'feynman') {
        prompt = [
            `Generate a challenging general chemistry prompt to test the student's ability to explain the concept "${lesson.concept}" using the Feynman technique (explaining a complex topic to a non-scientist or high-school student in simple, everyday terms).`,
            `The prompt should be based on the real-world/industrial hook: "${lesson.clinical_tie_in}".`,
            `For example: "Explain how [concept] works to a non-scientist or high-school student in simple, everyday terms."`,
            `CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math formatting (such as $, $$, \\frac, \\text, etc.). Write all mathematical equations, conversions, formulas, and units in simple plain text (e.g. use "deg F" or "°F", "*", "/", "^", and standard parentheses).`,
            `Return ONLY the prompt text itself. Do not include any introductory greetings, markdown headers, markdown code blocks, JSON wrapper, or conversational filler.`
        ].join('\n');
    } else {
        throw new Error(`Unsupported mode for question generation: ${mode}`);
    }

    try {
        const result = await window.GnosysLLM.generateResponse(systemPrompt, prompt, {
            moduleKey: 'chemistry_llm',
            model: activeModel,
            stream: false,
        });
        const question = typeof result?.text === 'string' ? result.text.trim() : '';
        if (!question) {
            throw new Error('Empty response received from local provider');
        }
        return cleanMathAndLaTeX(question);
    } catch (err) {
        if (window.gnosysActiveModelsCache) {
            delete window.gnosysActiveModelsCache[activeModel];
        }
        throw err;
    }
}

window.CLINICAL_TUTOR = {
    CONFIG,
    fetchLocalTutor,
    streamPeriodicTableTutor,
    fetchGeneratedLesson,
    fetchGeneratedQuestion,
    cleanMathAndLaTeX
};
