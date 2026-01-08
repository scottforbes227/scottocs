// Infinite Canvas UI Implementation
// Using Three.js and GSAP for smooth animations

// Wait for THREE.js to load
function initCSS2DRenderer() {
    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded');
        return false;
    }

// CSS2DRenderer implementation (inline since CDN path may vary)
THREE.CSS2DObject = function (element) {
    THREE.Object3D.call(this);
    this.element = element;
    this.element.style.position = 'absolute';
    this.element.style.pointerEvents = 'auto';
    this.addEventListener('removed', function () {
        this.traverse(function (object) {
            if (object.element instanceof Element && object.element.parentNode !== null) {
                object.element.parentNode.removeChild(object.element);
            }
        });
    });
};

THREE.CSS2DObject.prototype = Object.create(THREE.Object3D.prototype);
THREE.CSS2DObject.prototype.constructor = THREE.CSS2DObject;

THREE.CSS2DRenderer = function () {
    var _this = this;
    var _width, _height;
    var _widthHalf, _heightHalf;
    var vector = new THREE.Vector3();
    var viewMatrix = new THREE.Matrix4();
    var viewProjectionMatrix = new THREE.Matrix4();
    var cache = { objects: new WeakMap() };
    var domElement = document.createElement('div');
    domElement.style.overflow = 'hidden';
    this.domElement = domElement;

    this.getSize = function () {
        return { width: _width, height: _height };
    };

    this.setSize = function (width, height) {
        _width = width;
        _height = height;
        _widthHalf = _width / 2;
        _heightHalf = _height / 2;
        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';
    };

    function renderObject(object, scene, camera) {
        if (object instanceof THREE.CSS2DObject) {
            object.onBeforeRender(_this, scene, camera);
            vector.setFromMatrixPosition(object.matrixWorld);
            vector.applyMatrix4(viewProjectionMatrix);
            var element = object.element;
            element.style.display = (object.visible && vector.z >= -1 && vector.z <= 1) ? '' : 'none';
            if (element.style.display !== 'none') {
                element.style.transform = 'translate(-50%,-50%) translate(' + (_widthHalf + vector.x * _widthHalf) + 'px,' + (_heightHalf - vector.y * _heightHalf) + 'px)';
                if (element.parentNode !== domElement) {
                    domElement.appendChild(element);
                }
                object.onAfterRender(_this, scene, camera);
            }
            var objectData = { distanceToCameraSquared: getDistanceToSquared(camera, object) };
            cache.objects.set(object, objectData);
        }
        for (var i = 0, l = object.children.length; i < l; i++) {
            renderObject(object.children[i], scene, camera);
        }
    }

    function getDistanceToSquared(object1, object2) {
        var a = new THREE.Vector3();
        var b = new THREE.Vector3();
        a.setFromMatrixPosition(object1.matrixWorld);
        b.setFromMatrixPosition(object2.matrixWorld);
        return a.distanceToSquared(b);
    }

    this.render = function (scene, camera) {
        if (scene.autoUpdate === true) scene.updateMatrixWorld();
        if (camera.parent === null) camera.updateMatrixWorld();
        viewMatrix.copy(camera.matrixWorldInverse);
        viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);
        renderObject(scene, scene, camera);
    };
};
    
    return true;
}

class InfiniteCanvas {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cssRenderer = null;
        this.controls = {
            isDragging: false,
            previousMousePosition: { x: 0, y: 0 },
            cameraPosition: { x: 0, y: 0 }
        };
        this.nodes = [];
        this.lines = [];
        
