(function () {
    const STAGE_LECTURE = 1;
    const STAGE_SOCRATIC = 2;
    const STAGE_SANDBOX = 3;
    const STAGE_FEYNMAN = 4;
    const SOCRATIC_CTA_SEEN_KEY = 'chemistry_socratic_cta_seen_v1';

    const appState = {
        lessonId: null,
        lesson: null,
        stage: STAGE_LECTURE,
        messageHistory: [],
        isChatLocked: false,
        useSpeechInput: false,
        recognition: null,
        syllabus: null,
        matrix: {},
        lectures: [],
        activeLectureIdx: 0,
        isGeneratingLecture: false,
        socraticCollapsed: true,
        socraticManualPreference: null,
        socraticPrimaryInView: true,
        socraticViewportRaf: null
    };

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
        els.btnGenerateQuestion = document.getElementById('btn-generate-question');
        els.selectActiveLecture = document.getElementById('select-active-lecture');
        els.btnAddLecture = document.getElementById('btn-add-lecture');
        els.btnRegenerateLecture = document.getElementById('btn-regenerate-lecture');
        els.workAreaSplit = document.getElementById('work-area-split');
        els.btnToggleSocratic = document.getElementById('btn-toggle-socratic');
        els.btnOpenSocratic = document.getElementById('btn-open-socratic');
        els.socraticCollapsedHint = document.getElementById('socratic-collapsed-hint');
        els.socraticCtaInline = document.getElementById('socratic-cta-inline');
        els.btnPrimarySocraticCta = document.getElementById('btn-primary-socratic-cta');

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
            els.chatHeaderTitle.textContent = 'Socratic Chemistry Interaction';
            els.inputInstructions.textContent = 'Start the Socratic flow to begin chat...';
            if (els.btnGenerateQuestion) els.btnGenerateQuestion.classList.add('hidden');
        } else if (appState.stage === STAGE_SOCRATIC) {
            els.modeBadge.textContent = 'SOCRATIC CHECK';
            els.chatHeaderTitle.textContent = 'Socratic Chemistry Interaction';
            els.inputInstructions.textContent = 'Respond to Socratic Question...';
            if (els.btnGenerateQuestion) els.btnGenerateQuestion.classList.remove('hidden');
        } else if (appState.stage === STAGE_SANDBOX) {
            els.modeBadge.textContent = 'SANDBOX HANDSHAKE';
            els.chatHeaderTitle.textContent = 'Socratic Chemistry Interaction';
            els.inputInstructions.textContent = 'Complete the sandbox and return...';
            if (els.btnGenerateQuestion) els.btnGenerateQuestion.classList.add('hidden');
        } else {
            els.modeBadge.textContent = 'FEYNMAN FINAL';
            els.chatHeaderTitle.textContent = 'Feynman Final Defense';
            els.inputInstructions.textContent = 'Teach it back clearly to pass theory mastery...';
            if (els.btnGenerateQuestion) els.btnGenerateQuestion.classList.remove('hidden');
        }
    }

    function updateSocraticLayoutUi() {
        const collapsed = !!appState.socraticCollapsed;
        const isLectureStage = appState.stage === STAGE_LECTURE;
        const activeSocratic = appState.stage !== STAGE_LECTURE && !collapsed;

        if (els.workAreaSplit) {
            els.workAreaSplit.classList.toggle('socratic-collapsed', collapsed);
            els.workAreaSplit.classList.toggle('layout-lecture', collapsed);
            els.workAreaSplit.classList.toggle('layout-split', !collapsed && appState.stage === STAGE_LECTURE);
            els.workAreaSplit.classList.toggle('layout-socratic-full', !collapsed && appState.stage !== STAGE_LECTURE);
            els.workAreaSplit.classList.toggle('active-socratic', activeSocratic);
        }

        if (els.btnToggleSocratic) {
            els.btnToggleSocratic.setAttribute('aria-expanded', String(!collapsed));
            els.btnToggleSocratic.innerHTML = collapsed
                ? `<i class="fa-solid fa-chevron-up text-[9px]"></i><span>${isLectureStage ? 'Preview Panel' : 'Expand Panel'}</span>`
                : `<i class="fa-solid fa-chevron-down text-[9px]"></i><span>${isLectureStage ? 'Hide Panel' : 'Collapse Panel'}</span>`;
        }

        if (els.btnOpenSocratic) {
            els.btnOpenSocratic.setAttribute('aria-expanded', String(!collapsed));
        }

        if (els.socraticCollapsedHint) {
            els.socraticCollapsedHint.classList.toggle('hidden', !collapsed);
        }

        updateSocraticCtaUi();
    }

    function markSocraticCtaSeen() {
        try {
            sessionStorage.setItem(SOCRATIC_CTA_SEEN_KEY, '1');
        } catch (_err) {
            // no-op
        }
    }

    function hasSeenSocraticCta() {
        try {
            return sessionStorage.getItem(SOCRATIC_CTA_SEEN_KEY) === '1';
        } catch (_err) {
            return false;
        }
    }

    function getElementViewportCoverage(el) {
        if (!el || typeof el.getBoundingClientRect !== 'function') return 0;

        const rect = el.getBoundingClientRect();
        const vpHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const vpWidth = window.innerWidth || document.documentElement.clientWidth || 0;

        if (rect.width <= 0 || rect.height <= 0 || vpHeight <= 0 || vpWidth <= 0) {
            return 0;
        }

        const visibleX = Math.max(0, Math.min(rect.right, vpWidth) - Math.max(rect.left, 0));
        const visibleY = Math.max(0, Math.min(rect.bottom, vpHeight) - Math.max(rect.top, 0));
        const visibleArea = visibleX * visibleY;
        const totalArea = rect.width * rect.height;

        if (totalArea <= 0) return 0;
        return visibleArea / totalArea;
    }

    function refreshSocraticPrimaryViewportState() {
        const showPrimaryCta = appState.stage === STAGE_LECTURE && appState.socraticCollapsed;
        if (!showPrimaryCta) {
            appState.socraticPrimaryInView = false;
        } else {
            const coverage = getElementViewportCoverage(els.socraticCtaInline);
            appState.socraticPrimaryInView = coverage >= 0.55;
        }

        if (els.workAreaSplit) {
            els.workAreaSplit.classList.toggle('socratic-primary-in-view', appState.socraticPrimaryInView);
        }
    }

    function scheduleSocraticPrimaryViewportStateRefresh() {
        if (appState.socraticViewportRaf !== null) return;

        appState.socraticViewportRaf = window.requestAnimationFrame(() => {
            appState.socraticViewportRaf = null;
            refreshSocraticPrimaryViewportState();
        });
    }

    function updateSocraticCtaUi() {
        const isLectureStage = appState.stage === STAGE_LECTURE;
        const showPrimaryCta = isLectureStage && appState.socraticCollapsed;

        if (els.socraticCtaInline) {
            els.socraticCtaInline.classList.toggle('hidden', !showPrimaryCta);
            els.socraticCtaInline.classList.toggle('flex', showPrimaryCta);
        }

        if (els.btnPrimarySocraticCta) {
            const shouldPulse = showPrimaryCta && !hasSeenSocraticCta();
            els.btnPrimarySocraticCta.classList.toggle('cta-attn', shouldPulse);
        }

        scheduleSocraticPrimaryViewportStateRefresh();

        if (els.btnOpenSocratic) {
            if (showPrimaryCta) {
                els.btnOpenSocratic.querySelector('span').textContent = 'Quick Start';
            } else if (isLectureStage) {
                els.btnOpenSocratic.querySelector('span').textContent = appState.socraticCollapsed
                    ? 'Open Socratic Panel'
                    : 'Hide Socratic Panel';
            } else {
                els.btnOpenSocratic.querySelector('span').textContent = appState.socraticCollapsed
                    ? 'Resume Socratic Panel'
                    : 'Collapse Socratic Panel';
            }
        }
    }

    function setSocraticCollapsed(collapsed, opts = {}) {
        appState.socraticCollapsed = !!collapsed;
        if (opts.manual === true) {
            appState.socraticManualPreference = appState.socraticCollapsed;
        }
        updateSocraticLayoutUi();
    }

    function syncWorkspaceLayoutForStage() {
        const isLectureStage = appState.stage === STAGE_LECTURE;
        let shouldCollapse = isLectureStage;

        if (isLectureStage && typeof appState.socraticManualPreference === 'boolean') {
            shouldCollapse = appState.socraticManualPreference;
        }

        setSocraticCollapsed(shouldCollapse, { manual: false });
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

    function ensureTypingIndicatorStyles() {
        const styleId = 'coursework-typing-indicator-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes cwTypingBounce {
                0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.45; }
                40% { transform: translateY(-3px) scale(1.08); opacity: 1; }
            }
            .cw-typing-indicator {
                contain: layout style;
            }
            .cw-typing-bubble {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border-radius: 999px;
                padding: 7px 11px;
                border: 1px solid rgba(100, 116, 139, 0.35);
                background: linear-gradient(180deg, rgba(241, 245, 249, 0.95), rgba(226, 232, 240, 0.9));
                box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
            }
            .dark .cw-typing-bubble {
                border-color: rgba(100, 116, 139, 0.55);
                background: linear-gradient(180deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
                box-shadow: 0 4px 14px rgba(2, 6, 23, 0.45);
            }
            .cw-typing-dots {
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .cw-typing-dot {
                width: 6px;
                height: 6px;
                border-radius: 999px;
                background: rgb(16, 185, 129);
                animation: cwTypingBounce 1s ease-in-out infinite;
            }
            .cw-typing-dot:nth-child(2) { animation-delay: 0.14s; }
            .cw-typing-dot:nth-child(3) { animation-delay: 0.28s; }
            .cw-typing-label {
                font-size: 11px;
                font-weight: 600;
                color: rgb(22, 101, 52);
                letter-spacing: 0.01em;
            }
            .dark .cw-typing-label {
                color: rgb(110, 231, 183);
            }
            @media (prefers-reduced-motion: reduce) {
                .cw-typing-dot {
                    animation: none;
                    opacity: 0.8;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function addMessage(role, text) {
        const isUser = role === 'user';
        const bubbleClass = isUser
            ? 'bg-emerald-55 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-100 self-end font-medium'
            : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 self-start';

        const roleLabel = isUser ? 'You' : 'Socratic Tutor';

        const row = document.createElement('div');
        row.className = `max-w-[85%] rounded-lg px-3 py-2 text-sm ${bubbleClass}`;

        let messageBody = '';
        if (isUser) {
            messageBody = `<div class="leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</div>`;
        } else {
            if (window.marked && typeof window.marked.parse === 'function') {
                try {
                    messageBody = `<div class="leading-relaxed markdown-body">${window.marked.parse(text)}</div>`;
                } catch (e) {
                    console.warn('Error parsing markdown for tutor message:', e);
                    messageBody = `<div class="leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</div>`;
                }
            } else {
                messageBody = `<div class="leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</div>`;
            }
        }

        row.innerHTML = `
            <div class="text-[10px] uppercase tracking-wider font-bold mb-1 ${isUser ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-505 dark:text-slate-400'}">${roleLabel}</div>
            ${messageBody}
        `;

        els.chatMessages.appendChild(row);
        scrollChatToBottom();
    }

    function addTypingIndicator() {
        ensureTypingIndicatorStyles();
        removeTypingIndicator();

        const row = document.createElement('div');
        row.className = 'max-w-[60%] self-start cw-typing-indicator';
        row.innerHTML = `
            <div class="cw-typing-bubble" role="status" aria-live="polite" aria-label="Socratic Tutor is typing">
                <span class="cw-typing-dots" aria-hidden="true">
                    <span class="cw-typing-dot"></span>
                    <span class="cw-typing-dot"></span>
                    <span class="cw-typing-dot"></span>
                </span>
                <span class="cw-typing-label">Socratic Tutor is typing</span>
            </div>
        `;
        els.chatMessages.appendChild(row);
        scrollChatToBottom();
    }

    function removeTypingIndicator() {
        const indicator = els.chatMessages.querySelector('.cw-typing-indicator');
        if (indicator) indicator.remove();
    }

    function setSessionStatus(label, isGood) {
        if (!els.sessionStatus) return;
        els.sessionStatus.textContent = label;
        els.sessionStatus.classList.remove('text-slate-300', 'text-emerald-500', 'text-amber-500');
        els.sessionStatus.classList.add(isGood ? 'text-emerald-500' : 'text-amber-500');
    }

    function isCurriculumBypassEnabledLocal() {
        if (typeof window.isCurriculumBypassEnabled === 'function') {
            return window.isCurriculumBypassEnabled();
        }
        return localStorage.getItem('chemistry_curriculum_bypass') === 'true';
    }

    function setCurriculumBypassEnabledLocal(enabled) {
        if (typeof window.setCurriculumBypassEnabled === 'function') {
            window.setCurriculumBypassEnabled(enabled);
            return;
        }
        localStorage.setItem('chemistry_curriculum_bypass', String(Boolean(enabled)));
        window.dispatchEvent(new CustomEvent('curriculumBypassChanged', { detail: { enabled: Boolean(enabled) } }));
    }

    function updateCurriculumBypassButtonUi() {
        const btn = document.getElementById('btn-curriculum-bypass');
        if (!btn) return;
        const enabled = isCurriculumBypassEnabledLocal();
        btn.setAttribute('aria-pressed', String(enabled));
        btn.title = enabled ? 'Disable bypass requirements' : 'Bypass lesson requirements (Explore Mode)';
        btn.classList.toggle('bg-violet-600', enabled);
        btn.classList.toggle('text-white', enabled);
        btn.classList.toggle('border-violet-600', enabled);
        btn.classList.toggle('dark:bg-violet-500', enabled);
        btn.classList.toggle('dark:text-white', enabled);
        btn.classList.toggle('dark:border-violet-400', enabled);
    }

    function generateOfflineMockLecture(lesson, variationIndex = 0) {
        const contexts = [
            {
                title: "Laboratory & Industrial Application",
                scenario: "In industrial chemical synthesis and research laboratories, precision and control are the foundations of successful experiments. When synthesizing a new compound or manufacturing materials at scale, chemists must manage reactant ratios, temperature control, and physical phase transitions. Precise measurements are not merely procedural; they ensure safety, maximize product yield, and prevent runaway reactions. Chemical analysis must relate molecular properties to macroscopic observations to optimize chemical processes from small-scale beakers to massive industrial reactors."
            },
            {
                title: "Environmental & Geological Systems",
                scenario: "Earth's systems are massive chemical reactors. From the regulation of atmospheric carbon dioxide to the salinity of our oceans and the mineral composition of rocks, environmental processes are governed by chemical equilibrium and thermodynamic laws. Environmental scientists analyze trace pollutants, monitor acid rain effects, and study how temperature changes alter gas solubility in aquatic ecosystems. Accurate chemical analysis is critical for assessing environmental health and predicting the long-term impact of human activities on our planet's ecosystems."
            },
            {
                title: "Consumer Chemistry & Everyday Life",
                scenario: "Chemistry is the hidden engine of our daily lives. The food we cook, the soaps and detergents we use to clean, and the batteries powering our electronic devices are all governed by chemical principles. For example, the carbonation in sodas relies on gas solubility under pressure, while household bleach utilizes oxidation-reduction reactions to remove stains and kill bacteria. Understanding the chemistry of everyday materials empowers consumers to make informed choices, handle household products safely, and appreciate the science behind daily activities."
            },
            {
                title: "Biological & Health Science Context",
                scenario: "Chemistry principles also power biological systems. Gas transport, fluid balance, and acid-base control all depend on equilibrium, concentration, and molecular interactions. Students planning health, life-science, or environmental pathways benefit from understanding how the same general chemistry equations used in industrial and academic labs also describe real physiological systems. This context is included as a bridge, while the core lesson content remains aligned with standard introductory chemistry curricula."
            },
            {
                title: "Advanced Engineering & High-Tech Materials",
                scenario: "Modern technology relies on the molecular tailoring of advanced materials. From the silicon wafers in computer microprocessors to the lightweight alloys in aerospace engineering and the development of nanomedicines, material science is chemistry in action. Engineers manipulate atomic structures, periodic trends, and chemical bonding to create substances with specific electrical, thermal, and mechanical properties. A deep understanding of chemical structures is essential for driving technological innovation and solving complex engineering challenges."
            }
        ];

        const ctx = contexts[variationIndex % contexts.length];
        const varSuffix = variationIndex > 0 ? `\n\n*(Note: This is offline Lecture Variation #${variationIndex + 1} focusing on the ${ctx.title} context.)*` : '';

        const sections = [
            `### Case Study & Real-World Scenario: ${ctx.title}${variationIndex > 0 ? ' (Variation #' + (variationIndex + 1) + ')' : ''}`,
            `${ctx.scenario}${varSuffix}`,
            `The real-world application of this lesson focuses on: *${lesson.clinical_tie_in}*. This demonstrates how the abstract concepts we study in the lecture hall manifest in practical, real-world environments. Whether calibrating laboratory instruments, monitoring environmental conditions, designing safer materials, or interpreting chemical labels, understanding **${lesson.concept}** is essential. It serves as a vital bridge between theoretical models and observable phenomena in standard introductory chemistry coursework.`,
            
            `### Core Chemical Principles`,
            `To fully comprehend this phenomenon, we must look at the microscopic scale. The concept of **${lesson.concept}** operates on fundamental chemical rules. In general chemistry, physical properties and molecular interactions are governed by atomic structures, electron arrangements, and electrostatic forces. For instance, atoms share, donate, or accept valence electrons to achieve stability, forming ionic or covalent bonds that dictate a molecule's behavior in various physical states and mixtures.`,
            `When these substances interact in a reaction, they follow strict thermodynamic, kinetic, and stoichiometric laws. Whether we are discussing the collisions of gas molecules in a closed container, the hydration shells of ions in an aqueous solution, or the transfer of electrons in an oxidation-reduction reaction, the basic chemical framework remains identical. The concentration of reactants, the pressure of gases, and the stoichiometry of reactions determine the equilibrium behavior of systems. A failure to control these parameters can prevent reactions from completing or cause them to proceed unpredictably.`,
            
            `### Mathematical Frameworks & Calculations`,
            `Quantifying these chemical behaviors requires rigorous mathematical frameworks. In general chemistry, we rely on dimensional analysis to construct unit conversion chains, ensuring that units cancel out correctly and leave no room for mathematical errors. For example, when calculating quantities or preparing solutions, we start with the known quantity and apply conversion factors derived from equivalence statements:`,
            `*Given Quantity × (Desired Unit / Given Unit) = Desired Quantity*`,
            `For instance, converting mass to moles requires the substance's molar mass, and concentration calculations utilize the molarity equation:`,
            `*Molarity (M) = Moles of Solute (mol) / Liters of Solution (L)*`,
            `If we need to calculate the number of individual atoms or molecules, we apply Avogadro's constant (6.022 × 10²³ particles/mol). Gas behavior is modeled using the Gas Laws and the Ideal Gas Law:`,
            `*P × V = n × R × T*`,
            `where P is pressure, V is volume, n is the number of moles, R is the universal gas constant, and T is temperature in Kelvin. In laboratory settings, we utilize these equations to prepare precise dilutions, calculate theoretical yields, and calibrate instruments. Every calculation must be rounded using proper significant figure rules to accurately reflect the precision limits of our measurements.`,
            
            `### Practical & Experimental Significance`,
            `The practical significance of mastering **${lesson.concept}** cannot be overstated. In research and industrial labs, chemical precision is the difference between a successful synthesis and a failed, expensive experiment. For example, preparing standard solutions requires calculating exact volumes to ensure chemical titrations are accurate. In thermal energy processes, specific heat capacity dictates how much energy is absorbed or released during chemical changes, which is measured using calorimetry.`,
            `Furthermore, explaining scientific concepts clearly is a key responsibility for any scientist. As part of your pedagogical development, you must master the Feynman defense: *"${lesson.feynman_prompt}"*. Explaining complex concepts using simple, everyday analogies—such as comparing the mole to a baker's dozen or chemical bonding to a magnetic attraction—helps bridge the gap between abstract science and general understanding. By learning to communicate these principles clearly, you solidify your own mastery and make chemistry accessible to others.`
        ].join('\n\n');
        
        return sections;
    }

    function renderLectureContent(lesson, lectureText) {
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
                    <div class="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">Real-World Hook</div>
                    <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">${escapeHtml(lesson.clinical_tie_in)}</p>
                </div>

                <div class="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Micro-Lecture</div>
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

    function getStoredLectures(lessonId) {
        const newKey = `chemistry_lesson_lectures_${lessonId}`;
        const oldKey = `chemistry_lesson_lecture_${lessonId}`;
        
        let list = [];
        try {
            const val = localStorage.getItem(newKey);
            if (val) {
                list = JSON.parse(val);
            }
        } catch (_err) {}
        
        if (!Array.isArray(list) || list.length === 0) {
            const oldVal = localStorage.getItem(oldKey);
            if (oldVal) {
                list = [oldVal];
                try {
                    localStorage.setItem(newKey, JSON.stringify(list));
                    localStorage.removeItem(oldKey);
                } catch (_err) {}
            }
        }
        return list;
    }

    function saveStoredLectures(lessonId, lectures) {
        localStorage.setItem(`chemistry_lesson_lectures_${lessonId}`, JSON.stringify(lectures));
    }

    function updateLectureSelectDropdown() {
        if (!els.selectActiveLecture) return;
        els.selectActiveLecture.innerHTML = '';
        
        appState.lectures.forEach((_, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `Lecture ${idx + 1}`;
            if (idx === appState.activeLectureIdx) {
                opt.selected = true;
            }
            els.selectActiveLecture.appendChild(opt);
        });
    }

    function renderGenerationFailure(lesson, errMsg, index, isRegenerate) {
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
            generateLecture(lesson, index, isRegenerate);
        });

        document.getElementById('btn-use-mock-lecture').addEventListener('click', () => {
            const mockText = generateOfflineMockLecture(lesson, index);
            if (isRegenerate) {
                appState.lectures[index] = mockText;
            } else {
                appState.lectures.push(mockText);
                appState.activeLectureIdx = appState.lectures.length - 1;
            }
            saveStoredLectures(lesson.id, appState.lectures);
            localStorage.setItem(`chemistry_lesson_active_lecture_idx_${lesson.id}`, appState.activeLectureIdx);
            
            updateLectureSelectDropdown();
            renderLectureContent(lesson, mockText);
        });
    }

    async function generateLecture(lesson, index, isRegenerate = false) {
        if (appState.isGeneratingLecture) {
            console.warn('Lecture generation already in progress. Skipping duplicate request.');
            return;
        }
        appState.isGeneratingLecture = true;

        els.lectureContainer.innerHTML = `
            <div class="flex flex-col h-full justify-center p-4 max-w-lg mx-auto space-y-3">
                <div class="flex items-center space-x-3 text-amber-500 dark:text-amber-400 font-semibold text-xs">
                    <i class="fa-solid fa-gears animate-spin"></i>
                    <span>${isRegenerate ? 'Regenerating' : 'Generating'} Lecture via Gemma 4...</span>
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
                        <span>[3/4] Requesting 600-800 word chemistry lecture...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                    <div id="step-render" class="flex items-center justify-between text-slate-500">
                        <span>[4/4] Parsing and rendering output...</span>
                        <span class="status font-bold">PENDING</span>
                    </div>
                </div>
                
                <div id="generation-log" class="text-[9px] text-slate-555 dark:text-slate-400 h-6 truncate font-mono text-center">
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
            renderGenerationFailure(lesson, 'CLINICAL_TUTOR module or fetchGeneratedLesson is unavailable.', index, isRegenerate);
            appState.isGeneratingLecture = false;
            return;
        }

        try {
            const lectureText = await tutor.fetchGeneratedLesson(lesson, (step, status, details) => {
                updateStepUI(step, status, details);
            }, index);

            if (!lectureText) {
                throw new Error('Received empty lecture text output from tutor module.');
            }

            if (isRegenerate) {
                appState.lectures[index] = lectureText;
            } else {
                appState.lectures.push(lectureText);
                appState.activeLectureIdx = appState.lectures.length - 1;
            }
            
            saveStoredLectures(lesson.id, appState.lectures);
            localStorage.setItem(`chemistry_lesson_active_lecture_idx_${lesson.id}`, appState.activeLectureIdx);

            updateLectureSelectDropdown();
            updateStepUI('render', 'success', 'Lecture formatted.');
            
            setTimeout(() => {
                renderLectureContent(lesson, lectureText);
            }, 600);

        } catch (err) {
            console.error('Lecture generation failed:', err);
            updateStepUI('generate', 'error', err.message);
            renderGenerationFailure(lesson, err.message, index, isRegenerate);
        } finally {
            appState.isGeneratingLecture = false;
        }
    }

    async function ensureLectureContent() {
        const lesson = appState.lesson;
        if (!lesson) return;

        if (appState.lectures.length > 0) {
            const activeText = appState.lectures[appState.activeLectureIdx];
            renderLectureContent(lesson, activeText);
            return;
        }

        await generateLecture(lesson, 0, false);
    }

    async function loadDynamicQuestion(mode) {
        appState.isChatLocked = true;
        els.chatInput.disabled = true;
        els.btnSend.disabled = true;

        addTypingIndicator();

        const tutor = window.CLINICAL_TUTOR;
        let generatedQuestion = null;

        if (tutor && typeof tutor.fetchGeneratedQuestion === 'function') {
            try {
                generatedQuestion = await tutor.fetchGeneratedQuestion(appState.lesson, mode);
            } catch (err) {
                console.warn('Failed to generate dynamic question, using fallback:', err);
            }
        }

        removeTypingIndicator();
        appState.isChatLocked = false;
        els.chatInput.disabled = false;
        els.btnSend.disabled = false;

        if (!generatedQuestion) {
            if (mode === 'socratic') {
                generatedQuestion = `Socratic Check: Explain "${appState.lesson.concept}" and connect it to this real-world hook: ${appState.lesson.clinical_tie_in}`;
            } else {
                generatedQuestion = `Feynman Final: ${appState.lesson.feynman_prompt}`;
            }
        } else {
            if (mode === 'socratic') {
                generatedQuestion = `Socratic Check: ${generatedQuestion}`;
            } else {
                generatedQuestion = `Feynman Check: ${generatedQuestion}`;
            }
        }

        appState.messageHistory.push({ role: 'assistant', content: generatedQuestion });
        addMessage('assistant', generatedQuestion);
        saveSessionState(appState.lessonId, appState.stage, appState.messageHistory);
        scrollChatToBottom();
    }

    function renderStage1() {
        appState.stage = STAGE_LECTURE;
        appState.isChatLocked = false;

        setStageDots(STAGE_LECTURE);
        setModeUiForStage();
        syncWorkspaceLayoutForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        hideFlex(els.feynmanSpeechControls);
        els.btnMic.classList.add('hidden');
        els.btnSend.classList.remove('hidden');
        els.chatInput.disabled = true;
        els.chatForm.dataset.mode = 'lecture';

        els.chatMessages.innerHTML = `
            <div class="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300">
                <div class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Stage 1 Complete?</div>
                <p class="mb-1">Use the <span class="font-semibold text-emerald-600 dark:text-emerald-300">Next: Start Socratic Checkpoint</span> button in the top ribbon when you are ready.</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">This starts Stage 2 guided questioning and unlocks your checkpoint path.</p>
            </div>
        `;
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
        appState.socraticManualPreference = null;
        markSocraticCtaSeen();

        setStageDots(STAGE_SOCRATIC);
        setModeUiForStage();
        syncWorkspaceLayoutForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        hideFlex(els.feynmanSpeechControls);
        els.btnMic.classList.add('hidden');
        els.btnSend.classList.remove('hidden');
        els.chatInput.disabled = false;
        els.chatInput.placeholder = 'Type chemistry Socratic response here...';
        els.chatForm.dataset.mode = 'socratic';

        renderHistoryToUi();

        if (appState.messageHistory.length === 0) {
            loadDynamicQuestion('socratic');
        }

        if (!els.chatInput.disabled) {
            els.chatInput.focus();
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
            'isotope-abundance-calculator': 'solve an isotope weighted-average or molar mass calculation in the Molar Mass tab.',
            'nuclear-decay-grapher': 'balance a reaction or complete a stoichiometric setup in the Reaction & Stoichiometry tab.',
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
            'radiation-dna-damage-sim': 'balance any reaction and solve its stoichiometry yield in the Reaction & Stoichiometry tab.',
            'thermochemistry-calorimeter': 'solve an energy-transfer calculation in the Dimensional Analysis Builder.',
            'heating-curve-lab': 'practice phase-change or heat-transfer calculations in the Dimensional Analysis Builder.',
            'redox-identifier': 'complete a reaction setup and classify oxidation-state changes in the Reaction & Stoichiometry tab.',
            'organic-functional-group-map': 'open Nomenclature Flashcards and practice the Organic category cards.'
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
        if (t.includes('dimensional-analysis') || t.includes('dimensions') || t.includes('density') || t.includes('specific-heat') || t.includes('notation-slider') || t.includes('temperature-converter') || t.includes('thermochemistry') || t.includes('heating-curve')) return 'dimensions';
        if (t.includes('stoichiometry') || t.includes('stoich') || t.includes('reactant') || t.includes('equation') || t.includes('ratio') || t.includes('solubility') || t.includes('le-chatelier') || t.includes('equilibrium')) return 'stoich';
        if (t.includes('sig-fig') || t.includes('sigfig')) return 'sigfigs';
        if (t.includes('meniscus') || t.includes('precision') || t.includes('shielding') || t.includes('half-life') || t.includes('diffusion') || t.includes('osmosis') || t.includes('dilution') || t.includes('activation-energy') || t.includes('buffer') || t.includes('ph-')) return 'lab';
        if (t.includes('periodic-table') || t.includes('ion-charge') || t.includes('electronegativity') || t.includes('polarity') || t.includes('vsepr') || t.includes('dna-') || t.includes('carbon-chain') || t.includes('macromolecule') || t.includes('organic-functional')) return 'nomenclature';
        if (t.includes('free-radical') || t.includes('radiation-dna') || t.includes('redox') || t.includes('nuclear-decay')) return 'stoich';
        if (t.includes('isotope-abundance')) return 'molar';
        if (t.includes('atom-builder') || t.includes('electron-jump')) return 'lab';
        return 'dashboard';
    }

    function renderStage3() {
        appState.stage = STAGE_SANDBOX;
        appState.isChatLocked = false;
        appState.socraticManualPreference = null;

        setStageDots(STAGE_SANDBOX);
        setModeUiForStage();
        syncWorkspaceLayoutForStage();

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
        appState.socraticManualPreference = null;

        setStageDots(STAGE_FEYNMAN);
        setModeUiForStage();
        syncWorkspaceLayoutForStage();

        hideFlex(els.sandboxHandshake);
        hideFlex(els.masterCtaOverlay);
        showFlex(els.feynmanSpeechControls);
        els.chatInput.disabled = false;
        els.chatForm.dataset.mode = 'feynman';

        setupSpeechRecognition();
        applyInputMode();

        renderHistoryToUi();

        const hasPrompt = appState.messageHistory.some(m => m.content && (m.content.includes('Feynman Final:') || m.content.includes('Feynman Check:')));
        if (!hasPrompt) {
            loadDynamicQuestion('feynman');
        }
    }

    function resetStageChatAndRegenerate() {
        const mode = els.chatForm.dataset.mode;
        if (mode === 'socratic') {
            const ok = window.confirm('Generate a new Socratic practice question? This will clear your current Socratic chat history.');
            if (!ok) return;
            appState.messageHistory = [];
            els.chatMessages.innerHTML = '';
            loadDynamicQuestion('socratic');
        } else if (mode === 'feynman') {
            const ok = window.confirm('Generate a new Feynman practice question? This will clear your current Feynman chat history.');
            if (!ok) return;
            
            const feynmanIdx = appState.messageHistory.findIndex(m => m.content && (m.content.includes('Feynman Final:') || m.content.includes('Feynman Check:')));
            if (feynmanIdx !== -1) {
                appState.messageHistory = appState.messageHistory.slice(0, feynmanIdx);
            }
            renderHistoryToUi();
            loadDynamicQuestion('feynman');
        }
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
                'You are a strict general chemistry evaluator for introductory chemistry learners.',
                'Use the Feynman prompt below to grade the explanation for clarity, correctness, and scientifically sound reasoning.',
                `Feynman Prompt: ${appState.lesson.feynman_prompt}`,
                'Pass only when explanation is accurate and teachable to a patient.',
                'CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math formatting (such as $, $$, \\frac, \\text, etc.). Write all mathematical equations, conversions, formulas, and units in simple plain text (e.g. use "deg F" or "°F", "*", "/", "^", and standard parentheses) so they render cleanly.'
            ].join(' ');
        } else {
            systemPrompt = [
                'You are a Socratic general chemistry tutor for introductory chemistry students.',
                `Concept: ${appState.lesson.concept}.`,
                `Real-World Hook: ${appState.lesson.clinical_tie_in}.`,
                'Ask or respond in a way that tests conceptual understanding and lab safety/practical reasoning.',
                'CRITICAL FORMATTING INSTRUCTION: Do NOT use LaTeX math formatting (such as $, $$, \\frac, \\text, etc.). Write all mathematical equations, conversions, formulas, and units in simple plain text (e.g. use "deg F" or "°F", "*", "/", "^", and standard parentheses) so they render cleanly.'
            ].join(' ');
        }

        const tutor = window.CLINICAL_TUTOR;
        if (!tutor || typeof tutor.fetchLocalTutor !== 'function') {
            return {
                passed: false,
                feedback: 'Error: Connection link interrupted. Please try again or click Regenerate.',
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
        
        appState.lectures = getStoredLectures(appState.lessonId);
        
        const activeIdxKey = `chemistry_lesson_active_lecture_idx_${appState.lessonId}`;
        const savedIdx = Number(localStorage.getItem(activeIdxKey)) || 0;
        appState.activeLectureIdx = savedIdx < appState.lectures.length ? savedIdx : 0;

        updateLectureSelectDropdown();
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
        appState.socraticManualPreference = null;
        appState.socraticCollapsed = true;

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

        if (els.btnOpenSocratic) {
            els.btnOpenSocratic.addEventListener('click', () => {
                if (appState.stage === STAGE_LECTURE) {
                    markSocraticCtaSeen();
                    renderStage2();
                    return;
                }

                setSocraticCollapsed(!appState.socraticCollapsed, { manual: true });
                if (!appState.socraticCollapsed && !els.chatInput.disabled) {
                    els.chatInput.focus();
                }
            });
        }

        if (els.btnPrimarySocraticCta) {
            els.btnPrimarySocraticCta.addEventListener('click', () => {
                markSocraticCtaSeen();
                renderStage2();
            });
        }

        if (els.btnToggleSocratic) {
            els.btnToggleSocratic.addEventListener('click', () => {
                setSocraticCollapsed(!appState.socraticCollapsed, { manual: true });
            });
        }

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

        const btnCurriculumBypass = document.getElementById('btn-curriculum-bypass');
        if (btnCurriculumBypass) {
            updateCurriculumBypassButtonUi();
            btnCurriculumBypass.addEventListener('click', () => {
                const enabled = !isCurriculumBypassEnabledLocal();
                setCurriculumBypassEnabledLocal(enabled);
            });
        }

        const btnResetProgress = document.getElementById('btn-reset-progress');
        if (btnResetProgress) {
            btnResetProgress.addEventListener('click', () => {
                if (typeof window.confirmAndResetChemistryProgress !== 'function') {
                    window.alert('Reset service unavailable on this page.');
                    return;
                }
                window.confirmAndResetChemistryProgress();
            });
        }

        if (els.btnGenerateQuestion) {
            els.btnGenerateQuestion.addEventListener('click', resetStageChatAndRegenerate);
        }

        if (els.selectActiveLecture) {
            els.selectActiveLecture.addEventListener('change', (e) => {
                const idx = Number(e.target.value);
                if (idx >= 0 && idx < appState.lectures.length) {
                    appState.activeLectureIdx = idx;
                    localStorage.setItem(`chemistry_lesson_active_lecture_idx_${appState.lessonId}`, idx);
                    renderLectureContent(appState.lesson, appState.lectures[idx]);
                }
            });
        }

        if (els.btnAddLecture) {
            els.btnAddLecture.addEventListener('click', () => {
                const nextIdx = appState.lectures.length;
                generateLecture(appState.lesson, nextIdx, false);
            });
        }

        if (els.btnRegenerateLecture) {
            els.btnRegenerateLecture.addEventListener('click', () => {
                const ok = window.confirm(`Regenerate Lecture ${appState.activeLectureIdx + 1}? This will overwrite this specific variation with a newly generated lecture.`);
                if (!ok) return;
                generateLecture(appState.lesson, appState.activeLectureIdx, true);
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
            const ok = window.confirm('Regenerate this lesson? This clears all generated lectures and active conversation to restart Stage 1.');
            if (!ok) return;

            localStorage.removeItem(`chemistry_lesson_lecture_${appState.lessonId}`);
            localStorage.removeItem(`chemistry_lesson_lectures_${appState.lessonId}`);
            localStorage.removeItem(`chemistry_lesson_active_lecture_idx_${appState.lessonId}`);
            localStorage.removeItem(`sandbox_complete_${appState.lessonId}`);
            sessionStorage.removeItem('activeLessonState');
            appState.messageHistory = [];
            appState.stage = STAGE_LECTURE;
            appState.isChatLocked = false;
            appState.lectures = [];
            appState.activeLectureIdx = 0;

            clearConversationUi();
            populateLessonHeaderAndLecture();
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
                populateLessonHeaderAndLecture();
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

        window.addEventListener('resize', scheduleSocraticPrimaryViewportStateRefresh, { passive: true });
        window.addEventListener('scroll', scheduleSocraticPrimaryViewportStateRefresh, { passive: true });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', scheduleSocraticPrimaryViewportStateRefresh, { passive: true });
            window.visualViewport.addEventListener('scroll', scheduleSocraticPrimaryViewportStateRefresh, { passive: true });
        }

        window.addEventListener('curriculumBypassChanged', () => {
            updateCurriculumBypassButtonUi();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, getMatrix());
            }
        });

        window.addEventListener(window.CHEMISTRY_PROGRESS_RESET_EVENT || 'chemistryProgressReset', () => {
            if (typeof window.scheduleChemistryResetReload === 'function') {
                window.scheduleChemistryResetReload('Progress reset accepted. Reloading module...');
                return;
            }
            window.location.reload();
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
            scheduleSocraticPrimaryViewportStateRefresh();
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
