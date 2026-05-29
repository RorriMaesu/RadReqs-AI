// Hub Application Logic - Unified Study Companion
// Manages dynamic class creation, local storage persistence, course notebooks, checklists, and the Pomodoro focus timer.

const DEFAULT_MODULES = [
    {
        id: 'medical-terminology',
        title: 'Medical Terminology',
        description: 'Comprehensive clinical language mastery with Chart Decrypter and AI Tutor.',
        link: './syngnosia/index.html',
        category: 'Clinical Core',
        icon: 'fa-staff-snake',
        color: 'from-teal-500 to-emerald-600',
        isCore: true
    },
    {
        id: 'intro-to-chemistry',
        title: 'Intro to Chemistry',
        description: 'Atoms, bonding, reactions, and core chemistry concepts for healthcare foundations.',
        link: './chemistry/index.html',
        category: 'Core Sciences',
        icon: 'fa-flask-vial',
        color: 'from-amber-500 to-orange-600',
        isCore: true
    },
    {
        id: 'clinical-mathematics',
        title: 'Clinical Mathematics',
        description: 'Master clinical unit conversions, safety formatting, algebraic formulas, and scale-based logic.',
        link: './math/index.html',
        category: 'Core Sciences',
        icon: 'fa-square-root-variable',
        color: 'from-blue-500 to-indigo-600',
        isCore: true
    },
    {
        id: 'psychology-care',
        title: 'Psychology & Care',
        description: 'Patient interaction, behavioral sciences, and professional clinical ethics.',
        link: './psychology/index.html',
        category: 'Clinical Core',
        icon: 'fa-brain',
        color: 'from-purple-500 to-fuchsia-600',
        isCore: true
    }
];

const COLOR_PRESETS = [
    { name: 'Teal/Green', value: 'from-teal-500 to-emerald-600' },
    { name: 'Amber/Orange', value: 'from-amber-500 to-orange-600' },
    { name: 'Blue/Indigo', value: 'from-blue-500 to-indigo-600' },
    { name: 'Purple/Fuchsia', value: 'from-purple-500 to-fuchsia-600' },
    { name: 'Rose/Red', value: 'from-rose-500 to-red-600' },
    { name: 'Sky/Cyan', value: 'from-sky-500 to-cyan-600' }
];

const ICON_PRESETS = [
    'fa-book-open',
    'fa-dna',
    'fa-lungs',
    'fa-heart-pulse',
    'fa-circle-nodes',
    'fa-stethoscope',
    'fa-baby',
    'fa-wave-square',
    'fa-border-all',
    'fa-pen-nib',
    'fa-atom'
];

let customModules = [];
let activeFilter = 'all';

// Pomodoro Timer State
let timerInterval = null;
let timerTimeLeft = 25 * 60; // 25 minutes default
let timerMaxTime = 25 * 60;
let timerIsRunning = false;
let timerMode = 'focus'; // 'focus' or 'break'

// Selected course for current Pomodoro focus session
let timerSelectedCourseId = 'general'; 

// Active custom course being viewed in the notebook modal
let activeNotebookCourseId = null;

// Initialize Hub
document.addEventListener('DOMContentLoaded', () => {
    loadCustomModules();
    initTimer();
    renderFilters();
    renderCourseGrid();
    initModals();
    updateGlobalStats();
});

// Load Custom Modules from LocalStorage
function loadCustomModules() {
    try {
        const stored = localStorage.getItem('custom_study_modules');
        if (stored) {
            customModules = JSON.parse(stored);
        } else {
            customModules = [];
        }
    } catch (e) {
        console.error('Failed to load custom modules:', e);
        customModules = [];
    }
}

// Save Custom Modules to LocalStorage
function saveCustomModules() {
    localStorage.setItem('custom_study_modules', JSON.stringify(customModules));
    updateGlobalStats();
}

// Get all modules (Defaults + Custom)
function getAllModules() {
    return [...DEFAULT_MODULES, ...customModules];
}

