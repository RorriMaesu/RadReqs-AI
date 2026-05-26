const createInitialStage11State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Concrete: Beer's Law Calibrator
    concentrationVal: 0.20,
    concreteFeedback: 'Concrete mission: Adjust the slider to set concentration to 1.20 M (where Absorbance A = 0.60) to unlock Pictorial.',
    concreteCorrect: false,
    concreteCompleted: false,
    concreteMission: { calibReady: false, limitsReady: false },

    // L11.7 & L11.8: Beer's Law limits of linearity
    limitChoice: '',
    limitFeedback: 'L11.7 & L11.8: Select the concentration limit where the Beer\'s Law calibration curve remains strictly linear.',
    limitCorrect: false,

    // Pictorial: Arrhenius Plot Linearizer
    pointASelected: false,
    pointBSelected: false,
    eaAnswer: '',
    pictorialFeedback: 'Select both data points on the plot to view coordinates, calculate the slope, and enter the activation energy.',
    pictorialCorrect: false,

    // Abstract: Linearization Matcher
    abstractAnswers: { q1: '', q2: '', q3: '', q4: '' },
    abstractFeedback: 'Match the four chemical laws to the variable that must be plotted on the Y-axis to achieve a straight line.',
    abstractCorrect: false,

    // Applied: Kinetics & Half-Life
    appliedAnswer: '',
    appliedFeedback: 'Solve for the half-life t_1/2 = ln(2) / k given a first-order rate constant k = 0.0347 min^-1.',
    appliedCorrect: false
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

            // Concrete: Beer's law values
            const concentration = parseFloat(state.concentrationVal);
            const absorbance = 0.50 * concentration;
            // Laser beam visual attenuation
            const beamThickness = Math.max(1, 6 - 3.5 * (concentration / 1.50));
            const beamOpacity = Math.max(0.15, 1 - 0.75 * (concentration / 1.50));
            const solutionOpacity = 0.1 + 0.8 * (concentration / 1.50);

            // Pictorial: Arrhenius graph coordinates mapping scaled dynamically
            const ax = -350 + s11Arrhenius.x1 * 140000;
            const ay = 20 - 30 * s11Arrhenius.y1;
            const bx = -350 + s11Arrhenius.x2 * 140000;
            const by = 20 - 30 * s11Arrhenius.y2;

            host.innerHTML = `
                <style>
                    .s11-wrap { display: grid; gap: 1.2rem; }
                    .s11-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s11-card h2, .s11-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s11-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s11-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s11-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
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
                    .s11-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; }
                    .s11-cuvette-svg { width: 220px; height: 120px; background: rgba(15, 23, 42, 0.8); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); }
                    .s11-cuvette-outline { stroke: #94a3b8; stroke-width: 3; fill: none; }
                    .s11-laser-detector { fill: #475569; stroke: #94a3b8; stroke-width: 1.5; }
                    
                    .s11-plot-svg { width: 220px; height: 220px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; background: rgba(15, 23, 42, 0.8); }
                    .s11-axis { stroke: rgba(255, 255, 255, 0.25); stroke-width: 1.5; }
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
                        <h2>Concrete Level: Beer's Law Spectrophotometer Calibrator</h2>
                        <p><strong>L11.5 Interpolation &amp; Calibration:</strong> Light absorbance (A) is directly proportional to solute concentration (C) by Beer's Law ($A = k \cdot C$, where $k = 0.50\text{ M}^{-1}$).
                        Adjust the concentration slider to reach an Absorbance of **exactly 0.60** (which corresponds to $C = 1.20\text{ M}$). Watch how the solution color darkens and attenuates the laser beam.</p>
                        
                        <div class="s11-svg-container">
                            <svg class="s11-cuvette-svg" viewBox="0 0 220 120">
                                <!-- Laser source -->
                                <rect x="5" y="50" width="20" height="20" fill="#334155" stroke="#94a3b8" />
                                <circle cx="15" cy="60" r="4" fill="#ef4444" />
                                
                                <!-- Cuvette container with solution -->
                                <rect x="75" y="20" width="70" height="80" fill="#10b981" fill-opacity="${solutionOpacity}" stroke="none" />
                                <rect class="s11-cuvette-outline" x="75" y="15" width="70" height="90" />
                                
                                <!-- Laser Detector -->
                                <rect class="s11-laser-detector" x="185" y="45" width="25" height="30" rx="4" />
                                <text x="189" y="64" font-size="8px" fill="#4ade80" font-family="monospace" font-weight="bold">DET</text>
                                
                                <!-- Laser beam -->
                                <!-- Incoming beam -->
                                <line x1="25" y1="60" x2="75" y2="60" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
                                <!-- Attenuated beam inside cuvette -->
                                <line x1="75" y1="60" x2="145" y2="60" stroke="#ef4444" stroke-width="${beamThickness}" stroke-opacity="${beamOpacity}" />
                                <!-- Outgoing attenuated beam -->
                                <line x1="145" y1="60" x2="185" y2="60" stroke="#ef4444" stroke-width="${beamThickness}" stroke-opacity="${beamOpacity}" stroke-linecap="round" />
                            </svg>
                        </div>
                        
                        <div class="s11-pane">
                            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.05rem; gap:0.5rem;">
                                <span style="color:#10b981; display:flex; align-items:center; gap:0.4rem;">
                                    Concentration:
                                    <input type="number" id="s11-concentration-input" class="s11-input" min="0.00" max="1.50" step="0.05" value="${concentration.toFixed(2)}" ${disabled(state.concreteUnlocked)} style="width: 75px;">
                                    M
                                </span>
                                <span style="color:#ef4444;">Absorbance: <strong>${absorbance.toFixed(2)}</strong></span>
                            </div>
                            <input type="range" id="s11-concentration-slider" class="s11-slider" min="0.00" max="1.50" step="0.05" value="${state.concentrationVal}" ${disabled(state.concreteUnlocked)} style="width:100%; margin-top:0.4rem;">
                        </div>
                        
                        <div class="s11-feedback" id="s11-concrete-feedback">${state.concreteFeedback}</div>

                        <!-- L11.7 & L11.8 Beer's Law Saturation & Residual Analysis -->
                        <div class="s11-pane" style="margin-top:0.75rem;">
                            <strong>L11.7 &amp; L11.8 Beer's Law Saturation &amp; Residual Analysis</strong>
                            <p>Calibration curves often plateau at high concentrations because solute molecules shield each other, violating the linear assumption. Residual plots show the difference between actual data and the regression line.</p>
                            
                            <div style="display:flex; justify-content:center; flex-direction:column; align-items:center; gap:0.5rem; margin:0.6rem 0;">
                                <div><strong>Calibration Fit &amp; Residuals</strong></div>
                                <svg style="width:240px; height:180px; background:#0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius:8px;" viewBox="0 0 240 180">
                                    <!-- Axes -->
                                    <line class="s11-axis" x1="25" y1="10" x2="25" y2="120" />
                                    <line class="s11-axis" x1="25" y1="120" x2="225" y2="120" />
                                    <text class="s11-axis-text" x="8" y="70" font-size="7px" fill="#94a3b8" style="transform:rotate(-90 8 70); font-family:sans-serif;">Absorbance</text>
                                    <text class="s11-axis-text" x="110" y="130" font-size="7px" fill="#94a3b8" style="font-family:sans-serif;">Conc (M)</text>

                                    <!-- Scatter Points -->
                                    <!-- C=0.002, A=0.10 --> <circle cx="43" cy="104" r="3" fill="#10b981" />
                                    <!-- C=0.004, A=0.20 --> <circle cx="61" cy="88" r="3" fill="#10b981" />
                                    <!-- C=0.006, A=0.30 --> <circle cx="79" cy="72" r="3" fill="#10b981" />
                                    <!-- C=0.008, A=0.40 --> <circle cx="97" cy="56" r="3" fill="#10b981" />
                                    <!-- C=0.010, A=0.50 --> <circle cx="115" cy="40" r="3" fill="#10b981" />
                                    <!-- C=0.015, A=0.58 --> <circle cx="160" cy="27" r="3" fill="#f59e0b" />
                                    <!-- C=0.020, A=0.62 --> <circle cx="205" cy="21" r="3" fill="#ef4444" />

                                    <!-- Regression fit line -->
                                    ${state.limitChoice === s11Linear.limit ? `
                                    <line x1="25" y1="120" x2="151" y2="20" stroke="#60a5fa" stroke-width="1.5" />
                                    <line x1="151" y1="20" x2="225" y2="-39" stroke="#60a5fa" stroke-dasharray="3" stroke-width="1" />
                                    ` : ''}
                                    ${state.limitChoice === '0.020' ? `
                                    <line x1="25" y1="112" x2="225" y2="18" stroke="#f43f5e" stroke-width="1.5" />
                                    ` : ''}

                                    <!-- Residual sub-plot at bottom -->
                                    <line x1="25" y1="155" x2="225" y2="155" stroke="rgba(255,255,255,0.2)" />
                                    <text class="s11-axis-text" x="5" y="160" font-size="6px" fill="#94a3b8" style="font-family:sans-serif;">Residuals</text>
                                    ${state.limitChoice === s11Linear.limit ? `
                                    <!-- residuals are small and random -->
                                    <circle cx="43" cy="154" r="1.5" fill="#60a5fa" />
                                    <circle cx="61" cy="156" r="1.5" fill="#60a5fa" />
                                    <circle cx="79" cy="155" r="1.5" fill="#60a5fa" />
                                    <circle cx="97" cy="157" r="1.5" fill="#60a5fa" />
                                    <circle cx="115" cy="154" r="1.5" fill="#60a5fa" />
                                    ` : ''}
                                    ${state.limitChoice === '0.020' ? `
                                    <!-- residuals show curved systematic error -->
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

                            <label class="s11-label">Select upper limit of concentration for linear range:</label>
                            <select id="s11-limit-select" class="s11-input" ${disabled(state.concreteUnlocked)}>
                                <option value="">Select concentration...</option>
                                <option value="0.006" ${state.limitChoice === '0.006' ? 'selected' : ''}>0.006 M</option>
                                <option value="${s11Linear.limit}" ${state.limitChoice === s11Linear.limit ? 'selected' : ''}>${s11Linear.limit} M (up to ${(50.0 * parseFloat(s11Linear.limit)).toFixed(2)} Absorbance)</option>
                                <option value="0.020" ${state.limitChoice === '0.020' ? 'selected' : ''}>0.020 M (includes all data)</option>
                            </select>
                            <button id="s11-check-limits" class="s11-btn" style="margin-top:8px; width:100%;" ${disabled(state.concreteUnlocked)}>Verify Linear Range</button>
                            <div class="s11-feedback" id="s11-limits-feedback">${state.limitFeedback}</div>
                        </div>

                        <div class="s11-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s11-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s11-pill ${state.concreteMission.calibReady ? 'good' : 'locked'}">Set Concentration to 1.20 M</span>
                                <span class="s11-pill ${state.concreteMission.limitsReady ? 'good' : 'locked'}">Identify Limits of Linearity</span>
                            </div>
                            <div class="s11-grid" style="gap:4px;">
                                <button id="s11-hint-concrete" class="s11-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint?</button>
                                <button id="s11-continue-pictorial" class="s11-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial</button>
                            </div>
                        </div>

                        <div class="s11-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Explain Beer's Law (A = e * b * c), how it represents a linear function, and why concentration increases light absorbance." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Activation Energy from the Arrhenius Plot</h2>
                        <p><strong>L11.4 Linearizing Arrhenius:</strong> An Arrhenius plot graphs $\ln(k)$ vs. $1/T$. The slope represents $-E_a / R$ (where $R = 8.3\text{ J/(mol·K)}$).
                        Select both data points on the plot to view coordinates. Determine the slope, and calculate the Activation Energy $E_a$ in kJ/mol.
                        (Formula: $E_a = -\text{Slope} \cdot R$, then divide by 1000 to convert to kJ/mol).</p>
                        
                        <div class="s11-svg-container">
                            <svg class="s11-plot-svg" viewBox="0 0 200 200">
                                <!-- Grid lines -->
                                <line class="s11-grid-line" x1="0" y1="50" x2="200" y2="50" />
                                <line class="s11-grid-line" x1="0" y1="100" x2="200" y2="100" />
                                <line class="s11-grid-line" x1="0" y1="150" x2="200" y2="150" />
                                <line class="s11-grid-line" x1="50" y1="0" x2="50" y2="200" />
                                <line class="s11-grid-line" x1="100" y1="0" x2="100" y2="200" />
                                <line class="s11-grid-line" x1="150" y1="0" x2="150" y2="200" />
                                
                                <!-- Axes -->
                                <line class="s11-axis" x1="30" y1="10" x2="30" y2="180" />
                                <line class="s11-axis" x1="20" y1="170" x2="190" y2="170" />
                                
                                <!-- Linear fit line -->
                                <line class="s11-data-line" x1="40" y1="54" x2="170" y2="166" />
                                
                                <!-- Point A -->
                                <circle class="s11-dot" id="s11-dot-a" cx="${ax}" cy="${ay}" r="6" fill="${state.pointASelected ? '#e11d48' : '#2563eb'}" />
                                <text x="${ax - 10}" y="${ay - 12}" font-size="8px" fill="#f8fafc">Point A</text>
                                
                                <!-- Point B -->
                                <circle class="s11-dot" id="s11-dot-b" cx="${bx}" cy="${by}" r="6" fill="${state.pointBSelected ? '#e11d48' : '#2563eb'}" />
                                <text x="${bx - 10}" y="${by - 12}" font-size="8px" fill="#f8fafc">Point B</text>
                                
                                <!-- Labels -->
                                <text x="18" y="25" font-size="8px" fill="#94a3b8" transform="rotate(-90 18 25)">y: ln(k)</text>
                                <text x="150" y="185" font-size="8px" fill="#94a3b8">x: 1/T (K^-1)</text>
                            </svg>
                        </div>
                        
                        <div class="s11-pane" style="margin-bottom:0.75rem;">
                            <div style="font-size:0.85rem; line-height:1.5;">
                                <div><strong>Selected coordinates:</strong></div>
                                <div>Point A (1/T = ${s11Arrhenius.x1.toFixed(4)}, ln(k) = ${s11Arrhenius.y1.toFixed(1)}): <strong>${state.pointASelected ? 'Selected' : 'Click dot on graph'}</strong></div>
                                <div>Point B (1/T = ${s11Arrhenius.x2.toFixed(4)}, ln(k) = ${s11Arrhenius.y2.toFixed(1)}): <strong>${state.pointBSelected ? 'Selected' : 'Click dot on graph'}</strong></div>
                                ${state.pointASelected && state.pointBSelected ? 
                                  `<div style="margin-top:0.4rem; color:#60a5fa;">Slope calculation: m = (${s11Arrhenius.y2.toFixed(1)} - (${s11Arrhenius.y1.toFixed(1)})) / (${s11Arrhenius.x2.toFixed(4)} - ${s11Arrhenius.x1.toFixed(4)}) = ${s11Arrhenius.slope} K</div>` : ''}
                            </div>
                        </div>
                        
                        <div class="s11-pane">
                            <p>Calculate Ea in **kJ/mol** (use R = 8.3 J/(mol K)):</p>
                            <div class="s11-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" step="any" id="s11-ea-input" class="s11-input" placeholder="e.g. 33.2" value="${state.eaAnswer}" ${disabled(state.pictorialUnlocked)}>
                                <button id="s11-check-ea" class="s11-btn" ${disabled(state.pictorialUnlocked)}>Verify Ea</button>
                            </div>
                        </div>
                        
                        <div class="s11-feedback" id="s11-pictorial-feedback" style="margin-top:0.5rem;">${state.pictorialFeedback}</div>

                        <div class="s11-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Show me how to compute the activation energy from an Arrhenius plot slope, including step-by-step units conversion from J to kJ." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Linearization matching Board</h2>
                        <p><strong>L11.3 &amp; L11.4 Chemical Law Linearization:</strong> For each chemical equation, select the variable or expression that must be plotted on the **Y-axis** against the indicated X-axis to yield a straight line.</p>
                        
                        <div class="s11-pane">
                            <div class="s11-grid" style="grid-template-columns: 1.2fr 1fr; gap:0.6rem; align-items:center;">
                                <span>First-Order Kinetics (vs. t)</span>
                                <select id="s11-match-q1" class="s11-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select Y-axis...</option>
                                    <option value="lnA" ${state.abstractAnswers.q1 === 'lnA' ? 'selected' : ''}>ln[A]</option>
                                    <option value="invA" ${state.abstractAnswers.q1 === 'invA' ? 'selected' : ''}>1/[A]</option>
                                    <option value="lnk" ${state.abstractAnswers.q1 === 'lnk' ? 'selected' : ''}>ln(k)</option>
                                    <option value="lnP" ${state.abstractAnswers.q1 === 'lnP' ? 'selected' : ''}>ln(P)</option>
                                </select>
                                
                                <span>Second-Order Kinetics (vs. t)</span>
                                <select id="s11-match-q2" class="s11-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select Y-axis...</option>
                                    <option value="lnA" ${state.abstractAnswers.q2 === 'lnA' ? 'selected' : ''}>ln[A]</option>
                                    <option value="invA" ${state.abstractAnswers.q2 === 'invA' ? 'selected' : ''}>1/[A]</option>
                                    <option value="lnk" ${state.abstractAnswers.q2 === 'lnk' ? 'selected' : ''}>ln(k)</option>
                                    <option value="lnP" ${state.abstractAnswers.q2 === 'lnP' ? 'selected' : ''}>ln(P)</option>
                                </select>
                                
                                <span>Arrhenius Equation (vs. 1/T)</span>
                                <select id="s11-match-q3" class="s11-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select Y-axis...</option>
                                    <option value="lnA" ${state.abstractAnswers.q3 === 'lnA' ? 'selected' : ''}>ln[A]</option>
                                    <option value="invA" ${state.abstractAnswers.q3 === 'invA' ? 'selected' : ''}>1/[A]</option>
                                    <option value="lnk" ${state.abstractAnswers.q3 === 'lnk' ? 'selected' : ''}>ln(k)</option>
                                    <option value="lnP" ${state.abstractAnswers.q3 === 'lnP' ? 'selected' : ''}>ln(P)</option>
                                </select>

                                <span>Clausius-Clapeyron (vs. 1/T)</span>
                                <select id="s11-match-q4" class="s11-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select Y-axis...</option>
                                    <option value="lnA" ${state.abstractAnswers.q4 === 'lnA' ? 'selected' : ''}>ln[A]</option>
                                    <option value="invA" ${state.abstractAnswers.q4 === 'invA' ? 'selected' : ''}>1/[A]</option>
                                    <option value="lnk" ${state.abstractAnswers.q4 === 'lnk' ? 'selected' : ''}>ln(k)</option>
                                    <option value="lnP" ${state.abstractAnswers.q4 === 'lnP' ? 'selected' : ''}>ln(P)</option>
                                </select>
                            </div>
                            <button id="s11-check-abstract" class="s11-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.abstractUnlocked)}>Check Matches</button>
                        </div>
                        <div class="s11-feedback" id="s11-abstract-feedback">${state.abstractFeedback}</div>

                        <div class="s11-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Why do we plot different Y-axis values (like 1/[A] vs ln[A]) for different reaction orders, and how does this help us identify reaction kinetics?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s11-card s11-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Kinetics Rate Constant &amp; Half-Life</h2>
                        <p><strong>L11.6 First-Order kinetics:</strong> The rate of a first-order chemical reaction depends on the concentration of a single reactant. The relationship between rate constant $k$ and half-life $t_{1/2}$ is:
                        <span style="font-family:monospace; font-weight:bold;">t_1/2 = ln(2) / k ≈ 0.693 / k</span>.
                        If a first-order reaction has a rate constant $k = 0.0347\text{ min}^{-1}$, calculate its half-life in **minutes**.</p>
                        
                        <div class="s11-pane">
                            <p>Calculate half-life t_1/2 (min):</p>
                            <div class="s11-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" step="any" id="s11-applied-input" class="s11-input" placeholder="e.g. 20" value="${state.appliedAnswer}" ${disabled(state.appliedUnlocked)}>
                                <button id="s11-check-applied" class="s11-btn" ${disabled(state.appliedUnlocked)}>Verify Half-Life</button>
                            </div>
                        </div>
                        <div class="s11-feedback" id="s11-applied-feedback">${state.appliedFeedback}</div>

                        <div class="s11-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s11-btn ghost" title="Reinforcement" data-prompt="Derive the first-order half-life formula t_1/2 = ln(2) / k from the integrated rate law ln[A]_t = -kt + ln[A]_0." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
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
                    's11-concentration-slider': {
                        id: 's11-beers-law',
                        level: 'concrete',
                        keys: 'concentrationVal,concreteCorrect',
                        prompt: 'Help me understand Beer\'s Law and why adjusting concentration changes absorbance.'
                    },
                    's11-concentration-input': {
                        id: 's11-beers-law',
                        level: 'concrete',
                        keys: 'concentrationVal,concreteCorrect',
                        prompt: 'Help me understand Beer\'s Law and why adjusting concentration changes absorbance.'
                    },
                    's11-check-limits': {
                        id: 's11-linear',
                        level: 'concrete',
                        keys: 'limitChoice',
                        prompt: 'Help me identify the limits of linearity for Beer\'s Law calibration curves.'
                    },
                    's11-check-ea': {
                        id: 's11-arrhenius',
                        level: 'pictorial',
                        keys: 'pointASelected,pointBSelected,eaAnswer',
                        prompt: `Help me calculate the Arrhenius slope and activation energy from the points (${s11Arrhenius.x1.toFixed(4)}, ${s11Arrhenius.y1.toFixed(1)}) and (${s11Arrhenius.x2.toFixed(4)}, ${s11Arrhenius.y2.toFixed(1)}).`
                    },
                    's11-check-abstract': {
                        id: 's11-matching',
                        level: 'abstract',
                        keys: 'abstractAnswers.q1,abstractAnswers.q2,abstractAnswers.q3,abstractAnswers.q4',
                        prompt: 'Help me match the kinetics and thermodynamics laws to what should be plotted on the Y-axis.'
                    },
                    's11-check-applied': {
                        id: 's11-halflife',
                        level: 'applied',
                        keys: 'appliedAnswer',
                        prompt: 'Help me calculate the half-life from the rate constant k = 0.0347 min^-1.'
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

            const syncConcreteMission = () => {
                if (state.fastTrack) return;
                if (state.concreteMission.calibReady && state.concreteMission.limitsReady && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.concreteFeedback = 'Concrete mission complete. Beer\'s law calibration and linearity limits are both correct. Pictorial unlocked. Continue below.';
                }
            };

            // Concrete Concentration Slider & Input
            const updateConcentrationState = (val) => {
                state.concentrationVal = val;
                if (Math.abs(val - 1.20) < 0.01) {
                    state.concreteMission.calibReady = true;
                    if (!state.concreteCompleted) {
                        state.concreteFeedback = 'Concentration is 1.20 M, giving Absorbance A = 0.60. Now identify the limits of linearity below.';
                    }
                } else {
                    state.concreteMission.calibReady = false;
                    if (!state.concreteCompleted) {
                        state.concreteFeedback = `Concentration is ${val.toFixed(2)} M (Absorbance is ${(0.50 * val).toFixed(2)}). Set it to 1.20 M to achieve Absorbance = 0.60.`;
                    }
                }
                syncConcreteMission();
            };

            const slider = host.querySelector('#s11-concentration-slider');
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    updateConcentrationState(val);
                    persist('Concentration slider shifted');
                    this.mount({ host, state, onStateChange });
                });
            }

            const concInput = host.querySelector('#s11-concentration-input');
            if (concInput) {
                concInput.addEventListener('change', (e) => {
                    let val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        val = Math.max(0.0, Math.min(1.5, val));
                        updateConcentrationState(val);
                        persist('Concentration input changed');
                        this.mount({ host, state, onStateChange });
                    }
                });
            }

            host.querySelector('#s11-check-limits')?.addEventListener('click', () => {
                const choice = host.querySelector('#s11-limit-select').value;
                state.limitChoice = choice;
                if (choice === s11Linear.limit) {
                    state.limitCorrect = true;
                    state.concreteMission.limitsReady = true;
                    state.limitFeedback = `Correct! Above ${s11Linear.limit} M, the absorbance curve curves down (non-linear). The residual plot shows systematic non-random patterns if you include high concentrations!`;
                } else if (choice === '0.020') {
                    state.limitCorrect = false;
                    state.concreteMission.limitsReady = false;
                    state.limitFeedback = 'Incorrect. Notice that the fit line misses the points systematically and the residual plot exhibits a curved, non-random U-shape. This means the model is invalid across the whole range.';
                } else {
                    state.limitCorrect = false;
                    state.concreteMission.limitsReady = false;
                    state.limitFeedback = `Not yet. The model is linear up to ${s11Linear.limit} M, after which it begins to curve. Try again!`;
                }
                syncConcreteMission();
                persist('Beer limits checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s11-hint-concrete')?.addEventListener('click', () => {
                if (!state.concreteMission.calibReady) {
                    state.concreteFeedback = 'Hint: Slide or enter the concentration to exactly 1.20 M. Since A = 0.50 * C, 0.50 * 1.20 = 0.60.';
                } else {
                    state.concreteFeedback = 'Hint: Look at the residuals. The random pattern is only obtained when fitting up to 0.010 M.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s11-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.concreteFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Finish the concrete calibration and linearity checks first.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial Dots selection
            host.querySelector('#s11-dot-a')?.addEventListener('click', () => {
                state.pointASelected = !state.pointASelected;
                if (state.pointASelected && state.pointBSelected) {
                    state.pictorialFeedback = 'Both points selected! Calculate slope: m = (-4.0 - -2.0) / (0.0035 - 0.0030) = -4000 K. Now calculate Ea = -Slope * R (Ea = 4000 * 8.3 J/molK = 33200 J/mol = 33.2 kJ/mol). Enter 33.2 below.';
                } else {
                    state.pictorialFeedback = 'Point A selected. Click Point B on the plot.';
                }
                persist('Point A toggled');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s11-dot-b')?.addEventListener('click', () => {
                state.pointBSelected = !state.pointBSelected;
                if (state.pointASelected && state.pointBSelected) {
                    state.pictorialFeedback = 'Both points selected! Calculate slope: m = (-4.0 - -2.0) / (0.0035 - 0.0030) = -4000 K. Now calculate Ea = -Slope * R (Ea = 4000 * 8.3 J/molK = 33200 J/mol = 33.2 kJ/mol). Enter 33.2 below.';
                } else {
                    state.pictorialFeedback = 'Point B selected. Click Point A on the plot.';
                }
                persist('Point B toggled');
                this.mount({ host, state, onStateChange });
            });

            // Verify Ea
            host.querySelector('#s11-check-ea').addEventListener('click', () => {
                const val = parseFloat(host.querySelector('#s11-ea-input').value);
                state.eaAnswer = host.querySelector('#s11-ea-input').value;

                const expectedEa = parseFloat(s11Arrhenius.answerKey);

                if (!state.pointASelected || !state.pointBSelected) {
                    state.pictorialFeedback = 'Please select both Point A and Point B on the graph first to view coordinates.';
                } else if (Math.abs(val - expectedEa) < 0.2) {
                    state.pictorialCorrect = true;
                    state.abstractUnlocked = true;
                    state.pictorialFeedback = `Correct! The activation energy Ea is ${s11Arrhenius.answerKey} kJ/mol. Abstract Level unlocked. Continue below.`;
                } else {
                    state.pictorialCorrect = false;
                    state.pictorialFeedback = `Incorrect Ea. Calculate slope first: (${s11Arrhenius.y2.toFixed(1)} - (${s11Arrhenius.y1.toFixed(1)}))/(${s11Arrhenius.x2.toFixed(4)} - ${s11Arrhenius.x1.toFixed(4)}) = ${s11Arrhenius.slope}. Then Ea = -(${s11Arrhenius.slope}) * 8.3 = ${(Math.abs(s11Arrhenius.slope) * 8.3).toLocaleString()} J/mol = ${s11Arrhenius.answerKey} kJ/mol.`;
                }
                persist('Ea checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract matches check
            host.querySelector('#s11-check-abstract').addEventListener('click', () => {
                const q1 = host.querySelector('#s11-match-q1').value;
                const q2 = host.querySelector('#s11-match-q2').value;
                const q3 = host.querySelector('#s11-match-q3').value;
                const q4 = host.querySelector('#s11-match-q4').value;

                state.abstractAnswers = { q1, q2, q3, q4 };

                if (q1 === 'lnA' && q2 === 'invA' && q3 === 'lnk' && q4 === 'lnP') {
                    state.abstractCorrect = true;
                    state.appliedUnlocked = true;
                    state.abstractFeedback = 'Excellent! You correctly matched all linearized equations. Applied Level unlocked. Continue below.';
                } else {
                    state.abstractCorrect = false;
                    state.abstractFeedback = 'Incorrect matches. Remember: First-order plots ln[A] vs t. Second-order plots 1/[A] vs t. Arrhenius plots ln(k) vs 1/T. Clausius-Clapeyron plots ln(P) vs 1/T.';
                }
                persist('Linearization matches checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied half life check
            host.querySelector('#s11-check-applied').addEventListener('click', () => {
                const val = parseFloat(host.querySelector('#s11-applied-input').value);
                state.appliedAnswer = host.querySelector('#s11-applied-input').value;

                if (Math.abs(val - 20) < 0.1) {
                    state.appliedCorrect = true;
                    state.appliedFeedback = 'Correct! The half-life is t_1/2 = ln(2) / 0.0347 min^-1 = 20.0 minutes.';
                } else {
                    state.appliedCorrect = false;
                    state.appliedFeedback = 'Incorrect. Use the formula: t_1/2 = ln(2) / k = 0.693 / 0.0347 = 20 minutes.';
                }
                persist('Applied kinetics checked');
                this.mount({ host, state, onStateChange });
            });

            // Sync inputs across re-renders
            const eaInput = host.querySelector('#s11-ea-input');
            if (eaInput) {
                eaInput.addEventListener('input', (e) => {
                    state.eaAnswer = e.target.value;
                });
            }
            const matchQ1 = host.querySelector('#s11-match-q1');
            if (matchQ1) {
                matchQ1.addEventListener('change', (e) => {
                    state.abstractAnswers.q1 = e.target.value;
                });
            }
            const matchQ2 = host.querySelector('#s11-match-q2');
            if (matchQ2) {
                matchQ2.addEventListener('change', (e) => {
                    state.abstractAnswers.q2 = e.target.value;
                });
            }
            const matchQ3 = host.querySelector('#s11-match-q3');
            if (matchQ3) {
                matchQ3.addEventListener('change', (e) => {
                    state.abstractAnswers.q3 = e.target.value;
                });
            }
            const matchQ4 = host.querySelector('#s11-match-q4');
            if (matchQ4) {
                matchQ4.addEventListener('change', (e) => {
                    state.abstractAnswers.q4 = e.target.value;
                });
            }
            const appliedInput = host.querySelector('#s11-applied-input');
            if (appliedInput) {
                appliedInput.addEventListener('input', (e) => {
                    state.appliedAnswer = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
