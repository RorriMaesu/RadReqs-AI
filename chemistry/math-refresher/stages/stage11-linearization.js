const createInitialStage11State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L11.1 Reciprocal & Inverse Graphing
    volumeVal: 2.0, // Syringe volume (2.0 to 10.0 L)
    pressureInput: '', // Calculated pressure (atm) at V = 5.0 L
    l111Correct: false,
    l111Feedback: 'L11.1: Adjust the volume slider to 5.0 L, calculate the pressure, and verify.',

    // L11.2 The Linearization Concept
    linearizeChoice: '', // Dropdown choice ('V', 'V2', 'invV')
    l112Correct: false,
    l112Feedback: 'L11.2: Select the correct linearizing X-axis variable (1/V) to make the plot straight.',

    concreteCompleted: false,

    // L11.3 Linearizing Kinetics (First & Second Order)
    kineticsChoice: '', // Dropdown choice ('0', '1st', '2nd')
    l113Correct: false,
    l113Feedback: 'L11.3: Choose the correct kinetics order for a linear reciprocal concentration plot.',

    // L11.4 Linearizing Thermodynamic Data (Arrhenius & CC)
    pointASelected: false,
    pointBSelected: false,
    eaAnswer: '', // Activation Energy Ea (kJ/mol)
    l114Correct: false,
    l114Feedback: 'L11.4: Select both data points on the plot and calculate the Activation Energy Ea.',

    pictorialCompleted: false,

    // L11.5 Extrapolation & Interpolation
    interpolationAns: '', // interpolate C at A=0.60
    extrapolationAns: '', // extrapolate A at C=2.50
    l115Correct: false,
    l115Feedback: 'L11.5: Calculate the interpolated concentration and extrapolated absorbance.',

    // L11.6 Two-Point Equations
    slopeAns: '', // slope m
    interceptAns: '', // intercept b
    l116Correct: false,
    l116Feedback: 'L11.6: Calculate the slope (m) and y-intercept (b) of the line passing through both points.',

    abstractCompleted: false,

    // L11.7 Beer's Law Deviations & Linearity Limits
    concentrationVal: 0.20, // Slider value (0.00 to 1.50 M)
    limitChoice: '', // Selected concentration limit for linear range
    l117Correct: false,
    l117Feedback: 'L11.7: Adjust the concentration slider to 1.20 M and select the upper limit of the linear range.',

    // L11.8 Residual Plots & Fit Quality
    l118Correct: false,
    l118Feedback: 'L11.8: Click Verify to inspect the residual plot and confirm fit quality.',

    appliedCompleted: false
});

