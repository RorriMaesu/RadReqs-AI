const createInitialPhase3State = () => ({
    seesawLeft: 'x + 5',
    seesawRight: '12',
    seesawFeedback: 'The equation starts balanced. Every legal move must be mirrored on both sides.',
    seesawTiltDeg: 0,
    basementStep: 0,
    basementEquation: 'Density = mass / Volume',
    basementFeedback: 'Volume is currently in the denominator. Un-bury it before trying to isolate it.',
    basementToast: '',
    basementFlash: false,
    shieldEquation: 'q = m c DeltaT',
    shieldFeedback: 'Treat DeltaT as one inseparable symbol token. Do not split Delta away from T.',
    shieldPulse: false,
    masterySeesawFeedback: 'Choose a move and watch the mini-scale react.',
    masterySeesawTilt: 0,
    masteryBasementFeedback: 'Pick the isolation result for Volume.',
    masteryBasementProof: '',
    masteryShieldFeedback: 'Pick the expression that correctly isolates c.',
    masteryShieldPulse: false
});

export function createPhase3Algebra() {
    return {
        id: 'phase3',
        label: 'Logic of Balance',
        title: 'Phase 3: The Logic of Balance (Algebra Rebuild)',
        getInitialState() {
            return createInitialPhase3State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialPhase3State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            const basementLeftSide = String(state.basementEquation || defaults.basementEquation).split('=')[0].trim();

            host.innerHTML = `
                <style>
                    .p3-wrap {
                        display: grid;
                        gap: 1.2rem;
                    }
                    .p3-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .p3-card h2 {
                        margin: 0 0 0.6rem;
                        color: #0f172a;
                    }
                    .p3-card h3 {
                        margin: 0 0 0.45rem;
                        color: #1e3a8a;
                    }
                    .p3-card p {
                        color: #334155;
                        line-height: 1.62;
                        margin: 0.55rem 0;
                    }
                    .p3-mini {
                        color: #475569;
                        font-size: 0.92rem;
                    }
                    .p3-controls {
                        display: grid;
                        gap: 0.65rem;
                        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                        margin-top: 0.75rem;
                    }
                    .p3-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .p3-btn.p3-ghost {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .p3-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        background: #eff6ff;
                        color: #1e3a8a;
                        border-radius: 10px;
                        padding: 0.62rem;
                        line-height: 1.5;
                    }
                    .p3-seesaw {
                        margin-top: 0.8rem;
                        border: 1px solid #dbeafe;
                        border-radius: 14px;
                        padding: 1rem 0.8rem 0.9rem;
                        background: linear-gradient(180deg, #ffffff, #f8fbff);
                        overflow: hidden;
                    }
                    .p3-beam {
                        position: relative;
                        height: 110px;
                        transform-origin: center 68px;
                        transition: transform 0.45s ease;
                    }
                    .p3-pivot {
                        position: absolute;
                        left: 50%;
                        top: 60px;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 14px solid transparent;
                        border-right: 14px solid transparent;
                        border-top: 28px solid #1f2937;
                    }
                    .p3-bar {
                        position: absolute;
                        left: 8%;
                        right: 8%;
                        top: 45px;
                        height: 8px;
                        border-radius: 999px;
                        background: #64748b;
                    }
                    .p3-pan {
                        position: absolute;
                        top: 56px;
                        width: 39%;
                        min-height: 44px;
                        border: 2px solid #93c5fd;
                        border-radius: 12px;
                        background: #ffffff;
                        display: grid;
                        gap: 0.35rem;
                        align-content: center;
                        justify-items: center;
                        padding: 0.4rem;
                    }
                    .p3-pan.left {
                        left: 6%;
                    }
                    .p3-pan.right {
                        right: 6%;
                    }
                    .p3-eq {
                        font-weight: 800;
                        color: #0f172a;
                    }
                    .p3-op-lane {
                        display: flex;
                        gap: 0.35rem;
                        min-height: 22px;
                    }
                    .p3-op-chip {
                        border: 1px solid #60a5fa;
                        background: #dbeafe;
                        color: #1e3a8a;
                        border-radius: 999px;
                        padding: 0.1rem 0.45rem;
                        font-size: 0.75rem;
                        animation: p3-pop-in 0.28s ease;
                    }
                    @keyframes p3-pop-in {
                        from {
                            opacity: 0;
                            transform: translateY(-6px) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    .p3-fraction-work {
                        margin-top: 0.8rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.8rem;
                        background: #f8fbff;
                    }
                    .p3-fraction-card {
                        display: grid;
                        gap: 0.5rem;
                        grid-template-columns: 1fr auto 1fr;
                        align-items: center;
                    }
                    .p3-frac-stack {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        padding: 0.45rem 0.5rem;
                        text-align: center;
                    }
                    .p3-frac-top {
                        padding-bottom: 0.22rem;
                    }
                    .p3-frac-line {
                        border-top: 2px solid #0f172a;
                        margin: 0.05rem 0;
                    }
                    .p3-frac-bottom {
                        padding-top: 0.18rem;
                    }
                    .p3-den-target {
                        display: inline-block;
                        border: 1px solid #0ea5e9;
                        border-radius: 8px;
                        padding: 0.1rem 0.4rem;
                        background: #ecfeff;
                        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
                    }
                    .p3-den-target.flash {
                        border-color: #ef4444;
                        background: #fee2e2;
                        transform: scale(1.07);
                    }
                    .p3-toast {
                        margin-top: 0.55rem;
                        border-radius: 10px;
                        padding: 0.5rem 0.65rem;
                        background: #fef2f2;
                        color: #991b1b;
                        border: 1px solid #fca5a5;
                    }
                    .p3-shield-lab {
                        margin-top: 0.8rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.82rem;
                        background: #f8fbff;
                    }
                    .p3-formula {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 0.35rem;
                        margin-bottom: 0.4rem;
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .p3-shield {
                        border: 2px solid #0f172a;
                        border-radius: 8px;
                        padding: 0.1rem 0.4rem;
                        background: #fff7ed;
                    }
                    .p3-shield.chem {
                        background: #ecfeff;
                        border-color: #0e7490;
                    }
                    .p3-shield.pulse {
                        animation: p3-vibrate 0.42s linear;
                    }
                    @keyframes p3-vibrate {
                        0% { transform: translateX(0); }
                        20% { transform: translateX(-4px); }
                        40% { transform: translateX(4px); }
                        60% { transform: translateX(-3px); }
                        80% { transform: translateX(3px); }
                        100% { transform: translateX(0); }
                    }
                    .p3-checkin {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                    .p3-check-grid {
                        display: grid;
                        gap: 0.95rem;
                        margin-top: 0.7rem;
                    }
                    .p3-check-item {
                        border: 1px dashed #93c5fd;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p3-proof {
                        margin-top: 0.45rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.55rem;
                        background: #ffffff;
                        color: #334155;
                        line-height: 1.55;
                        white-space: pre-line;
                    }
                </style>

                <section class="p3-wrap">
                    <article class="p3-card">
                        <h2>1) The Symmetric Seesaw Balance Layout</h2>
                        <p>
                            The equals sign is not an answer button. It is a balance pivot that separates two expressions with the same value.
                            If one side changes, the other side must change in exactly the same algebraic way, or the equality breaks.
                            Seeing equations as a scale helps adult learners rebuild confidence because each move has a concrete purpose.
                        </p>
                        <p>
                            To isolate a variable, you are not hunting for shortcuts. You are removing obstacles while preserving equilibrium.
                            Adding, subtracting, multiplying, or dividing can all be legal, but only when mirrored on both sides at the same time.
                            When both pans receive the same operation token, the beam stays level and the equation remains true.
                        </p>
                        <p>
                            Use the controls below to apply symmetric operations. Watch operation chips duplicate to both pans so your eyes can confirm
                            that the balance condition is preserved before you move to the next step.
                        </p>

                        <div class="p3-seesaw">
                            <div id="p3-main-beam" class="p3-beam" style="transform: rotate(${Number(state.seesawTiltDeg) || 0}deg);">
                                <div class="p3-bar"></div>
                                <div class="p3-pan left">
                                    <div class="p3-mini">Left side</div>
                                    <div id="p3-seesaw-left" class="p3-eq">${state.seesawLeft}</div>
                                    <div id="p3-seesaw-left-ops" class="p3-op-lane"></div>
                                </div>
                                <div class="p3-pan right">
                                    <div class="p3-mini">Right side</div>
                                    <div id="p3-seesaw-right" class="p3-eq">${state.seesawRight}</div>
                                    <div id="p3-seesaw-right-ops" class="p3-op-lane"></div>
                                </div>
                                <div class="p3-pivot"></div>
                            </div>
                        </div>

                        <div class="p3-controls">
                            <button id="p3-op-plus5" class="p3-btn">+ 5 to both sides</button>
                            <button id="p3-op-minus5" class="p3-btn p3-ghost">- 5 to both sides</button>
                            <button id="p3-op-minusx" class="p3-btn p3-ghost">- x from both sides</button>
                            <button id="p3-op-reset" class="p3-btn p3-ghost">Reset Seesaw</button>
                        </div>
                        <div id="p3-seesaw-feedback" class="p3-feedback">${state.seesawFeedback}</div>
                    </article>

                    <article class="p3-card">
                        <h2>2) Un-Burying the Basement (The Denominator Constraint)</h2>
                        <p>
                            A common chemistry algebra failure happens when the target variable lives in the denominator. In the density relationship,
                            Density = mass / Volume, the Volume term is downstairs as a divisor. If you ignore that basement location and start dividing
                            by mass immediately, you usually create a reciprocal pathway and lose the target structure.
                        </p>
                        <p>
                            The key principle is direct: if the unknown is acting as a divisor, your first mission is to multiply it out of the denominator.
                            That move lifts the variable to the main floor so you can then isolate it with standard one-step operations.
                            This sequence prevents accidental inversion and protects dimensional meaning.
                        </p>
                        <p>
                            Try the operation buttons in order. Incorrect attempts are blocked on purpose so the workflow trains the right instinct.
                            If you attempt to isolate before un-burying, the denominator flashes and a coaching toast explains the correction.
                        </p>

                        <div class="p3-fraction-work">
                            <div class="p3-fraction-card">
                                <div class="p3-frac-stack">
                                    <div class="p3-mini">Left side</div>
                                    <div>${basementLeftSide}</div>
                                </div>
                                <div class="p3-eq">=</div>
                                <div class="p3-frac-stack">
                                    <div class="p3-mini">Right side</div>
                                    <div class="p3-frac-top">mass</div>
                                    <div class="p3-frac-line"></div>
                                    <div class="p3-frac-bottom"><span id="p3-den-box" class="p3-den-target${state.basementFlash ? ' flash' : ''}">Volume</span></div>
                                </div>
                            </div>

                            <div class="p3-controls">
                                <button id="p3-basement-div-mass" class="p3-btn p3-ghost">Try dividing both sides by mass</button>
                                <button id="p3-basement-mult-v" class="p3-btn">Multiply both sides by Volume</button>
                                <button id="p3-basement-div-density" class="p3-btn p3-ghost">Then divide both sides by Density</button>
                                <button id="p3-basement-reset" class="p3-btn p3-ghost">Reset Basement Lab</button>
                            </div>

                            <div id="p3-basement-feedback" class="p3-feedback">${state.basementFeedback}</div>
                            <div id="p3-basement-toast" class="p3-toast" style="display:${state.basementToast ? 'block' : 'none'};">${state.basementToast}</div>
                        </div>
                    </article>

                    <article class="p3-card">
                        <h2>3) The Multi-Character Variable Shield</h2>
                        <p>
                            In early algebra, variables are often single letters. In chemistry, symbols can include prefixes, subscripts, and modifiers,
                            such as DeltaT, P1, or V2. These are single identities with scientific meaning attached. Splitting them apart during algebra
                            is equivalent to changing the variable itself.
                        </p>
                        <p>
                            For example, DeltaT represents temperature change as one concept. If you try to cancel just T and leave Delta behind,
                            you are no longer solving the same equation. The same idea applies to indexed variables like P1 and V2. The index is part of
                            the variable identity and must remain attached.
                        </p>
                        <p>
                            Use the shield controls below. The interface intentionally blocks symbol splitting and vibrates the shield when a move attempts
                            to tear a multi-character token apart.
                        </p>

                        <div class="p3-shield-lab">
                            <div class="p3-formula">
                                <span>q</span><span>=</span><span>m</span><span>c</span><span id="p3-delta-shield" class="p3-shield chem${state.shieldPulse ? ' pulse' : ''}">&Delta;T</span>
                            </div>
                            <div class="p3-formula">
                                <span id="p3-p1-shield" class="p3-shield">P1</span><span id="p3-v1-shield" class="p3-shield">V1</span><span>=</span><span id="p3-p2-shield" class="p3-shield">P2</span><span id="p3-v2-shield" class="p3-shield">V2</span>
                            </div>
                            <div class="p3-mini">Current working form: <strong id="p3-shield-equation">${state.shieldEquation}</strong></div>

                            <div class="p3-controls">
                                <button id="p3-shield-div-m" class="p3-btn p3-ghost">Divide both sides by m</button>
                                <button id="p3-shield-split-delta" class="p3-btn p3-ghost">Try dividing by T only</button>
                                <button id="p3-shield-div-mdt" class="p3-btn">Divide both sides by (m DeltaT)</button>
                                <button id="p3-shield-reset" class="p3-btn p3-ghost">Reset Shield Lab</button>
                            </div>
                            <div id="p3-shield-feedback" class="p3-feedback">${state.shieldFeedback}</div>
                        </div>
                    </article>

                    <article class="p3-checkin">
                        <h2>Mastery Check-in</h2>
                        <p>
                            Complete all three checks to verify that your algebra steps preserve balance, handle denominator constraints,
                            and protect chemistry variable identities.
                        </p>

                        <div class="p3-check-grid">
                            <section class="p3-check-item">
                                <h3>Seesaw Checkpoint</h3>
                                <p class="p3-mini">Equation prompt: x + 4 = 19. Which move keeps truth intact while isolating x?</p>
                                <div class="p3-seesaw">
                                    <div id="p3-check-seesaw-beam" class="p3-beam" style="transform: rotate(${Number(state.masterySeesawTilt) || 0}deg);">
                                        <div class="p3-bar"></div>
                                        <div class="p3-pan left"><div class="p3-eq">x + 4</div></div>
                                        <div class="p3-pan right"><div class="p3-eq">19</div></div>
                                        <div class="p3-pivot"></div>
                                    </div>
                                </div>
                                <div class="p3-controls">
                                    <button id="p3-check-seesaw-wrong" class="p3-btn p3-ghost">Subtract 4 from left side only</button>
                                    <button id="p3-check-seesaw-right" class="p3-btn">Subtract 4 from both sides</button>
                                </div>
                                <div id="p3-check-seesaw-feedback" class="p3-feedback">${state.masterySeesawFeedback}</div>
                            </section>

                            <section class="p3-check-item">
                                <h3>Basement Checkpoint</h3>
                                <p class="p3-mini">From Density = mass / Volume, choose the correct isolated form for Volume.</p>
                                <div class="p3-controls">
                                    <button id="p3-check-base-trap" class="p3-btn p3-ghost">V = Density / mass</button>
                                    <button id="p3-check-base-right" class="p3-btn">V = mass / Density</button>
                                </div>
                                <div id="p3-check-base-feedback" class="p3-feedback">${state.masteryBasementFeedback}</div>
                                <div id="p3-check-base-proof" class="p3-proof" style="display:${state.masteryBasementProof ? 'block' : 'none'};">${state.masteryBasementProof}</div>
                            </section>

                            <section class="p3-check-item">
                                <h3>Variable Shield Checkpoint</h3>
                                <p class="p3-mini">From q = m c DeltaT, isolate c while preserving DeltaT as one token.</p>
                                <div class="p3-formula">
                                    <span>q</span><span>=</span><span>m</span><span>c</span><span id="p3-check-delta-shield" class="p3-shield chem${state.masteryShieldPulse ? ' pulse' : ''}">&Delta;T</span>
                                </div>
                                <div class="p3-controls">
                                    <button id="p3-check-shield-split" class="p3-btn p3-ghost">c = q / m / T and drop Delta</button>
                                    <button id="p3-check-shield-right" class="p3-btn">c = q / (m DeltaT)</button>
                                </div>
                                <div id="p3-check-shield-feedback" class="p3-feedback">${state.masteryShieldFeedback}</div>
                            </section>
                        </div>
                    </article>
                </section>
            `;

            const seesawLeftEl = host.querySelector('#p3-seesaw-left');
            const seesawRightEl = host.querySelector('#p3-seesaw-right');
            const seesawFeedbackEl = host.querySelector('#p3-seesaw-feedback');
            const seesawBeamEl = host.querySelector('#p3-main-beam');
            const seesawLeftOpsEl = host.querySelector('#p3-seesaw-left-ops');
            const seesawRightOpsEl = host.querySelector('#p3-seesaw-right-ops');

            const basementFeedbackEl = host.querySelector('#p3-basement-feedback');
            const basementToastEl = host.querySelector('#p3-basement-toast');
            const denBoxEl = host.querySelector('#p3-den-box');

            const shieldEquationEl = host.querySelector('#p3-shield-equation');
            const shieldFeedbackEl = host.querySelector('#p3-shield-feedback');
            const shieldDeltaEl = host.querySelector('#p3-delta-shield');

            const checkSeesawBeamEl = host.querySelector('#p3-check-seesaw-beam');
            const checkSeesawFeedbackEl = host.querySelector('#p3-check-seesaw-feedback');
            const checkBaseFeedbackEl = host.querySelector('#p3-check-base-feedback');
            const checkBaseProofEl = host.querySelector('#p3-check-base-proof');
            const checkShieldFeedbackEl = host.querySelector('#p3-check-shield-feedback');
            const checkDeltaShieldEl = host.querySelector('#p3-check-delta-shield');

            const pushOpChip = (label) => {
                const leftChip = document.createElement('span');
                leftChip.className = 'p3-op-chip';
                leftChip.textContent = label;
                const rightChip = document.createElement('span');
                rightChip.className = 'p3-op-chip';
                rightChip.textContent = label;

                seesawLeftOpsEl.appendChild(leftChip);
                seesawRightOpsEl.appendChild(rightChip);

                setTimeout(() => {
                    if (leftChip.parentNode) leftChip.parentNode.removeChild(leftChip);
                    if (rightChip.parentNode) rightChip.parentNode.removeChild(rightChip);
                }, 950);
            };

            const renderSeesaw = () => {
                seesawLeftEl.textContent = state.seesawLeft;
                seesawRightEl.textContent = state.seesawRight;
                seesawFeedbackEl.textContent = state.seesawFeedback;
                seesawBeamEl.style.transform = `rotate(${Number(state.seesawTiltDeg) || 0}deg)`;
            };

            const applySymmetricSeesaw = (tokenLabel, leftWrap, rightWrap, feedback) => {
                state.seesawLeft = leftWrap(state.seesawLeft);
                state.seesawRight = rightWrap(state.seesawRight);
                state.seesawFeedback = feedback;
                state.seesawTiltDeg = 0;
                pushOpChip(tokenLabel);
                renderSeesaw();
                onStateChange({ ...state }, 'Phase 3 seesaw updated');
            };

            const pulseDenominatorTrap = () => {
                state.basementFlash = true;
                denBoxEl.classList.add('flash');
                setTimeout(() => {
                    state.basementFlash = false;
                    denBoxEl.classList.remove('flash');
                }, 400);
            };

            const renderBasement = () => {
                basementFeedbackEl.textContent = state.basementFeedback;
                basementToastEl.textContent = state.basementToast;
                basementToastEl.style.display = state.basementToast ? 'block' : 'none';
            };

            const pulseShield = (targetEl) => {
                if (!targetEl) return;
                targetEl.classList.remove('pulse');
                void targetEl.offsetWidth;
                targetEl.classList.add('pulse');
            };

            const renderShield = () => {
                shieldEquationEl.textContent = state.shieldEquation;
                shieldFeedbackEl.textContent = state.shieldFeedback;
            };

            const renderCheckpoints = () => {
                checkSeesawBeamEl.style.transform = `rotate(${Number(state.masterySeesawTilt) || 0}deg)`;
                checkSeesawFeedbackEl.textContent = state.masterySeesawFeedback;
                checkBaseFeedbackEl.textContent = state.masteryBasementFeedback;
                checkBaseProofEl.textContent = state.masteryBasementProof;
                checkBaseProofEl.style.display = state.masteryBasementProof ? 'block' : 'none';
                checkShieldFeedbackEl.textContent = state.masteryShieldFeedback;
            };

            host.querySelector('#p3-op-plus5').addEventListener('click', () => {
                applySymmetricSeesaw(
                    '+5',
                    (left) => `(${left}) + 5`,
                    (right) => `(${right}) + 5`,
                    'Balanced move confirmed: +5 was applied to both pans, so equality remains intact.'
                );
            });

            host.querySelector('#p3-op-minus5').addEventListener('click', () => {
                applySymmetricSeesaw(
                    '-5',
                    (left) => `(${left}) - 5`,
                    (right) => `(${right}) - 5`,
                    'Balanced move confirmed: subtracting 5 from both sides preserves the seesaw equilibrium.'
                );
            });

            host.querySelector('#p3-op-minusx').addEventListener('click', () => {
                applySymmetricSeesaw(
                    '-x',
                    (left) => `(${left}) - x`,
                    (right) => `(${right}) - x`,
                    'Balanced move confirmed: subtracting x from both sides keeps the statement true while changing form.'
                );
            });

            host.querySelector('#p3-op-reset').addEventListener('click', () => {
                state.seesawLeft = 'x + 5';
                state.seesawRight = '12';
                state.seesawTiltDeg = 0;
                state.seesawFeedback = 'Reset complete. Start again from a level equation and mirror each move.';
                renderSeesaw();
                onStateChange({ ...state }, 'Phase 3 seesaw reset');
            });

            host.querySelector('#p3-basement-div-mass').addEventListener('click', () => {
                if (state.basementStep === 0) {
                    state.basementToast = 'Un-bury the basement first! Multiply both sides by the denominator to bring your variable to the top line.';
                    state.basementFeedback = 'Blocked by denominator constraint: Volume is still downstairs as a divisor.';
                    pulseDenominatorTrap();
                } else if (state.basementStep === 1) {
                    state.basementFeedback = 'You can divide by Density now, not by mass. You are isolating Volume.';
                    state.basementToast = 'Focus on removing Density after lifting Volume.';
                } else {
                    state.basementFeedback = 'Volume is already isolated as mass/Density.';
                    state.basementToast = '';
                }
                renderBasement();
                onStateChange({ ...state }, 'Phase 3 basement action attempted');
            });

            host.querySelector('#p3-basement-mult-v').addEventListener('click', () => {
                if (state.basementStep === 0) {
                    state.basementStep = 1;
                    state.basementEquation = 'Density x Volume = mass';
                    state.basementFeedback = 'Great move. Volume has been multiplied out of the denominator and is now on the main floor.';
                    state.basementToast = '';
                } else {
                    state.basementFeedback = 'Volume is already un-buried. Continue by dividing both sides by Density.';
                }
                renderBasement();
                onStateChange({ ...state }, 'Phase 3 basement unburied');
            });

            host.querySelector('#p3-basement-div-density').addEventListener('click', () => {
                if (state.basementStep === 0) {
                    state.basementFeedback = 'Not yet. First multiply both sides by Volume to un-bury the denominator variable.';
                    state.basementToast = 'Un-bury the basement first! Multiply both sides by the denominator to bring your variable to the top line.';
                    pulseDenominatorTrap();
                } else {
                    state.basementStep = 2;
                    state.basementEquation = 'Volume = mass / Density';
                    state.basementFeedback = 'Isolation complete: V = mass / Density. Denominator trap avoided.';
                    state.basementToast = '';
                }
                renderBasement();
                onStateChange({ ...state }, 'Phase 3 basement progressed');
            });

            host.querySelector('#p3-basement-reset').addEventListener('click', () => {
                state.basementStep = 0;
                state.basementEquation = 'Density = mass / Volume';
                state.basementFeedback = 'Volume is currently in the denominator. Un-bury it before trying to isolate it.';
                state.basementToast = '';
                renderBasement();
                onStateChange({ ...state }, 'Phase 3 basement reset');
            });

            host.querySelector('#p3-shield-div-m').addEventListener('click', () => {
                state.shieldEquation = 'q / m = c DeltaT';
                state.shieldFeedback = 'Good. Dividing by m keeps DeltaT intact as one shielded token.';
                renderShield();
                onStateChange({ ...state }, 'Phase 3 shield divided by m');
            });

            host.querySelector('#p3-shield-split-delta').addEventListener('click', () => {
                state.shieldFeedback = 'Blocked: DeltaT cannot be split into separate cancellation targets. Keep the shielded token intact.';
                pulseShield(shieldDeltaEl);
                renderShield();
                onStateChange({ ...state }, 'Phase 3 shield split blocked');
            });

            host.querySelector('#p3-shield-div-mdt').addEventListener('click', () => {
                state.shieldEquation = 'c = q / (m DeltaT)';
                state.shieldFeedback = 'Correct isolation: divide by the full product m DeltaT, preserving DeltaT as one symbol.';
                renderShield();
                onStateChange({ ...state }, 'Phase 3 shield isolated c');
            });

            host.querySelector('#p3-shield-reset').addEventListener('click', () => {
                state.shieldEquation = 'q = m c DeltaT';
                state.shieldFeedback = 'Reset complete. Keep shielded variables intact during rearrangement.';
                renderShield();
                onStateChange({ ...state }, 'Phase 3 shield reset');
            });

            host.querySelector('#p3-check-seesaw-wrong').addEventListener('click', () => {
                state.masterySeesawTilt = -16;
                state.masterySeesawFeedback = 'That breaks equality. One-sided subtraction tilts the scale because the right side stayed unchanged.';
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 seesaw checkpoint incorrect');
            });

            host.querySelector('#p3-check-seesaw-right').addEventListener('click', () => {
                state.masterySeesawTilt = 0;
                state.masterySeesawFeedback = 'Correct. Subtracting 4 from both sides keeps the beam level and gives x = 15.';
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 seesaw checkpoint correct');
            });

            host.querySelector('#p3-check-base-trap').addEventListener('click', () => {
                state.masteryBasementFeedback = 'Trap detected: V = Density/mass is inverted and incorrect for this rearrangement.';
                state.masteryBasementProof = 'Proof path:\n1) Start: Density = mass / V\n2) Multiply both sides by V -> Density x V = mass\n3) Divide both sides by Density -> V = mass / Density\nIf you force V = Density/mass, you effectively keep a reciprocal structure and do not recover whole V correctly.';
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 basement checkpoint trap hit');
            });

            host.querySelector('#p3-check-base-right').addEventListener('click', () => {
                state.masteryBasementFeedback = 'Correct. V = mass / Density comes from un-burying V first and then dividing by Density.';
                state.masteryBasementProof = '';
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 basement checkpoint correct');
            });

            host.querySelector('#p3-check-shield-split').addEventListener('click', () => {
                state.masteryShieldFeedback = 'Blocked: you cannot peel T away from Delta. DeltaT is one protected token in thermodynamic algebra.';
                pulseShield(checkDeltaShieldEl);
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 shield checkpoint split blocked');
            });

            host.querySelector('#p3-check-shield-right').addEventListener('click', () => {
                state.masteryShieldFeedback = 'Correct isolation: c = q / (m DeltaT). The shielded DeltaT stays intact as one variable unit.';
                renderCheckpoints();
                onStateChange({ ...state }, 'Phase 3 shield checkpoint correct');
            });

            renderSeesaw();
            renderBasement();
            renderShield();
            renderCheckpoints();
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const next = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'focus_algebra_block' && typeof call.arguments?.block === 'string') {
                    const block = call.arguments.block.toLowerCase();
                    if (block.includes('seesaw')) {
                        next.seesawFeedback = 'Tutor focus: keep operations symmetric on both sides of the equals pivot.';
                    }
                    if (block.includes('basement')) {
                        next.basementFeedback = 'Tutor focus: un-bury denominator variables before isolation.';
                    }
                    if (block.includes('shield')) {
                        next.shieldFeedback = 'Tutor focus: preserve multi-character symbols such as DeltaT as one token.';
                    }
                }
            });
            return next;
        }
    };
}
