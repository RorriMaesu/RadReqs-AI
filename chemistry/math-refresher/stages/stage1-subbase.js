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
    concreteMission: { subitizingSolved: false, regroupDone: false },
    concreteCompleted: false,
    
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
    
    appliedFeedback: 'Applied level: reading digital scales. Which scale represents a zero measurement?',
    appliedChoice: ''
});

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

            const levelLocked = (unlocked) => (state.fastTrack || unlocked) ? '' : 's1-locked';
            const disabled = (unlocked) => (state.fastTrack || unlocked) ? '' : 'disabled';

            host.innerHTML = `
                <style>
                    .s1-wrap { display: grid; gap: 1.2rem; }
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
                </style>

                <section class="s1-wrap">
                    <article class="s1-card s1-diagnostic">
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

                    <!-- CONCRETE LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.concreteUnlocked)}">
                        <h2>Concrete Level: Quantity &amp; Carrying Blocks</h2>
                        
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
                        <div class="s1-feedback">${state.subitizingFeedback}</div>

                        <hr style="margin: 1.2rem 0; border: none; border-top: 1px solid rgba(255, 255, 255, 0.1);" />

                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Base-10 Columns &amp; Carrying</summary>
                            <p>In our base-10 number system, each column can only hold single digits (0 to 9). Once a column reaches 10, it overflows and must be bundled:</p>
                            <ul>
                                <li>10 single <strong>Ones blocks</strong> are bundled together into 1 solid <strong>Tens rod</strong> (10 units).</li>
                                <li>This is the physical foundation of <strong>Carrying</strong> in addition. When we write 15, we are writing 1 Ten and 5 Ones.</li>
                            </ul>
                            <p><strong>Step-by-Step Exercise:</strong></p>
                            <ol>
                                <li>Click <strong>+1 Ones Block</strong> to add single blocks. Keep track of the count.</li>
                                <li>Once you reach 10 ones, notice the "Regroup" button activates.</li>
                                <li>Click <strong>Regroup (Carrying)</strong> to watch the 10 separate blocks merge into 1 single red Tens rod.</li>
                            </ol>
                        </details>

                        <p><strong>L1.7 Carrying Blocks (Base-10 Regrouping):</strong> Learn how place-value columns function. 
                        <br><strong>Goal to unlock next level:</strong> Click <strong>+1 Ones Block</strong> until you have 10 blocks in the Ones Column, then click the active <strong>Regroup (Carrying)</strong> button to merge them into a single 10-Unit rod in the Tens Column.</p>
                        <div class="s1-blocks-arena">
                            <div class="s1-column-box">
                                <strong>Tens Column</strong>
                                <div id="s1-tens-blocks" style="display:flex; flex-direction:column; gap:4px;"></div>
                            </div>
                            <div class="s1-column-box">
                                <strong>Ones Column</strong>
                                <div id="s1-ones-blocks" style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center;"></div>
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                            <button id="s1-add-block" class="s1-btn" ${disabled(state.concreteUnlocked)}>+1 Ones</button>
                            <button id="s1-regroup-block" class="s1-btn ghost" data-tutor-question-id="s1-regrouping" data-tutor-level="concrete" data-tutor-answer-keys="onesCount,tensCount,concreteMission.regroupDone" data-tutor-question="I need help understanding when and why to regroup 10 ones into 1 ten during base-10 carrying." ${disabled(state.concreteUnlocked)} ${state.onesCount >= 10 ? '' : 'disabled'}>Regroup</button>
                            <button id="s1-reset-block" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Reset</button>
                            <button id="s1-hint-blocks" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Hint</button>
                        </div>
                        <div class="s1-feedback">${state.carryFeedback}</div>

                        <div class="s1-pane" style="margin-top:0.75rem;">
                            <h3 style="margin:0 0 0.45rem;">Concrete Mission</h3>
                            <div class="s1-status" style="margin-top:0; margin-bottom:0.5rem;">
                                <span class="s1-pill ${state.concreteMission.subitizingSolved ? 'good' : 'locked'}">Correctly subitize one flash</span>
                                <span class="s1-pill ${state.concreteMission.regroupDone ? 'good' : 'locked'}">Regroup 10 ones into a tens rod</span>
                            </div>
                            <div class="s1-grid" style="gap:4px;">
                                <button id="s1-hint-concrete" class="s1-btn ghost" ${disabled(state.concreteUnlocked)}>Need a Mission Hint?</button>
                                <button id="s1-continue-pictorial" class="s1-btn" ${(state.fastTrack || state.pictorialUnlocked) ? '' : 'disabled'} ${disabled(state.concreteUnlocked)}>Continue to Pictorial (Required)</button>
                            </div>
                        </div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Explain the difference between counting objects and understanding columns like tens and ones." ${disabled(state.concreteUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- PICTORIAL LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.pictorialUnlocked)}">
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
                                <p><strong>Statement A:</strong> 9 ___ 7</p>
                                <select id="s1-comp-q1" class="s1-input" data-tutor-question-id="s1-comparison-a" data-tutor-level="pictorial" data-tutor-answer-keys="compQ1" data-tutor-question="For Statement A, help me decide which comparison symbol makes 9 and 7 true." ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Choose...</option>
                                    <option value="lt" ${state.compQ1 === 'lt' ? 'selected' : ''}>&lt;</option>
                                    <option value="gt" ${state.compQ1 === 'gt' ? 'selected' : ''}>&gt;</option>
                                    <option value="eq" ${state.compQ1 === 'eq' ? 'selected' : ''}>=</option>
                                </select>
                            </div>
                            <div class="s1-pane">
                                <p><strong>Statement B:</strong> 3 + 2 ___ 5</p>
                                <select id="s1-comp-q2" class="s1-input" data-tutor-question-id="s1-comparison-b" data-tutor-level="pictorial" data-tutor-answer-keys="compQ2" data-tutor-question="For Statement B, help me decide which symbol makes 3 + 2 compared with 5 true." ${disabled(state.pictorialUnlocked)}>
                                    <option value="">Choose...</option>
                                    <option value="lt" ${state.compQ2 === 'lt' ? 'selected' : ''}>&lt;</option>
                                    <option value="gt" ${state.compQ2 === 'gt' ? 'selected' : ''}>&gt;</option>
                                    <option value="eq" ${state.compQ2 === 'eq' ? 'selected' : ''}>=</option>
                                </select>
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <button id="s1-check-comp" class="s1-btn" data-tutor-question-id="s1-comparison-check" data-tutor-level="pictorial" data-tutor-answer-keys="compQ1,compQ2" data-tutor-question="Check my comparison-symbol choices and explain why each statement should be greater than, less than, or equal." ${disabled(state.pictorialUnlocked)}>Validate Symbols</button>
                            <button id="s1-hint-comp" class="s1-btn ghost" ${disabled(state.pictorialUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s1-feedback">${state.compFeedback}</div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Help me understand why we use the greater than and less than symbols and how to read them." ${disabled(state.pictorialUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- ABSTRACT LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.abstractUnlocked)}">
                        <h2>Abstract Level: Multi-Digit Addition (No carrying)</h2>
                        
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: Column Addition without Carrying</summary>
                            <p>When adding large numbers, we align them vertically by place value (Ones under Ones, Tens under Tens, Hundreds under Hundreds). We then add each column independently starting from the right-hand side:</p>
                            <ol>
                                <li><strong>Ones place:</strong> Add the ones digits: <code>3 + 5 = 8</code>. Write 8 in the ones column.</li>
                                <li><strong>Tens place:</strong> Add the tens digits: <code>4 + 2 = 6</code>. Write 6 in the tens column.</li>
                                <li><strong>Hundreds place:</strong> Add the hundreds digits: <code>1 + 0 = 1</code>. Write 1 in the hundreds column.</li>
                            </ol>
                            <p>Because no column sum exceeds 9, no regrouping (carrying) is needed. Combining the columns yields 168.</p>
                        </details>

                        <p><strong>L1.6 Basic Arithmetic:</strong> Add column by column. The ones place aligns perfectly and does not overflow, so you just add row digits.</p>
                        <div class="s1-pane">
                            <div style="font-family:monospace; font-size:1.3rem; line-height:1.4; text-align:center;">
                              &nbsp;&nbsp;143<br>
                              +&nbsp;&nbsp;25<br>
                              -----
                            </div>
                            <div style="margin-top: 8px;">
                                <input id="s1-add-input" class="s1-input" style="text-align:center;" placeholder="Enter sum" value="${state.additionAnswer}" data-tutor-question-id="s1-addition" data-tutor-level="abstract" data-tutor-answer-keys="additionAnswer" data-tutor-question="Help me solve 143 + 25 using aligned place-value columns without carrying mistakes." ${disabled(state.abstractUnlocked)} />
                            </div>
                        </div>
                        <div class="s1-grid" style="margin-top:0.6rem; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <button id="s1-check-add" class="s1-btn" data-tutor-question-id="s1-addition" data-tutor-level="abstract" data-tutor-answer-keys="additionAnswer" data-tutor-question="Help me solve 143 + 25 using aligned place-value columns without carrying mistakes." ${disabled(state.abstractUnlocked)}>Check Sum</button>
                            <button id="s1-hint-addition" class="s1-btn ghost" ${disabled(state.abstractUnlocked)}>Need a Hint? (Required)</button>
                        </div>
                        <div class="s1-feedback">${state.additionFeedback}</div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Show me step-by-step how to add 143 and 25 aligning columns without carrying." ${disabled(state.abstractUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>

                    <!-- APPLIED LEVEL -->
                    <article class="s1-card s1-level ${levelLocked(state.appliedUnlocked)}">
                        <h2>Applied Level: Lab Scale Zeroing</h2>
                        
                        <details class="s1-tutorial-box">
                            <summary>Concept Tutorial: The Relativity of Zero in Lab Measurements</summary>
                            <p>In science, "zero" does not always mean absolute nothingness. It represents a chosen <strong>reference baseline</strong>:</p>
                            <ul>
                                <li><strong>Taring/Zeroing:</strong> When we place a container on a scale, it has mass (e.g. 3.12 g). Taring shifts our "zero" point to the top of that container.</li>
                                <li>Any substance subsequently added is measured relative to that container.</li>
                                <li>This is identical to shifting our starting point on a number line, defining a new origin point.</li>
                            </ul>
                        </details>

                        <p><strong>L1.1 Concept Applied:</strong> In a laboratory, an empty balance pan is dirty or holds a container. It reads 3.12 g. We press "Tare/Zero" to define that quantity as the new starting reference point (Zero). What is this action representing?</p>
                        <div class="s1-grid">
                            <button id="s1-app-wrong" class="s1-btn ghost" data-tutor-question-id="s1-applied-tare" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="In this lab tare scenario, help me reason what zeroing a scale really means conceptually." ${disabled(state.appliedUnlocked)}>Deleting the mass from existence</button>
                            <button id="s1-app-right" class="s1-btn" data-tutor-question-id="s1-applied-tare" data-tutor-level="applied" data-tutor-answer-keys="appliedChoice" data-tutor-question="In this lab tare scenario, help me reason what zeroing a scale really means conceptually." ${disabled(state.appliedUnlocked)}>Shifting the absolute zero reference to a relative midpoint</button>
                        </div>
                        <div class="s1-feedback">${state.appliedFeedback}</div>

                        <div class="s1-grid" style="margin-top: 0.6rem;">
                            <button class="tutor-btn s1-btn ghost" title="Reinforcement" data-prompt="Why is zeroing a scale so critical in science measurements, and how is it related to the number line?" ${disabled(state.appliedUnlocked)}>Ask Prof. Beaker (Reinforcement)</button>
                        </div>
                    </article>
                </section>
            `;

            const persist = (msg) => onStateChange({ ...state }, msg);

            const syncConcreteMission = () => {
                if (state.fastTrack) return;
                if (state.concreteMission.subitizingSolved && state.concreteMission.regroupDone && !state.concreteCompleted) {
                    state.concreteCompleted = true;
                    state.pictorialUnlocked = true;
                    state.carryFeedback = 'Concrete mission complete. You demonstrated both subitizing and base-10 regrouping. Pictorial unlocked. Continue below.';
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

            // Concrete Subitizing
            host.querySelector('#s1-flash-dots').addEventListener('click', () => {
                state.subitizingHidden = false;
                state.subitizingDots = Math.floor(3 + Math.random() * 5); // 3 to 7 dots
                state.subitizingFeedback = 'Flashed!';
                renderDots();
                persist('Dots flashed');
                this.mount({ host, state, onStateChange });

                setTimeout(() => {
                    state.subitizingHidden = true;
                    persist('Dots hidden');
                    this.mount({ host, state, onStateChange });
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
            host.querySelector('#s1-add-block').addEventListener('click', () => {
                state.onesCount += 1;
                if (state.onesCount >= 10) {
                    state.carryFeedback = 'Ones column contains 10 blocks! You can now merge them into a Ten rod by clicking Regroup.';
                } else {
                    state.carryFeedback = `Added 1 Ones block. Total ones: ${state.onesCount}.`;
                }
                persist('Blocks added');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-regroup-block').addEventListener('click', () => {
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

            host.querySelector('#s1-reset-block').addEventListener('click', () => {
                state.onesCount = 0;
                state.tensCount = 0;
                if (!state.concreteCompleted) {
                    state.concreteMission.regroupDone = false;
                }
                state.carryFeedback = 'Blocks reset.';
                persist('Blocks reset');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-hint-concrete')?.addEventListener('click', () => {
                if (!state.concreteMission.subitizingSolved) {
                    state.subitizingFeedback = 'Mission hint: flash dots, chunk quickly, and submit one correct subitizing guess.';
                } else if (!state.concreteMission.regroupDone) {
                    state.carryFeedback = 'Mission hint: add ones until you reach 10, then click Regroup to create one tens rod.';
                } else {
                    state.carryFeedback = 'Concrete mission complete. Pictorial unlocked. Continue below.';
                }
                persist('Concrete mission hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-continue-pictorial')?.addEventListener('click', () => {
                if (state.fastTrack || state.pictorialUnlocked) {
                    state.carryFeedback = 'Pictorial unlocked. Continue below.';
                } else {
                    state.carryFeedback = 'Complete both Concrete mission steps first: one correct subitizing guess and one regroup action.';
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

                const q1Correct = q1 === 'gt';
                const q2Correct = q2 === 'eq';

                if (q1Correct && q2Correct) {
                    state.compFeedback = 'Correct! 9 is greater than 7, and 3+2 is equal to 5. Abstract unlocked. Continue below.';
                    state.abstractUnlocked = true; // Unlock abstract
                } else {
                    state.compFeedback = 'Not yet. Remember: the open side of the symbol > or < always faces the larger number (e.g. 9 > 7).';
                }
                persist('Comparisons validated');
                this.mount({ host, state, onStateChange });
            });

            // Abstract Addition
            host.querySelector('#s1-check-add').addEventListener('click', () => {
                const ans = host.querySelector('#s1-add-input').value.trim();
                state.additionAnswer = ans;
                if (ans === '168') {
                    state.additionFeedback = 'Correct. 143 + 25 = 168 without any carrying needed. Applied unlocked. Continue below.';
                    state.appliedUnlocked = true; // Unlock applied
                } else {
                    state.additionFeedback = 'Incorrect. Align columns: 3 + 5 = 8, 4 + 2 = 6, and 1 + 0 = 1.';
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

            host.querySelector('#s1-hint-comp')?.addEventListener('click', () => {
                state.compFeedback = 'Hint: For Statement A, 9 is larger than 7, so select ">". For Statement B, 3 + 2 equals 5, and 5 equals 5, so select "=".';
                persist('Comp hint shown');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-hint-addition')?.addEventListener('click', () => {
                state.additionFeedback = 'Hint: Add column-by-column: Ones column is 3 + 5 = 8. Tens column is 4 + 2 = 6. Hundreds column is 1 + 0 = 1.';
                persist('Addition hint shown');
                this.mount({ host, state, onStateChange });
            });

            // Applied Zeroing
            host.querySelector('#s1-app-wrong').addEventListener('click', () => {
                state.appliedChoice = 'wrong';
                state.appliedFeedback = 'Trap: Zeroing does not destroy mass; it resets your reference coordinate on the number line so that your measurements represent net changes.';
                persist('Applied choice incorrect');
                this.mount({ host, state, onStateChange });
            });

            host.querySelector('#s1-app-right').addEventListener('click', () => {
                state.appliedChoice = 'right';
                state.appliedFeedback = 'Correct! Zeroing resets the reference value, demonstrating that zero on a number line is a relative coordinate (midpoint), not absolute nothingness.';
                persist('Applied choice correct');
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
        },
        unmount() {}
    };
}
