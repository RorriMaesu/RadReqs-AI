const createInitialStage12State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Concrete: Isotope Blending Mass Spec
    isotopeAbundanceVal: 50,
    concreteFeedback: 'Concrete mission: Adjust the slider to set Boron-11 abundance to 81% (average weight = 10.81 u) to unlock Pictorial.',
    concreteCorrect: false,
    concreteCompleted: false,

    // Pictorial: ICE Table Setup
    pictorialAnswers: { changeB: '', equilibriumB: '' },
    pictorialFeedback: 'L12.4 ICE Setup: For A <=> 2B with Initial [B] = 0, fill in the Change and Equilibrium values for species B.',
    pictorialCorrect: false,

    // Abstract: Small-x Approximation
    abstractAnswers: { q1: '', q2: '', q3: '' },
    abstractFeedback: 'Assess each system and determine if the small-x approximation (C - x ≈ C) is valid (i.e. C_0 / Ka >= 400).',
    abstractCorrect: false,

    // Applied: Weak Acid pH Calculator
    appliedAnswer: '',
    appliedFeedback: 'Solve for the pH of a 0.10 M weak acid HA with Ka = 1.0 x 10^-5 (pH = -log10[H3O+]).',
    appliedCorrect: false,

    // L12.8 & L12.9 Conjugate & Common Ion
    commonIonChoice: '',
    commonIonCorrect: false,
    commonIonFeedback: 'L12.8 Common Ion Effect: choose the correct denominator term for Ka when product ion is already present initially.',
    kbInput: '',
    kbFeedback: 'Calculate Kb using Kb = Kw / Ka (for Ka = 1.8e-5), and the resulting pH of a 0.10 M weak base salt solution.',
    kbCorrect: false,
    phSaltInput: '',
    phSaltCorrect: false
});

