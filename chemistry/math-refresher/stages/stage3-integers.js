const createInitialStage3State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Signed net charge
    charge: 0,
    signedFeedback: 'Add protons (+1) or electrons (-1) to move the net charge on the number line. Subtracting a negative removes leftward pull.',
    concreteMission: {
        reachPlus2: false,
        usedSubtractNegative: false,
        returnZero: false
    },
    concreteCompleted: false,

    // Quotient zeros & remainders (L3.1)
    quotientAnswer: '',
    quotientFeedback: 'L3.1 Quotient Zeros: Solve 412 / 4. Watch for the zero in the tens place.',
    quotientCorrect: false,

    // PEMDAS stack
    pemdasStep: 0, // 0: initial, 1: after division, 2: after mult, 3: completed
    pemdasAnswer: '',
    pemdasFeedback: 'Evaluate: 12 / 3 x 2 - 4. Click the button representing the correct next operation.',

    // Factors & multiples (L3.6)
    lcmAnswer: '',
    lcmFeedback: 'L3.6 Least Common Multiple: Find the LCM of 4 and 6.',
    lcmCorrect: false,

    // Prime factors tree
    primeAnswers: { f1: '', f2: '', f3: '' },
    primeFeedback: 'Find the prime factors of 18. Enter three values that multiply to 18 and are all prime.',

    // Descriptive statistics
    statsAnswers: { mean: '', median: '', mode: '', range: '' },
    statsFeedback: 'L3.8 Statistics: For data [8, 10, 10, 12, 15], compute mean, median, mode, and range.',

    appliedFeedback: 'Applied level: calculate the Net Charge of a Carbon atom with 6 protons and 8 electrons.',
    appliedChoice: ''
});

