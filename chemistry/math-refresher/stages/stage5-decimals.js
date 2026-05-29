const createInitialStage5State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,
    precisionUnlocked: false,

    // L5.1 Place Value
    placeValueAnswer: '',
    placeValueCorrect: false,
    placeValueFeedback: 'Identify the digit in the hundredths place of 142.589.',

    // Decimal alignment snap-grid (L5.2)
    rowA: ['', '1', '2', '4', '.', ''],
    rowB: ['', '', '0', '.', '5', '6'],
    concreteMission: { alignedDecimals: false },
    concreteCompleted: false,
    decimalFeedback: 'Align both numbers so the decimal points sit in the same vertical column before computing.',

    // Decimal hopping (L5.3)
    hopPosition: 0,
    hopFeedback: '3.2 x 0.45 = 1440 without decimals. Move the decimal marker between digits to create 1.44.',

    // L5.4 Percentages Shading
    percentShadedBlocks: 0,
    percentShadedCorrect: false,
    percentShadedFeedback: 'Use the slider to shade exactly 35% of the 20-block grid.',

    // L5.5 Percent Equations
    percentEqAnswer: '',
    percentEqCorrect: false,
    percentEqFeedback: 'Solve: 15% of 80 = x.',

    // Absolute vs relative change & Percent Error (L5.6)
    changeAnswers: { absolute: '', relative: '' },
    changeFeedback: 'L5.6b Relative Risk: From 2% to 4% means +2 percentage points and +100% relative increase.',

    // Sig Figs classification (L5.7)
    sigfigAnswers: { leading: '', trapped: '', trailing: '' },
    sigfigFeedback: 'Classify zeros in 0.05080: leading zeros (before 5), trapped zeros (between 5 and 8), and trailing zeros.',
    
    // Total sig figs properties (L5.7)
    sigfigsTotalAnswer: '',
    sigfigsTotalFeedback: 'Identify the total number of significant figures.',
    sigfigsTotalCorrect: false,

    // L5.8 multi-step sig figs
    multiStepAnswer1: '',
    multiStepAnswer2: '',
    multiStepFeedback: 'L5.8: Solve (14.28 - 11.2) × 1.503 step-by-step. Subtract first, then multiply.',

    // L5.9 Exact vs Inexact numbers
    exactConstAnswer: '',
    exactConstCorrect: false,
    exactConstFeedback: 'Exact numbers have infinite significant figures. True or False: Multiplying by the exact constant 2 does not limit the significant figures of the final result.',

    appliedFeedback: 'Applied level: percent error calculation. A lab reaction should yield 10.0g but only yielded 9.0g. Compute the percent error.',
    appliedChoice: ''
});

