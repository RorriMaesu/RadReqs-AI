const createInitialStage7State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Seesaw balance
    leftExpr: 'Density',
    rightExpr: 'mass / Volume',
    feedback: 'Multiply both sides by Volume to unbury it from the denominator.',
    basementFeedback: 'Volume is currently downstairs (in the denominator) as a divisor.',
    unburied: false,
    solved: false,
    concreteMission: { unburyVolume: false, isolateVolume: false },
    concreteCompleted: false,

    // SADMEP isolation
    sadmepStep: 0, // 0: add 7, 1: divide 4, 2: isolated
    sadmepFeedback: 'Solve 4x - 7 = 13. Click the operation to execute next under SADMEP.',

    // Literal rearrangement
    formulaTarget: 'T',
    formulaFeedback: 'Solve PV = nRT for T. Divide both sides by nR.',
    formulaCorrect: false,
    formulaDivide: '',

    // Denominator trap and radical cage
    denominatorAnswer: '',
    denominatorFeedback: 'L7.9 Denominator Trap: Solve 12/x = 3 by clearing the denominator first.',
    radicalAnswer: '',
    radicalFeedback: 'L7.10 Radical Cage: Solve sqrt(x + 5) = 9 by isolating the radical then squaring both sides.',

    adaptive: {
        loading: false,
        error: '',
        item: null,
        response: '',
        grading: null,
        mastery: null,
        hintRevealCount: 0
    },

    appliedFeedback: 'Applied level: calculate temperature T using rearranged ideal gas law: T = PV / nR.',
    appliedChoice: ''
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

            host.innerHTML = `
                <style>
                    .s7-wrap { display: grid; gap: 1.2rem; }
                    .s7-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s7-card h2, .s7-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s7-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s7-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s7-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
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
                        <h2>Concrete Level: Seesaw Balance & Denominators</h2>
                        <p><strong>L7.5 Equations:</strong> The equals sign is a seesaw pivot. To isolate Volume, we must multiply it out of the right denominator first.</p>
                        <div class="s7-seesaw">
                            <div class="s7-rail">
                                <div class="s7-side" id="s7-left-side">${state.leftExpr}</div>
                                <div class="s7-pivot">=</div>
                                <div class="s7-side" id="s7-right-side">
                                    ${state.unburied ? 'mass' : 'mass / <span class="s7-den">Volume</span>'}
                                </div>
                            </div>
                            <div class="s7-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button id="s7-unbury-btn" class="s7-btn" ${state.unburied ? 'disabled' : ''} ${disabled(state.concreteUnlocked)}>Multiply both sides by Volume</button>
                                <button id="s7-divide-density" class="s7-btn ghost" ${state.unburied && !state.solved ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Divide both sides by Density</button>
                                <button id="s7-reset-seesaw" class="s7-btn ghost" ${disabled(state.concreteUnlocked)}>Reset Seesaw</button>
                            </div>
                        </div>
                        <div class="s7-feedback" id="s7-seesaw-feedback">${state.feedback}</div>

                        <div class="s7-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s7-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s7-pill ${state.concreteMission.unburyVolume ? 'good' : 'locked'}">Multiply both sides by Volume</span>
                                <span class="s7-pill ${state.concreteMission.isolateVolume ? 'good' : 'locked'}">Divide both sides by Density</span>
                            </div>
                            <div class="s7-grid" style="gap:4px;">
                                <button id="s7-hint-concrete" class="s7-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s7-continue-pictorial" class="s7-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="Why is it illegal to divide by mass first when Volume is in the denominator? Explain the seesaw balance." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: SADMEP Isolation Priority Stack</h2>
                        <p><strong>[Required Unlock] L7.8 SADMEP:</strong> We undo operations in the reverse order of PEMDAS. Solve 4x - 7 = 13 by clicking operations sequentially.</p>
                        <div class="s7-pane">
                            <div style="font-family:monospace; font-size:1.3rem; text-align:center; margin-bottom:6px;">
                                ${state.sadmepStep === 0 ? '4x - 7 = 13' : ''}
                                ${state.sadmepStep === 1 ? '4x = 20' : ''}
                                ${state.sadmepStep === 2 ? 'x = 5' : ''}
                            </div>
                            <div class="s7-grid" style="gap:4px;">
                                <button class="s7-btn ghost s7-sadmep-btn" data-step="add" ${state.sadmepStep === 0 ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Add 7 to both sides (Undo Subtraction)</button>
                                <button class="s7-btn ghost s7-sadmep-btn" data-step="div" ${state.sadmepStep === 1 ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Divide both sides by 4 (Undo Multiplication)</button>
                                <button id="s7-reset-sadmep" class="s7-btn ghost" ${disabled(state.pictorialUnlocked)}>Reset SADMEP</button>
                            </div>
                        </div>
                        <div class="s7-feedback" id="s7-sadmep-feedback">${state.sadmepFeedback}</div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="Explain what SADMEP is and why we isolate variables in the opposite order of PEMDAS evaluations." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Rational, Radical, and Literal Isolation</h2>
                        <div class="s7-pane" style="margin-bottom:0.75rem;">
                            <p><strong>[Reinforcement] L7.9 Rational Isolation (Denominator Trap):</strong> Solve <code>12/x = 3</code>. Enter the value of <code>x</code>.</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s7-denominator-input" class="s7-input" placeholder="x" value="${state.denominatorAnswer}" ${disabled(state.abstractUnlocked)} />
                                <button id="s7-check-denominator" class="s7-btn" ${disabled(state.abstractUnlocked)}>Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-denominator-feedback">${state.denominatorFeedback}</div>
                        </div>

                        <div class="s7-pane" style="margin-bottom:0.75rem;">
                            <p><strong>[Reinforcement] L7.10 Radical Isolation (Radical Cage):</strong> Solve <code>sqrt(x + 5) = 9</code>. Enter <code>x</code>.</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s7-radical-input" class="s7-input" placeholder="x" value="${state.radicalAnswer}" ${disabled(state.abstractUnlocked)} />
                                <button id="s7-check-radical" class="s7-btn" ${disabled(state.abstractUnlocked)}>Check</button>
                            </div>
                            <div class="s7-feedback" id="s7-radical-feedback">${state.radicalFeedback}</div>
                        </div>

                        <p><strong>[Required Unlock] L7.11 Literal Equations:</strong> Rearrange the ideal gas formula PV = nRT to solve for Temperature T.</p>
                        <div class="s7-pane">
                            <p>Rearrange equation PV = nRT by dividing out the multipliers of T:</p>
                            <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                <select id="s7-formula-divide" class="s7-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="" ${state.formulaDivide === '' ? 'selected' : ''}>Divide both sides by...</option>
                                    <option value="nr" ${state.formulaDivide === 'nr' ? 'selected' : ''}>nR</option>
                                    <option value="pv" ${state.formulaDivide === 'pv' ? 'selected' : ''}>PV</option>
                                    <option value="r" ${state.formulaDivide === 'r' ? 'selected' : ''}>R only</option>
                                </select>
                                <button id="s7-check-formula" class="s7-btn" ${disabled(state.abstractUnlocked)}>Apply Division</button>
                            </div>
                        </div>
                        <div class="s7-feedback" id="s7-formula-feedback">${state.formulaFeedback}</div>

                        <div class="s7-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s7-btn ghost" title="Reinforcement" data-prompt="What is a literal equation and why do we solve formulas using only letter symbols without numbers?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s7-card s7-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Ideal Gas temperature</h2>
                        <p><strong>L7.11 Applied:</strong> ${state.adaptive.item?.prompt || 'In a reaction flask, P = 2.0 atm, V = 10.0 L, n = 0.5 mol, and R = 0.0821 L*atm/(mol*K). Rearranging PV = nRT gives T = PV / nR. What is the temperature of the gas?'}</p>
                        <div class="s7-grid">
                            <button id="s7-app-wrong" class="s7-btn ghost" ${disabled(state.appliedUnlocked)}>0.082 K</button>
                            <button id="s7-app-right" class="s7-btn" ${disabled(state.appliedUnlocked)}>487 K because T = (2.0 × 10.0) / (0.5 × 0.0821) = 20 / 0.04105 = 487 K</button>
                        </div>
                        <div class="s7-feedback">${state.appliedFeedback}</div>

                        <div class="s7-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Adaptive Pilot (Gemma4)</h3>
                            <p style="margin-top:0;">Generate a new challenge for L7.11, submit your reasoning/answer, and receive adaptive grading plus mastery progression.</p>
                            <div class="s7-grid" style="gap:4px;">
                                <button id="s7-generate-adaptive" class="s7-btn" ${disabled(state.appliedUnlocked)} ${state.adaptive.loading ? 'disabled' : ''}>${state.adaptive.loading ? 'Generating...' : 'Generate Adaptive Challenge'}</button>
                            </div>
                            <div class="s7-feedback" id="s7-adaptive-status">${state.adaptive.error || 'Ready for adaptive challenge generation.'}</div>
                            ${state.adaptive.item ? `
                                <div class="s7-pane" style="margin-top:0.6rem;">
                                    <p><strong>Challenge:</strong> ${state.adaptive.item.prompt}</p>
                                    <p><strong>Difficulty:</strong> ${state.adaptive.item.difficulty || 'unspecified'}</p>
                                    <p><strong>Tags:</strong> ${(state.adaptive.item.tags || []).join(', ') || 'none'}</p>
                                    <div class="s7-grid" style="grid-template-columns: 1fr auto;">
                                        <input id="s7-adaptive-response" class="s7-input" placeholder="Enter your response" value="${state.adaptive.response || ''}" ${disabled(state.appliedUnlocked)} />
                                        <button id="s7-submit-adaptive" class="s7-btn" ${disabled(state.appliedUnlocked)} ${state.adaptive.loading ? 'disabled' : ''}>Submit</button>
                                    </div>
                                    <div class="s7-grid" style="gap:4px; margin-top:0.5rem;">
                                        <button id="s7-reveal-hint" class="s7-btn ghost" ${disabled(state.appliedUnlocked)} ${state.adaptive.loading ? 'disabled' : ''}>Reveal Next Hint</button>
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
                    's7-check-formula': {
                        id: 's7-literal-equation',
                        level: 'abstract',
                        keys: 'formulaDivide',
                        prompt: 'Help me rearrange PV = nRT to solve for T without algebra mistakes.'
                    },
                    's7-app-right': {
                        id: 's7-ideal-gas-applied',
                        level: 'applied',
                        keys: 'appliedChoice',
                        prompt: 'Help me compute temperature using T = PV / nR in the ideal gas scenario.'
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
                if (state.concreteMission.unburyVolume && state.concreteMission.isolateVolume && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.feedback = 'Concrete mission complete. Volume is isolated correctly. Pictorial unlocked. Continue below.';
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
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered SADMEP isolations, literal formulas, and distribution. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
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
                if (!state.concreteMission.unburyVolume) {
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
                    state.feedback = 'Complete both Concrete mission steps first.';
                }
                persist('Continue to pictorial clicked');
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
                        state.sadmepFeedback = 'Isolated! x = 5. Abstract unlocked. Continue below.';
                        state.abstractUnlocked = true;
                    }
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

            // Abstract Literal
            host.querySelector('#s7-check-formula').addEventListener('click', () => {
                const val = host.querySelector('#s7-formula-divide').value;
                if (val === 'nr') {
                    state.formulaFeedback = 'Correct! Dividing by nR leaves T isolated: T = PV / nR. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true;
                } else if (val === 'r') {
                    state.formulaFeedback = 'Incorrect. Dividing by R leaves nT on the right, which is not fully isolated.';
                } else {
                    state.formulaFeedback = 'Incorrect. Dividing by PV moves items to the wrong side of the equals sign.';
                }
                persist('Formula checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s7-check-denominator').addEventListener('click', () => {
                const answer = host.querySelector('#s7-denominator-input').value.trim();
                state.denominatorAnswer = answer;
                if (Number(answer) === 4) {
                    state.denominatorFeedback = 'Correct. Multiply both sides by x: 12 = 3x, then divide by 3 to get x = 4.';
                } else {
                    state.denominatorFeedback = 'Not yet. Clear the denominator first: 12 = 3x, so x = 4.';
                }
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
                persist('Radical cage checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied gas calculations
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
                persist('Applied choice correct');
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
            const formulaDivide = host.querySelector('#s7-formula-divide');
            if (formulaDivide) {
                formulaDivide.addEventListener('change', (e) => {
                    state.formulaDivide = e.target.value;
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
