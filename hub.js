// Hub Application Logic - Redesigned UI
// Manages static course registry, category filtering, stats modals, and the floating Pomodoro timer.

const COURSES = [
    {
        id: 'medical-terminology',
        title: 'Medical Terminology',
        description: 'Comprehensive clinical language mastery with Chart Decrypter and AI Tutor.',
        link: './syngnosia/index.html',
        category: 'Clinical Core',
        icon: 'fa-staff-snake',
        color: 'from-teal-500 to-emerald-600',
        status: 'active'
    },
    {
        id: 'intro-to-chemistry',
        title: 'Intro to Chemistry',
        description: 'Atoms, bonding, reactions, and core chemistry concepts for healthcare foundations.',
        link: './chemistry/index.html',
        category: 'Sciences',
        icon: 'fa-flask-vial',
        color: 'from-amber-500 to-orange-600',
        status: 'active'
    },
    {
        id: 'clinical-mathematics',
        title: 'Clinical Mathematics',
        description: 'Master clinical unit conversions, safety formatting, algebraic formulas, and scale-based logic.',
        link: './math/index.html',
        category: 'Sciences',
        icon: 'fa-square-root-variable',
        color: 'from-blue-500 to-indigo-600',
        status: 'active'
    },
    {
        id: 'psychology-care',
        title: 'Psychology & Care',
        description: 'Patient interaction, behavioral sciences, and professional clinical ethics.',
        link: './psychology/index.html',
        category: 'Clinical Core',
        icon: 'fa-brain',
        color: 'from-purple-500 to-fuchsia-600',
        status: 'active'
    },
    {
        id: 'general-sound-physics',
        title: 'General & Sound Physics',
        description: 'Acoustics, wave mechanics, electromagnetism, and SPI instrumentation foundations.',
        link: '#',
        category: 'Sciences',
        icon: 'fa-wave-square',
        color: 'from-sky-500 to-cyan-600',
        status: 'planned'
    },
    {
        id: 'anatomy-physiology',
        title: 'Anatomy & Physiology',
        description: 'Structure and function of the human body, organ systems, and homeostatic mechanisms.',
        link: '#',
        category: 'Sciences',
        icon: 'fa-lungs',
        color: 'from-rose-500 to-red-600',
        status: 'planned'
    },
    {
        id: 'general-biology',
        title: 'General Biology',
        description: 'Cellular biology, genetics, metabolism, and molecular systems.',
        link: '#',
        category: 'Sciences',
        icon: 'fa-dna',
        color: 'from-emerald-500 to-teal-600',
        status: 'planned'
    },
    {
        id: 'english-composition',
        title: 'English Composition',
        description: 'Written and oral communication skills for healthcare professionals.',
        link: '#',
        category: 'Humanities',
        icon: 'fa-pen-nib',
        color: 'from-cyan-500 to-sky-600',
        status: 'planned'
    },
    {
        id: 'ultrasound-physics-spi',
        title: 'Ultrasound Physics (SPI)',
        description: 'Acoustic physics, transducers, Doppler principles, and scan parameters.',
        link: '#',
        category: 'Sonography',
        icon: 'fa-circle-nodes',
        color: 'from-indigo-500 to-violet-600',
        status: 'planned'
    },
    {
        id: 'sectional-anatomy-path',
        title: 'Sectional Anatomy & Path',
        description: 'Multi-planar visualization (transverse, sagittal, coronal) and tissue disease states.',
        link: '#',
        category: 'Sonography',
        icon: 'fa-border-all',
        color: 'from-fuchsia-500 to-pink-600',
        status: 'planned'
    },
    {
        id: 'abdominal-sonography',
        title: 'Abdominal Sonography',
        description: 'Anatomy, scan protocols, and pathologies of the liver, gallbladder, kidneys, and spleen.',
        link: '#',
        category: 'Sonography',
        icon: 'fa-stethoscope',
        color: 'from-amber-600 to-orange-500',
        status: 'planned'
    },
    {
        id: 'ob-gyn-sonography',
        title: 'OB/GYN Sonography',
        description: 'Female pelvic anatomy, fetal biometry, embryology, and obstetric pathologies.',
        link: '#',
        category: 'Sonography',
        icon: 'fa-baby',
        color: 'from-pink-500 to-rose-600',
        status: 'planned'
    },
    {
        id: 'vascular-sonography',
        title: 'Vascular Sonography',
        description: 'Hemodynamics, peripheral vascular systems, carotid evaluation, and Doppler analysis.',
        link: '#',
        category: 'Sonography',
        icon: 'fa-heart-pulse',
        color: 'from-red-500 to-rose-600',
        status: 'planned'
    }
];

let activeFilter = 'all';

// Pomodoro Timer State
let timerInterval = null;
let timerTimeLeft = 25 * 60; // 25 minutes default
let timerMaxTime = 25 * 60;
let timerIsRunning = false;
let timerMode = 'focus'; // 'focus' or 'break'
let timerSelectedCourseId = 'general';

let focusStats = {};

