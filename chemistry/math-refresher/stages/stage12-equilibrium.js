const createInitialStage12State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L12.1 Weighted Averages & Isotope Mixtures
    isotopeAbundanceVal: 50, // Boron-11 abundance (%)
    l121Correct: false,
    l121Feedback: 'L12.1: Adjust the abundance slider to set Boron-11 to 81% and verify.',

    // L12.2 Concentration Blending (Mixture Algebra)
    blendInput: '', // Blended concentration (M)
    l122Correct: false,
    l122Feedback: 'L12.2: Calculate the blended concentration of the mixed solutions.',

    concreteCompleted: false,

    // L12.3 Equilibrium Expressions & Ratios of Powers
    keqChoice: '', // Dropdown choice ('linear', 'ratio', 'inverse')
    l123Correct: false,
    l123Feedback: 'L12.3: Select the correct equilibrium expression Keq for N2O4 <=> 2NO2.',

    // L12.4 The ICE Table Setup (Algebraic Representation)
    pictorialAnswers: { changeB: '', equilibriumB: '' },
    l124Correct: false,
    l124Feedback: 'L12.4: Select the correct Change and Equilibrium values for species B.',

    pictorialCompleted: false,

    // L12.5 The Small-x Approximation
    abstractAnswers: { q1: '', q2: '', q3: '' },
    l125Correct: false,
    l125Feedback: 'L12.5: Determine if the small-x approximation is valid for each scenario.',

    // L12.6 Exact Equilibrium Solves (Quadratic Formula)
    exactSolveInput: '', // Calculated H+ root (M)
    l126Correct: false,
    l126Feedback: 'L12.6: Solve the quadratic equation exactly for the positive root x.',

    abstractCompleted: false,

    // L12.7 Multi-Variable Solves in Weak Acids/Bases (pH weak HA)
    appliedAnswer: '', // weak acid pH
    l127Correct: false,
    l127Feedback: 'L12.7: Calculate the pH of the weak acid HA.',

    // L12.8 Common Ion Effect Equilibrium Algebra
    commonIonChoice: '', // option button selected
    l128Correct: false,
    l128Feedback: 'L12.8: Select the correct denominator term for the common-ion Ka expression.',

    // L12.9 Conjugate Transposition (Ka · Kb = Kw)
    kbInput: '', // conjugate Kb
    phSaltInput: '', // base salt pH
    l129Correct: false,
    l129Feedback: 'L12.9: Calculate Kb and the pH of the weak base salt solution.',

    appliedCompleted: false
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
                    .s12-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; margin-bottom: 0.6rem; }
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
                    .s12-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; gap: 10px; flex-wrap: wrap; }
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
                        <h2>Concrete Level: Weighted Mixtures & Solution Blending</h2>
                        <p>We work with physical weighted systems: atomic isotope abundances and concentration mixtures.</p>
                        
                        <!-- L12.1 Weighted Averages & Isotope Mixtures -->
                        <div class="s12-pane">
                            <h3>L12.1 Weighted Averages &amp; Isotope Mixtures</h3>
                            <p>Average atomic mass is a weighted average based on isotope mass and percent abundance. Boron has two stable isotopes: Boron-10 ($${s12Spec.mass1.toFixed(1)}\text{ u}$) and Boron-11 ($${s12Spec.mass2.toFixed(1)}\text{ u}$). Adjust the slider so that the average mass matches Boron's actual weight of **${s12Spec.averageMass.toFixed(2)} u** (which requires Boron-11 to be exactly **${s12Spec.abundance2}%**).</p>
                            
                            <div class="s12-svg-container">
                                <svg class="s12-mass-svg" viewBox="0 0 180 130">
                                    <line class="s12-mass-axis" x1="20" y1="10" x2="20" y2="110" />
                                    <line class="s12-mass-axis" x1="15" y1="105" x2="170" y2="105" />
                                    <line class="s12-mass-peak" x1="60" y1="105" x2="60" y2="${105 - peak10Height}" stroke="#60a5fa" />
                                    <text x="50" y="120" font-size="8px" fill="#cbd5e1" font-weight="bold">${s12Spec.mass1.toFixed(1)} u</text>
                                    <text x="50" y="${100 - peak10Height}" font-size="8px" fill="#93c5fd">${ab10}%</text>
                                    <line class="s12-mass-peak" x1="120" y1="105" x2="120" y2="${105 - peak11Height}" stroke="#f59e0b" />
                                    <text x="110" y="120" font-size="8px" fill="#cbd5e1" font-weight="bold">${s12Spec.mass2.toFixed(1)} u</text>
                                    <text x="110" y="${100 - peak11Height}" font-size="8px" fill="#fde68a">${ab11}%</text>
                                    <text x="12" y="20" font-size="7px" fill="#94a3b8" transform="rotate(-90 12 20)">Abundance (%)</text>
                                </svg>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.05rem; gap:0.5rem; margin-bottom:0.6rem;">
                                <span style="color:#60a5fa;">Boron-10: <strong>${ab10}%</strong></span>
                                <span style="color:#f59e0b; display:flex; align-items:center; gap:0.4rem;">
                                    Boron-11:
                                    <input type="number" id="s12-isotope-input" class="s12-input" min="0" max="100" step="1" value="${state.isotopeAbundanceVal}" ${disabled(state.concreteUnlocked)} style="width: 70px;">
                                    %
                                </span>
                                <span style="color:#22c55e;">Average Mass: <strong>${avgWeight.toFixed(2)} u</strong></span>
                            </div>
                            <input type="range" id="s12-isotope-slider" class="s12-slider" min="0" max="100" step="1" value="${state.isotopeAbundanceVal}" ${disabled(state.concreteUnlocked)} style="width:100%; margin-bottom: 0.6rem;">
                            
                            <button id="s12-check-l121" class="s12-btn" style="width:100%;" ${disabled(state.concreteUnlocked)}>Verify L12.1</button>
                            <div class="s12-feedback" id="s12-l121-feedback">${state.l121Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain how to compute the weighted average atomic mass of Boron from its isotopes' abundances." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (L12.1)</button>
                            </div>
                        </div>

                        <!-- L12.2 Concentration Blending -->
                        <div class="s12-pane">
                            <h3>L12.2 Concentration Blending (Mixture Algebra)</h3>
                            <p>When two solutions of differing concentrations are mixed, the final concentration is the sum of moles divided by the total volume: $C_{final} = \frac{C_A V_A + C_B V_B}{V_A + V_B}$.</p>
                            <p>Calculate the final concentration ($C_{final}$) when **100 mL of 0.10 M NaCl** is mixed with **100 mL of 0.30 M NaCl**:</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <input type="text" id="s12-blend-input" class="s12-input" placeholder="Enter concentration (M)" value="${state.blendInput}" ${disabled(state.concreteUnlocked)}>
                                <button id="s12-check-l122" class="s12-btn" ${disabled(state.concreteUnlocked)}>Verify L12.2</button>
                            </div>
                            <div class="s12-feedback" id="s12-l122-feedback">${state.l122Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Walk me through how to use the mixture algebra formula to calculate the final concentration when mixing two solutions." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (L12.2)</button>
                            </div>
                        </div>

                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Level Mission Progress</h3>
                            <div class="s12-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s12-pill ${state.l121Correct ? 'good' : 'locked'}">L12.1 Isotope Weighted Averages Completed</span>
                                <span class="s12-pill ${state.l122Correct ? 'good' : 'locked'}">L12.2 Concentration Blending Completed</span>
                            </div>
                            <div class="s12-grid" style="gap:4px;">
                                <button id="s12-continue-pictorial" class="s12-btn" ${(state.fastTrack || (state.l121Correct && state.l122Correct)) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial</button>
                            </div>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Equilibrium Expressions & ICE Tables</h2>
                        <p>We construct algebraic equilibrium models from chemical equations using ratios of powers and ICE tables.</p>
                        
                        <!-- L12.3 Equilibrium Expressions & Ratios of Powers -->
                        <div class="s12-pane">
                            <h3>L12.3 Equilibrium Expressions &amp; Ratios of Powers</h3>
                            <p>For a general reaction $a\text{A} + b\text{B} \rightleftharpoons c\text{C} + d\text{D}$, the equilibrium constant $K_{eq}$ is defined by the ratio of product concentrations to reactant concentrations, each raised to the power of their stoichiometric coefficients: $K_{eq} = \frac{[\text{C}]^c [\text{D}]^d}{[\text{A}]^a [\text{B}]^b}$.</p>
                            <p>For the gas-phase dissociation reaction: **$\text{N}_2\text{O}_4(g) \rightleftharpoons 2\text{NO}_2(g)$**, select the correct equilibrium constant expression $K_{eq}$:</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <select id="s12-keq-select" class="s12-input" ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Select expression...</option>
                                    <option value="linear" ${state.keqChoice === 'linear' ? 'selected' : ''}>Keq = [NO2] / [N2O4]</option>
                                    <option value="ratio" ${state.keqChoice === 'ratio' ? 'selected' : ''}>Keq = [NO2]² / [N2O4]</option>
                                    <option value="inverse" ${state.keqChoice === 'inverse' ? 'selected' : ''}>Keq = [N2O4] / [NO2]²</option>
                                </select>
                                <button id="s12-check-l123" class="s12-btn" ${disabled(state.pictorialUnlocked)}>Verify L12.3</button>
                            </div>
                            <div class="s12-feedback" id="s12-l123-feedback">${state.l123Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain how coefficients in a balanced chemical equation become exponents in the equilibrium constant expression." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (L12.3)</button>
                            </div>
                        </div>

                        <!-- L12.4 ICE Table Setup -->
                        <div class="s12-pane">
                            <h3>L12.4 The ICE Table Setup (Algebraic Representation)</h3>
                            <p>We track chemical reaction shifts using ICE tables (Initial, Change, Equilibrium). Consider the reaction: **$A \rightleftharpoons 2B$**. If the initial concentration of A is $1.0\text{ M}$ and B is $0.0\text{ M}$, select the correct algebraic expressions in the Change (C) and Equilibrium (E) rows for Species B in terms of shifts $x$:</p>
                            
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
                            <button id="s12-check-l124" class="s12-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.pictorialUnlocked)}>Verify L12.4</button>
                            <div class="s12-feedback" id="s12-l124-feedback">${state.l124Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain how stoichiometry determines the Change and Equilibrium expressions in an ICE table." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (L12.4)</button>
                            </div>
                        </div>

                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Pictorial Level Mission Progress</h3>
                            <div class="s12-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s12-pill ${state.l123Correct ? 'good' : 'locked'}">L12.3 Keq Power Ratios Completed</span>
                                <span class="s12-pill ${state.l124Correct ? 'good' : 'locked'}">L12.4 ICE Setup Completed</span>
                            </div>
                            <div class="s12-grid" style="gap:4px;">
                                <button id="s12-continue-abstract" class="s12-btn" ${(state.fastTrack || (state.l123Correct && state.l124Correct)) ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Continue to Abstract</button>
                            </div>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Approximations & Quadratic Solves</h2>
                        <p>We evaluate algebraic simplifications and perform exact mathematical solves using the quadratic formula.</p>
                        
                        <!-- L12.5 The Small-x Approximation -->
                        <div class="s12-pane">
                            <h3>L12.5 The Small-x Approximation</h3>
                            <p>In weak acid algebra ($K_a = \frac{x^2}{C_0 - x}$), we can approximate $C_0 - x \approx C_0$ to avoid the quadratic formula, provided the initial concentration $C_0$ is at least **400 times** larger than the equilibrium constant $K_a$ ($C_0 / K_a \ge 400$). Classify each scenario:</p>
                            
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
                            <button id="s12-check-l125" class="s12-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.abstractUnlocked)}>Verify L12.5</button>
                            <div class="s12-feedback" id="s12-l125-feedback">${state.l125Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain the C_0 / Ka >= 400 rule of thumb and why it ensures the percent error of the small-x approximation stays under 5%." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (L12.5)</button>
                            </div>
                        </div>

                        <!-- L12.6 Exact Equilibrium Solves (Quadratic Formula) -->
                        <div class="s12-pane">
                            <h3>L12.6 Exact Equilibrium Solves (Quadratic Formula)</h3>
                            <p>When the small-x approximation is invalid ($C_0 / K_a < 400$), we must solve the equation exactly. Consider a weak acid with $K_a = 1.0 \times 10^{-2}$ and initial concentration $C_0 = 0.05\text{ M}$ (Case 2 above):
                            <br><code class="bg-gray-900 p-1 rounded inline-block text-yellow-300" style="font-family:monospace; margin-top:4px;">Ka = x² / (C₀ - x) => 0.01 = x² / (0.05 - x) => x² + 0.01x - 0.0005 = 0</code></p>
                            <p>Solve for the positive root $x = [\text{H}^+]$ in M using the quadratic formula $x = \frac{-b + \sqrt{b^2 - 4ac}}{2a}$ (enter to 3 decimal places):</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <input type="text" id="s12-exact-input" class="s12-input" placeholder="Enter positive root x (M)" value="${state.exactSolveInput}" ${disabled(state.abstractUnlocked)}>
                                <button id="s12-check-l126" class="s12-btn" ${disabled(state.abstractUnlocked)}>Verify L12.6</button>
                            </div>
                            <div class="s12-feedback" id="s12-l126-feedback">${state.l126Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Show me how to solve the quadratic equation x^2 + 0.01x - 0.0005 = 0 step-by-step to find the positive root x = 0.018." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (L12.6)</button>
                            </div>
                        </div>

                        <div class="s12-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Abstract Level Mission Progress</h3>
                            <div class="s12-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s12-pill ${state.l125Correct ? 'good' : 'locked'}">L12.5 Small-x Approximations Completed</span>
                                <span class="s12-pill ${state.l126Correct ? 'good' : 'locked'}">L12.6 Quadratic Solver Completed</span>
                            </div>
                            <div class="s12-grid" style="gap:4px;">
                                <button id="s12-continue-applied" class="s12-btn" ${(state.fastTrack || (state.l125Correct && state.l126Correct)) ? '' : 'disabled'} ${disabled(state.abstractUnlocked)}>Continue to Applied</button>
                            </div>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s12-card s12-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Weak Acids, Common Ions & Salt pH</h2>
                        <p>We solve complex acid-base equilibria, buffer solutions, and weak base salt hydrolyses in laboratory contexts.</p>
                        
                        <!-- L12.7 pH & Weak Acids -->
                        <div class="s12-pane">
                            <h3>L12.7 Multi-Variable Solves in Weak Acids/Bases</h3>
                            <p>For a weak acid HA with initial concentration $C_0 = 0.10\text{ M}$ and $K_a = 1.0 \times 10^{-5}$, the hydronium concentration at equilibrium is given by: $K_a = x^2 / (C_0 - x)$. Use the small-x approximation $x \approx \sqrt{K_a \cdot C_0}$ to find $x = [\text{H}_3\text{O}^+]$, and calculate the integer pH ($pH = -\log_{10}(x)$):</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr auto; gap: 8px; margin-top: 0.3rem;">
                                <input type="number" step="any" id="s12-applied-input" class="s12-input" placeholder="Enter integer pH" value="${state.appliedAnswer}" ${disabled(state.appliedUnlocked)}>
                                <button id="s12-check-l127" class="s12-btn" ${disabled(state.appliedUnlocked)}>Verify L12.7</button>
                            </div>
                            <div class="s12-feedback" id="s12-l127-feedback">${state.l127Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Walk me through solving Ka = x^2 / (0.10 - x) using the small-x approximation to find x = 10^-3 and pH = 3." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (L12.7)</button>
                            </div>
                        </div>

                        <!-- L12.8 Common Ion Effect -->
                        <div class="s12-pane">
                            <h3>L12.8 Common Ion Effect Equilibrium Algebra</h3>
                            <p>Weak acid HF dissociated with added common conjugate base F-:
                            <br><code>HF ⇌ H+ + F-</code>
                            <br>Initial concentrations: <code>[HF] = 0.20 M</code>, <code>[F-] = 0.10 M</code>.
                            <br>If equilibrium adds <code>+x</code> to <code>[H+]</code>, which product/reactant term corresponds to the equilibrium concentration of the conjugate base F- in the numerator of the $K_a$ expression?</p>
                            <div class="s12-grid" style="grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-top:0.5rem; margin-bottom:0.5rem;">
                                <button id="s12-common-ion-opt1" class="s12-btn ghost ${state.commonIonChoice === 'x' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>x</button>
                                <button id="s12-common-ion-opt2" class="s12-btn ghost ${state.commonIonChoice === 'xplusci' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>x + 0.10</button>
                                <button id="s12-common-ion-opt3" class="s12-btn ghost ${state.commonIonChoice === 'ciminusx' ? 'active' : ''}" ${disabled(state.appliedUnlocked)}>0.10 - x</button>
                            </div>
                            <button id="s12-check-l128" class="s12-btn" style="width:100%;" ${disabled(state.appliedUnlocked)}>Verify L12.8</button>
                            <div class="s12-feedback" id="s12-l128-feedback">${state.l128Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Explain the Common Ion Effect and why F- equilibrium concentration becomes x + 0.10 in a buffer." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (L12.8)</button>
                            </div>
                        </div>

                        <!-- L12.9 Conjugate Transposition Ka * Kb = Kw -->
                        <div class="s12-pane">
                            <h3>L12.9 Conjugate Transposition (Ka · Kb = Kw)</h3>
                            <p>Sodium Acetate ($\text{NaCH}_3\text{COO}$) dissociates into acetate ion ($\text{CH}_3\text{COO}^-$) which hydrolyzes as a weak base:
                            <br><code>CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻</code>
                            <br>Given that the $K_a$ of acetic acid is $1.8 \times 10^{-5}$ and $K_w = 1.0 \times 10^{-14}$:
                            <br>1. Calculate $K_b$ for acetate ion using $K_b = K_w / K_a$.
                            <br>2. Solve the ICE table for $[\text{OH}^-]$ in a $0.10\text{ M}$ solution using the small-$x$ approximation, and calculate the pH ($\text{pH} = 14.00 - \text{pOH}$).</p>
                            
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
                            <button id="s12-check-l129" class="s12-btn" style="margin-top: 8px; width:100%;" ${disabled(state.appliedUnlocked)}>Verify L12.9</button>
                            <div class="s12-feedback" id="s12-l129-feedback">${state.l129Feedback}</div>
                            <div style="display:flex; justify-content:flex-end; margin-top:0.4rem;">
                                <button class="tutor-btn s12-btn ghost" title="Reinforcement" data-prompt="Walk me through calculating Kb and the resulting pH for a 0.10 M weak base salt solution step-by-step." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (L12.9)</button>
                            </div>
                        </div>

                        <div class="s12-pane" style="margin-top: 0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Applied Level Mission Progress</h3>
                            <div class="s12-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s12-pill ${state.l127Correct ? 'good' : 'locked'}">L12.7 Weak Acid pH Completed</span>
                                <span class="s12-pill ${state.l128Correct ? 'good' : 'locked'}">L12.8 Common Ion Completed</span>
                                <span class="s12-pill ${state.l129Correct ? 'good' : 'locked'}">L12.9 Conjugate Salt Completed</span>
                            </div>
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
                    's12-check-l121': {
                        id: 's12-l121',
                        level: 'concrete',
                        keys: 'isotopeAbundanceVal,l121Correct',
                        prompt: 'Help me set the Boron-11 abundance slider and calculate average atomic mass.'
                    },
                    's12-check-l122': {
                        id: 's12-l122',
                        level: 'concrete',
                        keys: 'blendInput,l122Correct',
                        prompt: 'Help me calculate the final concentration when mixing 100 mL of 0.10 M NaCl and 100 mL of 0.30 M NaCl.'
                    },
                    's12-check-l123': {
                        id: 's12-l123',
                        level: 'pictorial',
                        keys: 'keqChoice,l123Correct',
                        prompt: 'Help me select the correct Keq ratio of powers expression.'
                    },
                    's12-check-l124': {
                        id: 's12-l124',
                        level: 'pictorial',
                        keys: 'pictorialAnswers.changeB,pictorialAnswers.equilibriumB,l124Correct',
                        prompt: 'Help me set up the Change and Equilibrium columns in the ICE table for species B.'
                    },
                    's12-check-l125': {
                        id: 's12-l125',
                        level: 'abstract',
                        keys: 'abstractAnswers.q1,abstractAnswers.q2,abstractAnswers.q3,l125Correct',
                        prompt: 'Help me validate the small-x approximation for the three Ka and concentration ratios.'
                    },
                    's12-check-l126': {
                        id: 's12-l126',
                        level: 'abstract',
                        keys: 'exactSolveInput,l126Correct',
                        prompt: 'Help me solve the quadratic equation x^2 + 0.01x - 0.0005 = 0 exactly for the positive root.'
                    },
                    's12-check-l127': {
                        id: 's12-l127',
                        level: 'applied',
                        keys: 'appliedAnswer,l127Correct',
                        prompt: 'Help me calculate the pH of a 0.10 M weak acid HA with Ka = 1.0 x 10^-5.'
                    },
                    's12-check-l128': {
                        id: 's12-l128',
                        level: 'applied',
                        keys: 'commonIonChoice,l128Correct',
                        prompt: 'Help me identify the F- equilibrium expression when F- is present initially.'
                    },
                    's12-check-l129': {
                        id: 's12-l129',
                        level: 'applied',
                        keys: 'kbInput,phSaltInput,l129Correct',
                        prompt: 'Help me calculate Kb and the pH of a weak base salt solution using Ka * Kb = Kw.'
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
                    state.l121Correct = true;
                    state.l122Correct = true;
                    state.l123Correct = true;
                    state.l124Correct = true;
                    state.l125Correct = true;
                    state.l126Correct = true;
                    state.l127Correct = true;
                    state.l128Correct = true;
                    state.l129Correct = true;
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
                    state.l121Correct = true;
                    state.l121Feedback = 'Correct! Setting Boron-11 to 81% gives average atomic mass 10.81 u.';
                } else {
                    state.l121Correct = false;
                    state.l121Feedback = `Boron-11 abundance is ${val}%. Average mass is ${(10.0 + val/100).toFixed(2)} u. Target is 10.81 u.`;
                }
                syncConcreteCompletion();
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

            // Concrete: Blend Input sync
            const blendInputEl = host.querySelector('#s12-blend-input');
            if (blendInputEl) {
                blendInputEl.addEventListener('input', (e) => {
                    state.blendInput = e.target.value;
                });
            }

            // Verify L12.1
            host.querySelector('#s12-check-l121')?.addEventListener('click', () => {
                const currentAb = parseInt(state.isotopeAbundanceVal);
                if (currentAb === 81) {
                    state.l121Correct = true;
                    state.l121Feedback = 'Correct! Setting Boron-11 to 81% (and Boron-10 to 19%) gives average atomic mass 10.81 u.';
                } else {
                    state.l121Correct = false;
                    state.l121Feedback = 'Not yet. Slide or enter Boron-11 abundance to exactly 81%.';
                }

                syncConcreteCompletion();
                persist('L12.1 checked');
                this.mount({ host, state, onStateChange });
            });

            // Verify L12.2
            host.querySelector('#s12-check-l122')?.addEventListener('click', () => {
                const blendVal = parseFloat(String(state.blendInput || '').trim());
                const correctBlend = !isNaN(blendVal) && Math.abs(blendVal - 0.20) < 0.01;

                if (correctBlend) {
                    state.l122Correct = true;
                    state.l122Feedback = 'Correct! Combining equal volumes of 0.10 M and 0.30 M yields a final concentration of 0.20 M.';
                } else {
                    state.l122Correct = false;
                    state.l122Feedback = 'Not yet. Calculate: (0.10 M * 0.10 L + 0.30 M * 0.10 L) / (0.10 L + 0.10 L) = 0.040 mol / 0.20 L = 0.20 M.';
                }

                syncConcreteCompletion();
                persist('L12.2 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncConcreteCompletion = () => {
                if (state.fastTrack) return;
                if (state.l121Correct && state.l122Correct) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                } else {
                    state.concreteCompleted = false;
                }
            };

            // Concrete transition
            host.querySelector('#s12-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.l122Feedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.l122Feedback = 'Complete both L12.1 and L12.2 first.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial: Keq select sync
            const keqSelect = host.querySelector('#s12-keq-select');
            if (keqSelect) {
                keqSelect.addEventListener('change', (e) => {
                    state.keqChoice = e.target.value;
                });
            }

            // Verify L12.3
            host.querySelector('#s12-check-l123')?.addEventListener('click', () => {
                if (state.keqChoice === 'ratio') {
                    state.l123Correct = true;
                    state.l123Feedback = 'Correct! Keq is product concentrations over reactant concentrations, raised to their coefficients: [NO2]² / [N2O4].';
                } else {
                    state.l123Correct = false;
                    state.l123Feedback = 'Not yet. Product NO2 has coefficient 2, so its concentration must be squared in the numerator.';
                }

                syncPictorialCompletion();
                persist('L12.3 checked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial: ICE dropdowns sync
            const changeB = host.querySelector('#s12-ice-changeB');
            if (changeB) {
                changeB.addEventListener('change', (e) => {
                    state.pictorialAnswers.changeB = e.target.value;
                });
            }
            const eqB = host.querySelector('#s12-ice-eqB');
            if (eqB) {
                eqB.addEventListener('change', (e) => {
                    state.pictorialAnswers.equilibriumB = e.target.value;
                });
            }

            // Verify L12.4
            host.querySelector('#s12-check-l124')?.addEventListener('click', () => {
                const cCorrect = state.pictorialAnswers.changeB === '+2x';
                const eCorrect = state.pictorialAnswers.equilibriumB === '2x';

                if (cCorrect && eCorrect) {
                    state.l124Correct = true;
                    state.l124Feedback = 'Correct! Since 2 moles of B are produced per mole of A reacted, the Change is +2x and Equilibrium is 2x.';
                } else {
                    state.l124Correct = false;
                    state.l124Feedback = 'Incorrect. Check the stoichiometry of Species B (A <=> 2B). The change must be +2x.';
                }

                syncPictorialCompletion();
                persist('L12.4 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncPictorialCompletion = () => {
                if (state.fastTrack) return;
                if (state.l123Correct && state.l124Correct) {
                    state.pictorialCompleted = true;
                    state.abstractUnlocked = true;
                } else {
                    state.pictorialCompleted = false;
                }
            };

            // Pictorial transition
            host.querySelector('#s12-continue-abstract')?.addEventListener('click', () => {
                if (state.fastTrack || state.abstractUnlocked) {
                    state.l124Feedback = 'Abstract unlocked. Continue below.';
                } else {
                    state.l124Feedback = 'Complete both L12.3 and L12.4 first.';
                }
                persist('Continue to abstract clicked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract: Approximations sync
            const approx1 = host.querySelector('#s12-approx-q1');
            if (approx1) {
                approx1.addEventListener('change', (e) => { state.abstractAnswers.q1 = e.target.value; });
            }
            const approx2 = host.querySelector('#s12-approx-q2');
            if (approx2) {
                approx2.addEventListener('change', (e) => { state.abstractAnswers.q2 = e.target.value; });
            }
            const approx3 = host.querySelector('#s12-approx-q3');
            if (approx3) {
                approx3.addEventListener('change', (e) => { state.abstractAnswers.q3 = e.target.value; });
            }

            // Verify L12.5
            host.querySelector('#s12-check-l125')?.addEventListener('click', () => {
                const c1 = state.abstractAnswers.q1 === 'valid';
                const c2 = state.abstractAnswers.q2 === 'invalid';
                const c3 = state.abstractAnswers.q3 === 'valid';

                if (c1 && c2 && c3) {
                    state.l125Correct = true;
                    state.l125Feedback = 'Correct! Case 1 (ratio = 10,000) and Case 3 (ratio = 20,000,000) are valid, but Case 2 (ratio = 5) is invalid.';
                } else {
                    state.l125Correct = false;
                    state.l125Feedback = 'Not yet. Calculate the ratio C0 / Ka. If it is 400 or greater, the approximation is valid. Case 2 is 0.05 / 0.01 = 5, which is invalid.';
                }

                syncAbstractCompletion();
                persist('L12.5 checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract: Exact solve input sync
            const exactInput = host.querySelector('#s12-exact-input');
            if (exactInput) {
                exactInput.addEventListener('input', (e) => {
                    state.exactSolveInput = e.target.value;
                });
            }

            // Verify L12.6
            host.querySelector('#s12-check-l126')?.addEventListener('click', () => {
                const solveVal = parseFloat(String(state.exactSolveInput || '').trim());
                const correctSolve = !isNaN(solveVal) && Math.abs(solveVal - 0.018) < 0.0025;

                if (correctSolve) {
                    state.l126Correct = true;
                    state.l126Feedback = 'Correct! Solving the quadratic equation exactly yields positive root x = 0.018 M.';
                } else {
                    state.l126Correct = false;
                    state.l126Feedback = 'Incorrect. Use the quadratic formula: a=1, b=0.01, c=-0.0005. Root x = (-0.01 + sqrt(0.0001 - 4 * 1 * -0.0005)) / 2 = 0.018 M.';
                }

                syncAbstractCompletion();
                persist('L12.6 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncAbstractCompletion = () => {
                if (state.fastTrack) return;
                if (state.l125Correct && state.l126Correct) {
                    state.abstractCompleted = true;
                    state.appliedUnlocked = true;
                } else {
                    state.abstractCompleted = false;
                }
            };

            // Abstract transition
            host.querySelector('#s12-continue-applied')?.addEventListener('click', () => {
                if (state.fastTrack || state.appliedUnlocked) {
                    state.l126Feedback = 'Applied unlocked. Continue below.';
                } else {
                    state.l126Feedback = 'Complete both L12.5 and L12.6 first.';
                }
                persist('Continue to applied clicked');
                this.mount({ host, state, onStateChange });
            });

            // Applied: pH Input sync
            const appInputVal = host.querySelector('#s12-applied-input');
            if (appInputVal) {
                appInputVal.addEventListener('input', (e) => {
                    state.appliedAnswer = e.target.value;
                });
            }

            // Verify L12.7
            host.querySelector('#s12-check-l127')?.addEventListener('click', () => {
                const phAns = parseInt(state.appliedAnswer.trim());
                if (phAns === 3) {
                    state.l127Correct = true;
                    state.l127Feedback = 'Correct! Hydronium concentration x = sqrt(Ka * C0) = 1.0e-3 M, giving integer pH = 3.';
                } else {
                    state.l127Correct = false;
                    state.l127Feedback = 'Incorrect. First calculate x = sqrt(1.0e-5 * 0.10) = 1.0e-3 M. Then pH = -log10(1.0e-3) = 3.';
                }

                syncAppliedCompletion();
                persist('L12.7 checked');
                this.mount({ host, state, onStateChange });
            });

            // L12.8 common-ion button clicks
            const setCommonIonChoice = (choice) => {
                state.commonIonChoice = choice;
                persist('Common ion choice clicked');
                this.mount({ host, state, onStateChange });
            };

            host.querySelector('#s12-common-ion-opt1')?.addEventListener('click', () => setCommonIonChoice('x'));
            host.querySelector('#s12-common-ion-opt2')?.addEventListener('click', () => setCommonIonChoice('xplusci'));
            host.querySelector('#s12-common-ion-opt3')?.addEventListener('click', () => setCommonIonChoice('ciminusx'));

            // Verify L12.8
            host.querySelector('#s12-check-l128')?.addEventListener('click', () => {
                if (state.commonIonChoice === 'xplusci') {
                    state.l128Correct = true;
                    state.l128Feedback = 'Correct! Because conjugate base F- is already present at 0.10 M, its equilibrium concentration is x + 0.10.';
                } else {
                    state.l128Correct = false;
                    state.l128Feedback = 'Not yet. The common ion F- starts at 0.10 M, so its concentration term becomes x + 0.10.';
                }

                syncAppliedCompletion();
                persist('L12.8 checked');
                this.mount({ host, state, onStateChange });
            });

            // L12.9 inputs sync
            const kbIn = host.querySelector('#s12-kb-input');
            if (kbIn) {
                kbIn.addEventListener('input', (e) => { state.kbInput = e.target.value; });
            }
            const phSaltIn = host.querySelector('#s12-phsalt-input');
            if (phSaltIn) {
                phSaltIn.addEventListener('input', (e) => { state.phSaltInput = e.target.value; });
            }

            // Verify L12.9
            host.querySelector('#s12-check-l129')?.addEventListener('click', () => {
                const kbVal = state.kbInput.trim().toLowerCase();
                const phVal = parseFloat(state.phSaltInput);
                const kbCorrect = kbVal === '5.6e-10' || kbVal === '5.56e-10' || kbVal === '5.6*10^-10' || kbVal === '5.6x10^-10';
                const phCorrect = !isNaN(phVal) && Math.abs(phVal - s12Salt.ph) < 0.05;

                if (kbCorrect && phCorrect) {
                    state.l129Correct = true;
                    state.l129Feedback = `Correct! Kb = Kw / Ka = 5.6 x 10^-10. Hydrolysis gives [OH-] = sqrt(Kb * 0.10) = 7.46 x 10^-6 M, giving pH = ${s12Salt.ph.toFixed(2)}.`;
                } else {
                    state.l129Correct = false;
                    let errorMsg = 'Not yet: ';
                    if (!kbCorrect) errorMsg += 'Kb = 1.0e-14 / 1.8e-5 = 5.6e-10. ';
                    if (!phCorrect) errorMsg += `pH of 0.10 M acetate is 8.87. (pOH = -log10(sqrt(5.6e-10 * 0.10)) = 5.13 => pH = 14.00 - 5.13 = 8.87).`;
                    state.l129Feedback = errorMsg;
                }

                syncAppliedCompletion();
                persist('L12.9 checked');
                this.mount({ host, state, onStateChange });
            });

            const syncAppliedCompletion = () => {
                if (state.fastTrack) return;
                if (state.l127Correct && state.l128Correct && state.l129Correct) {
                    state.appliedCompleted = true;
                } else {
                    state.appliedCompleted = false;
                }
            };
        },
        unmount() {}
    };
}
