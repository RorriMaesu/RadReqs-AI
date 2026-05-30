/**
 * Psychology & Care Simulator - Application Logic
 * Implements interactive clinical engines and AI integration.
 */

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Randomize the curriculum so it's fresh every session
    if (typeof psychData !== 'undefined') {
        if (psychData.chartScenarios) shuffleArray(psychData.chartScenarios);
        if (psychData.jargonScenarios) shuffleArray(psychData.jargonScenarios);
        if (psychData.deescalationTrees) shuffleArray(psychData.deescalationTrees);
        if (psychData.ehrScenarios) shuffleArray(psychData.ehrScenarios);
    }

    initChartAuditor();
    initJargonFilter();
    initDeescalation();
    initEhrAuditor();
    
    // Hook into the tab switcher from index.html to manage timers
    const oldActivate = window.activatePsychTab;
    window.activatePsychTab = function(tabId) {
        if (oldActivate) oldActivate(tabId);
        if (tabId === 'deescalation' && !deescActive && currentDeescIndex < psychData.deescalationTrees.length) {
            startDeescalationScenario(psychData.deescalationTrees[currentDeescIndex].id);
        } else if (tabId !== 'deescalation') {
            clearInterval(deescTimer);
            deescActive = false;
        }
    };
});

// ==========================================
// GLOBALS & UTILS
// ==========================================
let empathyScore = 0;
let crisesResolved = 0;
let totalCrises = psychData.deescalationTrees ? psychData.deescalationTrees.length : 1; 
let deescCompleted = false;

function updateDashboard() {
    // Update dashboard UI elements safely
    const empathyText = document.getElementById('dash-empathy-text');
    const empathyBar = document.getElementById('dash-empathy-bar');
    const crisesText = document.getElementById('dash-crises-text');
    
    if(empathyText) empathyText.textContent = empathyScore + '%';
    if(empathyBar) empathyBar.style.width = empathyScore + '%';
    if(crisesText) crisesText.textContent = `${crisesResolved} / ${totalCrises}`;
}

function getPsychModel() {
    if (typeof window.getActiveModel === 'function') {
        return window.getActiveModel('psych_llm');
    }
    return localStorage.getItem('psych_llm') || localStorage.getItem('syngnosia_tutor_model') || 'gemma4:e4b';
}

function pickAvailableModel(requestedModel, models) {
    if (!Array.isArray(models) || models.length === 0) return requestedModel;
    const names = models.map((m) => (typeof m?.name === 'string' ? m.name : '')).filter(Boolean);
    if (names.length === 0) return requestedModel;
    if (names.includes(requestedModel)) return requestedModel;
    const prefix = names.find((name) => name.startsWith(requestedModel));
    if (prefix) return prefix;
    return names[0];
}

/**
 * Reusable fetch hook for local Ollama integration.
 * Gracefully falls back to null if offline.
 */
async function fetchLocalAI(systemPrompt, userInput, jsonFormat = false) {
    let targetModel = getPsychModel();
    try {
        const requestOptions = {
            num_predict: 150,
            num_ctx: 1024
        };
        if (targetModel.toLowerCase().includes('gemma4')) {
            requestOptions.draft_num_predict = 4;
        }
        let payload = {
            model: targetModel,
            prompt: `${systemPrompt}\n\nStudent Input: "${userInput}"`,
            stream: false,
            options: requestOptions
        };
        if (jsonFormat) payload.format = 'json';

        let response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.status === 404) {
            const tagsRes = await fetch("http://localhost:11434/api/tags");
            if (tagsRes.ok) {
                const tagsData = await tagsRes.json();
                if (tagsData.models && tagsData.models.length > 0) {
                    targetModel = pickAvailableModel(targetModel, tagsData.models);
                    localStorage.setItem("psych_llm", targetModel);
                    payload.model = targetModel;
                    if (targetModel.toLowerCase().includes('gemma4')) {
                        payload.options.draft_num_predict = 4;
                    } else {
                        delete payload.options.draft_num_predict;
                    }
                    response = await fetch('http://localhost:11434/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }
            }
        }
        
        if (!response.ok) throw new Error('Network response not ok');
        const data = await response.json();
        return data.response;
    } catch (error) {
        if (window.gnosysActiveModelsCache) {
            delete window.gnosysActiveModelsCache[targetModel];
        }
        console.warn('Local LLM is offline or returned an error. Using hardcoded clinical logic fallback.', error);
        return null;
    }
}

// ==========================================
// MODULE 1: CHART AUDITOR
// ==========================================
let currentChartIndex = 0;

function initChartAuditor() {
    loadChart(0);
    const btnSubmit = document.getElementById('btn-submit-chart');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            currentChartIndex++;
            if (currentChartIndex < psychData.chartScenarios.length) {
                loadChart(currentChartIndex);
            } else {
                alert("All charts audited successfully! You may proceed to patient interactions.");
                btnSubmit.disabled = true;
                btnSubmit.textContent = "All Charts Complete";
            }
        });
    }
}

