(function () {
    const STAGE_LECTURE = 1;
    const STAGE_SOCRATIC = 2;
    const STAGE_SANDBOX = 3;
    const STAGE_FEYNMAN = 4;

    const appState = {
        lessonId: null,
        lesson: null,
        stage: STAGE_LECTURE,
        messageHistory: [],
        isChatLocked: false,
        useSpeechInput: false,
        recognition: null,
        syllabus: null,
        matrix: {}
    };

    const lectureGenerationInFlight = new Map();

    const els = {};

    function cacheDom() {
        els.activeLessonTitle = document.getElementById('active-lesson-title');
        els.lectureContainer = document.getElementById('lecture-container');
        els.chatMessages = document.getElementById('chat-messages');
        els.chatHeaderTitle = document.getElementById('chat-header-title');
        els.modeBadge = document.getElementById('current-mode-badge');
        els.chatForm = document.getElementById('chat-form');
        els.chatInput = document.getElementById('chat-input');
        els.btnSend = document.getElementById('btn-send');
        els.btnMic = document.getElementById('btn-mic');
        els.feynmanSpeechControls = document.getElementById('feynman-speech-controls');
        els.btnToggleInputMode = document.getElementById('btn-toggle-input-mode');
        els.toggleInputText = document.getElementById('toggle-input-text');
        els.speechIndicator = document.getElementById('speech-indicator');
        els.inputInstructions = document.getElementById('input-instructions');
        els.sandboxHandshake = document.getElementById('sandbox-handshake');
        els.sandboxLink = document.getElementById('sandbox-link');
        els.sandboxInstructions = els.sandboxHandshake ? els.sandboxHandshake.querySelector('.text-xs') : null;
        els.masterCtaOverlay = document.getElementById('master-cta-overlay');
        els.btnRegenerate = document.getElementById('btn-regenerate');
        els.btnRestartLesson = document.getElementById('btn-restart-lesson');
        els.sessionStatus = document.getElementById('session-status');

        els.dots = {
            1: document.getElementById('dot-1'),
            2: document.getElementById('dot-2'),
            3: document.getElementById('dot-3'),
            4: document.getElementById('dot-4')
        };
        els.dotContainers = {
            1: document.getElementById('stage-dot-1'),
            2: document.getElementById('stage-dot-2'),
            3: document.getElementById('stage-dot-3'),
            4: document.getElementById('stage-dot-4')
        };
    }

    function getMatrix() {
        try {
            return JSON.parse(localStorage.getItem('masteryMatrix') || '{}');
        } catch (_err) {
            return {};
        }
    }

    async function ensureSyllabusReady() {
        if (window.syllabusData) {
            appState.syllabus = window.syllabusData;
            return;
        }

        if (typeof window.loadSyllabus === 'function') {
            const syllabus = await window.loadSyllabus();
            appState.syllabus = syllabus;
            return;
        }

        throw new Error('Syllabus loader unavailable');
    }

    function getAllLessonsFlat(syllabus) {
        const lessons = [];
        syllabus.modules.forEach((mod) => {
            syllabus.lessonsByModule[mod.id].forEach((lesson) => lessons.push(lesson));
        });
        return lessons;
    }

    function resolveHighestUnlockedLesson(syllabus, matrix) {
        if (typeof window.getHighestUnlockedLesson !== 'function') {
            const all = getAllLessonsFlat(syllabus);
            return all.length > 0 ? all[0].id : null;
        }

        try {
            // Requested invocation style in the task spec.
            const maybe = window.getHighestUnlockedLesson(window.syllabusData);
            if (typeof maybe === 'string' && maybe.length > 0) {
                return maybe;
            }
        } catch (_errSingleArg) {
            // Fall through to current mastery.js signature.
        }

        try {
            const maybe = window.getHighestUnlockedLesson(matrix, syllabus);
            if (typeof maybe === 'string' && maybe.length > 0) {
                return maybe;
            }
        } catch (_errTwoArgs) {
            // Fall through to deterministic fallback.
        }

        const all = getAllLessonsFlat(syllabus);
        return all.length > 0 ? all[0].id : null;
    }

    function findLessonById(lessonId, syllabus) {
        const all = getAllLessonsFlat(syllabus);
        return all.find((lesson) => lesson.id === lessonId) || null;
    }

    function setStageDots(currentStage) {
        for (let i = 1; i <= 4; i++) {
            const dot = els.dots[i];
            const wrap = els.dotContainers[i];
            if (!dot || !wrap) continue;

            dot.classList.remove('bg-slate-600', 'bg-emerald-400', 'bg-slate-300', 'bg-emerald-500', 'dark:bg-slate-600');
            wrap.classList.remove(
                'text-slate-400', 'text-slate-505', 'text-emerald-300', 'text-emerald-700', 'dark:text-emerald-300',
                'bg-slate-800', 'bg-slate-100', 'dark:bg-slate-800',
                'bg-emerald-900/30', 'bg-emerald-50', 'dark:bg-emerald-900/30',
                'border', 'border-emerald-500/20', 'border-emerald-200'
            );

            if (i <= currentStage) {
                dot.classList.add('bg-emerald-500');
                wrap.classList.add('text-emerald-700', 'dark:text-emerald-300', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'border', 'border-emerald-200', 'dark:border-emerald-500/20');
            } else {
                dot.classList.add('bg-slate-300', 'dark:bg-slate-600');
                wrap.classList.add('text-slate-505', 'dark:text-slate-400', 'bg-slate-100', 'dark:bg-slate-800');
            }
        }
    }

    function setModeUiForStage() {
        if (appState.stage === STAGE_LECTURE) {
            els.modeBadge.textContent = 'LECTURE';
            els.chatHeaderTitle.textContent = 'Socratic Clinical Interaction';
            els.inputInstructions.textContent = 'Start the Socratic flow to begin chat...';
        } else if (appState.stage === STAGE_SOCRATIC) {
            els.modeBadge.textContent = 'SOCRATIC CHECK';
            els.chatHeaderTitle.textContent = 'Socratic Clinical Interaction';
            els.inputInstructions.textContent = 'Respond to Socratic Question...';
        } else if (appState.stage === STAGE_SANDBOX) {
            els.modeBadge.textContent = 'SANDBOX HANDSHAKE';
            els.chatHeaderTitle.textContent = 'Socratic Clinical Interaction';
            els.inputInstructions.textContent = 'Complete the sandbox and return...';
        } else {
            els.modeBadge.textContent = 'FEYNMAN FINAL';
            els.chatHeaderTitle.textContent = 'Feynman Final Defense';
            els.inputInstructions.textContent = 'Teach it back clearly to pass theory mastery...';
        }
    }

    function showFlex(el) {
        if (!el) return;
        el.classList.remove('hidden');
        el.classList.add('flex');
    }

    function hideFlex(el) {
        if (!el) return;
        el.classList.add('hidden');
        el.classList.remove('flex');
    }

    function escapeHtml(value) {
        const str = String(value || '');
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function scrollChatToBottom() {
        els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    }

    function addMessage(role, text) {
        const isUser = role === 'user';
        const bubbleClass = isUser
            ? 'bg-emerald-55 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-100 self-end font-medium'
            : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 self-start';

        const roleLabel = isUser ? 'You' : 'Clinical Tutor';

        const row = document.createElement('div');
        row.className = `max-w-[85%] rounded-lg px-3 py-2 text-sm ${bubbleClass}`;
        row.innerHTML = `
            <div class="text-[10px] uppercase tracking-wider font-bold mb-1 ${isUser ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-505 dark:text-slate-400'}">${roleLabel}</div>
            <div class="leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</div>
        `;

        els.chatMessages.appendChild(row);
        scrollChatToBottom();
    }

    function addTypingIndicator() {
        const row = document.createElement('div');
        row.id = 'typing-indicator';
        row.className = 'max-w-[60%] rounded-lg px-3 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 self-start';
        row.innerHTML = `
            <div class="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-405 dark:text-slate-500">Clinical Tutor</div>
            <div class="flex items-center space-x-2 text-xs text-slate-505 dark:text-slate-400">
                <i class="fa-solid fa-circle-notch animate-spin"></i>
                <span>Analyzing your response...</span>
            </div>
        `;
        els.chatMessages.appendChild(row);
        scrollChatToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function setSessionStatus(label, isGood) {
        if (!els.sessionStatus) return;
        els.sessionStatus.textContent = label;
        els.sessionStatus.classList.remove('text-slate-300', 'text-emerald-500', 'text-amber-500');
        els.sessionStatus.classList.add(isGood ? 'text-emerald-500' : 'text-amber-500');
    }

    function generateOfflineMockLecture(lesson) {
        return `### Clinical Lecture: ${lesson.concept}

In clinical medicine, understanding **${lesson.concept}** is essential for patient care and safety. This topic directly relates to our clinical practice, particularly: *${lesson.clinical_tie_in}*.

#### Key Principles
1. **Biological and Physical Foundations:** The molecular and physical structures governed by these chemistry rules dictate how physiological systems behave.
2. **Clinical Significance:** Accurate measurement and conceptual application prevent diagnostic errors and dosage mistakes.
3. **Equipment and Targets:** We use specific diagnostic tools like \`${lesson.interactive_target}\` to observe and quantify these states in a lab environment.

#### Patient Communication
When explaining these chemistry foundations to patients (as in the Feynman defense: *"${lesson.feynman_prompt}"*), always use accessible analogies. Breaking down complex atomic or molecular reactions into everyday phenomena helps patients understand their treatment and reduces anxiety.`;
    }

    function renderLectureContent(lesson, lectureText, isOfflineFallback = false) {
        let parsedLecture = '';
        try {
            parsedLecture = window.marked ? window.marked.parse(lectureText) : lectureText;
        } catch (err) {
            console.error('Failed to parse markdown:', err);
            parsedLecture = lectureText;
        }

        els.lectureContainer.innerHTML = `
            <div class="space-y-5">
                <div>
                    <div class="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-bold mb-1">Concept</div>
                    <h3 class="text-base font-bold text-slate-800 dark:text-white">${escapeHtml(lesson.concept)}</h3>
                </div>
                
                <div class="border border-emerald-500/20 bg-emerald-500/5 rounded p-3.5">
                    <div class="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">Clinical Hook</div>
                    <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">${escapeHtml(lesson.clinical_tie_in)}</p>
                </div>

                <div class="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Micro-Lecture</div>
                    ${isOfflineFallback ? `
                    <div class="mb-3 border border-amber-500/30 bg-amber-500/10 rounded p-2.5 text-[11px] text-amber-600 dark:text-amber-400">
                        Local Ollama is unavailable in this environment. Displaying an offline lecture fallback.
                    </div>
                    ` : ''}
                    <div class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 markdown-body">
                        ${parsedLecture}
                    </div>
                </div>

                <div class="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-3 flex justify-between items-center">
                    <span>Interactive target: <span class="text-slate-600 dark:text-slate-200 font-mono">${escapeHtml(lesson.interactive_target)}</span></span>
                    <span class="text-[10px] text-slate-400 font-mono">Length: ~${lectureText.split(/\s+/).length} words</span>
                </div>
            </div>
        `;
    }

    function renderGenerationFailure(lesson, errMsg) {
        els.lectureContainer.innerHTML = `
            <div class="flex flex-col h-full justify-center p-5 max-w-lg mx-auto space-y-4">
                <div class="flex items-center space-x-3 text-red-500 font-semibold text-sm">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Lecture Generation Failed</span>
                </div>
                
                <div class="bg-red-950/20 border border-red-500/30 rounded p-4 font-mono text-xs text-red-300 space-y-2">
                    <p class="font-bold">Error Details:</p>
                    <p class="text-red-200">${escapeHtml(errMsg)}</p>
                    <p class="text-[10px] text-slate-400 mt-2">Make sure Ollama is running locally (http://localhost:11434) and you have the model installed.</p>
                </div>
                
                <div class="flex space-x-3">
                    <button id="btn-retry-generation" class="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 px-4 rounded transition uppercase tracking-wider">
                        <i class="fa-solid fa-arrows-rotate mr-1"></i> Retry
                    </button>
                    <button id="btn-use-mock-lecture" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 px-4 rounded transition border border-slate-700 uppercase tracking-wider">
                        <i class="fa-solid fa-file-invoice mr-1"></i> Offline Fallback
                    </button>
                </div>
            </div>
        `;

        document.getElementById('btn-retry-generation').addEventListener('click', () => {
            generateLecture(lesson);
        });

        document.getElementById('btn-use-mock-lecture').addEventListener('click', () => {
            const mockText = generateOfflineMockLecture(lesson);
            localStorage.setItem(`chemistry_lesson_lecture_${lesson.id}`, mockText);
            renderLectureContent(lesson, mockText);
        });
    }

    async function generateLecture(lesson) {
        els.lectureContainer.innerHTML = `
            <div class="flex flex-col h-full justify-center p-4 max-w-lg mx-auto space-y-3">
                <div class="flex items-center space-x-3 text-amber-500 dark:text-amber-400 font-semibold text-xs">
                    <i class="fa-solid fa-gears animate-spin"></i>
                    <span>Generating Lecture via Gemma 4...</span>
                </div>
                
                <div class="bg-slate-900 border border-slate-800 rounded p-3 font-mono text-[10px] text-slate-300 space-y-2 shadow-inner">
                    <div id="step-connect" class="flex items-center justify-between text-slate-500">
                        <span>[1/4] Connecting to Ollama endpoint...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                    <div id="step-model" class="flex items-center justify-between text-slate-500">
                        <span>[2/4] Verifying model availability...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                    <div id="step-generate" class="flex items-center justify-between text-slate-500">
                        <span>[3/4] Requesting 300-word micro-lecture...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                    <div id="step-render" class="flex items-center justify-between text-slate-500">
                        <span>[4/4] Parsing and rendering output...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                </div>
                
                <div id="generation-log" class="text-[9px] text-slate-550 dark:text-slate-400 h-6 truncate font-mono text-center">
                    Initializing generation handshake...
                </div>
            </div>
        `;

        const logEl = document.getElementById('generation-log');
        const updateStepUI = (stepId, status, text) => {
            const stepEl = document.getElementById(`step-${stepId}`);
            if (!stepEl) return;
            const statusEl = stepEl.querySelector('.status');
            
            stepEl.classList.remove('text-slate-500', 'text-amber-400', 'text-emerald-400', 'text-red-400');
            
            if (status === 'running') {
                stepEl.classList.add('text-amber-400');
                statusEl.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin"></i> RUNNING';
            } else if (status === 'success') {
                stepEl.classList.add('text-emerald-400');
                statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> DONE';
            } else if (status === 'warning') {
                stepEl.classList.add('text-amber-400');
                statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> WARN';
            } else if (status === 'error') {
                stepEl.classList.add('text-red-400');
                statusEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> FAIL';
            }
            
            if (text && logEl) {
                logEl.textContent = text;
            }
        };

        const tutor = window.CLINICAL_TUTOR;
        if (!tutor || typeof tutor.fetchGeneratedLesson !== 'function') {
            renderGenerationFailure(lesson, 'CLINICAL_TUTOR module or fetchGeneratedLesson is unavailable.');
            return;
        }

        try {
            const lectureText = await tutor.fetchGeneratedLesson(lesson, (step, status, details) => {
                updateStepUI(step, status, details);
            });

            if (!lectureText) {
                throw new Error('Received empty lecture text output from tutor module.');
            }

            localStorage.setItem(`chemistry_lesson_lecture_${lesson.id}`, lectureText);
            updateStepUI('render', 'success', 'Lecture formatted.');
            
            setTimeout(() => {
                renderLectureContent(lesson, lectureText);
            }, 600);

        } catch (err) {
            console.error('Lecture generation failed:', err);
            const mockText = generateOfflineMockLecture(lesson);
            localStorage.setItem(`chemistry_lesson_lecture_${lesson.id}`, mockText);
            updateStepUI('generate', 'warning', err && err.message ? err.message : 'Generation failed, switching to offline lecture.');
            updateStepUI('render', 'success', 'Offline lecture fallback loaded.');
            setTimeout(() => {
                renderLectureContent(lesson, mockText, true);
            }, 400);
        }
    }

    async function ensureLectureContent() {
        const { lesson } = appState;
        if (!lesson) return;

        const cacheKey = `chemistry_lesson_lecture_${lesson.id}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            renderLectureContent(lesson, cached);
            return;
        }

        if (lectureGenerationInFlight.has(lesson.id)) {
            await lectureGenerationInFlight.get(lesson.id);
            return;
        }

        const generationPromise = generateLecture(lesson)
            .finally(() => {
                lectureGenerationInFlight.delete(lesson.id);
            });

        lectureGenerationInFlight.set(lesson.id, generationPromise);
        await generationPromise;
    }

    function renderStage1() {
        appState.stage = STAGE_LECTURE;
        appState.isChatLocked = false;

        setStageDots(STAGE_LECTURE);
        setModeUiForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        hideFlex(els.feynmanSpeechControls);
        els.btnMic.classList.add('hidden');
        els.btnSend.classList.remove('hidden');
        els.chatInput.disabled = true;
        els.chatForm.dataset.mode = 'lecture';

        ensureLectureContent();

        els.chatMessages.innerHTML = `
            <div class="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300">
                <div class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Stage 1 Complete?</div>
                <p class="mb-3">When you are ready, begin your Socratic checkpoint.</p>
                <button id="btn-start-socratic" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs uppercase tracking-wider transition">
                    Start Socratic Interaction
                </button>
            </div>
        `;

        const startBtn = document.getElementById('btn-start-socratic');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (appState.messageHistory.length === 0) {
                    const seedQuestion = `Socratic Check: Explain "${appState.lesson.concept}" and connect it to this clinical tie-in: ${appState.lesson.clinical_tie_in}`;
                    appState.messageHistory.push({ role: 'assistant', content: seedQuestion });
                }
                renderStage2();
                saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
            });
        }
    }

    function renderHistoryToUi() {
        els.chatMessages.innerHTML = '';
        appState.messageHistory.forEach((msg) => {
            addMessage(msg.role, msg.content);
        });
    }

    function renderStage2() {
        appState.stage = STAGE_SOCRATIC;
        appState.isChatLocked = false;

        setStageDots(STAGE_SOCRATIC);
        setModeUiForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        hideFlex(els.feynmanSpeechControls);
        els.btnMic.classList.add('hidden');
        els.btnSend.classList.remove('hidden');
        els.chatInput.disabled = false;
        els.chatInput.placeholder = 'Type clinical Socratic response here...';
        els.chatForm.dataset.mode = 'socratic';

        renderHistoryToUi();

        if (appState.messageHistory.length === 0) {
            const seedQuestion = `Socratic Check: Explain "${appState.lesson.concept}" and connect it to this clinical tie-in: ${appState.lesson.clinical_tie_in}`;
            appState.messageHistory.push({ role: 'assistant', content: seedQuestion });
            addMessage('assistant', seedQuestion);
        }

        scrollChatToBottom();
    }

    function getSandboxInstructions(target) {
        const friendlyTabs = {
            'nomenclature': 'Nomenclature Flashcards',
            'molar': 'Molar Mass Calculator',
            'dimensions': 'Dimensional Analysis Builder',
            'stoich': 'Reaction & Stoichiometry',
            'sigfigs': 'Significant Figures Math Trainer',
            'lab': 'Lab Precision Trainer',
            'dashboard': 'Skills Lab Dashboard'
        };

        const targetDescriptions = {
            'temperature-converter': 'perform a unit conversion in the Dimensional Analysis tab to test temperature conversions.',
            'meniscus-reader-simulator': 'select an instrument like a Graduated Cylinder in the Lab Precision tab and submit a correct meniscus reading.',
            'notation-slider': 'perform a metric unit conversion factor in the Dimensional Analysis tab to test scaling powers.',
            'sig-fig-calculator': 'generate a math problem in the Significant Figures tab and input the correct rounded answer.',
            'dimensional-analysis-sandbox': 'set up a multi-step unit conversion chain (e.g. kg to g to mg) in the Dimensional Analysis Builder and verify it.',
            'density-visualizer': 'calculate a conversion involving metric density units (g/mL) in the Dimensional Analysis tab.',
            'specific-heat-grapher': 'select a glassware instrument and practice scale precision reading in the Lab Precision tab.',
            'atom-builder': 'select the Analytical Balance in the Lab Precision tab and successfully submit a reading.',
            'electron-jump-animator': 'select the Burette in the Lab Precision tab and read the scale level carefully.',
            'periodic-table-explorer': 'study naming rules and flip a card in the Nomenclature Flashcards tab.',
            'ion-charge-calculator': 'review polyatomic ion charges in the Nomenclature Flashcards tab.',
            'half-life-grapher': 'practice reading lab instrument scales in the Lab Precision tab.',
            'shielding-simulator': 'practice reading instrument scales at different levels in the Lab Precision tab.',
            'electronegativity-scale': 'practice covalent compound naming card groups in the Nomenclature tab.',
            'criss-cross-sandbox': 'balance a chemical equation successfully in the Reaction & Stoichiometry tab.',
            'polarity-visualizer': 'practice covalent compound flashcards in the Nomenclature tab.',
            'vsepr-3d-viewer': 'study molecular names and geometry naming rules in the Nomenclature tab.',
            'dna-imf-zipper': 'review polyatomic naming rules in the Nomenclature tab.',
            'nomenclature-builder': 'study chemical names and rate a nomenclature flashcard as Good or Easy.',
            'mole-visualizer': 'calculate the molar mass of a molecule (e.g., CO2 or H2O) in the Molar Mass tab.',
            'gram-to-mole-grader': 'complete a step-by-step molar mass calculation in the Molar Mass tab.',
            'equation-seesaw': 'load a reaction and balance it correctly in the Reaction & Stoichiometry tab.',
            'solubility-precipitate-sandbox': 'load a precipitation reaction and balance its coefficients in the Reaction & Stoichiometry tab.',
            'recipe-ratio-tool': 'solve a stoichiometry math problem yield in the Reaction & Stoichiometry tab.',
            'stoichiometry-grader': 'calculate the correct theoretical yield for a balanced equation in the Reaction & Stoichiometry tab.',
            'limiting-reactant-sandbox': 'balance an equation and solve its limiting reactant yield problem in the Reaction & Stoichiometry tab.',
            'boyles-law-syringe': 'select the 10 mL Graduated Cylinder and read its meniscus level in the Lab Precision tab.',
            'osmosis-cell-simulator': 'practice reading analytical balance measurements in the Lab Precision tab.',
            'dilution-calculator': 'read the meniscus level of a 50 mL Graduated Cylinder in the Lab Precision tab.',
            'activation-energy-graph': 'load a reaction and check the balanced counts in the Reaction & Stoichiometry tab.',
            'le-chatelier-seesaw': 'balance a reversible reaction seesaw in the Reaction & Stoichiometry tab.',
            'ph-buffer-visualizer': 'select the Lab Thermometer and read its temperature scale in the Lab Precision tab.',
            'carbon-chain-builder': 'select the Organic Category and practice naming cards in the Nomenclature tab.',
            'macromolecule-sorter': 'review organic compound chains in the Nomenclature Flashcards.',
            'free-radical-visualizer': 'practice balancing a decomposition reaction in the Reaction & Stoichiometry tab.',
            'radiation-dna-damage-sim': 'balance any reaction and solve its stoichiometry yield in the Reaction & Stoichiometry tab.'
        };

        const tab = getTabForTarget(target);
        const tabName = friendlyTabs[tab] || 'Skills Lab';
        const action = targetDescriptions[target] || 'interact with the calculations and submit a correct solution.';

        return { tab, tabName, action };
    }

    function getTabForTarget(target) {
        if (!target) return 'dashboard';
        const t = target.toLowerCase();
        if (t.includes('nomenclature') || t.includes('naming')) return 'nomenclature';
        if (t.includes('mole-visualizer') || t.includes('gram-to-mole') || t.includes('molar-mass') || t.includes('mole-concept')) return 'molar';
        if (t.includes('dimensional-analysis') || t.includes('dimensions') || t.includes('density') || t.includes('specific-heat') || t.includes('notation-slider') || t.includes('temperature-converter')) return 'dimensions';
        if (t.includes('stoichiometry') || t.includes('stoich') || t.includes('reactant') || t.includes('equation') || t.includes('ratio') || t.includes('solubility') || t.includes('le-chatelier') || t.includes('equilibrium')) return 'stoich';
        if (t.includes('sig-fig') || t.includes('sigfig')) return 'sigfigs';
        if (t.includes('meniscus') || t.includes('precision') || t.includes('shielding') || t.includes('half-life') || t.includes('diffusion') || t.includes('osmosis') || t.includes('dilution') || t.includes('activation-energy') || t.includes('buffer') || t.includes('ph-')) return 'lab';
        if (t.includes('atom-builder') || t.includes('electron-jump') || t.includes('periodic-table') || t.includes('ion-charge') || t.includes('electronegativity') || t.includes('polarity') || t.includes('vsepr') || t.includes('dna-') || t.includes('carbon-chain') || t.includes('macromolecule') || t.includes('free-radical') || t.includes('radiation-dna')) return 'lab';
        return 'dashboard';
    }

    function renderStage3() {
        appState.stage = STAGE_SANDBOX;
        appState.isChatLocked = false;

        setStageDots(STAGE_SANDBOX);
        setModeUiForStage();

        els.chatInput.disabled = true;
        els.chatForm.dataset.mode = 'sandbox';
        hideFlex(els.feynmanSpeechControls);
        els.btnMic.classList.add('hidden');
        els.btnSend.classList.remove('hidden');
        showFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);

        const target = appState.lesson.interactive_target || '';
        const { tabName, action } = getSandboxInstructions(target);
        
        if (els.sandboxInstructions) {
            els.sandboxInstructions.innerHTML = `To pass Stage 3, click the button below to open the specific master interactive tool in a separate tab. Test the calculations, then return here.<br><br><span class="font-bold text-blue-600 dark:text-blue-400">Your Task:</span> Open the <strong>${escapeHtml(tabName)}</strong> and <strong>${escapeHtml(action)}</strong> Once you succeed, this page will automatically unlock!`;
        }

        els.sandboxLink.setAttribute('href', `index.html?lessonId=${encodeURIComponent(appState.lessonId)}&target=${encodeURIComponent(target)}`);

        // Seed Socratic chat history if not already seeded for Stage 3
        const checkText = `Stage 3 Handshake: Practice in the ${tabName}.`;
        const hasInstructionsMsg = appState.messageHistory.some(m => m.content && m.content.includes('interactive sandbox task'));
        
        if (!hasInstructionsMsg) {
            const seedMessage = `Great progress! I have unlocked the interactive sandbox task for this lesson. Open the **${tabName}** tool and **${action}** Once you succeed, this page will automatically detect completion and unlock Stage 4.`;
            appState.messageHistory.push({ role: 'assistant', content: seedMessage });
            addMessage('assistant', seedMessage);
        }
        
        saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);

        const existing = localStorage.getItem(`sandbox_complete_${appState.lessonId}`);
        if (existing === 'true') {
            advanceToStage4FromSandbox();
        }
    }

    function setupSpeechRecognition() {
        const Api = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Api) {
            return;
        }

        const recognition = new Api();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            els.speechIndicator.classList.remove('hidden');
            els.speechIndicator.classList.add('flex');
        };

        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript || '';
            els.chatInput.value = transcript;
            els.chatInput.focus();
        };

        recognition.onend = () => {
            els.speechIndicator.classList.remove('flex');
            els.speechIndicator.classList.add('hidden');
        };

        recognition.onerror = () => {
            els.speechIndicator.classList.remove('flex');
            els.speechIndicator.classList.add('hidden');
        };

        appState.recognition = recognition;
    }

    function applyInputMode() {
        if (appState.useSpeechInput) {
            els.btnMic.classList.remove('hidden');
            els.btnSend.classList.add('hidden');
            els.toggleInputText.textContent = 'Switch to Keyboard Submit';
            els.chatInput.placeholder = 'Use mic or edit text before submit...';
        } else {
            els.btnMic.classList.add('hidden');
            els.btnSend.classList.remove('hidden');
            els.toggleInputText.textContent = 'Switch to Speech API';
            els.chatInput.placeholder = 'Type your Feynman explanation...';
        }
    }

    function renderStage4() {
        appState.stage = STAGE_FEYNMAN;
        appState.isChatLocked = false;
        appState.useSpeechInput = false;

        setStageDots(STAGE_FEYNMAN);
        setModeUiForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        showFlex(els.feynmanSpeechControls);
        els.chatInput.disabled = false;
        els.chatForm.dataset.mode = 'feynman';

        setupSpeechRecognition();
        applyInputMode();

        const feynmanPromptText = `Feynman Final: ${appState.lesson.feynman_prompt}`;
        const hasPrompt = appState.messageHistory.some(m => m.content && m.content.includes('Feynman Final:'));
        if (!hasPrompt) {
            appState.messageHistory.push({ role: 'assistant', content: feynmanPromptText });
            addMessage('assistant', feynmanPromptText);
        }
        saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
    }

    function lockChatAndShowCta() {
        appState.isChatLocked = true;
        els.chatInput.disabled = true;
        els.btnSend.disabled = true;
        els.btnMic.disabled = true;
        showFlex(els.masterCtaOverlay);
        setSessionStatus('MASTERED', true);
    }

    function advanceToStage4FromSandbox() {
        hideFlex(els.sandboxHandshake);
        renderStage4();
    }

    async function handleTutorEvaluation(userInput) {
        const { mode } = els.chatForm.dataset;

        let systemPrompt = '';
        if (mode === 'feynman') {
            systemPrompt = [
                'You are a strict clinical chemistry evaluator for Radiology/Dosimetry learners.',
                'Use the Feynman prompt below to grade the explanation for clarity, correctness, and patient-safe reasoning.',
                `Feynman Prompt: ${appState.lesson.feynman_prompt}`,
                'Pass only when explanation is accurate and teachable to a patient.'
            ].join(' ');
        } else {
            systemPrompt = [
                'You are a Socratic clinical chemistry tutor for allied health students.',
                `Concept: ${appState.lesson.concept}.`,
                `Clinical Tie-In: ${appState.lesson.clinical_tie_in}.`,
                'Ask or respond in a way that tests conceptual understanding and patient safety judgment.'
            ].join(' ');
        }

        const tutor = window.CLINICAL_TUTOR;
        if (!tutor || typeof tutor.fetchLocalTutor !== 'function') {
            return {
                passed: false,
                feedback: 'Error: Clinical Link interrupted. Please try again or click Regenerate.',
                nextStage: null
            };
        }

        return tutor.fetchLocalTutor(systemPrompt, appState.messageHistory, userInput);
    }

    async function onChatSubmit(event) {
        event.preventDefault();

        if (appState.isChatLocked) {
            return;
        }

        const { mode } = els.chatForm.dataset;
        if (mode !== 'socratic' && mode !== 'feynman') {
            return;
        }

        const userInput = (els.chatInput.value || '').trim();
        if (!userInput) return;

        els.chatInput.value = '';
        addMessage('user', userInput);
        appState.messageHistory.push({ role: 'user', content: userInput });

        addTypingIndicator();

        const aiResult = await handleTutorEvaluation(userInput);

        removeTypingIndicator();
        addMessage('assistant', aiResult.feedback || 'No feedback provided.');
        appState.messageHistory.push({ role: 'assistant', content: aiResult.feedback || '' });

        saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);

        if (mode === 'socratic' && aiResult.passed === true) {
            renderStage3();
        }

        if (mode === 'feynman' && aiResult.passed === true) {
            updateLessonState(appState.lessonId, 2);
            localStorage.removeItem(`sandbox_complete_${appState.lessonId}`);
            saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
            lockChatAndShowCta();

            appState.matrix = getMatrix();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, appState.matrix);
            }
        }
    }

    function clearConversationUi() {
        els.chatMessages.innerHTML = '';
        appState.messageHistory = [];
        appState.isChatLocked = false;
        els.btnSend.disabled = false;
        els.btnMic.disabled = false;
    }

    function populateLessonHeaderAndLecture() {
        els.activeLessonTitle.textContent = `Lesson ${appState.lesson.numStr}: ${appState.lesson.title}`;
        ensureLectureContent();
    }

    function restoreOrStartStage() {
        const session = typeof window.getSessionState === 'function' ? window.getSessionState() : null;

        if (session && session.lessonId === appState.lessonId) {
            appState.messageHistory = Array.isArray(session.messageHistory) ? session.messageHistory : [];
            const restoredStage = Number(session.stageState) || STAGE_LECTURE;

            if (restoredStage === STAGE_SOCRATIC) {
                renderStage2();
            } else if (restoredStage === STAGE_SANDBOX) {
                renderHistoryToUi();
                renderStage3();
            } else if (restoredStage === STAGE_FEYNMAN) {
                renderHistoryToUi();
                renderStage4();
            } else {
                renderStage1();
            }

            setSessionStatus('RESTORED', true);
            return;
        }

        clearConversationUi();
        renderStage1();
        saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
        setSessionStatus('STABLE', true);
    }

    function selectLessonAndLoad(lessonId) {
        const lesson = findLessonById(lessonId, appState.syllabus);
        if (!lesson) return;

        appState.lessonId = lessonId;
        appState.lesson = lesson;

        clearConversationUi();
        hideFlex(els.masterCtaOverlay);
        hideFlex(els.sandboxHandshake);
        populateLessonHeaderAndLecture();
        restoreOrStartStage();

        if (typeof window.renderSidebar === 'function') {
            window.renderSidebar(appState.syllabus, getMatrix());
        }
    }

    function bindEvents() {
        els.chatForm.addEventListener('submit', onChatSubmit);

        // Dark Mode Toggle
        const btnDarkMode = document.getElementById('btn-darkmode');
        if (btnDarkMode) {
            const updateDarkModeUi = () => {
                const isDark = document.documentElement.classList.contains('dark');
                const icon = btnDarkMode.querySelector('i');
                if (icon) {
                    if (isDark) {
                        icon.className = 'fa-solid fa-sun';
                        btnDarkMode.title = 'Toggle Light Mode';
                    } else {
                        icon.className = 'fa-solid fa-moon';
                        btnDarkMode.title = 'Toggle Dark Mode';
                    }
                }
            };
            updateDarkModeUi();
            btnDarkMode.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDarkNow = document.documentElement.classList.contains('dark');
                localStorage.setItem('chemistry_darkmode', String(isDarkNow));
                updateDarkModeUi();
            });
        }

        els.btnMic.addEventListener('click', () => {
            if (!appState.recognition) {
                addMessage('assistant', 'Speech API unavailable in this browser. Please use keyboard mode.');
                appState.useSpeechInput = false;
                applyInputMode();
                return;
            }

            try {
                appState.recognition.start();
            } catch (_err) {
                // Ignore repeated start edge case.
            }
        });

        els.btnToggleInputMode.addEventListener('click', () => {
            appState.useSpeechInput = !appState.useSpeechInput;
            applyInputMode();
        });

        els.btnRegenerate.addEventListener('click', () => {
            const ok = window.confirm('Regenerate this lesson? This clears the active session conversation and restarts Stage 1.');
            if (!ok) return;

            localStorage.removeItem(`chemistry_lesson_lecture_${appState.lessonId}`);
            localStorage.removeItem(`sandbox_complete_${appState.lessonId}`);
            sessionStorage.removeItem('activeLessonState');
            appState.messageHistory = [];
            appState.stage = STAGE_LECTURE;
            appState.isChatLocked = false;

            clearConversationUi();
            renderStage1();
            saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
            setSessionStatus('REGENERATED', false);
        });

        if (els.btnRestartLesson) {
            els.btnRestartLesson.addEventListener('click', () => {
                const ok = window.confirm('Restart this lesson? This will reset your progress to Stage 1 and clear the tutor conversation history, but keeps the generated lecture.');
                if (!ok) return;

                localStorage.removeItem(`sandbox_complete_${appState.lessonId}`);
                sessionStorage.removeItem('activeLessonState');
                appState.messageHistory = [];
                appState.stage = STAGE_LECTURE;
                appState.isChatLocked = false;

                clearConversationUi();
                renderStage1();
                saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
                setSessionStatus('RESTARTED', false);
            });
        }

        window.addEventListener('storage', (event) => {
            if (!event.key || event.newValue !== 'true') return;
            const expectedKey = `sandbox_complete_${appState.lessonId}`;
            if (event.key === expectedKey && appState.stage === STAGE_SANDBOX) {
                advanceToStage4FromSandbox();
            }
        });

        window.addEventListener('masteryMatrixChanged', () => {
            appState.matrix = getMatrix();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, appState.matrix);
            }
        });
    }

    async function loadActiveLesson() {
        await ensureSyllabusReady();

        appState.syllabus = window.syllabusData;
        appState.matrix = getMatrix();

        if (typeof window.initMasteryMatrix === 'function') {
            appState.matrix = window.initMasteryMatrix(appState.syllabus);
        }

        const session = typeof window.getSessionState === 'function' ? window.getSessionState() : null;
        let activeLessonId = null;
        if (session && session.lessonId) {
            const st = appState.matrix[session.lessonId] ? appState.matrix[session.lessonId].state : 0;
            if (st > 0) {
                activeLessonId = session.lessonId;
            }
        }

        if (!activeLessonId) {
            activeLessonId = resolveHighestUnlockedLesson(appState.syllabus, appState.matrix);
        }

        const lesson = findLessonById(activeLessonId, appState.syllabus);
        if (!lesson) {
            throw new Error('No active lesson available from syllabus/matrix');
        }

        appState.lessonId = activeLessonId;
        appState.lesson = lesson;

        populateLessonHeaderAndLecture();
        restoreOrStartStage();

        if (typeof window.renderSidebar === 'function') {
            window.renderSidebar(appState.syllabus, appState.matrix);
        }

        if (typeof window.updateGlobalProgress === 'function') {
            window.updateGlobalProgress(appState.matrix, appState.syllabus);
        }
    }

    function exposeGlobalSelectors() {
        window.selectLesson = function selectLesson(lessonId) {
            selectLessonAndLoad(lessonId);
        };
    }

    document.addEventListener('DOMContentLoaded', async () => {
        cacheDom();
        exposeGlobalSelectors();
        bindEvents();

        try {
            await loadActiveLesson();
        } catch (err) {
            console.error('Coursework initialization failed:', err);
            setSessionStatus('ERROR', false);
            els.chatMessages.innerHTML = `
                <div class="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-amber-300 text-sm">
                    Failed to initialize lesson workflow. Please refresh or click Regenerate.
                </div>
            `;
        }
    });
})();
