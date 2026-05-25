const createInitialPhase5State = () => ({
    logStep: 0,
    logFeedback: 'Move the slider to watch decimal shifts and logarithmic counting happen together.',
    forwardInput: '1e-3',
    forwardOutput: '',
    reverseInput: '3',
    reverseOutput: '',
    matrixFeedback: 'Practice both directions until switching between compression and expansion feels automatic.',
    beakerPh: 7,
    beakerFeedback: 'Lower pH means stronger acidity because [H+] rises exponentially as pH drops.',
    checkAcidityChoice: '',
    checkAcidityFeedback: 'Checkpoint 1: choose which solution is more acidic.',
    checkMultiplierChoice: '',
    checkMultiplierFeedback: 'Checkpoint 2: if you select the stronger acid correctly, choose the magnitude difference.',
    decimalJumpActive: false
});

export function createPhase5LogEngine() {
    return {
        id: 'phase5',
        label: 'Non-Linear Spaces',
        title: 'Phase 5: Non-Linear Spaces (Logarithms and The Two-Way pH Engine)',
        getInitialState() {
            return createInitialPhase5State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialPhase5State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .p5-wrap { display: grid; gap: 1.2rem; }
                    .p5-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .p5-card h2 { margin: 0 0 0.6rem; color: #0f172a; }
                    .p5-card h3 { margin: 0 0 0.45rem; color: #1e3a8a; }
                    .p5-card p { color: #334155; line-height: 1.62; margin: 0.55rem 0; }
                    .p5-mini { color: #475569; font-size: 0.92rem; }
                    .p5-feedback {
                        margin-top: 0.65rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .p5-controls {
                        margin-top: 0.72rem;
                        display: grid;
                        gap: 0.6rem;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    }
                    .p5-input {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.52rem 0.64rem;
                        width: 100%;
                        font: inherit;
                    }
                    .p5-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.52rem 0.74rem;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .p5-btn.ghost {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .p5-log-stage {
                        margin-top: 0.78rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p5-scale {
                        position: relative;
                        height: 62px;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: linear-gradient(180deg, #ffffff, #f8fafc);
                        overflow: hidden;
                    }
                    .p5-track-line {
                        position: absolute;
                        top: 30px;
                        left: 5%;
                        right: 5%;
                        height: 3px;
                        background: #94a3b8;
                        border-radius: 999px;
                    }
                    .p5-dot {
                        position: absolute;
                        top: 18px;
                        width: 24px;
                        height: 24px;
                        border-radius: 999px;
                        transform: translateX(-50%);
                        background: #0ea5e9;
                        border: 2px solid #0369a1;
                        box-shadow: 0 2px 0 #075985;
                        transition: left 0.22s ease;
                    }
                    .p5-kpi {
                        margin-top: 0.5rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        padding: 0.52rem 0.62rem;
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .p5-matrix {
                        margin-top: 0.78rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p5-matrix-grid {
                        display: grid;
                        gap: 0.7rem;
                        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    }
                    .p5-pane {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.62rem;
                        background: #ffffff;
                    }
                    .p5-out {
                        margin-top: 0.5rem;
                        border: 1px solid #dbeafe;
                        border-radius: 10px;
                        padding: 0.48rem 0.58rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        min-height: 2.1rem;
                    }
                    .p5-beaker-grid {
                        margin-top: 0.78rem;
                        display: grid;
                        gap: 0.7rem;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    }
                    .p5-beaker-wrap {
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        background: #ffffff;
                        padding: 0.7rem;
                    }
                    .p5-beaker {
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
                    .p5-fluid {
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        transition: height 0.3s ease, background 0.3s ease;
                    }
                    .p5-particles {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                    }
                    .p5-particle {
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        border-radius: 999px;
                        background: rgba(255, 255, 255, 0.85);
                        box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
                        opacity: 0.78;
                    }
                    .p5-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                    .p5-check-grid {
                        display: grid;
                        gap: 0.9rem;
                        margin-top: 0.75rem;
                    }
                    .p5-check-item {
                        border: 1px dashed #93c5fd;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p5-dual-beaker {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(130px, 1fr));
                        gap: 0.6rem;
                        margin-top: 0.5rem;
                    }
                    .p5-mini-beaker {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.45rem;
                        background: #ffffff;
                    }
                    .p5-mini-liquid {
                        height: 54px;
                        border-radius: 8px;
                        transition: background 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .p5-mini-particle {
                        position: absolute;
                        width: 5px;
                        height: 5px;
                        border-radius: 999px;
                        background: rgba(255,255,255,0.88);
                        box-shadow: 0 0 6px rgba(255,255,255,0.9);
                    }
                    .p5-jump {
                        margin-top: 0.48rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        padding: 0.52rem;
                        overflow: hidden;
                    }
                    .p5-jump-track {
                        height: 26px;
                        border: 1px solid #dbeafe;
                        border-radius: 8px;
                        background: #eff6ff;
                        position: relative;
                    }
                    .p5-jump-dot {
                        position: absolute;
                        top: 6px;
                        left: 10%;
                        width: 14px;
                        height: 14px;
                        border-radius: 999px;
                        background: #1d4ed8;
                        transition: left 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
                    }
                    .p5-jump-dot.run { left: 82%; }
                </style>

                <section class="p5-wrap">
                    <article class="p5-card">
                        <h2>1) The Logarithmic Magnitude Slider (Logs as Factor Counters)</h2>
                        <p>
                            Logarithms often feel scary because they are introduced as symbols before meaning. In base 10, a logarithm is a factor counter:
                            it tells you how many powers of ten are hidden inside a number. You can think of it as an un-exponent button that reverses
                            ten-to-a-power notation.
                        </p>
                        <p>
                            In chemistry, concentration values can be extremely small. Writing many zeros repeatedly is error-prone and hard to compare quickly.
                            Logs compress those tiny magnitudes into manageable values by counting decimal movement. A value like 0.0000001 has seven decimal-place
                            moves from 1.0, so the log10 value is -7.
                        </p>
                        <p>
                            Use the slider to move between 1.0 and 0.0000001. Watch the decimal form and logarithmic count update together so your intuition
                            links place-value movement to logarithmic magnitude.
                        </p>

                        <div class="p5-log-stage">
                            <label class="p5-mini">Magnitude step (0 to -7)</label>
                            <input id="p5-log-slider" class="p5-input" type="range" min="0" max="7" step="1" value="${Number(state.logStep) || 0}" />
                            <div class="p5-scale">
                                <div class="p5-track-line"></div>
                                <div id="p5-log-dot" class="p5-dot"></div>
                            </div>
                            <div id="p5-log-kpi" class="p5-kpi"></div>
                            <div id="p5-log-feedback" class="p5-feedback">${state.logFeedback}</div>
                        </div>
                    </article>

                    <article class="p5-card">
                        <h2>2) The Two-Way pH Engine Matrix</h2>
                        <p>
                            pH work is bidirectional. Sometimes a problem gives concentration and asks for pH. Other times it gives pH and asks for concentration.
                            Mastery means running both directions comfortably: logarithmic compression in one direction and exponential expansion in the other.
                        </p>
                        <p>
                            Forward direction: pH = -log10([H+]). This compresses concentration magnitude into pH units.
                            Reverse direction: [H+] = 10^(-pH). This is the antilog step that unpacks pH back into physical concentration.
                        </p>

                        <div class="p5-matrix">
                            <div class="p5-matrix-grid">
                                <div class="p5-pane">
                                    <h3>Direction A: Forward Engine</h3>
                                    <div class="p5-mini">Input [H+] concentration in molarity</div>
                                    <input id="p5-forward-input" class="p5-input" type="text" value="${state.forwardInput}" placeholder="Example: 1e-3" />
                                    <button id="p5-forward-run" class="p5-btn">Compute pH = -log10([H+])</button>
                                    <div id="p5-forward-out" class="p5-out">${state.forwardOutput || 'Forward output appears here.'}</div>
                                </div>
                                <div class="p5-pane">
                                    <h3>Direction B: Reverse Engine</h3>
                                    <div class="p5-mini">Input pH value</div>
                                    <input id="p5-reverse-input" class="p5-input" type="text" value="${state.reverseInput}" placeholder="Example: 3" />
                                    <button id="p5-reverse-run" class="p5-btn ghost">Compute [H+] = 10^(-pH)</button>
                                    <div id="p5-reverse-out" class="p5-out">${state.reverseOutput || 'Reverse output appears here.'}</div>
                                </div>
                            </div>
                            <div id="p5-matrix-feedback" class="p5-feedback">${state.matrixFeedback}</div>
                        </div>
                    </article>

                    <article class="p5-card">
                        <h2>3) The Particle Beaker Solution Graphic</h2>
                        <p>
                            The pH scale is inverse because of the negative sign in pH = -log10([H+]). A smaller pH number does not mean weaker acid.
                            It means a larger hydrogen-ion concentration. That inversion is the most common conceptual trap, especially for returning learners
                            who naturally associate bigger numbers with bigger intensity.
                        </p>
                        <p>
                            Use the pH slider and watch the beaker transform. As pH drops from 14 to 1, color shifts toward acidic red and hydronium particle
                            density rises rapidly. This makes the inverse relationship visible: low pH corresponds to physically crowded acidic environments.
                        </p>

                        <div class="p5-beaker-grid">
                            <div class="p5-beaker-wrap">
                                <label class="p5-mini">Beaker pH slider (14 down to 1)</label>
                                <input id="p5-beaker-slider" class="p5-input" type="range" min="1" max="14" step="1" value="${Number(state.beakerPh) || 7}" />
                                <div class="p5-kpi" id="p5-beaker-kpi"></div>
                                <div id="p5-beaker-feedback" class="p5-feedback">${state.beakerFeedback}</div>
                            </div>
                            <div class="p5-beaker-wrap">
                                <div id="p5-beaker" class="p5-beaker">
                                    <div id="p5-fluid" class="p5-fluid"></div>
                                    <div id="p5-particles" class="p5-particles"></div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article class="p5-check">
                        <h2>Mastery Check-in</h2>
                        <p>
                            Complete both checkpoints to verify inverse reasoning and non-linear multiplier understanding on the pH scale.
                        </p>

                        <div class="p5-check-grid">
                            <section class="p5-check-item">
                                <h3>Inverse Magnitude Trap Checkpoint</h3>
                                <p class="p5-mini">Solution A has pH 2. Solution B has pH 5. Which solution is more acidic?</p>
                                <div class="p5-controls">
                                    <button id="p5-check-acid-trap" class="p5-btn ghost">Solution B (pH 5) because 5 is larger</button>
                                    <button id="p5-check-acid-right" class="p5-btn">Solution A (pH 2) is more acidic</button>
                                </div>
                                <div class="p5-dual-beaker">
                                    <div class="p5-mini-beaker">
                                        <div class="p5-mini">Solution A (pH 2)</div>
                                        <div id="p5-mini-a" class="p5-mini-liquid"></div>
                                    </div>
                                    <div class="p5-mini-beaker">
                                        <div class="p5-mini">Solution B (pH 5)</div>
                                        <div id="p5-mini-b" class="p5-mini-liquid"></div>
                                    </div>
                                </div>
                                <div id="p5-check-acid-feedback" class="p5-feedback">${state.checkAcidityFeedback}</div>
                            </section>

                            <section class="p5-check-item">
                                <h3>Multiplier Leap Checkpoint</h3>
                                <p class="p5-mini">If pH 2 is stronger than pH 5, how many times more acidic is it?</p>
                                <div class="p5-controls">
                                    <button id="p5-check-mult-trap" class="p5-btn ghost">3 times more acidic</button>
                                    <button id="p5-check-mult-right" class="p5-btn">1,000 times more acidic</button>
                                </div>
                                <div class="p5-jump">
                                    <div class="p5-mini">Decimal shift visual (three place leaps)</div>
                                    <div class="p5-jump-track">
                                        <div id="p5-jump-dot" class="p5-jump-dot${state.decimalJumpActive ? ' run' : ''}"></div>
                                    </div>
                                </div>
                                <div id="p5-check-mult-feedback" class="p5-feedback">${state.checkMultiplierFeedback}</div>
                            </section>
                        </div>
                    </article>
                </section>
            `;

            const logSlider = host.querySelector('#p5-log-slider');
            const logDot = host.querySelector('#p5-log-dot');
            const logKpi = host.querySelector('#p5-log-kpi');
            const logFeedbackEl = host.querySelector('#p5-log-feedback');

            const forwardInputEl = host.querySelector('#p5-forward-input');
            const reverseInputEl = host.querySelector('#p5-reverse-input');
            const forwardOutEl = host.querySelector('#p5-forward-out');
            const reverseOutEl = host.querySelector('#p5-reverse-out');
            const matrixFeedbackEl = host.querySelector('#p5-matrix-feedback');

            const beakerSlider = host.querySelector('#p5-beaker-slider');
            const beakerKpi = host.querySelector('#p5-beaker-kpi');
            const beakerFeedbackEl = host.querySelector('#p5-beaker-feedback');
            const fluidEl = host.querySelector('#p5-fluid');
            const particlesEl = host.querySelector('#p5-particles');

            const checkAcidFeedbackEl = host.querySelector('#p5-check-acid-feedback');
            const checkMultFeedbackEl = host.querySelector('#p5-check-mult-feedback');
            const jumpDotEl = host.querySelector('#p5-jump-dot');
            const miniAEl = host.querySelector('#p5-mini-a');
            const miniBEl = host.querySelector('#p5-mini-b');

            const stepToValue = (step) => Math.pow(10, -step);
            const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

            const safeNum = (value) => {
                const n = Number(String(value || '').trim());
                return Number.isFinite(n) ? n : Number.NaN;
            };

            const concentrationForPh = (ph) => Math.pow(10, -ph);

            const beakerColorByPh = (ph) => {
                if (ph <= 2) return '#b91c1c';
                if (ph <= 4) return '#ef4444';
                if (ph <= 6) return '#f97316';
                if (ph === 7) return '#22c55e';
                if (ph <= 9) return '#06b6d4';
                if (ph <= 11) return '#3b82f6';
                return '#4f46e5';
            };

            const particleCountByPh = (ph) => {
                const mapped = Math.round(Math.pow(10, (7 - ph) / 2));
                return clamp(mapped, 4, 120);
            };

            const populateParticles = (el, count) => {
                el.innerHTML = '';
                for (let i = 0; i < count; i += 1) {
                    const dot = document.createElement('span');
                    dot.className = 'p5-particle';
                    dot.style.left = `${Math.random() * 94 + 2}%`;
                    dot.style.top = `${Math.random() * 92 + 2}%`;
                    dot.style.opacity = `${0.45 + Math.random() * 0.5}`;
                    el.appendChild(dot);
                }
            };

            const populateMiniParticles = (el, count) => {
                el.innerHTML = '';
                const dots = clamp(count, 2, 36);
                for (let i = 0; i < dots; i += 1) {
                    const dot = document.createElement('span');
                    dot.className = 'p5-mini-particle';
                    dot.style.left = `${Math.random() * 92 + 2}%`;
                    dot.style.top = `${Math.random() * 88 + 4}%`;
                    el.appendChild(dot);
                }
            };

            const renderLogSlider = () => {
                const step = clamp(Number(logSlider.value), 0, 7);
                state.logStep = step;
                const value = stepToValue(step);
                const logv = Math.log10(value);
                const leftPct = 5 + (step / 7) * 90;
                logDot.style.left = `${leftPct}%`;
                logKpi.textContent = `Value: ${value.toFixed(step === 0 ? 1 : step)} | log10(value) = ${logv.toFixed(0)}`;
                state.logFeedback = step === 0
                    ? 'At 1.0, log10 is 0 because no decimal-place shift is needed.'
                    : `Decimal shifted ${step} place${step > 1 ? 's' : ''}; log10 count is ${-step}.`;
                logFeedbackEl.textContent = state.logFeedback;
                onStateChange({ ...state }, 'Phase 5 log slider updated');
            };

            const renderBeaker = () => {
                const ph = clamp(Number(beakerSlider.value), 1, 14);
                state.beakerPh = ph;
                const concentration = concentrationForPh(ph);
                const color = beakerColorByPh(ph);
                const particles = particleCountByPh(ph);

                const fillHeight = clamp(22 + (14 - ph) * 4, 24, 90);
                fluidEl.style.height = `${fillHeight}%`;
                fluidEl.style.background = `linear-gradient(180deg, ${color}, #111827)`;
                populateParticles(particlesEl, particles);

                beakerKpi.textContent = `pH ${ph} | [H+] = ${concentration.toExponential(3)} M | visual particle density = ${particles}`;
                state.beakerFeedback = ph <= 3
                    ? 'Low pH means high hydronium concentration. The beaker is crowded because acidity is physically intense here.'
                    : ph >= 11
                        ? 'High pH corresponds to low hydronium concentration, so acidic particle crowding is sparse.'
                        : 'Mid-range pH values show intermediate particle intensity.';
                beakerFeedbackEl.textContent = state.beakerFeedback;
                onStateChange({ ...state }, 'Phase 5 beaker updated');
            };

            const renderMiniComparison = () => {
                miniAEl.style.background = 'linear-gradient(180deg, #b91c1c, #7f1d1d)';
                miniBEl.style.background = 'linear-gradient(180deg, #f97316, #9a3412)';
                populateMiniParticles(miniAEl, 34);
                populateMiniParticles(miniBEl, 8);
            };

            const runForward = () => {
                const h = safeNum(forwardInputEl.value);
                if (!(h > 0)) {
                    state.matrixFeedback = 'Forward engine needs a positive [H+] concentration.';
                    matrixFeedbackEl.textContent = state.matrixFeedback;
                    onStateChange({ ...state }, 'Phase 5 forward blocked');
                    return;
                }
                const ph = -Math.log10(h);
                state.forwardInput = forwardInputEl.value.trim();
                state.forwardOutput = `pH = -log10(${state.forwardInput}) = ${ph.toFixed(4)}`;
                state.matrixFeedback = 'Forward pathway complete: concentration compressed into pH.';
                forwardOutEl.textContent = state.forwardOutput;
                matrixFeedbackEl.textContent = state.matrixFeedback;
                onStateChange({ ...state }, 'Phase 5 forward computed');
            };

            const runReverse = () => {
                const ph = safeNum(reverseInputEl.value);
                if (!Number.isFinite(ph)) {
                    state.matrixFeedback = 'Reverse engine needs a numeric pH value.';
                    matrixFeedbackEl.textContent = state.matrixFeedback;
                    onStateChange({ ...state }, 'Phase 5 reverse blocked');
                    return;
                }
                const h = concentrationForPh(ph);
                state.reverseInput = reverseInputEl.value.trim();
                state.reverseOutput = `[H+] = 10^(-${state.reverseInput}) = ${h.toExponential(4)} M`;
                state.matrixFeedback = 'Reverse pathway complete: pH expanded back to concentration.';
                reverseOutEl.textContent = state.reverseOutput;
                matrixFeedbackEl.textContent = state.matrixFeedback;
                onStateChange({ ...state }, 'Phase 5 reverse computed');
            };

            const triggerJumpAnimation = () => {
                jumpDotEl.classList.remove('run');
                void jumpDotEl.offsetWidth;
                jumpDotEl.classList.add('run');
            };

            const selectAcidityTrap = () => {
                state.checkAcidityChoice = 'trap';
                state.checkAcidityFeedback = 'Trap detected: lower pH is more acidic. Solution A (pH 2) has far more hydronium than Solution B (pH 5).';
                renderMiniComparison();
                checkAcidFeedbackEl.textContent = state.checkAcidityFeedback;
                onStateChange({ ...state }, 'Phase 5 checkpoint acidity trap');
            };

            const selectAcidityCorrect = () => {
                state.checkAcidityChoice = 'right';
                state.checkAcidityFeedback = 'Correct. Solution A (pH 2) is more acidic because lower pH means higher [H+] concentration.';
                renderMiniComparison();
                checkAcidFeedbackEl.textContent = state.checkAcidityFeedback;
                onStateChange({ ...state }, 'Phase 5 checkpoint acidity correct');
            };

            const selectMultiplierTrap = () => {
                state.checkMultiplierChoice = 'trap';
                state.checkMultiplierFeedback = 'Non-linear trap: the gap is not 3 times. Each pH unit is a 10x concentration change, so 3 pH units means 10^3.';
                state.decimalJumpActive = true;
                triggerJumpAnimation();
                checkMultFeedbackEl.textContent = state.checkMultiplierFeedback;
                onStateChange({ ...state }, 'Phase 5 checkpoint multiplier trap');
            };

            const selectMultiplierCorrect = () => {
                state.checkMultiplierChoice = 'right';
                state.checkMultiplierFeedback = 'Correct: pH 2 is 1,000 times more acidic than pH 5 because 10^(5-2) = 10^3 = 1,000.';
                state.decimalJumpActive = true;
                triggerJumpAnimation();
                checkMultFeedbackEl.textContent = state.checkMultiplierFeedback;
                onStateChange({ ...state }, 'Phase 5 checkpoint multiplier correct');
            };

            host.querySelector('#p5-forward-run').addEventListener('click', runForward);
            host.querySelector('#p5-reverse-run').addEventListener('click', runReverse);
            host.querySelector('#p5-check-acid-trap').addEventListener('click', selectAcidityTrap);
            host.querySelector('#p5-check-acid-right').addEventListener('click', selectAcidityCorrect);
            host.querySelector('#p5-check-mult-trap').addEventListener('click', selectMultiplierTrap);
            host.querySelector('#p5-check-mult-right').addEventListener('click', selectMultiplierCorrect);

            logSlider.value = String(clamp(Number(state.logStep) || 0, 0, 7));
            beakerSlider.value = String(clamp(Number(state.beakerPh) || 7, 1, 14));

            logSlider.addEventListener('input', renderLogSlider);
            beakerSlider.addEventListener('input', renderBeaker);

            forwardOutEl.textContent = state.forwardOutput || 'Forward output appears here.';
            reverseOutEl.textContent = state.reverseOutput || 'Reverse output appears here.';
            matrixFeedbackEl.textContent = state.matrixFeedback;
            checkAcidFeedbackEl.textContent = state.checkAcidityFeedback;
            checkMultFeedbackEl.textContent = state.checkMultiplierFeedback;

            if (state.decimalJumpActive) {
                jumpDotEl.classList.add('run');
            }

            renderLogSlider();
            renderBeaker();
            renderMiniComparison();
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_ph_input' && typeof call.arguments?.value === 'string') {
                    if (call.arguments.direction === 'forward') {
                        nextState.forwardInput = call.arguments.value;
                    }
                    if (call.arguments.direction === 'reverse') {
                        nextState.reverseInput = call.arguments.value;
                    }
                }
                if (call?.name === 'set_beaker_ph' && Number.isFinite(call.arguments?.value)) {
                    nextState.beakerPh = Math.max(1, Math.min(14, Number(call.arguments.value)));
                }
            });
            return nextState;
        }
    };
}