document.addEventListener('DOMContentLoaded', () => {
    loadFocusStats();
    initTimer();
    renderFilters();
    renderCourseGrid();
    updateGlobalStats();
});

function loadFocusStats() {
    try {
        const stored = localStorage.getItem('study_hub_focus_stats');
        if (stored) {
            focusStats = JSON.parse(stored);
        } else {
            focusStats = {};
        }
    } catch (e) {
        console.error('Failed to load focus stats:', e);
        focusStats = {};
    }
}

function saveFocusStats() {
    localStorage.setItem('study_hub_focus_stats', JSON.stringify(focusStats));
    updateGlobalStats();
}

// Render Filters
function renderFilters() {
    const filterContainer = document.getElementById('filter-pills');
    if (!filterContainer) return;

    const filters = [
        { id: 'all', label: 'All Modules' },
        { id: 'active', label: 'Active Study' },
        { id: 'sciences', label: 'Sciences' },
        { id: 'clinical', label: 'Clinical Core' },
        { id: 'humanities', label: 'Humanities' },
        { id: 'sonography', label: 'Sonography' }
    ];

    filterContainer.innerHTML = filters.map(f => `
        <button onclick="setFilter('${f.id}')" class="px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === f.id ? 'bg-indigo-600 text-white border border-indigo-500' : 'glass-card text-slate-400 hover:text-white hover:bg-white/5'}">
            ${f.label}
        </button>
    `).join('');
}

window.setFilter = function(filterId) {
    activeFilter = filterId;
    renderFilters();
    renderCourseGrid();
};

