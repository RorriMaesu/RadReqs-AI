import json
import re

# Comprehensive Intro to Chemistry Vocabulary Dataset
categorized_data = {
    "Polyatomic Ions": [
        {"formula": "NH4+", "name": "Ammonium"},
        {"formula": "NO2-", "name": "Nitrite"},
        {"formula": "NO3-", "name": "Nitrate"},
        {"formula": "SO3 2-", "name": "Sulfite"},
        {"formula": "SO4 2-", "name": "Sulfate"},
        {"formula": "HSO4-", "name": "Hydrogen sulfate (Bisulfate)"},
        {"formula": "OH-", "name": "Hydroxide"},
        {"formula": "CN-", "name": "Cyanide"},
        {"formula": "PO4 3-", "name": "Phosphate"},
        {"formula": "HPO4 2-", "name": "Hydrogen phosphate"},
        {"formula": "H2PO4-", "name": "Dihydrogen phosphate"},
        {"formula": "CO3 2-", "name": "Carbonate"},
        {"formula": "HCO3-", "name": "Hydrogen carbonate (Bicarbonate)"},
        {"formula": "ClO-", "name": "Hypochlorite"},
        {"formula": "ClO2-", "name": "Chlorite"},
        {"formula": "ClO3-", "name": "Chlorate"},
        {"formula": "ClO4-", "name": "Perchlorate"},
        {"formula": "BrO-", "name": "Hypobromite"},
        {"formula": "BrO3-", "name": "Bromate"},
        {"formula": "IO3-", "name": "Iodate"},
        {"formula": "C2H3O2-", "name": "Acetate"},
        {"formula": "MnO4-", "name": "Permanganate"},
        {"formula": "Cr2O7 2-", "name": "Dichromate"},
        {"formula": "CrO4 2-", "name": "Chromate"},
        {"formula": "O2 2-", "name": "Peroxide"}
    ],
    "Acids": [
        {"formula": "HCl", "name": "Hydrochloric acid"},
        {"formula": "HBr", "name": "Hydrobromic acid"},
        {"formula": "HI", "name": "Hydroiodic acid"},
        {"formula": "HF", "name": "Hydrofluoric acid"},
        {"formula": "HNO3", "name": "Nitric acid"},
        {"formula": "HNO2", "name": "Nitrous acid"},
        {"formula": "H2SO4", "name": "Sulfuric acid"},
        {"formula": "H2SO3", "name": "Sulfurous acid"},
        {"formula": "H3PO4", "name": "Phosphoric acid"},
        {"formula": "H2CO3", "name": "Carbonic acid"},
        {"formula": "HC2H3O2", "name": "Acetic acid"},
        {"formula": "HClO4", "name": "Perchloric acid"},
        {"formula": "HClO3", "name": "Chloric acid"},
        {"formula": "HClO2", "name": "Chlorous acid"},
        {"formula": "HClO", "name": "Hypochlorous acid"}
    ],
    "Covalent Compounds": [
        {"formula": "H2O", "name": "Water (Dihydrogen monoxide)"},
        {"formula": "CO2", "name": "Carbon dioxide"},
        {"formula": "CO", "name": "Carbon monoxide"},
        {"formula": "SO2", "name": "Sulfur dioxide"},
        {"formula": "SO3", "name": "Sulfur trioxide"},
        {"formula": "N2O", "name": "Dinitrogen monoxide"},
        {"formula": "NO", "name": "Nitrogen monoxide"},
        {"formula": "NO2", "name": "Nitrogen dioxide"},
        {"formula": "N2O4", "name": "Dinitrogen tetroxide"},
        {"formula": "N2O5", "name": "Dinitrogen pentoxide"},
        {"formula": "PCl3", "name": "Phosphorus trichloride"},
        {"formula": "PCl5", "name": "Phosphorus pentachloride"},
        {"formula": "SF6", "name": "Sulfur hexafluoride"},
        {"formula": "NH3", "name": "Ammonia"},
        {"formula": "CH4", "name": "Methane"}
    ],
    "Ionic Compounds (Type I)": [
        {"formula": "NaCl", "name": "Sodium chloride"},
        {"formula": "KBr", "name": "Potassium bromide"},
        {"formula": "LiI", "name": "Lithium iodide"},
        {"formula": "MgO", "name": "Magnesium oxide"},
        {"formula": "CaS", "name": "Calcium sulfide"},
        {"formula": "AlN", "name": "Aluminum nitride"},
        {"formula": "MgF2", "name": "Magnesium fluoride"},
        {"formula": "Na2O", "name": "Sodium oxide"},
        {"formula": "CaCl2", "name": "Calcium chloride"},
        {"formula": "Al2O3", "name": "Aluminum oxide"},
        {"formula": "BaSO4", "name": "Barium sulfate"},
        {"formula": "KNO3", "name": "Potassium nitrate"},
        {"formula": "Li2CO3", "name": "Lithium carbonate"},
        {"formula": "Mg(OH)2", "name": "Magnesium hydroxide"},
        {"formula": "Na3PO4", "name": "Sodium phosphate"}
    ],
    "Ionic Compounds (Type II)": [
        {"formula": "FeCl2", "name": "Iron(II) chloride"},
        {"formula": "FeCl3", "name": "Iron(III) chloride"},
        {"formula": "FeO", "name": "Iron(II) oxide"},
        {"formula": "Fe2O3", "name": "Iron(III) oxide"},
        {"formula": "CuS", "name": "Copper(II) sulfide"},
        {"formula": "Cu2S", "name": "Copper(I) sulfide"},
        {"formula": "CuO", "name": "Copper(II) oxide"},
        {"formula": "Cu2O", "name": "Copper(I) oxide"},
        {"formula": "SnCl2", "name": "Tin(II) chloride"},
        {"formula": "SnCl4", "name": "Tin(IV) chloride"},
        {"formula": "PbO", "name": "Lead(II) oxide"},
        {"formula": "PbO2", "name": "Lead(IV) oxide"},
        {"formula": "Mn(NO3)2", "name": "Manganese(II) nitrate"},
        {"formula": "CoSO4", "name": "Cobalt(II) sulfate"},
        {"formula": "Ni(OH)2", "name": "Nickel(II) hydroxide"}
    ]
}

data_js_path = 'chemistry/data.js'
with open(data_js_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the current flat nomenclature array with our categorized dictionary
nom_regex = re.compile(r'nomenclature:\s*\[[\s\S]*?\n\s*\],', re.MULTILINE)
replacement = f"nomenclature: {json.dumps(categorized_data, indent=4)},"

new_text = nom_regex.sub(replacement, text)

with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Enriched chemistry/data.js with vast, categorized nomenclature list.")
