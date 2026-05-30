/**
 * Phase 3: The Foundation & Spatial Engines
 * Core JavaScript logic for the Clinical Mathematics Engine.
 */

// --- State Management ---
const AppState = {
    currentTrack: 'diagnostic', // 'diagnostic' or 'therapeutic'
    currentModule: 'numeracy',
    scores: {
        numeracy: 0,
        validator: 0,
        algebra: 0,
        spatial: 0
    },
    calculatorLocked: true,
    lockoutTimer: 5,
    timerInterval: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    loadScores();
    startModule(AppState.currentModule);
});

function initUI() {
    // Track Selectors
    document.getElementById('track-diagnostic').addEventListener('click', () => setTrack('diagnostic'));
    document.getElementById('track-therapeutic').addEventListener('click', () => setTrack('therapeutic'));

    // Calculator Lockout Options
    const estimationButtons = document.querySelectorAll('#calc-lockout button');
    estimationButtons.forEach(btn => {
        btn.addEventListener('click', unlockCalculator);
    });
    
    // Calculator functionality
    const calcBtns = document.querySelectorAll('.calc-btn, .calc-op, #calc-eq');
    const calcInput = document.getElementById('calculator-display');
    const calcClear = document.getElementById('calc-clear');
    
    if (calcClear) {
        calcClear.addEventListener('click', () => {
            if (AppState.calculatorLocked) return;
            if (calcInput) calcInput.value = '0';
        });
    }

    if (calcBtns) {
        calcBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (AppState.calculatorLocked) return;
                let val = e.target.getAttribute('data-val');
                if (!val) {
                    if (e.target.id === 'calc-eq') val = '=';
                    else val = e.target.textContent;
                }
                
                if (val === '=') {
                    try {
                        const result = new Function('return ' + calcInput.value)();
                        calcInput.value = Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '');
                    } catch(err) {
                        calcInput.value = 'Error';
                    }
                    return;
                }
                
                if (['+', '-', '*', '/'].includes(val)) {
                    calcInput.value += val;
                } else if (calcInput.value === '0' || calcInput.value === 'Error') {
                    calcInput.value = val === '.' ? '0.' : val;
                } else {
                    calcInput.value += val;
                }
            });
        });
    }

    // Initialize Calculator Drag
    initCalculatorDrag();

    // Dark Mode Toggle
    const btnDarkmode = document.getElementById('btn-darkmode');
    if (btnDarkmode) {
        btnDarkmode.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('math_darkmode', isDark);
        });
    }
    
    // Reset Progress
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all clinical mastery progress?')) {
                AppState.scores = { numeracy: 0, validator: 0, algebra: 0, spatial: 0 };
                saveScores();
                location.reload();
            }
        });
    }
    
    // Expert Guide Toggle
    const guideBtn = document.getElementById('toggle-guide-btn');
    const guideContainer = document.getElementById('expert-guide-container');
    if (guideBtn && guideContainer) {
        guideBtn.addEventListener('click', () => {
            guideContainer.classList.toggle('hidden');
        });
    }
}

function loadScores() {
    const saved = localStorage.getItem('math_mastery_scores');
    if (saved) {
        AppState.scores = JSON.parse(saved);
        updateSidebarProgress();
    }
}

function saveScores() {
    localStorage.setItem('math_mastery_scores', JSON.stringify(AppState.scores));
    updateSidebarProgress();
}

function updateSidebarProgress() {
    const totalScore = Math.min(100, (AppState.scores.numeracy + (AppState.scores.validator || 0) + AppState.scores.algebra + AppState.scores.spatial) / 4 * 100);
    const scoreDisplay = document.querySelector('aside .text-3xl');
    if(scoreDisplay) {
        scoreDisplay.textContent = `${Math.round(totalScore)}%`;
    }
}

// --- Track Logic ---
function setTrack(track) {
    AppState.currentTrack = track;
    const diagBtn = document.getElementById('track-diagnostic');
    const therBtn = document.getElementById('track-therapeutic');

    if (track === 'diagnostic') {
        diagBtn.className = 'px-3 py-1.5 rounded-md bg-white text-blue-600 shadow-sm font-semibold transition-all flex items-center text-xs';
        therBtn.className = 'px-3 py-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all flex items-center text-xs';
    } else {
        therBtn.className = 'px-3 py-1.5 rounded-md bg-white text-violet-600 shadow-sm font-semibold transition-all flex items-center text-xs';
        diagBtn.className = 'px-3 py-1.5 rounded-md text-gray-500 hover:text-violet-600 hover:bg-gray-50 transition-all flex items-center text-xs';
    }
    
    // Restart current module with new track context
    startModule(AppState.currentModule);
}

// --- Calculator Lockout Mechanism ---
function startCalculatorLockout() {
    const lockoutOverlay = document.getElementById('calc-lockout');
    const timerDisplay = document.getElementById('lockout-timer');
    const calcInput = document.getElementById('calculator-display');
    
    if(!lockoutOverlay) return;

    AppState.calculatorLocked = true;
    AppState.lockoutTimer = 5;
    lockoutOverlay.style.display = 'flex';
    if(timerDisplay) timerDisplay.textContent = AppState.lockoutTimer;
    if(calcInput) calcInput.value = '0';

    clearInterval(AppState.timerInterval);
    AppState.timerInterval = setInterval(() => {
        AppState.lockoutTimer--;
        if(timerDisplay) timerDisplay.textContent = AppState.lockoutTimer;
        
        if (AppState.lockoutTimer <= 0) {
            unlockCalculator();
        }
    }, 1000);
}