// Render Filters
function renderFilters() {
    const filterContainer = document.getElementById('filter-pills');
    if (!filterContainer) return;

    // Get unique categories from all modules
    const modules = getAllModules();
    const categories = new Set();
    modules.forEach(m => {
        if (m.category) categories.add(m.category);
    });

    let html = `
        <button onclick="setFilter('all')" class="px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === 'all' ? 'bg-indigo-600 text-white border border-indigo-500' : 'glass-card text-slate-400 hover:text-white hover:bg-white/5'}">
            All Modules
        </button>
        <button onclick="setFilter('core')" class="px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === 'core' ? 'bg-indigo-600 text-white border border-indigo-500' : 'glass-card text-slate-400 hover:text-white hover:bg-white/5'}">
            Core Modules
        </button>
        <button onclick="setFilter('custom')" class="px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === 'custom' ? 'bg-indigo-600 text-white border border-indigo-500' : 'glass-card text-slate-400 hover:text-white hover:bg-white/5'}">
            Custom Classes
        </button>
    `;

    categories.forEach(cat => {
        const lowerCat = cat.toLowerCase();
        html += `
            <button onclick="setFilter('${lowerCat}')" class="px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === lowerCat ? 'bg-indigo-600 text-white border border-indigo-500' : 'glass-card text-slate-400 hover:text-white hover:bg-white/5'}">
                ${cat}
            </button>
        `;
    });

    filterContainer.innerHTML = html;
}

// Set Active Filter
window.setFilter = function(filter) {
    activeFilter = filter;
    renderFilters();
    renderCourseGrid();
};

