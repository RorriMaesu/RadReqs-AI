const CHEM_STATE_KEY = "chemistry_learning_state_v1";
let learningState = null;
let activateChemTab = () => {};
let diagnosticSession = null;

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
    bindLabActions();
    bindDiagnosticActions();
    bindTutorActions();
    renderCompetencyMap();
    renderLearningStatus();
    renderDiagnosticState();
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

function bindDarkModeToggle() {
    const btn = document.getElementById("btn-darkmode");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const root = document.documentElement;
        root.classList.toggle("dark");
        localStorage.setItem("chemistry_darkmode", String(root.classList.contains("dark")));
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
    checkStatus();

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
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Math blocks $$ ... $$
        html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="text-center font-mono my-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 py-1 rounded">$1</div>');
        // Inline math $ ... $
        html = html.replace(/\$([^\n]+?)\$/g, '<span class="font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">$1</span>');
        // Headers
        html = html.replace(/^####\s+(.*)$/gm, '<h4 class="font-bold text-gray-800 dark:text-gray-200 mt-3 mb-1">$1</h4>');
        html = html.replace(/^###\s+(.*)$/gm, '<h3 class="font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>');
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italics (negative lookbehind/lookahead for proper emphasis handling)
        html = html.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        // Lists
        html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="ml-5 list-disc marker:text-indigo-500">$1</li>');
        // Newlines
        html = html.replace(/\n/g, '<br>');
        // Cleanup excessive breaks around block elements
        html = html.replace(/<\/(h3|h4|div|li)><br>/g, '</$1>');
        html = html.replace(/<br><li/g, '<li');
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

        const typingId = "main-typing";
        const typingWrap = document.createElement("div");
        typingWrap.id = typingId;
        typingWrap.className = "flex justify-start";
        typingWrap.innerHTML = `<div class="bg-white border border-gray-100 px-4 py-3 rounded-3xl rounded-bl-lg flex items-center space-x-1"><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div></div>`;
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
            document.getElementById(typingId)?.remove();

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
            chatHistory.push({ role: "assistant", content: assistantText });
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } catch (e) {
            document.getElementById(typingId)?.remove();
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
            // Forward factor
            const f1 = document.createElement("option");
            f1.value = JSON.stringify({ numVal: edge.factor, numUnit: edge.from, denVal: 1, denUnit: edge.to });
            f1.textContent = `${edge.factor} ${edge.from} / 1 ${edge.to}`;
            
            // Reverse factor
            const f2 = document.createElement("option");
            f2.value = JSON.stringify({ numVal: 1, numUnit: edge.to, denVal: edge.factor, denUnit: edge.from });
            f2.textContent = `1 ${edge.to} / ${edge.factor} ${edge.from}`;
            
            factorBank.appendChild(f1);
            factorBank.appendChild(f2);
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
            frac.innerHTML = `
                <div class="text-gray-800 font-bold border-b-2 border-gray-800 px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">${factor.numVal} ${factor.numUnit}</div>
                <div class="text-gray-800 font-bold px-2 py-1 text-center min-w-[3rem] whitespace-nowrap">${factor.denVal} ${factor.denUnit}</div>
            `;
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
            finalValue = (finalValue * factor.numVal) / factor.denVal;
            // The unit transitions to the numerator's unit
            currentUnit = factor.numUnit;
        }
        
        if (currentUnit !== toSelect.value) {
            setStatus(output, `Chain valid so far, but you ended up with '${currentUnit}' instead of the target '${toSelect.value}'.`, "warn");
            recordCompetencyAttempt("dim-analysis", false);
            window.ChemTutor.invoke(`I successfully cancelled all my units, but I ended up with '${currentUnit}' instead of my final target unit '${toSelect.value}'. Guidd me on what additional conversion steps I need.`, document.getElementById("da-output"), `The user is practicing Dimensional Analysis. Target unit: ${toSelect.value}. Current chain of conversion factors applied: ${JSON.stringify(daChain)}.`);
            return;
        }
        
        setStatus(output, `Correct! The units cross-cancel perfectly. Result: ${finalValue.toPrecision(6)} ${toSelect.value}`, "ok");
        recordCompetencyAttempt("dim-analysis", true);
    });
}

let labSession = null;

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
        currentRxn = rxns[Math.floor(Math.random() * rxns.length)];
        
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
                inputs.push(inp);
                
                const span = document.createElement("span");
                span.textContent = mol;
                
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
        let allCorrect = true;
        inputs.forEach((inp, idx) => {
            if (parseInt(inp.value, 10) !== currentRxn.coefficients[idx]) {
                allCorrect = false;
                inp.classList.add("text-rose-600");
            } else {
                inp.classList.remove("text-rose-600");
                inp.classList.add("text-green-600");
                inp.disabled = true;
            }
        });

        if (allCorrect) {
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
                molarMasses: molarMassesStr
            };
            
            scenarioContainer.classList.remove("hidden");
            promptEl.textContent = currentRxn.activeScenario.prompt;
            readingInput.value = "";
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
    formatted = formatted.replace(/(?<!^)(?<!�\s*)([A-Za-z\)])(\d+)(?!\s*<)/g, "$1<sub>$2</sub>");
    return formatted;
}

