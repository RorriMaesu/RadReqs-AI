const createInitialStage8State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Concrete: Coordinate clicker
    clickX: null,
    clickY: null,
    concreteFeedback: 'Click on the coordinate plane to plot the point (3, 2).',
    concreteCorrect: false,
    concreteMission: { targetPoint: false },
    concreteCompleted: false,

    // Pictorial: Slope (Density) Calculator
    slopeVal: '',
    slopeFeedback: 'Calculate density (slope) between Point A (2 mL, 4 g) and Point B (5 mL, 10 g). Divide change in mass by change in volume.',
    slopeCorrect: false,

    // Abstract: Graph matching y = mx + b
    slopeM: 1,
    interceptB: 0,
    abstractFeedback: 'Adjust slope (m) and y-intercept (b) to match the line: y = 2x - 1.',
    abstractCorrect: false,

    // Applied: Interpolation vs. Extrapolation
    interpolVal: '',
    extrapolVal: '',
    appliedFeedback: 'A compound is heated. At 1 min it is 10°C, 2 min is 20°C, 3 min is 30°C. Estimate temp at 2.5 min (interpolation) and 6.0 min (extrapolation).',
    appliedCorrect: false,

    // Probability and counting
    probabilityAnswer: '',
    probabilityFeedback: 'L8.8 Probability: For 3 red and 2 blue chips, P(red then blue without replacement) = 3/10.',
    probabilityCorrect: false,

    // L8.9 & L8.10 Boundaries
    axisChoice: '',
    limitChoice: '',
    boundaryFeedback: 'L8.9 & L8.10: Identify the axes designation and the physical boundaries of the Charles\'s Law linear model.',
    showIdealLine: false
});