        // Node positions in 2D space
        this.nodePositions = {
            center: { x: 0, y: 0, z: 0 },
            work: { x: 0, y: 100, z: 0 },
            about: { x: 100, y: 0, z: 0 },
            writing: { x: 0, y: -100, z: 0 },
            contact: { x: -100, y: 0, z: 0 }
        };
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderers();
        this.setupLights();
        this.createNodes();
        this.createConnectingLines();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Add subtle fog for depth
        this.scene.fog = new THREE.Fog(0x000000, 50, 300);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 150);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderers() {
        // WebGL Renderer for 3D graphics
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // CSS2D Renderer for HTML content
        this.cssRenderer = new THREE.CSS2DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = '0';
        this.cssRenderer.domElement.style.pointerEvents = 'none';
        document.getElementById('canvas-container').appendChild(this.cssRenderer.domElement);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1, 200);
        pointLight.position.set(0, 0, 100);
        this.scene.add(pointLight);
    }

    createNodes() {
        // Center node - Hero
        this.createNode('center', this.nodePositions.center, 
            '<h1 class="node-title">Scott Forbes</h1>' +
            '<p class="node-subtitle">Developer • Explorer • Thinker</p>');

        // Work node
        this.createNode('work', this.nodePositions.work,
            '<h2 class="node-title">Work & Projects</h2>' +
            '<p class="node-content">Coming soon...</p>');

        // About node
        this.createNode('about', this.nodePositions.about,
            '<h2 class="node-title">About</h2>' +
            '<div class="node-content" id="about-content"></div>');

        // Writing node
        this.createNode('writing', this.nodePositions.writing,
            '<h2 class="node-title">Writing</h2>' +
            '<p class="node-content">Thoughts and essays coming soon...</p>');

        // Contact node
        this.createNode('contact', this.nodePositions.contact,
            '<h2 class="node-title">Contact</h2>' +
            '<p class="node-content">Get in touch...</p>');
    }

    createNode(id, position, htmlContent) {
        // Create a glowing sphere marker
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position.x, position.y, position.z);
        this.scene.add(sphere);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(position.x, position.y, position.z);
        this.scene.add(glow);

        // Create CSS2D HTML content
        const div = document.createElement('div');
        div.className = 'canvas-node';
        div.id = `node-${id}`;
        div.innerHTML = htmlContent;
        
        const label = new THREE.CSS2DObject(div);
        label.position.set(position.x, position.y, position.z);
        this.scene.add(label);

        this.nodes.push({ id, sphere, glow, label, position });

        // Animate glow
        this.animateGlow(glow);
    }

    animateGlow(mesh) {
        gsap.to(mesh.scale, {
            x: 1.2,
            y: 1.2,
            z: 1.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    createConnectingLines() {
        const center = this.nodePositions.center;
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });

        // Create lines from center to each outer node
        ['work', 'about', 'writing', 'contact'].forEach(nodeId => {
            const position = this.nodePositions[nodeId];
            const points = [];
            points.push(new THREE.Vector3(center.x, center.y, center.z));
            points.push(new THREE.Vector3(position.x, position.y, position.z));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
            this.lines.push(line);
        });
    }

    setupEventListeners() {
        // Mouse controls for panning
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this));

        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.navigateToNode(target);
            });
        });
    }

    onMouseDown(event) {
        this.controls.isDragging = true;
        this.controls.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseMove(event) {
        if (!this.controls.isDragging) return;

        const deltaX = event.clientX - this.controls.previousMousePosition.x;
        const deltaY = event.clientY - this.controls.previousMousePosition.y;

        // Pan the camera
        this.camera.position.x -= deltaX * 0.1;
        this.camera.position.y += deltaY * 0.1;

        this.controls.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseUp() {
        this.controls.isDragging = false;
    }

    onWheel(event) {
        event.preventDefault();
        const delta = event.deltaY * 0.05;
        this.camera.position.z = Math.max(50, Math.min(300, this.camera.position.z + delta));
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    navigateToNode(nodeId) {
        const position = this.nodePositions[nodeId];
        if (!position) return;

        // Animate camera to node position
        gsap.to(this.camera.position, {
            x: position.x,
            y: position.y,
            z: 150,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Rotate lines slightly for effect
        this.lines.forEach((line, index) => {
            line.material.opacity = 0.4 + Math.sin(Date.now() * 0.001 + index) * 0.2;
        });

        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }

    loadAboutContent() {
        // Load data from secure module
        if (window._SecureData && window._SecureData.isAuthenticated()) {
            const data = window._SecureData.getData();
            if (!data.error) {
                const aboutDiv = document.getElementById('about-content');
                if (aboutDiv) {
                    aboutDiv.innerHTML = `
                        <div class="fact-section">
                            <h3>Countries Visited (${data.countries.length}/197)</h3>
                            <div class="countries-list">${data.countries.slice(0, 10).join(', ')}${data.countries.length > 10 ? '...' : ''}</div>
                        </div>
                        <div class="fact-section">
                            <h3>Currently Reading</h3>
                            <p>${data.books[0] || 'N/A'}</p>
                        </div>
                    `;
                }
            }
        }
    }
}

// Initialize when page loads
let canvas = null;

function initCanvas() {
    // Check if dependencies are loaded
    if (typeof THREE === 'undefined') {
        console.error('THREE.js is not loaded. Please check your internet connection.');
        document.getElementById('canvas-container').innerHTML = 
            '<div style="color: #00ffff; text-align: center; padding: 50px; font-size: 1.5rem;">' +
            'Error: Unable to load 3D graphics library.<br>' +
            'Please check your internet connection and refresh the page.' +
            '</div>';
        return;
    }
    
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded. Please check your internet connection.');
        document.getElementById('canvas-container').innerHTML = 
            '<div style="color: #00ffff; text-align: center; padding: 50px; font-size: 1.5rem;">' +
            'Error: Unable to load animation library.<br>' +
            'Please check your internet connection and refresh the page.' +
            '</div>';
        return;
    }
    
    // Initialize CSS2DRenderer
    if (!initCSS2DRenderer()) {
        console.error('Failed to initialize CSS2DRenderer');
        return;
    }
    
    canvas = new InfiniteCanvas();
    canvas.init();
    canvas.loadAboutContent();
}
