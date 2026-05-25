/**
 * Interactive periodic-table Web Component
 * Standard Vanilla JS Custom Element with Custom Events and State Management.
 */
class PeriodicTable extends HTMLElement {
    constructor() {
        super();
        this.elements = [];
        this.selectedElement = null;
        this.activeTrend = null; // 'electronegativity' | 'ionization_energy_base' | 'atomic_radius_pm' | null
        this.zoomLevel = 'standard'; // 'compact' | 'standard' | 'detailed'
        this.highlightedCategories = new Set();
        this.highlightedSymbols = new Set();
        
        // Challenge Mode State
        this.challengeMode = false;
        this.secretElement = null;
        this.challengeClues = [];

        // Binding methods
        this.handleElementClick = this.handleElementClick.bind(this);
    }

    async connectedCallback() {
        this.className = "w-full block bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md";
        this.innerHTML = `
            <div class="flex items-center justify-center p-8 space-x-2 text-slate-400">
                <i class="fa-solid fa-circle-notch animate-spin"></i>
                <span class="text-sm font-semibold">Loading chemistry data...</span>
            </div>
        `;
        
        try {
            const res = await fetch('./periodic-table/data.json');
            this.elements = await res.json();
            this.render();
            this.initializeThreeRenderer();
        } catch (e) {
            this.innerHTML = `
                <div class="p-6 text-center text-rose-400">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
                    <p class="text-sm font-bold">Failed to load Periodic Table database.</p>
                </div>
            `;
            console.error(e);
        }
    }

    render() {
        this.innerHTML = `
            <!-- Controls Toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                        <i class="fa-solid fa-table-cells text-lg"></i>
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-white tracking-wide">Interactive Element Sandbox</h2>
                        <p class="text-[10px] text-slate-400 font-medium">Empirical Database & Trend Overlays</p>
                    </div>
                </div>

                <!-- Action Toolbar -->
                <div class="flex items-center space-x-2">
                    <!-- Semantic Zoom Select -->
                    <select id="zoom-select" class="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs rounded px-2.5 py-1.5 outline-none font-semibold text-slate-200 transition">
                        <option value="compact">Compact View</option>
                        <option value="standard" selected>Standard View</option>
                        <option value="detailed">Quantum Configs</option>
                    </select>

                    <!-- Heatmap Overlay Dropdown -->
                    <select id="trend-select" class="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs rounded px-2.5 py-1.5 outline-none font-semibold text-slate-200 transition">
                        <option value="">No Overlay (Families)</option>
                        <option value="electronegativity">Electronegativity</option>
                        <option value="ionization_energy_base">Ionization Energy</option>
                        <option value="atomic_radius_pm">Atomic Radius</option>
                    </select>

                    <!-- Challenge Mode Button -->
                    <button id="challenge-toggle" class="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1">
                        <i class="fa-solid fa-trophy"></i>
                        <span>Challenge Mode</span>
                    </button>
                </div>
            </div>

            <!-- Workspace Body: Grid + Sidebar -->
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Grid Wrapper (Scrollable on small displays) -->
                <div class="flex-1 overflow-x-auto pb-2 scrollbar-thin">
                    <div class="grid grid-cols-18 grid-rows-10 gap-1.5 min-w-[760px] max-w-[1000px] mx-auto select-none" id="elements-grid">
                        <!-- Instantiated elements -->
                    </div>
                </div>

                <!-- Collapsible Side Inspector Panel -->
                <aside id="side-inspector" class="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0 transition-all duration-300 opacity-0 pointer-events-none max-h-0 lg:max-h-none">
                    <div class="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div class="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                            <i class="fa-solid fa-atom text-amber-500 animate-spin-slow"></i>
                            <span id="inspector-title">Quantum Inspector</span>
                        </div>
                        <button id="close-inspector" class="text-slate-500 hover:text-white transition">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>

                    <!-- 3D Orbit Canvas Container -->
                    <div id="three-canvas-container" class="h-44 w-full bg-slate-950 relative border-b border-slate-800">
                        <div class="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                            Loading 3D Bohr Model...
                        </div>
                    </div>

                    <!-- Selected Element Details -->
                    <div class="p-4 flex-grow overflow-y-auto space-y-4 text-xs leading-relaxed" id="inspector-content">
                        <!-- Selected details here -->
                    </div>
                </aside>
            </div>
        `;

        this.gridEl = this.querySelector('#elements-grid');
        this.inspectorEl = this.querySelector('#side-inspector');
        this.inspectorContentEl = this.querySelector('#inspector-content');
        this.threeContainer = this.querySelector('#three-canvas-container');

        // Render the elements in the grid
        this.renderGrid();

        // Bind events
        this.querySelector('#zoom-select').addEventListener('change', (e) => {
            this.zoomLevel = e.target.value;
            this.renderGrid();
        });

        this.querySelector('#trend-select').addEventListener('change', (e) => {
            this.activeTrend = e.target.value || null;
            this.renderGrid();
        });

        this.querySelector('#close-inspector').addEventListener('click', () => {
            this.hideInspector();
        });

        this.querySelector('#challenge-toggle').addEventListener('click', () => {
            this.toggleChallengeMode();
        });
    }

