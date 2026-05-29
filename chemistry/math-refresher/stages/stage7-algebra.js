import {
    normalizeCalculatorCoreState // For imports if needed
} from '../calculator-core.js';

const createInitialStage7State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L7.1 Variables & Expressions
    l71Answer: '',
    l71Correct: false,
    l71Feedback: 'Translate "3 more than double x" into an algebraic expression.',

    // L7.2 Evaluating Expressions
    l72Answer: '',
    l72Correct: false,
    l72Feedback: 'Evaluate 3x - 5 when x = 4.',

    // L7.3 Combining Like Terms
    l73Answer: '',
    l73Correct: false,
    l73Feedback: 'Simplify 3x + 5y - x + 2y by combining like terms.',

    // L7.4 The Distributive Property
    l74Answer: '',
    l74Correct: false,
    l74Feedback: 'Expand 3(2x - 4) using the distributive property.',

    // L7.5 Seesaw balance
    leftExpr: 'Density',
    rightExpr: 'mass / Volume',
    feedback: 'Multiply both sides by Volume to unbury it from the denominator.',
    basementFeedback: 'Volume is currently downstairs (in the denominator) as a divisor.',
    unburied: false,
    solved: false,
    concreteMission: { unburyVolume: false, isolateVolume: false },
    concreteCompleted: false,

    // L7.6 One-Step Equations
    l76Answer: '',
    l76Correct: false,
    l76Feedback: 'Solve x + 5 = 12.',

    // L7.7 Multi-Step Linear Equations
    l77Answer: '',
    l77Correct: false,
    l77Feedback: 'Solve 2x + 3 = 11.',

    // L7.8 SADMEP isolation
    sadmepStep: 0, // 0: add 7, 1: divide 4, 2: isolated
    sadmepFeedback: 'Solve 4x - 7 = 13. Click the operation to execute next under SADMEP.',

    // L7.9 Denominator Trap
    denominatorAnswer: '',
    denominatorFeedback: 'L7.9 Denominator Trap: Solve 12/x = 3 by clearing the denominator first.',

    // L7.10 Radical Cage
    radicalAnswer: '',
    radicalFeedback: 'L7.10 Radical Cage: Solve sqrt(x + 5) = 9 by isolating the radical then squaring both sides.',

    // L7.11 Literal rearrangement & Applied
    formulaTarget: 'T',
    formulaFeedback: 'Solve PV = nRT for T. Divide both sides by nR.',
    formulaCorrect: false,
    formulaDivide: '',
    dragAnswer: '',
    dragFeedback: 'Enter the isolated formula.',
    dragCorrect: false,
    appliedFeedback: 'Applied level: calculate temperature T using rearranged ideal gas law: T = PV / nR.',
    appliedChoice: '',

    // L7.12 Combined Gas Law
    gasLawChoice: '',
    gasLawFeedback: 'L7.12: Rearrange P1*V1/T1 = P2*V2/T2 to solve for T2.',

    // L7.13 Calorimetry
    calorimetryStep: 0,
    calorimetryFeedback: 'L7.13: Solve q = mc(T_f - T_i) for T_f. Select the first algebraic move.',
    calorimetryAnswer: '',
    calorimetryCalcFeedback: 'Enter the final temperature.',
    calorimetryCalcCorrect: false,

    adaptive: {
        loading: false,
        error: '',
        item: null,
        response: '',
        grading: null,
        mastery: null,
        hintRevealCount: 0
    }
});

