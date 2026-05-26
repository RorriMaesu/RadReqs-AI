const STAGE2_LESSON_ORDER = [
    'L2.1',
    'L2.2',
    'L2.3',
    'L2.4',
    'L2.5',
    'L2.6',
    'L2.7',
    'L2.8',
    'L2.9',
    'L2.10'
];

const STAGE2_LESSON_TITLES = {
    'L2.1': 'Multi-Digit Subtraction',
    'L2.2': 'Subtraction Borrowing',
    'L2.3': 'Borrowing Across Zeros',
    'L2.4': 'Multiplication Foundations',
    'L2.5': 'Multiplication Grid Mechanics',
    'L2.6': 'Division Concept',
    'L2.7': 'The Division Loop',
    'L2.8': 'Mental Benchmarking & Estimation',
    'L2.9': 'Division as Measurement Partitioning',
    'L2.10': 'Stoichiometric Mental Benchmarks'
};

function createInitialLessonStatus() {
    return STAGE2_LESSON_ORDER.reduce((acc, lessonId) => {
        acc[lessonId] = false;
        return acc;
    }, {});
}

function getNextIncompleteLesson(lessonStatus) {
    return STAGE2_LESSON_ORDER.find((lessonId) => !lessonStatus[lessonId]) || null;
}

function isLessonUnlocked(lessonStatus, lessonId) {
    const lessonIndex = STAGE2_LESSON_ORDER.indexOf(lessonId);
    if (lessonIndex === -1) return true;
    if (lessonIndex === 0) return true;
    const previousLessonId = STAGE2_LESSON_ORDER[lessonIndex - 1];
    return !!lessonStatus[previousLessonId];
}

function markLessonComplete(state, lessonId) {
    if (!state.lessonStatus || !Object.prototype.hasOwnProperty.call(state.lessonStatus, lessonId)) return;
    state.lessonStatus[lessonId] = true;
    state.activeLesson = getNextIncompleteLesson(state.lessonStatus);
}

function formatNumericValue(value, decimals = 2) {
    if (!Number.isFinite(value)) return '';
    if (decimals <= 0) return String(Math.round(value));
    return Number(value.toFixed(decimals)).toString();
}

function parseStrictNumber(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const strictPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
    if (!strictPattern.test(raw)) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

const createInitialStage2State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,

    // Subtraction borrowing
    multiSubtractAnswer: '',
    multiSubtractFeedback: 'L2.1 Multi-Digit Subtraction: Solve 742 - 319 without regrouping mistakes.',
    borrowBasicAnswer: '',
    borrowBasicFeedback: 'L2.2 Subtraction Borrowing: Solve 563 - 278 by regrouping once per needed column.',
    hundreds: 4,
    tens: 0,
    ones: 2,
    regroupHundreds: false,
    regroupTens: false,
    borrowAnswer: '',
    borrowFeedback: 'Solve 402 - 187 by regrouping across the internal zero first.',

    // Division loop
    step1Divide: '',
    step1Multiply: '',
    step1Subtract: '',
    step1BringDown: '',
    step2Divide: '',
    step2Multiply: '',
    step2Subtract: '',
    errorColumn: '',
    divisionFeedback: 'Work the problem 156 ÷ 12 one loop at a time: divide, multiply, subtract, bring down.',
    divisionPassed: false,
    
    // Sub-unity division
    subunityAnswer: '',
    subunityFeedback: 'L2.9 Sub-Unity Division: Evaluate 1.20 ÷ 0.05. Frame this as measurement partitioning: how many 0.05-unit portions fit inside 1.20 units?',
    subunityFeedbackTone: 'info',
    subunityCorrect: false,

    // Mental benchmarking and estimation
    estimateInput: '',
    estimateFeedback: 'L2.8 Estimation: Round 29.4 x 3.1 to friendly numbers before using a calculator.',

    // Pictorial grid product
    gridAnswer: '',
    gridFeedback: 'Count rows and columns to find the product.',
    gridMechanicsAnswer: '',
    gridMechanicsFeedback: 'L2.5 Grid Mechanics: For a 7 x 9 array, calculate the full product.',

    // Division concept
    divisionConceptChoice: '',
    divisionConceptFeedback: 'L2.6 Division Concept: Choose the interpretation that models equal-size grouping.',

    // Stoichiometric benchmarks
    stoichChoice: '',
    stoichResponse: '',
    stoichGrading: null,
    stoichLoading: false,
    stoichError: '',
    stoichInput: '',
    stoichFeedback: 'L2.10 Stoichiometry: Estimate the moles of Carbon in 35.8 g (molar mass ~12 g/mol) using a friendly division benchmark (e.g. 36 ÷ 12).',

    appliedFeedback: 'Applied level: chemical dilution grids. If you have a 3x4 grid of sample wells, how many total samples can you hold?',
    appliedChoice: '',

    lessonStatus: createInitialLessonStatus(),
    activeLesson: 'L2.1'
});

function getDivisionSteps(dividend, divisor) {
    const divStr = String(dividend);
    const digit12 = parseInt(divStr.substring(0, 2), 10);
    const digit3 = parseInt(divStr.substring(2, 3), 10);
    
    const s1d = Math.floor(digit12 / divisor);
    const s1m = s1d * divisor;
    const s1s = digit12 - s1m;
    const s1b = s1s * 10 + digit3;
    
    const s2d = Math.floor(s1b / divisor);
    const s2m = s2d * divisor;
    const s2s = s1b - s2m;
    
    return {
        part1: digit12,
        step1Divide: String(s1d),
        step1Multiply: String(s1m),
        step1Subtract: String(s1s),
        step1BringDown: String(s1b),
        step2Divide: String(s2d),
        step2Multiply: String(s2m),
        step2Subtract: String(s2s)
    };
}