// Render Course Cards
function renderCourseGrid() {
    const grid = document.getElementById('course-grid');
    if (!grid) return;

    let filtered = COURSES;
    if (activeFilter === 'active') {
        filtered = COURSES.filter(c => c.status === 'active');
    } else if (activeFilter === 'sciences') {
        filtered = COURSES.filter(c => c.category === 'Sciences');
    } else if (activeFilter === 'clinical') {
        filtered = COURSES.filter(c => c.category === 'Clinical Core');
    } else if (activeFilter === 'humanities') {
        filtered = COURSES.filter(c => c.category === 'Humanities');
    } else if (activeFilter === 'sonography') {
        filtered = COURSES.filter(c => c.category === 'Sonography');
    }

    grid.innerHTML = filtered.map(c => {
        const isActive = c.status === 'active';
        
        // Status pill
        const statusPill = isActive
            ? `<span class="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-extrabold border border-teal-500/20 uppercase tracking-wider">Active</span>`
            : `<span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-extrabold border border-slate-700 uppercase tracking-wider">Planned</span>`;

        // Focus logged badge
        const loggedSeconds = focusStats[c.id] || 0;
        const focusBadge = loggedSeconds > 0
            ? `<span class="text-[10px] text-slate-500 font-bold ml-2 flex items-center gap-1" title="Study Focus Logged"><i class="fa-solid fa-clock"></i> ${(loggedSeconds / 3600).toFixed(1)} hrs</span>`
            : '';

        // Handle card click
        const clickAction = isActive
            ? `href="${c.link}"`
            : `href="#" onclick="showToast('${c.title}'); return false;"`;

        return `
            <a ${clickAction} class="block group relative ${!isActive ? 'opacity-70 hover:opacity-90' : ''}">
                <div class="glass-card rounded-3xl p-8 h-full transition-all duration-300 module-active relative overflow-hidden flex flex-col min-h-[220px]">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
                    
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center border border-white/10 shadow-lg">
                            <i class="fa-solid ${c.icon} text-2xl text-white"></i>
                        </div>
                        <div class="flex items-center gap-1">
                            ${statusPill}
                            ${focusBadge}
                        </div>
                    </div>

                    <h3 class="text-2xl font-bold text-white mb-2 leading-snug group-hover:text-indigo-200 transition-colors">${c.title}</h3>
                    <p class="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">${c.description}</p>
                    
                    <div class="mt-auto flex items-center text-indigo-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                        ${isActive ? 'Launch Module' : 'In Development'} <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// ----------------------------------------------------
// FLOATING STATS BUTTON & MODAL
// ----------------------------------------------------
window.openStatsModal = function() {
    updateGlobalStats();
    document.getElementById('modal-stats').classList.remove('hidden');
    document.getElementById('modal-stats').classList.add('flex');
};

window.closeStatsModal = function() {
    document.getElementById('modal-stats').classList.add('hidden');
    document.getElementById('modal-stats').classList.remove('flex');
};

// Update Global Stats in the Modal & Dropdown
function updateGlobalStats() {
    const statFocusText = document.getElementById('stat-total-focus');
    const statStreakText = document.getElementById('stat-streak');
    const timerSelect = document.getElementById('timer-course-select');
    const breakdownContainer = document.getElementById('stats-course-breakdown');

    if (statFocusText) {
        let totalSeconds = 0;
        Object.values(focusStats).forEach(s => totalSeconds += s);
        statFocusText.textContent = `${(totalSeconds / 3600).toFixed(1)} hrs`;
    }

    if (statStreakText) {
        const streak = localStorage.getItem('study_streak_count') || '3';
        statStreakText.textContent = `${streak} Days`;
    }

    // Populate active courses dropdown
    if (timerSelect) {
        let options = '<option value="general">General Study Focus</option>';
        COURSES.filter(c => c.status === 'active').forEach(c => {
            options += `<option value="${c.id}">${c.title}</option>`;
        });
        const currentSelected = timerSelectedCourseId;
        timerSelect.innerHTML = options;
        timerSelect.value = currentSelected;
    }

    // Render course focus time breakdown in the modal
    if (breakdownContainer) {
        const activeCourses = COURSES.filter(c => c.status === 'active');
        let breakdownHTML = activeCourses.map(c => {
            const seconds = focusStats[c.id] || 0;
            const hours = (seconds / 3600).toFixed(1);
            return `
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-200">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${c.icon} text-slate-400"></i>
                        <span class="text-xs font-semibold">${c.title}</span>
                    </div>
                    <span class="text-xs font-extrabold text-indigo-400">${hours} hrs</span>
                </div>
            `;
        }).join('');

        // Append General Study Focus stats
        const generalSeconds = focusStats['general'] || 0;
        const generalHours = (generalSeconds / 3600).toFixed(1);
        breakdownHTML += `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-200">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-hourglass-half text-indigo-400"></i>
                    <span class="text-xs font-semibold">General Study Focus</span>
                </div>
                <span class="text-xs font-extrabold text-indigo-400">${generalHours} hrs</span>
            </div>
        `;
        breakdownContainer.innerHTML = breakdownHTML;
    }
}

// ----------------------------------------------------
// FLOATING TIMER WORKSPACE LOGIC
// ----------------------------------------------------
let timerExpanded = false;

window.toggleFloatingTimer = function() {
    const panel = document.getElementById('timer-expanded-panel');
    const btn = document.getElementById('timer-toggle-btn');
    
    if (!panel || !btn) return;

    timerExpanded = !timerExpanded;
    if (timerExpanded) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
        btn.classList.add('border-indigo-400');
    } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
        btn.classList.remove('border-indigo-400');
    }
};

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
    
    // Add pulsing border to floating button
    const pulse = document.getElementById('timer-pulse-ring');
    if (pulse) {
        pulse.classList.remove('opacity-0');
        pulse.classList.add('animate-ping', 'opacity-100');
    }

    timerInterval = setInterval(() => {
        timerTimeLeft--;
        
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

    // Remove pulsing border
    const pulse = document.getElementById('timer-pulse-ring');
    if (pulse) {
        pulse.classList.remove('animate-ping', 'opacity-100');
        pulse.classList.add('opacity-0');
    }
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
        showBrowserNotification('Focus Session Complete!', 'Take a 5-minute break.');
    } else {
        timerMode = 'focus';
        timerTimeLeft = timerMaxTime;
        showBrowserNotification('Break Over!', 'Lock back into your learning.');
    }
    resetTimer();
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const modeIndicator = document.getElementById('timer-mode-indicator');
    const progressRing = document.getElementById('timer-progress-ring');
    const badge = document.getElementById('timer-badge');
    
    if (!display) return;

    const mins = Math.floor(timerTimeLeft / 60);
    const secs = timerTimeLeft % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (modeIndicator) {
        modeIndicator.textContent = timerMode === 'focus' ? 'Focus Session Active' : 'Break Time Active';
    }

    if (progressRing) {
        const total = timerMode === 'focus' ? timerMaxTime : 5 * 60;
        const progress = (total - timerTimeLeft) / total;
        // Circumference is 2 * pi * r = 2 * 3.14159 * 34 = 213.6
        const offset = 213 - (progress * 213);
        progressRing.style.strokeDashoffset = offset;
    }

    if (badge) {
        badge.textContent = `${mins}m`;
        if (timerIsRunning) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function logFocusSecond() {
    if (!focusStats[timerSelectedCourseId]) {
        focusStats[timerSelectedCourseId] = 0;
    }
    focusStats[timerSelectedCourseId]++;
    
    if (focusStats[timerSelectedCourseId] % 10 === 0) {
        saveFocusStats();
    }
}

function playTimerAlert() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.warn('Audio alert API warning');
    }
}

function showBrowserNotification(title, message) {
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
// TOAST NOTIFICATION SYSTEM (For Planned Modules)
// ----------------------------------------------------
window.showToast = function(courseTitle) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'glass-card border border-indigo-500/20 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm text-slate-200 fade-in select-none max-w-sm w-full';
    toast.style.background = 'rgba(15, 23, 42, 0.9)';
    toast.style.backdropFilter = 'blur(12px)';
    
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-satellite-dish animate-pulse"></i>
        </div>
        <div class="flex-grow">
            <p class="font-extrabold text-white">${courseTitle}</p>
            <p class="text-xs text-slate-400 mt-0.5">Currently in development. Core lessons coming soon!</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.5s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4000);
};