export function createStage7Algebra() {
    return {
        id: 'stage7',
        label: 'Algebraic Foundations',
        title: 'Stage 7: Algebraic Foundations & Linear Equations',
        getInitialState() {
            return createInitialStage7State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage7State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;

            const s7Drag = getParams('s7-drag', { equation: 'q = m * c * (Tf - Ti)', isolate: 'Tf - Ti', answerKey: 'q / (m * c)' });
            const s7Calorimetry = getParams('s7-calorimetry', { q: 836, m: 10.0, c: 4.184, ti: 20.0, answerKey: '40.0' });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's7-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';
            const refresherApi = window.ChemMathRefresher;

            const existingRow = refresherApi?.getAdaptiveLessonRow?.('stage7', 'L7.11');
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
                    case 'L7.1':
                        return true;
                    case 'L7.2':
                        return state.l71Correct;
                    case 'L7.3':
                        return state.l71Correct && state.l72Correct;
                    case 'L7.4':
                        return state.l71Correct && state.l72Correct && state.l73Correct;
                    case 'L7.5':
                        return state.l71Correct && state.l72Correct && state.l73Correct && state.l74Correct;
                    case 'L7.6':
                        return state.concreteCompleted || state.pictorialUnlocked;
                    case 'L7.7':
                        return (state.concreteCompleted || state.pictorialUnlocked) && state.l76Correct;
                    case 'L7.8':
                        return (state.concreteCompleted || state.pictorialUnlocked) && state.l76Correct && state.l77Correct;
                    case 'L7.9':
                        return state.abstractUnlocked;
                    case 'L7.10':
                        return state.abstractUnlocked && state.denominatorAnswer === '4';
                    case 'L7.11':
                        return state.abstractUnlocked && state.denominatorAnswer === '4' && state.radicalAnswer === '76';
                    case 'L7.11-applied':
                        return state.abstractUnlocked && state.denominatorAnswer === '4' && state.radicalAnswer === '76' && state.dragCorrect;
                    case 'L7.12':
                        return state.appliedUnlocked;
                    case 'L7.13':
                        return state.appliedUnlocked && state.gasLawChoice === 'correct';
                    default:
                        return false;
                }
            };

            const paneLockedClass = (lessonId) => isLessonUnlocked(lessonId) ? '' : 'locked';
            const statusPill = (lessonId) => isLessonUnlocked(lessonId)
                ? '<span class="s7-pill good" style="font-size:10px; padding:1px 6px; float:right;">Open</span>'
                : '<span class="s7-pill locked" style="font-size:10px; padding:1px 6px; float:right;">Locked</span>';

            host.innerHTML = `
                <style>
                    .s7-wrap { display: grid; gap: 1.2rem; }
                    .s7-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s7-card h2, .s7-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s7-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s7-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s7-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; transition: all 0.2s ease; }
                    .s7-pane.locked { opacity: 0.35; pointer-events: none; border-color: rgba(255, 255, 255, 0.03); }
                    .s7-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s7-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s7-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s7-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s7-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s7-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s7-btn:hover { background: #fbbf24; }
                    .s7-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s7-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s7-btn.active, .s7-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s7-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s7-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s7-level.s7-locked { opacity: 0.52; position: relative; }
                    .s7-level.s7-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s7-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Seesaw Balance */
                    .s7-seesaw { margin-top: 0.6rem; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 0.8rem; background: rgba(15, 23, 42, 0.5); }
                    .s7-rail { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0.5rem; align-items: center; }
                    .s7-side { min-height: 62px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; background: rgba(15, 23, 42, 0.3); display: grid; align-content: center; justify-items: center; padding: 0.5rem; }
                    .s7-pivot { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #f59e0b; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #f59e0b; }
                    .s7-den { display: inline-block; border: 1px solid #0ea5e9; border-radius: 6px; padding: 1px 4px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s7-wrap">
                    <article class="s7-card s7-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your variables unboxing and formula rearrangements.</p>
                        <div class="s7-grid">
                            <div class="s7-pane">
                                <strong>1. SADMEP Order</strong>
                                <p>To isolate x in 4x - 7 = 13, what is the first operation?</p>
                                <div class="s7-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q1 === 'add' ? 'active' : ''}" data-diag="q1" data-value="add">Add 7 to both sides (SADMEP Addition)</button>
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q1 === 'div' ? 'active' : ''}" data-diag="q1" data-value="div">Divide both sides by 4</button>
                                </div>
                            </div>
                            <div class="s7-pane">
                                <strong>2. Ideal Gas Rearrange</strong>
                                <p>Solve PV = nRT for T:</p>
                                <div class="s7-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q2 === 'correct' ? 'active' : ''}" data-diag="q2" data-value="correct">T = PV / nR</button>
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q2 === 'incorrect' ? 'active' : ''}" data-diag="q2" data-value="incorrect">T = PV - nR</button>
                                </div>
                            </div>
                            <div class="s7-pane">
                                <strong>3. Distributed Product</strong>
                                <p>If 2(x - 4) = 12, solve for x:</p>
                                <div class="s7-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q3 === '10' ? 'active' : ''}" data-diag="q3" data-value="10">10</button>
                                    <button class="s7-btn ghost ${state.diagnosticAnswers.q3 === '8' ? 'active' : ''}" data-diag="q3" data-value="8">8</button>
                                </div>
                            </div>
                        </div>
                        <div class="s7-grid" style="margin-top:0.75rem;">
                            <button id="s7-check-diagnostic" class="s7-btn">Check Diagnostic</button>
                        </div>
                        <div id="s7-diagnostic-feedback" class="s7-feedback">${state.diagnosticFeedback}</div>
                        <div class="s7-status">
                            <span class="s7-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s7-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s7-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s7-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s7-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Expressions & Equations</h2>
                        
                        <!-- L7.1 Variables & Expressions -->
                        <div class="s7-pane ${paneLockedClass('L7.1')}">
                            <strong>L7.1 Variables & Expressions</strong> ${statusPill('L7.1')}
                            <p>Translate the word statement into algebra: <em>"3 more than double x"</em></p>
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="s7-l71-input" class="s7-input" placeholder="e.g. 2x + 3" value="${state.l71Answer}" />
                                <button id="s7-check-l71" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l71-feedback">${state.l71Feedback}</div>
                        </div>

                        <!-- L7.2 Evaluating Expressions -->
                        <div class="s7-pane ${paneLockedClass('L7.2')}" style="margin-top:0.75rem;">
                            <strong>L7.2 Evaluating Expressions</strong> ${statusPill('L7.2')}
                            <p>Evaluate the algebraic expression <code>3x - 5</code> when <code>x = 4</code>.</p>
                            <div style="display:flex; gap:6px;">
                                <input type="number" id="s7-l72-input" class="s7-input" placeholder="Result" value="${state.l72Answer}" />
                                <button id="s7-check-l72" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l72-feedback">${state.l72Feedback}</div>
                        </div>

                        <!-- L7.3 Combining Like Terms -->
                        <div class="s7-pane ${paneLockedClass('L7.3')}" style="margin-top:0.75rem;">
                            <strong>L7.3 Combining Like Terms</strong> ${statusPill('L7.3')}
                            <p>Simplify the expression: <code>3x + 5y - x + 2y</code></p>
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="s7-l73-input" class="s7-input" placeholder="e.g. 2x + 7y" value="${state.l73Answer}" />
                                <button id="s7-check-l73" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l73-feedback">${state.l73Feedback}</div>
                        </div>

                        <!-- L7.4 The Distributive Property -->
                        <div class="s7-pane ${paneLockedClass('L7.4')}" style="margin-top:0.75rem;">
                            <strong>L7.4 The Distributive Property</strong> ${statusPill('L7.4')}
                            <p>Expand the product using the distributive property: <code>3(2x - 4)</code></p>
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="s7-l74-input" class="s7-input" placeholder="e.g. 6x - 12" value="${state.l74Answer}" />
                                <button id="s7-check-l74" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l74-feedback">${state.l74Feedback}</div>
                        </div>

                        <!-- L7.5 Seesaw Balance -->
                        <div class="s7-pane ${paneLockedClass('L7.5')}" style="margin-top: 0.75rem;">
                            <strong>L7.5 Equations & The Seesaw Balance Pivot:</strong> ${statusPill('L7.5')}
                            <p>To isolate Volume, we must multiply it out of the right denominator first.</p>
                            <div class="s7-seesaw">
                                <div class="s7-rail">
                                    <div class="s7-side" id="s7-left-side">${state.leftExpr}</div>
                                    <div class="s7-pivot">=</div>
                                    <div class="s7-side" id="s7-right-side">
                                        ${state.unburied ? 'mass' : 'mass / <span class="s7-den">Volume</span>'}
                                    </div>
                                </div>
                                <div class="s7-grid" style="margin-top:0.6rem; gap: 4px;">
                                    <button id="s7-unbury-btn" class="s7-btn" ${state.unburied ? 'disabled' : ''}>Multiply both sides by Volume</button>
                                    <button id="s7-divide-density" class="s7-btn ghost" ${state.unburied && !state.solved ? '' : 'disabled'}>Divide both sides by Density</button>
                                    <button id="s7-reset-seesaw" class="s7-btn ghost">Reset Seesaw</button>
                                </div>
                            </div>
                            <div class="s7-feedback" id="s7-seesaw-feedback">${state.feedback}</div>
                        </div>

                        <div class="s7-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s7-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s7-pill ${state.l71Correct ? 'good' : 'locked'}">Variables & Expressions</span>
                                <span class="s7-pill ${state.l72Correct ? 'good' : 'locked'}">Evaluating Expressions</span>
                                <span class="s7-pill ${state.l73Correct ? 'good' : 'locked'}">Combining Like Terms</span>
                                <span class="s7-pill ${state.l74Correct ? 'good' : 'locked'}">Distributive Property</span>
                                <span class="s7-pill ${state.concreteMission.unburyVolume ? 'good' : 'locked'}">Multiply Seesaw by Volume</span>
                                <span class="s7-pill ${state.concreteMission.isolateVolume ? 'good' : 'locked'}">Divide Seesaw by Density</span>
                            </div>
                            <div class="s7-grid" style="gap:4px;">
                                <button id="s7-hint-concrete" class="s7-btn ghost">Need a Hint? (Required)</button>
                                <button id="s7-continue-pictorial" class="s6-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="Why is it illegal to divide by mass first when Volume is in the denominator? Explain the seesaw balance." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Linear Solves & Reverse PEMDAS Priority</h2>
                        
                        <!-- L7.6 One-Step Equations -->
                        <div class="s7-pane ${paneLockedClass('L7.6')}">
                            <strong>L7.6 One-Step Equations</strong> ${statusPill('L7.6')}
                            <p>Solve for x: <code>x + 5 = 12</code></p>
                            <div style="display:flex; gap:6px;">
                                <input type="number" id="s7-l76-input" class="s7-input" placeholder="x" value="${state.l76Answer}" />
                                <button id="s7-check-l76" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l76-feedback">${state.l76Feedback}</div>
                        </div>

                        <!-- L7.7 Multi-Step Linear Equations -->
                        <div class="s7-pane ${paneLockedClass('L7.7')}" style="margin-top: 0.75rem;">
                            <strong>L7.7 Multi-Step Linear Equations</strong> ${statusPill('L7.7')}
                            <p>Solve for x: <code>2x + 3 = 11</code></p>
                            <div style="display:flex; gap:6px;">
                                <input type="number" id="s7-l77-input" class="s7-input" placeholder="x" value="${state.l77Answer}" />
                                <button id="s7-check-l77" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-l77-feedback">${state.l77Feedback}</div>
                        </div>

                        <!-- L7.8 SADMEP Isolation Stack -->
                        <div class="s7-pane ${paneLockedClass('L7.8')}" style="margin-top: 0.75rem;">
                            <strong>L7.8 Reverse PEMDAS Checklist (SADMEP):</strong> ${statusPill('L7.8')}
                            <p>We undo operations in the reverse order of PEMDAS. Solve <code>4x - 7 = 13</code> by clicking operations sequentially.</p>
                            <div style="font-family:monospace; font-size:1.3rem; text-align:center; margin-bottom:6px;">
                                ${state.sadmepStep === 0 ? '4x - 7 = 13' : ''}
                                ${state.sadmepStep === 1 ? '4x = 20' : ''}
                                ${state.sadmepStep === 2 ? 'x = 5' : ''}
                            </div>
                            <div class="s7-grid" style="gap:4px;">
                                <button class="s7-btn ghost s7-sadmep-btn" data-step="add" ${state.sadmepStep === 0 ? '' : 'disabled'}>Add 7 to both sides (Undo Subtraction)</button>
                                <button class="s7-btn ghost s7-sadmep-btn" data-step="div" ${state.sadmepStep === 1 ? '' : 'disabled'}>Divide both sides by 4 (Undo Multiplication)</button>
                                <button id="s7-reset-sadmep" class="s7-btn ghost">Reset SADMEP</button>
                            </div>
                            <div class="s7-feedback" id="s7-sadmep-feedback">${state.sadmepFeedback}</div>
                        </div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="Explain what SADMEP is and why we isolate variables in the opposite order of PEMDAS evaluations." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Rational, Radical, and Literal Equations</h2>
                        
                        <!-- L7.9 Denominator Trap -->
                        <div class="s7-pane ${paneLockedClass('L7.9')}" style="margin-bottom:0.75rem;">
                            <strong>L7.9 Rational Isolation (Denominator Trap):</strong> ${statusPill('L7.9')}
                            <p>Solve <code>12/x = 3</code>. Enter the value of <code>x</code>.</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s7-denominator-input" class="s7-input" placeholder="x" value="${state.denominatorAnswer}" />
                                <button id="s7-check-denominator" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-denominator-feedback">${state.denominatorFeedback}</div>
                        </div>

                        <!-- L7.10 Radical Cage -->
                        <div class="s7-pane ${paneLockedClass('L7.10')}" style="margin-bottom:0.75rem;">
                            <strong>L7.10 Radical Isolation (Radical Cage):</strong> ${statusPill('L7.10')}
                            <p>Solve <code>sqrt(x + 5) = 9</code>. Enter <code>x</code>.</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s7-radical-input" class="s7-input" placeholder="x" value="${state.radicalAnswer}" />
                                <button id="s7-check-radical" class="s7-btn">Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-radical-feedback">${state.radicalFeedback}</div>
                        </div>

                        <!-- L7.11 Literal Equations -->
                        <div class="s7-pane ${paneLockedClass('L7.11')}">
                            <strong>L7.11 Literal Equations:</strong> ${statusPill('L7.11')}
                            <p>Rearrange the equation: <strong>${s7Drag.equation}</strong> to isolate <strong>${s7Drag.isolate}</strong>.</p>
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="s7-drag-input" class="s7-input" placeholder="e.g. q / (m * c)" value="${state.dragAnswer || ''}" data-tutor-question-id="s7-drag" />
                                <button id="s7-check-drag" class="s7-btn" data-tutor-question-id="s7-drag">Verify Rearrangement</button>
                            </div>
                            <div class="s7-feedback" id="s7-drag-feedback">${state.dragFeedback}</div>
                        </div>

                        <!-- L7.11 Applied Ideal Gas Calculation -->
                        <div class="s7-pane ${paneLockedClass('L7.11-applied')}" style="margin-top:0.75rem;">
                            <strong>L7.11 Applied: Ideal Gas temperature</strong> ${statusPill('L7.11-applied')}
                            <p>${state.adaptive.item?.prompt || 'In a reaction flask, P = 2.0 atm, V = 10.0 L, n = 0.5 mol, and R = 0.0821 L*atm/(mol*K). Rearranging PV = nRT gives T = PV / nR. What is the temperature of the gas?'}</p>
                            <div class="s7-grid">
                                <button id="s7-app-wrong" class="s7-btn ghost">0.082 K</button>
                                <button id="s7-app-right" class="s7-btn">487 K because T = (2.0 × 10.0) / (0.5 × 0.0821) = 20 / 0.04105 = 487 K</button>
                            </div>
                            <div class="s7-feedback" id="s7-applied-feedback-text">${state.appliedFeedback}</div>
                        </div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="What is a literal equation and why do we solve formulas using only letter symbols without numbers?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Gas Laws & Calorimetry Isolation</h2>
                        
                        <!-- L7.12 Combined Gas Law Rearrangement -->
                        <div class="s7-pane ${paneLockedClass('L7.12')}" style="margin-bottom:0.75rem;">
                            <strong>L7.12 Combined Gas Law Denominator Isolation</strong> ${statusPill('L7.12')}
                            <p>In $\frac{P_1 V_1}{T_1} = \frac{P_2 V_2}{T_2}$, solve for the denominator variable $T_2$:</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr; gap:6px;">
                                <button id="s7-gas-correct" class="s7-btn ghost ${state.gasLawChoice === 'correct' ? 'active' : ''}">$T_2 = \frac{P_2 V_2 T_1}{P_1 V_1}$</button>
                                <button id="s7-gas-wrong1" class="s7-btn ghost ${state.gasLawChoice === 'wrong1' ? 'active' : ''}">$T_2 = \frac{P_1 V_1 T_1}{P_2 V_2}$</button>
                                <button id="s7-gas-wrong2" class="s7-btn ghost ${state.gasLawChoice === 'wrong2' ? 'active' : ''}">$T_2 = \frac{P_2 V_2}{P_1 V_1 T_1}$</button>
                            </div>
                            <div class="s7-feedback" id="s7-gas-feedback">${state.gasLawFeedback}</div>
                        </div>

                        <!-- L7.13 Calorimetry Temperature Isolation -->
                        <div class="s7-pane ${paneLockedClass('L7.13')}">
                            <strong>L7.13 Calorimetry Temperature Isolation</strong> ${statusPill('L7.13')}
                            <p>Solve the heat equation $q = mc(T_f - T_i)$ for final temperature $T_f$ step-by-step:</p>
                            <div style="font-family:monospace; font-size:1.2rem; text-align:center; margin-bottom:6px; background:#0f172a; padding:6px; border-radius:6px; color:#38bdf8;">
                                ${state.calorimetryStep === 0 ? 'q = mc(T_f - T_i)' : ''}
                                ${state.calorimetryStep === 1 ? 'q / (mc) = T_f - T_i' : ''}
                                ${state.calorimetryStep === 2 ? 'T_f = q / (mc) + T_i' : ''}
                            </div>
                            <div class="s7-grid" style="gap:4px; margin-bottom: 0.75rem;">
                                <button class="s7-btn ghost s7-calorimetry-btn" data-step="div_mc" ${state.calorimetryStep === 0 ? '' : 'disabled'}>Divide both sides by mc</button>
                                <button class="s7-btn ghost s7-calorimetry-btn" data-step="add_ti" ${state.calorimetryStep === 1 ? '' : 'disabled'}>Add T_i to both sides</button>
                                <button id="s7-reset-calorimetry" class="s7-btn ghost">Reset Isolation</button>
                            </div>
                            <div class="s7-feedback" id="s7-calorimetry-feedback" style="margin-bottom:0.75rem;">${state.calorimetryFeedback}</div>

                            <strong>L7.13 Final Temperature Calculator</strong>
                            <p>Using the isolated equation $T_f = \frac{q}{mc} + T_i$, calculate the final temperature $T_f$ (in °C):
                            <br>• Heat absorbed ($q$): <strong>${s7Calorimetry.q} J</strong>
                            <br>• Mass of water ($m$): <strong>${s7Calorimetry.m} g</strong>
                            <br>• Specific heat ($c$): <strong>${s7Calorimetry.c} J/(g·°C)</strong>
                            <br>• Initial temperature ($T_i$): <strong>${s7Calorimetry.ti}°C</strong></p>
                            <div style="display:flex; gap:6px;">
                                <input type="number" id="s7-calorimetry-input" class="s7-input" placeholder="T_f in °C" value="${state.calorimetryAnswer || ''}" data-tutor-question-id="s7-calorimetry" />
                                <button id="s7-check-calorimetry-calc" class="s7-btn" data-tutor-question-id="s7-calorimetry">Verify T_f</button>
                            </div>
                            <div class="s7-feedback" id="s7-calorimetry-calc-feedback">${state.calorimetryCalcFeedback}</div>
                        </div>

                        <!-- Adaptive Pilot -->
                        <div class="s7-pane ${paneLockedClass('L7.13')}" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Adaptive Pilot (Gemma4)</h3>
                            <p style="margin-top:0;">Generate a new challenge for literal rearrangements and calculations, submit your response, and get adaptive mastery tracking.</p>
                            <div class="s7-grid" style="gap:4px;">
                                <button id="s7-generate-adaptive" class="s7-btn" ${state.adaptive.loading ? 'disabled' : ''}>${state.adaptive.loading ? 'Generating...' : 'Generate Adaptive Challenge'}</button>
                            </div>
                            <div class="s7-feedback" id="s7-adaptive-status">${state.adaptive.error || 'Ready for adaptive challenge generation.'}</div>
                            ${state.adaptive.item ? `
                                <div class="s6-pane" style="margin-top:0.6rem;">
                                    <p><strong>Challenge:</strong> ${state.adaptive.item.prompt}</p>
                                    <p><strong>Difficulty:</strong> ${state.adaptive.item.difficulty || 'unspecified'}</p>
                                    <p><strong>Tags:</strong> ${(state.adaptive.item.tags || []).join(', ') || 'none'}</p>
                                    <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                        <input id="s7-adaptive-response" class="s7-input" placeholder="Enter your response" value="${state.adaptive.response || ''}" />
                                        <button id="s7-submit-adaptive" class="s7-btn" ${state.adaptive.loading ? 'disabled' : ''}>Submit</button>
                                    </div>
                                    <div class="s7-grid" style="gap:4px; margin-top:0.5rem;">
                                        <button id="s7-reveal-hint" class="s7-btn ghost" ${state.adaptive.loading ? 'disabled' : ''}>Reveal Next Hint</button>
                                    </div>
                                    <div class="s7-feedback">${visibleHints.length ? visibleHints.map((hint, idx) => `${idx + 1}. ${hint}`).join('<br>') : 'No hints revealed yet.'}</div>
                                </div>
                            ` : ''}
                            <div class="s7-feedback" id="s7-adaptive-feedback">${state.adaptive.grading?.feedback || 'No adaptive submission yet.'}${state.adaptive.grading?.regraded ? `<br><strong>Regrade:</strong> ${state.adaptive.grading.regradeReason}` : ''}</div>
                            <div class="s7-feedback" id="s7-adaptive-mastery">${state.adaptive.mastery ? `Mastery check: ${(state.adaptive.mastery.evaluation.accuracy * 100).toFixed(0)}% accuracy across ${state.adaptive.mastery.evaluation.attempts} attempts (${state.adaptive.mastery.evaluation.passed ? 'MASTERED' : 'IN PROGRESS'}).` : 'Mastery policy: 80%+ with minimum attempts and consistency window.'}</div>
                            <div class="s7-feedback" id="s7-adaptive-history">
                                <strong>Recent Trend:</strong> ${trendAccuracy}% over last ${trendWindow.length || 0} attempts.<br>
                                <strong>Last Attempts:</strong><br>
                                ${recentAttempts.length
                                    ? recentAttempts.map((entry, idx) => `${idx + 1}. ${entry.isCorrect ? 'OK' : 'X'} | src=${entry.source || 'n/a'} | conf=${typeof entry.confidence === 'number' ? entry.confidence.toFixed(2) : 'n/a'} | score=${typeof entry.score === 'number' ? entry.score.toFixed(2) : 'n/a'}`).join('<br>')
                                    : 'No attempt history yet.'}
                            </div>
                        </div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="Walk me through computing ideal gas Temperature using a rearranged literal equation (T = PV/nR)." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's7-check-diagnostic': {
                        id: 's7-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 7 diagnostic answers on SADMEP, literal rearrangement, and distribution.'
                    },
                    's7-check-l71': {
                        id: 's7-variables-expressions',
                        level: 'concrete',
                        keys: 'l71Answer',
                        prompt: 'Help me review my variables translation answer.'
                    },
                    's7-check-l72': {
                        id: 's7-evaluating-expressions',
                        level: 'concrete',
                        keys: 'l72Answer',
                        prompt: 'Help me review evaluating expressions when values are given.'
                    },
                    's7-check-l73': {
                        id: 's7-combining-like-terms',
                        level: 'concrete',
                        keys: 'l73Answer',
                        prompt: 'Help me simplify like terms without grouping mistakes.'
                    },
                    's7-check-l74': {
                        id: 's7-distributive-property',
                        level: 'concrete',
                        keys: 'l74Answer',
                        prompt: 'Help me expand equations using the distributive law.'
                    },
                    's7-unbury-btn': {
                        id: 's7-seesaw-unbury',
                        level: 'concrete',
                        keys: 'leftExpr,rightExpr,unburied,solved',
                        prompt: 'Help me unbury Volume from the denominator using equation-balance logic.'
                    },
                    's7-divide-density': {
                        id: 's7-seesaw-isolate',
                        level: 'concrete',
                        keys: 'leftExpr,rightExpr,unburied,solved',
                        prompt: 'Help me isolate Volume after unburying it from the denominator.'
                    },
                    's7-check-l76': {
                        id: 's7-onestep-equations',
                        level: 'pictorial',
                        keys: 'l76Answer',
                        prompt: 'Help me solve this one-step algebraic equation.'
                    },
                    's7-check-l77': {
                        id: 's7-multistep-equations',
                        level: 'pictorial',
                        keys: 'l77Answer',
                        prompt: 'Help me isolate variables in multi-step equations.'
                    },
                    's7-check-denominator': {
                        id: 's7-denominator-trap',
                        level: 'abstract',
                        keys: 'denominatorAnswer',
                        prompt: 'Help me solve 12/x = 3 by clearing the denominator correctly.'
                    },
                    's7-check-radical': {
                        id: 's7-radical-cage',
                        level: 'abstract',
                        keys: 'radicalAnswer',
                        prompt: 'Help me solve sqrt(x + 5) = 9 by isolating and squaring correctly.'
                    },
                    's7-check-drag': {
                        id: 's7-literal-equation',
                        level: 'abstract',
                        keys: 'dragAnswer',
                        prompt: 'Help me rearrange PV = nRT to solve for T without algebra mistakes.'
                    },
                    's7-app-right': {
                        id: 's7-ideal-gas-applied',
                        level: 'abstract',
                        keys: 'appliedChoice',
                        prompt: 'Help me compute temperature using T = PV / nR in the ideal gas scenario.'
                    },
                    's7-gas-correct': {
                        id: 's7-combined-gas-rearrange',
                        level: 'applied',
                        keys: 'gasLawChoice',
                        prompt: 'Help me solve combined gas law equation for denominator T2.'
                    },
                    's7-check-calorimetry-calc': {
                        id: 's7-calorimetry',
                        level: 'applied',
                        keys: 'calorimetryAnswer',
                        prompt: 'Help me calculate final temperature Tf using Isolated heat equation.'
                    },
                    's7-generate-adaptive': {
                        id: 's7-adaptive-generate',
                        level: 'applied',
                        keys: 'adaptive.item,adaptive.loading',
                        prompt: 'Help me interpret this adaptive algebra challenge before answering.'
                    },
                    's7-submit-adaptive': {
                        id: 's7-adaptive-submit',
                        level: 'applied',
                        keys: 'adaptive.response,adaptive.item,adaptive.hintRevealCount',
                        prompt: 'Help me craft and verify my adaptive challenge response.'
                    },
                    's7-reveal-hint': {
                        id: 's7-adaptive-hints',
                        level: 'applied',
                        keys: 'adaptive.hintRevealCount,adaptive.item',
                        prompt: 'Help me use the adaptive hints step-by-step without skipping reasoning.'
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
                const row = refresherApi?.getAdaptiveLessonRow?.('stage7', 'L7.11');
                if (!row) return;
                state.adaptive.mastery = {
                    row,
                    evaluation: refresherApi.evaluateLessonMastery(row)
                };
            };

            refreshAdaptiveMastery();

            const syncConcreteMission = () => {
                if (state.fastTrack) return;
                const complete = Boolean(
                    state.l71Correct && state.l72Correct && state.l73Correct && state.l74Correct &&
                    state.concreteMission.unburyVolume && state.concreteMission.isolateVolume
                );
                if (complete && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.feedback = 'Concrete mission complete. All algebra foundations and seesaw isolations are verified. Pictorial unlocked. Continue below.';
                }
            };

            const syncPictorialMission = () => {
                if (state.fastTrack) return;
                const complete = Boolean(
                    state.l76Correct && state.l77Correct && state.sadmepStep === 2
                );
                if (complete && !state.abstractUnlocked) {
                    state.abstractUnlocked = true;
                    state.sadmepFeedback = 'Pictorial mission complete. One-step, multi-step, and SADMEP priorities verified. Abstract unlocked. Continue below.';
                }
            };

            const syncAbstractMission = () => {
                if (state.fastTrack) return;
                const complete = Boolean(
                    state.denominatorAnswer === '4' && state.radicalAnswer === '76' && state.dragCorrect && state.appliedChoice === 'right'
                );
                if (complete && !state.appliedUnlocked) {
                    state.appliedUnlocked = true;
                    state.dragFeedback = 'Abstract mission complete. Denominator trap, radical cage, and ideal gas rearrangements verified. Applied unlocked. Continue below.';
                }
            };

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

            host.querySelector('#s7-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'add' &&
                                state.diagnosticAnswers.q2 === 'correct' &&
                                state.diagnosticAnswers.q3 === '10';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    
                    state.concreteCompleted = true;
                    state.l71Correct = true;
                    state.l72Correct = true;
                    state.l73Correct = true;
                    state.l74Correct = true;
                    state.concreteMission.unburyVolume = true;
                    state.concreteMission.isolateVolume = true;
                    
                    state.pictorialUnlocked = true;
                    state.l76Correct = true;
                    state.l77Correct = true;
                    state.sadmepStep = 2;
                    
                    state.abstractUnlocked = true;
                    state.denominatorAnswer = '4';
                    state.radicalAnswer = '76';
                    state.dragCorrect = true;
                    state.dragAnswer = s7Drag.answerKey;
                    state.appliedChoice = 'right';
                    
                    state.appliedUnlocked = true;
                    state.gasLawChoice = 'correct';
                    state.calorimetryStep = 2;
                    state.calorimetryAnswer = s7Calorimetry.answerKey;
                    state.calorimetryCalcCorrect = true;
                    
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered SADMEP isolations, literal formulas, and distribution. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete L7.1 Variables Match
            host.querySelector('#s7-check-l71')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l71-input').value.trim();
                state.l71Answer = val;
                const norm = (f) => String(f).replace(/[\s\*]+/g, '').toLowerCase();
                if (norm(val) === '2x+3' || norm(val) === '3+2x') {
                    state.l71Correct = true;
                    state.l71Feedback = 'Correct! "double x" is 2x, and "3 more than" adds 3.';
                } else {
                    state.l71Correct = false;
                    state.l71Feedback = 'Incorrect. Double x is 2x, and 3 more than that is 2x + 3.';
                }
                syncConcreteMission();
                persist('L7.1 checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete L7.2 Evaluating Expressions
            host.querySelector('#s7-check-l72')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l72-input').value.trim();
                state.l72Answer = val;
                if (Number(val) === 7) {
                    state.l72Correct = true;
                    state.l72Feedback = 'Correct! 3(4) - 5 = 12 - 5 = 7.';
                } else {
                    state.l72Correct = false;
                    state.l72Feedback = 'Incorrect. Substitute x = 4 into 3x - 5.';
                }
                syncConcreteMission();
                persist('L7.2 checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete L7.3 Combining Like Terms
            host.querySelector('#s7-check-l73')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l73-input').value.trim();
                state.l73Answer = val;
                const norm = (f) => String(f).replace(/[\s\*]+/g, '').toLowerCase();
                if (norm(val) === '2x+7y' || norm(val) === '7y+2x') {
                    state.l73Correct = true;
                    state.l73Feedback = 'Correct! (3x - x) + (5y + 2y) = 2x + 7y.';
                } else {
                    state.l73Correct = false;
                    state.l73Feedback = 'Incorrect. Group terms with x and terms with y separately.';
                }
                syncConcreteMission();
                persist('L7.3 checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete L7.4 Distributive Property
            host.querySelector('#s7-check-l74')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l74-input').value.trim();
                state.l74Answer = val;
                const norm = (f) => String(f).replace(/[\s\*]+/g, '').toLowerCase();
                if (norm(val) === '6x-12') {
                    state.l74Correct = true;
                    state.l74Feedback = 'Correct! Multiply 3 by 2x and 3 by -4 to get 6x - 12.';
                } else {
                    state.l74Correct = false;
                    state.l74Feedback = 'Incorrect. Distribute the 3 to both terms inside the parentheses.';
                }
                syncConcreteMission();
                persist('L7.4 checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Seesaw
            host.querySelector('#s7-unbury-btn').addEventListener('click', () => {
                state.leftExpr = 'Density × Volume';
                state.unburied = true;
                state.concreteMission.unburyVolume = true;
                state.feedback = 'Volume unburied! Now Density × Volume = mass. Divide both sides by Density to isolate Volume.';
                syncConcreteMission();
                persist('Seesaw unburied');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-divide-density').addEventListener('click', () => {
                if (state.unburied) {
                    state.leftExpr = 'Volume';
                    state.rightExpr = 'mass / Density';
                    state.solved = true;
                    state.concreteMission.isolateVolume = true;
                    state.feedback = 'Volume isolated! Volume = mass / Density.';
                    syncConcreteMission();
                    persist('Seesaw solved');
                    this.mount({ host, state, onStateChange });
                }
            });

            host.querySelector('#s7-reset-seesaw').addEventListener('click', () => {
                state.leftExpr = 'Density';
                state.rightExpr = 'mass / Volume';
                state.unburied = false;
                state.solved = false;
                if (!state.concreteCompleted) {
                    state.concreteMission.unburyVolume = false;
                    state.concreteMission.isolateVolume = false;
                }
                state.feedback = 'Multiply both sides by Volume to unbury it.';
                persist('Seesaw reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-hint-concrete')?.addEventListener('click', () => {
                if (!state.l71Correct) {
                    state.feedback = 'Hint: Work on L7.1 first. Translate the word statement into algebraic notation.';
                } else if (!state.l72Correct) {
                    state.feedback = 'Hint: Work on L7.2 next. Substitute the value of x and calculate.';
                } else if (!state.l73Correct) {
                    state.feedback = 'Hint: Work on L7.3 next. Add/subtract terms of same variables.';
                } else if (!state.l74Correct) {
                    state.feedback = 'Hint: Work on L7.4 next. Expand product expression.';
                } else if (!state.concreteMission.unburyVolume) {
                    state.feedback = 'Hint: Start by multiplying both sides by Volume to clear the denominator.';
                } else if (!state.concreteMission.isolateVolume) {
                    state.feedback = 'Hint: Next divide both sides by Density so only Volume remains on the left.';
                } else {
                    state.feedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.feedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.feedback = 'Complete all Concrete lessons and seesaw isolation steps first.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial L7.6 One-Step
            host.querySelector('#s7-check-l76')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l76-input').value.trim();
                state.l76Answer = val;
                if (Number(val) === 7) {
                    state.l76Correct = true;
                    state.l76Feedback = 'Correct! Subtract 5 from both sides: x = 12 - 5 = 7.';
                } else {
                    state.l76Correct = false;
                    state.l76Feedback = 'Incorrect. Subtract 5 from both sides of x + 5 = 12.';
                }
                syncPictorialMission();
                persist('L7.6 checked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial L7.7 Multi-Step
            host.querySelector('#s7-check-l77')?.addEventListener('click', () => {
                const val = host.querySelector('#s7-l77-input').value.trim();
                state.l77Answer = val;
                if (Number(val) === 4) {
                    state.l77Correct = true;
                    state.l77Feedback = 'Correct! Subtract 3 first: 2x = 8. Then divide by 2: x = 4.';
                } else {
                    state.l77Correct = false;
                    state.l77Feedback = 'Incorrect. Subtract 3 first, then divide by 2.';
                }
                syncPictorialMission();
                persist('L7.7 checked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial SADMEP
            host.querySelectorAll('.s7-sadmep-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const step = btn.getAttribute('data-step');
                    if (step === 'add' && state.sadmepStep === 0) {
                        state.sadmepStep = 1;
                        state.sadmepFeedback = 'Good! Addition undone. 4x = 20. Now divide by 4.';
                    } else if (step === 'div' && state.sadmepStep === 1) {
                        state.sadmepStep = 2;
                        state.sadmepFeedback = 'Isolated! x = 5.';
                    }
                    syncPictorialMission();
                    persist('SADMEP step run');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s7-reset-sadmep').addEventListener('click', () => {
                state.sadmepStep = 0;
                state.sadmepFeedback = 'Solve 4x - 7 = 13. Click the operation to execute next.';
                persist('SADMEP reset');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Literal (s7-drag)
            host.querySelector('#s7-check-drag')?.addEventListener('click', () => {
                const ans = host.querySelector('#s7-drag-input').value.trim();
                state.dragAnswer = ans;
                const normalizeFormula = (f) => String(f).replace(/\s+/g, '').toLowerCase();
                const expected = normalizeFormula(s7Drag.answerKey);
                if (normalizeFormula(ans) === expected) {
                    state.dragCorrect = true;
                    state.dragFeedback = `Correct! ${s7Drag.isolate} = ${s7Drag.answerKey}.`;
                } else {
                    state.dragCorrect = false;
                    state.dragFeedback = `Incorrect. Rearrange ${s7Drag.equation} to isolate ${s7Drag.isolate}.`;
                }
                syncAbstractMission();
                persist('Formula isolation checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Denominator Trap & Radical Cage
            host.querySelector('#s7-check-denominator').addEventListener('click', () => {
                const answer = host.querySelector('#s7-denominator-input').value.trim();
                state.denominatorAnswer = answer;
                if (Number(answer) === 4) {
                    state.denominatorFeedback = 'Correct. Multiply both sides by x: 12 = 3x, then divide by 3 to get x = 4.';
                } else {
                    state.denominatorFeedback = 'Not yet. Clear the denominator first: 12 = 3x, so x = 4.';
                }
                syncAbstractMission();
                persist('Denominator trap checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-check-radical').addEventListener('click', () => {
                const answer = host.querySelector('#s7-radical-input').value.trim();
                state.radicalAnswer = answer;
                if (Number(answer) === 76) {
                    state.radicalFeedback = 'Correct. Square both sides: x + 5 = 81, so x = 76.';
                } else {
                    state.radicalFeedback = 'Not yet. Isolate sqrt(x + 5), square both sides to get x + 5 = 81, then solve x = 76.';
                }
                syncAbstractMission();
                persist('Radical cage checked');
                this.mount({ host, state, onStateChange });
            });

            // L7.11 Applied gas calculations
            host.querySelector('#s7-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. Double check your calculation: T = (2.0 × 10.0) / (0.5 × 0.0821) = 20 / 0.04105 = 487 K.';
                const mastery = refresherApi?.recordAdaptiveAttempt?.({
                    stageId: 'stage7',
                    lessonId: 'L7.11',
                    competencyId: 'stoich-setup',
                    isCorrect: false,
                    source: 'fixed-applied'
                });
                if (mastery) {
                    state.adaptive.mastery = mastery;
                }
                syncAbstractMission();
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! The calculated gas temperature is 487 K.';
                const mastery = refresherApi?.recordAdaptiveAttempt?.({
                    stageId: 'stage7',
                    lessonId: 'L7.11',
                    competencyId: 'stoich-setup',
                    isCorrect: true,
                    source: 'fixed-applied'
                });
                if (mastery) {
                    state.adaptive.mastery = mastery;
                }
                syncAbstractMission();
                persist('Applied choice correct');
                this.mount({ host, state, onStateChange });
            });

            // L7.12 Gas Law click handlers
            host.querySelector('#s7-gas-correct')?.addEventListener('click', () => {
                state.gasLawChoice = 'correct';
                state.gasLawFeedback = 'Correct! Multiplying by T_2 gives T_2 × (P_1 V_1 / T_1) = P_2 V_2. Then multiplying by T_1 and dividing by P_1 V_1 yields T_2 = P_2 V_2 T_1 / (P_1 V_1). Denominators must be cleared first!';
                persist('Gas law correct');
                this.mount({ host, state, onStateChange });
            });
            host.querySelector('#s7-gas-wrong1')?.addEventListener('click', () => {
                state.gasLawChoice = 'wrong1';
                state.gasLawFeedback = 'Incorrect. If you cross-multiply, you get P_1 V_1 T_2 = P_2 V_2 T_1. Dividing by P_1 V_1 isolates T_2 correctly, which is P_2 V_2 T_1 / (P_1 V_1).';
                persist('Gas law wrong1');
                this.mount({ host, state, onStateChange });
            });
            host.querySelector('#s7-gas-wrong2')?.addEventListener('click', () => {
                state.gasLawChoice = 'wrong2';
                state.gasLawFeedback = 'Incorrect. Check your algebraic steps. Cross-multiplying yields P_1 V_1 T_2 = P_2 V_2 T_1.';
                persist('Gas law wrong2');
                this.mount({ host, state, onStateChange });
            });

            // L7.13 Calorimetry handlers
            host.querySelectorAll('.s7-calorimetry-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const step = btn.getAttribute('data-step');
                    if (step === 'div_mc' && state.calorimetryStep === 0) {
                        state.calorimetryStep = 1;
                        state.calorimetryFeedback = 'Correct! Dividing by mc isolates the temperature block: q / (mc) = T_f - T_i. Now isolate T_f.';
                    } else if (step === 'add_ti' && state.calorimetryStep === 1) {
                        state.calorimetryStep = 2;
                        state.calorimetryFeedback = 'Correct! Adding T_i to both sides isolates T_f: T_f = q / (mc) + T_i. You successfully isolated the final temperature!';
                    } else {
                        state.calorimetryFeedback = 'Incorrect move. Think about the order of operations in reverse (SADMEP) to unwrap T_f.';
                    }
                    persist('Calorimetry step run');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s7-reset-calorimetry')?.addEventListener('click', () => {
                state.calorimetryStep = 0;
                state.calorimetryFeedback = 'Solve q = mc(T_f - T_i) for T_f. Select the first algebraic move.';
                persist('Calorimetry reset');
                this.mount({ host, state, onStateChange });
            });

            // s7-calorimetry validation
            host.querySelector('#s7-check-calorimetry-calc')?.addEventListener('click', () => {
                const ansVal = parseFloat(host.querySelector('#s7-calorimetry-input').value.trim());
                state.calorimetryAnswer = host.querySelector('#s7-calorimetry-input').value.trim();
                const expected = parseFloat(s7Calorimetry.answerKey);
                if (Math.abs(ansVal - expected) < 0.1) {
                    state.calorimetryCalcCorrect = true;
                    state.calorimetryCalcFeedback = `Correct! T_f = q / (m * c) + T_i = ${s7Calorimetry.q} / (${s7Calorimetry.m} * ${s7Calorimetry.c}) + ${s7Calorimetry.ti} = ${expected}°C.`;
                } else {
                    state.calorimetryCalcCorrect = false;
                    state.calorimetryCalcFeedback = `Incorrect. The formula is T_f = q / (m * c) + T_i. Check your calculations.`;
                }
                persist('Calorimetry calculation checked');
                this.mount({ host, state, onStateChange });
            });

            const generateAdaptiveBtn = host.querySelector('#s7-generate-adaptive');
            if (generateAdaptiveBtn) {
                generateAdaptiveBtn.addEventListener('click', async () => {
                    state.adaptive.loading = true;
                    state.adaptive.error = '';
                    state.adaptive.grading = null;
                    persist('Generating adaptive challenge');
                    this.mount({ host, state, onStateChange });

                    const result = await refresherApi?.generateAdaptiveChallenge?.({
                        stageId: 'stage7',
                        lessonId: 'L7.11',
                        competencyId: 'stoich-setup',
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

            const revealHintBtn = host.querySelector('#s7-reveal-hint');
            if (revealHintBtn) {
                revealHintBtn.addEventListener('click', () => {
                    const hintChain = Array.isArray(state.adaptive.item?.hint_chain) ? state.adaptive.item.hint_chain : [];
                    if (state.adaptive.hintRevealCount < hintChain.length) {
                        state.adaptive.hintRevealCount += 1;
                    }
                    persist('Adaptive hint revealed');
                    this.mount({ host, state, onStateChange });
                });
            }

            const submitAdaptiveBtn = host.querySelector('#s7-submit-adaptive');
            if (submitAdaptiveBtn) {
                submitAdaptiveBtn.addEventListener('click', async () => {
                    const responseEl = host.querySelector('#s7-adaptive-response');
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
                        stageId: 'stage7',
                        lessonId: 'L7.11',
                        competencyId: 'stoich-setup',
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

            // Input sync listeners to preserve values across re-renders
            const l71Input = host.querySelector('#s7-l71-input');
            if (l71Input) {
                l71Input.addEventListener('input', (e) => {
                    state.l71Answer = e.target.value;
                });
            }
            const l72Input = host.querySelector('#s7-l72-input');
            if (l72Input) {
                l72Input.addEventListener('input', (e) => {
                    state.l72Answer = e.target.value;
                });
            }
            const l73Input = host.querySelector('#s7-l73-input');
            if (l73Input) {
                l73Input.addEventListener('input', (e) => {
                    state.l73Answer = e.target.value;
                });
            }
            const l74Input = host.querySelector('#s7-l74-input');
            if (l74Input) {
                l74Input.addEventListener('input', (e) => {
                    state.l74Answer = e.target.value;
                });
            }
            const l76Input = host.querySelector('#s7-l76-input');
            if (l76Input) {
                l76Input.addEventListener('input', (e) => {
                    state.l76Answer = e.target.value;
                });
            }
            const l77Input = host.querySelector('#s7-l77-input');
            if (l77Input) {
                l77Input.addEventListener('input', (e) => {
                    state.l77Answer = e.target.value;
                });
            }
            const dragInput = host.querySelector('#s7-drag-input');
            if (dragInput) {
                dragInput.addEventListener('input', (e) => {
                    state.dragAnswer = e.target.value;
                });
            }
            const denominatorInput = host.querySelector('#s7-denominator-input');
            if (denominatorInput) {
                denominatorInput.addEventListener('input', (e) => {
                    state.denominatorAnswer = e.target.value;
                });
            }
            const radicalInput = host.querySelector('#s7-radical-input');
            if (radicalInput) {
                radicalInput.addEventListener('input', (e) => {
                    state.radicalAnswer = e.target.value;
                });
            }
            const calorimetryInput = host.querySelector('#s7-calorimetry-input');
            if (calorimetryInput) {
                calorimetryInput.addEventListener('input', (e) => {
                    state.calorimetryAnswer = e.target.value;
                });
            }
            const adaptiveResponse = host.querySelector('#s7-adaptive-response');
            if (adaptiveResponse) {
                adaptiveResponse.addEventListener('input', (e) => {
                    state.adaptive.response = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