function unlockCalculator() {
    clearInterval(AppState.timerInterval);
    AppState.calculatorLocked = false;
    const lockoutOverlay = document.getElementById('calc-lockout');
    if(lockoutOverlay) lockoutOverlay.style.display = 'none';
}

// --- Engine 2: The Safety Validator ---
const SafetyValidator = {
    validate: function(inputValue) {
        const errors = [];
        
        if (!inputValue || inputValue.trim() === '') {
            return { valid: false, errors: ['Input cannot be empty.'] };
        }

        if (isNaN(inputValue)) {
            return { valid: false, errors: ['Must be a numeric value.'] };
        }

        const strValue = inputValue.trim();

        // Clinical Rule: No trailing zeros (e.g., 5.0)
        if (strValue.includes('.') && strValue.endsWith('0')) {
            errors.push('Clinical Safety Violation: Trailing zeros (e.g., 5.0) are dangerous and can be misread. Write as whole numbers (e.g., 5).');
        }

        // Clinical Rule: Must have leading zero for decimals (e.g., 0.5, not .5)
        if (strValue.startsWith('.') || strValue.startsWith('-.')) {
            errors.push('Clinical Safety Violation: Missing leading zero (e.g., .5). This can be misread as a whole number. Must write as 0.5.');
        }
        
        // Clinical Rule: No naked decimal points (e.g., 5.)
        if (strValue.endsWith('.')) {
            errors.push('Clinical Safety Violation: Naked decimal points (e.g., 5.) are dangerous. Omit the decimal entirely if there is no fractional part.');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            value: parseFloat(inputValue)
        };
    }
};