export function createStage11Linearization() {
    return {
        id: 'stage11',
        label: 'Data Linearization',
        title: 'Stage 11: Data Linearization & Graphical Analysis',
        getInitialState() {
            return createInitialStage11State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage11State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            const s11Linear = getParams('s11-linear', { limit: '0.010', cutoff: 0.010 });
            const s11Arrhenius = getParams('s11-arrhenius', { x1: 0.0030, y1: -2.0, x2: 0.0035, y2: -4.0, slope: -4000, answerKey: '33.2' });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's11-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            // Boyle's Law calculations
            const volumeVal = parseFloat(state.volumeVal);
            const calculatedPressure = 10.0 / volumeVal;

            // Generate Boyle's Law graph points and path
            const isLinear = state.linearizeChoice === 'invV';
            const graphPoints = [2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0].map((v) => {
                const p = 10.0 / v;
                let xPx, yPx;
                if (isLinear) {
                    const invV = 1.0 / v;
                    xPx = 30 + (invV / 0.6) * 160;
                } else if (state.linearizeChoice === 'V2') {
                    const v2 = v * v;
                    xPx = 30 + (v2 / 100) * 160;
                } else { // 'V'
                    xPx = 30 + (v / 12) * 160;
                }
                yPx = 130 - (p / 6) * 100;
                return { x: xPx, y: yPx, v, p };
            });

            // Target point on the graph representing current volumeVal
            let targetX, targetY;
            if (isLinear) {
                targetX = 30 + ((1.0 / volumeVal) / 0.6) * 160;
            } else if (state.linearizeChoice === 'V2') {
                targetX = 30 + ((volumeVal * volumeVal) / 100) * 160;
            } else {
                targetX = 30 + (volumeVal / 12) * 160;
            }
            targetY = 130 - (calculatedPressure / 6) * 100;

            const pointsString = graphPoints.map(pt => `${pt.x},${pt.y}`).join(' ');

            // Pictorial: Arrhenius graph coordinates mapping scaled dynamically
            const ax = -350 + s11Arrhenius.x1 * 140000;
            const ay = 20 - 30 * s11Arrhenius.y1;
            const bx = -350 + s11Arrhenius.x2 * 140000;
            const by = 20 - 30 * s11Arrhenius.y2;

            // Applied: Beer's law values
            const concentration = parseFloat(state.concentrationVal);
            const absorbance = 0.50 * concentration;
            // Laser beam visual attenuation
            const beamThickness = Math.max(1, 6 - 3.5 * (concentration / 1.50));
            const beamOpacity = Math.max(0.15, 1 - 0.75 * (concentration / 1.50));
            const solutionOpacity = 0.1 + 0.8 * (concentration / 1.50);

            host.innerHTML = `
                <style>
                    .s11-wrap { display: grid; gap: 1.2rem; }
                    .s11-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s11-card h2, .s11-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s11-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s11-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s11-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; margin-bottom: 0.6rem; }
                    .s11-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s11-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s11-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s11-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s11-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s11-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s11-btn:hover { background: #fbbf24; }
                    .s11-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s11-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s11-btn.active, .s11-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s11-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s11-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s11-level.s11-locked { opacity: 0.52; position: relative; }
                    .s11-level.s11-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s11-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* SVG Custom structures */
                    .s11-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; gap: 10px; flex-wrap: wrap; }
                    .s11-cuvette-svg { width: 220px; height: 120px; background: rgba(15, 23, 42, 0.8); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); }
                    .s11-cuvette-outline { stroke: #94a3b8; stroke-width: 3; fill: none; }
                    .s11-laser-detector { fill: #475569; stroke: #94a3b8; stroke-width: 1.5; }
                    
                    .s11-plot-svg { width: 220px; height: 220px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; background: rgba(15, 23, 42, 0.8); }
                    .s11-axis { stroke: rgba(255, 255, 255, 0.3); stroke-width: 1.5; }
                    .s11-grid-line { stroke: rgba(255, 255, 255, 0.05); stroke-width: 1; }
                    .s11-data-line { stroke: #38bdf8; stroke-width: 2.5; stroke-dasharray: 2; }
                    .s11-dot { cursor: pointer; transition: all 0.2s ease; }
                    .s11-dot:hover { r: 8; fill: #fbbf24; }
                    
                    .s11-slider { width: 100%; cursor: pointer; accent-color: #f59e0b; }
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s11-wrap">
                    <!-- ENTRY DIAGNOSTIC -->
                    <article class="s11-card s11-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your understanding of reciprocal rates, Beer's law linear relationships, and Arrhenius graph variables.</p>
                        <div class="s11-grid">
                            <div class="s11-pane">
                                <strong>1. Beer's Law Graphing</strong>
                               <p>In a spectrophotometry calibration curve of Absorbance vs Concentration, what does the slope of the line represent?</p>
                                <div class="s11-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q1 === 'a' ? 'active' : ''}" data-diag="q1" data-value="a">Molar Absorptivity × Path Length (ε·b)</button>
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q1 === 'wrong' ? 'active' : ''}" data-diag="q1" data-value="wrong">Temperature multiplier</button>
                                </div>
                            </div>
                            <div class="s11-pane">
                                <strong>2. Arrhenius Linear Plot</strong>
                                <p>To linearize kinetics data with the Arrhenius equation, what variable should be plotted on the x-axis?</p>
                                <div class="s11-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q2 === 'a' ? 'active' : ''}" data-diag="q2" data-value="a">Reciprocal temperature in Kelvin (1/T)</button>
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q2 === 'wrong' ? 'active' : ''}" data-diag="q2" data-value="wrong">Log of pressure (ln P)</button>
                                </div>
                            </div>
                            <div class="s11-pane">
                                <strong>3. First-Order Kinetics</strong>
                                <p>If a plot of ln[A] vs. time yields a straight line with a slope of -0.040 s^-1, what is the reaction rate constant k?</p>
                                <div class="s11-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q3 === 'a' ? 'active' : ''}" data-diag="q3" data-value="a">0.040 s^-1 (k is positive slope magnitude)</button>
                                    <button class="s11-btn ghost ${state.diagnosticAnswers.q3 === 'wrong' ? 'active' : ''}" data-diag="q3" data-value="wrong">-0.040 s^-1</button>
                                </div>
                            </div>
                        </div>
                        <div class="s11-grid" style="margin-top:0.75rem;">
                            <button id="s11-check-diagnostic" class="s11-btn">Check Diagnostic</button>
                        </div>
                        <div id="s11-diagnostic-feedback" class="s11-feedback">${state.diagnosticFeedback}</div>
                        <div class="s11-status">
                            <span class="s11-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s11-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s11-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s11-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s11-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Gas Volume & Linearization</h2>
                        <p>In physical chemistry, we study inverse gas properties and learn how to convert curved graphical relationships into linear ones.</p>
                        
                        <div class="s11-svg-container">
                            <svg class="s11-cuvette-svg" viewBox="0 0 220 100">
                                <rect x="30" y="25" width="130" height="40" fill="none" stroke="#94a3b8" stroke-width="2" />
                                <rect x="10" y="40" width="20" height="10" fill="#94a3b8" />
                                <rect x="30" y="25" width="${volumeVal * 12}" height="40" fill="#38bdf8" fill-opacity="0.3" stroke="none" />
                                <rect x="${30 + volumeVal * 12 - 4}" y="23" width="6" height="44" fill="#64748b" />
                                <rect x="${30 + volumeVal * 12}" y="42" width="55" height="6" fill="#64748b" />
                                <rect x="${30 + volumeVal * 12 + 55}" y="30" width="6" height="30" fill="#64748b" />
                                <text x="35" y="42" font-size="8px" fill="#f8fafc" font-weight="bold">Volume V: ${volumeVal.toFixed(1)} L</text>
                                <text x="35" y="55" font-size="8px" fill="#cbd5e1">Pressure P: ${calculatedPressure.toFixed(2)} atm</text>
                            </svg>

                            <svg class="s11-plot-svg" viewBox="0 0 220 160">
                                <line class="s11-grid-line" x1="30" y1="30" x2="190" y2="30" />
                                <line class="s11-grid-line" x1="30" y1="80" x2="190" y2="80" />
                                <line class="s11-grid-line" x1="80" y1="20" x2="80" y2="130" />
                                <line class="s11-grid-line" x1="130" y1="20" x2="130" y2="130" />
                                <line class="s11-axis" x1="30" y1="130" x2="200" y2="130" />
                                <line class="s11-axis" x1="30" y1="20" x2="30" y2="130" />
                                <polyline points="${pointsString}" fill="none" stroke="#60a5fa" stroke-width="2" ${isLinear ? '' : 'stroke-dasharray="3"'} />
                                ${graphPoints.map(pt => `<circle cx="${pt.x}" cy="${pt.y}" r="3" fill="#10b981" />`).join('')}
                                <circle cx="${targetX}" cy="${targetY}" r="5" fill="#f43f5e" stroke="#f8fafc" stroke-width="1" />
                                <text x="8" y="25" font-size="7px" fill="#94a3b8" transform="rotate(-90 8 25)">Pressure P (atm)</text>
                                <text x="145" y="145" font-size="7px" fill="#94a3b8">${isLinear ? 'Reciprocal 1/V (L^-1)' : (state.linearizeChoice === 'V2' ? 'V^2 (L^2)' : 'Volume V (L)')}</text>
                            </svg>
                        </div>

                        <!-- L11.1 Syringe Pressure calculation -->
                        <div class="s11-pane">
                            <h3>L11.1 Reciprocal &amp; Inverse Graphing</h3>
                            <p>Boyle's Law states that for a fixed gas at constant temperature, pressure (P) and volume (V) are inversely related ($P = k / V$, where $k = 10.0\text{ atm}\cdot\text{L}$).</p>
                            <label class="s11-label">Adjust the syringe volume (L) using the slider:</label>
                            <input type="range" id="s11-volume-slider" class="s11-slider" min="2.0" max="10.0" step="0.5" value="${state.volumeVal}" ${disabled(state.concreteUnlocked)}>
                            
                            <div style="margin-top: 0.6rem;">
                                <label style="font-size:0.8rem; font-weight:700;">Set Volume to 5.0 L. Enter the calculated pressure in atm (P = 10 / V):</label>
                                <div class="s11-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                    <input type="text" id="s11-pressure-input" class="s11-input" placeholder="e.g. 2.0" value="${state.pressureInput}" ${disabled(state.concreteUnlocked)}>
                                    <button id="s11-check-l111" class="s11-btn" ${disabled(state.concreteUnlocked)}>Verify L11.1</button>
                                </div>
                            </div>
                            <div class="s11-feedback" id="s11-l111-feedback">${state.l111Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain Boyle's Law P = k/V, how volume and pressure are inversely related, and how to read the syringe simulation." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (L11.1)</button>
                            </div>
                        </div>

                        <!-- L11.2 Linearization Concept -->
                        <div class="s11-pane">
                            <h3>L11.2 The Linearization Concept</h3>
                            <p>Plotting Pressure vs Volume gives a curved hyperbola. To isolate constants easily, we transform the X-axis variable so that the coordinates align linearly ($y = m \cdot x' + b$).</p>
                            <label style="font-size:0.8rem; font-weight:700;">Choose the transformed X-axis variable to linearize this reciprocal plot:</label>
                            <div class="s11-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <select id="s11-linearize-select" class="s11-input" ${disabled(state.concreteUnlocked)}>
                                    <option value="">Select axis...</option>
                                    <option value="V" ${state.linearizeChoice === 'V' ? 'selected' : ''}>Volume V (curved)</option>
                                    <option value="V2" ${state.linearizeChoice === 'V2' ? 'selected' : ''}>Volume Squared V² (curved)</option>
                                    <option value="invV" ${state.linearizeChoice === 'invV' ? 'selected' : ''}>Reciprocal of Volume 1/V (linear)</option>
                                </select>
                                <button id="s11-check-l112" class="s11-btn" ${disabled(state.concreteUnlocked)}>Verify L11.2</button>
                            </div>
                            <div class="s11-feedback" id="s11-l112-feedback">${state.l112Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain how plotting P vs 1/V linearizes the Boyle's Law equation and yields a slope equal to the constant k." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (L11.2)</button>
                            </div>
                        </div>

                        <div class="s11-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Level Mission Progress</h3>
                            <div class="s11-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s11-pill ${state.l111Correct ? 'good' : 'locked'}">L11.1 Reciprocal Graphing Completed</span>
                                <span class="s11-pill ${state.l112Correct ? 'good' : 'locked'}">L11.2 Linearization Concept Completed</span>
                            </div>
                            <div class="s11-grid" style="gap:4px;">
                                <button id="s11-continue-pictorial" class="s11-btn" ${(state.fastTrack || (state.l111Correct && state.l112Correct)) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial</button>
                            </div>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Kinetics Plots & Arrhenius Activation Energy</h2>
                        <p>We analyze graphical chemical models to extract critical values like reaction orders and activation energies ($E_a$).</p>
                        
                        <!-- L11.3 Kinetics Order -->
                        <div class="s11-pane">
                            <h3>L11.3 Linearizing Kinetics (First &amp; Second Order)</h3>
                            <p>Concentration-time graphs are transformed to determine reaction order. A first-order reaction has a linear plot of $\ln[\text{A}]$ vs. time. What reaction order yields a straight line with a positive slope when we plot reciprocal concentration $\frac{1}{[\text{A}]}$ vs. time?</p>
                            <div class="s11-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <select id="s11-kinetics-select" class="s11-input" ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Select order...</option>
                                    <option value="0" ${state.kineticsChoice === '0' ? 'selected' : ''}>Zero-Order (linear for [A] vs. t)</option>
                                    <option value="1st" ${state.kineticsChoice === '1st' ? 'selected' : ''}>First-Order (linear for ln[A] vs. t)</option>
                                    <option value="2nd" ${state.kineticsChoice === '2nd' ? 'selected' : ''}>Second-Order (linear for 1/[A] vs. t)</option>
                                </select>
                                <button id="s11-check-l113" class="s11-btn" ${disabled(state.pictorialUnlocked)}>Verify L11.3</button>
                            </div>
                            <div class="s11-feedback" id="s11-l113-feedback">${state.l113Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain kinetics linearization. Why does first-order linearize with ln[A] vs t, while second-order linearizes with 1/[A] vs t?" ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (L11.3)</button>
                            </div>
                        </div>

                        <!-- L11.4 Arrhenius Slope & Activation Energy -->
                        <div class="s11-pane">
                            <h3>L11.4 Linearizing Thermodynamic Data (Arrhenius &amp; CC)</h3>
                            <p>The Arrhenius plot graphs $\ln(k)$ vs. $1/T$. The slope represents $-E_a / R$ (where $R = 8.3\text{ J/(mol·K)}$). Click both points A and B on the plot to view coordinates, calculate the slope, and enter the Activation Energy $E_a$ in kJ/mol ($E_a = -Slope \cdot R / 1000$).</p>
                            
                            <div class="s11-svg-container">
                                <svg class="s11-plot-svg" viewBox="0 0 200 200">
                                    <line class="s11-grid-line" x1="0" y1="50" x2="200" y2="50" />
                                    <line class="s11-grid-line" x1="0" y1="100" x2="200" y2="100" />
                                    <line class="s11-grid-line" x1="0" y1="150" x2="200" y2="150" />
                                    <line class="s11-grid-line" x1="50" y1="0" x2="50" y2="200" />
                                    <line class="s11-grid-line" x1="100" y1="0" x2="100" y2="200" />
                                    <line class="s11-grid-line" x1="150" y1="0" x2="150" y2="200" />
                                    <line class="s11-axis" x1="30" y1="10" x2="30" y2="180" />
                                    <line class="s11-axis" x1="20" y1="170" x2="190" y2="170" />
                                    <line class="s11-data-line" x1="40" y1="54" x2="170" y2="166" />
                                    <circle class="s11-dot" id="s11-dot-a" cx="${ax}" cy="${ay}" r="6" fill="${state.pointASelected ? '#e11d48' : '#2563eb'}" />
                                    <text x="${ax - 10}" y="${ay - 12}" font-size="8px" fill="#f8fafc">Point A</text>
                                    <circle class="s11-dot" id="s11-dot-b" cx="${bx}" cy="${by}" r="6" fill="${state.pointBSelected ? '#e11d48' : '#2563eb'}" />
                                    <text x="${bx - 10}" y="${by - 12}" font-size="8px" fill="#f8fafc">Point B</text>
                                    <text x="18" y="25" font-size="8px" fill="#94a3b8" transform="rotate(-90 18 25)">y: ln(k)</text>
                                    <text x="150" y="185" font-size="8px" fill="#94a3b8">x: 1/T (K^-1)</text>
                                </svg>
                            </div>

                            <div style="font-size:0.85rem; line-height:1.5; margin: 0.4rem 0;">
                                <div><strong>Selected coordinates:</strong></div>
                                <div>Point A (1/T = ${s11Arrhenius.x1.toFixed(4)}, ln(k) = ${s11Arrhenius.y1.toFixed(1)}): <strong>${state.pointASelected ? 'Selected' : 'Click dot on graph'}</strong></div>
                                <div>Point B (1/T = ${s11Arrhenius.x2.toFixed(4)}, ln(k) = ${s11Arrhenius.y2.toFixed(1)}): <strong>${state.pointBSelected ? 'Selected' : 'Click dot on graph'}</strong></div>
                                ${state.pointASelected && state.pointBSelected ? 
                                  `<div style="margin-top:0.4rem; color:#60a5fa;">Slope calculation: m = (${s11Arrhenius.y2.toFixed(1)} - (${s11Arrhenius.y1.toFixed(1)})) / (${s11Arrhenius.x2.toFixed(4)} - ${s11Arrhenius.x1.toFixed(4)}) = ${s11Arrhenius.slope} K</div>` : ''}
                            </div>

                            <div style="margin-top: 0.6rem;">
                                <label style="font-size:0.8rem; font-weight:700;">Calculate Activation Energy Ea (kJ/mol):</label>
                                <div class="s11-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                    <input type="number" step="any" id="s11-ea-input" class="s11-input" placeholder="e.g. 33.2" value="${state.eaAnswer}" ${disabled(state.pictorialUnlocked)}>
                                    <button id="s11-check-l114" class="s11-btn" ${disabled(state.pictorialUnlocked)}>Verify L11.4</button>
                                </div>
                            </div>
                            <div class="s11-feedback" id="s11-l114-feedback">${state.l114Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Walk me through how to calculate Ea from the slope of an Arrhenius plot, explaining the units and conversion factors." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (L11.4)</button>
                            </div>
                        </div>

                        <div class="s11-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Pictorial Level Mission Progress</h3>
                            <div class="s11-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s11-pill ${state.l113Correct ? 'good' : 'locked'}">L11.3 Kinetics Order Completed</span>
                                <span class="s11-pill ${state.l114Correct ? 'good' : 'locked'}">L11.4 Arrhenius Ea Completed</span>
                            </div>
                            <div class="s11-grid" style="gap:4px;">
                                <button id="s11-continue-abstract" class="s11-btn" ${(state.fastTrack || (state.l113Correct && state.l114Correct)) ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Continue to Abstract</button>
                            </div>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Calibration Algebra & Two-Point Equations</h2>
                        <p>Mathematical calculations allow us to extract properties from calibration curves and estimate properties of unknown samples.</p>
                        
                        <!-- L11.5 Extrapolation & Interpolation -->
                        <div class="s11-pane">
                            <h3>L11.5 Extrapolation &amp; Interpolation</h3>
                            <p>For a calibration line $A = 0.50 \cdot C$ (where A is absorbance and C is concentration in M):</p>
                            <div class="s11-grid" style="grid-template-columns: 1fr 1fr; gap:6px;">
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">1. Interpolate C (M) at A = 0.60:</label>
                                    <input type="number" step="any" id="s11-interp-input" class="s11-input" placeholder="e.g. 1.20" value="${state.interpolationAns}" ${disabled(state.abstractUnlocked)}>
                                </div>
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">2. Extrapolate A at C = 2.50 M:</label>
                                    <input type="number" step="any" id="s11-extrap-input" class="s11-input" placeholder="e.g. 1.25" value="${state.extrapolationAns}" ${disabled(state.abstractUnlocked)}>
                                </div>
                            </div>
                            <button id="s11-check-l115" class="s11-btn" style="margin-top: 8px; width:100%;" ${disabled(state.abstractUnlocked)}>Verify L11.5</button>
                            <div class="s11-feedback" id="s11-l115-feedback">${state.l115Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain the difference between interpolation and extrapolation, and why extrapolating beyond the calibration range is risky." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (L11.5)</button>
                            </div>
                        </div>

                        <!-- L11.6 Two-Point Equations -->
                        <div class="s11-pane">
                            <h3>L11.6 Two-Point Equations</h3>
                            <p>A calibration line passes through coordinates $(0.20\text{ M}, 0.10)$ and $(0.80\text{ M}, 0.40)$. Solve for the slope ($m$) and y-intercept ($b$) of this line:</p>
                            <div class="s11-grid" style="grid-template-columns: 1fr 1fr; gap:6px;">
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">Slope m:</label>
                                    <input type="number" step="any" id="s11-slope-input" class="s11-input" placeholder="e.g. 0.50" value="${state.slopeAns}" ${disabled(state.abstractUnlocked)}>
                                </div>
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">Y-intercept b:</label>
                                    <input type="number" step="any" id="s11-intercept-input" class="s11-input" placeholder="e.g. 0.00" value="${state.interceptAns}" ${disabled(state.abstractUnlocked)}>
                                </div>
                            </div>
                            <button id="s11-check-l116" class="s11-btn" style="margin-top: 8px; width:100%;" ${disabled(state.abstractUnlocked)}>Verify L11.6</button>
                            <div class="s11-feedback" id="s11-l116-feedback">${state.l116Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Show me how to compute the slope (m) and intercept (b) step-by-step from the two coordinates (0.20, 0.10) and (0.80, 0.40)." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (L11.6)</button>
                            </div>
                        </div>

                        <div class="s11-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Abstract Level Mission Progress</h3>
                            <div class="s11-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s11-pill ${state.l115Correct ? 'good' : 'locked'}">L11.5 Interpolation/Extrapolation Completed</span>
                                <span class="s11-pill ${state.l116Correct ? 'good' : 'locked'}">L11.6 Two-Point Equations Completed</span>
                            </div>
                            <div class="s11-grid" style="gap:4px;">
                                <button id="s11-continue-applied" class="s11-btn" ${(state.fastTrack || (state.l115Correct && state.l116Correct)) ? '' : 'disabled'} ${disabled(state.abstractUnlocked)}>Continue to Applied</button>
                            </div>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Beer's Law Deviations & Residual Analysis</h2>
                        <p>We perform quality checks in a laboratory setting by validating calibration fits and checking residuals for deviations.</p>
                        
                        <div class="s11-svg-container">
                            <svg class="s11-cuvette-svg" viewBox="0 0 220 120">
                                <rect x="5" y="50" width="20" height="20" fill="#334155" stroke="#94a3b8" />
                                <circle cx="15" cy="60" r="4" fill="#ef4444" />
                                <rect x="75" y="20" width="70" height="80" fill="#10b981" fill-opacity="${solutionOpacity}" stroke="none" />
                                <rect class="s11-cuvette-outline" x="75" y="15" width="70" height="90" />
                                <rect class="s11-laser-detector" x="185" y="45" width="25" height="30" rx="4" />
                                <text x="189" y="64" font-size="8px" fill="#4ade80" font-family="monospace" font-weight="bold">DET</text>
                                <line x1="25" y1="60" x2="75" y2="60" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
                                <line x1="75" y1="60" x2="145" y2="60" stroke="#ef4444" stroke-width="${beamThickness}" stroke-opacity="${beamOpacity}" />
                                <line x1="145" y1="60" x2="185" y2="60" stroke="#ef4444" stroke-width="${beamThickness}" stroke-opacity="${beamOpacity}" stroke-linecap="round" />
                            </svg>
                        </div>

                        <!-- L11.7 Beer's Law Limits -->
                        <div class="s11-pane">
                            <h3>L11.7 Beer's Law Deviations &amp; Linearity Limits</h3>
                            <p>Adjust the concentration slider to 1.20 M (absorbance 0.60). At high concentrations, Beer's Law deviates from linearity. Select the upper limit of concentration where the calibration curve remains strictly linear.</p>
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.05rem; gap:0.5rem; margin-bottom: 0.6rem;">
                                <span style="color:#10b981; display:flex; align-items:center; gap:0.4rem;">
                                    Concentration:
                                    <input type="number" id="s11-concentration-input" class="s11-input" min="0.00" max="1.50" step="0.05" value="${concentration.toFixed(2)}" ${disabled(state.appliedUnlocked)} style="width: 75px;">
                                    M
                                </span>
                                <span style="color:#ef4444;">Absorbance: <strong>${absorbance.toFixed(2)}</strong></span>
                            </div>
                            <input type="range" id="s11-concentration-slider" class="s11-slider" min="0.00" max="1.50" step="0.05" value="${state.concentrationVal}" ${disabled(state.appliedUnlocked)} style="width:100%; margin-bottom: 0.6rem;">
                            
                            <label class="s11-label">Select upper limit of concentration for linear range:</label>
                            <div class="s11-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <select id="s11-limit-select" class="s11-input" ${disabled(state.appliedUnlocked)}>
                                    <option value="">Select concentration...</option>
                                    <option value="0.006" ${state.limitChoice === '0.006' ? 'selected' : ''}>0.006 M</option>
                                    <option value="${s11Linear.limit}" ${state.limitChoice === s11Linear.limit ? 'selected' : ''}>${s11Linear.limit} M (up to ${(50.0 * parseFloat(s11Linear.limit)).toFixed(2)} Absorbance)</option>
                                    <option value="0.020" ${state.limitChoice === '0.020' ? 'selected' : ''}>0.020 M (includes all data)</option>
                                </select>
                                <button id="s11-check-l117" class="s11-btn" ${disabled(state.appliedUnlocked)}>Verify L11.7</button>
                            </div>
                            <div class="s11-feedback" id="s11-l117-feedback">${state.l117Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain why Beer's Law loses linearity at high concentrations, and why we define a linear limit." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (L11.7)</button>
                            </div>
                        </div>

                        <!-- L11.8 Residual Plots & Fit Quality -->
                        <div class="s11-pane">
                            <h3>L11.8 Residual Plots &amp; Fit Quality</h3>
                            <p>Residual plots display the difference between actual data points and the regression line. A linear model is only valid if the residuals are small and randomly scattered around zero (ideal linear fit). Curved patterns indicate systematic non-linear error.</p>
                            
                            <div style="display:flex; justify-content:center; flex-direction:column; align-items:center; gap:0.5rem; margin:0.6rem 0;">
                                <svg style="width:240px; height:180px; background:#0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius:8px;" viewBox="0 0 240 180">
                                    <line class="s11-axis" x1="25" y1="10" x2="25" y2="120" />
                                    <line class="s11-axis" x1="25" y1="120" x2="225" y2="120" />
                                    <text class="s11-axis-text" x="8" y="70" font-size="7px" fill="#94a3b8" style="transform:rotate(-90 8 70); font-family:sans-serif;">Absorbance</text>
                                    <text class="s11-axis-text" x="110" y="130" font-size="7px" fill="#94a3b8" style="font-family:sans-serif;">Conc (M)</text>
                                    <circle cx="43" cy="104" r="3" fill="#10b981" />
                                    <circle cx="61" cy="88" r="3" fill="#10b981" />
                                    <circle cx="79" cy="72" r="3" fill="#10b981" />
                                    <circle cx="97" cy="56" r="3" fill="#10b981" />
                                    <circle cx="115" cy="40" r="3" fill="#10b981" />
                                    <circle cx="160" cy="27" r="3" fill="#f59e0b" />
                                    <circle cx="205" cy="21" r="3" fill="#ef4444" />
                                    ${state.limitChoice === s11Linear.limit ? `
                                    <line x1="25" y1="120" x2="151" y2="20" stroke="#60a5fa" stroke-width="1.5" />
                                    <line x1="151" y1="20" x2="225" y2="-39" stroke="#60a5fa" stroke-dasharray="3" stroke-width="1" />
                                    ` : ''}
                                    ${state.limitChoice === '0.020' ? `
                                    <line x1="25" y1="112" x2="225" y2="18" stroke="#f43f5e" stroke-width="1.5" />
                                    ` : ''}
                                    <line x1="25" y1="155" x2="225" y2="155" stroke="rgba(255,255,255,0.2)" />
                                    <text class="s11-axis-text" x="5" y="160" font-size="6px" fill="#94a3b8" style="font-family:sans-serif;">Residuals</text>
                                    ${state.limitChoice === s11Linear.limit ? `
                                    <circle cx="43" cy="154" r="1.5" fill="#60a5fa" />
                                    <circle cx="61" cy="156" r="1.5" fill="#60a5fa" />
                                    <circle cx="79" cy="155" r="1.5" fill="#60a5fa" />
                                    <circle cx="97" cy="157" r="1.5" fill="#60a5fa" />
                                    <circle cx="115" cy="154" r="1.5" fill="#60a5fa" />
                                    ` : ''}
                                    ${state.limitChoice === '0.020' ? `
                                    <circle cx="43" cy="159" r="1.5" fill="#f43f5e" />
                                    <circle cx="61" cy="158" r="1.5" fill="#f43f5e" />
                                    <circle cx="79" cy="156" r="1.5" fill="#f43f5e" />
                                    <circle cx="97" cy="153" r="1.5" fill="#f43f5e" />
                                    <circle cx="115" cy="151" r="1.5" fill="#f43f5e" />
                                    <circle cx="160" cy="152" r="1.5" fill="#f43f5e" />
                                    <circle cx="205" cy="156" r="1.5" fill="#f43f5e" />
                                    ` : ''}
                                </svg>
                            </div>
                            
                            <button id="s11-check-l118" class="s11-btn" style="width:100%;" ${disabled(state.appliedUnlocked)}>Verify L11.8</button>
                            <div class="s11-feedback" id="s11-l118-feedback">${state.l118Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain how a residual plot indicates whether a linear model is appropriate, contrasting random residuals with U-shaped residuals." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (L11.8)</button>
                            </div>
                        </div>

                        <div class="s11-pane" style="margin-top: 0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Applied Level Mission Progress</h3>
                            <div class="s11-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s11-pill ${state.l117Correct ? 'good' : 'locked'}">L11.7 Limits of Linearity Completed</span>
                                <span class="s11-pill ${state.l118Correct ? 'good' : 'locked'}">L11.8 Residuals Fit Completed</span>
                            </div>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's11-check-diagnostic': {
                        id: 's11-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 11 diagnostic answers on Beer\'s Law and Arrhenius linear equations.'
                    },
                    's11-volume-slider': {
                        id: 's11-boyles-law-slider',
                        level: 'concrete',
                        keys: 'volumeVal',
                        prompt: 'Help me adjust the volume slider and see why volume affects gas pressure.'
                    },
                    's11-check-l111': {
                        id: 's11-l111',
                        level: 'concrete',
                        keys: 'pressureInput,l111Correct',
                        prompt: 'Help me calculate the gas pressure at volume = 5.0 L.'
                    },
                    's11-check-l112': {
                        id: 's11-l112',
                        level: 'concrete',
                        keys: 'linearizeChoice,l112Correct',
                        prompt: 'Help me select the correct X-axis variable to linearize Boyle\'s Law.'
                    },
                    's11-check-l113': {
                        id: 's11-l113',
                        level: 'pictorial',
                        keys: 'kineticsChoice,l113Correct',
                        prompt: 'Help me identify the kinetics order associated with a linear reciprocal plot.'
                    },
                    's11-check-l114': {
                        id: 's11-l114',
                        level: 'pictorial',
                        keys: 'pointASelected,pointBSelected,eaAnswer,l114Correct',
                        prompt: `Help me compute the Arrhenius slope and activation energy from the points (${s11Arrhenius.x1.toFixed(4)}, ${s11Arrhenius.y1.toFixed(1)}) and (${s11Arrhenius.x2.toFixed(4)}, ${s11Arrhenius.y2.toFixed(1)}).`
                    },
                    's11-check-l115': {
                        id: 's11-l115',
                        level: 'abstract',
                        keys: 'interpolationAns,extrapolationAns,l115Correct',
                        prompt: 'Help me calculate the interpolated and extrapolated values from the calibration curve A = 0.50 * C.'
                    },
                    's11-check-l116': {
                        id: 's11-l116',
                        level: 'abstract',
                        keys: 'slopeAns,interceptAns,l116Correct',
                        prompt: 'Help me solve the line slope m and intercept b from the two coordinates (0.20, 0.10) and (0.80, 0.40).'
                    },
                    's11-concentration-slider': {
                        id: 's11-applied-slider',
                        level: 'applied',
                        keys: 'concentrationVal',
                        prompt: 'Help me adjust the concentration slider and understand absorbance.'
                    },
                    's11-check-l117': {
                        id: 's11-l117',
                        level: 'applied',
                        keys: 'limitChoice,l117Correct',
                        prompt: 'Help me identify the limits of linearity for Beer\'s Law curves.'
                    },
                    's11-check-l118': {
                        id: 's11-l118',
                        level: 'applied',
                        keys: 'l118Correct',
                        prompt: 'Help me interpret the residual plots to verify the model fit quality.'
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
            host.querySelector('#s11-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'a' &&
                                state.diagnosticAnswers.q2 === 'a' &&
                                state.diagnosticAnswers.q3 === 'a';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.l111Correct = true;
                    state.l112Correct = true;
                    state.l113Correct = true;
                    state.l114Correct = true;
                    state.l115Correct = true;
                    state.l116Correct = true;
                    state.l117Correct = true;
                    state.l118Correct = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered data linearization. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active. Solve the Concrete Level to progress.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // L11.1 Syringe Slider (Boyle's Law)
            const volSlider = host.querySelector('#s11-volume-slider');
            if (volSlider) {
                volSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    state.volumeVal = val;
                    persist('Volume slider shifted');
                    this.mount({ host, state, onStateChange });
                });
            }

            // Concrete: Pressure input text sync
            const pressInput = host.querySelector('#s11-pressure-input');
            if (pressInput) {
                pressInput.addEventListener('input', (e) => {
                    state.pressureInput = e.target.value;
                });
            }

            // Concrete: Linearize X-axis selection
            const linSelect = host.querySelector('#s11-linearize-select');
            if (linSelect) {
                linSelect.addEventListener('change', (e) => {
                    state.linearizeChoice = e.target.value;
                    persist('Linearize selection changed');
                    this.mount({ host, state, onStateChange });
                });
            }

            // Verify L11.1
            host.querySelector('#s11-check-l111')?.addEventListener('click', () => {
                const pressAns = parseFloat(String(state.pressureInput || '').trim());
                const currentV = parseFloat(state.volumeVal);
                const correctV = Math.abs(currentV - 5.0) < 0.01;
                const correctP = Math.abs(pressAns - 2.0) < 0.05;

                if (correctV && correctP) {
                    state.l111Correct = true;
                    state.l111Feedback = 'Correct! Setting Volume to 5.0 L gives a pressure of 2.0 atm (10 / 5 = 2.0 atm).';
                } else {
                    state.l111Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!correctV) errorMsg += 'Set syringe volume to exactly 5.0 L using the slider. ';
                    if (isNaN(pressAns) || !correctP) errorMsg += 'Enter the correct pressure calculated as P = 10 / V (10 / 5 = 2.0 atm). ';
                    state.l111Feedback = errorMsg;
                }

                syncConcreteCompletion();
                persist('L11.1 checked');
                this.mount({ host, state, onStateChange });
            });

            // Verify L11.2
            host.querySelector('#s11-check-l112')?.addEventListener('click', () => {
                const correctL = state.linearizeChoice === 'invV';

                if (correctL) {
                    state.l112Correct = true;
                    state.l112Feedback = 'Correct! Plotting Pressure vs 1/V linearizes the reciprocal relationship ($P = 10 \\cdot V^{-1}$).';
                } else {
                    state.l112Correct = false;
                    state.l112Feedback = 'Not yet. Select the reciprocal choice (1/V) to make the data points lie on a straight line.';
                }

                syncConcreteCompletion();
                persist('L11.2 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncConcreteCompletion = () => {
                if (state.fastTrack) return;
                if (state.l111Correct && state.l112Correct) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                } else {
                    state.concreteCompleted = false;
                }
            };

            // Concrete transition
            host.querySelector('#s11-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.l112Feedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.l112Feedback = 'Complete both L11.1 and L11.2 first.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial: Kinetics dropdown sync
            const kineticsSelect = host.querySelector('#s11-kinetics-select');
            if (kineticsSelect) {
                kineticsSelect.addEventListener('change', (e) => {
                    state.kineticsChoice = e.target.value;
                });
            }

            // Verify L11.3
            host.querySelector('#s11-check-l113')?.addEventListener('click', () => {
                const kineticsCorrect = state.kineticsChoice === '2nd';
                if (kineticsCorrect) {
                    state.l113Correct = true;
                    state.l113Feedback = 'Correct! Second-Order concentration changes linearize when plotted as 1/[A] vs. time.';
                } else {
                    state.l113Correct = false;
                    state.l113Feedback = 'Incorrect. Recall: Zero-order is [A] vs t, First-order is ln[A] vs t, and Second-order is 1/[A] vs t.';
                }

                syncPictorialCompletion();
                persist('L11.3 checked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial: Arrhenius Dots selection
            host.querySelector('#s11-dot-a')?.addEventListener('click', () => {
                state.pointASelected = !state.pointASelected;
                if (state.pointASelected && state.pointBSelected) {
                    state.l114Feedback = `Both points selected! Calculate slope: m = (${s11Arrhenius.y2.toFixed(1)} - (${s11Arrhenius.y1.toFixed(1)})) / (${s11Arrhenius.x2.toFixed(4)} - ${s11Arrhenius.x1.toFixed(4)}) = ${s11Arrhenius.slope} K. Now calculate Ea = -Slope * R / 1000. Enter ${s11Arrhenius.answerKey} below.`;
                } else {
                    state.l114Feedback = 'Point A selected. Click Point B on the plot.';
                }
                persist('Point A toggled');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s11-dot-b')?.addEventListener('click', () => {
                state.pointBSelected = !state.pointBSelected;
                if (state.pointASelected && state.pointBSelected) {
                    state.l114Feedback = `Both points selected! Calculate slope: m = (${s11Arrhenius.y2.toFixed(1)} - (${s11Arrhenius.y1.toFixed(1)})) / (${s11Arrhenius.x2.toFixed(4)} - ${s11Arrhenius.x1.toFixed(4)}) = ${s11Arrhenius.slope} K. Now calculate Ea = -Slope * R / 1000. Enter ${s11Arrhenius.answerKey} below.`;
                } else {
                    state.l114Feedback = 'Point B selected. Click Point A on the plot.';
                }
                persist('Point B toggled');
                this.mount({ host, state, onStateChange });
            });

            // L11.4 input sync
            const eaInput = host.querySelector('#s11-ea-input');
            if (eaInput) {
                eaInput.addEventListener('input', (e) => {
                    state.eaAnswer = e.target.value;
                });
            }

            // Verify L11.4
            host.querySelector('#s11-check-l114')?.addEventListener('click', () => {
                const dotsCorrect = state.pointASelected && state.pointBSelected;
                const eaVal = parseFloat(String(state.eaAnswer || '').trim());
                const expectedEa = parseFloat(s11Arrhenius.answerKey);
                const eaCorrect = !isNaN(eaVal) && Math.abs(eaVal - expectedEa) < 0.25;

                if (dotsCorrect && eaCorrect) {
                    state.l114Correct = true;
                    state.l114Feedback = `Correct! Ea = ${s11Arrhenius.answerKey} kJ/mol (slope = ${s11Arrhenius.slope} K).`;
                } else {
                    state.l114Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!dotsCorrect) errorMsg += 'Click both points A and B on the plot to view coordinates. ';
                    if (dotsCorrect && !eaCorrect) errorMsg += `Activation energy is incorrect. Expected: ${s11Arrhenius.answerKey} kJ/mol.`;
                    state.l114Feedback = errorMsg;
                }

                syncPictorialCompletion();
                persist('L11.4 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncPictorialCompletion = () => {
                if (state.fastTrack) return;
                if (state.l113Correct && state.l114Correct) {
                    state.pictorialCompleted = true;
                    state.abstractUnlocked = true;
                } else {
                    state.pictorialCompleted = false;
                }
            };

            // Pictorial transition
            host.querySelector('#s11-continue-abstract')?.addEventListener('click', () => {
                if (state.fastTrack || state.abstractUnlocked) {
                    state.l114Feedback = 'Abstract unlocked. Continue below.';
                } else {
                    state.l114Feedback = 'Complete both L11.3 and L11.4 first.';
                }
                persist('Continue to abstract clicked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract: Inputs sync
            const interpIn = host.querySelector('#s11-interp-input');
            if (interpIn) {
                interpIn.addEventListener('input', (e) => { state.interpolationAns = e.target.value; });
            }
            const extrapIn = host.querySelector('#s11-extrap-input');
            if (extrapIn) {
                extrapIn.addEventListener('input', (e) => { state.extrapolationAns = e.target.value; });
            }
            const slopeIn = host.querySelector('#s11-slope-input');
            if (slopeIn) {
                slopeIn.addEventListener('input', (e) => { state.slopeAns = e.target.value; });
            }
            const interceptIn = host.querySelector('#s11-intercept-input');
            if (interceptIn) {
                interceptIn.addEventListener('input', (e) => { state.interceptAns = e.target.value; });
            }

            // Verify L11.5
            host.querySelector('#s11-check-l115')?.addEventListener('click', () => {
                const interpVal = parseFloat(String(state.interpolationAns || '').trim());
                const extrapVal = parseFloat(String(state.extrapolationAns || '').trim());

                const interpCorrect = !isNaN(interpVal) && Math.abs(interpVal - 1.20) < 0.01;
                const extrapCorrect = !isNaN(extrapVal) && Math.abs(extrapVal - 1.25) < 0.01;

                if (interpCorrect && extrapCorrect) {
                    state.l115Correct = true;
                    state.l115Feedback = 'Correct! Interpolation yields C = 1.20 M (0.60 / 0.50), and extrapolation yields A = 1.25 (0.50 * 2.50).';
                } else {
                    state.l115Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!interpCorrect) errorMsg += 'Interpolation: solve 0.60 = 0.50 * C (C = 1.20 M). ';
                    if (!extrapCorrect) errorMsg += 'Extrapolation: solve A = 0.50 * 2.50 (A = 1.25). ';
                    state.l115Feedback = errorMsg;
                }

                syncAbstractCompletion();
                persist('L11.5 checked');
                this.mount({ host, state, onStateChange });
            });

            // Verify L11.6
            host.querySelector('#s11-check-l116')?.addEventListener('click', () => {
                const slopeVal = parseFloat(String(state.slopeAns || '').trim());
                const interceptVal = parseFloat(String(state.interceptAns || '').trim());

                const slopeCorrect = !isNaN(slopeVal) && Math.abs(slopeVal - 0.50) < 0.01;
                const interceptCorrect = !isNaN(interceptVal) && Math.abs(interceptVal - 0.00) < 0.01;

                if (slopeCorrect && interceptCorrect) {
                    state.l116Correct = true;
                    state.l116Feedback = 'Correct! The slope is 0.50 and the y-intercept is 0.00 ($A = 0.50 \\cdot C + 0.00$).';
                } else {
                    state.l116Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!slopeCorrect) errorMsg += 'Slope calculation: m = (0.40 - 0.10)/(0.80 - 0.20) = 0.30/0.60 = 0.50. ';
                    if (!interceptCorrect) errorMsg += 'Y-intercept: b = y1 - m*x1 = 0.10 - 0.50*0.20 = 0.00. ';
                    state.l116Feedback = errorMsg;
                }

                syncAbstractCompletion();
                persist('L11.6 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncAbstractCompletion = () => {
                if (state.fastTrack) return;
                if (state.l115Correct && state.l116Correct) {
                    state.abstractCompleted = true;
                    state.appliedUnlocked = true;
                } else {
                    state.abstractCompleted = false;
                }
            };

            // Abstract transition
            host.querySelector('#s11-continue-applied')?.addEventListener('click', () => {
                if (state.fastTrack || state.appliedUnlocked) {
                    state.l116Feedback = 'Applied unlocked. Continue below.';
                } else {
                    state.l116Feedback = 'Complete both L11.5 and L11.6 first.';
                }
                persist('Continue to applied clicked');
                this.mount({ host, state, onStateChange });
            });

            // Applied: Slider & Input concentration updates
            const updateAppliedConcentrationState = (val) => {
                state.concentrationVal = val;
                persist('Applied concentration shifted');
                this.mount({ host, state, onStateChange });
            };

            const appSlider = host.querySelector('#s11-concentration-slider');
            if (appSlider) {
                appSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    updateAppliedConcentrationState(val);
                });
            }

            const appInput = host.querySelector('#s11-concentration-input');
            if (appInput) {
                appInput.addEventListener('change', (e) => {
                    let val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        val = Math.max(0.0, Math.min(1.5, val));
                        updateAppliedConcentrationState(val);
                    }
                });
            }

            // Applied limit select dropdown sync
            const limitSelect = host.querySelector('#s11-limit-select');
            if (limitSelect) {
                limitSelect.addEventListener('change', (e) => {
                    state.limitChoice = e.target.value;
                    persist('Limit choice changed');
                    this.mount({ host, state, onStateChange });
                });
            }

            // Verify L11.7
            host.querySelector('#s11-check-l117')?.addEventListener('click', () => {
                const concVal = parseFloat(state.concentrationVal);
                const limitChoice = state.limitChoice;
                const calibCorrect = Math.abs(concVal - 1.20) < 0.01;
                const limitCorrect = limitChoice === s11Linear.limit;

                if (calibCorrect && limitCorrect) {
                    state.l117Correct = true;
                    state.l117Feedback = 'Correct! Upper limit of linearity is 0.010 M. Setting concentration to 1.20 M yields absorbance 0.60.';
                } else {
                    state.l117Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!calibCorrect) errorMsg += 'Adjust concentration to exactly 1.20 M using the slider. ';
                    if (!limitCorrect) {
                        if (limitChoice === '0.020') {
                            errorMsg += '0.020 M includes saturated data. Notice that the fit line deviates from high concentrations. ';
                        } else {
                            errorMsg += `Select ${s11Linear.limit} M as the upper limit of the linear range. `;
                        }
                    }
                    state.l117Feedback = errorMsg;
                }

                syncAppliedCompletion();
                persist('L11.7 checked');
                this.mount({ host, state, onStateChange });
            });

            // Verify L11.8
            host.querySelector('#s11-check-l118')?.addEventListener('click', () => {
                const limitChoice = state.limitChoice;
                const limitCorrect = limitChoice === s11Linear.limit;

                if (limitCorrect) {
                    state.l118Correct = true;
                    state.l118Feedback = 'Correct! Fitting up to 0.010 M results in random residuals, proving excellent fit quality within that domain.';
                } else {
                    state.l118Correct = false;
                    if (limitChoice === '0.020') {
                        state.l118Feedback = 'Incorrect. Notice that the residual plot shows a curved U-shape, indicating systematic non-linear error.';
                    } else {
                        state.l118Feedback = 'Please perform L11.7 first and fit the linear range of the calibration curve to evaluate residuals.';
                    }
                }

                syncAppliedCompletion();
                persist('L11.8 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncAppliedCompletion = () => {
                if (state.fastTrack) return;
                if (state.l117Correct && state.l118Correct) {
                    state.appliedCompleted = true;
                } else {
                    state.appliedCompleted = false;
                }
            };
        },
        unmount() {}
    };
}
