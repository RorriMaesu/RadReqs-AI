const createInitialStage10State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Concrete: pH Beaker Concentration
    phValue: 7,
    phFeedback: 'Concrete mission: set pH = 3 and correctly complete the Domain Limits check to unlock Pictorial.',
    concreteCorrect: false,
    concreteMission: { phReady: false, domainReady: false },
    concreteCompleted: false,

    // Domain limits
    domainAnswers: { divide: '', log: '', sqrt: '' },
    domainFeedback: 'L10.2 Domain Limits: avoid divide-by-zero, log of negative values, and square roots of negatives in real-number mode.',
    domainCorrect: false,

    // Pictorial: Unit Circle Scanner
    thetaVal: 0,
    circleFeedback: 'Select the angle in Quadrant I where sin(theta) = 0.5 (y-coordinate is 0.5).',
    circleCorrect: false,

    // Abstract: Log properties board
    match1: '',
    match2: '',
    match3: '',
    logFeedback: 'Match the three core logarithmic properties correctly.',
    logCorrect: false,

    // Applied: Wave kinematics
    waveWavelength: '',
    waveFeedback: 'Solve for wavelength lambda (lambda = v / f) given velocity v = 340 m/s and frequency f = 170 Hz.',
    waveCorrect: false
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

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's10-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            // Calculate red dots for pH beaker
            // pH 1: 30 dots, pH 2: 15 dots, pH 3: 8 dots, pH 4: 4 dots, pH >= 5: 1 dot
            let dotsCount = 0;
            if (state.phValue === 1) dotsCount = 40;
            else if (state.phValue === 2) dotsCount = 20;
            else if (state.phValue === 3) dotsCount = 10;
            else if (state.phValue === 4) dotsCount = 5;
            else if (state.phValue === 5) dotsCount = 2;
            else dotsCount = 1;

            let dotsHtml = '';
            for (let i = 0; i < dotsCount; i++) {
                // Generate random coordinates inside the beaker area (45 to 155 on x, 100 to 180 on y)
                const rx = 45 + Math.floor(Math.sin(i * 12) * 50 + 50);
                const ry = 100 + Math.floor(Math.cos(i * 23) * 35 + 40);
                dotsHtml += `<circle cx="${rx}" cy="${ry}" r="4.5" fill="#ef4444" fill-opacity="0.85" />`;
            }

            // Calculate Unit Circle variables
            const rad = (state.thetaVal * Math.PI) / 180;
            const cosX = Math.cos(rad);
            const sinY = Math.sin(rad);
            // Circle center at (100, 100). radius 70.
            const px = 100 + cosX * 70;
            const py = 100 - sinY * 70; // SVG y is inverted

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
                    
                    /* SVG Custom structures */
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
                        <p>Verify your logarithms, base e natural logs, and cyclic wave dynamics.</p>
                        <div class="s10-grid">
                            <div class="s10-pane">
                                <strong>1. Base-10 Logarithms</strong>
                                <p>What is the value of log10(1000)?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q1 === '3' ? 'active' : ''}" data-diag="q1" data-value="3">3 (because 10^3 = 1000)</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q1 === '100' ? 'active' : ''}" data-diag="q1" data-value="100">100</button>
                                </div>
                            </div>
                            <div class="s10-pane">
                                <strong>2. Natural Logarithms (ln)</strong>
                                <p>What is the value of the expression ln(e^2)?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q2 === '2' ? 'active' : ''}" data-diag="q2" data-value="2">2 (because ln and e cancel)</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q2 === 'e' ? 'active' : ''}" data-diag="q2" data-value="e">e (≈ 2.718)</button>
                                </div>
                            </div>
                            <div class="s10-pane">
                                <strong>3. Wave Mechanics</strong>
                                <p>A light wave has frequency 2.0 x 10^14 Hz and wavelength 1.5 x 10^-6 m. What is its speed v = f * lambda?</p>
                                <div class="s10-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q3 === 'c' ? 'active' : ''}" data-diag="q3" data-value="c">3.0 × 10⁸ m/s (Speed of light)</button>
                                    <button class="s10-btn ghost ${state.diagnosticAnswers.q3 === 'wrong' ? 'active' : ''}" data-diag="q3" data-value="wrong">3.0 × 10²⁰ m/s</button>
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

                    <!-- CONCRETE LEVEL -->
                    <article class="s10-card s10-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: pH logarithmic Beaker</h2>
                        <div class="s10-pane" style="margin-bottom:0.75rem;">
                            <p><strong>[Required Unlock] L10.2 Mathematical Domain Limits:</strong> Choose the valid status for each expression in real-number arithmetic.</p>
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
                            <button id="s10-check-domain" class="s10-btn" style="margin-top:8px; width:100%;" ${disabled(state.concreteUnlocked)}>Check Domain Limits</button>
                            <div class="s10-feedback" id="s10-domain-feedback">${state.domainFeedback}</div>
                        </div>
                        <p><strong>[Required Unlock] L10.7 Logarithmic Scales:</strong> The pH scale is logarithmic: pH = -log10([H3O+]). Each decrease of 1 pH unit represents a 10-fold increase in acid concentration!
                        Adjust the slider below to set <strong>pH = 3</strong> (10^-3 M concentration) and observe the density of hydronium ions in the beaker.</p>
                        
                        <div class="s10-svg-container">
                            <svg class="s10-beaker-svg" viewBox="0 0 200 200">
                                <!-- Beaker Liquid -->
                                <rect class="s10-beaker-water" x="40" y="80" width="120" height="110" rx="4" />
                                <!-- Beaker ticks -->
                                <line x1="160" y1="100" x2="150" y2="100" stroke="#94a3b8" stroke-width="2" />
                                <line x1="160" y1="130" x2="150" y2="130" stroke="#94a3b8" stroke-width="2" />
                                <line x1="160" y1="160" x2="150" y2="160" stroke="#94a3b8" stroke-width="2" />
                                <!-- Beaker Outline -->
                                <path class="s10-beaker-outline" d="M 40,40 L 40,190 Q 40,196 46,196 L 154,196 Q 160,196 160,190 L 160,40" />
                                <!-- Hydronium dots -->
                                ${dotsHtml}
                            </svg>
                        </div>
                        
                        <div class="s10-pane">
                            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.1rem; color:#ef4444;">
                                <span>pH Value: <strong>${state.phValue}</strong></span>
                                <span>[H3O+] = 10<sup>-${state.phValue}</sup> M</span>
                            </div>
                            <input type="range" id="s10-ph-slider" class="s10-slider" min="1" max="14" step="1" value="${state.phValue}" ${disabled(state.concreteUnlocked)} style="width:100%; margin-top:0.4rem;">
                        </div>
                        
                        <div class="s10-feedback" id="s10-ph-feedback">${state.phFeedback}</div>

                        <div class="s10-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s10-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s10-pill ${state.concreteMission.phReady ? 'good' : 'locked'}">Set pH to 3</span>
                                <span class="s10-pill ${state.concreteMission.domainReady ? 'good' : 'locked'}">Pass Domain Limits check</span>
                            </div>
                            <div class="s10-grid" style="gap:4px;">
                                <button id="s10-hint-concrete" class="s10-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s10-continue-pictorial" class="s10-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s10-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s10-btn ghost" title="Reinforcement" data-prompt="Explain what a logarithmic scale is and why a decrease in 1 pH unit increases acid hydronium concentration by a factor of 10." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s10-card s10-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: The Unit Circle Trigonometric Scanner</h2>
                        <p><strong>[Required Unlock] L10.9 Unit Circle:</strong> In chemistry crystallography and physics waveforms, we map sine and cosine to points on a unit circle (x^2 + y^2 = 1).
                        Select the angle in Quadrant I (from 0 to 90 degrees) where sin(theta) = 0.5 (the y-coordinate reaches 0.5).</p>
                        
                        <div class="s10-svg-container">
                            <svg class="s10-plot-svg" viewBox="0 0 200 200">
                                <!-- Axes -->
                                <line class="s10-axis" x1="100" y1="0" x2="100" y2="200" />
                                <line class="s10-axis" x1="0" y1="100" x2="200" y2="100" />
                                
                                <!-- Unit Circle (Radius 70) -->
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#2563eb" stroke-width="2" />
                                
                                <!-- Coordinates projection guidelines -->
                                <line x1="${px}" y1="100" x2="${px}" y2="${py}" stroke="#94a3b8" stroke-dasharray="2" />
                                <line x1="100" y1="${py}" x2="${px}" y2="${py}" stroke="#94a3b8" stroke-dasharray="2" />
                                
                                <!-- Rotating vector line -->
                                <line x1="100" y1="100" x2="${px}" y2="${py}" stroke="#e11d48" stroke-width="2.5" />
                                <circle cx="${px}" cy="${py}" r="5" fill="#e11d48" />
                                
                                <!-- Coordinate labels -->
                                <text x="10" y="20" font-size="9px" fill="#334155">
                                    cos(θ) = ${cosX.toFixed(3)} (x)
                                </text>
                                <text x="10" y="32" font-size="9px" fill="#e11d48">
                                    sin(θ) = ${sinY.toFixed(3)} (y)
                                </text>
                            </svg>
                        </div>
                        
                        <div class="s10-grid" style="grid-template-columns: repeat(4, 1fr); gap: 4px;">
                            <button class="s10-btn s10-angle-btn ghost" data-angle="0" ${disabled(state.pictorialUnlocked)}>0°</button>
                            <button class="s10-btn s10-angle-btn ghost" data-angle="30" ${disabled(state.pictorialUnlocked)}>30°</button>
                            <button class="s10-btn s10-angle-btn ghost" data-angle="45" ${disabled(state.pictorialUnlocked)}>45°</button>
                            <button class="s10-btn s10-angle-btn ghost" data-angle="60" ${disabled(state.pictorialUnlocked)}>60°</button>
                        </div>
                        
                        <div class="s10-feedback" id="s10-circle-feedback" style="margin-top:0.5rem;">${state.circleFeedback}</div>

                        <div class="s10-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s10-btn ghost" title="Reinforcement" data-prompt="Explain how the unit circle coordinates (x, y) relate to cosine and sine functions respectively, and calculate sin(30 degrees)." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s10-card s10-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Logarithm properties Board</h2>
                        <p><strong>[Required Unlock] L10.5 Log Rules:</strong> Match the algebraic expressions to their equivalent logarithmic expansion rule below.</p>
                        
                        <div class="s10-pane">
                            <div class="s10-grid" style="grid-template-columns: 1.2fr 1fr; gap:0.6rem; align-items:center;">
                                <span><strong>Product Rule:</strong> log_b(xy)</span>
                                <select id="s10-log-m1" class="s10-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match1 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match1 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match1 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                                
                                <span><strong>Quotient Rule:</strong> log_b(x/y)</span>
                                <select id="s10-log-m2" class="s10-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match2 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match2 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match2 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                                
                                <span><strong>Power Rule:</strong> log_b(x^y)</span>
                                <select id="s10-log-m3" class="s10-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select...</option>
                                    <option value="plus" ${state.match3 === 'plus' ? 'selected' : ''}>log_b(x) + log_b(y)</option>
                                    <option value="minus" ${state.match3 === 'minus' ? 'selected' : ''}>log_b(x) - log_b(y)</option>
                                    <option value="power" ${state.match3 === 'power' ? 'selected' : ''}>y * log_b(x)</option>
                                </select>
                            </div>
                            <button id="s10-check-logRules" class="s10-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.abstractUnlocked)}>Check properties</button>
                        </div>
                        <div class="s10-feedback" id="s10-log-feedback">${state.logFeedback}</div>

                        <div class="s10-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s10-btn ghost" title="Reinforcement" data-prompt="Walk me through the three main rules of logarithms: the product rule, the quotient rule, and the power rule, with examples." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s10-card s10-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Wave Kinematics (Spectroscopy velocity)</h2>
                        <p><strong>L10.11 Wave Equation:</strong> Electromagnetic radiation and sound waves follow the cycle relation: 
                        <span style="font-family:monospace; font-weight:bold;">v = f · λ</span> (velocity = frequency × wavelength). 
                        If a sound wave travels at velocity v = 340 m/s in a room with frequency f = 170 Hz, what is its wavelength lambda in meters?</p>
                        
                        <div class="s10-pane">
                            <p>Calculate wavelength lambda:</p>
                            <div class="s10-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" step="any" id="s10-wave-input" class="s10-input" placeholder="e.g. 2" value="${state.waveWavelength}" ${disabled(state.appliedUnlocked)}>
                                <button id="s10-check-wave" class="s10-btn" ${disabled(state.appliedUnlocked)}>Verify Wavelength</button>
                            </div>
                        </div>
                        <div class="s10-feedback" id="s10-wave-feedback">${state.waveFeedback}</div>

                        <div class="s10-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s10-btn ghost" title="Reinforcement" data-prompt="Explain the wave velocity formula v = f * λ, and calculate wavelength λ when v = 340 m/s and f = 170 Hz." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
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
                        prompt: 'Help me review my Stage 10 diagnostic answers on logarithms, natural logs, and wave calculations.'
                    },
                    's10-check-domain': {
                        id: 's10-domain-limits',
                        level: 'concrete',
                        keys: 'domainAnswers.divide,domainAnswers.log,domainAnswers.sqrt',
                        prompt: 'Help me classify domain validity for divide-by-zero, log negatives, and square roots of negatives.'
                    },
                    's10-ph-slider': {
                        id: 's10-ph-log-scale',
                        level: 'concrete',
                        keys: 'phValue,concreteMission.phReady,concreteMission.domainReady',
                        prompt: 'Help me interpret the logarithmic pH scale and why pH 3 means much higher acidity.'
                    },
                    's10-log-m1': {
                        id: 's10-log-properties',
                        level: 'abstract',
                        keys: 'match1,match2,match3',
                        prompt: 'Help me match product, quotient, and power logarithm properties correctly.'
                    },
                    's10-log-m2': {
                        id: 's10-log-properties',
                        level: 'abstract',
                        keys: 'match1,match2,match3',
                        prompt: 'Help me match product, quotient, and power logarithm properties correctly.'
                    },
                    's10-log-m3': {
                        id: 's10-log-properties',
                        level: 'abstract',
                        keys: 'match1,match2,match3',
                        prompt: 'Help me match product, quotient, and power logarithm properties correctly.'
                    },
                    's10-check-logRules': {
                        id: 's10-log-properties',
                        level: 'abstract',
                        keys: 'match1,match2,match3',
                        prompt: 'Help me match product, quotient, and power logarithm properties correctly.'
                    },
                    's10-check-wave': {
                        id: 's10-wave-kinematics',
                        level: 'applied',
                        keys: 'waveWavelength',
                        prompt: 'Help me solve wavelength from v = f times lambda with v=340 and f=170.'
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
                    btn.setAttribute('data-tutor-level', 'pictorial');
                    btn.setAttribute('data-tutor-answer-keys', 'thetaVal,circleCorrect');
                    btn.setAttribute('data-tutor-question', 'Help me choose the angle where sin(theta) equals 0.5 on the unit circle.');
                });
            };

            annotateTutorQuestions();

            const syncConcreteMission = () => {
                if (state.fastTrack) return;

                if (state.concreteMission.phReady && state.concreteMission.domainReady) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.phFeedback = 'Concrete mission complete. Domain limits and pH targeting are both correct. Pictorial unlocked. Continue below.';
                } else if (!state.concreteCompleted) {
                    if (state.concreteMission.phReady && !state.concreteMission.domainReady) {
                        state.phFeedback = 'pH target complete. Now pass the Domain Limits check to unlock Pictorial.';
                    } else if (!state.concreteMission.phReady && state.concreteMission.domainReady) {
                        state.phFeedback = 'Domain limits complete. Now set the slider to pH = 3 to unlock Pictorial.';
                    } else {
                        state.phFeedback = 'Concrete mission in progress: set pH = 3 and pass the Domain Limits check.';
                    }
                }
            };

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic options selection
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic option chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            // Check Diagnostic
            host.querySelector('#s10-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === '3' &&
                                state.diagnosticAnswers.q2 === '2' &&
                                state.diagnosticAnswers.q3 === 'c';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered log bases, natural logs, and wave dynamics. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active. Solve the Concrete Level to progress.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete pH Slider
            const slider = host.querySelector('#s10-ph-slider');
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value);
                    state.phValue = val;
                    if (val === 3) {
                        state.concreteCorrect = true;
                        state.concreteMission.phReady = true;
                        if (!state.concreteCompleted) {
                            state.phFeedback = 'Correct pH target: pH = 3 gives [H3O+] = 10^-3 M. Complete Domain Limits to finish Concrete.';
                        }
                    } else {
                        state.concreteCorrect = false;
                        if (!state.concreteCompleted) {
                            state.concreteMission.phReady = false;
                            state.phFeedback = `pH is ${val} ([H3O+] = 10^-${val} M). Adjust to 3 to satisfy the pH mission step.`;
                        }
                    }
                    syncConcreteMission();
                    persist('pH slider shifted');
                    this.mount({ host, state, onStateChange });
                });
            }

            host.querySelector('#s10-check-domain').addEventListener('click', () => {
                const divide = host.querySelector('#s10-domain-divide').value;
                const log = host.querySelector('#s10-domain-log').value;
                const sqrt = host.querySelector('#s10-domain-sqrt').value;
                state.domainAnswers = { divide, log, sqrt };

                if (divide === 'undefined' && log === 'invalid' && sqrt === 'noreal') {
                    state.domainCorrect = true;
                    state.domainFeedback = 'Correct. Division by zero is undefined, log of a negative is invalid in reals, and sqrt of a negative has no real value.';
                    state.concreteMission.domainReady = true;
                } else {
                    state.domainCorrect = false;
                    state.domainFeedback = 'Not yet. Mark divide-by-zero as undefined, log10 of a negative as invalid in real numbers, and sqrt of a negative as no real value.';
                    if (!state.concreteCompleted) {
                        state.concreteMission.domainReady = false;
                    }
                }

                syncConcreteMission();
                persist('Domain limits checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-hint-concrete')?.addEventListener('click', () => {
                if (!state.concreteMission.phReady) {
                    state.phFeedback = 'Hint: Move the slider until pH reads exactly 3.';
                } else if (!state.concreteMission.domainReady) {
                    state.phFeedback = 'Hint: In real numbers, divide-by-zero is undefined, log10 of a negative is invalid, and sqrt of a negative has no real value.';
                } else {
                    state.phFeedback = 'Concrete mission is complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s10-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.phFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.phFeedback = 'Finish both mission steps first: set pH = 3 and pass Domain Limits.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial angle button selector
            host.querySelectorAll('.s10-angle-btn').forEach((btn) => {
                const angle = parseInt(btn.getAttribute('data-angle'));
                // Highlight active angle
                if (state.thetaVal === angle) {
                    btn.classList.remove('ghost');
                    btn.style.borderColor = '#e11d48';
                }
                
                btn.addEventListener('click', () => {
                    state.thetaVal = angle;
                    if (angle === 30) {
                        state.circleCorrect = true;
                        state.circleFeedback = 'Correct! At 30 degrees, sin(30 degrees) = 0.5 (y-coordinate is 0.5). Abstract unlocked. Continue below.';
                        state.abstractUnlocked = true;
                    } else {
                        state.circleCorrect = false;
                        state.circleFeedback = `At ${angle} degrees, sin(${angle} degrees) = ${Math.sin(angle * Math.PI / 180).toFixed(3)}. Find the Quadrant I angle where y is 0.5.`;
                    }
                    persist('Unit circle angle scanned');
                    this.mount({ host, state, onStateChange });
                });
            });

            // Abstract Log rules checking
            host.querySelector('#s10-check-logRules').addEventListener('click', () => {
                const m1 = host.querySelector('#s10-log-m1').value;
                const m2 = host.querySelector('#s10-log-m2').value;
                const m3 = host.querySelector('#s10-log-m3').value;

                state.match1 = m1;
                state.match2 = m2;
                state.match3 = m3;

                if (m1 === 'plus' && m2 === 'minus' && m3 === 'power') {
                    state.logCorrect = true;
                    state.logFeedback = 'Excellent! You matched all log properties correctly: multiplication expands to addition, division to subtraction, power to multiplication. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true;
                } else if (!m1 || !m2 || !m3) {
                    state.logCorrect = false;
                    state.logFeedback = 'Please select all properties.';
                } else {
                    state.logCorrect = false;
                    state.logFeedback = 'Incorrect matching. Remember: Product rule expands xy to log(x) + log(y). Quotient rule expands x/y to log(x) - log(y). Power rule expands x^y to y * log(x).';
                }
                persist('Log properties checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied wave velocity check
            host.querySelector('#s10-check-wave').addEventListener('click', () => {
                const inputVal = parseFloat(host.querySelector('#s10-wave-input').value);
                state.waveWavelength = host.querySelector('#s10-wave-input').value;

                if (inputVal === 2) {
                    state.waveCorrect = true;
                    state.waveFeedback = 'Correct! The wavelength lambda = 340 m/s / 170 Hz = 2 meters.';
                } else {
                    state.waveCorrect = false;
                    state.waveFeedback = 'Incorrect. Rearrange v = f * lambda to find lambda: lambda = v / f = 340 / 170 = 2.';
                }
                persist('Wave kinematics checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const domainDivide = host.querySelector('#s10-domain-divide');
            if (domainDivide) {
                domainDivide.addEventListener('change', (e) => {
                    state.domainAnswers.divide = e.target.value;
                });
            }
            const domainLog = host.querySelector('#s10-domain-log');
            if (domainLog) {
                domainLog.addEventListener('change', (e) => {
                    state.domainAnswers.log = e.target.value;
                });
            }
            const domainSqrt = host.querySelector('#s10-domain-sqrt');
            if (domainSqrt) {
                domainSqrt.addEventListener('change', (e) => {
                    state.domainAnswers.sqrt = e.target.value;
                });
            }

            const logM1 = host.querySelector('#s10-log-m1');
            if (logM1) {
                logM1.addEventListener('change', (e) => {
                    state.match1 = e.target.value;
                });
            }
            const logM2 = host.querySelector('#s10-log-m2');
            if (logM2) {
                logM2.addEventListener('change', (e) => {
                    state.match2 = e.target.value;
                });
            }
            const logM3 = host.querySelector('#s10-log-m3');
            if (logM3) {
                logM3.addEventListener('change', (e) => {
                    state.match3 = e.target.value;
                });
            }

            const waveInput = host.querySelector('#s10-wave-input');
            if (waveInput) {
                waveInput.addEventListener('input', (e) => {
                    state.waveWavelength = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
