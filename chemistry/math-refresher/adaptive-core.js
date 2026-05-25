export const ADAPTIVE_STATE_VERSION = 1;
export const COURSE_STATE_VERSION = 4;

export const DEFAULT_MASTERY_POLICY = {
    minAttempts: 8,
    targetAccuracy: 0.8,
    consistencyWindow: 5,
    minConsistencyAccuracy: 0.8
};

function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function createDefaultAdaptiveState() {
    return {
        adaptiveVersion: ADAPTIVE_STATE_VERSION,
        learnerProfile: {
            levelBand: 'emerging',
            preferredPace: 'normal',
            confidence: 0.5,
            updatedAt: Date.now()
        },
        policy: { ...DEFAULT_MASTERY_POLICY },
        lessonMastery: {},
        rollingMetrics: {},
        challengeQueue: {},
        generatedCache: {},
        grading: {
            mode: 'llm-primary',
            lowConfidenceRegradeThreshold: 0.7,
            lastModel: null
        }
    };
}

export function normalizeAdaptiveState(candidate) {
    const fallback = createDefaultAdaptiveState();
    if (!isObject(candidate)) return fallback;

    return {
        adaptiveVersion: Number(candidate.adaptiveVersion) || ADAPTIVE_STATE_VERSION,
        learnerProfile: {
            ...fallback.learnerProfile,
            ...(isObject(candidate.learnerProfile) ? candidate.learnerProfile : {})
        },
        policy: {
            ...fallback.policy,
            ...(isObject(candidate.policy) ? candidate.policy : {})
        },
        lessonMastery: isObject(candidate.lessonMastery) ? candidate.lessonMastery : {},
        rollingMetrics: isObject(candidate.rollingMetrics) ? candidate.rollingMetrics : {},
        challengeQueue: isObject(candidate.challengeQueue) ? candidate.challengeQueue : {},
        generatedCache: isObject(candidate.generatedCache) ? candidate.generatedCache : {},
        grading: {
            ...fallback.grading,
            ...(isObject(candidate.grading) ? candidate.grading : {})
        }
    };
}

export function migrateCourseState(parsed) {
    const raw = isObject(parsed) ? parsed : {};
    const struggleSignals = isObject(raw.struggleSignals) ? raw.struggleSignals : {};

    return {
        version: COURSE_STATE_VERSION,
        activePhase: typeof raw.activePhase === 'string' ? raw.activePhase : 'stage1',
        struggleSignals: {
            moleConcept: Number(struggleSignals.moleConcept) || 0,
            dimAnalysis: Number(struggleSignals.dimAnalysis) || 0,
            stoichSetup: Number(struggleSignals.stoichSetup) || 0
        },
        phases: isObject(raw.phases) ? raw.phases : {},
        adaptive: normalizeAdaptiveState(raw.adaptive)
    };
}

export function evaluateLessonMastery(input, policyOverride = {}) {
    const policy = { ...DEFAULT_MASTERY_POLICY, ...(isObject(policyOverride) ? policyOverride : {}) };
    const attempts = Number(input?.attempts) || 0;
    const correct = Number(input?.correct) || 0;
    const recentResults = Array.isArray(input?.recentResults) ? input.recentResults : [];
    const accuracy = attempts > 0 ? correct / attempts : 0;

    const recentWindow = recentResults.slice(-policy.consistencyWindow);
    const recentCorrect = recentWindow.filter(Boolean).length;
    const recentAccuracy = recentWindow.length ? recentCorrect / recentWindow.length : 0;

    const passed = attempts >= policy.minAttempts
        && accuracy >= policy.targetAccuracy
        && recentWindow.length >= policy.consistencyWindow
        && recentAccuracy >= policy.minConsistencyAccuracy;

    return {
        passed,
        attempts,
        correct,
        accuracy,
        recentAccuracy,
        policy
    };
}

export function validateChallengeItem(item) {
    const errors = [];
    if (!isObject(item)) {
        return { valid: false, errors: ['Challenge item must be an object.'] };
    }

    const requiredStringFields = [
        'problem_id',
        'stage_id',
        'lesson_id',
        'competency_id',
        'difficulty',
        'prompt',
        'answer_format'
    ];

    requiredStringFields.forEach((field) => {
        if (typeof item[field] !== 'string' || !item[field].trim()) {
            errors.push(`Missing or invalid ${field}.`);
        }
    });

    if (!('answer_key' in item)) {
        errors.push('Missing answer_key.');
    }
    if (!isObject(item.rubric)) {
        errors.push('Missing or invalid rubric object.');
    }
    if (!Array.isArray(item.hint_chain)) {
        errors.push('Missing or invalid hint_chain array.');
    }
    if (typeof item.worked_solution !== 'string') {
        errors.push('Missing or invalid worked_solution.');
    }
    if (!Array.isArray(item.tags)) {
        errors.push('Missing or invalid tags array.');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
