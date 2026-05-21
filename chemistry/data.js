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
            { factor: 1000, from: "g", to: "mg" }
        ],
        volume: [
            { factor: 1000, from: "L", to: "mL" },
            { factor: 1, from: "mL", to: "cm3" }
        ],
        temperature: [
            { type: "formula", from: "°C", to: "K", formula: "x + 273.15", inverseFormula: "x - 273.15", display: "(x + 273.15) K", displayInverse: "(x - 273.15) °C" },
            { type: "formula", from: "°C", to: "°F", formula: "x * 9/5 + 32", inverseFormula: "(x - 32) * 5/9", display: "(x * 1.8 + 32) °F", displayInverse: "((x - 32) / 1.8) °C" }
        ]
    },

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
            }
        ]
    },

        nomenclature: {
        "Polyatomic Ions": [
            { "formula": "NH4+", "name": "Ammonium" },
            { "formula": "NO2-", "name": "Nitrite", "rule": "One less oxygen than Nitrate" },
            { "formula": "NO3-", "name": "Nitrate", "rule": "Base 'ate' ion for nitrogen" },
            { "formula": "SO3 2-", "name": "Sulfite", "rule": "One less oxygen than Sulfate" },
            { "formula": "SO4 2-", "name": "Sulfate", "rule": "Base 'ate' ion for sulfur" },
            { "formula": "OH-", "name": "Hydroxide" },
            { "formula": "CN-", "name": "Cyanide" },
            { "formula": "PO4 3-", "name": "Phosphate" },
            { "formula": "CO3 2-", "name": "Carbonate" }
        ],
        "Acids": [
            { "formula": "HCl", "name": "Hydrochloric acid", "rule": "Binary acid: hydro- + root + -ic" },
            { "formula": "HBr", "name": "Hydrobromic acid", "rule": "Binary acid: hydro- + root + -ic" },
            { "formula": "HNO3", "name": "Nitric acid", "rule": "Oxyacid: '-ate' ion becomes '-ic' acid" },
            { "formula": "HNO2", "name": "Nitrous acid", "rule": "Oxyacid: '-ite' ion becomes '-ous' acid" },
            { "formula": "H2SO4", "name": "Sulfuric acid", "rule": "Oxyacid: '-ate' ion becomes '-ic' acid" },
            { "formula": "H2SO3", "name": "Sulfurous acid", "rule": "Oxyacid: '-ite' ion becomes '-ous' acid" },
            { "formula": "HC2H3O2", "name": "Acetic acid", "rule": "Oxyacid: from Acetate" }
        ],
        "Hydrates": [
            { "formula": "CuSO4�5H2O", "name": "Copper(II) sulfate pentahydrate", "rule": "penta = 5 waters" },
            { "formula": "MgSO4�7H2O", "name": "Magnesium sulfate heptahydrate", "rule": "hepta = 7 waters" },
            { "formula": "CaCl2�2H2O", "name": "Calcium chloride dihydrate", "rule": "di = 2 waters" },
            { "formula": "CoCl2�6H2O", "name": "Cobalt(II) chloride hexahydrate", "rule": "hexa = 6 waters" }
        ],
        "Covalent Compounds": [
            { "formula": "CO", "name": "Carbon monoxide" },
            { "formula": "CO2", "name": "Carbon dioxide" },
            { "formula": "N2O", "name": "Dinitrogen monoxide" },
            { "formula": "NO2", "name": "Nitrogen dioxide" },
            { "formula": "P2O5", "name": "Diphosphorus pentoxide" },
            { "formula": "SF6", "name": "Sulfur hexafluoride" }
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
                prompt: "How many grams are in 1 mole of NaCl?",
                choices: ["58.44 g", "35.45 g", "22.99 g", "18.02 g"],
                correctIndex: 0
            },
            {
                id: "dq2",
                competencyId: "mole-concept",
                prompt: "The subscript 2 in H2O means:",
                choices: ["2 oxygen atoms", "2 hydrogen atoms", "2 molecules total", "2 grams hydrogen"],
                correctIndex: 1
            },
            {
                id: "dq3",
                competencyId: "dim-analysis",
                prompt: "Best factor to convert g to mg:",
                choices: ["1 mg / 1000 g", "1000 mg / 1 g", "100 g / 1 mg", "1 g / 1000 mg"],
                correctIndex: 1
            },
            {
                id: "dq4",
                competencyId: "dim-analysis",
                prompt: "Convert 2.5 L to mL.",
                choices: ["250 mL", "2500 mL", "25 mL", "0.25 mL"],
                correctIndex: 1
            },
            {
                id: "dq5",
                competencyId: "measurement-precision",
                prompt: "Analytical balance readings should typically be reported to:",
                choices: ["0 decimal places", "1 decimal place", "2 decimal places", "4 decimal places"],
                correctIndex: 3
            },
            {
                id: "dq6",
                competencyId: "measurement-precision",
                prompt: "A burette reading of 12.3 mL is usually considered:",
                choices: ["Correct precision", "Too many decimals", "Not enough decimals", "Invalid unit"],
                correctIndex: 2
            },
            {
                id: "dq7",
                competencyId: "stoich-setup",
                prompt: "In the balanced equation N2 + 3H2 -> 2NH3, the stoichiometric ratio of H2 to NH3 is:",
                choices: ["1:2", "3:2", "2:3", "3:1"],
                correctIndex: 1
            },
            {
                id: "dq8",
                competencyId: "dim-analysis",
                prompt: "What is the density of an object with a mass of 45.0 g and a volume of 15.0 mL?",
                choices: ["3.00 g/mL", "0.33 g/mL", "60.0 g/mL", "675 g/mL"],
                correctIndex: 0
            },
            {
                id: "dq9",
                competencyId: "mole-concept",
                prompt: "Calculate the molar mass of CO2 (C=12.01, O=16.00):",
                choices: ["28.01 g/mol", "44.01 g/mol", "32.00 g/mol", "44.01 amu"],
                correctIndex: 1
            },
            {
                id: "dq10",
                competencyId: "measurement-precision",
                prompt: "How many significant figures are in the measurement 0.005020 g?",
                choices: ["2", "3", "4", "6"],
                correctIndex: 2
            },
            {
                id: "dq11",
                competencyId: "stoich-setup",
                prompt: "To find the limiting reactant, you must compare:",
                choices: ["Initial masses of reactants", "Moles of product formed by each reactant", "Molar masses of reactants", "Coefficients only"],
                correctIndex: 1
            },
            {
                id: "dq12",
                competencyId: "mole-concept",
                prompt: "One mole of an ideal gas at STP occupies approximately:",
                choices: ["22.4 L", "1.00 L", "24.5 L", "100.0 L"],
                correctIndex: 0
            }
        ]
    }
};

window.ChemData = ChemData;