export function createStage2Division() {
    return {
        id: 'stage2',
        label: 'Multi-Digit & Division',
        title: 'Stage 2: Multi-Digit Subtraction & Multiplicative Thinking',
        getInitialState() {
            return createInitialStage2State();
        },
        mount({ host, state, onStateChange, questionOverrides = {} }) {
            const defaults = createInitialStage2State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });
            state.lessonStatus = {
                ...createInitialLessonStatus(),
                ...(state.lessonStatus || {})
            };
            state.activeLesson = getNextIncompleteLesson(state.lessonStatus) || 'L2.10';
            const refresherApi = window.ChemMathRefresher;
            const lessonUnlocked = (lessonId) => state.fastTrack || isLessonUnlocked(state.lessonStatus, lessonId);
            const levelLocked = (lessonId) => lessonUnlocked(lessonId) ? '' : 's2-locked';
            const disabled = (lessonId) => lessonUnlocked(lessonId) ? '' : 'disabled';

            const overrides = state.questionOverrides || {};
            const getParams = (qId, defaultVal) => overrides[qId]?.parameters || overrides[qId] || defaultVal;
            
            const s2Partition = getParams('s2-partition', { stock: 1.20, portion: 0.05, answerKey: '24' });
            const s2Estimate = getParams('s2-estimate', {
                questionText: 'Estimate the ratio: 48.2 g of carbon divided by 12.01 g/mol molar mass. How many moles is this approximately?',
                options: [
                    { id: 'right', text: 'About 4 moles' },
                    { id: 'wrong', text: 'About 0.25 moles' }
                ],
                answerKey: 'right'
            });
            const s2EstimateGenerated = Boolean(overrides['s2-estimate']);
            const s2Div = getParams('s2-division', { dividend: 156, divisor: 12, answerKey: '13' });
            const divSteps = getDivisionSteps(s2Div.dividend, s2Div.divisor);
            const parsedPartitionStock = parseStrictNumber(s2Partition.stock);
            const parsedPartitionPortion = parseStrictNumber(s2Partition.portion);
            const stockFallbackUsed = !(Number.isFinite(parsedPartitionStock) && parsedPartitionStock > 0);
            const portionFallbackUsed = !(Number.isFinite(parsedPartitionPortion) && parsedPartitionPortion > 0);
            const partitionStock = stockFallbackUsed ? 1.2 : parsedPartitionStock;
            const partitionPortion = portionFallbackUsed ? 0.05 : parsedPartitionPortion;
            const computedPartitionAnswer = partitionStock / partitionPortion;
            const configuredPartitionAnswer = parseStrictNumber(s2Partition.answerKey);
            const allowPartitionAnswerOverride = s2Partition.allowAnswerOverride === true;
            const partitionOverrideMismatch = Number.isFinite(configuredPartitionAnswer)
                && Math.abs(configuredPartitionAnswer - computedPartitionAnswer) > 1e-9;
            const partitionAnswer = Number.isFinite(configuredPartitionAnswer) && allowPartitionAnswerOverride
                ? configuredPartitionAnswer
                : computedPartitionAnswer;
            const partitionAnswerMode = s2Partition.answerMode === 'exact' || s2Partition.answerMode === 'approx'
                ? s2Partition.answerMode
                : (Number.isInteger(partitionAnswer) ? 'exact' : 'approx');
            const partitionDecimals = Number.isInteger(s2Partition.decimals)
                ? Math.max(0, s2Partition.decimals)
                : (Number.isInteger(partitionAnswer) ? 0 : 2);
            const partitionTolerance = partitionAnswerMode === 'exact'
                ? 0
                : Math.max(0.01, Math.abs(partitionAnswer) * 0.01);
            const fullPortions = Math.max(0, Math.floor(computedPartitionAnswer));
            const leftoverQuantity = Math.max(0, partitionStock - (fullPortions * partitionPortion));
            const maxVisualPortions = 48;
            const visiblePortions = Math.min(fullPortions, maxVisualPortions);
            const hiddenPortions = Math.max(0, fullPortions - visiblePortions);
            const partitionFallbackNotice = (stockFallbackUsed || portionFallbackUsed)
                ? 'Scenario inputs were invalid, so safe defaults were applied for this attempt.'
                : '';
            const partitionOverrideNotice = partitionOverrideMismatch
                ? (allowPartitionAnswerOverride
                    ? `Instructor override active: accepted answer is set to ${formatNumericValue(partitionAnswer, partitionDecimals)}.`
                    : 'Instructor answer override was ignored because it did not match the stock/portion model.')
                : '';
            const lessonProgressMarkup = STAGE2_LESSON_ORDER.map((lessonId) => {
                const completed = !!state.lessonStatus[lessonId];
                const active = !completed && state.activeLesson === lessonId;
                const locked = !completed && !lessonUnlocked(lessonId);
                const className = completed ? 'good' : active ? '' : locked ? 'locked' : '';
                const suffix = completed ? ' Complete' : active ? ' Current' : locked ? ' Locked' : ' Ready';
                return `<span class="s2-pill ${className}">${lessonId} ${STAGE2_LESSON_TITLES[lessonId]}:${suffix}</span>`;
            }).join('');

            const renderColumnSubtraction = () => {
                let hAnnot = '&nbsp;';
                let tAnnot = '&nbsp;';
                let oAnnot = '&nbsp;';
                
                let hDigit = '4';
                let tDigit = '0';
                let oDigit = '2';
                
                if (state.regroupHundreds) {
                    hDigit = '<span class="slashed">4</span>';
                    hAnnot = '3';
                    tDigit = '10';
                }
                
                if (state.regroupTens) {
                    tDigit = '<span class="slashed">10</span>';
                    tAnnot = '9';
                    oDigit = '12';
                }
                
                const subtractorRow = '187';
                let diffVal = state.borrowAnswer;
                
                const hCol = host.querySelector('#s2-col-h');
                const tCol = host.querySelector('#s2-col-t');
                const oCol = host.querySelector('#s2-col-o');
                
                if (hCol && tCol && oCol) {
                    hCol.innerHTML = `<span class="annot">${hAnnot}</span><span class="digit">${hDigit}</span><span class="subt">- 1</span><span class="diff">${diffVal ? diffVal[0] : '&nbsp;'}</span>`;
                    tCol.innerHTML = `<span class="annot">${tAnnot}</span><span class="digit">${tDigit}</span><span class="subt">8</span><span class="diff">${diffVal ? diffVal[1] : '&nbsp;'}</span>`;
                    oCol.innerHTML = `<span class="annot">${oAnnot}</span><span class="digit">${oDigit}</span><span class="subt">7</span><span class="diff">${diffVal ? diffVal[2] : '&nbsp;'}</span>`;
                }
            };

            host.innerHTML = `
                <style>
                    .s2-wrap { display: grid; gap: 1.2rem; }
                    .s2-card { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); color: #f8fafc; }
                    .s2-card h2, .s2-card h3 { margin: 0 0 0.55rem; color: #f8fafc; }
                    .s2-card p { color: #cbd5e1; line-height: 1.62; margin: 0.4rem 0; }
                    .s2-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
                    .s2-pane { border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; background: rgba(15, 23, 42, 0.5); padding: 0.8rem; color: #f8fafc; }
                    .s2-feedback { margin-top: 0.65rem; border: 1px solid rgba(96, 165, 250, 0.25); border-radius: 10px; padding: 0.6rem; background: rgba(30, 58, 138, 0.35); color: #93c5fd; line-height: 1.5; font-size: 0.88rem; }
                    .s2-status { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.5rem; }
                    .s2-pill { border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.4); padding: 0.18rem 0.65rem; color: #94a3b8; font-size: 0.82rem; font-weight: 700; }
                    .s2-pill.good { background: rgba(22, 163, 74, 0.2); border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
                    .s2-pill.locked { background: rgba(30, 41, 59, 0.3); border-color: rgba(255, 255, 255, 0.05); color: #64748b; }
                    .s2-btn { border: 1px solid #d97706; border-radius: 10px; background: #f59e0b; color: #0f172a; padding: 0.52rem 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
                    .s2-btn:hover { background: #fbbf24; }
                    .s2-btn.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s2-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s2-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s2-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s2-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s2-level.s2-locked { opacity: 0.52; position: relative; }
                    .s2-level.s2-locked::after { content: 'Locked by lesson sequence'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s2-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Subtraction Column styling */
                    .s2-columns-box { display: flex; justify-content: center; gap: 2rem; margin-top: 0.6rem; }
                    .s2-sub-column { display: flex; flex-direction: column; align-items: center; width: 45px; font-family: monospace; font-size: 1.4rem; }
                    .s2-sub-column span { display: block; width: 100%; text-align: center; }
                    .s2-sub-column .annot { color: #f59e0b; font-size: 0.9rem; min-height: 1.1rem; }
                    .s2-sub-column .digit { border-bottom: 1px dashed rgba(255,255,255,0.1); }
                    .s2-sub-column .subt { border-bottom: 2px solid #f8fafc; margin-bottom: 4px; }
                    .s2-sub-column .diff { color: #4ade80; font-weight: bold; }
                    .slashed { text-decoration: line-through; color: #ef4444; opacity: 0.75; }
                    
                    /* Grid Dot styling */
                    .s2-dots-container { display: flex; flex-direction: column; gap: 4px; align-items: center; margin-top: 0.6rem; }
                    .s2-dots-row { display: flex; gap: 4px; }
                    .s2-grid-dot { width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; transition: background 0.3s ease; }
                    .s2-grid-dot.highlight { background: #10b981; box-shadow: 0 0 4px #10b981; }
                    
                    /* Long Division Bracket formatting */
                    .s2-step-box { display: grid; grid-template-columns: 2fr 1fr; gap: 6px; align-items: center; border: 1px solid rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; background: rgba(15, 23, 42, 0.3); }
                    .s2-step-box.s2-col-error { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
                    .s2-label { font-size: 0.8rem; color: #94a3b8; }
                    
                    /* Collapsible Tutorial Styles */
                    .s2-tutorial-box { background: rgba(15, 23, 42, 0.55); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 0.75rem; margin: 0.6rem 0 0.8rem; font-size: 0.85rem; line-height: 1.5; }
                    .s2-tutorial-box summary { font-weight: 700; color: #fbbf24; cursor: pointer; user-select: none; outline: none; margin-bottom: 0.2rem; }
                    .s2-tutorial-box summary:hover { color: #f59e0b; }
                    .s2-tutorial-box p { margin: 0.4rem 0 0.2rem; color: #cbd5e1; }
                    .s2-tutorial-box ol, .s2-tutorial-box ul { margin: 0.3rem 0; padding-left: 1.2rem; color: #cbd5e1; }
                    .s2-tutorial-box li { margin-bottom: 0.25rem; }
                    .s2-chip { display: inline-block; padding: 2px 6px; margin: 2px; background: rgba(255,255,255,0.08); border-radius: 4px; font-size: 0.75rem; }
                    
                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s2-wrap">
                    <article class="s2-card s2-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Perfect score unlocks Fast-Track and lets you bypass standard path.</p>
                        <div class="s2-grid">
                            <div class="s2-pane">
                                <strong>1. Regrouping order</strong>
                                <p>To solve 402 - 187, what is the first regrouping step?</p>
                                <div class="s2-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q1 === 'hundreds' ? 'active' : ''}" data-diag="q1" data-value="hundreds">Regroup 1 hundred into 10 tens</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q1 === 'tens' ? 'active' : ''}" data-diag="q1" data-value="tens">Regroup 1 ten into 10 ones</button>
                                </div>
                            </div>
                            <div class="s2-pane">
                                <strong>2. Multiplication array</strong>
                                <p>If an array has 6 rows and 8 columns, what is the total product?</p>
                                <div class="s2-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q2 === '48' ? 'active' : ''}" data-diag="q2" data-value="48">48</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q2 === '14' ? 'active' : ''}" data-diag="q2" data-value="14">14</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q2 === '42' ? 'active' : ''}" data-diag="q2" data-value="42">42</button>
                                </div>
                            </div>
                            <div class="s2-pane">
                                <strong>3. Long Division Loops</strong>
                                <p>In long division, when is a digit "brought down"?</p>
                                <div class="s2-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q3 === 'after_sub' ? 'active' : ''}" data-diag="q3" data-value="after_sub">Immediately after subtraction</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q3 === 'before_sub' ? 'active' : ''}" data-diag="q3" data-value="before_sub">Before subtracting the product</button>
                                </div>
                            </div>
                        </div>
                        <div class="s2-grid" style="margin-top:0.75rem;">
                            <button id="s2-check-diagnostic" class="s2-btn" data-tutor-question-id="s2-diagnostic" data-tutor-level="diagnostic" data-tutor-answer-keys="diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3" data-tutor-question="Help me review my Stage 2 diagnostic answers about regrouping, multiplication facts, and division loop bring-down steps.">Check Diagnostic</button>
                        </div>
                        <div id="s2-diagnostic-feedback" class="s2-feedback">${state.diagnosticFeedback}</div>
                    </article>

                    <article class="s2-card">
                        <h2>Stage 2 Lesson Sequence</h2>
                        <p>Progression is strictly ordered from L2.1 through L2.10. Complete each lesson to unlock the next one.</p>
                        <div class="s2-status">${lessonProgressMarkup}</div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.1')}">
                        <h2>L2.1 Multi-Digit Subtraction</h2>
                        <p>Solve without skipping place-value checks: <strong>742 - 319</strong>.</p>
                        <div class="s2-grid" style="grid-template-columns: 1fr auto; gap: 4px;">
                            <input id="s2-l21-answer" class="s2-input" placeholder="Enter difference" value="${state.multiSubtractAnswer}" data-tutor-question-id="s2-l21" data-tutor-level="concrete" data-tutor-answer-keys="multiSubtractAnswer" data-tutor-question="Check my place-value subtraction steps for 742 minus 319." ${disabled('L2.1')} />
                            <button id="s2-l21-check" class="s2-btn" data-tutor-question-id="s2-l21" data-tutor-level="concrete" data-tutor-answer-keys="multiSubtractAnswer" data-tutor-question="Check my place-value subtraction steps for 742 minus 319." ${disabled('L2.1')}>Check L2.1</button>
                        </div>
                        <div class="s2-feedback" id="s2-l21-feedback">${state.multiSubtractFeedback}</div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.2')}">
                        <h2>L2.2 Subtraction Borrowing</h2>
                        <p>Practice single-chain regrouping: <strong>563 - 278</strong>. Borrow where needed, then submit the final difference.</p>
                        <div class="s2-grid" style="grid-template-columns: 1fr auto; gap: 4px;">
                            <input id="s2-l22-answer" class="s2-input" placeholder="Enter difference" value="${state.borrowBasicAnswer}" data-tutor-question-id="s2-l22" data-tutor-level="concrete" data-tutor-answer-keys="borrowBasicAnswer" data-tutor-question="Help me apply borrowing correctly for 563 minus 278." ${disabled('L2.2')} />
                            <button id="s2-l22-check" class="s2-btn" data-tutor-question-id="s2-l22" data-tutor-level="concrete" data-tutor-answer-keys="borrowBasicAnswer" data-tutor-question="Help me apply borrowing correctly for 563 minus 278." ${disabled('L2.2')}>Check L2.2</button>
                        </div>
                        <div class="s2-feedback" id="s2-l22-feedback">${state.borrowBasicFeedback}</div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.3')}">
                        <h2>Concrete Level: Regrouping Across Zero</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Borrowing Across Zero</summary>
                            <p>When subtracting vertically, if a column cannot be subtracted (e.g. 2 - 7 in the ones place), we must borrow from the next column to the left. However, if that column is a <strong>zero</strong> (no tens), we must borrow from the hundreds column first:</p>
                            <ol>
                                <li><strong>Regroup Hundreds:</strong> Take 1 hundred from the hundreds column (leaving 3) and add 10 tens to the tens column (changing 0 to 10).</li>
                                <li><strong>Regroup Tens:</strong> Now borrow 1 ten from the tens column (leaving 9) and add 10 ones to the ones column (changing 2 to 12).</li>
                                <li><strong>Subtract:</strong> Now every column has a top number larger than or equal to the bottom number, so you can subtract column-by-column: <code>12 - 7 = 5</code>, <code>9 - 8 = 1</code>, and <code>3 - 1 = 2</code>.</li>
                            </ol>
                        </details>

                        <p><strong>L2.3 Borrowing:</strong> Solve 402 - 187 by borrowing step-by-step. First, regroup hundreds because tens is zero. Then regroup tens. Finally, enter the result.</p>
                        
                        <div class="s2-columns-box">
                            <div class="s2-sub-column" id="s2-col-h"></div>
                            <div class="s2-sub-column" id="s2-col-t"></div>
                            <div class="s2-sub-column" id="s2-col-o"></div>
                        </div>

                        <div class="s2-grid" style="margin-top:1.2rem; grid-template-columns: 1fr 1fr; gap:6px;">
                            <button id="s2-regroup-hundreds" class="s2-btn ghost ${state.regroupHundreds ? 'active' : ''}" data-tutor-question-id="s2-regroup-hundreds" data-tutor-level="concrete" data-tutor-answer-keys="hundreds,tens,ones,regroupHundreds" data-tutor-question="Why is regrouping 1 hundred into 10 tens the correct first move for 402 - 187?" ${state.regroupHundreds ? 'disabled' : ''} ${disabled('L2.3')}>Regroup Hundreds</button>
                            <button id="s2-regroup-tens" class="s2-btn ghost ${state.regroupTens ? 'active' : ''}" data-tutor-question-id="s2-regroup-tens" data-tutor-level="concrete" data-tutor-answer-keys="hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="After regrouping hundreds, why do we regroup 1 ten into 10 ones before subtracting 7 from 2?" ${state.regroupTens ? 'disabled' : ''} ${!state.regroupHundreds ? 'disabled' : ''} ${disabled('L2.3')}>Regroup Tens</button>
                        </div>
                        
                        <div style="margin-top:0.6rem; background:rgba(15,23,42,0.4); padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); min-height:48px;" id="s2-borrow-chips-container">
                            <div id="s2-hundreds-row" class="s2-chip-row"><strong>Hundreds:</strong> </div>
                            <div id="s2-tens-row" class="s2-chip-row"><strong>Tens:</strong> </div>
                            <div id="s2-ones-row" class="s2-chip-row"><strong>Ones:</strong> </div>
                        </div>

                        <div class="s2-grid" style="margin-top: 0.6rem; grid-template-columns: 1fr auto; gap: 4px;">
                            <input id="s2-borrow-answer" class="s2-input" placeholder="Difference?" value="${state.borrowAnswer}" data-tutor-question-id="s2-borrow-difference" data-tutor-level="concrete" data-tutor-answer-keys="borrowAnswer,hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="Help me finish 402 - 187 after regrouping across the internal zero and verify each column subtraction." ${disabled('L2.3')} />
                            <button id="s2-check-borrow" class="s2-btn" data-tutor-question-id="s2-borrow-difference" data-tutor-level="concrete" data-tutor-answer-keys="borrowAnswer,hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="Help me finish 402 - 187 after regrouping across the internal zero and verify each column subtraction." ${disabled('L2.3')}>Check Difference</button>
                        </div>
                        <div class="s2-feedback">${state.borrowFeedback}</div>
                        
                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Walk me through borrowing across zero for 402 - 187 using physical block steps." ${disabled('L2.3')}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.4')}">
                        <h2>Pictorial Level: Multiplication Arrays &amp; Scaling</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Multiplication as a Grid</summary>
                            <p>Multiplication represents groups of equal sizes. In a <strong>grid (array) representation</strong>:</p>
                            <ul>
                                <li>The grid has a certain number of <strong>rows</strong> (horizontal lines) and <strong>columns</strong> (vertical lines).</li>
                                <li>The total number of items is the rows multiplied by the columns. E.g., 6 rows and 8 columns represents 6 groups of 8.</li>
                                <li>Instead of counting all 48 dots individually, we count rows and columns, then compute: <code>6 × 8 = 48</code>.</li>
                            </ul>
                        </details>

                        <p><strong>L2.4 Arrays:</strong> Count the rows and columns below to find the total items. 
                        <br>This array has 6 rows and 8 columns. Enter the total dot count below.</p>
                        
                        <div class="s2-pane" style="overflow-x:auto;">
                            <div class="s2-dots-container">
                                ${Array.from({ length: 6 }, (_, r) => `
                                    <div class="s2-dots-row">
                                        ${Array.from({ length: 8 }, (_, c) => `
                                            <div class="s2-grid-dot ${state.gridAnswer === '48' ? 'highlight' : ''}"></div>
                                        `).join('')}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="s2-grid" style="margin-top:0.8rem; grid-template-columns: 1fr auto; gap: 4px;">
                            <input id="s2-grid-answer" class="s2-input" style="text-align:center; max-width:200px;" placeholder="Total dots?" value="${state.gridAnswer || ''}" data-tutor-question-id="s2-grid-product" data-tutor-level="pictorial" data-tutor-answer-keys="gridAnswer" data-tutor-question="Help me compute the total in this multiplication array with 6 rows and 8 columns." ${disabled('L2.4')} />
                            <button id="s2-check-grid" class="s2-btn" data-tutor-question-id="s2-grid-product" data-tutor-level="pictorial" data-tutor-answer-keys="gridAnswer" data-tutor-question="Help me compute the total in this multiplication array with 6 rows and 8 columns." ${disabled('L2.4')}>Validate Count</button>
                        </div>
                        <div class="s2-feedback" id="s2-grid-feedback">${state.gridFeedback || 'Count rows and columns to find the product.'}</div>

                        <p style="margin-top:0.8rem;"><strong>L2.5 Grid Mechanics:</strong> A reagent plate has 7 rows and 9 columns. Enter the total wells.</p>
                        <div class="s2-grid" style="grid-template-columns: 1fr auto; gap: 4px;">
                            <input id="s2-grid-mechanics-answer" class="s2-input" placeholder="Total wells" value="${state.gridMechanicsAnswer || ''}" data-tutor-question-id="s2-grid-mechanics" data-tutor-level="pictorial" data-tutor-answer-keys="gridMechanicsAnswer" data-tutor-question="Help me calculate grid mechanics for a 7 by 9 plate." ${disabled('L2.5')} />
                            <button id="s2-check-grid-mechanics" class="s2-btn" data-tutor-question-id="s2-grid-mechanics" data-tutor-level="pictorial" data-tutor-answer-keys="gridMechanicsAnswer" data-tutor-question="Help me calculate grid mechanics for a 7 by 9 plate." ${disabled('L2.5')}>Check L2.5</button>
                        </div>
                        <div class="s2-feedback" id="s2-grid-mechanics-feedback">${state.gridMechanicsFeedback}</div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Why is multiplication equivalent to adding rows or columns of a grid? Explain using 6 x 8." ${disabled('L2.4')}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.6')}">
                        <h2>L2.6 Division Concept</h2>
                        <p>Choose the statement that correctly models equal-size grouping for <strong>24 mL split into 6 mL doses</strong>.</p>
                        <div class="s2-grid" style="grid-template-columns: 1fr; gap: 4px;">
                            <button id="s2-l26-right" class="s2-btn ghost ${state.divisionConceptChoice === 'right' ? 'active' : ''}" data-tutor-question-id="s2-l26" data-tutor-level="abstract" data-tutor-answer-keys="divisionConceptChoice" data-tutor-question="Help me understand why 24 divided by 6 gives the number of equal groups." ${disabled('L2.6')}>24 / 6 asks how many 6 mL groups fit into 24 mL.</button>
                            <button id="s2-l26-wrong" class="s2-btn ghost ${state.divisionConceptChoice === 'wrong' ? 'active' : ''}" data-tutor-question-id="s2-l26" data-tutor-level="abstract" data-tutor-answer-keys="divisionConceptChoice" data-tutor-question="Help me understand why adding 24 and 6 is not the right model for equal grouping." ${disabled('L2.6')}>24 + 6 gives the number of groups.</button>
                        </div>
                        <div class="s2-feedback" id="s2-l26-feedback">${state.divisionConceptFeedback}</div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.7')}" style="order:7;">
                        <h2>Abstract Level: Long Division Loops</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Long Division Loops</summary>
                            <p>Long division is a repeating cycle (loop) of four steps: <strong>Divide, Multiply, Subtract, and Bring Down</strong>.</p>
                            <p>Let's divide 156 by 12:</p>
                            <ul>
                                <li><strong>Loop 1 (On the first two digits, 15):</strong>
                                    <ol>
                                        <li><strong>Divide:</strong> How many times does 12 go into 15? Exactly <code>1</code> time (quotient).</li>
                                        <li><strong>Multiply:</strong> Multiply the quotient by the divisor: <code>1 × 12 = 12</code>.</li>
                                        <li><strong>Subtract:</strong> Subtract this product from 15: <code>15 - 12 = 3</code> (remainder).</li>
                                        <li><strong>Bring Down:</strong> Lower the next digit (6) to form <code>36</code>.</li>
                                    </ol>
                                </li>
                                <li><strong>Loop 2 (On the new remainder, 36):</strong>
                                    <ol>
                                        <li><strong>Divide:</strong> How many times does 12 go into 36? Exactly <code>3</code> times.</li>
                                        <li><strong>Multiply:</strong> <code>3 × 12 = 36</code>.</li>
                                        <li><strong>Subtract:</strong> <code>36 - 36 = 0</code>. Remainder is 0. Quotient is 13.</li>
                                    </ol>
                                </li>
                            </ul>
                        </details>

                        <p><strong>L2.7 Division Loops:</strong> Solve ${s2Div.dividend} ÷ ${s2Div.divisor} one loop at a time. Enter each value column-by-column to advance.
                        <br><em>Loop 1:</em> Divide (${divSteps.part1} ÷ ${s2Div.divisor} = ${divSteps.step1Divide}), Multiply (${divSteps.step1Divide} × ${s2Div.divisor} = ${divSteps.step1Multiply}), Subtract (${divSteps.part1} - ${divSteps.step1Multiply} = ${divSteps.step1Subtract}), and Bring Down (${String(s2Div.dividend).substring(2, 3)}) to form ${divSteps.step1BringDown}.
                        <br><em>Loop 2:</em> Divide (${divSteps.step1BringDown} ÷ ${s2Div.divisor} = ${divSteps.step2Divide}), Multiply (${divSteps.step2Divide} × ${s2Div.divisor} = ${divSteps.step2Multiply}), and Subtract (${divSteps.step1BringDown} - ${divSteps.step2Multiply} = ${divSteps.step2Subtract}).</p>
                        
                        <div class="s2-grid">
                            <div class="s2-pane">
                                <h3>Loop 1 on ${divSteps.part1}</h3>
                                <div class="s2-step-box ${state.errorColumn === 'step1' ? 's2-col-error' : ''}">
                                    <label class="s2-label">Divide: how many ${s2Div.divisor}s in ${divSteps.part1}?</label>
                                    <input id="s2-step1-divide" class="s2-input" value="${state.step1Divide}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 1 of division: divide, multiply, subtract, and bring down correctly." ${disabled('L2.7')} />
                                    <label class="s2-label">Multiply: ${s2Div.divisor} × quotient</label>
                                    <input id="s2-step1-multiply" class="s2-input" value="${state.step1Multiply}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 1 of division: divide, multiply, subtract, and bring down correctly." ${disabled('L2.7')} />
                                    <label class="s2-label">Subtract: ${divSteps.part1} − product</label>
                                    <input id="s2-step1-subtract" class="s2-input" value="${state.step1Subtract}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 1 of division: divide, multiply, subtract, and bring down correctly." ${disabled('L2.7')} />
                                    <label class="s2-label">Bring down next digit (forms ${divSteps.step1BringDown})</label>
                                    <input id="s2-step1-bring" class="s2-input" value="${state.step1BringDown}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 1 of division: divide, multiply, subtract, and bring down correctly." ${disabled('L2.7')} />
                                </div>
                            </div>
                            <div class="s2-pane">
                                <h3>Loop 2 on ${divSteps.step1BringDown}</h3>
                                <div class="s2-step-box ${state.errorColumn === 'step2' ? 's2-col-error' : ''}">
                                    <label class="s2-label">Divide: how many ${s2Div.divisor}s in ${divSteps.step1BringDown}?</label>
                                    <input id="s2-step2-divide" class="s2-input" value="${state.step2Divide}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of division." ${disabled('L2.7')} />
                                    <label class="s2-label">Multiply: ${s2Div.divisor} × quotient</label>
                                    <input id="s2-step2-multiply" class="s2-input" value="${state.step2Multiply}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of division." ${disabled('L2.7')} />
                                    <label class="s2-label">Subtract: ${divSteps.step1BringDown} − product</label>
                                    <input id="s2-step2-subtract" class="s2-input" value="${state.step2Subtract}" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of division." ${disabled('L2.7')} />
                                </div>
                            </div>
                        </div>
                        <div class="s2-grid" style="margin-top:0.8rem; grid-template-columns: repeat(3, 1fr); gap: 4px;">
                            <button id="s2-validate-div" class="s2-btn" data-tutor-question-id="s2-division" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Review my complete long-division loop inputs." ${disabled('L2.7')}>Validate Division</button>
                            <button id="s2-reset-div" class="s2-btn ghost" ${disabled('L2.7')}>Reset Loops</button>
                            <button id="s2-hint-div" class="s2-btn ghost" ${disabled('L2.7')}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s2-feedback">${state.divisionFeedback}</div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.8')}" style="order:8;">
                        <h2>Applied Level: Multi-grid Well Volumes</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Compound Multiplication &amp; Grid Capacity</summary>
                            <p>In lab settings, quantities scale through multiple dimensions. To calculate the total volume capacity of a well-plate grid:</p>
                            <ol>
                                <li>Identify grid dimensions: rows × columns (e.g., 3 rows and 4 columns = 12 wells).</li>
                                <li>Identify volume capacity per single well (e.g. 5 mL).</li>
                                <li>Multiply total wells by the volume per well to find compound capacity: <code>12 wells × 5 mL/well = 60 mL</code>.</li>
                            </ol>
                        </details>

                        <p><strong>[Required Unlock] L2.8 Applied Capacity:</strong> Solve the well-volume capacity question to complete the Applied gate.</p>
                        <div class="s2-grid">
                            <button id="s2-app-wrong" class="s2-btn ghost" data-tutor-question-id="s2-applied-well-capacity" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me reason through this lab well-capacity problem and why dimensions are multiplied instead of added." ${disabled('L2.8')}>12 mL because we add 3 + 4 + 5</button>
                            <button id="s2-app-right" class="s2-btn" data-tutor-question-id="s2-applied-well-capacity" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me reason through this lab well-capacity problem and why dimensions are multiplied instead of added." ${disabled('L2.8')}>60 mL because 3 rows × 4 columns = 12 wells, and 12 × 5 mL = 60 mL</button>
                        </div>
                        <div class="s2-feedback">${state.appliedFeedback}</div>

                        <div class="s2-pane" style="margin-top:0.75rem;">
                            <p><strong>L2.8 Quick Check:</strong> Enter the benchmark estimate for <code>29.4 x 3.1</code> using rounded numbers.</p>
                            <div class="s2-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s2-estimate-input" class="s2-input" placeholder="Estimated value" value="${state.estimateInput}" data-tutor-question-id="s2-estimation" data-tutor-level="applied" data-tutor-answer-keys="estimateInput" data-tutor-question="Help me estimate 29.4 times 3.1 using rounding and sanity-check benchmarks." ${disabled('L2.8')} />
                                <button id="s2-check-estimate" class="s2-btn" data-tutor-question-id="s2-estimation" data-tutor-level="applied" data-tutor-answer-keys="estimateInput" data-tutor-question="Help me estimate 29.4 times 3.1 using rounding and sanity-check benchmarks." ${disabled('L2.8')}>Check Estimate</button>
                            </div>
                            <div class="s2-feedback" id="s2-estimate-feedback">${state.estimateFeedback}</div>
                        </div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Show me how compound multiplication applies to dimensional grids (rows x columns x volume per unit)." ${disabled('L2.8')}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.9')}" style="order:9;">
                        <h2>L2.9 Division as Measurement Partitioning</h2>

                        <p><strong>L2.9 Dividing by Sub-Unity Decimals:</strong> In chemistry, dividing by numbers less than 1 can represent partitioning a total into many smaller doses.
                        <br><em>Sequence note:</em> This check unlocks only after L2.8 is completed.
                        <br><em>Question:</em> A chemist partitions <strong>${partitionStock.toFixed(2)} units</strong> into portions of <strong>${partitionPortion.toFixed(2)} units</strong>. How many portions fit? <strong>${partitionStock.toFixed(2)} ÷ ${partitionPortion.toFixed(2)}</strong>.
                        <br><em>Answer format:</em> Enter ${partitionAnswerMode === 'exact' ? 'the exact numeric count (no words)' : `a numeric estimate within +/- ${formatNumericValue(partitionTolerance, 2)}`}.</p>
                        ${partitionFallbackNotice ? `<div class="s2-feedback" role="status" aria-live="polite">${partitionFallbackNotice}</div>` : ''}
                        ${partitionOverrideNotice ? `<div class="s2-feedback" role="status" aria-live="polite">${partitionOverrideNotice}</div>` : ''}

                        <div class="s2-pane" style="margin-bottom:0.6rem;">
                            <p style="margin-top:0;"><strong>Partitioning model:</strong> each mini-vial is one ${partitionPortion.toFixed(2)}-unit portion.</p>
                            <div style="display:grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap:4px;">
                                ${Array.from({ length: visiblePortions }, (_, i) => `<div style="background:rgba(14,165,233,0.2); border:1px solid rgba(56,189,248,0.45); border-radius:6px; text-align:center; font-size:0.72rem; padding:3px 0;">${i + 1}</div>`).join('')}
                            </div>
                            <div style="margin-top:6px; font-size:0.8rem; color:#93c5fd;">If each portion is ${partitionPortion.toFixed(2)}, then count = total / portion size. Full portions shown: ${visiblePortions}${hiddenPortions ? ` (+${hiddenPortions} more; visual capped at ${maxVisualPortions})` : ''}.${leftoverQuantity > 0 ? ` Leftover quantity: ${formatNumericValue(leftoverQuantity, 3)}.` : ''}</div>
                        </div>

                        <div class="s2-grid" style="grid-template-columns: 1fr auto; gap: 4px; margin-bottom: 0.6rem;">
                            <label for="s2-subunity-input" class="s2-label" style="grid-column:1 / -1;">Partition count response</label>
                            <input id="s2-subunity-input" class="s2-input" placeholder="e.g. 24" value="${state.subunityAnswer}" data-tutor-question-id="s2-partition" data-tutor-level="abstract" data-tutor-answer-keys="subunityAnswer" data-tutor-question="Help me divide stock concentration/volume by portion size." ${disabled('L2.9')} />
                            <button id="s2-check-subunity" class="s2-btn" data-tutor-question-id="s2-partition" data-tutor-level="abstract" data-tutor-answer-keys="subunityAnswer" data-tutor-question="Help me divide stock concentration/volume by portion size." ${disabled('L2.9')}>Check Partition Count</button>
                        </div>
                        <div class="s2-feedback ${state.subunityFeedbackTone === 'success' ? 'good' : state.subunityFeedbackTone === 'error' ? 'locked' : ''}" id="s2-subunity-feedback" role="status" aria-live="polite">${state.subunityFeedback}</div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Explain why dividing by a decimal less than 1 increases the count in measurement partitioning." ${disabled('L2.9')}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <article class="s2-card s2-level ${levelLocked('L2.10')}" style="order:10;">
                        <h2>L2.10 Stoichiometric Mental Benchmarks</h2>

                        <div class="s2-pane" style="margin-top:0.75rem;">
                            <p><strong>L2.10 Stoichiometric Benchmarks:</strong> ${s2Estimate.questionText}</p>
                            ${s2EstimateGenerated
                                ? `
                                    <div class="s2-grid" style="grid-template-columns: 1fr auto; gap: 4px;">
                                        <input id="s2-stoich-response" class="s2-input" placeholder="Enter your estimate (e.g. about 4 moles)" value="${state.stoichResponse || ''}" data-tutor-question-id="s2-estimate" data-tutor-level="applied" data-tutor-answer-keys="stoichResponse,stoichGrading,stoichError" data-tutor-question="Grade my free-response stoichiometric estimate using Gemma and explain the reasoning." ${disabled('L2.10')} ${state.stoichLoading ? 'disabled' : ''} />
                                        <button id="s2-submit-stoich" class="s2-btn" data-tutor-question-id="s2-estimate" data-tutor-level="applied" data-tutor-answer-keys="stoichResponse,stoichGrading,stoichError" data-tutor-question="Grade my free-response stoichiometric estimate using Gemma and explain the reasoning." ${disabled('L2.10')} ${state.stoichLoading ? 'disabled' : ''}>${state.stoichLoading ? 'Grading...' : 'Grade with Gemma4'}</button>
                                    </div>
                                `
                                : `
                                    <div class="s2-grid" style="grid-template-columns: 1fr 1fr; gap: 4px;">
                                        <button id="s2-estimate-opt1" class="s2-btn ghost ${state.stoichChoice === s2Estimate.options[0].id ? 'active' : ''}" data-tutor-question-id="s2-estimate" data-tutor-level="applied" data-tutor-answer-keys="stoichChoice" data-tutor-question="Explain why option 1 is correct or incorrect for estimating this ratio." ${disabled('L2.10')}>${s2Estimate.options[0].text}</button>
                                        <button id="s2-estimate-opt2" class="s2-btn ghost ${state.stoichChoice === s2Estimate.options[1].id ? 'active' : ''}" data-tutor-question-id="s2-estimate" data-tutor-level="applied" data-tutor-answer-keys="stoichChoice" data-tutor-question="Explain why option 2 is correct or incorrect for estimating this ratio." ${disabled('L2.10')}>${s2Estimate.options[1].text}</button>
                                    </div>
                                `}
                            <div class="s2-feedback" id="s2-stoich-feedback">${state.stoichError || state.stoichFeedback}${state.stoichGrading?.regraded ? `<br><strong>Regrade:</strong> ${state.stoichGrading.regradeReason}` : ''}</div>
                        </div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Explain the connection between stoichiometric ratios and friendly mental benchmark division." ${disabled('L2.10')}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            renderColumnSubtraction();

            const persist = (msg) => onStateChange({ ...state }, msg);

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    const questionId = btn.getAttribute('data-tutor-question-id') || 's2-general';
                    const level = btn.getAttribute('data-tutor-level') || 'reinforcement';
                    const answerKeys = btn.getAttribute('data-tutor-answer-keys') || '';
                    
                    window.openQuestionTutorPopup?.({
                        phaseId: 'stage2',
                        questionId,
                        prompt,
                        defaultMode: 'chat',
                        anchorEl: btn
                    });
                });
            });

            // Diagnostic
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic chosen');
                    this.mount({ host, state, onStateChange, questionOverrides });
                });
            });

            host.querySelector('#s2-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'hundreds' &&
                                state.diagnosticAnswers.q2 === '48' &&
                                state.diagnosticAnswers.q3 === 'after_sub';
                state.diagnosticDone = true;
                if (correct) {
                    STAGE2_LESSON_ORDER.forEach((lessonId) => {
                        state.lessonStatus[lessonId] = true;
                    });
                    state.fastTrack = true;
                    state.activeLesson = null;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! Stage 2 lesson sequence marked complete.';
                } else {
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-l21-check')?.addEventListener('click', () => {
                const ans = host.querySelector('#s2-l21-answer')?.value.trim();
                state.multiSubtractAnswer = ans;
                if (ans === '423') {
                    markLessonComplete(state, 'L2.1');
                    state.multiSubtractFeedback = 'Correct! 742 - 319 = 423. L2.2 is now unlocked.';
                } else {
                    state.multiSubtractFeedback = 'Not yet. Recheck each place value column and regroup where needed.';
                }
                persist('L2.1 checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-l22-check')?.addEventListener('click', () => {
                const ans = host.querySelector('#s2-l22-answer')?.value.trim();
                state.borrowBasicAnswer = ans;
                if (ans === '285') {
                    markLessonComplete(state, 'L2.2');
                    state.borrowBasicFeedback = 'Correct! 563 - 278 = 285. L2.3 is now unlocked.';
                } else {
                    state.borrowBasicFeedback = 'Not yet. Borrow from tens/ones carefully, then recompute the difference.';
                }
                persist('L2.2 checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            // Borrowing
            host.querySelector('#s2-regroup-hundreds').addEventListener('click', () => {
                if (state.hundreds >= 1) {
                    state.hundreds -= 1;
                    state.tens += 10;
                    state.regroupHundreds = true;
                    state.borrowFeedback = 'Regrouped 1 Hundred into 10 Tens. Now regroup 1 Ten into 10 Ones to enable borrowing.';
                    persist('Regrouped hundreds');
                    this.mount({ host, state, onStateChange, questionOverrides });
                }
            });

            host.querySelector('#s2-regroup-tens').addEventListener('click', () => {
                if (state.tens >= 1) {
                    state.tens -= 1;
                    state.ones += 10;
                    state.regroupTens = true;
                    state.borrowFeedback = 'Regrouped 1 Ten into 10 Ones. Now subtract row digits column-by-column: ones, tens, and hundreds.';
                    persist('Regrouped tens');
                    this.mount({ host, state, onStateChange, questionOverrides });
                }
            });

            host.querySelector('#s2-check-borrow').addEventListener('click', () => {
                const ans = host.querySelector('#s2-borrow-answer').value.trim();
                state.borrowAnswer = ans;
                if (!state.regroupHundreds || !state.regroupTens) {
                    state.borrowFeedback = 'Borrowing order incomplete: regroup hundreds, then regroup tens before writing the final difference.';
                } else if (ans === '215') {
                    markLessonComplete(state, 'L2.3');
                    state.borrowFeedback = 'Correct! 402 - 187 = 215. Regrouping across zero is successful. Pictorial Level unlocked. Continue below.';
                } else {
                    state.borrowFeedback = `Incorrect difference: ${ans}. Recalculate each column carefully: 12-7 in ones, 9-8 in tens, 3-1 in hundreds.`;
                }
                persist('Difference checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            // Pictorial Grid
            host.querySelector('#s2-check-grid').addEventListener('click', () => {
                const ans = host.querySelector('#s2-grid-answer').value.trim();
                state.gridAnswer = ans;
                if (ans === '48') {
                    markLessonComplete(state, 'L2.4');
                    state.gridFeedback = 'Correct! 6 rows × 8 columns = 48 total dots. You successfully validated grid multiplication. Abstract unlocked. Continue below.';
                } else {
                    state.gridFeedback = 'Incorrect. Multiply 6 by 8 to find the total dots.';
                }
                persist('Grid checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-check-grid-mechanics')?.addEventListener('click', () => {
                const ans = host.querySelector('#s2-grid-mechanics-answer')?.value.trim();
                state.gridMechanicsAnswer = ans;
                if (ans === '63') {
                    markLessonComplete(state, 'L2.5');
                    state.gridMechanicsFeedback = 'Correct! 7 × 9 = 63 wells. L2.6 is now unlocked.';
                } else {
                    state.gridMechanicsFeedback = 'Not yet. Multiply rows by columns: 7 × 9.';
                }
                persist('L2.5 checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-l26-right')?.addEventListener('click', () => {
                state.divisionConceptChoice = 'right';
                markLessonComplete(state, 'L2.6');
                state.divisionConceptFeedback = 'Correct concept. Division here counts equal-size groups. L2.7 is now unlocked.';
                persist('L2.6 checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-l26-wrong')?.addEventListener('click', () => {
                state.divisionConceptChoice = 'wrong';
                state.divisionConceptFeedback = 'Not correct. Adding combines totals; division counts how many equal groups fit.';
                persist('L2.6 incorrect');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            // Abstract Division Loop
            host.querySelector('#s2-validate-div').addEventListener('click', () => {
                state.step1Divide = host.querySelector('#s2-step1-divide').value.trim();
                state.step1Multiply = host.querySelector('#s2-step1-multiply').value.trim();
                state.step1Subtract = host.querySelector('#s2-step1-subtract').value.trim();
                state.step1BringDown = host.querySelector('#s2-step1-bring').value.trim();
                state.step2Divide = host.querySelector('#s2-step2-divide').value.trim();
                state.step2Multiply = host.querySelector('#s2-step2-multiply').value.trim();
                state.step2Subtract = host.querySelector('#s2-step2-subtract').value.trim();

                state.errorColumn = '';

                if (state.step1Divide !== divSteps.step1Divide) {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = `Loop 1 divide: ${s2Div.divisor} goes into ${divSteps.part1} exactly ${divSteps.step1Divide} times.`;
                } else if (state.step1Multiply !== divSteps.step1Multiply) {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = `Loop 1 multiply: ${s2Div.divisor} × ${divSteps.step1Divide} is ${divSteps.step1Multiply}.`;
                } else if (state.step1Subtract !== divSteps.step1Subtract) {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = `Loop 1 subtract: ${divSteps.part1} − ${divSteps.step1Multiply} leaves ${divSteps.step1Subtract}.`;
                } else if (state.step1BringDown !== divSteps.step1BringDown) {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = `Loop 1 bring down: lower the ${String(s2Div.dividend).substring(2, 3)} to make ${divSteps.step1BringDown}.`;
                } else if (state.step2Divide !== divSteps.step2Divide) {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = `Loop 2 divide: ${s2Div.divisor} goes into ${divSteps.step1BringDown} exactly ${divSteps.step2Divide} times.`;
                } else if (state.step2Multiply !== divSteps.step2Multiply) {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = `Loop 2 multiply: ${s2Div.divisor} × ${divSteps.step2Divide} is ${divSteps.step2Multiply}.`;
                } else if (state.step2Subtract !== divSteps.step2Subtract) {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = `Loop 2 subtract: ${divSteps.step1BringDown} − ${divSteps.step2Multiply} leaves ${divSteps.step2Subtract}.`;
                } else {
                    state.divisionPassed = true;
                    markLessonComplete(state, 'L2.7');
                    if (state.subunityCorrect) {
                        state.divisionFeedback = 'Correct! Long division and sub-unity division are both complete. Applied Level unlocked. Continue below.';
                    } else {
                        state.divisionFeedback = `Correct long division! Now solve the L2.9 sub-unity division check (${partitionStock.toFixed(2)} ÷ ${partitionPortion.toFixed(2)}) below to unlock Applied.`;
                    }
                }
                persist('Division loops validated');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-reset-div').addEventListener('click', () => {
                state.step1Divide = '';
                state.step1Multiply = '';
                state.step1Subtract = '';
                state.step1BringDown = '';
                state.step2Divide = '';
                state.step2Multiply = '';
                state.step2Subtract = '';
                state.errorColumn = '';
                state.divisionFeedback = `Work the problem ${s2Div.dividend} ÷ ${s2Div.divisor} one loop at a time.`;
                state.divisionPassed = false;
                persist('Division reset');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            // Sub-unity
            host.querySelector('#s2-check-subunity')?.addEventListener('click', () => {
                const rawInput = host.querySelector('#s2-subunity-input').value.trim();
                const inputVal = parseStrictNumber(rawInput);
                state.subunityAnswer = rawInput;

                if (!Number.isFinite(inputVal)) {
                    state.subunityCorrect = false;
                    state.subunityFeedbackTone = 'error';
                    state.subunityFeedback = 'Enter a numeric answer. Use total / portion size, then check whether division by a value less than 1 increases the count.';
                    persist('Sub-unity invalid input');
                    this.mount({ host, state, onStateChange, questionOverrides });
                    return;
                }

                const isCorrect = partitionAnswerMode === 'exact'
                    ? Math.abs(inputVal - partitionAnswer) < 1e-9
                    : Math.abs(inputVal - partitionAnswer) <= partitionTolerance;

                if (isCorrect) {
                    state.subunityCorrect = true;
                    state.subunityFeedbackTone = 'success';
                    markLessonComplete(state, 'L2.9');
                    state.subunityFeedback = `Correct! ${partitionStock.toFixed(2)} ÷ ${partitionPortion.toFixed(2)} = ${formatNumericValue(partitionAnswer, partitionDecimals)}. Dividing by a number less than 1 scales the result up because each piece is smaller.`;
                    if (state.divisionPassed) {
                        state.subunityFeedback += ' Applied Level unlocked. Continue below.';
                    }
                } else {
                    state.subunityCorrect = false;
                    state.subunityFeedbackTone = 'error';
                    state.subunityFeedback = `Not yet. Recheck partitioning logic: count = total / portion size. Expected ${partitionAnswerMode === 'exact' ? `exactly ${formatNumericValue(partitionAnswer, partitionDecimals)}` : `about ${formatNumericValue(partitionAnswer, partitionDecimals)} (+/- ${formatNumericValue(partitionTolerance, 2)})`}.`;
                }
                persist('Sub-unity checked');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            host.querySelector('#s2-hint-grid')?.addEventListener('click', () => {
                const feedback = host.querySelector('#s2-grid-feedback');
                if (feedback) {
                    feedback.textContent = 'Hint: The total elements in a grid is Rows × Columns. Multiply 6 rows by 8 columns to get 48.';
                }
                persist('Grid hint shown');
            });

            host.querySelector('#s2-hint-div')?.addEventListener('click', () => {
                const s1d = host.querySelector('#s2-step1-divide').value.trim();
                const s1m = host.querySelector('#s2-step1-multiply').value.trim();
                const s1s = host.querySelector('#s2-step1-subtract').value.trim();
                const s1b = host.querySelector('#s2-step1-bring').value.trim();
                const s2d = host.querySelector('#s2-step2-divide').value.trim();
                const s2m = host.querySelector('#s2-step2-multiply').value.trim();
                const s2s = host.querySelector('#s2-step2-subtract').value.trim();

                if (s1d !== '1') {
                    state.divisionFeedback = 'Hint: Divide 15 by 12. 12 goes into 15 exactly 1 time. Enter 1 in Loop 1 Divide.';
                } else if (s1m !== '12') {
                    state.divisionFeedback = 'Hint: Multiply 1 × 12 = 12. Enter 12 in Loop 1 Multiply.';
                } else if (s1s !== '3') {
                    state.divisionFeedback = 'Hint: Subtract 15 - 12 = 3. Enter 3 in Loop 1 Subtract.';
                } else if (s1b !== '36') {
                    state.divisionFeedback = 'Hint: Bring down the 6 next to the 3 to make 36. Enter 36 in Loop 1 Bring Down.';
                } else if (s2d !== '3') {
                    state.divisionFeedback = 'Hint: Divide 36 by 12. 12 goes into 36 exactly 3 times. Enter 3 in Loop 2 Divide.';
                } else if (s2m !== '36') {
                    state.divisionFeedback = 'Hint: Multiply 3 × 12 = 36. Enter 36 in Loop 2 Multiply.';
                } else if (s2s !== '0') {
                    state.divisionFeedback = 'Hint: Subtract 36 - 36 = 0. Enter 0 in Loop 2 Subtract.';
                } else {
                    state.divisionFeedback = 'Hint: All inputs look correct! Click "Validate Division" to unlock the next level.';
                }
                persist('Division hint shown');
                this.mount({ host, state, onStateChange });
            });

            // Applied Dilution
            host.querySelector('#s2-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Incorrect. Do not add the dimension units together. You must multiply them.';
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s2-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! 3 rows × 4 columns × 5 mL equals 60 mL total capacity.';
                persist('Applied choice correct');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s2-check-estimate').addEventListener('click', () => {
                const raw = host.querySelector('#s2-estimate-input').value.trim();
                state.estimateInput = raw;
                const numeric = Number(raw);

                if (!Number.isFinite(numeric)) {
                    state.estimateFeedback = 'Enter a numeric estimate. For friendly rounding, try 30 x 3.';
                } else if (numeric >= 85 && numeric <= 95) {
                    markLessonComplete(state, 'L2.8');
                    state.estimateFeedback = 'Correct benchmark. 29.4 x 3.1 is close to 30 x 3 = 90, so answers far from ~90 likely contain a decimal-entry error.';
                } else {
                    state.estimateFeedback = 'Not a strong benchmark. Round 29.4 to 30 and 3.1 to 3 first, then estimate 30 x 3 = 90.';
                }

                persist('Estimation checked');
                this.mount({ host, state, onStateChange });
            });

            const applyStoichChoice = (selectedId) => {
                if (s2EstimateGenerated) return;
                state.stoichChoice = selectedId;

                if (selectedId === s2Estimate.answerKey) {
                    markLessonComplete(state, 'L2.10');
                    state.stoichFeedback = 'Correct benchmark. This ratio is close to 48/12, so the estimate is about 4 moles.';
                } else {
                    state.stoichFeedback = 'Not quite. Use friendly division first: 48.2/12.01 is close to 48/12, which is about 4.';
                }

                persist('Stoichiometric benchmark selected');
                this.mount({ host, state, onStateChange, questionOverrides });
            };

            host.querySelector('#s2-estimate-opt1')?.addEventListener('click', () => {
                applyStoichChoice(s2Estimate.options[0].id);
            });

            host.querySelector('#s2-estimate-opt2')?.addEventListener('click', () => {
                applyStoichChoice(s2Estimate.options[1].id);
            });

            host.querySelector('#s2-submit-stoich')?.addEventListener('click', async () => {
                if (state.stoichLoading) return;

                const responseEl = host.querySelector('#s2-stoich-response');
                const learnerResponse = responseEl?.value.trim() || '';
                state.stoichResponse = learnerResponse;

                if (!learnerResponse) {
                    state.stoichError = 'Enter your estimate before grading.';
                    persist('Stoichiometric response missing');
                    this.mount({ host, state, onStateChange, questionOverrides });
                    return;
                }

                state.stoichLoading = true;
                state.stoichError = '';
                persist('Grading stoichiometric response');
                this.mount({ host, state, onStateChange, questionOverrides });

                const grading = await refresherApi?.gradeAdaptiveResponse?.({
                    prompt: s2Estimate.questionText,
                    answerKey: s2Estimate.answerKey,
                    rubric: s2Estimate.rubric || { scoring: 'reasonableness-check', max_points: 1 },
                    learnerResponse,
                    regradeThreshold: refresherApi?.getAdaptiveSnapshot?.()?.grading?.lowConfidenceRegradeThreshold || 0.7
                });

                state.stoichLoading = false;
                state.stoichGrading = grading?.result || null;
                state.stoichFeedback = grading?.result?.feedback || 'Gemma grading completed, but no feedback was returned.';

                if (!grading?.ok) {
                    state.stoichError = `Gemma grading fallback: ${grading?.result?.rationale || 'Unable to grade response.'}`;
                }

                const parsedEstimate = Number.parseFloat(String(learnerResponse).replace(/[^0-9.+-]/g, ''));
                if (Number.isFinite(parsedEstimate) && parsedEstimate >= 3.5 && parsedEstimate <= 4.5) {
                    markLessonComplete(state, 'L2.10');
                }

                persist('Stoichiometric response graded');
                this.mount({ host, state, onStateChange, questionOverrides });
            });

            // Input sync listeners to preserve values across re-renders
            const l21Input = host.querySelector('#s2-l21-answer');
            if (l21Input) {
                l21Input.addEventListener('input', (e) => {
                    state.multiSubtractAnswer = e.target.value;
                });
            }
            const l22Input = host.querySelector('#s2-l22-answer');
            if (l22Input) {
                l22Input.addEventListener('input', (e) => {
                    state.borrowBasicAnswer = e.target.value;
                });
            }
            const step1Divide = host.querySelector('#s2-step1-divide');
            if (step1Divide) {
                step1Divide.addEventListener('input', (e) => {
                    state.step1Divide = e.target.value;
                });
            }
            const step1Multiply = host.querySelector('#s2-step1-multiply');
            if (step1Multiply) {
                step1Multiply.addEventListener('input', (e) => {
                    state.step1Multiply = e.target.value;
                });
            }
            const step1Subtract = host.querySelector('#s2-step1-subtract');
            if (step1Subtract) {
                step1Subtract.addEventListener('input', (e) => {
                    state.step1Subtract = e.target.value;
                });
            }
            const step1Bring = host.querySelector('#s2-step1-bring');
            if (step1Bring) {
                step1Bring.addEventListener('input', (e) => {
                    state.step1BringDown = e.target.value;
                });
            }
            const step2Divide = host.querySelector('#s2-step2-divide');
            if (step2Divide) {
                step2Divide.addEventListener('input', (e) => {
                    state.step2Divide = e.target.value;
                });
            }
            const step2Multiply = host.querySelector('#s2-step2-multiply');
            if (step2Multiply) {
                step2Multiply.addEventListener('input', (e) => {
                    state.step2Multiply = e.target.value;
                });
            }
            const step2Subtract = host.querySelector('#s2-step2-subtract');
            if (step2Subtract) {
                step2Subtract.addEventListener('input', (e) => {
                    state.step2Subtract = e.target.value;
                });
            }
            const gridAnswer = host.querySelector('#s2-grid-answer');
            if (gridAnswer) {
                gridAnswer.addEventListener('input', (e) => {
                    state.gridAnswer = e.target.value;
                });
            }
            const gridMechanicsAnswer = host.querySelector('#s2-grid-mechanics-answer');
            if (gridMechanicsAnswer) {
                gridMechanicsAnswer.addEventListener('input', (e) => {
                    state.gridMechanicsAnswer = e.target.value;
                });
            }
            const estimateInput = host.querySelector('#s2-estimate-input');
            if (estimateInput) {
                estimateInput.addEventListener('input', (e) => {
                    state.estimateInput = e.target.value;
                });
            }
            const subunityInput = host.querySelector('#s2-subunity-input');
            if (subunityInput) {
                subunityInput.addEventListener('input', (e) => {
                    state.subunityAnswer = e.target.value;
                });
            }
            const stoichResponseInput = host.querySelector('#s2-stoich-response');
            if (stoichResponseInput) {
                stoichResponseInput.addEventListener('input', (e) => {
                    state.stoichResponse = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
