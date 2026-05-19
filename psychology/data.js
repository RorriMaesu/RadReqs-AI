/**
 * Psychology & Care Simulator - Clinical Schema
 * Phase 1 Data File - Curriculum Expanded
 */

const psychData = {
    // Module 1: Chart Auditor
    chartScenarios: [
        {
            id: 1,
            patient: "Jane Doe, 78F",
            text: `Patient presents to the department for a routine pelvic ultrasound. Chart notes indicate a history of <span class="highlight-pending" data-flag="true" data-reason="HOH means Hard of Hearing. You must ensure you face the patient and speak clearly, but do not shout.">HOH</span> and mild <span class="highlight-pending" data-flag="true" data-reason="Dementia requires a slower pace, clear simple instructions, and potentially the presence of a caregiver.">dementia</span>. Patient is currently experiencing <span class="highlight-pending" data-flag="true" data-reason="Severe pain means the patient may not be able to tolerate certain positions or lengthy procedures.">severe abdominal pain</span>. Ensure a full bladder prior to imaging.`,
            redFlagCount: 3
        },
        {
            id: 2,
            patient: "John Smith, 45M",
            text: `Patient scheduled for an MRI of the lumbar spine. Order indicates <span class="highlight-pending" data-flag="true" data-reason="Claustrophobia is a critical contraindication for MRI without sedation or open MRI options.">severe claustrophobia</span> and a history of <span class="highlight-pending" data-flag="true" data-reason="Metal implants must be thoroughly vetted before entering Zone IV of an MRI suite due to magnetic hazards.">shrapnel injury</span> in the left leg from military service. Patient is currently taking <span class="highlight-pending" data-flag="false">ibuprofen</span> for pain.`,
            redFlagCount: 2
        },
        {
            id: 3,
            patient: "Little Timmy, 4M",
            text: `Outpatient pediatric chest x-ray. Patient is accompanied by mother. Chart notes patient has <span class="highlight-pending" data-flag="true" data-reason="ASD requires minimizing sensory overload (loud noises, bright lights) and establishing trust.">Autism Spectrum Disorder (ASD)</span> and is highly sensitive to <span class="highlight-pending" data-flag="true" data-reason="Physical touch should be minimized and explained thoroughly before initiating.">physical touch</span>. Mother requests to be <span class="highlight-pending" data-flag="true" data-reason="Parental presence is encouraged but requires pregnancy screening and lead shielding.">in the room</span> during the exposure.`,
            redFlagCount: 3
        },
        {
            id: 4,
            patient: "Robert Johnson, 62M",
            text: `Inpatient portable chest x-ray requested STAT. Patient is currently on <span class="highlight-pending" data-flag="true" data-reason="Airborne precautions require an N95 mask, negative pressure room awareness, and strict machine wipe-down.">Airborne Precautions</span> for suspected Tuberculosis. The patient is <span class="highlight-pending" data-flag="true" data-reason="Intubation means the patient cannot follow breathing instructions; exposure must be timed with the ventilator.">intubated</span> and sedated.`,
            redFlagCount: 2
        },
        {
            id: 5,
            patient: "Maria Garcia, 29F",
            text: `CT Abdomen/Pelvis with IV contrast. Patient has a documented <span class="highlight-pending" data-flag="true" data-reason="Iodine allergy is a strict contraindication for standard CT contrast without premedication protocol.">severe allergy to iodine</span> and a history of <span class="highlight-pending" data-flag="true" data-reason="Asthma increases the risk of a severe bronchospasm during a contrast reaction.">asthma</span>. Patient requires a <span class="highlight-pending" data-flag="false">Spanish interpreter</span> for consent.`,
            redFlagCount: 2
        },
        // Infection & Isolation Control
        {
            id: 6,
            patient: "Arthur Pendelton, 82M",
            text: `Inpatient arriving for a fluoroscopic barium enema. Chart indicates the patient is currently on <span class="highlight-pending" data-flag="true" data-reason="C. diff spores are not killed by alcohol. Equipment must be terminally cleaned with bleach wipes.">Contact Precautions for C. diff</span>. Patient has a history of <span class="highlight-pending" data-flag="false">hypertension</span> and <span class="highlight-pending" data-flag="true" data-reason="Severe diarrhea poses a massive contamination risk during a barium enema. Double-gloving and impermeable gowns are required.">severe chronic diarrhea</span>. Ensure room is prepped accordingly.`,
            redFlagCount: 2
        },
        {
            id: 7,
            patient: "Lily Chen, 34F",
            text: `Outpatient PET/CT scan for lymphoma restaging. Patient is undergoing active chemotherapy and is currently under <span class="highlight-pending" data-flag="true" data-reason="Reverse/Neutropenic precautions mean the patient is severely immunocompromised. Staff must wear masks to protect the patient from infection.">Neutropenic Precautions</span>. Her absolute neutrophil count is dangerously low. She is fasting for <span class="highlight-pending" data-flag="false">6 hours</span> as required for the exam.`,
            redFlagCount: 1
        },
        {
            id: 8,
            patient: "Marcus Thorne, 19M",
            text: `ER patient presents for a non-contrast head CT following a syncopal episode. Triage notes state patient is presenting with a high fever, productive cough, and is on <span class="highlight-pending" data-flag="true" data-reason="Droplet precautions require the technologist to wear a surgical mask and eye protection, and the patient to be masked.">Droplet Precautions</span>. Patient's <span class="highlight-pending" data-flag="false">O2 saturation is 96%</span> on room air.`,
            redFlagCount: 1
        },
        {
            id: 9,
            patient: "Evelyn Ross, 55F",
            text: `Inpatient scheduled for an MRI of the cervical spine. Nursing notes state the patient's room was recently flagged for <span class="highlight-pending" data-flag="true" data-reason="Bed bugs require the MRI suite to be shut down for terminal cleaning and extermination after the scan. The exam should be delayed if not emergent.">bed bugs</span>. Patient is complaining of severe neck pain radiating down the left arm. <span class="highlight-pending" data-flag="false">Vital signs are stable</span>.`,
            redFlagCount: 1
        },
        // Contrast & Lab Contraindications
        {
            id: 10,
            patient: "David Miller, 61M",
            text: `CT Angiogram of the chest to rule out pulmonary embolism. Contrast order placed. Recent lab work shows a <span class="highlight-pending" data-flag="true" data-reason="An eGFR of 28 indicates severe kidney disease. IV contrast is contraindicated without a specialized nephrology protocol due to risk of Contrast-Induced Nephropathy (CIN).">GFR of 28</span>. Patient is currently taking <span class="highlight-pending" data-flag="false">Lisinopril</span> for hypertension.`,
            redFlagCount: 1
        },
        {
            id: 11,
            patient: "Sarah Jenkins, 48F",
            text: `Routine CT of the Abdomen/Pelvis with IV contrast. Patient has a history of Type 2 Diabetes and takes <span class="highlight-pending" data-flag="true" data-reason="Metformin must be withheld for 48 hours after receiving IV iodine contrast due to the risk of fatal lactic acidosis if acute kidney injury occurs.">Metformin 1000mg BID</span>. Patient also notes a <span class="highlight-pending" data-flag="false">shellfish allergy</span>.`,
            redFlagCount: 1
        },
        {
            id: 12,
            patient: "Thomas Wright, 39M",
            text: `Outpatient scheduled for a contrast-enhanced MRI. Chart flags a previous allergic reaction to <span class="highlight-pending" data-flag="false">Penicillin</span> and a <span class="highlight-pending" data-flag="true" data-reason="Prior mild reactions to Gadolinium require a 13-hour premedication protocol (Prednisone/Benadryl) before the scan can be performed safely.">mild hives reaction to Gadolinium</span> 3 years ago. Ensure the patient has completed the required prep protocol.`,
            redFlagCount: 1
        },
        {
            id: 13,
            patient: "Beatrice Wong, 71F",
            text: `STAT CT Neck with IV contrast for a suspected abscess. Patient has a complex endocrine history including <span class="highlight-pending" data-flag="true" data-reason="Active hyperthyroidism combined with a massive iodine load from IV contrast can trigger a fatal thyroid storm.">untreated hyperthyroidism</span>. She is currently <span class="highlight-pending" data-flag="false">tachycardic</span> and sweating profusely.`,
            redFlagCount: 1
        },
        // Implant & Device Safety
        {
            id: 14,
            patient: "George Bailey, 85M",
            text: `Routine MRI of the brain for memory loss. Pre-screening form indicates a history of cardiac arrhythmias and placement of a <span class="highlight-pending" data-flag="true" data-reason="Pacemakers are a strict MRI contraindication unless they are MR-Conditional and cardiology is present to put the device in 'MRI Mode'. Entering Zone IV without clearance is lethal.">dual-chamber pacemaker</span> in 2012. Patient also has a <span class="highlight-pending" data-flag="false">left knee replacement</span> from 2008.`,
            redFlagCount: 1
        },
        {
            id: 15,
            patient: "Margaret Hale, 64F",
            text: `MRI Pituitary protocol for persistent headaches. Patient's surgical history includes a craniotomy in 1995 for an aneurysm. The chart notes the presence of an <span class="highlight-pending" data-flag="true" data-reason="Older aneurysm clips are highly ferromagnetic. The MRI's magnetic field will torque the clip, causing fatal intracranial hemorrhage. This scan must be cancelled or converted to CT.">intracranial aneurysm clip</span> of unknown make. She denies any <span class="highlight-pending" data-flag="false">claustrophobia</span>.`,
            redFlagCount: 1
        },
        {
            id: 16,
            patient: "Kevin Tran, 22M",
            text: `CT of the facial bones following a motor vehicle collision. Patient is an uncontrolled Type 1 Diabetic wearing a <span class="highlight-pending" data-flag="true" data-reason="Continuous Glucose Monitors (CGMs) contain sensitive electronics that will be permanently destroyed by the direct X-ray beam during a CT scan. The device must be removed.">Continuous Glucose Monitor (CGM)</span> on his upper arm. He has a deep laceration on his <span class="highlight-pending" data-flag="false">right cheek</span>.`,
            redFlagCount: 1
        },
        {
            id: 17,
            patient: "Leroy Jackson, 41M",
            text: `MRI of the thoracic spine to evaluate radiculopathy. History is notable for a <span class="highlight-pending" data-flag="true" data-reason="Retained shrapnel or bullets near the spinal cord can heat up or migrate under the powerful RF/magnetic fields of the MRI, causing paralysis. Need X-ray clearance first.">retained bullet fragment</span> in the paraspinal muscles from a gunshot wound 10 years ago. Patient is currently <span class="highlight-pending" data-flag="false">ambulatory</span>.`,
            redFlagCount: 1
        },
        // Physical & Mobility Limitations
        {
            id: 18,
            patient: "Agnes Higgins, 89F",
            text: `DXA scan for osteoporosis screening. Patient has <span class="highlight-pending" data-flag="true" data-reason="Severe kyphosis prevents the patient from lying flat on their back, making standard DXA positioning impossible. Spine geometry will be completely skewed.">severe advanced kyphosis</span> and uses a <span class="highlight-pending" data-flag="false">walker</span> for mobility. Patient complains of chronic back pain.`,
            redFlagCount: 1
        },
        {
            id: 19,
            patient: "William Davies, 73M",
            text: `Post-operative x-ray of the pelvis. Patient is 2 days post-op from a <span class="highlight-pending" data-flag="true" data-reason="Recent THA requires strict hip precautions (no bending past 90 degrees, no adduction/crossing legs, no internal rotation) to prevent total dislocation of the prosthesis.">right total hip arthroplasty (THA)</span>. Orders specify imaging to be done portably in bed. Patient is on <span class="highlight-pending" data-flag="false">IV pain medication</span>.`,
            redFlagCount: 1
        },
        {
            id: 20,
            patient: "Javier Rodriguez, 52M",
            text: `Outpatient CT of the abdomen. Patient is morbidly obese with a listed weight of <span class="highlight-pending" data-flag="true" data-reason="Table weight limits (typically 450-500 lbs) and bore diameter (70-80cm) must be verified. Overloading the table will break the motor, and the patient may get physically stuck in the gantry.">510 lbs (231 kg)</span>. Patient is ambulatory but <span class="highlight-pending" data-flag="false">short of breath</span> upon exertion.`,
            redFlagCount: 1
        },
        {
            id: 21,
            patient: "Samantha Reed, 28F",
            text: `Fluoroscopic swallow study for dysphagia. Patient is a <span class="highlight-pending" data-flag="true" data-reason="Quadriplegia requires a specialized mechanical lift (Hoyer) for transfer. Patient is at extreme risk for pressure ulcers and aspiration during the swallow study.">C4 complete quadriplegic</span> following a diving accident. She arrives via stretcher. Requires assistance for all <span class="highlight-pending" data-flag="false">transfers</span>.`,
            redFlagCount: 1
        },
        // Psychiatric & Behavioral Risks
        {
            id: 22,
            patient: "Omar Khalid, 37M",
            text: `MRI Brain without contrast. Patient has a long-standing history of <span class="highlight-pending" data-flag="true" data-reason="Auditory hallucinations combined with the extreme knocking sounds of an MRI can trigger severe psychosis or panic. Constant vocal reassurance over the intercom is required.">schizophrenia and active auditory hallucinations</span>. Patient appears highly anxious in the waiting room but is <span class="highlight-pending" data-flag="false">cooperative</span>.`,
            redFlagCount: 1
        },
        {
            id: 23,
            patient: "Eleanor Vance, 31F",
            text: `Outpatient pelvic MRI. Patient is a veteran with a diagnosis of <span class="highlight-pending" data-flag="true" data-reason="Severe PTSD can be triggered by the confined, tube-like space and loud banging of the MRI. The patient may require sedation or an open MRI system.">severe combat PTSD</span>. She is accompanied by a <span class="highlight-pending" data-flag="false">service dog</span>. Alert technologist to avoid sudden loud noises.`,
            redFlagCount: 1
        },
        {
            id: 24,
            patient: "Victor Drago, 44M",
            text: `Inpatient arriving for a chest x-ray. Chart contains a strict nursing alert noting a recent history of <span class="highlight-pending" data-flag="true" data-reason="A history of violently assaulting hospital staff means you must never be alone in the room with this patient. Hospital security must be present for the entire exam.">violently assaulting a nurse</span>. Patient is currently <span class="highlight-pending" data-flag="false">resting quietly</span> in the stretcher.`,
            redFlagCount: 1
        },
        {
            id: 25,
            patient: "Rosemary Gable, 81F",
            text: `Routine CT Head without contrast for altered mental status. Exam is scheduled for 4:30 PM. Chart indicates the patient suffers from severe <span class="highlight-pending" data-flag="true" data-reason="Sundowning causes dementia patients to become highly confused, combative, and agitated in the late afternoon/evening. The exam should ideally be rescheduled for the early morning.">sundowning syndrome</span>. Patient is currently <span class="highlight-pending" data-flag="false">oriented to self only</span>.`,
            redFlagCount: 1
        },
        // Procedural & Legal Hazards
        {
            id: 26,
            patient: "Henry Ford, 68M",
            text: `Interventional radiology CT-guided liver biopsy. Pre-procedural labs show a PT/INR of 3.8. Patient is actively taking <span class="highlight-pending" data-flag="true" data-reason="Warfarin is a powerful blood thinner. An INR of 3.8 is dangerously high for a percutaneous liver biopsy. The procedure will result in massive internal hemorrhage if not reversed.">Warfarin (Coumadin)</span>. Patient is <span class="highlight-pending" data-flag="false">NPO for 8 hours</span>.`,
            redFlagCount: 1
        },
        {
            id: 27,
            patient: "Chloe Adams, 56F",
            text: `Outpatient Upper GI Series (Barium Swallow). Order states patient must be NPO since midnight. Upon arrival at 9:00 AM, the patient states she had a <span class="highlight-pending" data-flag="true" data-reason="Consuming coffee violates the strict NPO status for an Upper GI series. Fluid in the stomach will dilute the barium and obscure the mucosal lining, rendering the exam non-diagnostic.">large black coffee</span> at 7:00 AM. She is otherwise <span class="highlight-pending" data-flag="false">asymptomatic</span>.`,
            redFlagCount: 1
        },
        {
            id: 28,
            patient: "Leo Valdez, 15M",
            text: `Outpatient MRI of the knee for a sports injury. Patient arrives at the clinic accompanied only by his <span class="highlight-pending" data-flag="true" data-reason="A 15-year-old minor cannot legally consent to an MRI. An 18-year-old sibling is not a legal guardian. The exam cannot proceed without legal parental/guardian consent.">18-year-old brother</span>. Parents are currently out of state on vacation. Patient is in <span class="highlight-pending" data-flag="false">mild pain</span>.`,
            redFlagCount: 1
        },
        {
            id: 29,
            patient: "Jane Doe, 22F",
            text: `Unidentified Jane Doe brought to the ER after a severe high-speed MVC. Trauma surgeon orders a STAT CT Pan-Scan (Head, Neck, Chest, Abd, Pelvis). Patient is unconscious and her <span class="highlight-pending" data-flag="true" data-reason="While a Pan-Scan delivers a massive dose of radiation to a potentially pregnant uterus, life-saving trauma imaging ALWAYS supersedes pregnancy concerns. Do not delay the scan.">pregnancy status is unknown</span>. Patient has <span class="highlight-pending" data-flag="false">multiple deformities</span> of the extremities.`,
            redFlagCount: 1
        }
    ],

    // Module 2: Jargon Filter
    jargonScenarios: [
        "A very anxious patient asks: 'What are you going to do to me?'",
        "A patient looking at the MRI machine asks: 'Am I going to be trapped in that tube?'",
        "A patient holding a cup of barium asks: 'Will this radioactive stuff make me sick?'",
        "A mother asks before her child's X-Ray: 'Is this radiation going to give my baby cancer?'",
        "A patient about to receive IV contrast asks: 'Is this needle going to hurt?'",
        "A patient having an MRI of the brain asks: 'Is this machine going to crush my head?'",
        "A patient asks before a CT scan: 'I read online this dye makes you pee your pants. Is that true?'",
        "A patient undergoing a nuclear medicine bone scan asks: 'Am I going to glow in the dark after you inject this?'",
        "A parent asks before an infant's ultrasound: 'Will these sound waves damage my baby's hearing?'",
        "A patient scheduled for an interventional biopsy asks: 'Are you going to cut me open and do surgery?'",
        "A patient asks during a mammogram: 'Are you going to squish me until I bruise?'",
        "A patient reading their requisition form asks: 'It says ruling out malignancy. Does that mean I have a tumor?'",
        "A claustrophobic patient asks: 'What if I have a panic attack and can't breathe in there?'",
        "A patient receiving gadolinium contrast asks: 'Will this poison my kidneys?'",
        "A patient sees the lead apron and asks: 'If this is safe, why are you hiding behind a wall?'",
        "A patient undergoing a fluoroscopy procedure asks: 'Are you going to burn my skin with all this radiation?'",
        "A teenager asks before a scoliosis series: 'Will taking so many x-rays mutate my cells?'",
        "An elderly patient asks before an angiogram: 'Are you going to stick a tube all the way into my heart?'",
        "A patient undergoing a breast biopsy asks: 'Are you going to stab me while I am awake?'",
        "A patient asks before an extremity CT: 'Is my arm going to be stuck inside that doughnut hole forever?'",
        "A patient receiving an iodine injection asks: 'What if I have a severe allergic reaction and stop breathing?'",
        "A nuclear medicine patient asks: 'Can I hug my kids tonight, or will I give them radiation poisoning?'",
        "A patient looks at the IV pump and asks: 'Are you pumping my body full of dangerous chemicals?'",
        "A patient undergoing a pelvic ultrasound asks: 'Are you pushing that wand hard to look for disease?'",
        "A patient sees the large MRI coils and asks: 'Is that cage going to lock me in?'"
    ],
    jargonDictionary: {
        blacklist: [
            "tumor", "cancer", "radiation", "inject", "claustrophobia", "painful", 
            "burn", "cut", "die", "lesion", "abnormal", "disease", "nuke", "radioactive",
            "trapped", "stuck", "hurt", "needle", "shot", "danger", "risk", "poison", "tube", "mass",
            "dye", "allergic", "reaction", "surgery", "bleed", "choke", "glow", "deformity", 
            "malignancy", "benign", "squish", "crush", "claustrophobic", "freak out", "stab", 
            "chemicals", "poisoning", "mutate", "cage", "lock"
        ],
        whitelist: [
            "comfortable", "safe", "quick", "picture", "scan", "medicine", 
            "contrast", "warm", "monitor", "help", "care", "rest", "camera", 
            "open", "breeze", "smooth", "protect", "shield", "clear", "guide",
            "contrast agent", "highlight", "breathe", "relax", "gentle", "pressure", 
            "support", "team", "numb", "sleepy", "detailed", "images", "routine", 
            "communicate", "intercom", "specialized", "temporary", "flush"
        ]
    },

    // Module 3: Timed De-escalation
    deescalationTrees: [
        {
            id: "scenario_iv_pull",
            prompt: `Patient suddenly stands up, tears out their IV, and yells, "I'm not letting you do this to me!"`,
            tactics: [
                {
                    name: "Acknowledge & Validate",
                    desc: "Focus on their immediate emotion before rules.",
                    success: true,
                    nextPrompt: "Patient pauses, breathing heavily. 'You don't understand, the last time I was here they hurt me.'",
                    style: "indigo"
                },
                {
                    name: "Assert Authority",
                    desc: "Command them to sit down for their safety.",
                    success: false,
                    failureMessage: "Direct commands escalate the patient's panic. They back into a corner and pick up a sharp object. Code White called.",
                    style: "rose"
                },
                {
                    name: "Deflect & Ignore",
                    desc: "Continue preparing equipment quietly.",
                    success: false,
                    failureMessage: "Ignoring the patient validates their fear of not being heard. They run out of the department bleeding. Medicolegal failure.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_dementia_wandering",
            prompt: `A geriatric patient with severe dementia wanders out of the changing room completely undressed, looking confused and frightened in the busy hallway.`,
            tactics: [
                {
                    name: "Loudly Redirect",
                    desc: "Call out to them from down the hall to go back inside.",
                    success: false,
                    failureMessage: "The loud noise startles them, causing a fall in the hallway. Hip fracture. Sentinel event.",
                    style: "rose"
                },
                {
                    name: "Approach & Cloak",
                    desc: "Walk up calmly with a warm blanket and drape it over their shoulders.",
                    success: true,
                    nextPrompt: "The patient grips the blanket tightly. 'Where is my husband? I need to go home.'",
                    style: "indigo"
                },
                {
                    name: "Call Security",
                    desc: "Immediately page security for an uncooperative patient.",
                    success: false,
                    failureMessage: "Security arrives in uniform, terrifying the patient who believes they are being arrested. Extreme psychological trauma.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_mri_panic",
            prompt: `Halfway into the MRI bore, the patient starts thrashing wildly and screaming, "Get me out! I can't breathe in here!"`,
            tactics: [
                {
                    name: "Immediate Extraction",
                    desc: "Stop the scan immediately and pull the table out.",
                    success: true,
                    nextPrompt: "The patient is out of the bore, hyperventilating and shaking on the table.",
                    style: "indigo"
                },
                {
                    name: "Rationalize",
                    desc: "Use the intercom to explain they have plenty of oxygen.",
                    success: false,
                    failureMessage: "Logic does not override a panic attack. The patient tries to climb out, striking their head on the RF coil. Serious injury.",
                    style: "amber"
                },
                {
                    name: "Firm Command",
                    desc: "Tell them over the intercom they must hold still to finish.",
                    success: false,
                    failureMessage: "The patient feels trapped and ignored. They thrash harder, breaking the head coil and suffering a panic-induced syncope.",
                    style: "rose"
                }
            ]
        },
        {
            id: "scenario_intoxicated_combative",
            prompt: `An ER patient smelling strongly of alcohol throws their emesis basin at the wall. "I'm tired of waiting! Do the x-ray now or I'm leaving!"`,
            tactics: [
                {
                    name: "Maintain Distance & Set Boundary",
                    desc: "Step back near the door and calmly state the expectation.",
                    success: true,
                    nextPrompt: "The patient glares at you but doesn't throw anything else. 'Well? Are you going to do it or not?'",
                    style: "indigo"
                },
                {
                    name: "Match Their Volume",
                    desc: "Yell back that they are being inappropriate.",
                    success: false,
                    failureMessage: "Matching aggression with an intoxicated patient incites a physical altercation. You are struck in the face. Code White.",
                    style: "rose"
                },
                {
                    name: "Restrain Immediately",
                    desc: "Grab their arms to prevent them from throwing anything else.",
                    failureMessage: "Attempting physical restraint without proper backup or orders results in the patient biting your arm. Bloodborne pathogen exposure.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_pediatric_tantrum",
            prompt: `A 6-year-old child throws a violent tantrum on the X-ray table, screaming and refusing to let go of their parent's leg.`,
            tactics: [
                {
                    name: "Threaten",
                    desc: "Tell the child that if they don't hold still, they will get a shot.",
                    success: false,
                    failureMessage: "Threatening a child destroys all trust. The child begins hyperventilating and vomiting. Exam cancelled.",
                    style: "rose"
                },
                {
                    name: "Distract & Play",
                    desc: "Blow up a medical glove like a balloon and talk about magic cameras.",
                    success: true,
                    nextPrompt: "The child stops crying to look at the balloon. 'Is it really magic?'",
                    style: "indigo"
                },
                {
                    name: "Forcible Restraint",
                    desc: "Instruct the parent to pin the child down immediately.",
                    success: false,
                    failureMessage: "Forcible restraint without attempting de-escalation first is traumatic and yields motion-blurred, non-diagnostic images. Fail.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_angry_family",
            prompt: `A family member barges into the CT control room, furious that their mother has been waiting in the hallway for 3 hours. "You people are neglecting her!"`,
            tactics: [
                {
                    name: "Call Security",
                    desc: "Immediately pick up the phone and call security.",
                    success: false,
                    failureMessage: "Calling security prematurely escalates their frustration to rage. They throw a chair at the scanner console. Code White.",
                    style: "rose"
                },
                {
                    name: "Acknowledge & Explain",
                    desc: "Apologize for the wait and briefly explain the trauma delay.",
                    success: true,
                    nextPrompt: "They cross their arms. 'I don't care about other people, my mother is in pain right now.'",
                    style: "indigo"
                },
                {
                    name: "Ignore Them",
                    desc: "Turn back to your monitors and close the door.",
                    success: false,
                    failureMessage: "Ignoring them causes them to aggressively grab your shoulder and rip your badge off. Assault.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_delusional_paranoid",
            prompt: `A psychiatric patient from the ER refuses to lay on the table because they believe the MRI machine will "steal their thoughts."`,
            tactics: [
                {
                    name: "Argue Logic",
                    desc: "Explain the physics of magnetic resonance imaging.",
                    success: false,
                    failureMessage: "You cannot argue logic with a delusion. They believe you are part of the conspiracy and run away. Security risk.",
                    style: "rose"
                },
                {
                    name: "Validate Fear",
                    desc: "Acknowledge the machine looks scary, but promise it only takes pictures.",
                    success: true,
                    nextPrompt: "The patient looks at you suspiciously. 'Are you sure it won't read my mind?'",
                    style: "indigo"
                },
                {
                    name: "Force the Scan",
                    desc: "Tell them they have no choice because the doctor ordered it.",
                    success: false,
                    failureMessage: "Forcing a paranoid patient triggers a severe fight-or-flight response. They barricade themselves in the dressing room. Fail.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_needle_phobia",
            prompt: `An adult patient starts hyperventilating and crying uncontrollably when you pull out the contrast syringe.`,
            tactics: [
                {
                    name: "Hide and Jab",
                    desc: "Hide the needle behind your back and stick them quickly.",
                    success: false,
                    failureMessage: "The surprise needle stick causes them to flinch violently. The needle breaks off in their arm. Sentinel event.",
                    style: "rose"
                },
                {
                    name: "Lower Syringe & Breathe",
                    desc: "Put the syringe down, sit next to them, and initiate deep breathing.",
                    success: true,
                    nextPrompt: "The patient takes a shaky breath. 'I'm sorry, I just can't do needles. I'm going to pass out.'",
                    style: "indigo"
                },
                {
                    name: "Act Condescending",
                    desc: "Tell them to act their age, it's just a tiny poke.",
                    success: false,
                    failureMessage: "The patient feels humiliated and angry. They rip off their gown, refuse the scan, and file a formal grievance.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_cultural_conflict",
            prompt: `A patient who speaks limited English becomes highly defensive and protective of their head when motioned to remove their religious head covering for a head CT.`,
            tactics: [
                {
                    name: "Forcibly Remove",
                    desc: "Reach out and try to remove it yourself.",
                    success: false,
                    failureMessage: "Touching their religious garment is deeply offensive. They slap your hand away and call the police. Assault charge.",
                    style: "rose"
                },
                {
                    name: "Use Translator Phone",
                    desc: "Get the translator phone to respectfully explain the clinical necessity.",
                    success: true,
                    nextPrompt: "The translator relays the message. The patient looks hesitant. [Translator]: 'She says she cannot show her hair to men.'",
                    style: "indigo"
                },
                {
                    name: "Give Up",
                    desc: "Scan them with the covering on.",
                    success: false,
                    failureMessage: "The covering contains metallic threads that create massive streak artifacts. The radiologist rejects the scan. Diagnostic failure.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_inappropriate_boundaries",
            prompt: `An ambulatory patient grabs your waist and begins making sexually aggressive, inappropriate comments toward you.`,
            tactics: [
                {
                    name: "Yell and Insult",
                    desc: "Scream at them and call them a creep.",
                    success: false,
                    failureMessage: "Yelling escalates the situation into a loud, public altercation. Patient becomes violent. Code White.",
                    style: "rose"
                },
                {
                    name: "Establish Boundaries",
                    desc: "Step back, remove their hands, and firmly state the behavior is unacceptable.",
                    success: true,
                    nextPrompt: "The patient smirks. 'Oh come on, I was just playing around. Don't be so uptight.'",
                    style: "indigo"
                },
                {
                    name: "Laugh it Off",
                    desc: "Awkwardly laugh and pretend it didn't happen.",
                    success: false,
                    failureMessage: "Ignoring sexual harassment encourages the behavior. They follow you into the darkroom and corner you. Extreme hazard.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_grieving_trauma",
            prompt: `A trauma patient who just learned their spouse died in the car crash begins weeping uncontrollably, refusing further imaging.`,
            tactics: [
                {
                    name: "Cite Hospital Policy",
                    desc: "Tell them hospital policy requires finishing the trauma protocol.",
                    success: false,
                    failureMessage: "Citing policy to a grieving patient destroys all rapport. They pull out their C-collar and leave AMA. Lethal risk.",
                    style: "rose"
                },
                {
                    name: "Silent Empathy",
                    desc: "Stop the exam, sit beside them, and offer a tissue silently.",
                    success: true,
                    nextPrompt: "The patient sobs into their hands for a full minute. 'I just want to see him...'",
                    style: "indigo"
                },
                {
                    name: "Order Sedation",
                    desc: "Call the ER doc to chemically sedate them so you can scan.",
                    success: false,
                    failureMessage: "Ordering chemical restraints for acute grief is highly unethical and illegal. Medical board investigation.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_hypoglycemic",
            prompt: `A fasting diabetic patient suddenly becomes very sweaty, confused, slurs their words, and shoves you away aggressively.`,
            tactics: [
                {
                    name: "Restrain Them",
                    desc: "Assume they are just being combative and strap them down.",
                    success: false,
                    failureMessage: "The patient is having severe hypoglycemia. Restraining them without treating the cause leads to a diabetic coma. Lethal outcome.",
                    style: "rose"
                },
                {
                    name: "Recognize & Treat",
                    desc: "Recognize hypoglycemia. Step back safely and call for juice/glucose.",
                    success: true,
                    nextPrompt: "A nurse arrives with glucose gel. The patient weakly swats at it. 'No... leave me alone...'",
                    style: "indigo"
                },
                {
                    name: "Ignore & Scan",
                    desc: "Ignore the behavior and try to finish the scan fast.",
                    success: false,
                    failureMessage: "The patient suffers a severe hypoglycemic seizure on the table and falls to the floor. Sentinel event.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_post_biopsy_panic",
            prompt: `A patient stands up too quickly after a liver biopsy, goes stark pale, panics, and yells, "I feel weird! I'm going to pass out!"`,
            tactics: [
                {
                    name: "Order to Stand",
                    desc: "Tell them to stand up straight and take deep breaths.",
                    success: false,
                    failureMessage: "The patient suffers vasovagal syncope, collapses face-first into the floor, and sustains a severe head bleed. Catastrophic failure.",
                    style: "rose"
                },
                {
                    name: "Assist to Floor",
                    desc: "Immediately grab them under the arms and safely guide them to the floor.",
                    success: true,
                    nextPrompt: "The patient is lying on the floor, pale and sweaty. 'My stomach hurts so bad...'",
                    style: "indigo"
                },
                {
                    name: "Call Code Blue",
                    desc: "Run away from the patient to hit the Code Blue button.",
                    success: false,
                    failureMessage: "Leaving a fainting patient standing alone ensures a traumatic fall. They hit their head on the counter. Serious injury.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_dementia_combative",
            prompt: `An Alzheimer's patient mid-exam forgets where they are. They rip off the blood pressure cuff and start aggressively swinging their fists at you.`,
            tactics: [
                {
                    name: "Fight Back",
                    desc: "Grab their wrists forcefully to stop the punches.",
                    success: false,
                    failureMessage: "Grabbing an Alzheimer's patient's wrists causes skin tears and immense panic. They bite you. Assault.",
                    style: "rose"
                },
                {
                    name: "Step Back & Re-orient",
                    desc: "Step out of striking distance, use a calm tone, and use their first name.",
                    success: true,
                    nextPrompt: "They stop swinging but look terrified. 'Who are you? What are you doing to me?'",
                    style: "indigo"
                },
                {
                    name: "Scream for Help",
                    desc: "Scream loudly for the nurses to come restrain them.",
                    success: false,
                    failureMessage: "Screaming triggers extreme sensory overload. The patient goes into cardiac arrest from stress. Lethal outcome.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_drug_seeking",
            prompt: `An ER patient refuses to lie down for their CT scan until you administer IV Dilaudid, claiming 10/10 pain while casually texting on their phone.`,
            tactics: [
                {
                    name: "Argue & Confront",
                    desc: "Accuse them of faking their pain since they are texting.",
                    success: false,
                    failureMessage: "Confronting a drug-seeking patient causes immediate rage. They throw their phone at the CT gantry, shattering the monitor. Code White.",
                    style: "rose"
                },
                {
                    name: "Set Boundary",
                    desc: "Calmly state you cannot administer medication and offer to call their nurse.",
                    success: true,
                    nextPrompt: "They roll their eyes and cross their arms. 'Fine, get the nurse. I'm not moving until she gets here.'",
                    style: "indigo"
                },
                {
                    name: "Administer Flush",
                    desc: "Pretend to give them medication by pushing a saline flush.",
                    success: false,
                    failureMessage: "Administering a placebo without consent is highly unethical and illegal. Medical board investigation.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_contrast_extravasation",
            prompt: `During a CT, the power injector blows the IV. The patient looks at their rapidly swelling arm and begins screaming in sheer terror.`,
            tactics: [
                {
                    name: "Blame the Nurse",
                    desc: "Loudly complain that the ER nurse placed a bad IV.",
                    success: false,
                    failureMessage: "Blaming colleagues destroys the patient's trust in the hospital. They panic further and pull the IV out, causing massive bleeding.",
                    style: "rose"
                },
                {
                    name: "Reassure & Apply Pressure",
                    desc: "Stop the scan, apply a warm compress, and calmly explain it's a known complication.",
                    success: true,
                    nextPrompt: "The patient is shaking but stops screaming. 'Is my arm going to burst? It hurts so bad.'",
                    style: "indigo"
                },
                {
                    name: "Ignore the Swelling",
                    desc: "Tell them to hold still so you can finish the scan anyway.",
                    success: false,
                    failureMessage: "Ignoring an extravasation causes compartment syndrome. The patient requires emergency fasciotomy surgery. Severe malpractice.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_child_abuse",
            prompt: `A parent brings in a 2-year-old with suspicious spiral fractures. When you ask how it happened, the parent becomes highly hostile and defensive.`,
            tactics: [
                {
                    name: "Interrogate",
                    desc: "Aggressively question the parent's story, demanding the truth.",
                    success: false,
                    failureMessage: "The parent realizes you suspect abuse and flees the hospital with the child before you can call security. Lethal risk.",
                    style: "rose"
                },
                {
                    name: "Deflect & Complete",
                    desc: "Maintain a neutral tone, complete the imaging quickly, and report silently.",
                    success: true,
                    nextPrompt: "The parent glares at you but allows you to finish the X-ray. 'We're leaving as soon as you're done.'",
                    style: "indigo"
                },
                {
                    name: "Accuse Directly",
                    desc: "Tell the parent you are calling Child Protective Services.",
                    success: false,
                    failureMessage: "The parent becomes violent, shoving you away from the console and grabbing the child. Code White.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_inmate_escort",
            prompt: `An inmate handcuffed to the imaging table begins thrashing and threatens to spit on you if you don't remove the cuffs.`,
            tactics: [
                {
                    name: "Remove Cuffs",
                    desc: "Unlock the cuffs to appease the patient.",
                    success: false,
                    failureMessage: "The inmate uses the freed hand to assault the armed guard. Shots fired in the department. Catastrophic hazard.",
                    style: "rose"
                },
                {
                    name: "Defer to Guard",
                    desc: "Step back and defer entirely to the armed escort officer.",
                    success: true,
                    nextPrompt: "The officer steps forward and tells the inmate to settle down. The inmate glares at you. 'You're lucky he's here.'",
                    style: "indigo"
                },
                {
                    name: "Threaten Inmate",
                    desc: "Tell the inmate you will have them put in solitary confinement.",
                    success: false,
                    failureMessage: "Threatening an inmate provokes them. They spit directly in your face. Bloodborne pathogen exposure.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_autism_overload",
            prompt: `An adult patient with severe autism drops to the floor and starts rocking violently due to the noise of the MRI department.`,
            tactics: [
                {
                    name: "Forcible Lift",
                    desc: "Grab their arms and try to pull them to their feet.",
                    success: false,
                    failureMessage: "Forcible physical contact during sensory overload triggers a violent meltdown. You are injured. Fail.",
                    style: "rose"
                },
                {
                    name: "Dim Lights & Offer Headphones",
                    desc: "Clear the area, dim the lights, and gently offer noise-canceling headphones.",
                    success: true,
                    nextPrompt: "The patient puts on the headphones and slowly stops rocking. They point to the MRI room.",
                    style: "indigo"
                },
                {
                    name: "Loudly Command",
                    desc: "Yell over the noise for them to stand up.",
                    success: false,
                    failureMessage: "Adding more loud noise worsens the sensory overload. The patient runs out of the department in a panic.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_active_anaphylaxis",
            prompt: `A patient receiving iodine suddenly gasps, grabs their throat, and starts thrashing in a panic as their airway swells.`,
            tactics: [
                {
                    name: "Verbal De-escalation",
                    desc: "Tell them to calm down and take deep breaths.",
                    success: false,
                    failureMessage: "This is a medical emergency, not a behavioral one. The patient's airway closes completely. Cardiac arrest.",
                    style: "rose"
                },
                {
                    name: "Code Blue & Epi",
                    desc: "Immediately call a Code Blue and prepare epinephrine.",
                    success: true,
                    nextPrompt: "The code team arrives. The patient is administered epinephrine but is highly confused and agitated. 'What happened?'",
                    style: "indigo"
                },
                {
                    name: "Offer Water",
                    desc: "Offer them a cup of water to help clear their throat.",
                    success: false,
                    failureMessage: "Giving fluids to a patient with a compromised airway causes massive aspiration. Lethal outcome.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_deaf_combative",
            prompt: `A profoundly deaf patient who cannot read lips becomes highly combative when you try to physically position them, believing they are being attacked.`,
            tactics: [
                {
                    name: "Restrain forcefully",
                    desc: "Call for help to hold them down so you can position them.",
                    success: false,
                    failureMessage: "Restraining a confused, deaf patient causes immense trauma. They fight back, resulting in a fractured wrist. Lawsuit.",
                    style: "rose"
                },
                {
                    name: "Step Back & Whiteboard",
                    desc: "Step into their field of vision, smile, and offer a whiteboard with instructions.",
                    success: true,
                    nextPrompt: "The patient reads the whiteboard and visibly relaxes. They sign 'Thank you'.",
                    style: "indigo"
                },
                {
                    name: "Speak Louder",
                    desc: "Yell the instructions very loudly right next to their ear.",
                    success: false,
                    failureMessage: "The patient is profoundly deaf. Yelling does nothing but look aggressive. They slap you away. Fail.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_intoxicated_vomiting",
            prompt: `An intoxicated trauma patient strapped to a backboard starts vomiting forcefully and panicking as they choke.`,
            tactics: [
                {
                    name: "Tell Them to Hold Still",
                    desc: "Command them to stop moving so you don't ruin the C-spine precautions.",
                    success: false,
                    failureMessage: "The patient aspirates their vomit into their lungs. Severe aspiration pneumonia and possible death. Malpractice.",
                    style: "rose"
                },
                {
                    name: "Log-Roll Immediately",
                    desc: "With assistance, immediately log-roll the patient and backboard to clear the airway.",
                    success: true,
                    nextPrompt: "The airway is clear. The patient is coughing, crying, and struggling against the straps. 'Get these off me!'",
                    style: "indigo"
                },
                {
                    name: "Run for Help",
                    desc: "Run out of the room to find the ER doctor.",
                    success: false,
                    failureMessage: "Leaving a vomiting, strapped-down patient alone guarantees aspiration. Catastrophic outcome.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_gang_trauma",
            prompt: `Two rival gang members are in the trauma bay. One sees the other and tries to leap off the stretcher to attack them despite a broken leg.`,
            tactics: [
                {
                    name: "Physically Intervene",
                    desc: "Step between the two patients and push them apart.",
                    success: false,
                    failureMessage: "You are severely injured in the ensuing brawl. Never put yourself in the middle of a violent conflict. Code Silver.",
                    style: "rose"
                },
                {
                    name: "Retreat & Call Security",
                    desc: "Back away to safety and immediately call security/police.",
                    success: true,
                    nextPrompt: "Security arrives and separates the patients. Your patient is furious. 'Why did you call the cops on me?!'",
                    style: "indigo"
                },
                {
                    name: "Yell Commands",
                    desc: "Yell at them to respect the hospital and lie down.",
                    success: false,
                    failureMessage: "They ignore you completely. The altercation escalates into a weapon being drawn. Extreme hazard.",
                    style: "amber"
                }
            ]
        },
        {
            id: "scenario_ama_refusal",
            prompt: `A patient with a massive, actively bleeding aneurysm suddenly decides they want to go outside to smoke and tries to rip out their IV lines.`,
            tactics: [
                {
                    name: "Let Them Go",
                    desc: "Tell them it's their right to leave and open the door for them.",
                    success: false,
                    failureMessage: "Allowing a patient with altered mental status and a lethal bleed to walk out without physician intervention is negligence. They die in the parking lot.",
                    style: "rose"
                },
                {
                    name: "Gravity & Physician",
                    desc: "Explain the lethal reality of their choice with gravity while alerting the trauma physician.",
                    success: true,
                    nextPrompt: "The patient stops pulling the IV but is highly agitated. 'I don't care, I need a cigarette right now!'",
                    style: "indigo"
                },
                {
                    name: "Physically Block Door",
                    desc: "Stand in front of the door and physically push them back to bed.",
                    success: false,
                    failureMessage: "Physically detaining an adult patient without a proper hold order is false imprisonment. You are assaulted and sued.",
                    style: "amber"
                }
            ]
        }
    ],

    // Module 4: EHR Legal Auditor
    ehrScenarios: [
        "Document the incident where the patient pulled out their IV.",
        "Document an incident where a patient slipped and fell while transitioning from a wheelchair to the X-ray table.",
        "Document a scenario where a patient refused to drink the oral barium contrast.",
        "Document a situation where an outpatient arrived 2 hours late and began swearing at the front desk.",
        "Document an incident where the power injector extravasated 50mL of IV contrast into the patient's forearm."
    ],
    ehrDictionary: {
        subjective: [
            "angry", "crazy", "refused", "combative", "drunk", "violent", 
            "uncooperative", "nasty", "stupid", "yelled", "freaked out", "mad", "agitated",
            "clumsy", "belligerent", "stubborn", "furious", "unstable", "hysterical", "careless",
            "noncompliant", "obnoxious"
        ],
        objective: [
            "stated", "loud volume", "exited", "removed IV", "stood up", 
            "declined", "did not consent", "blood pressure increased", "pacing", "crying",
            "found on floor", "smell of alcohol", "swelling observed", "erythema", "18 gauge needle",
            "50mL infiltrated", "physician notified", "vital signs taken", "elevated arm", "applied cold compress"
        ]
    }
};
