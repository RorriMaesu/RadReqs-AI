export function createPhase2Exponents() {
    return {
        id: 'phase2',
        label: 'Exponents & E-Notation',
        title: 'Phase 2: Exponents and Calculator Rosetta',
        getInitialState() {
            return {
                powerA: 3,
                powerB: -2,
                engineMode: 'multiply',
                notationMantissa: 6.022,
                notationExponent: 23,
                notationFeedback: 'Press How to Enter This to see calculator keystrokes in order.',
                guardrailExpression: '1.0/2.0*10^3',
                guardrailFeedback: 'Type an expression with or without denominator parentheses and run the simulation.'
            };
        },
        mount({ host, state, onStateChange }) {
            host.innerHTML = `
                <style>
                    .p2-wrap {
                        display: grid;
                        gap: 1.2rem;
                    }
                    .p2-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .p2-card h2 {
                        margin: 0 0 0.6rem;
                        color: #0f172a;
                    }
                    .p2-card p {
                        margin: 0.55rem 0;
                        color: #334155;
                        line-height: 1.6;
                    }
                    .p2-mini {
                        color: #475569;
                        font-size: 0.92rem;
                    }
                    .p2-grid {
                        display: grid;
                        gap: 0.7rem;
                        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                        margin-top: 0.8rem;
                    }
                    .p2-btn {
                        border: 1px solid #1d4ed8;
                        background: #2563eb;
                        color: #ffffff;
                        border-radius: 10px;
                        padding: 0.55rem 0.8rem;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .p2-btn.p2-ghost {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .p2-input {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.52rem 0.62rem;
                        width: 100%;
                        font: inherit;
                    }
                    .p2-kpi {
                        margin-top: 0.45rem;
                        border: 1px solid #dbeafe;
                        background: #eff6ff;
                        color: #1e3a8a;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        font-weight: 600;
                        line-height: 1.45;
                    }
                    .p2-token-row {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.3rem;
                        min-height: 36px;
                        padding: 0.4rem;
                        border-radius: 10px;
                        border: 1px solid #cbd5e1;
                        background: #f8fafc;
                    }
                    .p2-token {
                        min-width: 22px;
                        height: 22px;
                        border-radius: 999px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.8rem;
                        font-weight: 700;
                        border: 1px solid #94a3b8;
                        background: #ffffff;
                        color: #0f172a;
                    }
                    .p2-token.negative {
                        border-style: dashed;
                        background: #f1f5f9;
                        color: #64748b;
                    }
                    .p2-token.cancel {
                        background: #fee2e2;
                        border-color: #ef4444;
                        color: #991b1b;
                        text-decoration: line-through;
                    }
                    .p2-pane {
                        display: grid;
                        gap: 0.8rem;
                        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                        margin-top: 0.9rem;
                    }
                    .p2-pane-box {
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.8rem;
                        background: #f8fbff;
                    }
                    .p2-notation {
                        font-family: 'Cambria Math', 'Times New Roman', serif;
                        font-size: 1.2rem;
                        color: #0f172a;
                        margin-top: 0.35rem;
                    }
                    .p2-calc-screen {
                        background: #0b1320;
                        border: 2px solid #1f2937;
                        border-radius: 10px;
                        color: #22d3ee;
                        font-family: 'Consolas', 'Courier New', monospace;
                        font-size: 1.15rem;
                        padding: 0.7rem;
                        min-height: 2.8rem;
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                    }
                    .p2-keypad {
                        margin-top: 0.6rem;
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 0.4rem;
                    }
                    .p2-key {
                        border: 1px solid #cbd5e1;
                        border-radius: 8px;
                        padding: 0.35rem 0.2rem;
                        background: #ffffff;
                        text-align: center;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .p2-key.active {
                        border-color: #1d4ed8;
                        background: #dbeafe;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                    }
                    .p2-path {
                        display: grid;
                        gap: 0.65rem;
                        margin-top: 0.6rem;
                    }
                    .p2-path-box {
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        padding: 0.62rem;
                        background: #f8fafc;
                    }
                    .p2-path-box.active {
                        border-color: #0284c7;
                        background: #ecfeff;
                    }
                </style>

                <section class="p2-wrap">
                    <article class="p2-card">
                        <h2>1) Power-of-10 Exponent Engine</h2>
                        <p>
                            Exponents are compressed multiplication instructions. In base 10, 10^3 means 10 multiplied by itself three times.
                            When you multiply two powers of ten, you combine repeated groups, so the exponents add: 10^a x 10^b = 10^(a+b).
                            When you divide powers of ten, you cancel groups, so the exponents subtract: 10^a / 10^b = 10^(a-b).
                        </p>
                        <p>
                            Adult learners often feel this is symbolic memorization, but it is really inventory accounting for groups of ten.
                            Addition in exponents means you gained ten-groups; subtraction means you removed ten-groups. Negative exponents are
                            not errors. They are deliberate signals that your quantity moved into reciprocal scale, such as per-thousand or per-million.
                        </p>
                        <p>
                            Chemistry constantly moves between microscopic and macroscopic scales. Molecule counts can be enormous while ion concentrations
                            can be tiny. This engine lets you slide exponents and watch zero groups appear or cancel in real time so each algebra rule has
                            a visual event attached to it.
                        </p>

                        <div class="p2-grid">
                            <label>
                                Exponent a
                                <input id="p2-power-a" class="p2-input" type="range" min="-8" max="8" step="1" value="${Number.isFinite(state.powerA) ? state.powerA : 3}" />
                            </label>
                            <label>
                                Exponent b
                                <input id="p2-power-b" class="p2-input" type="range" min="-8" max="8" step="1" value="${Number.isFinite(state.powerB) ? state.powerB : -2}" />
                            </label>
                            <button id="p2-mode-toggle" class="p2-btn">Mode: ${state.engineMode === 'divide' ? 'Division (a-b)' : 'Multiplication (a+b)'}</button>
                        </div>

                        <div class="p2-grid">
                            <div>
                                <div class="p2-mini">10^a token groups</div>
                                <div id="p2-row-a" class="p2-token-row"></div>
                            </div>
                            <div>
                                <div class="p2-mini">10^b token groups</div>
                                <div id="p2-row-b" class="p2-token-row"></div>
                            </div>
                            <div>
                                <div class="p2-mini">Result after rule</div>
                                <div id="p2-row-result" class="p2-token-row"></div>
                            </div>
                        </div>
                        <div id="p2-engine-kpi" class="p2-kpi"></div>
                    </article>

                    <article class="p2-card">
                        <h2>2) E-Notation Rosetta Stone and Calculator View</h2>
                        <p>
                            Textbooks write scientific notation as mantissa times ten to a power, such as 6.022 x 10^23.
                            Calculators compress that same expression to E notation: 6.022E23. The E means "times ten to the power of".
                            It is not a different number system; it is a compact display protocol for the exact same value.
                        </p>
                        <p>
                            The biggest pitfall is manually typing "x10^" into the calculator as if the screen were a word processor.
                            Most TI and Casio models require the dedicated EE or EXP key so the device stores one scientific-notation token.
                            If you type multiplication, 10, and exponent symbols manually, many students accidentally alter operation order
                            or enter syntax the calculator does not parse as intended.
                        </p>
                        <p>
                            Use the panel below as a translation bridge. The left side shows textbook notation and the right side shows calculator notation.
                            Click How to Enter This to animate the exact button sequence so your hand pattern matches what your chemistry homework expects.
                        </p>

                        <div class="p2-grid">
                            <label>
                                Mantissa
                                <input id="p2-mantissa" class="p2-input" type="number" step="0.001" value="${Number.isFinite(state.notationMantissa) ? state.notationMantissa : 6.022}" />
                            </label>
                            <label>
                                Exponent
                                <input id="p2-notation-exp" class="p2-input" type="number" step="1" value="${Number.isFinite(state.notationExponent) ? state.notationExponent : 23}" />
                            </label>
                            <button id="p2-how-enter" class="p2-btn p2-ghost">How to Enter This</button>
                        </div>

                        <div class="p2-pane">
                            <div class="p2-pane-box">
                                <div class="p2-mini">Textbook scientific notation</div>
                                <div id="p2-textbook" class="p2-notation"></div>
                            </div>
                            <div class="p2-pane-box">
                                <div class="p2-mini">Calculator display</div>
                                <div id="p2-calc-screen" class="p2-calc-screen"></div>
                                <div class="p2-keypad">
                                    <div id="p2-key-6" class="p2-key">6</div>
                                    <div id="p2-key-dot" class="p2-key">.</div>
                                    <div id="p2-key-0" class="p2-key">0</div>
                                    <div id="p2-key-2" class="p2-key">2</div>
                                    <div id="p2-key-2b" class="p2-key">2</div>
                                    <div id="p2-key-ee" class="p2-key">EE/EXP</div>
                                    <div id="p2-key-e2" class="p2-key">2</div>
                                    <div id="p2-key-3" class="p2-key">3</div>
                                </div>
                            </div>
                        </div>
                        <div id="p2-notation-feedback" class="p2-kpi">${state.notationFeedback}</div>
                    </article>

                    <article class="p2-card">
                        <h2>3) Parenthesis Guardrail Lab</h2>
                        <p>
                            PEMDAS in chemistry is not optional because many formulas are stacked fractions. If the denominator contains multiplication,
                            that whole denominator must be grouped in parentheses. Without grouping, calculators evaluate left-to-right and can multiply
                            the power of ten back into the numerator side, producing a wrong magnitude that still looks plausible.
                        </p>
                        <p>
                            Compare these two entries: 1.0/(2.0x10^3) versus 1.0/2.0x10^3. The first keeps the denominator shielded as one unit,
                            which gives 0.0005. The second divides by 2.0 and then multiplies by 10^3, which gives 500. Same symbols, opposite scale,
                            purely because parentheses were omitted.
                        </p>
                        <p>
                            Type your own expression below in one of these formats and run the simulator. The interface will split the path to show exactly
                            what the calculator does in each case, so you can see where missing parentheses cause structural misrouting.
                        </p>

                        <div class="p2-grid">
                            <label>
                                Expression
                                <input id="p2-guard-input" class="p2-input" type="text" value="${state.guardrailExpression || '1.0/2.0*10^3'}" />
                            </label>
                            <button id="p2-guard-run" class="p2-btn">Run Guardrail Simulation</button>
                            <button id="p2-fill-paren" class="p2-btn p2-ghost">Use Parenthesized Example</button>
                            <button id="p2-fill-open" class="p2-btn p2-ghost">Use Missing-Parenthesis Example</button>
                        </div>

                        <div class="p2-path">
                            <div id="p2-path-paren" class="p2-path-box">
                                <strong>Shielded denominator path:</strong>
                                <div id="p2-path-paren-text" class="p2-mini">Awaiting simulation.</div>
                            </div>
                            <div id="p2-path-open" class="p2-path-box">
                                <strong>Unshielded left-to-right path:</strong>
                                <div id="p2-path-open-text" class="p2-mini">Awaiting simulation.</div>
                            </div>
                        </div>
                        <div id="p2-guard-feedback" class="p2-kpi">${state.guardrailFeedback}</div>
                    </article>
                </section>
            `;

            const inputPowerA = host.querySelector('#p2-power-a');
            const inputPowerB = host.querySelector('#p2-power-b');
            const modeToggleBtn = host.querySelector('#p2-mode-toggle');
            const rowA = host.querySelector('#p2-row-a');
            const rowB = host.querySelector('#p2-row-b');
            const rowResult = host.querySelector('#p2-row-result');
            const engineKpi = host.querySelector('#p2-engine-kpi');

            const mantissaInput = host.querySelector('#p2-mantissa');
            const notationExpInput = host.querySelector('#p2-notation-exp');
            const howToEnterBtn = host.querySelector('#p2-how-enter');
            const textbookEl = host.querySelector('#p2-textbook');
            const calcScreenEl = host.querySelector('#p2-calc-screen');
            const notationFeedbackEl = host.querySelector('#p2-notation-feedback');

            const guardInput = host.querySelector('#p2-guard-input');
            const guardRunBtn = host.querySelector('#p2-guard-run');
            const fillParenBtn = host.querySelector('#p2-fill-paren');
            const fillOpenBtn = host.querySelector('#p2-fill-open');
            const pathParenEl = host.querySelector('#p2-path-paren');
            const pathOpenEl = host.querySelector('#p2-path-open');
            const pathParenText = host.querySelector('#p2-path-paren-text');
            const pathOpenText = host.querySelector('#p2-path-open-text');
            const guardFeedbackEl = host.querySelector('#p2-guard-feedback');

            const renderTokens = (target, exponent, asCancel = false) => {
                target.innerHTML = '';
                const absExp = Math.min(12, Math.abs(exponent));
                if (absExp === 0) {
                    const unit = document.createElement('span');
                    unit.className = 'p2-token';
                    unit.textContent = '1';
                    target.appendChild(unit);
                    return;
                }
                for (let i = 0; i < absExp; i += 1) {
                    const token = document.createElement('span');
                    const negative = exponent < 0 ? ' negative' : '';
                    const cancel = asCancel ? ' cancel' : '';
                    token.className = `p2-token${negative}${cancel}`;
                    token.textContent = '10';
                    target.appendChild(token);
                }
            };

            const renderEngine = () => {
                const a = Number(inputPowerA.value);
                const b = Number(inputPowerB.value);
                const mode = state.engineMode === 'divide' ? 'divide' : 'multiply';

                state.powerA = a;
                state.powerB = b;

                renderTokens(rowA, a, false);
                renderTokens(rowB, b, mode === 'divide');

                const resultExp = mode === 'divide' ? a - b : a + b;
                renderTokens(rowResult, resultExp, false);

                const modeText = mode === 'divide' ? '10^a / 10^b = 10^(a-b)' : '10^a x 10^b = 10^(a+b)';
                const scaleText = resultExp >= 0
                    ? 'Result sits on macro side or whole-unit side.'
                    : 'Result sits on micro side (reciprocal scale, tiny quantities).';

                engineKpi.textContent = `${modeText} With a=${a} and b=${b}, result exponent is ${resultExp}. ${scaleText}`;
                modeToggleBtn.textContent = `Mode: ${mode === 'divide' ? 'Division (a-b)' : 'Multiplication (a+b)'}`;
                onStateChange({ ...state }, 'Phase 2 exponent engine updated');
            };

            const notationValue = () => {
                const mantissa = Number(mantissaInput.value);
                const exponent = Number(notationExpInput.value);
                return {
                    mantissa: Number.isFinite(mantissa) ? mantissa : 6.022,
                    exponent: Number.isFinite(exponent) ? exponent : 23
                };
            };

            const renderNotation = () => {
                const { mantissa, exponent } = notationValue();
                state.notationMantissa = mantissa;
                state.notationExponent = exponent;

                const mantissaText = Number(mantissa).toString();
                textbookEl.textContent = `${mantissaText} x 10^${exponent}`;
                calcScreenEl.textContent = `${mantissaText}E${exponent}`;
                onStateChange({ ...state }, 'Phase 2 notation display updated');
            };

            const clearActiveKeys = () => {
                host.querySelectorAll('.p2-key').forEach((key) => key.classList.remove('active'));
            };

            const animateKeyEntry = () => {
                clearActiveKeys();
                const keys = [
                    '#p2-key-6',
                    '#p2-key-dot',
                    '#p2-key-0',
                    '#p2-key-2',
                    '#p2-key-2b',
                    '#p2-key-ee',
                    '#p2-key-e2',
                    '#p2-key-3'
                ];
                let idx = 0;

                const step = () => {
                    if (idx > 0) {
                        const prev = host.querySelector(keys[idx - 1]);
                        if (prev) prev.classList.remove('active');
                    }
                    if (idx >= keys.length) {
                        state.notationFeedback = 'Sequence complete: mantissa digits, then EE/EXP, then exponent digits. This avoids order-of-operations typing mistakes.';
                        notationFeedbackEl.textContent = state.notationFeedback;
                        onStateChange({ ...state }, 'Phase 2 calculator sequence demonstrated');
                        return;
                    }
                    const current = host.querySelector(keys[idx]);
                    if (current) current.classList.add('active');
                    idx += 1;
                    setTimeout(step, 230);
                };

                state.notationFeedback = 'Entering now: type the mantissa first, press EE/EXP once, then type the exponent.';
                notationFeedbackEl.textContent = state.notationFeedback;
                setTimeout(step, 60);
            };

            const parseGuardrailExpression = (raw) => {
                const expr = String(raw || '').replace(/\s+/g, '');
                const withParen = expr.match(/^([0-9]+(?:\.[0-9]+)?)\/\(([0-9]+(?:\.[0-9]+)?)\*10\^(-?[0-9]+)\)$/i);
                if (withParen) {
                    return {
                        type: 'with-parentheses',
                        n: Number(withParen[1]),
                        d: Number(withParen[2]),
                        e: Number(withParen[3])
                    };
                }

                const withoutParen = expr.match(/^([0-9]+(?:\.[0-9]+)?)\/([0-9]+(?:\.[0-9]+)?)\*10\^(-?[0-9]+)$/i);
                if (withoutParen) {
                    return {
                        type: 'without-parentheses',
                        n: Number(withoutParen[1]),
                        d: Number(withoutParen[2]),
                        e: Number(withoutParen[3])
                    };
                }

                return null;
            };

            const runGuardrailSimulation = () => {
                const parsed = parseGuardrailExpression(guardInput.value);
                pathParenEl.classList.remove('active');
                pathOpenEl.classList.remove('active');

                if (!parsed) {
                    state.guardrailFeedback = 'Expression format not recognized. Use either 1.0/(2.0*10^3) or 1.0/2.0*10^3.';
                    guardFeedbackEl.textContent = state.guardrailFeedback;
                    pathParenText.textContent = 'Could not parse denominator shielded path from this entry.';
                    pathOpenText.textContent = 'Could not parse unshielded left-to-right path from this entry.';
                    onStateChange({ ...state }, 'Phase 2 guardrail parsing failed');
                    return;
                }

                state.guardrailExpression = guardInput.value;

                const { n, d, e } = parsed;
                const power = Math.pow(10, e);

                const safePath = n / (d * power);
                const openPath = (n / d) * power;

                pathParenText.textContent = `${n} / (${d} x 10^${e}) = ${safePath}`;
                pathOpenText.textContent = `${n} / ${d} x 10^${e} = ${openPath}`;

                if (parsed.type === 'with-parentheses') {
                    pathParenEl.classList.add('active');
                    state.guardrailFeedback = `Parenthesis shield detected. Calculator keeps denominator grouped, giving ${safePath}.`;
                } else {
                    pathOpenEl.classList.add('active');
                    state.guardrailFeedback = `No denominator shield detected. Calculator executed left-to-right and produced ${openPath}, which can be orders of magnitude off.`;
                }

                guardFeedbackEl.textContent = state.guardrailFeedback;
                onStateChange({ ...state }, 'Phase 2 guardrail simulation updated');
            };

            inputPowerA.addEventListener('input', renderEngine);
            inputPowerB.addEventListener('input', renderEngine);
            modeToggleBtn.addEventListener('click', () => {
                state.engineMode = state.engineMode === 'divide' ? 'multiply' : 'divide';
                renderEngine();
            });

            mantissaInput.addEventListener('input', renderNotation);
            notationExpInput.addEventListener('input', renderNotation);
            howToEnterBtn.addEventListener('click', animateKeyEntry);

            guardRunBtn.addEventListener('click', runGuardrailSimulation);
            fillParenBtn.addEventListener('click', () => {
                guardInput.value = '1.0/(2.0*10^3)';
                runGuardrailSimulation();
            });
            fillOpenBtn.addEventListener('click', () => {
                guardInput.value = '1.0/2.0*10^3';
                runGuardrailSimulation();
            });

            renderEngine();
            renderNotation();
            runGuardrailSimulation();
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const next = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_math_zoom' && Number.isFinite(Number(call.arguments?.exponent))) {
                    next.powerA = Number(call.arguments.exponent);
                }
                if (call?.name === 'set_notation_exponent' && Number.isFinite(Number(call.arguments?.value))) {
                    next.notationExponent = Number(call.arguments.value);
                }
            });
            return next;
        }
    };
}
