const CHEM_STATE_KEY = "chemistry_learning_state_v1";
const CHEM_NOMEN_SRS_STATE_KEY = "chem_nomen_srs_state_v2";
const CHEM_POLY_SRS_STATE_KEY = "chem_polyatomic_srs_state_v1";
const CHEM_POLY_LEGACY_KEY = "chem_polyatomic_mastered_v1";
let learningState = null;
let activateChemTab = () => {};
let diagnosticSession = null;
let chemistrySessionGamification = { streak: 0, xp: 0 };

const chemistryDeckRegistry = {
    nomen: { state: null, cardIds: [] },
    poly: { state: null, cardIds: [] }
};

function ensureTypingIndicatorStyles() {
    const styleId = 'chem-typing-indicator-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes chemTypingBounce {
            0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.45; }
            40% { transform: translateY(-3px) scale(1.08); opacity: 1; }
        }
        .chem-typing-indicator {
            contain: layout style;
        }
        .chem-typing-bubble {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            padding: 8px 12px;
            border: 1px solid rgba(139, 92, 246, 0.2);
            background: linear-gradient(180deg, rgba(245, 243, 255, 0.95), rgba(237, 233, 254, 0.9));
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
        }
        .dark .chem-typing-bubble {
            border-color: rgba(167, 139, 250, 0.35);
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
            box-shadow: 0 4px 14px rgba(2, 6, 23, 0.5);
        }
        .chem-typing-dots {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .chem-typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: rgb(139, 92, 246);
            animation: chemTypingBounce 1s ease-in-out infinite;
        }
        .chem-typing-dot:nth-child(2) { animation-delay: 0.14s; }
        .chem-typing-dot:nth-child(3) { animation-delay: 0.28s; }
        .chem-typing-label {
            font-size: 11px;
            font-weight: 600;
            color: rgb(109, 40, 217);
            letter-spacing: 0.01em;
        }
        .dark .chem-typing-label {
            color: rgb(196, 181, 253);
        }
        @media (prefers-reduced-motion: reduce) {
            .chem-typing-dot {
                animation: none;
                opacity: 0.8;
            }
        }
    `;
    document.head.appendChild(style);
}

function createTypingIndicatorElement(labelText = 'Prof. Beaker', compact = false) {
    ensureTypingIndicatorStyles();

    const wrap = document.createElement('div');
    wrap.className = `flex justify-start chem-typing-indicator${compact ? ' mt-1' : ''}`;
    wrap.setAttribute('aria-live', 'polite');
    wrap.innerHTML = `
        <div class="chem-typing-bubble" role="status" aria-label="${labelText} is typing">
            <span class="chem-typing-dots" aria-hidden="true">
                <span class="chem-typing-dot"></span>
                <span class="chem-typing-dot"></span>
                <span class="chem-typing-dot"></span>
            </span>
            <span class="chem-typing-label">${labelText} is typing</span>
        </div>
    `;
    return wrap;
}

function removeContainerTypingIndicator(containerEl) {
    if (!containerEl) return;
    const indicator = containerEl.querySelector('.chem-typing-indicator');
    if (indicator) indicator.remove();
}

document.addEventListener("DOMContentLoaded", () => {
    learningState = loadLearningState();

    bindDarkModeToggle();
    bindTabs();
    mountConstants();
    mountElementChips();
    mountConversionOptions();
    mountLabEquipment();
    bindMolarMassActions();
    bindConversionActions();
    bindStoichActions();
    bindSigFigActions();
    bindNomenclatureActions();
    bindPolyatomicSubTabs();
    bindPolyatomicIonsActions();
    bindLabActions();
    bindDiagnosticActions();
    bindTutorActions();
    renderCompetencyMap();
    renderLearningStatus();
    renderDiagnosticState();

    // Initialize mastery progress calculation from masteryMatrix
    updateIndexMasteryProgress();

    // Bind global syllabus/mastery matrix change events
    window.addEventListener('syllabusLoaded', updateIndexMasteryProgress);
    window.addEventListener('masteryMatrixChanged', updateIndexMasteryProgress);

    // Handle coursework sandbox handshake parameters
    handleCourseworkSandboxHandshake();

    // Initialize global tooltips for interactive chemical formulas
    initGlobalTooltip();
});

function getDefaultLearningState() {
    const competencies = window.ChemData?.curriculum?.competencies || [];
    const competencyProgress = {};

    competencies.forEach((item) => {
        competencyProgress[item.id] = { attempts: 0, correct: 0 };
    });

    return {
        diagnosticCompleted: false,
        diagnosticScore: 0,
        recommendedTrack: "Foundation",
        competencyProgress
    };
}

function loadLearningState() {
    const raw = localStorage.getItem(CHEM_STATE_KEY);
    const fallback = getDefaultLearningState();
    if (!raw) return fallback;

    try {
        const parsed = JSON.parse(raw);
        return {
            ...fallback,
            ...parsed,
            competencyProgress: {
                ...fallback.competencyProgress,
                ...(parsed.competencyProgress || {})
            }
        };
    } catch {
        return fallback;
    }
}

function saveLearningState() {
    localStorage.setItem(CHEM_STATE_KEY, JSON.stringify(learningState));
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function formatRelativeDueText(dueTimestamp) {
    if (!dueTimestamp) return "New";
    const msUntilDue = dueTimestamp - Date.now();
    if (msUntilDue <= 0) return "Due now";

    const days = Math.ceil(msUntilDue / (24 * 60 * 60 * 1000));
    if (days < 1) return "Due today";
    if (days === 1) return "Due in 1 day";
    if (days < 30) return `Due in ${days} days`;

    const months = Math.round(days / 30);
    if (months === 1) return "Due in 1 month";
    return `Due in ${months} months`;
}

function formatInterval(days) {
    if (days === 0) return "< 1m";
    if (days < 30) return days + "d";
    if (days < 365) return Math.round(days / 30) + "mo";
    return Math.round(days / 365) + "y";
}

function calculateCardStrength(intervalDays, easeFactor) {
    if (!intervalDays || intervalDays <= 0) return 0;
    // Stricter strength curve: early intervals contribute less until retention horizon grows.
    const intervalNorm = clamp(
        Math.log1p(intervalDays) / Math.log1p(45),
        0,
        1
    );
    const boundedEase = clamp(easeFactor || 2.5, 1.3, 3.0);
    const easeNorm = (boundedEase - 1.3) / (3.0 - 1.3);
    return (Math.pow(intervalNorm, 1.2) * 0.8) + (easeNorm * 0.2);
}

function registerChemDeckState(deckKey, state, cardIds) {
    chemistryDeckRegistry[deckKey] = {
        state,
        cardIds: Array.from(new Set(cardIds || []))
    };
    updateChemistryScoreboard();
}

function applySessionGamification(grade) {
    if (grade === 0) {
        chemistrySessionGamification.streak = 0;
        chemistrySessionGamification.xp = Math.max(0, chemistrySessionGamification.xp - 5);
    } else if (grade === 2) {
        chemistrySessionGamification.streak += 1;
        chemistrySessionGamification.xp += 10;
    } else if (grade === 3) {
        chemistrySessionGamification.streak += 1;
        chemistrySessionGamification.xp += 20;
    }

    updateChemistryScoreboard();
}

function updateChemistryScoreboard() {
    const masteryEl = document.getElementById("nomen-mastery-score");
    const streakEl = document.getElementById("nomen-streak-counter");
    const xpEl = document.getElementById("nomen-xp-counter");
    if (!masteryEl || !streakEl || !xpEl) return;

    const deckStates = Object.values(chemistryDeckRegistry);
    let totalStrength = 0;
    let totalCards = 0;

    deckStates.forEach((deck) => {
        if (!deck.state || !deck.cardIds || deck.cardIds.length === 0) return;
        const state = deck.state;
        deck.cardIds.forEach((cardId) => {
            totalStrength += calculateCardStrength(
                state.intervals?.[cardId] || 0,
                state.easeFactors?.[cardId] || 2.5
            );
            totalCards += 1;
        });
    });

    const masteryPercent = totalCards > 0 ? Math.round((totalStrength / totalCards) * 100) : 0;
    masteryEl.textContent = `${masteryPercent}%`;
    streakEl.innerHTML = `${chemistrySessionGamification.streak} <i class="fa-solid fa-fire text-base animate-pulse"></i>`;
    xpEl.textContent = `${chemistrySessionGamification.xp} pts`;
}

function bindDarkModeToggle() {
    const btn = document.getElementById("btn-darkmode");
    if (!btn) return;

    const updateDarkModeUi = () => {
        const isDark = document.documentElement.classList.contains("dark");
        const icon = btn.querySelector("i");
        if (icon) {
            if (isDark) {
                icon.className = "fa-solid fa-sun";
                btn.title = "Toggle Light Mode";
            } else {
                icon.className = "fa-solid fa-moon";
                btn.title = "Toggle Dark Mode";
            }
        }
    };

    updateDarkModeUi();

    btn.addEventListener("click", () => {
        const root = document.documentElement;
        root.classList.toggle("dark");
        localStorage.setItem("chemistry_darkmode", String(root.classList.contains("dark")));
        updateDarkModeUi();
    });
}

function bindTutorActions() {
    const checkStatus = async () => {
        const dot = document.getElementById("chat-status-dot");
        const text = document.getElementById("chat-status-text");
        try {
            const res = await fetch("http://localhost:11434/api/ps", { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                dot.className = "inline-block w-2 h-2 rounded-full bg-green-500";
                text.textContent = "Prof. Beaker is ready";
                return true;
            }
        } catch {}
        dot.className = "inline-block w-2 h-2 rounded-full bg-red-400";
        text.textContent = "Ollama offline";
        return false;
    };

    // run status check when tab activates
    document.getElementById("nav-tutor").addEventListener("click", checkStatus);
    document.getElementById("bnav-tutor").addEventListener("click", checkStatus);

    const msgsEl = document.getElementById("chat-messages");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-btn-send");
    const clearBtn = document.getElementById("chat-btn-clear");
    let chatHistory = [];

    const TUTOR_SYSTEM = `You are "Prof. Beaker", an expert Intro to Chemistry tutor. 
1. Help the user understand stoichiometry, nomenclature, dimensional analysis, and sig figs.
2. If they ask dangerous chemical queries (e.g. how to make explosives), firmly refuse.
3. Be encouraging. Use socratic questioning instead of just giving away the final numeric answer.
4. Keep your responses concise (2-4 sentences max). Use markdown lists if helpful.`;

    const parseMD = (text) => {
        if (typeof text !== 'string') return '';

        // Escape HTML tags to prevent XSS
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Extract code blocks and inline code to protect them
        const codeBlocks = [];
        
        // Match code blocks: ``` ... ```
        html = html.replace(/```(?:javascript|js|chemistry|html|css)?\n([\s\S]*?)\n```/g, (match, code) => {
            const id = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs">${code}</pre>`);
            return id;
        });

        // Match inline backticks: `...`
        html = html.replace(/`([^`\n]+?)`/g, (match, code) => {
            const id = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<code class="bg-gray-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded font-mono text-xs">${code}</code>`);
            return id;
        });

        // Run consolidated math and LaTeX cleanup on the remaining text
        if (window.CLINICAL_TUTOR && typeof window.CLINICAL_TUTOR.cleanMathAndLaTeX === 'function') {
            html = window.CLINICAL_TUTOR.cleanMathAndLaTeX(html);
        } else {
            // Fallback simple clean
            html = html.replace(/\\mathrm\{([^{}]+)\}/g, '$1')
                       .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
                       .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
                       .replace(/([A-Za-z0-9)])_([0-9]+)/g, '$1<sub>$2</sub>')
                       .replace(/([A-Za-z0-9)])\^([0-9+\-]+)/g, '$1<sup>$2</sup>')
                       .replace(/\$\$/g, '')
                       .replace(/\$/g, '');
        }

        // Headers
        html = html.replace(/^####\s+(.*)$/gm, '<h4 class="font-bold text-gray-800 dark:text-gray-200 mt-3 mb-1">$1</h4>');
        html = html.replace(/^###\s+(.*)$/gm, '<h3 class="font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italics
        html = html.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        
        // Lists
        html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="ml-5 list-disc marker:text-indigo-500">$1</li>');
        
        // Newlines
        html = html.replace(/\n/g, '<br>');
        
        // Cleanup excessive breaks around block elements
        html = html.replace(/<\/(h3|h4|div|li)><br>/g, '</$1>');
        html = html.replace(/<br><li/g, '<li');
        html = html.replace(/(<br>\s*){2,}/g, '<br><br>');

        // Restore protected code blocks
        codeBlocks.forEach((codeHtml, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, codeHtml);
        });

        return html;
    };

    function appendBubble(role, text) {
        const emptyState = document.getElementById("chat-empty-state");
        if (emptyState) emptyState.remove();

        const wrap = document.createElement("div");
        const bubble = document.createElement("div");
        if (role === "user") {
            wrap.className = "flex justify-end";
            bubble.className = "max-w-[80%] bg-violet-600 text-white px-4 py-3 rounded-3xl rounded-br-lg text-sm font-medium leading-relaxed";
        } else {
            wrap.className = "flex justify-start";
            bubble.className = "max-w-[85%] bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-3xl rounded-bl-lg text-sm font-medium leading-relaxed text-gray-800";
        }
        bubble.innerHTML = parseMD(text);
        wrap.appendChild(bubble);
        msgsEl.appendChild(wrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return bubble;
    }

    async function sendChat() {
        const text = input.value.trim();
        if (!text) return;
        
        appendBubble("user", text);
        chatHistory.push({ role: "user", content: text });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        
        input.value = "";
        input.disabled = true;
        sendBtn.disabled = true;

        removeContainerTypingIndicator(msgsEl);
        const typingWrap = createTypingIndicatorElement("Prof. Beaker", false);
        msgsEl.appendChild(typingWrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;

        let payload = [{ role: "system", content: TUTOR_SYSTEM }, ...chatHistory];
        
        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: localStorage.getItem("chemistry_llm") || "gemma4:e4b", messages: payload, stream: true })
            });
            if (!response.ok) throw new Error("HTTP error");

            let assistantText = "";
            let firstToken = true;
            let bubble = null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            if (firstToken) {
                                typingWrap.remove();
                                bubble = appendBubble("assistant", "");
                                firstToken = false;
                            }
                            assistantText += data.message.content;
                            bubble.innerHTML = parseMD(assistantText);
                            msgsEl.scrollTop = msgsEl.scrollHeight;
                        }
                        if (data.done) break;
                    } catch {}
                }
            }
            if (firstToken) {
                typingWrap.remove();
            }
            chatHistory.push({ role: "assistant", content: assistantText });
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } catch (e) {
            typingWrap.remove();
            appendBubble("assistant", "Could not connect to Ollama on localhost:11434.");
        }

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    sendBtn.addEventListener("click", sendChat);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChat();
        }
    });

    clearBtn.addEventListener("click", () => {
        chatHistory = [];
        msgsEl.innerHTML = `<div id="chat-empty-state" class="flex flex-col items-center justify-center text-center py-8">
            <div class="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4 border border-violet-100">
                <i class="fa-solid fa-robot text-2xl text-violet-400"></i>
            </div>
            <p class="text-gray-500 font-medium mb-5 text-sm">Chat cleared! How else can I help?</p>
        </div>`;
    });
}

function bindTabs() {
    window.activateChemTab = (tabId) => {
        // Hide all panels and reset all nav buttons
        ['dashboard', 'nomenclature', 'tutor', 'molar', 'dimensions', 'stoich', 'sigfigs', 'lab'].forEach(id => {
            const view = document.getElementById(`view-${id}`);
            if (view) view.classList.add('hidden-tab');
            
            // Reset top nav button
            const btn = document.getElementById(`nav-${id}`);
            if (btn) btn.className = "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 text-gray-500 hover:text-gray-800 hover:bg-gray-100/50";

            // Reset bottom nav button
            const bBtn = document.getElementById(`bnav-${id}`);
            if (bBtn) {
                const icon = bBtn.querySelector('.bnav-icon');
                const label = bBtn.querySelector('.bnav-label');
                if (icon)  { icon.classList.remove('text-amber-600');  icon.classList.add('text-gray-400'); }
                if (label) { label.classList.remove('text-amber-600'); label.classList.add('text-gray-400'); }
            }
        });

        // Show selected panel
        const activeView = document.getElementById(`view-${tabId}`);
        if (activeView) activeView.classList.remove('hidden-tab');

        // Activate top nav button
        const activeBtn = document.getElementById(`nav-${tabId}`);
        if (activeBtn) activeBtn.className = "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-white text-amber-700 shadow shadow-gray-300/50";

        // Activate bottom nav button
        const activeBBtn = document.getElementById(`bnav-${tabId}`);
        if (activeBBtn) {
            const icon = activeBBtn.querySelector('.bnav-icon');
            const label = activeBBtn.querySelector('.bnav-label');
            if (icon)  { icon.classList.add('text-amber-600');  icon.classList.remove('text-gray-400'); }
            if (label) { label.classList.add('text-amber-600'); label.classList.remove('text-gray-400'); }
        }
    };

    activateChemTab = window.activateChemTab;

    // Attach event listeners for programmatic safety
    ['dashboard', 'nomenclature', 'tutor', 'molar', 'dimensions', 'stoich', 'sigfigs', 'lab'].forEach(id => {
        document.getElementById(`nav-${id}`)?.addEventListener('click', () => activateChemTab(id));
        document.getElementById(`bnav-${id}`)?.addEventListener('click', () => activateChemTab(id));
    });
}

function mountConstants() {
    const av = document.getElementById("constant-avogadro");
    const ra = document.getElementById("constant-r-atm");
    const rk = document.getElementById("constant-r-kpa");
    if (!av || !ra || !rk || !window.ChemData) return;

    av.textContent = `${window.ChemData.constants.avogadro.value} ${window.ChemData.constants.avogadro.unit}`;
    ra.textContent = `${window.ChemData.constants.idealGas_R_atm.value} ${window.ChemData.constants.idealGas_R_atm.unit}`;
    rk.textContent = `${window.ChemData.constants.idealGas_R_kpa.value} ${window.ChemData.constants.idealGas_R_kpa.unit}`;
}

