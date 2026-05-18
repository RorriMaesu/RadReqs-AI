// ==========================================
// DATA STRUCTURE: The Medical Dictionary
// ==========================================
// The dictionary array is now loaded from data.js

// ==========================================
// CONTENT ARRAYS
// ==========================================
let currentWbChallenge = null;

// ==========================================
// LOOKUP TABLES
// ==========================================
const EXAMPLES = {
    // Cardiovascular
    'cardi/o': ['cardiology', 'cardiomegaly', 'tachycardia'],
    'angi/o': ['angioplasty', 'angiogram', 'angiectomy'],
    'arteri/o': ['arteriosclerosis', 'arteriotomy'],
    'ather/o': ['atherosclerosis', 'atherectomy'],
    'phleb/o': ['phlebotomy', 'phlebitis'],
    'ven/o': ['venogram', 'venectomy'],
    'hem/o': ['hematology', 'hemorrhage', 'hematoma'],
    'hemat/o': ['hematology', 'hematuria', 'hematoma'],
    'thromb/o': ['thrombosis', 'thrombectomy', 'thrombolysis'],
    'aort/o': ['aortogram', 'aortic stenosis'],
    // Respiratory
    'bronch/o': ['bronchitis', 'bronchoscopy', 'bronchospasm'],
    'pneum/o': ['pneumonia', 'pneumothorax'],
    'pneumon/o': ['pneumonitis', 'pneumonectomy'],
    'pulmon/o': ['pulmonology', 'pulmonary embolism'],
    'trache/o': ['tracheotomy', 'tracheitis'],
    'rhin/o': ['rhinitis', 'rhinoplasty', 'rhinorrhea'],
    'laryng/o': ['laryngitis', 'laryngoscopy'],
    'pharyng/o': ['pharyngitis', 'pharyngoscopy'],
    'pleur/o': ['pleuritis', 'pleurectomy'],
    // Digestive
    'hepat/o': ['hepatitis', 'hepatomegaly', 'hepatectomy'],
    'gastr/o': ['gastritis', 'gastroscopy', 'gastropathy'],
    'enter/o': ['enteritis', 'enteroscopy'],
    'col/o': ['colitis', 'colonoscopy', 'colectomy'],
    'cholecyst/o': ['cholecystitis', 'cholecystectomy'],
    'esophag/o': ['esophagitis', 'esophagoscopy'],
    'pancreat/o': ['pancreatitis', 'pancreatectomy'],
    'stomat/o': ['stomatitis', 'stomatology'],
    'proct/o': ['proctoscopy', 'proctitis'],
    // Nervous
    'neur/o': ['neurology', 'neuritis', 'neuropathy'],
    'encephal/o': ['encephalitis', 'encephalopathy'],
    'myel/o': ['myelitis', 'myelopathy', 'myelocyte'],
    'cerebell/o': ['cerebellar atrophy', 'cerebellitis'],
    'cerebr/o': ['cerebrovascular accident', 'cerebral cortex'],
    'psych/o': ['psychiatry', 'psychology', 'psychosis'],
    // Musculoskeletal
    'arthr/o': ['arthritis', 'arthroscopy', 'arthroplasty'],
    'oste/o': ['osteoporosis', 'osteomyelitis', 'ostectomy'],
    'my/o': ['myalgia', 'myopathy', 'myositis'],
    'tendin/o': ['tendinitis', 'tendinopathy'],
    'chondr/o': ['chondritis', 'chondroplasty'],
    'cost/o': ['intercostal', 'costalgia'],
    'vertebr/o': ['vertebroplasty', 'vertebral'],
    // Urinary
    'nephr/o': ['nephritis', 'nephrectomy', 'nephrology'],
    'ren/o': ['renal', 'renovascular'],
    'ur/o': ['urology', 'urogram'],
    'urethr/o': ['urethritis', 'urethroplasty'],
    'cyst/o': ['cystitis', 'cystoscopy', 'cystectomy'],
    // Reproductive
    'gyn/o': ['gynecology', 'gynecologist'],
    'hyster/o': ['hysterectomy', 'hysteroscopy'],
    'oophor/o': ['oophoritis', 'oophorectomy'],
    'orchid/o': ['orchiditis', 'orchidectomy'],
    'salping/o': ['salpingitis', 'salpingectomy'],
    // Blood/Immune
    'leuk/o': ['leukemia', 'leukocyte', 'leukopenia'],
    'erythr/o': ['erythrocyte', 'erythropenia'],
    'splen/o': ['splenomegaly', 'splenectomy'],
    'lymph/o': ['lymphoma', 'lymphocyte', 'lymphedema'],
    // Endocrine
    'thyr/o': ['thyroiditis', 'thyrotoxicosis'],
    'thyroid/o': ['thyroidectomy', 'thyroiditis'],
    'adren/o': ['adrenalitis', 'adrenomegaly'],
    // Integumentary
    'derm/o': ['dermatitis', 'dermoscopy'],
    'dermat/o': ['dermatitis', 'dermatology', 'dermoscopy'],
    'onych/o': ['onychomycosis', 'onychectomy'],
    // Special Senses
    'ophthalm/o': ['ophthalmology', 'ophthalmoscopy'],
    'ocul/o': ['ocular', 'oculomotor'],
    'ot/o': ['otitis', 'otoscopy', 'otolaryngology'],
    'audi/o': ['audiology', 'audiogram'],
    // Common Prefixes
    'brady-': ['bradycardia', 'bradypnea', 'bradykinesia'],
    'tachy-': ['tachycardia', 'tachypnea'],
    'poly-': ['polyuria', 'polyneuritis', 'polycythemia'],
    'hyper-': ['hypertension', 'hyperglycemia', 'hyperthyroidism'],
    'hypo-': ['hypotension', 'hypoglycemia', 'hypothyroidism'],
    'intra-': ['intravenous', 'intramuscular', 'intraocular'],
    'peri-': ['pericarditis', 'periosteum', 'peripheral'],
    'sub-': ['subcutaneous', 'sublingual', 'subacute'],
    'trans-': ['transdermal', 'transfusion'],
    'bi-': ['bilateral', 'bifurcation'],
    'hemi-': ['hemiplegia', 'hemiparesis'],
    'micro-': ['microscopy', 'microcyte', 'microorganism'],
    'macro-': ['macrocyte', 'macroscopic'],
    'neo-': ['neoplasm', 'neonatal'],
    'anti-': ['antibiotics', 'antiviral'],
    'dys-': ['dyspnea', 'dysphagia', 'dysuria'],
    // Common Suffixes
    '-itis': ['hepatitis', 'bronchitis', 'arthritis'],
    '-ectomy': ['appendectomy', 'hysterectomy', 'cholecystectomy'],
    '-oscopy': ['endoscopy', 'colonoscopy', 'arthroscopy'],
    '-plasty': ['rhinoplasty', 'arthroplasty', 'angioplasty'],
    '-logy': ['cardiology', 'neurology', 'dermatology'],
    '-ology': ['cardiology', 'hematology', 'oncology'],
    '-oma': ['carcinoma', 'lymphoma', 'hematoma'],
    '-osis': ['fibrosis', 'thrombosis', 'cirrhosis'],
    '-algia': ['neuralgia', 'myalgia', 'arthralgia'],
    '-pathy': ['neuropathy', 'cardiomyopathy', 'hepatopathy'],
    '-rrhea': ['diarrhea', 'rhinorrhea', 'amenorrhea'],
    '-rrhage': ['hemorrhage', 'menorrhagia'],
    '-stomy': ['colostomy', 'tracheostomy', 'ileostomy'],
    '-tomy': ['craniotomy', 'phlebotomy', 'laparotomy'],
    '-gram': ['electrocardiogram', 'mammogram', 'angiogram'],
    '-graph': ['electrocardiograph', 'mammograph'],
    '-meter': ['spirometer', 'thermometer'],
    '-megaly': ['hepatomegaly', 'splenomegaly', 'cardiomegaly'],
    '-penia': ['leukopenia', 'thrombocytopenia'],
    '-trophy': ['hypertrophy', 'atrophy'],
    '-plegia': ['hemiplegia', 'quadriplegia'],
    '-paresis': ['hemiparesis', 'paraparesis'],
    '-uria': ['hematuria', 'polyuria', 'glucosuria'],
    '-emia': ['anemia', 'septicemia', 'leukemia'],
};

const SYSTEM_COLORS = {
    'Cardiovascular':  '#ef4444',
    'Nervous':         '#8b5cf6',
    'Digestive':       '#f59e0b',
    'Respiratory':     '#0ea5e9',
    'Musculoskeletal': '#f97316',
    'Urinary':         '#eab308',
    'Reproductive':    '#ec4899',
    'Blood/Immune':    '#f43f5e',
    'Endocrine':       '#84cc16',
    'Integumentary':   '#14b8a6',
    'Special Senses':  '#6366f1',
    'Foundations':     '#64748b',
    'Prefixes':        '#06b6d4',
    'Suffixes':        '#a855f7',
};

// ==========================================
// GAMIFICATION CONSTANTS
// ==========================================
const LEVELS = [
    { level: 1,  title: 'Pre-Med Student',        xpRequired: 0      },
    { level: 2,  title: 'First-Year Student',      xpRequired: 200    },
    { level: 3,  title: 'Second-Year Student',     xpRequired: 500    },
    { level: 4,  title: 'Third-Year Student',      xpRequired: 1000   },
    { level: 5,  title: 'Fourth-Year Student',     xpRequired: 1800   },
    { level: 6,  title: 'Medical Intern',          xpRequired: 3000   },
    { level: 7,  title: 'Junior Resident',         xpRequired: 4800   },
    { level: 8,  title: 'Senior Resident',         xpRequired: 7200   },
    { level: 9,  title: 'Chief Resident',          xpRequired: 10500  },
    { level: 10, title: 'Clinical Fellow',         xpRequired: 15000  },
    { level: 11, title: 'Attending Physician',     xpRequired: 21000  },
    { level: 12, title: 'Senior Attending',        xpRequired: 29000  },
    { level: 13, title: 'Department Director',     xpRequired: 40000  },
    { level: 14, title: 'Clinical Professor',      xpRequired: 56000  },
    { level: 15, title: 'Medical School Dean',     xpRequired: 78000  },
    { level: 16, title: 'Distinguished Professor', xpRequired: 108000 },
    { level: 17, title: 'Legacy Master',           xpRequired: 150000 },
];

const ACHIEVEMENTS = [
    { id: 'first_steps',      label: 'First Steps',          desc: 'Complete your first flashcard review',             icon: 'fa-solid fa-shoe-prints',       xp: 10,   color: '#14b8a6' },
    { id: 'word_weaver',      label: 'Word Weaver',          desc: 'Build your first correct word',                    icon: 'fa-solid fa-puzzle-piece',      xp: 10,   color: '#0ea5e9' },
    { id: 'chart_reader',     label: 'Chart Reader',         desc: 'Complete your first Chart Decrypter answer',       icon: 'fa-solid fa-file-medical',      xp: 10,   color: '#6366f1' },
    { id: 'speed_speller',    label: 'Speed Speller',        desc: 'Get your first Pluralization answer correct',      icon: 'fa-solid fa-spell-check',       xp: 10,   color: '#a855f7' },
    { id: 'code_cracker',     label: 'Code Cracker',         desc: 'Decode your first abbreviation',                   icon: 'fa-solid fa-bolt',              xp: 10,   color: '#f59e0b' },
    { id: 'hundred_club',     label: 'Hundred Club',         desc: 'Master 100 terms (interval ≥ 7)',                  icon: 'fa-solid fa-ranking-star',      xp: 50,   color: '#f97316' },
    { id: 'half_mastered',    label: 'Halfway There',        desc: 'Master 500 terms',                                 icon: 'fa-solid fa-trophy',            xp: 150,  color: '#eab308' },
    { id: 'full_mastery',     label: 'Complete Mastery',     desc: 'Master all terms in the dictionary',               icon: 'fa-solid fa-crown',             xp: 500,  color: '#ef4444' },
    { id: 'habit_3',          label: 'Three-Day Habit',      desc: '3-day study streak',                               icon: 'fa-solid fa-fire',              xp: 30,   color: '#f97316' },
    { id: 'week_warrior',     label: 'Week Warrior',         desc: '7-day study streak',                               icon: 'fa-solid fa-fire-flame-curved', xp: 50,   color: '#ef4444' },
    { id: 'fortnight_focus',  label: 'Fortnight Focus',      desc: '14-day study streak',                              icon: 'fa-solid fa-calendar-check',    xp: 75,   color: '#8b5cf6' },
    { id: 'monthly_devotion', label: 'Monthly Devotion',     desc: '30-day study streak',                              icon: 'fa-solid fa-medal',             xp: 150,  color: '#06b6d4' },
    { id: 'sixty_strong',     label: 'Sixty Days Strong',    desc: '60-day study streak',                              icon: 'fa-solid fa-shield-halved',     xp: 200,  color: '#0ea5e9' },
    { id: 'quarterly',        label: 'Quarterly Commitment', desc: '90-day study streak',                              icon: 'fa-solid fa-star',              xp: 300,  color: '#eab308' },
    { id: 'year_medicine',    label: 'Year of Medicine',     desc: '365-day study streak',                             icon: 'fa-solid fa-graduation-cap',    xp: 1000, color: '#14b8a6' },
    { id: 'perfectionist',    label: 'Perfectionist',        desc: '100% accuracy in a flashcard session (10+ cards)', icon: 'fa-solid fa-bullseye',          xp: 50,   color: '#10b981' },
    { id: 'on_a_roll',        label: 'On a Roll',            desc: '10 consecutive correct flashcard reviews',         icon: 'fa-solid fa-bolt-lightning',    xp: 30,   color: '#eab308' },
    { id: 'clinical_clarity', label: 'Clinical Clarity',     desc: '90%+ accuracy in a Chart Decrypter session',      icon: 'fa-solid fa-stethoscope',       xp: 50,   color: '#6366f1' },
    { id: 'rising_star',      label: 'Rising Star',          desc: 'Reach Level 5 — Fourth-Year Student',             icon: 'fa-solid fa-star-half-stroke',  xp: 50,   color: '#a855f7' },
    { id: 'intern_life',      label: 'Intern Life',          desc: 'Reach Level 6 — Medical Intern',                  icon: 'fa-solid fa-user-doctor',       xp: 75,   color: '#06b6d4' },
    { id: 'doctor_is_in',     label: 'The Doctor Is In',     desc: 'Reach Level 11 — Attending Physician',            icon: 'fa-solid fa-stethoscope',       xp: 200,  color: '#14b8a6' },
    { id: 'early_bird',       label: 'Early Bird',           desc: 'Complete a study session before 7 AM',             icon: 'fa-solid fa-sun',               xp: 25,   color: '#f59e0b' },
    { id: 'night_owl',        label: 'Night Owl',            desc: 'Complete a study session after 11 PM',             icon: 'fa-solid fa-moon',              xp: 25,   color: '#6366f1' },
    { id: 'comeback_kid',     label: 'Comeback Kid',         desc: 'Return after a 3+ day absence',                    icon: 'fa-solid fa-rotate-right',      xp: 20,   color: '#14b8a6' },
    { id: 'dedicated',        label: 'Dedicated',            desc: 'Complete all daily quests 7 days running',         icon: 'fa-solid fa-calendar-days',     xp: 100,  color: '#8b5cf6' },
];

