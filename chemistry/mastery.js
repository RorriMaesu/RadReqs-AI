/**
 * CH 104Z / 124Z Mastery State Manager & Syllabus Parser
 * Sits in mastery.js acting as the global state and persistence coordinator.
 */

// Lesson states:
// 0: Locked
// 1: Active (Navigating Stages 1-4)
// 2: Homework Pending (Passed Socratic + Sandbox; must complete homework)
// 3: Mastered (Passed Homework > 80%. Unlocks next chronological lesson)
// 4: Rusted (Timestamp indicates 7+ days since mastery)

const STATE_LOCKED = 0;
const STATE_ACTIVE = 1;
const STATE_HW_PENDING = 2;
const STATE_MASTERED = 3;
const STATE_RUSTED = 4;

const RUST_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in ms

/**
 * Parses and initializes the global mastery matrix in localStorage.
 * If not existing, sets all to 0 except lesson_1_i which defaults to 1.
 */
function initMasteryMatrix(syllabus) {
    let matrix = localStorage.getItem('masteryMatrix');
    if (!matrix) {
        matrix = {};
        // Seed database from syllabus
        syllabus.modules.forEach(mod => {
            syllabus.lessonsByModule[mod.id].forEach(lesson => {
                matrix[lesson.id] = {
                    state: STATE_LOCKED,
                    masteredAt: null
                };
            });
        });
        
        // Seed first lesson as Active
        if (syllabus.modules.length > 0 && syllabus.lessonsByModule[syllabus.modules[0].id].length > 0) {
            const firstLessonId = syllabus.lessonsByModule[syllabus.modules[0].id][0].id;
            matrix[firstLessonId] = {
                state: STATE_ACTIVE,
                masteredAt: null
            };
        }
        localStorage.setItem('masteryMatrix', JSON.stringify(matrix));
    } else {
        // Parse and check for rust updates dynamically
        matrix = JSON.parse(matrix);
        let updated = false;
        Object.keys(matrix).forEach(id => {
            const item = matrix[id];
            if (item.state === STATE_MASTERED && item.masteredAt) {
                const elapsed = Date.now() - new Date(item.masteredAt).getTime();
                if (elapsed >= RUST_INTERVAL_MS) {
                    item.state = STATE_RUSTED;
                    updated = true;
                }
            }
        });
        if (updated) {
            localStorage.setItem('masteryMatrix', JSON.stringify(matrix));
        }
    }
    return matrix;
}

/**
 * Safely updates a lesson's state and saves to localStorage.
 * Also unlocks next lesson if state transitions to MASTERED.
 */
function updateLessonState(lessonId, newState) {
    const syllabus = window.syllabusData;
    let matrix = JSON.parse(localStorage.getItem('masteryMatrix') || '{}');
    
    if (!matrix[lessonId]) {
        matrix[lessonId] = { state: STATE_LOCKED, masteredAt: null };
    }
    
    matrix[lessonId].state = newState;
    if (newState === STATE_MASTERED) {
        matrix[lessonId].masteredAt = new Date().toISOString();
        
        // Unlock next chronological lesson
        unlockNextChronologicalLesson(lessonId, matrix, syllabus);
    } else {
        matrix[lessonId].masteredAt = null;
    }
    
    localStorage.setItem('masteryMatrix', JSON.stringify(matrix));
    
    // Dispatch custom event to let other scripts know state changed
    window.dispatchEvent(new CustomEvent('masteryMatrixChanged', { detail: matrix }));
    
    // Recalculate progress bars
    updateGlobalProgress(matrix, syllabus);
}

/**
 * Finds and unlocks the next chronological lesson in the syllabus
 */
function unlockNextChronologicalLesson(completedLessonId, matrix, syllabus) {
    if (!syllabus) return;
    
    // Compile a flat list of lesson IDs
    let allLessonIds = [];
    syllabus.modules.forEach(mod => {
        syllabus.lessonsByModule[mod.id].forEach(l => {
            allLessonIds.push(l.id);
        });
    });
    
    const currentIndex = allLessonIds.indexOf(completedLessonId);
    if (currentIndex !== -1 && currentIndex < allLessonIds.length - 1) {
        const nextLessonId = allLessonIds[currentIndex + 1];
        // Only change if it's currently locked
        if (!matrix[nextLessonId] || matrix[nextLessonId].state === STATE_LOCKED) {
            matrix[nextLessonId] = {
                state: STATE_ACTIVE,
                masteredAt: null
            };
        }
    }
}

/**
 * Calculates and updates UI elements representing overall cohort completion.
 */
