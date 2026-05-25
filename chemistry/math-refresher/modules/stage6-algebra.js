const createInitialStage6State = () => ({
    leftExpr: 'Density',
    rightExpr: 'mass / Volume',
    feedback: 'Treat the equals sign as a balance pivot. Every legal operation must preserve equilibrium on both sides.',
    basementFeedback: 'Volume is still downstairs as a divisor. Un-bury the basement first before trying to isolate it.',
    basementFlash: false,
    shieldFeedback: 'Delta T and V1 are shielded tokens. They cannot be split into pieces during division.',
    checkpointFeedback: 'Mastery Checkpoint: identify the correct first move when the target variable is trapped in the denominator.'
});

export function createStage6Algebra() {
    return {
        id: 'stage6',
        label: 'Algebraic Seesaw Balance',
        title: 'Stage 6: Algebraic Seesaw Balance',
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

            host.innerHTML = `
                <style>
                    .s6-wrap { display: grid; gap: 1.2rem; }
                    .s6-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s6-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s6-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s6-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s6-pane { border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.75rem; background: #f8fafc; }
                    .s6-seesaw {
                        margin-top: 0.8rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.85rem;
                        background: #f8fbff;
                    }
                    .s6-rail {
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                        gap: 0.5rem;
                        align-items: center;
                    }
                    .s6-side {
                        min-height: 70px;
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        background: #ffffff;
                        display: grid;
                        align-content: center;
                        justify-items: center;
                        gap: 0.2rem;
                        padding: 0.5rem;
                    }
                    .s6-pivot {
                        width: 42px;
                        height: 42px;
                        border-radius: 999px;
                        border: 2px solid #f59e0b;
                        background: #fffbeb;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        color: #92400e;
                    }
                    .s6-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s6-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .s6-controls { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 0.72rem; }
                    .s6-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s6-den {
                        display: inline-block;
                        border: 1px solid #0ea5e9;
                        border-radius: 8px;
                        padding: 0.08rem 0.34rem;
                        background: #ecfeff;
                    }
                    .s6-den.flash {
                        background: #fee2e2;
                        border-color: #ef4444;
                        animation: s6-shake 0.4s linear;
                    }
                    .s6-shield {
                        display: inline-block;
                        border: 2px solid #0f172a;
                        border-radius: 8px;
                        padding: 0.08rem 0.34rem;
                        background: #fff7ed;
                    }
                    .s6-shield.chem { background: #ecfeff; border-color: #0e7490; }
                    .s6-shield.hit { animation: s6-shake 0.4s linear; }
                    @keyframes s6-shake {
                        0% { transform: translateX(0); }
                        25% { transform: translateX(-4px); }
                        50% { transform: translateX(4px); }
                        75% { transform: translateX(-3px); }
                        100% { transform: translateX(0); }
                    }
                    .s6-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s6-wrap">
                    <article class="s6-card">
                        <h2>Stage Framework</h2>
                        <div class="s6-framework">
                            <div class="s6-pane"><strong>Conceptual Anchor</strong><p>The equals sign is a balance pivot, not an answer arrow. If one side changes alone, the equation stops being true.</p></div>
                            <div class="s6-pane"><strong>Mechanical Algorithm</strong><p>Mirror operations to both sides, and when a variable is buried in a denominator, multiply it out first before isolating anything else.</p></div>
                            <div class="s6-pane"><strong>Cognitive Trap</strong><p>The trap is dividing by a numerator term while ignoring the denominator variable, which silently creates reciprocal leftovers instead of isolating the target.</p></div>
                            <div class="s6-pane"><strong>Science Bridge</strong><p>Chemistry formulas often use shielded symbols like ΔT or V1. These are single scientific identities, so algebra must treat each shield as one unbreakable token.</p></div>
                        </div>
                    </article>

                    <article class="s6-card">
                        <h2>The Seesaw Balance and Denominator Block Workspace</h2>
                        <div class="s6-seesaw">
                            <div class="s6-rail">
                                <div class="s6-side">
                                    <div class="s6-mini">Left side</div>
                                    <div id="s6-left">${state.leftExpr}</div>
                                </div>
                                <div class="s6-pivot">=</div>
                                <div class="s6-side">
                                    <div class="s6-mini">Right side</div>
                                    <div id="s6-right">mass / <span id="s6-den-box" class="s6-den${state.basementFlash ? ' flash' : ''}">Volume</span></div>
                                </div>
                            </div>
                            <div class="s6-controls">
                                <button id="s6-bad-isolate" class="s6-btn ghost">Try dividing by mass first</button>
                                <button id="s6-unbury" class="s6-btn">Multiply both sides by Volume</button>
                                <button id="s6-finish" class="s6-btn ghost">Then divide by Density</button>
                                <button id="s6-reset" class="s6-btn ghost">Reset Algebra Workspace</button>
                            </div>
                            <div id="s6-feedback" class="s6-feedback">${state.feedback}</div>
                            <div id="s6-basement-feedback" class="s6-feedback">${state.basementFeedback}</div>
                        </div>
                    </article>

                    <article class="s6-card">
                        <h2>Shielded Chemistry Variables</h2>
                        <p>These variables are protected because they are single scientific identities, not loose letters.</p>
                        <div class="s6-controls">
                            <div class="s6-side"><span id="s6-delta-shield" class="s6-shield chem">&Delta;T</span></div>
                            <div class="s6-side"><span id="s6-v1-shield" class="s6-shield">V1</span></div>
                            <div class="s6-side"><span id="s6-v2-shield" class="s6-shield">V2</span></div>
                        </div>
                        <div class="s6-controls">
                            <button id="s6-split-delta" class="s6-btn ghost">Try dividing away only T</button>
                            <button id="s6-good-shield" class="s6-btn">Divide by the full (m ΔT) product</button>
                        </div>
                        <div id="s6-shield-feedback" class="s6-feedback">${state.shieldFeedback}</div>
                    </article>

                    <article class="s6-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>If the target variable is downstairs in a fraction, what must happen first?</p>
                        <div class="s6-controls">
                            <button id="s6-check-trap" class="s6-btn ghost">Divide by the numerator anyway and hope the denominator disappears</button>
                            <button id="s6-check-right" class="s6-btn">Un-bury the basement first by multiplying both sides by the denominator</button>
                        </div>
                        <div id="s6-check-feedback" class="s6-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const feedbackEl = host.querySelector('#s6-feedback');
            const basementFeedbackEl = host.querySelector('#s6-basement-feedback');
            const shieldFeedbackEl = host.querySelector('#s6-shield-feedback');
            const checkFeedbackEl = host.querySelector('#s6-check-feedback');
            const denBoxEl = host.querySelector('#s6-den-box');
            const leftEl = host.querySelector('#s6-left');
            const rightEl = host.querySelector('#s6-right');
            const deltaShieldEl = host.querySelector('#s6-delta-shield');

            const pulseDenominator = () => {
                denBoxEl.classList.remove('flash');
                void denBoxEl.offsetWidth;
                denBoxEl.classList.add('flash');
            };

            host.querySelector('#s6-bad-isolate').addEventListener('click', () => {
                state.feedback = 'Operation blocked. Un-bury the basement first!';
                state.basementFeedback = 'Un-bury the basement first! Multiply both sides by the denominator to lift Volume to the top line.';
                pulseDenominator();
                feedbackEl.textContent = state.feedback;
                basementFeedbackEl.textContent = state.basementFeedback;
                onStateChange({ ...state }, 'Stage 6 denominator trap blocked');
            });

            host.querySelector('#s6-unbury').addEventListener('click', () => {
                state.rightExpr = 'mass';
                leftEl.textContent = 'Density × Volume';
                rightEl.textContent = 'mass';
                state.feedback = 'Balanced move applied: multiplying both sides by Volume lifts the target variable out of the denominator.';
                state.basementFeedback = 'The variable is now on the main floor. You can finish by dividing both sides by Density.';
                feedbackEl.textContent = state.feedback;
                basementFeedbackEl.textContent = state.basementFeedback;
                onStateChange({ ...state }, 'Stage 6 variable unburied');
            });

            host.querySelector('#s6-finish').addEventListener('click', () => {
                leftEl.textContent = 'Volume';
                rightEl.textContent = 'mass / Density';
                state.feedback = 'Isolation complete. Volume = mass / Density.';
                state.basementFeedback = 'This sequence worked because the denominator variable was lifted before the final division step.';
                feedbackEl.textContent = state.feedback;
                basementFeedbackEl.textContent = state.basementFeedback;
                onStateChange({ ...state }, 'Stage 6 algebra completed');
            });

            host.querySelector('#s6-reset').addEventListener('click', () => {
                Object.assign(state, createInitialStage6State());
                leftEl.textContent = state.leftExpr;
                rightEl.innerHTML = 'mass / <span id="s6-den-box" class="s6-den">Volume</span>';
                feedbackEl.textContent = state.feedback;
                basementFeedbackEl.textContent = state.basementFeedback;
                shieldFeedbackEl.textContent = state.shieldFeedback;
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 6 reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s6-split-delta').addEventListener('click', () => {
                deltaShieldEl.classList.remove('hit');
                void deltaShieldEl.offsetWidth;
                deltaShieldEl.classList.add('hit');
                state.shieldFeedback = 'Blocked: ΔT is one shielded token. You cannot divide away T while leaving Δ behind.';
                shieldFeedbackEl.textContent = state.shieldFeedback;
                onStateChange({ ...state }, 'Stage 6 shield trap blocked');
            });

            host.querySelector('#s6-good-shield').addEventListener('click', () => {
                state.shieldFeedback = 'Correct. Divide by the full product containing the shielded token so the scientific identity stays intact.';
                shieldFeedbackEl.textContent = state.shieldFeedback;
                onStateChange({ ...state }, 'Stage 6 shield step accepted');
            });

            host.querySelector('#s6-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap detected: ignoring the denominator leaves reciprocal structure behind and does not isolate the target honestly.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 6 checkpoint corrected');
            });

            host.querySelector('#s6-check-right').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. When the variable is acting as a divisor, the first move is multiplying it out of the denominator.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 6 checkpoint passed');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_algebra_focus' && typeof call.arguments?.message === 'string') {
                    nextState.feedback = call.arguments.message;
                }
            });
            return nextState;
        }
    };
}
