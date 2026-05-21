(function () {
    const PASS_PERCENT = 80;

    const STATE_LOCKED = 0;
    const STATE_ACTIVE = 1;
    const STATE_HW_PENDING = 2;
    const STATE_MASTERED = 3;
    const STATE_RUSTED = 4;

    const appState = {
        syllabus: null,
        matrix: {},
        selectedLessonId: null,
        selectedLesson: null,
        currentQuestions: [],
        needsReset: false
    };

    const els = {};

    const ASSIGNMENT_DB = {
        lesson_1_1: generateLesson1_1,
        lesson_1_2: generateLesson1_2,
        lesson_1_3: generateLesson1_3
    };

    function cacheDom() {
        els.assignmentList = document.getElementById('assignment-list');
        els.assignmentLessonId = document.getElementById('assignment-lesson-id');
        els.assignmentTitle = document.getElementById('assignment-title');
        els.assignmentDesc = document.getElementById('assignment-desc');
        els.assignmentType = document.getElementById('assignment-type');
        els.masteryGrade = document.getElementById('mastery-grade');
        els.masteryStatus = document.getElementById('mastery-status');
        els.workspace = document.getElementById('assignment-workspace');
        els.lockedScreen = document.getElementById('assignment-locked-screen');
        els.questionsGrid = document.getElementById('questions-grid');
        els.homeworkForm = document.getElementById('homework-form');
        els.btnReset = document.getElementById('btn-reset-problems');
        els.statusIndicator = document.getElementById('status-indicator');
        els.queueStatus = document.getElementById('queue-status');
    }

    function readMatrix() {
        try {
            return JSON.parse(localStorage.getItem('masteryMatrix') || '{}');
        } catch (_err) {
            return {};
        }
    }

    function getLessonState(lessonId) {
        const item = appState.matrix[lessonId];
        return item ? item.state : STATE_LOCKED;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomFloat(min, max, decimals) {
        const factor = Math.pow(10, decimals);
        const raw = Math.random() * (max - min) + min;
        return Math.round(raw * factor) / factor;
    }

    function findLessonById(lessonId) {
        if (!appState.syllabus) return null;
        for (let i = 0; i < appState.syllabus.modules.length; i++) {
            const mod = appState.syllabus.modules[i];
            const lessons = appState.syllabus.lessonsByModule[mod.id];
            for (let j = 0; j < lessons.length; j++) {
                if (lessons[j].id === lessonId) return lessons[j];
            }
        }
        return null;
    }

    function getAllLessonsFlat() {
        const all = [];
        appState.syllabus.modules.forEach((mod) => {
            appState.syllabus.lessonsByModule[mod.id].forEach((lesson) => all.push(lesson));
        });
        return all;
    }

    function resolveInitialLessonId() {
        const session = typeof window.getSessionState === 'function' ? window.getSessionState() : null;
        if (session && session.lessonId && findLessonById(session.lessonId)) {
            return session.lessonId;
        }

        if (typeof window.getHighestUnlockedLesson === 'function') {
            try {
                const maybe = window.getHighestUnlockedLesson(appState.matrix, appState.syllabus);
                if (maybe) return maybe;
            } catch (_err) {
                // fallback below
            }
        }

        const first = getAllLessonsFlat()[0];
        return first ? first.id : null;
    }

    function showStatus(message, tone) {
        const toneMap = {
            info: 'bg-blue-500/10 border-blue-500/25 text-blue-300',
            success: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
            warning: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
            danger: 'bg-red-500/10 border-red-500/25 text-red-300'
        };
        const cls = toneMap[tone] || toneMap.info;

        els.statusIndicator.innerHTML = `
            <div class="rounded border px-3 py-2 text-xs ${cls}">${message}</div>
        `;
    }

    function clearStatus() {
        els.statusIndicator.innerHTML = '';
    }

    function setWorkspaceLocked(isLocked) {
        if (isLocked) {
            els.workspace.classList.add('hidden');
            els.lockedScreen.classList.remove('hidden');
            els.queueStatus.textContent = 'LOCKED';
        } else {
            els.workspace.classList.remove('hidden');
            els.lockedScreen.classList.add('hidden');
            els.queueStatus.textContent = 'ACTIVE';
        }
    }

    function updateHeaderForLesson(lesson, state) {
        els.assignmentLessonId.textContent = `Lesson ${lesson.numStr}`;
        els.assignmentTitle.textContent = lesson.title;
        els.assignmentDesc.textContent = `Concept: ${lesson.concept} Clinical tie-in: ${lesson.clinical_tie_in}`;

        if (state === STATE_MASTERED) {
            els.assignmentType.textContent = 'Accredited Clinical Math';
        } else if (state === STATE_RUSTED) {
            els.assignmentType.textContent = 'Reaccreditation Required';
        } else {
            els.assignmentType.textContent = 'Procedural Clinical Math';
        }
    }

    function setGradeDisplay(percent, status, tone) {
        els.masteryGrade.textContent = `${percent}%`;
        els.masteryStatus.textContent = status;

        els.masteryStatus.classList.remove('text-slate-500', 'text-emerald-400', 'text-amber-400');
        if (tone === 'emerald') {
            els.masteryStatus.classList.add('text-emerald-400');
        } else if (tone === 'amber') {
            els.masteryStatus.classList.add('text-amber-400');
        } else {
            els.masteryStatus.classList.add('text-slate-500');
        }
    }

    function resetGradeDisplayForState(state) {
        if (state === STATE_MASTERED) {
            setGradeDisplay(100, 'ACCREDITED', 'emerald');
        } else {
            els.masteryGrade.textContent = '--%';
            els.masteryStatus.textContent = 'No Grade';
            els.masteryStatus.classList.remove('text-emerald-400', 'text-amber-400');
            els.masteryStatus.classList.add('text-slate-500');
        }
    }

    function generateLesson1_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);

            if (style === 1) {
                const f = randomInt(95, 109);
                const c = (f - 32) * (5 / 9);
                questions.push({
                    question: `Convert ${f} degF to degC (2 decimals).`,
                    correctAnswer: c,
                    tolerance: 0.01
                });
            } else if (style === 2) {
                const c = randomInt(35, 41);
                const k = c + 273.15;
                questions.push({
                    question: `Convert ${c} degC to Kelvin (2 decimals).`,
                    correctAnswer: k,
                    tolerance: 0.01
                });
            } else {
                const k = randomFloat(300, 315, 2);
                const c = k - 273.15;
                questions.push({
                    question: `Convert ${k.toFixed(2)} K to degC (2 decimals).`,
                    correctAnswer: c,
                    tolerance: 0.01
                });
            }
        }
        return questions;
    }

    function generateLesson1_2() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);

            if (style === 1) {
                const target = randomFloat(2, 20, 1);
                const measured = target + randomFloat(-1.5, 1.5, 1);
                const absError = Math.abs(measured - target);
                questions.push({
                    question: `A syringe target is ${target.toFixed(1)} mL and measured ${measured.toFixed(1)} mL. What is absolute error in mL?`,
                    correctAnswer: absError,
                    tolerance: 0.01
                });
            } else if (style === 2) {
                const trueVal = randomFloat(5, 50, 1);
                const measured = trueVal + randomFloat(-3, 3, 1);
                const pctError = Math.abs((measured - trueVal) / trueVal) * 100;
                questions.push({
                    question: `True value ${trueVal.toFixed(1)} mL, measured ${measured.toFixed(1)} mL. Percent error? (2 decimals)`,
                    correctAnswer: pctError,
                    tolerance: 0.05
                });
            } else {
                const readings = [
                    randomFloat(9, 11, 2),
                    randomFloat(9, 11, 2),
                    randomFloat(9, 11, 2)
                ];
                const mean = (readings[0] + readings[1] + readings[2]) / 3;
                questions.push({
                    question: `Three repeated volume reads are ${readings[0].toFixed(2)}, ${readings[1].toFixed(2)}, ${readings[2].toFixed(2)} mL. Mean? (2 decimals)`,
                    correctAnswer: mean,
                    tolerance: 0.01
                });
            }
        }
        return questions;
    }

    function generateLesson1_3() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);

            if (style === 1) {
                const mantissa = randomFloat(1.1, 9.9, 2);
                const exp = randomInt(2, 6);
                const value = mantissa * Math.pow(10, exp);
                questions.push({
                    question: `Convert ${mantissa.toFixed(2)} x 10^${exp} to standard notation.`,
                    correctAnswer: value,
                    tolerance: Math.max(0.01, Math.abs(value) * 0.0001)
                });
            } else if (style === 2) {
                const a = randomFloat(1.0, 9.0, 2);
                const b = randomFloat(1.0, 9.0, 2);
                const expA = randomInt(2, 5);
                const expB = randomInt(2, 5);
                const result = a * Math.pow(10, expA) * (b * Math.pow(10, expB));
                questions.push({
                    question: `Multiply (${a.toFixed(2)} x 10^${expA}) * (${b.toFixed(2)} x 10^${expB}). Give standard notation.`,
                    correctAnswer: result,
                    tolerance: Math.max(0.01, Math.abs(result) * 0.0001)
                });
            } else {
                const value = randomInt(1000, 950000);
                const exp = Math.floor(Math.log10(value));
                const normalized = value / Math.pow(10, exp);
                questions.push({
                    question: `Write ${value} in normalized scientific notation: enter mantissa only (for a x 10^b).`,
                    correctAnswer: normalized,
                    tolerance: 0.01
                });
            }
        }
        return questions;
    }

    function buildFallbackQuestions(lesson) {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const a = randomInt(2, 20);
            const b = randomInt(2, 20);
            questions.push({
                question: `[Fallback] ${lesson.title}: Solve ${a} * ${b}`,
                correctAnswer: a * b,
                tolerance: 0
            });
        }
        return questions;
    }

    function renderQuestions(questions) {
        els.questionsGrid.innerHTML = '';

        questions.forEach((q, index) => {
            const row = document.createElement('div');
            row.className = 'pt-4 first:pt-0';
            row.dataset.index = String(index);

            row.innerHTML = `
                <label class="block text-xs font-semibold text-slate-300 mb-2" for="answer_${index}">Q${index + 1}. ${q.question}</label>
                <input
                    id="answer_${index}"
                    name="answer_${index}"
                    type="number"
                    step="any"
                    class="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter numeric answer"
                    autocomplete="off"
                />
                <p class="mt-1 text-[11px] text-slate-500 hidden" id="feedback_${index}"></p>
            `;

            els.questionsGrid.appendChild(row);
        });
    }

    function isCorrect(userValue, correctAnswer, tolerance) {
        return Math.abs(userValue - correctAnswer) <= tolerance;
    }

    function gradeSubmission() {
        let correctCount = 0;

        appState.currentQuestions.forEach((q, index) => {
            const input = document.getElementById(`answer_${index}`);
            const feedback = document.getElementById(`feedback_${index}`);
            const raw = input.value;
            const value = Number(raw);

            input.classList.remove('border-emerald-500', 'border-red-500', 'bg-emerald-500/5', 'bg-red-500/5');
            feedback.classList.remove('hidden', 'text-emerald-400', 'text-red-400');

            if (raw.trim() !== '' && Number.isFinite(value) && isCorrect(value, q.correctAnswer, q.tolerance)) {
                correctCount += 1;
                input.classList.add('border-emerald-500', 'bg-emerald-500/5');
                feedback.classList.add('text-emerald-400');
                feedback.textContent = 'Correct';
            } else {
                input.classList.add('border-red-500', 'bg-red-500/5');
                feedback.classList.add('text-red-400');
                feedback.textContent = `Incorrect. Expected approx ${q.correctAnswer.toFixed(4)} +/- ${q.tolerance}`;
            }

            feedback.classList.remove('hidden');
        });

        return Math.round((correctCount / appState.currentQuestions.length) * 100);
    }

    function regenerateProblemSet() {
        const generator = ASSIGNMENT_DB[appState.selectedLessonId];
        appState.currentQuestions = generator
            ? generator()
            : buildFallbackQuestions(appState.selectedLesson);

        appState.needsReset = false;
        clearStatus();
        renderQuestions(appState.currentQuestions);
        setGradeDisplay(0, 'PENDING', 'none');
    }

    function updateForLessonSelection(lessonId) {
        const lesson = findLessonById(lessonId);
        if (!lesson) return;

        appState.selectedLessonId = lessonId;
        appState.selectedLesson = lesson;
        appState.matrix = readMatrix();

        const state = getLessonState(lessonId);
        updateHeaderForLesson(lesson, state);
        resetGradeDisplayForState(state);

        if (typeof window.saveSessionState === 'function') {
            window.saveSessionState(lessonId, 0, []);
        }

        if (state < STATE_HW_PENDING) {
            setWorkspaceLocked(true);
            showStatus('Homework is locked for this lesson. Complete coursework through Stage 4 first.', 'warning');
        } else {
            setWorkspaceLocked(false);
            regenerateProblemSet();
            showStatus('Clinical workbook loaded. Submit when ready. Passing threshold: 80%.', 'info');
        }

        if (typeof window.renderSidebar === 'function') {
            window.renderSidebar(appState.syllabus, appState.matrix);
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        if (appState.needsReset) {
            showStatus('Reset Board is required after a failed attempt to generate a new 10-question set.', 'warning');
            return;
        }

        const score = gradeSubmission();

        if (score >= PASS_PERCENT) {
            setGradeDisplay(score, 'ACCREDITED', 'emerald');
            showStatus(`Passed with ${score}%. Lesson marked as Mastered.`, 'success');
            window.updateLessonState(appState.selectedLessonId, STATE_MASTERED);
            appState.matrix = readMatrix();

            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, appState.matrix);
            }

            if (typeof window.updateGlobalProgress === 'function') {
                window.updateGlobalProgress(appState.matrix, appState.syllabus);
            }
        } else {
            setGradeDisplay(score, 'FAILED', 'amber');
            showStatus(`Scored ${score}%. Minimum required is ${PASS_PERCENT}%. Click Reset Board for a new worksheet.`, 'warning');
            appState.needsReset = true;
        }
    }

    function handleReset() {
        if (!appState.selectedLessonId) return;
        regenerateProblemSet();
        showStatus('New 10-question set generated. Previous attempt cleared.', 'info');
    }

    function bindEvents() {
        els.homeworkForm.addEventListener('submit', handleFormSubmit);
        els.btnReset.addEventListener('click', handleReset);

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

        window.addEventListener('masteryMatrixChanged', () => {
            appState.matrix = readMatrix();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, appState.matrix);
            }
        });
    }

    async function ensureSyllabus() {
        if (window.syllabusData) {
            appState.syllabus = window.syllabusData;
            return;
        }

        if (typeof window.loadSyllabus === 'function') {
            appState.syllabus = await window.loadSyllabus();
            return;
        }

        throw new Error('Unable to load syllabus data');
    }

    async function init() {
        cacheDom();
        await ensureSyllabus();

        appState.matrix = readMatrix();
        if (typeof window.initMasteryMatrix === 'function') {
            appState.matrix = window.initMasteryMatrix(appState.syllabus);
        }

        if (typeof window.renderSidebar === 'function') {
            window.renderSidebar(appState.syllabus, appState.matrix);
        }

        if (typeof window.updateGlobalProgress === 'function') {
            window.updateGlobalProgress(appState.matrix, appState.syllabus);
        }

        bindEvents();

        const initialLessonId = resolveInitialLessonId();
        if (!initialLessonId) {
            showStatus('No lessons available in syllabus.', 'danger');
            return;
        }

        updateForLessonSelection(initialLessonId);
    }

    window.selectAssignment = function selectAssignment(lessonId) {
        updateForLessonSelection(lessonId);
    };

    window.ASSIGNMENT_DB = ASSIGNMENT_DB;

    document.addEventListener('DOMContentLoaded', () => {
        init().catch((err) => {
            console.error('Assignments initialization failed:', err);
            showStatus('Failed to initialize assignments module. Refresh and try again.', 'danger');
        });
    });
})();