    renderGrid() {
        this.gridEl.innerHTML = '';
        
        // Define all positions mapping group/period to CSS classes
        // 18 columns, 7 rows.
        // We will create empty spacer boxes or place elements at their coordinates
        this.elements.forEach(element => {
            const card = document.createElement('div');
            card.className = this.getElementCardClasses(element);
            card.style.gridColumn = element.grid_col;
            card.style.gridRow = element.grid_row;
            card.dataset.symbol = element.symbol;
            card.dataset.number = element.atomic_number;

            // Semantic Zoom content structuring
            if (this.zoomLevel === 'compact') {
                card.innerHTML = `
                    <span class="text-xs font-black tracking-tighter">${element.symbol}</span>
                `;
            } else if (this.zoomLevel === 'standard') {
                card.innerHTML = `
                    <span class="text-[8px] opacity-60 font-mono absolute top-0.5 left-0.5">${element.atomic_number}</span>
                    <span class="text-sm font-extrabold tracking-tight">${element.symbol}</span>
                    <span class="text-[8px] opacity-80 font-mono tracking-tighter leading-none">${element.atomic_mass.toFixed(2)}</span>
                `;
            } else { // detailed
                card.innerHTML = `
                    <span class="text-[8px] opacity-60 font-mono absolute top-0.5 left-0.5">${element.atomic_number}</span>
                    <span class="text-sm font-extrabold tracking-tight">${element.symbol}</span>
                    <span class="text-[7px] text-amber-400 font-mono tracking-widest text-center mt-0.5 leading-none truncate w-full px-0.5">${element.electron_config}</span>
                `;
            }

            // A11y accessibility attributes for keyboard navigation
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `${element.element} (${element.symbol}), atomic number ${element.atomic_number}`);

            // Keypress activation for focus selection
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleElementClick(element, card);
                }
            });

            card.addEventListener('click', () => this.handleElementClick(element, card));
            this.gridEl.appendChild(card);
        });

        // Insert f-block static placeholders for Lanthanides and Actinides when not in challenge mode
        if (!this.challengeMode) {
            const isTrendActive = !!this.activeTrend;

            // 1. Lanthanides placeholder at Row 6, Col 3
            const lanthCard = document.createElement('div');
            lanthCard.style.gridColumn = "3";
            lanthCard.style.gridRow = "6";
            lanthCard.tabIndex = 0;
            lanthCard.setAttribute('role', 'button');
            lanthCard.setAttribute('aria-label', 'Lanthanides placeholder, atomic numbers 57 to 71');
            
            if (isTrendActive) {
                lanthCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-800 bg-slate-950/20 text-slate-600 opacity-30 cursor-not-allowed p-1 font-sans";
            } else {
                const isLanthHighlighted = this.highlightedCategories.size === 0 || this.highlightedCategories.has('lanthanide');
                if (isLanthHighlighted) {
                    lanthCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-violet-500/40 bg-violet-500/5 text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/10 hover:text-violet-300 transition cursor-pointer p-1 font-sans focus:ring-2 focus:ring-violet-500/50 focus:outline-none";
                } else {
                    lanthCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-900 bg-slate-950/20 text-slate-600 opacity-30 cursor-pointer p-1 font-sans focus:outline-none";
                }
            }

            lanthCard.innerHTML = `
                <span class="text-[8px] opacity-60 font-mono absolute top-0.5 left-0.5">57-71</span>
                <span class="text-xs font-bold tracking-tight">La-Lu</span>
                <span class="text-[7px] opacity-80 font-mono tracking-tighter leading-none mt-1">Lanthanides</span>
            `;

            const triggerLanthHighlight = () => {
                if (this.highlightedCategories.has('lanthanide')) {
                    this.highlight_elements(null);
                } else {
                    this.highlight_elements({ category: 'lanthanide' });
                }
            };

            if (!isTrendActive) {
                lanthCard.addEventListener('click', triggerLanthHighlight);
                lanthCard.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerLanthHighlight();
                    }
                });
            }
            this.gridEl.appendChild(lanthCard);

            // 2. Actinides placeholder at Row 7, Col 3
            const actCard = document.createElement('div');
            actCard.style.gridColumn = "3";
            actCard.style.gridRow = "7";
            actCard.tabIndex = 0;
            actCard.setAttribute('role', 'button');
            actCard.setAttribute('aria-label', 'Actinides placeholder, atomic numbers 89 to 103');

            if (isTrendActive) {
                actCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-800 bg-slate-950/20 text-slate-600 opacity-30 cursor-not-allowed p-1 font-sans";
            } else {
                const isActHighlighted = this.highlightedCategories.size === 0 || this.highlightedCategories.has('actinide');
                if (isActHighlighted) {
                    actCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-fuchsia-500/40 bg-fuchsia-500/5 text-fuchsia-400 hover:border-fuchsia-500/60 hover:bg-fuchsia-500/10 hover:text-fuchsia-300 transition cursor-pointer p-1 font-sans focus:ring-2 focus:ring-fuchsia-500/50 focus:outline-none";
                } else {
                    actCard.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-900 bg-slate-950/20 text-slate-600 opacity-30 cursor-pointer p-1 font-sans focus:outline-none";
                }
            }

            actCard.innerHTML = `
                <span class="text-[8px] opacity-60 font-mono absolute top-0.5 left-0.5">89-103</span>
                <span class="text-xs font-bold tracking-tight">Ac-Lr</span>
                <span class="text-[7px] opacity-80 font-mono tracking-tighter leading-none mt-1">Actinides</span>
            `;

            const triggerActHighlight = () => {
                if (this.highlightedCategories.has('actinide')) {
                    this.highlight_elements(null);
                } else {
                    this.highlight_elements({ category: 'actinide' });
                }
            };

            if (!isTrendActive) {
                actCard.addEventListener('click', triggerActHighlight);
                actCard.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerActHighlight();
                    }
                });
            }
            this.gridEl.appendChild(actCard);
        }

        this.applyTrendStyles();
    }

    getElementCardClasses(element) {
        let base = "relative flex flex-col items-center justify-center aspect-square rounded-lg border text-center transition cursor-pointer p-1 font-sans focus:ring-2 focus:ring-amber-500/50 focus:outline-none ";
        
        // Highlight states
        const isSelected = this.selectedElement && this.selectedElement.symbol === element.symbol;
        const isHighlighted = (this.highlightedSymbols.size === 0 && this.highlightedCategories.size === 0) || 
                              this.highlightedSymbols.has(element.symbol) || 
                              this.highlightedCategories.has(element.category);

        if (isSelected) {
            base += "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/50 scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.25)] z-10 ";
        } else if (!isHighlighted) {
            base += "bg-slate-950/40 border-slate-900 text-slate-600 opacity-30 ";
        } else {
            // Category-based colors
            switch(element.category) {
                case 'nonmetal':
                    base += "bg-slate-800/40 border-slate-700/50 text-emerald-400 hover:border-emerald-500/40 ";
                    break;
                case 'noble-gas':
                    base += "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:border-indigo-400/40 ";
                    break;
                case 'alkali-metal':
                    base += "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-400/40 ";
                    break;
                case 'alkaline-earth-metal':
                    base += "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:border-orange-400/40 ";
                    break;
                case 'metalloid':
                    base += "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:border-yellow-400/40 ";
                    break;
                case 'halogen':
                    base += "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:border-teal-400/40 ";
                    break;
                case 'transition-metal':
                    base += "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-400/40 ";
                    break;
                case 'post-transition-metal':
                    base += "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40 ";
                    break;
                case 'lanthanide':
                    base += "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:border-violet-400/40 ";
                    break;
                case 'actinide':
                    base += "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400 hover:border-fuchsia-400/40 ";
                    break;
                default:
                    base += "bg-slate-800/20 border-slate-800 text-slate-300 hover:border-slate-600 ";
            }
        }
        return base;
    }

    applyTrendStyles() {
        if (!this.activeTrend) {
            // Standard colors
            this.querySelectorAll('[data-symbol]').forEach(card => {
                const sym = card.dataset.symbol;
                const element = this.elements.find(el => el.symbol === sym);
                if (element) {
                    card.className = this.getElementCardClasses(element);
                }
            });
            return;
        }

        // 1. Find min and max for active trend to scale the color palette
        const values = this.elements
            .map(el => el.trends[this.activeTrend])
            .filter(v => v !== null && v !== undefined);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        // 2. Apply high-contrast gradient scaling (Viridis-like interpolation)
        this.querySelectorAll('[data-symbol]').forEach(card => {
            const sym = card.dataset.symbol;
            const element = this.elements.find(el => el.symbol === sym);
            if (!element) return;

            const val = element.trends[this.activeTrend];
            if (val === null || val === undefined) {
                // Dim down unmappable values (e.g. noble gas electronegativities)
                card.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-slate-900 text-slate-600 bg-slate-950/20 opacity-30 cursor-not-allowed";
                return;
            }

            // Normalization 0 to 1
            const normalized = (val - minVal) / (maxVal - minVal);
            
            // Map normalized value to HSL Viridis-like palette (purple for low, yellow/green for high)
            // 270 (purple) down to 60 (yellow-green)
            const hue = 270 - (210 * normalized); 
            const brightness = 30 + (25 * normalized); // 30% for purple, up to 55% for bright yellow
            
            card.className = `relative flex flex-col items-center justify-center aspect-square rounded-lg border border-slate-700/50 cursor-pointer p-1 font-sans text-white transition focus:ring-2 focus:ring-amber-500 focus:outline-none`;
            card.style.backgroundColor = `hsla(${hue}, 70%, ${brightness}%, 0.35)`;
            card.style.borderColor = `hsla(${hue}, 70%, 50%, 0.6)`;
        });
    }

    handleElementClick(element, card) {
        if (this.challengeMode) {
            // Challenge mode click validation
            this.verifyChallengeClick(element);
            return;
        }

        this.selectedElement = element;
        
        // Highlight active card on grid
        this.renderGrid();

        // Render Inspector
        this.showInspector(element);

        // Dispatch selection event (other panels can listen)
        this.dispatchEvent(new CustomEvent('element-selected', {
            detail: { element },
            bubbles: true
        }));
    }

    showInspector(element) {
        // Toggle animation classes
        this.inspectorEl.className = "w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0 transition-all duration-300 opacity-100 pointer-events-auto max-h-none";
        
        // Fill details
        this.querySelector('#inspector-title').innerText = `${element.element} (${element.symbol})`;
        
        const anomalyHtml = element.academic_notes.anomaly_flag ? 
            `<div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300">
                <p class="font-bold flex items-center gap-1"><i class="fa-solid fa-circle-info"></i> Academic Anomaly</p>
                <p class="mt-1">${element.academic_notes.anomaly_description}</p>
             </div>` : '';

        this.inspectorContentEl.innerHTML = `
            <div class="grid grid-cols-2 gap-3 text-slate-300">
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p class="text-[9px] text-slate-500 uppercase font-semibold">Atomic Number</p>
                    <p class="text-base font-extrabold text-white font-mono mt-0.5">${element.atomic_number}</p>
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p class="text-[9px] text-slate-500 uppercase font-semibold">Atomic Mass</p>
                    <p class="text-base font-extrabold text-white font-mono mt-0.5">${element.atomic_mass}</p>
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p class="text-[9px] text-slate-500 uppercase font-semibold">Valence Electrons</p>
                    <p class="text-base font-extrabold text-amber-400 font-mono mt-0.5">${element.valence_electrons}</p>
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <p class="text-[9px] text-slate-500 uppercase font-semibold">Category</p>
                    <p class="text-xs font-bold text-emerald-400 mt-1 capitalize">${element.category.replace(/-/g, ' ')}</p>
                </div>
            </div>

            <div class="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-slate-300">
                <p class="text-[9px] text-slate-500 uppercase font-semibold">Quantum Configuration</p>
                <p class="text-sm font-bold font-mono text-white tracking-wider">${element.electron_config}</p>
            </div>

            <div class="space-y-2">
                <p class="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Empirical Trends</p>
                <div class="space-y-1.5">
                    <div class="flex justify-between py-1 border-b border-slate-800">
                        <span class="text-slate-400">Electronegativity:</span>
                        <span class="font-bold text-white font-mono">${element.trends.electronegativity !== null ? element.trends.electronegativity : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-800">
                        <span class="text-slate-400">Ionization Energy:</span>
                        <span class="font-bold text-white font-mono">${element.trends.ionization_energy_base} kJ/mol</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-800">
                        <span class="text-slate-400">Atomic Radius:</span>
                        <span class="font-bold text-white font-mono">${element.trends.atomic_radius_pm} pm</span>
                    </div>
                </div>
            </div>

            ${anomalyHtml}
        `;

        // Update 3D Bohr model
        if (this.threeRenderer) {
            this.threeRenderer.loadElement(element);
        }
    }

    hideInspector() {
        this.inspectorEl.className = "w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0 transition-all duration-300 opacity-0 pointer-events-none max-h-0 lg:max-h-none";
        this.selectedElement = null;
        this.renderGrid();
    }

    initializeThreeRenderer() {
        if (window.ThreeOrbitalRenderer && window.THREE) {
            this.threeRenderer = new ThreeOrbitalRenderer('three-canvas-container');
        } else {
            console.warn("Three.js or ThreeOrbitalRenderer not loaded in global space.");
        }
    }

    // ==========================================
    // Gemma 4 Agent / API State Controllers
    // ==========================================

    /**
     * Agent API Tool call: Highlight specific elements
     * @param {Object} filters { category: 'noble-gas' } or { symbols: ['H', 'He'] }
     */
    highlight_elements(filters) {
        this.highlightedCategories.clear();
        this.highlightedSymbols.clear();

        if (filters) {
            if (filters.category) this.highlightedCategories.add(filters.category);
            if (filters.symbols && Array.isArray(filters.symbols)) {
                filters.symbols.forEach(sym => this.highlightedSymbols.add(sym));
            }
        }
        
        this.renderGrid();
    }

    /**
     * Agent API Tool call: Apply Periodic Trend Heatmap
     * @param {String} trend 'electronegativity' | 'ionization_energy' | 'atomic_radius'
     */
    apply_trend_overlay(trend) {
        let normalizedTrendName = null;
        if (trend === 'electronegativity') normalizedTrendName = 'electronegativity';
        else if (trend === 'ionization_energy') normalizedTrendName = 'ionization_energy_base';
        else if (trend === 'atomic_radius') normalizedTrendName = 'atomic_radius_pm';

        this.activeTrend = normalizedTrendName;
        const select = this.querySelector('#trend-select');
        if (select) {
            select.value = normalizedTrendName || "";
        }
        this.renderGrid();
    }

    /**
     * Agent API Tool call: Open reactivity/bonding visual panel
     */
    isolate_bonding_pair(el1, el2) {
        const e1 = this.elements.find(el => el.symbol === el1);
        const e2 = this.elements.find(el => el.symbol === el2);

        if (!e1 || !e2) {
            console.error(`Reactivity sandbox target not found: ${el1}, ${el2}`);
            return;
        }

        // Fire custom event to spawn bonding overlay
        this.dispatchEvent(new CustomEvent('isolate-bonding-pair', {
            detail: { e1, e2 },
            bubbles: true
        }));
    }

    // ==========================================
    // Challenge Mode Game Loop
    // ==========================================
    toggleChallengeMode() {
        this.challengeMode = !this.challengeMode;
        const btn = this.querySelector('#challenge-toggle');
        
        if (this.challengeMode) {
            btn.className = "bg-violet-600 text-white border border-violet-500 px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow-lg shadow-violet-500/20";
            this.startChallenge();
        } else {
            btn.className = "bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1";
            this.renderGrid();
            this.hideInspector();
        }
    }

    startChallenge() {
        // Pick a random secret target element
        const validElements = this.elements.filter(el => el.atomic_number > 2);
        this.secretElement = validElements[Math.floor(Math.random() * validElements.length)];
        
        // Hide details on grid
        this.querySelectorAll('[data-symbol]').forEach(card => {
            card.innerHTML = `
                <span class="text-xs font-bold text-slate-700 font-mono">?</span>
            `;
            card.className = "relative flex flex-col items-center justify-center aspect-square rounded-lg border border-slate-800 text-center bg-slate-950/60 hover:border-violet-500/50 cursor-pointer";
            card.style.backgroundColor = '';
            card.style.borderColor = '';
        });

        // Trigger a custom event to notify AI to write clues in chat log
        this.dispatchEvent(new CustomEvent('challenge-started', {
            detail: { secretSymbol: this.secretElement.symbol },
            bubbles: true
        }));
    }

    verifyChallengeClick(element) {
        if (element.symbol === this.secretElement.symbol) {
            // Correct click!
            alert(`🎉 Success! You identified the element as: ${element.element} (${element.symbol})!`);
            this.toggleChallengeMode();
        } else {
            // Incorrect click
            alert(`❌ Incorrect target! Try analyzing the clues again.`);
        }
    }
}

customElements.define('periodic-table', PeriodicTable);
