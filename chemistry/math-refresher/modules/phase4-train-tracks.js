const createInitialPhase4State = () => ({
    scraperBins: {
        given: [],
        target: [],
        relation: []
    },
    scraperFeedback: 'Drag highlighted fragments from the problem into the three structural bins.',
    trackSlots: {
        slot0: 'card-start',
        slot1: 'card-factor'
    },
    factorFlipped: false,
    trackFeedback: 'Build the train track left to right and watch unit structure update in real time.',
    identityFeedback: 'When a numerator unit and downstream denominator unit match, identity highlighting appears before cancellation.',
    checkpointScraperBins: {
        given: [],
        target: [],
        relation: []
    },
    checkpointScraperFeedback: 'Sort only the values required for mass-to-mole conversion. Ignore environmental distractors.',
    checkpointInversionPlaced: false,
    checkpointInversionFlipped: true,
    checkpointInversionFeedback: 'Place the molar-mass conversion card on the track and run the calculation.',
    checkpointInversionOutput: ''
});

export function createPhase4TrainTracks() {
    return {
        id: 'phase4',
        label: 'Structural Scaffolding',
        title: 'Phase 4: Structural Scaffolding (Dimensional Analysis and Word-Problem Dissection)',
        getInitialState() {
            return createInitialPhase4State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialPhase4State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });

            host.innerHTML = `
                <style>
                    .p4-wrap { display: grid; gap: 1.2rem; }
                    .p4-card {
                        background: #ffffff;
                        border: 1px solid #d5dde8;
                        border-radius: 16px;
                        padding: 1rem;
                        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
                    }
                    .p4-card h2 { margin: 0 0 0.6rem; color: #0f172a; }
                    .p4-card h3 { margin: 0 0 0.45rem; color: #1e3a8a; }
                    .p4-card p { color: #334155; line-height: 1.62; margin: 0.55rem 0; }
                    .p4-mini { color: #475569; font-size: 0.92rem; }
                    .p4-feedback {
                        margin-top: 0.65rem;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 0.58rem 0.68rem;
                        background: #eff6ff;
                        color: #1e3a8a;
                        line-height: 1.5;
                    }
                    .p4-problem {
                        margin-top: 0.75rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p4-frag {
                        display: inline-block;
                        border: 1px dashed #2563eb;
                        border-radius: 7px;
                        padding: 0.05rem 0.34rem;
                        margin: 0 0.15rem;
                        background: #dbeafe;
                        color: #1e3a8a;
                        cursor: grab;
                        user-select: none;
                    }
                    .p4-frag.active {
                        border-style: solid;
                        background: #bfdbfe;
                    }
                    .p4-bin-grid {
                        margin-top: 0.8rem;
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 0.62rem;
                    }
                    .p4-bin {
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 0.62rem;
                        background: #ffffff;
                        min-height: 112px;
                    }
                    .p4-bin strong { color: #0f172a; }
                    .p4-bin.drop { border-color: #2563eb; background: #eff6ff; }
                    .p4-chip-wrap { margin-top: 0.45rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
                    .p4-chip {
                        border: 1px solid #60a5fa;
                        border-radius: 999px;
                        padding: 0.15rem 0.55rem;
                        background: #dbeafe;
                        color: #1e3a8a;
                        font-size: 0.82rem;
                        cursor: grab;
                    }
                    .p4-track-lab {
                        margin-top: 0.82rem;
                        border: 1px solid #dbeafe;
                        border-radius: 12px;
                        padding: 0.75rem;
                        background: #f8fbff;
                    }
                    .p4-track {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(120px, 1fr));
                        gap: 0.5rem;
                    }
                    .p4-slot {
                        border: 1px dashed #94a3b8;
                        border-radius: 10px;
                        min-height: 74px;
                        padding: 0.45rem;
                        background: #ffffff;
                        display: grid;
                        align-content: center;
                        justify-items: center;
                        gap: 0.2rem;
                    }
                    .p4-slot.drop { border-color: #2563eb; background: #eff6ff; }
                    .p4-card-tile {
                        width: 100%;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #f8fafc;
                        padding: 0.38rem;
                        text-align: center;
                        cursor: grab;
                    }
                    .p4-frac {
                        display: grid;
                        justify-items: center;
                        font-weight: 700;
                        color: #0f172a;
                    }
                    .p4-frac-line { width: 82%; border-top: 2px solid #0f172a; margin: 0.1rem 0; }
                    .p4-unit { border-radius: 6px; padding: 0.08rem 0.34rem; border: 1px solid #cbd5e1; }
                    .p4-unit.kill {
                        text-decoration: line-through;
                        opacity: 0.56;
                        transition: opacity 0.2s ease;
                    }
                    .p4-controls { display: grid; gap: 0.58rem; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin-top: 0.68rem; }
                    .p4-btn {
                        border: 1px solid #1d4ed8;
                        border-radius: 10px;
                        background: #2563eb;
                        color: #ffffff;
                        padding: 0.52rem 0.72rem;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .p4-btn.ghost { background: #eff6ff; color: #1e3a8a; }
                    .p4-identity-stage {
                        margin-top: 0.75rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 0.65rem;
                        background: #ffffff;
                        position: relative;
                        min-height: 84px;
                    }
                    .p4-identity-row { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; }
                    .p4-bond {
                        position: absolute;
                        top: 10px;
                        bottom: 10px;
                        left: 50%;
                        width: 4px;
                        transform: translateX(-50%);
                        border-radius: 999px;
                        background: linear-gradient(180deg, #38bdf8, #22c55e);
                        opacity: 0;
                        box-shadow: 0 0 18px rgba(56, 189, 248, 0.75);
                        transition: opacity 0.2s ease;
                    }
                    .p4-bond.on { opacity: 1; }
                    .p4-identity-eq {
                        margin-top: 0.5rem;
                        text-align: center;
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .p4-check {
                        border: 2px solid #1e40af;
                        border-radius: 16px;
                        padding: 1rem;
                        background: linear-gradient(180deg, #eff6ff, #ffffff);
                    }
                    .p4-check-grid { display: grid; gap: 0.9rem; margin-top: 0.72rem; }
                    .p4-check-item {
                        border: 1px dashed #93c5fd;
                        border-radius: 12px;
                        background: #f8fbff;
                        padding: 0.75rem;
                    }
                    .p4-proof {
                        margin-top: 0.45rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 10px;
                        background: #ffffff;
                        color: #334155;
                        padding: 0.5rem 0.62rem;
                        white-space: pre-line;
                        line-height: 1.55;
                    }
                </style>

                <section class="p4-wrap">
                    <article class="p4-card">
                        <h2>1) The Language Scraper Engine (Text Parsing)</h2>
                        <p>
                            Most dimensional-analysis errors begin before any multiplication happens. The first obstacle is language extraction.
                            Word problems hide useful numbers inside conversational phrases, and many learners are never shown how to decode those phrases
                            into structural math roles. If you can separate the starting value, target unit, and conversion relationship, the math path becomes clearer.
                        </p>
                        <p>
                            Terms like per, in every, and contains are direct fraction signals. They are not filler words. They are instructions telling you
                            which quantity belongs on top and which belongs below in a conversion ratio. This means comprehension is part of the calculation,
                            not a separate soft skill.
                        </p>
                        <p>
                            In the scraper below, drag highlighted fragments into bins by role. You are practicing problem dissection: identify where you start,
                            identify where you want to finish, and identify the relationship that can connect the two.
                        </p>

                        <div class="p4-problem" id="p4-problem-main">
                            A laboratory sample of saline solution contains
                            <span class="p4-frag" draggable="true" data-frag-id="frag-rel-095-100">0.95 grams of NaCl dissolved in every 100 milliliters of water</span>.
                            If a procedure requires
                            <span class="p4-frag" draggable="true" data-frag-id="frag-given-250">250 milliliters</span>,
                            determine the required
                            <span class="p4-frag" draggable="true" data-frag-id="frag-target-grams">grams of NaCl</span>.
                        </div>

                        <div class="p4-bin-grid">
                            <div class="p4-bin" data-bin="given">
                                <strong>The Given or Starting Value Bin</strong>
                                <div id="p4-bin-given" class="p4-chip-wrap"></div>
                            </div>
                            <div class="p4-bin" data-bin="target">
                                <strong>The Target Unit Bin</strong>
                                <div id="p4-bin-target" class="p4-chip-wrap"></div>
                            </div>
                            <div class="p4-bin" data-bin="relation">
                                <strong>The Conversion Factor Relationship Bin</strong>
                                <div id="p4-bin-relation" class="p4-chip-wrap"></div>
                            </div>
                        </div>
                        <div id="p4-scraper-feedback" class="p4-feedback">${state.scraperFeedback}</div>
                    </article>

                    <article class="p4-card">
                        <h2>2) The Kinetic Train Tracks Workspace</h2>
                        <p>
                            Conversion factors are directional tools, not rigid stickers. The statement 18.02 g per 1 mol and 1 mol per 18.02 g represent
                            the same physical equivalence. You choose orientation based on which unit must cancel. That is why flipping a factor is legal:
                            you are not changing chemistry facts, only selecting the form that clears the unwanted unit.
                        </p>
                        <p>
                            Build the track left to right. Keep watching units, not just numbers. If the denominator of one card matches the numerator unit
                            you need to remove from the previous card, you are creating a cancellation bridge.
                        </p>
                        <p>
                            Drag cards onto slots and flip the conversion card orientation. The expression beneath the track updates immediately so you can
                            verify structure before calculating.
                        </p>

                        <div class="p4-track-lab">
                            <div class="p4-mini">Card bank</div>
                            <div class="p4-controls">
                                <div id="p4-bank-start" class="p4-card-tile" draggable="true" data-card-id="card-start"></div>
                                <div id="p4-bank-factor" class="p4-card-tile" draggable="true" data-card-id="card-factor"></div>
                                <div id="p4-bank-target" class="p4-card-tile" draggable="true" data-card-id="card-target"></div>
                            </div>

                            <div class="p4-mini" style="margin-top:0.6rem;">Train track slots</div>
                            <div class="p4-track">
                                <div class="p4-slot" data-slot-id="slot0"></div>
                                <div class="p4-slot" data-slot-id="slot1"></div>
                                <div class="p4-slot" data-slot-id="slot2"></div>
                            </div>

                            <div class="p4-controls">
                                <button id="p4-flip-factor" class="p4-btn ghost">Flip Conversion Factor</button>
                                <button id="p4-reset-track" class="p4-btn ghost">Reset Track</button>
                            </div>
                            <div id="p4-track-feedback" class="p4-feedback">${state.trackFeedback}</div>
                        </div>
                    </article>

                    <article class="p4-card">
                        <h2>3) The Diagonal Identity Overlay</h2>
                        <p>
                            Unit cancellation is algebra, not magic. When the same unit appears in a numerator and a downstream denominator,
                            you are applying the identity property: unit divided by itself equals 1. The value of the calculation is preserved while
                            the unit pathway simplifies.
                        </p>
                        <p>
                            The overlay below does not hide cancellation immediately. It first binds matching units with a glowing connector and displays
                            the identity expression. Only after that proof moment do both units strike through, showing that the path is now clear toward
                            the target unit.
                        </p>

                        <div class="p4-identity-stage">
                            <div id="p4-identity-bond" class="p4-bond"></div>
                            <div class="p4-identity-row">
                                <div>
                                    <div class="p4-mini">Upstream unit</div>
                                    <div id="p4-identity-up" class="p4-unit">mL</div>
                                </div>
                                <div>
                                    <div class="p4-mini">Downstream denominator</div>
                                    <div id="p4-identity-down" class="p4-unit">mL</div>
                                </div>
                            </div>
                            <div id="p4-identity-eq" class="p4-identity-eq">mL / mL = 1</div>
                        </div>
                        <div id="p4-identity-feedback" class="p4-feedback">${state.identityFeedback}</div>
                    </article>

                    <article class="p4-check">
                        <h2>Mastery Check-in</h2>
                        <p>
                            Complete both checks to confirm you can filter distractors and orient conversion cards by unit-cancellation logic.
                        </p>

                        <div class="p4-check-grid">
                            <section class="p4-check-item">
                                <h3>The Distractor Scraper Checkpoint</h3>
                                <p class="p4-mini">
                                    Problem: A sealed flask contains 36.0 grams of NH3 at 25 C and 1 atm. How many moles of NH3 are present?
                                    Use 17.03 grams NH3 per 1 mole NH3.
                                </p>
                                <div class="p4-problem" id="p4-problem-check">
                                    <span class="p4-frag" draggable="true" data-check-frag-id="check-given-36">36.0 grams NH3</span>
                                    <span class="p4-frag" draggable="true" data-check-frag-id="check-rel-1703">17.03 grams NH3 per 1 mole NH3</span>
                                    <span class="p4-frag" draggable="true" data-check-frag-id="check-target-mol">moles NH3</span>
                                    <span class="p4-frag" draggable="true" data-check-frag-id="check-distract-temp">25 C</span>
                                    <span class="p4-frag" draggable="true" data-check-frag-id="check-distract-pressure">1 atm</span>
                                </div>
                                <div class="p4-bin-grid">
                                    <div class="p4-bin" data-check-bin="given">
                                        <strong>Given</strong>
                                        <div id="p4-check-bin-given" class="p4-chip-wrap"></div>
                                    </div>
                                    <div class="p4-bin" data-check-bin="target">
                                        <strong>Target</strong>
                                        <div id="p4-check-bin-target" class="p4-chip-wrap"></div>
                                    </div>
                                    <div class="p4-bin" data-check-bin="relation">
                                        <strong>Relationship</strong>
                                        <div id="p4-check-bin-relation" class="p4-chip-wrap"></div>
                                    </div>
                                </div>
                                <div id="p4-check-scraper-feedback" class="p4-feedback">${state.checkpointScraperFeedback}</div>
                            </section>

                            <section class="p4-check-item">
                                <h3>The Inversion Trap Checkpoint</h3>
                                <p class="p4-mini">Convert 5.0 mol to grams using molar mass 18.02 g per 1 mol. Place the card, then run.</p>
                                <div class="p4-track-lab">
                                    <div class="p4-controls">
                                        <div id="p4-check-card" class="p4-card-tile" draggable="true" data-check-card="molar"></div>
                                        <div id="p4-check-slot" class="p4-slot" data-check-slot="true"></div>
                                    </div>
                                    <div class="p4-controls">
                                        <button id="p4-check-flip" class="p4-btn ghost">Flip Checkpoint Card</button>
                                        <button id="p4-check-run" class="p4-btn">Run Checkpoint Calculation</button>
                                        <button id="p4-check-reset" class="p4-btn ghost">Reset Checkpoint</button>
                                    </div>
                                    <div id="p4-check-inversion-feedback" class="p4-feedback">${state.checkpointInversionFeedback}</div>
                                    <div id="p4-check-inversion-output" class="p4-proof" style="display:${state.checkpointInversionOutput ? 'block' : 'none'};">${state.checkpointInversionOutput}</div>
                                </div>
                            </section>
                        </div>
                    </article>
                </section>
            `;

            const fragmentCatalog = {
                'frag-given-250': { text: '250 milliliters', role: 'given' },
                'frag-target-grams': { text: 'grams of NaCl', role: 'target' },
                'frag-rel-095-100': { text: '0.95 grams NaCl / 100 milliliters water', role: 'relation' }
            };

            const checkpointFragmentCatalog = {
                'check-given-36': { text: '36.0 grams NH3', role: 'given', distractor: false },
                'check-rel-1703': { text: '17.03 grams NH3 / 1 mole NH3', role: 'relation', distractor: false },
                'check-target-mol': { text: 'moles NH3', role: 'target', distractor: false },
                'check-distract-temp': { text: '25 C', role: 'none', distractor: true },
                'check-distract-pressure': { text: '1 atm', role: 'none', distractor: true }
            };

            const scraperBinEls = {
                given: host.querySelector('#p4-bin-given'),
                target: host.querySelector('#p4-bin-target'),
                relation: host.querySelector('#p4-bin-relation')
            };
            const scraperFeedbackEl = host.querySelector('#p4-scraper-feedback');

            const trackSlotEls = {
                slot0: host.querySelector('[data-slot-id="slot0"]'),
                slot1: host.querySelector('[data-slot-id="slot1"]'),
                slot2: host.querySelector('[data-slot-id="slot2"]')
            };
            const trackFeedbackEl = host.querySelector('#p4-track-feedback');
            const identityFeedbackEl = host.querySelector('#p4-identity-feedback');
            const identityUpEl = host.querySelector('#p4-identity-up');
            const identityDownEl = host.querySelector('#p4-identity-down');
            const identityEqEl = host.querySelector('#p4-identity-eq');
            const identityBondEl = host.querySelector('#p4-identity-bond');

            const checkScraperBinEls = {
                given: host.querySelector('#p4-check-bin-given'),
                target: host.querySelector('#p4-check-bin-target'),
                relation: host.querySelector('#p4-check-bin-relation')
            };
            const checkScraperFeedbackEl = host.querySelector('#p4-check-scraper-feedback');
            const checkCardEl = host.querySelector('#p4-check-card');
            const checkSlotEl = host.querySelector('#p4-check-slot');
            const checkInversionFeedbackEl = host.querySelector('#p4-check-inversion-feedback');
            const checkInversionOutputEl = host.querySelector('#p4-check-inversion-output');

            const trackCardData = () => {
                const factor = state.factorFlipped
                    ? { id: 'card-factor', label: '100 mL / 0.95 g', valueNum: 100, unitNum: 'mL', valueDen: 0.95, unitDen: 'g' }
                    : { id: 'card-factor', label: '0.95 g / 100 mL', valueNum: 0.95, unitNum: 'g', valueDen: 100, unitDen: 'mL' };

                return {
                    'card-start': { id: 'card-start', label: '250 mL / 1', valueNum: 250, unitNum: 'mL', valueDen: 1, unitDen: '1' },
                    'card-factor': factor,
                    'card-target': { id: 'card-target', label: 'Target ? g', valueNum: 1, unitNum: 'g', valueDen: 1, unitDen: '1' }
                };
            };

            const renderCardTile = (el, card) => {
                el.innerHTML = `
                    <div class="p4-mini">${card.id.replace('card-', 'Card: ')}</div>
                    <div class="p4-frac">
                        <div>${card.valueNum} <span class="p4-unit">${card.unitNum}</span></div>
                        <div class="p4-frac-line"></div>
                        <div>${card.valueDen} <span class="p4-unit">${card.unitDen}</span></div>
                    </div>
                `;
                el.dataset.cardId = card.id;
            };

            const moveFragmentToBin = (fragId, binName) => {
                Object.keys(state.scraperBins).forEach((name) => {
                    state.scraperBins[name] = state.scraperBins[name].filter((id) => id !== fragId);
                });
                if (!state.scraperBins[binName].includes(fragId)) {
                    state.scraperBins[binName].push(fragId);
                }

                const role = fragmentCatalog[fragId]?.role;
                if (role === binName) {
                    state.scraperFeedback = 'Good placement. Continue sorting all three structural pieces before building the train track.';
                } else {
                    state.scraperFeedback = 'Re-check role labels. Ask: is this the start, destination unit, or conversion relationship?';
                }

                const done =
                    state.scraperBins.given.includes('frag-given-250')
                    && state.scraperBins.target.includes('frag-target-grams')
                    && state.scraperBins.relation.includes('frag-rel-095-100');

                if (done) {
                    state.scraperFeedback = 'Scraper complete. You extracted start, target, and relationship correctly.';
                }
                scraperFeedbackEl.textContent = state.scraperFeedback;
                renderScraperBins();
                onStateChange({ ...state }, 'Phase 4 scraper updated');
            };

            const renderScraperBins = () => {
                Object.entries(scraperBinEls).forEach(([name, el]) => {
                    const chips = state.scraperBins[name] || [];
                    el.innerHTML = chips
                        .map((id) => `<span class="p4-chip" draggable="true" data-frag-id="${id}">${fragmentCatalog[id]?.text || id}</span>`)
                        .join('');
                    if (!chips.length) {
                        el.innerHTML = '<span class="p4-mini">Drop fragment here</span>';
                    }
                });
                scraperFeedbackEl.textContent = state.scraperFeedback;
            };

            const assignCardToSlot = (cardId, slotId) => {
                Object.keys(state.trackSlots).forEach((slotKey) => {
                    if (state.trackSlots[slotKey] === cardId) {
                        delete state.trackSlots[slotKey];
                    }
                });
                state.trackSlots[slotId] = cardId;
                renderTrack();
                onStateChange({ ...state }, 'Phase 4 train tracks updated');
            };

            const cardInSlot = (slotId) => {
                const cardId = state.trackSlots[slotId];
                const cards = trackCardData();
                return cardId ? cards[cardId] : null;
            };

            const renderTrack = () => {
                const cards = trackCardData();
                renderCardTile(host.querySelector('#p4-bank-start'), cards['card-start']);
                renderCardTile(host.querySelector('#p4-bank-factor'), cards['card-factor']);
                renderCardTile(host.querySelector('#p4-bank-target'), cards['card-target']);

                Object.entries(trackSlotEls).forEach(([slotId, el]) => {
                    const card = cardInSlot(slotId);
                    if (!card) {
                        el.innerHTML = '<span class="p4-mini">Drop card</span>';
                        return;
                    }
                    el.innerHTML = `
                        <div class="p4-card-tile" draggable="true" data-card-id="${card.id}">
                            <div class="p4-frac">
                                <div>${card.valueNum} <span class="p4-unit" data-slot-unit="num" data-slot-id="${slotId}">${card.unitNum}</span></div>
                                <div class="p4-frac-line"></div>
                                <div>${card.valueDen} <span class="p4-unit" data-slot-unit="den" data-slot-id="${slotId}">${card.unitDen}</span></div>
                            </div>
                        </div>
                    `;
                });

                const slot0 = cardInSlot('slot0');
                const slot1 = cardInSlot('slot1');
                const hasDiagonalMatch = slot0 && slot1 && slot0.unitNum === slot1.unitDen && slot0.unitNum !== '1';

                if (hasDiagonalMatch) {
                    const unit = slot0.unitNum;
                    identityUpEl.textContent = unit;
                    identityDownEl.textContent = unit;
                    identityEqEl.textContent = `${unit} / ${unit} = 1`;
                    identityBondEl.classList.add('on');
                    state.identityFeedback = `Identity confirmed: ${unit}/${unit} = 1. Cancelling this pair clears your route to the target unit.`;

                    const upEl = host.querySelector('[data-slot-id="slot0"][data-slot-unit="num"], [data-slot-unit="num"][data-slot-id="slot0"]');
                    const downEl = host.querySelector('[data-slot-id="slot1"][data-slot-unit="den"], [data-slot-unit="den"][data-slot-id="slot1"]');
                    if (upEl) upEl.classList.add('kill');
                    if (downEl) downEl.classList.add('kill');
                } else {
                    identityBondEl.classList.remove('on');
                    state.identityFeedback = 'Align an upstream numerator unit with a downstream denominator match to trigger identity overlay.';
                    identityUpEl.textContent = slot0?.unitNum || 'none';
                    identityDownEl.textContent = slot1?.unitDen || 'none';
                    identityEqEl.textContent = 'unit / unit = 1';
                }

                trackFeedbackEl.textContent = state.trackFeedback;
                identityFeedbackEl.textContent = state.identityFeedback;
            };

            const moveCheckFragment = (fragId, binName) => {
                Object.keys(state.checkpointScraperBins).forEach((name) => {
                    state.checkpointScraperBins[name] = state.checkpointScraperBins[name].filter((id) => id !== fragId);
                });
                if (!state.checkpointScraperBins[binName].includes(fragId)) {
                    state.checkpointScraperBins[binName].push(fragId);
                }

                const info = checkpointFragmentCatalog[fragId];
                if (info?.distractor) {
                    state.checkpointScraperFeedback = 'That value is environmental context, not a conversion input. Isolate the starting mass and molar-mass relationship only.';
                } else if (info?.role === binName) {
                    state.checkpointScraperFeedback = 'Correct sort. Keep filtering out non-conversion context.';
                } else {
                    state.checkpointScraperFeedback = 'Role mismatch. Check whether this fragment is start, target, or conversion relationship.';
                }

                const complete =
                    state.checkpointScraperBins.given.includes('check-given-36')
                    && state.checkpointScraperBins.target.includes('check-target-mol')
                    && state.checkpointScraperBins.relation.includes('check-rel-1703')
                    && !Object.values(state.checkpointScraperBins).flat().some((id) => checkpointFragmentCatalog[id]?.distractor);

                if (complete) {
                    state.checkpointScraperFeedback = 'Checkpoint passed. You filtered distractors and preserved the core conversion scaffold.';
                }

                checkScraperFeedbackEl.textContent = state.checkpointScraperFeedback;
                renderCheckpointScraperBins();
                onStateChange({ ...state }, 'Phase 4 distractor checkpoint updated');
            };

            const renderCheckpointScraperBins = () => {
                Object.entries(checkScraperBinEls).forEach(([name, el]) => {
                    const chips = state.checkpointScraperBins[name] || [];
                    el.innerHTML = chips
                        .map((id) => `<span class="p4-chip" draggable="true" data-check-frag-id="${id}">${checkpointFragmentCatalog[id]?.text || id}</span>`)
                        .join('');
                    if (!chips.length) {
                        el.innerHTML = '<span class="p4-mini">Drop fragment here</span>';
                    }
                });
                checkScraperFeedbackEl.textContent = state.checkpointScraperFeedback;
            };

            const renderCheckpointCard = () => {
                const flipped = !!state.checkpointInversionFlipped;
                const numVal = flipped ? '1' : '18.02';
                const numUnit = flipped ? 'mol' : 'g';
                const denVal = flipped ? '18.02' : '1';
                const denUnit = flipped ? 'g' : 'mol';

                checkCardEl.innerHTML = `
                    <div class="p4-mini">Checkpoint card</div>
                    <div class="p4-frac">
                        <div>${numVal} <span class="p4-unit">${numUnit}</span></div>
                        <div class="p4-frac-line"></div>
                        <div>${denVal} <span class="p4-unit">${denUnit}</span></div>
                    </div>
                `;

                if (state.checkpointInversionPlaced) {
                    checkSlotEl.innerHTML = `
                        <div class="p4-frac">
                            <div>${numVal} <span class="p4-unit">${numUnit}</span></div>
                            <div class="p4-frac-line"></div>
                            <div>${denVal} <span class="p4-unit">${denUnit}</span></div>
                        </div>
                    `;
                } else {
                    checkSlotEl.innerHTML = '<span class="p4-mini">Drop conversion card here</span>';
                }

                checkInversionFeedbackEl.textContent = state.checkpointInversionFeedback;
                checkInversionOutputEl.textContent = state.checkpointInversionOutput;
                checkInversionOutputEl.style.display = state.checkpointInversionOutput ? 'block' : 'none';
            };

            host.addEventListener('dragstart', (event) => {
                const frag = event.target.closest('[data-frag-id]');
                if (frag) {
                    event.dataTransfer?.setData('text/p4-frag', frag.getAttribute('data-frag-id') || '');
                    frag.classList.add('active');
                    return;
                }
                const cfrag = event.target.closest('[data-check-frag-id]');
                if (cfrag) {
                    event.dataTransfer?.setData('text/p4-check-frag', cfrag.getAttribute('data-check-frag-id') || '');
                    cfrag.classList.add('active');
                    return;
                }
                const card = event.target.closest('[data-card-id]');
                if (card) {
                    event.dataTransfer?.setData('text/p4-card', card.getAttribute('data-card-id') || '');
                    return;
                }
                const checkCard = event.target.closest('[data-check-card]');
                if (checkCard) {
                    event.dataTransfer?.setData('text/p4-check-card', checkCard.getAttribute('data-check-card') || '');
                }
            });

            host.querySelectorAll('[data-bin]').forEach((binEl) => {
                binEl.addEventListener('dragover', (event) => { event.preventDefault(); binEl.classList.add('drop'); });
                binEl.addEventListener('dragleave', () => binEl.classList.remove('drop'));
                binEl.addEventListener('drop', (event) => {
                    event.preventDefault();
                    binEl.classList.remove('drop');
                    const fragId = event.dataTransfer?.getData('text/p4-frag') || '';
                    const binName = binEl.getAttribute('data-bin');
                    if (fragId && binName) moveFragmentToBin(fragId, binName);
                });
            });

            host.querySelectorAll('[data-check-bin]').forEach((binEl) => {
                binEl.addEventListener('dragover', (event) => { event.preventDefault(); binEl.classList.add('drop'); });
                binEl.addEventListener('dragleave', () => binEl.classList.remove('drop'));
                binEl.addEventListener('drop', (event) => {
                    event.preventDefault();
                    binEl.classList.remove('drop');
                    const fragId = event.dataTransfer?.getData('text/p4-check-frag') || '';
                    const binName = binEl.getAttribute('data-check-bin');
                    if (fragId && binName) moveCheckFragment(fragId, binName);
                });
            });

            Object.values(trackSlotEls).forEach((slotEl) => {
                slotEl.addEventListener('dragover', (event) => { event.preventDefault(); slotEl.classList.add('drop'); });
                slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drop'));
                slotEl.addEventListener('drop', (event) => {
                    event.preventDefault();
                    slotEl.classList.remove('drop');
                    const cardId = event.dataTransfer?.getData('text/p4-card') || '';
                    const slotId = slotEl.getAttribute('data-slot-id');
                    if (cardId && slotId) {
                        assignCardToSlot(cardId, slotId);
                        state.trackFeedback = `Placed ${cardId.replace('card-', '')} in ${slotId}.`;
                        renderTrack();
                        onStateChange({ ...state }, 'Phase 4 track card placed');
                    }
                });
            });

            checkSlotEl.addEventListener('dragover', (event) => { event.preventDefault(); checkSlotEl.classList.add('drop'); });
            checkSlotEl.addEventListener('dragleave', () => checkSlotEl.classList.remove('drop'));
            checkSlotEl.addEventListener('drop', (event) => {
                event.preventDefault();
                checkSlotEl.classList.remove('drop');
                const checkCard = event.dataTransfer?.getData('text/p4-check-card') || '';
                if (checkCard) {
                    state.checkpointInversionPlaced = true;
                    state.checkpointInversionFeedback = 'Card placed. Now inspect units and run the checkpoint calculation.';
                    renderCheckpointCard();
                    onStateChange({ ...state }, 'Phase 4 inversion card placed');
                }
            });

            host.querySelector('#p4-flip-factor').addEventListener('click', () => {
                state.factorFlipped = !state.factorFlipped;
                state.trackFeedback = state.factorFlipped
                    ? 'Factor flipped. Now it reads mL per g. Verify cancellation direction before continuing.'
                    : 'Factor orientation restored to g per mL. This usually cancels mL from the starting value.';
                renderTrack();
                onStateChange({ ...state }, 'Phase 4 factor flipped');
            });

            host.querySelector('#p4-reset-track').addEventListener('click', () => {
                state.trackSlots = { slot0: 'card-start', slot1: 'card-factor' };
                state.factorFlipped = false;
                state.trackFeedback = 'Track reset. Rebuild with unit cancellation in mind.';
                renderTrack();
                onStateChange({ ...state }, 'Phase 4 track reset');
            });

            host.querySelector('#p4-check-flip').addEventListener('click', () => {
                state.checkpointInversionFlipped = !state.checkpointInversionFlipped;
                state.checkpointInversionFeedback = state.checkpointInversionFlipped
                    ? 'Card is inverted (mol over g). Inspect units before running.'
                    : 'Card is upright (g over mol). This orientation usually cancels moles from the starting value.';
                renderCheckpointCard();
                onStateChange({ ...state }, 'Phase 4 inversion card flipped');
            });

            host.querySelector('#p4-check-run').addEventListener('click', () => {
                if (!state.checkpointInversionPlaced) {
                    state.checkpointInversionFeedback = 'Place the conversion card on the checkpoint track first.';
                    state.checkpointInversionOutput = '';
                    renderCheckpointCard();
                    onStateChange({ ...state }, 'Phase 4 inversion run blocked');
                    return;
                }

                if (state.checkpointInversionFlipped) {
                    state.checkpointInversionFeedback = 'Look at your units! Stacking moles on top of moles squares the unit instead of canceling it. Flip your conversion card.';
                    state.checkpointInversionOutput = 'Blocked execution proof:\n5.0 mol x (1 mol / 18.02 g) = 5.0/18.02 mol^2/g\nOutput unit is nonsensical for a mass target.';
                    renderCheckpointCard();
                    onStateChange({ ...state }, 'Phase 4 inversion trap triggered');
                    return;
                }

                const grams = 5.0 * 18.02;
                state.checkpointInversionFeedback = 'Correct orientation. Moles cancel and grams remain as the output unit.';
                state.checkpointInversionOutput = `5.0 mol x (18.02 g / 1 mol) = ${grams.toFixed(2)} g`;
                renderCheckpointCard();
                onStateChange({ ...state }, 'Phase 4 inversion checkpoint passed');
            });

            host.querySelector('#p4-check-reset').addEventListener('click', () => {
                state.checkpointInversionPlaced = false;
                state.checkpointInversionFlipped = true;
                state.checkpointInversionFeedback = 'Place the molar-mass conversion card on the track and run the calculation.';
                state.checkpointInversionOutput = '';
                renderCheckpointCard();
                onStateChange({ ...state }, 'Phase 4 inversion checkpoint reset');
            });

            renderScraperBins();
            renderTrack();
            renderCheckpointScraperBins();
            renderCheckpointCard();
        },
        unmount() {},
        handleToolCalls(state, toolCalls) {
            const nextState = { ...state };
            toolCalls.forEach((call) => {
                if (call?.name === 'highlight_track_identity' && typeof call.arguments?.unit === 'string') {
                    nextState.identityFeedback = `Tutor focus: verify ${call.arguments.unit}/${call.arguments.unit} equals 1 before cancelling.`;
                }
                if (call?.name === 'set_factor_orientation' && typeof call.arguments?.flipped === 'boolean') {
                    nextState.factorFlipped = call.arguments.flipped;
                }
            });
            return nextState;
        }
    };
}
