const createInitialStage1State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,
    
    // Subitizing game
    subitizingDots: 5,
    subitizingHidden: true,
    subitizingGuess: '',
    subitizingFeedback: 'Click "Flash Dots" to see a quick group of particles. Type how many you saw.',
    concreteMission: { subitizingSolved: false, regroupDone: false, meniscusReadCorrect: false },
    concreteCompleted: false,

    // Single-digit fluency lesson placeholders
    singleAdditionAnswer: '',
    singleAdditionFeedback: 'L1.3 Single-Digit Addition: combine small quantities directly.',
    singleSubtractionAnswer: '',
    singleSubtractionFeedback: 'L1.4 Single-Digit Subtraction: take away a small amount and name the remainder.',

    // Carrying lesson placeholder
    carryLessonChoice: '',
    carryLessonFeedback: 'L1.7 Addition Carrying: when a ones column reaches 10, regroup it into 1 ten.',
    
    // Meniscus reading
    cameraAngle: 15,
    meniscusVolume: '',
    meniscusFeedback: 'Concrete mission: Adjust the camera angle slider to eye level (0°) to clear parallax error, then read the volume at the bottom of the meniscus (marks every 0.1 mL between 4.0 and 5.0).',
    meniscusCorrect: false,
    
    // Comparisons
    compFeedback: 'Choose the correct comparison symbol: >, <, or =.',
    compQ1: '',
    compQ2: '',
    
    // Regrouping carrying blocks
    onesCount: 0,
    tensCount: 0,
    carryFeedback: 'Click "+1 Block" to add ones. When you hit 10, click "Regroup" to merge them into 1 ten-rod.',
    
    // Math expressions
    additionFeedback: 'Solve multi-digit addition: 143 + 25 without carrying.',
    additionAnswer: '',
    
    appliedFeedback: 'Applied level: compare relative zero points with absolute scales such as Kelvin.',
    appliedChoice: '',
    appliedSelectedOptionId: '',
    appliedSelectedOptionText: '',
    appliedResponseText: '',
    appliedLoading: false,
    appliedError: '',
    appliedGrading: null,
    appliedLastModel: ''
});

function getChemModelLabel() {
    if (typeof window.getActiveModelLabel === 'function') {
        return window.getActiveModelLabel('chemistry_llm');
    }
    if (typeof window.getGnosysModel === 'function') {
        return window.getGnosysModel('chemistry_llm');
    }
    return 'local model';
}

