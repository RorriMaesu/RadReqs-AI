const createInitialStage4State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // L4.1 Parts of a Whole
    partWholeNum: '',
    partWholeDen: '',
    partWholeCorrect: false,
    partWholeFeedback: 'Reduce 40/100 to find what fraction of the flask is filled.',

    // L4.3 Improper Fractions & Mixed Numbers
    mixedWhole: '',
    mixedNum: '',
    mixedDen: '',
    mixedCorrect: false,
    mixedFeedback: 'Convert 11/4 to a mixed number: whole number (A), numerator (B), and denominator (C).',

    // LCM common denominator reslicer (L4.4)
    lcmInput: '',
    lcmUnlocked: false,
    concreteMission: { lcmReady: false },
    concreteCompleted: false,
    concreteFeedback: 'Complete all parts of the Concrete mission first (Parts of Whole, Mixed Numbers, LCM, and Addition).',
    sumFeedback: 'LCM check: build a common denominator to add 1/3 and 1/4.',

    // L4.5 Fraction Addition & Subtraction
    addNum: '',
    addDen: '',
    addCorrect: false,
    addFeedback: 'Perform addition: 4/12 + 3/12.',

    // L4.6 Division reciprocal flip & multiplication
    divFlipped: false,
    divReciprocalNum: '',
    divReciprocalDen: '',
    divReciprocalVerified: false,
    divNum: '',
    divDen: '',
    divCorrect: false,
    divFeedback: 'Evaluate: 2/3 ÷ 4/5. Press "Flip & Multiply", verify the reciprocal of 4/5, then solve the product.',

    // GCF reduction (L4.2)
    gcfInput: '',
    gcfNum: '',
    gcfDen: '',
    gcfCorrect: false,
    gcfFeedback: 'Reduce 18/24: enter the Greatest Common Factor of 18 and 24 to divide them out.',

    // L4.7 Applied Ratios
    appliedFeedback: 'Applied level: molar ratios. If a reaction requires 2 moles of Na for every 1 mole of Cl2, what is the ratio of Na to Cl2?',
    appliedChoice: '',

    // L4.8 Proportions
    propVal: '',
    propCorrect: false,
    propFeedback: 'Dilution proportion: solve for x in 2.5 / 10 = x / 40.',

    // Direct vs inverse variation (L4.9)
    variationAnswers: { direct: '', inverse: '', joint: '' },
    variationFeedback: 'L4.9 Direct, Inverse, and Joint Variation: Solve one case of each relationship.',

    // L4.10 Mass Ratios vs Atomic Composition
    massRatioChoice: '',
    massRatioFeedback: 'L4.10 Mass Ratios: Compare H2O atom ratio to mass ratio using atomic weights.',

    // L4.11 Mole Fractions (mixture)
    heCount: 6,
    moleFractionAnswerNum: '',
    moleFractionAnswerDen: '',
    moleFractionFeedback: 'L4.11 Mole Fraction: Drag slider to adjust He particles and compute X<sub style="vertical-align: sub; font-size: 70%;">He</sub>.',
});

