const createInitialStage10State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L10.1 The Mathematical Function
    l101Choice: '',
    l101Feedback: 'L10.1: In C = 2n + 1, identify the dependent variable.',
    l101Done: false,

    // L10.2 Mathematical Domain Limits
    domainAnswers: { divide: '', log: '', sqrt: '' },
    domainFeedback: 'L10.2: Avoid divide-by-zero, log of negative values, and square roots of negatives in real-number mode.',
    l102Done: false,

    // L10.3 Exponential Growth & Decay
    l103Choice: '',
    l103Feedback: 'L10.3: Classify N(t) = 500(0.80)^t as growth or decay.',
    l103Done: false,

    // L10.4 Logarithms Base-10
    l104Answer: '',
    l104Feedback: 'L10.4: Compute log10(10000).',
    l104Done: false,

    // L10.5 Logarithm Rules
    match1: '',
    match2: '',
    match3: '',
    logFeedback: 'L10.5: Match product, quotient, and power log rules.',
    l105Done: false,

    // L10.6 Base e & Natural Logs
    l106Choice: '',
    l106Feedback: 'L10.6: Evaluate ln(e^3).',
    l106Done: false,

    // L10.7 Logarithmic Science Scales
    phValue: 7,
    phFeedback: 'L10.7: Set pH = 3 and observe the logarithmic concentration jump.',
    l107Done: false,

    // L10.8 Right-Triangle Trigonometry
    l108Choice: '',
    l108Feedback: 'L10.8: Identify the correct sine ratio.',
    l108Done: false,

    // L10.9 The Unit Circle
    thetaVal: 0,
    circleFeedback: 'L10.9: Select the Quadrant I angle where sin(theta) = 0.5.',
    l109Done: false,

    // L10.10 Trigonometric Wave Mechanics
    l1010Choice: '',
    l1010Feedback: 'L10.10: For frequency f = 5 Hz, determine the period T.',
    l1010Done: false,

    // L10.11 Wave Kinematics
    waveWavelength: '',
    waveFeedback: 'L10.11: Solve lambda = v / f with v = 340 m/s and f = 170 Hz.',
    l1011Done: false,

    // L10.12 The Mathematical p-Operator (pX)
    pKaInput: '',
    pKaFeedback: 'L10.12: For pKa = 4.74, compute Ka = 10^(-pKa).',
    l1012Done: false,

    // L10.13 Logarithmic Significant Figures
    sigFigChoice: '',
    sigFigFeedback: 'L10.13: If pKa has 2 decimal places, how many significant figures should Ka have?',
    l1013Done: false
});