function bindNomenclatureActions() {
    const card = document.getElementById("fc-card");
    const innerCard = card ? card.querySelector(".flip-card-inner") : null;
    const front = document.getElementById("fc-front");
    const back = document.getElementById("fc-back");
    const frontRepeat = document.getElementById("fc-front-repeat");
    const controls = document.getElementById("fc-controls");
    
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
    const fcRule = document.getElementById("fc-rule"); // Added rule container

    if (!card || !window.ChemData || !window.ChemData.nomenclature) return;

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

    const STATE_KEY = 'chem_nomen_srs_state_v2';
    let srsState = JSON.parse(localStorage.getItem(STATE_KEY)) || {
        intervals: {},
        dueDates: {},
        easeFactors: {},
        lapses: {}
    };

    function saveState() {
        localStorage.setItem(STATE_KEY, JSON.stringify(srsState));
    }

    function calculateFutureInterval(cardId, grade) {
        const currentInterval = srsState.intervals[cardId] || 0;
        const currentEase = srsState.easeFactors[cardId] || 2.5;

        let newInterval;
        if (grade === 0) {
            newInterval = currentInterval >= 7 ? Math.round(currentInterval * 0.5) : 0;
        } else if (grade === 1) {
            if (currentInterval === 0) newInterval = 1;
            else if (currentInterval === 1) newInterval = 2;
            else newInterval = Math.round(currentInterval * 1.2);
        } else if (grade === 2) {
            if (currentInterval === 0) newInterval = 1;
            else if (currentInterval === 1) newInterval = 3;
            else newInterval = Math.round(currentInterval * currentEase);
        } else if (grade === 3) {
            if (currentInterval === 0) newInterval = 3;
            else if (currentInterval === 1) newInterval = 5;
            else newInterval = Math.round(currentInterval * currentEase * 1.3);
        }
        return newInterval;
    }

    function formatInterval(days) {
        if (days === 0) return "< 1m";
        if (days < 30) return days + "d";
        if (days < 365) return Math.round(days / 30) + "mo";
        return Math.round(days / 365) + "y";
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function getNextCard() {
        const poolData = nomData[currentCategory] || [];
        const now = Date.now();
        
        const allCards = [];
        poolData.forEach(c => {
            allCards.push({ ...c, direction: 'F2N', id: c.formula + '-F2N' });
            allCards.push({ ...c, direction: 'N2F', id: c.formula + '-N2F' });
        });

        let dueCards = allCards.filter(c => {
            const due = srsState.dueDates[c.id];
            return due && due <= now;
        });

        let newCards = allCards.filter(c => !srsState.dueDates[c.id]);

        let pool;
        if (dueCards.length > 0) {
            pool = shuffleArray(dueCards);
        } else if (newCards.length > 0) {
            pool = shuffleArray(newCards);
        } else {
            pool = shuffleArray(allCards);
        }

        if (pool.length === 0) return { id: "Done-F2N", formula: "Done", name: "Change category!", direction: 'F2N' };
        return pool[0];
    }

    function renderCard() {
        currentCardData = getNextCard();
        isFlipped = false;
        
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
        else if (grade === 3) ease += 0.15;

        if (grade === 0) {
            srsState.lapses[cardId] = (srsState.lapses[cardId] || 0) + 1;
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
        
        saveState();
        
        // FIX: hide controls and unflip BEFORE rendering next card to avoid flashing answers
        card.classList.remove("flipped");
        controls.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        controls.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        
        setTimeout(() => {
            renderCard();
        }, 400); // Wait 400ms for CSS flip transition to finish
    }

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

    if (fcAskTutor) {
        fcAskTutor.addEventListener("click", (e) => {
            e.stopPropagation();
            window.ChemTutor.invoke(`I am struggling with flashcard: Formula '${currentCardData.formula}', Name '${currentCardData.name}'. Explain rule, prefix/suffix, or provide a mnemonic hook.`, controls, `The user is practicing Chemical Nomenclature flashcards in category "${currentCategory}". Current formula: ${currentCardData.formula}, name: ${currentCardData.name}.`);
        });
    }
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
            return `<div class="bg-gray-800 p-6 rounded-lg text-green-400 font-mono text-4xl shadow-inner text-center border-4 border-gray-900 mx-auto max-w-[300px]">${value.toFixed(spec.decimalPlaces)} ${spec.unit}</div>`;
        }

        const major = spec.majorIncrement;
        const minor = spec.minorIncrement;
        const isBurette = !!spec.inverted;
        const isQualitative = !!spec.qualitative;

        let minDraw = Math.floor(value / major) * major - major;
        let maxDraw = Math.floor(value / major) * major + major * 2;
        if (minDraw < spec.min) minDraw = spec.min;
        if (maxDraw > spec.max) maxDraw = spec.max;

        const tickSpacing = 20;
        const totalMinorTicks = Math.round((maxDraw - minDraw) / minor);
        const h = totalMinorTicks * tickSpacing;

        let pathMarks = "";
        let textMarks = "";

        for (let i = 0; i <= totalMinorTicks; i++) {
            const currentVal = isBurette ? (maxDraw - i * minor) : (minDraw + i * minor);
            const y = i * tickSpacing + 30;
            const rem = currentVal % major;
            const isMajor = Math.abs(rem) < 1e-6 || Math.abs(rem - major) < 1e-6;
            const lineLength = isMajor ? 50 : 25;

            pathMarks += `<line x1="50" y1="${y}" x2="${50 + lineLength}" y2="${y}" stroke="black" stroke-width="${isMajor ? 2 : 1}" />`;
            if (isMajor) {
                const dp = (major.toString().includes(".")) ? major.toString().split(".")[1].length : 0;
                textMarks += `<text x="10" y="${y + 4}" fill="black" font-size="13" font-family="monospace" class="select-none">${currentVal.toFixed(dp)}</text>`;
            }
        }

        const liquidColor = isQualitative ? "rgba(59, 130, 246, 0.4)" : "rgba(167, 139, 250, 0.3)";
        const meniscusY = 30 + (isBurette ? ((maxDraw - value) / minor) * tickSpacing : ((value - minDraw) / minor) * tickSpacing);

        let fillY;
        let fillHeight;
        if (isBurette) {
            fillY = 0;
            fillHeight = meniscusY;
        } else {
            fillY = meniscusY;
            fillHeight = Math.max(h + 60 - meniscusY, 0);
        }

        const curveDepth = isBurette ? 8 : 12;
        const fillPath = `<path d="M 40 ${fillY} Q 75 ${fillY + curveDepth} 110 ${fillY} L 110 ${fillY + fillHeight + 10} L 40 ${fillY + fillHeight + 10} Z" fill="${liquidColor}" />`;
        const meniscusPath = `<path d="M 40 ${meniscusY} Q 75 ${meniscusY + curveDepth} 110 ${meniscusY}" fill="none" stroke="rgba(79, 70, 229, 0.8)" stroke-width="2" />`;

        return `<svg width="150" height="${h + 60}" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="0" width="70" height="${h + 60}" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" rx="5" />
            ${fillPath}
            ${meniscusPath}
            ${pathMarks}
            ${textMarks}
        </svg>`;
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
            setStatus(output, "Incorrect reading value. Re-check the meniscus and graduations.", "error");
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
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Math blocks $$ ... $$ using KaTeX (fallback to mono blocks if katex missing)
        html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
            if (typeof katex !== 'undefined') {
                try {
                    return `<div class="my-3 overflow-x-auto text-center">` + katex.renderToString(mathContent, { displayMode: true, throwOnError: false }) + `</div>`;
                } catch (e) { }
            }
            return `<div class="text-center font-mono my-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 py-1 rounded overflow-x-auto">${mathContent}</div>`;
        });

        // Inline math $ ... $ using KaTeX
        html = html.replace(/\$([^\n\$]+?)\$/g, (match, mathContent) => {
            if (typeof katex !== 'undefined') {
                try {
                    return katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
                } catch (e) { }
            }
            return `<span class="font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded mx-0.5">${mathContent}</span>`;
        });

        // Headers
        html = html.replace(/^####\s+(.*)$/gm, '<h4 class="font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1">$1</h4>');
        html = html.replace(/^###\s+(.*)$/gm, '<h3 class="font-bold text-gray-900 dark:text-white mt-3 mb-2">$1</h3>');
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italics (negative lookbehind/lookahead for proper emphasis handling)
        html = html.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        // Lists
        html = html.replace(/^[\*\-]\s+(.*)$/gm, '<li class="ml-5 list-disc marker:text-indigo-500">$1</li>');
        // Newlines
        html = html.replace(/\n/g, '<br>');
        // Cleanup excessive breaks around block elements
        html = html.replace(/<\/(h3|h4|div|li)><br>/g, '</$1>');
        html = html.replace(/<br><li/g, '<li');
        // Cleanup double <br>
        html = html.replace(/(<br>\s*){2,}/g, '<br><br>');
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
        const typingWrap = document.createElement("div");
        typingWrap.className = "flex justify-start inline-typing";
        typingWrap.innerHTML = `<div class="bg-gray-100 px-3 py-2 rounded-2xl flex items-center space-x-1 border border-gray-200 mt-1"><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div><div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div></div>`;
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
            typingWrap.remove();

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