function mountElementChips() {
    const container = document.getElementById("element-chip-list");
    if (!container || !window.ChemData) return;

    const entries = Object.entries(window.ChemData.elements);
    entries.forEach(([symbol, data]) => {
        const chip = document.createElement("span");
        chip.className = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700";
        chip.textContent = `${symbol} (${data.mass})`;
        container.appendChild(chip);
    });
}

function mountConversionOptions() {
    const fromSelect = document.getElementById("da-from");
    const toSelect = document.getElementById("da-to");
    const factorBank = document.getElementById("da-factor-bank");
    if (!fromSelect || !toSelect || !factorBank || !window.ChemData) return;

    const allUnits = getAllUnits(window.ChemData.conversions);
    allUnits.forEach((unit) => {
        fromSelect.add(new Option(unit, unit));
        toSelect.add(new Option(unit, unit));
    });

    if (allUnits.includes("kg") && allUnits.includes("mg")) {
        fromSelect.value = "kg";
        toSelect.value = "mg";
    }

    // Populate Factor Bank
    Object.values(window.ChemData.conversions).forEach((group) => {
        group.forEach((edge) => {
            if (edge.type === "formula") {
                // Forward formula option
                const f1 = document.createElement("option");
                f1.value = JSON.stringify({
                    type: "formula",
                    formula: edge.formula,
                    numUnit: edge.to,
                    denUnit: edge.from,
                    display: edge.display
                });
                f1.textContent = `${edge.display} / 1 ${edge.from}`;

                // Reverse formula option
                const f2 = document.createElement("option");
                f2.value = JSON.stringify({
                    type: "formula",
                    formula: edge.inverseFormula,
                    numUnit: edge.from,
                    denUnit: edge.to,
                    display: edge.displayInverse
                });
                f2.textContent = `${edge.displayInverse} / 1 ${edge.to}`;

                factorBank.appendChild(f1);
                factorBank.appendChild(f2);
            } else {
                // Forward factor option (e.g. 1000 g / 1 kg)
                const f1 = document.createElement("option");
                f1.value = JSON.stringify({ numVal: edge.factor, numUnit: edge.to, denVal: 1, denUnit: edge.from });
                f1.textContent = `${edge.factor} ${edge.to} / 1 ${edge.from}`;
                
                // Reverse factor option (e.g. 1 kg / 1000 g)
                const f2 = document.createElement("option");
                f2.value = JSON.stringify({ numVal: 1, numUnit: edge.from, denVal: edge.factor, denUnit: edge.to });
                f2.textContent = `1 ${edge.from} / ${edge.factor} ${edge.to}`;
                
                factorBank.appendChild(f1);
                factorBank.appendChild(f2);
            }
        });
    });
}

function mountLabEquipment() {
    const equipmentSelect = document.getElementById("lab-equipment");
    if (!equipmentSelect || !window.ChemData) return;

    Object.entries(window.ChemData.labEquipment).forEach(([key, spec]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        equipmentSelect.add(new Option(`${label} (${spec.decimalPlaces} dp)`, key));
    });
}

function bindDiagnosticActions() {
    const startButton = document.getElementById("btn-start-diagnostic");
    const nextButton = document.getElementById("btn-next-diagnostic");
    const intro = document.getElementById("diagnostic-intro");

    if (!startButton || !nextButton) return;

    const totalQuestions = window.ChemData?.curriculum?.diagnosticQuestions?.length || 0;
    if (intro && totalQuestions > 0) {
        intro.textContent = `Answer ${totalQuestions} quick questions to place into Foundation, Core, or Challenge track.`;
    }

    startButton.addEventListener("click", () => {
        let questions = JSON.parse(JSON.stringify(window.ChemData?.curriculum?.diagnosticQuestions || []));
        
        // Fisher-Yates shuffle algorithm to ensure true randomization
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        diagnosticSession = {
            index: 0,
            answers: {},
            questions
        };
        startButton.classList.add("hidden");
        nextButton.classList.remove("hidden");
        renderDiagnosticQuestion();
        renderDiagnosticState();
    });

    nextButton.addEventListener("click", () => {
        if (!diagnosticSession) return;

        const selected = document.querySelector("input[name='diagnostic-choice']:checked");
        if (!selected) {
            const resultBox = document.getElementById("diagnostic-result");
            resultBox.classList.remove("hidden");
            resultBox.textContent = "Choose an option before continuing.";
            return;
        }

        const question = diagnosticSession.questions[diagnosticSession.index];
        diagnosticSession.answers[question.id] = Number(selected.value);
        diagnosticSession.index += 1;

        if (diagnosticSession.index >= diagnosticSession.questions.length) {
            finishDiagnostic();
            return;
        }

        renderDiagnosticQuestion();
        renderDiagnosticState();
    });
}

function renderDiagnosticQuestion() {
    const wrap = document.getElementById("diagnostic-question-wrap");
    const questionEl = document.getElementById("diagnostic-question");
    const choicesEl = document.getElementById("diagnostic-choices");
    const resultBox = document.getElementById("diagnostic-result");
    if (!wrap || !questionEl || !choicesEl || !diagnosticSession) return;

    const question = diagnosticSession.questions[diagnosticSession.index];
    wrap.classList.remove("hidden");
    resultBox.classList.add("hidden");
    questionEl.textContent = question.prompt;

    choicesEl.innerHTML = "";
    question.choices.forEach((choice, index) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 p-3 border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-50";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "diagnostic-choice";
        input.value = String(index);
        input.className = "accent-amber-500";

        const span = document.createElement("span");
        span.textContent = choice;

        label.appendChild(input);
        label.appendChild(span);
        choicesEl.appendChild(label);
    });
}

function renderDiagnosticState() {
    const progress = document.getElementById("diagnostic-progress");
    if (!progress) return;

    if (learningState.diagnosticCompleted && !diagnosticSession) {
        progress.textContent = `Completed (${learningState.recommendedTrack} track)`;
        return;
    }

    if (!diagnosticSession) {
        progress.textContent = "Not started";
        return;
    }

    progress.textContent = `Question ${diagnosticSession.index + 1} of ${diagnosticSession.questions.length}`;
}

function finishDiagnostic() {
    const resultBox = document.getElementById("diagnostic-result");
    const nextButton = document.getElementById("btn-next-diagnostic");
    const { questions } = diagnosticSession;

    let correct = 0;
    questions.forEach((question) => {
        if (diagnosticSession.answers[question.id] === question.correctIndex) {
            correct += 1;
            recordCompetencyAttempt(question.competencyId, true);
        } else {
            recordCompetencyAttempt(question.competencyId, false);
        }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    let track = "Foundation";
    if (scorePercent >= 80) track = "Challenge";
    else if (scorePercent >= 55) track = "Core";

    learningState.diagnosticCompleted = true;
    learningState.diagnosticScore = scorePercent;
    learningState.recommendedTrack = track;
    saveLearningState();

    resultBox.classList.remove("hidden");
    resultBox.textContent = `Diagnostic complete: ${scorePercent}% | Recommended track: ${track}.`;
    nextButton.classList.add("hidden");
    diagnosticSession = null;

    renderCompetencyMap();
    renderLearningStatus();
    renderDiagnosticState();

    if (track === "Foundation") activateChemTab("molar");
    if (track === "Core") activateChemTab("dimensions");
    if (track === "Challenge") activateChemTab("lab");
}

function renderLearningStatus() {
    const status = document.getElementById("learning-status");
    if (!status) return;

    if (!learningState.diagnosticCompleted) {
        status.textContent = "Complete your diagnostic to receive a recommended learning track.";
        return;
    }

    const mastery = calculateOverallMastery();
    status.textContent = `Track: ${learningState.recommendedTrack} | Diagnostic: ${learningState.diagnosticScore}% | Overall mastery: ${mastery}%`;
}

function renderCompetencyMap() {
    const container = document.getElementById("competency-map");
    if (!container || !window.ChemData?.curriculum?.competencies) return;

    container.innerHTML = "";
    window.ChemData.curriculum.competencies.forEach((competency) => {
        const progress = learningState.competencyProgress[competency.id] || { attempts: 0, correct: 0 };
        const score = progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0;

        const card = document.createElement("div");
        card.className = "border border-gray-200 rounded-2xl p-4";
        card.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <h4 class="font-semibold text-sm text-gray-800">${competency.title}</h4>
                <span class="text-xs font-bold ${score >= 70 ? "text-green-700" : "text-amber-700"}">${score}%</span>
            </div>
            <p class="text-xs text-gray-600 mt-1">${competency.outcome}</p>
            <div class="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="h-2 bg-amber-500" style="width:${Math.max(4, score)}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-2">Attempts: ${progress.attempts} | Correct: ${progress.correct}</p>
        `;
        container.appendChild(card);
    });
}

function recordCompetencyAttempt(competencyId, isCorrect) {
    if (!learningState.competencyProgress[competencyId]) {
        learningState.competencyProgress[competencyId] = { attempts: 0, correct: 0 };
    }

    const item = learningState.competencyProgress[competencyId];
    item.attempts += 1;
    if (isCorrect) item.correct += 1;

    saveLearningState();
    renderCompetencyMap();
    renderLearningStatus();
}

function calculateOverallMastery() {
    const rows = Object.values(learningState.competencyProgress);
    if (!rows.length) return 0;

    const scores = rows.map((row) => (row.attempts ? row.correct / row.attempts : 0));
    const avg = scores.reduce((acc, value) => acc + value, 0) / scores.length;
    return Math.round(avg * 100);
}


let molarSession = null;

function bindMolarMassActions() {
    const input = document.getElementById("formula-input");
    const button = document.getElementById("btn-calc-mass");
    const output = document.getElementById("molar-output");
    
    const stepsDiv = document.getElementById("molar-steps");
    const stepContainer = document.getElementById("molar-step-container");
    const stepInput = document.getElementById("molar-step-input");
    const btnStepCheck = document.getElementById("btn-molar-step-check");

    if (!input || !button || !output || !stepsDiv) return;

    function startGuidedSolve() {
        const formula = input.value.trim();
        if (!formula) {
            setStatus(output, "Enter a formula first.", "warn");
            return;
        }

        const parseResult = parseFormula(formula);
        if (!parseResult.ok) {
            setStatus(output, parseResult.message, "error");
            return;
        }

        molarSession = {
            formula,
            elements: parseResult.elements,
            stepIndex: 0,
            totalMass: 0
        };

        stepsDiv.classList.remove("hidden");
        output.classList.add("hidden");
        
        renderMolarStep();
    }

    function renderMolarStep() {
        stepContainer.innerHTML = "";
        
        molarSession.elements.forEach((el, idx) => {
            const name = window.ChemData.elements[el.symbol].name;
            const mass = window.ChemData.elements[el.symbol].mass;
            
            const tr = document.createElement("tr");
            tr.className = "border-b border-gray-100";
            
            if (idx < molarSession.stepIndex) {
                // Completed row
                tr.innerHTML = `
                    <td class="p-3 text-gray-800">${name} (${el.symbol})</td>
                    <td class="p-3 text-gray-800">${el.count}</td>
                    <td class="p-3 text-gray-800">${mass}</td>
                    <td class="p-3 font-semibold text-green-700">${(el.count * mass).toFixed(3)}</td>
                `;
            } else if (idx === molarSession.stepIndex) {
                // Current row to solve
                tr.innerHTML = `
                    <td class="p-3 text-gray-800 font-semibold">${name} (${el.symbol})</td>
                    <td class="p-3 text-gray-800">${el.count}</td>
                    <td class="p-3 text-gray-800">${mass}</td>
                    <td class="p-3">
                        <input type="text" id="current-subtotal" class="border border-amber-300 rounded px-2 py-1 w-20 text-sm focus:ring-2 focus:ring-amber-200 outline-none" placeholder="?">
                    </td>
                `;
            } else {
                // Future row
                tr.innerHTML = `
                    <td class="p-3 text-gray-400">${name} (${el.symbol})</td>
                    <td class="p-3 text-gray-400">${el.count}</td>
                    <td class="p-3 text-gray-400">${mass}</td>
                    <td class="p-3 text-gray-400">-</td>
                `;
            }
            stepContainer.appendChild(tr);
        });

        if (molarSession.stepIndex < molarSession.elements.length) {
            btnStepCheck.textContent = "Check Subtotal";
            stepInput.disabled = true;
            stepInput.value = "";
            const currInput = document.getElementById("current-subtotal");
            if (currInput) currInput.focus();
        } else {
            // Final total step
            btnStepCheck.textContent = "Check Total Mass";
            stepInput.disabled = false;
            stepInput.focus();
        }
    }

    function checkStep() {
        if (molarSession.stepIndex < molarSession.elements.length) {
            const currInput = document.getElementById("current-subtotal");
            if (!currInput) return;
            
            const userVal = parseFloat(currInput.value);
            if (isNaN(userVal)) {
                alert("Please enter a numeric subtotal.");
                return;
            }

            const el = molarSession.elements[molarSession.stepIndex];
            const actualMass = window.ChemData.elements[el.symbol].mass * el.count;
            
            if (Math.abs(userVal - actualMass) / actualMass < 0.05) {
                molarSession.totalMass += actualMass;
                molarSession.stepIndex++;
                renderMolarStep();
            } else {
                recordCompetencyAttempt("mole-concept", false);
                window.ChemTutor.invoke(`I am trying to calculate the subtotal mass for ${el.count} atoms of ${el.symbol} (atomic mass from periodic table: ~${window.ChemData.elements[el.symbol].mass} g/mol). I entered ${userVal}. Explain step-by-step how to compute this properly.`, btnStepCheck.parentElement, `The user is working on Molar Mass calculation. The formula is ${molarSession.formula.toUpperCase()}. The molar mass is ${window.ChemData.elements[el.symbol].mass}. The elements are: ${JSON.stringify(molarSession.elements)}`);
            }
        } else {
            const userVal = parseFloat(stepInput.value);
            if (isNaN(userVal)) {
                alert("Please enter a valid total number.");
                return;
            }

            if (Math.abs(userVal - molarSession.totalMass) / molarSession.totalMass < 0.05) {
                recordCompetencyAttempt("mole-concept", true);
                if (window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'molar') {
                    completeActiveSandboxHandshake();
                }
                stepsDiv.classList.add("hidden");
                output.classList.remove("hidden");
                setStatus(output, `Excellent! Step-by-step solve complete. ${molarSession.formula.toUpperCase()} molar mass is ${userVal.toFixed(4)} g/mol`, "ok");
            } else {
                recordCompetencyAttempt("mole-concept", false);
                window.ChemTutor.invoke(`I just calculated the total molar mass for ${molarSession.formula.toUpperCase()} as ${userVal}. It's incorrect. Guide me on how to add the subtotals correctly.`, btnStepCheck.parentElement, `The user is working on Molar Mass calculation. The formula is ${molarSession.formula.toUpperCase()}. The expected molar mass is ${molarSession.mass}.`);
            }
        }
    }

    button.addEventListener("click", startGuidedSolve);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") startGuidedSolve();
    });

    btnStepCheck.addEventListener("click", checkStep);
    stepInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") checkStep();
    });
}

function parseFormula(formula) {
    const atomicWeights = window.ChemData?.elements || {};
    // Clean spaces but keep hydrate dots/asterisks
    let clean = formula.replace(/\s+/g, "");

    // Split compound from hydrates like .5H2O or *5H2O or �5H2O
    const hydrateParts = clean.split(/[.*�]/);
    clean = hydrateParts[0];

    function parseSegment(str, multiplier = 1) {
        let i = 0;
        
        function parseGroup() {
            let elements = [];
            while (i < str.length && str[i] !== ")" && str[i] !== "]") {
                if (str[i] === "(" || str[i] === "[") {
                    const closeChar = str[i] === "(" ? ")" : "]";
                    i++; // skip "(" or "["
                    const innerGroup = parseGroup();
                    if (i < str.length && str[i] === closeChar) i++; // skip ")" or "]"
                    else return { ok: false, message: "Mismatched parentheses or brackets." };
                    
                    let multStr = "";
                    while (i < str.length && /\d/.test(str[i])) {
                        multStr += str[i];
                        i++;
                    }
                    const mult = multStr ? parseInt(multStr, 10) : 1;
                    
                    if (innerGroup.ok === false) return innerGroup;
                    innerGroup.forEach(el => elements.push({ symbol: el.symbol, count: el.count * mult }));
                } else if (/[A-Z]/.test(str[i])) {
                    let symbol = str[i++];
                    if (i < str.length && /[a-z]/.test(str[i])) {
                        symbol += str[i++];
                    }
                    
                    let numStr = "";
                    while (i < str.length && /\d/.test(str[i])) {
                        numStr += str[i++];
                    }
                    const count = numStr ? parseInt(numStr, 10) : 1;
                    
                    elements.push({ symbol, count });
                } else {
                    return { ok: false, message: `Invalid character: ${str[i]}` };
                }
            }
            return elements;
        }

        const res = parseGroup();
        if (res.ok === false) return res;
        
        if (multiplier !== 1) {
            res.forEach(el => { el.count *= multiplier; });
        }
        return res;
    }

    const elementsArray = parseSegment(clean);
    if (elementsArray.ok === false) return elementsArray;

    // Handle hydrates if any
    for (let h = 1; h < hydrateParts.length; h++) {
        let hPart = hydrateParts[h];
        // Parse leading number for hydrate (e.g. 5 in 5H2O)
        let m = hPart.match(/^(\d+)/);
        let hydrateMultiplier = 1;
        if (m) {
            hydrateMultiplier = parseInt(m[1], 10);
            hPart = hPart.substring(m[1].length);
        }
        const hydArr = parseSegment(hPart, hydrateMultiplier);
        if (hydArr.ok === false) return hydArr;
        elementsArray.push(...hydArr);
    }

    const coalesced = {};
    for (const el of elementsArray) {
        if (!atomicWeights[el.symbol]) {
            return { ok: false, message: `Unknown element symbol: ${el.symbol}` };
        }
        coalesced[el.symbol] = (coalesced[el.symbol] || 0) + el.count;
    }

    const finalElements = Object.entries(coalesced).map(([symbol, count]) => ({symbol, count}));

    if (finalElements.length === 0) {
        return { ok: false, message: "Invalid formula format. Use symbols like H2O, NaCl, Ca(OH)2." };
    }

    return { ok: true, elements: finalElements };
}

