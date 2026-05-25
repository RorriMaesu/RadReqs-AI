/**
 * ThreeOrbitalRenderer
 * Interactive 3D Electron Shell and Nucleus Visualizer using Three.js
 */
class ThreeOrbitalRenderer {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container) {
            console.error(`ThreeOrbitalRenderer: Container #${canvasContainerId} not found.`);
            return;
        }

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'w-full h-full block';
        this.container.appendChild(this.canvas);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationFrameId = null;

        // Visual Assets
        this.nucleusGroup = null;
        this.electronShells = []; // Array of { ringMesh, electronMeshes: [], radius, speed }

        this.activeElement = null;
        this.isDark = document.documentElement.classList.contains('dark');

        this.init();
        this.setupResizeListener();
    }

    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent to inherit panel styling

        // Camera Setup
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 8, 12);
        this.camera.lookAt(0, 0, 0);

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(5, 10, 7);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.3); // Muted blue fill light
        dirLight2.position.set(-5, -5, -5);
        this.scene.add(dirLight2);

        // Interactive mouse controls (Simple rotation wrapper without needing heavy OrbitControls.js)
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.nucleusGroup) return;
            const deltaMove = {
                x: e.clientX - this.previousMousePosition.x,
                y: e.clientY - this.previousMousePosition.y
            };

            // Rotate main content groups based on drag
            const rotationSpeed = 0.007;
            this.nucleusGroup.rotation.y += deltaMove.x * rotationSpeed;
            this.nucleusGroup.rotation.x += deltaMove.y * rotationSpeed;

            this.electronShells.forEach(shell => {
                shell.group.rotation.y += deltaMove.x * rotationSpeed;
                shell.group.rotation.x += deltaMove.y * rotationSpeed;
            });

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Start animation loop
        this.animate();
    }

    /**
     * Renders a 3D model of an element based on its configuration
     * @param {Object} elementData 
     */
    loadElement(elementData) {
        this.activeElement = elementData;
        this.clearScene();

        // 1. Create Core Group
        this.nucleusGroup = new THREE.Group();
        this.scene.add(this.nucleusGroup);

        const pCount = elementData.atomic_number;
        // Approximation for neutrons: Mass - Protons
        const nCount = Math.max(0, Math.round(elementData.atomic_mass) - pCount);
        
        // Render Nucleus particles
        const particleGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const protonMat = new THREE.MeshPhongMaterial({ color: 0xf43f5e, shininess: 30 }); // Rose-500 Protons
        const neutronMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 30 }); // Blue-500 Neutrons

        const totalParticles = pCount + nCount;
        for (let i = 0; i < totalParticles; i++) {
            const isProton = i < pCount;
            const mesh = new THREE.Mesh(particleGeo, isProton ? protonMat : neutronMat);
            
            // Cluster inside a sphere
            const radius = 0.3 + (Math.pow(totalParticles, 1/3) * 0.15);
            const phi = Math.acos(-1 + (2 * i) / totalParticles);
            const theta = Math.sqrt(totalParticles * Math.PI) * phi;

            mesh.position.set(
                radius * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.1,
                radius * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.1,
                radius * Math.cos(phi) + (Math.random() - 0.5) * 0.1
            );
            this.nucleusGroup.add(mesh);
        }

        // 2. Generate Electron Shells
        // We use the exact Bohr shell counts from the database to reflect correct Aufbau mapping
        const shellsDistribution = elementData.shells || [];
        const electronGeo = new THREE.SphereGeometry(0.12, 12, 12);
        
        // Amber/Cyan theme matching element state
        const electronMat = new THREE.MeshBasicMaterial({ 
            color: this.isDark ? 0xfcd34d : 0xf59e0b 
        });

        shellsDistribution.forEach((eCount, index) => {
            const shellIndex = index + 1;
            const shellRadius = 1.8 + shellIndex * 1.2;
            const shellGroup = new THREE.Group();
            this.scene.add(shellGroup);

            // Ring orbit path line
            const ringGeo = new THREE.RingGeometry(shellRadius - 0.015, shellRadius + 0.015, 64);
            // Rotate ring to lie flat on XZ plane
            ringGeo.rotateX(Math.PI / 2);
            
            const ringMat = new THREE.MeshBasicMaterial({ 
                color: this.isDark ? 0x334155 : 0xcbd5e1, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            shellGroup.add(ringMesh);

            // Spawn electrons on the ring
            const electronMeshes = [];
            for (let e = 0; e < eCount; e++) {
                const eMesh = new THREE.Mesh(electronGeo, electronMat);
                const angle = (e / eCount) * Math.PI * 2;
                eMesh.position.set(
                    Math.cos(angle) * shellRadius,
                    0,
                    Math.sin(angle) * shellRadius
                );
                shellGroup.add(eMesh);
                electronMeshes.push({
                    mesh: eMesh,
                    angle: angle
                });
            }

            // Stagger rotational speeds of different shells
            const orbitalSpeed = (0.02 / shellIndex) * (Math.random() > 0.5 ? 1 : -1);

            this.electronShells.push({
                group: shellGroup,
                electronMeshes: electronMeshes,
                radius: shellRadius,
                speed: orbitalSpeed
            });
        });

        // Center camera fit
        const maxRadius = 1.8 + shellsDistribution.length * 1.2;
        this.camera.position.set(0, maxRadius * 1.3, maxRadius * 1.8);
        this.camera.lookAt(0, 0, 0);
    }

    disposeNode(node) {
        if (node.geometry) {
            node.geometry.dispose();
        }
        if (node.material) {
            if (Array.isArray(node.material)) {
                node.material.forEach(mat => mat.dispose());
            } else {
                node.material.dispose();
            }
        }
    }

    clearScene() {
        if (this.nucleusGroup) {
            this.nucleusGroup.traverse(child => {
                if (child.isMesh) {
                    this.disposeNode(child);
                }
            });
            this.scene.remove(this.nucleusGroup);
            this.nucleusGroup = null;
        }
        this.electronShells.forEach(shell => {
            shell.group.traverse(child => {
                if (child.isMesh) {
                    this.disposeNode(child);
                }
            });
            this.scene.remove(shell.group);
        });
        this.electronShells = [];
    }

    setTheme(isDark) {
        this.isDark = isDark;
        if (this.activeElement) {
            // Reload visualization with new colors
            this.loadElement(this.activeElement);
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // Rotate nucleus slowly
        if (this.nucleusGroup && !this.isDragging) {
            this.nucleusGroup.rotation.y += 0.002;
            this.nucleusGroup.rotation.z += 0.001;
        }

        // Animate electrons around orbit paths
        this.electronShells.forEach(shell => {
            shell.electronMeshes.forEach(el => {
                el.angle += shell.speed;
                el.mesh.position.set(
                    Math.cos(el.angle) * shell.radius,
                    0,
                    Math.sin(el.angle) * shell.radius
                );
            });
        });

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setupResizeListener() {
        this.resizeObserver = new ResizeObserver(() => {
            if (!this.container || !this.renderer) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
        this.resizeObserver.observe(this.container);
    }

    /**
     * Call this when destroying the view to clean up WebGL contexts
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.clearScene();
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.canvas.remove();
        this.container.innerHTML = '';
    }
}
window.ThreeOrbitalRenderer = ThreeOrbitalRenderer;
