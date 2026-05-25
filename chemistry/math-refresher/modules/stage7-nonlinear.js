const createInitialStage7State = () => ({
    concentrationInput: '1e-3',
    phFromConcentration: '',
    phInput: '3',
    concentrationFromPh: '',
    feedback: 'Use both directions until logarithmic compression and exponential expansion feel like reverses of each other.',
    beakerPh: 7,
    checkpointFeedback: 'Mastery Checkpoint 1: choose the more acidic solution before worrying about magnitude.',
    multiplierFeedback: 'Mastery Checkpoint 2: then decide how many times more acidic the stronger solution is.',
    jumpRun: false
});

export function createStage7Nonlinear() {
    return {
        id: 'stage7',
        label: 'Exponential and Non-Linear Spaces',
        title: 'Stage 7: Exponential and Non-Linear Spaces',
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

            host.innerHTML = `
                <style>
                    .s7-wrap { display: grid; gap: 1.2rem; }
                    .s7-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s7-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s7-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s7-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s7-pane { border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.75rem; background: #f8fafc; }
                    .s7-controls { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 0.75rem; }
                    .s7-input {
                        width: 100%;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.52rem 0.64rem;
                        font: inherit;
                    }
                    .s7-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s7-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .s7-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s7-matrix {
                        margin-top: 0.75rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .s7-grid { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                    .s7-panebox { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.65rem; background: #ffffff; }
                    .s7-out { margin-top: 0.45rem; border: 1px solid #dbeafe; border-radius: 10px; padding: 0.5rem 0.6rem; background: #eff6ff; color: #1e3a8a; min-height: 2rem; }
                    .s7-beaker-shell { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 0.75rem; }
                    .s7-beaker {
                        position: relative;
                        width: 180px;
                        height: 230px;
                        margin: 0 auto;
                        border: 4px solid #334155;
                        border-top: none;
                        border-bottom-left-radius: 16px;
                        border-bottom-right-radius: 16px;
                        overflow: hidden;
                        background: #f8fafc;
                    }
                    .s7-fluid { position: absolute; left: 0; right: 0; bottom: 0; transition: height 0.25s ease, background 0.25s ease; }
                    .s7-particles { position: absolute; inset: 0; }
                    .s7-particle {
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        border-radius: 999px;
                        background: rgba(255,255,255,0.88);
                        box-shadow: 0 0 8px rgba(255,255,255,0.92);
                    }
                    .s7-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                    .s7-mini-compare { display: grid; gap: 0.6rem; grid-template-columns: repeat(2, minmax(130px, 1fr)); margin-top: 0.55rem; }
                    .s7-mini-box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.45rem; background: #ffffff; }
                    .s7-mini-liquid { height: 56px; border-radius: 8px; position: relative; overflow: hidden; }
                    .s7-mini-dot {
                        position: absolute;
                        width: 5px;
                        height: 5px;
                        border-radius: 999px;
                        background: rgba(255,255,255,0.88);
                    }
                    .s7-jump {
                        margin-top: 0.5rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        padding: 0.55rem;
                    }
                    .s7-jump-track {
                        height: 26px;
                        border: 1px solid #dbeafe;
                        border-radius: 8px;
                        background: #eff6ff;
                        position: relative;
                    }
                    .s7-jump-dot {
                        position: absolute;
                        top: 6px;
                        left: 10%;
                        width: 14px;
                        height: 14px;
                        border-radius: 999px;
                        background: #1d4ed8;
                        transition: left 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
                    }
                    .s7-jump-dot.run { left: 82%; }
                </style>

                <section class="s7-wrap">
                    <article class="s7-card">
                        <h2>Stage Framework</h2>
                        <div class="s7-framework">
                            <div class="s7-pane"><strong>Conceptual Anchor</strong><p>Base-10 logarithms count powers of ten. They are a compact way to describe magnitude changes that would otherwise require long strings of zeros.</p></div>
                            <div class="s7-pane"><strong>Mechanical Algorithm</strong><p>Forward pH uses pH = -log10([H+]). Reverse pH uses [H+] = 10^(-pH). These are inverse operations, so fluency requires both directions.</p></div>
                            <div class="s7-pane"><strong>Cognitive Trap</strong><p>The trap is thinking the pH scale is linear. A change of 3 pH units is not 3 times stronger. It is a thousand-fold shift because each step is a factor of 10.</p></div>
                            <div class="s7-pane"><strong>Science Bridge</strong><p>Acidity, radioactivity, and growth systems often live in non-linear spaces. Logarithms let science talk clearly about enormous or tiny magnitude jumps.</p></div>
                        </div>
                    </article>

                    <article class="s7-card">
                        <h2>Two-Way pH Engine Matrix and Particle Beaker Graphic</h2>
                        <p>Use the two engine directions and the beaker side-by-side. The slider and beaker make the inverse pH relationship physical: lower pH means a heavier hydronium crowd.</p>
                        <div class="s7-matrix">
                            <div class="s7-grid">
                                <div class="s7-panebox">
                                    <h3>Pane A: pH = -log10([H+])</h3>
                                    <input id="s7-conc-input" class="s7-input" value="${state.concentrationInput}" placeholder="Example: 1e-3" />
                                    <button id="s7-forward" class="s7-btn">Compute pH</button>
                                    <div id="s7-forward-out" class="s7-out">${state.phFromConcentration || 'Forward output appears here.'}</div>
                                </div>
                                <div class="s7-panebox">
                                    <h3>Pane B: [H+] = 10^(-pH)</h3>
                                    <input id="s7-ph-input" class="s7-input" value="${state.phInput}" placeholder="Example: 3" />
                                    <button id="s7-reverse" class="s7-btn ghost">Compute Concentration</button>
                                    <div id="s7-reverse-out" class="s7-out">${state.concentrationFromPh || 'Reverse output appears here.'}</div>
                                </div>
                            </div>
                            <div class="s7-feedback">${state.feedback}</div>
                        </div>
                        <div class="s7-beaker-shell">
                            <div>
                                <label class="s7-mini">Beaker pH</label>
                                <input id="s7-beaker-slider" class="s7-input" type="range" min="1" max="14" step="1" value="${Number(state.beakerPh) || 7}" />
                                <div id="s7-beaker-feedback" class="s7-feedback"></div>
                            </div>
                            <div>
                                <div id="s7-beaker" class="s7-beaker">
                                    <div id="s7-fluid" class="s7-fluid"></div>
                                    <div id="s7-particles" class="s7-particles"></div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article class="s7-check">
                        <h2>Mastery Trap-Checkpoints</h2>
                        <p>Checkpoint 1: Solution A has pH 2. Solution B has pH 5. Which is more acidic?</p>
                        <div class="s7-controls">
                            <button id="s7-check-trap" class="s7-btn ghost">Solution B because 5 is the bigger number</button>
                            <button id="s7-check-right" class="s7-btn">Solution A because lower pH means higher [H+]</button>
                        </div>
                        <div class="s7-mini-compare">
                            <div class="s7-mini-box"><div class="s7-mini">pH 2</div><div id="s7-mini-a" class="s7-mini-liquid"></div></div>
                            <div class="s7-mini-box"><div class="s7-mini">pH 5</div><div id="s7-mini-b" class="s7-mini-liquid"></div></div>
                        </div>
                        <div id="s7-check-feedback" class="s7-feedback">${state.checkpointFeedback}</div>
                        <p style="margin-top:0.85rem;">Checkpoint 2: How many times more acidic is pH 2 than pH 5?</p>
                        <div class="s7-controls">
                            <button id="s7-mult-trap" class="s7-btn ghost">3 times more acidic</button>
                            <button id="s7-mult-right" class="s7-btn">1,000 times more acidic</button>
                        </div>
                        <div class="s7-jump">
                            <div class="s7-jump-track"><div id="s7-jump-dot" class="s7-jump-dot${state.jumpRun ? ' run' : ''}"></div></div>
                        </div>
                        <div id="s7-mult-feedback" class="s7-feedback">${state.multiplierFeedback}</div>
                    </article>
                </section>
            `;

            const forwardOutEl = host.querySelector('#s7-forward-out');
            const reverseOutEl = host.querySelector('#s7-reverse-out');
            const beakerFeedbackEl = host.querySelector('#s7-beaker-feedback');
            const fluidEl = host.querySelector('#s7-fluid');
            const particlesEl = host.querySelector('#s7-particles');
            const checkFeedbackEl = host.querySelector('#s7-check-feedback');
            const multFeedbackEl = host.querySelector('#s7-mult-feedback');
            const jumpDotEl = host.querySelector('#s7-jump-dot');
            const miniAEl = host.querySelector('#s7-mini-a');
            const miniBEl = host.querySelector('#s7-mini-b');

            const num = (value) => {
                const parsed = Number(String(value || '').trim());
                return Number.isFinite(parsed) ? parsed : Number.NaN;
            };
            const beakerColor = (ph) => {
                if (ph <= 2) return '#b91c1c';
                if (ph <= 4) return '#ef4444';
                if (ph <= 6) return '#f97316';
                if (ph === 7) return '#22c55e';
                if (ph <= 10) return '#3b82f6';
                return '#6d28d9';
            };
            const particleCount = (ph) => Math.max(4, Math.min(120, Math.round(Math.pow(10, (7 - ph) / 2))));
            const populate = (el, count, className) => {
                el.innerHTML = '';
                for (let i = 0; i < count; i += 1) {
                    const dot = document.createElement('span');
                    dot.className = className;
                    dot.style.left = `${Math.random() * 94 + 2}%`;
                    dot.style.top = `${Math.random() * 88 + 4}%`;
                    el.appendChild(dot);
                }
            };
            const renderMini = () => {
                miniAEl.style.background = 'linear-gradient(180deg, #b91c1c, #7f1d1d)';
                miniBEl.style.background = 'linear-gradient(180deg, #f97316, #9a3412)';
                populate(miniAEl, 32, 's7-mini-dot');
                populate(miniBEl, 8, 's7-mini-dot');
            };
            const renderBeaker = () => {
                const ph = Math.max(1, Math.min(14, Number(host.querySelector('#s7-beaker-slider').value)));
                state.beakerPh = ph;
                const fill = Math.max(24, Math.min(90, 22 + (14 - ph) * 4));
                fluidEl.style.height = `${fill}%`;
                fluidEl.style.background = `linear-gradient(180deg, ${beakerColor(ph)}, #111827)`;
                populate(particlesEl, particleCount(ph), 's7-particle');
                beakerFeedbackEl.textContent = ph <= 3
                    ? `pH ${ph}: very high hydronium crowding. Lower pH means stronger acidity.`
                    : `pH ${ph}: lower hydronium crowding. Higher pH means less acidic solution.`;
                onStateChange({ ...state }, 'Stage 7 beaker updated');
            };

            renderMini();
            renderBeaker();

            host.querySelector('#s7-forward').addEventListener('click', () => {
                const concentration = num(host.querySelector('#s7-conc-input').value);
                if (!(concentration > 0)) {
                    state.feedback = 'Forward engine needs a positive hydrogen-ion concentration.';
                } else {
                    const ph = -Math.log10(concentration);
                    state.concentrationInput = host.querySelector('#s7-conc-input').value.trim();
                    state.phFromConcentration = `pH = -log10(${state.concentrationInput}) = ${ph.toFixed(4)}`;
                    state.feedback = 'Forward logarithmic compression completed.';
                    forwardOutEl.textContent = state.phFromConcentration;
                }
                onStateChange({ ...state }, 'Stage 7 forward engine updated');
            });

            host.querySelector('#s7-reverse').addEventListener('click', () => {
                const ph = num(host.querySelector('#s7-ph-input').value);
                if (!Number.isFinite(ph)) {
                    state.feedback = 'Reverse engine needs a numeric pH value.';
                } else {
                    const concentration = Math.pow(10, -ph);
                    state.phInput = host.querySelector('#s7-ph-input').value.trim();
                    state.concentrationFromPh = `[H+] = 10^(-${state.phInput}) = ${concentration.toExponential(4)} M`;
                    state.feedback = 'Reverse exponential expansion completed.';
                    reverseOutEl.textContent = state.concentrationFromPh;
                }
                onStateChange({ ...state }, 'Stage 7 reverse engine updated');
            });

            host.querySelector('#s7-beaker-slider').addEventListener('input', renderBeaker);

            host.querySelector('#s7-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap detected: lower pH means more acidity. The pH 2 beaker is overflowing with hydronium compared with pH 5.';
                renderMini();
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 7 acidity trap corrected');
            });
            host.querySelector('#s7-check-right').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. Solution A at pH 2 is more acidic because lower pH corresponds to higher [H+].';
                renderMini();
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 7 acidity checkpoint passed');
            });

            const runJump = () => {
                jumpDotEl.classList.remove('run');
                void jumpDotEl.offsetWidth;
                jumpDotEl.classList.add('run');
            };

            host.querySelector('#s7-mult-trap').addEventListener('click', () => {
                state.jumpRun = true;
                state.multiplierFeedback = 'Trap detected: the difference is not 3 times. A three-step pH gap means three tenfold jumps, which is 10^3 = 1,000.';
                runJump();
                multFeedbackEl.textContent = state.multiplierFeedback;
                onStateChange({ ...state }, 'Stage 7 multiplier trap corrected');
            });
            host.querySelector('#s7-mult-right').addEventListener('click', () => {
                state.jumpRun = true;
                state.multiplierFeedback = 'Correct. pH 2 is 1,000 times more acidic than pH 5 because each whole pH step is a tenfold change in concentration.';
                runJump();
                multFeedbackEl.textContent = state.multiplierFeedback;
                onStateChange({ ...state }, 'Stage 7 multiplier checkpoint passed');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_stage7_ph' && Number.isFinite(call.arguments?.value)) {
                    nextState.beakerPh = Math.max(1, Math.min(14, Number(call.arguments.value)));
                }
            });
            return nextState;
        }
    };
}