export function createStage10Advanced() {
    return {
        id: 'stage10',
        label: 'Advanced Functions & Waves',
        title: 'Stage 10: Advanced Functions, Logarithms & Waves',
        getInitialState() {
            return createInitialStage10State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage10State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            const s10Antilog = getParams('s10-antilog', { ph: 4.74, answerKey: '1.8e-5' });

            const syncUnlocks = () => {
                if (state.fastTrack) {
                    state.concreteUnlocked = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    return;
                }

                state.concreteUnlocked = true;
                const concreteDone = state.l101Done && state.l102Done && state.l103Done;
                const pictorialDone = state.l104Done && state.l105Done && state.l106Done && state.l107Done;
                const abstractDone = state.l108Done && state.l109Done && state.l1010Done;

                state.pictorialUnlocked = concreteDone;
                state.abstractUnlocked = concreteDone && pictorialDone;
                state.appliedUnlocked = concreteDone && pictorialDone && abstractDone;
            };

            syncUnlocks();

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's10-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            let dotsCount = 0;
            if (state.phValue === 1) dotsCount = 40;
            else if (state.phValue === 2) dotsCount = 20;
            else if (state.phValue === 3) dotsCount = 10;
            else if (state.phValue === 4) dotsCount = 5;
            else if (state.phValue === 5) dotsCount = 2;
            else dotsCount = 1;

            let dotsHtml = '';
            for (let i = 0; i < dotsCount; i++) {
                const rx = 45 + Math.floor(Math.sin(i * 12) * 50 + 50);
                const ry = 100 + Math.floor(Math.cos(i * 23) * 35 + 40);
                dotsHtml += `<circle cx="${rx}" cy="${ry}" r="4.5" fill="#ef4444" fill-opacity="0.85" />`;
            }

            const rad = (state.thetaVal * Math.PI) / 180;
            const cosX = Math.cos(rad);
            const sinY = Math.sin(rad);
            const px = 100 + cosX * 70;
            const py = 100 - sinY * 70;

            host.innerHTML = `
                <style>
                    .s10-wrap { display: grid; gap: 1.2rem; }
                    .s10-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s10-card h2, .s10-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s10-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s10-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s10-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s10-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s10-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s10-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s10-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s10-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s10-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s10-btn:hover { background: #fbbf24; }
                    .s10-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s10-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s10-btn.active, .s10-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s10-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s10-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s10-level.s10-locked { opacity: 0.52; position: relative; }
                    .s10-level.s10-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s10-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    .s10-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; }
                    .s10-beaker-svg { width: 180px; height: 180px; }
                    .s10-beaker-outline { stroke: #94a3b8; stroke-width: 4; fill: none; stroke-linecap: round; }
                    .s10-beaker-water { fill: rgba(14, 165, 233, 0.15); }
                    .s10-plot-svg { width: 220px; height: 220px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; background: rgba(15, 23, 42, 0.8); }
                    .s10-axis { stroke: rgba(255, 255, 255, 0.15); stroke-width: 1.5; }
                    .s10-slider { width: 100%; cursor: pointer; accent-color: #f59e0b; }
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s10-wrap">
                    <article class="s10-card s10-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your logarithms, natural logs, and wave basics. Perfect score unlocks Fast-Track.</p>
                        <div class="s10-grid">
                            <div class="s10-pane">
                                <strong>1. Base-10 Logarithms</strong>
                                <p>What is log10(1000)?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q1 === '3' ? 'active' : ''}" data-diag="q1" data-value="3">3</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q1 === '100' ? 'active' : ''}" data-diag="q1" data-value="100">100</button>
                                </div>
                            </div>
                            <div class="s10-pane">
                                <strong>2. Natural Logs</strong>
                                <p>What is ln(e^2)?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q2 === '2' ? 'active' : ''}" data-diag="q2" data-value="2">2</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q2 === 'e' ? 'active' : ''}" data-diag="q2" data-value="e">e</button>
                                </div>
                            </div>
                            <div class="s10-pane">
                                <strong>3. Wave Speed</strong>
                                <p>If f = 2.0 x 10^14 Hz and lambda = 1.5 x 10^-6 m, what is v = f * lambda?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q3 === 'c' ? 'active' : ''}" data-diag="q3" data-value="c">3.0 x 10^8 m/s</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q3 === 'wrong' ? 'active' : ''}" data-diag="q3" data-value="wrong">3.0 x 10^20 m/s</button>
                                </div>
                            </div>
                        </div>
                        <div class="s10-grid" style="margin-top:0.75rem;">
                            <button id="s10-check-diagnostic" class="s10-btn">Check Diagnostic</button>
                        </div>
                        <div id="s10-diagnostic-feedback" class="s10-feedback">${state.diagnosticFeedback}</div>
                        <div class="s10-status">
                            <span class="s10-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s10-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s10-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s10-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s10-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <article class="s10-card s10-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: L10.1-L10.3 Function Foundations</h2>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.1 The Mathematical Function</strong>
                            <p>Given C = 2n + 1, which variable depends on the other?</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.l101Choice === 'c_dep' ? 'active' : ''}" data-l101="c_dep" ${disabled(state.concreteUnlocked)}>C depends on n</button>
                                <button class="s10-btn ghost ${state.l101Choice === 'n_dep' ? 'active' : ''}" data-l101="n_dep" ${disabled(state.concreteUnlocked)}>n depends on C</button>
                            </div>
                            <button id="s10-check-l101" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.concreteUnlocked)}>Verify L10.1</button>
                            <div class="s10-feedback">${state.l101Feedback}</div>
                        </div>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.2 Mathematical Domain Limits</strong>
                            <p>Choose the valid status for each expression in real-number arithmetic.</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                                <select id="s10-domain-divide" class="s10-input" ${disabled(state.concreteUnlocked)}>
                                    <option value="">1/(x-2) at x=2</option>
                                    <option value="undefined" ${state.domainAnswers.divide === 'undefined' ? 'selected' : ''}>Undefined</option>
                                    <option value="defined" ${state.domainAnswers.divide === 'defined' ? 'selected' : ''}>Defined</option>
                                </select>
                                <select id="s10-domain-log" class="s10-input" ${disabled(state.concreteUnlocked)}>
                                    <option value="">log10(-5)</option>
                                    <option value="invalid" ${state.domainAnswers.log === 'invalid' ? 'selected' : ''}>Invalid (real domain)</option>
                                    <option value="valid" ${state.domainAnswers.log === 'valid' ? 'selected' : ''}>Valid</option>
                                </select>
                                <select id="s10-domain-sqrt" class="s10-input" ${disabled(state.concreteUnlocked)}>
                                    <option value="">sqrt(-1)</option>
                                    <option value="noreal" ${state.domainAnswers.sqrt === 'noreal' ? 'selected' : ''}>No real value</option>
                                    <option value="real" ${state.domainAnswers.sqrt === 'real' ? 'selected' : ''}>Real value</option>
                                </select>
                            </div>
                            <button id="s10-check-domain" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.concreteUnlocked)}>Verify L10.2</button>
                            <div class="s10-feedback">${state.domainFeedback}</div>
                        </div>

                        <div class="s10-pane">
                            <strong>L10.3 Exponential Growth & Decay</strong>
                            <p>Classify N(t) = 500(0.80)^t.</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.l103Choice === 'growth' ? 'active' : ''}" data-l103="growth" ${disabled(state.concreteUnlocked)}>Growth</button>
                                <button class="s10-btn ghost ${state.l103Choice === 'decay' ? 'active' : ''}" data-l103="decay" ${disabled(state.concreteUnlocked)}>Decay</button>
                            </div>
                            <button id="s10-check-l103" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.concreteUnlocked)}>Verify L10.3</button>
                            <div class="s10-feedback">${state.l103Feedback}</div>
                        </div>
                    </article>

                    <article class="s10-card s10-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: L10.4-L10.7 Logarithmic Models</h2>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.4 Logarithms Base-10</strong>
                            <p>Compute log10(10000).</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" id="s10-l104-input" class="s10-input" placeholder="e.g. 4" value="${state.l104Answer}" ${disabled(state.pictorialUnlocked)}>
                                <button id="s10-check-l104" class="s10-btn" ${disabled(state.pictorialUnlocked)}>Verify L10.4</button>
                            </div>
                            <div class="s10-feedback">${state.l104Feedback}</div>
                        </div>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.5 Logarithm Rules</strong>
                            <div class="s10-grid" style="grid-template-columns: 1.2fr 1fr; gap:0.6rem; align-items:center;">
                                <span>Product: log_b(xy)</span>
                                <select id="s10-log-m1" class="s10-input" ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match1 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match1 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match1 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                                <span>Quotient: log_b(x/y)</span>
                                <select id="s10-log-m2" class="s10-input" ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match2 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match2 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match2 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                                <span>Power: log_b(x^y)</span>
                                <select id="s10-log-m3" class="s10-input" ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match3 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match3 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match3 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                            </div>
                            <button id="s10-check-logRules" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.pictorialUnlocked)}>Verify L10.5</button>
                            <div class="s10-feedback">${state.logFeedback}</div>
                        </div>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.6 Base e & Natural Logs</strong>
                            <p>Evaluate ln(e^3).</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.l106Choice === '3' ? 'active' : ''}" data-l106="3" ${disabled(state.pictorialUnlocked)}>3</button>
                                <button class="s10-btn ghost ${state.l106Choice === 'e3' ? 'active' : ''}" data-l106="e3" ${disabled(state.pictorialUnlocked)}>e^3</button>
                            </div>
                            <button id="s10-check-l106" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.pictorialUnlocked)}>Verify L10.6</button>
                            <div class="s10-feedback">${state.l106Feedback}</div>
                        </div>

                        <div class="s10-pane">
                            <strong>L10.7 Logarithmic Science Scales (pH)</strong>
                            <p>The pH scale is logarithmic: pH = -log10([H3O+]). Set pH to 3.</p>
                            <div class="s10-svg-container">
                                <svg class="s10-beaker-svg" viewBox="0 0 200 200">
                                    <rect class="s10-beaker-water" x="40" y="80" width="120" height="110" rx="4" />
                                    <line x1="160" y1="100" x2="150" y2="100" stroke="#94a3b8" stroke-width="2" />
                                    <line x1="160" y1="130" x2="150" y2="130" stroke="#94a3b8" stroke-width="2" />
                                    <line x1="160" y1="160" x2="150" y2="160" stroke="#94a3b8" stroke-width="2" />
                                    <path class="s10-beaker-outline" d="M 40,40 L 40,190 Q 40,196 46,196 L 154,196 Q 160,196 160,190 L 160,40" />
                                    ${dotsHtml}
                                </svg>
                            </div>
                            <div class="s10-pane">
                                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.1rem; color:#ef4444; gap: 0.5rem;">
                                    <span style="display: flex; align-items: center; gap: 0.4rem;">
                                        pH:
                                        <input type="number" id="s10-ph-input" class="s10-input" min="1" max="14" step="1" value="${state.phValue}" ${disabled(state.pictorialUnlocked)} style="width: 70px;">
                                    </span>
                                    <span>[H3O+] = 10<sup>-${state.phValue}</sup> M</span>
                                </div>
                                <input type="range" id="s10-ph-slider" class="s10-slider" min="1" max="14" step="1" value="${state.phValue}" ${disabled(state.pictorialUnlocked)} style="width:100%; margin-top:0.4rem;">
                            </div>
                            <div class="s10-feedback">${state.phFeedback}</div>
                        </div>
                    </article>

                    <article class="s10-card s10-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: L10.8-L10.10 Trigonometry</h2>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.8 Right-Triangle Trigonometry</strong>
                            <p>Which ratio defines sin(theta)?</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.l108Choice === 'opp_hyp' ? 'active' : ''}" data-l108="opp_hyp" ${disabled(state.abstractUnlocked)}>opposite / hypotenuse</button>
                                <button class="s10-btn ghost ${state.l108Choice === 'adj_hyp' ? 'active' : ''}" data-l108="adj_hyp" ${disabled(state.abstractUnlocked)}>adjacent / hypotenuse</button>
                            </div>
                            <button id="s10-check-l108" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.abstractUnlocked)}>Verify L10.8</button>
                            <div class="s10-feedback">${state.l108Feedback}</div>
                        </div>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.9 The Unit Circle</strong>
                            <p>Select the Quadrant I angle where sin(theta) = 0.5.</p>
                            <div class="s10-svg-container">
                                <svg class="s10-plot-svg" viewBox="0 0 200 200">
                                    <line class="s10-axis" x1="100" y1="0" x2="100" y2="200" />
                                    <line class="s10-axis" x1="0" y1="100" x2="200" y2="100" />
                                    <circle cx="100" cy="100" r="70" fill="none" stroke="#2563eb" stroke-width="2" />
                                    <line x1="${px}" y1="100" x2="${px}" y2="${py}" stroke="#94a3b8" stroke-dasharray="2" />
                                    <line x1="100" y1="${py}" x2="${px}" y2="${py}" stroke="#94a3b8" stroke-dasharray="2" />
                                    <line x1="100" y1="100" x2="${px}" y2="${py}" stroke="#e11d48" stroke-width="2.5" />
                                    <circle cx="${px}" cy="${py}" r="5" fill="#e11d48" />
                                    <text x="10" y="20" font-size="9px" fill="#334155">cos(theta) = ${cosX.toFixed(3)}</text>
                                    <text x="10" y="32" font-size="9px" fill="#e11d48">sin(theta) = ${sinY.toFixed(3)}</text>
                                </svg>
                            </div>
                            <div class="s10-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px;">
                                <button class="s10-btn s10-angle-btn ghost" data-angle="0" ${disabled(state.abstractUnlocked)}>0 deg</button>
                                <button class="s10-btn s10-angle-btn ghost" data-angle="30" ${disabled(state.abstractUnlocked)}>30 deg</button>
                                <button class="s10-btn s10-angle-btn ghost" data-angle="45" ${disabled(state.abstractUnlocked)}>45 deg</button>
                                <button class="s10-btn s10-angle-btn ghost" data-angle="60" ${disabled(state.abstractUnlocked)}>60 deg</button>
                            </div>
                            <div class="s10-feedback">${state.circleFeedback}</div>
                        </div>

                        <div class="s10-pane">
                            <strong>L10.10 Trigonometric Wave Mechanics</strong>
                            <p>If frequency f = 5 Hz, what is period T = 1/f?</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.l1010Choice === '0.2' ? 'active' : ''}" data-l1010="0.2" ${disabled(state.abstractUnlocked)}>0.2 s</button>
                                <button class="s10-btn ghost ${state.l1010Choice === '5' ? 'active' : ''}" data-l1010="5" ${disabled(state.abstractUnlocked)}>5 s</button>
                            </div>
                            <button id="s10-check-l1010" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.abstractUnlocked)}>Verify L10.10</button>
                            <div class="s10-feedback">${state.l1010Feedback}</div>
                        </div>
                    </article>

                    <article class="s10-card s10-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: L10.11-L10.13 Wave + p-Operator + Sig Figs</h2>

                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <strong>L10.11 Wave Kinematics</strong>
                            <p>Use v = f * lambda with v = 340 m/s and f = 170 Hz.</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr auto; gap: 8px;">
                                <input type="number" step="any" id="s10-wave-input" class="s10-input" placeholder="e.g. 2" value="${state.waveWavelength}" ${disabled(state.appliedUnlocked)}>
                                <button id="s10-check-wave" class="s10-btn" ${disabled(state.appliedUnlocked)}>Verify L10.11</button>
                            </div>
                            <div class="s10-feedback">${state.waveFeedback}</div>
                        </div>

                        <div class="s10-pane" style="margin-bottom:0.75rem; ${state.l1011Done || state.fastTrack ? '' : 'opacity:0.5;'}">
                            <strong>L10.12 The Mathematical p-Operator (pX)</strong>
                            <p>Given pKa = ${s10Antilog.ph}, compute Ka = 10^(-pKa).</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr auto; gap: 8px;">
                                <input type="text" id="s10-pka-input" class="s10-input" placeholder="e.g. 1.8e-5" value="${state.pKaInput}" ${disabled(state.l1011Done)}>
                                <button id="s10-check-pka" class="s10-btn" ${disabled(state.l1011Done)}>Verify L10.12</button>
                            </div>
                            <div class="s10-feedback">${state.pKaFeedback}</div>
                        </div>

                        <div class="s10-pane" style="${state.l1012Done || state.fastTrack ? '' : 'opacity:0.5;'}">
                            <strong>L10.13 Logarithmic Significant Figures</strong>
                            <p>If pKa has 2 decimal places, Ka should have how many significant figures?</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                <button class="s10-btn ghost ${state.sigFigChoice === '1' ? 'active' : ''}" data-sigfig="1" ${disabled(state.l1012Done)}>1</button>
                                <button class="s10-btn ghost ${state.sigFigChoice === '2' ? 'active' : ''}" data-sigfig="2" ${disabled(state.l1012Done)}>2</button>
                                <button class="s10-btn ghost ${state.sigFigChoice === '3' ? 'active' : ''}" data-sigfig="3" ${disabled(state.l1012Done)}>3</button>
                            </div>
                            <button id="s10-check-sigfig" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.l1012Done)}>Verify L10.13</button>
                            <div class="s10-feedback">${state.sigFigFeedback}</div>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's10-check-diagnostic': {
                        id: 's10-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 10 diagnostic answers.'
                    },
                    's10-check-l101': {
                        id: 's10-functions',
                        level: 'concrete',
                        keys: 'l101Choice',
                        prompt: 'Help me identify dependent and independent variables in a function.'
                    },
                    's10-check-domain': {
                        id: 's10-domain-limits',
                        level: 'concrete',
                        keys: 'domainAnswers.divide,domainAnswers.log,domainAnswers.sqrt',
                        prompt: 'Help me classify real-number domain restrictions.'
                    },
                    's10-check-l103': {
                        id: 's10-growth-decay',
                        level: 'concrete',
                        keys: 'l103Choice',
                        prompt: 'Help me distinguish exponential growth from decay.'
                    },
                    's10-check-l104': {
                        id: 's10-base10',
                        level: 'pictorial',
                        keys: 'l104Answer',
                        prompt: 'Help me evaluate base-10 logarithms.'
                    },
                    's10-check-logRules': {
                        id: 's10-log-properties',
                        level: 'pictorial',
                        keys: 'match1,match2,match3',
                        prompt: 'Help me match product, quotient, and power log rules.'
                    },
                    's10-check-l106': {
                        id: 's10-natural-log',
                        level: 'pictorial',
                        keys: 'l106Choice',
                        prompt: 'Help me evaluate natural logarithm expressions.'
                    },
                    's10-ph-slider': {
                        id: 's10-ph-log-scale',
                        level: 'pictorial',
                        keys: 'phValue,l107Done',
                        prompt: 'Help me interpret pH as a logarithmic scale.'
                    },
                    's10-check-l108': {
                        id: 's10-right-triangle-trig',
                        level: 'abstract',
                        keys: 'l108Choice',
                        prompt: 'Help me choose the correct trigonometric ratio for sine.'
                    },
                    's10-check-l1010': {
                        id: 's10-wave-period',
                        level: 'abstract',
                        keys: 'l1010Choice',
                        prompt: 'Help me compute period from frequency.'
                    },
                    's10-check-wave': {
                        id: 's10-wave-kinematics',
                        level: 'applied',
                        keys: 'waveWavelength',
                        prompt: 'Help me solve wavelength from v = f times lambda.'
                    },
                    's10-check-pka': {
                        id: 's10-operator',
                        level: 'applied',
                        keys: 'pKaInput',
                        prompt: `Help me calculate Ka from pKa = ${s10Antilog.ph}.`
                    },
                    's10-check-sigfig': {
                        id: 's10-log-sigfigs',
                        level: 'applied',
                        keys: 'sigFigChoice',
                        prompt: 'Help me apply logarithmic significant figure rules.'
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

                host.querySelectorAll('.s10-angle-btn').forEach((btn) => {
                    btn.setAttribute('data-tutor-question-id', 's10-unit-circle');
                    btn.setAttribute('data-tutor-level', 'abstract');
                    btn.setAttribute('data-tutor-answer-keys', 'thetaVal,l109Done');
                    btn.setAttribute('data-tutor-question', 'Help me choose the angle where sin(theta) equals 0.5 on the unit circle.');
                });
            };

            annotateTutorQuestions();

            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic option chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-diagnostic')?.addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === '3' &&
                                state.diagnosticAnswers.q2 === '2' &&
                                state.diagnosticAnswers.q3 === 'c';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.l101Done = true;
                    state.l102Done = true;
                    state.l103Done = true;
                    state.l104Done = true;
                    state.l105Done = true;
                    state.l106Done = true;
                    state.l107Done = true;
                    state.l108Done = true;
                    state.l109Done = true;
                    state.l1010Done = true;
                    state.l1011Done = true;
                    state.l1012Done = true;
                    state.l1013Done = true;
                    state.diagnosticFeedback = 'Fast-Track unlocked. All Stage 10 lessons are open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active through L10.1-L10.13.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('[data-l101]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.l101Choice = btn.getAttribute('data-l101');
                    persist('L10.1 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-l101')?.addEventListener('click', () => {
                if (state.l101Choice === 'c_dep') {
                    state.l101Done = true;
                    state.l101Feedback = 'Correct. C is the dependent variable and n is the independent variable.';
                } else if (state.l101Choice) {
                    state.l101Feedback = 'Not yet. In C = 2n + 1, C changes when n changes.';
                } else {
                    state.l101Feedback = 'Choose an option first.';
                }
                persist('L10.1 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-check-domain')?.addEventListener('click', () => {
                const divide = host.querySelector('#s10-domain-divide')?.value || '';
                const log = host.querySelector('#s10-domain-log')?.value || '';
                const sqrt = host.querySelector('#s10-domain-sqrt')?.value || '';
                state.domainAnswers = { divide, log, sqrt };

                if (divide === 'undefined' && log === 'invalid' && sqrt === 'noreal') {
                    state.l102Done = true;
                    state.domainFeedback = 'Correct. You identified all three real-domain restrictions.';
                } else {
                    state.domainFeedback = 'Not yet. Divide-by-zero is undefined, log of negative is invalid in reals, sqrt of negative has no real value.';
                }

                persist('L10.2 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('[data-l103]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.l103Choice = btn.getAttribute('data-l103');
                    persist('L10.3 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-l103')?.addEventListener('click', () => {
                if (state.l103Choice === 'decay') {
                    state.l103Done = true;
                    state.l103Feedback = 'Correct. Because 0.80 < 1, the function models exponential decay.';
                } else if (state.l103Choice) {
                    state.l103Feedback = 'Not yet. A base less than 1 indicates exponential decay.';
                } else {
                    state.l103Feedback = 'Choose growth or decay first.';
                }
                persist('L10.3 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-check-l104')?.addEventListener('click', () => {
                const val = Number(host.querySelector('#s10-l104-input')?.value);
                state.l104Answer = host.querySelector('#s10-l104-input')?.value || '';
                if (val === 4) {
                    state.l104Done = true;
                    state.l104Feedback = 'Correct. 10^4 = 10000, so log10(10000) = 4.';
                } else if (!Number.isNaN(val)) {
                    state.l104Feedback = 'Incorrect. Raise 10 to your answer and compare to 10000.';
                } else {
                    state.l104Feedback = 'Enter a numeric answer first.';
                }
                persist('L10.4 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-check-logRules')?.addEventListener('click', () => {
                state.match1 = host.querySelector('#s10-log-m1')?.value || '';
                state.match2 = host.querySelector('#s10-log-m2')?.value || '';
                state.match3 = host.querySelector('#s10-log-m3')?.value || '';

                if (state.match1 === 'plus' && state.match2 === 'minus' && state.match3 === 'power') {
                    state.l105Done = true;
                    state.logFeedback = 'Excellent. Product -> plus, Quotient -> minus, Power -> multiplier.';
                } else if (!state.match1 || !state.match2 || !state.match3) {
                    state.logFeedback = 'Select all three rules before checking.';
                } else {
                    state.logFeedback = 'Not yet. Re-check product, quotient, and power mappings.';
                }
                persist('L10.5 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('[data-l106]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.l106Choice = btn.getAttribute('data-l106');
                    persist('L10.6 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-l106')?.addEventListener('click', () => {
                if (state.l106Choice === '3') {
                    state.l106Done = true;
                    state.l106Feedback = 'Correct. ln(e^3) = 3.';
                } else if (state.l106Choice) {
                    state.l106Feedback = 'Not yet. ln and e are inverse operations.';
                } else {
                    state.l106Feedback = 'Choose an option first.';
                }
                persist('L10.6 checked');
                this.mount({ host, state, onStateChange });
            });

            const applyPh = (val) => {
                state.phValue = val;
                if (val === 3) {
                    state.l107Done = true;
                    state.phFeedback = 'Correct. pH 3 corresponds to [H3O+] = 10^-3 M.';
                } else {
                    state.l107Done = false;
                    state.phFeedback = `pH is ${val}. Move to pH 3 to complete L10.7.`;
                }
            };

            host.querySelector('#s10-ph-slider')?.addEventListener('input', (e) => {
                applyPh(parseInt(e.target.value, 10));
                persist('L10.7 slider changed');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-ph-input')?.addEventListener('change', (e) => {
                let val = parseInt(e.target.value, 10);
                if (Number.isNaN(val)) return;
                val = Math.max(1, Math.min(14, val));
                applyPh(val);
                persist('L10.7 input changed');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('[data-l108]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.l108Choice = btn.getAttribute('data-l108');
                    persist('L10.8 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-l108')?.addEventListener('click', () => {
                if (state.l108Choice === 'opp_hyp') {
                    state.l108Done = true;
                    state.l108Feedback = 'Correct. sin(theta) = opposite / hypotenuse.';
                } else if (state.l108Choice) {
                    state.l108Feedback = 'Not yet. That ratio is cosine.';
                } else {
                    state.l108Feedback = 'Choose an option first.';
                }
                persist('L10.8 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('.s10-angle-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const angle = parseInt(btn.getAttribute('data-angle'), 10);
                    state.thetaVal = angle;
                    if (angle === 30) {
                        state.l109Done = true;
                        state.circleFeedback = 'Correct. sin(30 deg) = 0.5.';
                    } else {
                        state.circleFeedback = `At ${angle} deg, sin(theta) = ${Math.sin(angle * Math.PI / 180).toFixed(3)}.`;
                    }
                    persist('L10.9 checked');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelectorAll('[data-l1010]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.l1010Choice = btn.getAttribute('data-l1010');
                    persist('L10.10 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-l1010')?.addEventListener('click', () => {
                if (state.l1010Choice === '0.2') {
                    state.l1010Done = true;
                    state.l1010Feedback = 'Correct. T = 1/f = 1/5 = 0.2 s.';
                } else if (state.l1010Choice) {
                    state.l1010Feedback = 'Not yet. Period is reciprocal of frequency.';
                } else {
                    state.l1010Feedback = 'Choose an option first.';
                }
                persist('L10.10 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-check-wave')?.addEventListener('click', () => {
                const inputVal = parseFloat(host.querySelector('#s10-wave-input')?.value || '');
                state.waveWavelength = host.querySelector('#s10-wave-input')?.value || '';

                if (inputVal === 2) {
                    state.l1011Done = true;
                    state.waveFeedback = 'Correct. lambda = 340 / 170 = 2 m.';
                } else {
                    state.waveFeedback = 'Incorrect. Use lambda = v / f = 340 / 170 = 2.';
                }
                persist('L10.11 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-check-pka')?.addEventListener('click', () => {
                const rawInput = (host.querySelector('#s10-pka-input')?.value || '').trim();
                state.pKaInput = rawInput;
                const normalized = rawInput.toLowerCase().replace(/\s+/g, '').replace(/[\*x×]10\^/g, 'e');
                const expected = s10Antilog.answerKey.toLowerCase().replace(/\s+/g, '').replace(/[\*x×]10\^/g, 'e');

                if (normalized === expected) {
                    state.l1012Done = true;
                    state.pKaFeedback = `Correct. Ka = ${s10Antilog.answerKey}.`;
                } else {
                    const userNum = parseFloat(normalized);
                    const expectedNum = parseFloat(expected);
                    if (!Number.isNaN(userNum) && !Number.isNaN(expectedNum) && Math.abs(userNum - expectedNum) / expectedNum < 0.05) {
                        state.pKaFeedback = `Close value, but use the expected scientific notation: ${s10Antilog.answerKey}.`;
                    } else {
                        state.pKaFeedback = `Incorrect. Compute Ka = 10^(-${s10Antilog.ph}) and express as ${s10Antilog.answerKey}.`;
                    }
                }
                persist('L10.12 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelectorAll('[data-sigfig]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.sigFigChoice = btn.getAttribute('data-sigfig');
                    persist('L10.13 option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s10-check-sigfig')?.addEventListener('click', () => {
                if (state.sigFigChoice === '2') {
                    state.l1013Done = true;
                    state.sigFigFeedback = 'Correct. 2 decimal places in pKa means 2 significant figures in Ka.';
                } else if (state.sigFigChoice) {
                    state.sigFigFeedback = 'Not yet. Match decimal places in p-values to significant figures in concentration values.';
                } else {
                    state.sigFigFeedback = 'Choose an option first.';
                }
                persist('L10.13 checked');
                this.mount({ host, state, onStateChange });
            });

            const l104Input = host.querySelector('#s10-l104-input');
            if (l104Input) {
                l104Input.addEventListener('input', (e) => {
                    state.l104Answer = e.target.value;
                });
            }

            const waveInput = host.querySelector('#s10-wave-input');
            if (waveInput) {
                waveInput.addEventListener('input', (e) => {
                    state.waveWavelength = e.target.value;
                });
            }

            const pKaInputEl = host.querySelector('#s10-pka-input');
            if (pKaInputEl) {
                pKaInputEl.addEventListener('input', (e) => {
                    state.pKaInput = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