function loadChart(index) {
    const scenario = psychData.chartScenarios[index];
    const contentDiv = document.getElementById('chart-content');
    const btnSubmit = document.getElementById('btn-submit-chart');
    
    if (!scenario || !contentDiv) return;
    
    contentDiv.innerHTML = `<div class="mb-4 text-sm font-bold text-gray-500 dark:text-slate-400">Patient: ${scenario.patient}</div>` + scenario.text;
    btnSubmit.disabled = true;
    
    let flagsFound = 0;
    const spans = contentDiv.querySelectorAll('.highlight-pending');
    
    spans.forEach(span => {
        span.addEventListener('click', function() {
            if (this.classList.contains('highlight-red') || this.classList.contains('highlight-green')) return; // already clicked
            
            const isRedFlag = this.getAttribute('data-flag') === 'true';
            
            this.classList.remove('highlight-pending');
            
            if (isRedFlag) {
                this.classList.add('highlight-red');
                flagsFound++;
                
                // Show reason tooltip
                const reason = this.getAttribute('data-reason');
                if(reason) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'mt-2 mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300 shadow-sm animate-fade-in block';
                    tooltip.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> <strong>Clinical Alert:</strong> ${reason}`;
                    
                    // Insert immediately after the paragraph containing the span
                    let container = this.closest('p') || this.parentNode;
                    container.insertBefore(tooltip, this.nextSibling);
                }
                
                // Check if all flags found
                if (flagsFound >= scenario.redFlagCount) {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                    btnSubmit.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                    btnSubmit.innerHTML = 'Proceed to Patient <i class="fa-solid fa-arrow-right ml-2"></i>';
                }
            } else {
                this.classList.add('highlight-green');
            }
        });
    });
}

// ==========================================
// MODULE 2: JARGON FILTER
// ==========================================
let currentJargonIndex = 0;

function initJargonFilter() {
    loadJargonScenario(0);
    const btnSubmit = document.getElementById('btn-submit-jargon');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', evaluateJargon);
    }
    const btnNext = document.getElementById('btn-next-jargon');
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            currentJargonIndex++;
            if (currentJargonIndex < psychData.jargonScenarios.length) {
                loadJargonScenario(currentJargonIndex);
            } else {
                alert("All jargon scenarios complete!");
                btnNext.disabled = true;
                btnNext.innerHTML = 'All Scenarios Complete <i class="fa-solid fa-check ml-2"></i>';
            }
        });
    }
}

function loadJargonScenario(index) {
    const promptEl = document.getElementById('jargon-prompt');
    if (promptEl && psychData.jargonScenarios[index]) {
        promptEl.innerHTML = `<span class="font-bold text-indigo-600">Scenario:</span> ${psychData.jargonScenarios[index]}`;
    }
    document.getElementById('jargon-input').value = '';
    
    const feedbackDiv = document.getElementById('jargon-feedback');
    if(feedbackDiv) feedbackDiv.classList.add('hidden');
    
    const btnNext = document.getElementById('btn-next-jargon');
    const btnSubmit = document.getElementById('btn-submit-jargon');
    if(btnNext) btnNext.classList.add('hidden');
    if(btnSubmit) {
        btnSubmit.classList.remove('hidden');
        btnSubmit.disabled = false;
    }
}

async function evaluateJargon() {
    const input = document.getElementById('jargon-input').value.trim();
    if (!input) return;
    
    const feedbackDiv = document.getElementById('jargon-feedback');
    const renderedText = document.getElementById('jargon-rendered-text');
    const scoreText = document.getElementById('jargon-score');
    const submitBtn = document.getElementById('btn-submit-jargon');
    
    // UI state
    feedbackDiv.classList.remove('hidden');
    renderedText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Evaluating response...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50');
    
    // AI Integration attempt
    const aiPrompt = "You are an expert clinical psychologist evaluating a radiologic technologist. Evaluate the following explanation for an anxious patient. Provide a score from 0-100 based on empathy and lack of terrifying medical jargon. Be strict. Return ONLY a valid JSON object in this exact format: {\"score\": 85, \"feedback\": \"Brief 1-sentence explanation\"}";
    let aiResponse = await fetchLocalAI(aiPrompt, input, true);
    
    // Hardcoded logic fallback & parsing
    let blacklistCount = 0;
    let whitelistCount = 0;
    
    // Simple tokenizer
    let words = input.split(/(\b[a-zA-Z]+\b)/);
    let htmlOutput = [];
    
    words.forEach(word => {
        const cleanWord = word.toLowerCase();
        if (psychData.jargonDictionary.blacklist.includes(cleanWord)) {
            blacklistCount++;
            htmlOutput.push(`<span class="highlight-red px-1 rounded">${word}</span>`);
        } else if (psychData.jargonDictionary.whitelist.includes(cleanWord)) {
            whitelistCount++;
            htmlOutput.push(`<span class="highlight-green px-1 rounded">${word}</span>`);
        } else {
            htmlOutput.push(word); // Keep punctuation and spaces as is
        }
    });
    
    renderedText.innerHTML = htmlOutput.join('');
    
    // Calculate Base Score (0 to 100)
    let score = 50 + (whitelistCount * 10) - (blacklistCount * 25);
    score = Math.max(0, Math.min(100, score));
    
    // Parse AI Score if available
    if (aiResponse) {
        try {
            // Because the LLM might wrap JSON in markdown blocks, we clean it first
            const cleanJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            score = parseInt(parsed.score);
            renderedText.innerHTML += `<div class="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl dark:bg-indigo-900/30 dark:border-indigo-800 text-sm"><strong>AI Analysis:</strong> ${parsed.feedback}</div>`;
        } catch(e) {
            console.error("Failed to parse JSON from Jargon AI", e);
        }
    } else {
        renderedText.innerHTML += `<div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400"><em>Local LLM offline. Evaluated using hardcoded clinical dictionary.</em></div>`;
    }
    
    empathyScore = score;
    updateDashboard();
    
    // Update Score UI
    let interval = setInterval(() => {
        let current = parseInt(scoreText.textContent) || 0;
        if (current < score) {
            scoreText.textContent = current + 1;
        } else if (current > score) {
            scoreText.textContent = current - 1;
        } else {
            clearInterval(interval);
            
            // Set Color based on final score
            if (score >= 70) {
                scoreText.className = 'text-2xl font-bold text-emerald-600 dark:text-emerald-400';
            } else if (score >= 40) {
                scoreText.className = 'text-2xl font-bold text-amber-600 dark:text-amber-400';
            } else {
                scoreText.className = 'text-2xl font-bold text-rose-600 dark:text-rose-400';
            }
        }
    }, 15);
    
    submitBtn.disabled = false;
    submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('btn-next-jargon');
    if (nextBtn) nextBtn.classList.remove('hidden');
}

// ==========================================
// MODULE 3: TIMED DE-ESCALATION
// ==========================================
let deescTimer;
let deescTimeLeft = 10.0;
let deescActive = false;
let currentTacticScenario = null;
let currentDeescIndex = 0;

function initDeescalation() {
    document.getElementById('btn-submit-deesc').addEventListener('click', evaluateDeescalationVerbal);
    
    // Also support 'Enter' key for submission
    document.getElementById('deesc-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') evaluateDeescalationVerbal();
    });

    document.getElementById('btn-next-deesc').addEventListener('click', () => {
        document.getElementById('deesc-ai-feedback').classList.add('hidden');
        document.getElementById('deesc-input-container').classList.remove('hidden');
        if(!deescCompleted) {
            // Retry current
            startDeescalationScenario(psychData.deescalationTrees[currentDeescIndex].id);
        } else {
            // Advance
            currentDeescIndex++;
            deescCompleted = false;
            if (currentDeescIndex < psychData.deescalationTrees.length) {
                startDeescalationScenario(psychData.deescalationTrees[currentDeescIndex].id);
            } else {
                alert("All de-escalation scenarios complete!");
            }
        }
    });
}

function startDeescalationScenario(id) {
    const scenario = psychData.deescalationTrees.find(s => s.id === id);
    if (!scenario) return;
    
    currentTacticScenario = scenario;
    document.getElementById('deesc-prompt').textContent = scenario.prompt;
    document.getElementById('deesc-tactics').classList.remove('hidden');
    document.getElementById('deesc-verbal').classList.add('hidden');
    document.getElementById('deesc-ai-feedback').classList.add('hidden');
    document.getElementById('deesc-input-container').classList.remove('hidden');
    document.getElementById('stress-bg').style.opacity = '0';
    document.getElementById('deesc-input').value = '';
    
    // Render tactics
    const tacticsContainer = document.getElementById('deesc-tactics');
    tacticsContainer.innerHTML = '';
    
    scenario.tactics.forEach((tactic) => {
        const btn = document.createElement('button');
        // Dynamic classes for light/dark mode and hover states
        btn.className = `bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 hover:border-${tactic.style}-400 dark:hover:border-${tactic.style}-500 hover:bg-${tactic.style}-50 dark:hover:bg-slate-700 p-4 rounded-2xl text-left transition-all group shadow-sm`;
        btn.innerHTML = `
            <h4 class="font-bold text-${tactic.style}-600 dark:text-${tactic.style}-400 mb-1 group-hover:text-${tactic.style}-700 dark:group-hover:text-${tactic.style}-300">${tactic.name}</h4>
            <p class="text-xs text-gray-500 dark:text-slate-400 font-medium">${tactic.desc}</p>
        `;
        btn.onclick = () => selectTactic(tactic);
        tacticsContainer.appendChild(btn);
    });
    
    deescTimeLeft = 10.0;
    deescActive = true;
    updateTimerUI();
    
    clearInterval(deescTimer);
    deescTimer = setInterval(() => {
        deescTimeLeft -= 0.1;
        updateTimerUI();
        if (deescTimeLeft <= 0) {
            clearInterval(deescTimer);
            deescActive = false;
            showDeescResult(false, "Time Expired", "You froze. The situation escalated rapidly requiring physical restraint. Medicolegal failure.");
        }
    }, 100);
}

function updateTimerUI() {
    const timerText = document.getElementById('timer-text');
    const timerBar = document.getElementById('timer-bar');
    const stressBg = document.getElementById('stress-bg');
    
    if(!timerText || !timerBar) return;

    timerText.textContent = Math.max(0, deescTimeLeft).toFixed(1) + 's';
    const percent = (deescTimeLeft / 10.0) * 100;
    timerBar.style.width = percent + '%';
    
    if (deescTimeLeft < 3.0) {
        timerBar.classList.remove('bg-rose-500');
        timerBar.classList.add('bg-red-600');
        stressBg.style.opacity = '1';
    } else {
        timerBar.classList.remove('bg-red-600');
        timerBar.classList.add('bg-rose-500');
        stressBg.style.opacity = '0';
    }
}

function selectTactic(tactic) {
    clearInterval(deescTimer);
    deescActive = false;
    document.getElementById('stress-bg').style.opacity = '0';
    
    if (tactic.success) {
        document.getElementById('deesc-tactics').classList.add('hidden');
        const verbalBlock = document.getElementById('deesc-verbal');
        verbalBlock.classList.remove('hidden');
        document.getElementById('deesc-prompt').innerHTML += `<br><br><span class="text-indigo-600 dark:text-indigo-400 font-bold">Patient Response:</span> ${tactic.nextPrompt}`;
        setTimeout(() => document.getElementById('deesc-input').focus(), 100);
    } else {
        showDeescResult(false, "Tactical Error", tactic.failureMessage);
    }
}

async function evaluateDeescalationVerbal() {
    const input = document.getElementById('deesc-input').value.trim();
    if (!input) return;
    
    const btn = document.getElementById('btn-submit-deesc');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    // Local AI Hook
    const scenarioPrompt = currentTacticScenario ? currentTacticScenario.prompt : "";
    const aiPrompt = `Evaluate this verbal de-escalation statement from a clinician to an agitated patient. The patient's context: "${scenarioPrompt}". Ensure the clinician's response is empathetic, validating, and does NOT order the patient to 'calm down' or issue direct commands. Return ONLY a valid JSON object in this exact format: {"isSuccess": true, "feedback": "Brief explanation"}`;
    let aiResponse = await fetchLocalAI(aiPrompt, input, true);
    
    btn.innerHTML = 'Speak';
    btn.disabled = false;

    if (aiResponse) {
        try {
            const cleanJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            const isSuccess = parsed.isSuccess === true || parsed.isSuccess === "true";
            showDeescResult(isSuccess, isSuccess ? "Crisis Averted" : "Communication Failure", parsed.feedback);
        } catch(e) {
            console.error("Failed to parse JSON from Deescalation AI", e);
            showDeescResult(false, "System Error", "The AI failed to format its response correctly. Please try again.");
        }
    } else {
        // Fallback Logic
        if (input.length > 15 && !input.toLowerCase().includes("calm down") && !input.toLowerCase().includes("sit down")) {
            showDeescResult(true, "Crisis Averted", "Your response was measured and empathetic. The patient agreed to speak with you safely.");
        } else {
            showDeescResult(false, "Communication Failure", "Telling an agitated patient to 'calm down' or issuing direct commands escalates the situation. You must validate their emotion first.");
        }
    }
}

function showDeescResult(success, title, message) {
    const feedbackBlock = document.getElementById('deesc-ai-feedback');
    const inputContainer = document.getElementById('deesc-input-container');
    const verbalBlock = document.getElementById('deesc-verbal');
    
    const icon = document.getElementById('deesc-result-icon');
    const titleEl = document.getElementById('deesc-result-title');
    const msgEl = document.getElementById('deesc-result-msg');
    
    verbalBlock.classList.remove('hidden');
    inputContainer.classList.add('hidden');
    feedbackBlock.classList.remove('hidden');
    
    titleEl.textContent = title;
    msgEl.textContent = message;
    
    if (success) {
        feedbackBlock.className = 'mt-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm';
        icon.className = 'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-emerald-500 text-emerald-500 bg-white dark:bg-emerald-900';
        icon.innerHTML = '<i class="fa-solid fa-check text-xl"></i>';
        titleEl.className = 'text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mb-1';
        msgEl.className = 'text-sm font-medium text-emerald-600 dark:text-emerald-300';
        
        if (!deescCompleted) {
            crisesResolved++;
            deescCompleted = true; // prevent re-scoring on the same scenario
            updateDashboard();
        }
        
        const nextBtn = document.getElementById('btn-next-deesc');
        nextBtn.className = 'px-6 py-2 rounded-xl font-bold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white';
        if (currentDeescIndex === psychData.deescalationTrees.length - 1) {
            nextBtn.textContent = 'Finish Module';
        } else {
            nextBtn.innerHTML = 'Next Scenario <i class="fa-solid fa-arrow-right ml-2"></i>';
        }
    } else {
        feedbackBlock.className = 'mt-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl p-4 border border-rose-200 dark:border-rose-800 shadow-sm';
        icon.className = 'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-rose-500 text-rose-500 bg-white dark:bg-rose-900';
        icon.innerHTML = '<i class="fa-solid fa-xmark text-xl"></i>';
        titleEl.className = 'text-lg font-extrabold text-rose-700 dark:text-rose-400 mb-1';
        msgEl.className = 'text-sm font-medium text-rose-600 dark:text-rose-300';
        
        const nextBtn = document.getElementById('btn-next-deesc');
        nextBtn.className = 'px-6 py-2 rounded-xl font-bold transition-all shadow-sm bg-gray-800 hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white';
        nextBtn.innerHTML = 'Retry Scenario <i class="fa-solid fa-rotate-right ml-2"></i>';
    }
}

// ==========================================
// MODULE 4: EHR LEGAL AUDITOR
// ==========================================
let currentEhrIndex = 0;
let ehrChatHistory = []; // Stores context for the post-fail discussion

function initEhrAuditor() {
    loadEhrScenario(0);
    const input = document.getElementById('ehr-input');
    const btnSubmit = document.getElementById('btn-submit-ehr');
    const btnNext = document.getElementById('btn-next-ehr');
    
    // Wire up the new chatbot UI
    const chatBtnSend = document.getElementById('ehr-chat-send');
    const chatInput = document.getElementById('ehr-chat-input');
    
    if (chatBtnSend) {
        chatBtnSend.addEventListener('click', sendEhrChatMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendEhrChatMessage();
        });
    }
    
    btnSubmit.addEventListener('click', async () => {
        if (input.value.trim().length < 10) {
            alert("Chart note is too short. Please document the incident thoroughly.");
            return;
        } 

        // Reset chat container state
        document.getElementById('ehr-chat-container')?.classList.add('hidden');
        const chatHistoryEl = document.getElementById('ehr-chat-history');
        if (chatHistoryEl) chatHistoryEl.innerHTML = '';
        ehrChatHistory = [];

        // AI Verification Step
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Auditing...';
        
        const scenarioPrompt = psychData.ehrScenarios[currentEhrIndex] || "Document the incident.";
        const systemPrompt = `You are an expert medicolegal auditor and risk management officer. Review the following incident report written by a clinical student. The scenario they were instructed to document is: "${scenarioPrompt}". Evaluate if the report is factually clear, objective, and defensible in court. Return ONLY a valid JSON object in this exact format: {"isPass": true, "feedback": "Brief 1-sentence explanation"}`;
        
        const aiResponse = await fetchLocalAI(systemPrompt, input.value, true);
        
        const aiFeedbackDiv = document.getElementById('ehr-ai-feedback');
        const feedbackContainer = document.getElementById('ehr-feedback');
        
        if (feedbackContainer) feedbackContainer.classList.remove('hidden');

        if (aiFeedbackDiv) {
            aiFeedbackDiv.className = 'mt-4 p-4 rounded-xl text-sm'; // reset classes
            
            if (aiResponse) {
                try {
                    const cleanJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanJson);
                    const isPass = parsed.isPass === true || parsed.isPass === "true";
                    let cleanMsg = parsed.feedback || "Audit completed.";
                    
                    if (isPass) {
                        aiFeedbackDiv.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200', 'dark:bg-emerald-900/30', 'dark:border-emerald-800', 'dark:text-emerald-300');
                        aiFeedbackDiv.innerHTML = `<strong><i class="fa-solid fa-check-circle mr-1"></i> Medicolegal Audit PASS:</strong> ${cleanMsg}`;
                        
                        btnSubmit.classList.add('hidden');
                        if(btnNext) btnNext.classList.remove('hidden');
                        input.disabled = true;
                    } else {
                        aiFeedbackDiv.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-200', 'dark:bg-rose-900/30', 'dark:border-rose-800', 'dark:text-rose-300');
                        aiFeedbackDiv.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation mr-1"></i> Medicolegal Audit FAIL:</strong> ${cleanMsg} <p class="mt-2 text-xs font-bold text-gray-500">You can ask the tutor questions below or revise your note and try again.</p>`;
                        
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = 'Sign Chart';

                        // Initialize and show chatbot
                        const chatContainer = document.getElementById('ehr-chat-container');
                        if (chatContainer) chatContainer.classList.remove('hidden');

                        ehrChatHistory = [
                            { 
                                role: "system", 
                                content: `You are an expert medicolegal tutor. The clinical student was instructed to document this scenario: "${scenarioPrompt}". They wrote this chart note: "${input.value}". You graded their note as a FAIL because: "${cleanMsg}". Your job is to answer the student's questions about why this is legally risky, what specific words they should avoid, and how to write a better objective note. Be encouraging but firm on legal standards. Keep your responses concise (1-3 sentences).`
                            }
                        ];
                    }
                } catch (e) {
                    console.error("Failed to parse JSON from LLM", e);
                    // Fallback if parsing fails
                    aiFeedbackDiv.classList.add('bg-gray-50', 'text-gray-800', 'border', 'border-gray-200', 'dark:bg-slate-800', 'dark:border-slate-700', 'dark:text-slate-400');
                    aiFeedbackDiv.innerHTML = `<em>LLM returned unparseable format. Pre-checks passed. Granted automatic PASS.</em>`;
                    
                    btnSubmit.classList.add('hidden');
                    if(btnNext) btnNext.classList.remove('hidden');
                    input.disabled = true;
                }
            } else {
                // Fallback if LLM offline
                aiFeedbackDiv.classList.add('bg-gray-50', 'text-gray-800', 'border', 'border-gray-200', 'dark:bg-slate-800', 'dark:border-slate-700', 'dark:text-slate-400');
                aiFeedbackDiv.innerHTML = `<em>Local AI offline. Pre-checks passed. Granted automatic PASS.</em>`;
                
                btnSubmit.classList.add('hidden');
                if(btnNext) btnNext.classList.remove('hidden');
                input.disabled = true;
            }
        }
    });

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            currentEhrIndex++;
            if (currentEhrIndex < psychData.ehrScenarios.length) {
                loadEhrScenario(currentEhrIndex);
            } else {
                alert("All charts documented successfully!");
                btnNext.disabled = true;
                btnNext.innerHTML = 'All Tasks Complete <i class="fa-solid fa-check ml-2"></i>';
            }
        });
    }
}

