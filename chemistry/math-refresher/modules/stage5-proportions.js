const createInitialStage5State = () => ({
    bins: { given: [], relation: [], target: [] },
    feedback: 'Highlight or drag the meaningful text into structural bins: start, relationship, and target.',
    checkpointBins: { given: [], relation: [], target: [] },
    checkpointFeedback: 'Mastery Checkpoint: sort only the values required for the proportion. Ignore environmental distractors.'
});

export function createStage5Proportions() {
    return {
        id: 'stage5',
        label: 'Proportional Reasoning and Language',
        title: 'Stage 5: Proportional Reasoning and Language',
        getInitialState() {
            return createInitialStage5State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage5State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .s5-wrap { display: grid; gap: 1.2rem; }
                    .s5-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .s5-card h2 { margin: 0 0 0.55rem; color: #0f172a; }
                    .s5-card p { color: #334155; line-height: 1.62; margin: 0.5rem 0; }
                    .s5-framework { display: grid; gap: 0.7rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s5-pane { border: 1px solid #cbd5e1; border-radius: 12px; padding: 0.75rem; background: #f8fafc; }
                    .s5-problem {
                        margin-top: 0.75rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.78rem;
                        background: #f8fbff;
                    }
                    .s5-frag {
                        display: inline-block;
                        border: 1px dashed #2563eb;
                        border-radius: 8px;
                        padding: 0.08rem 0.34rem;
                        background: #dbeafe;
                        color: #1e3a8a;
                        cursor: grab;
                        user-select: none;
                        margin: 0 0.12rem;
                    }
                    .s5-bins { display: grid; gap: 0.65rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 0.72rem; }
                    .s5-bin {
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 0.62rem;
                        background: #ffffff;
                        min-height: 108px;
                    }
                    .s5-bin.drop { border-color: #2563eb; background: #eff6ff; }
                    .s5-chip-wrap { margin-top: 0.45rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
                    .s5-chip {
                        border: 1px solid #60a5fa;
                        border-radius: 999px;
                        background: #dbeafe;
                        color: #1e3a8a;
                        padding: 0.14rem 0.55rem;
                        font-size: 0.82rem;
                    }
                    .s5-feedback {
                        margin-top: 0.6rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .s5-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                </style>

                <section class="s5-wrap">
                    <article class="s5-card">
                        <h2>Stage Framework</h2>
                        <div class="s5-framework">
                            <div class="s5-pane"><strong>Conceptual Anchor</strong><p>Many proportion problems fail at the reading stage, not the arithmetic stage. The learner must separate where the problem starts, what relationship connects the units, and what target the question is really asking for.</p></div>
                            <div class="s5-pane"><strong>Mechanical Algorithm</strong><p>Mark the given quantity, locate the relationship phrase such as per or in every, and identify the destination unit. Once those three pieces are sorted, the ratio path becomes much easier to build.</p></div>
                            <div class="s5-pane"><strong>Cognitive Trap</strong><p>The trap is dragging every number into the calculation just because it is printed in the paragraph. Some values are environmental context and do not belong in the active proportion.</p></div>
                            <div class="s5-pane"><strong>Science Bridge</strong><p>Chemistry word problems are proportion problems disguised as sentences. Concentration, dosage, dilution, and conversion questions all improve when the language is structurally sorted first.</p></div>
                        </div>
                    </article>

                    <article class="s5-card">
                        <h2>The Word Problem Highlight Scraper</h2>
                        <p>Drag the relevant fragments into bins. Treat words like contains, per, and in every as structural math instructions rather than background prose.</p>
                        <div class="s5-problem">
                            A medication vial contains
                            <span class="s5-frag" draggable="true" data-frag="rel">25 milligrams of active drug in every 5 milliliters</span>.
                            If a patient needs
                            <span class="s5-frag" draggable="true" data-frag="given">12 milliliters</span>,
                            determine the required
                            <span class="s5-frag" draggable="true" data-frag="target">milligrams of drug</span>.
                        </div>
                        <div class="s5-bins">
                            <div class="s5-bin" data-bin="given"><strong>Starting Given Value</strong><div id="s5-bin-given" class="s5-chip-wrap"></div></div>
                            <div class="s5-bin" data-bin="relation"><strong>Relational Conversion Rate</strong><div id="s5-bin-relation" class="s5-chip-wrap"></div></div>
                            <div class="s5-bin" data-bin="target"><strong>Target Unit Goal</strong><div id="s5-bin-target" class="s5-chip-wrap"></div></div>
                        </div>
                        <div id="s5-feedback" class="s5-feedback">${state.feedback}</div>
                    </article>

                    <article class="s5-check">
                        <h2>Mastery Trap-Checkpoint</h2>
                        <p>Checkpoint problem: A gas sample has a mass of 22 g at 25 C and 1 atm. How many moles is that if molar mass is 44 g/mol?</p>
                        <div class="s5-problem">
                            <span class="s5-frag" draggable="true" data-check="given">22 g</span>
                            <span class="s5-frag" draggable="true" data-check="relation">44 g/mol</span>
                            <span class="s5-frag" draggable="true" data-check="target">moles</span>
                            <span class="s5-frag" draggable="true" data-check="distractor1">25 C</span>
                            <span class="s5-frag" draggable="true" data-check="distractor2">1 atm</span>
                        </div>
                        <div class="s5-bins">
                            <div class="s5-bin" data-check-bin="given"><strong>Starting Given Value</strong><div id="s5-check-given" class="s5-chip-wrap"></div></div>
                            <div class="s5-bin" data-check-bin="relation"><strong>Relational Conversion Rate</strong><div id="s5-check-relation" class="s5-chip-wrap"></div></div>
                            <div class="s5-bin" data-check-bin="target"><strong>Target Unit Goal</strong><div id="s5-check-target" class="s5-chip-wrap"></div></div>
                        </div>
                        <div id="s5-check-feedback" class="s5-feedback">${state.checkpointFeedback}</div>
                    </article>
                </section>
            `;

            const catalog = {
                given: '12 milliliters',
                relation: '25 milligrams in every 5 milliliters',
                target: 'milligrams of drug'
            };
            const checkCatalog = {
                given: '22 g',
                relation: '44 g/mol',
                target: 'moles',
                distractor1: '25 C',
                distractor2: '1 atm'
            };

            const renderBins = (bins, selectors, sourceCatalog) => {
                Object.entries(selectors).forEach(([name, el]) => {
                    const items = bins[name] || [];
                    el.innerHTML = items.length
                        ? items.map((id) => `<span class="s5-chip">${sourceCatalog[id]}</span>`).join('')
                        : '<span class="s5-chip" style="background:#f8fafc;border-color:#cbd5e1;color:#64748b;">Drop fragment here</span>';
                });
            };

            const selectors = {
                given: host.querySelector('#s5-bin-given'),
                relation: host.querySelector('#s5-bin-relation'),
                target: host.querySelector('#s5-bin-target')
            };
            const checkSelectors = {
                given: host.querySelector('#s5-check-given'),
                relation: host.querySelector('#s5-check-relation'),
                target: host.querySelector('#s5-check-target')
            };
            const feedbackEl = host.querySelector('#s5-feedback');
            const checkFeedbackEl = host.querySelector('#s5-check-feedback');

            renderBins(state.bins, selectors, catalog);
            renderBins(state.checkpointBins, checkSelectors, checkCatalog);

            const place = (fragId, binName) => {
                Object.keys(state.bins).forEach((key) => {
                    state.bins[key] = state.bins[key].filter((item) => item !== fragId);
                });
                state.bins[binName].push(fragId);
                state.feedback = fragId === binName
                    ? 'Good sort. You matched the language fragment to its structural role.'
                    : 'Role mismatch. Ask whether this fragment is where you start, the relationship, or the destination.';
                if (state.bins.given.includes('given') && state.bins.relation.includes('relation') && state.bins.target.includes('target')) {
                    state.feedback = 'Scraper complete. You extracted the structure needed for the proportion cleanly.';
                }
                renderBins(state.bins, selectors, catalog);
                feedbackEl.textContent = state.feedback;
                onStateChange({ ...state }, 'Stage 5 scraper updated');
            };

            const placeCheck = (fragId, binName) => {
                Object.keys(state.checkpointBins).forEach((key) => {
                    state.checkpointBins[key] = state.checkpointBins[key].filter((item) => item !== fragId);
                });
                state.checkpointBins[binName].push(fragId);
                if (fragId.startsWith('distractor')) {
                    state.checkpointFeedback = 'Trap detected: 25 C and 1 atm describe conditions, not the mass-to-mole conversion scaffold. Keep only the starting mass, the molar-mass relationship, and the target unit.';
                } else if (fragId === binName) {
                    state.checkpointFeedback = 'Correct sort. Continue filtering out values that do not drive the proportion.';
                } else {
                    state.checkpointFeedback = 'Role mismatch. Re-check the job of that fragment in the sentence.';
                }
                const active = Object.values(state.checkpointBins).flat();
                const passed = active.includes('given') && active.includes('relation') && active.includes('target') && !active.some((item) => item.startsWith('distractor'));
                if (passed) {
                    state.checkpointFeedback = 'Checkpoint passed. You isolated the true proportional structure and ignored the environmental distractors.';
                }
                renderBins(state.checkpointBins, checkSelectors, checkCatalog);
                checkFeedbackEl.textContent = state.checkpointFeedback;
                onStateChange({ ...state }, 'Stage 5 checkpoint updated');
            };

            host.addEventListener('dragstart', (event) => {
                const frag = event.target.closest('[data-frag]');
                if (frag) {
                    event.dataTransfer?.setData('text/s5-frag', frag.getAttribute('data-frag') || '');
                    return;
                }
                const checkFrag = event.target.closest('[data-check]');
                if (checkFrag) {
                    event.dataTransfer?.setData('text/s5-check', checkFrag.getAttribute('data-check') || '');
                }
            });

            host.querySelectorAll('[data-bin]').forEach((binEl) => {
                binEl.addEventListener('dragover', (event) => { event.preventDefault(); binEl.classList.add('drop'); });
                binEl.addEventListener('dragleave', () => binEl.classList.remove('drop'));
                binEl.addEventListener('drop', (event) => {
                    event.preventDefault();
                    binEl.classList.remove('drop');
                    const fragId = event.dataTransfer?.getData('text/s5-frag') || '';
                    const binName = binEl.getAttribute('data-bin');
                    if (fragId && binName) {
                        place(fragId, binName);
                    }
                });
            });

            host.querySelectorAll('[data-check-bin]').forEach((binEl) => {
                binEl.addEventListener('dragover', (event) => { event.preventDefault(); binEl.classList.add('drop'); });
                binEl.addEventListener('dragleave', () => binEl.classList.remove('drop'));
                binEl.addEventListener('drop', (event) => {
                    event.preventDefault();
                    binEl.classList.remove('drop');
                    const fragId = event.dataTransfer?.getData('text/s5-check') || '';
                    const binName = binEl.getAttribute('data-check-bin');
                    if (fragId && binName) {
                        placeCheck(fragId, binName);
                    }
                });
            });
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'set_proportion_hint' && typeof call.arguments?.message === 'string') {
                    nextState.feedback = call.arguments.message;
                }
            });
            return nextState;
        }
    };
}