let daChain = [];

function bindConversionActions() {
    const valueInput = document.getElementById("da-value");
    const fromSelect = document.getElementById("da-from");
    const toSelect = document.getElementById("da-to");
    const factorBank = document.getElementById("da-factor-bank");
    const btnAddFactor = document.getElementById("btn-add-factor");
    const btnCheckDa = document.getElementById("btn-check-da");
    const btnResetDa = document.getElementById("btn-reset-da");
    const chainContainer = document.getElementById("da-chain");
    const emptyMsg = document.getElementById("da-chain-empty");
    const output = document.getElementById("da-output");
    
    if (!valueInput || !fromSelect || !toSelect || !btnAddFactor || !output || !window.ChemData) return;

    function renderChain() {
        if (daChain.length === 0) {
            chainContainer.innerHTML = `<span class="text-sm text-gray-400 italic" id="da-chain-empty">Conversion chain will appear here...</span>`;
            return;
        }
        
        chainContainer.innerHTML = "";
        
        // Start block
        const startDiv = document.createElement("div");
        startDiv.className = "flex flex-col items-center justify-center px-4 py-2 border-r-2 border-gray-300";
        startDiv.innerHTML = `<span class="font-bold text-gray-800">${valueInput.value || 0}</span><span class="text-gray-500 font-semibold">${fromSelect.value}</span>`;
        chainContainer.appendChild(startDiv);
        
        // Factor fractions
        daChain.forEach((factor, idx) => {
            const frac = document.createElement("div");
            frac.className = "flex flex-col items-center justify-center px-4 relative";
            if (factor.type === "formula") {
                frac.innerHTML = `
                    <div class="text-gray-800 font-bold border-b-2 border-gray-800 px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">${factor.display}</div>
                    <div class="text-gray-800 font-bold px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">1 ${factor.denUnit}</div>
                `;
            } else {
                frac.innerHTML = `
                    <div class="text-gray-800 font-bold border-b-2 border-gray-800 px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">${factor.numVal} ${factor.numUnit}</div>
                    <div class="text-gray-800 font-bold px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">${factor.denVal} ${factor.denUnit}</div>
                `;
            }
            chainContainer.appendChild(frac);
            
            if (idx < daChain.length - 1) {
                const mult = document.createElement("div");
                mult.className = "text-xl font-bold text-gray-400 px-1";
                mult.innerHTML = "&times;";
                chainContainer.appendChild(mult);
            }
        });
    }

    btnAddFactor.addEventListener("click", () => {
        const factorJson = factorBank.value;
        if (!factorJson) return;
        if (!valueInput.value) {
            output.classList.remove("hidden");
            setStatus(output, "Enter a starting value first.", "warn");
            return;
        }
        output.classList.add("hidden");
        const factor = JSON.parse(factorJson);
        daChain.push(factor);
        renderChain();
    });

    btnResetDa.addEventListener("click", () => {
        daChain = [];
        output.classList.add("hidden");
        renderChain();
    });

    btnCheckDa.addEventListener("click", () => {
        output.classList.remove("hidden");
        const value = Number(valueInput.value);
        if (Number.isNaN(value) || valueInput.value === "") {
            setStatus(output, "Enter a numeric starting value.", "warn");
            return;
        }
        
        let currentUnit = fromSelect.value;
        let finalValue = value;
        
        for (let i = 0; i < daChain.length; i++) {
            const factor = daChain[i];
            
            if (currentUnit !== factor.denUnit) {
                setStatus(output, `Mismatch at step ${i + 1}: Cannot cancel '${currentUnit}' with denominator '${factor.denUnit}'.`, "error");
                recordCompetencyAttempt("dim-analysis", false);
                window.ChemTutor.invoke(`I am doing a dimensional analysis conversion. At step ${i+1}, my current unit in the numerator is '${currentUnit}', but I tried to use a conversion factor with the denominator '${factor.denUnit}'. Explain why this doesn't cancel out properly.`, document.getElementById("da-output"), `The user is practicing Dimensional Analysis. Target unit: ${toSelect.value}. Current chain of conversion factors applied: ${JSON.stringify(daChain)}.`);
                return;
            }
            
            // Apply mathematics
            if (factor.type === "formula") {
                const expr = factor.formula.replace(/x/g, `(${finalValue})`);
                try {
                    finalValue = new Function(`return ${expr}`)();
                } catch (e) {
                    setStatus(output, `Error evaluating step ${i + 1} formula: ${e.message}`, "error");
                    return;
                }
                currentUnit = factor.numUnit;
            } else {
                finalValue = (finalValue * factor.numVal) / factor.denVal;
                currentUnit = factor.numUnit;
            }
        }
        
        if (currentUnit !== toSelect.value) {
            setStatus(output, `Chain valid so far, but you ended up with '${currentUnit}' instead of the target '${toSelect.value}'.`, "warn");
            recordCompetencyAttempt("dim-analysis", false);
            window.ChemTutor.invoke(`I successfully cancelled all my units, but I ended up with '${currentUnit}' instead of my final target unit '${toSelect.value}'. Guide me on what additional conversion steps I need.`, document.getElementById("da-output"), `The user is practicing Dimensional Analysis. Target unit: ${toSelect.value}. Current chain of conversion factors applied: ${JSON.stringify(daChain)}.`);
            return;
        }
        
        setStatus(output, `Correct! The units cross-cancel perfectly. Result: ${finalValue.toPrecision(6)} ${toSelect.value}`, "ok");
        recordCompetencyAttempt("dim-analysis", true);
        if (window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'dimensions') {
            completeActiveSandboxHandshake();
        }
    });
}

let labSession = null;

function isEquationBalanced(rxn, userCoefficients) {
    if (!userCoefficients || userCoefficients.length !== rxn.reactants.length + rxn.products.length) {
        return false;
    }
    for (let c of userCoefficients) {
        if (isNaN(c) || c <= 0) return false;
    }

    const reactantCounts = {};
    for (let i = 0; i < rxn.reactants.length; i++) {
        const formula = rxn.reactants[i];
        const coeff = userCoefficients[i];
        const res = parseFormula(formula);
        if (!res.ok) return false;
        res.elements.forEach(el => {
            reactantCounts[el.symbol] = (reactantCounts[el.symbol] || 0) + el.count * coeff;
        });
    }

    const productCounts = {};
    for (let i = 0; i < rxn.products.length; i++) {
        const formula = rxn.products[i];
        const coeff = userCoefficients[rxn.reactants.length + i];
        const res = parseFormula(formula);
        if (!res.ok) return false;
        res.elements.forEach(el => {
            productCounts[el.symbol] = (productCounts[el.symbol] || 0) + el.count * coeff;
        });
    }

    const allElements = new Set([...Object.keys(reactantCounts), ...Object.keys(productCounts)]);
    for (let sym of allElements) {
        if ((reactantCounts[sym] || 0) !== (productCounts[sym] || 0)) {
            return false;
        }
    }

    return true;
}

function bindStoichActions() {
    const btnLoad = document.getElementById("btn-load-reaction");
    const equationContainer = document.getElementById("stoich-equation");
    const statusDiv = document.getElementById("stoich-balance-status");
    const btnCheckBalance = document.getElementById("btn-check-balance");
    const scenarioContainer = document.getElementById("stoich-scenario-container");
    const promptEl = document.getElementById("stoich-prompt");
    const readingInput = document.getElementById("stoich-reading");
    const btnCheckStoich = document.getElementById("btn-check-stoich");
    const output = document.getElementById("stoich-output");
    
    if (!btnLoad || !window.ChemData || !window.ChemData.stoichiometry) return;

    let currentRxn = null;
    let inputs = [];

    btnLoad.addEventListener("click", () => {
        const rxns = window.ChemData.stoichiometry.reactions;
        currentRxn = JSON.parse(JSON.stringify(rxns[Math.floor(Math.random() * rxns.length)]));
        
        equationContainer.innerHTML = "";
        inputs = [];
        statusDiv.classList.add("hidden");
        btnCheckBalance.classList.remove("hidden");
        scenarioContainer.classList.add("hidden");
        output.classList.add("hidden");

        const buildPart = (molecules) => {
            const wrap = document.createElement("div");
            wrap.className = "flex items-center gap-2";
            molecules.forEach((mol, idx) => {
                const inp = document.createElement("input");
                inp.type = "number";
                inp.min = "1";
                inp.value = "1";
                inp.className = "w-12 text-center border-b-2 border-gray-300 bg-transparent py-1 outline-none focus:border-amber-500 font-bold";
                
                // Clear validation colors on change
                inp.addEventListener("input", () => {
                    inp.classList.remove("text-rose-600", "text-green-600");
                });

                inputs.push(inp);
                
                const span = document.createElement("span");
                span.innerHTML = renderInteractiveFormula(mol);
                
                wrap.appendChild(inp);
                wrap.appendChild(span);
                
                if (idx < molecules.length - 1) {
                    const plus = document.createElement("span");
                    plus.textContent = "+";
                    plus.className = "text-gray-400 mx-2";
                    wrap.appendChild(plus);
                }
            });
            return wrap;
        };

        equationContainer.appendChild(buildPart(currentRxn.reactants));
        const arrow = document.createElement("span");
        arrow.innerHTML = "&rarr;";
        arrow.className = "mx-4 text-gray-500";
        equationContainer.appendChild(arrow);
        equationContainer.appendChild(buildPart(currentRxn.products));
    });

    btnCheckBalance.addEventListener("click", () => {
        if (!currentRxn) return;
        
        statusDiv.classList.remove("hidden");
        
        const userCoeffs = inputs.map(inp => parseInt(inp.value, 10));
        const allPositive = userCoeffs.every(c => !isNaN(c) && c > 0);
        
        let allCorrect = false;
        if (allPositive) {
            allCorrect = isEquationBalanced(currentRxn, userCoeffs);
        }

        inputs.forEach((inp, idx) => {
            if (allCorrect) {
                inp.classList.remove("text-rose-600");
                inp.classList.add("text-green-600");
                inp.disabled = true;
            } else {
                inp.classList.remove("text-green-600");
                inp.classList.add("text-rose-600");
            }
        });

        if (allCorrect) {
            // Save the user's balanced coefficients back into the current reaction object in memory
            currentRxn.coefficients = userCoeffs;

            statusDiv.textContent = "Equation Balanced!";
            statusDiv.className = "mt-4 text-center text-sm font-bold text-green-600";
            btnCheckBalance.classList.add("hidden");
            
            // Dynamic Problem Generation
            const r1 = currentRxn.reactants[0];
            const r2 = currentRxn.reactants.length > 1 ? currentRxn.reactants[1] : null;
            const p1 = currentRxn.products[0];
            
            // Generate random masses (between 10.0 and 150.0 grams)
            const m1 = (Math.random() * 140 + 10).toFixed(1);
            let m2 = null;
            if (r2) {
                m2 = (Math.random() * 140 + 10).toFixed(1);
            }
            
            // Calculate Limiting Reactant and Theoretical Yield
            const r1Mass = getMolarMass(r1);
            const p1Mass = getMolarMass(p1);
            const c1 = currentRxn.coefficients[0];
            const cp = currentRxn.coefficients[currentRxn.reactants.length]; // first product coeff
            
            let yield1 = (m1 / r1Mass) * (cp / c1) * p1Mass;
            let exact = yield1;
            let expectedSigFigs = getSigFigs(m1);
            
            if (r2) {
                const r2Mass = getMolarMass(r2);
                const c2 = currentRxn.coefficients[1];
                let yield2 = (m2 / r2Mass) * (cp / c2) * p1Mass;
                if (yield2 < yield1) {
                    exact = yield2;
                    expectedSigFigs = getSigFigs(m2);
                }
            }

            let promptText = `Given ${m1} g of ${r1}`;
            if (r2) {
                promptText += ` and ${m2} g of ${r2}, `;
            } else {
                promptText += `, `;
            }
            promptText += `how many grams of ${p1} can be produced theoretically?`;
            
            let molarMassesStr = `Molar Masses: ${r1}=${r1Mass.toFixed(2)} g/mol, ${p1}=${p1Mass.toFixed(2)} g/mol`;
            if (r2) molarMassesStr += `, ${r2}=${getMolarMass(r2).toFixed(2)} g/mol`;

            currentRxn.activeScenario = {
                prompt: promptText,
                correctAnswer: exact,
                unit: `g ${p1}`,
                sigFigs: expectedSigFigs,
                molarMasses: molarMassesStr,
                m1: m1,
                m2: m2
            };
            
            scenarioContainer.classList.remove("hidden");
            promptEl.textContent = currentRxn.activeScenario.prompt;
            readingInput.value = "";
            if (typeof initScratchpad === "function") {
                initScratchpad(currentRxn, currentRxn.activeScenario);
            }
        } else {
            statusDiv.textContent = "Not balanced yet. Check coefficients.";
            statusDiv.className = "mt-4 text-center text-sm font-bold text-rose-600";
            
            // Add Chatbot Hook for Balancing Error
            if (window.ChemTutor) {
                let eqStrUser = currentRxn.reactants.map((r, i) => `${inputs[i].value}${r}`).join(" + ") + " -> " + 
                                currentRxn.products.map((p, i) => `${inputs[currentRxn.reactants.length + i].value}${p}`).join(" + ");
                                
                window.ChemTutor.invoke(
                    `I am trying to balance a chemical equation, but my attempt is incorrect. I tried: ${eqStrUser}. Walk me through how to count the atoms on both sides and balance this correctly.`, 
                    statusDiv, 
                    `The user is practicing balancing chemical equations. Their incorrect attempt is: ${eqStrUser}. Guide them step-by-step on how to balance it.`
                );
            }
        }
    });

    btnCheckStoich.addEventListener("click", () => {
        if (!currentRxn || !currentRxn.activeScenario) return;
        
        output.classList.remove("hidden");
        const strVal = readingInput.value.trim();
        const userVal = parseFloat(strVal);
        
        if (isNaN(userVal)) {
            setStatus(output, "Please enter a valid numeric value.", "warn");
            return;
        }

        const exact = currentRxn.activeScenario.correctAnswer;
        const reqSigFigs = currentRxn.activeScenario.sigFigs;
        const userSigFigs = getSigFigs(strVal);
        
        // Reconstruct the balanced equation string for the tutor context
        let eqStr = currentRxn.reactants.map((r, i) => `${currentRxn.coefficients[i]}${r}`).join(" + ") + " -> " + 
                    currentRxn.products.map((p, i) => `${currentRxn.coefficients[currentRxn.reactants.length + i]}${p}`).join(" + ");

        // 2% tolerance for math rounding 
        const isMatch = Math.abs((userVal - exact) / exact) <= 0.02;
        
        if (isMatch) {
            if (userSigFigs === reqSigFigs) {
                setStatus(output, `Correct! The calculation yields exactly ${userVal} ${currentRxn.activeScenario.unit}.`, "ok");
                recordCompetencyAttempt("stoich-setup", true);
                if (window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'stoich') {
                    completeActiveSandboxHandshake();
                }
            } else {
                setStatus(output, `Mathematically correct, but check your Significant Figures! You provided ${userSigFigs} sig figs, but ${reqSigFigs} are required.`, "warn");
                recordCompetencyAttempt("stoich-setup", false);
                
                // Add Chatbot Hook for Sig Fig Error
                if (window.ChemTutor) {
                    window.ChemTutor.invoke(
                        `I am solving a stoichiometry problem. My calculation of ${userVal} was mathematically correct, but I used ${userSigFigs} significant figures instead of ${reqSigFigs}. Explain how to determine the correct significant figures for this problem.`, 
                        output, 
                        `The user is practicing Stoichiometry. Problem: "${currentRxn.activeScenario.prompt}". Correct answer is ${exact}. They got the math right but the sig figs wrong. Expected sig figs: ${reqSigFigs}. ${currentRxn.activeScenario.molarMasses}`
                    );
                }
            }
        } else {
            setStatus(output, `Incorrect. Please double check molar masses, limiting reactants, and mole ratios. Recalculate and try again.`, "error");
            recordCompetencyAttempt("stoich-setup", false);
            
            // Add Chatbot Hook for Math/Logic Error
            if (window.ChemTutor) {
                window.ChemTutor.invoke(
                    `I am solving a stoichiometry problem: "${currentRxn.activeScenario.prompt}". I calculated ${userVal} but it is incorrect. Walk me through the steps to solve this: identifying the balanced equation, finding the limiting reactant (if applicable), and converting to the final yield.`, 
                    output, 
                    `The user is practicing Stoichiometry. The balanced equation is ${eqStr}. ${currentRxn.activeScenario.molarMasses}. Problem: "${currentRxn.activeScenario.prompt}". The correct theoretical yield is ${exact} ${currentRxn.activeScenario.unit}. Guide them step-by-step to reach this answer.`
                );
            }
        }
    });

    // Toggle scratch pad visibility
    const btnToggleScratch = document.getElementById("btn-toggle-scratchpad");
    const scratchContent = document.getElementById("scratchpad-content");
    const scratchToggleIcon = document.getElementById("scratchpad-toggle-icon");
    if (btnToggleScratch && scratchContent && scratchToggleIcon) {
        btnToggleScratch.addEventListener("click", () => {
            const isCollapsed = scratchContent.classList.contains("hidden");
            if (isCollapsed) {
                scratchContent.classList.remove("hidden");
                scratchToggleIcon.textContent = "▲";
            } else {
                scratchContent.classList.add("hidden");
                scratchToggleIcon.textContent = "▼";
            }
        });
        
        // Ensure it starts open
        scratchContent.classList.remove("hidden");
        scratchToggleIcon.textContent = "▲";
    }
}

