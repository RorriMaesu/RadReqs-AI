import {
    createCalculatorCoreState,
    mapKeyboardEventToCalculatorKey,
    normalizeCalculatorCoreState,
    reduceCalculatorState
} from '../calculator-core.js';

function createStage6CalculatorState() {
    const calc = createCalculatorCoreState();
    return {
        calculatorDisplay: calc.display,
        error: calc.error,
        accumulator: calc.accumulator,
        pendingOperator: calc.pendingOperator,
        awaitingNextInput: calc.awaitingNextInput,
        lastOperatorValue: calc.lastOperatorValue,
        exponentSignPending: calc.exponentSignPending
    };
}

function readStage6CalculatorState(concreteMission) {
    return normalizeCalculatorCoreState(concreteMission, { displayKey: 'calculatorDisplay' });
}

function writeStage6CalculatorState(concreteMission, calculatorState) {
    const normalized = normalizeCalculatorCoreState(calculatorState);
    concreteMission.calculatorDisplay = normalized.display;
    concreteMission.error = normalized.error;
    concreteMission.accumulator = normalized.accumulator;
    concreteMission.pendingOperator = normalized.pendingOperator;
    concreteMission.awaitingNextInput = normalized.awaitingNextInput;
    concreteMission.lastOperatorValue = normalized.lastOperatorValue;
    concreteMission.exponentSignPending = normalized.exponentSignPending;
}

function normalizeStage6MissionCalculatorState(concreteMission) {
    writeStage6CalculatorState(concreteMission, readStage6CalculatorState(concreteMission));
}

const createInitialStage6State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L6.1 Powers of 10
    l61Answers: { q1: '', q2: '', q3: '' },
    l61Feedback: 'Powers of 10: Match each power to its standard decimal value.',
    l61Correct: false,

    // L6.2 Scientific Notation
    l62Answers: { value: '', power: '' },
    l62Feedback: 'Scientific Notation: Convert 5400 to a x 10^b.',
    l62Correct: false,

    // L6.3 Exponents & Rosetta Calculator
    powerVal: 3,
    mantissa: 6.022,
    exponent: 23,
    notationFeedback: 'Type 6.022E23 manually on the calculator, then run the guided demo.',
    concreteMission: {
        manualCompleted: false,
        demoWatched: false,
        demoRunning: false,
        demoVersion: 0,
        enteredSequence: [],
        requiredSequence: ['6', '.', '0', '2', '2', 'EE', '2', '3'],
        keypadRun: false,
        ...createStage6CalculatorState()
    },
    concreteCompleted: false,

    // L6.4 Metric Prefixes
    l64Answers: { micro: '', kilo: '', milli: '' },
    l64Feedback: 'Metric Prefixes: Match the prefix to its corresponding power of 10 scale factor.',
    l64Correct: false,

    // L6.5 Train tracks dimensional analysis foundations
    trackSlots: { slot0: 'card-start', slot1: 'card-factor' },
    factorFlipped: false,
    trackFeedback: 'Build the train track to cancel units diagonal mL to milliliters.',

    // L6.6 Multi-Step Train Tracks
    l66Factor1Flipped: true,
    l66Factor2Flipped: true,
    l66Feedback: 'Multi-Step Train Tracks: Flip the conversion factors so that mL -> L -> mol cancels correctly.',
    l66Correct: false,

    // L6.7 Compound unit management
    compoundAnswers: { value: '', unit: '' },
    compoundFeedback: 'L6.7 Compound Units: Evaluate 25 g x 2 J/(g*C) x 3 C and confirm the final unit.',

    // L6.8 Derived unit scaling
    cubedAnswer: '',
    cubedFeedback: 'Convert 2.0 m^3 to cm^3: since 1 m = 100 cm, 1 m^3 = 100^3 cm^3.',

    // L6.9 Multidimensional Unit Scaling (3D Cube) - MOVED TO APPLIED
    cubeLengthDm: 10,
    cubeVolumeAnswer: '',
    cubeVolumeFeedback: 'L6.9 Multidimensional Unit Scaling: Adjust the slider to see how length scales to volume. Solve the volume in dm^3 for a 10 dm cube.',

    // L6.10 Compound Metric Conversion Chains
    densityConvAnswer: '',
    densityConvFeedback: 'L6.10 Compound Conversions: Convert 1.00 g/cm^3 to kg/m^3. Hint: multiply 1.00 by 1,000,000 and divide by 1000.',

    adaptive: {
        loading: false,
        error: '',
        item: null,
        response: '',
        grading: null,
        mastery: null,
        hintRevealCount: 0
    },

    appliedFeedback: 'Applied level: mass-to-volume dose calculation using density as a ratio.',
    appliedChoice: ''
});