export function createStage1Subbase() {
    return {
        id: 'stage1',
        label: 'Sub-Base Arithmetic',
        title: 'Stage 1: Sub-Base Arithmetic & Single-Digit Fluency',
        getInitialState() {
            return createInitialStage1State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage1State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });
            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            const compA = getParams('s1-comparison-a', { left: 9, right: 7, answerKey: 'gt' });
            const compB = getParams('s1-comparison-b', { leftText: '3 + 2', right: 5, answerKey: 'eq' });
            const addition = getParams('s1-addition', { text: '  143\n+  25', answerKey: '168' });
            const additionExpression = (() => {
                const leftNum = Number(addition?.left);
                const rightNum = Number(addition?.right);
                if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
                    return `${leftNum} + ${rightNum}`;
                }

                const lines = String(addition?.text || '')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);
                if (lines.length >= 2) {
                    const top = lines[0].replace(/[^0-9.-]/g, '');
                    const bottom = lines[1].replace(/^[+]/, '').replace(/[^0-9.-]/g, '');
                    if (top && bottom) {
                        return `${top} + ${bottom}`;
                    }
                }

                return '';
            })();
            const additionTutorQuestion = additionExpression
                ? `Help me solve this aligned place-value columns problem: ${additionExpression} = ?`
                : 'Help me solve this aligned place-value columns problem.';
            const additionTutorPrompt = additionExpression
                ? `Show me step-by-step how to solve ${additionExpression} without carrying.`
                : 'Show me step-by-step how to add numbers aligning columns without carrying.';
            const appliedOverride = overrides['s1-applied-tare']?.parameters || overrides['s1-applied-tare'];
            const applied = getParams('s1-applied-tare', {
                questionText: 'A beaker on a balance reads 3.12 g before adding solution. Pressing Tare resets the displayed mass to 0.00 g (a relative zero). Temperature scales also use offsets: 25 C equals 298.15 K, and only Kelvin has absolute zero at 0 K. Which statement is correct?',
                options: [
                    { id: 'wrong', text: 'Tare and Celsius both use absolute zero, so 0 on either scale means no mass or no thermal energy.' },
                    { id: 'right', text: 'Tare creates a relative zero for measurement differences, while Kelvin remains an absolute scale with 0 K as absolute zero.' }
                ],
                answerKey: 'right',
                rubric: {
                    scoring: 'exact-match',
                    max_points: 1
                },
                workedSolution: 'Correct framing: tare sets a relative measurement baseline, while Kelvin is anchored to absolute zero at 0 K.'
            });
            const appliedOptions = Array.isArray(applied.options) && applied.options.length
                ? applied.options
                : [
                    { id: 'wrong', text: 'Tare and Celsius both use absolute zero, so 0 on either scale means no mass or no thermal energy.' },
                    { id: 'right', text: 'Tare creates a relative zero for measurement differences, while Kelvin remains an absolute scale with 0 K as absolute zero.' }
                ];
            const appliedResponseMode = (() => {
                const explicitMode = String(applied.responseMode || '').toLowerCase();
                if (explicitMode === 'free-response' || explicitMode === 'text') return 'free-response';
                if (explicitMode === 'multiple-choice') return 'multiple-choice';
                if (Array.isArray(applied.options) && applied.options.length) return 'multiple-choice';
                return 'free-response';
            })();
            const isAppliedFreeResponse = appliedResponseMode === 'free-response';

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's1-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s1-wrap { display: flex; flex-direction: column; gap: 1.2rem; }
                    .s1-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s1-card h2, .s1-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s1-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s1-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s1-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s1-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s1-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s1-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s1-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s1-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s1-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s1-btn:hover { background: #fbbf24; }
                    .s1-btn.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s1-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s1-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s1-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s1-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s1-level.s1-locked { opacity: 0.52; position: relative; }
                    .s1-level.s1-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s1-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Subitizing arena */
                    .s1-sub-box { width: 100%; height: 110px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; position: relative; overflow: hidden; margin-top: 0.6rem; }
                    .s1-dot { position: absolute; width: 10px; height: 10px; background: #f59e0b; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 8px #f59e0b; }
                    .s1-sub-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.95); display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: bold; }
                    
                    /* Regrouping blocks layout */
                    .s1-blocks-arena { display: flex; gap: 1rem; margin-top: 0.6rem; min-height: 90px; }
                    .s1-column-box { flex: 1; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; background: rgba(15, 23, 42, 0.6); padding: 0.5rem; display: flex; flex-direction: column; gap: 4px; align-items: center; }
                    .s1-block-unit { width: 18px; height: 18px; background: #3b82f6; border-radius: 3px; border: 1px solid #2563eb; }
                    .s1-block-rod { width: 80px; height: 18px; background: #f43f5e; border-radius: 3px; border: 1px solid #e11d48; text-align: center; color: white; font-size: 10px; line-height: 18px; font-weight: 800; }
                    
                    /* Collapsible Tutorial Styles */
                    .s1-tutorial-box { background: rgba(15, 23, 42, 0.55); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 0.75rem; margin: 0.6rem 0 0.8rem; font-size: 0.85rem; line-height: 1.5; }
                    .s1-tutorial-box summary { font-weight: 700; color: #fbbf24; cursor: pointer; user-select: none; outline: none; margin-bottom: 0.2rem; }
                    .s1-tutorial-box summary:hover { color: #f59e0b; }
                    .s1-tutorial-box p { margin: 0.4rem 0 0.2rem; color: #cbd5e1; }
                    .s1-tutorial-box ol, .s1-tutorial-box ul { margin: 0.3rem 0; padding-left: 1.2rem; color: #cbd5e1; }
                    .s1-tutorial-box li { margin-bottom: 0.25rem; }

                    .tutor-btn { margin-top: 0.5rem; }

                    /* Keep L1.2 comparison buttons compact so they do not feel oversized */
                    .s1-compare-actions .s1-btn {
                        padding: 0.4rem 0.6rem;
                        font-size: 0.84rem;
                    }
                </style>

                <section class="s1-wrap">
                    <article class="s1-card s1-diagnostic" style="order:0;">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Perfect score unlocks Fast-Track and lets you bypass busywork.</p>
                        <div class="s1-grid">
                            <div class="s1-pane">
                                <strong>1. Symbol Check</strong>
                                <p>Which symbol fits: 12 ___ 15?</p>
                                <div class="s1-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q1 === 'lt' ? 'active' : ''}" data-diag="q1" data-value="lt">&lt;</button>
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q1 === 'gt' ? 'active' : ''}" data-diag="q1" data-value="gt">&gt;</button>
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q1 === 'eq' ? 'active' : ''}" data-diag="q1" data-value="eq">=</button>
                                </div>
                            </div>
                            <div class="s1-pane">
                                <strong>2. Zero Identity</strong>
                                <p>Evaluate: 7 + 0 = ?</p>
                                <div class="s1-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q2 === '7' ? 'active' : ''}" data-diag="q2" data-value="7">7</button>
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q2 === '0' ? 'active' : ''}" data-diag="q2" data-value="0">0</button>
                                </div>
                            </div>
                            <div class="s1-pane">
                                <strong>3. Addition Carrying</strong>
                                <p>If we have 15 Ones blocks, how do they regroup?</p>
                                <div class="s1-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q3 === 'regroup' ? 'active' : ''}" data-diag="q3" data-value="regroup">1 Ten and 5 Ones</button>
                                    <button class="s1-btn ghost ${state.diagnosticAnswers.q3 === 'stay' ? 'active' : ''}" data-diag="q3" data-value="stay">15 Tens</button>
                                </div>
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.75rem;">
                            <button id="s1-check-diagnostic" class="s1-btn" data-tutor-question-id="s1-diagnostic" data-tutor-level="diagnostic" data-tutor-answer-keys="diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3" data-tutor-question="I am working on the Stage 1 diagnostic with three items: symbol check, zero identity, and regrouping. Help me reason through each answer.">Check Diagnostic</button>
                        </div>
                        <div id="s1-diagnostic-feedback" class="s1-feedback">${state.diagnosticFeedback}</div>
                        <div class="s1-status">
                            <span class="s1-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s1-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s1-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s1-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s1-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:3;">
                        <h2>L1.3 Single-Digit Addition</h2>
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Add One-Digit Numbers</summary>
                            <p>Single-digit addition means combining two small amounts and naming the total directly.</p>
                            <ol>
                                <li>Read each addend.</li>
                                <li>Count on from the larger number or combine both groups.</li>
                                <li>Write the total as the answer.</li>
                            </ol>
                        </details>
                        <div class="s1-grid" style="grid-template-columns: 1fr auto; gap: 4px; align-items: center;">
                            <div class="s1-pane"><strong>Problem:</strong> 4 + 3 = ?</div>
                            <input id="s1-single-add-input" class="s1-input" placeholder="Enter sum" value="${state.singleAdditionAnswer}" ${disabled(state.concreteUnlocked)} />
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px;">
                            <button id="s1-single-add-check" class="s1-btn" ${disabled(state.concreteUnlocked)}>Check L1.3</button>
                            <button id="s1-single-add-hint" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint?</button>
                        </div>
                        <div class="s1-feedback">${state.singleAdditionFeedback}</div>
                    </article>

                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:4;">
                        <h2>L1.4 Single-Digit Subtraction</h2>
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Take Away One Small Amount</summary>
                            <p>Single-digit subtraction means removing a small amount from a starting amount and naming what remains.</p>
                            <ol>
                                <li>Start with the larger amount.</li>
                                <li>Take away the smaller amount.</li>
                                <li>Count what is left.</li>
                            </ol>
                        </details>
                        <div class="s1-grid" style="grid-template-columns: 1fr auto; gap: 4px; align-items: center;">
                            <div class="s1-pane"><strong>Problem:</strong> 8 - 5 = ?</div>
                            <input id="s1-single-sub-input" class="s1-input" placeholder="Enter difference" value="${state.singleSubtractionAnswer}" ${disabled(state.concreteUnlocked)} />
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px;">
                            <button id="s1-single-sub-check" class="s1-btn" ${disabled(state.concreteUnlocked)}>Check L1.4</button>
                            <button id="s1-single-sub-hint" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint?</button>
                        </div>
                        <div class="s1-feedback">${state.singleSubtractionFeedback}</div>
                    </article>

                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:7;">
                        <h2>L1.7 Addition Carrying</h2>
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Regroup When Ones Reach 10</summary>
                            <p>When the ones column reaches 10, regroup that amount into 1 ten so the value stays the same but the place-value form changes.</p>
                            <ol>
                                <li>Notice when a ones total is 10 or more.</li>
                                <li>Trade 10 ones for 1 ten.</li>
                                <li>Keep the leftover ones in the ones column.</li>
                            </ol>
                        </details>
                        <div class="s1-pane">
                            <strong>Question:</strong> Does 9 + 7 require regrouping?
                        </div>
                        <div class="s1-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; margin-top:0.6rem;">
                            <button id="s1-carry-yes" class="s1-btn ${state.carryLessonChoice === 'yes' ? 'active' : ''}" ${disabled(state.concreteUnlocked)}>Yes, regroup 10 ones into 1 ten.</button>
                            <button id="s1-carry-no" class="s1-btn ghost ${state.carryLessonChoice === 'no' ? 'active' : ''}" ${disabled(state.concreteUnlocked)}>No, keep all ones in place.</button>
                        </div>
                        <div class="s1-feedback">${state.carryLessonFeedback}</div>
                    </article>

                    <!-- CONCRETE LEVEL: L1.1 -->
                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:1;">
                        <h2>L1.1 Subitizing (Particle Counting)</h2>
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Particle Counting &amp; Subitizing</summary>
                            <p><strong>Subitizing</strong> is the brain's ability to instantly recognize the number of items in a small group without counting them one by one. This builds automatic number patterns:</p>
                            <ul>
                                <li><strong>Small Groups (1 to 4):</strong> Recognized instantly by pattern matching.</li>
                                <li><strong>Larger Groups (5 to 7):</strong> The brain uses "chunking" (sub-grouping). For example, a group of 5 dots is instantly chunked as a group of 2 and a group of 3 (2 + 3 = 5).</li>
                            </ul>
                            <p><strong>Step-by-Step Exercise:</strong></p>
                            <ol>
                                <li>Click <strong>Flash Dots</strong>. Particles will flash for 750 milliseconds and disappear.</li>
                                <li>In your mind, divide the flash into 2 smaller clusters (e.g. 2 dots on the left, 3 on the right).</li>
                                <li>Add the clusters together to find the sum.</li>
                            </ol>
                        </details>

                        <p><strong>L1.1 Subitizing (Particle Counting):</strong> Instantly recognize small quantities without counting them one-by-one. Follow the tutorial steps above.</p>
                        <div class="s1-sub-box">
                            <div id="s1-sub-container"></div>
                            <div id="s1-sub-overlay" class="s1-sub-overlay" style="display:${state.subitizingHidden ? 'flex' : 'none'};">Awaiting Flash...</div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: auto 1fr auto auto; gap: 4px;">
                            <button id="s1-flash-dots" class="s1-btn" ${disabled(state.concreteUnlocked)}>Flash Dots</button>
                            <input id="s1-guess-input" class="s1-input" placeholder="How many dots?" value="${state.subitizingGuess}" data-tutor-question-id="s1-subitizing-guess" data-tutor-level="concrete" data-tutor-answer-keys="subitizingGuess,subitizingDots,subitizingHidden" data-tutor-question="I need help with subitizing this flash-dot question and choosing the correct dot count." ${disabled(state.concreteUnlocked)} />
                            <button id="s1-guess-btn" class="s1-btn" data-tutor-question-id="s1-subitizing-guess" data-tutor-level="concrete" data-tutor-answer-keys="subitizingGuess,subitizingDots,subitizingHidden" data-tutor-question="I need help with subitizing this flash-dot question and choosing the correct dot count." ${disabled(state.concreteUnlocked)}>Guess</button>
                            <button id="s1-hint-subitizing" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div id="s1-subitizing-feedback" class="s1-feedback">${state.subitizingFeedback}</div>
                    </article>

                    <!-- CONCRETE LEVEL: L1.5 -->
                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:5;">
                        <h2>L1.5 Place Value Regrouping (Carrying)</h2>
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Place Value Regrouping (Carrying)</summary>
                            <p>In base-10, every <strong>10 ones</strong> can be exchanged for <strong>1 ten</strong>. This exchange is regrouping (carrying) and preserves total value while changing representation.</p>
                            <ol>
                                <li>Click <strong>+1 Block</strong> until the Ones column reaches 10.</li>
                                <li>Click <strong>Regroup</strong> to trade 10 ones for 1 ten rod.</li>
                                <li>Observe how value stays constant but place-value form changes.</li>
                            </ol>
                        </details>

                        <p><strong>L1.5 Base-10 Grid &amp; Place Value:</strong> Build ones, then regroup into tens.</p>
                        <div class="s1-blocks-arena">
                            <div class="s1-column-box">
                                <strong>Ones</strong>
                                <div id="s1-ones-blocks"></div>
                            </div>
                            <div class="s1-column-box">
                                <strong>Tens</strong>
                                <div id="s1-tens-blocks"></div>
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px;">
                            <button id="s1-add-block" class="s1-btn" ${disabled(state.concreteUnlocked)}>+1 Block</button>
                            <button id="s1-regroup-block" class="s1-btn" ${disabled(state.concreteUnlocked)}>Regroup</button>
                            <button id="s1-reset-block" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Reset</button>
                            <button id="s1-hint-blocks" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s1-feedback">${state.carryFeedback}</div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Explain the difference between counting objects and understanding columns like tens and ones." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.pictorialUnlocked)}" style="order:2;">
                        <h2>Pictorial Level: Comparison Indicators</h2>

                        
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Comparing Numbers &amp; Inequality Signs</summary>
                            <p>Inequality comparison signs are mathematical balance indicators:</p>
                            <ul>
                                <li><code>&gt;</code> (Greater Than): The left side is larger than the right side (e.g., 5 > 3).</li>
                                <li><code>&lt;</code> (Less Than): The left side is smaller than the right side (e.g., 3 < 5).</li>
                                <li><code>=</code> (Equal To): Both sides represent the exact same value (e.g., 4 = 4).</li>
                            </ul>
                            <p><strong>The "Alligator Mouth" Memory Trick:</strong> Think of the symbol as an open mouth. The mouth always opens wide to "eat" the larger number. The small point always points to the smaller number.</p>
                            <p><strong>Step-by-Step for Statement B:</strong></p>
                            <ol>
                                <li>Evaluate the expression on the left side first: <code>3 + 2 = 5</code>.</li>
                                <li>Compare the resulting <code>5</code> to the right-hand value <code>5</code>.</li>
                                <li>Since they are identical, they balance, so select the <code>=</code> sign.</li>
                            </ol>
                        </details>

                        <p><strong>L1.2 Comparisons:</strong> Select the correct inequality or equality symbol to balance the mathematical statements.
                        <br><em>Tip: The open side of the symbol (&gt; or &lt;) always points toward the larger number.</em></p>
                        <div class="s1-grid">
                            <div class="s1-pane">
                                <p><strong>Statement A:</strong> ${compA.left} ___ ${compA.right}</p>
                                <select id="s1-comp-q1" class="s1-input" data-cmr-question-help-skip="true" data-tutor-question-id="s1-comparison-a" data-tutor-level="pictorial" data-tutor-answer-keys="compQ1" data-tutor-question="For Statement A, help me decide which comparison symbol makes it true." ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Choose...</option>
                                    <option value="lt" ${state.compQ1 === 'lt' ? 'selected' : ''}>&lt;</option>
                                    <option value="gt" ${state.compQ1 === 'gt' ? 'selected' : ''}>&gt;</option>
                                    <option value="eq" ${state.compQ1 === 'eq' ? 'selected' : ''}>=</option>
                                </select>
                            </div>
                            <div class="s1-pane">
                                <p><strong>Statement B:</strong> ${compB.leftText} ___ ${compB.right}</p>
                                <select id="s1-comp-q2" class="s1-input" data-cmr-question-help-skip="true" data-tutor-question-id="s1-comparison-b" data-tutor-level="pictorial" data-tutor-answer-keys="compQ2" data-tutor-question="For Statement B, help me decide which symbol makes it true." ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Choose...</option>
                                    <option value="lt" ${state.compQ2 === 'lt' ? 'selected' : ''}>&lt;</option>
                                    <option value="gt" ${state.compQ2 === 'gt' ? 'selected' : ''}>&gt;</option>
                                    <option value="eq" ${state.compQ2 === 'eq' ? 'selected' : ''}>=</option>
                                </select>
                            </div>
                        </div>
                        <div class="s1-grid s1-compare-actions" style="margin-top:0.6rem; grid-template-columns: 1fr; gap: 4px;">
                            <button id="s1-check-comp" class="s1-btn" data-cmr-question-help-skip="true" data-tutor-question-id="s1-comparison-check" data-tutor-level="pictorial" data-tutor-answer-keys="compQ1,compQ2" data-tutor-question="Check my comparison-symbol choices and explain why each statement should be greater than, less than, or equal." ${disabled(state.pictorialUnlocked)}>Validate Symbols</button>
                        </div>
                        <div class="s1-feedback">${state.compFeedback}</div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.abstractUnlocked)}" style="order:6;">
                        <h2>Abstract Level: Multi-Digit Addition (No carrying)</h2>
                        
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Column Addition without Carrying</summary>
                            <p>When adding large numbers, we align them vertically by place value (Ones under Ones, Tens under Tens, Hundreds under Hundreds). We then add each column independently starting from the right-hand side:</p>
                            <ol>
                                <li><strong>Ones place:</strong> Add the ones digits. Write it in the ones column.</li>
                                <li><strong>Tens place:</strong> Add the tens digits. Write it in the tens column.</li>
                                <li><strong>Hundreds place:</strong> Add the hundreds digits. Write it in the hundreds column.</li>
                            </ol>
                            <p>Because no column sum exceeds 9, no regrouping (carrying) is needed.</p>
                        </details>

                        <p><strong>L1.6 Multi-Digit Addition:</strong> Add column by column. The ones place aligns perfectly and does not overflow, so you just add row digits.</p>
                        <div class="s1-pane">
                            <div style="font-family:monospace; font-size:1.3rem; line-height:1.4; text-align:center; white-space:pre;">${addition.text}</div>
                            <div style="margin-top: 8px;">
                                <input id="s1-add-input" class="s1-input" style="text-align:center;" placeholder="Enter sum" value="${state.additionAnswer}" data-tutor-question-id="s1-addition" data-tutor-level="abstract" data-tutor-answer-keys="additionAnswer" data-tutor-question="${additionTutorQuestion}" ${disabled(state.abstractUnlocked)} />
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <button id="s1-check-add" class="s1-btn" data-tutor-question-id="s1-addition" data-tutor-level="abstract" data-tutor-answer-keys="additionAnswer" data-tutor-question="${additionTutorQuestion}" ${disabled(state.abstractUnlocked)}>Check Sum</button>
                            <button id="s1-hint-addition" class="s1-btn ghost" ${disabled(state.abstractUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s1-feedback">${state.additionFeedback}</div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="${additionTutorPrompt}" ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL: L1.8 -->
                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}" style="order:8;">
                        <h2>L1.8 Meniscus Reading &amp; Parallax Error</h2>

                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Meniscus Reading &amp; Parallax Error</summary>
                            <p>Water molecules cling to glassware walls, forming a curved surface called a <strong>meniscus</strong>. In chemistry, volume is always read at the <strong>lowest point of this curve (bottom of the meniscus)</strong>. To avoid <strong>parallax error</strong> (distortion from viewing at an angle), your eyes must be perfectly level with the meniscus. You must also estimate one decimal place beyond the smallest graduation marks.</p>
                            <ol>
                                <li>Adjust the camera angle slider to exactly <strong>0° (Eye Level)</strong>. If it is not level, you will see a skewed red sightline.</li>
                                <li>Read the volume. The cylinder has major marks at 4.0 and 5.0 mL, with minor markings every 0.1 mL.</li>
                                <li>The meniscus bottom lies between 4.3 and 4.4 mL. Estimate the final digit (e.g. 4.35 mL) and enter it below.</li>
                            </ol>
                        </details>

                        <p><strong>L1.8 Meniscus Calibration Practice:</strong> Adjust the slider to 0° to level the camera, then input the volume at the bottom of the meniscus.</p>

                        <div style="display:flex; justify-content:center; margin: 0.6rem 0;">
                            <svg id="s1-meniscus-svg" style="width:160px; height:180px; background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:8px;" viewBox="0 0 100 120">
                                <!-- Grid Lines and labels -->
                                <line x1="20" y1="20" x2="45" y2="20" stroke="#cbd5e1" stroke-width="1.5" />
                                <text x="5" y="23" font-size="7px" fill="#94a3b8">5.0</text>
                                <line x1="20" y1="28" x2="35" y2="28" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="36" x2="35" y2="36" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="44" x2="35" y2="44" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="52" x2="35" y2="52" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="60" x2="40" y2="60" stroke="#cbd5e1" stroke-width="1" />
                                <text x="5" y="63" font-size="7px" fill="#94a3b8">4.5</text>
                                <line x1="20" y1="68" x2="35" y2="68" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="76" x2="35" y2="76" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="84" x2="35" y2="84" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="92" x2="35" y2="92" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                                <line x1="20" y1="100" x2="45" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                                <text x="5" y="103" font-size="7px" fill="#94a3b8">4.0</text>

                                <!-- Cylinder outline -->
                                <path d="M 20,10 L 20,110 Q 20,115 25,115 L 75,115 Q 80,115 80,110 L 80,10" stroke="#94a3b8" stroke-width="2.5" fill="none" />

                                <!-- Liquid blue background -->
                                <rect x="21" y="76" width="58" height="38" fill="rgba(14,165,233,0.15)" />
                                <!-- Curved Meniscus at 4.35 (y=80) -->
                                <path d="M 21,78 Q 50,85 79,78" stroke="#0ea5e9" stroke-width="2" fill="none" />

                                <!-- Sightline representing parallax angle (based on cameraAngle) -->
                                <line x1="5" y1="${80 - 50 * Math.sin(state.cameraAngle * Math.PI / 180)}" x2="95" y2="${80 + 40 * Math.sin(state.cameraAngle * Math.PI / 180)}" stroke="${state.cameraAngle === 0 ? '#22c55e' : '#ef4444'}" stroke-width="1.5" stroke-dasharray="2" />
                                <circle cx="5" cy="${80 - 50 * Math.sin(state.cameraAngle * Math.PI / 180)}" r="3" fill="${state.cameraAngle === 0 ? '#22c55e' : '#ef4444'}" />
                            </svg>
                        </div>

                        <div class="s1-pane" style="margin-bottom:0.6rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Camera Angle: <strong>${state.cameraAngle}°</strong></span>
                                <span style="font-weight:bold; color:${state.cameraAngle === 0 ? '#22c55e' : '#ef4444'};">
                                    ${state.cameraAngle === 0 ? 'Eye Level (0°)' : 'Parallax Error!'}
                                </span>
                            </div>
                            <div style="display:flex; gap:6px; align-items:center; margin-top:0.4rem;">
                                <input type="range" id="s1-camera-slider" class="s1-slider" min="-20" max="20" step="5" value="${state.cameraAngle}" ${disabled(state.concreteUnlocked)} style="flex:1; accent-color:#f59e0b;" />
                                <input type="number" id="s1-camera-input" class="s1-input" min="-20" max="20" step="5" value="${state.cameraAngle}" ${disabled(state.concreteUnlocked)} style="width:72px; padding:0.25rem;" aria-label="Camera angle numeric entry" />
                            </div>
                        </div>

                        <div class="s1-grid" style="grid-template-columns: 1fr auto; gap: 4px; margin-bottom: 0.6rem;">
                            <input id="s1-meniscus-input" class="s1-input" placeholder="Enter volume (e.g. 4.35)" value="${state.meniscusVolume}" ${disabled(state.concreteUnlocked)} />
                            <button id="s1-meniscus-btn" class="s1-btn" ${disabled(state.concreteUnlocked)}>Verify Volume</button>
                        </div>
                        <div class="s1-feedback" id="s1-meniscus-feedback">${state.meniscusFeedback}</div>

                        <div class="s1-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s1-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s1-pill ${state.concreteMission.subitizingSolved ? 'good' : 'locked'}">L1.1 quantity</span>
                                <span class="s1-pill ${state.concreteMission.regroupDone ? 'good' : 'locked'}">L1.5 regrouping</span>
                                <span class="s1-pill ${state.concreteMission.meniscusReadCorrect ? 'good' : 'locked'}">L1.8 meniscus</span>
                            </div>
                            <div class="s1-grid" style="gap:4px;">
                                <button id="s1-hint-concrete" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Mission Hint?</button>
                                <button id="s1-continue-pictorial" class="s1-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.appliedUnlocked)}" style="order:9;">
                        <h2>Applied Level: Relative Zero vs Absolute Scales</h2>
                        
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Relative Zero and Absolute Zero</summary>
                            <p>In science, "zero" can be either a chosen baseline or a physical absolute reference:</p>
                            <ul>
                                <li><strong>Relative zero (tare):</strong> A scale can be reset so a container reads 0.00 g, letting you measure only added material.</li>
                                <li><strong>Offset scales:</strong> Celsius uses an offset where 0 C is not zero thermal energy.</li>
                                <li><strong>Absolute scale:</strong> Kelvin starts at 0 K (absolute zero), and 25 C converts to 298.15 K.</li>
                            </ul>
                        </details>

                        <p><strong>L1.9 Relative Zero vs. Absolute Scales:</strong> ${applied.questionText}</p>
                        ${isAppliedFreeResponse
                            ? `<div class="s1-grid" style="grid-template-columns: 1fr;">
                                <textarea id="s1-app-response" class="s1-input" rows="4" placeholder="Type your explanation: what does tare reset, and how is that different from Kelvin absolute zero?" data-tutor-question-id="s1-applied-tare" data-tutor-level="applied" data-tutor-answer-keys="appliedResponseText,appliedFeedback,appliedError" data-tutor-question="Review my written explanation of relative zero versus absolute zero and help me improve it." ${disabled(state.appliedUnlocked)}>${state.appliedResponseText || ''}</textarea>
                            </div>`
                            : `<div class="s1-grid">
                                ${appliedOptions.map((option, index) => {
                                    const isActive = state.appliedSelectedOptionId === option.id;
                                    const className = isActive ? 's1-btn active' : 's1-btn ghost';
                                    return `<button id="s1-app-opt-${index}" class="${className}" data-s1-applied-option="true" data-option-id="${option.id}" data-option-text="${option.text.replace(/"/g, '&quot;')}" data-tutor-question-id="s1-applied-tare" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice,appliedSelectedOptionId,appliedSelectedOptionText" data-tutor-question="In this lab tare scenario, help me reason what zeroing a scale really means conceptually." ${disabled(state.appliedUnlocked)}>${option.text}</button>`;
                                }).join('')}
                            </div>`}
                        <div class="s1-grid" style="margin-top: 0.6rem; grid-template-columns: 1fr;">
                            <button id="s1-app-submit" class="s1-btn" data-tutor-question-id="s1-applied-tare" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice,appliedSelectedOptionId,appliedSelectedOptionText,appliedResponseText,appliedFeedback,appliedError" data-tutor-question="Grade my L1.9 response for relative-zero versus absolute-zero and explain the reasoning." ${(state.appliedLoading || (!isAppliedFreeResponse && !state.appliedSelectedOptionId)) ? 'disabled' : ''} ${disabled(state.appliedUnlocked)}>${state.appliedLoading ? `Grading with ${getChemModelLabel()}...` : 'Submit L1.9 Answer'}</button>
                        </div>
                        <div class="s1-feedback">${state.appliedFeedback}</div>
                        ${state.appliedError ? `<div class="s1-feedback" style="border-color: rgba(248,113,113,0.45); background: rgba(127,29,29,0.35); color: #fecaca;">${state.appliedError}</div>` : ''}
                        ${state.appliedGrading ? `<div class="s1-feedback" style="border-color: rgba(34,197,94,0.35); background: rgba(20,83,45,0.35); color: #bbf7d0;">Model score: ${state.appliedGrading.score ?? 0} | confidence: ${state.appliedGrading.confidence ?? 0}${state.appliedLastModel ? ` | model: ${state.appliedLastModel}` : ''}${state.appliedGrading.regraded ? ' | second-pass regrade applied' : ''}</div>` : ''}

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Help me distinguish relative zero (tare) from absolute zero (Kelvin) using chemistry measurement examples." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const syncConcreteMission = () => {
                if (state.fastTrack) return;
                if (state.concreteMission.subitizingSolved && state.concreteMission.regroupDone && state.concreteMission.meniscusReadCorrect && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.meniscusFeedback = 'Concrete mission complete! Subitizing, place value regrouping, and meniscus eye-level reading are all mastered. Pictorial unlocked. Continue below.';
                }
            };

            // Subitizing Renderer
            const renderDots = () => {
                const subContainer = host.querySelector('#s1-sub-container');
                if (!subContainer) return;
                subContainer.innerHTML = '';
                if (!state.subitizingHidden) {
                    for (let i = 0; i < state.subitizingDots; i++) {
                        const dot = document.createElement('div');
                        dot.className = 's1-dot';
                        // Keep within box bounds
                        dot.style.left = `${10 + Math.random() * 80}%`;
                        dot.style.top = `${10 + Math.random() * 80}%`;
                        subContainer.appendChild(dot);
                    }
                }
            };

            // Blocks Renderer
            const renderBlocks = () => {
                const onesBlocks = host.querySelector('#s1-ones-blocks');
                const tensBlocks = host.querySelector('#s1-tens-blocks');
                if (!onesBlocks || !tensBlocks) return;

                onesBlocks.innerHTML = '';
                for (let i = 0; i < state.onesCount; i++) {
                    const block = document.createElement('div');
                    block.className = 's1-block-unit';
                    onesBlocks.appendChild(block);
                }

                tensBlocks.innerHTML = '';
                for (let i = 0; i < state.tensCount; i++) {
                    const rod = document.createElement('div');
                    rod.className = 's1-block-rod';
                    rod.textContent = '10 Units';
                    tensBlocks.appendChild(rod);
                }
            };

            renderDots();
            renderBlocks();

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic Logic
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic option chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s1-check-diagnostic').addEventListener('click', () => {
                const isCorrect = state.diagnosticAnswers.q1 === 'lt' &&
                                  state.diagnosticAnswers.q2 === '7' &&
                                  state.diagnosticAnswers.q3 === 'regroup';
                state.diagnosticDone = true;
                if (isCorrect) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered subitizing/quantity symbols, zero identities, and basic carrying. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. To prevent conceptual gaps, the course will guide you through the Concrete → Pictorial → Abstract path.';
                }
                persist('Stage 1 diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-single-add-check')?.addEventListener('click', () => {
                const raw = host.querySelector('#s1-single-add-input').value.trim();
                state.singleAdditionAnswer = raw;
                if (raw === '7') {
                    state.singleAdditionFeedback = 'Correct. 4 + 3 = 7.';
                } else {
                    state.singleAdditionFeedback = 'Not quite. Add the two single-digit numbers together.';
                }
                persist('L1.3 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-single-add-hint')?.addEventListener('click', () => {
                state.singleAdditionFeedback = 'Hint: start at 4 and count up 3 more steps.';
                persist('L1.3 hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-single-sub-check')?.addEventListener('click', () => {
                const raw = host.querySelector('#s1-single-sub-input').value.trim();
                state.singleSubtractionAnswer = raw;
                if (raw === '3') {
                    state.singleSubtractionFeedback = 'Correct. 8 - 5 = 3.';
                } else {
                    state.singleSubtractionFeedback = 'Not quite. Start with 8 and take away 5.';
                }
                persist('L1.4 checked');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-single-sub-hint')?.addEventListener('click', () => {
                state.singleSubtractionFeedback = 'Hint: count back 5 from 8.';
                persist('L1.4 hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-carry-yes')?.addEventListener('click', () => {
                state.carryLessonChoice = 'yes';
                state.carryLessonFeedback = 'Correct. 9 + 7 makes 16, so the 1 in 16 carries into the tens place.';
                persist('L1.7 carry yes');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-carry-no')?.addEventListener('click', () => {
                state.carryLessonChoice = 'no';
                state.carryLessonFeedback = 'Not quite. 9 + 7 is more than 9, so regrouping is required.';
                persist('L1.7 carry no');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Subitizing
            host.querySelector('#s1-flash-dots').addEventListener('click', () => {
                if (host.__s1FlashTimer) {
                    clearTimeout(host.__s1FlashTimer);
                    host.__s1FlashTimer = null;
                }

                state.subitizingHidden = false;
                state.subitizingDots = Math.floor(3 + Math.random() * 5); // 3 to 7 dots
                state.subitizingFeedback = 'Flashed!';

                renderDots();
                const overlay = host.querySelector('#s1-sub-overlay');
                const feedback = host.querySelector('#s1-subitizing-feedback');
                if (overlay) overlay.style.display = 'none';
                if (feedback) feedback.textContent = state.subitizingFeedback;
                persist('Dots flashed');

                host.__s1FlashTimer = setTimeout(() => {
                    state.subitizingHidden = true;
                    renderDots();
                    const hideOverlay = host.querySelector('#s1-sub-overlay');
                    if (hideOverlay) hideOverlay.style.display = 'flex';
                    persist('Dots hidden');
                    host.__s1FlashTimer = null;
                }, 750); // Flash for 750ms
            });

            host.querySelector('#s1-guess-btn').addEventListener('click', () => {
                state.subitizingGuess = host.querySelector('#s1-guess-input').value.trim();
                if (parseInt(state.subitizingGuess) === state.subitizingDots) {
                    state.concreteMission.subitizingSolved = true;
                    state.subitizingFeedback = `Correct! You subitized ${state.subitizingDots} particles instantly.`;
                } else {
                    if (!state.concreteCompleted) {
                        state.concreteMission.subitizingSolved = false;
                    }
                    state.subitizingFeedback = `Incorrect. There were ${state.subitizingDots} particles. Try again!`;
                }
                syncConcreteMission();
                persist('Dots guess checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Blocks
            host.querySelector('#s1-add-block')?.addEventListener('click', () => {
                state.onesCount += 1;
                if (state.onesCount >= 10) {
                    state.carryFeedback = 'Ones column contains 10 blocks! You can now merge them into a Ten rod by clicking Regroup.';
                } else {
                    state.carryFeedback = `Added 1 Ones block. Total ones: ${state.onesCount}.`;
                }
                persist('Blocks added');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-regroup-block')?.addEventListener('click', () => {
                if (state.onesCount >= 10) {
                    state.onesCount -= 10;
                    state.tensCount += 1;
                    state.concreteMission.regroupDone = true;
                    state.carryFeedback = 'Regroup complete! 10 ones blocks merged into 1 ten-rod. This is addition carrying.';
                    syncConcreteMission();
                }
                persist('Blocks regrouped');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-reset-block')?.addEventListener('click', () => {
                state.onesCount = 0;
                state.tensCount = 0;
                if (!state.concreteCompleted) {
                    state.concreteMission.regroupDone = false;
                }
                state.carryFeedback = 'Blocks reset.';
                persist('Blocks reset');
                this.mount({ host, state, onStateChange });
            });

            // Meniscus camera controls
            const updateCameraAngle = (val) => {
                const parsed = parseInt(val, 10);
                if (Number.isNaN(parsed)) return;
                state.cameraAngle = Math.max(-20, Math.min(20, parsed));
                persist('Camera angle changed');
                this.mount({ host, state, onStateChange });
            };

            host.querySelector('#s1-camera-slider')?.addEventListener('input', (e) => {
                updateCameraAngle(e.target.value);
            });

            host.querySelector('#s1-camera-input')?.addEventListener('change', (e) => {
                updateCameraAngle(e.target.value);
            });

            // Meniscus verify volume
            host.querySelector('#s1-meniscus-btn')?.addEventListener('click', () => {
                const inputVal = parseFloat(host.querySelector('#s1-meniscus-input').value.trim());
                state.meniscusVolume = host.querySelector('#s1-meniscus-input').value.trim();

                if (state.cameraAngle !== 0) {
                    state.meniscusFeedback = 'Error: Parallax deviation active. You must set the camera angle to 0° (eye-level) to read the meniscus bottom accurately.';
                    state.concreteMission.meniscusReadCorrect = false;
                } else if (Math.abs(inputVal - 4.35) <= 0.01) {
                    state.meniscusCorrect = true;
                    state.concreteMission.meniscusReadCorrect = true;
                    state.meniscusFeedback = 'Correct! The volume at the bottom of the meniscus is 4.35 mL (interpolating between 4.3 and 4.4).';
                } else {
                    state.concreteMission.meniscusReadCorrect = false;
                    state.meniscusFeedback = `Incorrect volume: ${state.meniscusVolume} mL. Look closely at the bottom of the curved meniscus line. It is halfway between 4.3 and 4.4.`;
                }
                syncConcreteMission();
                persist('Meniscus volume verified');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-hint-concrete')?.addEventListener('click', () => {
                if (!state.concreteMission.subitizingSolved) {
                    state.subitizingFeedback = 'Mission hint: flash dots, chunk quickly, and submit one correct subitizing guess.';
                } else if (!state.concreteMission.regroupDone) {
                    state.carryFeedback = 'Mission hint: add ones until you reach 10, then click Regroup to create one tens rod.';
                } else if (!state.concreteMission.meniscusReadCorrect) {
                    state.meniscusFeedback = 'Mission hint: set the camera slider to exactly 0°, then read the volume (bottom of curve is at 4.35).';
                } else {
                    state.meniscusFeedback = 'Concrete mission complete! Continue to Pictorial below.';
                }
                persist('Concrete mission hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.meniscusFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.meniscusFeedback = 'Complete all Concrete mission steps first: subitizing solved, 10 ones regrouped, and meniscus read at eye level.';
                }
                persist('Continue to pictorial clicked');
                this.mount({ host, state, onStateChange });
            });

            // Pictorial Comparisons
            host.querySelector('#s1-check-comp').addEventListener('click', () => {
                const q1 = host.querySelector('#s1-comp-q1').value;
                const q2 = host.querySelector('#s1-comp-q2').value;
                state.compQ1 = q1;
                state.compQ2 = q2;

                const q1Correct = q1 === compA.answerKey;
                const q2Correct = q2 === compB.answerKey;

                if (q1Correct && q2Correct) {
                    state.compFeedback = 'Correct! All inequality and equality symbols are balanced successfully. Abstract unlocked. Continue below.';
                    state.abstractUnlocked = true; // Unlock abstract
                } else {
                    state.compFeedback = 'Not yet. Review your symbols. Remember, the open mouth faces the larger side.';
                }
                persist('Comparisons validated');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Addition
            host.querySelector('#s1-check-add')?.addEventListener('click', () => {
                const ans = host.querySelector('#s1-add-input').value.trim();
                state.additionAnswer = ans;
                const normalizeNumeric = (value) => {
                    const text = String(value ?? '').trim().replace(/,/g, '').replace(/^\+/, '');
                    if (!text) return null;
                    const num = Number(text);
                    return Number.isFinite(num) ? num : null;
                };

                const actual = normalizeNumeric(ans);
                const expected = normalizeNumeric(addition.answerKey);

                if (actual === null || expected === null) {
                    state.additionFeedback = 'Enter a numeric sum to check your answer.';
                } else if (actual === expected) {
                    state.additionFeedback = `Correct. The sum ${addition.answerKey} aligns column-by-column perfectly. Applied unlocked. Continue below.`;
                    state.appliedUnlocked = true; // Unlock applied
                } else {
                    state.additionFeedback = `Incorrect sum: ${ans}. Try again column-by-column.`;
                }
                persist('Addition checked');
                this.mount({ host, state, onStateChange });
            });

            // Hints
            host.querySelector('#s1-hint-subitizing')?.addEventListener('click', () => {
                if (state.subitizingDots === 5) {
                    state.subitizingFeedback = 'Hint: 5 dots can be chunked into a group of 3 and a group of 2 (3 + 2 = 5).';
                } else if (!state.subitizingDots) {
                    state.subitizingFeedback = 'Hint: Click "Flash Dots" first to show the particles!';
                } else {
                    state.subitizingFeedback = `Hint: Try to count the flash in sub-groups. (Total dots is ${state.subitizingDots}).`;
                }
                persist('Subitizing hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-hint-blocks')?.addEventListener('click', () => {
                if (state.onesCount < 10) {
                    state.carryFeedback = `Hint: You have ${state.onesCount} ones. Add ${10 - state.onesCount} more ones to reach 10 ones blocks.`;
                } else {
                    state.carryFeedback = 'Hint: You have 10 ones blocks! Click "Regroup" to carry them into the Tens column.';
                }
                persist('Blocks hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-hint-addition')?.addEventListener('click', () => {
                state.additionFeedback = `Hint: Sum the digits column-by-column. The expected sum is ${addition.answerKey}.`;
                persist('Addition hint shown');
                this.mount({ host, state, onStateChange });
            });

            // Applied Zeroing: selection/text entry, then explicit submit for model grading.
            host.querySelectorAll('[data-s1-applied-option="true"]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    state.appliedSelectedOptionId = btn.getAttribute('data-option-id') || '';
                    state.appliedSelectedOptionText = btn.getAttribute('data-option-text') || btn.textContent?.trim() || '';
                    state.appliedChoice = state.appliedSelectedOptionId;
                    state.appliedError = '';
                    state.appliedGrading = null;
                    state.appliedFeedback = `Selection saved. Submit to grade this challenge with ${getChemModelLabel()}.`;
                    persist('Applied option selected');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s1-app-response')?.addEventListener('input', (e) => {
                state.appliedResponseText = e.target.value;
            });

            host.querySelector('#s1-app-submit')?.addEventListener('click', async () => {
                if (state.appliedLoading) return;
                const usingFreeResponse = isAppliedFreeResponse;
                const typedResponse = String(state.appliedResponseText || '').trim();
                if (usingFreeResponse && !typedResponse) {
                    state.appliedError = 'Type your explanation before submitting.';
                    persist('Applied submit missing response');
                    this.mount({ host, state, onStateChange });
                    return;
                }
                if (!usingFreeResponse && !state.appliedSelectedOptionId) {
                    state.appliedError = 'Select an option before submitting.';
                    persist('Applied submit missing selection');
                    this.mount({ host, state, onStateChange });
                    return;
                }

                state.appliedLoading = true;
                state.appliedError = '';
                state.appliedGrading = null;
                persist('Applied grading started');
                this.mount({ host, state, onStateChange });

                const refresherApi = window.ChemMathRefresher;
                const learnerResponse = usingFreeResponse
                    ? typedResponse
                    : `selected_option_id=${state.appliedSelectedOptionId}; selected_option_text=${state.appliedSelectedOptionText}`;
                const grading = await refresherApi?.gradeAdaptiveResponse?.({
                    prompt: applied.questionText,
                    answerKey: applied.answerKey,
                    rubric: applied.rubric || { scoring: 'exact-match', max_points: 1 },
                    learnerResponse,
                    regradeThreshold: refresherApi?.getAdaptiveSnapshot?.()?.grading?.lowConfidenceRegradeThreshold || 0.7
                });

                state.appliedLoading = false;
                state.appliedLastModel = grading?.model || '';

                if (grading?.ok && grading?.result) {
                    state.appliedGrading = grading.result;
                    state.appliedFeedback = grading.result.feedback || 'Model grading completed.';
                } else {
                    const localCorrect = (() => {
                        if (!usingFreeResponse) {
                            return state.appliedSelectedOptionId === applied.answerKey;
                        }
                        const normalized = typedResponse.toLowerCase();
                        const hasRelative = /relative|tare|baseline|reference/.test(normalized);
                        const hasAbsolute = /absolute|kelvin|0\s*k|thermodynamic/.test(normalized);
                        return hasRelative && hasAbsolute;
                    })();
                    state.appliedGrading = {
                        isCorrect: localCorrect,
                        score: localCorrect ? 1 : 0,
                        confidence: 0,
                        feedback: localCorrect
                            ? (appliedOverride?.workedSolution || applied?.workedSolution || 'Correct. Tare sets a relative reference while Kelvin is absolute.')
                            : 'Not quite. Tare does not define absolute physical zero; it shifts the measurement baseline.',
                        rationale: grading?.result?.rationale || 'Model grading unavailable; used local fallback check.',
                        regraded: false
                    };
                    state.appliedFeedback = state.appliedGrading.feedback;
                    state.appliedError = `Model grading fallback: ${grading?.result?.rationale || 'Unable to grade response with the active model.'}`;
                }

                const isCorrect = Boolean(state.appliedGrading?.isCorrect);
                refresherApi?.recordAdaptiveAttempt?.({
                    stageId: 'stage1',
                    lessonId: 'L1.9',
                    competencyId: 'zero-reference',
                    isCorrect,
                    source: grading?.ok
                        ? (state.appliedGrading?.regraded ? 's1-l19-llm-regraded' : 's1-l19-llm')
                        : 's1-l19-fallback',
                    confidence: state.appliedGrading?.confidence,
                    score: state.appliedGrading?.score,
                    model: state.appliedLastModel || null
                });

                persist('Applied grading completed');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
            const guessInput = host.querySelector('#s1-guess-input');
            if (guessInput) {
                guessInput.addEventListener('input', (e) => {
                    state.subitizingGuess = e.target.value;
                });
            }

            const compQ1 = host.querySelector('#s1-comp-q1');
            if (compQ1) {
                compQ1.addEventListener('change', (e) => {
                    state.compQ1 = e.target.value;
                });
            }

            const compQ2 = host.querySelector('#s1-comp-q2');
            if (compQ2) {
                compQ2.addEventListener('change', (e) => {
                    state.compQ2 = e.target.value;
                });
            }

            const addInput = host.querySelector('#s1-add-input');
            if (addInput) {
                addInput.addEventListener('input', (e) => {
                    state.additionAnswer = e.target.value;
                });
            }


            const meniscusInput = host.querySelector('#s1-meniscus-input');
            if (meniscusInput) {
                meniscusInput.addEventListener('input', (e) => {
                    state.meniscusVolume = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