function initScratchpad(rxn, activeScenario) {
    const tbody = document.getElementById("scratchpad-tbody");
    const btnImport = document.getElementById("btn-scratchpad-import");
    const notepad = document.getElementById("scratchpad-notes");
    
    if (!tbody) return;
    
    tbody.innerHTML = "";
    if (notepad) notepad.value = "";
    
    // Guard check: Ensure rxn and activeScenario are valid
    if (!rxn || !activeScenario) {
        console.warn("initScratchpad: Missing reaction or activeScenario.");
        return;
    }
    
    const speciesList = [];
    
    rxn.reactants.forEach((formula, idx) => {
        speciesList.push({
            formula,
            coeff: rxn.coefficients[idx],
            type: "reactant",
            index: idx
        });
    });
    
    rxn.products.forEach((formula, idx) => {
        speciesList.push({
            formula,
            coeff: rxn.coefficients[rxn.reactants.length + idx],
            type: "product",
            index: idx
        });
    });
    
    const rowInputs = [];
    
    // Helper to dispatch standard input/change events for reactivity
    const dispatchInputEvents = (el) => {
        if (!el) return;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    };

    // Helper to clear error highlights on focus/input
    const registerClearOnErrorInput = (el) => {
        const handler = () => el.classList.remove("border-rose-500", "dark:border-rose-500");
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
    };

    speciesList.forEach((sp) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-100 dark:border-slate-800/50";
        
        // 1. Formula
        const tdFormula = document.createElement("td");
        tdFormula.className = "py-3 font-semibold text-slate-800 dark:text-slate-200";
        tdFormula.innerHTML = `${sp.coeff} <span class="ml-1">${renderInteractiveFormula(sp.formula)}</span>`;
        tr.appendChild(tdFormula);
        
        // 2. Molar Mass
        const tdMolarMass = document.createElement("td");
        tdMolarMass.className = "py-3 pr-2";
        const mmVal = getMolarMass(sp.formula);
        tdMolarMass.innerHTML = `
            <input type="number" step="0.01" data-field="molar-mass" data-type="${sp.type}" data-index="${sp.index}" class="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 font-mono transition-all duration-200" placeholder="MM (g/mol)">
            <button type="button" class="btn-fill-mm text-[10px] text-amber-600 dark:text-amber-400 hover:underline text-left block mt-0.5" data-mm="${mmVal.toFixed(2)}">Use ${mmVal.toFixed(2)}</button>
        `;
        tr.appendChild(tdMolarMass);
        
        // 3. Mass
        const tdMass = document.createElement("td");
        tdMass.className = "py-3 pr-2";
        tdMass.innerHTML = `
            <input type="number" step="0.1" data-field="mass" data-type="${sp.type}" data-index="${sp.index}" class="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 font-mono transition-all duration-200" placeholder="Mass (g)">
        `;
        tr.appendChild(tdMass);
        
        // 4. Moles
        const tdMoles = document.createElement("td");
        tdMoles.className = "py-3 pr-2";
        tdMoles.innerHTML = `
            <input type="number" step="0.0001" data-field="moles" data-type="${sp.type}" data-index="${sp.index}" class="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 font-mono transition-all duration-200" placeholder="Moles">
        `;
        tr.appendChild(tdMoles);
        
        // 5. Actions
        const tdActions = document.createElement("td");
        tdActions.className = "py-3 text-center space-y-1.5";
        
        if (sp.type === "reactant") {
            tdActions.innerHTML = `
                <button type="button" class="btn-calc-moles w-full py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded shadow-sm shadow-amber-500/25 transition-colors" title="Calculate Moles = Mass / Molar Mass">g &rarr; mol</button>
            `;
        } else {
            let ratioHtml = "";
            rxn.reactants.forEach((rFormula, rIdx) => {
                const rCoeff = rxn.coefficients[rIdx];
                const rName = rFormula;
                ratioHtml += `
                    <button type="button" class="btn-calc-ratio block w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold rounded transition-colors" data-reactant-idx="${rIdx}" data-ratio="${sp.coeff / rCoeff}" title="Calculate from ${rName}">from ${rName}</button>
                `;
            });
            ratioHtml += `
                <button type="button" class="btn-calc-mass block w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded transition-colors" title="Calculate Yield = Moles * Molar Mass">mol &rarr; g</button>
            `;
            tdActions.innerHTML = ratioHtml;
        }
        tr.appendChild(tdActions);
        
        tbody.appendChild(tr);
        
        const inpMM = tdMolarMass.querySelector("input");
        const inpMass = tdMass.querySelector("input");
        const inpMoles = tdMoles.querySelector("input");
        
        registerClearOnErrorInput(inpMM);
        registerClearOnErrorInput(inpMass);
        registerClearOnErrorInput(inpMoles);
        
        const rowData = {
            formula: sp.formula,
            coeff: sp.coeff,
            type: sp.type,
            index: sp.index,
            inpMM,
            inpMass,
            inpMoles
        };
        rowInputs.push(rowData);
        
        // Add event listener to the "Use Molar Mass" button
        const btnFillMM = tdMolarMass.querySelector(".btn-fill-mm");
        if (btnFillMM) {
            btnFillMM.addEventListener("click", () => {
                inpMM.value = btnFillMM.getAttribute("data-mm");
                inpMM.classList.remove("border-rose-500", "dark:border-rose-500");
                dispatchInputEvents(inpMM);
            });
        }
        
        // Add event listener to "Calculate Moles" for reactants
        if (sp.type === "reactant") {
            const btnCalcMoles = tdActions.querySelector(".btn-calc-moles");
            btnCalcMoles.addEventListener("click", () => {
                const mm = parseFloat(inpMM.value);
                const mass = parseFloat(inpMass.value);
                let hasError = false;
                
                if (isNaN(mm) || mm <= 0) {
                    inpMM.classList.add("border-rose-500", "dark:border-rose-500");
                    hasError = true;
                }
                if (isNaN(mass)) {
                    inpMass.classList.add("border-rose-500", "dark:border-rose-500");
                    hasError = true;
                }
                
                if (hasError) {
                    const firstErr = isNaN(mm) ? inpMM : inpMass;
                    firstErr.focus();
                    return;
                }
                
                inpMoles.value = (mass / mm).toFixed(4);
                inpMoles.classList.remove("border-rose-500", "dark:border-rose-500");
                dispatchInputEvents(inpMoles);
            });
        } else {
            // Add event listeners to "Calculate from Reactant" for products
            const btnsCalcRatio = tdActions.querySelectorAll(".btn-calc-ratio");
            btnsCalcRatio.forEach(btn => {
                btn.addEventListener("click", () => {
                    const rIdx = parseInt(btn.getAttribute("data-reactant-idx"), 10);
                    const reactantRow = rowInputs.find(ri => ri.type === "reactant" && ri.index === rIdx);
                    if (reactantRow) {
                        const rMoles = parseFloat(reactantRow.inpMoles.value);
                        const ratio = parseFloat(btn.getAttribute("data-ratio"));
                        
                        if (isNaN(rMoles)) {
                            reactantRow.inpMoles.classList.add("border-rose-500", "dark:border-rose-500");
                            reactantRow.inpMoles.focus();
                            return;
                        }
                        
                        if (!isNaN(ratio)) {
                            inpMoles.value = (rMoles * ratio).toFixed(4);
                            inpMoles.classList.remove("border-rose-500", "dark:border-rose-500");
                            dispatchInputEvents(inpMoles);
                        }
                    }
                });
            });
            
            // Add event listener to "Calculate Mass" (yield) for products
            const btnCalcMass = tdActions.querySelector(".btn-calc-mass");
            btnCalcMass.addEventListener("click", () => {
                const mm = parseFloat(inpMM.value);
                const moles = parseFloat(inpMoles.value);
                let hasError = false;
                
                if (isNaN(mm) || mm <= 0) {
                    inpMM.classList.add("border-rose-500", "dark:border-rose-500");
                    hasError = true;
                }
                if (isNaN(moles)) {
                    inpMoles.classList.add("border-rose-500", "dark:border-rose-500");
                    hasError = true;
                }
                
                if (hasError) {
                    const firstErr = isNaN(mm) ? inpMM : inpMoles;
                    firstErr.focus();
                    return;
                }
                
                inpMass.value = (moles * mm).toFixed(1);
                inpMass.classList.remove("border-rose-500", "dark:border-rose-500");
                dispatchInputEvents(inpMass);
            });
        }
    });
    
    // Auto-fill masses function
    const doAutoFill = () => {
        if (activeScenario.m1) {
            const r1Row = rowInputs.find(ri => ri.type === "reactant" && ri.index === 0);
            if (r1Row && r1Row.inpMass) {
                r1Row.inpMass.value = activeScenario.m1;
                r1Row.inpMass.classList.remove("border-rose-500", "dark:border-rose-500");
                dispatchInputEvents(r1Row.inpMass);
            } else {
                const fallback = tbody.querySelector('input[data-field="mass"][data-type="reactant"][data-index="0"]');
                if (fallback) {
                    fallback.value = activeScenario.m1;
                    fallback.classList.remove("border-rose-500", "dark:border-rose-500");
                    dispatchInputEvents(fallback);
                }
            }
        }
        if (activeScenario.m2) {
            const r2Row = rowInputs.find(ri => ri.type === "reactant" && ri.index === 1);
            if (r2Row && r2Row.inpMass) {
                r2Row.inpMass.value = activeScenario.m2;
                r2Row.inpMass.classList.remove("border-rose-500", "dark:border-rose-500");
                dispatchInputEvents(r2Row.inpMass);
            } else {
                const fallback = tbody.querySelector('input[data-field="mass"][data-type="reactant"][data-index="1"]');
                if (fallback) {
                    fallback.value = activeScenario.m2;
                    fallback.classList.remove("border-rose-500", "dark:border-rose-500");
                    dispatchInputEvents(fallback);
                }
            }
        }
    };
    
    // Call auto fill initially
    doAutoFill();
    
    // Bind click to Import button
    if (btnImport) {
        btnImport.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            doAutoFill();
        };
    }
}

function getMolarMass(formula) {
    const res = parseFormula(formula);
    if (!res.ok) return 1; // Fallback
    let mm = 0;
    res.elements.forEach(e => {
        mm += (window.ChemData.elements[e.symbol]?.mass || 1) * e.count;
    });
    return mm;
}

function getSigFigs(str) {
    let clean = str.replace(/[^0-9]/g, ""); // strip decimal and sign
    // Remove leading zeros
    while (clean.length > 0 && clean[0] === '0') {
        clean = clean.substring(1);
    }
    // If no decimal, trailing zeros in numbers like 100 are NOT sig figs typically, but let's assume standard input
    if (str.indexOf('.') === -1) {
        while (clean.length > 0 && clean[clean.length - 1] === '0') {
            clean = clean.substring(0, clean.length - 1);
        }
    }
    return Math.max(1, clean.length);
}

function getDecimals(str) {
    if (str.indexOf('.') === -1) return 0;
    return str.split('.')[1].length;
}

function bindSigFigActions() {
    const btnGen = document.getElementById("btn-generate-sigfig");
    const problemEl = document.getElementById("sigfig-problem");
    const inputEl = document.getElementById("sigfig-answer");
    const btnCheck = document.getElementById("btn-check-sigfig");
    const output = document.getElementById("sigfig-output");

    if (!btnGen) return;

    let currentSession = null;

    btnGen.addEventListener("click", () => {
        output.classList.add("hidden");
        inputEl.value = "";
        
        const isAdd = Math.random() > 0.5;
        const v1 = (Math.random() * 10).toFixed(Math.floor(Math.random() * 3) + 1);
        const v2 = (Math.random() * 10).toFixed(Math.floor(Math.random() * 3) + 1);
        
        let exactValue, expectedString;
        
        if (isAdd) {
            exactValue = parseFloat(v1) + parseFloat(v2);
            problemEl.textContent = `${v1} + ${v2} = ?`;
            const minDecimals = Math.min(getDecimals(v1), getDecimals(v2));
            expectedString = exactValue.toFixed(minDecimals);
        } else {
            exactValue = parseFloat(v1) * parseFloat(v2);
            problemEl.textContent = `${v1} \u00D7 ${v2} = ?`;
            const minSigFigs = Math.min(getSigFigs(v1), getSigFigs(v2));
            expectedString = Number(exactValue.toPrecision(minSigFigs)).toString();
            // Handle padding if needed, but standard toString is okay for this simple drill
        }
        
        currentSession = { expectedString, rawVal: exactValue };
    });

    btnCheck.addEventListener("click", () => {
        if (!currentSession) {
            setStatus(output, "Generate a problem first.", "warn");
            output.classList.remove("hidden");
            return;
        }

        const userVal = inputEl.value.trim();
        if (userVal === currentSession.expectedString || parseFloat(userVal) === parseFloat(currentSession.expectedString)) {
            setStatus(output, `Correct! The proper sig fig rounded answer is ${currentSession.expectedString}.`, "ok");
            if (window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'sigfigs') {
                completeActiveSandboxHandshake();
            }
        } else {
            setStatus(output, `Incorrect. The correctly rounded answer is ${currentSession.expectedString}.`, "error");
            window.ChemTutor.invoke(`I am trying to calculate significant figures for the math problem: ${problemEl.textContent}. I inputted ${userVal}. Explain rules for rounding significant figures involving ${problemEl.textContent.includes('+') ? 'addition' : 'multiplication'}, and why the answer should be ${currentSession.expectedString}.`, output, `The user is practicing Significant Figures math. The problem is ${problemEl.textContent} = ${currentSession.rawVal}. The correct rounded answer is ${currentSession.expectedString}.`);
        }
        output.classList.remove("hidden");
    });
}

function formatFormula(str) {
    if (!str) return "";
    let formatted = str.replace(/ (\d?[+-])/g, "<sup>$1</sup>");
    formatted = formatted.replace(/(\d?[+-])$/, "<sup>$1</sup>");
    formatted = formatted.replace(/(?<!^)(?<!\s*)([A-Za-z\)])(\d+)(?!\s*<)/g, "$1<sub>$2</sub>");
    return formatted;
}

function renderInteractiveFormula(formula) {
    if (!formula) return "";
    const regex = /([A-Z][a-z]?)|(\d+)|([()+-[\]*·•])/g;
    let html = "";
    let match;
    regex.lastIndex = 0;
    
    let lastIndex = 0;
    while ((match = regex.exec(formula)) !== null) {
        if (match.index > lastIndex) {
            html += formula.slice(lastIndex, match.index);
        }
        
        const [token, element, subscript, special] = match;
        if (element) {
            const elData = window.ChemData?.elements?.[element];
            const name = elData ? elData.name : element;
            const mass = elData ? elData.mass : "";
            
            html += `
            <span tabindex="0" class="chem-tooltip-trigger inline-block cursor-help border-b border-dotted border-amber-500/60 hover:text-amber-600 focus:text-amber-600 outline-none select-none transition-colors" data-tooltip-name="${name}" ${mass ? `data-tooltip-mass="${mass}"` : ""}>
                ${element}
            </span>
            `.trim();
        } else if (subscript) {
            html += `<sub>${subscript}</sub>`;
        } else if (special) {
            html += special;
        }
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < formula.length) {
        html += formula.slice(lastIndex);
    }
    return html;
}