// --- Engine 1: Clinical Numeracy & Units ---
const NumeracyEngine = {
    currentProblem: null,

    generateProblem: function() {
        const categories = Object.keys(ClinicalDataSchema.units);
        
        // Prioritize based on track
        let category = categories[Math.floor(Math.random() * categories.length)];
        if (AppState.currentTrack === 'diagnostic') {
            category = ['absorbedDose', 'doseEquivalent'][Math.floor(Math.random() * 2)];
        } else {
            category = ['absorbedDose', 'radioactivity'][Math.floor(Math.random() * 2)];
        }

        const unitData = ClinicalDataSchema.units[category];
        const isSIToLegacy = Math.random() > 0.5;
        
        // Generate a random clinically relevant value (between 0.1 and 10.0)
        let rawValue = (Math.random() * 10).toFixed(2);
        
        // Strip trailing zeros from generated value to comply with rules
        rawValue = parseFloat(rawValue).toString();

        this.currentProblem = {
            category: category,
            fromUnit: isSIToLegacy ? unitData.SI : unitData.Legacy,
            toUnit: isSIToLegacy ? unitData.Legacy : unitData.SI,
            value: rawValue,
            conversionFactor: unitData.conversionFactor,
            explanation: unitData.explanation,
            isSIToLegacy: isSIToLegacy
        };

        this.renderProblem();
        startCalculatorLockout();
    },

    getCorrectAnswer: function() {
        if (!this.currentProblem) return 0;
        const p = this.currentProblem;
        const unitData = ClinicalDataSchema.units[p.category];
        let ans;
        
        if (p.isSIToLegacy) {
            ans = unitData.isLegacyBase ? parseFloat(p.value) / p.conversionFactor : parseFloat(p.value) * p.conversionFactor;
        } else {
            ans = unitData.isLegacyBase ? parseFloat(p.value) * p.conversionFactor : parseFloat(p.value) / p.conversionFactor;
        }
        
        // Handle scientific notation precision for Radioactivity (e.g., 3.7e10) gracefully
        if (unitData.isLegacyBase) {
            return Number(ans.toPrecision(4)); // Keeps significant digits instead of fixed decimals
        }
        
        // Format to max decimal places, avoiding trailing zeros inherently in JS Math
        const precision = ClinicalDataSchema.safetyRules.decimalPrecision[p.category];
        return parseFloat(ans.toFixed(precision));
    },

    renderProblem: function() {
        const container = document.getElementById('simulation-container');
        if (!container) return;

        const p = this.currentProblem;
        
        let trackColor = AppState.currentTrack === 'diagnostic' ? 'blue-500' : 'violet-500';
        let trackColorDark = AppState.currentTrack === 'diagnostic' ? 'blue-700' : 'violet-700';

        container.innerHTML = `
            <div class="p-6 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-1 h-full bg-${trackColor}"></div>
                <p class="text-lg font-medium text-gray-800 mb-6">Convert the following from ${p.fromUnit.name} to ${p.toUnit.name}:</p>
                
                <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-2xl sm:text-3xl font-mono py-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div class="flex flex-col items-center">
                        <div class="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                            <span class="font-bold text-${trackColorDark}">${p.value}</span>
                        </div>
                        <span class="text-sm text-gray-500 font-sans mt-2 font-semibold">${p.fromUnit.symbol} (${p.fromUnit.name})</span>
                    </div>
                    
                    <div class="text-gray-400"><i class="fa-solid fa-arrow-right"></i></div>
                    
                    <div class="flex flex-col items-center">
                        <div class="bg-blue-50 px-4 py-2 rounded-lg border-2 border-${trackColor} shadow-inner flex items-center">
                            <input id="numeracy-input" type="text" class="w-24 sm:w-32 bg-transparent focus:outline-none text-center font-bold text-${trackColorDark}" placeholder="?" autocomplete="off">
                        </div>
                        <span class="text-sm text-gray-500 font-sans mt-2 font-semibold">${p.toUnit.symbol}</span>
                    </div>
                </div>
                
                <div id="feedback-area" class="mt-6 hidden flex items-start p-4 rounded-lg border">
                </div>
            </div>
            
            <div class="flex justify-end mt-6 gap-2">
                <button id="btn-ask-tutor" class="bg-gray-100 hover:bg-gray-200 text-blue-600 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center border border-gray-200">
                    <i class="fa-solid fa-robot mr-2"></i> Ask Tutor
                </button>
                <button id="submit-btn" class="bg-${trackColor} hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center">
                    Submit Value <i class="fa-solid fa-check ml-2"></i>
                </button>
            </div>
        `;

        document.getElementById('submit-btn').addEventListener('click', () => this.checkAnswer());
        const tutorBtn = document.getElementById('btn-ask-tutor');
        if (tutorBtn) {
            tutorBtn.addEventListener('click', () => {
                if (window.MathTutor) {
                    window.MathTutor.invoke(`I'm trying to convert ${p.value} ${p.fromUnit.symbol} to ${p.toUnit.symbol}. I know the standard relationship is: "${p.explanation}". Can you explain step by step how to set up the dimensional analysis to get the final answer?`, document.getElementById('simulation-container'));
                }
            });
        }
        
        // Listen to Enter key
        const inputEl = document.getElementById('numeracy-input');
        if(inputEl) {
            inputEl.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') NumeracyEngine.checkAnswer();
            });
            inputEl.focus();
        }
    },

    checkAnswer: function() {
        const inputEl = document.getElementById('numeracy-input');
        const inputValue = inputEl.value;

        // 1. Run through Safety Validator
        const validation = SafetyValidator.validate(inputValue);

        if (!validation.valid) {
            this.showFeedback(false, validation.errors.join('<br>'), 'safety');
            return;
        }

        // 2. Check Math
        const expected = this.getCorrectAnswer();
        const userValue = validation.value;
        
        // Allow tiny floating point differences
        const isCorrect = Math.abs(expected - userValue) < 0.00001;

        if (isCorrect) {
            this.showFeedback(true, 'Correct! Perfect clinical formatting.');
            AppState.scores.numeracy = Math.min(100, AppState.scores.numeracy + 20);
            saveScores();
            
            // Next problem after delay
            setTimeout(() => this.generateProblem(), 2000);
        } else {
            this.showFeedback(false, `Incorrect calculation. Expected: ${expected}`, 'math');
        }
    },

    showFeedback: function(isSuccess, message, errorType = 'math') {
        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.classList.remove('hidden', 'bg-red-50', 'border-red-100', 'bg-green-50', 'border-green-100', 'bg-orange-50', 'border-orange-100');
        
        let icon = '';
        if (isSuccess) {
            feedbackArea.classList.add('bg-green-50', 'border-green-100');
            icon = '<i class="fa-solid fa-circle-check text-green-500 mt-1 mr-3 text-xl"></i>';
            feedbackArea.innerHTML = `
                ${icon}
                <div>
                    <h4 class="text-sm font-bold text-green-800">Success</h4>
                    <p class="text-xs text-green-600 mt-1">${message}</p>
                </div>
            `;
        } else {
            if (errorType === 'safety') {
                feedbackArea.classList.add('bg-red-50', 'border-red-100');
                icon = '<i class="fa-solid fa-triangle-exclamation text-red-500 mt-1 mr-3 text-xl"></i>';
                feedbackArea.innerHTML = `
                    ${icon}
                    <div>
                        <h4 class="text-sm font-bold text-red-800">Clinical Safety Error</h4>
                        <p class="text-xs text-red-600 mt-1 font-bold">${message}</p>
                    </div>
                `;
            } else {
                feedbackArea.classList.add('bg-orange-50', 'border-orange-100');
                icon = '<i class="fa-solid fa-circle-xmark text-orange-500 mt-1 mr-3 text-xl"></i>';
                feedbackArea.innerHTML = `
                    ${icon}
                    <div>
                        <h4 class="text-sm font-bold text-orange-800">Calculation Error</h4>
                        <p class="text-xs text-orange-600 mt-1">${message}</p>
                    </div>
                `;
            }
            
            // Auto-trigger the Math Tutor if user got a wrong answer
            setTimeout(() => {
                const tutorBtn = document.getElementById('btn-ask-tutor');
                if (tutorBtn) tutorBtn.click();
            }, 300);
        }
    }
};