const QUEST_TEMPLATES = [
    { id: 'review_10',      category: 'volume',      label: 'Review 10 flashcards',                 target: 10, xpReward: 20, field: 'fcReviewed'      },
    { id: 'review_25',      category: 'volume',      label: 'Review 25 flashcards',                 target: 25, xpReward: 40, field: 'fcReviewed'      },
    { id: 'wb_5',           category: 'volume',      label: 'Complete 5 Word Builder challenges',   target: 5,  xpReward: 30, field: 'wbCompleted'     },
    { id: 'ad_10',          category: 'volume',      label: 'Decode 10 abbreviations',              target: 10, xpReward: 25, field: 'adCompleted'     },
    { id: 'pl_8',           category: 'volume',      label: 'Complete 8 Pluralization terms',       target: 8,  xpReward: 20, field: 'plCompleted'     },
    { id: 'new_3',          category: 'mastery',     label: 'Learn 3 new terms today',              target: 3,  xpReward: 40, field: 'newLearned'      },
    { id: 'review_overdue', category: 'mastery',     label: 'Review 5 overdue flashcards',          target: 5,  xpReward: 35, field: 'overdueReviewed' },
    { id: 'use_tutor_2',    category: 'exploration', label: 'Ask the AI Tutor 2 questions',         target: 2,  xpReward: 20, field: 'tutorMessages'   },
    { id: 'use_tutor_5',    category: 'exploration', label: 'Ask the AI Tutor 5 questions',         target: 5,  xpReward: 35, field: 'tutorMessages'   },
    { id: 'chart_5',        category: 'exploration', label: 'Answer 5 Chart Decrypter questions',   target: 5,  xpReward: 30, field: 'cdAnswered'      },
];

const chartSentences = [
    { system: 'Digestive',       text: "The patient presented with severe <strong>hepatomegaly</strong> upon physical examination.", answer: "enlarged liver", fallback: "liver enlargement" },
    { system: 'Digestive',       text: "Due to chronic gallstones, the surgeon recommended a <strong>cholecystectomy</strong>.", answer: "surgical removal of the gallbladder", fallback: "gallbladder removal" },
    { system: 'Cardiovascular',  text: "ECG results indicate the presence of <strong>bradycardia</strong>.", answer: "slow heart", fallback: "slow heart rate" },

    // New Advanced Scenarios (SOAP Notes)
    { system: 'Respiratory',     text: "<strong>SUBJECTIVE:</strong> Patient reports severe SOB. <br><strong>OBJECTIVE:</strong> Patient displays obvious <strong>tachypnea</strong> at rest.", answer: "fast breathing", fallback: "rapid breathing" },
    { system: 'Nervous',         text: "<strong>ASSESSMENT:</strong> MRI confirms a diagnosis of <strong>encephalopathy</strong>.", answer: "disease of the brain", fallback: "brain disease" },
    { system: 'Musculoskeletal', text: "<strong>PLAN:</strong> Schedule physical therapy for severe <strong>osteomalacia</strong>.", answer: "softening of the bone", fallback: "bone softening" },
    { system: 'Musculoskeletal', text: "<strong>OBJECTIVE:</strong> Observation reveals acute <strong>arthritis</strong> in the left knee.", answer: "inflammation of the joint", fallback: "joint inflammation" },
    { system: 'Nervous',         text: "<strong>SUBJECTIVE:</strong> Patient complains of intense <strong>neuralgia</strong> radiating down the leg.", answer: "nerve pain", fallback: "pain in the nerve" },
    { system: 'Respiratory',     text: "<strong>ASSESSMENT:</strong> Symptoms are consistent with acute <strong>bronchitis</strong>.", answer: "inflammation of the bronchus", fallback: "bronchus inflammation" },
    { system: 'Respiratory',     text: "<strong>PLAN:</strong> Prescribe broad-spectrum antibiotics to treat the <strong>pneumonitis</strong>.", answer: "inflammation of the lung", fallback: "lung inflammation" },

    // Additional clinical scenarios
    { system: 'Blood/Immune',    text: "Imaging reveals significant <strong>splenomegaly</strong> consistent with portal hypertension.", answer: "enlargement of the spleen", fallback: "enlarged spleen" },
    { system: 'Urinary',         text: "The nephrologist diagnosed the patient with acute <strong>nephritis</strong>.", answer: "inflammation of the kidney", fallback: "kidney inflammation" },
    { system: 'Integumentary',   text: "The dermatologist noted patches of <strong>dermatitis</strong> on both forearms.", answer: "inflammation of the skin", fallback: "skin inflammation" },
    { system: 'Musculoskeletal', text: "<strong>PLAN:</strong> Patient will undergo <strong>arthroscopy</strong> of the left knee next week.", answer: "visual examination of a joint", fallback: "joint examination" },
    { system: 'Musculoskeletal', text: "The patient reports chronic <strong>myalgia</strong> in the lower extremities.", answer: "muscle pain", fallback: "pain in the muscle" },
    { system: 'Foundations',     text: "Biopsy results confirm a diagnosis of <strong>carcinoma</strong> in situ.", answer: "cancerous tumor", fallback: "cancer" },
    { system: 'Urinary',         text: "Lab results show elevated creatinine, consistent with <strong>nephropathy</strong>.", answer: "disease of the kidney", fallback: "kidney disease" },
    { system: 'Respiratory',     text: "<strong>SUBJECTIVE:</strong> Patient complains of persistent <strong>rhinorrhea</strong> and sneezing.", answer: "discharge from the nose", fallback: "runny nose" },
    { system: 'Nervous',         text: "<strong>ASSESSMENT:</strong> EEG findings suggest temporal lobe <strong>encephalitis</strong>.", answer: "inflammation of the brain", fallback: "brain inflammation" },
    { system: 'Digestive',       text: "Post-op note: <strong>cholecystitis</strong> confirmed intraoperatively.", answer: "inflammation of the gallbladder", fallback: "gallbladder inflammation" },
    { system: 'Endocrine',       text: "The patient was started on insulin therapy for <strong>hyperglycemia</strong>.", answer: "excessive sugar in the blood", fallback: "high blood sugar" },
    { system: 'Digestive',       text: "<strong>PLAN:</strong> Schedule follow-up four weeks after <strong>appendectomy</strong>.", answer: "surgical removal of the appendix", fallback: "appendix removal" },
    { system: 'Cardiovascular',  text: "Imaging shows moderate <strong>cardiomegaly</strong> with preserved ejection fraction.", answer: "enlargement of the heart", fallback: "enlarged heart" },
    { system: 'Musculoskeletal', text: "The patient has a long-standing diagnosis of <strong>osteoporosis</strong>.", answer: "decreased bone density", fallback: "porous bones" },
    { system: 'Nervous',         text: "Neurological exam reveals <strong>hemiplegia</strong> on the left side.", answer: "paralysis of one side of the body", fallback: "one-sided paralysis" },
    { system: 'Urinary',         text: "Urine dipstick is positive for <strong>hematuria</strong>.", answer: "blood in the urine", fallback: "blood in urine" },
    { system: 'Cardiovascular',  text: "<strong>OBJECTIVE:</strong> Patient presents with signs of <strong>thrombosis</strong> in the left femoral vein.", answer: "formation of a blood clot", fallback: "blood clot" },
    { system: 'Special Senses',  text: "Patient referred to <strong>ophthalmology</strong> for progressive vision loss.", answer: "study of the eye", fallback: "eye specialist" },
    { system: 'Respiratory',     text: "<strong>ASSESSMENT:</strong> Pulmonary function tests confirm significant <strong>dyspnea</strong> on exertion.", answer: "difficulty breathing", fallback: "difficult breathing" },
    { system: 'Blood/Immune',    text: "The CBC shows severe <strong>leukopenia</strong> requiring immediate intervention.", answer: "deficiency of white blood cells", fallback: "low white blood cells" }
];

// ==========================================
// APP STATE
// ==========================================
let state = {
    activeSystem: 'All',
    streak: 0,
    intervals: {}, // ID -> interval mappings
    
    // Feature A
    flashcards: [],
    fcIndex: 0,
    fcFlipped: false,
    newCardsLearnedToday: 0,

    // Feature B
    wbChallengeIndex: 0,
    wbSlots: { prefix: null, root1: null, root2: null, suffix: null },
    
    // Feature C
    cdIndex: 0,
    cdOrder: [],      // shuffled index array into chartSentences
    cdCorrect: 0,     // first-attempt correct count for this session
    cdAttempts: 0,    // wrong attempts on the current card
    
    // Feature D
    adIndex: 0,

    // Feature E (Pluralization)
    plIndex: 0,

    // Flashcard enhancements
    reverseMode: false,
    dueDates: {},
    easeFactors: {}, // SM-2 per-card difficulty multiplier (default 2.5)
    lapses: {},      // id -> cumulative error count
    sessionCorrect: 0,
    sessionTotal: 0,

    // Feature G: AI Tutor
    chatHistory: [],

    // Feature H: Theme
    darkMode: true,

    // Gamification state
    wbAttempts: 0,
    adAttempts: 0,
    plConsecutiveCorrect: 0,
    sessionXP: 0,
    sessionConsecutiveCorrect: 0,
};

// ==========================================
// GAMIFICATION MODULE VARS
// ==========================================
let xpData           = { total: 0, level: 1, dailyXP: {}, dailyFcXP: {}, dailyActivities: {} };
let achievementsData = { unlocked: [], unlockedDates: {} };
let dailyQuestsData  = { date: '', quests: [] };
let statsData        = { totalReviews: 0, totalCorrect: 0, wbChallenges: 0, wbCorrect: 0, cdAnswered: 0, cdCorrect: 0, adAnswered: 0, adCorrect: 0, plAnswered: 0, plCorrect: 0 };
// (extra closing brace removed — state obj now ends above)

const SYSTEMS = ['All', 'Prefixes', 'Suffixes (Surgical)', 'Suffixes (Diagnostic)', 'Suffixes (Pathological)', 'Cardiovascular', 'Digestive', 'Respiratory', 'Nervous', 'Musculoskeletal', 'Integumentary', 'Endocrine', 'Urinary', 'Reproductive', 'Blood/Immune', 'Special Senses', 'Foundations', 'Abbreviations'];

function renderSystemMenu() {
    const pillMenu = document.getElementById('system-pill-menu');
    const mobileMenu = document.getElementById('system-filter-mobile');
    const sidebarList = document.getElementById('system-sidebar-list');

    if (pillMenu) pillMenu.innerHTML = '';
    if (mobileMenu) mobileMenu.innerHTML = '';
    if (sidebarList) sidebarList.innerHTML = '';

    SYSTEMS.forEach(sys => {
        // Pill (kept for compatibility, element no longer in DOM)
        if (pillMenu) {
            const btn = document.createElement('button');
            btn.className = `px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${sys === state.activeSystem ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`;
            btn.textContent = sys;
            btn.onclick = () => setActiveSystem(sys);
            pillMenu.appendChild(btn);
        }
        // Mobile dropdown
        if (mobileMenu) {
            const opt = document.createElement('option');
            opt.value = sys;
            opt.textContent = sys;
            if (sys === state.activeSystem) opt.selected = true;
            mobileMenu.appendChild(opt);
        }
        // Desktop sidebar list
        if (sidebarList) {
            const btn = document.createElement('button');
            const isActive = sys === state.activeSystem;
            btn.className = `w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`;
            btn.textContent = sys;
            btn.onclick = () => setActiveSystem(sys);
            sidebarList.appendChild(btn);
        }
    });
}

function setActiveSystem(sys) {
    state.activeSystem = sys;
    renderSystemMenu();
    renderFlashcards();
}