function bindNomenclatureActions() {
    const card = document.getElementById("fc-card");
    const front = document.getElementById("fc-front");
    const back = document.getElementById("fc-back");
    const frontRepeat = document.getElementById("fc-front-repeat");
    const controls = document.getElementById("fc-controls");
    const statInterval = document.getElementById("fc-stat-interval");
    const statStreak = document.getElementById("fc-stat-streak");
    const statLapses = document.getElementById("fc-stat-lapses");
    
    // We expect these 4 buttons and their labels now matching Syngnosia style
    const btnAgain = document.getElementById("btn-fc-again");
    const btnHard = document.getElementById("btn-fc-hard");
    const btnGood = document.getElementById("btn-fc-good");
    const btnEasy = document.getElementById("btn-fc-easy");
    const intAgain = document.getElementById("fc-int-again");
    const intHard = document.getElementById("fc-int-hard");
    const intGood = document.getElementById("fc-int-good");
    const intEasy = document.getElementById("fc-int-easy");
    const categorySelect = document.getElementById("fc-category-select");
    const fcAskTutor = document.getElementById("btn-ask-tutor");
    const fcRule = document.getElementById("fc-rule");
    const btnReset = document.getElementById("btn-nomen-reset");

    if (!card || !front || !back || !frontRepeat || !controls || !btnAgain || !btnHard || !btnGood || !btnEasy || !categorySelect || !btnReset || !window.ChemData || !window.ChemData.nomenclature) return;

    const nomData = window.ChemData.nomenclature;
    let isFlipped = false;
    let currentCardData = null;
    let currentIntervals = [0, 0, 0, 0];
    let currentCategory = "";

    const categories = Object.keys(nomData);
    if (categories.length > 0) {
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        currentCategory = categories[0];
    }
    
    categorySelect.addEventListener("change", (e) => {
        currentCategory = e.target.value;
        renderCard();
    });

    const allNomenCardIds = [];
    Object.values(nomData).forEach((cards) => {
        cards.forEach((c) => {
            allNomenCardIds.push(`${c.formula}-F2N`);
            allNomenCardIds.push(`${c.formula}-N2F`);
        });
    });

    let parsedState = null;
    try {
        parsedState = JSON.parse(localStorage.getItem(CHEM_NOMEN_SRS_STATE_KEY) || "null");
    } catch {
        parsedState = null;
    }

    let srsState = {
        intervals: {},
        dueDates: {},
        easeFactors: {},
        lapses: {},
        streaks: {},
        lastSeen: {},
        ...(parsedState || {})
    };

    const recentlyShown = [];

    function saveState() {
        localStorage.setItem(CHEM_NOMEN_SRS_STATE_KEY, JSON.stringify(srsState));
        registerChemDeckState("nomen", srsState, allNomenCardIds);
    }

    function calculateFutureInterval(cardId, grade) {
        const currentInterval = srsState.intervals[cardId] || 0;
        const currentEase = srsState.easeFactors[cardId] || 2.5;

        let newInterval = 0;
        if (grade === 0) {
            newInterval = currentInterval >= 7 ? Math.round(currentInterval * 0.35) : 0;
        } else if (grade === 1) {
            if (currentInterval === 0) newInterval = 1;
            else if (currentInterval === 1) newInterval = 2;
            else newInterval = Math.round(currentInterval * 1.2);
        } else if (grade === 2) {
            if (currentInterval === 0) newInterval = 2;
            else if (currentInterval === 1) newInterval = 3;
            else newInterval = Math.round(currentInterval * currentEase);
        } else if (grade === 3) {
            if (currentInterval === 0) newInterval = 4;
            else if (currentInterval === 1) newInterval = 6;
            else newInterval = Math.round(currentInterval * currentEase * 1.45) + 1;
        }
        return newInterval;
    }

    function getNextCard() {
        const poolData = nomData[currentCategory] || [];
        const now = Date.now();
        
        const allCards = [];
        poolData.forEach(c => {
            allCards.push({ ...c, direction: 'F2N', id: c.formula + '-F2N' });
            allCards.push({ ...c, direction: 'N2F', id: c.formula + '-N2F' });
        });

        if (allCards.length === 0) return { id: "Done-F2N", formula: "Done", name: "Change category!", direction: 'F2N' };

        let dueCards = allCards.filter(c => {
            const due = srsState.dueDates[c.id];
            return due && due <= now;
        });

        let newCards = allCards.filter(c => !srsState.dueDates[c.id]);

        let fallbackPool = allCards.filter((c) => (srsState.intervals[c.id] || 0) < 14);
        if (fallbackPool.length === 0) fallbackPool = allCards;

        fallbackPool.sort((a, b) => {
            const lastSeenA = srsState.lastSeen[a.id] || 0;
            const lastSeenB = srsState.lastSeen[b.id] || 0;
            if (lastSeenA !== lastSeenB) return lastSeenA - lastSeenB;

            const easeA = srsState.easeFactors[a.id] || 2.5;
            const easeB = srsState.easeFactors[b.id] || 2.5;
            if (easeA !== easeB) return easeA - easeB;

            const lapsesA = srsState.lapses[a.id] || 0;
            const lapsesB = srsState.lapses[b.id] || 0;
            return lapsesB - lapsesA;
        });

        const cooldownSize = Math.min(3, allCards.length - 1);
        if (cooldownSize > 0 && recentlyShown.length > 0) {
            const filteredDue = dueCards.filter(c => !recentlyShown.includes(c.id));
            if (filteredDue.length > 0) dueCards = filteredDue;

            const filteredNew = newCards.filter(c => !recentlyShown.includes(c.id));
            if (filteredNew.length > 0) newCards = filteredNew;

            const filteredFallback = fallbackPool.filter(c => !recentlyShown.includes(c.id));
            if (filteredFallback.length > 0) fallbackPool = filteredFallback;
        }

        if (dueCards.length > 0) return shuffleArray(dueCards)[0];
        if (newCards.length > 0) return shuffleArray(newCards)[0];
        return fallbackPool[0];
    }

    function updateCardStats(cardId) {
        if (!statInterval || !statStreak || !statLapses) return;
        statInterval.textContent = formatRelativeDueText(srsState.dueDates[cardId]);
        statStreak.textContent = `${srsState.streaks[cardId] || 0} 🔥`;
        statLapses.textContent = `${srsState.lapses[cardId] || 0}`;
    }

    function renderCard() {
        currentCardData = getNextCard();
        isFlipped = false;
        
        if (currentCardData && currentCardData.id !== "Done-F2N") {
            const idx = recentlyShown.indexOf(currentCardData.id);
            if (idx > -1) recentlyShown.splice(idx, 1);
            recentlyShown.push(currentCardData.id);
            
            const poolData = nomData[currentCategory] || [];
            const allCardsCount = poolData.length * 2;
            const maxCooldown = Math.min(3, allCardsCount - 1);
            while (recentlyShown.length > Math.max(0, maxCooldown)) {
                recentlyShown.shift();
            }
        }

        const fFmt = formatFormula(currentCardData.formula);
        
        if (currentCardData.direction === 'F2N') {
            front.innerHTML = fFmt;
            frontRepeat.innerHTML = fFmt;
            back.textContent = currentCardData.name;
        } else {
            front.textContent = currentCardData.name;
            frontRepeat.textContent = currentCardData.name;
            back.innerHTML = fFmt;
        }
        
        if (fcRule) {
            if (currentCardData.rule) {
                fcRule.innerHTML = `<strong>Rule:</strong> ${currentCardData.rule}`;
                fcRule.classList.remove("hidden");
            } else {
                fcRule.classList.add("hidden");
            }
        }

        updateCardStats(currentCardData.id);
        
        card.classList.remove("flipped");
        controls.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        controls.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    }

    function handleGrade(grade) {
        const cardId = currentCardData.id;
        const newInterval = currentIntervals[grade];
        let ease = srsState.easeFactors[cardId] || 2.5;

        if (grade === 0) ease = Math.max(1.3, ease - 0.2);
        else if (grade === 1) ease = Math.max(1.3, ease - 0.15);
        else if (grade === 3) ease = Math.min(3.0, ease + 0.12);

        if (grade === 0) {
            srsState.lapses[cardId] = (srsState.lapses[cardId] || 0) + 1;
        }

        if (grade >= 2) {
            srsState.streaks[cardId] = (srsState.streaks[cardId] || 0) + 1;
        } else {
            srsState.streaks[cardId] = 0;
        }

        let nextDue = Date.now();
        if (newInterval > 0) {
            const d = new Date();
            if (d.getHours() < 4) d.setDate(d.getDate() - 1);
            d.setDate(d.getDate() + newInterval);
            d.setHours(4, 0, 0, 0);
            nextDue = d.getTime();
        }

        srsState.intervals[cardId] = newInterval;
        srsState.dueDates[cardId] = nextDue;
        srsState.easeFactors[cardId] = ease;
        srsState.lastSeen[cardId] = Date.now();
        
        saveState();
        applySessionGamification(grade);

        if (grade >= 2 && window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'nomenclature') {
            completeActiveSandboxHandshake();
        }
        
        // FIX: hide controls and unflip BEFORE rendering next card to avoid flashing answers
        card.classList.remove("flipped");
        controls.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        controls.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        
        setTimeout(() => {
            renderCard();
        }, 400); // Wait 400ms for CSS flip transition to finish
    }

    registerChemDeckState("nomen", srsState, allNomenCardIds);
    renderCard();

    card.addEventListener("click", () => {
        if (!isFlipped) {
            isFlipped = true;
            card.classList.add("flipped");
            
            for (let i = 0; i < 4; i++) {
                currentIntervals[i] = calculateFutureInterval(currentCardData.id, i);
            }
            intAgain.textContent = formatInterval(currentIntervals[0]);
            intHard.textContent = formatInterval(currentIntervals[1]);
            intGood.textContent = formatInterval(currentIntervals[2]);
            intEasy.textContent = formatInterval(currentIntervals[3]);

            controls.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            controls.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
        }
    });

    btnAgain.addEventListener("click", (e) => { e.stopPropagation(); handleGrade(0); });
    btnHard.addEventListener("click", (e) => { e.stopPropagation(); handleGrade(1); });
    btnGood.addEventListener("click", (e) => { e.stopPropagation(); handleGrade(2); });
    btnEasy.addEventListener("click", (e) => { e.stopPropagation(); handleGrade(3); });

    btnReset.addEventListener("click", () => {
        if (!confirm("Reset all Nomenclature SRS progress for all categories?")) return;
        localStorage.removeItem(CHEM_NOMEN_SRS_STATE_KEY);
        srsState = {
            intervals: {},
            dueDates: {},
            easeFactors: {},
            lapses: {},
            streaks: {},
            lastSeen: {}
        };
        saveState();
        renderCard();
    });

    if (fcAskTutor) {
        fcAskTutor.addEventListener("click", (e) => {
            e.stopPropagation();
            window.ChemTutor.invoke(`I am struggling with flashcard: Formula '${currentCardData.formula}', Name '${currentCardData.name}'. Explain rule, prefix/suffix, or provide a mnemonic hook.`, controls, `The user is practicing Chemical Nomenclature flashcards in category "${currentCategory}". Current formula: ${currentCardData.formula}, name: ${currentCardData.name}.`);
        });
    }

    document.addEventListener("keydown", (e) => {
        const nomenclView = document.getElementById("view-nomenclature");
        const srsPanel = document.getElementById("panel-nomen-srs");
        if (!nomenclView || !srsPanel || nomenclView.classList.contains("hidden-tab") || srsPanel.classList.contains("hidden-tab")) return;

        // Bypassing input elements to allow normal typing
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable)) return;

        if (e.code === "Space" || e.key === " ") {
            if (!isFlipped) {
                e.preventDefault();
                card.click();
            }
        } else if (["1", "2", "3", "4"].includes(e.key)) {
            if (isFlipped) {
                e.preventDefault();
                const grade = parseInt(e.key) - 1;
                handleGrade(grade);
            }
        }
    });
}

function bindPolyatomicSubTabs() {
    const srsTabBtn = document.getElementById("subnav-nomen-srs");
    const polyTabBtn = document.getElementById("subnav-nomen-polyatomic");
    const srsPanel = document.getElementById("panel-nomen-srs");
    const polyPanel = document.getElementById("panel-nomen-polyatomic");

    if (!srsTabBtn || !polyTabBtn || !srsPanel || !polyPanel) return;

    srsTabBtn.addEventListener("click", () => {
        srsPanel.classList.remove("hidden-tab");
        polyPanel.classList.add("hidden-tab");

        srsTabBtn.className = "px-5 py-2.5 text-sm font-bold border-b-2 border-amber-500 text-amber-700 dark:text-amber-400 transition-all focus:outline-none";
        polyTabBtn.className = "px-5 py-2.5 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all focus:outline-none";

        srsTabBtn.setAttribute("aria-selected", "true");
        polyTabBtn.setAttribute("aria-selected", "false");
    });

    polyTabBtn.addEventListener("click", () => {
        polyPanel.classList.remove("hidden-tab");
        srsPanel.classList.add("hidden-tab");

        polyTabBtn.className = "px-5 py-2.5 text-sm font-bold border-b-2 border-amber-500 text-amber-700 dark:text-amber-400 transition-all focus:outline-none";
        srsTabBtn.className = "px-5 py-2.5 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all focus:outline-none";

        polyTabBtn.setAttribute("aria-selected", "true");
        srsTabBtn.setAttribute("aria-selected", "false");

        if (window.buildPolyatomicDeck) {
            window.buildPolyatomicDeck(false);
        }
    });
}