export function createStage6Scientific() {
    return {
        id: 'stage6',
        label: 'Scientific Math & DA',
        title: 'Stage 6: Scientific Math & Dimensional Analysis',
        getInitialState() {
            return createInitialStage6State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage6State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;

            const s6Cube = getParams('s6-cube', null);
            if (s6Cube) {
                state.cubeLengthDm = s6Cube.decimeters;
            }

            const s6Density = getParams('s6-density', { density: 1.00, answerKey: '1000' });

            if (!state.concreteMission || typeof state.concreteMission !== 'object') {
                state.concreteMission = { ...defaults.concreteMission };
            } else if ('keypadRun' in state.concreteMission && !('manualCompleted' in state.concreteMission)) {
                const legacyComplete = Boolean(state.concreteMission.keypadRun);
                state.concreteMission = {
                    ...defaults.concreteMission,
                    manualCompleted: legacyComplete,
                    demoWatched: legacyComplete,
                    keypadRun: legacyComplete,
                    calculatorDisplay: legacyComplete ? '6.022E23' : '0'
                };
            } else {
                Object.keys(defaults.concreteMission).forEach((key) => {
                    if (state.concreteMission[key] === undefined) {
                        state.concreteMission[key] = defaults.concreteMission[key];
                    }
                });
            }
            normalizeStage6MissionCalculatorState(state.concreteMission);

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's6-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';
            const refresherApi = window.ChemMathRefresher;

            const existingRow = refresherApi?.getAdaptiveLessonRow?.('stage6', 'L6.5');
            if (existingRow) {
                state.adaptive.mastery = {
                    row: existingRow,
                    evaluation: refresherApi.evaluateLessonMastery(existingRow)
                };
            }

            const attemptLog = Array.isArray(state.adaptive.mastery?.row?.attemptLog)
                ? state.adaptive.mastery.row.attemptLog
                : [];
            const recentAttempts = attemptLog.slice(-8).reverse();
            const trendWindow = (state.adaptive.mastery?.row?.recentResults || []).slice(-10);
            const trendAccuracy = trendWindow.length
                ? Math.round((trendWindow.filter(Boolean).length / trendWindow.length) * 100)
                : 0;
            const visibleHints = Array.isArray(state.adaptive.item?.hint_chain)
                ? state.adaptive.item.hint_chain.slice(0, state.adaptive.hintRevealCount)
                : [];

            // Granular sequential lesson lock checks
            const isLessonUnlocked = (lessonId) => {
                if (state.fastTrack) return true;
                switch (lessonId) {
                    case 'L6.1':
                        return true;
                    case 'L6.2':
                        return state.l61Correct;
                    case 'L6.3':
                        return state.l61Correct && state.l62Correct;
                    case 'L6.4':
                        return state.concreteCompleted || state.pictorialUnlocked;
                    case 'L6.5':
                        return (state.concreteCompleted || state.pictorialUnlocked) && state.l64Correct;
                    case 'L6.5-applied':
                        return (state.concreteCompleted || state.pictorialUnlocked) && state.l64Correct && !state.factorFlipped;
                    case 'L6.6':
                        return (state.concreteCompleted || state.pictorialUnlocked) && state.l64Correct && !state.factorFlipped && state.appliedChoice === 'right';
                    case 'L6.7':
                        return state.abstractUnlocked;
                    case 'L6.8': {
                        const compoundVal = Number(state.compoundAnswers.value);
                        const compoundUnit = state.compoundAnswers.unit.toLowerCase().replace(/\s+/g, '');
                        const compoundCorrect = compoundVal === 150 && (compoundUnit === 'j' || compoundUnit === 'joule' || compoundUnit === 'joules');
                        return state.abstractUnlocked && compoundCorrect;
                    }
                    case 'L6.9':
                        return state.appliedUnlocked;
                    case 'L6.10': {
                        const expectedVol = s6Cube ? String(s6Cube.answerKey) : '1000';
                        return state.appliedUnlocked && state.cubeVolumeAnswer === expectedVol;
                    }
                    default:
                        return false;
                }
            };

            const paneLockedClass = (lessonId) => isLessonUnlocked(lessonId) ? '' : 'locked';
            const statusPill = (lessonId) => isLessonUnlocked(lessonId)
                ? '<span class="s6-pill good" style="font-size:10px; padding:1px 6px; float:right;">Open</span>'
                : '<span class="s6-pill locked" style="font-size:10px; padding:1px 6px; float:right;">Locked</span>';

            host.innerHTML = `
                <style>
                    .s6-wrap { display: grid; gap: 1.2rem; }
                    .s6-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s6-card h2, .s6-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s6-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s6-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s6-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; transition: all 0.2s ease; }
                    .s6-pane.locked { opacity: 0.35; pointer-events: none; border-color: rgba(255, 255, 255, 0.03); }
                    .s6-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s6-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s6-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s6-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s6-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s6-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s6-btn:hover { background: #fbbf24; }
                    .s6-btn.active { background: #f8fafc; border-color: #38bdf8; color: #0f172a; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25); }
                    .s6-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s6-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s6-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s6-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s6-level.s6-locked { opacity: 0.52; position: relative; }
                    .s6-level.s6-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s6-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Calculator Display */
                    .s6-calc-screen { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #38bdf8; font-family: monospace; font-size: 1.1rem; padding: 0.6rem; min-height: 2.2rem; display: flex; align-items: center; justify-content: flex-end; }
                    .s6-keypad { margin-top: 0.5rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
                    .s6-key { border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; background: rgba(30, 41, 59, 0.7); text-align: center; font-weight: bold; color: #f8fafc; font-size: 11px; cursor: pointer; }
                    .s6-key:disabled { opacity: 0.45; cursor: not-allowed; }
                    .s6-key.utility { background: rgba(51, 65, 85, 0.9); }
                    .s6-key.ee { background: #fde68a; color: #0f172a; }
                    .s6-key.operator { background: rgba(14, 116, 144, 0.8); color: #f0f9ff; }
                    .s6-key.active { border-color: #fbbf24; background: rgba(245, 158, 11, 0.2); box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35); color: #fbbf24; }
                    .s6-key.error { border-color: #ef4444; background: rgba(127, 29, 29, 0.35); box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.32); color: #fecaca; }
                    .s6-calc-status { margin-top: 0.5rem; font-size: 0.82rem; color: #cbd5e1; }
                    .s6-calc-status.error { color: #fca5a5; }
                    .s6-calc-step { margin-top: 0.35rem; font-size: 0.78rem; color: #a5b4fc; }
                    
                    /* Train track units */
                    .s6-track { display: grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); gap: 0.5rem; margin-top: 0.6rem; }
                    .s6-slot { border: 1px dashed rgba(255, 255, 255, 0.2); border-radius: 8px; min-height: 68px; padding: 0.4rem; background: rgba(15, 23, 42, 0.3); display: grid; align-content: center; justify-items: center; gap: 2px; }
                    .s6-card-tile { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; background: rgba(30, 41, 59, 0.5); padding: 0.3rem; text-align: center; cursor: grab; width: 100%; color: #cbd5e1; }
                    .s6-frac { display: grid; justify-items: center; font-weight: bold; font-size: 11px; color: #f8fafc; }
                    .s6-frac-line { width: 80%; border-top: 2px solid rgba(255, 255, 255, 0.4); margin: 2px 0; }
                    .s6-unit { border-radius: 4px; padding: 1px 4px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.6); color: #cbd5e1; }
                    .s6-unit.kill { text-decoration: line-through; opacity: 0.5; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s6-wrap">
                    <article class="s6-card s6-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Resolve dimensional tracks, metric indices, and notation to fast-track.</p>
                        <div class="s6-grid">
                            <div class="s6-pane">
                                <strong>1. E-Notation Translate</strong>
                                <p>Scientific 4.5 x 10^-3 matches which calculator screen?</p>
                                <div class="s6-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q1 === '4.5E-3' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q1 === '4.5E-3' ? 'active' : ''}" data-diag="q1" data-value="4.5E-3">4.5E-3</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q1 === '4.5*10^-3' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q1 === '4.5*10^-3' ? 'active' : ''}" data-diag="q1" data-value="4.5*10^-3">4.5*10^-3</button>
                                </div>
                            </div>
                            <div class="s6-pane">
                                <strong>2. Conversion Ratios</strong>
                                <p>Why are conversion factors mathematically equal to 1?</p>
                                <div class="s6-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q2 === 'eq' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q2 === 'eq' ? 'active' : ''}" data-diag="q2" data-value="eq">Numerator/denominator are equivalent quantities</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q2 === 'val' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q2 === 'val' ? 'active' : ''}" data-diag="q2" data-value="val">They make values bigger</button>
                                </div>
                            </div>
                            <div class="s6-pane">
                                <strong>3. Cubed Scaling</strong>
                                <p>If 1 m = 100 cm, how many cm^3 are in 1 m^3?</p>
                                <div class="s6-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q3 === 'million' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q3 === 'million' ? 'active' : ''}" data-diag="q3" data-value="million">1,000,000 (100^3)</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q3 === 'hundred' ? 'true' : 'false'}" class="s6-btn ghost ${state.diagnosticAnswers.q3 === 'hundred' ? 'active' : ''}" data-diag="q3" data-value="hundred">100 (100^1)</button>
                                </div>
                            </div>
                        </div>
                        <div class="s6-grid" style="margin-top:0.75rem;">
                            <button type="button" id="s6-check-diagnostic" class="s6-btn">Check Diagnostic</button>
                        </div>
                        <div id="s6-diagnostic-feedback" class="s6-feedback">${state.diagnosticFeedback}</div>
                        <div class="s6-status">
                            <span class="s6-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s6-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s6-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s6-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s6-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s6-card s6-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Powers, Scientific Notation, & E-Notation</h2>
                        
                        <!-- L6.1 Powers of 10 -->
                        <div class="s6-pane ${paneLockedClass('L6.1')}">
                            <strong>L6.1 Powers of 10</strong> ${statusPill('L6.1')}
                            <p>Match each Power of 10 to its standard decimal value:</p>
                            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                <div>
                                    <span style="display:inline-block; width: 60px; font-weight: bold;">10<sup>3</sup> = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 70px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l61Answers.q1 === '1000' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q1 === '1000' ? 'active' : ''}" data-l61="q1" data-value="1000">1000</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q1 === '100' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q1 === '100' ? 'active' : ''}" data-l61="q1" data-value="100">100</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q1 === '0.01' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q1 === '0.01' ? 'active' : ''}" data-l61="q1" data-value="0.01">0.01</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q1 === '0.001' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q1 === '0.001' ? 'active' : ''}" data-l61="q1" data-value="0.001">0.001</button>
                                    </div>
                                </div>
                                <div>
                                    <span style="display:inline-block; width: 60px; font-weight: bold;">10<sup>-2</sup> = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 70px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l61Answers.q2 === '1000' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q2 === '1000' ? 'active' : ''}" data-l61="q2" data-value="1000">1000</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q2 === '100' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q2 === '100' ? 'active' : ''}" data-l61="q2" data-value="100">100</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q2 === '0.01' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q2 === '0.01' ? 'active' : ''}" data-l61="q2" data-value="0.01">0.01</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q2 === '0.001' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q2 === '0.001' ? 'active' : ''}" data-l61="q2" data-value="0.001">0.001</button>
                                    </div>
                                </div>
                                <div>
                                    <span style="display:inline-block; width: 60px; font-weight: bold;">10<sup>-3</sup> = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 70px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l61Answers.q3 === '1000' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q3 === '1000' ? 'active' : ''}" data-l61="q3" data-value="1000">1000</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q3 === '100' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q3 === '100' ? 'active' : ''}" data-l61="q3" data-value="100">100</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q3 === '0.01' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q3 === '0.01' ? 'active' : ''}" data-l61="q3" data-value="0.01">0.01</button>
                                        <button type="button" aria-pressed="${state.l61Answers.q3 === '0.001' ? 'true' : 'false'}" class="s6-btn ghost ${state.l61Answers.q3 === '0.001' ? 'active' : ''}" data-l61="q3" data-value="0.001">0.001</button>
                                    </div>
                                </div>
                            </div>
                            <button type="button" id="s6-check-l61" class="s6-btn" style="margin-top: 0.6rem; width: 100%;">Check Powers of 10</button>
                            <div class="s6-feedback" id="s6-l61-feedback">${state.l61Feedback}</div>
                        </div>

                        <!-- L6.2 Scientific Notation -->
                        <div class="s6-pane ${paneLockedClass('L6.2')}">
                            <strong>L6.2 Scientific Notation</strong> ${statusPill('L6.2')}
                            <p>Convert 5400 to scientific notation: <em>a</em> × 10<sup><em>b</em></sup></p>
                            <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin: 0.4rem 0;">
                                <input type="number" id="s6-l62-value" class="s6-input" style="max-width: 100px; text-align: center;" placeholder="e.g. 5.4" value="${state.l62Answers.value}" />
                                <span style="font-weight: bold;">× 10</span>
                                <sup style="font-weight: bold; position: relative; top: -6px;">
                                    <input type="number" id="s6-l62-power" class="s6-input" style="max-width: 60px; text-align: center; padding: 0.25rem;" placeholder="b" value="${state.l62Answers.power}" />
                                </sup>
                            </div>
                            <button type="button" id="s6-check-l62" class="s6-btn" style="margin-top: 0.6rem; width: 100%;">Check Scientific Notation</button>
                            <div class="s6-feedback" id="s6-l62-feedback">${state.l62Feedback}</div>
                        </div>

                        <!-- L6.3 E-Notation -->
                        <div class="s6-pane ${paneLockedClass('L6.3')}">
                            <strong>L6.3 E-Notation & Technology</strong> ${statusPill('L6.3')}
                            <p>First type <code>6.022E23</code> manually on the calculator, then watch the guided TI/Casio keystroke demo.</p>
                            <div class="s6-grid">
                                <div class="s6-pane">
                                    <strong>Textbook notation:</strong>
                                    <p style="font-family:serif; font-size:1.15rem; margin-top:4px;">6.022 x 10<sup>23</sup></p>
                                </div>
                                <div class="s6-pane" id="s6-calc-pane" tabindex="0" aria-label="Stage 6 scientific calculator keypad">
                                    <strong>Calculator display:</strong>
                                    <div class="s6-calc-screen" id="s6-calc-screen" aria-live="polite" role="status">${state.concreteMission.calculatorDisplay || '0'}</div>
                                    <div class="s6-keypad">
                                        <button type="button" id="s6-key-7" class="s6-key" aria-label="Digit 7" data-calc-key="7">7</button>
                                        <button type="button" id="s6-key-8" class="s6-key" aria-label="Digit 8" data-calc-key="8">8</button>
                                        <button type="button" id="s6-key-9" class="s6-key" aria-label="Digit 9" data-calc-key="9">9</button>
                                        <button type="button" id="s6-key-del" class="s6-key utility" aria-label="Delete last digit" data-calc-key="DEL">DEL</button>
                                        <button type="button" id="s6-key-clear" class="s6-key utility" aria-label="Clear calculator" data-calc-key="C">C</button>

                                        <button type="button" id="s6-key-4" class="s6-key" aria-label="Digit 4" data-calc-key="4">4</button>
                                        <button type="button" id="s6-key-5" class="s6-key" aria-label="Digit 5" data-calc-key="5">5</button>
                                        <button type="button" id="s6-key-6" class="s6-key" aria-label="Digit 6" data-calc-key="6">6</button>
                                        <button type="button" id="s6-key-mul" class="s6-key operator" aria-label="Multiply" data-calc-key="*">x</button>
                                        <button type="button" id="s6-key-div" class="s6-key operator" aria-label="Divide" data-calc-key="/">/</button>

                                        <button type="button" id="s6-key-1" class="s6-key" aria-label="Digit 1" data-calc-key="1">1</button>
                                        <button type="button" id="s6-key-2" class="s6-key" aria-label="Digit 2" data-calc-key="2">2</button>
                                        <button type="button" id="s6-key-3" class="s6-key" aria-label="Digit 3" data-calc-key="3">3</button>
                                        <button type="button" id="s6-key-plus" class="s6-key operator" aria-label="Add" data-calc-key="+">+</button>
                                        <button type="button" id="s6-key-minus" class="s6-key operator" aria-label="Subtract" data-calc-key="-">-</button>

                                        <button type="button" id="s6-key-sign" class="s6-key utility" aria-label="Toggle sign" data-calc-key="+/-">+/-\</button>
                                        <button type="button" id="s6-key-0" class="s6-key" aria-label="Digit 0" data-calc-key="0">0</button>
                                        <button type="button" id="s6-key-dot" class="s6-key" aria-label="Decimal point" data-calc-key=".">.</button>
                                        <button type="button" id="s6-key-ee" class="s6-key ee" aria-label="Exponent key EE or EXP" data-calc-key="EE">EE/EXP</button>
                                        <button type="button" id="s6-key-equals" class="s6-key operator" aria-label="Equals" data-calc-key="=">=</button>

                                        <button type="button" id="s6-key-enter" class="s6-key utility" aria-label="Enter mission check" data-calc-key="ENTER" style="grid-column: span 5;">ENTER</button>
                                    </div>
                                    <div class="s6-calc-status" id="s6-calc-status">Type the exact sequence: 6 . 0 2 2 EE 2 3</div>
                                    <div class="s6-calc-step" id="s6-mission-step">Progress 0/8 • Next mission key: 6</div>
                                </div>
                            </div>
                            <div class="s6-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button type="button" id="s6-reset-calc" class="s6-btn ghost">Reset Mission + Calculator</button>
                                <button type="button" id="s6-run-keypad" class="s6-btn">Run Guided Demo (Required)</button>
                            </div>
                            <div class="s6-feedback" id="s6-notation-feedback">${state.notationFeedback}</div>
                        </div>

                        <div class="s6-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s6-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s6-pill ${state.l61Correct ? 'good' : 'locked'}">Powers of 10</span>
                                <span class="s6-pill ${state.l62Correct ? 'good' : 'locked'}">Scientific Notation</span>
                                <span id="s6-pill-manual" class="s6-pill ${state.concreteMission.manualCompleted ? 'good' : 'locked'}">Manual entry complete</span>
                                <span id="s6-pill-demo" class="s6-pill ${state.concreteMission.demoWatched ? 'good' : 'locked'}">Guided demo watched</span>
                            </div>
                            <div class="s6-grid" style="gap: 4px;">
                                <button id="s6-hint-concrete" class="s6-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s6-continue-pictorial" class="s6-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s6-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s6-btn ghost" title="Reinforcement" data-prompt="Why do scientific calculators use E-notation and why is typing multiplication *10^ incorrect on many models?" ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s6-card s6-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Metric Prefixes & Kinetic Train Tracks</h2>
                        
                        <!-- L6.4 Metric Prefixes -->
                        <div class="s6-pane ${paneLockedClass('L6.4')}">
                            <strong>L6.4 Metric Prefixes</strong> ${statusPill('L6.4')}
                            <p>Match prefixes to their power of 10 scale factor:</p>
                            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                <div>
                                    <span style="display:inline-block; width: 80px; font-weight: bold;">micro- (µ-) = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 90px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l64Answers.micro === '10^-6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.micro === '10^-6' ? 'active' : ''}" data-l64="micro" data-value="10^-6">10<sup>-6</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.micro === '10^-3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.micro === '10^-3' ? 'active' : ''}" data-l64="micro" data-value="10^-3">10<sup>-3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.micro === '10^3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.micro === '10^3' ? 'active' : ''}" data-l64="micro" data-value="10^3">10<sup>3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.micro === '10^6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.micro === '10^6' ? 'active' : ''}" data-l64="micro" data-value="10^6">10<sup>6</sup></button>
                                    </div>
                                </div>
                                <div>
                                    <span style="display:inline-block; width: 80px; font-weight: bold;">milli- (m-) = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 90px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l64Answers.milli === '10^-6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.milli === '10^-6' ? 'active' : ''}" data-l64="milli" data-value="10^-6">10<sup>-6</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.milli === '10^-3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.milli === '10^-3' ? 'active' : ''}" data-l64="milli" data-value="10^-3">10<sup>-3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.milli === '10^3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.milli === '10^3' ? 'active' : ''}" data-l64="milli" data-value="10^3">10<sup>3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.milli === '10^6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.milli === '10^6' ? 'active' : ''}" data-l64="milli" data-value="10^6">10<sup>6</sup></button>
                                    </div>
                                </div>
                                <div>
                                    <span style="display:inline-block; width: 80px; font-weight: bold;">kilo- (k-) = </span>
                                    <div class="s6-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px; display: inline-grid; width: calc(100% - 90px); vertical-align: middle;">
                                        <button type="button" aria-pressed="${state.l64Answers.kilo === '10^-6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.kilo === '10^-6' ? 'active' : ''}" data-l64="kilo" data-value="10^-6">10<sup>-6</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.kilo === '10^-3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.kilo === '10^-3' ? 'active' : ''}" data-l64="kilo" data-value="10^-3">10<sup>-3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.kilo === '10^3' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.kilo === '10^3' ? 'active' : ''}" data-l64="kilo" data-value="10^3">10<sup>3</sup></button>
                                        <button type="button" aria-pressed="${state.l64Answers.kilo === '10^6' ? 'true' : 'false'}" class="s6-btn ghost ${state.l64Answers.kilo === '10^6' ? 'active' : ''}" data-l64="kilo" data-value="10^6">10<sup>6</sup></button>
                                    </div>
                                </div>
                            </div>
                            <button type="button" id="s6-check-l64" class="s6-btn" style="margin-top: 0.6rem; width: 100%;">Check Metric Prefixes</button>
                            <div class="s6-feedback" id="s6-l64-feedback">${state.l64Feedback}</div>
                        </div>

                        <!-- L6.5 Dimensional Analysis Foundations -->
                        <div class="s6-pane ${paneLockedClass('L6.5')}">
                            <strong>L6.5 Dimensional Analysis Foundations:</strong> ${statusPill('L6.5')}
                            <p>Arrange factors to convert 250 mL of saline solution to grams. Conversion factor is 0.95 g per 100 mL. Diagonal mL cancel.</p>
                            <div class="s6-grid" style="margin-bottom:0.5rem; gap: 4px;">
                                <div id="s6-bank-start" class="s6-card-tile">250 <span class="s6-unit">mL</span> / 1</div>
                                <div id="s6-bank-factor" class="s6-card-tile">0.95 <span class="s6-unit">g</span> / 100 <span class="s6-unit">mL</span></div>
                            </div>
                            <div class="s6-track">
                                <div class="s6-slot" id="s6-slot0"></div>
                                <div class="s6-slot" id="s6-slot1"></div>
                            </div>
                            <div class="s6-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button id="s6-flip-factor" class="s6-btn">Flip Conversion Factor</button>
                                <button id="s6-reset-track" class="s6-btn ghost">Reset Track</button>
                                <button id="s6-check-track" class="s6-btn">Check Cancellation</button>
                            </div>
                        </div>
                        <div class="s6-feedback" id="s6-track-feedback">${state.trackFeedback}</div>

                        <!-- L6.5 Applied Dose (Moved to match L6.5 sequence) -->
                        <div class="s6-pane ${paneLockedClass('L6.5-applied')}" style="margin-top: 0.75rem; margin-bottom: 0.75rem;">
                            <strong>L6.5 Applied Dose:</strong> ${statusPill('L6.5-applied')}
                            <p>${state.adaptive.item?.prompt || 'A syringe holds 10.0 mL of liquid drug. The drug density is 1.2 g/mL. What mass of drug does this dose deliver?'}</p>
                            <div class="s6-grid">
                                <button id="s6-app-wrong" class="s6-btn ghost">8.33 g because we divide 10.0 / 1.2</button>
                                <button id="s6-app-right" class="s6-btn">12.0 g because 10.0 mL × (1.2 g / 1.0 mL) cancels mL, leaving grams (10.0 × 1.2 = 12.0)</button>
                            </div>
                            <div class="s6-feedback" id="s6-applied-feedback-text">${state.appliedFeedback}</div>
                        </div>

                        <!-- L6.5 Adaptive Pilot (Gemma4) (Moved to match L6.5 sequence) -->
                        <div class="s6-pane ${paneLockedClass('L6.5-applied')}" style="margin-top:0.75rem; margin-bottom: 0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Adaptive Pilot (Gemma4)</h3>
                            <p style="margin-top:0;">Generate a fresh challenge at your current level, submit your answer, and get adaptive feedback + mastery updates for L6.5.</p>
                            <div class="s6-grid" style="gap:4px;">
                                <button id="s6-generate-adaptive" class="s6-btn" ${state.adaptive.loading ? 'disabled' : ''}>${state.adaptive.loading ? 'Generating...' : 'Generate Adaptive Challenge'}</button>
                            </div>
                            <div class="s6-feedback" id="s6-adaptive-status">${state.adaptive.error || 'Ready for adaptive challenge generation.'}</div>
                            ${state.adaptive.item ? `
                                <div class="s6-pane" style="margin-top:0.6rem;">
                                    <p><strong>Challenge:</strong> ${state.adaptive.item.prompt}</p>
                                    <p><strong>Difficulty:</strong> ${state.adaptive.item.difficulty || 'unspecified'}</p>
                                    <p><strong>Tags:</strong> ${(state.adaptive.item.tags || []).join(', ') || 'none'}</p>
                                    <div class="s6-grid" style="grid-template-columns: 1fr auto;">
                                        <input id="s6-adaptive-response" class="s6-input" placeholder="Enter your response" value="${state.adaptive.response || ''}" />
                                        <button id="s6-submit-adaptive" class="s6-btn" ${state.adaptive.loading ? 'disabled' : ''}>Submit</button>
                                    </div>
                                    <div class="s6-grid" style="gap:4px; margin-top:0.5rem;">
                                        <button id="s6-reveal-hint" class="s6-btn ghost" ${state.adaptive.loading ? 'disabled' : ''}>Reveal Next Hint</button>
                                    </div>
                                    <div class="s6-feedback">${visibleHints.length ? visibleHints.map((hint, idx) => `${idx + 1}. ${hint}`).join('<br>') : 'No hints revealed yet.'}</div>
                                </div>
                            ` : ''}
                            <div class="s6-feedback" id="s6-adaptive-feedback">${state.adaptive.grading?.feedback || 'No adaptive submission yet.'}${state.adaptive.grading?.regraded ? `<br><strong>Regrade:</strong> ${state.adaptive.grading.regradeReason}` : ''}</div>
                            <div class="s6-feedback" id="s6-adaptive-mastery">${state.adaptive.mastery ? `Mastery check: ${(state.adaptive.mastery.evaluation.accuracy * 100).toFixed(0)}% accuracy across ${state.adaptive.mastery.evaluation.attempts} attempts (${state.adaptive.mastery.evaluation.passed ? 'MASTERED' : 'IN PROGRESS'}).` : 'Mastery policy: 80%+ with minimum attempts and consistency window.'}</div>
                            <div class="s6-feedback" id="s6-adaptive-history">
                                <strong>Recent Trend:</strong> ${trendAccuracy}% over last ${trendWindow.length || 0} attempts.<br>
                                <strong>Last Attempts:</strong><br>
                                ${recentAttempts.length
                                    ? recentAttempts.map((entry, idx) => `${idx + 1}. ${entry.isCorrect ? 'OK' : 'X'} | src=${entry.source || 'n/a'} | conf=${typeof entry.confidence === 'number' ? entry.confidence.toFixed(2) : 'n/a'} | score=${typeof entry.score === 'number' ? entry.score.toFixed(2) : 'n/a'}`).join('<br>')
                                    : 'No attempt history yet.'}
                            </div>
                        </div>

                        <!-- L6.6 Multi-Step Train Tracks -->
                        <div class="s6-pane ${paneLockedClass('L6.6')}" style="margin-top: 0.75rem;">
                            <strong>L6.6 Multi-Step Train Tracks</strong> ${statusPill('L6.6')}
                            <p>Arrange factors to convert 250 mL of saline solution to moles of NaCl. The solution concentration is 0.1 mol/L. Standard metric conversion: 1000 mL = 1 L. Flip factor orientations so diagonal units cancel along the entire conversion chain: mL &rarr; L &rarr; mol.</p>
                            
                            <div class="s6-track" style="grid-template-columns: repeat(3, minmax(110px, 1fr));">
                                <div class="s6-slot">
                                    <div class="s6-frac">
                                        <div>250 <span class="s6-unit kill">mL</span></div>
                                        <div class="s6-frac-line"></div>
                                        <div>1</div>
                                    </div>
                                </div>
                                <div class="s6-slot" id="s6-l66-slot1">
                                    <!-- Dynamic content inside mount -->
                                </div>
                                <div class="s6-slot" id="s6-l66-slot2">
                                    <!-- Dynamic content inside mount -->
                                </div>
                            </div>
                            
                            <div class="s6-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button id="s6-l66-flip-factor1" class="s6-btn">Flip Metric Factor</button>
                                <button id="s6-l66-flip-factor2" class="s6-btn">Flip Conc. Factor</button>
                                <button id="s6-check-l66" class="s6-btn">Check Multi-Step Track</button>
                            </div>
                            <div class="s6-feedback" id="s6-l66-feedback">${state.l66Feedback}</div>
                        </div>

                        <div class="s6-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s6-btn ghost" title="Reinforcement" data-prompt="Explain the 'train tracks' dimensional analysis workspace. How does canceling units diagonally work?" ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s6-card s6-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Derived Unit Scaling (Cubed Volumes)</h2>
                        
                        <!-- L6.7 Navigating Compound Science Units -->
                        <div class="s6-pane ${paneLockedClass('L6.7')}" style="margin-bottom:0.75rem;">
                            <p><strong>L6.7 Navigating Compound Science Units:</strong> ${statusPill('L6.7')}</p>
                            <p>Compute <code>25 g x 2 J/(g*C) x 3 C</code>. Track cancellations of <code>g</code> and <code>C</code> to isolate the final unit.</p>
                            <div class="s6-grid" style="grid-template-columns: 1fr 1fr;">
                                <input id="s6-compound-value" class="s6-input" placeholder="Numeric result" value="${state.compoundAnswers.value}" />
                                <input id="s6-compound-unit" class="s6-input" placeholder="Final unit" value="${state.compoundAnswers.unit}" />
                            </div>
                            <button id="s6-check-compound" class="s6-btn" style="margin-top:8px; width:100%;">Check Compound Units</button>
                            <div class="s6-feedback" id="s6-compound-feedback">${state.compoundFeedback}</div>
                        </div>
                        
                        <!-- L6.8 Derived Unit Scaling -->
                        <div class="s6-pane ${paneLockedClass('L6.8')}">
                            <p><strong>L6.8 Derived Unit Scaling:</strong> ${statusPill('L6.8')}</p>
                            <p>Convert 2.0 m<sup>3</sup> to cm<sup>3</sup>. Scale factor is 1 m = 100 cm, so volume factor is 100 x 100 x 100 = 1,000,000.</p>
                            <p>Enter the volume in cm<sup>3</sup> (write in full, e.g. 2000000):</p>
                            <div class="s6-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s6-cube-input" class="s6-input" placeholder="Volume in cm^3" value="${state.cubedAnswer}" />
                                <button id="s6-check-cube" class="s6-btn">Check Volume</button>
                            </div>
                        </div>
                        <div class="s6-feedback" id="s6-cubed-feedback">${state.cubedFeedback}</div>

                        <div class="s6-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s6-btn ghost" title="Reinforcement" data-prompt="Why do we have to cube the conversion factor when converting metric volumes like m^3 to cm^3?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s6-card s6-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Density & Multi-Step Conversions</h2>
                        
                        <!-- L6.9 Multidimensional Unit Scaling (3D Cube) -->
                        <div class="s6-pane ${paneLockedClass('L6.9')}" style="margin-bottom:0.75rem;">
                            <strong>L6.9 Multidimensional Unit Scaling (3D Cube)</strong> ${statusPill('L6.9')}
                            <p>A length scales linearly, but volume scales by the cube of the factor: Volume = Length<sup>3</sup>. Drag the slider to adjust the side length of the cube in decimeters (dm).</p>
                            <div class="s6-grid" style="grid-template-columns: 1fr 2fr; gap:12px; align-items:center;">
                                <div style="background:#0f172a; height:140px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center;">
                                    <div style="width: 80px; height: 80px; perspective: 400px;">
                                        <div style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transform: rotateX(-20deg) rotateY(30deg) scale3d(${state.cubeLengthDm / 10}, ${state.cubeLengthDm / 10}, ${state.cubeLengthDm / 10}); transition: transform 0.2s ease;">
                                            <!-- Front face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateY(0deg) translateZ(40px);"></div>
                                            <!-- Back face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateY(180deg) translateZ(40px);"></div>
                                            <!-- Right face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateY(90deg) translateZ(40px);"></div>
                                            <!-- Left face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateY(-90deg) translateZ(40px);"></div>
                                            <!-- Top face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateX(90deg) translateZ(40px);"></div>
                                            <!-- Bottom face -->
                                            <div style="position: absolute; width: 80px; height: 80px; border: 2px solid #38bdf8; background: rgba(56, 189, 248, 0.25); transform: rotateX(-90deg) translateZ(40px);"></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label class="s6-label">Cube Side Length: ${state.cubeLengthDm} dm (${(state.cubeLengthDm / 10).toFixed(1)} m)</label>
                                    <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                                        <input type="range" id="s6-cube-length-slider" min="1" max="10" value="${state.cubeLengthDm}" style="flex:1;" ${s6Cube ? 'disabled' : ''} />
                                        <input type="number" id="s6-cube-length-num" min="1" max="10" value="${state.cubeLengthDm}" class="s6-input" style="width:60px; padding:0.25rem;" ${s6Cube ? 'disabled' : ''} />
                                    </div>
                                    <p style="margin:6px 0 3px; font-size:0.85rem;">How many cubic decimeters (dm<sup>3</sup>) fit in a ${s6Cube ? s6Cube.decimeters : 10} dm (${s6Cube ? s6Cube.meters : 1} m) cube?</p>
                                    <div style="display:flex; gap:6px;">
                                        <input type="number" id="s6-cubevol-input" class="s6-input" placeholder="e.g. 1000" value="${state.cubeVolumeAnswer}" data-tutor-question-id="s6-cube" />
                                        <button id="s6-check-cubevol" class="s6-btn" data-tutor-question-id="s6-cube">Check Volume</button>
                                    </div>
                                </div>
                            </div>
                            <div class="s6-feedback" id="s6-cubevol-feedback">${state.cubeVolumeFeedback}</div>
                        </div>

                        <!-- L6.10 Compound Metric Conversion Chains -->
                        <div class="s6-pane ${paneLockedClass('L6.10')}" style="margin-bottom:0.75rem;">
                            <strong>L6.10 Compound Metric Conversion Chains</strong> ${statusPill('L6.10')}
                            <p>Density is a compound unit. Convert ${s6Density.density} g/cm<sup>3</sup> to kg/m<sup>3</sup>. Multiply by 1 kg / 1000 g and 1,000,000 cm<sup>3</sup> / 1 m<sup>3</sup>.</p>
                            <div style="display:flex; gap:6px; margin-bottom:8px;">
                                <input type="number" id="s6-densityconv-input" class="s6-input" placeholder="Value in kg/m^3" value="${state.densityConvAnswer}" data-tutor-question-id="s6-density" />
                                <button id="s6-check-densityconv" class="s6-btn" data-tutor-question-id="s6-density">Check Density</button>
                            </div>
                            <div class="s6-feedback" id="s6-densityconv-feedback">${state.densityConvFeedback}</div>
                        </div>

                        <div class="s6-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s6-btn ghost" title="Reinforcement" data-prompt="How do we use density as a double-sided conversion factor to translate mass into volume?" ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's6-check-diagnostic': {
                        id: 's6-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 6 diagnostic answers about E-notation, conversion factors, and cubed scaling.'
                    },
                    's6-check-l61': {
                        id: 's6-powers-10',
                        level: 'concrete',
                        keys: 'l61Answers.q1,l61Answers.q2,l61Answers.q3',
                        prompt: 'Help me review my powers of 10 matching answers.'
                    },
                    's6-check-l62': {
                        id: 's6-scientific-notation',
                        level: 'concrete',
                        keys: 'l62Answers.value,l62Answers.power',
                        prompt: 'Help me review converting 5400 to scientific notation.'
                    },
                    's6-run-keypad': {
                        id: 's6-enotation-keypad',
                        level: 'concrete',
                        keys: 'concreteMission.manualCompleted,concreteMission.demoWatched,concreteMission.calculatorDisplay,concreteMission.enteredSequence,concreteMission.error,concreteMission.demoRunning,concreteMission.exponentSignPending,notationFeedback,concreteCompleted,pictorialUnlocked',
                        prompt: 'Help me translate textbook scientific notation into calculator EE/EXP keystrokes.'
                    },
                    's6-check-l64': {
                        id: 's6-metric-prefixes',
                        level: 'pictorial',
                        keys: 'l64Answers.micro,l64Answers.milli,l64Answers.kilo',
                        prompt: 'Help me match metric prefixes to their powers of 10 scale factors.'
                    },
                    's6-check-track': {
                        id: 's6-train-track',
                        level: 'pictorial',
                        keys: 'factorFlipped,trackSlots.slot0,trackSlots.slot1',
                        prompt: 'Help me arrange dimensional-analysis train tracks so units cancel correctly.'
                    },
                    's6-check-l66': {
                        id: 's6-multistep-train-track',
                        level: 'pictorial',
                        keys: 'l66Factor1Flipped,l66Factor2Flipped',
                        prompt: 'Help me arrange a two-step train track to convert mL to moles.'
                    },
                    's6-check-compound': {
                        id: 's6-compound-units',
                        level: 'abstract',
                        keys: 'compoundAnswers.value,compoundAnswers.unit',
                        prompt: 'Help me evaluate 25 g times 2 J over g times C times 3 C and track unit cancellation.'
                    },
                    's6-check-cube': {
                        id: 's6-cubed-volume',
                        level: 'abstract',
                        keys: 'cubedAnswer',
                        prompt: 'Help me convert 2.0 cubic meters to cubic centimeters using cubed scaling.'
                    },
                    's6-check-cubevol': {
                        id: 's6-cube',
                        level: 'applied',
                        keys: 'cubeLengthDm,cubeVolumeAnswer',
                        prompt: 'Help me calculate the volume in dm^3 for the 3D cube.'
                    },
                    's6-app-right': {
                        id: 's6-density-dose',
                        level: 'pictorial',
                        keys: 'appliedChoice',
                        prompt: 'Help me compute mass from volume and density using dimensional analysis.'
                    },
                    's6-check-densityconv': {
                        id: 's6-density',
                        level: 'applied',
                        keys: 'densityConvAnswer',
                        prompt: 'Help me convert g/cm^3 density to kg/m^3.'
                    },
                    's6-generate-adaptive': {
                        id: 's6-adaptive-generate',
                        level: 'pictorial',
                        keys: 'adaptive.item,adaptive.loading',
                        prompt: 'Help me interpret this adaptive challenge before I answer.'
                    },
                    's6-submit-adaptive': {
                        id: 's6-adaptive-submit',
                        level: 'pictorial',
                        keys: 'adaptive.response,adaptive.item,adaptive.hintRevealCount',
                        prompt: 'Help me submit a strong response to this adaptive challenge and check my reasoning.'
                    },
                    's6-reveal-hint': {
                        id: 's6-adaptive-hints',
                        level: 'pictorial',
                        keys: 'adaptive.hintRevealCount,adaptive.item',
                        prompt: 'Help me use hints productively without giving away the final answer immediately.'
                    }
                };

                Object.entries(specs).forEach(([elId, spec]) => {
                    const el = host.querySelector(`#${elId}`);
                    if (!el) return;
                    el.setAttribute('data-tutor-question-id', spec.id);
                    el.setAttribute('data-tutor-level', spec.level);
                    el.setAttribute('data-tutor-answer-keys', spec.keys);
                    el.setAttribute('data-tutor-question', spec.prompt);
                });
            };

            annotateTutorQuestions();

            const refreshAdaptiveMastery = () => {
                const row = refresherApi?.getAdaptiveLessonRow?.('stage6', 'L6.5');
                if (!row) return;
                state.adaptive.mastery = {
                    row,
                    evaluation: refresherApi.evaluateLessonMastery(row)
                };
            };

            refreshAdaptiveMastery();

            const syncConcreteMission = () => {
                const complete = Boolean(
                    state.l61Correct && state.l62Correct &&
                    state.concreteMission.manualCompleted && state.concreteMission.demoWatched
                );

                if (complete && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.notationFeedback = 'Concrete mission complete. You matched powers of 10, converted scientific notation, and completed the calculator practice. Pictorial unlocked. Continue below.';
                }
            };

            const syncPictorialMission = () => {
                const complete = Boolean(
                    state.l64Correct && !state.factorFlipped && state.l66Correct
                );
                if (complete && !state.abstractUnlocked) {
                    state.abstractUnlocked = true;
                    state.trackFeedback = 'Pictorial mission complete. Metric prefixes matched, and train tracks cancellation verified. Abstract unlocked. Continue below.';
                }
            };

            const syncAbstractMission = () => {
                const compoundVal = Number(state.compoundAnswers.value);
                const compoundUnit = state.compoundAnswers.unit.toLowerCase().replace(/\s+/g, '');
                const compoundCorrect = compoundVal === 150 && (compoundUnit === 'j' || compoundUnit === 'joule' || compoundUnit === 'joules');

                const cubeVal = state.cubedAnswer.trim();
                const cubeCorrect = (cubeVal === '2000000' || cubeVal === '2,000,000' || cubeVal === '2.0e6');

                if (compoundCorrect && cubeCorrect && !state.appliedUnlocked) {
                    state.appliedUnlocked = true;
                    state.cubedFeedback = 'Abstract mission complete. Compound units evaluated, and cubic meters scaled. Applied unlocked. Continue below.';
                }
            };

            const sequenceToDisplay = (sequence) => {
                let output = '';

                sequence.forEach((token) => {
                    if (token === 'EE') {
                        if (output && !output.includes('E')) {
                            output += 'E';
                        }
                        return;
                    }

                    if (token === '.') {
                        if (output.includes('E')) return;
                        const [mantissa] = output.split('E');
                        if (mantissa.includes('.')) return;
                        output = output ? `${output}.` : '0.';
                        return;
                    }

                    output += token;
                });

                return output || '0';
            };

            const resetConcretePractice = () => {
                state.concreteMission.enteredSequence = [];
                state.concreteMission.calculatorDisplay = '0';
                state.concreteMission.error = '';
                state.concreteMission.manualCompleted = false;
                state.concreteMission.demoWatched = false;
                state.concreteMission.keypadRun = false;
                state.concreteMission.demoRunning = false;
                state.concreteMission.demoVersion = Number(state.concreteMission.demoVersion || 0) + 1;
                state.concreteMission.accumulator = null;
                state.concreteMission.pendingOperator = '';
                state.concreteMission.awaitingNextInput = false;
                state.concreteMission.lastOperatorValue = null;
                state.concreteMission.exponentSignPending = false;
                state.concreteCompleted = false;
                state.pictorialUnlocked = false;
            };

            const renderTrack = () => {
                const s0 = host.querySelector('#s6-slot0');
                const s1 = host.querySelector('#s6-slot1');
                if (!s0 || !s1) return;

                s0.innerHTML = `
                    <div class="s6-frac">
                        <div>250 <span class="s6-unit ${state.factorFlipped ? '' : 'kill'}">mL</span></div>
                        <div class="s6-frac-line"></div>
                        <div>1</div>
                    </div>
                `;

                if (state.factorFlipped) {
                    s1.innerHTML = `
                        <div class="s6-frac">
                            <div>100 <span class="s6-unit">mL</span></div>
                            <div class="s6-frac-line"></div>
                            <div>0.95 <span class="s6-unit">g</span></div>
                        </div>
                    `;
                    state.trackFeedback = 'Factor flipped: mL is in numerator and mL is in denominator. No diagonal cancellation occurs. Syringe dosage cannot compute.';
                } else {
                    s1.innerHTML = `
                        <div class="s6-frac">
                            <div>0.95 <span class="s6-unit">g</span></div>
                            <div class="s6-frac-line"></div>
                            <div>100 <span class="s6-unit kill">mL</span></div>
                        </div>
                    `;
                    state.trackFeedback = state.abstractUnlocked
                        ? 'Correct! mL in numerator cancels mL in denominator diagonally, leaving grams as target unit. Result: 250 × 0.95 / 100 = 2.375 g. Abstract unlocked. Continue below.'
                        : 'Orientation is ready. Click "Check Cancellation" to validate diagonal unit cancellation and unlock Abstract.';
                }
            };

            renderTrack();
            renderTrackL66();

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            const checkDiagnosticBtn = host.querySelector('#s6-check-diagnostic');
            checkDiagnosticBtn?.addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === '4.5E-3' &&
                                state.diagnosticAnswers.q2 === 'eq' &&
                                state.diagnosticAnswers.q3 === 'million';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    
                    state.concreteCompleted = true;
                    state.l61Correct = true;
                    state.l62Correct = true;
                    state.concreteMission.manualCompleted = true;
                    state.concreteMission.demoWatched = true;
                    
                    state.pictorialUnlocked = true;
                    state.l64Correct = true;
                    state.factorFlipped = false;
                    state.l66Correct = true;
                    
                    state.abstractUnlocked = true;
                    state.cubedAnswer = '2000000';
                    state.compoundAnswers = { value: '150', unit: 'J' };
                    
                    state.appliedUnlocked = true;
                    state.cubeVolumeAnswer = s6Cube ? String(s6Cube.answerKey) : '1000';
                    state.densityConvAnswer = String(s6Density.answerKey);
                    state.appliedChoice = 'right';
                    
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered E-notations, train tracks, and cubed volumetric conversions. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Rosetta Keystrokes
            const calculatorDisplayEl = host.querySelector('#s6-calc-screen');
            const calcStatusEl = host.querySelector('#s6-calc-status');
            const missionStepEl = host.querySelector('#s6-mission-step');
            const notationFeedbackEl = host.querySelector('#s6-notation-feedback');
            const continuePictorialBtn = host.querySelector('#s6-continue-pictorial');
            const runKeypadBtn = host.querySelector('#s6-run-keypad');
            const resetCalcBtn = host.querySelector('#s6-reset-calc');
            const calcPaneEl = host.querySelector('#s6-calc-pane');
            const calcKeys = host.querySelectorAll('[data-calc-key]');
            const concreteLocked = !(state.fastTrack || state.concreteUnlocked) || !isLessonUnlocked('L6.3');

            const updateCalculatorDisplay = () => {
                if (calculatorDisplayEl) {
                    calculatorDisplayEl.textContent = state.concreteMission.calculatorDisplay || '0';
                }
            };

            const calcKeySelector = {
                '0': '#s6-key-0',
                '1': '#s6-key-1',
                '2': '#s6-key-2',
                '3': '#s6-key-3',
                '4': '#s6-key-4',
                '5': '#s6-key-5',
                '6': '#s6-key-6',
                EE: '#s6-key-ee',
                '+': '#s6-key-plus',
                '-': '#s6-key-minus',
                '*': '#s6-key-mul',
                '/': '#s6-key-div',
                '=': '#s6-key-equals',
                C: '#s6-key-clear',
                DEL: '#s6-key-del',
                '+/-': '#s6-key-sign',
                ENTER: '#s6-key-enter'
            };

            const clearCalculatorEngine = () => {
                writeStage6CalculatorState(state.concreteMission, createCalculatorCoreState());
            };

            const flashKey = (btn, kind = 'active') => {
                if (!btn) return;
                btn.classList.remove('active', 'error');
                btn.classList.add(kind);
                setTimeout(() => btn.classList.remove(kind), 170);
            };

            const missionExpectedToken = () => {
                if (state.concreteMission.manualCompleted) return 'Completed';
                const next = state.concreteMission.requiredSequence[state.concreteMission.enteredSequence.length];
                return next || 'Completed';
            };

            const missionProgressLabel = () => {
                const total = state.concreteMission.requiredSequence.length || 0;
                const done = Math.min(state.concreteMission.enteredSequence.length, total);
                return `Progress ${done}/${total}`;
            };

            const refreshConcreteUi = () => {
                updateCalculatorDisplay();

                if (calcStatusEl) {
                    calcStatusEl.textContent = state.concreteMission.error || 'Type the exact sequence: 6 . 0 2 2 EE 2 3';
                    calcStatusEl.classList.toggle('error', Boolean(state.concreteMission.error));
                }

                if (missionStepEl) {
                    missionStepEl.textContent = `${missionProgressLabel()} • Next mission key: ${missionExpectedToken()}`;
                }

                if (notationFeedbackEl) {
                    notationFeedbackEl.textContent = state.notationFeedback;
                }

                if (runKeypadBtn) {
                    runKeypadBtn.disabled = concreteLocked || state.concreteMission.demoRunning;
                    runKeypadBtn.textContent = state.concreteMission.demoRunning ? 'Running Demo...' : 'Run Guided Demo (Required)';
                }

                if (resetCalcBtn) {
                    resetCalcBtn.disabled = concreteLocked || state.concreteMission.demoRunning;
                }

                if (continuePictorialBtn) {
                    continuePictorialBtn.disabled = concreteLocked || !(state.fastTrack || state.pictorialUnlocked);
                }

                calcKeys.forEach((keyBtn) => {
                    keyBtn.disabled = concreteLocked || state.concreteMission.demoRunning;
                });
            };

            const syncAndPersistConcrete = (msg) => {
                syncConcreteMission();
                refreshConcreteUi();
                persist(msg);
            };

            const missionTokenSet = new Set(state.concreteMission.requiredSequence || []);

            const applyMissionToken = (key) => {
                if (key === 'DEL') {
                    if (state.concreteMission.enteredSequence.length > 0) {
                        state.concreteMission.enteredSequence.pop();
                    }
                    state.concreteMission.manualCompleted = false;
                    state.concreteMission.error = '';
                    state.notationFeedback = 'Last mission key removed. Continue typing 6.022E23.';
                    return true;
                }

                if (key === 'C') {
                    state.concreteMission.enteredSequence = [];
                    state.concreteMission.manualCompleted = false;
                    state.concreteMission.error = '';
                    state.notationFeedback = 'Calculator cleared. Type 6.022E23 manually.';
                    return true;
                }

                if (state.concreteMission.manualCompleted) {
                    state.concreteMission.error = '';
                    state.notationFeedback = state.concreteMission.demoWatched
                        ? 'Manual and demo checkpoints complete. Continue to Pictorial.'
                        : 'Manual checkpoint complete. Run guided demo to finish mission.';
                    return false;
                }

                if (!missionTokenSet.has(key)) {
                    if (state.concreteMission.enteredSequence.length > 0) {
                        const expected = state.concreteMission.requiredSequence[state.concreteMission.enteredSequence.length];
                        state.concreteMission.error = `Mission expects "${expected}" next.`;
                        state.notationFeedback = 'Use mission keys only for progress: 6 . 0 2 2 EE 2 3.';
                    }
                    return true;
                }

                const nextIndex = state.concreteMission.enteredSequence.length;
                if (nextIndex >= state.concreteMission.requiredSequence.length) {
                    state.concreteMission.manualCompleted = true;
                    state.concreteMission.error = '';
                    state.notationFeedback = 'Manual checkpoint already complete. Run guided demo.';
                    return false;
                }

                const expected = state.concreteMission.requiredSequence[nextIndex];
                if (key !== expected) {
                    state.concreteMission.error = `Expected "${expected}" next, not "${key}".`;
                    state.notationFeedback = 'Incorrect key order. Use DEL or C, then continue the exact TI/Casio sequence.';
                    return false;
                }

                state.concreteMission.enteredSequence.push(key);
                state.concreteMission.error = '';
                if (state.concreteMission.enteredSequence.length === state.concreteMission.requiredSequence.length) {
                    state.concreteMission.manualCompleted = true;
                    state.notationFeedback = 'Manual checkpoint complete. Now run the guided demo to finish mission.';
                } else {
                    state.notationFeedback = 'Good. Keep typing the exact sequence for 6.022E23.';
                }
                return true;
            };

            const handleCalculatorKey = (key, btn, options = {}) => {
                const fromDemo = Boolean(options.fromDemo);
                const applyMission = options.applyMission !== false;
                const shouldPersist = options.persist !== false;
                const flash = options.flash !== false;

                if ((state.concreteMission.demoRunning && !fromDemo) || concreteLocked || !key) return;

                const commit = (msg) => {
                    if (shouldPersist) {
                        syncAndPersistConcrete(msg);
                    } else {
                        syncConcreteMission();
                        refreshConcreteUi();
                    }
                };

                const applyMissionMaybe = (token) => {
                    if (!applyMission) return true;
                    return applyMissionToken(token);
                };

                if (btn && flash) flashKey(btn, 'active');
                const currentCalculator = readStage6CalculatorState(state.concreteMission);
                const nextCalculator = reduceCalculatorState(currentCalculator, key);
                writeStage6CalculatorState(state.concreteMission, nextCalculator);

                if (key === 'C') {
                    clearCalculatorEngine();
                }

                if (missionTokenSet.has(key) || key === 'C' || key === 'DEL') {
                    applyMissionMaybe(key);
                }

                if (applyMission && key === '+/-') {
                    state.notationFeedback = 'Sign toggled. Mission sequence still expects positive 6.022E23.';
                }

                if (applyMission && ['+', '-', '*', '/'].includes(key) && !nextCalculator.error) {
                    state.notationFeedback = `Operator ${key} selected. Continue with next value.`;
                }

                if (applyMission && (key === '=' || key === 'ENTER') && !nextCalculator.error) {
                    state.notationFeedback = 'Evaluation complete. Continue using calculator or finish mission sequence.';
                }

                if (applyMission && key === 'ENTER' && !nextCalculator.pendingOperator) {
                    if (state.concreteMission.manualCompleted) {
                        state.notationFeedback = state.concreteMission.demoWatched
                            ? 'Manual and demo checkpoints complete. Continue to Pictorial.'
                            : 'Manual checkpoint complete. Run guided demo to finish mission.';
                    } else {
                        state.notationFeedback = 'Not complete yet. Type keys in order: 6 . 0 2 2 EE 2 3.';
                    }
                }

                if (nextCalculator.error && btn && flash) {
                    flashKey(btn, 'error');
                }

                const persistLabel = key === 'C'
                    ? 'Calculator cleared'
                    : key === 'DEL'
                        ? 'Calculator backspace used'
                        : key === 'EE'
                            ? 'Calculator exponent accepted'
                            : key === '=' || key === 'ENTER'
                                ? 'Calculator equals evaluated'
                                : /^[0-9]$/.test(key)
                                    ? 'Calculator digit accepted'
                                    : key === '.'
                                        ? 'Calculator decimal accepted'
                                        : key === '+/-'
                                            ? 'Calculator sign toggled'
                                            : ['+', '-', '*', '/'].includes(key)
                                                ? 'Calculator operator selected'
                                                : 'Calculator updated';

                commit(persistLabel);
                return;
            };

            const runGuidedDemo = () => {
                if (state.concreteMission.demoRunning) return;
                if (!state.fastTrack && !state.concreteMission.manualCompleted) {
                    state.notationFeedback = `Complete manual practice first. ${missionProgressLabel()} and next key is ${missionExpectedToken()}.`;
                    syncAndPersistConcrete('Demo blocked until manual complete');
                    return;
                }

                state.concreteMission.demoRunning = true;
                state.concreteMission.demoVersion = Number(state.concreteMission.demoVersion || 0) + 1;
                state.concreteMission.error = '';
                state.notationFeedback = 'Guided demo running: 6.022EE23 keystrokes.';
                refreshConcreteUi();
                persist('Guided keypad demo started');

                const sequence = state.concreteMission.requiredSequence || [];
                const staged = [];
                let idx = 0;
                const myDemoVersion = state.concreteMission.demoVersion;

                const tick = () => {
                    if (myDemoVersion !== state.concreteMission.demoVersion) return;
                    host.querySelectorAll('.s6-key').forEach((keyEl) => keyEl.classList.remove('active'));
                    if (idx < sequence.length) {
                        const token = sequence[idx];
                        const keyTarget = host.querySelector(calcKeySelector[token]);
                        handleCalculatorKey(token, keyTarget, {
                            fromDemo: true,
                            applyMission: false,
                            persist: false,
                            flash: true
                        });
                        staged.push(token);
                        idx += 1;
                        setTimeout(tick, 260);
                        return;
                    }

                    state.concreteMission.demoRunning = false;
                    state.concreteMission.demoWatched = true;
                    syncConcreteMission();
                    if (!state.concreteCompleted) {
                        state.notationFeedback = 'Demo complete. Keep practicing manual typing until both mission checks are complete.';
                    }
                    refreshConcreteUi();
                    persist('Guided keypad demo complete');
                };

                tick();
            };

            calcKeys.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-calc-key');
                    handleCalculatorKey(key, btn);
                    calcPaneEl?.focus();
                });
            });

            calcPaneEl?.addEventListener('keydown', (event) => {
                const mapped = mapKeyboardEventToCalculatorKey(event);
                if (!mapped) return;
                event.preventDefault();
                const buttonSelector = calcKeySelector[mapped];
                const keyBtn = buttonSelector ? host.querySelector(buttonSelector) : null;
                handleCalculatorKey(mapped, keyBtn || undefined);
            });

            resetCalcBtn?.addEventListener('click', () => {
                resetConcretePractice();
                state.notationFeedback = 'Practice reset. Type 6.022E23 manually, then run the guided demo.';
                syncAndPersistConcrete('Calculator practice reset');
            });

            runKeypadBtn?.addEventListener('click', runGuidedDemo);

            refreshConcreteUi();

            // L6.1 Powers of 10 Answer Clicks
            host.querySelectorAll('[data-l61]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-l61');
                    const val = btn.getAttribute('data-value');
                    state.l61Answers[q] = val;
                    persist('Powers of 10 answer chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s6-check-l61')?.addEventListener('click', () => {
                const correct = state.l61Answers.q1 === '1000' &&
                                state.l61Answers.q2 === '0.01' &&
                                state.l61Answers.q3 === '0.001';
                state.l61Correct = correct;
                if (correct) {
                    state.l61Feedback = 'Correct! 10^3 = 1000, 10^-2 = 0.01, 10^-3 = 0.001.';
                } else {
                    state.l61Feedback = 'Incorrect. Recall that positive exponents mean multiplying 10s, negative exponents mean dividing (decimals).';
                }
                syncConcreteMission();
                persist('Powers of 10 checked');
                this.mount({ host, state, onStateChange });
            });

            // L6.2 Scientific Notation Answer Clicks
            host.querySelector('#s6-check-l62')?.addEventListener('click', () => {
                const val = host.querySelector('#s6-l62-value')?.value.trim();
                const pow = host.querySelector('#s6-l62-power')?.value.trim();
                state.l62Answers.value = val;
                state.l62Answers.power = pow;
                const correct = (val === '5.4' || val === '5.40') && pow === '3';
                state.l62Correct = correct;
                if (correct) {
                    state.l62Feedback = 'Correct! 5400 is 5.4 × 10^3.';
                } else {
                    state.l62Feedback = 'Incorrect. Shift the decimal point to get a number between 1 and 10 (5.4), and count the steps (3).';
                }
                syncConcreteMission();
                persist('Scientific notation checked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial Track Flip (L6.5)
            const flipFactorBtn = host.querySelector('#s6-flip-factor');
            flipFactorBtn?.addEventListener('click', () => {
                state.factorFlipped = !state.factorFlipped;
                renderTrack();
                persist('Track factor flipped');
                this.mount({ host, state, onStateChange });
            });

            const resetTrackBtn = host.querySelector('#s6-reset-track');
            resetTrackBtn?.addEventListener('click', () => {
                state.factorFlipped = false;
                renderTrack();
                persist('Track reset');
                this.mount({ host, state, onStateChange });
            });

            const checkTrackBtn = host.querySelector('#s6-check-track');
            checkTrackBtn?.addEventListener('click', () => {
                if (state.factorFlipped) {
                    state.trackFeedback = 'Not yet. Flip the factor back so mL cancels diagonally: 250 mL × (0.95 g / 100 mL).';
                } else {
                    state.trackFeedback = 'Correct! mL in numerator cancels mL in denominator diagonally, leaving grams as target unit. Result: 250 × 0.95 / 100 = 2.375 g.';
                }
                syncPictorialMission();
                persist('Track cancellation checked');
                this.mount({ host, state, onStateChange });
            });

            // L6.4 Metric Prefixes
            host.querySelectorAll('[data-l64]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-l64');
                    const val = btn.getAttribute('data-value');
                    state.l64Answers[q] = val;
                    persist('Prefix answer chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s6-check-l64')?.addEventListener('click', () => {
                const correct = state.l64Answers.micro === '10^-6' &&
                                state.l64Answers.milli === '10^-3' &&
                                state.l64Answers.kilo === '10^3';
                state.l64Correct = correct;
                if (correct) {
                    state.l64Feedback = 'Correct! micro- is 10^-6, milli- is 10^-3, kilo- is 10^3.';
                } else {
                    state.l64Feedback = 'Incorrect. Check your prefix definitions: micro (1 millionth), milli (1 thousandth), kilo (1 thousand).';
                }
                syncPictorialMission();
                persist('Metric prefixes checked');
                this.mount({ host, state, onStateChange });
            });

            // L6.6 Multi-Step Train Tracks
            function renderTrackL66() {
                const s1 = host.querySelector('#s6-l66-slot1');
                const s2 = host.querySelector('#s6-l66-slot2');
                if (!s1 || !s2) return;

                if (state.l66Factor1Flipped) {
                    s1.innerHTML = `
                        <div class="s6-frac">
                            <div>1000 <span class="s6-unit">mL</span></div>
                            <div class="s6-frac-line"></div>
                            <div>1 <span class="s6-unit">L</span></div>
                        </div>
                    `;
                } else {
                    s1.innerHTML = `
                        <div class="s6-frac">
                            <div>1 <span class="s6-unit kill">L</span></div>
                            <div class="s6-frac-line"></div>
                            <div>1000 <span class="s6-unit kill">mL</span></div>
                        </div>
                    `;
                }

                if (state.l66Factor2Flipped) {
                    s2.innerHTML = `
                        <div class="s6-frac">
                            <div>1 <span class="s6-unit">L</span></div>
                            <div class="s6-frac-line"></div>
                            <div>0.1 <span class="s6-unit">mol</span></div>
                        </div>
                    `;
                } else {
                    s2.innerHTML = `
                        <div class="s6-frac">
                            <div>0.1 <span class="s6-unit">mol</span></div>
                            <div class="s6-frac-line"></div>
                            <div>1 <span class="s6-unit kill">L</span></div>
                        </div>
                    `;
                }
            }

            host.querySelector('#s6-l66-flip-factor1')?.addEventListener('click', () => {
                state.l66Factor1Flipped = !state.l66Factor1Flipped;
                renderTrackL66();
                persist('L6.6 factor 1 flipped');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s6-l66-flip-factor2')?.addEventListener('click', () => {
                state.l66Factor2Flipped = !state.l66Factor2Flipped;
                renderTrackL66();
                persist('L6.6 factor 2 flipped');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s6-check-l66')?.addEventListener('click', () => {
                if (state.l66Factor1Flipped || state.l66Factor2Flipped) {
                    state.l66Feedback = 'Not yet. Both conversion factors must cancel units diagonally: mL with mL, and L with L.';
                    state.l66Correct = false;
                } else {
                    state.l66Feedback = 'Correct! 250 mL × (1 L / 1000 mL) × (0.1 mol / 1 L) cancels all intermediate units, leaving moles. Result = 0.025 mol NaCl.';
                    state.l66Correct = true;
                }
                syncPictorialMission();
                persist('Multi-step track checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s6-hint-concrete')?.addEventListener('click', () => {
                if (!state.l61Correct) {
                    state.notationFeedback = 'Hint: Match all Powers of 10 correctly first.';
                } else if (!state.l62Correct) {
                    state.notationFeedback = 'Hint: Convert 5400 to scientific notation correctly first.';
                } else if (!state.concreteMission.manualCompleted) {
                    state.notationFeedback = 'Hint: Type the exact key order 6 . 0 2 2 EE 2 3 manually first.';
                } else if (!state.concreteMission.demoWatched) {
                    state.notationFeedback = 'Hint: Manual checkpoint is done. Run Guided Demo to complete the second required checkpoint.';
                } else {
                    state.notationFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s6-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.notationFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.notationFeedback = 'Complete Concrete first: powers of 10, scientific notation, and calculator entry.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Cube & Compound Checkers
            const checkCubeBtn = host.querySelector('#s6-check-cube');
            checkCubeBtn?.addEventListener('click', () => {
                const val = host.querySelector('#s6-cube-input')?.value.trim() || '';
                state.cubedAnswer = val;
                if (val === '2000000' || val === '2,000,000' || val === '2.0e6') {
                    state.cubedFeedback = 'Correct! 2.0 m^3 = 2.0 x 1,000,000 = 2,000,000 cm^3.';
                } else {
                    state.cubedFeedback = 'Incorrect. Cubing 100 gives 1,000,000, so multiply 2.0 by 1,000,000.';
                }
                syncAbstractMission();
                persist('Cube checked');
                this.mount({ host, state, onStateChange });
            });

            const checkCompoundBtn = host.querySelector('#s6-check-compound');
            checkCompoundBtn?.addEventListener('click', () => {
                const value = host.querySelector('#s6-compound-value')?.value.trim() || '';
                const unit = host.querySelector('#s6-compound-unit')?.value.trim() || '';
                state.compoundAnswers = { value, unit };

                const numeric = Number(value);
                const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '');
                if (numeric === 150 && (normalizedUnit === 'j' || normalizedUnit === 'joule' || normalizedUnit === 'joules')) {
                    state.compoundFeedback = 'Correct. g and C cancel from J/(g*C), leaving J. Numeric result: 25 x 2 x 3 = 150 J.';
                } else {
                    state.compoundFeedback = 'Not yet. Multiply numbers (25 x 2 x 3 = 150). Cancel g and C, so the remaining unit is J.';
                }

                syncAbstractMission();
                persist('Compound units checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied Dose
            const appWrongBtn = host.querySelector('#s6-app-wrong');
            appWrongBtn?.addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. Multiplying 10.0 mL by density 1.2 g/mL cancels the mL unit, leaving grams.';
                const mastery = refresherApi?.recordAdaptiveAttempt?.({
                    stageId: 'stage6',
                    lessonId: 'L6.5',
                    competencyId: 'dim-analysis',
                    isCorrect: false,
                    source: 'fixed-applied'
                });
                if (mastery) {
                    state.adaptive.mastery = mastery;
                }
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            const appRightBtn = host.querySelector('#s6-app-right');
            appRightBtn?.addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! 10.0 mL × (1.2 g / mL) = 12.0 g mass delivered.';
                const mastery = refresherApi?.recordAdaptiveAttempt?.({
                    stageId: 'stage6',
                    lessonId: 'L6.5',
                    competencyId: 'dim-analysis',
                    isCorrect: true,
                    source: 'fixed-applied'
                });
                if (mastery) {
                    state.adaptive.mastery = mastery;
                }
                persist('Applied choice correct');
                this.mount({ host, state, onStateChange });
            });

            const generateAdaptiveBtn = host.querySelector('#s6-generate-adaptive');
            if (generateAdaptiveBtn) {
                generateAdaptiveBtn.addEventListener('click', async () => {
                    if (state.adaptive.loading) return;
                    state.adaptive.loading = true;
                    state.adaptive.error = '';
                    state.adaptive.grading = null;
                    persist('Generating adaptive challenge');
                    this.mount({ host, state, onStateChange });

                    const result = await refresherApi?.generateAdaptiveChallenge?.({
                        stageId: 'stage6',
                        lessonId: 'L6.5',
                        competencyId: 'dim-analysis',
                        difficulty: 'applied',
                        learnerSnapshot: refresherApi?.getAdaptiveSnapshot?.() || {}
                    });

                    state.adaptive.loading = false;
                    if (result?.item) {
                        state.adaptive.item = result.item;
                        state.adaptive.response = '';
                        state.adaptive.hintRevealCount = 0;
                        state.adaptive.error = result.ok ? '' : (result.errors?.join(' ') || 'Adaptive generation fallback was used.');
                    } else {
                        state.adaptive.error = 'Adaptive generation failed. Try again.';
                    }
                    persist('Adaptive challenge ready');
                    this.mount({ host, state, onStateChange });
                });
            }

            const revealHintBtn = host.querySelector('#s6-reveal-hint');
            if (revealHintBtn) {
                revealHintBtn.addEventListener('click', () => {
                    if (state.adaptive.loading) return;
                    const hintChain = Array.isArray(state.adaptive.item?.hint_chain) ? state.adaptive.item.hint_chain : [];
                    if (state.adaptive.hintRevealCount < hintChain.length) {
                        state.adaptive.hintRevealCount += 1;
                    }
                    persist('Adaptive hint revealed');
                    this.mount({ host, state, onStateChange });
                });
            }

            const submitAdaptiveBtn = host.querySelector('#s6-submit-adaptive');
            if (submitAdaptiveBtn) {
                submitAdaptiveBtn.addEventListener('click', async () => {
                    if (state.adaptive.loading) return;
                    const responseEl = host.querySelector('#s6-adaptive-response');
                    const learnerResponse = responseEl?.value.trim() || '';
                    state.adaptive.response = learnerResponse;

                    if (!learnerResponse || !state.adaptive.item) {
                        state.adaptive.error = 'Enter a response before submitting.';
                        persist('Adaptive response missing');
                        this.mount({ host, state, onStateChange });
                        return;
                    }

                    state.adaptive.loading = true;
                    state.adaptive.error = '';
                    persist('Grading adaptive response');
                    this.mount({ host, state, onStateChange });

                    const grading = await refresherApi?.gradeAdaptiveResponse?.({
                        prompt: state.adaptive.item.prompt,
                        answerKey: state.adaptive.item.answer_key,
                        rubric: state.adaptive.item.rubric,
                        learnerResponse,
                        regradeThreshold: refresherApi?.getAdaptiveSnapshot?.()?.grading?.lowConfidenceRegradeThreshold || 0.7
                    });

                    state.adaptive.loading = false;
                    state.adaptive.grading = grading?.result || null;

                    const mastery = refresherApi?.recordAdaptiveAttempt?.({
                        stageId: 'stage6',
                        lessonId: 'L6.5',
                        competencyId: 'dim-analysis',
                        isCorrect: Boolean(grading?.result?.isCorrect),
                        source: grading?.result?.regraded ? 'adaptive-llm-regraded' : 'adaptive-llm',
                        confidence: grading?.result?.confidence,
                        score: grading?.result?.score,
                        model: grading?.model
                    });
                    if (mastery) {
                        state.adaptive.mastery = mastery;
                    }

                    persist('Adaptive response graded');
                    this.mount({ host, state, onStateChange });
                });
            }

            // L6.9 Multidimensional Scaling (Cube Side Length)
            const handleCubeLength = (val) => {
                const num = parseInt(val);
                if (num >= 1 && num <= 10) {
                    state.cubeLengthDm = num;
                    persist('Cube length changed');
                    this.mount({ host, state, onStateChange });
                }
            };

            host.querySelector('#s6-cube-length-slider')?.addEventListener('input', (e) => handleCubeLength(e.target.value));
            host.querySelector('#s6-cube-length-num')?.addEventListener('change', (e) => handleCubeLength(e.target.value));

            host.querySelector('#s6-check-cubevol')?.addEventListener('click', () => {
                const ans = host.querySelector('#s6-cubevol-input').value.trim();
                state.cubeVolumeAnswer = ans;
                const expected = s6Cube ? String(s6Cube.answerKey) : '1000';
                if (ans === expected) {
                    state.cubeVolumeFeedback = `Correct! Since 1 m = 10 dm, a volume of a cube is (length)^3. Volume = ${expected} dm^3.`;
                } else {
                    state.cubeVolumeFeedback = `Incorrect. A cube of ${state.cubeLengthDm} dm on each side has a volume of ${state.cubeLengthDm} dm × ${state.cubeLengthDm} dm × ${state.cubeLengthDm} dm = ?`;
                }
                persist('Cube volume checked');
                this.mount({ host, state, onStateChange });
            });

            // L6.10 Compound Conversions
            host.querySelector('#s6-check-densityconv')?.addEventListener('click', () => {
                const ans = host.querySelector('#s6-densityconv-input').value.trim();
                state.densityConvAnswer = ans;
                const expected = String(s6Density.answerKey);
                if (ans === expected) {
                    state.densityConvFeedback = `Correct! ${s6Density.density} g/cm^3 = ${expected} kg/m^3.`;
                } else {
                    state.densityConvFeedback = `Incorrect. Multiply ${s6Density.density} by 1000 to convert g/cm^3 to kg/m^3.`;
                }
                persist('Density conversion checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const cubeInput = host.querySelector('#s6-cube-input');
            if (cubeInput) {
                cubeInput.addEventListener('input', (e) => {
                    state.cubedAnswer = e.target.value;
                    persist('Cube input changed');
                });
            }
            const compoundVal = host.querySelector('#s6-compound-value');
            if (compoundVal) {
                compoundVal.addEventListener('input', (e) => {
                    state.compoundAnswers.value = e.target.value;
                    persist('Compound value changed');
                });
            }
            const compoundUnit = host.querySelector('#s6-compound-unit');
            if (compoundUnit) {
                compoundUnit.addEventListener('input', (e) => {
                    state.compoundAnswers.unit = e.target.value;
                    persist('Compound unit changed');
                });
            }
            const adaptiveResponse = host.querySelector('#s6-adaptive-response');
            if (adaptiveResponse) {
                adaptiveResponse.addEventListener('input', (e) => {
                    state.adaptive.response = e.target.value;
                    persist('Adaptive response changed');
                });
            }
            const cubevolInput = host.querySelector('#s6-cubevol-input');
            if (cubevolInput) {
                cubevolInput.addEventListener('input', (e) => {
                    state.cubeVolumeAnswer = e.target.value;
                    persist('Cube volume input changed');
                });
            }
            const densityconvInput = host.querySelector('#s6-densityconv-input');
            if (densityconvInput) {
                densityconvInput.addEventListener('input', (e) => {
                    state.densityConvAnswer = e.target.value;
                    persist('Density conv input changed');
                });
            }
        },
        unmount() {}
    };
}