export function createStage5Decimals() {
    return {
        id: 'stage5',
        label: 'Decimals & Precision',
        title: 'Stage 5: Decimals, Percentages & Precision Mechanics',
        getInitialState() {
            return createInitialStage5State();
        },
        mount({ host, state, onStateChange }) {
            if (this._stage5Handlers?.host) {
                this._stage5Handlers.host.removeEventListener('click', this._stage5Handlers.onClick);
                this._stage5Handlers.host.removeEventListener('input', this._stage5Handlers.onInput);
                this._stage5Handlers.host.removeEventListener('change', this._stage5Handlers.onChange);
            }

            const defaults = createInitialStage5State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;

            const s5SigFigs = getParams('s5-sigfigs', { value: '0.00340', answerKey: '3' });
            const s5MultiStep = getParams('s5-multistep', { a: 14.28, b: 11.2, c: 1.503, intermediate: '3.1', answerKey: '4.7' });

            const normalizeHopPosition = () => {
                const normalized = Number(state.hopPosition);
                if (!Number.isFinite(normalized)) {
                    state.hopPosition = 0;
                    return;
                }
                state.hopPosition = Math.min(3, Math.max(0, Math.round(normalized)));
            };

            normalizeHopPosition();

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's5-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s5-wrap { display: grid; gap: 1.2rem; }
                    .s5-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s5-card h2, .s5-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s5-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s5-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s5-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; margin-bottom: 0.6rem; }
                    .s5-pane:last-child { margin-bottom: 0; }
                    .s5-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s5-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s5-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s5-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s5-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s5-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s5-btn:hover { background: #fbbf24; }
                    .s5-btn.active { background: #f8fafc; border-color: #38bdf8; color: #0f172a; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25); }
                    .s5-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s5-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s5-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s5-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s5-level.s5-locked { opacity: 0.52; position: relative; }
                    .s5-level.s5-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s5-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Gridboard */
                    .s5-gridboard { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 0.6rem; background: rgba(15, 23, 42, 0.5); }
                    .s5-row { display: grid; grid-template-columns: repeat(6, 44px); gap: 0.3rem; margin-bottom: 0.4rem; justify-content: center; }
                    .s5-slot { width: 44px; height: 44px; border: 2px dashed rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(15, 23, 42, 0.3); display: flex; align-items: center; justify-content: center; }
                    .s5-slot.decimal { border-color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
                    .s5-cardchip { width: 36px; height: 36px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(30, 41, 59, 0.7); color: #f8fafc; font-weight: 800; cursor: pointer; }
                    
                    /* Hopping */
                    .s5-hop-row { margin-top: 0.5rem; display: grid; gap: 0.5rem; justify-items: center; }
                    .s5-hop-track { display: flex; align-items: center; gap: 0.2rem; padding: 0.45rem 0.55rem; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; background: rgba(15, 23, 42, 0.35); }
                    .s5-hop-digit { width: 44px; height: 44px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(30, 41, 59, 0.72); color: #f8fafc; font-weight: 800; font-size: 1.06rem; }
                    .s5-hop-gap { width: 16px; height: 44px; border-radius: 7px; position: relative; display: flex; align-items: center; justify-content: center; background: rgba(148, 163, 184, 0.12); }
                    .s5-hop-gap::before { content: ''; width: 4px; height: 24px; border-radius: 999px; background: rgba(148, 163, 184, 0.35); }
                    .s5-hop-gap.active { background: rgba(56, 189, 248, 0.16); box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.45); }
                    .s5-hop-gap.active::before { display: none; }
                    .s5-hop-dot { width: 10px; height: 10px; border-radius: 999px; background: #38bdf8; box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.2); }
                    .s5-hop-readout { font-size: 0.88rem; color: #cbd5e1; }
                    .s5-hop-readout strong { color: #f8fafc; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s5-wrap">
                    <article class="s5-card s5-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Verify your precision literacy and percent error computations.</p>
                        <div class="s5-grid">
                            <div class="s5-pane">
                                <strong>1. Sig Figs Count</strong>
                                <p>How many significant figures are in 0.004050?</p>
                                <div class="s5-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q1 === '4' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q1 === '4' ? 'active' : ''}" data-diag="q1" data-value="4">4</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q1 === '6' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q1 === '6' ? 'active' : ''}" data-diag="q1" data-value="6">6</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q1 === '3' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q1 === '3' ? 'active' : ''}" data-diag="q1" data-value="3">3</button>
                                </div>
                            </div>
                            <div class="s5-pane">
                                <strong>2. Decimal to Fraction</strong>
                                <p>Convert 0.025 to a fraction:</p>
                                <div class="s5-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q2 === '1/40' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q2 === '1/40' ? 'active' : ''}" data-diag="q2" data-value="1/40">1/40</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q2 === '1/25' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q2 === '1/25' ? 'active' : ''}" data-diag="q2" data-value="1/25">1/25</button>
                                </div>
                            </div>
                            <div class="s5-pane">
                                <strong>3. Laboratory Deviation</strong>
                                <p>Yield: 9.0g (experimental) vs 10.0g (theoretical). Percent error:</p>
                                <div class="s5-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q3 === '10%' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q3 === '10%' ? 'active' : ''}" data-diag="q3" data-value="10%">10%</button>
                                    <button type="button" aria-pressed="${state.diagnosticAnswers.q3 === '1%' ? 'true' : 'false'}" class="s5-btn ghost ${state.diagnosticAnswers.q3 === '1%' ? 'active' : ''}" data-diag="q3" data-value="1%">1%</button>
                                </div>
                            </div>
                        </div>
                        <div class="s5-grid" style="margin-top:0.75rem;">
                            <button type="button" id="s5-check-diagnostic" class="s5-btn">Check Diagnostic</button>
                        </div>
                        <div id="s5-diagnostic-feedback" class="s5-feedback">${state.diagnosticFeedback}</div>
                        <div class="s5-status">
                            <span class="s5-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s5-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s5-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s5-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s5-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s5-pill ${state.precisionUnlocked ? 'good' : 'locked'}">Precision ${state.precisionUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s5-card s5-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Place Value & Vertical Alignment</h2>
                        
                        <!-- L5.1 Decimal Place Value -->
                        <div class="s5-pane">
                            <strong>L5.1 Decimal Place Value</strong>
                            <p>Identify the digit in the <strong>hundredths</strong> place of the number <code>142.589</code>.</p>
                            <div class="s5-grid" style="grid-template-columns: 1fr auto; gap: 6px;">
                                <input id="s5-placevalue-input" class="s5-input" placeholder="Enter single digit (e.g. 8)" value="${state.placeValueAnswer || ''}" ${disabled(state.concreteUnlocked)} />
                                <button id="s5-check-placevalue" class="s5-btn" ${disabled(state.concreteUnlocked)}>Check Place</button>
                            </div>
                            <div class="s5-feedback" id="s5-placevalue-feedback">${state.placeValueFeedback}</div>
                        </div>

                        <!-- L5.2 Decimals Grid Alignment -->
                        <div class="s5-pane">
                            <strong>L5.2 Decimal Addition & Subtraction</strong>
                            <p>Click digits in rows below to cycle them until the decimal points align vertically. Zeros can fill the empty slots.</p>
                            <div class="s5-gridboard">
                                <div class="s5-row" id="s5-row-a"></div>
                                <div class="s5-row" id="s5-row-b"></div>
                                <div class="s5-grid" style="margin-top:0.6rem; gap: 4px;">
                                    <button id="s5-check-align" class="s5-btn" ${disabled(state.concreteUnlocked)}>Check Alignment</button>
                                    <button id="s5-reset-align" class="s5-btn ghost" ${disabled(state.concreteUnlocked)}>Reset Grid</button>
                                </div>
                            </div>
                            <div class="s5-feedback" id="s5-decimal-feedback">${state.decimalFeedback}</div>
                        </div>

                        <!-- Concrete Mission Panel -->
                        <div class="s5-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s5-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s5-pill ${state.placeValueCorrect ? 'good' : 'locked'}">L5.1 Place Value</span>
                                <span class="s5-pill ${state.concreteMission.alignedDecimals ? 'good' : 'locked'}">L5.2 Decimals Alignment</span>
                            </div>
                            <div class="s5-grid" style="gap:4px;">
                                <button id="s5-hint-concrete" class="s5-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                <button id="s5-continue-pictorial" class="s5-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s5-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s5-btn ghost" title="Reinforcement" data-prompt="Why is vertical alignment of decimal points crucial before performing addition or subtraction?" ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s5-card s5-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Decimal Hopping & Shading</h2>
                        
                        <!-- L5.3 Decimal Hopping -->
                        <div class="s5-pane">
                            <strong>L5.3 Decimal Multiplication & Division (Hopping)</strong>
                            <p>The product of 3.2 x 0.45 has 3 decimal places total. Hop the decimal point into 144 to represent 1.44.</p>
                            <div class="s5-hop-row" id="s5-hop-row"></div>
                            <div class="s5-hop-readout" id="s5-hop-readout"></div>
                            <div class="s5-grid" style="margin-top:0.6rem; gap: 4px;">
                                <button type="button" id="s5-hop-left" class="s5-btn ghost" ${disabled(state.pictorialUnlocked)}>Hop Left</button>
                                <button type="button" id="s5-hop-right" class="s5-btn ghost" ${disabled(state.pictorialUnlocked)}>Hop Right</button>
                                <button type="button" id="s5-check-hop" class="s5-btn" ${disabled(state.pictorialUnlocked)}>Verify Position</button>
                            </div>
                            <div class="s5-feedback" id="s5-hop-feedback">${state.hopFeedback}</div>
                        </div>

                        <!-- L5.4 Percentages Visual Grid -->
                        <div class="s5-pane">
                            <strong>L5.4 Percentages</strong>
                            <p>Shade exactly <strong>35%</strong> of the 20-block grid below. Use the slider to adjust the shading, then verify.</p>
                            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 0.6rem 0; padding: 0.4rem; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06);">
                                ${Array.from({ length: 20 }, (_, idx) => `<div style="width: 18px; height: 18px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.15); background: ${idx < state.percentShadedBlocks ? '#f59e0b' : 'transparent'}; transition: background 0.15s ease;"></div>`).join('')}
                            </div>
                            <div class="s5-grid" style="grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;">
                                <input type="range" id="s5-percent-slider" min="0" max="20" value="${state.percentShadedBlocks}" ${disabled(state.pictorialUnlocked)} />
                                <span style="font-weight: 700; min-width: 90px; text-align: right;">${state.percentShadedBlocks} / 20 blocks (${Math.round((state.percentShadedBlocks / 20) * 100)}%)</span>
                                <button id="s5-check-percent-shaded" class="s5-btn" ${disabled(state.pictorialUnlocked)}>Check Shading</button>
                            </div>
                            <div class="s5-feedback" id="s5-percent-shaded-feedback">${state.percentShadedFeedback}</div>
                        </div>

                        <!-- Pictorial Mission Panel -->
                        <div class="s5-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Pictorial Mission</h3>
                            <div class="s5-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s5-pill ${(state.hopPosition === 1) ? 'good' : 'locked'}">L5.3 Decimal Hopping</span>
                                <span class="s5-pill ${state.percentShadedCorrect ? 'good' : 'locked'}">L5.4 Percentages Grid</span>
                            </div>
                            <div class="s5-grid" style="gap:4px;">
                                <button id="s5-continue-abstract" class="s5-btn" ${(state.fastTrack || state.abstractUnlocked) ? '' : 'disabled'} ${disabled(state.pictorialUnlocked)}>Continue to Abstract</button>
                            </div>
                            <div class="s5-feedback" id="s5-pictorial-feedback">${(state.fastTrack || state.abstractUnlocked) ? 'Pictorial mission complete. Abstract unlocked. Continue below.' : 'Complete all parts of the Pictorial mission (Decimal Hopping and Percentages).'}</div>
                        </div>

                        <div class="s5-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s5-btn ghost" title="Reinforcement" data-prompt="Explain decimal hopping conceptually. Why do the decimal places of two factors add up to determine the product's decimal places?" ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s5-card s5-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Percent Equations</h2>
                        
                        <!-- L5.5 Percent Equations -->
                        <div class="s5-pane">
                            <strong>L5.5 Percent Equations</strong>
                            <p>Solve the percent equation: What is <strong>15% of 80</strong>?</p>
                            <div class="s5-grid" style="grid-template-columns: 1fr auto; gap: 6px;">
                                <input id="s5-perceq-input" class="s5-input" placeholder="Enter value (e.g. 12)" value="${state.percentEqAnswer || ''}" ${disabled(state.abstractUnlocked)} />
                                <button id="s5-check-perceq" class="s5-btn" ${disabled(state.abstractUnlocked)}>Check Equation</button>
                            </div>
                            <div class="s5-feedback" id="s5-perceq-feedback">${state.percentEqFeedback}</div>
                        </div>

                        <!-- Abstract Mission Panel -->
                        <div class="s5-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Abstract Mission</h3>
                            <div class="s5-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s5-pill ${state.percentEqCorrect ? 'good' : 'locked'}">L5.5 Percent Equations</span>
                            </div>
                            <div class="s5-grid" style="gap:4px;">
                                <button id="s5-continue-applied" class="s5-btn" ${(state.fastTrack || state.appliedUnlocked) ? '' : 'disabled'} ${disabled(state.abstractUnlocked)}>Continue to Applied</button>
                            </div>
                            <div class="s5-feedback" id="s5-abstract-feedback">${(state.fastTrack || state.appliedUnlocked) ? 'Abstract mission complete. Applied unlocked. Continue below.' : 'Complete the Abstract mission (Percent Equations).'}</div>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s5-card s5-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Lab Percent Error & Relative Changes</h2>
                        
                        <!-- L5.6a Percent Error -->
                        <div class="s5-pane">
                            <strong>L5.6a Percent Error</strong>
                            <p>A student measures a sample mass of 9.0 g. The true reference standard weight is 10.0 g. What is the calculated percent error of this lab trial?</p>
                            <div class="s5-grid">
                                <button id="s5-app-wrong" class="s5-btn ghost" ${disabled(state.appliedUnlocked)}>1.0% error</button>
                                <button id="s5-app-right" class="s5-btn" ${disabled(state.appliedUnlocked)}>10.0% error because |9.0 - 10.0| / 10.0 = 0.1, and 0.1 × 100% = 10%</button>
                            </div>
                            <div class="s5-feedback" id="s5-applied-feedback">${state.appliedFeedback}</div>
                        </div>

                        <!-- L5.6b Absolute vs Relative Change -->
                        <div class="s5-pane">
                            <strong>L5.6b Absolute vs Relative Change</strong>
                            <p>A concentration/risk level goes from <code>2%</code> to <code>4%</code>. Enter (1) absolute change in percentage points and (2) relative percent increase.</p>
                            <div class="s5-grid" style="grid-template-columns: 1fr 1fr; gap: 6px;">
                                <input id="s5-change-absolute" class="s5-input" placeholder="Absolute points (e.g. 2)" value="${state.changeAnswers.absolute}" ${disabled(state.appliedUnlocked)} />
                                <input id="s5-change-relative" class="s5-input" placeholder="Relative % increase (e.g. 100)" value="${state.changeAnswers.relative}" ${disabled(state.appliedUnlocked)} />
                            </div>
                            <button id="s5-check-change" class="s5-btn" style="margin-top:8px; width:100%;" ${disabled(state.appliedUnlocked)}>Check Change Types</button>
                            <div class="s5-feedback" id="s5-change-feedback">${state.changeFeedback}</div>
                        </div>

                        <!-- Applied Mission Panel -->
                        <div class="s5-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Applied Mission</h3>
                            <div class="s5-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s5-pill ${state.appliedChoice === 'right' ? 'good' : 'locked'}">L5.6a Percent Error</span>
                                <span class="s5-pill ${(Number(state.changeAnswers.absolute.replace('%','')) === 2 && Number(state.changeAnswers.relative.replace('%','')) === 100) ? 'good' : 'locked'}">L5.6b Relative Risk</span>
                            </div>
                            <div class="s5-grid" style="gap:4px;">
                                <button id="s5-continue-precision" class="s5-btn" ${(state.fastTrack || state.precisionUnlocked) ? '' : 'disabled'} ${disabled(state.appliedUnlocked)}>Continue to Precision</button>
                            </div>
                            <div class="s5-feedback" id="s5-applied-mission-feedback">${(state.fastTrack || state.precisionUnlocked) ? 'Applied mission complete. Precision unlocked. Continue below.' : 'Complete the Applied mission (Percent Error and Absolute vs. Relative Change).'}</div>
                        </div>

                        <div class="s5-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s5-btn ghost" title="Reinforcement" data-prompt="Show me step-by-step how to compute percent error using absolute difference divided by theoretical reference." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PRECISION LEVEL -->
                    <article class="s5-card s5-level ${levelLocked(state.precisionUnlocked)}">
                        <h2>Precision Level: Significant Figures & Rounding</h2>
                        
                        <!-- L5.7a Zero Classification -->
                        <div class="s5-pane">
                            <strong>L5.7a Significant Figures Classification (Zeros)</strong>
                            <p>Classify the zeros in 0.05080 to count significant figures. (Select: significant or not_significant).</p>
                            <div class="s5-grid">
                                <div class="s5-pane">
                                    <strong>Leading Zeros (0.0...)</strong>
                                    <select id="s5-sig-leading" class="s5-input" ${disabled(state.precisionUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="not" ${state.sigfigAnswers.leading === 'not' ? 'selected' : ''}>Not Significant (Placeholders)</option>
                                        <option value="sig" ${state.sigfigAnswers.leading === 'sig' ? 'selected' : ''}>Significant (Measured)</option>
                                    </select>
                                </div>
                                <div class="s5-pane">
                                    <strong>Trapped Zero (...0...)</strong>
                                    <select id="s5-sig-trapped" class="s5-input" ${disabled(state.precisionUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="not" ${state.sigfigAnswers.trapped === 'not' ? 'selected' : ''}>Not Significant</option>
                                        <option value="sig" ${state.sigfigAnswers.trapped === 'sig' ? 'selected' : ''}>Significant (Between non-zeros)</option>
                                    </select>
                                </div>
                                <div class="s5-pane">
                                    <strong>Trailing Zero (...0)</strong>
                                    <select id="s5-sig-trailing" class="s5-input" ${disabled(state.precisionUnlocked)}>
                                        <option value="">Choose...</option>
                                        <option value="not" ${state.sigfigAnswers.trailing === 'not' ? 'selected' : ''}>Not Significant</option>
                                        <option value="sig" ${state.sigfigAnswers.trailing === 'sig' ? 'selected' : ''}>Significant (Decimal present)</option>
                                    </select>
                                </div>
                            </div>
                            <button id="s5-check-sigfigs" class="s5-btn" style="margin-top:8px; width:100%;" ${disabled(state.precisionUnlocked)}>Verify Zero Rules</button>
                            <div class="s5-feedback" id="s5-sigfig-feedback">${state.sigfigFeedback}</div>
                        </div>

                        <!-- L5.7b Significant Figures Count -->
                        <div class="s5-pane">
                            <strong>L5.7b Significant Figures Count</strong>
                            <p>How many significant figures are in the value <strong>${s5SigFigs.value}</strong>?</p>
                            <div style="display:flex; gap:6px; margin-bottom: 0.6rem;">
                                <input type="text" id="s5-sigfigs-input" class="s5-input" placeholder="Count (e.g. 3)" value="${state.sigfigsTotalAnswer || ''}" data-tutor-question-id="s5-sigfigs" ${disabled(state.precisionUnlocked)} />
                                <button id="s5-check-sigfigs-total" class="s5-btn" data-tutor-question-id="s5-sigfigs" ${disabled(state.precisionUnlocked)}>Verify Count</button>
                            </div>
                            <div class="s5-feedback" id="s5-sigfigs-total-feedback">${state.sigfigsTotalFeedback}</div>
                        </div>

                        <!-- L5.8 Multi-step sig figs -->
                        <div class="s5-pane">
                            <strong>L5.8 Sig Figs in Multi-Step Equations (s5-multistep)</strong>
                            <p>Solve: <strong>(${s5MultiStep.a} − ${s5MultiStep.b}) &times; ${s5MultiStep.c}</strong> adhering to significant figure rules at each step.</p>
                            <div class="s5-grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div>
                                    <label class="s5-label">Step 1: Intermediate subtraction (${s5MultiStep.a} − ${s5MultiStep.b}) rounded to correct decimal place:</label>
                                    <input id="s5-multistep-1" class="s5-input" placeholder="e.g. 3.1" value="${state.multiStepAnswer1 || ''}" data-tutor-question-id="s5-multistep" ${disabled(state.precisionUnlocked)} />
                                </div>
                                <div>
                                    <label class="s5-label">Step 2: Final product rounded to correct sig figs:</label>
                                    <input id="s5-multistep-2" class="s5-input" placeholder="e.g. 4.7" value="${state.multiStepAnswer2 || ''}" data-tutor-question-id="s5-multistep" ${disabled(state.precisionUnlocked)} />
                                </div>
                            </div>
                            <button id="s5-check-multistep" class="s5-btn" style="margin-top:8px; width:100%;" data-tutor-question-id="s5-multistep" ${disabled(state.precisionUnlocked)}>Check Calculation</button>
                            <div class="s5-feedback" id="s5-multistep-feedback">${state.multiStepFeedback}</div>
                        </div>

                        <!-- L5.9 Exact vs. Inexact Numbers -->
                        <div class="s5-pane">
                            <strong>L5.9 Exact vs. Inexact Numbers</strong>
                            <p>Suppose you multiply the result of the calculation in L5.8 by the exact constant <code>2</code>. Since exact numbers have infinite significant figures, does multiplying by 2 limit or change the number of significant figures in the final result?</p>
                            <div class="s5-grid" style="grid-template-columns: 1fr 1fr; gap: 6px;">
                                <button id="s5-exact-true" class="s5-btn ${state.exactConstAnswer === 'true' ? 'active' : 'ghost'}" ${disabled(state.precisionUnlocked)}>True (It does NOT limit sig figs)</button>
                                <button id="s5-exact-false" class="s5-btn ${state.exactConstAnswer === 'false' ? 'active' : 'ghost'}" ${disabled(state.precisionUnlocked)}>False (It limits sig figs to 1)</button>
                            </div>
                            <div class="s5-feedback" id="s5-exact-feedback">${state.exactConstFeedback}</div>
                        </div>

                        <!-- Precision Mission Panel -->
                        <div class="s5-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Precision Mission</h3>
                            <div class="s5-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s5-pill ${(state.sigfigAnswers.leading === 'not' && state.sigfigAnswers.trapped === 'sig' && state.sigfigAnswers.trailing === 'sig') ? 'good' : 'locked'}">L5.7a Zero Rules</span>
                                <span class="s5-pill ${state.sigfigsTotalCorrect ? 'good' : 'locked'}">L5.7b Total Sig Figs</span>
                                <span class="s5-pill ${(state.multiStepAnswer1 === String(s5MultiStep.intermediate) && state.multiStepAnswer2 === String(s5MultiStep.answerKey)) ? 'good' : 'locked'}">L5.8 Multi-Step</span>
                                <span class="s5-pill ${state.exactConstCorrect ? 'good' : 'locked'}">L5.9 Exact Constants</span>
                            </div>
                            <div class="s5-feedback" id="s5-precision-mission-feedback">${(state.exactConstCorrect && state.sigfigsTotalCorrect && state.sigfigAnswers.leading === 'not' && state.sigfigAnswers.trapped === 'sig' && state.sigfigAnswers.trailing === 'sig' && state.multiStepAnswer1 === String(s5MultiStep.intermediate) && state.multiStepAnswer2 === String(s5MultiStep.answerKey)) ? 'Precision mission complete. You have mastered Stage 5 Decimals & Precision!' : 'Complete the Precision mission (Zero Rules, Total Sig Figs, Multi-Step calculation, and Exact Constants check).'}</div>
                        </div>

                        <div class="s5-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s5-btn ghost" title="Reinforcement" data-prompt="Explain the trailing zero rule in significant figures: why does a written decimal point change its significance?" ${disabled(state.precisionUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const annotateTutorQuestions = () => {
                const specs = {
                    's5-check-diagnostic': {
                        id: 's5-diagnostic',
                        level: 'diagnostic',
                        keys: 'diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3',
                        prompt: 'Help me review my Stage 5 diagnostic answers about sig figs, decimals as fractions, and percent error.'
                    },
                    's5-check-placevalue': {
                        id: 's5-place-value',
                        level: 'concrete',
                        keys: 'placeValueAnswer',
                        prompt: 'Help me identify the correct place value digit in the decimal place value lesson.'
                    },
                    's5-check-align': {
                        id: 's5-decimal-alignment',
                        level: 'concrete',
                        keys: 'rowA,rowB,concreteMission.alignedDecimals',
                        prompt: 'Help me align both decimals in the same vertical column before arithmetic.'
                    },
                    's5-check-hop': {
                        id: 's5-decimal-hopping',
                        level: 'pictorial',
                        keys: 'hopPosition',
                        prompt: 'Help me place the decimal point correctly in the product 1.44 from 3.2 times 0.45.'
                    },
                    's5-check-percent-shaded': {
                        id: 's5-percentages',
                        level: 'pictorial',
                        keys: 'percentShadedBlocks',
                        prompt: 'Help me understand how to visually represent 35% of a 20-block grid.'
                    },
                    's5-check-perceq': {
                        id: 's5-percent-equations',
                        level: 'abstract',
                        keys: 'percentEqAnswer',
                        prompt: 'Help me solve the percent equation to find 15% of 80.'
                    },
                    's5-check-sigfigs': {
                        id: 's5-sigfigs',
                        level: 'precision',
                        keys: 'sigfigAnswers.leading,sigfigAnswers.trapped,sigfigAnswers.trailing',
                        prompt: 'Help me classify leading, trapped, and trailing zeros in 0.05080.'
                    },
                    's5-check-sigfigs-total': {
                        id: 's5-sigfigs-total',
                        level: 'precision',
                        keys: 'sigfigsTotalAnswer',
                        prompt: 'Help me count the total number of significant figures in the given decimal.'
                    },
                    's5-check-multistep': {
                        id: 's5-multistep',
                        level: 'precision',
                        keys: 'multiStepAnswer1,multiStepAnswer2',
                        prompt: 'Help me solve the multi-step equation rounded to correct sig figs at each step.'
                    },
                    's5-exact-true': {
                        id: 's5-exact-constant',
                        level: 'precision',
                        keys: 'exactConstAnswer',
                        prompt: 'Help me understand how exact numbers affect the calculation precision.'
                    },
                    's5-app-right': {
                        id: 's5-percent-error',
                        level: 'applied',
                        keys: 'appliedChoice',
                        prompt: 'Help me compute percent error from 9.0g measured versus 10.0g theoretical.'
                    },
                    's5-check-change': {
                        id: 's5-absolute-relative',
                        level: 'applied',
                        keys: 'changeAnswers.absolute,changeAnswers.relative',
                        prompt: 'Help me compute absolute and relative change from 2 percent to 4 percent.'
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
                if (state.placeValueCorrect && state.concreteMission.alignedDecimals) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.decimalFeedback = 'Concrete mission complete. Place value identified and decimals aligned. Pictorial unlocked. Continue below.';
                } else {
                    state.concreteCompleted = false;
                    state.pictorialUnlocked = false;
                }
            };

            const syncPictorialMission = () => {
                if (state.fastTrack) return;
                if (state.hopPosition === 1 && state.percentShadedCorrect) {
                    state.abstractUnlocked = true;
                } else {
                    state.abstractUnlocked = false;
                }
            };

            const syncAbstractMission = () => {
                if (state.fastTrack) return;
                if (state.percentEqCorrect) {
                    state.appliedUnlocked = true;
                } else {
                    state.appliedUnlocked = false;
                }
            };

            const syncAppliedMission = () => {
                if (state.fastTrack) return;
                const changeOk = Number(state.changeAnswers.absolute.replace('%','')) === 2 &&
                                 Number(state.changeAnswers.relative.replace('%','')) === 100;
                if (state.appliedChoice === 'right' && changeOk) {
                    state.precisionUnlocked = true;
                } else {
                    state.precisionUnlocked = false;
                }
            };

            const shiftRow = (row) => {
                const copy = row.slice();
                copy.push(copy.shift());
                return copy;
            };

            const renderAlignmentRows = () => {
                const rowAEl = host.querySelector('#s5-row-a');
                const rowBEl = host.querySelector('#s5-row-b');
                if (!rowAEl || !rowBEl) return;
                rowAEl.innerHTML = '';
                rowBEl.innerHTML = '';

                state.rowA.forEach((char, idx) => {
                    const slot = document.createElement('div');
                    slot.className = `s5-slot ${char === '.' ? 'decimal' : ''}`;
                    slot.innerHTML = `<button class="s5-cardchip" data-row="a" data-index="${idx}">${char || ' '}</button>`;
                    rowAEl.appendChild(slot);
                });

                state.rowB.forEach((char, idx) => {
                    const slot = document.createElement('div');
                    slot.className = `s5-slot ${char === '.' ? 'decimal' : ''}`;
                    slot.innerHTML = `<button class="s5-cardchip" data-row="b" data-index="${idx}">${char || ' '}</button>`;
                    rowBEl.appendChild(slot);
                });
            };

            const renderHopRow = () => {
                const hopRowEl = host.querySelector('#s5-hop-row');
                const hopReadoutEl = host.querySelector('#s5-hop-readout');
                if (!hopRowEl) return;
                const digits = ['1', '4', '4'];
                const displayedValue = ['0.144', '1.44', '14.4', '144'];
                hopRowEl.innerHTML = '';

                const track = document.createElement('div');
                track.className = 's5-hop-track';

                for (let gapIndex = 0; gapIndex <= digits.length; gapIndex += 1) {
                    const gap = document.createElement('div');
                    gap.className = `s5-hop-gap ${gapIndex === state.hopPosition ? 'active' : ''}`;

                    if (gapIndex === state.hopPosition) {
                        const dot = document.createElement('span');
                        dot.className = 's5-hop-dot';
                        gap.appendChild(dot);
                    }

                    track.appendChild(gap);

                    if (gapIndex < digits.length) {
                        const digit = document.createElement('div');
                        digit.className = 's5-hop-digit';
                        digit.textContent = digits[gapIndex];
                        track.appendChild(digit);
                    }
                }

                hopRowEl.appendChild(track);

                if (hopReadoutEl) {
                    hopReadoutEl.innerHTML = `Current decimal placement gives <strong>${displayedValue[state.hopPosition]}</strong>.`;
                }
            };

            renderAlignmentRows();
            renderHopRow();

            const handleClick = (event) => {
                const diagBtn = event.target.closest('[data-diag]');
                if (diagBtn) {
                    const q = diagBtn.getAttribute('data-diag');
                    const val = diagBtn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic chosen');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                const chip = event.target.closest('[data-row]');
                if (chip) {
                    const rowName = chip.getAttribute('data-row');
                    if (rowName === 'a') {
                        state.rowA = shiftRow(state.rowA);
                    }
                    if (rowName === 'b') {
                        state.rowB = shiftRow(state.rowB);
                    }
                    renderAlignmentRows();
                    persist('Decimal shift applied');
                    return;
                }

                const tutorBtn = event.target.closest('.tutor-btn');
                if (tutorBtn) {
                    const prompt = tutorBtn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, tutorBtn.parentElement);
                    return;
                }

                if (event.target.closest('#s5-check-diagnostic')) {
                    const correct = state.diagnosticAnswers.q1 === '4' &&
                                    state.diagnosticAnswers.q2 === '1/40' &&
                                    state.diagnosticAnswers.q3 === '10%';
                    state.diagnosticDone = true;
                    if (correct) {
                        state.fastTrack = true;
                        state.pictorialUnlocked = true;
                        state.abstractUnlocked = true;
                        state.appliedUnlocked = true;
                        state.precisionUnlocked = true;
                        state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered decimal layouts, Sig Figs, and lab percent errors. All levels are now open.';
                    } else {
                        state.fastTrack = false;
                        state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                    }
                    persist('Diagnostic checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-placevalue')) {
                    const val = host.querySelector('#s5-placevalue-input')?.value.trim();
                    state.placeValueAnswer = val;
                    if (val === '8') {
                        state.placeValueCorrect = true;
                        state.placeValueFeedback = 'Correct! 8 is in the hundredths place (142.5[8]9).';
                    } else {
                        state.placeValueCorrect = false;
                        state.placeValueFeedback = 'Incorrect. In 142.589: 5 is tenths, 8 is hundredths, and 9 is thousandths. Try again.';
                    }
                    syncConcreteMission();
                    persist('Place value checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-align')) {
                    const decA = state.rowA.indexOf('.');
                    const decB = state.rowB.indexOf('.');
                    if (decA === decB) {
                        state.concreteMission.alignedDecimals = true;
                        state.decimalFeedback = 'Correct! The decimal points line up in the same vertical column. Decimal addition can proceed.';
                    } else {
                        if (!state.concreteCompleted) {
                            state.concreteMission.alignedDecimals = false;
                        }
                        state.decimalFeedback = 'Not yet. Shift rows until the dots align vertically.';
                    }
                    syncConcreteMission();
                    persist('Alignment checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-reset-align')) {
                    state.rowA = ['', '1', '2', '4', '.', ''];
                    state.rowB = ['', '', '0', '.', '5', '6'];
                    if (!state.concreteCompleted) {
                        state.concreteMission.alignedDecimals = false;
                    }
                    state.decimalFeedback = 'Align both numbers so the decimal points sit in the same vertical column before computing.';
                    renderAlignmentRows();
                    persist('Alignment reset');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-hint-concrete')) {
                    const decA = state.rowA.indexOf('.');
                    const decB = state.rowB.indexOf('.');
                    let hints = [];
                    if (!state.placeValueCorrect) {
                        hints.push('Place Value: In 142.589, the hundredths place is the second digit after the decimal point (8).');
                    }
                    if (!state.concreteMission.alignedDecimals) {
                        if (decA < decB) {
                            hints.push('Alignment: Row A decimal is left of Row B decimal. Rotate rows to align the dots.');
                        } else {
                            hints.push('Alignment: Row A decimal is right of Row B decimal. Rotate rows to align the dots.');
                        }
                    }
                    if (hints.length > 0) {
                        state.decimalFeedback = hints.join('<br/>');
                    } else {
                        state.decimalFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                    }
                    persist('Concrete hint shown');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-continue-pictorial')) {
                    if (state.fastTrack || state.pictorialUnlocked) {
                        state.decimalFeedback = 'Pictorial unlocked. Continue below.';
                        host.querySelectorAll('.s5-level')[1]?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        state.decimalFeedback = 'Complete the Concrete mission first (L5.1 Place Value and L5.2 Decimal Grid Alignment).';
                    }
                    persist('Continue to pictorial clicked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-hop-left')) {
                    state.hopPosition = Math.max(0, state.hopPosition - 1);
                    state.hopFeedback = 'Decimal marker moved left between place-value gaps.';
                    renderHopRow();
                    persist('Hop left');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-hop-right')) {
                    state.hopPosition = Math.min(3, state.hopPosition + 1);
                    state.hopFeedback = 'Decimal marker moved right between place-value gaps.';
                    renderHopRow();
                    persist('Hop right');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-hop')) {
                    if (state.hopPosition === 1) {
                        state.hopFeedback = 'Correct! Placing the decimal point before the first digit 1 yields 1.44.';
                    } else {
                        state.hopFeedback = 'Incorrect. We need 3 total decimal places, so the value should read 1.44 (dot before the first 1).';
                    }
                    syncPictorialMission();
                    if (state.abstractUnlocked) {
                        state.hopFeedback += ' Abstract unlocked. Continue below.';
                    }
                    persist('Hop checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-percent-shaded')) {
                    const blocks = state.percentShadedBlocks;
                    const pct = Math.round((blocks / 20) * 100);
                    if (blocks === 7) {
                        state.percentShadedCorrect = true;
                        state.percentShadedFeedback = 'Correct! 35% of 20 blocks is 7 blocks (0.35 &times; 20 = 7).';
                    } else {
                        state.percentShadedCorrect = false;
                        state.percentShadedFeedback = `Incorrect. You have shaded ${pct}% (${blocks}/20). We need exactly 35% (which is 0.35 &times; 20 = 7 blocks).`;
                    }
                    syncPictorialMission();
                    if (state.abstractUnlocked) {
                        state.percentShadedFeedback += ' Abstract unlocked. Continue below.';
                    }
                    persist('Percentage shading checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-continue-abstract')) {
                    if (state.fastTrack || state.abstractUnlocked) {
                        host.querySelectorAll('.s5-level')[2]?.scrollIntoView({ behavior: 'smooth' });
                    }
                    return;
                }

                if (event.target.closest('#s5-check-perceq')) {
                    const val = host.querySelector('#s5-perceq-input')?.value.trim();
                    state.percentEqAnswer = val;
                    if (val === '12') {
                        state.percentEqCorrect = true;
                        state.percentEqFeedback = 'Correct! 15% of 80 is 12 (0.15 &times; 80 = 12).';
                    } else {
                        state.percentEqCorrect = false;
                        state.percentEqFeedback = 'Incorrect. Convert 15% to a decimal (0.15) and multiply by 80.';
                    }
                    syncAbstractMission();
                    persist('Percent equation checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-continue-applied')) {
                    if (state.fastTrack || state.appliedUnlocked) {
                        host.querySelectorAll('.s5-level')[3]?.scrollIntoView({ behavior: 'smooth' });
                    }
                    return;
                }

                if (event.target.closest('#s5-app-wrong')) {
                    state.appliedChoice = 'wrong';
                    state.appliedFeedback = 'Incorrect. Percent error = |yield - standard| / standard × 100%. (1.0g / 10.0g = 0.1 = 10%).';
                    syncAppliedMission();
                    persist('Applied choice incorrect');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-app-right')) {
                    state.appliedChoice = 'right';
                    state.appliedFeedback = 'Correct! The percent error is 10.0% of the theoretical reference yield.';
                    syncAppliedMission();
                    persist('Applied choice correct');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-change')) {
                    const absolute = host.querySelector('#s5-change-absolute')?.value.trim() || '';
                    const relative = host.querySelector('#s5-change-relative')?.value.trim() || '';
                    state.changeAnswers = { absolute, relative };

                    const absVal = Number(absolute.replace('%', ''));
                    const relVal = Number(relative.replace('%', ''));
                    if (absVal === 2 && relVal === 100) {
                        state.changeFeedback = 'Correct. Absolute change is +2 percentage points (4% - 2%). Relative increase is +100% because 4% is double 2%.';
                    } else {
                        state.changeFeedback = 'Not yet. Compute absolute first: 4 - 2 = 2 percentage points. Relative increase is (2 / 2) x 100% = 100%.';
                    }

                    syncAppliedMission();
                    persist('Absolute-relative checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-continue-precision')) {
                    if (state.fastTrack || state.precisionUnlocked) {
                        host.querySelectorAll('.s5-level')[4]?.scrollIntoView({ behavior: 'smooth' });
                    }
                    return;
                }

                if (event.target.closest('#s5-check-sigfigs')) {
                    const leading = host.querySelector('#s5-sig-leading')?.value || '';
                    const trapped = host.querySelector('#s5-sig-trapped')?.value || '';
                    const trailing = host.querySelector('#s5-sig-trailing')?.value || '';
                    state.sigfigAnswers = { leading, trapped, trailing };

                    const correct = leading === 'not' && trapped === 'sig' && trailing === 'sig';
                    if (correct) {
                        state.sigfigFeedback = 'Correct! Leading zeros are not significant, trapped zeros are significant, and trailing zeros are significant due to the decimal point. 0.05080 has 4 sig figs.';
                    } else {
                        state.sigfigFeedback = 'Incorrect. Check your zero classifications. Leading zeros are placeholders; trapped zeros are measured; trailing zeros with a decimal are significant.';
                    }
                    persist('Sigfigs checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-sigfigs-total')) {
                    const val = host.querySelector('#s5-sigfigs-input')?.value.trim();
                    state.sigfigsTotalAnswer = val;
                    const expected = String(s5SigFigs.answerKey);
                    if (val === expected) {
                        state.sigfigsTotalCorrect = true;
                        state.sigfigsTotalFeedback = `Correct! There are ${expected} significant figures in ${s5SigFigs.value}.`;
                    } else {
                        state.sigfigsTotalCorrect = false;
                        state.sigfigsTotalFeedback = `Incorrect. Look closely at ${s5SigFigs.value}.`;
                    }
                    persist('Total sig figs checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-check-multistep')) {
                    const ans1 = host.querySelector('#s5-multistep-1')?.value.trim();
                    const ans2 = host.querySelector('#s5-multistep-2')?.value.trim();
                    state.multiStepAnswer1 = ans1;
                    state.multiStepAnswer2 = ans2;

                    const expectedInt = String(s5MultiStep.intermediate);
                    const expectedAns = String(s5MultiStep.answerKey);

                    if (ans1 === expectedInt && ans2 === expectedAns) {
                        state.multiStepFeedback = `Correct! (${s5MultiStep.a} − ${s5MultiStep.b}) rounds to ${expectedInt}, and multiplying by ${s5MultiStep.c} yields ${expectedAns} under sig fig rules.`;
                    } else if (ans1 !== expectedInt) {
                        state.multiStepFeedback = `Incorrect Step 1. First compute the subtraction and round to the correct decimal place. expected: ${expectedInt}.`;
                    } else {
                        state.multiStepFeedback = `Incorrect Step 2. Multiply ${expectedInt} &times; ${s5MultiStep.c} and round to the correct sig figs. expected: ${expectedAns}.`;
                    }
                    persist('Multistep checked');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-exact-true')) {
                    state.exactConstAnswer = 'true';
                    state.exactConstCorrect = true;
                    state.exactConstFeedback = 'Correct! Exact numbers (like integers from counting or definitions) have infinite significant figures and do not limit the precision of calculations.';
                    persist('Exact constant chosen correct');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.closest('#s5-exact-false')) {
                    state.exactConstAnswer = 'false';
                    state.exactConstCorrect = false;
                    state.exactConstFeedback = 'Incorrect. Exact constants (like 2 in a stoichiometric factor) do not limit significant figures. The final sig figs remain determined by the inexact measurements.';
                    persist('Exact constant chosen incorrect');
                    this.mount({ host, state, onStateChange });
                }
            };

            const handleInput = (event) => {
                if (event.target.matches('#s5-placevalue-input')) {
                    state.placeValueAnswer = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-percent-slider')) {
                    state.percentShadedBlocks = parseInt(event.target.value);
                    this.mount({ host, state, onStateChange });
                    return;
                }

                if (event.target.matches('#s5-perceq-input')) {
                    state.percentEqAnswer = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-sigfigs-input')) {
                    state.sigfigsTotalAnswer = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-change-absolute')) {
                    state.changeAnswers.absolute = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-change-relative')) {
                    state.changeAnswers.relative = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-multistep-1')) {
                    state.multiStepAnswer1 = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-multistep-2')) {
                    state.multiStepAnswer2 = event.target.value;
                }
            };

            const handleChange = (event) => {
                if (event.target.matches('#s5-sig-leading')) {
                    state.sigfigAnswers.leading = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-sig-trapped')) {
                    state.sigfigAnswers.trapped = event.target.value;
                    return;
                }

                if (event.target.matches('#s5-sig-trailing')) {
                    state.sigfigAnswers.trailing = event.target.value;
                }
            };

            host.addEventListener('click', handleClick);
            host.addEventListener('input', handleInput);
            host.addEventListener('change', handleChange);

            this._stage5Handlers = {
                host,
                onClick: handleClick,
                onInput: handleInput,
                onChange: handleChange
            };
        },
        unmount() {
            if (this._stage5Handlers?.host) {
                this._stage5Handlers.host.removeEventListener('click', this._stage5Handlers.onClick);
                this._stage5Handlers.host.removeEventListener('input', this._stage5Handlers.onInput);
                this._stage5Handlers.host.removeEventListener('change', this._stage5Handlers.onChange);
            }
            this._stage5Handlers = null;
        }
    };
}