function bindPolyatomicIonsActions() {
    const card = document.getElementById("poly-fc-card");
    const frontText = document.getElementById("poly-fc-front");
    const backText = document.getElementById("poly-fc-back");
    const frontBadge = document.getElementById("poly-front-group-badge");
    const backBadge = document.getElementById("poly-back-group-badge");
    const backTitle = document.getElementById("poly-fc-back-title");
    const controls = document.getElementById("poly-fc-controls");
    
    const btnStruggle = document.getElementById("btn-poly-struggle");
    const btnHard = document.getElementById("btn-poly-hard");
    const btnGood = document.getElementById("btn-poly-good");
    const btnEasy = document.getElementById("btn-poly-easy");
    const btnPolyAskTutor = document.getElementById("btn-poly-ask-tutor");

    const intStruggle = document.getElementById("poly-int-struggle");
    const intHard = document.getElementById("poly-int-hard");
    const intGood = document.getElementById("poly-int-good");
    const intEasy = document.getElementById("poly-int-easy");
    
    const btnShuffle = document.getElementById("btn-poly-shuffle");
    const btnReset = document.getElementById("btn-poly-reset");
    const btnRestart = document.getElementById("btn-poly-restart");
    
    const btnModeN2F = document.getElementById("btn-poly-mode-n2f");
    const btnModeF2N = document.getElementById("btn-poly-mode-f2n");
    const groupSelect = document.getElementById("poly-group-select");
    
    const progressRatio = document.getElementById("poly-progress-ratio");
    const progressLabel = document.getElementById("poly-progress-label");
    const progressBar = document.getElementById("poly-progress-bar");
    const trackerGrid = document.getElementById("poly-ions-tracker-grid");
    const victoryPanel = document.getElementById("poly-victory-panel");
    const polyStatInterval = document.getElementById("poly-stat-interval");
    const polyStatStreak = document.getElementById("poly-stat-streak");
    const polyStatLapses = document.getElementById("poly-stat-lapses");

    if (!card || !frontText || !backText || !frontBadge || !backBadge || !backTitle || !controls || !btnStruggle || !btnHard || !btnGood || !btnEasy || !btnShuffle || !btnReset || !btnRestart || !btnModeN2F || !btnModeF2N || !groupSelect || !progressRatio || !progressBar || !trackerGrid || !victoryPanel || !window.ChemData || !window.ChemData.polyatomicIons) return;

    let studyMode = "N2F";
    let currentFilter = "all";
    let currentCard = null;
    let isCardFlipped = false;

    const allIons = window.ChemData.polyatomicIons;
    const polyRecentlyShown = [];

    function safeJsonParse(raw, fallback) {
        try {
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function createDefaultPolyState() {
        return {
            intervals: {},
            dueDates: {},
            easeFactors: {},
            lapses: {},
            streaks: {},
            lastSeen: {}
        };
    }

    function getPolyCardId(ion) {
        return ion.name;
    }

    function initializePolySrsState() {
        const existing = safeJsonParse(localStorage.getItem(CHEM_POLY_SRS_STATE_KEY), null);
        if (existing) {
            return {
                ...createDefaultPolyState(),
                ...existing
            };
        }

        const state = createDefaultPolyState();
        const legacyMastered = safeJsonParse(localStorage.getItem(CHEM_POLY_LEGACY_KEY), []);
        if (!Array.isArray(legacyMastered) || legacyMastered.length === 0) return state;

        const now = Date.now();
        allIons.forEach((ion) => {
            if (!legacyMastered.includes(ion.name)) return;
            const cardId = getPolyCardId(ion);
            state.intervals[cardId] = 21;
            state.dueDates[cardId] = now + (21 * 24 * 60 * 60 * 1000);
            state.easeFactors[cardId] = 2.8;
            state.streaks[cardId] = 5;
            state.lapses[cardId] = 0;
            state.lastSeen[cardId] = now;
        });

        localStorage.setItem(CHEM_POLY_SRS_STATE_KEY, JSON.stringify(state));
        return state;
    }

    let polySrsState = initializePolySrsState();
    const allPolyCardIds = allIons.map((ion) => getPolyCardId(ion));

    function savePolyState() {
        localStorage.setItem(CHEM_POLY_SRS_STATE_KEY, JSON.stringify(polySrsState));
        registerChemDeckState("poly", polySrsState, allPolyCardIds);
    }

    function getFilteredIons() {
        return allIons.filter((ion) => currentFilter === "all" || ion.charge === currentFilter);
    }

    function calculatePolyFutureInterval(cardId, grade) {
        const currentInterval = polySrsState.intervals[cardId] || 0;
        const currentEase = polySrsState.easeFactors[cardId] || 2.5;

        if (grade === 0) {
            return currentInterval >= 7 ? Math.round(currentInterval * 0.35) : 0;
        }
        if (grade === 1) {
            if (currentInterval === 0) return 1;
            if (currentInterval === 1) return 2;
            return Math.round(currentInterval * 1.2);
        }
        if (grade === 2) {
            if (currentInterval === 0) return 2;
            if (currentInterval === 1) return 3;
            return Math.round(currentInterval * currentEase);
        }
        if (grade === 3) {
            if (currentInterval === 0) return 4;
            if (currentInterval === 1) return 6;
            return Math.round(currentInterval * currentEase * 1.45) + 1;
        }
        return 0;
    }

    function getNextPolyCard() {
        const candidates = getFilteredIons().map((ion) => ({
            ...ion,
            id: getPolyCardId(ion)
        }));

        if (candidates.length === 0) return null;

        const now = Date.now();
        let due = candidates.filter((c) => {
            const dueAt = polySrsState.dueDates[c.id];
            return dueAt && dueAt <= now;
        });

        let newCards = candidates.filter((c) => !polySrsState.dueDates[c.id]);

        let fallback = candidates.filter((c) => (polySrsState.intervals[c.id] || 0) < 14);
        if (fallback.length === 0) fallback = candidates;

        fallback.sort((a, b) => {
            const lastSeenA = polySrsState.lastSeen[a.id] || 0;
            const lastSeenB = polySrsState.lastSeen[b.id] || 0;
            if (lastSeenA !== lastSeenB) return lastSeenA - lastSeenB;

            const easeA = polySrsState.easeFactors[a.id] || 2.5;
            const easeB = polySrsState.easeFactors[b.id] || 2.5;
            if (easeA !== easeB) return easeA - easeB;

            const lapsesA = polySrsState.lapses[a.id] || 0;
            const lapsesB = polySrsState.lapses[b.id] || 0;
            return lapsesB - lapsesA;
        });

        const cooldownSize = Math.min(3, candidates.length - 1);
        if (cooldownSize > 0 && polyRecentlyShown.length > 0) {
            const filteredDue = due.filter(c => !polyRecentlyShown.includes(c.id));
            if (filteredDue.length > 0) due = filteredDue;

            const filteredNew = newCards.filter(c => !polyRecentlyShown.includes(c.id));
            if (filteredNew.length > 0) newCards = filteredNew;

            const filteredFallback = fallback.filter(c => !polyRecentlyShown.includes(c.id));
            if (filteredFallback.length > 0) fallback = filteredFallback;
        }

        if (due.length > 0) return shuffleArray(due)[0];
        if (newCards.length > 0) return shuffleArray(newCards)[0];
        return fallback[0];
    }

    function updatePolyStats(cardId) {
        if (!polyStatInterval || !polyStatStreak || !polyStatLapses) return;
        polyStatInterval.textContent = formatRelativeDueText(polySrsState.dueDates[cardId]);
        polyStatStreak.textContent = `${polySrsState.streaks[cardId] || 0} 🔥`;
        polyStatLapses.textContent = `${polySrsState.lapses[cardId] || 0}`;
    }

    function getFilteredProgressSummary() {
        const ions = getFilteredIons();
        const total = ions.length;
        const dueCount = ions.filter((ion) => {
            const dueAt = polySrsState.dueDates[getPolyCardId(ion)];
            return dueAt && dueAt <= Date.now();
        }).length;

        let strengthSum = 0;
        ions.forEach((ion) => {
            const cardId = getPolyCardId(ion);
            strengthSum += calculateCardStrength(
                polySrsState.intervals[cardId] || 0,
                polySrsState.easeFactors[cardId] || 2.5
            );
        });

        return {
            total,
            dueCount,
            masteryPercent: total > 0 ? Math.round((strengthSum / total) * 100) : 0
        };
    }

    function renderTracker() {
        const filteredIons = getFilteredIons();
        trackerGrid.innerHTML = "";
        filteredIons.forEach((ion) => {
            const cardId = getPolyCardId(ion);
            const interval = polySrsState.intervals[cardId] || 0;
            const dueAt = polySrsState.dueDates[cardId] || 0;

            let chipClass = "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border";
            let icon = "<i class=\"fa-regular fa-circle text-[9px] shrink-0 ml-1\"></i>";

            if (interval >= 14 && dueAt > Date.now()) {
                chipClass += " bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                icon = "<i class=\"fa-solid fa-circle-check text-[10px] shrink-0 ml-1 text-emerald-500\"></i>";
            } else if (dueAt && dueAt <= Date.now()) {
                chipClass += " bg-rose-500/10 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-500/20";
                icon = "<i class=\"fa-solid fa-clock text-[10px] shrink-0 ml-1 text-rose-500\"></i>";
            } else if (interval > 0) {
                chipClass += " bg-amber-500/10 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-500/20";
                icon = "<i class=\"fa-solid fa-graduation-cap text-[10px] shrink-0 ml-1 text-amber-500\"></i>";
            } else {
                chipClass += " bg-gray-50 dark:bg-[#1a1d27] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#363a52]";
            }

            const chip = document.createElement("div");
            chip.className = chipClass;
            chip.innerHTML = `<span class="truncate">${ion.name}</span>${icon}`;
            trackerGrid.appendChild(chip);
        });
    }

    function renderPolyCard() {
        currentCard = getNextPolyCard();
        isCardFlipped = false;

        if (currentCard) {
            const idx = polyRecentlyShown.indexOf(currentCard.id);
            if (idx > -1) polyRecentlyShown.splice(idx, 1);
            polyRecentlyShown.push(currentCard.id);
            
            const maxCooldown = Math.min(3, getFilteredIons().length - 1);
            while (polyRecentlyShown.length > Math.max(0, maxCooldown)) {
                polyRecentlyShown.shift();
            }
        }

        card.classList.remove("flipped");
        controls.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
        controls.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");

        const { total, dueCount, masteryPercent } = getFilteredProgressSummary();
        if (progressLabel) {
            progressLabel.textContent = "Mastery Strength";
        }
        progressRatio.textContent = total > 0 ? `${masteryPercent}% • ${dueCount} due` : "No cards";
        progressBar.style.width = `${masteryPercent}%`;

        if (!currentCard) {
            card.classList.add("hidden");
            controls.classList.add("hidden");
            victoryPanel.classList.remove("hidden");
            return;
        }

        card.classList.remove("hidden");
        controls.classList.remove("hidden");
        victoryPanel.classList.add("hidden");

        if (studyMode === "N2F") {
            frontText.textContent = currentCard.name;
            backTitle.textContent = "Chemical Formula";
            backText.innerHTML = currentCard.htmlFormula;
        } else {
            frontText.innerHTML = currentCard.htmlFormula;
            backTitle.textContent = "Ion Name";
            backText.textContent = currentCard.name;
        }

        frontBadge.textContent = currentCard.group;
        backBadge.textContent = currentCard.group;

        updatePolyStats(currentCard.id);
        renderTracker();
    }

    function setModeUi() {
        if (studyMode === "N2F") {
            btnModeN2F.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white dark:bg-[#1a1d27] text-amber-700 dark:text-amber-400 shadow-sm focus:outline-none";
            btnModeF2N.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none";
        } else {
            btnModeF2N.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white dark:bg-[#1a1d27] text-amber-700 dark:text-amber-400 shadow-sm focus:outline-none";
            btnModeN2F.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none";
        }
    }

    function handlePolyGrade(grade) {
        if (!currentCard) return;
        const cardId = currentCard.id;
        const newInterval = calculatePolyFutureInterval(cardId, grade);
        let ease = polySrsState.easeFactors[cardId] || 2.5;

        if (grade === 0) ease = Math.max(1.3, ease - 0.2);
        else if (grade === 1) ease = Math.max(1.3, ease - 0.15);
        else if (grade === 3) ease = Math.min(3.0, ease + 0.12);

        if (grade === 0) {
            polySrsState.lapses[cardId] = (polySrsState.lapses[cardId] || 0) + 1;
        }

        if (grade >= 2) {
            polySrsState.streaks[cardId] = (polySrsState.streaks[cardId] || 0) + 1;
        } else {
            polySrsState.streaks[cardId] = 0;
        }

        let nextDue = Date.now();
        if (newInterval > 0) {
            const d = new Date();
            if (d.getHours() < 4) d.setDate(d.getDate() - 1);
            d.setDate(d.getDate() + newInterval);
            d.setHours(4, 0, 0, 0);
            nextDue = d.getTime();
        }

        polySrsState.intervals[cardId] = newInterval;
        polySrsState.easeFactors[cardId] = ease;
        polySrsState.dueDates[cardId] = nextDue;
        polySrsState.lastSeen[cardId] = Date.now();

        savePolyState();
        applySessionGamification(grade);

        if (grade >= 2 && window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === "nomenclature") {
            completeActiveSandboxHandshake();
        }

        card.classList.remove("flipped");
        controls.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
        controls.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
        isCardFlipped = false;

        setTimeout(() => {
            renderPolyCard();
        }, 400);
    }

    function flipCard() {
        if (!currentCard) return;
        isCardFlipped = !isCardFlipped;
        if (isCardFlipped) {
            card.classList.add("flipped");
            
            // Calculate and display intervals
            const currentIntervals = [];
            for (let i = 0; i < 4; i++) {
                currentIntervals[i] = calculatePolyFutureInterval(currentCard.id, i);
            }
            if (intStruggle) intStruggle.textContent = formatInterval(currentIntervals[0]);
            if (intHard) intHard.textContent = formatInterval(currentIntervals[1]);
            if (intGood) intGood.textContent = formatInterval(currentIntervals[2]);
            if (intEasy) intEasy.textContent = formatInterval(currentIntervals[3]);

            controls.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
            controls.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
        } else {
            card.classList.remove("flipped");
            controls.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
            controls.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
        }
    }

    card.addEventListener("click", flipCard);

    document.addEventListener("keydown", (e) => {
        const nomenclView = document.getElementById("view-nomenclature");
        const polyPanel = document.getElementById("panel-nomen-polyatomic");
        if (!nomenclView || !polyPanel || nomenclView.classList.contains("hidden-tab") || polyPanel.classList.contains("hidden-tab")) return;

        // Bypassing input elements to allow normal typing
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable)) return;

        if (e.code === "Space" || e.key === " ") {
            if (!isCardFlipped) {
                e.preventDefault();
                flipCard();
            }
        } else if (["1", "2", "3", "4"].includes(e.key)) {
            if (isCardFlipped) {
                e.preventDefault();
                const grade = parseInt(e.key) - 1;
                handlePolyGrade(grade);
            }
        }
    });

    btnModeN2F.addEventListener("click", () => {
        if (studyMode === "N2F") return;
        studyMode = "N2F";
        setModeUi();
        renderPolyCard();
    });

    btnModeF2N.addEventListener("click", () => {
        if (studyMode === "F2N") return;
        studyMode = "F2N";
        setModeUi();
        renderPolyCard();
    });

    groupSelect.addEventListener("change", (e) => {
        currentFilter = e.target.value;
        renderPolyCard();
    });

    btnShuffle.addEventListener("click", () => {
        if (!currentCard) return;

        // Shuffle-like effect: add a slight due-time offset so a different eligible card is selected next.
        const cardId = currentCard.id;
        polySrsState.dueDates[cardId] = Date.now() + (20 * 60 * 1000);
        savePolyState();
        renderPolyCard();
    });

    btnReset.addEventListener("click", () => {
        if (!confirm("Reset all Polyatomic SRS progress for this module?")) return;
        localStorage.removeItem(CHEM_POLY_SRS_STATE_KEY);
        polySrsState = createDefaultPolyState();
        savePolyState();
        renderPolyCard();
    });

    btnRestart.addEventListener("click", () => {
        polySrsState = createDefaultPolyState();
        savePolyState();
        renderPolyCard();
    });

    btnStruggle.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePolyGrade(0);
    });

    btnHard.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePolyGrade(1);
    });

    btnGood.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePolyGrade(2);
    });

    btnEasy.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePolyGrade(3);
    });

    if (btnPolyAskTutor) {
        btnPolyAskTutor.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!currentCard) return;
            window.ChemTutor.invoke(
                `I am struggling with polyatomic ion: Name '${currentCard.name}', Formula '${currentCard.formula}'. Explain charge, rules, or provide a mnemonic hook.`,
                controls,
                `The user is practicing Polyatomic Ions flashcards. Current ion: ${currentCard.name}, formula: ${currentCard.formula}, charge: ${currentCard.charge}, group: ${currentCard.group}.`
            );
        });
    }

    registerChemDeckState("poly", polySrsState, allPolyCardIds);
    setModeUi();
    renderPolyCard();
    window.buildPolyatomicDeck = () => renderPolyCard();
}

