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
        lesson_1_4: generateLesson1_4,
        lesson_1_5: generateLesson1_5,
        lesson_1_6: generateLesson1_6,
        lesson_1_7: generateLesson1_7,
        lesson_2_1: generateLesson2_1,
        lesson_2_2: generateLesson2_2,
        lesson_2_3: generateLesson2_3,
        lesson_2_4: generateLesson2_4,
        lesson_2_5: generateLesson2_5,
        lesson_2_6: generateLesson2_6,
        lesson_3_1: generateLesson3_1,
        lesson_3_2: generateLesson3_2,
        lesson_3_3: generateLesson3_3,
        lesson_3_4: generateLesson3_4,
        lesson_3_5: generateLesson3_5,
        lesson_3_6: generateLesson3_6,
        lesson_4_1: generateLesson4_1,
        lesson_4_2: generateLesson4_2,
        lesson_4_3: generateLesson4_3,
        lesson_4_4: generateLesson4_4,
        lesson_4_5: generateLesson4_5,
        lesson_4_6: generateLesson4_6,
        lesson_4_7: generateLesson4_7,
        lesson_5_1: generateLesson5_1,
        lesson_5_2: generateLesson5_2,
        lesson_5_3: generateLesson5_3,
        lesson_5_4: generateLesson5_4,
        lesson_5_5: generateLesson5_5,
        lesson_5_6: generateLesson5_6,
        lesson_6_1: generateLesson6_1,
        lesson_6_2: generateLesson6_2,
        lesson_6_3: generateLesson6_3,
        lesson_6_4: generateLesson6_4
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
        els.assignmentDesc.textContent = `Concept: ${lesson.concept} Hook: ${lesson.clinical_tie_in}`;

        if (state === STATE_MASTERED) {
            els.assignmentType.textContent = 'Accredited Chemistry Homework';
        } else if (state === STATE_RUSTED) {
            els.assignmentType.textContent = 'Reaccreditation Required';
        } else {
            els.assignmentType.textContent = 'Procedural Chemistry Homework';
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

    // Homework Math & Question Generators (Modules 1 - 6)

    function generateLesson1_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const f = randomInt(-10, 115);
                const c = (f - 32) * (5 / 9);
                questions.push({
                    question: `A meteorological station reports an ambient temperature of ${f} °F. Convert this temperature to Celsius (°C) (2 decimals).`,
                    correctAnswer: c,
                    tolerance: 0.01
                });
            } else if (style === 2) {
                const c = randomInt(-15, 100);
                const k = c + 273.15;
                questions.push({
                    question: `The boiling point of a chemical solvent is measured to be ${c} °C. What is this temperature in Kelvin (K) (2 decimals)?`,
                    correctAnswer: k,
                    tolerance: 0.01
                });
            } else {
                const k = randomFloat(70, 373, 2);
                const c = k - 273.15;
                questions.push({
                    question: `A cryogenic liquid sample is kept at a temperature of ${k.toFixed(2)} K. What is this temperature in Celsius (°C) (2 decimals)?`,
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
                const target = randomFloat(10, 100, 1);
                const measured = target + randomFloat(-5, 5, 1);
                const absError = Math.abs(measured - target);
                questions.push({
                    question: `A student uses a graduated cylinder to measure a target volume of ${target.toFixed(1)} mL of distilled water. The actual volume delivered is measured to be ${measured.toFixed(1)} mL on an analytical balance. Calculate the absolute error in mL. (1 decimal)`,
                    correctAnswer: absError,
                    tolerance: 0.1
                });
            } else if (style === 2) {
                const trueVal = randomFloat(10, 50, 1);
                const measured = trueVal + randomFloat(-2, 2, 1);
                const pctError = Math.abs((measured - trueVal) / trueVal) * 100;
                questions.push({
                    question: `The true value of a metal block's mass is ${trueVal.toFixed(1)} g. A student measures the mass as ${measured.toFixed(1)} g. What is the percent error of this measurement? (2 decimals)`,
                    correctAnswer: pctError,
                    tolerance: 0.05
                });
            } else {
                const readings = [
                    randomFloat(24.5, 25.5, 2),
                    randomFloat(24.5, 25.5, 2),
                    randomFloat(24.5, 25.5, 2)
                ];
                const mean = (readings[0] + readings[1] + readings[2]) / 3;
                questions.push({
                    question: `Three repeated volume readings from a volumetric pipette are ${readings[0].toFixed(2)}, ${readings[1].toFixed(2)}, and ${readings[2].toFixed(2)} mL. What is the mean volume of these measurements in mL? (2 decimals)`,
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
                const exp = randomInt(-5, -1);
                const value = mantissa * Math.pow(10, exp);
                questions.push({
                    question: `The concentration of hydronium ions in an aqueous solution is ${mantissa.toFixed(2)} x 10^(${exp}) M. Express this value in standard decimal notation (e.g. 0.00015).`,
                    correctAnswer: value,
                    tolerance: Math.max(0.000001, Math.abs(value) * 0.0001)
                });
            } else if (style === 2) {
                const a = randomFloat(1.0, 9.0, 2);
                const b = randomFloat(1.0, 9.0, 2);
                const expA = randomInt(2, 4);
                const expB = randomInt(3, 5);
                const result = a * Math.pow(10, expA) * (b * Math.pow(10, expB));
                questions.push({
                    question: `Calculate the product of the scientific numbers (${a.toFixed(2)} x 10^${expA}) and (${b.toFixed(2)} x 10^${expB}). Express the final result in standard decimal notation (no scientific notation).`,
                    correctAnswer: result,
                    tolerance: Math.max(0.1, Math.abs(result) * 0.0001)
                });
            } else {
                const value = randomInt(10000, 990000);
                const exp = Math.floor(Math.log10(value));
                const normalized = value / Math.pow(10, exp);
                questions.push({
                    question: `Write the value ${value} in normalized scientific notation (a x 10^b). Enter only the mantissa 'a' (e.g. for 4.5 x 10^5, enter 4.5). (2 decimals)`,
                    correctAnswer: normalized,
                    tolerance: 0.01
                });
            }
        }
        return questions;
    }

    function generateLesson1_4() {
        const questions = [];
        const cases = [
            { num: "0.00405", count: 3 },
            { num: "120.0", count: 4 },
            { num: "1.0040", count: 5 },
            { num: "5000", count: 1 },
            { num: "0.010", count: 2 },
            { num: "3.40e5", count: 3 },
            { num: "100.02", count: 5 },
            { num: "0.0005", count: 1 }
        ];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const item = cases[randomInt(0, cases.length - 1)];
                questions.push({
                    question: `How many significant figures are in the measurement '${item.num}'? (Enter an integer)`,
                    correctAnswer: item.count,
                    tolerance: 0
                });
            } else if (style === 2) {
                const a = randomFloat(10.1, 99.9, 1);
                const b = randomFloat(1.05, 9.95, 2);
                const roundedSum = Math.round((a + b) * 10) / 10;
                questions.push({
                    question: `Perform the addition operation: ${a.toFixed(1)} + ${b.toFixed(2)}. Report the answer rounded to the correct number of decimal places (decimal places rules apply).`,
                    correctAnswer: roundedSum,
                    tolerance: 0.001
                });
            } else {
                const a = randomFloat(2.0, 9.0, 1);
                const b = randomFloat(10.05, 19.95, 2);
                let roundedVal = Number((a * b).toPrecision(2));
                questions.push({
                    question: `Perform the multiplication operation: ${a.toFixed(1)} * ${b.toFixed(2)}. Report the answer rounded to the correct number of significant figures (total significant digits rules apply).`,
                    correctAnswer: roundedVal,
                    tolerance: roundedVal * 0.01
                });
            }
        }
        return questions;
    }

    function generateLesson1_5() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const kg = randomFloat(0.2, 7.5, 3);
                const mg = kg * 1000000;
                questions.push({
                    question: `Convert ${kg.toFixed(3)} kilograms (kg) to milligrams (mg). Set it up as a factor-label chain (kg -> g -> mg).`,
                    correctAnswer: mg,
                    tolerance: Math.max(0.1, Math.abs(mg) * 0.00001)
                });
            } else if (style === 2) {
                const gCm3 = randomFloat(0.65, 19.30, 3);
                const kgM3 = gCm3 * 1000;
                questions.push({
                    question: `A material has density ${gCm3.toFixed(3)} g/cm^3. Convert this to kg/m^3 using dimensional analysis.`,
                    correctAnswer: kgM3,
                    tolerance: Math.max(0.5, Math.abs(kgM3) * 0.0001)
                });
            } else {
                const mlMin = randomFloat(12.0, 950.0, 1);
                const lHr = (mlMin / 1000) * 60;
                questions.push({
                    question: `An IV infusion runs at ${mlMin.toFixed(1)} mL/min. Convert this rate to L/h using a conversion-factor chain.`,
                    correctAnswer: lHr,
                    tolerance: 0.01
                });
            }
        }
        return questions;
    }

    function generateLesson1_6() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const mass = randomFloat(10.0, 150.0, 1);
                const vol = randomFloat(5.0, 20.0, 1);
                const dens = mass / vol;
                questions.push({
                    question: `A sample of metal alloy has a mass of ${mass.toFixed(1)} g and occupies a volume of ${vol.toFixed(1)} mL. Calculate its density in g/mL. (2 decimals)`,
                    correctAnswer: dens,
                    tolerance: 0.02
                });
            } else if (style === 2) {
                const mass = randomFloat(15.0, 60.0, 1);
                const initialVol = randomFloat(20.0, 30.0, 1);
                const displacement = randomFloat(4.0, 12.0, 1);
                const finalVol = initialVol + displacement;
                const dens = mass / displacement;
                questions.push({
                    question: `A piece of mineral weighing ${mass.toFixed(1)} g is placed in a graduated cylinder filled with water. The water level rises from ${initialVol.toFixed(1)} mL to ${finalVol.toFixed(1)} mL. What is the density of the mineral in g/mL? (2 decimals)`,
                    correctAnswer: dens,
                    tolerance: 0.02
                });
            } else {
                const vol = randomFloat(10.0, 100.0, 1);
                const dens = randomFloat(0.65, 1.25, 2);
                const mass = dens * vol;
                questions.push({
                    question: `An organic liquid solvent has a density of ${dens.toFixed(2)} g/mL. What is the mass in grams (g) of a ${vol.toFixed(1)} mL sample of this solvent? (2 decimals)`,
                    correctAnswer: mass,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson1_7() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const m = randomFloat(10.0, 200.0, 1);
                const dT = randomFloat(5.0, 45.0, 1);
                const q = m * 4.184 * dT;
                questions.push({
                    question: `Calculate the quantity of heat in Joules (J) absorbed when ${m.toFixed(1)} g of water (c = 4.184 J/g*°C) is heated, increasing its temperature by ${dT.toFixed(1)} °C. (1 decimal)`,
                    correctAnswer: q,
                    tolerance: 0.5
                });
            } else if (style === 2) {
                const m = randomFloat(20.0, 100.0, 1);
                const q = randomFloat(200, 1500, 0);
                const dT = randomFloat(15.0, 50.0, 1);
                const c = q / (m * dT);
                questions.push({
                    question: `A sample of metal with a mass of ${m.toFixed(1)} g absorbs ${q} J of heat energy, causing its temperature to rise by ${dT.toFixed(1)} °C. Calculate the specific heat capacity of the metal in J/g*°C. (3 decimals)`,
                    correctAnswer: c,
                    tolerance: 0.005
                });
            } else {
                const m = randomFloat(15.0, 80.0, 1);
                const q = randomFloat(100, 800, 0);
                const dT = q / (m * 0.385);
                questions.push({
                    question: `A copper block (c = 0.385 J/g*°C) with a mass of ${m.toFixed(1)} g absorbs ${q} J of heat energy. By how many degrees Celsius (°C) will its temperature increase? (2 decimals)`,
                    correctAnswer: dT,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson2_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const protons = randomInt(11, 26);
                let qText = "";
                let ans = 0;
                if (protons === 26) {
                    qText = "iron(III) ion (Fe3+, atomic number = 26)";
                    ans = 23;
                } else if (protons === 20) {
                    qText = "calcium ion (Ca2+, atomic number = 20)";
                    ans = 18;
                } else {
                    qText = "sodium ion (Na+, atomic number = 11)";
                    ans = 10;
                }
                questions.push({
                    question: `How many electrons are present in one ${qText}? (Enter an integer)`,
                    correctAnswer: ans,
                    tolerance: 0
                });
            } else if (style === 2) {
                const massNum = randomInt(12, 14);
                const neutrons = massNum - 6;
                questions.push({
                    question: `How many neutrons are present in the nucleus of a carbon-${massNum} isotope (atomic number = 6)? (Enter an integer)`,
                    correctAnswer: neutrons,
                    tolerance: 0
                });
            } else {
                const mass1 = randomFloat(10.0, 11.0, 4);
                const mass2 = randomFloat(11.0, 12.0, 4);
                const abundance1 = randomFloat(18.0, 22.0, 2);
                const abundance2 = 100.0 - abundance1;
                const avgMass = (mass1 * abundance1 + mass2 * abundance2) / 100.0;
                questions.push({
                    question: `Element X has two stable isotopes. Isotope 1 has a mass of ${mass1.toFixed(4)} amu and a natural abundance of ${abundance1.toFixed(2)}%. Isotope 2 has a mass of ${mass2.toFixed(4)} amu and a natural abundance of ${abundance2.toFixed(2)}%. What is the average atomic mass of Element X in amu? (3 decimals)`,
                    correctAnswer: avgMass,
                    tolerance: 0.005
                });
            }
        }
        return questions;
    }

    function generateLesson2_2() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const freq = randomFloat(4.0, 7.5, 2);
                const wl = 3000 / freq;
                questions.push({
                    question: `A photon has a frequency of ${freq.toFixed(2)} x 10^14 Hz. Calculate its wavelength in nanometers (nm). Use the speed of light c = 3.00 x 10^8 m/s. (1 decimal)`,
                    correctAnswer: wl,
                    tolerance: 0.5
                });
            } else if (style === 2) {
                const freq = randomFloat(4.0, 7.5, 2);
                const energyMantissa = freq * 0.6626;
                questions.push({
                    question: `Calculate the energy in Joules of a photon with a frequency of ${freq.toFixed(2)} x 10^14 Hz. Enter only the mantissa 'a' (the multiplier in a * 10^-19 J). Use Planck's constant h = 6.626 x 10^-34 J*s. (2 decimals)`,
                    correctAnswer: energyMantissa,
                    tolerance: 0.02
                });
            } else {
                const elements = [
                    { name: "oxygen (O, atomic number = 8)", valence: 6 },
                    { name: "chlorine (Cl, atomic number = 17)", valence: 7 },
                    { name: "phosphorus (P, atomic number = 15)", valence: 5 },
                    { name: "calcium (Ca, atomic number = 20)", valence: 2 },
                    { name: "silicon (Si, atomic number = 14)", valence: 4 }
                ];
                const el = elements[randomInt(0, elements.length - 1)];
                questions.push({
                    question: `How many valence electrons are present in a neutral atom of ${el.name}? (Enter an integer)`,
                    correctAnswer: el.valence,
                    tolerance: 0
                });
            }
        }
        return questions;
    }

    function generateLesson2_3() {
        const questions = [];
        const trends = [
            { q: "Which has a larger atomic radius? Enter 1 for Sodium (Na), 2 for Chlorine (Cl).", ans: 1 },
            { q: "Which has a larger atomic radius? Enter 1 for Fluorine (F), 2 for Bromine (Br).", ans: 2 },
            { q: "Which has a higher first ionization energy? Enter 1 for Magnesium (Mg), 2 for Sulfur (S).", ans: 2 },
            { q: "Which has a higher first ionization energy? Enter 1 for Lithium (Li), 2 for Potassium (K).", ans: 1 },
            { q: "Which has a higher electronegativity? Enter 1 for Oxygen (O), 2 for Lithium (Li).", ans: 1 },
            { q: "Which has a higher electronegativity? Enter 1 for Nitrogen (N), 2 for Bismuth (Bi).", ans: 1 },
            { q: "How many valence electrons does a neutral nitrogen (N) atom have?", ans: 5 },
            { q: "Which group of the periodic table represents the noble gases? Enter the group number (1 to 18).", ans: 18 },
            { q: "Which group of the periodic table represents the halogens? Enter the group number (1 to 18).", ans: 17 },
            { q: "Which element is the most electronegative on the periodic table? Enter: 1 for Fluorine (F), 2 for Cesium (Cs), 3 for Helium (He).", ans: 1 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = trends[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson2_4() {
        const questions = [];
        const pool = [
            { q: "What is the common ionic charge of an aluminum (Al) ion? (Enter an integer, e.g. 3)", ans: 3 },
            { q: "What is the common ionic charge of a sulfur (S) ion? (Enter the magnitude only, e.g. for -2 enter 2)", ans: 2 },
            { q: "What is the common ionic charge of a barium (Ba) ion? (Enter an integer, e.g. 2)", ans: 2 },
            { q: "How many magnesium ions (Mg2+) are required to combine with two phosphate ions (PO4^3-) to form a neutral salt?", ans: 3 },
            { q: "How many chloride ions (Cl-) are required to balance one iron(III) ion (Fe3+) in FeCl3?", ans: 3 },
            { q: "What is the total number of atoms in one formula unit of calcium carbonate (CaCO3)?", ans: 5 },
            { q: "What is the total number of atoms in one formula unit of ammonium sulfate, (NH4)2SO4?", ans: 15 },
            { q: "How many valence electrons are lost when a neutral calcium (Ca) atom forms a stable Ca2+ ion?", ans: 2 },
            { q: "How many valence electrons are gained when a neutral fluorine (F) atom forms a stable fluoride ion (F-)?", ans: 1 },
            { q: "What is the magnitude of the charge of a nitrate polyatomic ion (NO3-)?", ans: 1 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = pool[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson2_5() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 2);
            if (style === 1) {
                const iso1Mass = randomFloat(20.0, 120.0, 3);
                const iso2Mass = iso1Mass + randomFloat(1.5, 4.5, 3);
                const iso1Pct = randomInt(15, 85);
                const iso2Pct = 100 - iso1Pct;
                const avgMass = (iso1Mass * iso1Pct + iso2Mass * iso2Pct) / 100;
                questions.push({
                    question: `Element X has two naturally occurring isotopes. Isotope X-1 has mass ${iso1Mass.toFixed(3)} amu and abundance ${iso1Pct}%. Isotope X-2 has mass ${iso2Mass.toFixed(3)} amu and abundance ${iso2Pct}%. Calculate the average atomic mass of Element X (3 decimals).`,
                    correctAnswer: avgMass,
                    tolerance: 0.005
                });
            } else if (style === 2) {
                const iso1Mass = randomFloat(10.0, 80.0, 3);
                const iso2Mass = iso1Mass + randomFloat(0.8, 3.8, 3);
                const iso3Mass = iso2Mass + randomFloat(0.8, 3.8, 3);
                const iso1Pct = randomInt(10, 70);
                const iso2Pct = randomInt(10, 70 - iso1Pct);
                const iso3Pct = 100 - iso1Pct - iso2Pct;
                const avgMass = (iso1Mass * iso1Pct + iso2Mass * iso2Pct + iso3Mass * iso3Pct) / 100;
                questions.push({
                    question: `Element Q has three isotopes with masses ${iso1Mass.toFixed(3)} amu (${iso1Pct}%), ${iso2Mass.toFixed(3)} amu (${iso2Pct}%), and ${iso3Mass.toFixed(3)} amu (${iso3Pct}%). What is the average atomic mass of Q (3 decimals)?`,
                    correctAnswer: avgMass,
                    tolerance: 0.005
                });
            }
        }
        return questions;
    }

    function generateLesson2_6() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const halfLife = randomInt(3, 15);
                const numHalfLives = randomInt(2, 4);
                const time = halfLife * numHalfLives;
                const remainingPct = 100 * Math.pow(0.5, numHalfLives);
                questions.push({
                    question: `A radioisotope sample has a half-life of ${halfLife} days. What percentage (%) of the original sample will remain after ${time} days? (2 decimals)`,
                    correctAnswer: remainingPct,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const initialMass = randomFloat(10, 200, 1);
                const numHalfLives = randomInt(1, 4);
                const finalMass = initialMass * Math.pow(0.5, numHalfLives);
                questions.push({
                    question: `A radioactive sample begins with a mass of ${initialMass.toFixed(1)} mg. How many mg of this sample remain after exactly ${numHalfLives} half-lives? (3 decimals)`,
                    correctAnswer: finalMass,
                    tolerance: 0.005
                });
            } else {
                const decayStyle = randomInt(1, 3);
                if (decayStyle === 1) {
                    const parentA = randomInt(180, 240);
                    const daughterA = parentA - 4;
                    questions.push({
                        question: `In alpha decay, an alpha particle (4/2 He) is emitted. If an isotope with mass number ${parentA} emits one alpha particle, what is the daughter mass number?`,
                        correctAnswer: daughterA,
                        tolerance: 0
                    });
                } else if (decayStyle === 2) {
                    const parentZ = randomInt(10, 82);
                    const daughterZ = parentZ + 1;
                    questions.push({
                        question: `In beta-minus decay, a neutron becomes a proton. If a parent atom has atomic number ${parentZ}, what is the daughter atomic number after one beta-minus decay event?`,
                        correctAnswer: daughterZ,
                        tolerance: 0
                    });
                } else {
                    const halfLife = randomInt(2, 24);
                    const numHalfLives = randomInt(3, 5);
                    const totalTime = halfLife * numHalfLives;
                    questions.push({
                        question: `A radioactive sample decays from 800 Bq to 50 Bq in ${totalTime} hours. This is 4 half-lives. What is the half-life in hours?`,
                        correctAnswer: halfLife,
                        tolerance: 0
                    });
                }
            }
        }
        return questions;
    }

    function generateLesson3_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const en1 = randomFloat(2.1, 3.5, 1);
                const en2 = randomFloat(0.8, 2.5, 1);
                const diff = Math.abs(en1 - en2);
                questions.push({
                    question: `Calculate the absolute electronegativity difference between two bonded atoms, where Atom A has an electronegativity of ${en1.toFixed(1)} and Atom B has an electronegativity of ${en2.toFixed(1)}. (1 decimal)`,
                    correctAnswer: diff,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const compounds = [
                    { name: "NaCl (Na = 0.9, Cl = 3.0)", ans: 3 },
                    { name: "HCl (H = 2.1, Cl = 3.0)", ans: 2 },
                    { name: "CH4 (C = 2.5, H = 2.1)", ans: 1 },
                    { name: "O2 (O = 3.5, O = 3.5)", ans: 1 },
                    { name: "H2O (H = 2.1, O = 3.5)", ans: 2 }
                ];
                const item = compounds[randomInt(0, compounds.length - 1)];
                questions.push({
                    question: `Classify the bond type of the compound: ${item.name}. Enter: 1 for Nonpolar covalent (diff < 0.4), 2 for Polar covalent (diff 0.4 to 1.7), 3 for Ionic (diff > 1.7).`,
                    correctAnswer: item.ans,
                    tolerance: 0
                });
            } else {
                const atoms = [
                    { name: "C (2.5) and O (3.5)", ans: 1.0 },
                    { name: "H (2.1) and F (4.0)", ans: 1.9 },
                    { name: "Li (1.0) and F (4.0)", ans: 3.0 }
                ];
                const item = atoms[randomInt(0, atoms.length - 1)];
                questions.push({
                    question: `What is the electronegativity difference (absolute value) between the atoms in a bond of ${item.name}? (1 decimal)`,
                    correctAnswer: item.ans,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson3_2() {
        const questions = [];
        const molecules = [
            { name: "H2O", val: 8, bonding: 4, lonePairsCentral: 2 },
            { name: "CO2", val: 16, bonding: 8, lonePairsCentral: 0 },
            { name: "NH3", val: 8, bonding: 6, lonePairsCentral: 1 },
            { name: "CH4", val: 8, bonding: 8, lonePairsCentral: 0 },
            { name: "O2", val: 12, bonding: 4, lonePairsCentral: 2 }
        ];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            const mol = molecules[randomInt(0, molecules.length - 1)];
            if (style === 1) {
                questions.push({
                    question: `How many total valence electrons are available to draw the Lewis structure of ${mol.name}?`,
                    correctAnswer: mol.val,
                    tolerance: 0
                });
            } else if (style === 2) {
                questions.push({
                    question: `In the Lewis structure of ${mol.name} (satisfying the octet rule), what is the total number of shared (bonding) electrons?`,
                    correctAnswer: mol.bonding,
                    tolerance: 0
                });
            } else {
                questions.push({
                    question: `In the Lewis structure of ${mol.name}, how many non-bonding lone pairs of electrons are located on the central atom?`,
                    correctAnswer: mol.lonePairsCentral,
                    tolerance: 0
                });
            }
        }
        return questions;
    }

    function generateLesson3_3() {
        const questions = [];
        const pool = [
            { q: "According to VSEPR theory, what is the steric number (bonding domains + lone pairs on the central atom) of water (H2O)?", ans: 4 },
            { q: "According to VSEPR theory, what is the steric number of carbon dioxide (CO2)?", ans: 2 },
            { q: "According to VSEPR theory, what is the steric number of ammonia (NH3)?", ans: 4 },
            { q: "Identify the molecular shape of carbon dioxide (CO2). Enter: 1 for Linear, 2 for Bent, 3 for Trigonal Planar, 4 for Tetrahedral.", ans: 1 },
            { q: "Identify the molecular shape of water (H2O). Enter: 1 for Linear, 2 for Bent, 3 for Trigonal Planar, 4 for Tetrahedral.", ans: 2 },
            { q: "Identify the molecular shape of ammonia (NH3). Enter: 1 for Bent, 2 for Trigonal Planar, 3 for Trigonal Pyramidal, 4 for Tetrahedral.", ans: 3 },
            { q: "Identify the molecular shape of methane (CH4). Enter: 1 for Bent, 2 for Trigonal Planar, 3 for Trigonal Pyramidal, 4 for Tetrahedral.", ans: 4 },
            { q: "What is the approximate bond angle in a tetrahedral molecule like methane (CH4)? (Enter to 1 decimal place, e.g. 109.5)", ans: 109.5 },
            { q: "What is the steric number of the central sulfur atom in sulfur dioxide (SO2)?", ans: 3 },
            { q: "Identify the molecular shape of boron trifluoride (BF3) which has a steric number of 3 and 0 lone pairs. Enter: 1 for Bent, 2 for Trigonal Planar, 3 for Trigonal Pyramidal, 4 for Tetrahedral.", ans: 2 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = pool[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0.1
            });
        }
        return questions;
    }

    function generateLesson3_4() {
        const questions = [];
        const compounds = [
            { q: "Identify the dominant intermolecular force in hydrogen fluoride (HF) gas. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 3 },
            { q: "Identify the dominant intermolecular force in methane (CH4) gas. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 1 },
            { q: "Identify the dominant intermolecular force in hydrochloric acid / hydrogen chloride (HCl) gas. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 2 },
            { q: "Identify the dominant intermolecular force in liquid water (H2O). Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 3 },
            { q: "Identify the dominant intermolecular force in helium (He) gas. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 1 },
            { q: "Identify the dominant intermolecular force in carbon tetrachloride (CCl4) liquid. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 1 },
            { q: "Identify the dominant intermolecular force holding a sodium ion (Na+) dissolved in water. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 4 },
            { q: "Identify the dominant intermolecular force in nitrogen (N2) liquid. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 1 },
            { q: "Identify the dominant intermolecular force in ammonia (NH3) liquid. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 3 },
            { q: "Identify the dominant intermolecular force in formaldehyde (H2CO), a polar molecule lacking O-H, N-H or F-H bonds. Enter: 1 for London Dispersion, 2 for Dipole-Dipole, 3 for Hydrogen Bonding, 4 for Ion-Dipole.", ans: 2 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = compounds[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson3_5() {
        const questions = [];
        const cases = [
            { q: "Which compound has the higher boiling point? Enter 1 for Water (H2O), 2 for Hydrogen Sulfide (H2S).", ans: 1 },
            { q: "Which compound has the higher boiling point? Enter 1 for Methane (CH4), 2 for Ethane (C2H6).", ans: 2 },
            { q: "Which compound has the higher vapor pressure at room temperature (higher volatility)? Enter 1 for Methanol (CH3OH), 2 for Dimethyl ether (CH3OCH3).", ans: 2 },
            { q: "Which liquid has a higher viscosity at room temperature? Enter 1 for Ethylene glycol (2 OH groups), 2 for Ethanol (1 OH group).", ans: 1 },
            { q: "According to 'like dissolves like', which solute is more soluble in water? Enter 1 for Sodium Chloride (NaCl), 2 for Motor Oil (nonpolar hydrocarbons).", ans: 1 },
            { q: "Which compound has the higher melting point? Enter 1 for Sodium Fluoride (NaF, ionic), 2 for Hydrogen Fluoride (HF, covalent).", ans: 1 },
            { q: "Which gas has a higher boiling point? Enter 1 for Argon (Ar, molecular weight = 40), 2 for Helium (He, molecular weight = 4).", ans: 1 },
            { q: "Which liquid has the higher surface tension? Enter 1 for Water (H2O), 2 for Diethyl ether ((C2H5)2O).", ans: 1 },
            { q: "According to 'like dissolves like', which solvent would best dissolve grease (nonpolar hydrocarbons)? Enter 1 for Water, 2 for Hexane (nonpolar).", ans: 2 },
            { q: "Which compound has the higher boiling point? Enter 1 for Butane (C4H10), 2 for Acetone (C3H6O, polar carbonyl group).", ans: 2 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = cases[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson3_6() {
        const questions = [];
        const nomenclatures = [
            { q: "What is the IUPAC systematic name for FeCl3? Enter: 1 for Iron trichloride, 2 for Iron(II) chloride, 3 for Iron(III) chloride.", ans: 3 },
            { q: "What is the chemical formula of copper(II) sulfate? Enter: 1 for CuSO4, 2 for Cu2SO4, 3 for Cu(SO4)2.", ans: 1 },
            { q: "What is the systematic name for the covalent molecule N2O4? Enter: 1 for Nitrogen oxide, 2 for Dinitrogen tetroxide, 3 for Nitrogen tetroxide.", ans: 2 },
            { q: "What is the systematic name for the binary acid HCl(aq)? Enter: 1 for Hydrochloric acid, 2 for Chloric acid, 3 for Chlorous acid.", ans: 1 },
            { q: "What is the systematic name for the oxyacid H2SO4(aq)? Enter: 1 for Hydrosulfuric acid, 2 for Sulfurous acid, 3 for Sulfuric acid.", ans: 3 },
            { q: "What is the systematic name for the oxyacid HNO2(aq)? Enter: 1 for Nitric acid, 2 for Nitrous acid, 3 for Hydronitric acid.", ans: 2 },
            { q: "What is the chemical formula of sodium carbonate decahydrate? Enter: 1 for Na2CO3 * 10 H2O, 2 for NaCO3 * 10 H2O, 3 for Na2CO3 * H2O.", ans: 1 },
            { q: "What is the formula of carbon tetrachloride? Enter: 1 for C4Cl, 2 for CCl3, 3 for CCl4.", ans: 3 },
            { q: "What is the systematic name for the compound Ca(NO3)2? Enter: 1 for Calcium nitride, 2 for Calcium nitrate, 3 for Calcium nitrite.", ans: 2 },
            { q: "What is the systematic name for SF6? Enter: 1 for Sulfur hexafluoride, 2 for Sulfur fluoride, 3 for Hexasulfur fluoride.", ans: 1 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = nomenclatures[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson4_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const val = randomInt(20, 150);
                const moles = val / 1000;
                questions.push({
                    question: `A chemistry experiment requires a reagent containing ${val} millimoles (mmol) of copper(II) ions. How many moles (mol) of copper(II) ions is this? (3 decimals)`,
                    correctAnswer: moles,
                    tolerance: 0.001
                });
            } else if (style === 2) {
                const val = randomFloat(0.15, 0.85, 2);
                const correctMantissa = val * 6.022;
                questions.push({
                    question: `A laboratory solution contains ${val.toFixed(2)} moles of NaCl. How many formula units of NaCl are dissolved in this solution? Enter only the mantissa 'a' (in a * 10^23). Use Avogadro's number = 6.022 * 10^23. (2 decimals)`,
                    correctAnswer: correctMantissa,
                    tolerance: 0.02
                });
            } else {
                const val = randomInt(12, 48);
                const mcmol = val / 6.022;
                questions.push({
                    question: `A microscale sample of gold contains ${val} * 10^17 atoms. How many micromoles (mcmol) of gold does this represent? (2 decimals). Use Avogadro's number = 6.022 * 10^23.`,
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
            { name: "Sodium Chloride", formula: "NaCl", mm: 58.44 },
            { name: "Calcium Carbonate", formula: "CaCO3", mm: 100.09 },
            { name: "Lactic Acid", formula: "HC3H5O3", mm: 90.08 },
            { name: "Sodium Bicarbonate", formula: "NaHCO3", mm: 84.01 },
            { name: "Water", formula: "H2O", mm: 18.02 }
        ];

        for (let i = 0; i < 10; i++) {
            const cmp = compounds[randomInt(0, compounds.length - 1)];
            const style = randomInt(1, 3);
            if (style === 1) {
                questions.push({
                    question: `What is the molar mass of ${cmp.name} (${cmp.formula}) in g/mol? (2 decimals)`,
                    correctAnswer: cmp.mm,
                    tolerance: 0.02
                });
            } else if (style === 2) {
                const grams = randomFloat(5.0, 50.0, 1);
                const moles = grams / cmp.mm;
                questions.push({
                    question: `A laboratory reagent sample contains ${grams.toFixed(1)} grams of ${cmp.name} (${cmp.formula}, molar mass = ${cmp.mm} g/mol). How many moles of ${cmp.formula} are present in this sample? (3 decimals)`,
                    correctAnswer: moles,
                    tolerance: 0.005
                });
            } else {
                const moles = randomFloat(0.05, 0.45, 3);
                const grams = moles * cmp.mm;
                questions.push({
                    question: `A reaction requires ${moles.toFixed(3)} moles of ${cmp.name} (${cmp.formula}, molar mass = ${cmp.mm} g/mol). How many grams of this compound must be weighed out? (2 decimals)`,
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
                prompt: "Balance the neutralization reaction: a Mg(OH)2 + b HCl -> c MgCl2 + d H2O. What is the value of 'b' (the coefficient for HCl)?",
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
                question: `According to standard chemical solubility rules, how many of the following salts are INSOLUBLE in water (will form a precipitate)? [${chosen.join(", ")}].`,
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
                    question: `Given the reaction: C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O. How many moles of CO2 are produced when ${moles.toFixed(1)} moles of glucose (C6H12O6) are fully reacted with excess oxygen? (Enter to 1 decimal place).`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else if (style === 3) {
                questions.push({
                    question: `Given the unbalanced reaction: Mg(OH)2 + HCl -> MgCl2 + H2O. Once balanced, how many moles of water are formed when ${moles.toFixed(1)} moles of hydrochloric acid (HCl) are completely neutralized by excess Mg(OH)2? (Enter to 1 decimal place).`,
                    correctAnswer: moles,
                    tolerance: 0.05
                });
            } else {
                const ans = moles * 2;
                questions.push({
                    question: `Given the unbalanced reaction: NH3 + CO2 -> (NH2)2CO + H2O. Once balanced, how many moles of ammonia (NH3) are consumed to synthesize ${moles.toFixed(1)} moles of urea ((NH2)2CO)? (Enter to 1 decimal place).`,
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
                    question: `In a laboratory combustion chamber, glucose reacts with oxygen: C6H12O6(s) + 6 O2(g) -> 6 CO2(g) + 6 H2O(l). (Molar masses: C6H12O6 = 180.16 g/mol, O2 = 32.00 g/mol). If ${g.toFixed(1)} grams of glucose are completely oxidized, what mass in grams of oxygen is consumed? (2 decimals)`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const g = randomFloat(100.0, 300.0, 1);
                const ans = (g / 106.44) * 1.5 * 32.00;
                questions.push({
                    question: `Consider the thermal decomposition of sodium chlorate: 2 NaClO3 -> 2 NaCl + 3 O2. (Molar masses: NaClO3 = 106.44 g/mol, O2 = 32.00 g/mol). If ${g.toFixed(1)} grams of NaClO3 decompose completely, how many grams of O2 gas are produced? (2 decimals)`,
                    correctAnswer: ans,
                    tolerance: 0.05
                });
            } else {
                const g = randomFloat(1.5, 5.0, 1);
                const ans = (g / 100.09) * 44.01;
                questions.push({
                    question: `Calcium carbonate reacts with hydrochloric acid: CaCO3 + 2 HCl -> CaCl2 + H2O + CO2. (Molar masses: CaCO3 = 100.09 g/mol, CO2 = 44.01 g/mol). If a sample containing ${g.toFixed(1)} grams of CaCO3 is fully reacted with excess acid, how many grams of CO2 gas are released? (2 decimals)`,
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
                const g1 = randomFloat(12.0, 60.0, 1);
                const g2 = randomFloat(8.0, 45.0, 1);
                const molFe2O3 = g1 / 159.69;
                const molCO = g2 / 28.01;
                let theoreticalMoles = 0;
                if (molCO < 3 * molFe2O3) {
                    theoreticalMoles = (2 / 3) * molCO;
                } else {
                    theoreticalMoles = 2 * molFe2O3;
                }
                const theoreticalYield = theoreticalMoles * 55.845;

                questions.push({
                    question: `Iron(III) oxide is reduced by carbon monoxide: Fe2O3 + 3CO -> 2Fe + 3CO2. If ${g1.toFixed(1)} g Fe2O3 (159.69 g/mol) reacts with ${g2.toFixed(1)} g CO (28.01 g/mol), what is the theoretical yield of Fe in grams? (2 decimals)`,
                    correctAnswer: theoreticalYield,
                    tolerance: 0.05
                });
            } else {
                const g1 = randomFloat(10.0, 35.0, 1);
                const theoreticalMoles = g1 / 100.09;
                const theoreticalGrams = theoreticalMoles * 56.08;
                const pctYield = randomFloat(75.0, 92.0, 1);
                const actualGrams = (pctYield / 100) * theoreticalGrams;

                questions.push({
                    question: `Calcium oxide reacts with carbon dioxide: CaO + CO2 -> CaCO3. A student reacts ${g1.toFixed(1)} g CaO (56.08 g/mol) and obtains ${actualGrams.toFixed(2)} g CaCO3 (100.09 g/mol). What is the percent yield? (1 decimal)`,
                    correctAnswer: pctYield,
                    tolerance: 0.1
                });
            }
        }
        return questions;
    }

    function generateLesson5_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const p1 = randomFloat(0.8, 2.5, 2);
                const v1 = randomFloat(1.0, 5.0, 2);
                const v2 = randomFloat(0.5, 4.0, 2);
                const p2 = (p1 * v1) / v2;
                questions.push({
                    question: `A sample of gas has a volume of ${v1.toFixed(2)} L at a pressure of ${p1.toFixed(2)} atm. If the volume is changed to ${v2.toFixed(2)} L at constant temperature, what is the new pressure in atm? (2 decimals)`,
                    correctAnswer: p2,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const v1 = randomFloat(1.0, 10.0, 1);
                const tc1 = randomInt(0, 100);
                const tc2 = randomInt(100, 300);
                const tk1 = tc1 + 273.15;
                const tk2 = tc2 + 273.15;
                const v2 = (v1 * tk2) / tk1;
                questions.push({
                    question: `A gas bubble has a volume of ${v1.toFixed(1)} L at ${tc1} °C. If it is heated to ${tc2} °C at constant pressure, what is the new volume in L? (2 decimals)`,
                    correctAnswer: v2,
                    tolerance: 0.05
                });
            } else {
                const p1 = randomFloat(1.0, 3.0, 2);
                const v1 = randomFloat(2.0, 8.0, 2);
                const tc1 = randomInt(20, 80);
                const tk1 = tc1 + 273.15;
                const v2 = randomFloat(1.0, 6.0, 2);
                const tc2 = randomInt(0, 50);
                const tk2 = tc2 + 273.15;
                const p2 = (p1 * v1 * tk2) / (tk1 * v2);
                questions.push({
                    question: `A gas sample at a pressure of ${p1.toFixed(2)} atm, volume of ${v1.toFixed(2)} L, and temperature of ${tc1} °C is changed to temperature ${tc2} °C and volume ${v2.toFixed(2)} L. What is the new pressure in atm? (2 decimals)`,
                    correctAnswer: p2,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson5_2() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const n = randomFloat(0.1, 2.0, 2);
                const p = randomFloat(0.5, 3.0, 2);
                const tc = randomInt(0, 100);
                const tk = tc + 273.15;
                const v = (n * 0.08206 * tk) / p;
                questions.push({
                    question: `Calculate the volume in Liters (L) occupied by ${n.toFixed(2)} moles of gas at a pressure of ${p.toFixed(2)} atm and a temperature of ${tc} °C. Use gas constant R = 0.08206 L*atm/(mol*K). (2 decimals)`,
                    correctAnswer: v,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const grams = randomFloat(10.0, 80.0, 1);
                const v = randomFloat(2.0, 25.0, 1);
                const tc = randomInt(10, 150);
                const tk = tc + 273.15;
                const moles = grams / 32.00;
                const p = (moles * 0.08206 * tk) / v;
                questions.push({
                    question: `Calculate the pressure in atm exerted by ${grams.toFixed(1)} grams of O2 gas (molar mass = 32.00 g/mol) in a ${v.toFixed(1)} L container at a temperature of ${tc} °C. Use R = 0.08206 L*atm/(mol*K). (2 decimals)`,
                    correctAnswer: p,
                    tolerance: 0.05
                });
            } else {
                const gramsCaCO3 = randomFloat(5.0, 50.0, 1);
                const moles = gramsCaCO3 / 100.09;
                const volSTP = moles * 22.414;
                questions.push({
                    question: `How many liters (L) of carbon dioxide gas are produced at STP (1.00 atm, 273.15 K) when ${gramsCaCO3.toFixed(1)} grams of calcium carbonate (CaCO3, molar mass = 100.09 g/mol) decomposes completely via: CaCO3(s) -> CaO(s) + CO2(g)? (Use molar volume of gas at STP = 22.414 L/mol). (2 decimals)`,
                    correctAnswer: volSTP,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson5_3() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 4);
            if (style === 1) {
                const gSolubleMax = 36.0;
                const waterMass = randomFloat(50, 250, 0);
                const addedMass = randomFloat(30, 120, 0);
                const maxDissolved = (waterMass / 100.0) * gSolubleMax;
                const undissolved = addedMass > maxDissolved ? addedMass - maxDissolved : 0;
                questions.push({
                    question: `The solubility of NaCl in water at 20 °C is 36.0 g per 100 g of water. If you add ${addedMass} g of NaCl to ${waterMass} g of water at 20 °C, how many grams of NaCl remain undissolved? (1 decimal)`,
                    correctAnswer: undissolved,
                    tolerance: 0.1
                });
            } else if (style === 2) {
                const solutionMass = randomFloat(100.0, 500.0, 1);
                const massPercent = randomFloat(2.0, 15.0, 1);
                const soluteMass = solutionMass * (massPercent / 100.0);
                questions.push({
                    question: `What mass of sodium hydroxide solute in grams (g) is needed to prepare ${solutionMass.toFixed(1)} g of a ${massPercent.toFixed(1)}% by mass aqueous NaOH solution? (2 decimals)`,
                    correctAnswer: soluteMass,
                    tolerance: 0.05
                });
            } else if (style === 3) {
                const electrolytes = [
                    { list: "NaCl, HCl, KNO3, CH3OH (methanol), C6H12O6 (glucose)", ans: 3 },
                    { list: "H2O, NaOH, NH4Cl, C12H22O11 (sucrose), CH3COOH (weak acid)", ans: 2 },
                    { list: "LiBr, K2SO4, HNO3, HClO4, H2O, CO2", ans: 4 }
                ];
                const item = electrolytes[randomInt(0, electrolytes.length - 1)];
                questions.push({
                    question: `How many of the following substances are strong electrolytes in aqueous solution: [${item.list}]? (Enter an integer)`,
                    correctAnswer: item.ans,
                    tolerance: 0
                });
            } else {
                const m = randomFloat(0.30, 1.60, 2);
                const kf = 1.86;
                const deltaTf = kf * m;
                questions.push({
                    question: `A nonelectrolyte aqueous solution has molality ${m.toFixed(2)} m. For water, Kf = 1.86 C/m. Calculate the freezing-point depression DeltaTf in C (2 decimals).`,
                    correctAnswer: deltaTf,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson5_4() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const mass = randomFloat(4.0, 40.0, 1);
                const volMl = randomFloat(100, 1000, 0);
                const mm = 40.00;
                const molarity = (mass / mm) / (volMl / 1000.0);
                questions.push({
                    question: `What is the molarity (M) of a solution prepared by dissolving ${mass.toFixed(1)} grams of NaOH (molar mass = 40.00 g/mol) in enough water to make ${volMl} mL of solution? (3 decimals)`,
                    correctAnswer: molarity,
                    tolerance: 0.005
                });
            } else if (style === 2) {
                const volL = randomFloat(0.25, 5.0, 2);
                const molarity = randomFloat(0.1, 2.0, 2);
                const mm = 58.44;
                const mass = molarity * volL * mm;
                questions.push({
                    question: `How many grams of sodium chloride (NaCl, molar mass = 58.44 g/mol) are required to prepare ${volL.toFixed(2)} L of a ${molarity.toFixed(2)} M NaCl solution? (2 decimals)`,
                    correctAnswer: mass,
                    tolerance: 0.05
                });
            } else {
                const v1 = randomFloat(5.0, 100.0, 1);
                const m1 = randomFloat(2.0, 12.0, 2);
                const v2 = randomFloat(200.0, 1000.0, 1);
                const m2 = (m1 * v1) / v2;
                questions.push({
                    question: `A laboratory chemist dilutes ${v1.toFixed(1)} mL of a ${m1.toFixed(2)} M stock hydrochloric acid solution to a final volume of ${v2.toFixed(1)} mL. What is the molarity of the diluted solution? (3 decimals)`,
                    correctAnswer: m2,
                    tolerance: 0.005
                });
            }
        }
        return questions;
    }

    function generateLesson5_5() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const c1 = randomFloat(0.8, 1.5, 2);
                const c2 = randomFloat(0.2, 0.7, 2);
                const time = randomFloat(10, 60, 0);
                const rate = (c1 - c2) / time;
                questions.push({
                    question: `In a reaction flask, the concentration of reactant A decreases from ${c1.toFixed(2)} M to ${c2.toFixed(2)} M over a period of ${time} seconds. Calculate the average rate of disappearance of reactant A in M/s. (4 decimals)`,
                    correctAnswer: rate,
                    tolerance: 0.0002
                });
            } else if (style === 2) {
                const eaUncat = randomInt(70, 120);
                const eaCat = randomInt(35, 60);
                const diff = eaUncat - eaCat;
                questions.push({
                    question: `The activation energy (Ea) of an uncatalyzed isomerization reaction is ${eaUncat} kJ/mol. In the presence of an enzyme catalyst, the activation energy is reduced to ${eaCat} kJ/mol. By how many kJ/mol does the catalyst lower the activation energy barrier?`,
                    correctAnswer: diff,
                    tolerance: 0
                });
            } else {
                const reactantType = randomInt(1, 2);
                if (reactantType === 1) {
                    questions.push({
                        question: `For a reaction with the rate law: Rate = k[A]^2[B], by what factor does the reaction rate increase if the concentration of A is tripled and B is kept constant? (Enter an integer)`,
                        correctAnswer: 9,
                        tolerance: 0
                    });
                } else {
                    questions.push({
                        question: `For a reaction with the rate law: Rate = k[A][B], by what factor does the reaction rate increase if the concentration of both A and B are doubled? (Enter an integer)`,
                        correctAnswer: 4,
                        tolerance: 0
                    });
                }
            }
        }
        return questions;
    }

    function generateLesson5_6() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 4);
            if (style === 1) {
                const a = randomFloat(0.1, 0.9, 2);
                const b = randomFloat(0.1, 0.9, 2);
                const c = randomFloat(0.5, 2.5, 2);
                const keq = (c * c) / (a * b);
                questions.push({
                    question: `For the reversible gas-phase reaction A(g) + B(g) <=> 2C(g), the equilibrium concentrations are measured to be [A] = ${a.toFixed(2)} M, [B] = ${b.toFixed(2)} M, and [C] = ${c.toFixed(2)} M. Calculate the equilibrium constant Keq for this reaction. (2 decimals)`,
                    correctAnswer: keq,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                questions.push({
                    question: `For the exothermic reaction: N2(g) + 3H2(g) <=> 2NH3(g) (Delta H = -92 kJ/mol), how does the equilibrium position shift if the temperature of the system is increased? Enter: 1 for Shift left (toward reactants), 2 for Shift right (toward products), 3 for No shift.`,
                    correctAnswer: 1,
                    tolerance: 0
                });
            } else if (style === 3) {
                questions.push({
                    question: `For the gas-phase reaction: PCl5(g) <=> PCl3(g) + Cl2(g), how does the equilibrium position shift if the volume of the reaction vessel is decreased (increasing total pressure)? Enter: 1 for Shift left (toward reactants), 2 for Shift right (toward products), 3 for No shift.`,
                    correctAnswer: 1,
                    tolerance: 0
                });
            } else {
                const exp = randomInt(2, 4);
                const h = randomInt(1, 9) * Math.pow(10, -exp);
                const pH = -Math.log10(h);
                questions.push({
                    question: `For a strong monoprotic acid solution with [H+] = ${h.toExponential(1)} M, calculate pH (2 decimals).`,
                    correctAnswer: pH,
                    tolerance: 0.05
                });
            }
        }
        return questions;
    }

    function generateLesson6_1() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const moles = randomFloat(0.2, 2.5, 1);
                const heat = moles * 890.3;
                questions.push({
                    question: `When methane undergoes combustion, Delta H = -890.3 kJ per mole of CH4 reacted. Calculate the amount of heat energy released in kJ when ${moles.toFixed(1)} moles of methane react. (1 decimal, enter a positive number)`,
                    correctAnswer: heat,
                    tolerance: 0.2
                });
            } else if (style === 2) {
                const mass = randomFloat(50.0, 200.0, 1);
                const dT = randomFloat(2.0, 15.0, 1);
                const jAbsorbed = mass * 4.184 * dT;
                questions.push({
                    question: `A chemical reaction inside a water calorimeter transfers heat to ${mass.toFixed(1)} grams of water (c = 4.184 J/g*°C), causing its temperature to rise by ${dT.toFixed(1)} °C. How many Joules (J) of heat did the water absorb? (1 decimal)`,
                    correctAnswer: jAbsorbed,
                    tolerance: 0.5
                });
            } else {
                questions.push({
                    question: `If a specific chemical reaction absorbs heat from the surrounding environment, what is the sign of its enthalpy change (Delta H)? Enter: 1 for Positive (Endothermic), 2 for Negative (Exothermic).`,
                    correctAnswer: 1,
                    tolerance: 0
                });
            }
        }
        return questions;
    }

    function generateLesson6_2() {
        const questions = [];
        for (let i = 0; i < 10; i++) {
            const style = randomInt(1, 3);
            if (style === 1) {
                const grams = randomFloat(10.0, 150.0, 1);
                const q = grams * 0.334;
                questions.push({
                    question: `The heat of fusion of water is 0.334 kJ/g. How many kJ of heat energy are required to completely melt ${grams.toFixed(1)} grams of ice at 0 °C? (2 decimals)`,
                    correctAnswer: q,
                    tolerance: 0.05
                });
            } else if (style === 2) {
                const grams = randomFloat(5.0, 80.0, 1);
                const q = grams * 2.26;
                questions.push({
                    question: `The heat of vaporization of water is 2.26 kJ/g. How many kJ of heat energy are required to completely vaporize ${grams.toFixed(1)} grams of liquid water at 100 °C? (1 decimal)`,
                    correctAnswer: q,
                    tolerance: 0.2
                });
            } else {
                questions.push({
                    question: `During the boiling of pure liquid water at 100 °C, the liquid is converted to steam. How does the temperature of the system change during this phase transition? Enter: 1 for Temperature increases, 2 for Temperature decreases, 3 for Temperature remains constant.`,
                    correctAnswer: 3,
                    tolerance: 0
                });
            }
        }
        return questions;
    }

    function generateLesson6_3() {
        const questions = [];
        const pool = [
            { q: "What is the oxidation state of sulfur (S) in the sulfate ion, SO4^2-? (Enter an integer, e.g. 6)", ans: 6 },
            { q: "What is the oxidation state of nitrogen (N) in nitric acid, HNO3? (Enter an integer, e.g. 5)", ans: 5 },
            { q: "What is the oxidation state of manganese (Mn) in the permanganate ion, MnO4^-? (Enter an integer, e.g. 7)", ans: 7 },
            { q: "In the redox reaction: Zn(s) + Cu^2+(aq) -> Zn^2+(aq) + Cu(s), which reactant is oxidized (acts as the reducing agent)? Enter: 1 for Zn(s), 2 for Cu^2+(aq).", ans: 1 },
            { q: "In the redox reaction: Fe(s) + 2 HCl(aq) -> FeCl2(aq) + H2(g), which reactant is reduced (contains the oxidizing agent)? Enter: 1 for Fe(s), 2 for HCl(aq).", ans: 2 },
            { q: "What is the oxidation state of carbon (C) in carbon dioxide, CO2?", ans: 4 },
            { q: "What is the oxidation state of oxygen in hydrogen peroxide, H2O2? (Enter the magnitude and sign, e.g. -1)", ans: -1 },
            { q: "What is the oxidation state of pure elemental iron, Fe(s)?", ans: 0 },
            { q: "According to the LEO the lion says GER memory aid, 'GER' stands for: 'Gain of Electrons is ...' Enter: 1 for Oxidation, 2 for Reduction.", ans: 2 },
            { q: "What is the oxidation state of nitrogen (N) in ammonia, NH3? (Enter the signed integer, e.g. -3)", ans: -3 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = pool[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
        }
        return questions;
    }

    function generateLesson6_4() {
        const questions = [];
        const pool = [
            { q: "According to the general formula for alkanes (C_n H_2n+2), how many hydrogen atoms are in an alkane molecule containing 6 carbon atoms?", ans: 14 },
            { q: "According to the general formula for alkanes (C_n H_2n+2), how many hydrogen atoms are in an alkane molecule containing 8 carbon atoms?", ans: 18 },
            { q: "How many carbon atoms are in a molecule of propane? (Enter an integer)", ans: 3 },
            { q: "How many carbon atoms are in a molecule of pentane? (Enter an integer)", ans: 5 },
            { q: "Identify the functional group represented by the general structure R-OH. Enter: 1 for Alcohol, 2 for Ether, 3 for Carboxylic acid, 4 for Ester.", ans: 1 },
            { q: "Identify the functional group represented by the general structure R-COOH. Enter: 1 for Alcohol, 2 for Ether, 3 for Carboxylic acid, 4 for Ester.", ans: 3 },
            { q: "Identify the functional group represented by the general structure R-COO-R'. Enter: 1 for Alcohol, 2 for Ether, 3 for Carboxylic acid, 4 for Ester.", ans: 4 },
            { q: "An unsaturated hydrocarbon containing at least one carbon-carbon double bond (C=C) is classified as an: Enter: 1 for Alkane, 2 for Alkene, 3 for Alkyne.", ans: 2 },
            { q: "An unsaturated hydrocarbon containing at least one carbon-carbon triple bond is classified as an: Enter: 1 for Alkane, 2 for Alkene, 3 for Alkyne.", ans: 3 },
            { q: "How many carbon atoms are in a molecule of butane? (Enter an integer)", ans: 4 }
        ];
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }
        for (let i = 0; i < 10; i++) {
            const item = pool[indices[i]];
            questions.push({
                question: item.q,
                correctAnswer: item.ans,
                tolerance: 0
            });
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
                <label class="block text-xs font-semibold text-slate-355 dark:text-slate-300 mb-2" for="answer_${index}">Q${index + 1}. ${q.question}</label>
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

        const bypassEnabled = isCurriculumBypassEnabledLocal();
        if (!bypassEnabled && state < STATE_HW_PENDING) {
            setWorkspaceLocked(true);
            showStatus('Homework is locked for this lesson. Complete coursework through Stage 4 first.', 'warning');
        } else {
            setWorkspaceLocked(false);
            regenerateProblemSet();
            showStatus(
                bypassEnabled
                    ? 'Explore mode active. Requirements bypassed for this worksheet.'
                    : 'Chemistry workbook loaded. Submit when ready. Passing threshold: 80%.',
                'info'
            );
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
            
            if (typeof window.awardXP === 'function') {
                window.awardXP(50, 'assignment');
                if (score === 100) {
                    window.awardXP(25, 'assignment_perfect');
                }
            }
            if (typeof window.updateStatsCounter === 'function') {
                window.updateStatsCounter('assignmentsCompleted', 1);
            }
            if (score === 100 && typeof window.checkAchievements === 'function') {
                window.checkAchievements('perfect_assignment', {});
            }

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

        const btnCurriculumBypass = document.getElementById('btn-curriculum-bypass');
        if (btnCurriculumBypass) {
            updateCurriculumBypassButtonUi();
            btnCurriculumBypass.addEventListener('click', () => {
                const enabled = !isCurriculumBypassEnabledLocal();
                setCurriculumBypassEnabledLocal(enabled);
            });
        }

        const btnSettings = document.getElementById('btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                if (typeof window.openChemistrySettingsModal === 'function') {
                    window.openChemistrySettingsModal();
                } else if (typeof window.confirmAndResetChemistryProgress === 'function') {
                    window.confirmAndResetChemistryProgress();
                } else {
                    window.alert('Settings service unavailable on this page.');
                }
            });
        }

        window.addEventListener('curriculumBypassChanged', () => {
            updateCurriculumBypassButtonUi();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, readMatrix());
            }
            if (appState.selectedLessonId) {
                updateForLessonSelection(appState.selectedLessonId);
            }
        });

        window.addEventListener('masteryMatrixChanged', () => {
            appState.matrix = readMatrix();
            if (typeof window.renderSidebar === 'function') {
                window.renderSidebar(appState.syllabus, appState.matrix);
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
