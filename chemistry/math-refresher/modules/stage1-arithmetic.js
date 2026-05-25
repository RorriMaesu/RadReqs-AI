const createInitialStage1State = () => ({
    step1Divide: '',
    step1Multiply: '',
    step1Subtract: '',
    step1BringDown: '',
    step2Divide: '',
    step2Multiply: '',
    step2Subtract: '',
    feedback: 'Work the problem 156 ÷ 12 one loop at a time: divide, multiply, subtract, then bring down.',
    checkpointFeedback: 'Mastery Checkpoint: choose the statement that preserves the long-division loop correctly.',
    errorColumn: ''
});

export function createStage1Arithmetic() {
    return {
        id: 'stage1',
        label: 'Concrete Arithmetic Engine',
        title: 'Stage 1: Concrete Arithmetic Engine',
        getInitialState() {
            return createInitialStage1State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage1State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .s1-wrap { display: grid; gap: 1.2rem; }
                    .s1-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s1-card h2, .s1-card h3 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s1-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s1-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s1-pill {
                        border: 1px solid #cbd5e1;
                        border-radius: 999px;
                        padding: 0.14rem 0.58rem;
                        background: #f8fafc;
                        color: #1e293b;
                        font-size: 0.82rem;
                        font-weight: 700;
                    }
                    .s1-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s1-board {
                        margin-top: 0.75rem;
                        border: 1px solid #dbeafe;
                        border-radius: 14px;
                        padding: 0.9rem;
                        background: linear-gradient(180deg, #ffffff, #f8fbff);
                    }
                    .s1-problem {
                        display: grid;
                        grid-template-columns: 36px 50px 50px 50px;
                        gap: 0.4rem;
                        align-items: center;
                        max-width: 250px;
                        font-family: 'Consolas', 'Courier New', monospace;
                        margin-bottom: 0.9rem;
                    }
                    .s1-cell {
                        height: 42px;
                        border: 1px solid #cbd5e1;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #ffffff;
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .s1-cell.bar-top { border-top: 3px solid #0f172a; }
                    .s1-cell.bar-left { border-left: 3px solid #0f172a; }
                    .s1-col-error {
                        border-color: #ef4444 !important;
                        background: #fee2e2 !important;
                        color: #991b1b !important;
                    }
                    .s1-steps {
                        display: grid;
                        gap: 0.65rem;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    }
                    .s1-step-box {
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        background: #ffffff;
                        padding: 0.7rem;
                    }
                    .s1-label {
                        display: block;
                        color: #475569;
                        font-size: 0.82rem;
                        font-weight: 700;
                        margin-bottom: 0.28rem;
                    }
                    .s1-input {
                        width: 100%;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.5rem 0.62rem;
                        font: inherit;
                    }
                    .s1-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.82rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s1-btn.ghost {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .s1-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s1-wrap">
                    <article class="s1-card">
                        <h2>Conceptual Anchor</h2>
                        <p>Long division is a repeated scaling loop, not a mysterious page ritual. You are asking one question over and over: how many copies of the divisor fit into the current working chunk of the dividend? The answer builds one quotient digit at a time.</p>
                        <p>Returning learners often feel overwhelmed because the page contains stacked numbers, subtraction, and place value all at once. The solution is to slow the process into four stable motions: divide, multiply, subtract, and bring down. Each motion has a single job.</p>
                        <p>When each loop is correct, the next loop inherits clean information. When one subtraction is wrong, every later step becomes noisy. That is why the simulator below checks the exact column where the logic broke and coaches you immediately.</p>
                    </article>

                    <article class="s1-card">
                        <h2>Mechanical Algorithm</h2>
                        <div class="s1-grid">
                            <div><span class="s1-pill">Divide</span><p>Ask how many times 12 fits into the active chunk.</p></div>
                            <div><span class="s1-pill">Multiply</span><p>Multiply that quotient digit back by 12.</p></div>
                            <div><span class="s1-pill">Subtract</span><p>Remove that matched amount from the current chunk.</p></div>
                            <div><span class="s1-pill">Bring Down</span><p>Lower the next digit only after subtraction is complete.</p></div>
                        </div>
                    </article>

                    <article class="s1-card">
                        <h2>Cognitive Trap</h2>
                        <p>The most common long-division failure is rushing to the next digit before the subtraction row is correct. That creates a fake working number and makes the quotient look wrong even when the first divide step was reasonable.</p>
                        <p>Another common trap is treating the quotient as a guess instead of a checked estimate. Long division is self-correcting: your multiplication row must match the divisor times your chosen quotient digit, and the subtraction result must stay smaller than the divisor before you bring the next digit down.</p>
                    </article>

                    <article class="s1-card">
                        <h2>Science Bridge</h2>
                        <p>Chemistry uses this same patience whenever you unpack ratios into repeated groups. Moles, particles, grams, and milliliters all rely on trustworthy place-value handling. If you can manage long division loop by loop, you are training the exact steadiness needed for unit conversions and stoichiometric scaling.</p>
                    </article>

                    <article class="s1-card">
                        <h2>Long Division Step-by-Step Simulator</h2>
                        <div class="s1-board">
                            <div class="s1-problem">
                                <div class="s1-cell">12</div>
                                <div class="s1-cell bar-top bar-left">1</div>
                                <div class="s1-cell bar-top">5</div>
                                <div class="s1-cell bar-top">6</div>
                                <div class="s1-cell"></div>
                                <div class="s1-cell">1</div>
                                <div class="s1-cell">3</div>
                                <div class="s1-cell"></div>
                            </div>

                            <div class="s1-steps">
                                <div class="s1-step-box ${state.errorColumn === 'step1' ? 's1-col-error' : ''}">
                                    <h3>Loop 1 on 15</h3>
                                    <label class="s1-label">Divide: how many 12s fit into 15?</label>
                                    <input id="s1-step1-divide" class="s1-input" value="${state.step1Divide}" />
                                    <label class="s1-label">Multiply: 12 × quotient digit</label>
                                    <input id="s1-step1-multiply" class="s1-input" value="${state.step1Multiply}" />
                                    <label class="s1-label">Subtract: 15 − product</label>
                                    <input id="s1-step1-subtract" class="s1-input" value="${state.step1Subtract}" />
                                    <label class="s1-label">Bring down the next digit</label>
                                    <input id="s1-step1-bring" class="s1-input" value="${state.step1BringDown}" />
                                </div>
                                <div class="s1-step-box ${state.errorColumn === 'step2' ? 's1-col-error' : ''}">
                                    <h3>Loop 2 on 36</h3>
                                    <label class="s1-label">Divide: how many 12s fit into 36?</label>
                                    <input id="s1-step2-divide" class="s1-input" value="${state.step2Divide}" />
                                    <label class="s1-label">Multiply: 12 × quotient digit</label>
                                    <input id="s1-step2-multiply" class="s1-input" value="${state.step2Multiply}" />
                                    <label class="s1-label">Subtract: 36 − product</label>
                                    <input id="s1-step2-subtract" class="s1-input" value="${state.step2Subtract}" />
                                </div>
                            </div>
                            <div class="s1-grid" style="margin-top:0.8rem;">
                                <button id="s1-validate" class="s1-btn">Validate Arithmetic Loop</button>
                                <button id="s1-reset" class="s1-btn ghost">Reset Worked Example</button>
                            </div>
                            <div id="s1-feedback" class="s1-feedback">${state.feedback}</div>
                        </div>
                    </article>

                    <article class="s1-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>A learner says, “Once I get the first quotient digit, I can bring down the next number immediately.” Which response is correct?</p>
                        <div class="s1-grid">
                            <button id="s1-check-trap" class="s1-btn ghost">That breaks the loop because subtraction must confirm the leftover before the next digit comes down.</button>
                            <button id="s1-check-wrong" class="s1-btn ghost">That is fine because quotient placement matters more than the subtraction row.</button>
                        </div>
                        <div id="s1-check-feedback" class="s1-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const step1DivideEl = host.querySelector('#s1-step1-divide');
            const step1MultiplyEl = host.querySelector('#s1-step1-multiply');
            const step1SubtractEl = host.querySelector('#s1-step1-subtract');
            const step1BringEl = host.querySelector('#s1-step1-bring');
            const step2DivideEl = host.querySelector('#s1-step2-divide');
            const step2MultiplyEl = host.querySelector('#s1-step2-multiply');
            const step2SubtractEl = host.querySelector('#s1-step2-subtract');
            const feedbackEl = host.querySelector('#s1-feedback');
            const checkpointEl = host.querySelector('#s1-check-feedback');

            const syncState = () => {
                state.step1Divide = step1DivideEl.value.trim();
                state.step1Multiply = step1MultiplyEl.value.trim();
                state.step1Subtract = step1SubtractEl.value.trim();
                state.step1BringDown = step1BringEl.value.trim();
                state.step2Divide = step2DivideEl.value.trim();
                state.step2Multiply = step2MultiplyEl.value.trim();
                state.step2Subtract = step2SubtractEl.value.trim();
            };

            host.querySelector('#s1-validate').addEventListener('click', () => {
                syncState();
                state.errorColumn = '';

                if (state.step1Divide !== '1') {
                    state.errorColumn = 'step1';
                    state.feedback = 'Loop 1 divide check: 12 fits into 15 exactly 1 time. Start by locking that quotient digit.';
                } else if (state.step1Multiply !== '12') {
                    state.errorColumn = 'step1';
                    state.feedback = 'Loop 1 multiply check: once the quotient digit is 1, the product row must be 12.';
                } else if (state.step1Subtract !== '3') {
                    state.errorColumn = 'step1';
                    state.feedback = 'Loop 1 subtraction check: 15 minus 12 leaves 3. Your subtraction column needs repair before you continue.';
                } else if (state.step1BringDown !== '36') {
                    state.errorColumn = 'step1';
                    state.feedback = 'Bring-down check: the leftover 3 becomes 36 only after the 6 is brought straight down beside it.';
                } else if (state.step2Divide !== '3') {
                    state.errorColumn = 'step2';
                    state.feedback = 'Loop 2 divide check: 12 fits into 36 exactly 3 times.';
                } else if (state.step2Multiply !== '36') {
                    state.errorColumn = 'step2';
                    state.feedback = 'Loop 2 multiply check: 3 groups of 12 produce 36.';
                } else if (state.step2Subtract !== '0') {
                    state.errorColumn = 'step2';
                    state.feedback = 'Loop 2 subtraction check: 36 minus 36 leaves 0, which confirms the quotient is exact.';
                } else {
                    state.feedback = 'Complete and correct. You preserved the full divide-multiply-subtract-bring-down loop and reached the quotient 13.';
                }

                feedbackEl.textContent = state.feedback;
                onStateChange({ ...state }, 'Stage 1 long division updated');
            });

            host.querySelector('#s1-reset').addEventListener('click', () => {
                Object.assign(state, createInitialStage1State());
                host.querySelectorAll('.s1-input').forEach((input) => {
                    input.value = '';
                });
                feedbackEl.textContent = state.feedback;
                checkpointEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 1 reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. Bringing down early destroys the logic chain because the subtraction row has not yet verified the true remainder.';
                checkpointEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 1 checkpoint passed');
            });

            host.querySelector('#s1-check-wrong').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap triggered: quotient placement alone is not enough. Without the subtraction proof, the next working number may be false.';
                checkpointEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 1 checkpoint corrected');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'prefill_long_division' && typeof call.arguments?.step === 'string' && typeof call.arguments?.value === 'string') {
                    nextState[call.arguments.step] = call.arguments.value;
                }
            });
            return nextState;
        }
    };
}