function bindLabActions() {
    const equipmentSelect = document.getElementById("lab-equipment");
    const container = document.getElementById("lab-scenario-container");
    const btnGen = document.getElementById("btn-generate-scenario");
    const visualizer = document.getElementById("lab-visualizer");
    const readingInput = document.getElementById("lab-reading");
    const btnCheck = document.getElementById("btn-check-reading");
    const output = document.getElementById("lab-output");
    const step1 = document.getElementById("lab-step1");
    const step2 = document.getElementById("lab-step2");
    const step3 = document.getElementById("lab-step3");
    
    if (!equipmentSelect || !container || !btnGen || !readingInput || !btnCheck || !output || !window.ChemData) return;

    equipmentSelect.innerHTML = "";
    Object.entries(window.ChemData.labEquipment).forEach(([key, spec]) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = spec.name;
        equipmentSelect.appendChild(opt);
    });

    function generateSVG(spec, value) {
        if (spec.type === "digital") {
            // Analytical Balance rendering
            return `
            <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg" class="mx-auto select-none">
                <defs>
                    <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#94a3b8" />
                        <stop offset="50%" stop-color="#f1f5f9" />
                        <stop offset="100%" stop-color="#64748b" />
                    </linearGradient>
                    <linearGradient id="lcdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#020617" />
                        <stop offset="100%" stop-color="#0f172a" />
                    </linearGradient>
                    <linearGradient id="casingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f8fafc" />
                        <stop offset="100%" stop-color="#cbd5e1" />
                    </linearGradient>
                </defs>

                <!-- Balance Base Shadow -->
                <rect x="8" y="105" width="204" height="106" fill="rgba(0, 0, 0, 0.15)" rx="12" />

                <!-- Balance Body -->
                <rect x="10" y="100" width="200" height="110" fill="url(#casingGradient)" stroke="#94a3b8" stroke-width="2.5" rx="10" />
                
                <!-- Feet of the balance -->
                <rect x="25" y="209" width="30" height="6" fill="#334155" rx="2" />
                <rect x="165" y="209" width="30" height="6" fill="#334155" rx="2" />
                
                <!-- Glass Draft Shield Back panel & floor -->
                <rect x="30" y="15" width="160" height="85" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" rx="4" />
                <!-- Chamber Interior shadow -->
                <rect x="32" y="17" width="156" height="15" fill="rgba(148, 163, 184, 0.1)" />
                
                <!-- Weighing Pan Pillar -->
                <rect x="106" y="78" width="8" height="22" fill="#64748b" stroke="#475569" stroke-width="0.5" />
                <!-- Weighing Pan -->
                <ellipse cx="110" cy="78" rx="42" ry="5" fill="url(#metalGradient)" stroke="#475569" stroke-width="1" />
                
                <!-- Weighing Boat -->
                <path d="M 88 77 L 93 70 L 127 70 L 132 77 Z" fill="rgba(147, 197, 253, 0.5)" stroke="#2563eb" stroke-width="1.5" />
                <!-- Substance (Crystals represented as white and pale blue dots) -->
                <circle cx="106" cy="74" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="109" cy="73" r="1.5" fill="#e0f2fe" opacity="0.9" />
                <circle cx="112" cy="74" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="115" cy="73" r="1.5" fill="#bae6fd" opacity="0.9" />
                <circle cx="111" cy="72" r="1" fill="#ffffff" opacity="0.9" />
                <circle cx="118" cy="74" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="103" cy="75" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="107" cy="75" r="1" fill="#bae6fd" opacity="0.9" />
                <circle cx="114" cy="75" r="1" fill="#ffffff" opacity="0.9" />
                
                <!-- Draft Shield Glass Panels (Foreground) -->
                <rect x="30" y="15" width="160" height="85" fill="rgba(219, 234, 254, 0.15)" stroke="#94a3b8" stroke-width="1.5" rx="4" />
                <!-- Glass Reflections -->
                <path d="M 35 18 L 85 18 L 50 95 L 35 95 Z" fill="rgba(255, 255, 255, 0.25)" />
                <path d="M 145 18 L 185 18 L 175 95 L 145 95 Z" fill="rgba(255, 255, 255, 0.15)" />
                
                <!-- Digital Display Panel -->
                <rect x="30" y="115" width="160" height="46" fill="url(#lcdGradient)" stroke="#334155" stroke-width="2.5" rx="6" />
                <!-- Glowing digital readout -->
                <text x="110" y="146" fill="#06b6d4" font-family="monospace" font-weight="bold" font-size="22" text-anchor="middle" style="text-shadow: 0 0 8px rgba(6, 182, 212, 0.8);" class="select-none">
                    ${value.toFixed(spec.decimalPlaces)} <tspan font-size="15" fill="#0891b2">${spec.unit}</tspan>
                </text>
                
                <!-- Status text "STABLE" -->
                <text x="38" y="127" fill="#10b981" font-family="sans-serif" font-weight="bold" font-size="7" class="select-none">STABLE</text>
                <!-- Zero indicator -->
                <circle cx="176" cy="124" r="2" fill="#10b981" />
                <text x="176" y="132" fill="#64748b" font-family="sans-serif" font-size="6" text-anchor="middle" class="select-none">ZERO</text>
                
                <!-- Buttons -->
                <!-- Tare Button -->
                <g class="cursor-pointer">
                    <rect x="40" y="174" width="40" height="20" fill="#94a3b8" stroke="#475569" stroke-width="1" rx="4" />
                    <text x="60" y="187" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="8" text-anchor="middle" class="select-none">TARE</text>
                </g>
                <!-- On/Off Button -->
                <g class="cursor-pointer">
                    <rect x="90" y="174" width="40" height="20" fill="#ef4444" stroke="#b91c1c" stroke-width="1" rx="4" />
                    <text x="110" y="187" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="8" text-anchor="middle" class="select-none">ON/OFF</text>
                </g>
                <!-- Cal Button -->
                <g class="cursor-pointer">
                    <rect x="140" y="174" width="40" height="20" fill="#94a3b8" stroke="#475569" stroke-width="1" rx="4" />
                    <text x="160" y="187" fill="#1e293b" font-family="sans-serif" font-weight="bold" font-size="8" text-anchor="middle" class="select-none">CAL</text>
                </g>
            </svg>
            `;
        }

        const major = spec.majorIncrement;
        const minor = spec.minorIncrement;
        const isBurette = !!spec.inverted;
        const isQualitative = !!spec.qualitative;
        const isThermometer = spec.unit === "°C";

        // Let's decide scale drawing range (minDraw to maxDraw)
        // Draw centered around target value, but clamped to spec limits.
        // A range of 3 major divisions is ideal for cylinders/thermometer.
        // For beaker we show the entire range.
        let minDraw, maxDraw;
        if (spec.name.includes("Beaker")) {
            minDraw = spec.min;
            maxDraw = spec.max;
        } else {
            minDraw = Math.floor(value / major) * major - major;
            maxDraw = Math.floor(value / major) * major + major * 2;
            if (minDraw < spec.min) minDraw = Math.floor(spec.min / major) * major;
            if (maxDraw > spec.max) maxDraw = Math.ceil(spec.max / major) * major;
            if (minDraw >= maxDraw) {
                minDraw = spec.min;
                maxDraw = spec.max;
            }
        }

        // Set dynamic tick spacing based on number of divisions
        let tickSpacing = 20;
        const totalMinorTicks = Math.round((maxDraw - minDraw) / minor);
        if (totalMinorTicks <= 5) {
            tickSpacing = 70;
        } else if (totalMinorTicks <= 15) {
            tickSpacing = 35;
        } else {
            tickSpacing = 22;
        }
        const h = totalMinorTicks * tickSpacing;

        // Visual setup depending on instrument type
        let svgWidth = 160;
        let svgHeight = h + 100;
        let tubeWidth = 70;
        let tubeX1 = 45;
        let tubeX2 = 115;
        let center = 80;
        let curveDepth = 10;
        let liquidColor = isQualitative ? "rgba(59, 130, 246, 0.3)" : "rgba(167, 139, 250, 0.35)";
        
        if (spec.name.includes("10 mL")) {
            tubeWidth = 50;
            tubeX1 = 55;
            tubeX2 = 105;
            curveDepth = 7;
        } else if (isBurette) {
            tubeWidth = 42;
            tubeX1 = 59;
            tubeX2 = 101;
            curveDepth = 6;
            svgHeight = h + 180; // Extra room for the burette stopcock assembly
        } else if (isThermometer) {
            tubeWidth = 24;
            tubeX1 = 68;
            tubeX2 = 92;
            curveDepth = 0; // The thermometer has a convex red capillary cap
        } else if (spec.name.includes("Beaker")) {
            tubeWidth = 140;
            tubeX1 = 30;
            tubeX2 = 170;
            center = 100;
            curveDepth = 14;
            svgWidth = 200;
            svgHeight = h + 80;
            liquidColor = "rgba(56, 189, 248, 0.35)"; // sky blue
        }

        // 1. Calculate Meniscus Y Coordinate
        // Non-inverted: minDraw at bottom (y = h + 40), maxDraw at top (y = 40)
        // Inverted: minDraw at top (y = 40), maxDraw at bottom (y = h + 40)
        let yTarget;
        if (isBurette) {
            yTarget = 40 + ((value - minDraw) / (maxDraw - minDraw)) * h;
        } else {
            yTarget = 40 + ((maxDraw - value) / (maxDraw - minDraw)) * h;
        }

        // Draw ticks and labels
        let pathMarks = "";
        let textMarks = "";

        for (let i = 0; i <= totalMinorTicks; i++) {
            const y = 40 + i * tickSpacing;
            const currentVal = isBurette ? (minDraw + i * minor) : (maxDraw - i * minor);
            const rem = currentVal % major;
            const isMajor = Math.abs(rem) < 1e-6 || Math.abs(rem - major) < 1e-6;

            let tickX1, tickX2, labelX, lineLength;

            if (isThermometer) {
                // Ticks drawn on the right stem wall going right
                tickX1 = tubeX2;
                lineLength = isMajor ? 14 : 7;
                tickX2 = tubeX2 + lineLength;
                labelX = tickX2 + 4;
            } else if (spec.name.includes("Beaker")) {
                // Beaker ticks starting from left wall going right
                tickX1 = tubeX1;
                lineLength = isMajor ? 26 : 14;
                tickX2 = tubeX1 + lineLength;
                labelX = tickX2 + 6;
            } else {
                // Cylinders/Burettes ticks starting from left wall going right
                tickX1 = tubeX1;
                lineLength = isMajor ? 24 : 12;
                tickX2 = tubeX1 + lineLength;
                labelX = tickX2 + 6;
            }

            pathMarks += `<line x1="${tickX1}" y1="${y}" x2="${tickX2}" y2="${y}" stroke="#334155" stroke-width="${isMajor ? 1.5 : 0.8}" />`;
            
            if (isMajor) {
                const dp = (major.toString().includes(".")) ? major.toString().split(".")[1].length : 0;
                const formattedVal = currentVal.toFixed(dp);
                textMarks += `<text x="${labelX}" y="${y + 4}" fill="#1e293b" font-size="12" font-family="monospace" font-weight="bold" class="select-none">${formattedVal}</text>`;
            }
        }

        // Liquid filling and meniscus path
        let fillPath = "";
        let meniscusPath = "";

        if (isThermometer) {
            // Thermometer red capillary line and bulb
            const capillaryWidth = 4;
            const capillaryX = center - capillaryWidth / 2;
            const bulbY = h + 65;
            
            // Red column from bulb to yTarget
            fillPath = `
                <!-- Bulb -->
                <circle cx="${center}" cy="${bulbY}" r="15" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5" />
                <circle cx="${center - 5}" cy="${bulbY - 5}" r="4" fill="#ffffff" opacity="0.3" />
                <!-- Capillary red liquid -->
                <rect x="${capillaryX}" y="${yTarget}" width="${capillaryWidth}" height="${bulbY - yTarget}" fill="#ef4444" />
                <!-- Rounded top on the column -->
                <circle cx="${center}" cy="${yTarget}" r="2" fill="#ef4444" />
            `;
            // For thermometer, we don't have a wide concave meniscus
            meniscusPath = ``;
        } else {
            // Concave meniscus curve
            // The bottom of the meniscus (center x) is exactly at yTarget.
            // The sides are shifted UP by curveDepth: (yTarget - curveDepth).
            const meniscusY = yTarget - curveDepth;
            
            let fillBottomY = h + 50;
            if (isBurette) fillBottomY = h + 100; // liquid fills down to the stopcock top

            fillPath = `<path d="M ${tubeX1} ${meniscusY} Q ${center} ${yTarget} ${tubeX2} ${meniscusY} L ${tubeX2} ${fillBottomY} L ${tubeX1} ${fillBottomY} Z" fill="${liquidColor}" />`;
            meniscusPath = `
                <!-- Main dark meniscus line -->
                <path d="M ${tubeX1} ${meniscusY} Q ${center} ${yTarget} ${tubeX2} ${meniscusY}" fill="none" stroke="#4f46e5" stroke-width="2.5" />
                <!-- Highlight line under the meniscus -->
                <path d="M ${tubeX1} ${meniscusY + 1} Q ${center} ${yTarget + 1} ${tubeX2} ${meniscusY + 1}" fill="none" stroke="#c084fc" stroke-width="1" opacity="0.6" />
            `;
        }

        // Draw the glassware frame and accessories
        let glasswareFrame = "";

        if (isThermometer) {
            // Glass outer bulb and stem
            glasswareFrame = `
                <!-- Stem -->
                <rect x="${tubeX1}" y="15" width="${tubeWidth}" height="${h + 50}" fill="rgba(241, 245, 249, 0.15)" stroke="#94a3b8" stroke-width="2" rx="6" />
                <!-- Rounded Cap -->
                <path d="M ${tubeX1} 15 Q ${center} 0 ${tubeX2} 15 Z" fill="rgba(241, 245, 249, 0.15)" stroke="#94a3b8" stroke-width="2" />
                <!-- Glass bulb outline -->
                <circle cx="${center}" cy="${h + 65}" r="18" fill="none" stroke="#94a3b8" stroke-width="2" />
                <!-- Capillary hollow channel background -->
                <rect x="${center - 1.5}" y="10" width="3" height="${h + 40}" fill="rgba(0, 0, 0, 0.05)" />
            `;
        } else if (spec.name.includes("Beaker")) {
            // Beaker shape: rectangular body with spout at top left
            glasswareFrame = `
                <!-- Beaker body -->
                <path d="M 30 20 L 170 20 L 170 ${h + 50} Q 170 ${h + 54} 166 ${h + 54} L 34 ${h + 54} Q 30 ${h + 54} 30 ${h + 50} Z" fill="rgba(241, 245, 249, 0.1)" stroke="#94a3b8" stroke-width="2.5" />
                <!-- Beaker Spout -->
                <path d="M 30 20 C 20 18, 18 10, 26 8 C 30 7, 32 15, 34 20" fill="none" stroke="#94a3b8" stroke-width="2.5" />
                <!-- White scale prints on beaker glass -->
                <text x="${center}" y="38" fill="#64748b" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle" class="select-none" opacity="0.8">100 mL</text>
                <text x="${center}" y="48" fill="#64748b" font-family="sans-serif" font-size="7" text-anchor="middle" class="select-none" opacity="0.7">APPROX. VOL.</text>
            `;
        } else if (isBurette) {
            // Burette glass tube extending to stopcock at the bottom
            const stopcockY = h + 110;
            glasswareFrame = `
                <!-- Glass Tube -->
                <rect x="${tubeX1}" y="0" width="${tubeWidth}" height="${h + 100}" fill="rgba(241, 245, 249, 0.05)" stroke="#94a3b8" stroke-width="2" />
                
                <!-- Stopcock Narrows -->
                <path d="M ${tubeX1} ${h + 100} L ${center - 6} ${stopcockY} L ${center + 6} ${stopcockY} L ${tubeX2} ${h + 100} Z" fill="rgba(241, 245, 249, 0.2)" stroke="#94a3b8" stroke-width="2" />
                <!-- Stopcock Liquid inside -->
                <path d="M ${tubeX1} ${h + 100} L ${center - 6} ${stopcockY} L ${center + 6} ${stopcockY} L ${tubeX2} ${h + 100} Z" fill="${liquidColor}" opacity="0.8" />
                
                <!-- Stopcock Valve Assembly -->
                <!-- Valve casing -->
                <circle cx="${center}" cy="${stopcockY}" r="11" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" />
                <!-- Teflon Rotating Valve Knob (Red, showing open position: vertical alignment) -->
                <rect x="${center - 4}" y="${stopcockY - 14}" width="8" height="28" fill="#ef4444" rx="2" stroke="#b91c1c" stroke-width="1" />
                <rect x="${center - 7}" y="${stopcockY - 4}" width="14" height="8" fill="#ef4444" rx="1" stroke="#b91c1c" stroke-width="1" />
                
                <!-- Drip Tip glass -->
                <path d="M ${center - 5} ${stopcockY + 11} L ${center - 2} ${stopcockY + 45} L ${center + 2} ${stopcockY + 45} L ${center + 5} ${stopcockY + 11} Z" fill="rgba(241, 245, 249, 0.2)" stroke="#94a3b8" stroke-width="2" />
                <!-- Liquid in drip tip -->
                <path d="M ${center - 5} ${stopcockY + 11} L ${center - 2} ${stopcockY + 45} L ${center + 2} ${stopcockY + 45} L ${center + 5} ${stopcockY + 11} Z" fill="${liquidColor}" opacity="0.8" />
                
                <!-- Label Burette unit -->
                <text x="${center}" y="25" fill="#64748b" font-family="sans-serif" font-weight="bold" font-size="9" text-anchor="middle" class="select-none" opacity="0.7">50 mL</text>
            `;
        } else {
            // Graduated Cylinders
            const baseTopY = h + 50;
            const baseBottomY = h + 68;
            glasswareFrame = `
                <!-- Glass Tube -->
                <rect x="${tubeX1}" y="20" width="${tubeWidth}" height="${h + 30}" fill="rgba(241, 245, 249, 0.05)" stroke="#94a3b8" stroke-width="2" rx="4" />
                <!-- Flared Pouring Lip at top -->
                <path d="M ${tubeX1} 20 C ${tubeX1 - 8} 18, ${tubeX1 - 8} 5, ${tubeX1 + 4} 10 C ${tubeX1 + 10} 12, ${center} 12, ${center} 20" fill="none" stroke="#94a3b8" stroke-width="2" />
                
                <!-- Plastic Hexagonal Base -->
                <polygon points="${center - 50},${baseTopY} ${center + 50},${baseTopY} ${center + 60},${baseBottomY} ${center - 60},${baseBottomY}" fill="#334155" stroke="#1e293b" stroke-width="1.5" />
                <!-- Bumper guard ring (amber plastic collar) to prevent breakage -->
                <rect x="${tubeX1 - 5}" y="32" width="${tubeWidth + 10}" height="10" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" rx="3" opacity="0.85" />
                
                <!-- White vertical highlights for glass reflection -->
                <rect x="${tubeX2 - 12}" y="22" width="4" height="${h + 26}" fill="#ffffff" opacity="0.25" rx="2" />
                
                <!-- Label for unit -->
                <text x="${center}" y="48" fill="#64748b" font-family="sans-serif" font-weight="bold" font-size="9" text-anchor="middle" class="select-none" opacity="0.7">${spec.unit}</text>
            `;
        }

        return `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" class="mx-auto drop-shadow-md">
            ${fillPath}
            ${glasswareFrame}
            ${meniscusPath}
            ${pathMarks}
            ${textMarks}
        </svg>
        `;
    }

    btnGen.addEventListener("click", () => {
        const key = equipmentSelect.value;
        const spec = window.ChemData.labEquipment?.[key];
        if (!spec) return;

        const range = spec.max - spec.min;
        const randomVal = (spec.min + Math.random() * range).toFixed(spec.decimalPlaces);
        
        labSession = {
            targetVal: randomVal,
            spec: spec
        };
        
        readingInput.value = "";
        if (step1) step1.value = "";
        if (step2) step2.value = "";
        if (step3) step3.value = "";
        output.classList.add("hidden");
        container.classList.remove("hidden");
        if (visualizer) {
            visualizer.innerHTML = generateSVG(spec, parseFloat(randomVal));
        }
    });

    btnCheck.addEventListener("click", () => {
        if (!labSession) {
            setStatus(output, "Generate a scenario first.", "warn");
            output.classList.remove("hidden");
            return;
        }

        const readingRaw = readingInput.value.trim();
        if (!/^[-+]?\d+(\.\d+)?$/.test(readingRaw)) {
            setStatus(output, "Enter a valid numeric reading.", "error");
            output.classList.remove("hidden");
            return;
        }

        const decimalCount = (readingRaw.indexOf(".") !== -1) ? readingRaw.split(".")[1].length : 0;
        const enteredVal = parseFloat(readingRaw);
        const expectedVal = parseFloat(labSession.targetVal);

        output.classList.remove("hidden");

        if (Math.abs(enteredVal - expectedVal) > (labSession.spec.tolerance ?? 0.0001)) {
            let scaffoldFeedback = "";
            const step1Val = step1 ? step1.value.trim() : "";
            const step2Val = step2 ? step2.value.trim() : "";
            const step3Val = step3 ? step3.value.trim() : "";

            if (step1Val || step2Val || step3Val) {
                const minorVal = labSession.spec.minorIncrement;
                // Calculate certain digits limit (the nearest division mark the liquid is past)
                const certainVal = parseFloat((Math.floor((expectedVal + 1e-9) / minorVal) * minorVal).toFixed(labSession.spec.decimalPlaces - 1 > 0 ? labSession.spec.decimalPlaces - 1 : 0));
                const expectedEstDigit = labSession.targetVal.charAt(labSession.targetVal.length - 1);
                const estValueAlternative = parseFloat(expectedEstDigit) * Math.pow(10, -labSession.spec.decimalPlaces);

                let errors = [];
                if (step1Val && Math.abs(parseFloat(step1Val) - minorVal) > 1e-6) {
                    errors.push(`Step 1 (Value of 1 marking) is incorrect. The divisions are every ${minorVal} ${labSession.spec.unit}.`);
                }
                if (step2Val && Math.abs(parseFloat(step2Val) - certainVal) > 1e-6) {
                    errors.push(`Step 2 (Certain digits) is incorrect. Based on the meniscus level, you should be certain up to ${certainVal} ${labSession.spec.unit}.`);
                }
                if (step3Val && parseFloat(step3Val) !== parseFloat(expectedEstDigit) && Math.abs(parseFloat(step3Val) - estValueAlternative) > 1e-6) {
                    errors.push(`Step 3 (Estimated digit) is incorrect. You should estimate the digit between the markings (expected: ${expectedEstDigit}).`);
                }

                if (errors.length > 0) {
                    scaffoldFeedback = "<br/><strong class='text-red-700'>Scaffold Help:</strong><ul class='list-disc pl-5 mt-1 text-red-600'>" + errors.map(e => `<li>${e}</li>`).join("") + "</ul>";
                } else {
                    scaffoldFeedback = "<br/><span class='text-green-700 font-semibold'>Your scaffolded analysis steps are correct!</span> Re-evaluate how you combined them: reading = (certain digits) + (estimated digit).";
                }
            } else {
                scaffoldFeedback = "<br/><span class='text-gray-500 italic'>Tip: Use the \"Scaffolded Analysis\" fields above to break down your reading step-by-step!</span>";
            }

            setStatus(output, `Incorrect reading value. Re-check the meniscus and graduations. ${scaffoldFeedback}`, "error");
            recordCompetencyAttempt("measurement-precision", false);
            if (window.ChemTutor) {
                window.ChemTutor.invoke(`I am interpreting a lab instrument reading for a ${equipmentSelect.options[equipmentSelect.selectedIndex].text}. I entered ${readingRaw} but the value is off. Walk me through reading this instrument visually and estimating the uncertain digit.`, btnCheck.parentElement, `The user is practicing analog lab readings. Instrument: ${equipmentSelect.options[equipmentSelect.selectedIndex].text}. Expected decimal places: ${labSession.spec.decimalPlaces}. Correct value: ${labSession.targetVal}.`);
            }
            return;
        }

        if (decimalCount !== labSession.spec.decimalPlaces) {
            setStatus(output, `Precision mismatch. You recorded ${decimalCount} decimal place(s), but based on the graduations, you must record certain digits plus ONE estimated digit (total ${labSession.spec.decimalPlaces} decimal places).`, "error");
            // Only here we record a precision measurement failure
            recordCompetencyAttempt("measurement-precision", false);
            window.ChemTutor.invoke(`I am interpreting a lab instrument reading for a ${equipmentSelect.options[equipmentSelect.selectedIndex].text}. I recorded ${decimalCount} decimal places, but I need ${labSession.spec.decimalPlaces} decimal places. Explain the rules of precision and estimated digits for analog lab instruments.`, btnCheck.parentElement, `The user is practicing interpreting analog lab equipment. The instrument is a ${equipmentSelect.options[equipmentSelect.selectedIndex].text}. Measurements require ${labSession.spec.decimalPlaces} decimal places of precision. The correct value is ${labSession.targetVal}.`);
            return;
        }

        setStatus(output, `Excellent! Reading ${readingRaw} is accurate and correctly matches the ${labSession.spec.decimalPlaces} decimal place(s) required by the instrument's uncertainty.`, "ok");
        recordCompetencyAttempt("measurement-precision", true);
        if (window.activeSandboxHandshake && getTabForTarget(window.activeSandboxHandshake.target) === 'lab') {
            completeActiveSandboxHandshake();
        }
        labSession = null;
    });
}

function calculateMolarMass(formula) {
    const atomicWeights = window.ChemData?.elements || {};
    const clean = formula.replace(/\s+/g, "");
    const tokenRegex = /([A-Z][a-z]?)(\d*)/g;

    let totalMass = 0;
    let matchedText = "";
    let match;

    while ((match = tokenRegex.exec(clean)) !== null) {
        const symbol = match[1];
        const count = match[2] ? Number(match[2]) : 1;
        const entry = atomicWeights[symbol];

        matchedText += match[0];
        if (!entry) {
            return { ok: false, message: `Unknown element symbol: ${symbol}` };
        }
        totalMass += entry.mass * count;
    }

    if (!matchedText || matchedText !== clean) {
        return { ok: false, message: "Invalid formula format. Use symbols like H2O, NaCl, CaCO3." };
    }

    return { ok: true, mass: totalMass };
}

