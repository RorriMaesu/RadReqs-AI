export function createPhase1Arithmetic() {
    return {
        id: 'phase1',
        label: 'Arithmetic Bridge',
        title: 'Phase 1: Concrete Arithmetic Bridge',
        getInitialState() {
            return {
                decaScaleIndex: 0,
                netCharge: 0,
                protonCount: 0,
                electronCount: 0,
                fractionA: { n: 3, d: 4 },
                fractionB: { n: 2, d: 5 },
                fractionResultText: 'Press Run Division to see the reciprocal flip before solving.',
                lineNarration: 'Net charge starts neutral at 0. Add protons to move right or electrons to move left.',
                decaCheckpointFeedback: '',
                numberLineCheckpointFeedback: '',
                fractionCheckpointFeedback: ''
            };
        },
        mount({ host, state, onStateChange }) {
            host.innerHTML = `
                <style>
                    .p1-wrap {
                        display: grid;
                        gap: 1.2rem;
                    }
                    .p1-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .p1-card h2 {
                        margin: 0 0 0.6rem;
                        color: #0f172a;
                    }
                    .p1-card p {
                        color: #334155;
                        line-height: 1.6;
                        margin: 0.6rem 0;
                    }
                    .p1-mini {
                        color: #475569;
                        font-size: 0.92rem;
                    }
                    .p1-controls {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
                        gap: 0.65rem;
                        margin-top: 0.8rem;
                    }
                    .p1-btn {
                        border: 1px solid #1d4ed8;
                        background: #2563eb;
                        color: #ffffff;
                        border-radius: 10px;
                        padding: 0.55rem 0.8rem;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .p1-btn.p1-ghost {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .p1-input {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.52rem 0.62rem;
                        width: 100%;
                        font: inherit;
                    }
                    .p1-kpi {
                        margin-top: 0.5rem;
                        padding: 0.5rem 0.65rem;
                        background: #f8fafc;
                        border-radius: 10px;
                        border: 1px solid #e2e8f0;
                        color: #0f172a;
                        font-weight: 600;
                    }
                    .p1-deca-grid {
                        margin-top: 0.8rem;
                        display: grid;
                        grid-template-columns: repeat(10, minmax(0, 1fr));
                        gap: 3px;
                        max-width: 400px;
                    }
                    .p1-cell {
                        aspect-ratio: 1 / 1;
                        background: #e2e8f0;
                        border: 1px solid #cbd5e1;
                        border-radius: 2px;
                        position: relative;
                        overflow: hidden;
                    }
                    .p1-cell.is-on {
                        background: #93c5fd;
                        border-color: #3b82f6;
                    }
                    .p1-cell.is-thousandth::after {
                        content: '';
                        position: absolute;
                        width: 10%;
                        height: 10%;
                        left: 45%;
                        top: 45%;
                        border-radius: 999px;
                        background: #0c4a6e;
                        box-shadow: 0 0 0 1px #082f49;
                    }
                    .p1-line-wrap {
                        margin-top: 0.8rem;
                        border: 1px solid #d7e0ee;
                        border-radius: 14px;
                        padding: 0.9rem;
                        background: linear-gradient(180deg, #ffffff, #f8fbff);
                    }
                    .p1-line {
                        position: relative;
                        height: 90px;
                    }
                    .p1-line-track {
                        position: absolute;
                        top: 38px;
                        left: 5%;
                        right: 5%;
                        height: 4px;
                        background: #94a3b8;
                        border-radius: 999px;
                    }
                    .p1-tick {
                        position: absolute;
                        top: 30px;
                        width: 1px;
                        height: 20px;
                        background: #64748b;
                        transform: translateX(-50%);
                    }
                    .p1-tick-label {
                        position: absolute;
                        top: 54px;
                        font-size: 0.72rem;
                        color: #334155;
                        transform: translateX(-50%);
                        white-space: nowrap;
                    }
                    .p1-zero {
                        background: #0f172a;
                        width: 2px;
                    }
                    .p1-cursor,
                    .p1-check-runner {
                        position: absolute;
                        width: 28px;
                        height: 28px;
                        border-radius: 999px;
                        transform: translateX(-50%);
                    }
                    .p1-cursor {
                        top: 24px;
                        background: #0ea5e9;
                        border: 2px solid #0369a1;
                        box-shadow: 0 2px 0 #075985;
                    }
                    .p1-check-runner {
                        top: 10px;
                        background: #f97316;
                        border: 2px solid #c2410c;
                        box-shadow: 0 2px 0 #9a3412;
                    }
                    .p1-cursor::after,
                    .p1-check-runner::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        top: 26px;
                        border-left: 7px solid transparent;
                        border-right: 7px solid transparent;
                    }
                    .p1-cursor::after {
                        border-top: 10px solid #0369a1;
                    }
                    .p1-check-runner::after {
                        border-top: 10px solid #c2410c;
                    }
                    .p1-cross-zero-path {
                        position: absolute;
                        top: 36px;
                        height: 8px;
                        background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
                        border-radius: 999px;
                        opacity: 0;
                        transition: opacity 0.25s ease;
                    }
                    .p1-cross-zero-path.visible {
                        opacity: 0.95;
                    }
                    .p1-fractions {
                        margin-top: 0.8rem;
                        display: grid;
                        gap: 0.7rem;
                    }
                    .p1-strip {
                        display: flex;
                        border: 1px solid #cbd5e1;
                        border-radius: 9px;
                        overflow: hidden;
                        min-height: 34px;
                        background: #e2e8f0;
                    }
                    .p1-segment {
                        flex: 1;
                        border-right: 1px solid #cbd5e1;
                        background: #dbeafe;
                    }
                    .p1-segment:last-child {
                        border-right: none;
                    }
                    .p1-segment.on {
                        background: #60a5fa;
                    }
                    .p1-equation {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        flex-wrap: wrap;
                    }
                    .p1-frac {
                        display: inline-grid;
                        grid-template-rows: auto auto auto;
                        justify-items: center;
                        min-width: 54px;
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .p1-frac .bar {
                        width: 100%;
                        height: 2px;
                        background: #0f172a;
                    }
                    .p1-flip-scene {
                        perspective: 800px;
                        width: 80px;
                        height: 74px;
                    }
                    .p1-flip-card {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        transform-style: preserve-3d;
                        transition: transform 0.8s ease;
                    }
                    .p1-flip-card.is-flipped {
                        transform: rotateX(180deg);
                    }
                    .p1-flip-card.is-shaking {
                        animation: p1-shake 0.45s linear;
                    }
                    @keyframes p1-shake {
                        0% { transform: translateX(0); }
                        20% { transform: translateX(-5px); }
                        40% { transform: translateX(5px); }
                        60% { transform: translateX(-4px); }
                        80% { transform: translateX(4px); }
                        100% { transform: translateX(0); }
                    }
                    .p1-face {
                        position: absolute;
                        inset: 0;
                        backface-visibility: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff7ed;
                        border: 1px solid #fdba74;
                        border-radius: 10px;
                    }
                    .p1-face.back {
                        transform: rotateX(180deg);
                        background: #ecfeff;
                        border-color: #67e8f9;
                    }
                    .p1-result {
                        margin-top: 0.5rem;
                        border: 1px solid #bfdbfe;
                        background: #eff6ff;
                        color: #1e3a8a;
                        border-radius: 10px;
                        padding: 0.62rem;
                        line-height: 1.5;
                    }
                    .p1-checkpoint {
                        margin-top: 0.9rem;
                        border: 1px dashed #93c5fd;
                        border-radius: 12px;
                        padding: 0.8rem;
                        background: #f8fbff;
                    }
                    .p1-checkpoint h3 {
                        margin: 0 0 0.5rem;
                        color: #1e3a8a;
                        font-size: 1rem;
                    }
                    .p1-check-feedback {
                        margin-top: 0.55rem;
                        border-radius: 10px;
                        padding: 0.55rem 0.65rem;
                        border: 1px solid #cbd5e1;
                        background: #ffffff;
                        color: #334155;
                    }
                </style>

                <section class="p1-wrap">
                    <article class="p1-card">
                        <h2>1) Deca-Grid Lesson and Sandbox: Place Value and Metric Scale</h2>
                        <p>
                            A decimal place is a location with meaning, not decoration. The first place to the right of a whole number is the tenths place,
                            which means one part out of ten equal parts. The next place is hundredths, one part out of one hundred, and the next is thousandths,
                            one part out of one thousand. When a value changes from 1.0 to 0.1 to 0.01 to 0.001, you are not typing smaller symbols for style.
                            You are shrinking the quantity by factors of ten each time.
                        </p>
                        <p>
                            Chemistry beginners live inside this base-10 world every day. A milligram is 0.001 grams, and a milliliter is 0.001 liters.
                            Lab scales and volumetric tools are built to detect tiny fractions of a base unit, so your comfort with tenths, hundredths, and
                            thousandths directly controls whether your measurements are believable. If you can picture these place values physically, dimensional
                            analysis and concentration calculations become much less intimidating.
                        </p>
                        <p>
                            The slider below is designed to break the myth that moving a decimal point is a magic trick. Each move left or right corresponds
                            to multiplying or dividing by 10. Watch the hundred-cell deca-grid contract from a full unit to one tenth, then one hundredth,
                            then to a thousandth marker. You are seeing quantity compression, not symbol shuffling.
                        </p>

                        <div class="p1-controls">
                            <label>
                                Scale step
                                <input id="p1-deca-slider" class="p1-input" type="range" min="0" max="3" step="1" value="${Number.isFinite(state.decaScaleIndex) ? state.decaScaleIndex : 0}" />
                            </label>
                            <div id="p1-deca-kpi" class="p1-kpi"></div>
                        </div>
                        <div id="p1-deca-grid" class="p1-deca-grid" aria-live="polite"></div>
                        <p id="p1-deca-caption" class="p1-mini"></p>

                        <div class="p1-checkpoint">
                            <h3>Test Your Intuition</h3>
                            <p class="p1-mini">If you change a measurement from 1.0 grams to 0.001 grams, did you make the value 1,000 times larger or 1,000 times smaller?</p>
                            <div class="p1-controls">
                                <button id="p1-deca-wrong" class="p1-btn p1-ghost">1,000 times larger</button>
                                <button id="p1-deca-right" class="p1-btn">1,000 times smaller</button>
                            </div>
                            <div id="p1-deca-check-feedback" class="p1-check-feedback">${state.decaCheckpointFeedback || 'Choose one answer and read the coaching feedback.'}</div>
                        </div>
                    </article>

                    <article class="p1-card">
                        <h2>2) Signed Number Line Canvas: Charges and Changes</h2>
                        <p>
                            Negative numbers are directional positions, not bad numbers. On a number line, values to the right are positive and values to
                            the left are negative. Zero is a real location separating those directions. In chemistry language, a proton contributes +1 and pushes
                            net charge one physical step right, while an electron contributes -1 and pushes net charge one physical step left.
                        </p>
                        <p>
                            This is the same movement logic used when you calculate a temperature change: delta T equals T final minus T initial.
                            If you start below zero and finish above zero, your change is not abstract; it is travel across the zero point on a signed line.
                            If you move the other direction, the change is negative because your final state is left of where you began.
                        </p>
                        <p>
                            Use the proton and electron controls to move the cursor. Every click advances by exactly one unit and the animation shows the travel,
                            so your eyes and your arithmetic stay connected. Charge bookkeeping becomes far easier when you treat signs as direction and distance.
                        </p>

                        <div class="p1-controls">
                            <button id="p1-add-proton" class="p1-btn">Add Proton (+1 step right)</button>
                            <button id="p1-add-electron" class="p1-btn p1-ghost">Add Electron (-1 step left)</button>
                            <div id="p1-charge-kpi" class="p1-kpi"></div>
                        </div>

                        <div class="p1-line-wrap">
                            <div id="p1-line" class="p1-line" aria-live="polite">
                                <div class="p1-line-track"></div>
                            </div>
                        </div>
                        <p id="p1-line-caption" class="p1-mini"></p>

                        <div class="p1-checkpoint">
                            <h3>Test Your Intuition</h3>
                            <p class="p1-mini">If a reaction starts at -3 C and ends at +5 C, what is delta T?</p>
                            <div class="p1-controls">
                                <button id="p1-temp-trap" class="p1-btn p1-ghost">2 C</button>
                                <button id="p1-temp-correct" class="p1-btn">8 C</button>
                            </div>
                            <div class="p1-line-wrap">
                                <div id="p1-check-line" class="p1-line">
                                    <div class="p1-line-track"></div>
                                </div>
                            </div>
                            <div id="p1-line-check-feedback" class="p1-check-feedback">${state.numberLineCheckpointFeedback || 'Try one answer. The animation will show the travel from -3 to +5 across zero.'}</div>
                        </div>
                    </article>

                    <article class="p1-card">
                        <h2>3) Fraction Action Sandbox: The Active Division Line</h2>
                        <p>
                            A fraction bar is an instruction line that says divide. When you read numerator over denominator, you are reading
                            numerator divided by denominator. This interpretation removes guessing. For example, 3 over 4 means split one whole into
                            four equal parts and select three of those parts. The denominator sets the partition size, and the numerator counts how many
                            partitions are active.
                        </p>
                        <p>
                            Chemistry units are filled with this exact division command. Density in grams per milliliter means grams divided by milliliters:
                            how many grams of matter fit into one single unit-box of volume. If a sample is 1.20 g/mL, each one-milliliter box holds 1.20 grams.
                            The bar is telling you to compute amount per one unit of the denominator, not to memorize disconnected symbols.
                        </p>
                        <p>
                            In division of fractions, the second fraction must become its reciprocal before multiplication. That flip is mandatory mathematics,
                            so this workspace animates the second fraction turning upside down before the final product appears. The animation forces the rule
                            into memory: keep the first fraction, change division to multiplication, flip the second fraction.
                        </p>

                        <div class="p1-controls">
                            <label>First fraction numerator
                                <input id="p1-a-num" class="p1-input" type="number" min="1" step="1" value="${state.fractionA?.n || 3}" />
                            </label>
                            <label>First fraction denominator
                                <input id="p1-a-den" class="p1-input" type="number" min="1" step="1" value="${state.fractionA?.d || 4}" />
                            </label>
                            <label>Second fraction numerator
                                <input id="p1-b-num" class="p1-input" type="number" min="1" step="1" value="${state.fractionB?.n || 2}" />
                            </label>
                            <label>Second fraction denominator
                                <input id="p1-b-den" class="p1-input" type="number" min="1" step="1" value="${state.fractionB?.d || 5}" />
                            </label>
                            <button id="p1-fraction-run" class="p1-btn">Run Division With Reciprocal Flip</button>
                        </div>

                        <div class="p1-fractions">
                            <div>
                                <div class="p1-mini">Visual partition for first fraction</div>
                                <div id="p1-strip-a" class="p1-strip"></div>
                            </div>
                            <div>
                                <div class="p1-mini">Visual partition for second fraction</div>
                                <div id="p1-strip-b" class="p1-strip"></div>
                            </div>

                            <div class="p1-equation">
                                <div id="p1-frac-a" class="p1-frac"></div>
                                <span>divide</span>
                                <div class="p1-flip-scene">
                                    <div id="p1-flip-card" class="p1-flip-card">
                                        <div class="p1-face front"><div id="p1-frac-b-front" class="p1-frac"></div></div>
                                        <div class="p1-face back"><div id="p1-frac-b-back" class="p1-frac"></div></div>
                                    </div>
                                </div>
                                <span>equals</span>
                                <div id="p1-frac-result" class="p1-frac"></div>
                            </div>
                        </div>
                        <div id="p1-fraction-feedback" class="p1-result">${state.fractionResultText}</div>

                        <div class="p1-checkpoint">
                            <h3>Test Your Intuition</h3>
                            <p class="p1-mini">Checkpoint problem: (3/4) divide (2/5). Enter the final simplified fraction as numerator and denominator. If you skip the reciprocal flip, the card will shake to warn you.</p>
                            <div class="p1-controls">
                                <label>Checkpoint numerator
                                    <input id="p1-check-num" class="p1-input" type="number" min="1" step="1" value="15" />
                                </label>
                                <label>Checkpoint denominator
                                    <input id="p1-check-den" class="p1-input" type="number" min="1" step="1" value="8" />
                                </label>
                                <button id="p1-fraction-check-submit" class="p1-btn">Check Fraction Reasoning</button>
                            </div>
                            <div id="p1-fraction-check-feedback" class="p1-check-feedback">${state.fractionCheckpointFeedback || 'Solve first, then press check.'}</div>
                        </div>
                    </article>
                </section>
            `;

            const decaSlider = host.querySelector('#p1-deca-slider');
            const decaGrid = host.querySelector('#p1-deca-grid');
            const decaCaption = host.querySelector('#p1-deca-caption');
            const decaKpi = host.querySelector('#p1-deca-kpi');
            const decaWrongBtn = host.querySelector('#p1-deca-wrong');
            const decaRightBtn = host.querySelector('#p1-deca-right');
            const decaCheckFeedback = host.querySelector('#p1-deca-check-feedback');

            const lineEl = host.querySelector('#p1-line');
            const checkLineEl = host.querySelector('#p1-check-line');
            const addProtonBtn = host.querySelector('#p1-add-proton');
            const addElectronBtn = host.querySelector('#p1-add-electron');
            const chargeKpi = host.querySelector('#p1-charge-kpi');
            const lineCaption = host.querySelector('#p1-line-caption');
            const tempTrapBtn = host.querySelector('#p1-temp-trap');
            const tempCorrectBtn = host.querySelector('#p1-temp-correct');
            const lineCheckFeedback = host.querySelector('#p1-line-check-feedback');

            const inputANum = host.querySelector('#p1-a-num');
            const inputADen = host.querySelector('#p1-a-den');
            const inputBNum = host.querySelector('#p1-b-num');
            const inputBDen = host.querySelector('#p1-b-den');
            const runFractionBtn = host.querySelector('#p1-fraction-run');
            const stripA = host.querySelector('#p1-strip-a');
            const stripB = host.querySelector('#p1-strip-b');
            const fracAEl = host.querySelector('#p1-frac-a');
            const fracBFrontEl = host.querySelector('#p1-frac-b-front');
            const fracBBackEl = host.querySelector('#p1-frac-b-back');
            const fracResultEl = host.querySelector('#p1-frac-result');
            const flipCardEl = host.querySelector('#p1-flip-card');
            const fractionFeedback = host.querySelector('#p1-fraction-feedback');
            const checkNumInput = host.querySelector('#p1-check-num');
            const checkDenInput = host.querySelector('#p1-check-den');
            const fractionCheckSubmit = host.querySelector('#p1-fraction-check-submit');
            const fractionCheckFeedback = host.querySelector('#p1-fraction-check-feedback');

            const decaSteps = [
                { value: 1, text: '1.0 = one whole unit. All 100 of 100 hundredth blocks are active.', activeCells: 100, thousandthDot: false },
                { value: 0.1, text: '0.1 = one tenth of a unit. You now keep only 10 of 100 blocks.', activeCells: 10, thousandthDot: false },
                { value: 0.01, text: '0.01 = one hundredth. One tiny square survives out of 100.', activeCells: 1, thousandthDot: false },
                { value: 0.001, text: '0.001 = one thousandth. Even one hundredth is divided by 10 again, shown as a micro-dot.', activeCells: 1, thousandthDot: true }
            ];

            const clampCharge = (n) => Math.max(-10, Math.min(10, n));
            const chargeToLeftPercent = (charge) => 5 + ((charge + 10) / 20) * 90;

            const asInt = (value, fallback) => {
                const n = Number.parseInt(value, 10);
                return Number.isFinite(n) && n > 0 ? n : fallback;
            };

            const gcd = (a, b) => {
                let x = Math.abs(a);
                let y = Math.abs(b);
                while (y !== 0) {
                    const r = x % y;
                    x = y;
                    y = r;
                }
                return x || 1;
            };

            const formatFraction = (el, n, d) => {
                el.innerHTML = `<div>${n}</div><div class="bar"></div><div>${d}</div>`;
            };

            const renderStrip = (el, n, d) => {
                const safeD = Math.max(1, d);
                const safeN = Math.max(0, Math.min(n, safeD));
                el.innerHTML = '';
                for (let i = 0; i < safeD; i += 1) {
                    const seg = document.createElement('div');
                    seg.className = `p1-segment ${i < safeN ? 'on' : ''}`;
                    el.appendChild(seg);
                }
            };

            const buildDecaGrid = () => {
                decaGrid.innerHTML = '';
                for (let i = 0; i < 100; i += 1) {
                    const cell = document.createElement('div');
                    cell.className = 'p1-cell';
                    decaGrid.appendChild(cell);
                }
            };

            const renderDecaGrid = () => {
                const index = Math.max(0, Math.min(3, Number(decaSlider.value)));
                const step = decaSteps[index];
                const cells = decaGrid.querySelectorAll('.p1-cell');

                cells.forEach((cell, i) => {
                    cell.classList.toggle('is-on', i < step.activeCells);
                    cell.classList.remove('is-thousandth');
                });

                if (step.thousandthDot && cells[0]) {
                    cells[0].classList.add('is-thousandth');
                }

                decaKpi.textContent = `Scale value: ${step.value}`;
                decaCaption.textContent = `${step.text} In metric language: ${step.value} g of a 1 g standard equals ${step.value * 1000} mg.`;
                state.decaScaleIndex = index;
                onStateChange({ ...state }, 'Phase 1 deca-grid updated');
            };

            const buildNumberLine = () => {
                lineEl.innerHTML = '<div class="p1-line-track"></div>';
                for (let v = -10; v <= 10; v += 1) {
                    const tick = document.createElement('div');
                    tick.className = `p1-tick ${v === 0 ? 'p1-zero' : ''}`;
                    tick.style.left = `${chargeToLeftPercent(v)}%`;

                    const label = document.createElement('div');
                    label.className = 'p1-tick-label';
                    label.style.left = `${chargeToLeftPercent(v)}%`;
                    label.textContent = v > 0 ? `+${v}` : `${v}`;

                    lineEl.appendChild(tick);
                    lineEl.appendChild(label);
                }

                const cursor = document.createElement('div');
                cursor.id = 'p1-cursor';
                cursor.className = 'p1-cursor';
                cursor.style.left = `${chargeToLeftPercent(clampCharge(state.netCharge || 0))}%`;
                lineEl.appendChild(cursor);
            };

            const buildCheckpointLine = () => {
                checkLineEl.innerHTML = '<div class="p1-line-track"></div>';
                for (let v = -10; v <= 10; v += 1) {
                    const tick = document.createElement('div');
                    tick.className = `p1-tick ${v === 0 ? 'p1-zero' : ''}`;
                    tick.style.left = `${chargeToLeftPercent(v)}%`;

                    const label = document.createElement('div');
                    label.className = 'p1-tick-label';
                    label.style.left = `${chargeToLeftPercent(v)}%`;
                    label.textContent = v > 0 ? `+${v}` : `${v}`;

                    checkLineEl.appendChild(tick);
                    checkLineEl.appendChild(label);
                }

                const path = document.createElement('div');
                path.id = 'p1-cross-zero-path';
                path.className = 'p1-cross-zero-path';
                checkLineEl.appendChild(path);

                const runner = document.createElement('div');
                runner.id = 'p1-check-runner';
                runner.className = 'p1-check-runner';
                runner.style.left = `${chargeToLeftPercent(-3)}%`;
                checkLineEl.appendChild(runner);
            };

            const renderChargeReadout = () => {
                const charge = clampCharge(state.netCharge || 0);
                const sign = charge > 0 ? '+' : '';
                chargeKpi.textContent = `Protons added: ${state.protonCount || 0} | Electrons added: ${state.electronCount || 0} | Net charge: ${sign}${charge}`;
                lineCaption.textContent = state.lineNarration;
            };

            const animateChargeTo = (fromCharge, toCharge) => {
                const cursor = host.querySelector('#p1-cursor');
                if (!cursor) return;

                const from = clampCharge(fromCharge);
                const to = clampCharge(toCharge);
                const duration = 300;
                const start = performance.now();

                const frame = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const current = from + (to - from) * eased;
                    cursor.style.left = `${chargeToLeftPercent(current)}%`;
                    if (t < 1) {
                        requestAnimationFrame(frame);
                    } else {
                        cursor.style.left = `${chargeToLeftPercent(to)}%`;
                    }
                };

                requestAnimationFrame(frame);
            };

            const animateCheckpointTempPath = () => {
                const runner = host.querySelector('#p1-check-runner');
                const path = host.querySelector('#p1-cross-zero-path');
                if (!runner || !path) return;

                const from = -3;
                const to = 5;
                const startLeft = chargeToLeftPercent(from);
                const endLeft = chargeToLeftPercent(to);
                path.style.left = `${Math.min(startLeft, endLeft)}%`;
                path.style.width = `${Math.abs(endLeft - startLeft)}%`;
                path.classList.add('visible');

                const duration = 750;
                const start = performance.now();
                const frame = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const current = from + (to - from) * eased;
                    runner.style.left = `${chargeToLeftPercent(current)}%`;
                    if (t < 1) requestAnimationFrame(frame);
                };

                requestAnimationFrame(frame);
            };

            const refreshFractionVisuals = () => {
                const aN = asInt(inputANum.value, 1);
                const aD = asInt(inputADen.value, 1);
                const bN = asInt(inputBNum.value, 1);
                const bD = asInt(inputBDen.value, 1);

                state.fractionA = { n: aN, d: aD };
                state.fractionB = { n: bN, d: bD };

                renderStrip(stripA, aN, aD);
                renderStrip(stripB, bN, bD);
                formatFraction(fracAEl, aN, aD);
                formatFraction(fracBFrontEl, bN, bD);
                formatFraction(fracBBackEl, bD, bN);
                onStateChange({ ...state }, 'Phase 1 fraction visuals updated');
            };

            const runFractionDivision = () => {
                refreshFractionVisuals();
                const aN = state.fractionA.n;
                const aD = state.fractionA.d;
                const bN = state.fractionB.n;
                const bD = state.fractionB.d;

                if (bN === 0) {
                    state.fractionResultText = 'The second fraction numerator cannot be zero in a division problem.';
                    fractionFeedback.textContent = state.fractionResultText;
                    onStateChange({ ...state }, 'Phase 1 invalid fraction input');
                    return;
                }

                flipCardEl.classList.remove('is-flipped');
                flipCardEl.classList.remove('is-shaking');
                void flipCardEl.offsetWidth;
                fractionFeedback.textContent = 'Step 1: Keep the first fraction. Step 2: Change division to multiplication. Step 3: Flip the second fraction.';

                setTimeout(() => {
                    flipCardEl.classList.add('is-flipped');
                }, 80);

                setTimeout(() => {
                    const nRaw = aN * bD;
                    const dRaw = aD * bN;
                    const factor = gcd(nRaw, dRaw);
                    const nSimple = nRaw / factor;
                    const dSimple = dRaw / factor;
                    formatFraction(fracResultEl, nSimple, dSimple);
                    const decimal = nSimple / dSimple;

                    state.fractionResultText = `After the reciprocal flip: (${aN}/${aD}) x (${bD}/${bN}) = ${nRaw}/${dRaw} = ${nSimple}/${dSimple} = ${decimal.toFixed(4)}.`;
                    fractionFeedback.textContent = state.fractionResultText;
                    onStateChange({ ...state }, 'Phase 1 fraction division completed');
                }, 900);
            };

            const applyChargeStep = (delta, narration) => {
                const current = clampCharge(state.netCharge || 0);
                const next = clampCharge(current + delta);

                if (next === current) {
                    state.lineNarration = 'The cursor is already at the edge of the training line (+10 or -10). Reverse direction to continue.';
                    renderChargeReadout();
                    onStateChange({ ...state }, 'Phase 1 line boundary reached');
                    return;
                }

                if (delta > 0) state.protonCount = (state.protonCount || 0) + 1;
                if (delta < 0) state.electronCount = (state.electronCount || 0) + 1;

                state.netCharge = next;
                state.lineNarration = narration;
                animateChargeTo(current, next);
                renderChargeReadout();
                onStateChange({ ...state }, 'Phase 1 number line moved');
            };

            const runDecaCheckpoint = (isCorrect) => {
                if (isCorrect) {
                    state.decaCheckpointFeedback = 'Correct: 0.001 g is 1,000 times smaller than 1.0 g. Dividing by 10 three times shrinks quantity, not expands it.';
                } else {
                    state.decaCheckpointFeedback = 'Not quite: moving from 1.0 to 0.001 does not make the amount larger. You divided by 10, then 10, then 10 again, so the value became 1/1000 of the original.';
                }
                decaCheckFeedback.textContent = state.decaCheckpointFeedback;
                onStateChange({ ...state }, 'Phase 1 deca checkpoint answered');
            };

            const runNumberLineCheckpoint = (answer) => {
                animateCheckpointTempPath();
                if (answer === 8) {
                    state.numberLineCheckpointFeedback = 'Correct: delta T = (+5) - (-3) = +8 C. On the line, you travel 3 units to zero and 5 more to +5, totaling 8.';
                } else {
                    state.numberLineCheckpointFeedback = 'Common trap detected: 2 C ignores the crossing through zero. You must compute final minus initial: (+5) - (-3) = +8 C, which is a full 8-step move.';
                }
                lineCheckFeedback.textContent = state.numberLineCheckpointFeedback;
                onStateChange({ ...state }, 'Phase 1 number line checkpoint answered');
            };

            const runFractionCheckpoint = () => {
                const n = asInt(checkNumInput.value, 1);
                const d = asInt(checkDenInput.value, 1);
                const divisorGcd = gcd(n, d);
                const nSimple = n / divisorGcd;
                const dSimple = d / divisorGcd;

                const correct = nSimple === 15 && dSimple === 8;
                const trap = nSimple === 3 && dSimple === 10;

                if (correct) {
                    state.fractionCheckpointFeedback = 'Correct: (3/4) divide (2/5) becomes (3/4) x (5/2) = 15/8. You flipped the divisor and then multiplied.';
                    flipCardEl.classList.remove('is-shaking');
                } else if (trap) {
                    state.fractionCheckpointFeedback = 'You multiplied straight across without flipping the divisor. The second fraction must turn into its reciprocal first.';
                    flipCardEl.classList.remove('is-flipped');
                    flipCardEl.classList.remove('is-shaking');
                    void flipCardEl.offsetWidth;
                    flipCardEl.classList.add('is-shaking');
                } else {
                    state.fractionCheckpointFeedback = 'Close check: rewrite as keep-change-flip, then multiply and simplify. For this checkpoint, the target is 15/8.';
                    flipCardEl.classList.remove('is-shaking');
                }

                fractionCheckFeedback.textContent = state.fractionCheckpointFeedback;
                onStateChange({ ...state }, 'Phase 1 fraction checkpoint answered');
            };

            buildDecaGrid();
            decaSlider.value = String(Math.max(0, Math.min(3, Number(state.decaScaleIndex) || 0)));
            renderDecaGrid();

            buildNumberLine();
            renderChargeReadout();
            buildCheckpointLine();

            refreshFractionVisuals();

            decaSlider.addEventListener('input', renderDecaGrid);
            addProtonBtn.addEventListener('click', () => {
                const prior = clampCharge(state.netCharge || 0);
                const narration = prior < 0
                    ? 'A proton moved the marker right toward zero. This is the same directional idea as warming from a negative temperature.'
                    : 'A proton added +1, so the marker stepped right on the signed line.';
                applyChargeStep(1, narration);
            });
            addElectronBtn.addEventListener('click', () => {
                const prior = clampCharge(state.netCharge || 0);
                const narration = prior > 0
                    ? 'An electron moved the marker left toward zero. You are physically reducing positive charge.'
                    : 'An electron added -1, so the marker stepped left on the signed line.';
                applyChargeStep(-1, narration);
            });

            runFractionBtn.addEventListener('click', runFractionDivision);
            decaWrongBtn.addEventListener('click', () => runDecaCheckpoint(false));
            decaRightBtn.addEventListener('click', () => runDecaCheckpoint(true));
            tempTrapBtn.addEventListener('click', () => runNumberLineCheckpoint(2));
            tempCorrectBtn.addEventListener('click', () => runNumberLineCheckpoint(8));
            fractionCheckSubmit.addEventListener('click', runFractionCheckpoint);

            [inputANum, inputADen, inputBNum, inputBDen].forEach((input) => {
                input.addEventListener('input', refreshFractionVisuals);
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_number_line_charge' && Number.isFinite(call.arguments?.value)) {
                    nextState.netCharge = Math.max(-10, Math.min(10, Number(call.arguments.value)));
                }
                if (call?.name === 'set_deca_scale' && Number.isFinite(call.arguments?.index)) {
                    nextState.decaScaleIndex = Math.max(0, Math.min(3, Number(call.arguments.index)));
                }
            });
            return nextState;
        }
    };
}