export function createStage8Graphing() {
    return {
        id: 'stage8',
        label: 'Graphing & Slopes',
        title: 'Stage 8: Graphing, Slopes & Inequalities',
        getInitialState() {
            return createInitialStage8State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage8State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            const s8Extrapolate = getParams('s8-extrapolate', { slope: 0.366, intercept: 100, answerKey: '-273.15' });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's8-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';
            const xPos = 170 + parseFloat(s8Extrapolate.answerKey) / 2.0;

            host.innerHTML = `
                <style>
                    .s8-wrap { display: grid; gap: 1.2rem; }
                    .s8-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s8-card h2, .s8-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s8-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s8-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s8-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s8-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s8-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s8-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s8-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s8-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s8-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s8-btn:hover { background: #fbbf24; }
                    .s8-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s8-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s8-btn.active, .s8-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s8-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s8-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s8-level.s8-locked { opacity: 0.52; position: relative; }
                    .s8-level.s8-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s8-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* SVG Plot Styles */
                    .s8-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; }
                    .s8-plot-svg { width: 220px; height: 220px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; background: rgba(15, 23, 42, 0.8); cursor: crosshair; }
                    .s8-grid-line { stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
                    .s8-axis { stroke: rgba(255, 255, 255, 0.3); stroke-width: 2; }
                    .s8-axis-text { font-size: 10px; fill: #cbd5e1; font-family: sans-serif; }
                    .s8-dot { fill: #f59e0b; stroke: #ffffff; stroke-width: 1.5; }
                    .s8-target-dot { fill: #f59e0b; fill-opacity: 0.4; stroke: #f59e0b; stroke-width: 1; stroke-dasharray: 2; }
                    .s8-slider-group { display: flex; flex-direction: column; gap: 0.3rem; margin: 0.4rem 0; }
                    .s8-slider-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; }
                    .s8-slider { width: 100%; cursor: pointer; accent-color: #f59e0b; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s8-wrap">
                    <article class="s8-card s8-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Test your graphing, slopes, rates of change, and science variables.</p>
                        <div class="s8-grid">
                            <div class="s8-pane">
                                <strong>1. Variables in Science</strong>
                                <p>To test how temperature affects a chemical reaction rate, which is the independent variable (x-axis)?</p>
                                <div class="s8-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q1 === 'temp' ? 'active' : ''}" data-diag="q1" data-value="temp">Temperature (Independent Variable)</button>
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q1 === 'rate' ? 'active' : ''}" data-diag="q1" data-value="rate">Reaction Rate (Dependent Variable)</button>
                                </div>
                            </div>
                            <div class="s8-pane">
                                <strong>2. Slope (Rate of Change)</strong>
                                <p>A liquid sample has a mass of 4g at 2 mL, and 10g at 5 mL. What is its density (slope of the mass-volume line)?</p>
                                <div class="s8-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q2 === '2' ? 'active' : ''}" data-diag="q2" data-value="2">2.0 g/mL (Slope = 6 / 3 = 2)</button>
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q2 === '1.5' ? 'active' : ''}" data-diag="q2" data-value="1.5">1.5 g/mL</button>
                                </div>
                            </div>
                            <div class="s8-pane">
                                <strong>3. Linear Inequalities</strong>
                                <p>For a concentration C, if 2C + 4 >= 10, what is the inequality solution bounds?</p>
                                <div class="s8-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q3 === 'ge' ? 'active' : ''}" data-diag="q3" data-value="ge">C >= 3</button>
                                    <button class="s8-btn ghost ${state.diagnosticAnswers.q3 === 'le' ? 'active' : ''}" data-diag="q3" data-value="le">C <= 3</button>
                                </div>
                            </div>
                        </div>
                        <div class="s8-grid" style="margin-top:0.75rem;">
                            <button id="s8-check-diagnostic" class="s8-btn">Check Diagnostic</button>
                        </div>
                        <div id="s8-diagnostic-feedback" class="s8-feedback">${state.diagnosticFeedback}</div>
                        <div class="s8-status">
                            <span class="s8-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s8-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s8-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s8-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s8-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s8-card s8-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Coordinate Grid Clicker</h2>
                        <p><strong>L8.1 Cartesian Coordinates:</strong> Click on the coordinate grid below to plot the point <strong>(3, 2)</strong>. (x = 3, y = 2)</p>
                        
                        <div class="s8-svg-container">
                            <svg class="s8-plot-svg" id="s8-concrete-svg" viewBox="0 0 200 200">
                                <!-- Grid Lines -->
                                <line class="s8-grid-line" x1="40" y1="0" x2="40" y2="200" />
                                <line class="s8-grid-line" x1="80" y1="0" x2="80" y2="200" />
                                <line class="s8-grid-line" x1="120" y1="0" x2="120" y2="200" />
                                <line class="s8-grid-line" x1="160" y1="0" x2="160" y2="200" />
                                
                                <line class="s8-grid-line" x1="0" y1="40" x2="200" y2="40" />
                                <line class="s8-grid-line" x1="0" y1="80" x2="200" y2="80" />
                                <line class="s8-grid-line" x1="0" y1="120" x2="200" y2="120" />
                                <line class="s8-grid-line" x1="0" y1="160" x2="200" y2="160" />
                                
                                <!-- Axes (origin at bottom-left 0, 200) -->
                                <line class="s8-axis" x1="0" y1="200" x2="200" y2="200" />
                                <line class="s8-axis" x1="0" y1="0" x2="0" y2="200" />
                                
                                <!-- Labels -->
                                <text class="s8-axis-text" x="5" y="195">0</text>
                                <text class="s8-axis-text" x="42" y="195">1</text>
                                <text class="s8-axis-text" x="82" y="195">2</text>
                                <text class="s8-axis-text" x="122" y="195">3</text>
                                <text class="s8-axis-text" x="162" y="195">4</text>
                                
                                <text class="s8-axis-text" x="5" y="155">1</text>
                                <text class="s8-axis-text" x="5" y="115">2</text>
                                <text class="s8-axis-text" x="5" y="75">3</text>
                                <text class="s8-axis-text" x="5" y="35">4</text>
                                
                                <!-- User plotted dot -->
                                ${state.clickX !== null ? `<circle class="s8-dot" cx="${state.clickX * 40}" cy="${200 - state.clickY * 40}" r="6" />` : ''}
                            </svg>
                        </div>
                        
                        <div class="s8-feedback" id="s8-concrete-feedback">
                            ${state.concreteFeedback} ${state.clickX !== null ? `Plotted: (${state.clickX}, ${state.clickY})` : ''}
                        </div>

                        <div class="s8-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s8-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s8-pill ${state.concreteMission.targetPoint ? 'good' : 'locked'}">Plot exactly (3, 2)</span>
                            </div>
                            <div class="s8-grid" style="gap:4px;">
                                <button id="s8-hint-concrete" class="s8-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s8-continue-pictorial" class="s8-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s8-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s8-btn ghost" title="Reinforcement" data-prompt="Explain coordinates (x, y) and how to plot points on a cartesian grid system." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s8-card s8-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Slope as a Rate of Change</h2>
                        <p><strong>[Required Unlock] L8.3 Slope (delta y / delta x):</strong> Look at the line passing through <strong>Point A (2, 4)</strong> and <strong>Point B (5, 10)</strong> on the mass-volume density graph below. Calculate the slope (Density in g/mL).</p>
                        
                        <div class="s8-svg-container">
                            <svg class="s8-plot-svg" viewBox="0 0 200 200" style="background:#f8fafc;">
                                <!-- Grid Lines -->
                                <line class="s8-grid-line" x1="40" y1="0" x2="40" y2="200" />
                                <line class="s8-grid-line" x1="80" y1="0" x2="80" y2="200" />
                                <line class="s8-grid-line" x1="120" y1="0" x2="120" y2="200" />
                                <line class="s8-grid-line" x1="160" y1="0" x2="160" y2="200" />
                                <line class="s8-grid-line" x1="0" y1="40" x2="200" y2="40" />
                                <line class="s8-grid-line" x1="0" y1="80" x2="200" y2="80" />
                                <line class="s8-grid-line" x1="0" y1="120" x2="200" y2="120" />
                                <line class="s8-grid-line" x1="0" y1="160" x2="200" y2="160" />
                                
                                <!-- Axes (0 to 10 mass on y, 0 to 5 vol on x) -->
                                <line class="s8-axis" x1="0" y1="200" x2="200" y2="200" />
                                <line class="s8-axis" x1="0" y1="0" x2="0" y2="200" />
                                
                                <!-- Line: y = 2x -->
                                <line x1="0" y1="200" x2="200" y2="0" stroke="#ef4444" stroke-width="2.5" />
                                
                                <!-- Point A (2, 4) -> x = 2*40=80, y = 200 - 4*20 = 120 -->
                                <circle cx="80" cy="120" r="5" fill="#16a34a" />
                                <text x="90" y="125" font-size="9px" font-weight="bold" fill="#16a34a">A (2 mL, 4 g)</text>
                                
                                <!-- Point B (5, 10) -> x = 5*40=200, y = 200 - 10*20 = 0 -->
                                <circle cx="200" cy="0" r="5" fill="#16a34a" />
                                <text x="135" y="15" font-size="9px" font-weight="bold" fill="#16a34a">B (5 mL, 10 g)</text>
                            </svg>
                        </div>
                        
                        <div class="s8-pane">
                            <p>Enter density slope (g/mL):</p>
                            <div class="s8-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" step="any" id="s8-slope-input" class="s8-input" placeholder="e.g. 2" ${disabled(state.pictorialUnlocked)} value="${state.slopeVal}">
                                <button id="s8-check-slope" class="s8-btn" ${disabled(state.pictorialUnlocked)}>Verify</button>
                            </div>
                        </div>
                        
                        <div class="s8-feedback" id="s8-slope-feedback">${state.slopeFeedback}</div>

                        <!-- L8.9 & L8.10 Boundaries Panel -->
                        <div class="s8-pane" style="margin-top:0.75rem;">
                            <strong>L8.9 &amp; L8.10 Ideal Gas extrapolation vs. Real Gas physical limits</strong>
                            <p>Real gases liquefy at cold temperatures, deviating from linear behavior. The ideal gas model can be extrapolated to zero volume to define Absolute Zero ($0\text{ K} = ${s8Extrapolate.answerKey}^\circ\text{C}$).</p>
                            
                            <div class="s8-svg-container">
                                <svg class="s8-plot-svg" style="width:240px; height:200px; background:#0f172a; border: 1px solid rgba(255,255,255,0.08);" viewBox="0 0 240 200">
                                    <!-- Grid lines -->
                                    <line class="s8-grid-line" x1="${xPos}" y1="0" x2="${xPos}" y2="200" style="stroke-dasharray:2; stroke:rgba(251,191,36,0.3);" />
                                    <text class="s8-axis-text" x="${xPos + 2}" y="195" style="fill:#fbbf24;">${parseFloat(s8Extrapolate.answerKey).toFixed(0)}°C</text>
                                    <line class="s8-grid-line" x1="120" y1="0" x2="120" y2="200" />
                                    <text class="s8-axis-text" x="110" y="195">-100°C</text>
                                    <line class="s8-grid-line" x1="170" y1="0" x2="170" y2="200" />
                                    <text class="s8-axis-text" x="165" y="195">0°C</text>
                                    
                                    <!-- Axes -->
                                    <line class="s8-axis" x1="10" y1="180" x2="230" y2="180" /> <!-- X axis -->
                                    <line class="s8-axis" x1="170" y1="10" x2="170" y2="190" /> <!-- Y axis -->
                                    
                                    <!-- Real Gas Curve (Red) -->
                                    <path d="M 220 32 L 170 72 L 120 112 Q 95 132 80 160 Q 60 176 20 176" fill="none" stroke="#ef4444" stroke-width="2.5" />
                                    <text class="s8-axis-text" x="75" y="150" style="fill:#ef4444; font-size:8px;">Real Gas</text>

                                    <!-- Ideal Gas Extrapolation (Yellow dashed) -->
                                    ${state.showIdealLine ? `
                                    <line x1="220" y1="32" x2="${xPos}" y2="180" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3" />
                                    <circle cx="${xPos}" cy="180" r="4" fill="#fbbf24" />
                                    <text class="s8-axis-text" x="${xPos + 6}" y="170" style="fill:#fbbf24; font-size:8px;">Ideal Gas Extrapolation</text>
                                    ` : ''}
                                </svg>
                            </div>
                            
                            <div style="margin-bottom:8px; display:flex; justify-content:center;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer;">
                                    <input type="checkbox" id="s8-toggle-ideal" ${state.showIdealLine ? 'checked' : ''} />
                                    Show Ideal Gas Extrapolation Line
                                </label>
                            </div>

                            <div class="s8-grid" style="grid-template-columns: 1fr 1fr; gap:8px;">
                                <div>
                                    <label class="s8-label">1. Temperature axis (independent variable):</label>
                                    <select id="s8-axis-select" class="s8-input" ${disabled(state.pictorialUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="x" ${state.axisChoice === 'x' ? 'selected' : ''}>X-Axis (Horizontal)</option>
                                        <option value="y" ${state.axisChoice === 'y' ? 'selected' : ''}>Y-Axis (Vertical)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="s8-label">2. Projected limit of zero volume (Absolute Zero):</label>
                                    <select id="s8-limit-select" class="s8-input" ${disabled(state.pictorialUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="zero" ${state.limitChoice === 'zero' ? 'selected' : ''}>${s8Extrapolate.answerKey}°C (0 K)</option>
                                        <option value="liquefy" ${state.limitChoice === 'liquefy' ? 'selected' : ''}>-150°C (Liquefaction)</option>
                                    </select>
                                </div>
                            </div>
                            <button id="s8-check-boundaries" class="s8-btn" style="margin-top:8px; width:100%;" ${disabled(state.pictorialUnlocked)}>Verify Answers</button>
                            <div class="s8-feedback" id="s8-boundaries-feedback">${state.boundaryFeedback}</div>
                        </div>

                        <div class="s8-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s8-btn ghost" title="Reinforcement" data-prompt="Walk me through calculating slope (rate of change) from two points on a graph: Point A (2, 4) and Point B (5, 10)." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s8-card s8-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Adjust Line Equation y = mx + b</h2>
                        <p><strong>[Required Unlock] L8.4 Linear Graphing:</strong> Adjust the sliders to set m (slope) and b (y-intercept) so the blue line matches the dashed yellow target line (y = 2x - 1).</p>
                        
                        <div class="s8-svg-container">
                            <!-- Graph going from x = -3 to 3, y = -3 to 3 -->
                            <!-- Center at (100, 100). Each unit is 25 pixels. -->
                            <svg class="s8-plot-svg" viewBox="0 0 200 200">
                                <!-- Grid Lines -->
                                <line class="s8-grid-line" x1="25" y1="0" x2="25" y2="200" />
                                <line class="s8-grid-line" x1="50" y1="0" x2="50" y2="200" />
                                <line class="s8-grid-line" x1="75" y1="0" x2="75" y2="200" />
                                <line class="s8-grid-line" x1="125" y1="0" x2="125" y2="200" />
                                <line class="s8-grid-line" x1="150" y1="0" x2="150" y2="200" />
                                <line class="s8-grid-line" x1="175" y1="0" x2="175" y2="200" />
                                
                                <line class="s8-grid-line" x1="0" y1="25" x2="200" y2="25" />
                                <line class="s8-grid-line" x1="0" y1="50" x2="200" y2="50" />
                                <line class="s8-grid-line" x1="0" y1="75" x2="200" y2="75" />
                                <line class="s8-grid-line" x1="0" y1="125" x2="200" y2="125" />
                                <line class="s8-grid-line" x1="0" y1="150" x2="200" y2="150" />
                                <line class="s8-grid-line" x1="0" y1="175" x2="200" y2="175" />
                                
                                <!-- Central Axes -->
                                <line class="s8-axis" x1="100" y1="0" x2="100" y2="200" />
                                <line class="s8-axis" x1="0" y1="100" x2="200" y2="100" />
                                
                                <!-- Target line: y = 2x - 1. In SVG pixels: 
                                     x = -2 => y = -5 (off-screen)
                                     x = -1 => y = -3 => px = 100 - 25 = 75, py = 100 + 75 = 175
                                     x = 0  => y = -1 => px = 100, py = 100 + 25 = 125
                                     x = 1  => y = 1  => px = 125, py = 75
                                     x = 2  => y = 3  => px = 150, py = 25
                                -->
                                <line x1="50" y1="225" x2="150" y2="25" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4" />
                                
                                <!-- User line: y = mx + b. 
                                     For x = -4 => px = 0, y = -4m + b => py = 100 - (-4m + b)*25
                                     For x = 4 => px = 200, y = 4m + b => py = 100 - (4m + b)*25
                                -->
                                <line x1="0" y1="${100 - (-4 * state.slopeM + state.interceptB) * 25}" 
                                      x2="200" y2="${100 - (4 * state.slopeM + state.interceptB) * 25}" 
                                      stroke="#2563eb" stroke-width="2.5" />
                            </svg>
                        </div>
                        
                        <div class="s8-pane">
                            <div class="s8-slider-group">
                                <div class="s8-slider-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                                    <span style="flex-shrink: 0; min-width: 5.5rem;">Slope (m):</span>
                                    <input type="range" id="s8-slider-m" class="s8-slider" min="-3" max="3" step="0.5" value="${state.slopeM}" ${disabled(state.abstractUnlocked)} style="flex-grow: 1;">
                                    <input type="number" id="s8-input-m" class="s8-input" min="-3" max="3" step="0.5" value="${state.slopeM}" ${disabled(state.abstractUnlocked)} style="width: 70px; margin-left: 0.5rem;">
                                </div>
                                <div class="s8-slider-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top:0.4rem;">
                                    <span style="flex-shrink: 0; min-width: 5.5rem;">y-Intercept (b):</span>
                                    <input type="range" id="s8-slider-b" class="s8-slider" min="-3" max="3" step="0.5" value="${state.interceptB}" ${disabled(state.abstractUnlocked)} style="flex-grow: 1;">
                                    <input type="number" id="s8-input-b" class="s8-input" min="-3" max="3" step="0.5" value="${state.interceptB}" ${disabled(state.abstractUnlocked)} style="width: 70px; margin-left: 0.5rem;">
                                </div>
                            </div>
                            <p style="text-align:center; font-family:monospace; font-weight:bold; font-size:1.1rem; color:#2563eb; margin-top:0.5rem;">
                                y = ${state.slopeM}x ${state.interceptB >= 0 ? '+ ' + state.interceptB : '- ' + Math.abs(state.interceptB)}
                            </p>
                        </div>
                        
                        <div class="s8-feedback" id="s8-abstract-feedback">${state.abstractFeedback}</div>

                        <div class="s8-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s8-btn ghost" title="Reinforcement" data-prompt="Explain the equation y = mx + b. What does m represent? What does b represent?" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s8-card s8-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Data Boundary Analysis (Lab Heating Curve)</h2>
                        <p><strong>[Required Unlock] L8.7 Interpolation vs. Extrapolation:</strong> You heat a substance and measure its temperature: 1 min is 10°C, 2 min is 20°C, 3 min is 30°C. 
                        Estimate the temperature at 2.5 minutes (interpolation, inside bounds) and 6.0 minutes (extrapolation, outside bounds assuming linear heating).</p>
                        
                        <div class="s8-pane">
                            <div class="s8-grid">
                                <div>
                                    <label style="font-size:0.82rem; font-weight:700;">Temp at 2.5 min (°C):</label>
                                    <input type="number" id="s8-app-interpol" class="s8-input" placeholder="e.g. 25" ${disabled(state.appliedUnlocked)} value="${state.interpolVal}">
                                </div>
                                <div>
                                    <label style="font-size:0.82rem; font-weight:700;">Temp at 6.0 min (°C):</label>
                                    <input type="number" id="s8-app-extrapol" class="s8-input" placeholder="e.g. 60" ${disabled(state.appliedUnlocked)} value="${state.extrapolVal}">
                                </div>
                            </div>
                            <button id="s8-check-applied" class="s8-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.appliedUnlocked)}>Verify Values</button>
                        </div>
                        
                        <div class="s8-feedback" id="s8-applied-feedback">${state.appliedFeedback}</div>

                        <div class="s8-pane" style="margin-top:0.75rem;">
                            <p><strong>[Reinforcement] L8.8 Basic Probability & Counting:</strong> A bag has 3 red and 2 blue chips. Two draws are made <strong>without replacement</strong>. Enter <code>P(red then blue)</code> as a fraction or decimal.</p>
                            <div class="s8-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s8-prob-input" class="s8-input" placeholder="e.g. 3/10 or 0.3" value="${state.probabilityAnswer}" ${disabled(state.appliedUnlocked)} />
                                <button id="s8-check-prob" class="s8-btn" ${disabled(state.appliedUnlocked)}>Check Probability</button>
                            </div>
                            <div class="s8-feedback" id="s8-prob-feedback">${state.probabilityFeedback}</div>
                        </div>

                        <div class="s8-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s8-btn ghost" title="Reinforcement" data-prompt="What is the difference between interpolation and extrapolation in scientific data plotting? Why is extrapolation risky?" ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's8-check-diagnostic': {
                        id: 's8-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 8 diagnostic answers on variables, slope, and inequality direction.'
                    },
                    's8-concrete-svg': {
                        id: 's8-coordinate-plot',
                        level: 'concrete',
                        keys: 'clickX,clickY,concreteMission.targetPoint',
                        prompt: 'Help me plot the target coordinate correctly on the Cartesian grid.'
                    },
                    's8-check-slope': {
                        id: 's8-slope',
                        level: 'pictorial',
                        keys: 'slopeVal',
                        prompt: 'Help me compute slope from points A(2,4) and B(5,10).'
                    },
                    's8-slider-m': {
                        id: 's8-line-match',
                        level: 'abstract',
                        keys: 'slopeM,interceptB',
                        prompt: 'Help me tune m and b to match the target line y = 2x - 1.'
                    },
                    's8-slider-b': {
                        id: 's8-line-match',
                        level: 'abstract',
                        keys: 'slopeM,interceptB',
                        prompt: 'Help me tune m and b to match the target line y = 2x - 1.'
                    },
                    's8-check-boundaries': {
                        id: 's8-extrapolate',
                        level: 'pictorial',
                        keys: 'axisChoice,limitChoice',
                        prompt: 'Help me identify the axis and absolute zero extrapolation limit under Charles\'s Law.'
                    },
                    's8-check-applied': {
                        id: 's8-interpolation-extrapolation',
                        level: 'applied',
                        keys: 'interpolVal,extrapolVal',
                        prompt: 'Help me solve interpolation at 2.5 min and extrapolation at 6.0 min from the linear trend.'
                    },
                    's8-check-prob': {
                        id: 's8-probability',
                        level: 'applied',
                        keys: 'probabilityAnswer',
                        prompt: 'Help me compute P(red then blue) without replacement for 3 red and 2 blue chips.'
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

            const syncConcreteMission = () => {
                if (state.fastTrack) return;
                if (state.concreteMission.targetPoint && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.concreteFeedback = 'Concrete mission complete. Target coordinate reached. Pictorial unlocked. Continue below.';
                }
            };

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic button choices
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
            host.querySelector('#s8-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'temp' &&
                                state.diagnosticAnswers.q2 === '2' &&
                                state.diagnosticAnswers.q3 === 'ge';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered variables, density rates of change, and inequalities. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active. Solve the Concrete Level to progress.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Plot Clicker
            const svgEl = host.querySelector('#s8-concrete-svg');
            if (svgEl) {
                svgEl.addEventListener('click', (e) => {
                    if (state.fastTrack || state.concreteUnlocked) {
                        const rect = svgEl.getBoundingClientRect();
                        const x = Math.round((e.clientX - rect.left) / (rect.width / 5));
                        const y = Math.round(5 - (e.clientY - rect.top) / (rect.height / 5));
                        
                        // Limit within grid ranges 0 to 5
                        const clampedX = Math.max(0, Math.min(5, x));
                        const clampedY = Math.max(0, Math.min(5, y));
                        
                        state.clickX = clampedX;
                        state.clickY = clampedY;
                        
                        if (clampedX === 3 && clampedY === 2) {
                            state.concreteCorrect = true;
                            state.concreteMission.targetPoint = true;
                            state.concreteFeedback = 'Excellent! You plotted (3, 2) perfectly.';
                        } else {
                            state.concreteCorrect = false;
                            if (!state.concreteCompleted) {
                                state.concreteMission.targetPoint = false;
                            }
                            state.concreteFeedback = `Plotted (${clampedX}, ${clampedY}). Close, but not (3, 2). Try again!`;
                        }
                        syncConcreteMission();
                        persist('Coordinate plotted');
                        this.mount({ host, state, onStateChange });
                    }
                });
            }

            host.querySelector('#s8-hint-concrete')?.addEventListener('click', () => {
                if (state.concreteMission.targetPoint) {
                    state.concreteFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Hint: Move 3 units right on x, then 2 units up on y. Click the intersection at (3, 2).';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s8-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.concreteFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Complete the Concrete mission first by plotting (3, 2).';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial Check Slope
            host.querySelector('#s8-check-slope').addEventListener('click', () => {
                const inputVal = parseFloat(host.querySelector('#s8-slope-input').value);
                state.slopeVal = host.querySelector('#s8-slope-input').value;
                if (inputVal === 2) {
                    state.slopeCorrect = true;
                    state.slopeFeedback = 'Correct! The rate of change is 2 g/mL. Density slope isolated. Abstract unlocked. Continue below.';
                    state.abstractUnlocked = true;
                } else {
                    state.slopeCorrect = false;
                    state.slopeFeedback = 'Incorrect. Calculate: change in mass / change in volume = (10 - 4) / (5 - 2) = 6 / 3 = 2.';
                }
                persist('Slope verified');
                this.mount({ host, state, onStateChange });
            });

            // L8.9 & L8.10 boundaries click & toggle handlers
            host.querySelector('#s8-toggle-ideal')?.addEventListener('change', (e) => {
                state.showIdealLine = e.target.checked;
                persist('Ideal line toggled');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s8-check-boundaries')?.addEventListener('click', () => {
                const axis = host.querySelector('#s8-axis-select').value;
                const limit = host.querySelector('#s8-limit-select').value;
                state.axisChoice = axis;
                state.limitChoice = limit;

                if (axis === 'x' && limit === 'zero') {
                    state.boundaryFeedback = `Correct! The independent variable (Temperature) belongs on the x-axis, and the theoretical limit where gas volume extrapolates to zero is ${s8Extrapolate.answerKey}°C (Absolute Zero). Note that the real gas curve deviates due to liquefaction!`;
                } else if (axis !== 'x') {
                    state.boundaryFeedback = 'Incorrect. In scientific experiments, the variable controlled by the experimenter (Temperature) is the independent variable and belongs on the x-axis.';
                } else {
                    state.boundaryFeedback = `Incorrect. Although Temperature is on the x-axis, the ideal gas model extrapolates to zero volume at ${s8Extrapolate.answerKey}°C (Absolute Zero), not at liquefaction point.`;
                }
                persist('Boundaries verified');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Sliders
            const sliderM = host.querySelector('#s8-slider-m');
            const sliderB = host.querySelector('#s8-slider-b');
            
            const checkAbstractMatch = () => {
                if (state.slopeM === 2 && state.interceptB === -1) {
                    state.abstractCorrect = true;
                    state.abstractFeedback = 'Perfect match! y = 2x - 1. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true;
                } else {
                    state.abstractCorrect = false;
                    state.abstractFeedback = 'Adjust sliders: target line has slope m = 2 and y-intercept b = -1.';
                }
            };

            if (sliderM && sliderB) {
                sliderM.addEventListener('input', (e) => {
                    state.slopeM = parseFloat(e.target.value);
                    checkAbstractMatch();
                    persist('M slider shifted');
                    this.mount({ host, state, onStateChange });
                });
                
                sliderB.addEventListener('input', (e) => {
                    state.interceptB = parseFloat(e.target.value);
                    checkAbstractMatch();
                    persist('B slider shifted');
                    this.mount({ host, state, onStateChange });
                });
            }

            const inputM = host.querySelector('#s8-input-m');
            const inputB = host.querySelector('#s8-input-b');
            if (inputM && inputB) {
                inputM.addEventListener('change', (e) => {
                    let val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        state.slopeM = Math.max(-3, Math.min(3, val));
                        checkAbstractMatch();
                        persist('M input changed');
                        this.mount({ host, state, onStateChange });
                    }
                });
                inputB.addEventListener('change', (e) => {
                    let val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        state.interceptB = Math.max(-3, Math.min(3, val));
                        checkAbstractMatch();
                        persist('B input changed');
                        this.mount({ host, state, onStateChange });
                    }
                });
            }

            // Applied check
            host.querySelector('#s8-check-applied').addEventListener('click', () => {
                const interpol = parseFloat(host.querySelector('#s8-app-interpol').value);
                const extrapol = parseFloat(host.querySelector('#s8-app-extrapol').value);
                state.interpolVal = host.querySelector('#s8-app-interpol').value;
                state.extrapolVal = host.querySelector('#s8-app-extrapol').value;

                if (interpol === 25 && extrapol === 60) {
                    state.appliedCorrect = true;
                    state.appliedFeedback = 'Excellent work! 25°C is correct for interpolation, and 60°C is correct for linear extrapolation.';
                } else {
                    state.appliedCorrect = false;
                    state.appliedFeedback = 'Incorrect. Hint: The temperature increases at a rate of 10°C/min. 2.5 min = 2.5 × 10 = 25°C. 6.0 min = 6 × 10 = 60°C.';
                }
                persist('Applied boundary checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s8-check-prob').addEventListener('click', () => {
                const raw = host.querySelector('#s8-prob-input').value.trim();
                state.probabilityAnswer = raw;
                const normalized = raw.replace(/\s+/g, '').toLowerCase();
                const numeric = Number(raw);
                const isCorrect = normalized === '3/10' || numeric === 0.3;

                if (isCorrect) {
                    state.probabilityCorrect = true;
                    state.probabilityFeedback = 'Correct. P(red then blue) = (3/5) x (2/4) = 6/20 = 3/10 = 0.3.';
                } else {
                    state.probabilityCorrect = false;
                    state.probabilityFeedback = 'Not yet. Without replacement: first draw 3/5, second draw blue is 2/4. Multiply to get 3/10.';
                }

                persist('Probability checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const slopeInput = host.querySelector('#s8-slope-input');
            if (slopeInput) {
                slopeInput.addEventListener('input', (e) => {
                    state.slopeVal = e.target.value;
                });
            }
            const appInterpol = host.querySelector('#s8-app-interpol');
            if (appInterpol) {
                appInterpol.addEventListener('input', (e) => {
                    state.interpolVal = e.target.value;
                });
            }
            const appExtrapol = host.querySelector('#s8-app-extrapol');
            if (appExtrapol) {
                appExtrapol.addEventListener('input', (e) => {
                    state.extrapolVal = e.target.value;
                });
            }
            const probInput = host.querySelector('#s8-prob-input');
            if (probInput) {
                probInput.addEventListener('input', (e) => {
                    state.probabilityAnswer = e.target.value;
                });
            }
            const axisSelect = host.querySelector('#s8-axis-select');
            if (axisSelect) {
                axisSelect.addEventListener('change', (e) => {
                    state.axisChoice = e.target.value;
                });
            }
            const limitSelect = host.querySelector('#s8-limit-select');
            if (limitSelect) {
                limitSelect.addEventListener('change', (e) => {
                    state.limitChoice = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
