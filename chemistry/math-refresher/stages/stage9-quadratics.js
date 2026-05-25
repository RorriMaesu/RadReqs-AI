const createInitialStage9State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Concrete: Intersection clicker
    clickX: null,
    clickY: null,
    concreteFeedback: 'Click on the coordinate plane to select the intersection point of the two lines.',
    concreteCorrect: false,
    concreteMission: { intersectionFound: false },
    concreteCompleted: false,

    // Pictorial: Right triangle geometry
    triangleC: '',
    triangleFeedback: 'Leg A = 6, Leg B = 8. Solve for Hypotenuse C using c = sqrt(a^2 + b^2).',
    triangleCorrect: false,

    // Transversal geometry
    transversalAnswer: '',
    transversalFeedback: 'L9.3 Transversal Angles: If one angle is 65 degrees, the alternate interior angle is also 65 degrees.',
    transversalCorrect: false,

    // Abstract: Factoring trinomials
    factorP: '',
    factorQ: '',
    factorFeedback: 'Factor x^2 + 5x + 6 into (x + p)(x + q). Select p and q.',
    factorCorrect: false,

    // Applied: Equilibrium quadratic
    appliedChoice: '',
    appliedFeedback: 'Solve x^2 + 2x - 3 = 0. Since concentrations cannot be negative, pick the positive physical root.',
    appliedCorrect: false
});

