// ==========================================
// CHEMISTRY DATA SCHEMA (CH 104Z)
// Do not edit unless adding new constants.
// ==========================================

const ChemData = {
    constants: {
        avogadro: { value: 6.022e23, unit: "particles/mol" },
        idealGas_R_atm: { value: 0.08206, unit: "L*atm/(mol*K)" },
        idealGas_R_kpa: { value: 8.314, unit: "L*kPa/(mol*K)" }
    },

    elements: {
        H: { name: "Hydrogen", mass: 1.008 },
        He: { name: "Helium", mass: 4.0026 },
        Li: { name: "Lithium", mass: 6.94 },
        Be: { name: "Beryllium", mass: 9.0122 },
        B: { name: "Boron", mass: 10.81 },
        C: { name: "Carbon", mass: 12.011 },
        N: { name: "Nitrogen", mass: 14.007 },
        O: { name: "Oxygen", mass: 15.999 },
        F: { name: "Fluorine", mass: 18.9984 },
        Ne: { name: "Neon", mass: 20.1798 },
        Na: { name: "Sodium", mass: 22.9898 },
        Mg: { name: "Magnesium", mass: 24.305 },
        Al: { name: "Aluminium", mass: 26.9815 },
        Si: { name: "Silicon", mass: 28.085 },
        P: { name: "Phosphorus", mass: 30.9738 },
        S: { name: "Sulfur", mass: 32.06 },
        Cl: { name: "Chlorine", mass: 35.45 },
        Ar: { name: "Argon", mass: 39.9481 },
        K: { name: "Potassium", mass: 39.0983 },
        Ca: { name: "Calcium", mass: 40.0784 },
        Sc: { name: "Scandium", mass: 44.9559 },
        Ti: { name: "Titanium", mass: 47.8671 },
        V: { name: "Vanadium", mass: 50.9415 },
        Cr: { name: "Chromium", mass: 51.9962 },
        Mn: { name: "Manganese", mass: 54.938 },
        Fe: { name: "Iron", mass: 55.8452 },
        Co: { name: "Cobalt", mass: 58.9332 },
        Ni: { name: "Nickel", mass: 58.6934 },
        Cu: { name: "Copper", mass: 63.5463 },
        Zn: { name: "Zinc", mass: 65.382 },
        Ga: { name: "Gallium", mass: 69.7231 },
        Ge: { name: "Germanium", mass: 72.6308 },
        As: { name: "Arsenic", mass: 74.9216 },
        Se: { name: "Selenium", mass: 78.9718 },
        Br: { name: "Bromine", mass: 79.904 },
        Kr: { name: "Krypton", mass: 83.7982 },
        Rb: { name: "Rubidium", mass: 85.4678 },
        Sr: { name: "Strontium", mass: 87.621 },
        Y: { name: "Yttrium", mass: 88.9058 },
        Zr: { name: "Zirconium", mass: 91.2242 },
        Nb: { name: "Niobium", mass: 92.9064 },
        Mo: { name: "Molybdenum", mass: 95.951 },
        Tc: { name: "Technetium", mass: 98 },
        Ru: { name: "Ruthenium", mass: 101.072 },
        Rh: { name: "Rhodium", mass: 102.9055 },
        Pd: { name: "Palladium", mass: 106.421 },
        Ag: { name: "Silver", mass: 107.8682 },
        Cd: { name: "Cadmium", mass: 112.4144 },
        In: { name: "Indium", mass: 114.8181 },
        Sn: { name: "Tin", mass: 118.7107 },
        Sb: { name: "Antimony", mass: 121.7601 },
        Te: { name: "Tellurium", mass: 127.603 },
        I: { name: "Iodine", mass: 126.9045 },
        Xe: { name: "Xenon", mass: 131.2936 },
        Cs: { name: "Cesium", mass: 132.9055 },
        Ba: { name: "Barium", mass: 137.3277 },
        La: { name: "Lanthanum", mass: 138.9055 },
        Ce: { name: "Cerium", mass: 140.1161 },
        Pr: { name: "Praseodymium", mass: 140.9077 },
        Nd: { name: "Neodymium", mass: 144.2423 },
        Pm: { name: "Promethium", mass: 145 },
        Sm: { name: "Samarium", mass: 150.362 },
        Eu: { name: "Europium", mass: 151.9641 },
        Gd: { name: "Gadolinium", mass: 157.253 },
        Tb: { name: "Terbium", mass: 158.9254 },
        Dy: { name: "Dysprosium", mass: 162.5001 },
        Ho: { name: "Holmium", mass: 164.9303 },
        Er: { name: "Erbium", mass: 167.2593 },
        Tm: { name: "Thulium", mass: 168.9342 },
        Yb: { name: "Ytterbium", mass: 173.0451 },
        Lu: { name: "Lutetium", mass: 174.9668 },
        Hf: { name: "Hafnium", mass: 178.492 },
        Ta: { name: "Tantalum", mass: 180.9479 },
        W: { name: "Tungsten", mass: 183.841 },
        Re: { name: "Rhenium", mass: 186.2071 },
        Os: { name: "Osmium", mass: 190.233 },
        Ir: { name: "Iridium", mass: 192.2173 },
        Pt: { name: "Platinum", mass: 195.0849 },
        Au: { name: "Gold", mass: 196.9666 },
        Hg: { name: "Mercury", mass: 200.5923 },
        Tl: { name: "Thallium", mass: 204.38 },
        Pb: { name: "Lead", mass: 207.21 },
        Bi: { name: "Bismuth", mass: 208.9804 },
        Po: { name: "Polonium", mass: 209 },
        At: { name: "Astatine", mass: 210 },
        Rn: { name: "Radon", mass: 222 },
        Fr: { name: "Francium", mass: 223 },
        Ra: { name: "Radium", mass: 226 },
        Ac: { name: "Actinium", mass: 227 },
        Th: { name: "Thorium", mass: 232.0377 },
        Pa: { name: "Protactinium", mass: 231.0359 },
        U: { name: "Uranium", mass: 238.0289 },
        Np: { name: "Neptunium", mass: 237 },
        Pu: { name: "Plutonium", mass: 244 },
        Am: { name: "Americium", mass: 243 },
        Cm: { name: "Curium", mass: 247 },
        Bk: { name: "Berkelium", mass: 247 },
        Cf: { name: "Californium", mass: 251 },
        Es: { name: "Einsteinium", mass: 252 },
        Fm: { name: "Fermium", mass: 257 },
        Md: { name: "Mendelevium", mass: 258 },
        No: { name: "Nobelium", mass: 259 },
        Lr: { name: "Lawrencium", mass: 266 },
        Rf: { name: "Rutherfordium", mass: 267 },
        Db: { name: "Dubnium", mass: 268 },
        Sg: { name: "Seaborgium", mass: 269 },
        Bh: { name: "Bohrium", mass: 270 },
        Hs: { name: "Hassium", mass: 269 },
        Mt: { name: "Meitnerium", mass: 278 },
        Ds: { name: "Darmstadtium", mass: 281 },
        Rg: { name: "Roentgenium", mass: 282 },
        Cn: { name: "Copernicium", mass: 285 },
        Nh: { name: "Nihonium", mass: 286 },
        Fl: { name: "Flerovium", mass: 289 },
        Mc: { name: "Moscovium", mass: 289 },
        Lv: { name: "Livermorium", mass: 293 },
        Ts: { name: "Tennessine", mass: 294 },
        Og: { name: "Oganesson", mass: 294 },
        Uue: { name: "Ununennium", mass: 315 }
    },

    conversions: {
        mass: [
            { factor: 1000, from: "kg", to: "g" },
            { factor: 1000, from: "g", to: "mg" },
            { factor: 1000, from: "mg", to: "mcg" }
        ],
        volume: [
            { factor: 1000, from: "L", to: "mL" },
            { factor: 1, from: "mL", to: "cm3" }
        ],
        flowRate: [
            { factor: 0.001, from: "mL/min", to: "L/min" },
            { factor: 60, from: "L/min", to: "L/h" }
        ],
        density: [
            { factor: 1, from: "g/mL", to: "kg/L" },
            { factor: 1000, from: "g/cm^3", to: "kg/m^3" }
        ],
        temperature: [
            { type: "formula", from: "°C", to: "K", formula: "x + 273.15", inverseFormula: "x - 273.15", display: "(x + 273.15) K", displayInverse: "(x - 273.15) °C" },
            { type: "formula", from: "°C", to: "°F", formula: "x * 9/5 + 32", inverseFormula: "(x - 32) * 5/9", display: "(x * 1.8 + 32) °F", displayInverse: "((x - 32) / 1.8) °C" }
        ]
    },

    daTutorial: {
        intro: "Dimensional analysis lets chemists translate quantities safely and consistently by tracking units, not just numbers.",
        lessons: [
            {
                id: "da-lesson-1",
                title: "Foundations: Why Unit Cancellation Works",
                objective: "Convert a mass quantity using a valid two-factor chain and explain why each factor is legal.",
                startValue: "2.50",
                fromUnit: "kg",
                toUnit: "mg",
                steps: [
                    {
                        type: "setup",
                        explanation: "Identify the given quantity and the target unit before choosing any conversion factors.",
                        why: "You cannot pick correct factors unless you know exactly where you are starting and where you need to end."
                    },
                    {
                        type: "factor",
                        factor: { numVal: 1000, numUnit: "g", denVal: 1, denUnit: "kg" },
                        explanation: "First bridge from kilograms to grams with 1000 g / 1 kg.",
                        why: "The denominator unit must match the current unit (kg) so kg cancels cleanly."
                    },
                    {
                        type: "factor",
                        factor: { numVal: 1000, numUnit: "mg", denVal: 1, denUnit: "g" },
                        explanation: "Then bridge from grams to milligrams with 1000 mg / 1 g.",
                        why: "After step 1, grams is now your current unit. Matching g in the denominator keeps cancellation valid."
                    },
                    {
                        type: "evaluate",
                        explanation: "Evaluate the full chain and verify the final unit is mg.",
                        why: "A correct number is not enough in chemistry. The final unit must also match the target requested in the prompt."
                    }
                ]
            },
            {
                id: "da-lesson-2",
                title: "Compound Units: Flow Rate Conversion",
                objective: "Convert mL/min to L/h while preserving numerator and denominator meaning.",
                startValue: "125.0",
                fromUnit: "mL/min",
                toUnit: "L/h",
                steps: [
                    {
                        type: "setup",
                        explanation: "Treat the rate as a single compound unit and map the target rate unit before building factors.",
                        why: "Rates encode two dimensions at once. You must convert both parts without destroying the unit meaning."
                    },
                    {
                        type: "factor",
                        factor: { numVal: 0.001, numUnit: "L/min", denVal: 1, denUnit: "mL/min" },
                        explanation: "Convert the volume part of the rate first using L/min over mL/min.",
                        why: "This changes the numerator scale while keeping time in minutes unchanged for now."
                    },
                    {
                        type: "factor",
                        factor: { numVal: 60, numUnit: "L/h", denVal: 1, denUnit: "L/min" },
                        explanation: "Convert minutes to hours by bridging L/min to L/h.",
                        why: "This is a legal equivalence because 1 h = 60 min, applied in rate form."
                    },
                    {
                        type: "evaluate",
                        explanation: "Evaluate and confirm the final rate unit is L/h.",
                        why: "Rate problems are high-risk in labs and medicine. Unit validation is a safety check, not optional formatting."
                    }
                ]
            },
            {
                id: "da-lesson-3",
                title: "Equation-Based Conversion: Celsius to Kelvin",
                objective: "Distinguish ratio-based conversion from offset-based conversion for temperature.",
                startValue: "25.0",
                fromUnit: "°C",
                toUnit: "K",
                steps: [
                    {
                        type: "setup",
                        explanation: "Identify this as an equation-based conversion, not a pure ratio conversion.",
                        why: "Temperature scales can include an offset (zero point shift), so multiplication alone is incomplete."
                    },
                    {
                        type: "factor",
                        factor: { type: "formula", formula: "x + 273.15", numUnit: "K", denUnit: "°C", display: "(x + 273.15) K" },
                        explanation: "Apply the Celsius-to-Kelvin equation conversion step.",
                        why: "Kelvin and Celsius differ by an additive offset of 273.15."
                    },
                    {
                        type: "evaluate",
                        explanation: "Evaluate and check that the final unit is Kelvin.",
                        why: "Equation-based steps still require the same discipline: correct math and correct target units."
                    }
                ]
            }
        ]
    },

    videoCurriculum: [
        {
            lessonId: "chem_01_nucleus",
            id: "chem_01_nucleus",
            episodeNumber: 1,
            title: "The Nucleus",
            youtubeId: "FSyAehMdpyI",
            coreConcepts: ["Atomic Number", "Mass Number", "Protons and Neutrons", "Nuclear Symbol Notation"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on atomic nucleus fundamentals from this lesson: atomic number, mass number, and subatomic particle counts. Ask one short question at a time, wait for an answer, then give concise corrective feedback.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on atomic nucleus fundamentals from this lesson: atomic number, mass number, and subatomic particle counts. Ask one short question at a time, wait for an answer, then give concise corrective feedback."
        },
        {
            lessonId: "chem_02_sigfigs",
            id: "chem_02_sigfigs",
            episodeNumber: 2,
            title: "Unit Conversion & Significant Figures",
            youtubeId: "hQpQ0hxVNTg",
            coreConcepts: ["Dimensional Analysis", "Significant Figures", "Scientific Notation", "Measurement Precision"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on dimensional analysis and significant-figure rules from this lesson. Ask one short question at a time and provide concise feedback with the correct rounding logic.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on dimensional analysis and significant-figure rules from this lesson. Ask one short question at a time and provide concise feedback with the correct rounding logic."
        },
        {
            lessonId: "chem_03_fundamental_laws",
            id: "chem_03_fundamental_laws",
            episodeNumber: 3,
            title: "The Creation of Chemistry - The Fundamental Laws",
            youtubeId: "QiiyvzZBKT8",
            coreConcepts: ["Conservation of Mass", "Law of Definite Proportions", "Early Atomic Theory", "Proust's Law"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on the foundational laws of chemistry in this lesson, especially conservation of mass and definite proportions. Keep prompts short and concept-focused.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on the foundational laws of chemistry in this lesson, especially conservation of mass and definite proportions. Keep prompts short and concept-focused."
        },
        {
            lessonId: "chem_04_periodic_table",
            id: "chem_04_periodic_table",
            episodeNumber: 4,
            title: "The Periodic Table",
            youtubeId: "0RRVV4Diomg",
            coreConcepts: ["Groups and Periods", "Periodic Trends", "Mendeleev's Organization", "Metal vs Nonmetal Behavior"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on periodic table structure and trends from this lesson. Ask one question at a time and explain why each answer is right or wrong.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on periodic table structure and trends from this lesson. Ask one question at a time and explain why each answer is right or wrong."
        },
        {
            lessonId: "chem_05_electron",
            id: "chem_05_electron",
            episodeNumber: 5,
            title: "The Electron",
            youtubeId: "rcKilE9CdaA",
            coreConcepts: ["Electron Behavior", "Quantum Levels", "Orbitals", "Electron Configuration Basics"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on electron behavior, orbitals, and introductory electron configuration from this lesson. Keep the pace beginner-friendly.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on electron behavior, orbitals, and introductory electron configuration from this lesson. Keep the pace beginner-friendly."
        },
        {
            lessonId: "chem_06_stoichiometry",
            id: "chem_06_stoichiometry",
            episodeNumber: 6,
            title: "Stoichiometry - Chemistry for Massive Creatures",
            youtubeId: "UL1jmJaUkaQ",
            coreConcepts: ["Mole Concept", "Molar Mass", "Avogadro's Number", "Mole Ratios"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on stoichiometry setup from this lesson: moles, molar mass, and mole-ratio conversions. Ask one question at a time and check units.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on stoichiometry setup from this lesson: moles, molar mass, and mole-ratio conversions. Ask one question at a time and check units."
        },
        {
            lessonId: "chem_07_water_solutions",
            id: "chem_07_water_solutions",
            episodeNumber: 7,
            title: "Water & Solutions - for Dirty Laundry",
            youtubeId: "AN4KifV12DA",
            coreConcepts: ["Solutes and Solvents", "Polarity", "Dissolution Process", "Aqueous Solutions"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solution chemistry ideas from this lesson, focusing on polarity and dissolution.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solution chemistry ideas from this lesson, focusing on polarity and dissolution."
        },
        {
            lessonId: "chem_08_acid_base",
            id: "chem_08_acid_base",
            episodeNumber: 8,
            title: "Acid-Base Reactions in Solution",
            youtubeId: "ANi709MYnWg",
            coreConcepts: ["Acids and Bases", "Proton Transfer", "Neutralization", "Conjugate Pairs"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on acid-base reaction ideas from this lesson. Keep questions strictly on proton transfer and neutralization logic.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on acid-base reaction ideas from this lesson. Keep questions strictly on proton transfer and neutralization logic."
        },
        {
            lessonId: "chem_09_precipitation",
            id: "chem_09_precipitation",
            episodeNumber: 9,
            title: "Precipitation Reactions",
            youtubeId: "IIu16dy3ThI",
            coreConcepts: ["Solubility Rules", "Precipitate Formation", "Ionic Equations", "Net Ionic Equations"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on precipitation reactions and net ionic equations from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on precipitation reactions and net ionic equations from this lesson."
        },
        {
            lessonId: "chem_10_redox",
            id: "chem_10_redox",
            episodeNumber: 10,
            title: "Redox Reactions",
            youtubeId: "lQ6FBA1HM3s",
            coreConcepts: ["Oxidation States", "Electron Transfer", "Oxidation vs Reduction", "Half-Reactions"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on redox fundamentals from this lesson, especially oxidation-state tracking.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on redox fundamentals from this lesson, especially oxidation-state tracking."
        },
        {
            lessonId: "chem_11_nomenclature",
            id: "chem_11_nomenclature",
            episodeNumber: 11,
            title: "How to Speak Chemistrian",
            youtubeId: "mlRhLicNo8Q",
            coreConcepts: ["Ionic Naming", "Molecular Naming", "Polyatomic Ions", "Formula-to-Name Rules"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on nomenclature rules from this lesson and provide correction with naming steps.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on nomenclature rules from this lesson and provide correction with naming steps."
        },
        {
            lessonId: "chem_12_ideal_gas_law",
            id: "chem_12_ideal_gas_law",
            episodeNumber: 12,
            title: "The Ideal Gas Law",
            youtubeId: "BxUS1K7xu30",
            coreConcepts: ["PV=nRT", "Gas Variables", "Unit Consistency", "State Conditions"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on ideal gas law setup from this lesson. Emphasize units and variable meaning.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on ideal gas law setup from this lesson. Emphasize units and variable meaning."
        },
        {
            lessonId: "chem_13_ideal_gas_problems",
            id: "chem_13_ideal_gas_problems",
            episodeNumber: 13,
            title: "Ideal Gas Problems",
            youtubeId: "8SRAkXMu3d0",
            coreConcepts: ["Gas Law Calculations", "R Constant Choices", "Rearranging PV=nRT", "Gas Stoichiometry"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solving ideal gas problems from this lesson and check calculation setup step-by-step.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solving ideal gas problems from this lesson and check calculation setup step-by-step."
        },
        {
            lessonId: "chem_14_real_gases",
            id: "chem_14_real_gases",
            episodeNumber: 14,
            title: "Real Gases",
            youtubeId: "GIPrsWuSkQc",
            coreConcepts: ["Non-Ideal Behavior", "Intermolecular Attractions", "Van der Waals Model", "High Pressure Effects"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on why real gases deviate from ideal behavior in this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on why real gases deviate from ideal behavior in this lesson."
        },
        {
            lessonId: "chem_15_partial_pressures",
            id: "chem_15_partial_pressures",
            episodeNumber: 15,
            title: "Partial Pressures & Vapor Pressure",
            youtubeId: "JbqtqCunYzA",
            coreConcepts: ["Dalton's Law", "Partial Pressure", "Vapor Pressure", "Mole Fraction"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on partial and vapor pressure concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on partial and vapor pressure concepts from this lesson."
        },
        {
            lessonId: "chem_16_effusion_diffusion",
            id: "chem_16_effusion_diffusion",
            episodeNumber: 16,
            title: "Passing Gases: Effusion, Diffusion, and the Velocity of a Gas",
            youtubeId: "TLRZAFU_9Kg",
            coreConcepts: ["Effusion", "Diffusion", "Graham's Law", "Gas Molecular Speed"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on effusion and diffusion concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on effusion and diffusion concepts from this lesson."
        },
        {
            lessonId: "chem_17_energy_chemistry",
            id: "chem_17_energy_chemistry",
            episodeNumber: 17,
            title: "Energy & Chemistry",
            youtubeId: "GqtUWyDR1fg",
            coreConcepts: ["System vs Surroundings", "Energy Transfer", "Thermodynamic Processes", "Conservation of Energy"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on thermochemistry foundations from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on thermochemistry foundations from this lesson."
        },
        {
            lessonId: "chem_18_enthalpy",
            id: "chem_18_enthalpy",
            episodeNumber: 18,
            title: "Enthalpy",
            youtubeId: "SV7U4yAXL5I",
            coreConcepts: ["Enthalpy Change", "Endothermic vs Exothermic", "Hess's Law", "Heat of Reaction"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on enthalpy concepts and sign conventions from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on enthalpy concepts and sign conventions from this lesson."
        },
        {
            lessonId: "chem_19_calorimetry",
            id: "chem_19_calorimetry",
            episodeNumber: 19,
            title: "Calorimetry",
            youtubeId: "JuWtBR-rDQk",
            coreConcepts: ["Calorimetry Setup", "q=mcDeltaT", "Specific Heat", "Heat Exchange"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on calorimetry calculations and interpretation from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on calorimetry calculations and interpretation from this lesson."
        },
        {
            lessonId: "chem_20_entropy",
            id: "chem_20_entropy",
            episodeNumber: 20,
            title: "Entropy: Embrace the Chaos!",
            youtubeId: "ZsY4WcQOrfk",
            coreConcepts: ["Entropy", "Disorder", "Second Law", "Spontaneity Trends"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on entropy and spontaneity concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on entropy and spontaneity concepts from this lesson."
        },
        {
            lessonId: "chem_21_lab_safety",
            id: "chem_21_lab_safety",
            episodeNumber: 21,
            title: "Lab Techniques & Safety",
            youtubeId: "VRWRmIEHr3A",
            coreConcepts: ["Lab Safety Rules", "Measurement Technique", "Glassware Handling", "Procedure Discipline"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on lab safety and technique principles from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on lab safety and technique principles from this lesson."
        },
        {
            lessonId: "chem_22_bond_types",
            id: "chem_22_bond_types",
            episodeNumber: 22,
            title: "Atomic Hook-Ups - Types of Chemical Bonds",
            youtubeId: "QXT4OVM4vXI",
            coreConcepts: ["Ionic Bonding", "Covalent Bonding", "Metallic Bonding", "Electronegativity Differences"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on chemical bond types from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on chemical bond types from this lesson."
        },
        {
            lessonId: "chem_23_polarity",
            id: "chem_23_polarity",
            episodeNumber: 23,
            title: "Polar & Non-Polar Molecules",
            youtubeId: "PVL24HAesnc",
            coreConcepts: ["Molecular Polarity", "Dipole Moment", "Geometry and Symmetry", "Electronegativity Effect"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on polarity and dipole reasoning from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on polarity and dipole reasoning from this lesson."
        },
        {
            lessonId: "chem_24_lewis_structures",
            id: "chem_24_lewis_structures",
            episodeNumber: 24,
            title: "Bonding Models and Lewis Structures",
            youtubeId: "a8LF7JEb0IA",
            coreConcepts: ["Lewis Structures", "Valence Electrons", "Octet Rule", "Resonance"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on Lewis structure construction and bonding models from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on Lewis structure construction and bonding models from this lesson."
        },
        {
            lessonId: "chem_25_orbitals",
            id: "chem_25_orbitals",
            episodeNumber: 25,
            title: "Orbitals",
            youtubeId: "cPDptc0wUYI",
            coreConcepts: ["Orbital Shapes", "Hybridization", "Sigma and Pi Bonds", "Molecular Orbital Ideas"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on orbital concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on orbital concepts from this lesson."
        },
        {
            lessonId: "chem_26_liquids",
            id: "chem_26_liquids",
            episodeNumber: 26,
            title: "Liquids",
            youtubeId: "BqQJPCdmIp8",
            coreConcepts: ["Intermolecular Forces", "Viscosity", "Surface Tension", "Phase Behavior"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on liquid-state properties from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on liquid-state properties from this lesson."
        },
        {
            lessonId: "chem_27_solutions",
            id: "chem_27_solutions",
            episodeNumber: 27,
            title: "Solutions",
            youtubeId: "9h2f1Bjr0p4",
            coreConcepts: ["Molarity", "Molality", "Colligative Properties", "Solution Behavior"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on concentration and solution properties from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on concentration and solution properties from this lesson."
        },
        {
            lessonId: "chem_28_equilibrium",
            id: "chem_28_equilibrium",
            episodeNumber: 28,
            title: "Equilibrium",
            youtubeId: "g5wNg_dKsYY",
            coreConcepts: ["Dynamic Equilibrium", "Reversible Reactions", "Le Chatelier Principle", "Stress Response"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on dynamic equilibrium concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on dynamic equilibrium concepts from this lesson."
        },
        {
            lessonId: "chem_29_equilibrium_equations",
            id: "chem_29_equilibrium_equations",
            episodeNumber: 29,
            title: "Equilibrium Equations",
            youtubeId: "DP-vWN1yXrY",
            coreConcepts: ["Equilibrium Constants", "Kc and Kp", "Reaction Quotient Q", "ICE Tables"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on equilibrium calculations and equation setup from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on equilibrium calculations and equation setup from this lesson."
        },
        {
            lessonId: "chem_30_ph_poh",
            id: "chem_30_ph_poh",
            episodeNumber: 30,
            title: "pH and pOH",
            youtubeId: "LS67vS10O5Y",
            coreConcepts: ["pH Scale", "pOH", "Logarithmic Concentration", "Acid/Base Strength"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on pH and pOH reasoning from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on pH and pOH reasoning from this lesson."
        },
        {
            lessonId: "chem_31_buffers",
            id: "chem_31_buffers",
            episodeNumber: 31,
            title: "Buffers, the Acid Rain Slayer",
            youtubeId: "8Fdt5WnYn1k",
            coreConcepts: ["Buffer Systems", "Buffer Capacity", "Henderson-Hasselbalch", "Common Ion Effect"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on buffer chemistry from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on buffer chemistry from this lesson."
        },
        {
            lessonId: "chem_32_kinetics",
            id: "chem_32_kinetics",
            episodeNumber: 32,
            title: "Kinetics: Chemistry's Demolition Derby",
            youtubeId: "7qOFtL3VEBc",
            coreConcepts: ["Reaction Rate", "Activation Energy", "Rate Laws", "Catalyst Effects"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on chemical kinetics concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on chemical kinetics concepts from this lesson."
        },
        {
            lessonId: "chem_33_solids",
            id: "chem_33_solids",
            episodeNumber: 33,
            title: "Doing Solids",
            youtubeId: "bzr-byiSXlA",
            coreConcepts: ["Crystalline Solids", "Amorphous Solids", "Unit Cells", "Lattice Concepts"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solid-state chemistry concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on solid-state chemistry concepts from this lesson."
        },
        {
            lessonId: "chem_34_network_solids",
            id: "chem_34_network_solids",
            episodeNumber: 34,
            title: "Network Solids and Carbon",
            youtubeId: "b_SXwfHQ774",
            coreConcepts: ["Network Solids", "Carbon Allotropes", "Diamond vs Graphite", "Covalent Networks"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on network solids and carbon allotropes from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on network solids and carbon allotropes from this lesson."
        },
        {
            lessonId: "chem_35_silicon",
            id: "chem_35_silicon",
            episodeNumber: 35,
            title: "Silicon - The Internet's Favorite Element",
            youtubeId: "kdy3RsZk7As",
            coreConcepts: ["Silicon Chemistry", "Semiconductors", "Metalloid Properties", "Silicate Structures"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on silicon and semiconductor chemistry from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on silicon and semiconductor chemistry from this lesson."
        },
        {
            lessonId: "chem_36_electrochemistry",
            id: "chem_36_electrochemistry",
            episodeNumber: 36,
            title: "Electrochemistry",
            youtubeId: "IV4IUsholjg",
            coreConcepts: ["Galvanic Cells", "Anode and Cathode", "Cell Potential", "Nernst Equation"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on electrochemistry and cell notation from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on electrochemistry and cell notation from this lesson."
        },
        {
            lessonId: "chem_37_atomic_history",
            id: "chem_37_atomic_history",
            episodeNumber: 37,
            title: "The History of Atomic Chemistry",
            youtubeId: "thnDxFdkzZs",
            coreConcepts: ["Dalton Model", "Thomson Model", "Rutherford Model", "Bohr Model"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on historical atomic models from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on historical atomic models from this lesson."
        },
        {
            lessonId: "chem_38_nuclear_chemistry",
            id: "chem_38_nuclear_chemistry",
            episodeNumber: 38,
            title: "Nuclear Chemistry",
            youtubeId: "KWAsz59F8gA",
            coreConcepts: ["Radioactive Decay", "Alpha Beta Gamma", "Half-Life", "Nuclear Stability"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on nuclear chemistry basics from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on nuclear chemistry basics from this lesson."
        },
        {
            lessonId: "chem_39_fusion_fission",
            id: "chem_39_fusion_fission",
            episodeNumber: 39,
            title: "Nuclear Chemistry Part 2 - Fusion and Fission",
            youtubeId: "FU6y1XIADdg",
            coreConcepts: ["Nuclear Fission", "Nuclear Fusion", "Mass Defect", "Binding Energy"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on fusion and fission concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on fusion and fission concepts from this lesson."
        },
        {
            lessonId: "chem_40_hydrocarbon_power",
            id: "chem_40_hydrocarbon_power",
            episodeNumber: 40,
            title: "Hydrocarbon Power!",
            youtubeId: "UloIw7dhnlQ",
            coreConcepts: ["Hydrocarbon Families", "Alkanes", "Saturated Hydrocarbons", "Organic Frameworks"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on hydrocarbon basics from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on hydrocarbon basics from this lesson."
        },
        {
            lessonId: "chem_41_alkenes_alkynes",
            id: "chem_41_alkenes_alkynes",
            episodeNumber: 41,
            title: "Alkenes & Alkynes",
            youtubeId: "CEH3O6l1pbw",
            coreConcepts: ["Unsaturation", "Double Bonds", "Triple Bonds", "Isomerism"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on alkene and alkyne concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on alkene and alkyne concepts from this lesson."
        },
        {
            lessonId: "chem_42_aromatics_cyclic",
            id: "chem_42_aromatics_cyclic",
            episodeNumber: 42,
            title: "Aromatics & Cyclic Compounds",
            youtubeId: "kXFEex-dABU",
            coreConcepts: ["Aromaticity", "Benzene Ring", "Resonance Stabilization", "Cyclic Structures"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on aromatic and cyclic compound concepts from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on aromatic and cyclic compound concepts from this lesson."
        },
        {
            lessonId: "chem_43_derivatives",
            id: "chem_43_derivatives",
            episodeNumber: 43,
            title: "Hydrocarbon Derivatives",
            youtubeId: "hlXc_eEtBHA",
            coreConcepts: ["Functional Groups", "Alcohols and Ethers", "Carboxylic Acids", "Derivative Classification"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on hydrocarbon derivative functional groups from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on hydrocarbon derivative functional groups from this lesson."
        },
        {
            lessonId: "chem_44_nomenclature_organic",
            id: "chem_44_nomenclature_organic",
            episodeNumber: 44,
            title: "Nomenclature",
            youtubeId: "U7wavimfNFE",
            coreConcepts: ["IUPAC Naming", "Parent Chain Rules", "Substituent Numbering", "Naming Priority"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on organic nomenclature rules from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on organic nomenclature rules from this lesson."
        },
        {
            lessonId: "chem_45_polymers",
            id: "chem_45_polymers",
            episodeNumber: 45,
            title: "Polymers",
            youtubeId: "rHxxLYzJ8Sw",
            coreConcepts: ["Monomers", "Polymerization", "Synthetic vs Natural Polymers", "Polymer Properties"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on polymer chemistry from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on polymer chemistry from this lesson."
        },
        {
            lessonId: "chem_46_global_carbon_cycle",
            id: "chem_46_global_carbon_cycle",
            episodeNumber: 46,
            title: "The Global Carbon Cycle",
            youtubeId: "aLuSi_6Ol8M",
            coreConcepts: ["Carbon Reservoirs", "Carbon Fixation", "Respiration and Decomposition", "Fossil Fuel Cycling"],
            tutorSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on global carbon cycle pathways from this lesson.",
            customSystemPrompt: "You are an encouraging chemistry tutor running on the learner's selected local model. Quiz the learner only on global carbon cycle pathways from this lesson."
        }
    ],

    labEquipment: {
        analyticalBalance: {
            name: "Analytical Balance",
            type: "digital",
            decimalPlaces: 4,
            tolerance: 0.0001,
            unit: "g"
        },
        graduatedCylinder_50mL: {
            name: "50 mL Graduated Cylinder",
            type: "analog",
            majorIncrement: 10,
            minorIncrement: 1, // Lines every 1 mL
            decimalPlaces: 1, // Read to 0.1 mL
            tolerance: 0.1,
            unit: "mL",
            min: 5, max: 45
        },
        graduatedCylinder_10mL: {
            name: "10 mL Graduated Cylinder",
            type: "analog",
            majorIncrement: 1,
            minorIncrement: 0.1, // Lines every 0.1 mL
            decimalPlaces: 2, // Read to 0.01 mL
            tolerance: 0.01,
            unit: "mL",
            min: 1, max: 9
        },
        burette_50mL: {
            name: "50 mL Burette",
            type: "analog",
            majorIncrement: 1,
            minorIncrement: 0.1, // Lines every 0.1 mL
            decimalPlaces: 2, // Read to 0.01 mL
            tolerance: 0.01,
            unit: "mL",
            min: 10, max: 40,
            inverted: true // Burettes read downwards
        },
        thermometer: {
            name: "Lab Thermometer",
            type: "analog",
            majorIncrement: 10,
            minorIncrement: 1, // Lines every 1 °C
            decimalPlaces: 1, // Read to 0.1 °C
            tolerance: 0.1,
            unit: "°C",
            min: 15, max: 85
        },
        beaker_100mL: {
            name: "100 mL Beaker",
            type: "analog",
            majorIncrement: 20,
            minorIncrement: 20, // Lines every 20 mL
            decimalPlaces: 0, // Hard to read even to 1 mL. We'll say to nearest 1 mL or 10s place. Let's make it 0 for ones place interpolation
            tolerance: 1,
            unit: "mL",
            min: 20, max: 80,
            qualitative: true
        }
    },

        stoichiometry: {
        reactions: [
            {
                id: "rxn1",
                reactants: ["H2", "O2"],
                products: ["H2O"],
                coefficients: [2, 1, 2]
            },
            {
                id: "rxn2",
                reactants: ["N2", "H2"],
                products: ["NH3"],
                coefficients: [1, 3, 2]
            },
            {
                id: "rxn3",
                reactants: ["CH4", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 2, 1, 2]
            },
            {
                id: "rxn4",
                reactants: ["FeCl3", "NaOH"],
                products: ["Fe(OH)3", "NaCl"],
                coefficients: [1, 3, 1, 3]
            },
            {
                id: "rxn5",
                reactants: ["Al", "HCl"],
                products: ["AlCl3", "H2"],
                coefficients: [2, 6, 2, 3]
            },
            {
                id: "rxn6",
                reactants: ["C6H12O6", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 6, 6, 6]
            },
            {
                id: "rxn7",
                reactants: ["CO2", "H2O"],
                products: ["C6H12O6", "O2"],
                coefficients: [6, 6, 1, 6]
            },
            {
                id: "rxn8",
                reactants: ["HCl", "Na2CO3"],
                products: ["NaCl", "H2O", "CO2"],
                coefficients: [2, 1, 2, 1, 1]
            },
            {
                id: "rxn9",
                reactants: ["HCl", "CaCO3"],
                products: ["CaCl2", "H2O", "CO2"],
                coefficients: [2, 1, 1, 1, 1]
            },
            {
                id: "rxn10",
                reactants: ["BaCl2", "Na2SO4"],
                products: ["BaSO4", "NaCl"],
                coefficients: [1, 1, 1, 2]
            },
            {
                id: "rxn11",
                reactants: ["C2H5OH", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 3, 2, 3]
            },
            {
                id: "rxn12",
                reactants: ["CaCl2", "Na3PO4"],
                products: ["Ca3(PO4)2", "NaCl"],
                coefficients: [3, 2, 1, 6]
            },
            {
                id: "rxn13",
                reactants: ["CO2", "NH3"],
                products: ["(NH2)2CO", "H2O"],
                coefficients: [1, 2, 1, 1]
            },
            {
                id: "rxn14",
                reactants: ["HC3H5O3", "Na2CO3"],
                products: ["NaC3H5O3", "H2O", "CO2"],
                coefficients: [2, 1, 2, 1, 1]
            },
            // 15. Lactic Acid Fermentation
            {
                id: "rxn15",
                reactants: ["C6H12O6"],
                products: ["HC3H5O3"],
                coefficients: [1, 2]
            },
            // 16. Antacid Milk of Magnesia Neutralization
            {
                id: "rxn16",
                reactants: ["Mg(OH)2", "HCl"],
                products: ["MgCl2", "H2O"],
                coefficients: [1, 2, 1, 2]
            },
            // 17. Antacid Amphojel Neutralization
            {
                id: "rxn17",
                reactants: ["Al(OH)3", "HCl"],
                products: ["AlCl3", "H2O"],
                coefficients: [1, 3, 1, 3]
            },
            // 18. Combustion of Salicylic Acid
            {
                id: "rxn18",
                reactants: ["C7H6O3", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 7, 7, 3]
            },
            // 19. Combustion of Propane
            {
                id: "rxn19",
                reactants: ["C3H8", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 5, 3, 4]
            },
            // 20. Combustion of Octane
            {
                id: "rxn20",
                reactants: ["C8H18", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [2, 25, 16, 18]
            },
            // 21. Acid Rain NO2 Hydration
            {
                id: "rxn21",
                reactants: ["NO2", "H2O"],
                products: ["HNO3", "NO"],
                coefficients: [3, 1, 2, 1]
            },
            // 22. Catalytic Converter Abatement
            {
                id: "rxn22",
                reactants: ["NO", "CO"],
                products: ["N2", "CO2"],
                coefficients: [2, 2, 1, 2]
            },
            // 23. Zinc Dissolution (Hydrogen gas generation)
            {
                id: "rxn23",
                reactants: ["Zn", "HCl"],
                products: ["ZnCl2", "H2"],
                coefficients: [1, 2, 1, 1]
            },
            // 24. Thermite Reaction
            {
                id: "rxn24",
                reactants: ["Al", "Fe2O3"],
                products: ["Al2O3", "Fe"],
                coefficients: [2, 1, 1, 2]
            },
            // 25. Rusting of Iron
            {
                id: "rxn25",
                reactants: ["Fe", "O2"],
                products: ["Fe2O3"],
                coefficients: [4, 3, 2]
            },
            // 26. Catalase Action (Hydrogen peroxide decomposition)
            {
                id: "rxn26",
                reactants: ["H2O2"],
                products: ["H2O", "O2"],
                coefficients: [2, 2, 1]
            },
            // 27. Airbag Inflation (Sodium azide decomposition)
            {
                id: "rxn27",
                reactants: ["NaN3"],
                products: ["Na", "N2"],
                coefficients: [2, 2, 3]
            },
            // 28. Precipitation of Silver Carbonate
            {
                id: "rxn28",
                reactants: ["AgNO3", "Na2CO3"],
                products: ["Ag2CO3", "NaNO3"],
                coefficients: [2, 1, 1, 2]
            },
            // 29. Urea Hydrolysis
            {
                id: "rxn29",
                reactants: ["(NH2)2CO", "H2O"],
                products: ["CO2", "NH3"],
                coefficients: [1, 1, 1, 2]
            },
            // 30. Lipid Metabolism (Oxidation of Palmitic Acid)
            {
                id: "rxn30",
                reactants: ["C16H32O2", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [1, 23, 16, 16]
            },
            // 31. Glucose Fermentation by Yeast
            {
                id: "rxn31",
                reactants: ["C6H12O6"],
                products: ["C2H5OH", "CO2"],
                coefficients: [1, 2, 2]
            },
            // 32. Combustion of Methanol
            {
                id: "rxn32",
                reactants: ["CH3OH", "O2"],
                products: ["CO2", "H2O"],
                coefficients: [2, 3, 2, 4]
            },
            // 33. Industrial Production of Bleach
            {
                id: "rxn33",
                reactants: ["Cl2", "NaOH"],
                products: ["NaCl", "NaClO", "H2O"],
                coefficients: [1, 2, 1, 1, 1]
            },
            // 34. Acetylene Gas Generator
            {
                id: "rxn34",
                reactants: ["CaC2", "H2O"],
                products: ["Ca(OH)2", "C2H2"],
                coefficients: [1, 2, 1, 1]
            },
            // 35. Roasting of Copper Ore
            {
                id: "rxn35",
                reactants: ["CuS", "O2"],
                products: ["CuO", "SO2"],
                coefficients: [2, 3, 2, 2]
            },
            // 36. Thermal Decomposition of Sodium Bicarbonate
            {
                id: "rxn36",
                reactants: ["NaHCO3"],
                products: ["Na2CO3", "H2O", "CO2"],
                coefficients: [2, 1, 1, 1]
            },
            // 37. Phosphorus Flare Combustion
            {
                id: "rxn37",
                reactants: ["P4", "O2"],
                products: ["P4O10"],
                coefficients: [1, 5, 1]
            },

            // 38. Precipitation of Lead Iodide (Golden Rain)
            {
                id: "rxn38",
                reactants: ["Pb(NO3)2", "KI"],
                products: ["PbI2", "KNO3"],
                coefficients: [1, 2, 1, 2]
            },
            // 39. Ammonium Carbonate Decomposition
            {
                id: "rxn39",
                reactants: ["(NH4)2CO3"],
                products: ["NH3", "H2O", "CO2"],
                coefficients: [1, 2, 1, 1]
            },
            // 40. Hydrolysis of Sucrose
            {
                id: "rxn40",
                reactants: ["C12H22O11", "H2O"],
                products: ["C6H12O6"],
                coefficients: [1, 1, 2]
            }
        ],
    },
    nomenclature: {
        "Ionic (Type I & II)": [
            { "formula": "NaCl", "name": "Sodium chloride", "rule": "Type I: cation name + anion root -ide" },
            { "formula": "MgCl2", "name": "Magnesium chloride", "rule": "Type I: group 2 metal charges are fixed" },
            { "formula": "FeCl3", "name": "Iron(III) chloride", "rule": "Type II: transition metal requires Roman numerals" },
            { "formula": "CuO", "name": "Copper(II) oxide", "rule": "Type II: charge balanced with oxide (-2)" },
            { "formula": "Pb(SO4)2", "name": "Lead(IV) sulfate", "rule": "Type II: balanced with two sulfate ions (-2 each)" },
            { "formula": "K2CO3", "name": "Potassium carbonate", "rule": "Type I with polyatomic: no prefix needed" },
            { "formula": "SnCl2", "name": "Tin(II) chloride", "rule": "Type II: infer cation oxidation state from anion charge" },
            { "formula": "Fe2O3", "name": "Iron(III) oxide", "rule": "Type II: oxide is always -2" }
        ],
        "Polyatomic Ions": [
            { "formula": "NH4+", "name": "Ammonium", "rule": "Common positive polyatomic ion" },
            { "formula": "NO2-", "name": "Nitrite", "rule": "One less oxygen than Nitrate" },
            { "formula": "NO3-", "name": "Nitrate", "rule": "Base 'ate' ion for nitrogen" },
            { "formula": "SO3 2-", "name": "Sulfite", "rule": "One less oxygen than Sulfate" },
            { "formula": "SO4 2-", "name": "Sulfate", "rule": "Base 'ate' ion for sulfur" },
            { "formula": "OH-", "name": "Hydroxide", "rule": "Diatomic anion with -1 charge" },
            { "formula": "CN-", "name": "Cyanide", "rule": "Diatomic anion with -1 charge" },
            { "formula": "PO4 3-", "name": "Phosphate", "rule": "Trivalent polyatomic anion" },
            { "formula": "CO3 2-", "name": "Carbonate", "rule": "Divalent polyatomic anion" }
        ],
        "Acids": [
            { "formula": "HCl", "name": "Hydrochloric acid", "rule": "Binary acid: hydro- + root + -ic" },
            { "formula": "HBr", "name": "Hydrobromic acid", "rule": "Binary acid: hydro- + root + -ic" },
            { "formula": "HNO3", "name": "Nitric acid", "rule": "Oxyacid: '-ate' ion becomes '-ic' acid" },
            { "formula": "HNO2", "name": "Nitrous acid", "rule": "Oxyacid: '-ite' ion becomes '-ous' acid" },
            { "formula": "H2SO4", "name": "Sulfuric acid", "rule": "Oxyacid: '-ate' ion becomes '-ic' acid" },
            { "formula": "H2SO3", "name": "Sulfurous acid", "rule": "Oxyacid: '-ite' ion becomes '-ous' acid" },
            { "formula": "HC2H3O2", "name": "Acetic acid", "rule": "Oxyacid: from Acetate" },
            { "formula": "H3PO4", "name": "Phosphoric acid", "rule": "Phosphate (-ate) gives phosphoric acid" },
            { "formula": "HClO4", "name": "Perchloric acid", "rule": "Perchlorate becomes perchloric acid" }
        ],
        "Hydrates": [
            { "formula": "CuSO4·5H2O", "name": "Copper(II) sulfate pentahydrate", "rule": "penta = 5 waters" },
            { "formula": "MgSO4·7H2O", "name": "Magnesium sulfate heptahydrate", "rule": "hepta = 7 waters" },
            { "formula": "CaCl2·2H2O", "name": "Calcium chloride dihydrate", "rule": "di = 2 waters" },
            { "formula": "CoCl2·6H2O", "name": "Cobalt(II) chloride hexahydrate", "rule": "hexa = 6 waters" },
            { "formula": "Na2CO3·10H2O", "name": "Sodium carbonate decahydrate", "rule": "deca = 10 waters" }
        ],
        "Covalent Compounds": [
            { "formula": "CO", "name": "Carbon monoxide", "rule": "Use mono- prefix for the second element" },
            { "formula": "CO2", "name": "Carbon dioxide", "rule": "Use di- prefix for oxygen" },
            { "formula": "N2O", "name": "Dinitrogen monoxide", "rule": "Use prefixes for both elements" },
            { "formula": "NO2", "name": "Nitrogen dioxide", "rule": "No mono- prefix on first element" },
            { "formula": "P2O5", "name": "Diphosphorus pentoxide", "rule": "Drop 'a' in penta- before oxide" },
            { "formula": "SF6", "name": "Sulfur hexafluoride", "rule": "Use hexa- for six fluorine atoms" }
        ],
        "Organic (Intro)": [
            { "formula": "CH4", "name": "Methane", "rule": "Meth- = 1 carbon, -ane = single bonds" },
            { "formula": "C2H6", "name": "Ethane", "rule": "Eth- = 2 carbons" },
            { "formula": "C3H8", "name": "Propane", "rule": "Prop- = 3 carbons" },
            { "formula": "C4H10", "name": "Butane", "rule": "But- = 4 carbons" },
            { "formula": "CH3OH", "name": "Methanol", "rule": "-ol suffix indicates an alcohol (OH)" },
            { "formula": "C2H5OH", "name": "Ethanol", "rule": "Alcohol derived from ethane" }
        ]
    },

    curriculum: {
        competencies: [
            {
                id: "mole-concept",
                title: "Mole Concept and Formula Quantities",
                outcome: "Compute molar mass and identify particle counts from chemical formulas.",
                prerequisiteIds: []
            },
            {
                id: "dim-analysis",
                title: "Dimensional Analysis",
                outcome: "Set up and execute valid unit conversion chains with correct cancellation logic.",
                prerequisiteIds: ["mole-concept"]
            },
            {
                id: "measurement-precision",
                title: "Measurement Precision",
                outcome: "Report lab measurements at instrument-appropriate decimal precision.",
                prerequisiteIds: []
            },
            {
                id: "stoich-setup",
                title: "Stoichiometric Setup",
                outcome: "Translate balanced reactions into quantitative setup statements.",
                prerequisiteIds: ["mole-concept", "dim-analysis"]
            }
        ],
        diagnosticQuestions: [
            {
                id: "dq1",
                competencyId: "mole-concept",
                prompt: "A sample contains 0.250 moles of calcium carbonate, CaCO3. What is its mass in grams? (Ca = 40.08, C = 12.01, O = 16.00 g/mol)",
                choices: ["10.0 g", "25.0 g", "40.0 g", "100 g"],
                correctIndex: 1
            },
            {
                id: "dq2",
                competencyId: "mole-concept",
                prompt: "Which of the following is a homogeneous mixture?",
                choices: ["Pure water", "Sodium chloride crystals", "An aqueous salt solution", "A mixture of sand and water"],
                correctIndex: 2
            },
            {
                id: "dq3",
                competencyId: "measurement-precision",
                prompt: "Apply significant figure rules: 12.11 + 2.0 - 1.053 = ?",
                choices: ["13", "13.1", "13.06", "13.057"],
                correctIndex: 1
            },
            {
                id: "dq4",
                competencyId: "dim-analysis",
                prompt: "A metal has mass 48.0 g. Water in a graduated cylinder rises from 20.0 mL to 26.0 mL when the metal is added. What is the metal density?",
                choices: ["8.0 g/mL", "1.8 g/mL", "2.4 g/mL", "0.12 g/mL"],
                correctIndex: 0
            },
            {
                id: "dq5",
                competencyId: "measurement-precision",
                prompt: "How much heat is required to warm 50.0 g of water from 22.0 C to 28.0 C? (c = 4.184 J/g*C)",
                choices: ["126 J", "1255 J", "8786 J", "250 J"],
                correctIndex: 1
            },
            {
                id: "dq6",
                competencyId: "measurement-precision",
                prompt: "An element has isotopes: 35.0 amu (75.0%) and 37.0 amu (25.0%). What is the average atomic mass?",
                choices: ["35.5 amu", "36.0 amu", "35.8 amu", "36.5 amu"],
                correctIndex: 0
            },
            {
                id: "dq7",
                competencyId: "stoich-setup",
                prompt: "What is the ground-state electron configuration of phosphorus (Z = 15)?",
                choices: ["1s² 2s² 2p⁶ 3s² 3p¹", "1s² 2s² 2p⁶ 3s² 3p³", "1s² 2s² 2p⁶ 3s² 3p⁵", "1s² 2s² 2p⁶ 3s¹ 3p⁴"],
                correctIndex: 1
            },
            {
                id: "dq8",
                competencyId: "dim-analysis",
                prompt: "Convert 72.0 km/h to m/s using dimensional analysis.",
                choices: ["2.00 m/s", "20.0 m/s", "25.9 m/s", "259 m/s"],
                correctIndex: 1
            },
            {
                id: "dq9",
                competencyId: "mole-concept",
                prompt: "What is the IUPAC name of Fe2(SO4)3?",
                choices: ["Iron(II) sulfate", "Iron(III) sulfate", "Diiron trisulfate", "Iron sulfate"],
                correctIndex: 1
            },
            {
                id: "dq10",
                competencyId: "measurement-precision",
                prompt: "What is the correct formula for nitrous acid?",
                choices: ["HNO3", "HNO2", "HCl", "H2SO3"],
                correctIndex: 1
            },
            {
                id: "dq11",
                competencyId: "stoich-setup",
                prompt: "According to VSEPR, what is the molecular geometry of H2O?",
                choices: ["Linear", "Bent", "Trigonal planar", "Tetrahedral"],
                correctIndex: 1
            },
            {
                id: "dq12",
                competencyId: "mole-concept",
                prompt: "Which pure compound has hydrogen bonding as its strongest IMF?",
                choices: ["CH4", "HCl", "NH3", "H2S"],
                correctIndex: 2
            },
            {
                id: "dq13",
                competencyId: "stoich-setup",
                prompt: "For N2 + 3H2 -> 2NH3, if 2.0 mol N2 reacts with excess H2, how many moles NH3 form?",
                choices: ["2.0 moles", "4.0 moles", "6.0 moles", "1.0 mole"],
                correctIndex: 1
            },
            {
                id: "dq14",
                competencyId: "stoich-setup",
                prompt: "Mixing Na2CO3(aq) and CaCl2(aq) forms a precipitate. What is the net ionic equation?",
                choices: ["Na⁺(aq) + Cl⁻(aq) → NaCl(s)", "Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)", "2Na⁺(aq) + 2Cl⁻(aq) → 2NaCl(aq)", "Ca²⁺(aq) + 2Cl⁻(aq) → CaCl₂(s)"],
                correctIndex: 1
            },
            {
                id: "dq15",
                competencyId: "mole-concept",
                prompt: "Given 4.0 mol H2 and 3.0 mol O2 for 2H2 + O2 -> 2H2O, which is limiting and what H2O amount forms?",
                choices: ["H2 is limiting; 4.0 moles H2O produced", "O2 is limiting; 6.0 moles H2O produced", "H2 is limiting; 2.0 moles H2O produced", "O2 is limiting; 3.0 moles H2O produced"],
                correctIndex: 0
            },
            {
                id: "dq16",
                competencyId: "dim-analysis",
                prompt: "A gas occupies 4.0 L at 1.0 atm. If temperature stays constant and volume becomes 2.0 L, what is the new pressure?",
                choices: ["0.5 atm", "1.0 atm", "2.0 atm", "4.0 atm"],
                correctIndex: 2
            },
            {
                id: "dq17",
                competencyId: "stoich-setup",
                prompt: "How many moles are in 5.0 L at 2.0 atm and 300 K? (Use R = 0.0821 L*atm/(mol*K))",
                choices: ["0.41 moles", "2.4 moles", "0.08 moles", "1.2 moles"],
                correctIndex: 0
            },
            {
                id: "dq18",
                competencyId: "mole-concept",
                prompt: "What volume of 12.0 M HCl is needed to prepare 500.0 mL of 2.00 M HCl?",
                choices: ["83.3 mL", "41.7 mL", "250 mL", "167 mL"],
                correctIndex: 0
            },
            {
                id: "dq19",
                competencyId: "measurement-precision",
                prompt: "A graduated cylinder has 0.1 mL scale marks. To what place should you report a measured volume?",
                choices: ["Nearest 1 mL", "Nearest 0.1 mL", "Nearest 0.01 mL", "Nearest 0.001 mL"],
                correctIndex: 2
            },
            {
                id: "dq20",
                competencyId: "stoich-setup",
                prompt: "Which compound is an unsaturated hydrocarbon with a C=C double bond?",
                choices: ["Methane (CH4)", "Ethane (C2H6)", "Ethene (C2H4)", "Ethanol (C2H5OH)"],
                correctIndex: 2
            }
        ]
    }
};

ChemData.polyatomicIons = [
  { "name": "Ammonium", "formula": "NH4+", "htmlFormula": "NH<sub>4</sub><sup>+</sup>", "charge": "+1", "group": "Positive Cations" },
  { "name": "Nitrate", "formula": "NO3-", "htmlFormula": "NO<sub>3</sub><sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Acetate", "formula": "C2H3O2-", "htmlFormula": "C<sub>2</sub>H<sub>3</sub>O<sub>2</sub><sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Chlorate", "formula": "ClO3-", "htmlFormula": "ClO<sub>3</sub><sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Hydroxide", "formula": "OH-", "htmlFormula": "OH<sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Cyanide", "formula": "CN-", "htmlFormula": "CN<sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Permanganate", "formula": "MnO4-", "htmlFormula": "MnO<sub>4</sub><sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Bicarbonate", "formula": "HCO3-", "htmlFormula": "HCO<sub>3</sub><sup>-</sup>", "charge": "-1", "group": "-1 Anions" },
  { "name": "Sulfate", "formula": "SO4 2-", "htmlFormula": "SO<sub>4</sub><sup>2-</sup>", "charge": "-2", "group": "-2 Anions" },
  { "name": "Carbonate", "formula": "CO3 2-", "htmlFormula": "CO<sub>3</sub><sup>2-</sup>", "charge": "-2", "group": "-2 Anions" },
  { "name": "Chromate", "formula": "CrO4 2-", "htmlFormula": "CrO<sub>4</sub><sup>2-</sup>", "charge": "-2", "group": "-2 Anions" },
  { "name": "Dichromate", "formula": "Cr2O7 2-", "htmlFormula": "Cr<sub>2</sub>O<sub>7</sub><sup>2-</sup>", "charge": "-2", "group": "-2 Anions" },
  { "name": "Oxalate", "formula": "C2O4 2-", "htmlFormula": "C<sub>2</sub>O<sub>4</sub><sup>2-</sup>", "charge": "-2", "group": "-2 Anions" },
  { "name": "Phosphate", "formula": "PO4 3-", "htmlFormula": "PO<sub>4</sub><sup>3-</sup>", "charge": "-3", "group": "-3 Anions" }
];

window.ChemData = ChemData;