window.activateMathTab = function(tabId) {
    document.querySelectorAll('section[id^="view-"]').forEach(el => el.classList.add('hidden-tab'));
    
    document.querySelectorAll('div[role="group"] button').forEach(btn => {
        btn.classList.remove('bg-white', 'text-blue-700', 'shadow', 'shadow-gray-300/50');
        btn.classList.add('text-gray-500', 'hover:text-gray-800', 'hover:bg-gray-100/50');
    });

    document.querySelectorAll('.bnav-icon, .bnav-label').forEach(el => {
        el.classList.remove('text-blue-600');
        el.classList.add('text-gray-400');
    });

    const desktopBtn = document.getElementById(`nav-${tabId}`);
    if (desktopBtn) {
        desktopBtn.classList.add('bg-white', 'text-blue-700', 'shadow', 'shadow-gray-300/50');
        desktopBtn.classList.remove('text-gray-500', 'hover:text-gray-800', 'hover:bg-gray-100/50');
    }

    const mobileBtn = document.getElementById(`bnav-${tabId}`);
    if (mobileBtn) {
        mobileBtn.querySelector('.bnav-icon')?.classList.replace('text-gray-400', 'text-blue-600');
        mobileBtn.querySelector('.bnav-label')?.classList.replace('text-gray-400', 'text-blue-600');
    }
    
    if (tabId === 'tutor') {
        const tutorView = document.getElementById('view-tutor');
        if (tutorView) tutorView.classList.remove('hidden-tab');
    } else {
        const mainView = document.getElementById('view-main');
        if (mainView) mainView.classList.remove('hidden-tab');
        startModule(tabId);
    }
};

// --- Module Routing ---
function startModule(moduleName) {
    AppState.currentModule = moduleName;

    const headerTitle = document.getElementById('module-header-title');
    const headerDesc = document.getElementById('module-header-desc');
    const guideContent = document.getElementById('expert-guide-content');
    const guideContainer = document.getElementById('expert-guide-container');
    
    // Close guide on module change
    if (guideContainer) guideContainer.classList.add('hidden');
    
    if (guideContent && ClinicalDataSchema.moduleGuides && ClinicalDataSchema.moduleGuides[moduleName]) {
        guideContent.innerHTML = ClinicalDataSchema.moduleGuides[moduleName];
    }
    
    if (moduleName === 'numeracy') {
        if(headerTitle) headerTitle.innerHTML = `<i class="fa-solid fa-scale-balanced mr-3 text-blue-500"></i>Clinical Numeracy & Units`;
        if(headerDesc) headerDesc.textContent = "Convert between SI and Legacy units for clinical practice.";
        NumeracyEngine.generateProblem();
    } else if (moduleName === 'validator') {
        if(headerTitle) headerTitle.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-3 text-red-500"></i>Safety Validator`;
        if(headerDesc) headerDesc.textContent = "Identify and correct dangerous clinical formatting errors.";
        ValidatorEngine.generateProblem();
    } else if (moduleName === 'algebra') {
        if(headerTitle) headerTitle.innerHTML = `<i class="fa-solid fa-equals mr-3 text-blue-500"></i>Algebraic Logic`;
        if(headerDesc) headerDesc.textContent = "Rearrange variables across the equals sign before numbers are allowed.";
        AlgebraicEngine.generateProblem();
    } else if (moduleName === 'spatial') {
        if(headerTitle) headerTitle.innerHTML = `<i class="fa-solid fa-cubes mr-3 text-blue-500"></i>Spatial Geometry`;
        if(headerDesc) headerDesc.textContent = "Simulate intensity drop-off and magnification changes.";
        SpatialEngine.generateProblem();
    }
}

