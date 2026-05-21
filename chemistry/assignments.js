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
        lesson_1_3: generateLesson1_3,
        lesson_4_1: generateLesson4_1,
        lesson_4_2: generateLesson4_2,
        lesson_4_3: generateLesson4_3,
        lesson_4_4: generateLesson4_4,
        lesson_4_5: generateLesson4_5,
        lesson_4_6: generateLesson4_6,
        lesson_4_7: generateLesson4_7
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

    function generateLesson4_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                // Style 1: Millimoles to moles conversion (3 decimal places)
                const val = randomInt(20, 150); // e.g. 45 mmol
                const moles = val / 1000;
                questions.push({
                    question: `A patient is prescribed a dose of potassium chloride containing ${val} millimoles (mmol) of K+ ions. How many moles (mol) of K+ ions is this? (Enter your answer to 3 decimal places).`,
                    correctAnswer: moles,
                    tolerance: 0.001
                });
            } else if (style === 2) {
                // Style 2: Moles to molecules mantissa (2 decimal places)
                const val = randomFloat(0.15, 0.85, 2); // e.g. 0.50 mol
                const correctMantissa = val * 6.022; // E.g. 0.50 * 6.022 = 3.01
                questions.push({
                    question: `A clinical saline infusion delivers ${val.toFixed(2)} moles of NaCl. How many individual formula units of NaCl are administered? Enter only the mantissa (the 'a' in a * 10^23) rounded to 2 decimal places. (Use Avogadro's number = 6.022 * 10^23).`,
                    correctAnswer: correctMantissa,
                    tolerance: 0.02
                });
            } else {
                // Style 3: Tracer atoms to micromoles (2 decimal places)
                const val = randomInt(12, 48); // e.g. 24 x 10^17 atoms
                const mcmol = val / 6.022; // (val * 10^17) / 6.022e23 = (val/6.022) * 10^-6 mol = (val/6.022) mcmol
                questions.push({
                    question: `A nuclear pharmacy preparing a Technetium-99m tracer uses a dose containing ${val} * 10^17 atoms of Tc-99m. How many micromoles (mcmol) of Tc-99m does this represent? (Enter your answer to 2 decimal places. Use Avogadro's number = 6.022 * 10^23).`,
                    correctAnswer: mcmol,
                    tolerance: 0.02
                });
            }
        }
        return questions;
    }

    function generateLesson4_2() {
        const questions = [];
        const compounds = [
            { name: "Glucose", formula: "C6H12O6", mm: 180.16 },
            { name: "Sodium Chloride (Saline)", formula: "NaCl", mm: 58.44 },
            { name: "Calcium Carbonate (Antacid)", formula: "CaCO3", mm: 100.09 },
            { name: "Lactic Acid", formula: "HC3H5O3", mm: 90.08 },
            { name: "Sodium Bicarbonate", formula: "NaHCO3", mm: 84.01 },
            { name: "Water", formula: "H2O", mm: 18.02 }
        ];

        for (let i = 0; i < 10; i++) {
            const cmp = compounds[randomInt(0, compounds.length - 1)];
            const style = randomInt(1, 3);
            if (style === 1) {
                // Style 1: Find molar mass of the compound
                questions.push({
                    question: `What is the molar mass of ${cmp.name} (${cmp.formula}) in g/mol? (Enter your answer to 2 decimal places).`,
                    correctAnswer: cmp.mm,
                    tolerance: 0.02
                });
            } else if (style === 2) {
                // Style 2: Grams to moles (3 decimal places)
                const grams = randomFloat(5.0, 50.0, 1);
                const moles = grams / cmp.mm;
                questions.push({
                    question: `A clinical preparation contains ${grams.toFixed(1)} grams of ${cmp.name} (${cmp.formula}, molar mass = ${cmp.mm} g/mol). How many moles of ${cmp.formula} are present? (Enter your answer to 3 decimal places).`,
                    correctAnswer: moles,
                    tolerance: 0.005
                });
            } else {
                // Style 3: Moles to grams (2 decimal places)
                const moles = randomFloat(0.05, 0.45, 3);
                const grams = moles * cmp.mm;
                questions.push({
                    question: `An IV solution requires ${moles.toFixed(3)} moles of ${cmp.name} (${cmp.formula}, molar mass = ${cmp.mm} g/mol). How many grams of this compound must be weighed out? (Enter your answer to 2 decimal places).`,
                    correctAnswer: grams,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson4_3() {
        const questions = [];
        const reactionStyles = [
            {
                prompt: "Balance the combustion reaction of methane: a CH4 + b O2 -> c CO2 + d H2O. What is the value of 'b' (the coefficient for O2)?",
                answer: 2
            },
            {
                prompt: "Balance the cellular respiration reaction: a C6H12O6 + b O2 -> c CO2 + d H2O. What is the coefficient 'c' for CO2?",
                answer: 6
            },
            {
                prompt: "Balance the neutralization of stomach acid with Milk of Magnesia: a Mg(OH)2 + b HCl -> c MgCl2 + d H2O. What is the value of 'b' (the coefficient for HCl)?",
                answer: 2
            },
            {
                prompt: "Balance the iron rusting equation: a Fe + b O2 -> c Fe2O3. What is the sum of the reactant coefficients (a + b)?",
                answer: 7
            },
            {
                prompt: "Balance the precipitation of barium sulfate: a BaCl2 + b Na2SO4 -> c BaSO4 + d NaCl. What is the sum of ALL coefficients (a + b + c + d) in the fully balanced equation?",
                answer: 5
            },
            {
                prompt: "Balance the enzymatic decomposition of hydrogen peroxide in cells: a H2O2 -> b H2O + c O2. What is the value of the coefficient 'a'?",
                answer: 2
            },
            {
                prompt: "Balance the synthesis of ammonia (Haber process): a N2 + b H2 -> c NH3. What is the coefficient 'b' for H2?",
                answer: 3
            },
            {
                prompt: "Balance the metal dissolution reaction: a Al + b HCl -> c AlCl3 + d H2. What is the coefficient 'd' for H2 gas?",
                answer: 3
            },
            {
                prompt: "Balance the emergency oxygen generator reaction: a NaClO3 -> b NaCl + c O2. What is the sum of all coefficients (a + b + c) in the fully balanced equation?",
                answer: 7
            },
            {
                prompt: "Balance the double replacement precipitation of calcium phosphate: a CaCl2 + b Na3PO4 -> c Ca3(PO4)2 + d NaCl. What is the coefficient 'd' for NaCl?",
                answer: 6
            }
        ];

        // Shuffle or select 10 questions
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }

        for (let i = 0; i < 10; i++) {
            const rxn = reactionStyles[indices[i]];
            questions.push({
                question: rxn.prompt,
                correctAnswer: rxn.answer,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson4_4() {
        const questions = [];
        const typePool = [
            { rxn: "C3H8 + 5 O2 -> 3 CO2 + 4 H2O", ans: 5 },
            { rxn: "2 H2O2 -> 2 H2O + O2", ans: 2 },
            { rxn: "AgNO3 + NaCl -> AgCl + NaNO3", ans: 4 },
            { rxn: "4 Fe + 3 O2 -> 2 Fe2O3", ans: 1 },
            { rxn: "Zn + 2 HCl -> ZnCl2 + H2", ans: 3 },
            { rxn: "2 Al + 6 HCl -> 2 AlCl3 + 3 H2", ans: 3 },
            { rxn: "CaCO3 -> CaO + CO2", ans: 2 },
            { rxn: "N2 + 3 H2 -> 2 NH3", ans: 1 },
            { rxn: "Mg(OH)2 + 2 HCl -> MgCl2 + 2 H2O", ans: 4 },
            { rxn: "2 CH3OH + 3 O2 -> 2 CO2 + 4 H2O", ans: 5 }
        ];

        const solubleSalts = ["NaCl", "NaNO3", "KNO3", "KCl", "NH4Cl", "Na2SO4", "LiCl", "NH4NO3"];
        const insolubleSalts = ["AgCl", "BaSO4", "Ca3(PO4)2", "PbI2", "Fe(OH)3", "CaCO3", "BaCO3", "AgBr"];

        const typeIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = typeIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = typeIndices[i];
            typeIndices[i] = typeIndices[j];
            typeIndices[j] = temp;
        }

        for (let i = 0; i < 5; i++) {
            const item = typePool[typeIndices[i]];
            questions.push({
                question: `Identify the chemical reaction type for: ${item.rxn}. Enter: 1 for Synthesis, 2 for Decomposition, 3 for Single Replacement, 4 for Double Replacement, 5 for Combustion.`,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }

        for (let i = 0; i < 5; i++) {
            const numSalts = randomInt(4, 6);
            const chosen = [];
            let insolubleCount = 0;

            for (let k = 0; k < numSalts; k++) {
                if (Math.random() < 0.5) {
                    const salt = solubleSalts[randomInt(0, solubleSalts.length - 1)];
                    if (!chosen.includes(salt)) {
                        chosen.push(salt);
                    } else {
                        k--;
                    }
                } else {
                    const salt = insolubleSalts[randomInt(0, insolubleSalts.length - 1)];
                    if (!chosen.includes(salt)) {
                        chosen.push(salt);
                        insolubleCount++;
                    } else {
                        k--;
                    }
                }
            }

            questions.push({
                question: `According to clinical solubility rules, how many of the following salts are INSOLUBLE in water (will form a precipitate)? [${chosen.join(", ")}].`,
                correctAnswer: insolubleCount,
                tolerance: 0
            });
        }

        return questions;
    }

    function generateLesson4_5() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 4);
            const moles = randomFloat(0.1, 1.5, 1);
            if (style === 1) {
                const ans = moles * 3;
                questions.push({
                    question: `Given the unbalanced reaction: Al + HCl -> AlCl3 + H2. Once balanced, how many moles of HCl are required to completely react with ${moles.toFixed(1)} moles of Al? (Enter to 1 decimal place).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const ans = moles * 6;
                questions.push({
                    question: `Given the unbalanced reaction: C6H12O6 + O2 -> CO2 + H2O. Once balanced, how many moles of CO2 are produced when ${moles.toFixed(1)} moles of glucose (C6H12O6) are fully metabolized? (Enter to 1 decimal place).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else if (style === 3) {
                questions.push({
                    question: `Given the unbalanced reaction: Mg(OH)2 + HCl -> MgCl2 + H2O. Once balanced, how many moles of water are formed when ${moles.toFixed(1)} moles of stomach acid (HCl) are completely neutralized by excess Mg(OH)2? (Enter to 1 decimal place).`,
                    correctAnswer: moles,
                    tolerance: 0.05
                });
            } else {
                const ans = moles * 2;
                questions.push({
                    question: `Given the unbalanced reaction: NH3 + CO2 -> (NH2)2CO + H2O. Once balanced, how many moles of ammonia (NH3) are metabolized to synthesize ${moles.toFixed(1)} moles of urea ((NH2)2CO) in the liver? (Enter to 1 decimal place).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson4_6() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const g = randomFloat(10.0, 50.0, 1);
                const ans = (g / 180.16) * 6 * 32.00;
                questions.push({
                    question: `A patient's cells metabolize glucose via the reaction: C6H12O6(s) + 6 O2(g) -> 6 CO2(g) + 6 H2O(l). (Molar masses: C6H12O6 = 180.16 g/mol, O2 = 32.00 g/mol). If ${g.toFixed(1)} grams of glucose are completely oxidized, what mass in grams of oxygen is consumed? (Enter to 2 decimal places).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const g = randomFloat(100.0, 300.0, 1);
                const ans = (g / 106.44) * 1.5 * 32.00;
                questions.push({
                    question: `In an emergency aviation mask, oxygen is generated via sodium chlorate decomposition: 2 NaClO3 -> 2 NaCl + 3 O2. (Molar masses: NaClO3 = 106.44 g/mol, O2 = 32.00 g/mol). If ${g.toFixed(1)} grams of NaClO3 decompose completely, how many grams of O2 gas are produced? (Enter to 2 decimal places).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else {
                const g = randomFloat(1.5, 5.0, 1);
                const ans = (g / 100.09) * 44.01;
                questions.push({
                    question: `An antacid tablet containing CaCO3 neutralizes stomach acid: CaCO3 + 2 HCl -> CaCl2 + H2O + CO2. (Molar masses: CaCO3 = 100.09 g/mol, CO2 = 44.01 g/mol). If a tablet containing ${g.toFixed(1)} grams of CaCO3 is fully neutralized, how many grams of CO2 gas are released? (Enter to 2 decimal places).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson4_7() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 2);
            if (style === 1) {
                const g1 = randomFloat(10.0, 30.0, 1);
                const g2 = randomFloat(1.0, 4.0, 1);
                
                const molPt = g1 / 415.09;
                const molAmmonia = g2 / 17.03;
                
                let theoreticalMoles = 0;
                if (molAmmonia < 2 * molPt) {
                    theoreticalMoles = molAmmonia / 2;
                } else {
                    theoreticalMoles = molPt;
                }
                const theoreticalYield = theoreticalMoles * 300.06;

                questions.push({
                    question: `To prepare the chemotherapy agent cisplatin, a pharmacy reacts ${g1.toFixed(1)} g of K2PtCl4 (415.09 g/mol) with ${g2.toFixed(1)} g of NH3 (17.03 g/mol) via: K2PtCl4 + 2 NH3 -> Pt(NH3)2Cl2 + 2 KCl. (Molar mass of cisplatin Pt(NH3)2Cl2 = 300.06 g/mol). What is the theoretical yield of cisplatin in grams? (Enter to 2 decimal places).`,
                    correctAnswer: theoreticalYield,
                    tolerance: 0.05
                });
            } else {
                const g1 = randomFloat(5.0, 15.0, 1);
                const theoreticalMoles = g1 / 138.12;
                const theoreticalGrams = theoreticalMoles * 180.16;
                
                const pctYield = randomFloat(75.0, 92.0, 1);
                const actualGrams = (pctYield / 100) * theoreticalGrams;

                questions.push({
                    question: `A student synthesizes aspirin (180.16 g/mol) from salicylic acid (138.12 g/mol) and excess acetic anhydride: C7H6O3 + C4H6O3 -> C9H8O4 + C2H4O2. If the student reacts ${g1.toFixed(1)} grams of salicylic acid and obtains an actual yield of ${actualGrams.toFixed(2)} grams of aspirin, what is the percent yield of the reaction? (Enter to 1 decimal place).`,
                    correctAnswer: pctYield,
                    tolerance: 0.1
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
