const createInitialStage2State = () => ({
    lcmInput: '',
    lcmUnlocked: false,
    sumFeedback: 'Use the common-denominator gate first. The workspace will not combine 1/3 and 1/4 until both are rewritten in twelfths.',
    checkpointFeedback: 'Mastery Checkpoint: identify the trap in adding fractions with unlike denominators.',
    directAddBlocked: false
});

export function createStage2Fractions() {
    return {
        id: 'stage2',
        label: 'Rational Numeracy (Fractions)',
        title: 'Stage 2: Rational Numeracy (Fractions)',
        getInitialState() {
            return createInitialStage2State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage2State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .s2-wrap { display: grid; gap: 1.2rem; }
                    .s2-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s2-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s2-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s2-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s2-pane {
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fafc;
                    }
                    .s2-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s2-bars {
                        margin-top: 0.8rem;
                        display: grid;
                        gap: 0.8rem;
                    }
                    .s2-bar {
                        display: flex;
                        min-height: 42px;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 1px solid #cbd5e1;
                        background: #ffffff;
                    }
                    .s2-piece {
                        flex: 1;
                        border-right: 1px solid #cbd5e1;
                        background: #e2e8f0;
                        transition: background 0.25s ease, flex 0.35s ease;
                    }
                    .s2-piece:last-child { border-right: none; }
                    .s2-piece.on { background: #60a5fa; }
                    .s2-controls { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin-top: 0.7rem; }
                    .s2-input {
                        width: 100%;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.5rem 0.62rem;
                        font: inherit;
                    }
                    .s2-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s2-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .s2-alert {
                        margin-top: 0.55rem;
                        border: 1px solid #fca5a5;
                        border-radius: 10px;
                        padding: 0.52rem 0.62rem;
                        background: #fef2f2;
                        color: #991b1b;
                    }
                    .s2-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s2-wrap">
                    <article class="s2-card">
                        <h2>Stage Framework</h2>
                        <div class="s2-framework">
                            <div class="s2-pane"><strong>Conceptual Anchor</strong><p>Fractions describe how many equal pieces are active out of a shared whole. The denominator names the partition size. The numerator tells how many of those equal partitions you hold.</p></div>
                            <div class="s2-pane"><strong>Mechanical Algorithm</strong><p>When denominators differ, you must rebuild both fractions into the same sized pieces before adding. The least common multiple is the shared slicing plan.</p></div>
                            <div class="s2-pane"><strong>Cognitive Trap</strong><p>The trap is adding straight across, such as 1/3 + 1/4 = 2/7. That combines counts and partition sizes that do not match, which destroys the meaning of the parts.</p></div>
                            <div class="s2-pane"><strong>Science Bridge</strong><p>Chemistry constantly compares partial amounts inside shared containers, such as concentrations and component fractions. Common-denominator thinking supports later ratio and percentage work.</p></div>
                        </div>
                    </article>

                    <article class="s2-card">
                        <h2>Dynamic Fraction Slicing Workspace</h2>
                        <p>The bars below start as 1/3 and 1/4. You are not allowed to add them until you build a common denominator. Once you confirm the correct LCM, both bars physically reslice into twelfths so the pieces can be compared and combined honestly.</p>
                        <div class="s2-bars">
                            <div>
                                <div class="s2-bar" id="s2-bar-third"></div>
                                <p class="s2-feedback">Fraction A: 1/3 ${state.lcmUnlocked ? '= 4/12' : 'needs a common denominator first'}</p>
                            </div>
                            <div>
                                <div class="s2-bar" id="s2-bar-fourth"></div>
                                <p class="s2-feedback">Fraction B: 1/4 ${state.lcmUnlocked ? '= 3/12' : 'needs a common denominator first'}</p>
                            </div>
                        </div>
                        <div class="s2-controls">
                            <label>
                                Enter the least common multiple of 3 and 4
                                <input id="s2-lcm" class="s2-input" value="${state.lcmInput}" />
                            </label>
                            <button id="s2-confirm" class="s2-btn">Confirm Common Denominator</button>
                            <button id="s2-direct-add" class="s2-btn ghost">Try Adding Directly</button>
                        </div>
                        <div id="s2-feedback" class="s2-feedback">${state.sumFeedback}</div>
                        <div id="s2-alert" class="s2-alert" style="display:${state.directAddBlocked ? 'block' : 'none'};">Direct addition blocked: unlike denominators must be rebuilt into matching piece sizes before combining.</div>
                    </article>

                    <article class="s2-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>Which result correctly handles 1/3 + 1/4?</p>
                        <div class="s2-controls">
                            <button id="s2-check-trap" class="s2-btn ghost">2/7 because 1 + 1 = 2 and 3 + 4 = 7</button>
                            <button id="s2-check-right" class="s2-btn">7/12 because both fractions were rebuilt into twelfths first</button>
                        </div>
                        <div id="s2-check-feedback" class="s2-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const barThirdEl = host.querySelector('#s2-bar-third');
            const barFourthEl = host.querySelector('#s2-bar-fourth');
            const lcmInputEl = host.querySelector('#s2-lcm');
            const feedbackEl = host.querySelector('#s2-feedback');
            const alertEl = host.querySelector('#s2-alert');
            const checkpointEl = host.querySelector('#s2-check-feedback');

            const renderBar = (el, denominator, active, forcedTwelfths) => {
                el.innerHTML = '';
                const pieces = forcedTwelfths ? 12 : denominator;
                const onCount = forcedTwelfths ? active : 1;
                for (let i = 0; i < pieces; i += 1) {
                    const piece = document.createElement('div');
                    piece.className = `s2-piece ${i < onCount ? 'on' : ''}`;
                    el.appendChild(piece);
                }
            };

            const render = () => {
                renderBar(barThirdEl, 3, 4, state.lcmUnlocked);
                renderBar(barFourthEl, 4, 3, state.lcmUnlocked);
                feedbackEl.textContent = state.sumFeedback;
                alertEl.style.display = state.directAddBlocked ? 'block' : 'none';
                checkpointEl.textContent = state.checkpointFeedback;
            };

            render();

            host.querySelector('#s2-confirm').addEventListener('click', () => {
                state.lcmInput = lcmInputEl.value.trim();
                state.directAddBlocked = false;
                if (state.lcmInput !== '12') {
                    state.lcmUnlocked = false;
                    state.sumFeedback = 'The LCM is not correct yet. Ask which smallest number both 3 and 4 divide into evenly.';
                } else {
                    state.lcmUnlocked = true;
                    state.sumFeedback = 'Correct. 1/3 becomes 4/12 and 1/4 becomes 3/12, so the combined total is 7/12.';
                }
                render();
                onStateChange({ ...state }, 'Stage 2 common denominator updated');
            });

            host.querySelector('#s2-direct-add').addEventListener('click', () => {
                state.directAddBlocked = true;
                state.sumFeedback = 'Blocked on purpose. Denominator mismatch means the piece sizes are different, so direct addition would be dishonest.';
                render();
                onStateChange({ ...state }, 'Stage 2 direct addition blocked');
            });

            host.querySelector('#s2-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap confirmed: 2/7 is not a valid sum because thirds and fourths are different slice sizes. Rebuild both into twelfths first.';
                checkpointEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 2 checkpoint corrected');
            });

            host.querySelector('#s2-check-right').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. Once both bars are expressed in twelfths, 4/12 + 3/12 = 7/12.';
                checkpointEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 2 checkpoint passed');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_common_denominator' && typeof call.arguments?.value === 'string') {
                    nextState.lcmInput = call.arguments.value;
                }
            });
            return nextState;
        }
    };
}