export function createStage9Quadratics() {
    return {
        id: 'stage9',
        label: 'Systems & Quadratics',
        title: 'Stage 9: Systems, Geometry & Quadratics',
        getInitialState() {
            return createInitialStage9State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage9State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's9-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s9-wrap { display: grid; gap: 1.2rem; }
                    .s9-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s9-card h2, .s9-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s9-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s9-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s9-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s9-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s9-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s9-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s9-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s9-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s9-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s9-btn:hover { background: #fbbf24; }
                    .s9-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s9-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s9-btn.active, .s9-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s9-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s9-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s9-level.s9-locked { opacity: 0.52; position: relative; }
                    .s9-level.s9-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s9-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* SVG Plot Styles */
                    .s9-svg-container { display: flex; justify-content: center; margin: 0.6rem 0; }
                    .s9-plot-svg { width: 220px; height: 220px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; background: rgba(15, 23, 42, 0.8); cursor: crosshair; }
                    .s9-grid-line { stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
                    .s9-axis { stroke: rgba(255, 255, 255, 0.3); stroke-width: 2; }
                    .s9-axis-text { font-size: 10px; fill: #cbd5e1; font-family: sans-serif; }
                    .s9-dot { fill: #f59e0b; stroke: #ffffff; stroke-width: 1.5; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s9-wrap">
                    <article class="s9-card s9-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your right triangle math, binomial expansions, and exponent laws.</p>
                        <div class="s9-grid">
                            <div class="s9-pane">
                                <strong>1. Pythagorean Theorem</strong>
                                <p>A right triangle has legs of length 3 cm and 4 cm. What is the length of the hypotenuse?</p>
                                <div class="s9-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q1 === '5' ? 'active' : ''}" data-diag="q1" data-value="5">5 cm (c = sqrt(9 + 16) = 5)</button>
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q1 === '7' ? 'active' : ''}" data-diag="q1" data-value="7">7 cm</button>
                                </div>
                            </div>
                            <div class="s9-pane">
                                <strong>2. Binomial Expansion (FOIL)</strong>
                                <p>Expand the expression (x + 3)(x - 2):</p>
                                <div class="s9-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q2 === 'correct' ? 'active' : ''}" data-diag="q2" data-value="correct">x^2 + x - 6</button>
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q2 === 'incorrect' ? 'active' : ''}" data-diag="q2" data-value="incorrect">x^2 - 5x + 6</button>
                                </div>
                            </div>
                            <div class="s9-pane">
                                <strong>3. Exponent Laws</strong>
                                <p>Simplify the expression (x^5 * x^-2) / x^2:</p>
                                <div class="s9-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q3 === 'x' ? 'active' : ''}" data-diag="q3" data-value="x">x (which is x^1)</button>
                                    <button class="s9-btn ghost ${state.diagnosticAnswers.q3 === 'x5' ? 'active' : ''}" data-diag="q3" data-value="x5">x^5</button>
                                </div>
                            </div>
                        </div>
                        <div class="s9-grid" style="margin-top:0.75rem;">
                            <button id="s9-check-diagnostic" class="s9-btn">Check Diagnostic</button>
                        </div>
                        <div id="s9-diagnostic-feedback" class="s9-feedback">${state.diagnosticFeedback}</div>
                        <div class="s9-status">
                            <span class="s9-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s9-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s9-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s9-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s9-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s9-card s9-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Linear Systems Intersection Clicker</h2>
                        <p><strong>L9.1 Systems of Equations:</strong> Two lines are graphed below: 
                        <span style="color:#ef4444; font-weight:bold;">y = x + 1</span> and 
                        <span style="color:#3b82f6; font-weight:bold;">y = -x + 5</span>. 
                        Click directly on the intersection point where both equations share the same solution.</p>
                        
                        <div class="s9-svg-container">
                            <svg class="s9-plot-svg" id="s9-concrete-svg" viewBox="0 0 200 200">
                                <!-- Grid Lines -->
                                <line class="s9-grid-line" x1="40" y1="0" x2="40" y2="200" />
                                <line class="s9-grid-line" x1="80" y1="0" x2="80" y2="200" />
                                <line class="s9-grid-line" x1="120" y1="0" x2="120" y2="200" />
                                <line class="s9-grid-line" x1="160" y1="0" x2="160" y2="200" />
                                
                                <line class="s9-grid-line" x1="0" y1="40" x2="200" y2="40" />
                                <line class="s9-grid-line" x1="0" y1="80" x2="200" y2="80" />
                                <line class="s9-grid-line" x1="0" y1="120" x2="200" y2="120" />
                                <line class="s9-grid-line" x1="0" y1="160" x2="200" y2="160" />
                                
                                <!-- Axes (origin bottom-left 0, 5) -->
                                <line class="s9-axis" x1="0" y1="200" x2="200" y2="200" />
                                <line class="s9-axis" x1="0" y1="0" x2="0" y2="200" />
                                
                                <!-- Labels -->
                                <text class="s9-axis-text" x="5" y="195">0</text>
                                <text class="s9-axis-text" x="42" y="195">1</text>
                                <text class="s9-axis-text" x="82" y="195">2</text>
                                <text class="s9-axis-text" x="122" y="195">3</text>
                                <text class="s9-axis-text" x="162" y="195">4</text>
                                
                                <text class="s9-axis-text" x="5" y="155">1</text>
                                <text class="s9-axis-text" x="5" y="115">2</text>
                                <text class="s9-axis-text" x="5" y="75">3</text>
                                <text class="s9-axis-text" x="5" y="35">4</text>
                                
                                <!-- Line 1: y = x + 1 (x=0 => y=1, x=4 => y=5)
                                     px=0, py=200 - 1*40 = 160.
                                     px=160, py=200 - 5*40 = 0.
                                -->
                                <line x1="0" y1="160" x2="160" y2="0" stroke="#ef4444" stroke-width="2.5" />
                                
                                <!-- Line 2: y = -x + 5 (x=1 => y=4, x=5 => y=0)
                                     px=40, py=200 - 4*40 = 40.
                                     px=200, py=200.
                                -->
                                <line x1="40" y1="40" x2="200" y2="200" stroke="#3b82f6" stroke-width="2.5" />
                                
                                <!-- Plotted click point if any -->
                                ${state.clickX !== null ? `<circle class="s9-dot" cx="${state.clickX * 40}" cy="${200 - state.clickY * 40}" r="6" />` : ''}
                            </svg>
                        </div>
                        
                        <div class="s9-feedback" id="s9-concrete-feedback">
                            ${state.concreteFeedback} ${state.clickX !== null ? `Clicked: (${state.clickX}, ${state.clickY})` : ''}
                        </div>

                        <div class="s9-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s9-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s9-pill ${state.concreteMission.intersectionFound ? 'good' : 'locked'}">Click the intersection at (2, 3)</span>
                            </div>
                            <div class="s9-grid" style="gap:4px;">
                                <button id="s9-hint-concrete" class="s9-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s9-continue-pictorial" class="s9-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s9-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s9-btn ghost" title="Reinforcement" data-prompt="What is a system of linear equations and what does their intersection point represent?" ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s9-card s9-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Pythagorean Geometry Solver</h2>
                        <div class="s9-pane" style="margin-bottom:0.75rem;">
                            <p><strong>[Reinforcement] L9.3 Transversal Lines & Geometric Angles:</strong> Two parallel lines are cut by a transversal. If one interior angle is <code>65°</code>, what is the matching alternate interior angle?</p>
                            <div class="s9-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s9-transversal-input" class="s9-input" placeholder="Angle in degrees" value="${state.transversalAnswer}" ${disabled(state.pictorialUnlocked)} />
                                <button id="s9-check-transversal" class="s9-btn" ${disabled(state.pictorialUnlocked)}>Check Angle</button>
                            </div>
                            <div class="s9-feedback" id="s9-transversal-feedback">${state.transversalFeedback}</div>
                        </div>
                        <p><strong>[Required Unlock] L9.4 Right Triangle Geometry:</strong> A right triangle represents structural distances in crystals or force vectors. Solve for the hypotenuse C when Leg A = 6 and Leg B = 8.</p>
                        
                        <div class="s9-svg-container">
                            <svg class="s9-plot-svg" viewBox="0 0 200 200" style="background:#f8fafc; border:none; width:180px; height:180px;">
                                <!-- Triangle points: (40, 160) to (160, 160) to (40, 40) -->
                                <polygon points="40,160 160,160 40,40" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5" />
                                
                                <!-- Leg A (vertical): length 120 (A = 6 units) -->
                                <text x="15" y="105" font-weight="bold" fill="#0f172a">A = 6</text>
                                
                                <!-- Leg B (horizontal): length 120 (B = 8 units) -->
                                <text x="90" y="180" font-weight="bold" fill="#0f172a">B = 8</text>
                                
                                <!-- Hypotenuse C -->
                                <text x="110" y="95" font-weight="bold" fill="#d97706">C = ?</text>
                                
                                <!-- Right-angle square indicator at (40, 160) -->
                                <rect x="40" y="150" width="10" height="10" fill="none" stroke="#2563eb" stroke-width="1.5" />
                            </svg>
                        </div>
                        
                        <div class="s9-pane">
                            <p>Enter the hypotenuse C:</p>
                            <div class="s9-grid" style="grid-template-columns: 1fr auto;">
                                <input type="number" id="s9-triangle-input" class="s9-input" placeholder="e.g. 10" ${disabled(state.pictorialUnlocked)} value="${state.triangleC}">
                                <button id="s9-check-triangle" class="s9-btn" ${disabled(state.pictorialUnlocked)}>Verify</button>
                            </div>
                        </div>
                        <div class="s9-feedback" id="s9-triangle-feedback">${state.triangleFeedback}</div>

                        <div class="s9-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s9-btn ghost" title="Reinforcement" data-prompt="Walk me through using the Pythagorean theorem (a² + b² = c²) to solve for the hypotenuse when legs are 6 and 8." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s9-card s9-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Polynomial Factoring Blocks</h2>
                        <p><strong>[Required Unlock] L9.8 Factoring Quadratics:</strong> Factor the quadratic trinomial <strong>x^2 + 5x + 6</strong> into binomial blocks <strong>(x + p)(x + q)</strong>. Pick p and q from the dropdowns so their sum is 5 and product is 6.</p>
                        
                        <div class="s9-pane">
                            <div class="s9-grid" style="grid-template-columns: 1fr 1fr;">
                                <div>
                                    <label style="font-size:0.82rem; font-weight:700;">Value p:</label>
                                    <select id="s9-factor-p" class="s9-input" ${disabled(state.abstractUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="1" ${state.factorP === '1' ? 'selected' : ''}>1</option>
                                        <option value="2" ${state.factorP === '2' ? 'selected' : ''}>2</option>
                                        <option value="3" ${state.factorP === '3' ? 'selected' : ''}>3</option>
                                        <option value="4" ${state.factorP === '4' ? 'selected' : ''}>4</option>
                                        <option value="5" ${state.factorP === '5' ? 'selected' : ''}>5</option>
                                        <option value="6" ${state.factorP === '6' ? 'selected' : ''}>6</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size:0.82rem; font-weight:700;">Value q:</label>
                                    <select id="s9-factor-q" class="s9-input" ${disabled(state.abstractUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="1" ${state.factorQ === '1' ? 'selected' : ''}>1</option>
                                        <option value="2" ${state.factorQ === '2' ? 'selected' : ''}>2</option>
                                        <option value="3" ${state.factorQ === '3' ? 'selected' : ''}>3</option>
                                        <option value="4" ${state.factorQ === '4' ? 'selected' : ''}>4</option>
                                        <option value="5" ${state.factorQ === '5' ? 'selected' : ''}>5</option>
                                        <option value="6" ${state.factorQ === '6' ? 'selected' : ''}>6</option>
                                    </select>
                                </div>
                            </div>
                            <button id="s9-check-factoring" class="s9-btn" style="margin-top:0.6rem; width:100%;" ${disabled(state.abstractUnlocked)}>Factor Expression</button>
                        </div>
                        <div class="s9-feedback" id="s9-factor-feedback">${state.factorFeedback}</div>

                        <div class="s9-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s9-btn ghost" title="Reinforcement" data-prompt="How do we factor a quadratic trinomial x² + bx + c? Explain how the sum and product rules work for x² + 5x + 6." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s9-card s9-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Chemical Equilibrium & The Quadratic Formula</h2>
                        <p><strong>L9.9 Applied:</strong> In a weak acid equilibrium calculation, solving the ICE table leads to the quadratic equation:
                        <p style="font-family:monospace; font-weight:bold; font-size:1.15rem; text-align:center;">x^2 + 2x - 3 = 0</p>
                        Solve for concentration x using the Quadratic Formula:
                        x = (-b +/- sqrt(b^2 - 4ac)) / (2a). Concentrations cannot be negative. What is the physical root?</p>
                        
                        <div class="s9-grid">
                            <button id="s9-app-wrong" class="s9-btn ghost" ${disabled(state.appliedUnlocked)}>x = -3.0 M (Non-physical concentration)</button>
                            <button id="s9-app-right" class="s9-btn" ${disabled(state.appliedUnlocked)}>x = 1.0 M (Physical root)</button>
                        </div>
                        <div class="s9-feedback" id="s9-applied-feedback">${state.appliedFeedback}</div>

                        <div class="s9-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s9-btn ghost" title="Reinforcement" data-prompt="Walk me through solving the equation x² + 2x - 3 = 0 using the quadratic formula, and explain why we reject the negative root in chemical stoichiometry." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's9-check-diagnostic': {
                        id: 's9-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 9 diagnostic answers on Pythagorean theorem, binomial expansion, and exponent simplification.'
                    },
                    's9-concrete-svg': {
                        id: 's9-system-intersection',
                        level: 'concrete',
                        keys: 'clickX,clickY,concreteMission.intersectionFound',
                        prompt: 'Help me identify the intersection point of the two graphed linear equations.'
                    },
                    's9-check-transversal': {
                        id: 's9-transversal-angles',
                        level: 'pictorial',
                        keys: 'transversalAnswer',
                        prompt: 'Help me reason about alternate interior angles with parallel lines and a transversal.'
                    },
                    's9-check-triangle': {
                        id: 's9-pythagorean',
                        level: 'pictorial',
                        keys: 'triangleC',
                        prompt: 'Help me solve for the hypotenuse when legs are 6 and 8 using the Pythagorean theorem.'
                    },
                    's9-check-factoring': {
                        id: 's9-factoring',
                        level: 'abstract',
                        keys: 'factorP,factorQ',
                        prompt: 'Help me factor x squared plus 5x plus 6 into two binomials.'
                    },
                    's9-app-right': {
                        id: 's9-applied-quadratic-root',
                        level: 'applied',
                        keys: 'appliedChoice',
                        prompt: 'Help me choose the physically valid root for x squared plus 2x minus 3 equals 0.'
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
                if (state.concreteMission.intersectionFound && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.concreteFeedback = 'Concrete mission complete. Intersection is correct. Pictorial unlocked. Continue below.';
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
            host.querySelector('#s9-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === '5' &&
                                state.diagnosticAnswers.q2 === 'correct' &&
                                state.diagnosticAnswers.q3 === 'x';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered spatial geometry, FOIL expansions, and exponents. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active. Solve the Concrete Level to progress.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Intersection clicker
            const svgEl = host.querySelector('#s9-concrete-svg');
            if (svgEl) {
                svgEl.addEventListener('click', (e) => {
                    if (state.fastTrack || state.concreteUnlocked) {
                        const rect = svgEl.getBoundingClientRect();
                        const x = Math.round((e.clientX - rect.left) / (rect.width / 5));
                        const y = Math.round(5 - (e.clientY - rect.top) / (rect.height / 5));

                        const clampedX = Math.max(0, Math.min(5, x));
                        const clampedY = Math.max(0, Math.min(5, y));

                        state.clickX = clampedX;
                        state.clickY = clampedY;

                        // Intersection point: y = x+1, y = -x+5 => x+1 = -x+5 => 2x = 4 => x = 2, y = 3
                        if (clampedX === 2 && clampedY === 3) {
                            state.concreteCorrect = true;
                            state.concreteMission.intersectionFound = true;
                            state.concreteFeedback = 'Superb! You clicked the intersection point (2, 3) where both lines cross.';
                        } else {
                            state.concreteCorrect = false;
                            if (!state.concreteCompleted) {
                                state.concreteMission.intersectionFound = false;
                            }
                            state.concreteFeedback = `Clicked (${clampedX}, ${clampedY}). That is not the intersection of the two equations. Try again!`;
                        }
                        syncConcreteMission();
                        persist('Intersection clicked');
                        this.mount({ host, state, onStateChange });
                    }
                });
            }

            host.querySelector('#s9-hint-concrete')?.addEventListener('click', () => {
                if (state.concreteMission.intersectionFound) {
                    state.concreteFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Hint: Set the two equations equal: x + 1 = -x + 5, giving x = 2, then y = 3.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s9-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.concreteFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.concreteFeedback = 'Complete the Concrete mission first by selecting (2, 3).';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial Triangle Check
            host.querySelector('#s9-check-triangle').addEventListener('click', () => {
                const inputVal = parseFloat(host.querySelector('#s9-triangle-input').value);
                state.triangleC = host.querySelector('#s9-triangle-input').value;
                if (inputVal === 10) {
                    state.triangleCorrect = true;
                    state.triangleFeedback = 'Correct! C = sqrt(36 + 64) = sqrt(100) = 10. Abstract unlocked. Continue below.';
                    state.abstractUnlocked = true;
                } else {
                    state.triangleCorrect = false;
                    state.triangleFeedback = 'Incorrect. Solve using the Pythagorean equation: c = sqrt(a^2 + b^2) = sqrt(6^2 + 8^2) = sqrt(36 + 64) = 10.';
                }
                persist('Triangle checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s9-check-transversal').addEventListener('click', () => {
                const val = host.querySelector('#s9-transversal-input').value.trim();
                state.transversalAnswer = val;
                if (Number(val) === 65) {
                    state.transversalCorrect = true;
                    state.transversalFeedback = 'Correct. Alternate interior angles are congruent when lines are parallel, so the matching angle is 65 degrees.';
                } else {
                    state.transversalCorrect = false;
                    state.transversalFeedback = 'Not yet. For parallel lines, alternate interior angles are equal, so the answer stays 65 degrees.';
                }
                persist('Transversal checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Factoring Check
            host.querySelector('#s9-check-factoring').addEventListener('click', () => {
                const pVal = parseInt(host.querySelector('#s9-factor-p').value);
                const qVal = parseInt(host.querySelector('#s9-factor-q').value);
                
                state.factorP = host.querySelector('#s9-factor-p').value;
                state.factorQ = host.querySelector('#s9-factor-q').value;

                if ((pVal === 2 && qVal === 3) || (pVal === 3 && qVal === 2)) {
                    state.factorCorrect = true;
                    state.factorFeedback = 'Correct! Factored expression is (x + 2)(x + 3) which equals x^2 + 5x + 6. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true;
                } else if (!pVal || !qVal) {
                    state.factorCorrect = false;
                    state.factorFeedback = 'Please select both p and q values.';
                } else {
                    state.factorCorrect = false;
                    state.factorFeedback = `Incorrect. (x + ${pVal})(x + ${qVal}) expands to x^2 + ${pVal + qVal}x + ${pVal * qVal}. That does not match x^2 + 5x + 6. Find numbers where sum is 5 and product is 6.`;
                }
                persist('Factoring checked');
                this.mount({ host, state, onStateChange });
            });

            // Applied quadratic selection
            host.querySelector('#s9-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. While x = -3 is a mathematical root of x^2 + 2x - 3 = 0, a concentration of -3 M is physically impossible in the lab. Select the positive concentration.';
                persist('Applied weak acid choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s9-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! The positive, physically meaningful concentration root is x = 1.0 M.';
                state.appliedCorrect = true;
                persist('Applied weak acid choice correct');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const triangleInput = host.querySelector('#s9-triangle-input');
            if (triangleInput) {
                triangleInput.addEventListener('input', (e) => {
                    state.triangleC = e.target.value;
                });
            }
            const transversalInput = host.querySelector('#s9-transversal-input');
            if (transversalInput) {
                transversalInput.addEventListener('input', (e) => {
                    state.transversalAnswer = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