export function createStage3Integers() {
    return {
        id: 'stage3',
        label: 'Integers & GEMS',
        title: 'Stage 3: Division Technicalities, Integers & Number Properties',
        getInitialState() {
            return createInitialStage3State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage3State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's3-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s3-wrap { display: grid; gap: 1.2rem; }
                    .s3-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s3-card h2, .s3-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s3-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s3-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s3-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s3-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s3-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s3-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s3-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s3-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s3-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s3-btn:hover { background: #fbbf24; }
                    .s3-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s3-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s3-btn.active, .s3-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s3-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s3-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s3-level.s3-locked { opacity: 0.52; position: relative; }
                    .s3-level.s3-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s3-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    .s3-canvas { width: 100%; max-width: 760px; height: 120px; display: block; background: rgba(15, 23, 42, 0.8); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); }
                    .s3-gems-expr { font-family: monospace; font-size: 1.4rem; font-weight: 800; padding: 0.5rem; background: #0f172a; color: #38bdf8; text-align: center; border-radius: 8px; margin: 0.6rem 0; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s3-wrap">
                    <article class="s3-card s3-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Resolve priorities, prime trees, and negative signs to see if you can fast-track.</p>
                        <div class="s3-grid">
                            <div class="s3-pane">
                                <strong>1. Signed Subtraction</strong>
                                <p>Evaluate: -5 - (-8) = ?</p>
                                <div class="s3-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                    <button class="s3-btn ${state.diagnosticAnswers.q1 === '3' ? 'active' : 'ghost'}" data-diag="q1" data-value="3">3</button>
                                    <button class="s3-btn ${state.diagnosticAnswers.q1 === '-13' ? 'active' : 'ghost'}" data-diag="q1" data-value="-13">-13</button>
                                    <button class="s3-btn ${state.diagnosticAnswers.q1 === '-3' ? 'active' : 'ghost'}" data-diag="q1" data-value="-3">-3</button>
                                </div>
                            </div>
                            <div class="s3-pane">
                                <strong>2. PEMDAS Equal Priority</strong>
                                <p>Evaluate: 18 / 6 x 3 = ?</p>
                                <div class="s3-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s3-btn ${state.diagnosticAnswers.q2 === '9' ? 'active' : 'ghost'}" data-diag="q2" data-value="9">9</button>
                                    <button class="s3-btn ${state.diagnosticAnswers.q2 === '1' ? 'active' : 'ghost'}" data-diag="q2" data-value="1">1 (multiplying first)</button>
                                </div>
                            </div>
                            <div class="s3-pane">
                                <strong>3. Prime Atoms</strong>
                                <p>What is the prime decomposition of 18?</p>
                                <div class="s3-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s3-btn ${state.diagnosticAnswers.q3 === 'correct' ? 'active' : 'ghost'}" data-diag="q3" data-value="correct">2 x 3 x 3</button>
                                    <button class="s3-btn ${state.diagnosticAnswers.q3 === 'incorrect' ? 'active' : 'ghost'}" data-diag="q3" data-value="incorrect">2 x 9 (9 is composite)</button>
                                </div>
                            </div>
                        </div>
                        <div class="s3-grid" style="margin-top:0.75rem;">
                            <button id="s3-check-diagnostic" class="s3-btn" data-tutor-question-id="s3-diagnostic" data-tutor-level="diagnostic" data-tutor-answer-keys="diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3" data-tutor-question="Help me review my Stage 3 diagnostic answers for signed subtraction, PEMDAS order, and prime decomposition.">Check Diagnostic</button>
                        </div>
                        <div id="s3-diagnostic-feedback" class="s3-feedback">${state.diagnosticFeedback}</div>
                        <div class="s3-status">
                            <span class="s3-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s3-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s3-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s3-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s3-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s3-card s3-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Signed Vectors & Absolute Value</h2>
                        <p><strong>L3.2 Signed Directions:</strong> Protons add +1 (right), electrons add -1 (left). Subtracting a negative removes leftward vectors, shifting the net charge right.</p>
                        <div class="s3-pane" style="margin-bottom:0.75rem;">
                            <h3 style="margin-bottom:0.4rem;">Concrete Mission</h3>
                            <p style="margin:0.25rem 0;"><strong>Goal:</strong> complete all steps to unlock Pictorial.</p>
                            <ul style="margin:0.35rem 0 0; padding-left:1.1rem; color:#cbd5e1; line-height:1.5;">
                                <li>${state.concreteMission.reachPlus2 ? '[x]' : '[ ]'} Reach net charge +2.</li>
                                <li>${state.concreteMission.usedSubtractNegative ? '[x]' : '[ ]'} Use "Subtract Negative (-(-1))" at least once.</li>
                                <li>${state.concreteMission.returnZero ? '[x]' : '[ ]'} Return the net charge to 0.</li>
                            </ul>
                            <div class="s3-grid" style="margin-top:0.55rem; gap:4px;">
                                <button id="s3-hint-signed" class="s3-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s3-continue-pictorial" class="s3-btn" ${state.pictorialUnlocked ? '' : 'disabled'}>${state.pictorialUnlocked ? 'Pictorial Unlocked - Continue Below' : 'Complete Mission to Unlock Pictorial'}</button>
                            </div>
                        </div>
                        <div class="s3-pane">
                            <canvas id="s3-canvas" class="s3-canvas" width="760" height="120"></canvas>
                            <div class="s3-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button id="s3-add-proton" class="s3-btn" data-tutor-question-id="s3-signed-charge" data-tutor-level="concrete" data-tutor-answer-keys="charge,concreteMission.reachPlus2,concreteMission.usedSubtractNegative,concreteMission.returnZero" data-tutor-question="Help me reason about how proton and electron operations move net charge on the number line." ${disabled(state.concreteUnlocked)}>Add Proton (+1)</button>
                                <button id="s3-add-electron" class="s3-btn" data-tutor-question-id="s3-signed-charge" data-tutor-level="concrete" data-tutor-answer-keys="charge,concreteMission.reachPlus2,concreteMission.usedSubtractNegative,concreteMission.returnZero" data-tutor-question="Help me reason about how proton and electron operations move net charge on the number line." ${disabled(state.concreteUnlocked)}>Add Electron (-1)</button>
                                <button id="s3-sub-neg" class="s3-btn" data-tutor-question-id="s3-signed-charge" data-tutor-level="concrete" data-tutor-answer-keys="charge,concreteMission.reachPlus2,concreteMission.usedSubtractNegative,concreteMission.returnZero" data-tutor-question="Help me reason about how proton and electron operations move net charge on the number line." ${disabled(state.concreteUnlocked)}>Subtract Negative (-(-1))</button>
                                <button id="s3-reset-signed" class="s3-btn ghost" ${disabled(state.concreteUnlocked)}>Reset</button>
                            </div>
                        </div>
                        <div class="s3-feedback">${state.signedFeedback}</div>

                        <div class="s3-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s3-btn ghost" title="Reinforcement" data-prompt="Why does subtracting a negative number shift us to the right on a number line? Explain conceptually." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s3-card s3-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: PEMDAS left-to-right Priority Stack</h2>
                        <p><strong>L3.5 The Stack:</strong> Division and multiplication have the same priority. Solve left-to-right. Evaluate: 12 / 3 x 2 - 4.</p>
                        <div class="s3-pane">
                            <div class="s3-gems-expr" id="s3-gems-display">
                                ${state.pemdasStep === 0 ? '12 &divide; 3 &times; 2 - 4' : ''}
                                ${state.pemdasStep === 1 ? '4 &times; 2 - 4' : ''}
                                ${state.pemdasStep === 2 ? '8 - 4' : ''}
                                ${state.pemdasStep === 3 ? '4' : ''}
                            </div>
                            <div class="s3-grid" style="gap:4px;">
                                <button class="s3-btn ${state.pemdasStep === 0 ? 'active' : 'ghost'} s3-op-btn" data-op="div" data-tutor-question-id="s3-pemdas-order" data-tutor-level="pictorial" data-tutor-answer-keys="pemdasStep" data-tutor-question="Help me apply left-to-right priority between division and multiplication in 12 / 3 x 2 - 4." ${state.pemdasStep === 0 ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Execute 12 / 3</button>
                                <button class="s3-btn ${state.pemdasStep === 1 ? 'active' : 'ghost'} s3-op-btn" data-op="mul" data-tutor-question-id="s3-pemdas-order" data-tutor-level="pictorial" data-tutor-answer-keys="pemdasStep" data-tutor-question="Help me apply left-to-right priority between division and multiplication in 12 / 3 x 2 - 4." ${state.pemdasStep === 1 ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Execute 4 x 2</button>
                                <button class="s3-btn ${state.pemdasStep === 2 ? 'active' : 'ghost'} s3-op-btn" data-op="sub" data-tutor-question-id="s3-pemdas-order" data-tutor-level="pictorial" data-tutor-answer-keys="pemdasStep" data-tutor-question="Help me apply left-to-right priority between division and multiplication in 12 / 3 x 2 - 4." ${state.pemdasStep === 2 ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Execute 8 - 4</button>
                                <button id="s3-reset-pemdas" class="s3-btn ghost" ${disabled(state.pictorialUnlocked)}>Reset Stack</button>
                            </div>
                        </div>
                        <div class="s3-feedback">${state.pemdasFeedback}</div>

                        <hr style="margin: 1.2rem 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.1);" />

                        <p><strong>L3.1 Quotient Zeros &amp; Remainders:</strong> In long division, if the divisor does not go into the current brought-down value, write a <code>0</code> in the quotient before bringing down the next digit.
                        <br>Solve: <strong>412 ÷ 4</strong>. Enter the quotient.</p>
                        <div class="s3-pane">
                            <div class="s3-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" id="s3-quotient-input" class="s3-input" placeholder="Quotient" value="${state.quotientAnswer}" data-tutor-question-id="s3-quotient-zero" data-tutor-level="pictorial" data-tutor-answer-keys="quotientAnswer" data-tutor-question="Help me solve 412 divided by 4 and explain where the zero appears in the quotient." ${disabled(state.pictorialUnlocked)} />
                                <button id="s3-check-quotient" class="s3-btn" data-tutor-question-id="s3-quotient-zero" data-tutor-level="pictorial" data-tutor-answer-keys="quotientAnswer" data-tutor-question="Help me solve 412 divided by 4 and explain where the zero appears in the quotient." ${disabled(state.pictorialUnlocked)}>Check Division</button>
                            </div>
                        </div>
                        <div class="s3-feedback" id="s3-quotient-feedback">${state.quotientFeedback}</div>

                        <div class="s3-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s3-btn ghost" title="Reinforcement" data-prompt="Show me step-by-step how to divide 412 by 4. Why do we need a zero in the tens place of the quotient?" ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s3-card s3-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Primes & Decomposition Trees</h2>
                        <p><strong>L3.7 Primes:</strong> Break 18 down into prime factor elements. One path is 18 = 2 x 9, then 9 = 3 x 3.</p>
                        <div class="s3-pane">
                            <p>Enter the three prime factors of 18 (order does not matter):</p>
                            <div class="s3-grid" style="grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                <input id="s3-factor-1" class="s3-input" style="text-align:center;" placeholder="Factor" value="${state.primeAnswers.f1}" data-tutor-question-id="s3-prime-factors" data-tutor-level="abstract" data-tutor-answer-keys="primeAnswers.f1,primeAnswers.f2,primeAnswers.f3" data-tutor-question="Help me decompose 18 into prime factors and check whether each factor is prime." ${disabled(state.abstractUnlocked)} />
                                <input id="s3-factor-2" class="s3-input" style="text-align:center;" placeholder="Factor" value="${state.primeAnswers.f2}" data-tutor-question-id="s3-prime-factors" data-tutor-level="abstract" data-tutor-answer-keys="primeAnswers.f1,primeAnswers.f2,primeAnswers.f3" data-tutor-question="Help me decompose 18 into prime factors and check whether each factor is prime." ${disabled(state.abstractUnlocked)} />
                                <input id="s3-factor-3" class="s3-input" style="text-align:center;" placeholder="Factor" value="${state.primeAnswers.f3}" data-tutor-question-id="s3-prime-factors" data-tutor-level="abstract" data-tutor-answer-keys="primeAnswers.f1,primeAnswers.f2,primeAnswers.f3" data-tutor-question="Help me decompose 18 into prime factors and check whether each factor is prime." ${disabled(state.abstractUnlocked)} />
                            </div>
                            <button id="s3-check-primes" class="s3-btn" style="margin-top:8px; width:100%;" data-tutor-question-id="s3-prime-factors" data-tutor-level="abstract" data-tutor-answer-keys="primeAnswers.f1,primeAnswers.f2,primeAnswers.f3" data-tutor-question="Help me decompose 18 into prime factors and check whether each factor is prime." ${disabled(state.abstractUnlocked)}>Verify Prime Factors</button>
                        </div>
                        <div class="s3-feedback">${state.primeFeedback}</div>

                        <hr style="margin: 1.2rem 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.1);" />

                        <p><strong>L3.6 Factors &amp; Multiples:</strong> Factors divide a number evenly. Multiples are results of multiplying by integers.
                        <br>Find the **Least Common Multiple (LCM)** of <strong>4 and 6</strong>.</p>
                        <div class="s3-pane">
                            <div class="s3-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" id="s3-lcm-input-s3" class="s3-input" placeholder="LCM" value="${state.lcmAnswer}" data-tutor-question-id="s3-lcm" data-tutor-level="abstract" data-tutor-answer-keys="lcmAnswer" data-tutor-question="Help me find the least common multiple of 4 and 6 using factor or multiple lists." ${disabled(state.abstractUnlocked)} />
                                <button id="s3-check-lcm" class="s3-btn" data-tutor-question-id="s3-lcm" data-tutor-level="abstract" data-tutor-answer-keys="lcmAnswer" data-tutor-question="Help me find the least common multiple of 4 and 6 using factor or multiple lists." ${disabled(state.abstractUnlocked)}>Check LCM</button>
                            </div>
                        </div>
                        <div class="s3-feedback" id="s3-lcm-feedback">${state.lcmFeedback}</div>

                        <div class="s3-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s3-btn ghost" title="Reinforcement" data-prompt="What is the difference between a factor and a multiple? How do we find the Least Common Multiple (LCM) of 4 and 6?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s3-card s3-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Carbon Net Charge & Lab Statistics</h2>
                        <p><strong>[Required Unlock] L3.3 Applied:</strong> In chemistry, a carbon ion has 6 protons (+1 charge each) and 8 electrons (-1 charge each). What is the total net charge?</p>
                        <div class="s3-grid">
                            <button id="s3-app-wrong" class="s3-btn ${state.appliedChoice === 'wrong' ? 'active' : 'ghost'}" data-tutor-question-id="s3-carbon-charge" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me determine the net charge when carbon has 6 protons and 8 electrons." ${disabled(state.appliedUnlocked)}>+2 because 8 - 6 = 2</button>
                            <button id="s3-app-right" class="s3-btn ${state.appliedChoice === 'right' ? 'active' : 'ghost'}" data-tutor-question-id="s3-carbon-charge" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me determine the net charge when carbon has 6 protons and 8 electrons." ${disabled(state.appliedUnlocked)}>-2 because 6 protons (+6) + 8 electrons (-8) = -2 net charge</button>
                        </div>
                        <div class="s3-feedback">${state.appliedFeedback}</div>

                        <div class="s3-pane" style="margin-top:0.75rem;">
                            <p><strong>[Reinforcement] L3.8 Descriptive Statistics:</strong> A mini lab reports trial values <code>[8, 10, 10, 12, 15]</code>. Enter mean, median, mode, and range.</p>
                            <div class="s3-grid" style="grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;">
                                <input id="s3-stats-mean" class="s3-input" placeholder="Mean" value="${state.statsAnswers.mean}" data-tutor-question-id="s3-stats-summary" data-tutor-level="applied" data-tutor-answer-keys="statsAnswers.mean,statsAnswers.median,statsAnswers.mode,statsAnswers.range" data-tutor-question="Help me compute mean, median, mode, and range for the lab data [8, 10, 10, 12, 15]." ${disabled(state.appliedUnlocked)} />
                                <input id="s3-stats-median" class="s3-input" placeholder="Median" value="${state.statsAnswers.median}" data-tutor-question-id="s3-stats-summary" data-tutor-level="applied" data-tutor-answer-keys="statsAnswers.mean,statsAnswers.median,statsAnswers.mode,statsAnswers.range" data-tutor-question="Help me compute mean, median, mode, and range for the lab data [8, 10, 10, 12, 15]." ${disabled(state.appliedUnlocked)} />
                                <input id="s3-stats-mode" class="s3-input" placeholder="Mode" value="${state.statsAnswers.mode}" data-tutor-question-id="s3-stats-summary" data-tutor-level="applied" data-tutor-answer-keys="statsAnswers.mean,statsAnswers.median,statsAnswers.mode,statsAnswers.range" data-tutor-question="Help me compute mean, median, mode, and range for the lab data [8, 10, 10, 12, 15]." ${disabled(state.appliedUnlocked)} />
                                <input id="s3-stats-range" class="s3-input" placeholder="Range" value="${state.statsAnswers.range}" data-tutor-question-id="s3-stats-summary" data-tutor-level="applied" data-tutor-answer-keys="statsAnswers.mean,statsAnswers.median,statsAnswers.mode,statsAnswers.range" data-tutor-question="Help me compute mean, median, mode, and range for the lab data [8, 10, 10, 12, 15]." ${disabled(state.appliedUnlocked)} />
                            </div>
                            <button id="s3-check-stats" class="s3-btn" style="margin-top:8px; width:100%;" data-tutor-question-id="s3-stats-summary" data-tutor-level="applied" data-tutor-answer-keys="statsAnswers.mean,statsAnswers.median,statsAnswers.mode,statsAnswers.range" data-tutor-question="Help me compute mean, median, mode, and range for the lab data [8, 10, 10, 12, 15]." ${disabled(state.appliedUnlocked)}>Check Statistics</button>
                            <div class="s3-feedback" id="s3-stats-feedback">${state.statsFeedback}</div>
                        </div>

                        <div class="s3-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s3-btn ghost" title="Reinforcement" data-prompt="Walk me through how proton/electron counts translate into net integer charges in basic chemistry." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const syncConcreteMission = () => {
                if (state.charge >= 2) {
                    state.concreteMission.reachPlus2 = true;
                }

                if (state.concreteMission.reachPlus2 && state.concreteMission.usedSubtractNegative && state.charge === 0) {
                    state.concreteMission.returnZero = true;
                }

                const complete = state.concreteMission.reachPlus2
                    && state.concreteMission.usedSubtractNegative
                    && state.concreteMission.returnZero;

                if (complete && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.signedFeedback = 'Concrete mission complete. You demonstrated signed directionality and subtract-negative reversal. Pictorial level is now unlocked below.';
                }
            };

            // Canvas Signed Line
            const drawSignedLine = () => {
                const canvas = host.querySelector('#s3-canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const xFor = (value) => 50 + ((value + 10) / 20) * 660;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(50, 60);
                ctx.lineTo(710, 60);
                ctx.stroke();

                for (let v = -10; v <= 10; v++) {
                    const x = xFor(v);
                    ctx.strokeStyle = v === 0 ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = v === 0 ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(x, 48);
                    ctx.lineTo(x, 72);
                    ctx.stroke();

                    ctx.fillStyle = '#cbd5e1';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(v > 0 ? `+${v}` : `${v}`, x, 88);
                }

                const particleX = xFor(state.charge);
                ctx.fillStyle = '#f43f5e';
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(particleX, 60, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#fbbf24';
                ctx.font = '700 12px sans-serif';
                ctx.fillText(`Net Charge: ${state.charge > 0 ? '+' : ''}${state.charge} (Abs Val: ${Math.abs(state.charge)})`, 380, 24);
            };

            drawSignedLine();

            // Bind Tutor (Prof. Beaker)
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Bind Ops
            host.querySelectorAll('.s3-op-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const op = btn.getAttribute('data-op');
                    if (op === 'div' && state.pemdasStep === 0) {
                        state.pemdasStep = 1;
                        state.pemdasFeedback = 'Good. 12 / 3 = 4. Now perform multiplication.';
                    } else if (op === 'mul' && state.pemdasStep === 1) {
                        state.pemdasStep = 2;
                        state.pemdasFeedback = 'Good. 4 x 2 = 8. Now subtract.';
                    } else if (op === 'sub' && state.pemdasStep === 2) {
                        state.pemdasStep = 3;
                        state.pemdasFeedback = 'Correct! Result is 4. Notice that division was done first due to left-to-right order. Abstract unlocked. Continue below.';
                        state.abstractUnlocked = true; // Unlock abstract
                    }
                    persist('PEMDAS step run');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s3-reset-pemdas').addEventListener('click', () => {
                state.pemdasStep = 0;
                state.pemdasFeedback = 'Stack reset. Evaluate 12 / 3 x 2 - 4.';
                persist('PEMDAS reset');
                this.mount({ host, state, onStateChange });
            });

            // L3.1 Quotient Zeros
            host.querySelector('#s3-check-quotient').addEventListener('click', () => {
                const ans = host.querySelector('#s3-quotient-input').value.trim();
                state.quotientAnswer = ans;
                if (ans === '103') {
                    state.quotientCorrect = true;
                    state.quotientFeedback = 'Correct! 412 / 4 = 103. Bringing down the 1 gives 1, which 4 cannot divide (quotient tens place gets 0), then bring down 2 to make 12 (12 / 4 = 3).';
                } else {
                    state.quotientCorrect = false;
                    state.quotientFeedback = 'Incorrect. Hint: 4 goes into 4 once. Bring down 1. 4 goes into 1 zero times. Bring down 2. 4 goes into 12 three times.';
                }
                persist('Quotient checked');
                this.mount({ host, state, onStateChange });
            });

            // Diagnostic Logic
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic option chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s3-check-diagnostic').addEventListener('click', () => {
                const isCorrect = state.diagnosticAnswers.q1 === '3' &&
                                  state.diagnosticAnswers.q2 === '9' &&
                                  state.diagnosticAnswers.q3 === 'correct';
                state.diagnosticDone = true;
                if (isCorrect) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered integer arithmetic, PEMDAS stacks, and factoring. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Normal path active.';
                }
                persist('Stage 3 diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Net Charge
            host.querySelector('#s3-add-proton').addEventListener('click', () => {
                state.charge = Math.min(10, state.charge + 1);
                state.signedFeedback = `Added 1 proton (+1). Net charge shifted right. Current: ${state.charge}.`;
                syncConcreteMission();
                drawSignedLine();
                persist('Proton added');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-add-electron').addEventListener('click', () => {
                state.charge = Math.max(-10, state.charge - 1);
                state.signedFeedback = `Added 1 electron (-1). Net charge shifted left. Current: ${state.charge}.`;
                syncConcreteMission();
                drawSignedLine();
                persist('Electron added');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-sub-neg').addEventListener('click', () => {
                state.charge = Math.min(10, state.charge + 1);
                state.concreteMission.usedSubtractNegative = true;
                state.signedFeedback = 'Subtracting negative 1 removes a negative electron, shifting charge right. Direction reversed!';
                syncConcreteMission();
                drawSignedLine();
                persist('Negative subtracted');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-reset-signed').addEventListener('click', () => {
                state.charge = 0;
                state.signedFeedback = 'Net charge reset to 0. Continue the mission checklist to unlock the next level.';
                syncConcreteMission();
                drawSignedLine();
                persist('Signed reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-hint-signed').addEventListener('click', () => {
                if (!state.concreteMission.reachPlus2) {
                    state.signedFeedback = 'Hint: Add protons until the net charge reaches +2.';
                } else if (!state.concreteMission.usedSubtractNegative) {
                    state.signedFeedback = 'Hint: Press "Subtract Negative (-(-1))" once to demonstrate direction reversal.';
                } else if (!state.concreteMission.returnZero) {
                    state.signedFeedback = 'Hint: Adjust charge back to 0 using proton/electron moves.';
                } else {
                    state.signedFeedback = 'All mission steps complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-continue-pictorial').addEventListener('click', () => {
                if (state.pictorialUnlocked) {
                    state.signedFeedback = 'Pictorial is unlocked. Scroll to the next card and complete the PEMDAS stack challenge.';
                    persist('Continue prompted');
                    this.mount({ host, state, onStateChange });
                }
            });

            // Abstract Primes
            host.querySelector('#s3-check-primes').addEventListener('click', () => {
                const f1 = host.querySelector('#s3-factor-1').value.trim();
                const f2 = host.querySelector('#s3-factor-2').value.trim();
                const f3 = host.querySelector('#s3-factor-3').value.trim();
                state.primeAnswers = { f1, f2, f3 };

                const values = [parseInt(f1), parseInt(f2), parseInt(f3)].sort((a,b) => a-b);
                const isCorrect = values[0] === 2 && values[1] === 3 && values[2] === 3;

                if (isCorrect) {
                    state.primeFeedback = 'Correct! 18 = 2 x 3 x 3. These are the prime factors of 18. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true; // Unlock applied
                } else {
                    state.primeFeedback = 'Incorrect. The product must equal 18, and all three numbers must be prime. (Hint: 2, 3, 3)';
                }
                persist('Primes checked');
                this.mount({ host, state, onStateChange });
            });

            // L3.6 LCM
            host.querySelector('#s3-check-lcm').addEventListener('click', () => {
                const ans = host.querySelector('#s3-lcm-input-s3').value.trim();
                state.lcmAnswer = ans;
                if (ans === '12') {
                    state.lcmCorrect = true;
                    state.lcmFeedback = 'Correct! Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18... The least common multiple is 12.';
                } else {
                    state.lcmCorrect = false;
                    state.lcmFeedback = 'Incorrect. List the multiples: 4, 8, 12... and 6, 12... What is the smallest common one?';
                }
                persist('LCM checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied Ions
            host.querySelector('#s3-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. Electrons hold negative charges (-1 each), so having 8 electrons and 6 protons creates a net negative charge.';
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! 6 protons (+6) + 8 electrons (-8) = -2 net charge.';
                persist('Applied choice correct');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s3-check-stats').addEventListener('click', () => {
                const mean = host.querySelector('#s3-stats-mean').value.trim();
                const median = host.querySelector('#s3-stats-median').value.trim();
                const mode = host.querySelector('#s3-stats-mode').value.trim();
                const range = host.querySelector('#s3-stats-range').value.trim();
                state.statsAnswers = { mean, median, mode, range };

                const meanVal = Number(mean);
                const medianVal = Number(median);
                const modeVal = Number(mode);
                const rangeVal = Number(range);
                const allCorrect = meanVal === 11 && medianVal === 10 && modeVal === 10 && rangeVal === 7;

                if (allCorrect) {
                    state.statsFeedback = 'Correct. Mean = 11, median = 10, mode = 10, range = 7. This is the core summary set for repeated lab trials.';
                } else {
                    state.statsFeedback = 'Not yet. For [8, 10, 10, 12, 15]: sum is 55 so mean is 11, median is the middle value 10, mode is 10, and range is 15 - 8 = 7.';
                }

                persist('Statistics checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const factor1 = host.querySelector('#s3-factor-1');
            if (factor1) {
                factor1.addEventListener('input', (e) => {
                    state.primeAnswers.f1 = e.target.value;
                });
            }
            const factor2 = host.querySelector('#s3-factor-2');
            if (factor2) {
                factor2.addEventListener('input', (e) => {
                    state.primeAnswers.f2 = e.target.value;
                });
            }
            const factor3 = host.querySelector('#s3-factor-3');
            if (factor3) {
                factor3.addEventListener('input', (e) => {
                    state.primeAnswers.f3 = e.target.value;
                });
            }
            const statsMean = host.querySelector('#s3-stats-mean');
            if (statsMean) {
                statsMean.addEventListener('input', (e) => {
                    state.statsAnswers.mean = e.target.value;
                });
            }
            const statsMedian = host.querySelector('#s3-stats-median');
            if (statsMedian) {
                statsMedian.addEventListener('input', (e) => {
                    state.statsAnswers.median = e.target.value;
                });
            }
            const statsMode = host.querySelector('#s3-stats-mode');
            if (statsMode) {
                statsMode.addEventListener('input', (e) => {
                    state.statsAnswers.mode = e.target.value;
                });
            }
            const statsRange = host.querySelector('#s3-stats-range');
            if (statsRange) {
                statsRange.addEventListener('input', (e) => {
                    state.statsAnswers.range = e.target.value;
                });
            }

            const quotientInput = host.querySelector('#s3-quotient-input');
            if (quotientInput) {
                quotientInput.addEventListener('input', (e) => {
                    state.quotientAnswer = e.target.value;
                });
            }
            const lcmInput = host.querySelector('#s3-lcm-input-s3');
            if (lcmInput) {
                lcmInput.addEventListener('input', (e) => {
                    state.lcmAnswer = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