function updateGlobalProgress(matrix, syllabus) {
    if (!syllabus) return;
    
    let totalLessons = 0;
    let masteredCount = 0;
    
    syllabus.modules.forEach(mod => {
        syllabus.lessonsByModule[mod.id].forEach(l => {
            totalLessons++;
            const status = matrix[l.id];
            if (status && (status.state === STATE_MASTERED || status.state === STATE_RUSTED)) {
                masteredCount++;
            }
        });
    });
    
    const percentage = totalLessons > 0 ? Math.round((masteredCount / totalLessons) * 100) : 0;
    
    const progressVal = document.getElementById('progress-val');
    const progressBar = document.getElementById('progress-bar');
    
    if (progressVal) progressVal.textContent = `${percentage}% Completed`;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    
    const activeCountSpan = document.getElementById('sidebar-lesson-count');
    if (activeCountSpan) {
        activeCountSpan.textContent = `${masteredCount}/${totalLessons} Lessons`;
    }
}

/**
 * Caches local session info to survive browser refreshes.
 */
function saveSessionState(lessonId, stageState, messageHistory) {
    const sessionData = {
        lessonId: lessonId,
        stageState: stageState,
        messageHistory: messageHistory
    };
    sessionStorage.setItem('activeLessonState', JSON.stringify(sessionData));
}

/**
 * Checks for session storage of active lesson state.
 */
function getSessionState() {
    const cached = sessionStorage.getItem('activeLessonState');
    return cached ? JSON.parse(cached) : null;
}

/**
 * Locates the highest unlocked lesson to direct route upon load.
 * Order: Active (1) > HW Pending (2) > Rusted (4) > Locked (0) or Mastered (3)
 */
function getHighestUnlockedLesson(matrix, syllabus) {
    if (!syllabus) return null;
    
    let allLessons = [];
    syllabus.modules.forEach(mod => {
        syllabus.lessonsByModule[mod.id].forEach(l => {
            allLessons.push(l);
        });
    });
    
    // Look first for existing Active (1) or HW Pending (2) or Rusted (4) lesson
    let activeLesson = allLessons.find(l => {
        const item = matrix[l.id];
        return item && (item.state === STATE_ACTIVE || item.state === STATE_HW_PENDING || item.state === STATE_RUSTED);
    });
    
    if (activeLesson) return activeLesson.id;
    
    // Look for first lesson that is Locked (0) (should theoretically not happen since preceding is mastered)
    // Fallback to highest unlocked lesson (any state > 0)
    let highestUnlocked = allLessons[0];
    for (let i = 0; i < allLessons.length; i++) {
        const item = matrix[allLessons[i].id];
        if (item && item.state > STATE_LOCKED) {
            highestUnlocked = allLessons[i];
        }
    }
    return highestUnlocked ? highestUnlocked.id : null;
}

/**
 * Reads chemistry_lesson_plan_CH104Z.md, parses modules and lessons, & maps details.
 */