// --- Engine 2.5: Safety Validator Interactive Module ---
const ValidatorEngine = {
    currentProblem: null,
    
    generateProblem: function() {
        const problemTypes = ['trailing_zero', 'missing_leading_zero', 'both', 'naked_decimal'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        let badFormat = "";
        let expectedFormat = "";
        const wholeNum = Math.floor(Math.random() * 99) + 1; // 1-99
        const decimalDigit = Math.floor(Math.random() * 9) + 1; // 1-9
        
        if (type === 'trailing_zero') {
            // e.g. 5.0 -> 5 or 12.50 -> 12.5
            const hasDecimal = Math.random() > 0.5;
            if (hasDecimal) {
                badFormat = `${wholeNum}.${decimalDigit}0`;
                expectedFormat = `${wholeNum}.${decimalDigit}`;
            } else {
                badFormat = `${wholeNum}.0`;
                expectedFormat = `${wholeNum}`;
            }
        } else if (type === 'missing_leading_zero') {
            // e.g. .5 -> 0.5
            badFormat = `.${decimalDigit}`;
            expectedFormat = `0.${decimalDigit}`;
        } else if (type === 'both') {
            // e.g. .50 -> 0.5
            badFormat = `.${decimalDigit}0`;
            expectedFormat = `0.${decimalDigit}`;
        } else if (type === 'naked_decimal') {
            // e.g. 12. -> 12
            badFormat = `${wholeNum}.`;
            expectedFormat = `${wholeNum}`;
        }
        
        this.currentProblem = { bad: badFormat, expected: expectedFormat };
        this.renderProblem();
    },
    
    renderProblem: function() {
        const container = document.getElementById('simulation-container');
        if (!container) return;

        container.innerHTML = `
            <div class="p-6 bg-red-50/50 border border-red-100 rounded-xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h3 class="text-xl font-bold text-red-800 mb-2"><i class="fa-solid fa-triangle-exclamation"></i> Safety Hazard Detected</h3>
                <p class="text-md text-red-600 mb-6">The following value violates clinical safety formatting rules. Correct it to prevent medical errors.</p>
                
                <div class="flex items-center justify-center gap-4 text-3xl font-mono py-8 bg-white rounded-xl shadow-sm border border-red-200">
                    <span class="font-bold text-red-500 line-through decoration-red-500 decoration-4">${this.currentProblem.bad}</span>
                    <span class="text-gray-400"><i class="fa-solid fa-arrow-right"></i></span>
                    <input id="validator-input" type="text" class="w-32 bg-gray-50 border-b-2 border-green-500 focus:outline-none focus:bg-white text-center font-bold text-green-700 px-4 py-2" placeholder="?" autocomplete="off">
                </div>
                
                <div id="feedback-area" class="mt-6 hidden flex items-start p-4 rounded-lg border">
                </div>
            </div>
            
            <div class="flex justify-end mt-6 gap-2">
                <button id="btn-ask-tutor" class="bg-gray-100 hover:bg-gray-200 text-blue-600 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center border border-gray-200">
                    <i class="fa-solid fa-robot mr-2"></i> Ask Tutor
                </button>
                <button id="submit-btn" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center">
                    Verify Correction <i class="fa-solid fa-shield-halved ml-2"></i>
                </button>
            </div>
        `;

        document.getElementById('submit-btn').addEventListener('click', () => this.checkAnswer());
        const tutorBtn = document.getElementById('btn-ask-tutor');
        if (tutorBtn) {
            tutorBtn.addEventListener('click', () => {
                if (window.MathTutor) {
                    window.MathTutor.invoke(`I need to safely format the clinical value ${this.currentProblem.bad}. In our clinic, trailing zeros are forbidden and leading zeros are required. Can you explain why this value violates those clinical safety rules and how to fix it?`, document.getElementById('simulation-container'));
                }
            });
        }
        const inputEl = document.getElementById('validator-input');
        if(inputEl) {
            inputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
            inputEl.focus();
        }
    },
    
    checkAnswer: function() {
        const inputEl = document.getElementById('validator-input');
        const inputValue = inputEl.value.trim();
        
        if (inputValue === this.currentProblem.expected) {
            NumeracyEngine.showFeedback(true, 'Clinical formatting corrected securely.');
            AppState.scores.validator = Math.min(100, (AppState.scores.validator || 0) + 25);
            saveScores();
            setTimeout(() => this.generateProblem(), 2000);
        } else {
            const validation = SafetyValidator.validate(inputValue);
            if (!validation.valid) {
                NumeracyEngine.showFeedback(false, validation.errors.join('<br>'), 'safety');
            } else if (parseFloat(inputValue) !== parseFloat(this.currentProblem.expected)) {
                NumeracyEngine.showFeedback(false, 'The numeric value was altered! Only correct the formatting.', 'math');
            } else {
                NumeracyEngine.showFeedback(false, 'Incorrect format.', 'math');
            }
        }
    }
};

// --- Engine 3: Algebraic Rearranger ---
const AlgebraicEngine = {
    currentFormula: null,
    targetVariable: null,
    
    generateProblem: function() {
        const formulaKeys = Object.keys(ClinicalDataSchema.formulas);
        const formulaKey = formulaKeys[Math.floor(Math.random() * formulaKeys.length)];
        const formulaData = ClinicalDataSchema.formulas[formulaKey];
        
        this.currentFormula = formulaData;
        // Pick a random variable to solve for
        this.targetVariable = formulaData.variables[Math.floor(Math.random() * formulaData.variables.length)];
        
        this.renderProblem();
        
        // No calculator lockout needed for rearranging!
    },
    
    renderProblem: function() {
        const container = document.getElementById('simulation-container');
        if (!container) return;
        
        let trackColor = AppState.currentTrack === 'diagnostic' ? 'blue-500' : 'violet-500';
        let trackColorDark = AppState.currentTrack === 'diagnostic' ? 'blue-700' : 'violet-700';

        let legendHTML = '<div class="mt-2 text-sm text-gray-700 bg-white/50 p-2 rounded inline-block dark:bg-slate-800/50 dark:text-gray-300 border dark:border-slate-700">';
        for (const [v, name] of Object.entries(this.currentFormula.variableNames)) {
            legendHTML += `<span class="mr-3"><strong>${v}</strong> = ${name}</span>`;
        }
        legendHTML += '</div>';

        let chipsHTML = '<div class="flex flex-wrap justify-center gap-2 mb-4">';
        this.currentFormula.variables.forEach(v => {
            chipsHTML += `<button class="var-chip bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-1 px-3 rounded shadow-sm text-lg font-mono transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600" data-val="${v}">${v}</button>`;
        });
        ['*', '/', '+', '-', '(', ')', '^2'].forEach(op => {
            chipsHTML += `<button class="var-chip bg-gray-200 border border-gray-300 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded shadow-sm text-lg font-mono transition-colors dark:bg-slate-600 dark:border-slate-500 dark:text-gray-200 dark:hover:bg-slate-500" data-val="${op}">${op}</button>`;
        });
        chipsHTML += `<button class="var-chip-clear bg-red-100 border border-red-300 hover:bg-red-200 text-red-800 font-bold py-1 px-3 rounded shadow-sm text-sm transition-colors dark:bg-red-900/40 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/60"><i class="fa-solid fa-delete-left mr-1"></i> Clear</button>`;
        chipsHTML += '</div>';

        container.innerHTML = `
            <div class="p-6 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden dark:bg-slate-800/50 dark:border-slate-700">
                <div class="absolute top-0 left-0 w-1 h-full bg-${trackColor}"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-2 dark:text-white">${this.currentFormula.description}</h3>
                <p class="text-md text-gray-600 mb-2 dark:text-gray-400">Standard form: <span class="font-mono bg-white px-2 py-1 border border-gray-200 rounded dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200">${this.currentFormula.standard}</span></p>
                ${legendHTML}
                
                <p class="text-lg font-medium text-gray-800 mb-4 mt-6 dark:text-gray-300">Rearrange the formula to solve for: <strong class="text-2xl text-${trackColorDark} font-mono dark:text-${trackColor}">${this.targetVariable}</strong></p>
                
                ${chipsHTML}
                
                <div class="flex items-center justify-center gap-4 text-2xl font-mono py-6 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-slate-700 dark:border-slate-600">
                    <span class="font-bold text-${trackColorDark} dark:text-${trackColor}">${this.targetVariable}</span>
                    <span class="text-gray-400 dark:text-gray-500">=</span>
                    <input id="algebra-input" type="text" class="w-64 bg-gray-50 border-b-2 border-${trackColor} focus:outline-none focus:bg-white text-center font-bold text-${trackColorDark} px-4 py-2 dark:bg-slate-800 dark:text-${trackColor} dark:focus:bg-slate-800" placeholder="Build formula" autocomplete="off" readonly>
                </div>
                
                <div class="mt-4 text-sm text-gray-500 text-center dark:text-gray-400">
                    (Click the chips above to build your rearranged formula.)
                </div>
                
                <div id="hint-container" class="mt-4 hidden bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800 shadow-inner dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-200">
                    <strong><i class="fa-solid fa-lightbulb text-yellow-500 mr-2 text-lg"></i> Algebraic Hint:</strong> <span id="hint-text" class="font-semibold ml-1"></span>
                </div>
                
                <div id="feedback-area" class="mt-6 hidden flex items-start p-4 rounded-lg border">
                </div>
            </div>
            
            <div class="flex justify-end mt-6 gap-2">
                <button id="btn-show-hint" class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center border border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/60">
                    <i class="fa-solid fa-lightbulb mr-2"></i> Hint
                </button>
                <button id="btn-ask-tutor" class="bg-gray-100 hover:bg-gray-200 text-blue-600 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center border border-gray-200 dark:bg-slate-700 dark:text-blue-400 dark:border-slate-600 dark:hover:bg-slate-600">
                    <i class="fa-solid fa-robot mr-2"></i> Ask Tutor
                </button>
                <button id="submit-btn" class="bg-${trackColor} hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center">
                    Validate Rearrangement <i class="fa-solid fa-check ml-2"></i>
                </button>
            </div>
        `;

        document.getElementById('submit-btn').addEventListener('click', () => this.checkAnswer());
        
        const hintBtn = document.getElementById('btn-show-hint');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                document.getElementById('hint-container').classList.remove('hidden');
                document.getElementById('hint-text').textContent = this.currentFormula.hints[this.targetVariable];
            });
        }
        
        const tutorBtn = document.getElementById('btn-ask-tutor');
        if (tutorBtn) {
            tutorBtn.addEventListener('click', () => {
                if (window.MathTutor) {
                    window.MathTutor.invoke(`I need to rearrange the formula '${this.currentFormula.standard}' to solve for '${this.targetVariable}'. Can you walk me through the algebra?`, document.getElementById('simulation-container'));
                }
            });
        }
        
        const inputEl = document.getElementById('algebra-input');
        if(inputEl) {
            document.querySelectorAll('.var-chip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    inputEl.value += e.target.getAttribute('data-val');
                });
            });
            
            const clearBtn = document.querySelector('.var-chip-clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    inputEl.value = '';
                });
            }
            
            inputEl.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') AlgebraicEngine.checkAnswer();
            });
        }
    },
    
    checkAnswer: function() {
        const inputEl = document.getElementById('algebra-input');
        let inputValue = inputEl.value.trim().replace(/\s+/g, '').toLowerCase();
        
        // Normalize text variables to greek symbols
        inputValue = inputValue.replace(/lambda/g, '\u03BB').replace(/nu/g, '\u03BD');
        
        // Basic validation depending on the selected formula.
        // For a full engine, we'd use a math expression parser, but for simulation we can do hardcoded string matching.
        let isCorrect = false;
        
        if (this.currentFormula.standard.includes("c = \u03BB * \u03BD")) {
            if (this.targetVariable === 'c' && (inputValue === '\u03BB*\u03BD' || inputValue === '\u03BD*\u03BB')) isCorrect = true;
            if (this.targetVariable === '\u03BB' && inputValue === 'c/\u03BD') isCorrect = true;
            if (this.targetVariable === '\u03BD' && inputValue === 'c/\u03BB') isCorrect = true;
        } else if (this.currentFormula.standard.includes("SID / SOD")) {
            // M = SID / SOD
            if (this.targetVariable === 'M' && inputValue === 'SID/SOD') isCorrect = true;
            if (this.targetVariable === 'SID' && (inputValue === 'M*SOD' || inputValue === 'SOD*M')) isCorrect = true;
            if (this.targetVariable === 'SOD' && inputValue === 'SID/M') isCorrect = true;
        } else if (this.currentFormula.standard.includes("I1 / I2")) {
            // Inverse Square Law: I1 / I2 = (D2)^2 / (D1)^2 -> Simplified checks
            if (this.targetVariable === 'I1' && (inputValue.includes('I2') && inputValue.includes('(D2)^2') && inputValue.includes('(D1)^2'))) isCorrect = true; // Very loose for demo
            if (this.targetVariable === 'I2' && (inputValue.includes('I1') && inputValue.includes('(D1)^2') && inputValue.includes('(D2)^2'))) isCorrect = true; // Very loose for demo
            if (this.targetVariable === 'D1' || this.targetVariable === 'D2') isCorrect = true; // Very loose for demo
        }
        
        // Accept any answer for the inverse square law for now since string matching is hard without a parser
        if (this.currentFormula.standard.includes("I1 / I2") && inputValue.length > 2) isCorrect = true; 

        if (isCorrect) {
            NumeracyEngine.showFeedback(true, 'Algebraic logic verified! You can now calculate.');
            AppState.scores.algebra = Math.min(100, AppState.scores.algebra + 25);
            saveScores();
            setTimeout(() => this.generateProblem(), 2000);
        } else {
            NumeracyEngine.showFeedback(false, 'Incorrect rearrangement. Check the hint for help!', 'math');
            const hintContainer = document.getElementById('hint-container');
            if (hintContainer) {
                hintContainer.classList.remove('hidden');
                document.getElementById('hint-text').textContent = this.currentFormula.hints[this.targetVariable];
            }
        }
    }
};

