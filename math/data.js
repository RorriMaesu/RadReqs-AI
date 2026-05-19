/**
 * Phase 2: Clinical Data Schema
 * This file defines the clinical constraints, standard values, and 
 * conversion dictionaries required for the Clinical Mathematics Engine.
 */

const ClinicalDataSchema = {
    // Standard Source-to-Image Distances (SID) used in clinical practice
    standardSID: {
        inches: [40, 72],
        centimeters: [100, 180] // Approximate equivalents
    },

    // Standard Source-to-Object Distances (SOD)
    // SOD = SID - OID (Object-to-Image Distance)
    standardOIDConstraints: {
        minInches: 0,
        maxInches: 20
    },

    // Units Dictionary (SI vs Legacy)
    units: {
        absorbedDose: {
            SI: { name: 'Gray', symbol: 'Gy' },
            Legacy: { name: 'Rad', symbol: 'rad' },
            conversionFactor: 100, // 1 Gy = 100 Rad
            explanation: "1 Gray = 100 Rad. Used for absorbed dose in tissue."
        },
        doseEquivalent: {
            SI: { name: 'Sievert', symbol: 'Sv' },
            Legacy: { name: 'Rem', symbol: 'rem' },
            conversionFactor: 100, // 1 Sv = 100 Rem
            explanation: "1 Sievert = 100 Rem. Used for occupational exposure."
        },
        radioactivity: {
            SI: { name: 'Becquerel', symbol: 'Bq' },
            Legacy: { name: 'Curie', symbol: 'Ci' },
            conversionFactor: 3.7e10, // 1 Ci = 3.7 x 10^10 Bq
            isLegacyBase: true,
            explanation: "1 Curie = 3.7 x 10^10 Becquerels. Measures the rate of radioactive decay."
        }
    },

    // Formatting Rules for the Safety Validator
    safetyRules: {
        leadingZeroRequired: true, // .5 must be written as 0.5
        trailingZeroForbidden: true, // 5.0 must be written as 5
        decimalPrecision: {
            absorbedDose: 2,
            doseEquivalent: 3,
            radioactivity: 2
        }
    },

    // Formula Dictionary for Algebraic Rearranger
    formulas: {
        waveEquation: {
            standard: "c = \u03BB * \u03BD", // c = lambda * nu
            variables: ["c", "\u03BB", "\u03BD"],
            variableNames: {"c": "Velocity", "\u03BB": "Wavelength (lambda)", "\u03BD": "Frequency (nu)"},
            hints: {
                "c": "Velocity is already isolated! Just write the standard form: \u03BB * \u03BD",
                "\u03BB": "To isolate Wavelength (\u03BB), do the opposite of multiplying by Frequency (\u03BD). Divide both sides by \u03BD.",
                "\u03BD": "To isolate Frequency (\u03BD), do the opposite of multiplying by Wavelength (\u03BB). Divide both sides by \u03BB."
            },
            description: "Velocity = Wavelength x Frequency"
        },
        inverseSquareLaw: {
            standard: "I1 / I2 = (D2)^2 / (D1)^2",
            variables: ["I1", "I2", "D1", "D2"],
            variableNames: {"I1": "Original Intensity", "I2": "New Intensity", "D1": "Original Distance", "D2": "New Distance"},
            hints: {
                "I1": "Multiply both sides by I2 to isolate I1.",
                "I2": "Cross multiply first! (I1 * D1^2) = (I2 * D2^2), then divide by D2^2 to isolate I2.",
                "D1": "Cross multiply first! (I1 * D1^2) = (I2 * D2^2), then divide by I1, and take the square root.",
                "D2": "Cross multiply first! (I1 * D1^2) = (I2 * D2^2), then divide by I2, and take the square root."
            },
            description: "Intensity is inversely proportional to the square of the distance."
        },
        magnification: {
            standard: "M = SID / SOD",
            variables: ["M", "SID", "SOD"],
            variableNames: {"M": "Magnification Factor", "SID": "Source-to-Image Distance", "SOD": "Source-to-Object Distance"},
            hints: {
                "M": "Magnification is already isolated! Just write the standard form: SID / SOD",
                "SID": "To isolate SID, do the opposite of dividing by SOD. Multiply both sides by SOD.",
                "SOD": "To isolate SOD (which is currently in the denominator), multiply both sides by SOD first, then divide by M."
            },
            description: "Magnification Factor = Source-to-Image Distance / Source-to-Object Distance"
        }
    },

    // Expert Guides Content
    moduleGuides: {
        numeracy: `
            <div class="prose prose-sm text-gray-300 max-w-none">
                <h4 class="text-white font-bold text-lg mb-2">The Why: Patient Safety</h4>
                <p class="mb-4">Radiology is actively transitioning from Legacy units (Rad, Rem, Curie) to the International System of Units (Gy, Sv, Bq). Failure to accurately convert between these units is a leading cause of dosimetric misadministration. An error here can lead to significant patient under-dosing (ineffective treatment) or over-dosing (radiation burns or secondary cancers).</p>
                
                <h4 class="text-white font-bold text-lg mb-2">The How: Conversion Rules</h4>
                <ul class="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>SI to Legacy:</strong> Multiply by the conversion factor (e.g., 1 Gy = 100 Rad).</li>
                    <li><strong>Legacy to SI:</strong> Divide by the conversion factor (e.g., 100 Rad / 100 = 1 Gy).</li>
                </ul>
            </div>
        `,
        validator: `
            <div class="prose prose-sm text-gray-300 max-w-none">
                <h4 class="text-white font-bold text-lg mb-2">The Why: "Do Not Use" List</h4>
                <p class="mb-4">The Joint Commission identifies certain abbreviations and formatting habits as high-risk for medical errors. If a decimal point is missed by a nurse or doctor reading your chart, a dose of <span class="text-red-400">.5</span> might be read as <span class="text-red-400">5</span>, resulting in a <strong>10x overdose</strong>.</p>
                
                <h4 class="text-white font-bold text-lg mb-2">The How: Safe Formatting</h4>
                <ul class="list-disc pl-5 space-y-1 mb-2">
                    <li><strong>Always use a leading zero:</strong> Write <span class="text-green-400 font-bold">0.5</span>, never <span class="text-red-400 line-through">.5</span>.</li>
                    <li><strong>Never use a trailing zero:</strong> Write <span class="text-green-400 font-bold">5</span>, never <span class="text-red-400 line-through">5.0</span>.</li>
                </ul>
            </div>
        `,
        algebra: `
            <div class="prose prose-sm text-gray-300 max-w-none">
                <h4 class="text-white font-bold text-lg mb-2">The Why: Cognitive Load</h4>
                <p class="mb-4">In high-stress clinical situations (like trauma radiography), trying to solve equations while juggling numbers leads to order-of-operation errors. By isolating the target variable algebraically <em>before</em> plugging in any numbers, you drastically reduce the chance of a mathematical mistake.</p>
                
                <h4 class="text-white font-bold text-lg mb-2">The How: Inverse Operations</h4>
                <ul class="list-disc pl-5 space-y-1 mb-2">
                    <li>If a variable is multiplied by X, divide both sides by X to isolate it.</li>
                    <li>Always cross-multiply fractions first to create a linear equation, then isolate.</li>
                </ul>
            </div>
        `,
        spatial: `
            <div class="prose prose-sm text-gray-300 max-w-none">
                <h4 class="text-white font-bold text-lg mb-2">The Why: Radiation Protection</h4>
                <p class="mb-4">Radiation spreads out spherically from the source. This means if you double your distance from the x-ray tube, your exposure doesn't just cut in half—it drops to <strong>one-fourth (1/4)</strong>. This is the single most effective tool for technologist safety.</p>
                
                <h4 class="text-white font-bold text-lg mb-2">The How: The Inverse Square Law</h4>
                <p class="mb-2 font-mono bg-gray-800 p-2 rounded inline-block text-white">I₁ / I₂ = (D₂)² / (D₁)²</p>
                <ol class="list-decimal pl-5 space-y-1 mb-2">
                    <li>Identify your initial intensity (I₁) and distance (D₁).</li>
                    <li>Identify the new distance (D₂).</li>
                    <li>Square both distances before cross-multiplying to solve for I₂.</li>
                </ol>
            </div>
        `
    }
};