function getAllUnits(conversions) {
    const set = new Set();
    Object.values(conversions).forEach((group) => {
        group.forEach((edge) => {
            set.add(edge.from);
            set.add(edge.to);
        });
    });
    return Array.from(set);
}

function convertValue(value, from, to, conversions) {
    const graph = buildConversionGraph(conversions);
    const pathResult = bfsPath(graph, from, to);

    if (!pathResult.ok) {
        return { ok: false, message: `No conversion route from ${from} to ${to}.` };
    }

    let result = value;
    pathResult.edges.forEach((edge) => {
        result *= edge.multiplier;
    });

    return {
        ok: true,
        value: Number(result.toPrecision(10)),
        path: pathResult.path
    };
}

function buildConversionGraph(conversions) {
    const graph = {};
    Object.values(conversions).forEach((group) => {
        group.forEach((item) => {
            if (!graph[item.from]) graph[item.from] = [];
            if (!graph[item.to]) graph[item.to] = [];

            graph[item.from].push({ to: item.to, multiplier: item.factor });
            graph[item.to].push({ to: item.from, multiplier: 1 / item.factor });
        });
    });
    return graph;
}

function bfsPath(graph, from, to) {
    if (!graph[from] || !graph[to]) return { ok: false };

    const queue = [{ unit: from, path: [from], edges: [] }];
    const visited = new Set([from]);

    while (queue.length > 0) {
        const current = queue.shift();
        if (current.unit === to) {
            return { ok: true, path: current.path, edges: current.edges };
        }

        (graph[current.unit] || []).forEach((next) => {
            if (!visited.has(next.to)) {
                visited.add(next.to);
                queue.push({
                    unit: next.to,
                    path: current.path.concat(next.to),
                    edges: current.edges.concat(next)
                });
            }
        });
    }

    return { ok: false };
}

function setStatus(element, text, kind) {
    element.textContent = text;
    element.classList.remove("text-gray-700", "text-rose-700", "text-amber-700", "text-green-700");

    if (kind === "error") {
        element.classList.add("text-rose-700");
        return;
    }
    if (kind === "warn") {
        element.classList.add("text-amber-700");
        return;
    }
    if (kind === "ok") {
        element.classList.add("text-green-700");
        return;
    }
    element.classList.add("text-gray-700");
}

// --- GLOBAL INLINE AI TUTOR ---
window.ChemTutor = (() => {
    const parseMD = (text) => {
        if (typeof text !== 'string') return '';

        // Escape HTML tags to prevent XSS
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Extract code blocks and inline code to protect them
        const codeBlocks = [];
        
        // Match code blocks: ``` ... ```
        html = html.replace(/```(?:javascript|js|chemistry|html|css)?\n([\s\S]*?)\n```/g, (match, code) => {
            const id = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs">${code}</pre>`);
            return id;
        });

        // Match inline backticks: `...`
        html = html.replace(/`([^`\n]+?)`/g, (match, code) => {
            const id = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<code class="bg-gray-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded font-mono text-xs">${code}</code>`);
            return id;
        });

        // Run consolidated math and LaTeX cleanup on the remaining text
        if (window.CLINICAL_TUTOR && typeof window.CLINICAL_TUTOR.cleanMathAndLaTeX === 'function') {
            html = window.CLINICAL_TUTOR.cleanMathAndLaTeX(html);
        } else {
            // Fallback simple clean
            html = html.replace(/\\mathrm\{([^{}]+)\}/g, '$1')
                       .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
                       .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
                       .replace(/([A-Za-z0-9)])_([0-9]+)/g, '$1<sub>$2</sub>')
                       .replace(/([A-Za-z0-9)])\^([0-9+\-]+)/g, '$1<sup>$2</sup>')
                       .replace(/\$\$/g, '')
                       .replace(/\$/g, '');
        }

        // Headers
        html = html.replace(/^####\s+(.*)$/gm, '<h4 class="font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1">$1</h4>');
        html = html.replace(/^###\s+(.*)$/gm, '<h3 class="font-bold text-gray-900 dark:text-white mt-3 mb-2">$1</h3>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italics
        html = html.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        
        // Lists
        html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="ml-5 list-disc marker:text-indigo-500">$1</li>');
        
        // Newlines
        html = html.replace(/\n/g, '<br>');
        
        // Cleanup excessive breaks around block elements
        html = html.replace(/<\/(h3|h4|div|li)><br>/g, '</$1>');
        html = html.replace(/<br><li/g, '<li');
        html = html.replace(/(<br>\s*){2,}/g, '<br><br>');

        // Restore protected code blocks
        codeBlocks.forEach((codeHtml, index) => {
            html = html.replace(`__CODE_BLOCK_${index}__`, codeHtml);
        });

        return html;
    };

    function appendInlineBubble(msgsEl, role, text) {
        const wrap = document.createElement("div");
        const bubble = document.createElement("div");
        if (role === "user") {
            wrap.className = "flex justify-end";
            bubble.className = "max-w-[80%] bg-violet-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm text-xs font-medium";
            bubble.innerHTML = parseMD(text);
        } else {
            wrap.className = "flex justify-start";
            bubble.className = "max-w-[85%] bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm text-xs font-medium text-gray-800";
            if(text) bubble.innerHTML = parseMD(text);
        }
        wrap.appendChild(bubble);
        msgsEl.appendChild(wrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return bubble;
    }

    async function streamOllama(msgsEl, chatHistory, systemContext = "") {
        removeContainerTypingIndicator(msgsEl);
        const typingWrap = createTypingIndicatorElement("ChemTutor", true);
        msgsEl.appendChild(typingWrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;

        let payload = [
            { role: "system", content: "You are Prof. Beaker. Be encouraging, precise, and concise. Explain step by step where the student went wrong. If there are calculations, outline the steps." + (systemContext ? "\n\n[Current App Context:\n" + systemContext + "]" : "") }, 
            ...chatHistory
        ];
        
        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: localStorage.getItem("chemistry_llm") || "gemma4:e4b", messages: payload, stream: true })
            });
            if (!response.ok) throw new Error("HTTP error");

            let assistantText = "";
            let firstToken = true;
            let bubble = null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            if (firstToken) {
                                typingWrap.remove();
                                bubble = appendInlineBubble(msgsEl, "assistant", "");
                                firstToken = false;
                            }
                            assistantText += data.message.content;
                            bubble.innerHTML = parseMD(assistantText);
                            msgsEl.scrollTop = msgsEl.scrollHeight;
                        }
                        if (data.done) break;
                    } catch {}
                }
            }
            if (firstToken) {
                typingWrap.remove();
            }
            chatHistory.push({ role: "assistant", content: assistantText });
        } catch (e) {
            typingWrap.remove();
            appendInlineBubble(msgsEl, "assistant", "Could not connect to Ollama on localhost:11434.");
        }
    }

    return {
        // Asks a question, spawning the inline tutor below `containerEl`
        invoke: (initialPrompt, containerEl, systemContext = "") => {
            if (!containerEl) return;
            // Check if widget already exists here, don't spawn multiple
            if (containerEl.nextElementSibling && containerEl.nextElementSibling.classList?.contains('inline-tutor-widget')) {
                return; // Already open
            }

            const template = document.getElementById("inline-tutor-template");
            if (!template) return;

            const clone = template.content.cloneNode(true);
            const widget = clone.querySelector('.inline-tutor-widget');
            const msgsEl = clone.querySelector('.tutor-messages');
            const input = clone.querySelector('.tutor-input');
            const sendBtn = clone.querySelector('.tutor-send');
            const closeBtn = clone.querySelector('.tutor-close');
            
            let history = [];

            // Bind UI
            closeBtn.addEventListener('click', () => widget.remove());
            
            const handleSend = () => {
                const text = input.value.trim();
                if (!text) return;
                appendInlineBubble(msgsEl, "user", text);
                history.push({ role: "user", content: text });
                input.value = "";
                streamOllama(msgsEl, history, systemContext);
            };

            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleSend(); });

            // Inject into DOM
            containerEl.after(widget);

            // Auto-fire the initial prompt
            appendInlineBubble(msgsEl, "user", initialPrompt);
            history.push({ role: "user", content: initialPrompt });
            streamOllama(msgsEl, history, systemContext);
        }
    };
})();

function updateIndexMasteryProgress() {
    const matrixRaw = localStorage.getItem('masteryMatrix');
    if (!matrixRaw) return;

    try {
        const matrix = JSON.parse(matrixRaw);
        
        let totalLessons = 30; // fallback default
        let masteredCount = 0;
        let activeCount = 0;
        
        if (window.syllabusData) {
            totalLessons = 0;
            window.syllabusData.modules.forEach(mod => {
                window.syllabusData.lessonsByModule[mod.id].forEach(l => {
                    totalLessons++;
                    const status = matrix[l.id];
                    if (status) {
                        if (status.state === 3 || status.state === 4) { // STATE_MASTERED = 3, STATE_RUSTED = 4
                            masteredCount++;
                        }
                        if (status.state >= 1) { // STATE_ACTIVE, STATE_HW_PENDING, STATE_MASTERED, STATE_RUSTED
                            activeCount++;
                        }
                    }
                });
            });
        } else {
            Object.values(matrix).forEach(item => {
                if (item) {
                    if (item.state === 3 || item.state === 4) {
                        masteredCount++;
                    }
                    if (item.state >= 1) {
                        activeCount++;
                    }
                }
            });
        }
        
        const cwPercentage = totalLessons > 0 ? Math.round((activeCount / totalLessons) * 100) : 0;
        const hwPercentage = totalLessons > 0 ? Math.round((masteredCount / totalLessons) * 100) : 0;
        
        const cwBar = document.getElementById('index-cw-progress-bar');
        const cwVal = document.getElementById('index-cw-progress-val');
        const hwBar = document.getElementById('index-hw-progress-bar');
        const hwVal = document.getElementById('index-hw-progress-val');
        
        if (cwBar) cwBar.style.width = `${cwPercentage}%`;
        if (cwVal) cwVal.textContent = `${cwPercentage}% Unlocked`;
        if (hwBar) hwBar.style.width = `${hwPercentage}%`;
        if (hwVal) hwVal.textContent = `${hwPercentage}% Accredited`;
    } catch (e) {
        console.error("Error updating index mastery progress:", e);
    }
}

// ==========================================
// COURSEWORK SANDBOX HANDSHAKE SYSTEM
// ==========================================

function handleCourseworkSandboxHandshake() {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lessonId');
    const target = params.get('target');
    
    if (!lessonId || !target) return;
    
    // Store globally so the tools can check and report completion
    window.activeSandboxHandshake = { lessonId, target };
    
    // Map target to tab
    const tabId = getTabForTarget(target);
    if (tabId && typeof window.activateChemTab === 'function') {
        window.activateChemTab(tabId);
    }
    
    // Pre-populate temperature converter inputs if matching target
    if (tabId === 'dimensions' && target.toLowerCase().includes('temperature')) {
        const fromSelect = document.getElementById('da-from');
        const toSelect = document.getElementById('da-to');
        const valueInput = document.getElementById('da-value');
        if (fromSelect && toSelect && valueInput) {
            fromSelect.value = '°C';
            toSelect.value = 'K';
            valueInput.value = '25';
        }
    }
    
    // Show a beautiful, premium instruction banner
    showSandboxHandshakeBanner(lessonId, target, tabId);
}

function showSandboxHandshakeBanner(lessonId, target, tabId) {
    const existing = document.getElementById('sandbox-handshake-banner');
    if (existing) existing.remove();
    
    // Inject custom animation styles if they do not exist
    const styleId = 'sandbox-handshake-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOutDown {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
            .animate-slide-down {
                animation: slideDown 0.3s ease-out forwards;
            }
            .animate-fade-in-up {
                animation: fadeInUp 0.4s ease-out forwards;
            }
            .animate-fade-out-down {
                animation: fadeOutDown 0.4s ease-in forwards;
            }
        `;
        document.head.appendChild(style);
    }
    
    const banner = document.createElement('div');
    banner.id = 'sandbox-handshake-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 shadow-xl z-50 flex items-center justify-between border-b border-blue-400 font-sans animate-slide-down';
    
    const friendlyTabs = {
        'nomenclature': 'Nomenclature Flashcards',
        'molar': 'Molar Mass Calculator',
        'dimensions': 'Dimensional Analysis Builder',
        'stoich': 'Reaction & Stoichiometry',
        'sigfigs': 'Significant Figures Math Trainer',
        'lab': 'Lab Precision Trainer'
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
    
    const tabName = friendlyTabs[tabId] || 'Skills Lab';
    const action = targetDescriptions[target] || 'interact with the calculations and submit a correct solution.';
    
    banner.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="bg-white/20 p-1.5 rounded-full text-white">
                <i class="fa-solid fa-gamepad animate-bounce"></i>
            </div>
            <div class="text-sm col-span-1">
                <span class="font-bold">Active Coursework Handshake (Lesson ${escapeHtml(lessonId)}):</span> 
                In the <span class="underline font-semibold">${escapeHtml(tabName)}</span> tool, please <span class="font-semibold text-yellow-300">${action}</span>
            </div>
        </div>
        <button id="btn-close-handshake-banner" class="text-white/80 hover:text-white transition ml-4 text-xs font-semibold px-2 py-1 bg-white/10 rounded hover:bg-white/20">
            Cancel
        </button>
    `;
    
    document.body.appendChild(banner);
    document.body.style.paddingTop = '52px';
    
    document.getElementById('btn-close-handshake-banner').addEventListener('click', () => {
        banner.remove();
        document.body.style.paddingTop = '';
        window.activeSandboxHandshake = null;
    });
}

function completeActiveSandboxHandshake() {
    if (!window.activeSandboxHandshake) return;
    
    const { lessonId } = window.activeSandboxHandshake;
    
    // Set in localStorage to trigger storage listener on coursework tab
    localStorage.setItem(`sandbox_complete_${lessonId}`, 'true');
    
    // Show premium success toast
    showSandboxSuccessToast(lessonId);
    
    // Clean up
    window.activeSandboxHandshake = null;
    const banner = document.getElementById('sandbox-handshake-banner');
    if (banner) banner.remove();
    document.body.style.paddingTop = '';
}

function showSandboxSuccessToast(lessonId) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-emerald-600 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 border border-emerald-400 font-sans animate-fade-in-up max-w-sm';
    toast.innerHTML = `
        <div class="bg-white/20 p-2 rounded-full text-white text-lg">
            <i class="fa-solid fa-circle-check"></i>
        </div>
        <div>
            <h5 class="font-bold text-sm">Sandbox Stage Unlocked!</h5>
            <p class="text-xs text-emerald-100">You completed the handshake for Lesson ${escapeHtml(lessonId)}. Return to the coursework tab to proceed.</p>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out-down');
        setTimeout(() => toast.remove(), 500);
    }, 6000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
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

function initGlobalTooltip() {
    const tooltip = document.getElementById("chem-tooltip");
    if (!tooltip) return;
    const nameEl = document.getElementById("chem-tooltip-name");
    const massEl = document.getElementById("chem-tooltip-mass");
    const arrowEl = document.getElementById("chem-tooltip-arrow");
    if (!nameEl || !massEl || !arrowEl) return;
    
    let activeTrigger = null;
    let fadeTimeout = null;
    
    const showTooltip = (target) => {
        if (fadeTimeout) {
            clearTimeout(fadeTimeout);
            fadeTimeout = null;
        }
        
        const name = target.getAttribute("data-tooltip-name");
        const mass = target.getAttribute("data-tooltip-mass");
        if (!name) return;
        
        nameEl.textContent = name;
        if (mass) {
            massEl.textContent = `Mass: ${mass} g/mol`;
            massEl.classList.remove("hidden");
        } else {
            massEl.classList.add("hidden");
        }
        
        tooltip.classList.remove("hidden");
        
        // Reset positions to get clean bounds
        tooltip.style.left = "0px";
        tooltip.style.top = "0px";
        
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Center horizontally and offset vertically
        let top = rect.top - tooltipRect.height - 8;
        let placeBelow = false;
        
        if (top < 8) {
            top = rect.bottom + 8;
            placeBelow = true;
        }
        
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        if (left < 8) {
            left = 8;
        } else if (left + tooltipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        
        // Style Arrow depending on position
        if (placeBelow) {
            arrowEl.className = "absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-slate-900/95 dark:border-b-slate-800/95";
        } else {
            arrowEl.className = "absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95";
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        tooltip.classList.remove("opacity-0", "scale-95");
        tooltip.classList.add("opacity-100", "scale-100");
        activeTrigger = target;
    };
    
    const hideTooltip = () => {
        tooltip.classList.remove("opacity-100", "scale-100");
        tooltip.classList.add("opacity-0", "scale-95");
        
        if (fadeTimeout) clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => {
            if (tooltip.classList.contains("opacity-0")) {
                tooltip.classList.add("hidden");
            }
        }, 150);
        activeTrigger = null;
    };
    
    document.addEventListener("mouseover", (e) => {
        const trigger = e.target.closest(".chem-tooltip-trigger");
        if (trigger) {
            showTooltip(trigger);
        }
    });
    
    document.addEventListener("mouseout", (e) => {
        const trigger = e.target.closest(".chem-tooltip-trigger");
        if (trigger && activeTrigger === trigger) {
            hideTooltip();
        }
    });
    
    document.addEventListener("focusin", (e) => {
        const trigger = e.target.closest(".chem-tooltip-trigger");
        if (trigger) {
            showTooltip(trigger);
        }
    });
    
    document.addEventListener("focusout", (e) => {
        const trigger = e.target.closest(".chem-tooltip-trigger");
        if (trigger && activeTrigger === trigger) {
            hideTooltip();
        }
    });
    
    window.addEventListener("scroll", hideTooltip, { passive: true });
    window.addEventListener("resize", hideTooltip, { passive: true });
}