function loadEhrScenario(index) {
    const promptEl = document.getElementById('ehr-prompt');
    if (promptEl && psychData.ehrScenarios[index]) {
        promptEl.innerHTML = `<span class="font-bold text-emerald-700">Task:</span> ${psychData.ehrScenarios[index]}`;
    }
    
    const input = document.getElementById('ehr-input');
    input.value = '';
    input.disabled = false;
    
    const feedbackDiv = document.getElementById('ehr-feedback');
    if (feedbackDiv) feedbackDiv.classList.add('hidden');
    
    const aiFeedbackDiv = document.getElementById('ehr-ai-feedback');
    if (aiFeedbackDiv) aiFeedbackDiv.classList.add('hidden');
    
    const btnNext = document.getElementById('btn-next-ehr');
    const btnSubmit = document.getElementById('btn-submit-ehr');
    if (btnNext) btnNext.classList.add('hidden');
    
    const chatContainer = document.getElementById('ehr-chat-container');
    if (chatContainer) chatContainer.classList.add('hidden');
    ehrChatHistory = [];
    
    if (btnSubmit) {
        btnSubmit.classList.remove('hidden');
        btnSubmit.textContent = "Sign Chart";
        btnSubmit.disabled = false;
    }
}

async function sendEhrChatMessage() {
    const inputField = document.getElementById('ehr-chat-input');
    const sendBtn = document.getElementById('ehr-chat-send');
    const historyEl = document.getElementById('ehr-chat-history');
    
    const message = inputField.value.trim();
    if (!message) return;
    
    // Add User Message to UI
    inputField.value = '';
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'text-gray-800 bg-white border border-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 p-3 rounded-xl rounded-br-sm ml-8 shadow-sm';
    userMsgDiv.innerHTML = `<strong>You:</strong> ${message}`;
    historyEl.appendChild(userMsgDiv);
    historyEl.scrollTop = historyEl.scrollHeight;
    
    // Update State
    ehrChatHistory.push({ role: 'user', content: message });
    
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
    
    const currentModel = getPsychModel();
    try {
        const requestOptions = { num_predict: 1000 };
        if (currentModel.toLowerCase().includes('gemma4')) {
            requestOptions.draft_num_predict = 4;
        }
        const payload = {
            model: currentModel,
            messages: ehrChatHistory,
            stream: false,
            options: requestOptions
        };
        
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const aiResponse = data.message.content || "*(The tutor is thinking, please try asking again or rephrasing.)*";
        
        ehrChatHistory.push({ role: 'assistant', content: aiResponse });
        
        const aiMsgDiv = document.createElement('div');
        aiMsgDiv.className = 'text-emerald-900 bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200 p-3 rounded-xl rounded-bl-sm mr-8 shadow-sm';
        
        // Parse markdown if Marked.js is available
        if (typeof marked !== 'undefined') {
            aiMsgDiv.innerHTML = marked.parse(aiResponse);
        } else {
            aiMsgDiv.textContent = aiResponse;
        }
        
        historyEl.appendChild(aiMsgDiv);
        historyEl.scrollTop = historyEl.scrollHeight;
        
    } catch (e) {
        if (window.gnosysActiveModelsCache) {
            delete window.gnosysActiveModelsCache[currentModel];
        }
        console.error("Chatbot error:", e);
        const errDiv = document.createElement('div');
        errDiv.className = 'text-rose-500 text-xs text-center p-2';
        errDiv.textContent = "Error connecting to AI Tutor. Please try again.";
        historyEl.appendChild(errDiv);
    }
    
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
}