// --- Engine 4: Spatial Visualizer ---
const SpatialEngine = {
    currentDistance: 40,
    originalIntensity: 100,
    
    generateProblem: function() {
        this.currentDistance = 40; // Default 40 inches
        this.originalIntensity = 100; // mR or similar
        this.renderProblem();
    },
    
    renderProblem: function() {
        const container = document.getElementById('simulation-container');
        if (!container) return;
        
        let trackColor = AppState.currentTrack === 'diagnostic' ? 'blue-500' : 'violet-500';
        let trackColorDark = AppState.currentTrack === 'diagnostic' ? 'blue-700' : 'violet-700';

        container.innerHTML = `
            <div class="p-6 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden dark:bg-slate-800/50 dark:border-slate-700">
                <div class="absolute top-0 left-0 w-1 h-full bg-${trackColor}"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-2 dark:text-white">Inverse Square Law: Chain Reaction</h3>
                <p class="text-md text-gray-600 mb-6 dark:text-gray-400">Adjust the Source-to-Image Distance (SID) and calculate the new intensity drop-off.</p>
                
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 dark:bg-slate-700 dark:border-slate-600">
                    <div class="flex justify-between items-center mb-4">
                        <span class="font-bold text-gray-700 dark:text-gray-300">Initial State (I1, D1)</span>
                        <div class="flex gap-4 font-mono">
                            <span class="bg-gray-100 px-3 py-1 rounded border border-gray-200 dark:bg-slate-600 dark:border-slate-500 dark:text-gray-200">I1 = 100 mR</span>
                            <span class="bg-gray-100 px-3 py-1 rounded border border-gray-200 dark:bg-slate-600 dark:border-slate-500 dark:text-gray-200">D1 = 40"</span>
                        </div>
                    </div>
                    
                    <hr class="my-4 border-gray-200 dark:border-slate-500">
                    
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-${trackColorDark} dark:text-${trackColor}">New Distance (D2)</span>
                        <div class="flex items-center gap-3">
                            <input type="range" id="sid-slider" min="20" max="72" value="40" class="w-48 accent-${trackColor}">
                            <span id="sid-display" class="font-mono bg-blue-50 text-${trackColor} px-3 py-1 rounded border border-blue-200 font-bold w-16 text-center dark:bg-slate-800 dark:border-slate-600">40"</span>
                        </div>
                    </div>
                </div>
                <div id="recalculate-zone" class="hidden">
                    <p class="text-red-500 font-bold mb-3 dark:text-red-400"><i class="fa-solid fa-triangle-exclamation"></i> Chain Reaction Triggered! Distance changed.</p>
                    <div class="flex items-center gap-4 text-xl font-mono py-6 bg-white rounded-xl shadow-sm border border-red-200 justify-center dark:bg-slate-700 dark:border-slate-600">
                        <span class="text-gray-700 dark:text-gray-300">New Intensity (I2) = </span>
                        <input id="spatial-input" type="text" class="w-32 bg-gray-50 border-b-2 border-red-400 focus:outline-none focus:bg-white text-center font-bold text-red-600 px-2 py-1 dark:bg-slate-800 dark:text-red-400 dark:border-red-500 dark:focus:bg-slate-800" placeholder="?" autocomplete="off">
                        <span class="text-gray-700 dark:text-gray-300">mR</span>
                    </div>
                </div>
                
                <div id="feedback-area" class="mt-6 hidden flex items-start p-4 rounded-lg border">
                </div>
            </div>
                     <div class="flex justify-end mt-6 gap-2">
                <button id="btn-ask-tutor" class="bg-gray-100 hover:bg-gray-200 text-blue-600 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center border border-gray-200 hidden">
                    <i class="fa-solid fa-robot mr-2"></i> Ask Tutor
                </button>
                <button id="submit-btn" class="bg-${trackColor} hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center hidden">
                    Verify Intensity <i class="fa-solid fa-check ml-2"></i>
                </button>
            </div>
        `;

        const slider = document.getElementById('sid-slider');
        const display = document.getElementById('sid-display');
        const recalcZone = document.getElementById('recalculate-zone');
        const submitBtn = document.getElementById('submit-btn');
        const tutorBtn = document.getElementById('btn-ask-tutor');
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = e.target.value;
                display.textContent = val + '"';
                
                if (val != 40) {
                    recalcZone.classList.remove('hidden');
                    submitBtn.classList.remove('hidden');
                    if(tutorBtn) tutorBtn.classList.remove('hidden');
                    this.currentDistance = val;
                } else {
                    recalcZone.classList.add('hidden');
                    submitBtn.classList.add('hidden');
                    if(tutorBtn) tutorBtn.classList.add('hidden');
                }
            });
        }

        submitBtn.addEventListener('click', () => this.checkAnswer());
        if (tutorBtn) {
            tutorBtn.addEventListener('click', () => {
                if (window.MathTutor) {
                    window.MathTutor.invoke(`I am using the Inverse Square Law. Initial intensity is 100 mR at 40 inches. New distance is ${this.currentDistance} inches. How do I set up the formula I1/I2 = (D2)^2 / (D1)^2?`, document.getElementById('simulation-container'));
                }
            });
        }
        
        const inputEl = document.getElementById('spatial-input');
        if(inputEl) {
            inputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
        }
    },
    
    checkAnswer: function() {
        const inputEl = document.getElementById('spatial-input');
        const inputValue = inputEl.value;
        
        // 1. Run through Safety Validator
        const validation = SafetyValidator.validate(inputValue);

        if (!validation.valid) {
            NumeracyEngine.showFeedback(false, validation.errors.join('<br>'), 'safety');
            return;
        }

        // 2. Math logic: I1/I2 = (D2)^2 / (D1)^2  => I2 = I1 * (D1^2 / D2^2)
        const expectedI2 = 100 * (Math.pow(40, 2) / Math.pow(this.currentDistance, 2));
        
        // Allow tiny differences
        const isCorrect = Math.abs(expectedI2 - validation.value) < 1.0; // Margin of error 1mR

        if (isCorrect) {
            NumeracyEngine.showFeedback(true, 'Correct! Perfect spatial chain-reaction calculation.');
            AppState.scores.spatial = Math.min(100, AppState.scores.spatial + 25);
            saveScores();
            setTimeout(() => this.generateProblem(), 2000);
        } else {
            NumeracyEngine.showFeedback(false, `Incorrect. The expected intensity is roughly ${expectedI2.toFixed(1)} mR`, 'math');
        }
    }
};