// Render Course Grid
function renderCourseGrid() {
    const grid = document.getElementById('course-grid');
    if (!grid) return;

    const modules = getAllModules();
    let filtered = modules;

    if (activeFilter === 'core') {
        filtered = modules.filter(m => m.isCore);
    } else if (activeFilter === 'custom') {
        filtered = modules.filter(m => !m.isCore);
    } else if (activeFilter !== 'all') {
        filtered = modules.filter(m => m.category && m.category.toLowerCase() === activeFilter);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 glass-card rounded-3xl border border-white/5">
                <i class="fa-solid fa-folder-open text-4xl text-slate-600 mb-3"></i>
                <p class="text-slate-400 font-medium">No study modules found in this category.</p>
                <button onclick="openAddClassModal()" class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all">
                    Create Custom Class
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(m => {
        // Calculate task progress if custom
        let taskProgressText = '';
        if (!m.isCore) {
            const totalTasks = m.tasks ? m.tasks.length : 0;
            const completedTasks = m.tasks ? m.tasks.filter(t => t.completed).length : 0;
            taskProgressText = totalTasks > 0 
                ? `<div class="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                    <span>Tasks</span>
                    <span>${completedTasks}/${totalTasks}</span>
                   </div>`
                : '';
        }

        // Custom action handlers
        const clickAction = m.isCore 
            ? `href="${m.link}"` 
            : m.link 
                ? `href="${m.link}" target="_blank"` 
                : `href="#" onclick="openNotebookModal('${m.id}'); return false;"`;

        const badgeHtml = m.isCore 
            ? `<span class="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-extrabold border border-teal-500/20 uppercase tracking-wider">Core Module</span>` 
            : `<span class="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20 uppercase tracking-wider">${m.category}</span>`;

        const focusLoggedText = m.totalFocusSeconds && m.totalFocusSeconds > 0 
            ? `<span class="text-[10px] text-slate-500 font-bold ml-2 flex items-center gap-1"><i class="fa-solid fa-clock"></i> ${(m.totalFocusSeconds / 3600).toFixed(1)} hrs</span>` 
            : '';

        html += `
            <div class="block group relative">
                <a ${clickAction} class="block h-full">
                    <div class="glass-card rounded-3xl p-8 h-full transition-all duration-300 module-active relative overflow-hidden flex flex-col min-h-[220px]">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
                        
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center border border-white/10 shadow-lg">
                                <i class="fa-solid ${m.icon} text-2xl text-white"></i>
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${badgeHtml}
                                ${focusLoggedText}
                            </div>
                        </div>

                        <h3 class="text-2xl font-bold text-white mb-2 leading-snug group-hover:text-indigo-200 transition-colors">${m.title}</h3>
                        <p class="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">${m.description}</p>
                        
                        <div class="mt-auto flex items-center text-indigo-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                            ${m.isCore ? 'Launch Module' : m.link ? 'Open Resource' : 'Open Notebook'} <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>
                        </div>

                        ${taskProgressText}
                    </div>
                </a>

                ${!m.isCore ? `
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onclick="event.stopPropagation(); openEditClassModal('${m.id}');" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-md" title="Edit Course">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteCourse('${m.id}');" class="w-8 h-8 rounded-lg bg-red-950/80 hover:bg-red-800 text-red-400 hover:text-white flex items-center justify-center border border-red-900/50 shadow-lg backdrop-blur-md" title="Delete Course">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

// Global Statistics Dashboard Loader
function updateGlobalStats() {
    const statFocusText = document.getElementById('stat-total-focus');
    const statModulesText = document.getElementById('stat-active-modules');
    const statStreakText = document.getElementById('stat-streak');
    const timerSelect = document.getElementById('timer-course-select');

    if (!statFocusText || !statModulesText || !statStreakText) return;

    // Load focus time
    let totalSeconds = 0;
    customModules.forEach(m => {
        if (m.totalFocusSeconds) totalSeconds += m.totalFocusSeconds;
    });
    // Add default mock base or just tracked focus time
    const totalHours = (totalSeconds / 3600).toFixed(1);
    statFocusText.textContent = `${totalHours} hrs`;

    // Active modules count
    const totalModules = getAllModules().length;
    statModulesText.textContent = `${totalModules} Active`;

    // Streak tracker logic (standard localized read or fallback)
    const streak = localStorage.getItem('study_streak_count') || '3';
    statStreakText.textContent = `${streak} Days`;

    // Populate Pomodoro dropdown selector
    if (timerSelect) {
        let options = '<option value="general">General Study Focus</option>';
        getAllModules().forEach(m => {
            options += `<option value="${m.id}">${m.title}</option>`;
        });
        const currentSelected = timerSelectedCourseId;
        timerSelect.innerHTML = options;
        timerSelect.value = currentSelected;
    }
}

// ----------------------------------------------------
// POMODORO FOCUS TIMER MODULE
// ----------------------------------------------------
function initTimer() {
    const btnPlay = document.getElementById('timer-play');
    const btnPause = document.getElementById('timer-pause');
    const btnReset = document.getElementById('timer-reset');
    const display = document.getElementById('timer-display');
    const select = document.getElementById('timer-course-select');

    if (!btnPlay || !btnPause || !btnReset || !display) return;

    btnPlay.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);
    select.addEventListener('change', (e) => {
        timerSelectedCourseId = e.target.value;
    });

    updateTimerDisplay();
}

function startTimer() {
    if (timerIsRunning) return;
    timerIsRunning = true;
    
    document.getElementById('timer-play').classList.add('hidden');
    document.getElementById('timer-pause').classList.remove('hidden');

    timerInterval = setInterval(() => {
        timerTimeLeft--;
        
        // Accumulate focus time if focus mode is active and running
        if (timerMode === 'focus') {
            logFocusSecond();
        }

        if (timerTimeLeft <= 0) {
            playTimerAlert();
            switchTimerMode();
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!timerIsRunning) return;
    timerIsRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timer-play').classList.remove('hidden');
    document.getElementById('timer-pause').classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    timerTimeLeft = timerMode === 'focus' ? timerMaxTime : 5 * 60;
    updateTimerDisplay();
}

function switchTimerMode() {
    if (timerMode === 'focus') {
        timerMode = 'break';
        timerTimeLeft = 5 * 60; // 5 min break
        showNotification('Focus Session Complete!', 'Time for a well-deserved 5-minute break.');
    } else {
        timerMode = 'focus';
        timerTimeLeft = timerMaxTime;
        showNotification('Break Time Over!', 'Let\'s lock back into learning focus.');
    }
    resetTimer();
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const modeIndicator = document.getElementById('timer-mode-indicator');
    
    if (!display) return;

    const mins = Math.floor(timerTimeLeft / 60);
    const secs = timerTimeLeft % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (modeIndicator) {
        modeIndicator.textContent = timerMode === 'focus' ? 'Focus Session Active' : 'Break Time Active';
        modeIndicator.className = timerMode === 'focus' 
            ? 'text-xs font-extrabold text-indigo-400 uppercase tracking-widest' 
            : 'text-xs font-extrabold text-teal-400 uppercase tracking-widest';
    }
}

function logFocusSecond() {
    if (timerSelectedCourseId === 'general') return;
    
    // Find the course
    const mIndex = customModules.findIndex(m => m.id === timerSelectedCourseId);
    if (mIndex !== -1) {
        if (!customModules[mIndex].totalFocusSeconds) {
            customModules[mIndex].totalFocusSeconds = 0;
        }
        customModules[mIndex].totalFocusSeconds++;
        
        // Throttled save every 10 seconds to reduce write overhead
        if (customModules[mIndex].totalFocusSeconds % 10 === 0) {
            saveCustomModules();
            if (activeNotebookCourseId === timerSelectedCourseId) {
                updateNotebookFocusStats();
            }
        }
    }
}

function updateNotebookFocusStats() {
    const focusDisplay = document.getElementById('notebook-focus-time');
    if (!focusDisplay) return;
    const course = customModules.find(m => m.id === activeNotebookCourseId);
    if (course) {
        const hrs = (course.totalFocusSeconds ? course.totalFocusSeconds / 3600 : 0).toFixed(2);
        focusDisplay.textContent = `${hrs} hrs focused`;
    }
}

function playTimerAlert() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {
        console.warn('Audio alert not supported on this browser context.');
    }
}

function showNotification(title, message) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}

// ----------------------------------------------------
// MODAL MANAGEMENT & COURSE EDITOR (CRUD)
// ----------------------------------------------------
function initModals() {
    const modalAdd = document.getElementById('modal-add-class');
    const modalNotebook = document.getElementById('modal-notebook');
    
    // Auto-populate icons & colors in form presets
    const iconPresetContainer = document.getElementById('form-icon-presets');
    const colorPresetContainer = document.getElementById('form-color-presets');

    if (iconPresetContainer) {
        iconPresetContainer.innerHTML = ICON_PRESETS.map(icon => `
            <button type="button" onclick="selectFormIcon('${icon}')" id="preset-icon-${icon}" class="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                <i class="fa-solid ${icon}"></i>
            </button>
        `).join('');
    }

    if (colorPresetContainer) {
        colorPresetContainer.innerHTML = COLOR_PRESETS.map(p => `
            <button type="button" onclick="selectFormColor('${p.value}')" id="preset-color-${p.value.replace(/\//g, '_')}" class="w-full h-8 rounded-lg bg-gradient-to-br ${p.value} border border-white/10 hover:scale-105 transition-transform" title="${p.name}"></button>
        `).join('');
    }

    // Modal submit binding
    const form = document.getElementById('add-class-form');
    if (form) {
        form.addEventListener('submit', handleClassFormSubmit);
    }

    // Notebook text area bindings
    const notebookNotes = document.getElementById('notebook-notes');
    if (notebookNotes) {
        notebookNotes.addEventListener('input', (e) => {
            if (!activeNotebookCourseId) return;
            const idx = customModules.findIndex(m => m.id === activeNotebookCourseId);
            if (idx !== -1) {
                customModules[idx].notes = e.target.value;
                saveCustomModules();
            }
        });
    }
}

let selectedFormIcon = 'fa-book-open';
let selectedFormColor = 'from-indigo-500 to-violet-600';
let editingCourseId = null;

window.selectFormIcon = function(icon) {
    selectedFormIcon = icon;
    ICON_PRESETS.forEach(i => {
        const el = document.getElementById(`preset-icon-${i}`);
        if (el) {
            el.className = `w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center hover:bg-slate-800 transition-colors ${i === icon ? 'border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-white/5 text-slate-400 hover:text-white'}`;
        }
    });
};

window.selectFormColor = function(color) {
    selectedFormColor = color;
    COLOR_PRESETS.forEach(p => {
        const safeId = p.value.replace(/\//g, '_');
        const el = document.getElementById(`preset-color-${safeId}`);
        if (el) {
            el.className = `w-full h-8 rounded-lg bg-gradient-to-br ${p.value} border hover:scale-105 transition-all ${p.value === color ? 'border-white ring-2 ring-indigo-500 shadow-lg' : 'border-white/10'}`;
        }
    });
};

window.openAddClassModal = function() {
    editingCourseId = null;
    document.getElementById('modal-title-text').textContent = 'Add Custom Study Module';
    document.getElementById('add-class-form').reset();
    selectFormIcon('fa-book-open');
    selectFormColor('from-indigo-500 to-violet-600');
    
    document.getElementById('modal-add-class').classList.remove('hidden');
    document.getElementById('modal-add-class').classList.add('flex');
};

window.openEditClassModal = function(id) {
    const course = customModules.find(m => m.id === id);
    if (!course) return;

    editingCourseId = id;
    document.getElementById('modal-title-text').textContent = 'Edit Course Details';
    document.getElementById('course-name-input').value = course.title;
    document.getElementById('course-desc-input').value = course.description;
    document.getElementById('course-cat-input').value = course.category || 'General';
    document.getElementById('course-link-input').value = course.link || '';

    selectFormIcon(course.icon || 'fa-book-open');
    selectFormColor(course.color || 'from-indigo-500 to-violet-600');

    document.getElementById('modal-add-class').classList.remove('hidden');
    document.getElementById('modal-add-class').classList.add('flex');
};

window.closeAddClassModal = function() {
    document.getElementById('modal-add-class').classList.add('hidden');
    document.getElementById('modal-add-class').classList.remove('flex');
};

function handleClassFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('course-name-input').value.trim();
    const description = document.getElementById('course-desc-input').value.trim();
    const category = document.getElementById('course-cat-input').value.trim() || 'General';
    const link = document.getElementById('course-link-input').value.trim();

    if (!title || !description) return;

    if (editingCourseId) {
        // Edit Mode
        const idx = customModules.findIndex(m => m.id === editingCourseId);
        if (idx !== -1) {
            customModules[idx].title = title;
            customModules[idx].description = description;
            customModules[idx].category = category;
            customModules[idx].link = link;
            customModules[idx].icon = selectedFormIcon;
            customModules[idx].color = selectedFormColor;
        }
    } else {
        // Create Mode
        const newCourse = {
            id: 'custom-' + Date.now().toString(),
            title,
            description,
            category,
            link,
            icon: selectedFormIcon,
            color: selectedFormColor,
            isCore: false,
            notes: '',
            tasks: [],
            totalFocusSeconds: 0
        };
        customModules.push(newCourse);
    }

    saveCustomModules();
    closeAddClassModal();
    renderFilters();
    renderCourseGrid();
}

window.deleteCourse = function(id) {
    if (!confirm('Are you sure you want to permanently delete this course and all its study notes/tasks?')) return;
    customModules = customModules.filter(m => m.id !== id);
    saveCustomModules();
    renderFilters();
    renderCourseGrid();
};

// ----------------------------------------------------
// NOTEBOOK & TODO TRACKER MODULE (Custom Classes Only)
// ----------------------------------------------------
window.openNotebookModal = function(id) {
    const course = customModules.find(m => m.id === id);
    if (!course) return;

    activeNotebookCourseId = id;
    document.getElementById('notebook-title').textContent = course.title;
    document.getElementById('notebook-category').textContent = course.category || 'General';
    document.getElementById('notebook-notes').value = course.notes || '';
    
    updateNotebookFocusStats();
    renderNotebookTasks();

    document.getElementById('modal-notebook').classList.remove('hidden');
    document.getElementById('modal-notebook').classList.add('flex');
};

window.closeNotebookModal = function() {
    document.getElementById('modal-notebook').classList.add('hidden');
    document.getElementById('modal-notebook').classList.remove('flex');
    activeNotebookCourseId = null;
    renderCourseGrid(); // Refresh grid task counter
};

function renderNotebookTasks() {
    const container = document.getElementById('notebook-task-list');
    if (!container) return;

    const course = customModules.find(m => m.id === activeNotebookCourseId);
    if (!course || !course.tasks) return;

    if (course.tasks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-slate-500 text-xs">
                No active study objectives. Add some below!
            </div>
        `;
        return;
    }

    container.innerHTML = course.tasks.map(t => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 group/task shadow-sm">
            <label class="flex items-center gap-3 cursor-pointer text-sm font-semibold select-none ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}">
                <input type="checkbox" onchange="toggleTask('${t.id}')" ${t.completed ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-white/10 focus:ring-indigo-500 focus:ring-offset-slate-950">
                ${escapeHTML(t.text)}
            </label>
            <button onclick="deleteTask('${t.id}')" class="opacity-0 group-hover/task:opacity-100 text-slate-500 hover:text-red-400 transition-all px-2 py-1 rounded">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join('');
}

window.addNotebookTask = function() {
    const input = document.getElementById('notebook-task-input');
    if (!input || !activeNotebookCourseId) return;

    const text = input.value.trim();
    if (!text) return;

    const idx = customModules.findIndex(m => m.id === activeNotebookCourseId);
    if (idx !== -1) {
        if (!customModules[idx].tasks) customModules[idx].tasks = [];
        customModules[idx].tasks.push({
            id: 'task-' + Date.now().toString(),
            text,
            completed: false
        });
        saveCustomModules();
        input.value = '';
        renderNotebookTasks();
    }
};

window.toggleTask = function(taskId) {
    if (!activeNotebookCourseId) return;
    const cIdx = customModules.findIndex(m => m.id === activeNotebookCourseId);
    if (cIdx !== -1) {
        const tIdx = customModules[cIdx].tasks.findIndex(t => t.id === taskId);
        if (tIdx !== -1) {
            customModules[cIdx].tasks[tIdx].completed = !customModules[cIdx].tasks[tIdx].completed;
            saveCustomModules();
            renderNotebookTasks();
        }
    }
};

window.deleteTask = function(taskId) {
    if (!activeNotebookCourseId) return;
    const cIdx = customModules.findIndex(m => m.id === activeNotebookCourseId);
    if (cIdx !== -1) {
        customModules[cIdx].tasks = customModules[cIdx].tasks.filter(t => t.id !== taskId);
        saveCustomModules();
        renderNotebookTasks();
    }
};

// Enter key support for Task Input
window.handleTaskInputKey = function(event) {
    if (event.key === 'Enter') {
        addNotebookTask();
    }
};

// Helper function to escape HTML injection
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
