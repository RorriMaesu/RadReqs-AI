const createInitialStage3State = () => ({
    rowA: ['', '1', '2', '.', '4', ''],
    rowB: ['', '', '0', '.', '5', '6'],
    decimalFeedback: 'Arrange both numbers so the decimal points sit in the same vertical column before computing.',
    hopPosition: 0,
    hopFeedback: 'Raw multiplication of 3.2 × 0.45 gives 144 without a decimal. Use decimal hops to place the point correctly in 1.44.',
    checkpointFeedback: 'Mastery Checkpoint: what must align before decimal addition or subtraction is valid?'
});

export function createStage3Decimals() {
    return {
        id: 'stage3',
        label: 'Decimals and Percentage Scaling',
        title: 'Stage 3: Decimals and Percentage Scaling',
        getInitialState() {
            return createInitialStage3State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage3State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .s3-wrap { display: grid; gap: 1.2rem; }
                    .s3-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s3-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s3-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s3-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s3-pane { border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.75rem; background: #f8fafc; }
                    .s3-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s3-gridboard {
                        margin-top: 0.8rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.8rem;
                        background: #f8fbff;
                    }
                    .s3-row {
                        display: grid;
                        grid-template-columns: repeat(6, 52px);
                        gap: 0.35rem;
                        margin-bottom: 0.45rem;
                    }
                    .s3-slot {
                        width: 52px;
                        height: 52px;
                        border: 2px dashed #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .s3-slot.decimal { border-color: #0ea5e9; background: #ecfeff; }
                    .s3-cardchip {
                        width: 42px;
                        height: 42px;
                        border: 1px solid #94a3b8;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #ffffff;
                        color: #0f172a;
                        font-weight: 800;
                        cursor: pointer;
                    }
                    .s3-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.55rem 0.8rem;
                        font-weight: 700;
                        cursor: pointer;
                    }
                    .s3-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .s3-controls { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 0.72rem; }
                    .s3-hop {
                        margin-top: 0.75rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.8rem;
                        background: #f8fbff;
                    }
                    .s3-hop-row {
                        display: grid;
                        grid-template-columns: repeat(6, 50px);
                        gap: 0.35rem;
                        margin-top: 0.55rem;
                    }
                    .s3-hop-cell {
                        height: 50px;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #ffffff;
                        font-weight: 700;
                    }
                    .s3-hop-cell.active {
                        border-color: #1d4ed8;
                        background: #dbeafe;
                    }
                    .s3-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s3-wrap">
                    <article class="s3-card">
                        <h2>Stage Framework</h2>
                        <div class="s3-framework">
                            <div class="s3-pane"><strong>Conceptual Anchor</strong><p>Decimals are place-value maps. Every digit only makes sense when its position is correct relative to the decimal point.</p></div>
                            <div class="s3-pane"><strong>Mechanical Algorithm</strong><p>For addition and subtraction, decimal points must align vertically first. For multiplication, you can multiply whole-number forms and then hop the decimal into the final answer.</p></div>
                            <div class="s3-pane"><strong>Cognitive Trap</strong><p>The trap is lining digits up by the left edge instead of by place value. That mixes tenths with ones and hundredths with tenths.</p></div>
                            <div class="s3-pane"><strong>Science Bridge</strong><p>Percent solutions, dosage values, and laboratory readings depend on correct decimal placement. A one-place error can change a safe value into a dangerous one.</p></div>
                        </div>
                    </article>

                    <article class="s3-card">
                        <h2>Decimal Point Vertical Grid Alignment Tool</h2>
                        <p>Click the cards in a row to cycle each number left or right until the decimal points snap into the same column. Calculation stays blocked until vertical alignment is correct.</p>
                        <div class="s3-gridboard">
                            <div class="s3-row" id="s3-row-a"></div>
                            <div class="s3-row" id="s3-row-b"></div>
                            <div class="s3-controls">
                                <button id="s3-check-align" class="s3-btn">Validate Alignment</button>
                                <button id="s3-reset-align" class="s3-btn ghost">Reset Decimal Grid</button>
                            </div>
                            <div id="s3-feedback" class="s3-feedback">${state.decimalFeedback}</div>
                        </div>
                    </article>

                    <article class="s3-card">
                        <h2>Decimal Hopping Utility for Multiplication</h2>
                        <p>Multiply 3.2 by 0.45 as whole numbers first: 32 × 45 = 1440, then compress to the trimmed raw digits 144. The product needs two decimal places total, so you must hop the decimal point manually until the final form reads 1.44.</p>
                        <div class="s3-hop">
                            <div class="s3-mini">Current decimal location is shown by the highlighted cell boundary before a digit.</div>
                            <div class="s3-hop-row" id="s3-hop-row"></div>
                            <div class="s3-controls">
                                <button id="s3-hop-left" class="s3-btn ghost">Hop Decimal Left</button>
                                <button id="s3-hop-right" class="s3-btn ghost">Hop Decimal Right</button>
                                <button id="s3-hop-check" class="s3-btn">Check Product Placement</button>
                            </div>
                            <div id="s3-hop-feedback" class="s3-feedback">${state.hopFeedback}</div>
                        </div>
                    </article>

                    <article class="s3-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>Before adding 12.4 and 0.56, what must align?</p>
                        <div class="s3-controls">
                            <button id="s3-check-trap" class="s3-btn ghost">The leftmost digits only</button>
                            <button id="s3-check-right" class="s3-btn">The decimal points so each place value stays in its column</button>
                        </div>
                        <div id="s3-check-feedback" class="s3-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const feedbackEl = host.querySelector('#s3-feedback');
            const hopFeedbackEl = host.querySelector('#s3-hop-feedback');
            const checkFeedbackEl = host.querySelector('#s3-check-feedback');

            const shiftRow = (row) => {
                const copy = row.slice();
                copy.push(copy.shift());
                return copy;
            };

            const renderAlignmentRows = () => {
                const rowAEl = host.querySelector('#s3-row-a');
                const rowBEl = host.querySelector('#s3-row-b');
                rowAEl.innerHTML = '';
                rowBEl.innerHTML = '';

                state.rowA.forEach((char, idx) => {
                    const slot = document.createElement('div');
                    slot.className = `s3-slot ${char === '.' ? 'decimal' : ''}`;
                    slot.innerHTML = `<button class="s3-cardchip" data-row="a" data-index="${idx}">${char || ' '}</button>`;
                    rowAEl.appendChild(slot);
                });

                state.rowB.forEach((char, idx) => {
                    const slot = document.createElement('div');
                    slot.className = `s3-slot ${char === '.' ? 'decimal' : ''}`;
                    slot.innerHTML = `<button class="s3-cardchip" data-row="b" data-index="${idx}">${char || ' '}</button>`;
                    rowBEl.appendChild(slot);
                });
            };

            const renderHopRow = () => {
                const hopRowEl = host.querySelector('#s3-hop-row');
                const layout = ['', '1', '4', '4', '', ''];
                hopRowEl.innerHTML = '';
                layout.forEach((char, idx) => {
                    const cell = document.createElement('div');
                    cell.className = `s3-hop-cell ${idx === state.hopPosition ? 'active' : ''}`;
                    cell.textContent = char || '|';
                    hopRowEl.appendChild(cell);
                });
                hopFeedbackEl.textContent = state.hopFeedback;
            };

            renderAlignmentRows();
            renderHopRow();

            host.addEventListener('click', (event) => {
                const chip = event.target.closest('[data-row]');
                if (!chip) return;
                const rowName = chip.getAttribute('data-row');
                if (rowName === 'a') {
                    state.rowA = shiftRow(state.rowA);
                }
                if (rowName === 'b') {
                    state.rowB = shiftRow(state.rowB);
                }
                renderAlignmentRows();
                onStateChange({ ...state }, 'Stage 3 decimal row shifted');
            });

            host.querySelector('#s3-check-align').addEventListener('click', () => {
                const rowADec = state.rowA.indexOf('.');
                const rowBDec = state.rowB.indexOf('.');
                if (rowADec !== rowBDec) {
                    state.decimalFeedback = 'Alignment blocked: decimal points are not stacked in the same column yet.';
                } else {
                    state.decimalFeedback = 'Correct. Now ones, tenths, and hundredths all line up vertically, so addition or subtraction can proceed honestly.';
                }
                feedbackEl.textContent = state.decimalFeedback;
                onStateChange({ ...state }, 'Stage 3 alignment checked');
            });

            host.querySelector('#s3-reset-align').addEventListener('click', () => {
                Object.assign(state, createInitialStage3State());
                renderAlignmentRows();
                renderHopRow();
                feedbackEl.textContent = state.decimalFeedback;
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 3 reset');
            });

            host.querySelector('#s3-hop-left').addEventListener('click', () => {
                state.hopPosition = Math.max(0, state.hopPosition - 1);
                state.hopFeedback = 'Each hop left makes the number ten times smaller by moving the decimal one place.';
                renderHopRow();
                onStateChange({ ...state }, 'Stage 3 decimal hop left');
            });

            host.querySelector('#s3-hop-right').addEventListener('click', () => {
                state.hopPosition = Math.min(5, state.hopPosition + 1);
                state.hopFeedback = 'Each hop right makes the number ten times larger. Watch place value, not just the printed digits.';
                renderHopRow();
                onStateChange({ ...state }, 'Stage 3 decimal hop right');
            });

            host.querySelector('#s3-hop-check').addEventListener('click', () => {
                if (state.hopPosition === 1) {
                    state.hopFeedback = 'Correct. With the decimal before the first 1, the product is 1.44.';
                } else {
                    state.hopFeedback = 'Not yet. The final answer should be 1.44, so the decimal must sit before the first digit 1.';
                }
                renderHopRow();
                onStateChange({ ...state }, 'Stage 3 decimal hop checked');
            });

            host.querySelector('#s3-check-trap').addEventListener('click', () => {
                state.checkpointFeedback = 'Trap detected: left-edge alignment mixes place values. Decimals must align vertically so ones, tenths, and hundredths stay matched.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 3 checkpoint corrected');
            });

            host.querySelector('#s3-check-right').addEventListener('click', () => {
                state.checkpointFeedback = 'Correct. Decimal alignment protects place value, which is the real structure underneath the computation.';
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 3 checkpoint passed');
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_decimal_hop' && Number.isFinite(call.arguments?.position)) {
                    nextState.hopPosition = Math.max(0, Math.min(5, Number(call.arguments.position)));
                }
            });
            return nextState;
        }
    };
}