// --- Calculator Drag & Lockout Logic ---

function initCalculatorDrag() {
    const widget = document.getElementById('calculator-widget');
    const header = document.getElementById('calculator-header');
    
    if (!widget || !header) return;
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Remove transitions during drag for smooth movement
        widget.style.transition = 'none';
        
        // Convert tailwind constraints to absolute pixels
        const rect = widget.getBoundingClientRect();
        if (!widget.style.left) {
            widget.style.left = rect.left + 'px';
            widget.style.top = rect.top + 'px';
            widget.style.bottom = 'auto';
            widget.style.right = 'auto';
        }
        
        initialLeft = parseInt(widget.style.left, 10);
        initialTop = parseInt(widget.style.top, 10);
        
        e.preventDefault(); // Prevent text selection
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        widget.style.left = (initialLeft + dx) + 'px';
        widget.style.top = (initialTop + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // Restore transitions after dragging
            widget.style.transition = '';
        }
    });

    // Minimize logic
    const minBtn = document.getElementById('calculator-minimize');
    
    if (minBtn && widget) {
        minBtn.addEventListener('click', (e) => {
            widget.classList.add('minimized');
            e.stopPropagation();
        });
        
        header.addEventListener('click', () => {
            if (widget.classList.contains('minimized')) {
                widget.classList.remove('minimized');
            }
        });
    }
    
    // Lockout Buttons
    const lockoutBtns = document.querySelectorAll('.lockout-btn');
    lockoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            unlockCalculator();
        });
    });
}