// ==========================================
// INITIALIZATION & DATA MIGRATION
// ==========================================
(function migrateLocalStorage() {
    const keys = ['progress', 'lapses', 'duedates', 'ease', 'streak', 'darkmode', 'xp', 'achievements', 'daily_quests', 'stats'];
    keys.forEach(k => {
        const oldVal = localStorage.getItem('medterm_' + k);
        if (oldVal !== null && localStorage.getItem('syngnosia_' + k) === null) {
            localStorage.setItem('syngnosia_' + k, oldVal);
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyDarkMode(state.darkMode);
    renderSystemMenu();
    setupEventListeners();
    switchTab('flashcards');
    renderFlashcards();
    renderWordBuilder();
    restartCd();
    renderAbbrevDecoder();
    renderPluralization();
    checkOllamaStatus();
    setupSuggestionChips();
});

function loadState() {
    // Spaced Repetition Data
    const savedIntervals = localStorage.getItem('syngnosia_progress');
    if (savedIntervals) state.intervals = JSON.parse(savedIntervals);
    
    // Lapse/Error Data
    const savedLapses = localStorage.getItem('syngnosia_lapses');
    if (savedLapses) state.lapses = JSON.parse(savedLapses);
    else state.lapses = {};

    // Due Date Data (time-based SRS scheduling)
    const savedDueDates = localStorage.getItem('syngnosia_duedates');
    if (savedDueDates) state.dueDates = JSON.parse(savedDueDates);
    else state.dueDates = {};

    // Ease Factor Data (SM-2 per-card difficulty multiplier, default 2.5)
    const savedEase = localStorage.getItem('syngnosia_ease');
    if (savedEase) state.easeFactors = JSON.parse(savedEase);
    else state.easeFactors = {};
    
    // Seeded Shuffle: stable per-day order using a proper Fisher-Yates + seeded PRNG.
    // Math.sin-based LCG gives a reproducible sequence; Fisher-Yates guarantees
    // a uniform distribution (unlike the biased .sort(random) anti-pattern).
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const seededRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    for (let i = dictionary.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [dictionary[i], dictionary[j]] = [dictionary[j], dictionary[i]];
    }
    
    dictionary.forEach(term => {
        term.interval = state.intervals[term.id] || 0;
        term.errorCount = state.lapses[term.id] || 0;
    });

    // Daily Streak & Limits Logic
    const streakDataStr = localStorage.getItem('syngnosia_streak');
    
    if (streakDataStr) {
        const streakData = JSON.parse(streakDataStr);
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (streakData.lastDate === today) {
            state.streak = streakData.count; // Already visited today
            state.newCardsLearnedToday = streakData.newLearned || 0;
        } else if (streakData.lastDate === yesterday.toDateString()) {
            state.streak = streakData.count + 1; // Consecutive day
            state.newCardsLearnedToday = 0;
            saveStreak(today, state.streak, 0);
        } else {
            // Check for streak shield before breaking
            loadGamificationData(); // ensure xpData loaded before checking shields
            if ((xpData.streakShields || 0) > 0) {
                xpData.streakShields--;
                saveXPData();
                state.streak = streakData.count; // Preserve streak via shield
                state.newCardsLearnedToday = 0;
                saveStreak(today, state.streak, 0);
            } else {
                // Check if this is a comeback (3+ day absence)
                const lastDate = new Date(streakData.lastDate);
                const diffDays = Math.floor((new Date(today) - lastDate) / 86400000);
                if (diffDays >= 3) {
                    setTimeout(() => checkAchievements('comeback', {}), 500);
                }
                state.streak = 1; // Streak broken
                state.newCardsLearnedToday = 0;
                saveStreak(today, state.streak, 0);
            }
        }
    } else {
        state.streak = 1; // First visit
        state.newCardsLearnedToday = 0;
        saveStreak(today, state.streak, 0);
    }
    
    document.getElementById('streak-counter').textContent = state.streak;
    updateMasteryProgress();
    loadGamificationData();
    updateXPBar();
    updateShieldIndicator(xpData.streakShields || 0);
    renderQuestWidget();
    checkStreakMilestone(state.streak);

    // Theme preference (default: dark)
    const savedDark = localStorage.getItem('syngnosia_darkmode');
    state.darkMode = savedDark !== null ? savedDark === 'true' : true;
}

function updateMasteryProgress() {
    const totalTerms = dictionary.length;
    // Mastery = seen over multiple weeks (interval >= 7 ≈ 2+ weeks of spaced review)
    const masteredTerms = dictionary.filter(t => t.interval >= 7).length;
    const percentage = Math.round((masteredTerms / totalTerms) * 100);
    
    const textEl = document.getElementById('mastery-text');
    const barEl = document.getElementById('mastery-progress');
    
    if (textEl && barEl) {
        textEl.textContent = `${percentage}%`;
        barEl.style.width = `${percentage}%`;
    }
    checkAchievements('mastery_update', { mastered: masteredTerms });
}

function saveStreak(date, count, newLearned) {
    if (newLearned === undefined) newLearned = state.newCardsLearnedToday;
    localStorage.setItem('syngnosia_streak', JSON.stringify({
        lastDate: date,
        count: count,
        newLearned: newLearned,
        shields: xpData.streakShields || 0,
    }));
}

function saveIntervals() {
    localStorage.setItem('syngnosia_progress', JSON.stringify(state.intervals));
}

function saveLapses() {
    localStorage.setItem('syngnosia_lapses', JSON.stringify(state.lapses));
}

function saveDueDates() {
    localStorage.setItem('syngnosia_duedates', JSON.stringify(state.dueDates));
}

function saveDarkMode() {
    localStorage.setItem('syngnosia_darkmode', state.darkMode);
}

function applyDarkMode(isDark) {
    state.darkMode = isDark;
    document.documentElement.classList.toggle('dark', isDark);
    const checkEl = document.getElementById('modal-dark-toggle');
    if (checkEl) checkEl.checked = isDark;
}

function toggleDarkMode() {
    applyDarkMode(!state.darkMode);
    saveDarkMode();
}

function saveEaseFactors() {
    localStorage.setItem('syngnosia_ease', JSON.stringify(state.easeFactors));
}

// ==========================================
// GAMIFICATION ENGINE
// ==========================================
function saveXPData()      { localStorage.setItem('syngnosia_xp', JSON.stringify(xpData)); }
function saveAchievements(){ localStorage.setItem('syngnosia_achievements', JSON.stringify(achievementsData)); }
function saveDailyQuests() { localStorage.setItem('syngnosia_daily_quests', JSON.stringify(dailyQuestsData)); }
function saveStats()       { localStorage.setItem('syngnosia_stats', JSON.stringify(statsData)); }

function loadGamificationData() {
    const savedXP   = localStorage.getItem('syngnosia_xp');
    if (savedXP) xpData = JSON.parse(savedXP);

    const savedAch  = localStorage.getItem('syngnosia_achievements');
    if (savedAch) achievementsData = JSON.parse(savedAch);

    const savedQ    = localStorage.getItem('syngnosia_daily_quests');
    if (savedQ) dailyQuestsData = JSON.parse(savedQ);

    const savedStat = localStorage.getItem('syngnosia_stats');
    if (savedStat) statsData = JSON.parse(savedStat);

    // Refresh daily quests if it's a new day
    const today = new Date().toDateString();
    if (dailyQuestsData.date !== today) generateDailyQuests();
}

function getStreakMultiplier() {
    const s = state.streak;
    if (s >= 100) return 2.0;
    if (s >= 30)  return 1.5;
    if (s >= 7)   return 1.25;
    return 1.0;
}

function getDailyFcXP() {
    const today = new Date().toDateString();
    return (xpData.dailyFcXP && xpData.dailyFcXP[today]) || 0;
}

function awardXP(baseAmount, source) {
    if (baseAmount <= 0) return 0;
    const today = new Date().toDateString();

    // Daily soft-cap for flashcard XP
    let amount = baseAmount;
    if (source === 'flashcard') {
        const fcToday = getDailyFcXP();
        if (fcToday >= 250) {
            amount = Math.round(baseAmount * 0.5);
        }
        xpData.dailyFcXP = xpData.dailyFcXP || {};
        xpData.dailyFcXP[today] = (xpData.dailyFcXP[today] || 0) + amount;
    }

    // Streak multiplier
    const mult = getStreakMultiplier();
    amount = Math.round(amount * mult);

    // Interleaving bonus: +15% per additional activity type used today beyond 1
    xpData.dailyActivities = xpData.dailyActivities || {};
    const todayActs = xpData.dailyActivities[today] || [];
    if (!todayActs.includes(source)) todayActs.push(source);
    xpData.dailyActivities[today] = todayActs;
    const interleavingBonus = Math.max(0, todayActs.length - 1) * 0.15;
    if (interleavingBonus > 0) amount = Math.round(amount * (1 + interleavingBonus));

    xpData.total = (xpData.total || 0) + amount;
    xpData.dailyXP = xpData.dailyXP || {};
    xpData.dailyXP[today] = (xpData.dailyXP[today] || 0) + amount;
    state.sessionXP = (state.sessionXP || 0) + amount;

    const oldLevel = xpData.level || 1;
    checkLevelUp(oldLevel);
    saveXPData();
    updateXPBar();
    showXPGain(amount, mult > 1 ? mult : null);
    return amount;
}

function getLevelFromXP(total) {
    let lvl = LEVELS[0];
    for (const l of LEVELS) {
        if (total >= l.xpRequired) lvl = l;
        else break;
    }
    return lvl;
}

function checkLevelUp(oldLevel) {
    const newLvlObj = getLevelFromXP(xpData.total);
    xpData.level = newLvlObj.level;
    if (newLvlObj.level > oldLevel) {
        showLevelUpModal(oldLevel, newLvlObj);
        checkAchievements('level_up', { level: newLvlObj.level });
    }
}

function showLevelUpModal(oldLevel, newLvlObj) {
    const modal = document.getElementById('modal-levelup');
    if (!modal) return;
    document.getElementById('levelup-level').textContent = `Level ${newLvlObj.level}`;
    document.getElementById('levelup-title').textContent = newLvlObj.title;
    modal.classList.remove('hidden');
}

function closeLevelUpModal() {
    const modal = document.getElementById('modal-levelup');
    if (modal) modal.classList.add('hidden');
}

function updateXPBar() {
    const lvlObj  = getLevelFromXP(xpData.total);
    const nextLvl = LEVELS.find(l => l.level === lvlObj.level + 1);
    let pct = 100;
    if (nextLvl) {
        const range  = nextLvl.xpRequired - lvlObj.xpRequired;
        const earned = xpData.total - lvlObj.xpRequired;
        pct = Math.min(100, Math.round((earned / range) * 100));
    }

    const barEl    = document.getElementById('xp-progress');
    const textEl   = document.getElementById('xp-header-text');
    const levelNum = document.getElementById('level-num');
    const levelTtl = document.getElementById('level-title');

    if (barEl)    barEl.style.width = `${pct}%`;
    if (textEl)   textEl.textContent = `${xpData.total.toLocaleString()} XP`;
    if (levelNum) levelNum.textContent = lvlObj.level;
    if (levelTtl) levelTtl.textContent = lvlObj.title.split(' ').slice(0, 2).join(' ');
}

function showXPGain(amount, multiplier) {
    const container = document.getElementById('xp-gain-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'xp-gain-anim';
    el.textContent = multiplier ? `+${amount} XP ×${multiplier}` : `+${amount} XP`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

function generateDailyQuests() {
    const today = new Date().toDateString();
    const volTemplates  = QUEST_TEMPLATES.filter(q => q.category === 'volume');
    const mastTemplates = QUEST_TEMPLATES.filter(q => q.category === 'mastery');
    const expTemplates  = QUEST_TEMPLATES.filter(q => q.category === 'exploration');

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    dailyQuestsData = {
        date: today,
        quests: [
            { ...pick(volTemplates),  current: 0, completed: false },
            { ...pick(mastTemplates), current: 0, completed: false },
            { ...pick(expTemplates),  current: 0, completed: false },
        ]
    };
    saveDailyQuests();
    renderQuestWidget();
}

function updateQuestProgress(field, increment) {
    if (!dailyQuestsData.quests) return;
    let anyCompleted = false;
    dailyQuestsData.quests.forEach(q => {
        if (q.field === field && !q.completed) {
            q.current = Math.min(q.target, q.current + increment);
            if (q.current >= q.target) {
                q.completed = true;
                anyCompleted = true;
                awardXP(q.xpReward, 'quest');
            }
        }
    });
    if (anyCompleted) {
        const allDone = dailyQuestsData.quests.every(q => q.completed);
        if (allDone) awardXP(50, 'quest'); // Daily Master bonus
        checkDedicatedAchievement();
    }
    saveDailyQuests();
    renderQuestWidget();
}

function checkDedicatedAchievement() {
    // Check if user has completed all quests for 7 consecutive days (simplified: check last 7 days of quest data)
    // We store completion dates — for simplicity, track in xpData
    const today = new Date().toDateString();
    xpData.questCompleteDates = xpData.questCompleteDates || [];
    if (!xpData.questCompleteDates.includes(today)) {
        xpData.questCompleteDates.push(today);
        saveXPData();
    }
    if (xpData.questCompleteDates.length >= 7) {
        checkAchievements('dedicated_check', {});
    }
}

function renderQuestWidget() {
    const listEl = document.getElementById('quest-list');
    if (!listEl) return;
    if (!dailyQuestsData.quests || dailyQuestsData.quests.length === 0) {
        listEl.innerHTML = '<p class="text-xs text-gray-400">No quests today.</p>';
        return;
    }
    listEl.innerHTML = dailyQuestsData.quests.map(q => {
        const pct  = Math.min(100, Math.round((q.current / q.target) * 100));
        const done = q.completed;
        return `<div class="flex items-center gap-2">
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-0.5">
                    <span class="text-xs font-semibold ${done ? 'text-teal-600 line-through' : 'text-gray-600'} truncate">${q.label}</span>
                    <span class="text-[10px] font-bold ${done ? 'text-teal-500' : 'text-violet-500'} ml-2 shrink-0">${done ? '✓' : `${q.current}/${q.target}`} +${q.xpReward}XP</span>
                </div>
                <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full ${done ? 'bg-teal-400' : 'bg-violet-400'} rounded-full transition-all duration-500" style="width:${pct}%"></div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function checkAchievements(trigger, data) {
    const unlocked = achievementsData.unlocked || [];
    const has = id => unlocked.includes(id);

    switch (trigger) {
        case 'flashcard_reviewed':
            if (!has('first_steps') && statsData.totalReviews >= 1) unlockAchievement('first_steps');
            if (!has('on_a_roll') && state.sessionConsecutiveCorrect >= 10) unlockAchievement('on_a_roll');
            if (!has('perfectionist') && state.sessionTotal >= 10 && state.sessionCorrect === state.sessionTotal) unlockAchievement('perfectionist');
            // Time-based
            const h = new Date().getHours();
            if (!has('early_bird') && h < 7) unlockAchievement('early_bird');
            if (!has('night_owl') && h >= 23) unlockAchievement('night_owl');
            break;
        case 'word_builder_correct':
            if (!has('word_weaver')) unlockAchievement('word_weaver');
            break;
        case 'chart_correct':
            if (!has('chart_reader') && statsData.cdAnswered >= 1) unlockAchievement('chart_reader');
            break;
        case 'abbrev_correct':
            if (!has('code_cracker') && statsData.adAnswered >= 1) unlockAchievement('code_cracker');
            break;
        case 'plural_correct':
            if (!has('speed_speller') && statsData.plAnswered >= 1) unlockAchievement('speed_speller');
            break;
        case 'mastery_update':
            if (!has('hundred_club')  && data.mastered >= 100)  unlockAchievement('hundred_club');
            if (!has('half_mastered') && data.mastered >= 500)  unlockAchievement('half_mastered');
            if (!has('full_mastery')  && data.mastered >= dictionary.length) unlockAchievement('full_mastery');
            break;
        case 'cd_session_complete':
            if (!has('clinical_clarity') && data.pct >= 90) unlockAchievement('clinical_clarity');
            break;
        case 'level_up':
            if (!has('rising_star')  && data.level >= 5)  unlockAchievement('rising_star');
            if (!has('intern_life')  && data.level >= 6)  unlockAchievement('intern_life');
            if (!has('doctor_is_in') && data.level >= 11) unlockAchievement('doctor_is_in');
            break;
        case 'comeback':
            if (!has('comeback_kid')) unlockAchievement('comeback_kid');
            break;
        case 'dedicated_check':
            if (!has('dedicated')) unlockAchievement('dedicated');
            break;
    }
}

function unlockAchievement(id) {
    if (achievementsData.unlocked.includes(id)) return;
    achievementsData.unlocked.push(id);
    achievementsData.unlockedDates[id] = new Date().toDateString();
    saveAchievements();
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
        awardXP(ach.xp, 'achievement');
        showAchievementToast(ach);
    }
}

function showAchievementToast(ach) {
    const container = document.getElementById('achievement-toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'achievement-toast pointer-events-auto bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-xs';
    el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background:${ach.color}22;border:2px solid ${ach.color}44">
            <i class="${ach.icon} text-lg" style="color:${ach.color}"></i>
        </div>
        <div class="min-w-0">
            <p class="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Achievement Unlocked!</p>
            <p class="text-sm font-extrabold text-gray-800 truncate">${ach.label}</p>
            <p class="text-[11px] text-gray-500 leading-snug">${ach.desc}</p>
        </div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4500);
}

function checkStreakMilestone(count) {
    // Award streak achievements
    const milestones = [
        { days: 3,   id: 'habit_3'          },
        { days: 7,   id: 'week_warrior'      },
        { days: 14,  id: 'fortnight_focus'   },
        { days: 30,  id: 'monthly_devotion'  },
        { days: 60,  id: 'sixty_strong'      },
        { days: 90,  id: 'quarterly'         },
        { days: 365, id: 'year_medicine'     },
    ];
    milestones.forEach(m => {
        if (count >= m.days) checkAchievements('streak_milestone', { id: m.id });
    });
    // Grant streak shield at 7/30/60 days
    const shieldMilestones = [7, 30, 60];
    if (shieldMilestones.includes(count)) {
        xpData.streakShields = Math.min(3, (xpData.streakShields || 0) + 1);
        saveXPData();
        updateShieldIndicator(xpData.streakShields);
    }
    // Unlock streak achievements directly
    milestones.forEach(m => {
        if (count === m.days) unlockAchievement(m.id);
    });
}

function updateShieldIndicator(count) {
    const el = document.getElementById('shield-indicator');
    if (!el) return;
    if (count > 0) {
        el.classList.remove('hidden');
        el.textContent = '🛡️'.repeat(count);
    } else {
        el.classList.add('hidden');
    }
}

function updateStats(field, delta) {
    if (statsData[field] !== undefined) {
        statsData[field] += delta;
    } else {
        statsData[field] = delta;
    }
    saveStats();
}

function openStatsModal() {
    renderStatsModal();
    document.getElementById('modal-stats').classList.remove('hidden');
}

function closeStatsModal() {
    document.getElementById('modal-stats').classList.add('hidden');
}

function renderStatsModal() {
    const lvlObj = getLevelFromXP(xpData.total);
    const el = id => document.getElementById(id);
    if (el('stats-level-text')) el('stats-level-text').textContent = `Level ${lvlObj.level} — ${lvlObj.title}`;
    if (el('stats-total-xp'))   el('stats-total-xp').textContent   = `${(xpData.total || 0).toLocaleString()} XP`;

    // Weekly XP chart (last 7 days)
    const chart = el('stats-xp-chart');
    if (chart) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push(d.toDateString());
        }
        const vals = days.map(d => (xpData.dailyXP && xpData.dailyXP[d]) || 0);
        const maxV = Math.max(...vals, 1);
        chart.innerHTML = days.map((d, i) => {
            const h = Math.max(4, Math.round((vals[i] / maxV) * 64));
            const today = new Date().toDateString();
            const isToday = d === today;
            return `<div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full rounded-t-sm ${isToday ? 'bg-violet-500' : 'bg-violet-200'} transition-all" style="height:${h}px"></div>
                <span class="text-[9px] text-gray-400">${['S','M','T','W','T','F','S'][new Date(d).getDay()]}</span>
            </div>`;
        }).join('');
    }

    // Activity accuracy
    const acts = el('stats-activities');
    if (acts) {
        const rows = [
            { label: 'Flashcards',        correct: statsData.totalCorrect, total: statsData.totalReviews },
            { label: 'Word Builder',       correct: statsData.wbCorrect,    total: statsData.wbChallenges },
            { label: 'Chart Decrypter',    correct: statsData.cdCorrect,    total: statsData.cdAnswered   },
            { label: 'Abbreviations',      correct: statsData.adCorrect,    total: statsData.adAnswered   },
            { label: 'Pluralization',      correct: statsData.plCorrect,    total: statsData.plAnswered   },
        ];
        acts.innerHTML = rows.map(r => {
            const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
            return `<div>
                <div class="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>${r.label}</span>
                    <span>${pct}% <span class="text-gray-400 font-normal">(${r.correct}/${r.total})</span></span>
                </div>
                <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-teal-400 rounded-full" style="width:${pct}%"></div>
                </div>
            </div>`;
        }).join('');
    }

    // Badge gallery
    const badges = el('stats-badges');
    if (badges) {
        badges.innerHTML = ACHIEVEMENTS.map(a => {
            const owned = achievementsData.unlocked.includes(a.id);
            return `<div title="${a.label}: ${a.desc}" class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${owned ? 'opacity-100' : 'opacity-20 grayscale'}" style="background:${a.color}22;border-color:${a.color}55">
                <i class="${a.icon} text-sm" style="color:${owned ? a.color : '#9ca3af'}"></i>
            </div>`;
        }).join('');
    }
}

// ==========================================
// EVENT LISTENERS & NAVIGATION
// ==========================================
function setupEventListeners() {
    // Navigation Tabs
    document.getElementById('nav-flashcards').addEventListener('click', () => switchTab('flashcards'));
    document.getElementById('nav-word-builder').addEventListener('click', () => switchTab('word-builder'));
    document.getElementById('nav-chart-decrypter').addEventListener('click', () => switchTab('chart-decrypter'));
    document.getElementById('nav-abbrev-decoder').addEventListener('click', () => switchTab('abbrev-decoder'));
    document.getElementById('nav-pluralization').addEventListener('click', () => switchTab('pluralization'));
    document.getElementById('nav-tutor').addEventListener('click', () => { switchTab('tutor'); checkOllamaStatus(); });

    // Top Filter (Mobile)
    const mobileFilter = document.getElementById('system-filter-mobile');
    if (mobileFilter) {
        mobileFilter.addEventListener('change', (e) => {
            setActiveSystem(e.target.value);
        });
    }

    // Feature A: Flashcards
    document.getElementById('flashcard').addEventListener('click', flipFlashcard);
    document.getElementById('btn-again').addEventListener('click', () => handleReview(0));
    document.getElementById('btn-hard').addEventListener('click', () => handleReview(1));
    document.getElementById('btn-good').addEventListener('click', () => handleReview(2));
    document.getElementById('btn-easy').addEventListener('click', () => handleReview(3));
    document.getElementById('fc-btn-continue').addEventListener('click', renderFlashcards);
    document.getElementById('fc-reverse-toggle').addEventListener('click', toggleReverseMode);

    // Feature A: Reset Modal
    document.getElementById('btn-settings').addEventListener('click', openResetModal);
    const btnStats = document.getElementById('btn-stats');
    if (btnStats) btnStats.addEventListener('click', openStatsModal);
    document.getElementById('modal-btn-cancel').addEventListener('click', closeResetModal);
    document.getElementById('modal-reset-overlay').addEventListener('click', closeResetModal);
    document.getElementById('modal-btn-reset-all').addEventListener('click', resetAllProgress);
    document.getElementById('modal-btn-reset-system').addEventListener('click', () => resetSystemProgress(state.activeSystem));
    document.getElementById('fc-btn-review-mastered').addEventListener('click', reviewMasteredCards);

    // Feature A: Speech Recognition (Hold to Speak)
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) {
        micBtn.addEventListener('mousedown', startSpeechRecognition);
        micBtn.addEventListener('mouseup', stopSpeechRecognition);
        micBtn.addEventListener('touchstart', startSpeechRecognition, {passive: true});
        micBtn.addEventListener('touchend', stopSpeechRecognition, {passive: true});
    }

    // Feature B: Word Builder
    document.getElementById('wb-btn-clear').addEventListener('click', clearWbSlots);
    document.getElementById('wb-btn-check').addEventListener('click', checkWbAnswer);
    document.getElementById('wb-btn-next').addEventListener('click', nextWbChallenge);

    // Feature C: Chart Decrypter
    document.getElementById('cd-btn-check').addEventListener('click', checkCdAnswer);
    document.getElementById('cd-btn-reveal').addEventListener('click', revealCdAnswer);
    document.getElementById('cd-btn-next').addEventListener('click', nextCdChallenge);
    document.getElementById('cd-btn-restart').addEventListener('click', restartCd);
    document.getElementById('cd-input').addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const checkBtn = document.getElementById('cd-btn-check');
        const nextBtn  = document.getElementById('cd-btn-next');
        if (!checkBtn.classList.contains('hidden')) checkCdAnswer();
        else if (!nextBtn.classList.contains('hidden')) nextCdChallenge();
    });

    // Feature D: Abbreviation Decoder
    document.getElementById('ad-btn-check').addEventListener('click', checkAdAnswer);
    document.getElementById('ad-btn-next').addEventListener('click', nextAdChallenge);
    document.getElementById('ad-input').addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const checkBtn = document.getElementById('ad-btn-check');
        const nextBtn  = document.getElementById('ad-btn-next');
        if (!checkBtn.classList.contains('hidden')) checkAdAnswer();
        else if (!nextBtn.classList.contains('hidden')) nextAdChallenge();
    });

    // Feature E: Pluralization
    document.getElementById('pl-btn-check').addEventListener('click', checkPluralAnswer);
    document.getElementById('pl-btn-next').addEventListener('click', nextPluralChallenge);

    // Feature G: AI Tutor Chat
    document.getElementById('chat-btn-send').addEventListener('click', sendChatMessage);
    document.getElementById('chat-btn-clear').addEventListener('click', clearChat);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!document.getElementById('chat-btn-send').disabled) sendChatMessage();
        }
    });
    document.getElementById('chat-input').addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Feature H: Dark mode
    document.getElementById('modal-dark-toggle').addEventListener('change', toggleDarkMode);

    // Unselect slots via click
    ['prefix', 'root1', 'root2', 'suffix'].forEach(type => {
        const slotEl = document.getElementById(`slot-${type}`);
        if (slotEl) {
            slotEl.addEventListener('click', () => {
                if (state.wbSlots[type]) {
                    state.wbSlots[type] = null;
                    updateWbSlots();
                }
            });
        }
    });

    // Feature D: Text-to-Speech
    document.querySelectorAll('.btn-speak').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.flashcards.length > 0) {
                const cleanTerm = state.flashcards[state.fcIndex].term.replace(/[\/-]/g, '');
                speakText(cleanTerm);
            }
        });
    });
    document.querySelector('.btn-speak-wb').addEventListener('click', () => {
        const word = document.getElementById('wb-preview').textContent;
        if (word && word !== '-') speakText(word);
    });

    // Keyboard shortcuts: Space=flip, 1/←=Again, 2=Hard, 3/→=Good, 4=Easy
    document.addEventListener('keydown', (e) => {
        const flashView = document.getElementById('view-flashcards');
        if (!flashView || flashView.classList.contains('hidden-tab')) return;
        if (e.target.matches('input, textarea, select')) return;
        if (e.code === 'Space') {
            e.preventDefault();
            if (!state.fcFlipped) flipFlashcard();
        } else if (state.fcFlipped) {
            if (e.code === 'Digit1' || e.code === 'ArrowLeft') {
                e.preventDefault();
                handleReview(0);
            } else if (e.code === 'Digit2') {
                e.preventDefault();
                handleReview(1);
            } else if (e.code === 'Digit3' || e.code === 'ArrowRight') {
                e.preventDefault();
                handleReview(2);
            } else if (e.code === 'Digit4') {
                e.preventDefault();
                handleReview(3);
            }
        }
    });
}

function switchTab(tabId) {
    // Hide all panels and reset all nav buttons
    ['flashcards', 'word-builder', 'chart-decrypter', 'abbrev-decoder', 'pluralization', 'tutor'].forEach(id => {
        const view = document.getElementById(`view-${id}`);
        if (view) view.classList.add('hidden-tab');
        
        // Reset top nav button
        const btn = document.getElementById(`nav-${id}`);
        if (btn) btn.className = "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 text-gray-500 hover:text-gray-800 hover:bg-gray-100/50";

        // Reset bottom nav button
        const bBtn = document.getElementById(`bnav-${id}`);
        if (bBtn) {
            const icon = bBtn.querySelector('.bnav-icon');
            const label = bBtn.querySelector('.bnav-label');
            if (icon)  { icon.classList.remove('text-teal-600');  icon.classList.add('text-gray-400'); }
            if (label) { label.classList.remove('text-teal-600'); label.classList.add('text-gray-400'); }
        }
    });

    // Show selected panel
    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) activeView.classList.remove('hidden-tab');

    // Activate top nav button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) activeBtn.className = "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-white text-teal-700 shadow shadow-gray-300/50";

    // Activate bottom nav button
    const activeBBtn = document.getElementById(`bnav-${tabId}`);
    if (activeBBtn) {
        const icon = activeBBtn.querySelector('.bnav-icon');
        const label = activeBBtn.querySelector('.bnav-label');
        if (icon)  { icon.classList.add('text-teal-600');  icon.classList.remove('text-gray-400'); }
        if (label) { label.classList.add('text-teal-600'); label.classList.remove('text-gray-400'); }
    }
}

// ==========================================
// FEATURE D: TEXT-TO-SPEECH ENGINE
// ==========================================
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech is not supported in this browser.");
    }
}

// ==========================================
// FEATURE E: SPEECH RECOGNITION (Web Speech API)
// ==========================================
let recognition = null;
let isRecording = false;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const cleanTerm = state.flashcards[state.fcIndex].term.replace(/[\/-]/g, '').toLowerCase();
        
        const micBtn = document.getElementById('btn-mic');
        const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
        
        if (cleanTranscript === cleanTerm) {
            micBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            micBtn.classList.replace('text-gray-400', 'text-green-500');
            micBtn.classList.replace('bg-gray-50', 'bg-green-100');
        } else {
            micBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            micBtn.classList.replace('text-gray-400', 'text-rose-500');
            micBtn.classList.replace('bg-gray-50', 'bg-rose-100');
            console.log(`Expected: ${cleanTerm}, Heard: ${cleanTranscript}`);
        }
        
        setTimeout(() => {
            micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            micBtn.className = "w-10 h-10 rounded-full bg-gray-50 hover:bg-rose-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm";
        }, 2000);
    };

    recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
    };
}

function startSpeechRecognition(e) {
    e.preventDefault();
    if (!recognition || isRecording) return;
    
    isRecording = true;
    const micBtn = document.getElementById('btn-mic');
    micBtn.classList.add('animate-pulse', 'ring-4', 'ring-rose-200');
    micBtn.classList.replace('text-gray-400', 'text-rose-600');
    
    try {
        recognition.start();
    } catch(err) {
        console.warn(err);
    }
}

function stopSpeechRecognition(e) {
    e.preventDefault();
    if (!recognition || !isRecording) return;
    
    isRecording = false;
    const micBtn = document.getElementById('btn-mic');
    micBtn.classList.remove('animate-pulse', 'ring-4', 'ring-rose-200');
    
    try {
        recognition.stop();
    } catch(err) {
        console.warn(err);
    }
}

// ==========================================
// FEATURE A: FLASHCARDS (Spaced Repetition)
// ==========================================
function updateFcStatsBar(due, newCount, learning, mastered) {
    const el = document.getElementById('fc-stats-bar');
    if (!el) return;
    el.innerHTML = `
        <span class="flex items-center gap-1.5 text-orange-500"><i class="fa-solid fa-rotate text-xs"></i>${due} due</span>
        <span class="text-gray-300">·</span>
        <span class="flex items-center gap-1.5 text-sky-500"><i class="fa-solid fa-plus text-xs"></i>${newCount} new</span>
        <span class="text-gray-300">·</span>
        <span class="flex items-center gap-1.5 text-yellow-500"><i class="fa-solid fa-book-open text-xs"></i>${learning} learning</span>
        <span class="text-gray-300">·</span>
        <span class="flex items-center gap-1.5 text-teal-500"><i class="fa-solid fa-graduation-cap text-xs"></i>${mastered} mastered</span>
    `;
}

function renderFlashcards() {
    const now = Date.now();
    // Clean up session-lapse counters from the previous session
    dictionary.forEach(t => delete t._sessionLapses);

    let pool = dictionary.filter(t => t.type !== 'abbreviation');
    if (state.activeSystem !== 'All') {
        pool = pool.filter(t => t.system === state.activeSystem);
    }

    const newCards      = pool.filter(t => t.interval === 0);
    const dueCards      = pool.filter(t => t.interval > 0 && (state.dueDates[t.id] || 0) <= now);
    const learningCards = pool.filter(t => t.interval >= 1 && t.interval < 7);
    const masteredCards = pool.filter(t => t.interval >= 7);

    // Build session deck: due cards first, then new cards.
    // No deterministic sort within groups — SM-2 ease factors already encode difficulty.
    const selectedNew = newCards;
    let finalPool = [...dueCards, ...selectedNew];

    // Per-session Fisher-Yates shuffle — true randomness (Math.random, not seeded)
    // so each session start produces a different card order.
    for (let i = finalPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
    }

    // Update stats bar with full pool counts (before any truncation)
    updateFcStatsBar(dueCards.length, newCards.length, learningCards.length, masteredCards.length);

    // "All caught up" fallback: only fires when BOTH due AND new queues are truly empty
    if (finalPool.length === 0) {
        const notDue = pool.filter(t => t.interval > 0 && (state.dueDates[t.id] || 0) > now);
        notDue.sort((a, b) => (state.dueDates[a.id] || 0) - (state.dueDates[b.id] || 0));
        // Show the 10 soonest-due cards as a maintenance preview
        finalPool = notDue.slice(0, 10);
    }

    state.flashcards    = finalPool;
    state.fcIndex       = 0;
    state.sessionCorrect = 0;
    state.sessionTotal  = 0;

    // Hide summary, show card container
    document.getElementById('fc-session-summary').classList.add('hidden');
    document.getElementById('fc-container').classList.remove('hidden');

    updateFlashcardUI();
}

function updateFlashcardUI() {
    const container = document.getElementById('fc-container');
    const emptyState = document.getElementById('fc-empty');
    const cardEl = document.getElementById('flashcard');
    const controls = document.getElementById('fc-controls');

    if (state.flashcards.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        document.getElementById('fc-current').textContent = '0';
        document.getElementById('fc-total').textContent = '0';

        // Dynamic next-due message
        const now = Date.now();
        const msgEl = document.getElementById('fc-empty-message');
        if (msgEl) {
            const pool = dictionary.filter(t =>
                t.type !== 'abbreviation' &&
                (state.activeSystem === 'All' || t.system === state.activeSystem)
            );
            const upcoming = pool
                .filter(t => t.interval > 0 && (state.dueDates[t.id] || 0) > now)
                .sort((a, b) => (state.dueDates[a.id] || 0) - (state.dueDates[b.id] || 0));
            if (upcoming.length > 0) {
                const msUntil    = (state.dueDates[upcoming[0].id] || 0) - now;
                const hoursUntil = Math.ceil(msUntil / 3600000);
                const timeStr    = hoursUntil < 24 ? `in about ${hoursUntil}h` : 'tomorrow';
                msgEl.textContent = `Next review due ${timeStr}. ${upcoming.length} card${upcoming.length !== 1 ? 's' : ''} scheduled.`;
            } else {
                msgEl.textContent = "All cards in this system reviewed. Switch systems or challenge your mastered cards below.";
            }
        }
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const card = state.flashcards[state.fcIndex];
    const color = SYSTEM_COLORS[card.system] || '#64748b';

    document.getElementById('fc-current').textContent = state.fcIndex + 1;
    document.getElementById('fc-total').textContent = state.flashcards.length;

    // Snap card instantly back to front face before writing new content.
    // This prevents the incoming card's answer from being visible during the
    // CSS un-flip animation (back face is facing the user at rotation 0–90°).
    const cardInner = cardEl.querySelector('.flip-card-inner');
    cardInner.style.transition = 'none';        // suppress animation
    cardEl.classList.remove('flipped');          // instant snap to front
    state.fcFlipped = false;
    void cardInner.offsetWidth;                  // force synchronous reflow
    cardInner.style.transition = '';             // re-enable for next user flip

    // System color accent: left border on card front
    const frontEl = cardEl.querySelector('.flip-card-front');
    frontEl.style.borderLeft = `4px solid ${color}`;

    if (state.reverseMode) {
        // Reverse: front = meaning, back = term
        document.getElementById('fc-type').textContent = card.system;
        document.getElementById('fc-term').textContent = card.meaning;
        document.getElementById('fc-meaning').textContent = card.term;
        document.getElementById('fc-hint').innerHTML = '<i class="fa-solid fa-hand-pointer"></i> Click to reveal term';
        document.getElementById('fc-back-label').textContent = 'Term';
    } else {
        // Normal: front = term, back = meaning
        document.getElementById('fc-type').textContent = card.type;
        document.getElementById('fc-term').textContent = card.term;
        document.getElementById('fc-meaning').textContent = card.meaning;
        document.getElementById('fc-hint').innerHTML = '<i class="fa-solid fa-hand-pointer"></i> Click to reveal meaning';
        document.getElementById('fc-back-label').textContent = 'Meaning';
    }

    // System badge on card back
    const badge = document.getElementById('fc-system-badge');
    badge.textContent = card.system;
    badge.style.backgroundColor = color + '22';
    badge.style.color = color;
    badge.style.borderColor = color + '55';

    // Example words on card back
    const examplesEl = document.getElementById('fc-examples');
    const exList = EXAMPLES[card.term] || [];
    if (exList.length > 0) {
        examplesEl.innerHTML = `<span class="font-semibold" style="color:${color}">e.g.</span> <span class="italic">${exList.join(', ')}</span>`;
        examplesEl.classList.remove('hidden');
    } else {
        examplesEl.classList.add('hidden');
    }

    // Hide controls
    controls.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    controls.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
}

function flipFlashcard() {
    if (state.fcFlipped) return;
    state.fcFlipped = true;

    document.getElementById('flashcard').classList.add('flipped');

    const controls = document.getElementById('fc-controls');
    controls.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    controls.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
}

function toggleReverseMode() {
    state.reverseMode = !state.reverseMode;
    const btn = document.getElementById('fc-reverse-toggle');
    if (state.reverseMode) {
        btn.classList.add('bg-teal-600', 'text-white', 'border-teal-600');
        btn.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');
    } else {
        btn.classList.remove('bg-teal-600', 'text-white', 'border-teal-600');
        btn.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
    }
    updateFlashcardUI();
}

function handleReview(grade) {
    // SM-2 spaced repetition with ease factor and session recirculation
    // grade: 0=Again, 1=Hard, 2=Good, 3=Easy
    const card    = state.flashcards[state.fcIndex];
    const wasNew  = card.interval === 0;
    const now     = Date.now();
    const DAY_MS  = 86400000;
    const ease    = state.easeFactors[card.id] !== undefined ? state.easeFactors[card.id] : 2.5;
    const wasOverdue = card.interval > 0 && (state.dueDates[card.id] || 0) <= now;
    const wasMature  = card.interval >= 14;

    state.sessionTotal++;
    updateStats('totalReviews', 1);

    let newInterval = card.interval;
    let newEase     = ease;

    if (grade === 0) {
        // Again — lapse
        const wasMatured = card.interval >= 7;
        if (wasMatured) {
            newInterval = Math.max(1, Math.round(card.interval * 0.5));
            state.dueDates[card.id] = now + newInterval * DAY_MS;
        } else {
            newInterval = 0;
            state.dueDates[card.id] = now;
            card._sessionLapses = (card._sessionLapses || 0) + 1;
            if (card._sessionLapses <= 3) {
                state.flashcards.push(card);
            }
        }
        newEase = Math.max(1.3, ease - 0.2);
        card.errorCount = (card.errorCount || 0) + 1;
        state.lapses[card.id] = card.errorCount;
        saveLapses();
        state.sessionConsecutiveCorrect = 0;

    } else if (grade === 1) {
        newEase = Math.max(1.3, ease - 0.15);
        if (wasNew || card.interval <= 1) {
            newInterval = 1;
        } else {
            newInterval = Math.max(1, Math.round(card.interval * 1.2));
        }
        state.dueDates[card.id] = now + newInterval * DAY_MS;
        state.sessionCorrect++;
        state.sessionConsecutiveCorrect++;
        let xpBase = 8;
        if (wasMature) xpBase += 5;
        if (wasNew) xpBase += 3;
        awardXP(xpBase, 'flashcard');
        updateStats('totalCorrect', 1);
        updateQuestProgress('fcReviewed', 1);
        if (wasOverdue) updateQuestProgress('overdueReviewed', 1);
        if (wasNew) updateQuestProgress('newLearned', 1);

    } else if (grade === 2) {
        newEase = ease;
        if (wasNew) {
            newInterval = 1;
        } else if (card.interval === 1) {
            newInterval = 3;
        } else {
            newInterval = Math.max(card.interval + 1, Math.round(card.interval * ease));
        }
        state.dueDates[card.id] = now + newInterval * DAY_MS;
        state.sessionCorrect++;
        state.sessionConsecutiveCorrect++;
        let xpBase = 12;
        if (wasMature) xpBase += 5;
        if (wasNew) xpBase += 3;
        awardXP(xpBase, 'flashcard');
        updateStats('totalCorrect', 1);
        updateQuestProgress('fcReviewed', 1);
        if (wasOverdue) updateQuestProgress('overdueReviewed', 1);
        if (wasNew) updateQuestProgress('newLearned', 1);

    } else if (grade === 3) {
        newEase = Math.min(4.0, ease + 0.15);
        if (wasNew) {
            newInterval = 3;
        } else if (card.interval === 1) {
            newInterval = 5;
        } else {
            newInterval = Math.round(card.interval * ease * 1.3);
        }
        state.dueDates[card.id] = now + newInterval * DAY_MS;
        state.sessionCorrect++;
        state.sessionConsecutiveCorrect++;
        let xpBase = 10;
        if (wasMature) xpBase += 5;
        if (wasNew) xpBase += 3;
        awardXP(xpBase, 'flashcard');
        updateStats('totalCorrect', 1);
        updateQuestProgress('fcReviewed', 1);
        if (wasOverdue) updateQuestProgress('overdueReviewed', 1);
        if (wasNew) updateQuestProgress('newLearned', 1);
    }

    checkAchievements('flashcard_reviewed', {});

    card.interval = newInterval;
    state.easeFactors[card.id] = newEase;

    if (wasNew && grade > 0) {
        state.newCardsLearnedToday += 1;
        saveStreak(new Date().toDateString(), state.streak, state.newCardsLearnedToday);
    }

    state.intervals[card.id] = card.interval;
    saveIntervals();
    saveEaseFactors();
    saveDueDates();
    updateMasteryProgress();

    state.fcIndex++;
    if (state.fcIndex >= state.flashcards.length) {
        showSessionSummary();
    } else {
        updateFlashcardUI();
    }
}

function showSessionSummary() {
    const accuracy = state.sessionTotal > 0
        ? Math.round((state.sessionCorrect / state.sessionTotal) * 100)
        : 0; // 0% if nothing reviewed (shouldn't happen, but safe fallback)
    const againCount = state.sessionTotal - state.sessionCorrect;

    document.getElementById('fc-summary-accuracy').textContent = `${accuracy}%`;
    document.getElementById('fc-summary-reviewed').textContent = state.sessionTotal;
    document.getElementById('fc-summary-correct').textContent = state.sessionCorrect;
    document.getElementById('fc-summary-again').textContent = againCount;

    // Count cards due by tomorrow
    const tomorrow = Date.now() + 86400000;
    const dueTomorrow = dictionary.filter(t => t.interval > 0 && (state.dueDates[t.id] || 0) <= tomorrow).length;
    document.getElementById('fc-summary-due-tomorrow').textContent =
        `${dueTomorrow} card${dueTomorrow !== 1 ? 's' : ''} due by tomorrow`;

    // Icon based on accuracy
    const icon = document.getElementById('fc-summary-icon');
    if (accuracy >= 90) {
        icon.className = 'fa-solid fa-star text-4xl text-amber-500';
    } else if (accuracy >= 70) {
        icon.className = 'fa-solid fa-thumbs-up text-4xl text-teal-500';
    } else {
        icon.className = 'fa-solid fa-rotate text-4xl text-blue-500';
    }

    document.getElementById('fc-container').classList.add('hidden');

    // Show session XP row
    const xpRow = document.getElementById('fc-summary-xp-row');
    const xpEl  = document.getElementById('fc-summary-xp');
    if (xpRow && xpEl && state.sessionXP > 0) {
        xpEl.textContent = state.sessionXP;
        xpRow.classList.remove('hidden');
    }

    document.getElementById('fc-session-summary').classList.remove('hidden');
}

// ==========================================
// RESET & CHALLENGE FUNCTIONS
// ==========================================
function openResetModal() {
    const label = document.getElementById('modal-reset-system-label');
    if (label) {
        label.textContent = state.activeSystem === 'All'
            ? 'Reset All Systems'
            : `Reset "${state.activeSystem}"`;
    }
    document.getElementById('modal-reset').classList.remove('hidden');
}

function closeResetModal() {
    document.getElementById('modal-reset').classList.add('hidden');
}

function resetAllProgress() {
    ['syngnosia_progress', 'syngnosia_lapses', 'syngnosia_streak', 'syngnosia_duedates', 'syngnosia_ease',
     'syngnosia_xp', 'syngnosia_achievements', 'syngnosia_daily_quests', 'syngnosia_stats']
        .forEach(k => localStorage.removeItem(k));
    state.intervals      = {};
    state.lapses         = {};
    state.dueDates       = {};
    state.easeFactors    = {};
    state.streak         = 1;
    state.newCardsLearnedToday = 0;
    xpData           = { total: 0, level: 1, dailyXP: {}, dailyFcXP: {}, dailyActivities: {} };
    achievementsData = { unlocked: [], unlockedDates: {} };
    statsData        = { totalReviews: 0, totalCorrect: 0, wbChallenges: 0, wbCorrect: 0, cdAnswered: 0, cdCorrect: 0, adAnswered: 0, adCorrect: 0, plAnswered: 0, plCorrect: 0 };
    saveStreak(new Date().toDateString(), 1, 0);
    document.getElementById('streak-counter').textContent = '1';
    dictionary.forEach(t => { t.interval = 0; t.errorCount = 0; delete t._sessionLapses; });
    updateMasteryProgress();
    updateXPBar();
    generateDailyQuests();
    closeResetModal();
    renderFlashcards();
}

function resetSystemProgress(system) {
    const targets = system === 'All'
        ? dictionary
        : dictionary.filter(t => t.system === system);
    targets.forEach(t => {
        t.interval   = 0;
        t.errorCount = 0;
        delete t._sessionLapses;
        delete state.intervals[t.id];
        delete state.lapses[t.id];
        delete state.dueDates[t.id];
        delete state.easeFactors[t.id];
    });
    saveIntervals();
    saveLapses();
    saveDueDates();
    saveEaseFactors();
    updateMasteryProgress();
    closeResetModal();
    renderFlashcards();
}

function reviewMasteredCards() {
    let pool = dictionary.filter(t => t.type !== 'abbreviation' && t.interval >= 7);
    if (state.activeSystem !== 'All') {
        pool = pool.filter(t => t.system === state.activeSystem);
    }
    if (pool.length === 0) {
        const msgEl = document.getElementById('fc-empty-message');
        if (msgEl) msgEl.textContent = 'No mastered cards yet in this system. Keep studying!';
        return;
    }
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    state.flashcards     = pool.slice(0, 20);
    state.fcIndex        = 0;
    state.sessionCorrect = 0;
    state.sessionTotal   = 0;
    document.getElementById('fc-session-summary').classList.add('hidden');
    document.getElementById('fc-empty').classList.add('hidden');
    document.getElementById('fc-container').classList.remove('hidden');
    updateFlashcardUI();
}

// ==========================================
// FEATURE B: WORD BUILDER
// ==========================================
function generateDynamicChallenge() {
    let pool = dictionary.filter(t => t.type !== 'abbreviation');
    if (state.activeSystem !== 'All' && !state.activeSystem.startsWith('Suffixes') && state.activeSystem !== 'Prefixes') {
        pool = pool.filter(t => t.system === state.activeSystem || t.system.startsWith('Suffixes') || t.system === 'Prefixes');
    }
    
    const roots = pool.filter(t => t.type === 'root');
    const prefixes = pool.filter(t => t.type === 'prefix');
    const suffixes = pool.filter(t => t.type === 'suffix');
    
    if (roots.length === 0 || suffixes.length === 0) {
        return generateFallbackChallenge();
    }
    
    const isCompound = roots.length >= 2 && Math.random() < 0.3;
    const root1 = roots[Math.floor(Math.random() * roots.length)];
    let root2 = null;
    
    if (isCompound) {
        let root2Candidates = roots.filter(r => r.id !== root1.id);
        if (root2Candidates.length > 0) {
            root2 = root2Candidates[Math.floor(Math.random() * root2Candidates.length)];
        }
    }

    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    let prefix = null;
    if (prefixes.length > 0 && Math.random() < 0.3) {
        prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    }
    
    let answer = '';
    let target = '';
    let validIds = [];
    
    if (prefix) {
        answer += prefix.clean;
        target += prefix.meaning + ' ';
        validIds.push(prefix.id);
    }
    
    target += suffix.meaning + ' of the ' + root1.meaning;
    
    answer += root1.rootBase;
    if (root2) {
        target += ' and ' + root2.meaning;
        answer += root1.vowel + root2.rootBase; // Always use vowel between roots
        if (!/^[aeiou]/i.test(suffix.clean)) answer += root2.vowel;
        validIds.push(root2.id);
    } else {
        if (!/^[aeiou]/i.test(suffix.clean)) answer += root1.vowel;
    }
    
    answer += suffix.clean;
    
    validIds.push(root1.id);
    validIds.push(suffix.id);
    
    target = target.charAt(0).toUpperCase() + target.slice(1);
    
    return { target, validIds, answer: answer.toLowerCase() };
}

function generateFallbackChallenge() {
    const allRoots = dictionary.filter(t => t.type === 'root');
    const allSuffixes = dictionary.filter(t => t.type === 'suffix');
    const root = allRoots[Math.floor(Math.random() * allRoots.length)];
    const suffix = allSuffixes[Math.floor(Math.random() * allSuffixes.length)];
    let answer = root.rootBase;
    if (!/^[aeiou]/i.test(suffix.clean)) answer += root.vowel;
    answer += suffix.clean;
    let target = suffix.meaning + " of the " + root.meaning;
    target = target.charAt(0).toUpperCase() + target.slice(1);
    return { target, validIds: [root.id, suffix.id], answer: answer.toLowerCase() };
}

function renderWordBuilder() {
    state.wbAttempts = 0;
    currentWbChallenge = generateDynamicChallenge();
    document.getElementById('wb-target').textContent = currentWbChallenge.target;
    
    clearWbSlots();
    
    const bankEl = document.getElementById('wb-parts-bank');
    bankEl.innerHTML = '';
    
    // Select required parts + distill distractors
    let parts = dictionary.filter(t => currentWbChallenge.validIds.includes(t.id));
    const distractorPool = dictionary.filter(t => !currentWbChallenge.validIds.includes(t.id) && t.type !== 'abbreviation');
    const shuffledDistractors = distractorPool.sort(() => 0.5 - Math.random());
    
    const distractorsNeeded = Math.max(0, 8 - parts.length);
    parts = parts.concat(shuffledDistractors.slice(0, distractorsNeeded));
    
    // Shuffle combined array for the UI grid
    parts.sort(() => 0.5 - Math.random());

    parts.forEach(part => {
        const btn = document.createElement('button');
        btn.className = "px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-sky-400 hover:bg-sky-50 font-bold text-gray-700 transition-colors";
        btn.textContent = part.term;
        btn.onclick = () => selectWbPart(part);
        bankEl.appendChild(btn);
    });

    document.getElementById('wb-btn-check').classList.remove('hidden');
    document.getElementById('wb-btn-next').classList.add('hidden');
    
    // Reset preview styles
    document.getElementById('wb-preview').className = "text-4xl font-extrabold text-sky-700 tracking-tight h-12 flex items-center justify-center transition-all duration-300";
}

function selectWbPart(part) {
    let slotType = part.type;
    if (part.type === 'root') {
        if (!state.wbSlots.root1) slotType = 'root1';
        else if (!state.wbSlots.root2) slotType = 'root2';
        else slotType = null; // Both full
    }

    if (slotType && state.wbSlots[slotType] === null) {
        state.wbSlots[slotType] = part;
        updateWbSlots();
    } else {
        // Reject visual feedback if slot is full
        const typePrefix = part.type === 'root' ? 'root1' : part.type; // Best effort bounce
        const slotEl = document.getElementById(`slot-${typePrefix}`);
        if (slotEl) {
            slotEl.classList.add('ring-4', 'ring-rose-200');
            setTimeout(() => slotEl.classList.remove('ring-4', 'ring-rose-200'), 300);
        }
    }
}

function clearWbSlots() {
    state.wbSlots = { prefix: null, root1: null, root2: null, suffix: null };
    updateWbSlots();
}

function updateWbSlots() {
    ['prefix', 'root1', 'root2', 'suffix'].forEach(type => {
        const slotEl = document.getElementById(`slot-${type}`);
        const part = state.wbSlots[type];
        
        if (part) {
            slotEl.innerHTML = `<span class="font-extrabold text-sky-800 text-lg">${part.term}</span>`;
            slotEl.classList.add('filled');
        } else {
            slotEl.innerHTML = `<span class="text-gray-400 text-sm group-hover:text-sky-400 transition-colors">Select...</span>`;
            slotEl.classList.remove('filled');
        }
    });

    updateWbPreview();
}

/**
 * CRITICAL LOGIC: Combining Vowel Engine for Compound Roots
 */
function updateWbPreview() {
    const previewEl = document.getElementById('wb-preview');
    const { prefix, root1, root2, suffix } = state.wbSlots;
    
    if (!prefix && !root1 && !root2 && !suffix) {
        previewEl.textContent = '-';
        return;
    }

    let result = '';
    if (prefix) result += prefix.clean;
    
    if (root1) {
        result += root1.rootBase;
        
        if (root2) {
            result += root1.vowel + root2.rootBase; // Always use vowel between roots
            
            if (suffix) {
                const startsWithVowel = /^[aeiou]/i.test(suffix.clean);
                if (!startsWithVowel) result += root2.vowel;
                result += suffix.clean;
            } else {
                result += `/${root2.vowel}-`;
            }
        } else {
            if (suffix) {
                const startsWithVowel = /^[aeiou]/i.test(suffix.clean);
                if (!startsWithVowel) result += root1.vowel;
                result += suffix.clean;
            } else {
                result += `/${root1.vowel}-`;
            }
        }
    } else if (root2) {
        result += root2.rootBase;
        if (suffix) {
            const startsWithVowel = /^[aeiou]/i.test(suffix.clean);
            if (!startsWithVowel) result += root2.vowel;
            result += suffix.clean;
        } else {
            result += `/${root2.vowel}-`;
        }
    } else if (suffix) {
        result += suffix.clean;
    }

    previewEl.textContent = result.replace(/[\/-]/g, '');
}

function checkWbAnswer() {
    const previewEl = document.getElementById('wb-preview');
    const currentWord = previewEl.textContent.toLowerCase();
    const challenge = currentWbChallenge;
    
    if (currentWord === challenge.answer.toLowerCase()) {
        // Success
        previewEl.className = "text-4xl font-extrabold text-green-600 tracking-tight h-12 flex items-center justify-center scale-110 transition-transform duration-300 drop-shadow-md";
        document.getElementById('wb-btn-check').classList.add('hidden');
        document.getElementById('wb-btn-next').classList.remove('hidden');
        // XP: first attempt = 25, second = 15, third+ = 8
        const attempts = state.wbAttempts;
        const xp = attempts === 0 ? 25 : attempts === 1 ? 15 : 8;
        awardXP(xp, 'word-builder');
        updateQuestProgress('wbCompleted', 1);
        updateStats('wbChallenges', 1);
        updateStats('wbCorrect', 1);
        checkAchievements('word_builder_correct', {});
    } else {
        state.wbAttempts++;
        previewEl.classList.add('text-rose-500', 'animate-shake');
        setTimeout(() => previewEl.classList.remove('text-rose-500', 'animate-shake'), 400);
    }
}

function nextWbChallenge() {
    state.wbAttempts = 0;
    renderWordBuilder();
}

// ==========================================
// FEATURE C: CHART DECRYPTER
// ==========================================
function renderChartDecrypter() {
    const challenge = chartSentences[state.cdOrder[state.cdIndex]];
    state.cdAttempts = 0;

    document.getElementById('cd-counter').textContent =
        `${state.cdIndex + 1}/${state.cdOrder.length}`;
    document.getElementById('cd-sentence').innerHTML = challenge.text;

    const input = document.getElementById('cd-input');
    input.value = '';
    input.disabled = false;

    // Reset styles
    input.classList.remove('border-green-500', 'bg-green-50', 'border-rose-500', 'bg-rose-50',
                           'text-green-800', 'text-rose-800', 'border-amber-400', 'bg-amber-50', 'text-amber-800');
    input.classList.add('border-gray-200', 'bg-white');

    document.getElementById('cd-feedback').classList.add('hidden');
    document.getElementById('cd-btn-check').classList.remove('hidden');
    document.getElementById('cd-btn-reveal').classList.add('hidden');
    document.getElementById('cd-btn-next').classList.add('hidden');
    input.focus();
}

async function gradeWithGemma4(userVal, sentence, targetVal) {
    const prompt = `You are a strict medical assessor. The user translated a medical term from a clinical sentence.
Sentence: "${sentence}"
Target translation: "${targetVal}"
User's literal translation: "${userVal}"

Evaluate if the user's translation is semantically correct. It does not need to be an exact string match, just capture the correct medical meaning.
Return ONLY a valid JSON object in this exact format: {"isCorrect": true/false, "feedback": "Brief 1-sentence explanation"}`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: TUTOR_MODEL,
                prompt: prompt,
                stream: false,
                format: 'json',
                options: {
                    num_ctx: 512,
                    num_predict: 100
                }
            })
        });
        if (!response.ok) throw new Error('Ollama not responding properly');
        const data = await response.json();
        const jsonString = data.response.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Gemma 4 grading failed, falling back to exact match.", e);
        return null;
    }
}

async function gradeAdWithGemma4(userVal, abbrev, canonicalMeaning) {
    const prompt = `You are a medical education tutor grading a student's knowledge of medical abbreviations.
Abbreviation: "${abbrev}"
Canonical meaning: "${canonicalMeaning}"
Student's answer: "${userVal}"

Determine if the student's answer correctly captures the meaning of this abbreviation. Accept reasonable paraphrases, alternate spellings, synonyms, and correct-but-differently-worded answers. Be encouraging.
Return ONLY a valid JSON object: {"isCorrect": true/false, "feedback": "One encouraging sentence of feedback"}`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: TUTOR_MODEL,
                prompt: prompt,
                stream: false,
                format: 'json',
                options: { num_ctx: 512, num_predict: 100 }
            })
        });
        if (!response.ok) throw new Error('Ollama not responding');
        const data = await response.json();
        const jsonString = data.response.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Gemma 4 abbreviation grading failed, falling back to exact match.', e);
        return null;
    }
}

async function checkCdAnswer() {
    const input     = document.getElementById('cd-input');
    const btn       = document.getElementById('cd-btn-check');
    const userVal   = input.value.trim().toLowerCase();
    const challenge = chartSentences[state.cdOrder[state.cdIndex]];
    const feedback  = document.getElementById('cd-feedback');

    // Set UI to loading state
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...';
    btn.disabled = true;
    input.disabled = true;

    let isCorrect = false;
    let feedbackMsg = "";

    // Strip HTML from sentence for the prompt
    const plainTextSentence = challenge.text.replace(/<[^>]*>?/gm, '');

    // Attempt Semantic Grading via Gemma 4
    const gemmaResult = await gradeWithGemma4(userVal, plainTextSentence, challenge.answer);

    if (gemmaResult !== null && typeof gemmaResult.isCorrect === 'boolean') {
        isCorrect   = gemmaResult.isCorrect;
        feedbackMsg = gemmaResult.feedback || (isCorrect ? "Correct translation!" : "Incorrect. Please try again.");
    } else {
        // Graceful Fallback: Exact String Match (ignoring punctuation)
        const cleanUserVal  = userVal.replace(/[^\w\s]/gi, '').trim();
        const cleanAnswer   = challenge.answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
        const cleanFallback = challenge.fallback.toLowerCase().replace(/[^\w\s]/gi, '').trim();

        isCorrect   = cleanUserVal === cleanAnswer || cleanUserVal === cleanFallback;
        feedbackMsg = isCorrect ? "Correct translation!" : "Incorrect. Please try again.";
    }

    // Restore UI State
    btn.innerHTML = originalBtnText;
    btn.disabled  = false;

    if (isCorrect) {
        // Count correct only if this is the first attempt
        if (state.cdAttempts === 0) state.cdCorrect++;

        const xp = state.cdAttempts === 0 ? 35 : state.cdAttempts === 1 ? 20 : 10;
        awardXP(xp, 'chart-decrypter');
        updateQuestProgress('cdAnswered', 1);
        updateStats('cdAnswered', 1);
        updateStats('cdCorrect', 1);
        checkAchievements('chart_correct', {});

        input.classList.remove('border-gray-200', 'border-rose-500', 'bg-rose-50', 'text-rose-800');
        input.classList.add('border-green-500', 'bg-green-50', 'text-green-800');
        input.disabled = true;

        feedback.textContent = feedbackMsg;
        feedback.className   = 'mt-3 text-sm font-bold text-green-600 block';

        document.getElementById('cd-btn-check').classList.add('hidden');
        document.getElementById('cd-btn-reveal').classList.add('hidden');
        document.getElementById('cd-btn-next').classList.remove('hidden');
    } else {
        state.cdAttempts++;
        input.disabled = false; // Re-enable for retry
        input.classList.remove('border-gray-200');
        input.classList.add('border-rose-500', 'bg-rose-50', 'text-rose-800', 'animate-shake');

        setTimeout(() => input.classList.remove('animate-shake'), 400);

        feedback.textContent = feedbackMsg;
        feedback.className   = 'mt-3 text-sm font-bold text-rose-500 block';

        // After 2 failed attempts, offer the escape hatch
        if (state.cdAttempts >= 2) {
            document.getElementById('cd-btn-reveal').classList.remove('hidden');
        }
    }
}

function revealCdAnswer() {
    const challenge = chartSentences[state.cdOrder[state.cdIndex]];
    const input     = document.getElementById('cd-input');
    const feedback  = document.getElementById('cd-feedback');

    input.value = challenge.answer;
    input.disabled = true;
    input.classList.remove('border-gray-200', 'border-rose-500', 'bg-rose-50', 'text-rose-800',
                           'border-green-500', 'bg-green-50', 'text-green-800');
    input.classList.add('border-amber-400', 'bg-amber-50', 'text-amber-800');

    feedback.textContent = `Answer: "${challenge.answer}"`;
    feedback.className   = 'mt-3 text-sm font-bold text-amber-600 block';

    document.getElementById('cd-btn-check').classList.add('hidden');
    document.getElementById('cd-btn-reveal').classList.add('hidden');
    document.getElementById('cd-btn-next').classList.remove('hidden');
}

function nextCdChallenge() {
    state.cdIndex++;
    if (state.cdIndex >= state.cdOrder.length) {
        // Populate completion screen with honest score
        const total   = state.cdOrder.length;
        const correct = state.cdCorrect;
        const pct     = Math.round((correct / total) * 100);

        document.getElementById('cd-completion-title').textContent =
            pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Well Done!' : 'Keep Practicing!';
        document.getElementById('cd-completion-score').textContent =
            `${correct} / ${total} correct  (${pct}%)`;
        document.getElementById('cd-completion-msg').textContent =
            pct >= 90
                ? "You've mastered these clinical translations."
                : pct >= 70
                    ? "Good effort — review the ones you missed and try again."
                    : "Review the bolded terms in your flashcards, then come back.";

        checkAchievements('cd_session_complete', { pct: pct });

        document.querySelector('#view-chart-decrypter > div:first-child').classList.add('hidden');
        document.getElementById('cd-completion').classList.remove('hidden');
    } else {
        renderChartDecrypter();
    }
}

function restartCd() {
    // Build pool: filter by active system when it's a body system, otherwise use all 30
    const bodySystems = ['Cardiovascular','Digestive','Respiratory','Nervous','Musculoskeletal',
                         'Integumentary','Endocrine','Urinary','Reproductive','Blood/Immune',
                         'Special Senses','Foundations'];
    let indices = chartSentences.map((_, i) => i);
    if (state.activeSystem !== 'All' && bodySystems.includes(state.activeSystem)) {
        const filtered = indices.filter(i => chartSentences[i].system === state.activeSystem);
        if (filtered.length > 0) indices = filtered; // fall back to all if none match
    }
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    state.cdOrder    = indices;
    state.cdIndex    = 0;
    state.cdCorrect  = 0;
    state.cdAttempts = 0;
    document.getElementById('cd-completion').classList.add('hidden');
    document.querySelector('#view-chart-decrypter > div:first-child').classList.remove('hidden');
    renderChartDecrypter();
}

// ==========================================
// FEATURE F: ABBREVIATION DECODER
// ==========================================
const ABBREV_DATA = [
    // Dosing / timing
    { term: 'PRN',   meaning: 'as needed' },
    { term: 'STAT',  meaning: 'immediately' },
    { term: 'BID',   meaning: 'twice a day' },
    { term: 'TID',   meaning: 'three times a day' },
    { term: 'QID',   meaning: 'four times a day' },
    { term: 'QD',    meaning: 'every day' },
    { term: 'QHS',   meaning: 'every bedtime' },
    { term: 'AC',    meaning: 'before meals' },
    { term: 'PC',    meaning: 'after meals' },
    { term: 'NPO',   meaning: 'nothing by mouth' },
    // Routes of administration
    { term: 'PO',    meaning: 'by mouth' },
    { term: 'IV',    meaning: 'intravenous' },
    { term: 'IM',    meaning: 'intramuscular' },
    { term: 'SQ',    meaning: 'subcutaneous' },
    { term: 'SL',    meaning: 'sublingual' },
    // Vital signs
    { term: 'BP',    meaning: 'blood pressure' },
    { term: 'HR',    meaning: 'heart rate' },
    { term: 'RR',    meaning: 'respiratory rate' },
    { term: 'SpO2',  meaning: 'oxygen saturation' },
    { term: 'Temp',  meaning: 'temperature' },
    // Diagnoses
    { term: 'HTN',   meaning: 'hypertension' },
    { term: 'DM',    meaning: 'diabetes mellitus' },
    { term: 'MI',    meaning: 'myocardial infarction' },
    { term: 'CHF',   meaning: 'congestive heart failure' },
    { term: 'COPD',  meaning: 'chronic obstructive pulmonary disease' },
    { term: 'GERD',  meaning: 'gastroesophageal reflux disease' },
    { term: 'UTI',   meaning: 'urinary tract infection' },
    { term: 'URI',   meaning: 'upper respiratory infection' },
    { term: 'DVT',   meaning: 'deep vein thrombosis' },
    { term: 'CAD',   meaning: 'coronary artery disease' },
    { term: 'CVA',   meaning: 'cerebrovascular accident' },
    { term: 'TIA',   meaning: 'transient ischemic attack' },
    { term: 'AFib',  meaning: 'atrial fibrillation' },
    { term: 'ACS',   meaning: 'acute coronary syndrome' },
    { term: 'SOB',   meaning: 'shortness of breath' },
    { term: 'LOC',   meaning: 'loss of consciousness' },
    // Labs & values
    { term: 'CBC',   meaning: 'complete blood count' },
    { term: 'BMP',   meaning: 'basic metabolic panel' },
    { term: 'CMP',   meaning: 'comprehensive metabolic panel' },
    { term: 'UA',    meaning: 'urinalysis' },
    { term: 'WBC',   meaning: 'white blood cell' },
    { term: 'RBC',   meaning: 'red blood cell' },
    { term: 'Hgb',   meaning: 'hemoglobin' },
    { term: 'Hct',   meaning: 'hematocrit' },
    { term: 'BUN',   meaning: 'blood urea nitrogen' },
    // Imaging
    { term: 'CT',    meaning: 'computed tomography' },
    { term: 'MRI',   meaning: 'magnetic resonance imaging' },
    { term: 'CXR',   meaning: 'chest x-ray' },
    { term: 'EKG',   meaning: 'electrocardiogram' },
    { term: 'US',    meaning: 'ultrasound' },
    // Chart / documentation
    { term: 'Dx',    meaning: 'diagnosis' },
    { term: 'Rx',    meaning: 'prescription' },
    { term: 'Hx',    meaning: 'history' },
    { term: 'Sx',    meaning: 'symptoms' },
    { term: 'Tx',    meaning: 'treatment' },
    { term: 'CC',    meaning: 'chief complaint' },
    { term: 'HPI',   meaning: 'history of present illness' },
    { term: 'PMH',   meaning: 'past medical history' },
    { term: 'FH',    meaning: 'family history' },
    { term: 'SH',    meaning: 'social history' },
    { term: 'ROS',   meaning: 'review of systems' },
    { term: 'VS',    meaning: 'vital signs' },
    { term: 'WNL',   meaning: 'within normal limits' },
    { term: 'NAD',   meaning: 'no acute distress' },
    { term: 'HEENT', meaning: 'head, eyes, ears, nose, throat' },
    // Settings & procedures
    { term: 'ICU',   meaning: 'intensive care unit' },
    { term: 'ER',    meaning: 'emergency room' },
    { term: 'OR',    meaning: 'operating room' },
    { term: 'CPR',   meaning: 'cardiopulmonary resuscitation' },
    { term: 'DNR',   meaning: 'do not resuscitate' },
    { term: 'CABG',  meaning: 'coronary artery bypass graft' },
    { term: 'NKDA',  meaning: 'no known drug allergies' },
];

let abbrevPool = [];

function renderAbbrevDecoder() {
    // Initialize pool from built-in data if empty (also triggers on loop reset)
    if (abbrevPool.length === 0) {
        abbrevPool = [...ABBREV_DATA];
        // Fisher-Yates shuffle
        for (let i = abbrevPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [abbrevPool[i], abbrevPool[j]] = [abbrevPool[j], abbrevPool[i]];
        }
        state.adIndex = 0;
    }
    
    state.adAttempts = 0;
    const challenge = abbrevPool[state.adIndex];
    document.getElementById('ad-target').textContent = challenge.term;
    
    const input = document.getElementById('ad-input');
    input.value = '';
    input.disabled = false;
    input.classList.remove('border-green-500', 'bg-green-50', 'border-rose-500', 'bg-rose-50', 'text-green-800', 'text-rose-800');
    input.classList.add('border-gray-200', 'bg-white');
    
    document.getElementById('ad-feedback').classList.add('hidden');
    document.getElementById('ad-btn-check').classList.remove('hidden');
    document.getElementById('ad-btn-next').classList.add('hidden');
}

async function checkAdAnswer() {
    const input     = document.getElementById('ad-input');
    const btn       = document.getElementById('ad-btn-check');
    const userVal   = input.value.trim().toLowerCase();
    const challenge = abbrevPool[state.adIndex];
    const feedback  = document.getElementById('ad-feedback');

    // Loading state
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Grading...';
    btn.disabled  = true;
    input.disabled = true;

    let isCorrect  = false;
    let feedbackMsg = '';

    // Attempt semantic grading via Gemma 4
    const gemmaResult = await gradeAdWithGemma4(userVal, challenge.term, challenge.meaning);

    if (gemmaResult !== null && typeof gemmaResult.isCorrect === 'boolean') {
        isCorrect   = gemmaResult.isCorrect;
        feedbackMsg = gemmaResult.feedback || (isCorrect ? 'Correct!' : `Incorrect. Expected: ${challenge.meaning}`);
    } else {
        // Graceful fallback: exact string match
        isCorrect   = userVal === challenge.meaning.toLowerCase();
        feedbackMsg = isCorrect ? 'Correct!' : `Incorrect. Expected: ${challenge.meaning}`;
    }

    // Restore button
    btn.innerHTML = originalBtnText;
    btn.disabled  = false;

    if (isCorrect) {
        const xp = state.adAttempts === 0 ? 20 : 10;
        awardXP(xp, 'abbrev-decoder');
        updateQuestProgress('adCompleted', 1);
        updateStats('adAnswered', 1);
        updateStats('adCorrect', 1);
        checkAchievements('abbrev_correct', {});

        input.classList.remove('border-gray-200', 'bg-white', 'border-rose-500', 'bg-rose-50', 'text-rose-800');
        input.classList.add('border-green-500', 'bg-green-50', 'text-green-800');
        input.disabled = true;

        feedback.textContent = feedbackMsg;
        feedback.className   = 'mt-4 text-sm font-bold text-green-600 block';

        document.getElementById('ad-btn-check').classList.add('hidden');
        document.getElementById('ad-btn-next').classList.remove('hidden');
    } else {
        state.adAttempts++;
        input.classList.remove('border-gray-200', 'bg-white', 'border-green-500', 'bg-green-50', 'text-green-800');
        input.classList.add('border-rose-500', 'bg-rose-50', 'text-rose-800', 'animate-shake');
        input.disabled = false;

        setTimeout(() => input.classList.remove('animate-shake'), 400);

        feedback.textContent = feedbackMsg;
        feedback.className   = 'mt-4 text-sm font-bold text-rose-500 block';
    }
}

function nextAdChallenge() {
    state.adIndex++;
    if (state.adIndex >= abbrevPool.length) {
        abbrevPool = []; // Clear so renderAbbrevDecoder reshuffles on next loop
        state.adIndex = 0;
    }
    renderAbbrevDecoder();
}

// ==========================================
// FEATURE E: PLURALIZATION ENGINE
// ==========================================
const pluralRules = [
    { endsWith: 'a', replaceWith: 'ae', rule: "If singular ends in -a, drop the -a and add -ae.", examples: [{sing: 'vertebra', pl: 'vertebrae'}, {sing: 'bursa', pl: 'bursae'}] },
    { endsWith: 'ax', replaceWith: 'aces', rule: "If singular ends in -ax, drop the -ax and add -aces.", examples: [{sing: 'thorax', pl: 'thoraces'}] },
    { endsWith: 'ex', replaceWith: 'ices', rule: "If singular ends in -ex, drop it and add -ices.", examples: [{sing: 'apex', pl: 'apices'}, {sing: 'cortex', pl: 'cortices'}] },
    { endsWith: 'ix', replaceWith: 'ices', rule: "If singular ends in -ix, drop it and add -ices.", examples: [{sing: 'appendix', pl: 'appendices'}, {sing: 'cervix', pl: 'cervices'}] },
    { endsWith: 'is', replaceWith: 'es', rule: "If singular ends in -is, drop the -is and add -es.", examples: [{sing: 'diagnosis', pl: 'diagnoses'}, {sing: 'testis', pl: 'testes'}] },
    { endsWith: 'ma', replaceWith: 'mata', rule: "If singular ends in -ma, drop the -ma and add -mata.", examples: [{sing: 'carcinoma', pl: 'carcinomata'}, {sing: 'stigma', pl: 'stigmata'}] },
    { endsWith: 'nx', replaceWith: 'nges', rule: "If singular ends in -nx, drop the -nx and add -nges.", examples: [{sing: 'phalanx', pl: 'phalanges'}, {sing: 'larynx', pl: 'larynges'}] },
    { endsWith: 'on', replaceWith: 'a', rule: "If singular ends in -on, drop the -on and add -a.", examples: [{sing: 'ganglion', pl: 'ganglia'}, {sing: 'spermatozoon', pl: 'spermatozoa'}] },
    { endsWith: 'um', replaceWith: 'a', rule: "If singular ends in -um, drop the -um and add -a.", examples: [{sing: 'bacterium', pl: 'bacteria'}, {sing: 'ovum', pl: 'ova'}] },
    { endsWith: 'us', replaceWith: 'i', rule: "If singular ends in -us, drop the -us and add -i.", examples: [{sing: 'bronchus', pl: 'bronchi'}, {sing: 'nucleus', pl: 'nuclei'}, {sing: 'alveolus', pl: 'alveoli'}] }
];

let pluralChallengePool = [];
function renderPluralization() {
    if (state.plIndex === 0 || pluralChallengePool.length === 0) {
        pluralChallengePool = [];
        pluralRules.forEach(ruleObj => {
            ruleObj.examples.forEach(ex => {
                pluralChallengePool.push({ ...ruleObj, ...ex });
            });
        });
        pluralChallengePool.sort(() => 0.5 - Math.random());
    }

    const challenge = pluralChallengePool[state.plIndex];
    document.getElementById('pl-target').textContent = challenge.sing;
    document.getElementById('pl-rule-text').textContent = challenge.rule;

    const input = document.getElementById('pl-input');
    input.value = '';
    input.disabled = false;
    input.classList.remove('border-green-500', 'bg-green-50', 'border-rose-500', 'bg-rose-50', 'text-green-800', 'text-rose-800');
    input.classList.add('border-gray-200', 'bg-white');

    document.getElementById('pl-feedback').classList.add('hidden');
    document.getElementById('pl-btn-check').classList.remove('hidden');
    document.getElementById('pl-btn-next').classList.add('hidden');
}

function checkPluralAnswer() {
    const input = document.getElementById('pl-input');
    const userVal = input.value.trim().toLowerCase();
    const challenge = pluralChallengePool[state.plIndex];
    const feedback = document.getElementById('pl-feedback');

    if (userVal === challenge.pl.toLowerCase()) {
        state.plConsecutiveCorrect++;
        let xp = 10;
        if (state.plConsecutiveCorrect % 5 === 0) xp += 20;
        awardXP(xp, 'pluralization');
        updateQuestProgress('plCompleted', 1);
        updateStats('plAnswered', 1);
        updateStats('plCorrect', 1);
        checkAchievements('plural_correct', {});

        input.classList.remove('border-gray-200', 'bg-white', 'border-rose-500', 'bg-rose-50', 'text-rose-800');
        input.classList.add('border-green-500', 'bg-green-50', 'text-green-800');
        
        feedback.textContent = "Perfect Spelling!";
        feedback.className = "mt-2 text-sm font-bold text-green-600 block";
        
        document.getElementById('pl-btn-check').classList.add('hidden');
        document.getElementById('pl-btn-next').classList.remove('hidden');
    } else {
        state.plConsecutiveCorrect = 0;
        input.classList.remove('border-gray-200', 'bg-white', 'border-green-500', 'bg-green-50', 'text-green-800');
        input.classList.add('border-rose-500', 'bg-rose-50', 'text-rose-800', 'animate-shake');
        
        setTimeout(() => input.classList.remove('animate-shake'), 400);
        
        feedback.textContent = `Incorrect. The correct plural is: ${challenge.pl}`;
        feedback.className = "mt-2 text-sm font-bold text-rose-500 block";
    }
}

function nextPluralChallenge() {
    state.plIndex++;
    if (state.plIndex >= pluralChallengePool.length) {
        state.plIndex = 0; // Loop back
    }
    renderPluralization();
}

// ==========================================
// FEATURE G: AI TUTOR CHATBOT
// ==========================================
const TUTOR_MODEL = localStorage.getItem('syngnosia_tutor_model') || 'gemma4-26b';
const OLLAMA_URL  = 'http://localhost:11434';

function buildTutorSystemPrompt() {
    const sys = state.activeSystem;
    let mastered = 0, learning = 0, newCards = 0;
    dictionary.forEach(t => {
        const iv = state.intervals[t.id] || 0;
        if      (iv >= 7) mastered++;
        else if (iv >= 1) learning++;
        else              newCards++;
    });
    return `You are Dr. Lex, an expert medical terminology tutor embedded in the Medical Terminology learning app. You are warm, encouraging, and precise.

STUDENT CONTEXT (live):
- Currently studying: ${sys === 'All' ? 'All body systems' : sys}
- Terms mastered (reviewed 7+ times): ${mastered}
- Terms in active learning: ${learning}
- New terms not yet studied: ${newCards}
- Total terms in deck: ${dictionary.length}

YOUR ROLE:
• Answer questions about any medical term — prefix/suffix/root meaning, etymology, clinical usage
• Break down complex terms into their components (e.g., "hepato" + "megaly" = liver + enlargement)
• Give mnemonics and memory tricks when asked or when useful
• Quiz the student on demand — ask 3–5 short questions when requested
• Keep answers concise (2–4 sentences) unless the student asks for more detail
• Use real clinical examples to make terms memorable
• Be encouraging — this is difficult material

HARD BOUNDARIES:
• Never provide medical diagnosis, treatment advice, or clinical recommendations
• You are an educational study tool only, not a medical professional
• If asked a non-medical question, politely redirect: "I'm specialized in medical terminology — want to explore some terms together?"`;
}

async function checkOllamaStatus() {
    const dot    = document.getElementById('chat-status-dot');
    const text   = document.getElementById('chat-status-text');
    const banner = document.getElementById('chat-offline-banner');
    if (!dot) return false; // tutor tab not in DOM yet
    try {
        const res = await fetch(`${OLLAMA_URL}/api/ps`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            dot.className    = 'inline-block w-2 h-2 rounded-full bg-green-500';
            text.textContent = 'Dr. Lex is ready';
            banner.classList.add('hidden');
            return true;
        }
    } catch {}
    dot.className    = 'inline-block w-2 h-2 rounded-full bg-red-400';
    text.textContent = 'Ollama offline';
    banner.classList.remove('hidden');
    return false;
}

function appendChatBubble(role, text) {
    const msgsEl  = document.getElementById('chat-messages');
    const emptyEl = document.getElementById('chat-empty-state');
    if (emptyEl) emptyEl.remove();

    const wrap   = document.createElement('div');
    const bubble = document.createElement('div');
    if (role === 'user') {
        wrap.className   = 'flex justify-end';
        bubble.className = 'max-w-[80%] bg-violet-600 text-white px-4 py-3 rounded-3xl rounded-br-lg text-sm font-medium leading-relaxed';
    } else {
        wrap.className   = 'flex justify-start';
        bubble.className = 'max-w-[85%] bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-3xl rounded-bl-lg text-sm font-medium leading-relaxed text-gray-800 whitespace-pre-wrap';
    }
    bubble.textContent = text;
    wrap.appendChild(bubble);
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return bubble; // returned so streaming can update it
}

function appendTypingIndicator() {
    const msgsEl  = document.getElementById('chat-messages');
    const emptyEl = document.getElementById('chat-empty-state');
    if (emptyEl) emptyEl.remove();

    const wrap = document.createElement('div');
    wrap.id = 'chat-typing-indicator';
    wrap.className = 'flex justify-start';
    wrap.innerHTML = `<div class="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-3xl rounded-bl-lg flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
    </div>`;
    msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
}

async function sendChatMessage() {
    const input   = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-btn-send');
    const userText = input.value.trim();
    if (!userText) return;

    appendChatBubble('user', userText);
    updateQuestProgress('tutorMessages', 1);
    input.value = '';
    input.style.height = 'auto';

    // Lock UI
    sendBtn.disabled = true;
    input.disabled   = true;

    // Build payload: system + capped rolling history + new user turn
    const MAX_TURNS = 20; // 10 exchanges
    state.chatHistory.push({ role: 'user', content: userText });
    if (state.chatHistory.length > MAX_TURNS) state.chatHistory = state.chatHistory.slice(-MAX_TURNS);

    const messages = [
        { role: 'system', content: buildTutorSystemPrompt() },
        ...state.chatHistory
    ];

    appendTypingIndicator();

    let assistantText = '';
    let firstToken    = true;
    let bubbleEl      = null;

    try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: TUTOR_MODEL,
                messages,
                stream: true,
                options: { temperature: 1.0, top_p: 0.95, top_k: 64, num_ctx: 4096 }
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        const msgsEl  = document.getElementById('chat-messages');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
            for (const line of lines) {
                let data;
                try { data = JSON.parse(line); } catch { continue; }
                const token = data.message?.content;
                if (token) {
                    if (firstToken) {
                        removeTypingIndicator();
                        bubbleEl   = appendChatBubble('assistant', '');
                        firstToken = false;
                    }
                    assistantText += token;
                    bubbleEl.textContent = assistantText;
                    msgsEl.scrollTop = msgsEl.scrollHeight;
                }
                if (data.done) break;
            }
        }
    } catch {
        removeTypingIndicator();
        appendChatBubble('assistant', 'Sorry, I had trouble connecting to Ollama. Make sure it\'s running and try again.');
        checkOllamaStatus();
    }

    // Push assistant reply to history (content only, no thinking tokens)
    if (assistantText) {
        state.chatHistory.push({ role: 'assistant', content: assistantText });
        if (state.chatHistory.length > MAX_TURNS) state.chatHistory = state.chatHistory.slice(-MAX_TURNS);
    }

    sendBtn.disabled = false;
    input.disabled   = false;
    input.focus();
}

function clearChat() {
    state.chatHistory = [];
    const msgsEl = document.getElementById('chat-messages');
    msgsEl.innerHTML = `
        <div id="chat-empty-state" class="flex flex-col items-center justify-center text-center py-8">
            <div class="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4 border border-violet-100">
                <i class="fa-solid fa-robot text-2xl text-violet-400"></i>
            </div>
            <p class="text-gray-500 font-medium mb-5 text-sm">Ask me anything about medical terminology!</p>
            <div class="flex flex-wrap justify-center gap-2" id="chat-suggestions">
                <button class="chat-suggestion px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:text-violet-600 transition-colors shadow-sm">Break down "hepatomegaly"</button>
                <button class="chat-suggestion px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:text-violet-600 transition-colors shadow-sm">Quiz me on current terms</button>
                <button class="chat-suggestion px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:text-violet-600 transition-colors shadow-sm">Mnemonic for "myalgia"</button>
                <button class="chat-suggestion px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-full hover:border-violet-300 hover:text-violet-600 transition-colors shadow-sm">-itis vs -osis difference</button>
            </div>
        </div>`;
    setupSuggestionChips();
}

function setupSuggestionChips() {
    document.querySelectorAll('.chat-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            input.value = btn.textContent;
            sendChatMessage();
        });
    });
}