async function loadSyllabus() {
    try {
        const response = await fetch('chemistry_lesson_plan_CH104Z.md');
        if (!response.ok) throw new Error('Failed to load lesson plan file');
        const markdown = await response.text();
        
        const lines = markdown.split('\n');
        
        let modules = [];
        let lessonsByModule = {};
        
        let currentModule = null;
        let currentLesson = null;
        
        let isConcept = false, isClinicalTab = false, isInteractive = false, isFeynman = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Module Match
            if (line.startsWith('## Module ')) {
                const modText = line.replace('## Module ', '').trim();
                const splitIndex = modText.indexOf(':');
                const num = modText.slice(0, splitIndex).trim();
                const title = modText.slice(splitIndex + 1).trim();
                
                currentModule = {
                    id: `module_${num}`,
                    number: num,
                    title: title
                };
                modules.push(currentModule);
                lessonsByModule[currentModule.id] = [];
                currentLesson = null;
                continue;
            }
            
            // Lesson Match
            if (line.startsWith('### Lesson ')) {
                const lesText = line.replace('### Lesson ', '').trim();
                const splitIndex = lesText.indexOf(':');
                const numStr = lesText.slice(0, splitIndex).trim(); // e.g. "1.1"
                const titleStr = lesText.slice(splitIndex + 1).trim();
                
                currentLesson = {
                    id: `lesson_${numStr.replace('.', '_')}`,
                    numStr: numStr,
                    title: titleStr,
                    concept: '',
                    clinical_tie_in: '',
                    interactive_target: '',
                    feynman_prompt: ''
                };
                
                if (currentModule) {
                    lessonsByModule[currentModule.id].push(currentLesson);
                }
                continue;
            }
            
            // Parameters inside a lesson
            if (currentLesson && line.startsWith('* **')) {
                if (line.includes('**Concept:**')) {
                    currentLesson.concept = line.split('**Concept:**')[1].trim();
                } else if (line.includes('**Clinical Tie-In:**')) {
                    currentLesson.clinical_tie_in = line.split('**Clinical Tie-In:**')[1].trim();
                } else if (line.includes('**Interactive Target:**')) {
                    currentLesson.interactive_target = line.split('**Interactive Target:**')[1].trim().replace(/`/g, '');
                } else if (line.includes('**Feynman Prompt:**')) {
                    currentLesson.feynman_prompt = line.split('**Feynman Prompt:**')[1].trim().replace(/"/g, '');
                }
            }
        }
        
        const syllabus = { modules, lessonsByModule };
        window.syllabusData = syllabus;
        return syllabus;
        
    } catch (e) {
        console.error('Error loading or parsing syllabus:', e);
        return null;
    }
}

/**
 * Logic to map UI states visually to icon & styling frameworks.
 */
function getLessonStateMeta(state) {
    switch (state) {
        case STATE_LOCKED:
            return {
                icon: 'fa-lock text-slate-600',
                btnClass: 'text-slate-500 hover:text-slate-400 cursor-not-allowed bg-slate-900/40 p-2.5 rounded border border-slate-950 flex items-center justify-between',
                badgeText: 'LOCKED',
                badgeClass: 'bg-slate-900 border border-slate-800 text-slate-500'
            };
        case STATE_ACTIVE:
            return {
                icon: 'fa-graduation-cap text-yellow-500',
                btnClass: 'text-yellow-400 hover:bg-slate-850 bg-slate-850 p-2.5 rounded border border-yellow-500/20 flex items-center justify-between shadow-inner',
                badgeText: 'ACTIVE',
                badgeClass: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
            };
        case STATE_HW_PENDING:
            return {
                icon: 'fa-file-signature text-blue-400',
                btnClass: 'text-blue-300 hover:bg-slate-850 bg-slate-900/80 p-2.5 rounded border border-blue-500/20 flex items-center justify-between',
                badgeText: 'HW PENDING',
                badgeClass: 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            };
        case STATE_MASTERED:
            return {
                icon: 'fa-circle-check text-emerald-500',
                btnClass: 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 p-2.5 rounded border border-emerald-500/10 flex items-center justify-between',
                badgeText: 'MASTERED',
                badgeClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold'
            };
        case STATE_RUSTED:
            return {
                icon: 'fa-triangle-exclamation text-amber-500',
                btnClass: 'text-amber-400 hover:bg-slate-850 bg-slate-900/90 p-2.5 rounded border border-amber-500/20 flex items-center justify-between animate-pulse-slow',
                badgeText: 'RUSTED',
                badgeClass: 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
            };
        default:
            return {};
    }
}

/**
 * Builds accordion system on left panel for Coursework side-by-side lessons list OR Assignments lists.
 */
function renderSidebar(syllabus, matrix) {
    const targetCw = document.getElementById('sidebar-skill-tree');
    const targetAs = document.getElementById('assignment-list');
    
    if (targetCw) {
        let html = '';
        syllabus.modules.forEach(mod => {
            const lessons = syllabus.lessonsByModule[mod.id];
            
            // Check if module is expanded (default: yes if contains active/hw-pending/rusted lesson)
            let isModuleActive = lessons.some(l => {
                const st = matrix[l.id] ? matrix[l.id].state : STATE_LOCKED;
                return st === STATE_ACTIVE || st === STATE_HW_PENDING || st === STATE_RUSTED;
            });
            
            // Fallback for first module if all locked
            if (mod.id === 'module_1' && lessons.every(l => !matrix[l.id] || matrix[l.id].state === STATE_LOCKED)) {
                isModuleActive = true;
            }

            html += `
            <div class="border border-slate-800 rounded overflow-hidden">
                <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full bg-slate-950 hover:bg-slate-900 text-left px-3 py-2.5 flex items-center justify-between text-xs font-bold font-mono tracking-wider border-b border-slate-850 select-none">
                    <span class="text-emerald-400 leading-tight">M${mod.number}: ${mod.title}</span>
                    <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
                </button>
                <div class="p-2 space-y-1 bg-slate-900/30 ${isModuleActive ? '' : 'hidden'}">
            `;
            
            lessons.forEach(l => {
                const st = matrix[l.id] ? matrix[l.id].state : STATE_LOCKED;
                const meta = getLessonStateMeta(st);
                
                html += `
                <button 
                    onclick="if(${st} > ${STATE_LOCKED}) { selectLesson('${l.id}') } else { alert('This clinical lecture is currently locked. Complete previous courseworks first!') }" 
                    class="w-full ${meta.btnClass} transition group text-left" 
                    id="sidebar-item-${l.id}"
                >
                    <div class="flex items-center space-x-2.5 truncate mr-2">
                        <i class="fa-solid ${meta.icon} shrink-0 w-4 text-center"></i>
                        <div class="truncate">
                            <span class="text-[10px] font-mono block text-slate-500 group-hover:text-slate-400">Lesson ${l.numStr}</span>
                            <span class="text-xs font-semibold block truncate leading-snug">${l.title}</span>
                        </div>
                    </div>
                    <span class="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded leading-none shrink-0 ${meta.badgeClass}">${meta.badgeText}</span>
                </button>
                `;
            });
            
            html += `
                </div>
            </div>
            `;
        });
        targetCw.innerHTML = html;
    }
    
    if (targetAs) {
        let html = '';
        syllabus.modules.forEach(mod => {
            const lessons = syllabus.lessonsByModule[mod.id];
            
            // Homework modules also filter locks
            let hasUnlockedHomework = lessons.some(l => {
                const st = matrix[l.id] ? matrix[l.id].state : STATE_LOCKED;
                return st >= STATE_HW_PENDING; // Must pass Theory to access homework binder!
            });

            html += `
            <div class="border border-slate-800 rounded overflow-hidden">
                <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full bg-slate-950 hover:bg-slate-900 text-left px-3 py-2 flex items-center justify-between text-xs font-bold font-mono tracking-wider border-b border-slate-850 select-none">
                    <span class="text-blue-400">M${mod.number} Lab Sheets</span>
                    <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
                </button>
                <div class="p-2 space-y-1 bg-slate-900/30 ${hasUnlockedHomework ? '' : 'hidden'}">
            `;
            
            lessons.forEach(l => {
                const st = matrix[l.id] ? matrix[l.id].state : STATE_LOCKED;
                const meta = getLessonStateMeta(st);
                const isHwLocked = st < STATE_HW_PENDING;
                
                // Redraw classes for assignments page
                let buttonClass = 'p-2 rounded text-left w-full transition flex items-center justify-between ';
                let badgeTxt = meta.badgeText;
                let badgeCls = meta.badgeClass;
                
                if (isHwLocked) {
                    buttonClass += 'text-slate-500 bg-slate-900/40 border border-slate-950 cursor-not-allowed';
                    badgeTxt = 'LOCKED';
                    badgeCls = 'bg-slate-900 border border-slate-805 text-slate-600';
                } else if (st === STATE_HW_PENDING) {
                    buttonClass += 'text-blue-300 bg-slate-850 hover:bg-slate-800 border border-blue-500/20 shadow-inner';
                } else {
                    buttonClass += 'text-emerald-400 bg-slate-900/60 hover:bg-slate-850 border border-emerald-500/10';
                }
                
                html += `
                <button 
                    onclick="if(!${isHwLocked}) { selectAssignment('${l.id}') } else { alert('Theory not qualified. You must pass this lesson\\'s Socratic lecture and its Sandbox mapping before testing clinical equations!') }" 
                    class="${buttonClass}" 
                    id="assignment-item-${l.id}"
                >
                    <div class="truncate mr-2 flex items-center space-x-2">
                        <i class="fa-solid ${isHwLocked ? 'fa-lock text-slate-600' : 'fa-clipboard-question text-blue-400'} shrink-0 text-xs"></i>
                        <div class="truncate">
                            <span class="text-[9px] font-mono block text-slate-500">LAB ${l.numStr}</span>
                            <span class="text-xs font-semibold block truncate leading-snug">${l.title}</span>
                        </div>
                    </div>
                    <span class="text-[8px] font-mono px-1 py-0.5 rounded leading-none shrink-0 ${badgeCls}">${badgeTxt}</span>
                </button>
                `;
            });
            
            html += `
                </div>
            </div>
            `;
        });
        targetAs.innerHTML = html;
    }
    
    // Highlight the currently selected item if page-specific selection states exist
    highlightActiveInSidebar();
}

/**
 * Visual highlight indicator
 */
function highlightActiveInSidebar() {
    const session = getSessionState();
    if (!session) return;
    
    const activeId = session.lessonId;
    if (!activeId) return;
    
    // Coursework highlighting
    const cwItem = document.getElementById(`sidebar-item-${activeId}`);
    if (cwItem) {
        cwItem.classList.add('ring-1', 'ring-emerald-500', 'bg-slate-800/80');
    }
    // Assignment highlighting
    const asItem = document.getElementById(`assignment-item-${activeId}`);
    if (asItem) {
        asItem.classList.add('ring-1', 'ring-blue-500', 'bg-slate-800/80');
    }
}

// Global initialization coordinator on script load
document.addEventListener('DOMContentLoaded', async () => {
    const syllabus = await loadSyllabus();
    if (syllabus) {
        const matrix = initMasteryMatrix(syllabus);
        renderSidebar(syllabus, matrix);
        updateGlobalProgress(matrix, syllabus);
        window.dispatchEvent(new CustomEvent('syllabusLoaded', { detail: { syllabus, matrix } }));
    }
});
