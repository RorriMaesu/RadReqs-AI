const createInitialStage4State = () => ({
    charge: 0,
    signedFeedback: 'Add protons to move right and electrons to move left. Signed values are directions on the number line.',
    pemdasFeedback: 'PEMDAS reminder: parentheses decide grouping before signs are combined.',
    checkpointFeedback: 'Mastery Checkpoint: subtracting a negative moves right because removing a leftward quantity reverses direction.',
    checkpointChoice: ''
});

export function createStage4Signed() {
    return {
        id: 'stage4',
        label: 'Signed Numbers and PEMDAS',
        title: 'Stage 4: Signed Numbers and PEMDAS',
        getInitialState() {
            return createInitialStage4State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage4State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .s4-wrap { display: grid; gap: 1.2rem; }
                    .s4-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s4-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s4-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s4-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s4-pane { border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.75rem; background: #f8fafc; }
                    .s4-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s4-controls { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 0.72rem; }
                    .s4-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s4-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .s4-canvas-shell {
                        margin-top: 0.78rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        background: #f8fbff;
                        padding: 0.75rem;
                    }
                    .s4-canvas { width: 100%; max-width: 760px; height: 150px; display: block; background: #ffffff; border-radius: 10px; border: 1px solid #cbd5e1; }
                    .s4-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s4-wrap">
                    <article class="s4-card">
                        <h2>Stage Framework</h2>
                        <div class="s4-framework">
                            <div class="s4-pane"><strong>Conceptual Anchor</strong><p>Signed numbers are positions and directions, not good numbers and bad numbers. Zero is a midpoint, positive values live to the right, and negative values live to the left.</p></div>
                            <div class="s4-pane"><strong>Mechanical Algorithm</strong><p>Adding a positive moves right. Adding a negative moves left. Subtracting a negative reverses that leftward effect and moves back right.</p></div>
                            <div class="s4-pane"><strong>Cognitive Trap</strong><p>The trap is treating signs as decoration instead of direction. That leads learners to subtract symbol shapes instead of reasoning about movement on the line.</p></div>
                            <div class="s4-pane"><strong>Science Bridge</strong><p>Net charge, electron transfer, and temperature change all use signed movement. PEMDAS matters because parentheses can decide whether a negative value stays grouped or changes meaning.</p></div>
                        </div>
                    </article>

                    <article class="s4-card">
                        <h2>Interactive HTML5 Canvas Net Charge Line</h2>
                        <p>The canvas below treats proton and electron actions as real motion. A proton adds +1, so the particle moves right. An electron adds -1, so the particle moves left. If a problem says subtract a negative, that means you are removing leftward pull, which shifts right.</p>
                        <div class="s4-canvas-shell">
                            <canvas id="s4-canvas" class="s4-canvas" width="760" height="150"></canvas>
                            <div class="s4-controls">
                                <button id="s4-add-proton" class="s4-btn">Add Proton (+1)</button>
                                <button id="s4-add-electron" class="s4-btn ghost">Add Electron (-1)</button>
                                <button id="s4-sub-neg" class="s4-btn ghost">Subtract a Negative (-(-1))</button>
                                <button id="s4-reset" class="s4-btn ghost">Reset Number Line</button>
                            </div>
                            <div id="s4-signed-feedback" class="s4-feedback">${state.signedFeedback}</div>
                            <div id="s4-pemdas-feedback" class="s4-feedback">${state.pemdasFeedback}</div>
                        </div>
                    </article>

                    <article class="s4-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>If a charged system is at -3 and you subtract a negative 2, where do you move?</p>
                        <div class="s4-controls">
                            <button id="s4-check-trap" class="s4-btn ghost">Left to -5 because there is another minus sign</button>
                            <button id="s4-check-right" class="s4-btn">Right to -1 because subtracting a negative reverses direction</button>
                        </div>
                        <div id="s4-check-feedback" class="s4-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const canvas = host.querySelector('#s4-canvas');
            const ctx = canvas.getContext('2d');
            const signedFeedbackEl = host.querySelector('#s4-signed-feedback');
            const pemdasFeedbackEl = host.querySelector('#s4-pemdas-feedback');
            const checkFeedbackEl = host.querySelector('#s4-check-feedback');

            const xFor = (value) => 50 + ((value + 10) / 20) * 660;

            const draw = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(50, 75);
                ctx.lineTo(710, 75);
                ctx.stroke();

                for (let value = -10; value <= 10; value += 1) {
                    const x = xFor(value);
                    ctx.strokeStyle = value === 0 ? '#0f172a' : '#94a3b8';
                    ctx.lineWidth = value === 0 ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(x, 60);
                    ctx.lineTo(x, 90);
                    ctx.stroke();
                    ctx.fillStyle = '#334155';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(value > 0 ? `+${value}` : `${value}`, x, 108);
                }

                const particleX = xFor(state.charge);
                ctx.fillStyle = '#0ea5e9';
                ctx.strokeStyle = '#0369a1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(particleX, 40, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#0f172a';
                ctx.font = '700 14px sans-serif';
                ctx.fillText(`Net charge: ${state.charge > 0 ? '+' : ''}${state.charge}`, particleX, 20);
            };

            const setCharge = (nextCharge, message, pemdasMessage) => {
                state.charge = Math.max(-10, Math.min(10, nextCharge));
                state.signedFeedback = message;
                state.pemdasFeedback = pemdasMessage;
                signedFeedbackEl.textContent = state.signedFeedback;
                pemdasFeedbackEl.textContent = state.pemdasFeedback;
                draw();
                onStateChange({ ...state }, 'Stage 4 signed number line updated');
            };

            draw();

            host.querySelector('#s4-add-proton').addEventListener('click', () => {
                setCharge(state.charge + 1, 'A proton adds +1, so the particle moved one step right.', 'No grouping conflict here: plain +1 shifts right on the line.');
            });
            host.querySelector('#s4-add-electron').addEventListener('click', () => {
                setCharge(state.charge - 1, 'An electron adds -1, so the particle moved one step left.', 'A negative addend keeps its leftward direction.');
            });
            host.querySelector('#s4-sub-neg').addEventListener('click', () => {
                setCharge(state.charge + 1, 'Subtracting a negative removes leftward pull, so the system moved right.', 'PEMDAS reminder: the negative sign belongs to the grouped value being subtracted, so the direction reverses.');
            });
            host.querySelector('#s4-reset').addEventListener('click', () => {
                Object.assign(state, createInitialStage4State());
                signedFeedbackEl.textContent = state.signedFeedback;
                pemdasFeedbackEl.textContent = state.pemdasFeedback;
                checkFeedbackEl.textContent = state.checkpointFeedback;
                draw();
                onStateChange({ ...state }, 'Stage 4 reset');
            });

            host.querySelector('#s4-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap triggered: subtracting a negative does not push farther left. Two negatives in this structure reverse direction.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 4 checkpoint corrected');
            });
            host.querySelector('#s4-check-right').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. Starting at -3 and subtracting -2 means moving right two units to -1.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 4 checkpoint passed');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_signed_charge' && Number.isFinite(call.arguments?.value)) {
                    nextState.charge = Math.max(-10, Math.min(10, Number(call.arguments.value)));
                }
            });
            return nextState;
        }
    };
}