export function createStage12Equilibrium() {
    return {
        id: 'stage12',
        label: 'Equilibrium Algebra',
        title: 'Stage 12: Equilibrium Algebra, Power Ratios & Approximations',
        getInitialState() {
            return createInitialStage12State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage12State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            const s12Spec = getParams('s12-spec', { mass1: 10.0, mass2: 11.0, abundance1: 19, abundance2: 81, averageMass: 10.81 });
            const s12Salt = getParams('s12-salt', { ka: 1.8e-5, kb: 5.6e-10, concentration: 0.10, ph: 8.87 });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's12-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            // Concrete: Mass spec heights calculation
            const ab11 = parseInt(state.isotopeAbundanceVal);
            const ab10 = 100 - ab11;
            const avgWeight = s12Spec.mass1 + ((s12Spec.mass2 - s12Spec.mass1) * ab11 / 100);

            // Scale peak heights inside a 100px height range
            const peak10Height = ab10;
            const peak11Height = ab11;

            host.innerHTML = `
                <style>
                    .s12-wrap { display: grid; gap: 1.2rem; }
                    .s12-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s12-card h2, .s12-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s12-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s12-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s12-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s12-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s12-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s12-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s12-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s12-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s12-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s12-btn:hover { background: #fbbf24; }
                    .s12-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s12-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s12-btn.active, .s12-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s12-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s12-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s12-level.s12-locked { opacity: 0.52; position: relative; }
                    .s12-level.s12-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s12-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* SVG Custom structures */
                    .s12-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; }
                    .s12-mass-svg { width: 180px; height: 130px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; }
                    .s12-mass-axis { stroke: rgba(255, 255, 255, 0.3); stroke-width: 1.5; }
                    .s12-mass-peak { stroke: #38bdf8; stroke-width: 10; stroke-linecap: butt; }
                    
                    .s12-ice-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
                    .s12-ice-table th, .s12-ice-table td { border: 1px solid rgba(255,255,255,0.08); padding: 0.5rem; text-align: center; }
                    .s12-ice-table th { background: rgba(30, 41, 59, 0.6); font-size: 0.85rem; }
                    
                    .s12-slider { width: 100%; cursor: pointer; accent-color: #f59e0b; }
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s12-wrap">
                    <!-- ENTRY DIAGNOSTIC -->
                    <article class="s12-card s12-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your understanding of isotope weighted averages, equilibrium constants, and weak-acid ICE setups.</p>
                        <div class="s12-grid">
                            <div class="s12-pane">
                                <strong>1. Weighted Average Isotope</strong>
                                <p>An element has two isotopes: Mass 35.0 (75.0% abundance) and Mass 37.0 (25.0% abundance). What is its average atomic mass?</p>
                                <div class="s12-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q1 === 'a' ? 'active' : ''}" data-diag="q1" data-value="a">35.5 u (35.0*0.75 + 37.0*0.25)</button>
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q1 === 'wrong' ? 'active' : ''}" data-diag="q1" data-value="wrong">36.0 u (simple average)</button>
                                </div>
                            </div>
                            <div class="s12-pane">
                                <strong>2. Keq Expression</strong>
                                <p>What is the correct equilibrium constant expression Keq for the gas reaction: 2SO2 + O2 <=> 2SO3?</p>
                                <div class="s12-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q2 === 'a' ? 'active' : ''}" data-diag="q2" data-value="a">[SO3]² / ([SO2]² · [O2])</button>
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q2 === 'wrong' ? 'active' : ''}" data-diag="q2" data-value="wrong">([SO2]² · [O2]) / [SO3]²</button>
                                </div>
                            </div>
                            <div class="s12-pane">
                                <strong>3. Small-x Approximation</strong>
                                <p>Under what typical condition is the small-x approximation (C_0 - x ≈ C_0) chemically justified for a weak acid solve?</p>
                                <div class="s12-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q3 === 'a' ? 'active' : ''}" data-diag="q3" data-value="a">When Ka is very small relative to C_0 (C_0 / Ka >= 400)</button>
                                    <button class="s12-btn ghost ${state.diagnosticAnswers.q3 === 'wrong' ? 'active' : ''}" data-diag="q3" data-value="wrong">When pH is greater than 14</button>
                                </div>
                            </div>
                        </div>
                        <div class="s12-grid" style="margin-top:0.75rem;">
                            <button id="s12-check-diagnostic" class="s12-btn">Check Diagnostic</button>
                        </div>
                        <div id="s12-diagnostic-feedback" class="s12-feedback">${state.diagnosticFeedback}</div>
                        <div class="s12-status">
                            <span class="s12-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s12-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s12-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s12-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s12-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Mass Spec Isotope Weighted average</h2>
                        <p><strong>L12.1 Weighted Averages:</strong> The average atomic mass is a weighted average of an element's isotopes based on their abundance.
                        Boron has two stable isotopes: Boron-10 ($${s12Spec.mass1.toFixed(1)}\text{ u}$) and Boron-11 ($${s12Spec.mass2.toFixed(1)}\text{ u}$).
                        Adjust the slider below to set the Boron-11 abundance to **exactly ${s12Spec.abundance2}%** (which yields the actual average atomic weight of Boron: **${s12Spec.averageMass.toFixed(2)} u**).</p>
                        
                        <div class="s12-svg-container">
                            <svg class="s12-mass-svg" viewBox="0 0 180 130">
                                <!-- Axes -->
                                <line class="s12-mass-axis" x1="20" y1="10" x2="20" y2="110" />
                                <line class="s12-mass-axis" x1="15" y1="105" x2="170" y2="105" />
                                
                                <!-- Boron-10 Peak at x = 60 -->
                                <line class="s12-mass-peak" x1="60" y1="105" x2="60" y2="${105 - peak10Height}" stroke="#60a5fa" />
                                <text x="50" y="120" font-size="8px" fill="#cbd5e1" font-weight="bold">${s12Spec.mass1.toFixed(1)} u</text>
                                <text x="50" y="${100 - peak10Height}" font-size="8px" fill="#93c5fd">${ab10}%</text>

                                <!-- Boron-11 Peak at x = 120 -->
                                <line class="s12-mass-peak" x1="120" y1="105" x2="120" y2="${105 - peak11Height}" stroke="#f59e0b" />
                                <text x="110" y="120" font-size="8px" fill="#cbd5e1" font-weight="bold">${s12Spec.mass2.toFixed(1)} u</text>
                                <text x="110" y="${100 - peak11Height}" font-size="8px" fill="#fde68a">${ab11}%</text>
                                
                                <!-- Label for Y-axis -->
                                <text x="12" y="20" font-size="7px" fill="#94a3b8" transform="rotate(-90 12 20)">Abundance (%)</text>
                            </svg>
                        </div>
                        
                        <div class="s12-pane">
                            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.05rem; gap:0.5rem;">
                                <span style="color:#60a5fa;">Boron-10: <strong>${ab10}%</strong></span>
                                <span style="color:#f59e0b; display:flex; align-items:center; gap:0.4rem;">
                                    Boron-11:
                                    <input type="number" id="s12-isotope-input" class="s12-input" min="0" max="100" step="1" value="${state.isotopeAbundanceVal}" ${disabled(state.concreteUnlocked)} style="width: 70px;">
                                    %
                                </span>
                                <span style="color:#22c55e;">Average Mass: <strong>${avgWeight.toFixed(2)} u</strong></span>
                            </div>
                            <input type="range" id="s12-isotope-slider" class="s12-slider" min="0" max="100" step="1" value="${state.isotopeAbundanceVal}" ${disabled(state.concreteUnlocked)} style="width:100%; margin-top:0.4rem;">
                        </div>
                        
                        <div class="s12-feedback" id="s12-concrete-feedback">${state.concreteFeedback}</div>

                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s12-grid" style="gap:4px;">
                                <button id="s12-hint-concrete" class="s12-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint?</button>
                                <button id="s12-continue-pictorial" class="s12-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial</button>
                            </div>
                        </div>

                        <div class="s12-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain how weighted averages are calculated in chemistry, using isotopic abundances of Boron as an example." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Balancing the ICE Table</h2>
                        <p><strong>L12.4 ICE tables:</strong> We track chemical reaction shifts using ICE tables (Initial, Change, Equilibrium).
                        Consider the gas reaction: **$A \rightleftharpoons 2B$**. If the initial concentration of A is $1.0\text{ M}$ and B is $0.0\text{ M}$, fill in the missing change and equilibrium expressions for B in terms of shift variable $x$.</p>
                        
                        <div class="s12-pane">
                            <table class="s12-ice-table">
                                <thead>
                                    <tr>
                                        <th>ICE Stage</th>
                                        <th>Species A</th>
                                        <th>Species B</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Initial (I)</strong></td>
                                        <td>1.0 M</td>
                                        <td>0.0 M</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Change (C)</strong></td>
                                        <td>-x</td>
                                        <td>
                                            <select id="s12-ice-changeB" class="s12-input" ${disabled(state.pictorialUnlocked)}>
                                                <option value="">Select Change...</option>
                                                <option value="+x" ${state.pictorialAnswers.changeB === '+x' ? 'selected' : ''}>+x</option>
                                                <option value="+2x" ${state.pictorialAnswers.changeB === '+2x' ? 'selected' : ''}>+2x</option>
                                                <option value="-2x" ${state.pictorialAnswers.changeB === '-2x' ? 'selected' : ''}>-2x</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Equilibrium (E)</strong></td>
                                        <td>1.0 - x</td>
                                        <td>
                                            <select id="s12-ice-eqB" class="s12-input" ${disabled(state.pictorialUnlocked)}>
                                                <option value="">Select Equilibrium...</option>
                                                <option value="x" ${state.pictorialAnswers.equilibriumB === 'x' ? 'selected' : ''}>x</option>
                                                <option value="2x" ${state.pictorialAnswers.equilibriumB === '2x' ? 'selected' : ''}>2x</option>
                                                <option value="2x^2" ${state.pictorialAnswers.equilibriumB === '2x^2' ? 'selected' : ''}>2x²</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button id="s12-check-ice" class="s12-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.pictorialUnlocked)}>Check ICE Table</button>
                        </div>
                        <div class="s12-feedback" id="s12-pictorial-feedback">${state.pictorialFeedback}</div>

                        <div class="s12-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Walk me through how stoichiometric coefficients of a balanced chemical equation dictate the algebraic 'Change' row in an ICE table." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Small-x Approximation Validator</h2>
                        <p><strong>L12.5 Small-x Approximation:</strong> When solving weak acid equilibrium ($K_a = \frac{x^2}{C_0 - x}$), we can approximate $C_0 - x \approx C_0$ to avoid the quadratic formula, provided the initial concentration $C_0$ is at least **400 times** larger than the equilibrium constant $K_a$ (i.e. $C_0 / K_a \ge 400$).
                        Classify whether the approximation is valid for each scenario below.</p>
                        
                        <div class="s12-pane">
                            <div class="s12-grid" style="grid-template-columns: 1.2fr 1fr; gap:0.6rem; align-items:center;">
                                <span>Case 1: $Ka = 1.0 \times 10^{-5}$, $C_0 = 0.10\text{ M}$</span>
                                <select id="s12-approx-q1" class="s12-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select status...</option>
                                    <option value="valid" ${state.abstractAnswers.q1 === 'valid' ? 'selected' : ''}>Valid approximation</option>
                                    <option value="invalid" ${state.abstractAnswers.q1 === 'invalid' ? 'selected' : ''}>Invalid approximation</option>
                                </select>
                                
                                <span>Case 2: $Ka = 1.0 \times 10^{-2}$, $C_0 = 0.05\text{ M}$</span>
                                <select id="s12-approx-q2" class="s12-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select status...</option>
                                    <option value="valid" ${state.abstractAnswers.q2 === 'valid' ? 'selected' : ''}>Valid approximation</option>
                                    <option value="invalid" ${state.abstractAnswers.q2 === 'invalid' ? 'selected' : ''}>Invalid approximation</option>
                                </select>
                                
                                <span>Case 3: $Ka = 5.0 \times 10^{-10}$, $C_0 = 0.01\text{ M}$</span>
                                <select id="s12-approx-q3" class="s12-input" ${disabled(state.abstractUnlocked)}>
                                    <option value="">Select status...</option>
                                    <option value="valid" ${state.abstractAnswers.q3 === 'valid' ? 'selected' : ''}>Valid approximation</option>
                                    <option value="invalid" ${state.abstractAnswers.q3 === 'invalid' ? 'selected' : ''}>Invalid approximation</option>
                                </select>
                            </div>
                            <button id="s12-check-abstract" class="s12-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.abstractUnlocked)}>Check Validity</button>
                        </div>
                        <div class="s12-feedback" id="s12-abstract-feedback">${state.abstractFeedback}</div>

                        <div class="s12-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain the '5% rule' and the rule of thumb that C_0 / Ka >= 400 for justifying the small-x approximation in weak acid equilibrium solves." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Weak Acid & Base equilibrium pH solver</h2>
                        <p><strong>L12.7 pH &amp; Weak Acids:</strong> For a weak acid solution $HA$ with initial concentration $C_0 = 0.10\text{ M}$ and $K_a = 1.0 \times 10^{-5}$,
                        the hydronium concentration at equilibrium is given by:
                        <span style="font-family:monospace; font-weight:bold;">Ka = x² / (C_0 - x)</span>, where $x = [\text{H}_3\text{O}^+]$.
                        Using the small-x approximation:
                        <span style="font-family:monospace; font-weight:bold;">x ≈ sqrt(Ka · C_0)</span>.
                        Calculate $x$ first, then find the pH of this solution ($\text{pH} = -\log_{10}(x)$). Enter the integer pH value below.</p>
                        
                        <div class="s12-pane">
                            <p>Calculate pH:</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr auto; gap: 8px;">
                                <input type="number" step="any" id="s12-applied-input" class="s12-input" placeholder="e.g. 3" value="${state.appliedAnswer}" ${disabled(state.appliedUnlocked)}>
                                <button id="s12-check-applied" class="s12-btn" ${disabled(state.appliedUnlocked)}>Verify pH</button>
                            </div>
                        </div>
                        <div class="s12-feedback" id="s12-applied-feedback">${state.appliedFeedback}</div>

                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <strong>L12.8 Common Ion Effect Equilibrium Algebra</strong>
                            <p>Weak acid with added common ion:
                            <br><code>HF ⇌ H+ + F-</code>
                            <br>Initial concentrations: <code>[HF] = 0.20 M</code>, <code>[F-] = 0.10 M</code>.
                            <br>If equilibrium adds <code>+x</code> to <code>[H+]</code>, which denominator form is correct in
                            <code>Ka = [H+][F-] / [HF]</code>?</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr 1fr 1fr; gap:6px;">
                                <button id="s12-common-ion-opt1" class="s12-btn ghost ${state.commonIonChoice === 'x' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>x</button>
                                <button id="s12-common-ion-opt2" class="s12-btn ghost ${state.commonIonChoice === 'xplusci' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>x + 0.10</button>
                                <button id="s12-common-ion-opt3" class="s12-btn ghost ${state.commonIonChoice === 'ciminusx' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>0.10 - x</button>
                            </div>
                            <div class="s12-feedback" id="s12-common-ion-feedback">${state.commonIonFeedback}</div>
                        </div>

                        <!-- L12.9 Conjugate base weak salt solve -->
                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <strong>L12.9 Conjugate Transposition (Ka x Kb = Kw)</strong>
                            <p>Sodium Acetate ($\text{NaCH}_3\text{COO}$) is a weak base salt. When dissolved in water, acetate hydrolyzes:
                            <br><code>CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻</code>
                            <br>Given that the $K_a$ of acetic acid is $1.8 \times 10^{-5}$ and $K_w = 1.0 \times 10^{-14}$:
                            <br>1. Calculate $K_b$ for acetate ion using $K_b = K_w / K_a$.
                            <br>2. Set up the ICE table and solve for $[\text{OH}^-]$ in a $0.10\text{ M}$ solution using the small-$x$ approximation, then find the pH ($\text{pH} = 14.00 - \text{pOH}$).</p>
                            
                            <div class="s12-grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">Calculated K_b:</label>
                                    <input type="text" id="s12-kb-input" class="s12-input" placeholder="e.g. 5.6e-10" value="${state.kbInput}" ${disabled(state.appliedUnlocked)}>
                                </div>
                                <div>
                                    <label style="font-size:0.8rem; font-weight:700;">Resulting pH (2 decimals):</label>
                                    <input type="number" step="0.01" id="s12-phsalt-input" class="s12-input" placeholder="e.g. 8.87" value="${state.phSaltInput}" ${disabled(state.appliedUnlocked)}>
                                </div>
                            </div>
                            <button id="s12-check-salt" class="s12-btn" style="margin-top: 8px; width:100%;" ${disabled(state.appliedUnlocked)}>Verify Salt Equilibrium</button>
                            <div class="s12-feedback" id="s12-salt-feedback">${state.kbFeedback}</div>
                        </div>

                        <div class="s12-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Walk me through solving Ka = x^2 / (0.10 - x) for x, both using the small-x approximation and using the exact quadratic formula, and show why pH = 3.0." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's12-check-diagnostic': {
                        id: 's12-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 12 diagnostic answers on isotope averages and weak acid approximations.'
                    },
                    's12-isotope-slider': {
                        id: 's12-isotopes',
                        level: 'concrete',
                        keys: 'isotopeAbundanceVal,concreteCorrect',
                        prompt: 'Help me understand why Boron-11 needs to be 81% abundance to make the average atomic mass 10.81 u.'
                    },
                    's12-isotope-input': {
                        id: 's12-isotopes',
                        level: 'concrete',
                        keys: 'isotopeAbundanceVal,concreteCorrect',
                        prompt: 'Help me understand why Boron-11 needs to be 81% abundance to make the average atomic mass 10.81 u.'
                    },
                    's12-check-ice': {
                        id: 's12-ice-balancing',
                        level: 'pictorial',
                        keys: 'pictorialAnswers.changeB,pictorialAnswers.equilibriumB',
                        prompt: 'Help me fill out the Change and Equilibrium fields in the ICE table for Species B.'
                    },
                    's12-check-abstract': {
                        id: 's12-small-x-validation',
                        level: 'abstract',
                        keys: 'abstractAnswers.q1,abstractAnswers.q2,abstractAnswers.q3',
                        prompt: 'Help me assess if the small-x approximation is valid for Ka = 1.0e-5, Ka = 1.0e-2, and Ka = 5.0e-10.'
                    },
                    's12-check-applied': {
                        id: 's12-weak-acid-ph',
                        level: 'applied',
                        keys: 'appliedAnswer',
                        prompt: 'Help me calculate the pH of a 0.10 M weak acid with Ka = 1.0 x 10^-5.'
                    },
                    's12-common-ion-opt1': {
                        id: 's12-common-ion',
                        level: 'applied',
                        keys: 'commonIonChoice',
                        prompt: 'Help me set up the common-ion Ka expression with a nonzero initial product concentration.'
                    },
                    's12-common-ion-opt2': {
                        id: 's12-common-ion',
                        level: 'applied',
                        keys: 'commonIonChoice',
                        prompt: 'Help me set up the common-ion Ka expression with a nonzero initial product concentration.'
                    },
                    's12-common-ion-opt3': {
                        id: 's12-common-ion',
                        level: 'applied',
                        keys: 'commonIonChoice',
                        prompt: 'Help me set up the common-ion Ka expression with a nonzero initial product concentration.'
                    },
                    's12-check-salt': {
                        id: 's12-weak-base-salt',
                        level: 'applied',
                        keys: 'kbInput,phSaltInput',
                        prompt: 'Help me calculate Kb and the pH of a weak base salt solution using conjugate transposition.'
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
            host.querySelector('#s12-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'a' &&
                                state.diagnosticAnswers.q2 === 'a' &&
                                state.diagnosticAnswers.q3 === 'a';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered equilibrium algebra and isotopes. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active. Solve the Concrete Level to progress.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Isotope Slider & Input
            const updateIsotopeState = (val) => {
                state.isotopeAbundanceVal = val;
                if (val === 81) {
                    state.concreteCorrect = true;
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.concreteFeedback = 'Correct! Setting Boron-11 to 81% (and Boron-10 to 19%) gives average atomic mass 10.81 u. Pictorial Level unlocked. Continue below.';
                } else {
                    state.concreteCorrect = false;
                    state.concreteFeedback = `Boron-11 abundance is ${val}% (Boron-10 is ${100 - val}%). Average atomic mass is ${(10.0 + val/100).toFixed(2)} u. Target is 10.81 u.`;
                }
            };

            const slider = host.querySelector('#s12-isotope-slider');
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value);
                    updateIsotopeState(val);
                    persist('Isotope slider shifted');
                    this.mount({ host, state, onStateChange });
                });
            }

            const isotopeInput = host.querySelector('#s12-isotope-input');
            if (isotopeInput) {
                isotopeInput.addEventListener('change', (e) => {
                    let val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                        val = Math.max(0, Math.min(100, val));
                        updateIsotopeState(val);
                        persist('Isotope input changed');
                        this.mount({ host, state, onStateChange });
                    }
                });
            }

            host.querySelector('#s12-hint-concrete')?.addEventListener('click', () => {
                state.concreteFeedback = 'Hint: Slide or enter the Boron-11 abundance to exactly 81%. Boron-10 abundance is 100 - 81 = 19%. 10.0 * 0.19 + 11.0 * 0.81 = 10.81 u.';
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s12-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.concreteFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Finish the concrete calibration first: set Boron-11 to 81%.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial ICE table validation
            host.querySelector('#s12-check-ice').addEventListener('click', () => {
                const changeB = host.querySelector('#s12-ice-changeB').value;
                const equilibriumB = host.querySelector('#s12-ice-eqB').value;

                state.pictorialAnswers = { changeB, equilibriumB };

                if (changeB === '+2x' && equilibriumB === '2x') {
                    state.pictorialCorrect = true;
                    state.abstractUnlocked = true;
                    state.pictorialFeedback = 'Correct! Since the stoichiometry of Species B is 2, the change is +2x and equilibrium concentration is 2x. Abstract Level unlocked. Continue below.';
                } else {
                    state.pictorialCorrect = false;
                    state.pictorialFeedback = 'Incorrect. Check the stoichiometric coefficient of Species B in the equation: A <=> 2B. Since 2 molecules of B are produced, the change is +2x.';
                }
                persist('ICE table checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract small-x validator check
            host.querySelector('#s12-check-abstract').addEventListener('click', () => {
                const q1 = host.querySelector('#s12-approx-q1').value;
                const q2 = host.querySelector('#s12-approx-q2').value;
                const q3 = host.querySelector('#s12-approx-q3').value;

                state.abstractAnswers = { q1, q2, q3 };

                if (q1 === 'valid' && q2 === 'invalid' && q3 === 'valid') {
                    state.abstractCorrect = true;
                    state.appliedUnlocked = true;
                    state.abstractFeedback = 'Correct! The small-x approximation is valid for Case 1 and Case 3 (where C_0 / Ka >= 400), but invalid for Case 2 (C_0 / Ka = 5). Applied Level unlocked. Continue below.';
                } else {
                    state.abstractCorrect = false;
                    state.abstractFeedback = 'Incorrect. Calculate the ratio C_0 / Ka for each case. If it is greater than or equal to 400, the approximation is valid. Case 1 is 10,000 (valid), Case 2 is 5 (invalid), Case 3 is 20,000,000 (valid).';
                }
                persist('Small-x validity checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied pH calculator check
            host.querySelector('#s12-check-applied').addEventListener('click', () => {
                const val = parseFloat(host.querySelector('#s12-applied-input').value);
                state.appliedAnswer = host.querySelector('#s12-applied-input').value;

                if (val === 3) {
                    state.appliedCorrect = true;
                    state.appliedFeedback = 'Correct! Hydronium x = sqrt(Ka * C_0) = sqrt(1.0e-5 * 0.10) = 1.0e-3 M. pH = -log10(1.0e-3) = 3.';
                } else {
                    state.appliedCorrect = false;
                    state.appliedFeedback = 'Incorrect. First calculate x = sqrt(Ka * C_0) = sqrt(1.0e-5 * 0.10) = sqrt(1.0e-6) = 1.0e-3. Then pH = -log10(1.0e-3) = 3.';
                }
                persist('Applied pH checked');
                this.mount({ host, state, onStateChange });
            });

            // L12.8 common-ion algebra selection
            const setCommonIonChoice = (choice) => {
                state.commonIonChoice = choice;
                if (choice === 'xplusci') {
                    state.commonIonCorrect = true;
                    state.commonIonFeedback = 'Correct! Because F- already starts at 0.10 M, its equilibrium term is x + 0.10, not just x.';
                } else {
                    state.commonIonCorrect = false;
                    state.commonIonFeedback = 'Not yet. With a common ion initially present, the product term includes that starting amount: x + 0.10.';
                }
                persist('Common ion checked');
                this.mount({ host, state, onStateChange });
            };

            host.querySelector('#s12-common-ion-opt1')?.addEventListener('click', () => setCommonIonChoice('x'));
            host.querySelector('#s12-common-ion-opt2')?.addEventListener('click', () => setCommonIonChoice('xplusci'));
            host.querySelector('#s12-common-ion-opt3')?.addEventListener('click', () => setCommonIonChoice('ciminusx'));

            // Sync inputs across re-renders
            const iceChangeB = host.querySelector('#s12-ice-changeB');
            if (iceChangeB) {
                iceChangeB.addEventListener('change', (e) => {
                    state.pictorialAnswers.changeB = e.target.value;
                });
            }
            const iceEqB = host.querySelector('#s12-ice-eqB');
            if (iceEqB) {
                iceEqB.addEventListener('change', (e) => {
                    state.pictorialAnswers.equilibriumB = e.target.value;
                });
            }
            const approxQ1 = host.querySelector('#s12-approx-q1');
            if (approxQ1) {
                approxQ1.addEventListener('change', (e) => {
                    state.abstractAnswers.q1 = e.target.value;
                });
            }
            const approxQ2 = host.querySelector('#s12-approx-q2');
            if (approxQ2) {
                approxQ2.addEventListener('change', (e) => {
                    state.abstractAnswers.q2 = e.target.value;
                });
            }
            const approxQ3 = host.querySelector('#s12-approx-q3');
            if (approxQ3) {
                approxQ3.addEventListener('change', (e) => {
                    state.abstractAnswers.q3 = e.target.value;
                });
            }
            const appliedInput = host.querySelector('#s12-applied-input');
            if (appliedInput) {
                appliedInput.addEventListener('input', (e) => {
                    state.appliedAnswer = e.target.value;
                });
            }

            // L12.8 & L12.9: Verify weak base salt pH and Kb
            host.querySelector('#s12-check-salt')?.addEventListener('click', () => {
                const kbVal = host.querySelector('#s12-kb-input').value.trim();
                const phVal = parseFloat(host.querySelector('#s12-phsalt-input').value);
                state.kbInput = kbVal;
                state.phSaltInput = host.querySelector('#s12-phsalt-input').value;

                const normalizedKb = kbVal.toLowerCase().replace(/\s+/g, '').replace(/[\*x×]10\^/g, 'e');
                const isKbCorrect = normalizedKb === '5.6e-10' || normalizedKb === '5.56e-10' || normalizedKb === '5.556e-10';
                const isPhCorrect = Math.abs(phVal - 8.87) < 0.05;

                if (isKbCorrect && isPhCorrect) {
                    state.kbCorrect = true;
                    state.phSaltCorrect = true;
                    state.kbFeedback = 'Correct! Kb = 5.6 × 10⁻¹⁰ and pH = 8.87. You mastered conjugate base hydrolysis calculations!';
                } else if (!isKbCorrect && isPhCorrect) {
                    state.kbCorrect = false;
                    state.kbFeedback = 'pH is correct, but check your Kb value. Make sure Kb = 1.0e-14 / 1.8e-5 = 5.6e-10.';
                } else if (isKbCorrect && !isPhCorrect) {
                    state.kbCorrect = true;
                    state.phSaltCorrect = false;
                    state.kbFeedback = 'Kb is correct! Now solve for pH: [OH⁻] = sqrt(Kb * 0.10) = 7.45e-6 M. pOH = -log10[OH⁻] = 5.13. pH = 14.00 - 5.13 = 8.87.';
                } else {
                    state.kbCorrect = false;
                    state.phSaltCorrect = false;
                    state.kbFeedback = 'Incorrect. Verify Ka-to-Kb conversion: Kb = 1.0e-14 / 1.8e-5 = 5.6e-10. Then solve for pH of 0.10 M weak base solution.';
                }
                persist('Salt equilibrium checked');
                this.mount({ host, state, onStateChange });
            });

            const kbInputEl = host.querySelector('#s12-kb-input');
            if (kbInputEl) {
                kbInputEl.addEventListener('input', (e) => {
                    state.kbInput = e.target.value;
                });
            }
            const phSaltInputEl = host.querySelector('#s12-phsalt-input');
            if (phSaltInputEl) {
                phSaltInputEl.addEventListener('input', (e) => {
                    state.phSaltInput = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
