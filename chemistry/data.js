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
                prompt: "A nurse needs to prepare 500.0 mL of standard physiological saline (0.154 M NaCl). How many grams of NaCl must be weighed out? (Na = 22.99 g/mol, Cl = 35.45 g/mol)",
                choices: ["4.50 g", "9.00 g", "29.2 g", "58.4 g"],
                correctIndex: 0
            },
            {
                id: "dq2",
                competencyId: "mole-concept",
                prompt: "A patient's bone density scan reports a loss of calcium hydroxyapatite, which contains calcium phosphate, Ca3(PO4)2. What is the total number of oxygen atoms represented in one formula unit of calcium phosphate?",
                choices: ["4", "6", "8", "12"],
                correctIndex: 2
            },
            {
                id: "dq3",
                competencyId: "dim-analysis",
                prompt: "A physician orders a patient to receive a dose of 0.250 grams of a cardiac medication. The medication is labeled in milligrams. Which dimensional analysis setup correctly represents the conversion to milligrams?",
                choices: ["0.250 g * (1 mg / 1000 g)", "0.250 g * (1000 mg / 1 g)", "0.250 g * (1 g / 1000 mg)", "0.250 g * (100 mg / 1 g)"],
                correctIndex: 1
            },
            {
                id: "dq4",
                competencyId: "dim-analysis",
                prompt: "An IV bag contains 0.75 Liters of lactated Ringer's solution. If the infusion rate is set to deliver 150 mL per hour, how many hours will the bag last?",
                choices: ["2.0 hours", "5.0 hours", "7.5 hours", "11.3 hours"],
                correctIndex: 1
            },
            {
                id: "dq5",
                competencyId: "measurement-precision",
                prompt: "When weighing out a critical diagnostic tracer on a standard analytical balance in a clinical nuclear pharmacy, to what level of decimal precision (in grams) must the measurement be recorded?",
                choices: ["Nearest 0.1 g", "Nearest 0.01 g", "Nearest 0.001 g", "Nearest 0.0001 g"],
                correctIndex: 3
            },
            {
                id: "dq6",
                competencyId: "measurement-precision",
                prompt: "A standard 50 mL class-A laboratory burette has graduation marks every 0.1 mL. When reading the volume of a titrant at the bottom of the meniscus, to which decimal place must you record your measurement?",
                choices: ["Tenths place (e.g., 12.3 mL)", "Hundredths place (e.g., 12.35 mL)", "Thousandths place (e.g., 12.352 mL)", "Units place (e.g., 12 mL)"],
                correctIndex: 1
            },
            {
                id: "dq7",
                competencyId: "stoich-setup",
                prompt: "The metabolic oxidation of glucose is represented by the unbalanced equation: C6H12O6(s) + O2(g) -> CO2(g) + H2O(l). Once balanced, what is the stoichiometric mole ratio used to calculate the moles of carbon dioxide produced per mole of oxygen consumed?",
                choices: ["1 mole CO2 / 6 moles O2", "6 moles CO2 / 1 mole O2", "6 moles CO2 / 6 moles O2", "1 mole CO2 / 1 mole C6H12O6"],
                correctIndex: 2
            },
            {
                id: "dq8",
                competencyId: "dim-analysis",
                prompt: "A patient suspected of acute dehydration has a urine sample with a mass of 25.32 g and a volume of 24.50 mL. Calculate the density of the urine sample to three decimal places.",
                choices: ["1.033 g/mL", "0.968 g/mL", "1.082 g/mL", "1.015 g/mL"],
                correctIndex: 0
            },
            {
                id: "dq9",
                competencyId: "mole-concept",
                prompt: "Glucose (C6H12O6) is the primary source of energy for cellular metabolism. Using the atomic weights (C = 12.01 g/mol, H = 1.008 g/mol, O = 16.00 g/mol), calculate the molar mass of glucose.",
                choices: ["180.16 g/mol", "342.30 g/mol", "96.08 g/mol", "180.16 amu"],
                correctIndex: 0
            },
            {
                id: "dq10",
                competencyId: "measurement-precision",
                prompt: "To prevent toxic overdoses, a clinical pharmacologist records a pediatric dose as 0.004050 g. How many significant figures are in this measured value?",
                choices: ["3", "4", "5", "7"],
                correctIndex: 1
            },
            {
                id: "dq11",
                competencyId: "stoich-setup",
                prompt: "In a cellular reaction, reactant A and reactant B combine to form product C. If reactant A is the limiting reactant, what does this imply about the reaction outcome?",
                choices: ["Reactant A will have the largest remaining mass after the reaction stops.", "The maximum yield of product C is strictly determined by the initial quantity of reactant A.", "Reactant B is completely consumed before reactant A.", "The reaction rate is solely dependent on reactant A's molar mass."],
                correctIndex: 1
            },
            {
                id: "dq12",
                competencyId: "mole-concept",
                prompt: "Under the Ideal Gas Law (PV = nRT), if a patient's lungs expand (increasing volume) during inhalation at a constant temperature and constant moles of gas, what occurs to the internal pressure of the air inside the lungs?",
                choices: ["The internal pressure increases, forcing air out.", "The internal pressure decreases, drawing air in.", "The internal pressure remains constant.", "The gas constant R increases to compensate."],
                correctIndex: 1
            },
            {
                id: "dq13",
                competencyId: "stoich-setup",
                prompt: "An antacid tablet contains magnesium hydroxide, which neutralizes stomach acid according to the unbalanced equation: Mg(OH)2(s) + HCl(aq) -> MgCl2(aq) + H2O(l). If a patient takes a dose containing 0.050 moles of Mg(OH)2, how many moles of HCl can be neutralized?",
                choices: ["0.025 moles", "0.050 moles", "0.100 moles", "0.200 moles"],
                correctIndex: 2
            },
            {
                id: "dq14",
                competencyId: "stoich-setup",
                prompt: "During heavy exercise, anaerobic respiration in muscles produces lactic acid: C6H12O6 -> HC3H5O3 (unbalanced). How many moles of lactic acid (HC3H5O3) are produced per mole of glucose (C6H12O6) metabolized?",
                choices: ["1 mole", "2 moles", "3 moles", "6 moles"],
                correctIndex: 1
            },
            {
                id: "dq15",
                competencyId: "mole-concept",
                prompt: "Cisplatin, Pt(NH3)2Cl2, is a platinum-based chemotherapy agent. What is the molar mass of cisplatin to two decimal places? (Pt = 195.08, N = 14.01, H = 1.01, Cl = 35.45 g/mol)",
                choices: ["223.51 g/mol", "264.59 g/mol", "300.06 g/mol", "301.12 g/mol"],
                correctIndex: 2
            },
            {
                id: "dq16",
                competencyId: "dim-analysis",
                prompt: "A physician orders a dopamine infusion at a rate of 5.0 mcg/kg/min for an 80.0 kg patient. The dopamine concentration in the IV bag is 1.6 mg/mL. What is the required infusion rate in mL/hour? (1 mg = 1000 mcg)",
                choices: ["15.0 mL/h", "24.0 mL/h", "150 mL/h", "6.0 mL/h"],
                correctIndex: 0
            },
            {
                id: "dq17",
                competencyId: "stoich-setup",
                prompt: "A clinical diagnostic test captures exhaled carbon dioxide by reacting it with barium hydroxide: CO2(g) + Ba(OH)2(aq) -> BaCO3(s) + H2O(l). If a patient exhales 0.220 g of CO2 (molar mass = 44.01 g/mol), what is the theoretical yield of the barium carbonate precipitate (BaCO3, molar mass = 197.3 g/mol)?",
                choices: ["0.220 g", "0.440 g", "0.987 g", "1.973 g"],
                correctIndex: 2
            },
            {
                id: "dq18",
                competencyId: "mole-concept",
                prompt: "An MRI imaging contrast dose is 0.10 mmol of Gd-DTPA per kg of body weight. For an 80.0 kg patient, how many millimoles are administered, and how many individual molecules of Gd-DTPA does this represent? (Avogadro = 6.022 x 10^23)",
                choices: ["8.0 mmol; 4.8 x 10^21 molecules", "80 mmol; 4.8 x 10^22 molecules", "8.0 mmol; 4.8 x 10^24 molecules", "0.80 mmol; 4.8 x 10^20 molecules"],
                correctIndex: 0
            },
            {
                id: "dq19",
                competencyId: "measurement-precision",
                prompt: "A laboratory technician uses a micropipette to deliver exactly 250.0 microliters (mcL) of buffer solution. If the device has a precision tolerance of +/- 0.5 mcL, how should the volume be recorded in the patient report to match the precision of the instrument?",
                choices: ["250 mcL", "250.0 mcL", "0.25 mL", "250.00 mcL"],
                correctIndex: 1
            },
            {
                id: "dq20",
                competencyId: "stoich-setup",
                prompt: "Toxic cellular ammonia is converted in the liver to harmless urea: CO2(g) + NH3(g) -> (NH2)2CO(aq) + H2O(l) (unbalanced). Once balanced, if a patient metabolizes 3.40 g of ammonia (NH3, molar mass = 17.03 g/mol) with excess CO2, what is the theoretical yield of urea (molar mass = 60.06 g/mol)?",
                choices: ["3.00 g", "6.00 g", "12.0 g", "24.0 g"],
                correctIndex: 1
            }
        ]
    }
};

window.ChemData = ChemData;
