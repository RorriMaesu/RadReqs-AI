const createInitialStage2State = () => ({
    diagnosticAnswers: { q1: '', q2: '', q3: '' },
    diagnosticFeedback: 'Answer the 3-question entry diagnostic. A perfect score unlocks Fast-Track and opens all levels.',
    diagnosticDone: false,
    fastTrack: false,
    concreteUnlocked: true,
    pictorialUnlocked: false,
    abstractUnlocked: false,
    appliedUnlocked: false,

    // Subtraction borrowing
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

    // Mental benchmarking and estimation
    estimateInput: '',
    estimateFeedback: 'L2.8 Estimation: Round 29.4 x 3.1 to friendly numbers before using a calculator.',

    appliedFeedback: 'Applied level: chemical dilution grids. If you have a 3x4 grid of sample wells, how many total samples can you hold?',
    appliedChoice: ''
});

export function createStage2Division() {
    return {
        id: 'stage2',
        label: 'Multi-Digit & Division',
        title: 'Stage 2: Multi-Digit Subtraction & Multiplicative Thinking',
        getInitialState() {
            return createInitialStage2State();
        },
        mount({ host, state, onStateChange }) {
            const defaults = createInitialStage2State();
            Object.keys(defaults).forEach((key) => {
                if (state[key] === undefined) {
                    state[key] = defaults[key];
                }
            });
            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's2-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

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
                    oDigit = '<span class="slashed">2</span>';
                    oAnnot = '12';
                }
                
                const ans = state.borrowAnswer || '';
                return `
                    <table class="math-sub-table">
                        <tr class="annotation-row">
                            <td></td>
                            <td>${hAnnot}</td>
                            <td>${tAnnot}</td>
                            <td>${oAnnot}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>${hDigit}</td>
                            <td>${tDigit}</td>
                            <td>${oDigit}</td>
                        </tr>
                        <tr class="line-row">
                            <td class="operator">-</td>
                            <td>1</td>
                            <td>8</td>
                            <td>7</td>
                        </tr>
                        <tr style="height: 1.8rem;">
                            <td></td>
                            <td style="color:#34d399;">${ans.charAt(0) || '?'}</td>
                            <td style="color:#34d399;">${ans.charAt(1) || '?'}</td>
                            <td style="color:#34d399;">${ans.charAt(2) || '?'}</td>
                        </tr>
                    </table>
                `;
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
                    .s2-btn.active, .s2-btn.ghost.active { background: #fbbf24; color: #0f172a; border-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
                    .s2-btn.ghost { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; }
                    .s2-btn.ghost:hover { background: rgba(255, 255, 255, 0.1); }
                    .s2-btn:disabled { cursor: not-allowed; opacity: 0.45; }
                    .s2-input { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(15, 23, 42, 0.7); color: #f8fafc; padding: 0.5rem; font: inherit; width: 100%; }
                    .s2-level.s2-locked { opacity: 0.52; position: relative; }
                    .s2-level.s2-locked::after { content: 'Locked by CPA gate'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; font-weight: 800; border-radius: 16px; z-index: 5; }
                    .s2-diagnostic { border: 2px solid #3b82f6; background: linear-gradient(180deg, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4)); }
                    
                    /* Column Subtraction Table Styles */
                    .math-sub-table { margin: 0.75rem auto; border-collapse: collapse; font-family: 'Courier New', monospace; font-size: 1.4rem; font-weight: 700; color: #f8fafc; text-align: center; }
                    .math-sub-table td { padding: 0.25rem 0.55rem; width: 2rem; }
                    .math-sub-table .annotation-row { font-size: 0.9rem; color: #fbbf24; height: 1.2rem; }
                    .math-sub-table .slashed { text-decoration: line-through; color: #64748b; }
                    .math-sub-table .line-row td { border-bottom: 2px solid #cbd5e1; padding: 0; }
                    .math-sub-table .operator { text-align: left; width: 1.2rem; }

                    /* Regrouping chips */
                    .s2-chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; min-height: 36px; margin-top: 0.45rem; align-items: center; }
                    .s2-chip { border-radius: 999px; padding: 0.16rem 0.55rem; border: 1px solid rgba(96, 165, 250, 0.25); background: rgba(30, 58, 138, 0.35); color: #93c5fd; font-size: 0.82rem; font-weight: 700; }
                    
                    /* Division styles */
                    .s2-step-box { border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; background: rgba(15, 23, 42, 0.6); padding: 0.72rem; margin-top: 0.5rem; }
                    .s2-step-box.s2-col-error { border-color: #ef4444; background: rgba(220, 38, 38, 0.15); }
                    .s2-label { display: block; color: #94a3b8; font-size: 0.8rem; font-weight: 700; margin: 0.3rem 0; }
                    
                    /* Collapsible Tutorial Styles */
                    .s2-tutorial-box { background: rgba(15, 23, 42, 0.55); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 0.75rem; margin: 0.6rem 0 0.8rem; font-size: 0.85rem; line-height: 1.5; }
                    .s2-tutorial-box summary { font-weight: 700; color: #fbbf24; cursor: pointer; user-select: none; outline: none; margin-bottom: 0.2rem; }
                    .s2-tutorial-box summary:hover { color: #f59e0b; }
                    .s2-tutorial-box p { margin: 0.4rem 0 0.2rem; color: #cbd5e1; }
                    .s2-tutorial-box ol, .s2-tutorial-box ul { margin: 0.3rem 0; padding-left: 1.2rem; color: #cbd5e1; }
                    .s2-tutorial-box li { margin-bottom: 0.25rem; }

                    .tutor-btn { margin-top: 0.5rem; }
                </style>

                <section class="s2-wrap">
                    <article class="s2-card s1-diagnostic s2-diagnostic">
                        <h2>3-Question Entry Diagnostic</h2>
                        <p>Unlock levels directly by demonstrating subtraction borrowing and quotient reasoning.</p>
                        <div class="s2-grid">
                            <div class="s2-pane">
                                <strong>1. First Regrouping Move</strong>
                                <p>To borrow for 305 - 128, what is the first step?</p>
                                <div class="s2-grid" style="grid-template-columns: 1fr; gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q1 === 'hundred' ? 'active' : ''}" data-diag="q1" data-value="hundred">Regroup 1 hundred into 10 tens</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q1 === 'skip' ? 'active' : ''}" data-diag="q1" data-value="skip">Borrow directly from the zero</button>
                                </div>
                            </div>
                            <div class="s2-pane">
                                <strong>2. Multiplication Fact</strong>
                                <p>Evaluate: 14 × 5 = ?</p>
                                <div class="s2-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q2 === '70' ? 'active' : ''}" data-diag="q2" data-value="70">70</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q2 === '60' ? 'active' : ''}" data-diag="q2" data-value="60">60</button>
                                </div>
                            </div>
                            <div class="s2-pane">
                                <strong>3. Quotient Loops</strong>
                                <p>In 156 ÷ 12, after Loop 1 leaves 3, what digit is brought down?</p>
                                <div class="s2-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q3 === '6' ? 'active' : ''}" data-diag="q3" data-value="6">6</button>
                                    <button class="s2-btn ghost ${state.diagnosticAnswers.q3 === '5' ? 'active' : ''}" data-diag="q3" data-value="5">5</button>
                                </div>
                            </div>
                        </div>
                        <div class="s2-grid" style="margin-top:0.75rem;">
                            <button id="s2-check-diagnostic" class="s2-btn" data-tutor-question-id="s2-diagnostic" data-tutor-level="diagnostic" data-tutor-answer-keys="diagnosticAnswers.q1,diagnosticAnswers.q2,diagnosticAnswers.q3" data-tutor-question="Help me review my Stage 2 diagnostic answers about regrouping, multiplication facts, and division loop bring-down steps.">Check Diagnostic</button>
                        </div>
                        <div id="s2-diagnostic-feedback" class="s2-feedback">${state.diagnosticFeedback}</div>
                        <div class="s2-status">
                            <span class="s2-pill ${state.fastTrack ? 'good' : 'locked'}">Fast-Track ${state.fastTrack ? 'Unlocked' : 'Pending'}</span>
                            <span class="s2-pill ${state.concreteUnlocked ? 'good' : 'locked'}">Concrete ${state.concreteUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s2-pill ${state.pictorialUnlocked ? 'good' : 'locked'}">Pictorial ${state.pictorialUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s2-pill ${state.abstractUnlocked ? 'good' : 'locked'}">Abstract ${state.abstractUnlocked ? 'Open' : 'Locked'}</span>
                            <span class="s2-pill ${state.appliedUnlocked ? 'good' : 'locked'}">Applied ${state.appliedUnlocked ? 'Open' : 'Locked'}</span>
                        </div>
                    </article>

                    <!-- CONCRETE LEVEL -->
                    <article class="s2-card s2-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Regrouping Across Internal Zeros</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Regrouping Across Zeros</summary>
                            <p>When subtracting vertically, if the top number in a column is smaller than the bottom number, you must "borrow" (regroup) from the next place value column to the left. However, if that column is <code>0</code>, you cannot borrow directly. You must transfer values step-by-step:</p>
                            <ol>
                                <li><strong>Step 1 (Hundreds to Tens):</strong> Regroup 1 Hundred from the Hundreds column. This becomes 10 Tens. (Hundreds count decreases by 1, Tens count increases by 10).</li>
                                <li><strong>Step 2 (Tens to Ones):</strong> Now that you have tens, regroup 1 Ten from the Tens column. This becomes 10 Ones. (Tens count decreases to 9, Ones count increases by 10).</li>
                                <li><strong>Step 3 (Subtract):</strong> Subtract each column starting from the ones place: <code>12 - 7 = 5</code>, <code>9 - 8 = 1</code>, and <code>3 - 1 = 2</code>. Final result is 215.</li>
                            </ol>
                        </details>

                        <p><strong>L2.3 Subtraction:</strong> Regroup first: Click 'Regroup Hundreds', then click 'Regroup Tens'. Once regrouping is complete, compute 402 - 187, type the difference in the box, and click 'Check Difference'.</p>
                        
                        <div class="s2-grid">
                            <div class="s2-pane">
                                <h3>Regrouping Workspace</h3>
                                <div class="s2-chip-row" id="s2-hundreds-row"></div>
                                <div class="s2-chip-row" id="s2-tens-row"></div>
                                <div class="s2-chip-row" id="s2-ones-row"></div>
                                <div class="s2-grid" style="margin-top:0.6rem; gap: 4px; grid-template-columns: 1fr 1fr;">
                                    <button id="s2-regroup-hundreds" class="s2-btn ghost ${state.regroupHundreds ? 'active' : ''}" data-tutor-question-id="s2-regroup-hundreds" data-tutor-level="concrete" data-tutor-answer-keys="hundreds,tens,ones,regroupHundreds" data-tutor-question="Why is regrouping 1 hundred into 10 tens the correct first move for 402 - 187?" ${state.regroupHundreds ? 'disabled' : ''} ${disabled(state.concreteUnlocked)}>Regroup Hundreds</button>
                                    <button id="s2-regroup-tens" class="s2-btn ghost ${state.regroupTens ? 'active' : ''}" data-tutor-question-id="s2-regroup-tens" data-tutor-level="concrete" data-tutor-answer-keys="hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="After regrouping hundreds, why do we regroup 1 ten into 10 ones before subtracting 7 from 2?" ${state.regroupTens ? 'disabled' : ''} ${disabled(state.concreteUnlocked)}>Regroup Tens</button>
                                    <button id="s2-reset-borrow" class="s2-btn ghost" style="grid-column: span 2;" ${disabled(state.concreteUnlocked)}>Reset Workspace</button>
                                </div>
                            </div>
                            <div class="s2-pane" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; min-height: 240px;">
                                <div style="width:100%;">
                                    <h3 style="text-align:left;">Subtract Result</h3>
                                    <p style="text-align:left; margin-bottom: 0;">Perform subtraction 402 - 187 after regrouping is complete.</p>
                                </div>
                                
                                ${renderColumnSubtraction()}
                                
                                <div style="width:100%;">
                                    <input id="s2-borrow-answer" class="s2-input" placeholder="Difference?" value="${state.borrowAnswer}" data-tutor-question-id="s2-borrow-difference" data-tutor-level="concrete" data-tutor-answer-keys="borrowAnswer,hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="Help me finish 402 - 187 after regrouping across the internal zero and verify each column subtraction." ${disabled(state.concreteUnlocked)} />
                                    <div class="s2-grid" style="margin-top: 8px; grid-template-columns: 1fr 1fr; gap: 4px;">
                                        <button id="s2-check-borrow" class="s2-btn" data-tutor-question-id="s2-borrow-difference" data-tutor-level="concrete" data-tutor-answer-keys="borrowAnswer,hundreds,tens,ones,regroupHundreds,regroupTens" data-tutor-question="Help me finish 402 - 187 after regrouping across the internal zero and verify each column subtraction." ${disabled(state.concreteUnlocked)}>Check Difference</button>
                                        <button id="s2-hint-borrow" class="s2-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Hint? (Required)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="s2-feedback">${state.borrowFeedback}</div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Why do we have to borrow across an internal zero? Can we just borrow directly from the hundreds place?" ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s2-card s2-level ${levelLocked(state.pictorialUnlocked)}">
                        <h2>Pictorial Level: Multiplication Arrays</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Multiplication Arrays as Area Grids</summary>
                            <p>Multiplication represents repeated addition of equal groups. An <strong>array</strong> organizes these groups into rows and columns:</p>
                            <ul>
                                <li><strong>Rows:</strong> The horizontal lines of elements (e.g. 6 rows).</li>
                                <li><strong>Columns:</strong> The vertical lines of elements (e.g. 8 columns).</li>
                                <li><strong>Total Area:</strong> The total dots is the product: <code>Rows × Columns = Total</code>.</li>
                            </ul>
                            <p>To find the product of <code>6 × 8</code>, you can count the elements of the 6x8 grid, or multiply 6 by 8 directly, yielding 48.</p>
                        </details>

                        <p><strong>L2.4 Multiplication Foundations:</strong> Visualizing multiplication as grid patterns. We have a grid of 6 rows and 8 columns of samples. This represents the calculation 6 × 8.</p>
                        <div class="s2-pane" style="text-align:center;">
                            <div style="display:inline-grid; grid-template-columns: repeat(8, 20px); gap:4px; background:#0f172a; padding:10px; border-radius:8px;">
                                ${Array.from({ length: 48 }, () => '<div style="width:20px; height:20px; background:#10b981; border-radius:50%;"></div>').join('')}
                            </div>
                            <p style="margin-top:8px;">How many total elements sit in this grid?</p>
                            <input id="s2-grid-answer" class="s2-input" style="text-align:center; max-width:200px;" placeholder="Total dots?" value="${state.gridAnswer || ''}" data-tutor-question-id="s2-grid-product" data-tutor-level="pictorial" data-tutor-answer-keys="gridAnswer" data-tutor-question="Help me compute the total in this multiplication array with 6 rows and 8 columns." ${disabled(state.pictorialUnlocked)} />
                            <div style="margin-top:6px; display:flex; justify-content:center; gap:4px;">
                                <button id="s2-check-grid" class="s2-btn" data-tutor-question-id="s2-grid-product" data-tutor-level="pictorial" data-tutor-answer-keys="gridAnswer" data-tutor-question="Help me compute the total in this multiplication array with 6 rows and 8 columns." ${disabled(state.pictorialUnlocked)}>Validate Count</button>
                                <button id="s2-hint-grid" class="s2-btn ghost" ${disabled(state.pictorialUnlocked)}>Hint</button>
                            </div>
                        </div>
                        <div id="s2-grid-feedback" class="s2-feedback">Enter the product of 6 rows and 8 columns.</div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Explain how multiplication arrays represent repeated groups and how to construct them visually." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s2-card s2-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: The Division Loop Engine</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: The Division Loop Algorithm</summary>
                            <p>Long division is a repeating loop of four steps: <strong>Divide &to; Multiply &to; Subtract &to; Bring Down</strong>.</p>
                            <ul>
                                <li><strong>Loop 1 (On the first digits, 15):</strong>
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
                                        <li><strong>Subtract:</strong> <code>36 - 36 = 0</code>. Since the remainder is 0 and no digits remain, division is complete! Quotient is 13.</li>
                                    </ol>
                                </li>
                            </ul>
                        </details>

                        <p><strong>L2.7 Division Loops:</strong> Solve 156 ÷ 12 one loop at a time. Enter each value column-by-column to advance.
                        <br><em>Loop 1:</em> Divide (15 ÷ 12 = 1), Multiply (1 × 12 = 12), Subtract (15 - 12 = 3), and Bring Down (6) to form 36.
                        <br><em>Loop 2:</em> Divide (36 ÷ 12 = 3), Multiply (3 × 12 = 36), and Subtract (36 - 36 = 0).</p>
                        
                        <div class="s2-grid">
                            <div class="s2-pane">
                                <h3>Loop 1 on 15</h3>
                                <div class="s2-step-box ${state.errorColumn === 'step1' ? 's2-col-error' : ''}">
                                    <label class="s2-label">Divide: how many 12s in 15?</label>
                                    <input id="s2-step1-divide" class="s2-input" value="${state.step1Divide}" data-tutor-question-id="s2-division-loop-1" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown" data-tutor-question="Help me complete Loop 1 of 156 divided by 12: divide, multiply, subtract, and bring down correctly." ${disabled(state.abstractUnlocked)} />
                                    <label class="s2-label">Multiply: 12 × quotient</label>
                                    <input id="s2-step1-multiply" class="s2-input" value="${state.step1Multiply}" data-tutor-question-id="s2-division-loop-1" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown" data-tutor-question="Help me complete Loop 1 of 156 divided by 12: divide, multiply, subtract, and bring down correctly." ${disabled(state.abstractUnlocked)} />
                                    <label class="s2-label">Subtract: 15 − product</label>
                                    <input id="s2-step1-subtract" class="s2-input" value="${state.step1Subtract}" data-tutor-question-id="s2-division-loop-1" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown" data-tutor-question="Help me complete Loop 1 of 156 divided by 12: divide, multiply, subtract, and bring down correctly." ${disabled(state.abstractUnlocked)} />
                                    <label class="s2-label">Bring down next digit (forms 36)</label>
                                    <input id="s2-step1-bring" class="s2-input" value="${state.step1BringDown}" data-tutor-question-id="s2-division-loop-1" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown" data-tutor-question="Help me complete Loop 1 of 156 divided by 12: divide, multiply, subtract, and bring down correctly." ${disabled(state.abstractUnlocked)} />
                                </div>
                            </div>
                            <div class="s2-pane">
                                <h3>Loop 2 on 36</h3>
                                <div class="s2-step-box ${state.errorColumn === 'step2' ? 's2-col-error' : ''}">
                                    <label class="s2-label">Divide: how many 12s in 36?</label>
                                    <input id="s2-step2-divide" class="s2-input" value="${state.step2Divide}" data-tutor-question-id="s2-division-loop-2" data-tutor-level="abstract" data-tutor-answer-keys="step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of 156 divided by 12 using the remainder 36." ${disabled(state.abstractUnlocked)} />
                                    <label class="s2-label">Multiply: 12 × quotient</label>
                                    <input id="s2-step2-multiply" class="s2-input" value="${state.step2Multiply}" data-tutor-question-id="s2-division-loop-2" data-tutor-level="abstract" data-tutor-answer-keys="step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of 156 divided by 12 using the remainder 36." ${disabled(state.abstractUnlocked)} />
                                    <label class="s2-label">Subtract: 36 − product</label>
                                    <input id="s2-step2-subtract" class="s2-input" value="${state.step2Subtract}" data-tutor-question-id="s2-division-loop-2" data-tutor-level="abstract" data-tutor-answer-keys="step2Divide,step2Multiply,step2Subtract" data-tutor-question="Help me complete Loop 2 of 156 divided by 12 using the remainder 36." ${disabled(state.abstractUnlocked)} />
                                </div>
                            </div>
                        </div>
                        <div class="s2-grid" style="margin-top:0.8rem; grid-template-columns: repeat(3, 1fr); gap: 4px;">
                            <button id="s2-validate-div" class="s2-btn" data-tutor-question-id="s2-division-validation" data-tutor-level="abstract" data-tutor-answer-keys="step1Divide,step1Multiply,step1Subtract,step1BringDown,step2Divide,step2Multiply,step2Subtract" data-tutor-question="Review my complete long-division loop inputs for 156 divided by 12 and explain any mismatch." ${disabled(state.abstractUnlocked)}>Validate Division</button>
                            <button id="s2-reset-div" class="s2-btn ghost" ${disabled(state.abstractUnlocked)}>Reset Loops</button>
                            <button id="s2-hint-div" class="s2-btn ghost" ${disabled(state.abstractUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s2-feedback">${state.divisionFeedback}</div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Why must we subtract and verify the remainder in division before bringing down the next digit? Walk me through." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s2-card s2-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Multi-grid Well Volumes</h2>
                        
                        <details class="s2-tutorial-box">
                            <summary>Concept Tutorial: Compound Multiplication &amp; Grid Capacity</summary>
                            <p>In lab settings, quantities scale through multiple dimensions. To calculate the total volume capacity of a well-plate grid:</p>
                            <ol>
                                <li>Calculate the total number of wells first: <code>Rows × Columns = Total Wells</code> (e.g. 3 rows × 4 columns = 12 wells).</li>
                                <li>Multiply the total wells by the volume capacity per well: <code>Total Wells × Volume per Well = Total Volume</code>.</li>
                                <li>For our 3x4 grid holding 5 mL per well: <code>(3 × 4) × 5 = 12 × 5 = 60 mL</code>.</li>
                            </ol>
                        </details>

                        <p><strong>[Required Unlock] L2.8 Applied Capacity:</strong> Solve the well-volume capacity question to complete the Applied gate.</p>
                        <p><strong>[Reinforcement] L2.8 Mental Benchmarking & Estimation:</strong> Use a quick estimate before exact arithmetic. For 29.4 x 3.1, round to 30 x 3 to predict about 90. Then compare your estimate with exact work to catch decimal slips.</p>
                        <div class="s2-grid">
                            <button id="s2-app-wrong" class="s2-btn ghost" data-tutor-question-id="s2-applied-well-capacity" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me reason through this lab well-capacity problem and why dimensions are multiplied instead of added." ${disabled(state.appliedUnlocked)}>12 mL because we add 3 + 4 + 5</button>
                            <button id="s2-app-right" class="s2-btn" data-tutor-question-id="s2-applied-well-capacity" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="Help me reason through this lab well-capacity problem and why dimensions are multiplied instead of added." ${disabled(state.appliedUnlocked)}>60 mL because 3 rows × 4 columns = 12 wells, and 12 × 5 mL = 60 mL</button>
                        </div>
                        <div class="s2-feedback">${state.appliedFeedback}</div>

                        <div class="s2-pane" style="margin-top:0.75rem;">
                            <p><strong>L2.8 Quick Check:</strong> Enter the benchmark estimate for <code>29.4 x 3.1</code> using rounded numbers.</p>
                            <div class="s2-grid" style="grid-template-columns: 1fr auto;">
                                <input id="s2-estimate-input" class="s2-input" placeholder="Estimated value" value="${state.estimateInput}" data-tutor-question-id="s2-estimation" data-tutor-level="applied" data-tutor-answer-keys="estimateInput" data-tutor-question="Help me estimate 29.4 times 3.1 using rounding and sanity-check benchmarks." ${disabled(state.appliedUnlocked)} />
                                <button id="s2-check-estimate" class="s2-btn" data-tutor-question-id="s2-estimation" data-tutor-level="applied" data-tutor-answer-keys="estimateInput" data-tutor-question="Help me estimate 29.4 times 3.1 using rounding and sanity-check benchmarks." ${disabled(state.appliedUnlocked)}>Check Estimate</button>
                            </div>
                            <div class="s2-feedback" id="s2-estimate-feedback">${state.estimateFeedback}</div>
                        </div>

                        <div class="s2-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s2-btn ghost" title="Reinforcement" data-prompt="Show me how compound multiplication applies to dimensional grids (rows x columns x volume per unit)." ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const renderBorrowChips = () => {
                const hundredsEl = host.querySelector('#s2-hundreds-row');
                const tensEl = host.querySelector('#s2-tens-row');
                const onesEl = host.querySelector('#s2-ones-row');
                if (!hundredsEl || !tensEl || !onesEl) return;
                hundredsEl.innerHTML = `<strong>Hundreds:</strong>${Array.from({ length: Math.max(0, state.hundreds) }, () => '<span class="s2-chip">100</span>').join('')}`;
                tensEl.innerHTML = `<strong>Tens:</strong>${Array.from({ length: Math.max(0, state.tens) }, () => '<span class="s2-chip">10</span>').join('')}`;
                onesEl.innerHTML = `<strong>Ones:</strong>${Array.from({ length: Math.max(0, state.ones) }, () => '<span class="s2-chip">1</span>').join('')}`;
            };

            renderBorrowChips();

            // Bind Tutor
            host.querySelectorAll('.tutor-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    window.ChemTutor?.invoke(prompt, btn.parentElement);
                });
            });

            // Diagnostic
            host.querySelectorAll('[data-diag]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-diag');
                    const val = btn.getAttribute('data-value');
                    state.diagnosticAnswers[q] = val;
                    persist('Diagnostic chosen');
                    this.mount({ host, state, onStateChange });
                });
            });

            host.querySelector('#s2-check-diagnostic').addEventListener('click', () => {
                const correct = state.diagnosticAnswers.q1 === 'hundred' &&
                                state.diagnosticAnswers.q2 === '70' &&
                                state.diagnosticAnswers.q3 === '6';
                state.diagnosticDone = true;
                if (correct) {
                    state.fastTrack = true;
                    state.pictorialUnlocked = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.diagnosticFeedback = 'Fast-Track Achievement unlocked! You mastered division subtraction borrowing and arrays. All levels are now open.';
                } else {
                    state.fastTrack = false;
                    state.diagnosticFeedback = 'Diagnostic complete. Standard path active.';
                }
                persist('Diagnostic checked');
                this.mount({ host, state, onStateChange });
            });

            // Concrete Subtraction
            host.querySelector('#s2-regroup-hundreds').addEventListener('click', () => {
                if (state.regroupHundreds) {
                    state.borrowFeedback = 'Hundreds have already been regrouped. You are ready for the next step!';
                    this.mount({ host, state, onStateChange });
                    return;
                }
                if (state.hundreds > 0) {
                    state.hundreds -= 1;
                    state.tens += 10;
                    state.regroupHundreds = true;
                    state.borrowFeedback = 'Unpacked 1 hundred into 10 tens. Now regroup 1 ten into 10 ones.';
                    persist('Borrowed hundred');
                    this.mount({ host, state, onStateChange });
                }
            });

            host.querySelector('#s2-regroup-tens').addEventListener('click', () => {
                if (!state.regroupHundreds) {
                    state.borrowFeedback = 'Cannot borrow from the Tens column because it currently has 0 tens! You must regroup 1 Hundred into 10 Tens first.';
                    this.mount({ host, state, onStateChange });
                    return;
                }
                if (state.regroupTens) {
                    state.borrowFeedback = 'Tens have already been regrouped. You can now perform subtraction.';
                    this.mount({ host, state, onStateChange });
                    return;
                }
                if (state.tens > 0) {
                    state.tens -= 1;
                    state.ones += 10;
                    state.regroupTens = true;
                    state.borrowFeedback = 'Regrouped 1 ten into 10 ones. The Ones column now has 12 ones. Compute 402 - 187!';
                    persist('Borrowed ten');
                    this.mount({ host, state, onStateChange });
                }
            });

            host.querySelector('#s2-reset-borrow').addEventListener('click', () => {
                state.hundreds = 4;
                state.tens = 0;
                state.ones = 2;
                state.regroupHundreds = false;
                state.regroupTens = false;
                state.borrowAnswer = '';
                state.borrowFeedback = 'Solve 402 - 187 by regrouping across the internal zero first.';
                persist('Borrow reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s2-borrow-answer').addEventListener('input', (e) => {
                state.borrowAnswer = e.target.value.trim();
                const tableEl = host.querySelector('.math-sub-table');
                if (tableEl) {
                    const resultRow = tableEl.rows[3];
                    const digits = state.borrowAnswer;
                    resultRow.cells[1].textContent = digits.charAt(0) || '?';
                    resultRow.cells[2].textContent = digits.charAt(1) || '?';
                    resultRow.cells[3].textContent = digits.charAt(2) || '?';
                }
            });

            host.querySelector('#s2-check-borrow').addEventListener('click', () => {
                const val = host.querySelector('#s2-borrow-answer').value.trim();
                state.borrowAnswer = val;
                
                const answerIs215 = val === '215';
                const hasRegroupedHundreds = state.regroupHundreds;
                const hasRegroupedTens = state.regroupTens;
                
                if (answerIs215 && hasRegroupedHundreds && hasRegroupedTens) {
                    state.borrowFeedback = 'Correct! 402 - 187 = 215. Regrouping across the internal zero unlocks the pictorial level.';
                    state.pictorialUnlocked = true;
                } else if (answerIs215 && (!hasRegroupedHundreds || !hasRegroupedTens)) {
                    state.borrowFeedback = 'The answer 215 is mathematically correct, but you must demonstrate the step-by-step regrouping process using the buttons first before checking the difference.';
                } else if (!hasRegroupedHundreds) {
                    state.borrowFeedback = 'You have not regrouped 1 hundred into 10 tens. You cannot subtract 8 from 0 in the Tens column. Please regroup Hundreds first.';
                } else if (!hasRegroupedTens) {
                    state.borrowFeedback = 'You have not regrouped 1 ten into 10 ones. You cannot subtract 7 from 2 in the Ones column. Please regroup Tens first.';
                } else {
                    state.borrowFeedback = 'Incorrect. Regrouping is correct, but the subtraction result is wrong. Calculate: Ones (12 - 7 = 5), Tens (9 - 8 = 1), Hundreds (3 - 1 = 2).';
                }
                persist('Borrow result validated');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s2-check-grid').addEventListener('click', () => {
                const val = host.querySelector('#s2-grid-answer').value.trim();
                state.gridAnswer = val;
                const feedback = host.querySelector('#s2-grid-feedback');
                if (val === '48') {
                    feedback.textContent = 'Correct! A 6x8 array holds 48 elements.';
                    state.abstractUnlocked = true;
                } else {
                    feedback.textContent = 'Incorrect. Multiply 6 by 8 to find the total dots.';
                }
                persist('Grid checked');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Division Loop
            host.querySelector('#s2-validate-div').addEventListener('click', () => {
                const s1d = host.querySelector('#s2-step1-divide').value.trim();
                const s1m = host.querySelector('#s2-step1-multiply').value.trim();
                const s1s = host.querySelector('#s2-step1-subtract').value.trim();
                const s1b = host.querySelector('#s2-step1-bring').value.trim();
                const s2d = host.querySelector('#s2-step2-divide').value.trim();
                const s2m = host.querySelector('#s2-step2-multiply').value.trim();
                const s2s = host.querySelector('#s2-step2-subtract').value.trim();

                state.step1Divide = s1d;
                state.step1Multiply = s1m;
                state.step1Subtract = s1s;
                state.step1BringDown = s1b;
                state.step2Divide = s2d;
                state.step2Multiply = s2m;
                state.step2Subtract = s2s;

                state.errorColumn = '';

                if (state.step1Divide !== '1') {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = 'Loop 1 divide: 12 goes into 15 exactly 1 time.';
                } else if (state.step1Multiply !== '12') {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = 'Loop 1 multiply: 12 × 1 is 12.';
                } else if (state.step1Subtract !== '3') {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = 'Loop 1 subtract: 15 − 12 leaves 3.';
                } else if (state.step1BringDown !== '36') {
                    state.errorColumn = 'step1';
                    state.divisionFeedback = 'Loop 1 bring down: lower the 6 to make 36.';
                } else if (state.step2Divide !== '3') {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = 'Loop 2 divide: 12 goes into 36 exactly 3 times.';
                } else if (state.step2Multiply !== '36') {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = 'Loop 2 multiply: 12 × 3 is 36.';
                } else if (state.step2Subtract !== '0') {
                    state.errorColumn = 'step2';
                    state.divisionFeedback = 'Loop 2 subtract: 36 − 36 leaves 0.';
                } else {
                    state.divisionPassed = true;
                    state.abstractUnlocked = true;
                    state.appliedUnlocked = true;
                    state.divisionFeedback = 'Correct. You completed the long division loop step by step and reached 13. Abstract and Applied unlocked. Continue below.';
                }
                persist('Division loops validated');
                this.mount({ host, state, onStateChange });
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
                state.divisionFeedback = 'Work the problem 156 ÷ 12 one loop at a time.';
                state.divisionPassed = false;
                persist('Division reset');
                this.mount({ host, state, onStateChange });
            });

            // Hints for Stage 2
            host.querySelector('#s2-hint-borrow')?.addEventListener('click', () => {
                if (state.hundreds === 4 && state.tens === 0) {
                    state.borrowFeedback = 'Hint: Click the "Regroup 1 hundred to 10 tens" button first to unlock tens.';
                } else if (state.hundreds === 3 && state.tens === 10 && state.ones === 2) {
                    state.borrowFeedback = 'Hint: Now click the "Regroup 1 ten to 10 ones" button to get enough ones to subtract 7.';
                } else if (state.regroupHundreds && state.regroupTens) {
                    state.borrowFeedback = 'Hint: Regrouping complete! Now calculate: Ones column (12 - 7 = 5), Tens column (9 - 8 = 1), Hundreds column (3 - 1 = 2). Result is 215.';
                } else {
                    state.borrowFeedback = 'Hint: Make sure to follow the step-by-step regrouping sequence before performing subtraction.';
                }
                persist('Borrow hint shown');
                this.mount({ host, state, onStateChange });
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
                    state.estimateFeedback = 'Correct benchmark. 29.4 x 3.1 is close to 30 x 3 = 90, so answers far from ~90 likely contain a decimal-entry error.';
                } else {
                    state.estimateFeedback = 'Not a strong benchmark. Round 29.4 to 30 and 3.1 to 3 first, then estimate 30 x 3 = 90.';
                }

                persist('Estimation checked');
                this.mount({ host, state, onStateChange });
            });

            // Input sync listeners to preserve values across re-renders
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
                    state.gridAnswer = e.target.value; // Wait! Does state have a key for grid answer?
                });
            }
            const estimateInput = host.querySelector('#s2-estimate-input');
            if (estimateInput) {
                estimateInput.addEventListener('input', (e) => {
                    state.estimateInput = e.target.value;
                });
            }
        },
        unmount() {}
    };
}
