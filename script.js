const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
const headlineWord = document.getElementById('headline-word');
const year = document.getElementById('year');
const themeToggle = document.getElementById('theme-toggle');

const words = ['alive', 'inevitable', 'cinematic', 'thoughtful', 'future-proof'];
let wordIndex = 0;

if (year) {
    year.textContent = new Date().getFullYear();
}

function rotateWord() {
    if (!headlineWord) return;
    wordIndex = (wordIndex + 1) % words.length;
    headlineWord.style.opacity = '0';
    setTimeout(() => {
        headlineWord.textContent = words[wordIndex];
        headlineWord.style.opacity = '1';
    }, 150);
}

setInterval(rotateWord, 2200);

function setCanvasSize() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const particles = Array.from({ length: 48 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.55,
    vy: (Math.random() - 0.5) * 0.55,
    size: Math.random() * 2.5 + 1,
}));

function drawBackgroundGradient() {
    const gradient = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        40,
        window.innerWidth / 2,
        window.innerHeight / 2,
        Math.max(window.innerWidth, window.innerHeight)
    );
    gradient.addColorStop(0, 'rgba(110, 132, 255, 0.24)');
    gradient.addColorStop(0.4, 'rgba(61, 242, 255, 0.13)');
    gradient.addColorStop(1, 'rgba(4, 8, 19, 0.9)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function animate() {
    drawBackgroundGradient();

    particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = window.innerWidth + 10;
        if (particle.x > window.innerWidth + 10) particle.x = -10;
        if (particle.y < -10) particle.y = window.innerHeight + 10;
        if (particle.y > window.innerHeight + 10) particle.y = -10;

        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = Math.max(0.09, 0.5 - dist / 320);

        ctx.beginPath();
        ctx.fillStyle = `rgba(185, 213, 255, ${alpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    items.forEach((item) => observer.observe(item));
}

function initThemeToggle() {
    const key = 'scottocs-theme';
    const saved = localStorage.getItem(key);
    if (saved === 'light') {
        document.body.classList.add('light');
    }

    themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('light');
        localStorage.setItem(key, document.body.classList.contains('light') ? 'light' : 'dark');
    });
}

window.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});

window.addEventListener('resize', setCanvasSize);

setCanvasSize();
animate();
setupReveal();
initThemeToggle();