export function createStage4Fractions() {
    return {
        id: 'stage4',
        label: 'Fractions & Proportions',
        title: 'Stage 4: Fractions, Ratios & Proportional Reasoning',
        getInitialState() {
            return createInitialStage4State();
        },
        mount({ host, state, onStateChange }) {
            const formatChem = (formula) => formula.replace(/([A-Z][a-z]?)([\d]+)/g, '$1<sub style="vertical-align: sub; font-size: 70%;">$2</sub>');
            const defaults = createInitialStage4State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;

            const s4Mixture = getParams('s4-mixture', null);
            if (s4Mixture) {
                state.heCount = s4Mixture.molesHe;
            }

            const s4Fractions = getParams('s4-fractions', { num: 2.5, denom: 10, targetDenom: 40, answerKey: '10' });
            const s4StoichRatio = getParams('s4-stoich-ratio', { molecule: 'H2O', atomCount1: 2, atomMass1: 1.008, atomCount2: 1, atomMass2: 16.00, atomRatioKey: '2:1', massRatioKey: '1:8' });

            const optCorrect = s4StoichRatio.massRatioKey;
            const optAtom = s4StoichRatio.atomRatioKey;
            const swapRatio = (r) => r.split(':').reverse().join(':');
            const optSwapMass = swapRatio(s4StoichRatio.massRatioKey);
            const optSwapAtom = swapRatio(s4StoichRatio.atomRatioKey);

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's4-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s4-wrap { display: grid; gap: 1.2rem; }
                    .s4-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s4-card h2, .s4-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s4-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s4-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s4-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; margin-bottom: 0.6rem; }
                    .s4-pane:last-child { margin-bottom: 0; }
                    .s4-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s4-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s4-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s4-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s4-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s4-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s4-btn:hover { background: #fbbf24; }
                    .s4-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s4-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s4-btn.active { border: 1px solid #d97706; background: #f59e0b; color: #0f172a; }
                    .s4-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s4-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s4-level.s4-locked { opacity: 0.52; position: relative; }
                    .s4-level.s4-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s4-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* LCM bars */
                    .s4-bars { display: grid; gap: 0.6rem; margin-top: 0.6rem; }
                    .s4-bar { display: flex; min-height: 38px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.8); }
                    .s4-piece { flex: 1; border-right: 1px solid rgba(255, 255, 255, 0.06); background: rgba(15, 23, 42, 0.4); transition: background 0.25s ease; }
                    .s4-piece:last-child { border-right: none; }
                    .s4-piece.on { background: #3b82f6; }
                    
                    /* Reciprocal flip display */
                    .s4-flip-stage { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 0.6rem; }
                    .s4-frac-tile { border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; background: rgba(30, 41, 59, 0.5); padding: 10px; font-weight: 800; font-size: 1.2rem; text-align: center; width: 50px; color: #f8fafc; }
                    .s4-flip-card { width: 56px; height: 74px; perspective: 900px; }
                    .s4-flip-card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.55s ease; }
                    .s4-flip-card.flipped .s4-flip-card-inner { transform: rotateY(180deg); }
                    .s4-flip-face {
                        position: absolute;
                        inset: 0;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 8px;
                        background: rgba(30, 41, 59, 0.5);
                        color: #f8fafc;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        font-weight: 800;
                        font-size: 1.2rem;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }
                    .s4-flip-face.back {
                        transform: rotateY(180deg);
                        background: rgba(245, 158, 11, 0.25);
                        border-color: #fbbf24;
                        color: #fbbf24;
                    }
                    .s4-frac-divider {
                        width: 26px;
                        border-top: 1px solid rgba(255, 255, 255, 0.45);
                    }
                    .s4-flip-face.back .s4-frac-divider {
                        border-top-color: rgba(251, 191, 36, 0.9);
                    }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s4-wrap">
                    <article class="s4-card s4-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify equivalent fractions and divisions to unlock Stage 4.</p>
                        <div class="s4-grid">
                            <div class="s4-pane">
                                <strong>1. Simplify 15/20</strong>
                                <p>Reduce 15/20 to lowest terms.</p>
                                <div class="s4-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                    <button class="s4-btn ${state.diagnosticAnswers.q1 === '3/4' ? 'active' : 'ghost'}" data-diag="q1" data-value="3/4">3/4</button>
                                    <button class="s4-btn ${state.diagnosticAnswers.q1 === '5/6' ? 'active' : 'ghost'}" data-diag="q1" data-value="5/6">5/6</button>
                                    <button class="s4-btn ${state.diagnosticAnswers.q1 === '15/20' ? 'active' : 'ghost'}" data-diag="q1" data-value="15/20">15/20</button>
                                </div>
                            </div>
                            <div class="s4-pane">
                                <strong>2. Mixed Numbers</strong>
                                <p>Convert 2 1/3 to an improper fraction:</p>
                                <div class="s4-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s4-btn ${state.diagnosticAnswers.q2 === '7/3' ? 'active' : 'ghost'}" data-diag="q2" data-value="7/3">7/3</button>
                                    <button class="s4-btn ${state.diagnosticAnswers.q2 === '5/3' ? 'active' : 'ghost'}" data-diag="q2" data-value="5/3">5/3</button>
                                </div>
                            </div>
                            <div class="s4-pane">
                                <strong>3. Multiplication Cancellation</strong>
                                <p>Solve 2/5 x 5/6 with early reduction:</p>
                                <div class="s4-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s4-btn ${state.diagnosticAnswers.q3 === '1/3' ? 'active' : 'ghost'}" data-diag="q3" data-value="1/3">1/3</button>
                                    <button class="s4-btn ${state.diagnosticAnswers.q3 === '10/30' ? 'active' : 'ghost'}" data-diag="q3" data-value="10/30">10/30 (unreduced)</button>
                                </div>
                            </div>
                        </div>
                        <div class="s4-grid" style="margin-top:0.75rem;">
                            <button id="s4-check-diagnostic" class="s4-btn">Check Diagnostic</button>
                        </div>
                        <div id="s4-diagnostic-feedback" class="s4-feedback">${state.diagnosticFeedback}</div>
                        <div class="s4-status">
                            <span class="s4-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s4-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s4-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s4-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s4-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s4-card s4-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Fractions, Reduction & Common Denominators</h2>
                        
                        <!-- L4.1 Parts of a Whole -->
                        <div class="s4-pane">
                            <strong>L4.1 Parts of a Whole</strong>
                            <p>A 100 mL flask contains 40 mL of solvent. What fraction of the total flask volume is filled with solvent? Reduce to lowest terms.</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 80px;">
                                    <input id="s4-partwhole-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.partWholeNum}" ${disabled(state.concreteUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-partwhole-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.partWholeDen}" ${disabled(state.concreteUnlocked)} />
                                </div>
                                <button id="s4-check-partwhole" class="s4-btn" ${disabled(state.concreteUnlocked)}>Check</button>
                            </div>
                            <div class="s4-feedback" id="s4-partwhole-feedback">${state.partWholeFeedback}</div>
                        </div>

                        <!-- L4.2 Reduction & GCF -->
                        <div class="s4-pane">
                            <strong>L4.2 Reduction</strong>
                            <p>Reduce 18/24 using the Greatest Common Factor. GCF is the largest integer that divides both numbers evenly. Enter the GCF and the resulting simplified fraction.</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="width: 80px;">
                                    <input id="s4-gcf-input" class="s4-input" style="text-align: center;" placeholder="GCF" value="${state.gcfInput}" ${disabled(state.concreteUnlocked)} />
                                </div>
                                <div style="font-size: 1.2rem; font-weight: bold; color: rgba(255,255,255,0.4);">&rarr;</div>
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 80px;">
                                    <input id="s4-gcf-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.gcfNum}" ${disabled(state.concreteUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-gcf-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.gcfDen}" ${disabled(state.concreteUnlocked)} />
                                </div>
                                <button id="s4-check-gcf" class="s4-btn" ${disabled(state.concreteUnlocked)}>Divide & Reduce</button>
                            </div>
                            <div class="s4-feedback" id="s4-gcf-feedback">${state.gcfFeedback}</div>
                        </div>

                        <!-- L4.3 Improper Fractions & Mixed Numbers -->
                        <div class="s4-pane">
                            <strong>L4.3 Improper Fractions & Mixed Numbers</strong>
                            <p>Convert the improper fraction 11/4 to a mixed number (A B/C format):</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="width: 70px;">
                                    <input id="s4-mixed-whole" class="s4-input" style="text-align: center;" placeholder="Whole A" value="${state.mixedWhole}" ${disabled(state.concreteUnlocked)} />
                                </div>
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 70px;">
                                    <input id="s4-mixed-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num B" value="${state.mixedNum}" ${disabled(state.concreteUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-mixed-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den C" value="${state.mixedDen}" ${disabled(state.concreteUnlocked)} />
                                </div>
                                <button id="s4-check-mixed" class="s4-btn" ${disabled(state.concreteUnlocked)}>Check</button>
                            </div>
                            <div class="s4-feedback" id="s4-mixed-feedback">${state.mixedFeedback}</div>
                        </div>

                        <!-- L4.4 LCM Common Denominators -->
                        <div class="s4-pane">
                            <strong>L4.4 LCM Common Denominators</strong>
                            <p>The bars below start as 1/3 and 1/4. Find the Least Common Multiple (LCM) to reslice them into equivalent parts so they can be combined.</p>
                            <div class="s4-bars">
                                <div>
                                    <div class="s4-bar" id="s4-bar-third"></div>
                                    <p style="font-size:0.82rem; color:#cbd5e1; margin-top:2px;">Fraction A: 1/3 ${state.lcmUnlocked ? '= 4/12' : '(needs common denominators)'}</p>
                                </div>
                                <div>
                                    <div class="s4-bar" id="s4-bar-fourth"></div>
                                    <p style="font-size:0.82rem; color:#cbd5e1; margin-top:2px;">Fraction B: 1/4 ${state.lcmUnlocked ? '= 3/12' : '(needs common denominators)'}</p>
                                </div>
                            </div>
                            <div class="s4-grid" style="margin-top:0.6rem; grid-template-columns: 1fr auto; gap: 6px;">
                                <input id="s4-lcm-input" class="s4-input" placeholder="LCM of 3 and 4" value="${state.lcmInput}" ${disabled(state.concreteUnlocked)} />
                                <button id="s4-check-lcm" class="s4-btn" ${disabled(state.concreteUnlocked)}>Reslice Bars</button>
                            </div>
                            <div class="s4-feedback" id="s4-lcm-feedback">${state.sumFeedback}</div>
                        </div>

                        <!-- L4.5 Fraction Addition -->
                        <div class="s4-pane">
                            <strong>L4.5 Fraction Addition</strong>
                            <p>Now perform the addition: 1/3 + 1/4 = 4/12 + 3/12 = [numerator] / [denominator]</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 80px;">
                                    <input id="s4-add-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.addNum}" ${disabled(state.concreteUnlocked && state.lcmUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-add-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.addDen}" ${disabled(state.concreteUnlocked && state.lcmUnlocked)} />
                                </div>
                                <button id="s4-check-add" class="s4-btn" ${disabled(state.concreteUnlocked && state.lcmUnlocked)}>Check Sum</button>
                            </div>
                            <div class="s4-feedback" id="s4-add-feedback">${state.addFeedback}</div>
                        </div>

                        <!-- Concrete Mission Panel -->
                        <div class="s4-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s4-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s4-pill ${state.partWholeCorrect ? 'good' : 'locked'}">Parts of Whole</span>
                                <span class="s4-pill ${state.gcfCorrect ? 'good' : 'locked'}">GCF Reduction</span>
                                <span class="s4-pill ${state.mixedCorrect ? 'good' : 'locked'}">Mixed Numbers</span>
                                <span class="s4-pill ${state.lcmUnlocked ? 'good' : 'locked'}">LCM Denominators</span>
                                <span class="s4-pill ${state.addCorrect ? 'good' : 'locked'}">Fraction Addition</span>
                            </div>
                            <div class="s4-grid" style="gap:4px;">
                                <button id="s4-hint-concrete" class="s4-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s4-continue-pictorial" class="s4-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                            <div class="s4-feedback" id="s4-concrete-feedback">${state.concreteFeedback}</div>
                        </div>

                        <div class="s4-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s4-btn ghost" title="Reinforcement" data-prompt="Why does adding fractions with unlike denominators require finding an LCM first?" ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s4-card s4-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Reciprocal Division Flipper</h2>
                        <p><strong>L4.6 Fraction Division & Multiplication:</strong> Division by a fraction is multiplying by its reciprocal. Observe the reciprocal swap of the divisor, then evaluate the product.</p>
                        <div class="s4-pane">
                            <div class="s4-flip-stage">
                                <div class="s4-frac-tile">2<div style="border-top:1px solid rgba(255, 255, 255, 0.4);"></div>3</div>
                                <div id="s4-sign-display" style="font-size:1.3rem;">${state.divFlipped ? '&times;' : '&divide;'}</div>
                                <div id="s4-second-tile" class="s4-flip-card ${state.divFlipped ? 'flipped' : ''}" aria-live="polite" aria-label="Divisor flip card">
                                    <div class="s4-flip-card-inner">
                                        <div class="s4-flip-face front">
                                            <span>4</span>
                                            <span class="s4-frac-divider" aria-hidden="true"></span>
                                            <span>5</span>
                                        </div>
                                        <div class="s4-flip-face back">
                                            <span>5</span>
                                            <span class="s4-frac-divider" aria-hidden="true"></span>
                                            <span>4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="s4-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button id="s4-flip-btn" class="s4-btn" ${disabled(state.pictorialUnlocked)}>Flip & Multiply</button>
                                <button id="s4-reset-flip" class="s4-btn ghost" ${disabled(state.pictorialUnlocked)}>Reset Card</button>
                            </div>
                        </div>

                        ${state.divFlipped ? `
                        <div class="s4-pane">
                            <strong>Step A: Verify reciprocal conversion</strong>
                            <p>The divisor is 4/5. Enter its reciprocal below before solving the product.</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 80px;">
                                    <input id="s4-div-recip-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.divReciprocalNum}" ${disabled(state.pictorialUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-div-recip-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.divReciprocalDen}" ${disabled(state.pictorialUnlocked)} />
                                </div>
                                <button id="s4-check-reciprocal" class="s4-btn" ${disabled(state.pictorialUnlocked)}>Verify Reciprocal</button>
                            </div>
                        </div>
                        ` : ''}

                        ${state.divFlipped && state.divReciprocalVerified ? `
                        <div class="s4-pane">
                            <strong>Step B: Evaluate reciprocal multiplication product</strong>
                            <p>Solve: 2/3 &times; 5/4 = [numerator] / [denominator]</p>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 0.6rem;">
                                <div style="display: inline-flex; flex-direction: column; align-items: center; width: 80px;">
                                    <input id="s4-div-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.divNum}" ${disabled(state.pictorialUnlocked)} />
                                    <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                    <input id="s4-div-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.divDen}" ${disabled(state.pictorialUnlocked)} />
                                </div>
                                <button id="s4-check-div-mult" class="s4-btn" ${disabled(state.pictorialUnlocked)}>Check Product</button>
                            </div>
                        </div>
                        ` : ''}

                        <div class="s4-feedback" id="s4-div-feedback">${state.divFeedback}</div>

                        <div class="s4-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s4-btn ghost" title="Reinforcement" data-prompt="Explain why we multiply by the reciprocal when dividing fractions. What is the physical concept?" ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s4-card s4-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Ratios, Proportions & Variation</h2>
                        
                        <!-- L4.7 Applied Ratios -->
                        <div class="s4-pane">
                            <strong>L4.7 Applied Ratios</strong>
                            <p>In a balanced equation <code>2Na + Cl2 &rarr; 2NaCl</code>, the reaction requires 2 sodium atoms for every 1 chlorine molecule. This is a 2:1 ratio. If you have 6 moles of Na, how many moles of Cl2 are needed to react completely?</p>
                            <div class="s4-grid">
                                <button id="s4-app-wrong" class="s4-btn ${state.appliedChoice === 'wrong' ? 'active' : 'ghost'}" ${disabled(state.abstractUnlocked)}>6 moles of Cl2 because ratios are 1:1</button>
                                <button id="s4-app-right" class="s4-btn ${state.appliedChoice === 'right' ? 'active' : 'ghost'}" ${disabled(state.abstractUnlocked)}>3 moles of Cl2 because Na to Cl2 scale is 2 to 1 (6 / 2 = 3)</button>
                            </div>
                            <div class="s4-feedback" id="s4-applied-feedback">${state.appliedFeedback}</div>
                        </div>

                        <!-- L4.8 Proportions -->
                        <div class="s4-pane">
                            <strong>L4.8 Proportions</strong>
                            <p>Solve the proportion: 
                            <br/>Solve for <code>x</code>: <code>${s4Fractions.num} / ${s4Fractions.denom} = x / ${s4Fractions.targetDenom}</code></p>
                            <div class="s4-grid" style="grid-template-columns: 1fr auto; gap: 6px;">
                                <input id="s4-prop-val" class="s4-input" placeholder="Value of x" value="${state.propVal}" data-tutor-question-id="s4-fractions" ${disabled(state.abstractUnlocked)} />
                                <button id="s4-check-prop" class="s4-btn" data-tutor-question-id="s4-fractions" ${disabled(state.abstractUnlocked)}>Check Proportion</button>
                            </div>
                            <div class="s4-feedback" id="s4-prop-feedback">${state.propFeedback}</div>
                        </div>

                        <!-- L4.9 Direct vs. Inverse Variation -->
                        <div class="s4-pane">
                            <strong>L4.9 Direct, Inverse, and Joint Variation</strong>
                            <p>Direct case: <code>y = kx</code> with <code>k = 4</code> and <code>x = 3</code>. <br/>
                            Inverse case: <code>y = k/x</code> with <code>k = 24</code> and <code>x = 6</code>. <br/>
                            Joint case: <code>y = kxz</code> with <code>k = 2</code>, <code>x = 3</code>, <code>z = 4</code>.</p>
                            <div class="s4-grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                                <input id="s4-var-direct" class="s4-input" placeholder="Direct y" value="${state.variationAnswers.direct}" ${disabled(state.abstractUnlocked)} />
                                <input id="s4-var-inverse" class="s4-input" placeholder="Inverse y" value="${state.variationAnswers.inverse}" ${disabled(state.abstractUnlocked)} />
                                <input id="s4-var-joint" class="s4-input" placeholder="Joint y" value="${state.variationAnswers.joint}" ${disabled(state.abstractUnlocked)} />
                            </div>
                            <button id="s4-check-variation" class="s4-btn" style="margin-top:8px; width:100%;" ${disabled(state.abstractUnlocked)}>Check Variation</button>
                            <div class="s4-feedback" id="s4-variation-feedback">${state.variationFeedback}</div>
                        </div>

                        <!-- Abstract Mission Panel -->
                        <div class="s4-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Abstract Mission</h3>
                            <div class="s4-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s4-pill ${state.appliedChoice === 'right' ? 'good' : 'locked'}">Molar Ratios</span>
                                <span class="s4-pill ${state.propCorrect ? 'good' : 'locked'}">Proportions</span>
                                <span class="s4-pill ${(Number(state.variationAnswers.direct) === 12 && Number(state.variationAnswers.inverse) === 4 && Number(state.variationAnswers.joint) === 24) ? 'good' : 'locked'}">Variation</span>
                            </div>
                            <div class="s4-grid" style="gap:4px;">
                                <button id="s4-continue-applied" class="s4-btn" ${(state.fastTrack || state.appliedUnlocked) ? '' : 'disabled'} ${disabled(state.abstractUnlocked)}>Continue to Applied</button>
                            </div>
                            <div class="s4-feedback" id="s4-abstract-feedback">${(state.fastTrack || state.appliedUnlocked) ? 'Abstract mission complete. Applied unlocked. Continue below.' : 'Complete all parts of the Abstract mission (Ratios, Proportions, and Variation).'}</div>
                        </div>

                        <div class="s4-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s4-btn ghost" title="Reinforcement" data-prompt="Explain how chemical stoichiometric molar ratios represent scaling proportions." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s4-card s4-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Chemical Ratios & Mixtures</h2>
                        
                        <!-- L4.10 Mass Ratios vs. Atomic Composition -->
                        <div class="s4-pane">
                            <strong>L4.10 Mass Ratios vs. Atomic Composition</strong>
                            <p>${formatChem(s4StoichRatio.molecule)} has an atomic composition ratio of <strong>${s4StoichRatio.atomRatioKey}</strong>. Given the atomic masses of element 1 (${s4StoichRatio.atomMass1} g/mol) and element 2 (${s4StoichRatio.atomMass2} g/mol), calculate the simplified mass ratio of element 1 to element 2 in ${formatChem(s4StoichRatio.molecule)}.</p>
                            <div class="s4-grid" style="grid-template-columns: 1fr 1fr; gap:6px;">
                                <button class="s4-btn ghost ${state.massRatioChoice === optAtom ? 'active' : ''} s4-ratio-btn" data-value="${optAtom}" data-tutor-question-id="s4-stoich-ratio" ${disabled(state.appliedUnlocked)}>${optAtom} (same as atom ratio)</button>
                                <button class="s4-btn ghost ${state.massRatioChoice === optCorrect ? 'active' : ''} s4-ratio-btn" data-value="${optCorrect}" data-tutor-question-id="s4-stoich-ratio" ${disabled(state.appliedUnlocked)}>${optCorrect} (by mass)</button>
                                <button class="s4-btn ghost ${state.massRatioChoice === optSwapMass ? 'active' : ''} s4-ratio-btn" data-value="${optSwapMass}" data-tutor-question-id="s4-stoich-ratio" ${disabled(state.appliedUnlocked)}>${optSwapMass} (inverse mass ratio)</button>
                                <button class="s4-btn ghost ${state.massRatioChoice === optSwapAtom ? 'active' : ''} s4-ratio-btn" data-value="${optSwapAtom}" data-tutor-question-id="s4-stoich-ratio" ${disabled(state.appliedUnlocked)}>${optSwapAtom} (inverse atom ratio)</button>
                            </div>
                            <div class="s4-feedback" id="s4-mass-ratio-feedback">${state.massRatioFeedback}</div>
                        </div>

                        <!-- L4.11 Mole Fractions in Mixtures -->
                        <div class="s4-pane" style="margin-top:0.75rem;">
                            <strong>L4.11 Mole Fractions in Mixtures</strong>
                            <p>Mole fraction (X<sub style="vertical-align: sub; font-size: 70%;">He</sub>) is the ratio of Helium moles to total moles:</p>
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 0.6rem 0; font-size: 1.15rem; font-weight: 700; color: #38bdf8;">
                                <span>X<sub style="vertical-align: sub; font-size: 70%;">He</sub> =</span>
                                <div style="display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle;">
                                    <span style="border-bottom: 1.5px solid rgba(255, 255, 255, 0.45); padding: 0 6px; padding-bottom: 2px;">n<sub style="vertical-align: sub; font-size: 70%;">He</sub></span>
                                    <span style="padding: 0 6px; padding-top: 2px;">n<sub style="vertical-align: sub; font-size: 70%;">He</sub> + n<sub style="vertical-align: sub; font-size: 70%;">Ne</sub></span>
                                </div>
                            </div>
                            <p>Adjust the Helium moles with the slider/number box, then enter the simplified mole fraction of Helium.</p>
                            <div class="s4-grid" style="grid-template-columns: 1fr 2fr; gap:12px; align-items:center;">
                                <div style="background:#0f172a; height:120px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); position:relative; overflow:hidden; display:flex; flex-wrap:wrap; padding:8px;">
                                    ${Array.from({ length: s4Mixture ? s4Mixture.molesHe : state.heCount }, () => '<div style="width:16px; height:16px; background:#38bdf8; border-radius:50%; margin:4px; box-shadow:0 0 6px #38bdf8;" title="Helium"></div>').join('')}
                                    ${Array.from({ length: s4Mixture ? s4Mixture.molesNe : 10 - state.heCount }, () => '<div style="width:16px; height:16px; background:#f87171; border-radius:50%; margin:4px; box-shadow:0 0 6px #f87171;" title="Neon"></div>').join('')}
                                </div>
                                <div>
                                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 8px;">
                                        <span class="s4-pill" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.9rem; padding: 0.3rem 0.8rem; font-weight: 500;">
                                            n<sub style="vertical-align: sub; font-size: 70%;">He</sub> = <strong style="font-weight: 800;">${s4Mixture ? s4Mixture.molesHe : state.heCount} mol</strong>
                                        </span>
                                        <span class="s4-pill" style="background: rgba(248, 113, 113, 0.15); border-color: rgba(248, 113, 113, 0.3); color: #f87171; font-size: 0.9rem; padding: 0.3rem 0.8rem; font-weight: 500;">
                                            n<sub style="vertical-align: sub; font-size: 70%;">Ne</sub> = <strong style="font-weight: 800;">${s4Mixture ? s4Mixture.molesNe : 10 - state.heCount} mol</strong>
                                        </span>
                                    </div>
                                    <div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                                        <input type="range" id="s4-he-slider" min="1" max="9" value="${state.heCount}" style="flex:1;" ${disabled(state.appliedUnlocked) || (s4Mixture ? 'disabled' : '')} />
                                        <input type="number" id="s4-he-num" min="1" max="9" value="${state.heCount}" class="s4-input" style="width:60px; padding:0.25rem;" ${disabled(state.appliedUnlocked) || (s4Mixture ? 'disabled' : '')} />
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                                        <div style="display: inline-flex; align-items: center; gap: 6px;">
                                            <span style="font-weight: 700; color: #38bdf8;">X<sub style="vertical-align: sub; font-size: 70%;">He</sub> =</span>
                                            <div style="display: inline-flex; flex-direction: column; align-items: center; width: 70px;">
                                                <input id="s4-xhe-num" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Num" value="${state.moleFractionAnswerNum || ''}" data-tutor-question-id="s4-mixture" ${disabled(state.appliedUnlocked)} />
                                                <div style="width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.45); margin: 4px 0;"></div>
                                                <input id="s4-xhe-den" class="s4-input" style="text-align: center; padding: 4px;" placeholder="Den" value="${state.moleFractionAnswerDen || ''}" data-tutor-question-id="s4-mixture" ${disabled(state.appliedUnlocked)} />
                                            </div>
                                        </div>
                                        <button id="s4-check-xhe" class="s4-btn" data-tutor-question-id="s4-mixture" ${disabled(state.appliedUnlocked)}>Verify Fraction</button>
                                    </div>
                                </div>
                            </div>
                            <div class="s4-feedback" id="s4-xhe-feedback">${state.moleFractionFeedback}</div>
                        </div>

                        <div class="s4-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s4-btn ghost" title="Reinforcement" data-prompt="Explain how chemical stoichiometric molar ratios represent scaling proportions." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's4-check-diagnostic': {
                        id: 's4-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 4 diagnostic answers on simplification, improper fractions, and cancellation.'
                    },
                    's4-check-partwhole': {
                        id: 's4-part-whole',
                        level: 'concrete',
                        keys: 'partWholeNum,partWholeDen',
                        prompt: 'Help me reduce 40/100 into lowest terms for the filled-flask fraction.'
                    },
                    's4-check-gcf': {
                        id: 's4-gcf-reduction',
                        level: 'concrete',
                        keys: 'gcfInput,gcfNum,gcfDen',
                        prompt: 'Help me use the greatest common factor to reduce 18/24 correctly.'
                    },
                    's4-check-mixed': {
                        id: 's4-mixed-number',
                        level: 'concrete',
                        keys: 'mixedWhole,mixedNum,mixedDen',
                        prompt: 'Help me convert 11/4 into the correct mixed-number form A B/C.'
                    },
                    's4-check-lcm': {
                        id: 's4-lcm-bars',
                        level: 'concrete',
                        keys: 'lcmInput,lcmUnlocked',
                        prompt: 'Help me find the least common multiple of 3 and 4 so I can reslice both fraction bars.'
                    },
                    's4-check-add': {
                        id: 's4-fraction-addition',
                        level: 'concrete',
                        keys: 'addNum,addDen,lcmUnlocked',
                        prompt: 'Help me add 1/3 and 1/4 after converting both to twelfths.'
                    },
                    's4-flip-btn': {
                        id: 's4-reciprocal-flip',
                        level: 'pictorial',
                        keys: 'divFlipped,divReciprocalNum,divReciprocalDen,divReciprocalVerified',
                        prompt: 'Help me understand why dividing by a fraction becomes multiplying by its reciprocal.'
                    },
                    's4-check-reciprocal': {
                        id: 's4-reciprocal-verify',
                        level: 'pictorial',
                        keys: 'divFlipped,divReciprocalNum,divReciprocalDen,divReciprocalVerified',
                        prompt: 'Help me verify that I flipped the divisor 4/5 to its reciprocal correctly before multiplying.'
                    },
                    's4-check-div-mult': {
                        id: 's4-divide-fractions',
                        level: 'pictorial',
                        keys: 'divFlipped,divReciprocalVerified,divNum,divDen',
                        prompt: 'Help me evaluate 2/3 divided by 4/5 after flipping to reciprocal multiplication.'
                    },
                    's4-app-right': {
                        id: 's4-applied-ratio',
                        level: 'abstract',
                        keys: 'appliedChoice',
                        prompt: 'Help me reason through the Na to Cl2 stoichiometric ratio in the applied scenario.'
                    },
                    's4-check-prop': {
                        id: 's4-proportion',
                        level: 'abstract',
                        keys: 'propVal',
                        prompt: 'Help me solve the dilution proportion 2.5/10 = x/40.'
                    },
                    's4-check-variation': {
                        id: 's4-variation',
                        level: 'abstract',
                        keys: 'variationAnswers.direct,variationAnswers.inverse,variationAnswers.joint',
                        prompt: 'Help me solve the direct, inverse, and joint variation mini-set.'
                    },
                    's4-check-xhe': {
                        id: 's4-mixture',
                        level: 'applied',
                        keys: 'moleFractionAnswerNum,moleFractionAnswerDen',
                        prompt: 'Help me calculate the mole fraction of Helium in the mixture.'
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
                if (state.partWholeCorrect && state.gcfCorrect && state.mixedCorrect && state.lcmUnlocked && state.addCorrect) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                } else {
                    state.concreteCompleted = false;
                    state.pictorialUnlocked = false;
                }
            };

            const syncAbstractMission = () => {
                if (state.fastTrack) return;
                const variationCorrect = (Number(state.variationAnswers.direct) === 12 &&
                                         Number(state.variationAnswers.inverse) === 4 &&
                                         Number(state.variationAnswers.joint) === 24);
                if (state.appliedChoice === 'right' && state.propCorrect && variationCorrect) {
                    state.appliedUnlocked = true;
                } else {
                    state.appliedUnlocked = false;
                }
            };

            const renderBar = (el, denominator, active, forcedTwelfths) => {
                el.innerHTML = '';
                const pieces = forcedTwelfths ? 12 : denominator;
                const onCount = forcedTwelfths ? active : 1;
                for (let i = 0; i < pieces; i++) {
                    const piece = document.createElement('div');
                    piece.className = `s4-piece ${i < onCount ? 'on' : ''}`;
                    el.appendChild(piece);
                }
            };

            const renderLCMBars = () => {
                const thirdEl = host.querySelector('#s4-bar-third');
                const fourthEl = host.querySelector('#s4-bar-fourth');
                if (!thirdEl || !fourthEl) return;
                renderBar(thirdEl, 3, 4, state.lcmUnlocked);
                renderBar(fourthEl, 4, 3, state.lcmUnlocked);
            };

            renderLCMBars();

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic choice toggling
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s4-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === '3/4' &&
                                state.diagnosticAnswers.q2 === '7/3' &&
                                state.diagnosticAnswers.q3 === '1/3';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered fraction operations, GCFs, and molar ratio scaling. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.1 Parts of a Whole
            host.querySelector('#s4-check-partwhole').addEventListener('click', () => {
                const num = host.querySelector('#s4-partwhole-num').value.trim();
                const den = host.querySelector('#s4-partwhole-den').value.trim();
                state.partWholeNum = num;
                state.partWholeDen = den;
                if (num === '2' && den === '5') {
                    state.partWholeCorrect = true;
                    const missing = [];
                    if (!state.gcfCorrect) missing.push('GCF Reduction');
                    if (!state.mixedCorrect) missing.push('Mixed Numbers');
                    if (!state.lcmUnlocked) missing.push('LCM');
                    if (!state.addCorrect) missing.push('Fraction Addition');
                    state.partWholeFeedback = 'Correct! 40/100 reduces to 2/5. 2/5 of the beaker is filled.' + 
                        (missing.length > 0 ? ` (Remaining concrete tasks: ${missing.join(', ')})` : ' All Concrete tasks complete! Pictorial unlocked.');
                } else {
                    state.partWholeCorrect = false;
                    state.partWholeFeedback = 'Incorrect. Simplify 40/100 by dividing both the numerator and denominator by their greatest common factor (20).';
                }
                syncConcreteMission();
                persist('Parts of whole checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.2 Concrete GCF
            host.querySelector('#s4-check-gcf').addEventListener('click', () => {
                const val = host.querySelector('#s4-gcf-input').value.trim();
                const num = host.querySelector('#s4-gcf-num').value.trim();
                const den = host.querySelector('#s4-gcf-den').value.trim();
                state.gcfInput = val;
                state.gcfNum = num;
                state.gcfDen = den;
                
                if (val === '6' && num === '3' && den === '4') {
                    state.gcfCorrect = true;
                    const missing = [];
                    if (!state.partWholeCorrect) missing.push('Parts of Whole');
                    if (!state.mixedCorrect) missing.push('Mixed Numbers');
                    if (!state.lcmUnlocked) missing.push('LCM');
                    if (!state.addCorrect) missing.push('Fraction Addition');
                    state.gcfFeedback = 'Correct! GCF is 6. Dividing numerator and denominator by 6 gives: (18 / 6) / (24 / 6) = 3/4.' +
                        (missing.length > 0 ? ` (Remaining concrete tasks: ${missing.join(', ')})` : ' All Concrete tasks complete! Pictorial unlocked.');
                } else {
                    state.gcfCorrect = false;
                    if (val !== '6') {
                        state.gcfFeedback = 'Incorrect GCF. The greatest factor shared by 18 and 24 is 6.';
                    } else {
                        state.gcfFeedback = 'Incorrect reduction. Dividing 18 and 24 by GCF (6) should yield the simplified fraction.';
                    }
                }
                syncConcreteMission();
                persist('GCF checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.3 Mixed Numbers & Improper Fractions
            host.querySelector('#s4-check-mixed').addEventListener('click', () => {
                const whole = host.querySelector('#s4-mixed-whole').value.trim();
                const num = host.querySelector('#s4-mixed-num').value.trim();
                const den = host.querySelector('#s4-mixed-den').value.trim();
                state.mixedWhole = whole;
                state.mixedNum = num;
                state.mixedDen = den;
                if (whole === '2' && num === '3' && den === '4') {
                    state.mixedCorrect = true;
                    const missing = [];
                    if (!state.partWholeCorrect) missing.push('Parts of Whole');
                    if (!state.gcfCorrect) missing.push('GCF Reduction');
                    if (!state.lcmUnlocked) missing.push('LCM');
                    if (!state.addCorrect) missing.push('Fraction Addition');
                    state.mixedFeedback = 'Correct! 11/4 represents 2 3/4.' + 
                        (missing.length > 0 ? ` (Remaining concrete tasks: ${missing.join(', ')})` : ' All Concrete tasks complete! Pictorial unlocked.');
                } else {
                    state.mixedCorrect = false;
                    state.mixedFeedback = 'Incorrect. Divide 11 by 4: the quotient is the whole number, the remainder is the numerator, and the divisor is the denominator.';
                }
                syncConcreteMission();
                persist('Mixed numbers checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.4 Concrete LCM
            host.querySelector('#s4-check-lcm').addEventListener('click', () => {
                const val = host.querySelector('#s4-lcm-input').value.trim();
                state.lcmInput = val;
                if (val === '12') {
                    state.lcmUnlocked = true;
                    state.concreteMission.lcmReady = true;
                    const missing = [];
                    if (!state.partWholeCorrect) missing.push('Parts of Whole');
                    if (!state.gcfCorrect) missing.push('GCF Reduction');
                    if (!state.mixedCorrect) missing.push('Mixed Numbers');
                    if (!state.addCorrect) missing.push('Fraction Addition');
                    state.sumFeedback = 'Correct! The LCM is 12. Both bars are sliced into twelfths. Perform addition below.' + 
                        (missing.length > 0 ? ` (Remaining concrete tasks: ${missing.join(', ')})` : ' All Concrete tasks complete! Pictorial unlocked.');
                } else {
                    state.lcmUnlocked = false;
                    if (!state.concreteCompleted) {
                        state.concreteMission.lcmReady = false;
                    }
                    state.sumFeedback = 'Incorrect. Find the smallest number that both 3 and 4 divide into evenly (Hint: 12).';
                }
                syncConcreteMission();
                renderLCMBars();
                persist('LCM checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.5 Fraction Addition
            const s4CheckAdd = host.querySelector('#s4-check-add');
            if (s4CheckAdd) {
                s4CheckAdd.addEventListener('click', () => {
                    const num = host.querySelector('#s4-add-num').value.trim();
                    const den = host.querySelector('#s4-add-den').value.trim();
                    state.addNum = num;
                    state.addDen = den;
                    if (num === '7' && den === '12') {
                        state.addCorrect = true;
                        const missing = [];
                        if (!state.partWholeCorrect) missing.push('Parts of Whole');
                        if (!state.gcfCorrect) missing.push('GCF Reduction');
                        if (!state.mixedCorrect) missing.push('Mixed Numbers');
                        if (!state.lcmUnlocked) missing.push('LCM');
                        state.addFeedback = 'Correct! 4/12 + 3/12 = 7/12.' + 
                            (missing.length > 0 ? ` (Remaining concrete tasks: ${missing.join(', ')})` : ' All Concrete tasks complete! Pictorial unlocked.');
                    } else {
                        state.addCorrect = false;
                        state.addFeedback = 'Incorrect. Sum the numerators (4 + 3) and keep the common denominator (12).';
                    }
                    syncConcreteMission();
                    persist('Addition checked');
                    this.mount({ host, state, onStateChange });
                });
            }

            host.querySelector('#s4-hint-concrete')?.addEventListener('click', () => {
                let hints = [];
                if (!state.partWholeCorrect) hints.push('Parts of Whole: Divide 40 and 100 by 20 to get 2/5.');
                if (!state.gcfCorrect) hints.push('GCF Reduction: GCF of 18 and 24 is 6, giving 3/4.');
                if (!state.mixedCorrect) hints.push('Mixed Numbers: 11 / 4 = 2 with a remainder of 3, so 2 3/4.');
                if (!state.lcmUnlocked) hints.push('LCM: The least common multiple of 3 and 4 is 12.');
                if (state.lcmUnlocked && !state.addCorrect) hints.push('Addition: Add the numerators of 4/12 and 3/12 to get 7/12.');
                
                if (hints.length > 0) {
                    state.concreteFeedback = 'Hints:<br/>' + hints.join('<br/>');
                } else {
                    state.concreteFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s4-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.concreteFeedback = 'Pictorial unlocked. Continue below.';
                    persist('Continue to pictorial clicked');
                    this.mount({ host, state, onStateChange });
                    host.querySelectorAll('.s4-level')[1]?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    state.concreteFeedback = 'Complete all parts of the Concrete mission first (Parts of Whole, GCF Reduction, Mixed Numbers, LCM, and Addition).';
                    persist('Continue to pictorial clicked');
                    this.mount({ host, state, onStateChange });
                }
            });

            // Pictorial Flipper & Multiplication (L4.6)
            host.querySelector('#s4-flip-btn').addEventListener('click', () => {
                state.divFlipped = true;
                state.divCorrect = false;
                state.divFeedback = 'Card flipped. Step A: verify the reciprocal of 4/5. Then Step B: solve 2/3 × 5/4.';
                persist('Card flipped');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s4-reset-flip').addEventListener('click', () => {
                state.divFlipped = false;
                state.divReciprocalNum = '';
                state.divReciprocalDen = '';
                state.divReciprocalVerified = false;
                state.divNum = '';
                state.divDen = '';
                state.divCorrect = false;
                state.divFeedback = 'Evaluate: 2/3 ÷ 4/5. Press "Flip & Multiply", verify the reciprocal of 4/5, then solve the product.';
                persist('Card reset');
                this.mount({ host, state, onStateChange });
            });

            const s4CheckReciprocal = host.querySelector('#s4-check-reciprocal');
            if (s4CheckReciprocal) {
                s4CheckReciprocal.addEventListener('click', () => {
                    const reciprocalNum = host.querySelector('#s4-div-recip-num').value.trim();
                    const reciprocalDen = host.querySelector('#s4-div-recip-den').value.trim();
                    state.divReciprocalNum = reciprocalNum;
                    state.divReciprocalDen = reciprocalDen;

                    if (!state.divFlipped) {
                        state.divReciprocalVerified = false;
                        state.divFeedback = 'Flip the divisor card first so the operation changes from division to multiplication.';
                    } else if (reciprocalNum === '5' && reciprocalDen === '4') {
                        state.divReciprocalVerified = true;
                        state.divFeedback = 'Reciprocal verified: 4/5 flipped to 5/4. Now solve Step B: 2/3 × 5/4.';
                    } else {
                        state.divReciprocalVerified = false;
                        state.divFeedback = 'Not yet. The reciprocal of 4/5 is 5/4 (swap numerator and denominator).';
                    }

                    persist('Reciprocal checked');
                    this.mount({ host, state, onStateChange });
                });
            }

            const s4CheckDivMult = host.querySelector('#s4-check-div-mult');
            if (s4CheckDivMult) {
                s4CheckDivMult.addEventListener('click', () => {
                    if (!state.divReciprocalVerified) {
                        state.divCorrect = false;
                        state.divFeedback = 'Complete Step A first: verify that 4/5 flips to 5/4 before checking the product.';
                        persist('Division multiplication blocked');
                        this.mount({ host, state, onStateChange });
                        return;
                    }

                    const num = host.querySelector('#s4-div-num').value.trim();
                    const den = host.querySelector('#s4-div-den').value.trim();
                    state.divNum = num;
                    state.divDen = den;
                    
                    const numVal = Number(num);
                    const denVal = Number(den);
                    if (numVal > 0 && denVal > 0 && (numVal * 6 === denVal * 5)) {
                        state.divCorrect = true;
                        state.divFeedback = 'Correct! 2/3 &times; 5/4 = 10/12, which simplifies to 5/6. Abstract unlocked. Continue below.';
                        state.abstractUnlocked = true;
                    } else {
                        state.divCorrect = false;
                        state.abstractUnlocked = false;
                        state.divFeedback = 'Incorrect. Multiply the numerators (2 &times; 5 = 10) and denominators (3 &times; 4 = 12). Reduce to lowest terms.';
                    }
                    persist('Division multiplication checked');
                    this.mount({ host, state, onStateChange });
                    if (state.divCorrect) {
                        host.querySelectorAll('.s4-level')[2]?.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }

            // Applied Molar Ratio (L4.7)
            host.querySelector('#s4-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. Since Na to Cl2 reacts in a 2 to 1 proportion, you need half as much Cl2 as you have Na (6 / 2 = 3).';
                syncAbstractMission();
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s4-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! Since Na:Cl2 is 2:1, 6 moles of Na react with 3 moles of Cl2.';
                syncAbstractMission();
                persist('Applied choice correct');
                this.mount({ host, state, onStateChange });
            });

            // L4.8 Proportions
            host.querySelector('#s4-check-prop').addEventListener('click', () => {
                const val = host.querySelector('#s4-prop-val').value.trim();
                state.propVal = val;
                const expected = String(s4Fractions.answerKey);
                if (val === expected) {
                    state.propCorrect = true;
                    state.propFeedback = `Correct! Solve: x = (${s4Fractions.num} &times; ${s4Fractions.targetDenom}) / ${s4Fractions.denom} = ${expected}.`;
                } else {
                    state.propCorrect = false;
                    state.propFeedback = `Incorrect. Cross-multiply and solve: ${s4Fractions.denom} &times; x = ${s4Fractions.num} &times; ${s4Fractions.targetDenom}.`;
                }
                syncAbstractMission();
                persist('Proportions checked');
                this.mount({ host, state, onStateChange });
            });

            // L4.9 Direct, Inverse, Joint Variation
            host.querySelector('#s4-check-variation').addEventListener('click', () => {
                const direct = host.querySelector('#s4-var-direct').value.trim();
                const inverse = host.querySelector('#s4-var-inverse').value.trim();
                const joint = host.querySelector('#s4-var-joint').value.trim();
                state.variationAnswers = { direct, inverse, joint };

                const directVal = Number(direct);
                const inverseVal = Number(inverse);
                const jointVal = Number(joint);
                if (directVal === 12 && inverseVal === 4 && jointVal === 24) {
                    state.variationFeedback = 'Correct. Direct: y = 4 &times; 3 = 12. Inverse: y = 24 / 6 = 4. Joint: y = 2 &times; 3 &times; 4 = 24.';
                } else {
                    state.variationFeedback = 'Not yet. Direct: 4 &times; 3 = 12. Inverse: 24 / 6 = 4. Joint: 2 &times; 3 &times; 4 = 24.';
                }

                syncAbstractMission();
                persist('Variation checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s4-continue-applied')?.addEventListener('click', () => {
                if (state.fastTrack || state.appliedUnlocked) {
                    persist('Continue to applied clicked');
                    this.mount({ host, state, onStateChange });
                    host.querySelectorAll('.s4-level')[3]?.scrollIntoView({ behavior: 'smooth' });
                }
            });

            // L4.10 Mass Ratios
            host.querySelectorAll('.s4-ratio-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-value');
                    state.massRatioChoice = val;
                    if (val === optCorrect) {
                        state.massRatioFeedback = `Correct! The simplified mass ratio in ${formatChem(s4StoichRatio.molecule)} is ${optCorrect}, which is very different from the atom ratio of ${optAtom}.`;
                    } else if (val === optAtom) {
                        state.massRatioFeedback = `Incorrect. This is the atom composition ratio (${optAtom}). Since atoms have different masses, the mass ratio is different.`;
                    } else {
                        state.massRatioFeedback = `Incorrect. Try calculating the mass of each element and simplifying the ratio.`;
                    }
                    persist('Mass ratio chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            // L4.11 Mole Fraction
            const handleHeChange = (val) => {
                const num = parseInt(val);
                if (num >= 1 && num <= 9) {
                    state.heCount = num;
                    state.moleFractionFeedback = `Mixture updated: ${num} moles of He, ${10 - num} moles of Ne. Total is 10 moles. Calculate X<sub style="vertical-align: sub; font-size: 70%;">He</sub> as a simplified fraction.`;
                    persist('Helium count changed');
                    this.mount({ host, state, onStateChange });
                }
            };

            host.querySelector('#s4-he-slider')?.addEventListener('input', (e) => handleHeChange(e.target.value));
            host.querySelector('#s4-he-num')?.addEventListener('change', (e) => handleHeChange(e.target.value));

            host.querySelector('#s4-check-xhe')?.addEventListener('click', () => {
                const numVal = parseInt(host.querySelector('#s4-xhe-num').value.trim());
                const denVal = parseInt(host.querySelector('#s4-xhe-den').value.trim());
                state.moleFractionAnswerNum = numVal;
                state.moleFractionAnswerDen = denVal;
                
                const gcd = (a, b) => b ? gcd(b, a % b) : a;
                const total = s4Mixture ? (s4Mixture.molesHe + s4Mixture.molesNe) : 10;
                const heVal = s4Mixture ? s4Mixture.molesHe : state.heCount;
                const d = gcd(heVal, total);
                const expNum = heVal / d;
                const expDen = total / d;
                
                if (numVal === expNum && denVal === expDen) {
                    state.moleFractionFeedback = `Correct! X<sub style="vertical-align: sub; font-size: 70%;">He</sub> = n<sub style="vertical-align: sub; font-size: 70%;">He</sub> / n<sub style="vertical-align: sub; font-size: 70%;">total</sub> = ${heVal} / ${total} = ${expNum}/${expDen}.`;
                } else {
                    state.moleFractionFeedback = `Incorrect. Total moles = ${total}. n<sub style="vertical-align: sub; font-size: 70%;">He</sub> = ${heVal}. Divide ${heVal} by ${total} and reduce to lowest terms.`;
                }
                persist('Mole fraction checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const bindInputSync = (id, stateKey, subKey) => {
                const el = host.querySelector(id);
                if (el) {
                    el.addEventListener('input', (e) => {
                        if (subKey) {
                            state[stateKey][subKey] = e.target.value;
                        } else {
                            state[stateKey] = e.target.value;
                        }
                    });
                }
            };

            bindInputSync('#s4-partwhole-num', 'partWholeNum');
            bindInputSync('#s4-partwhole-den', 'partWholeDen');
            bindInputSync('#s4-gcf-input', 'gcfInput');
            bindInputSync('#s4-gcf-num', 'gcfNum');
            bindInputSync('#s4-gcf-den', 'gcfDen');
            bindInputSync('#s4-mixed-whole', 'mixedWhole');
            bindInputSync('#s4-mixed-num', 'mixedNum');
            bindInputSync('#s4-mixed-den', 'mixedDen');
            bindInputSync('#s4-lcm-input', 'lcmInput');
            bindInputSync('#s4-add-num', 'addNum');
            bindInputSync('#s4-add-den', 'addDen');
            bindInputSync('#s4-div-num', 'divNum');
            bindInputSync('#s4-div-den', 'divDen');
            bindInputSync('#s4-prop-val', 'propVal');
            bindInputSync('#s4-var-direct', 'variationAnswers', 'direct');
            bindInputSync('#s4-var-inverse', 'variationAnswers', 'inverse');
            bindInputSync('#s4-var-joint', 'variationAnswers', 'joint');
            bindInputSync('#s4-xhe-num', 'moleFractionAnswerNum');
            bindInputSync('#s4-xhe-den', 'moleFractionAnswerDen');
        },
        unmount() {}
    };
}
