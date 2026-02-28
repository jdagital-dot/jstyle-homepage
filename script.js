// --- Opening Animation ---
const openCanvas = document.getElementById('opening-canvas');
const openCtx = openCanvas.getContext('2d');
const mainOverlay = document.getElementById('opening-overlay');
const heroContent = document.querySelector('.hero-content');

let oWidth, oHeight, ball, sakuraParticles = [];
let animationPhase = 'ball-flying'; // ball-flying, blast, fade-out

function initOpening() {
    oWidth = openCanvas.width = window.innerWidth;
    oHeight = openCanvas.height = window.innerHeight;

    ball = {
        x: -50,
        y: oHeight * 0.8,
        targetX: oWidth / 2,
        targetY: oHeight / 2,
        cp1x: oWidth * 0.2,
        cp1y: oHeight * 0.1,
        progress: 0,
        size: 15
    };
}

class SakuraBlast {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 15 + 5;
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        this.gravity = 0.05;
        this.opacity = 1;
        this.rotate = Math.random() * 360;
        this.vRotate = Math.random() * 10 - 5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.opacity -= 0.01;
        this.rotate += this.vRotate;
    }
    draw() {
        openCtx.save();
        openCtx.translate(this.x, this.y);
        openCtx.rotate(this.rotate * Math.PI / 180);
        openCtx.beginPath();
        openCtx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        openCtx.fillStyle = `rgba(255, 175, 204, ${this.opacity})`;
        openCtx.fill();
        openCtx.restore();
    }
}

function animateOpening() {
    openCtx.clearRect(0, 0, oWidth, oHeight);

    if (animationPhase === 'ball-flying') {
        ball.progress += 0.01 + (ball.progress * 0.025);
        const t = ball.progress;

        // Emphasized Curve: Far Background -> Deep Side Curve -> Center Front
        const p0 = { x: oWidth * 0.5, y: oHeight * 0.45 };
        const p1 = { x: oWidth * 0.05, y: oHeight * 0.2 };
        const p2 = { x: oWidth * 0.5, y: oHeight * 0.5 };

        ball.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        ball.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

        // MASSIVE SCALE: Eventually covers the whole screen
        const maxBallSize = Math.max(oWidth, oHeight) * 0.8;
        ball.size = 2 + (t * t * t) * maxBallSize;

        // Draw Motion Blur
        for (let i = 0; i < 8; i++) {
            const prevT = Math.max(0, t - (i * 0.02));
            const bx = (1 - prevT) * (1 - prevT) * p0.x + 2 * (1 - prevT) * prevT * p1.x + prevT * prevT * p2.x;
            const by = (1 - prevT) * (1 - prevT) * p0.y + 2 * (1 - prevT) * prevT * p1.y + prevT * prevT * p2.y;
            openCtx.beginPath();
            openCtx.arc(bx, by, ball.size * (1 - i * 0.12), 0, Math.PI * 2);
            openCtx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.04})`;
            openCtx.fill();
        }

        // Draw Ball (Pure White to fill screen)
        openCtx.beginPath();
        openCtx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        openCtx.fillStyle = '#fff';
        if (t < 0.9) {
            openCtx.shadowBlur = 40;
            openCtx.shadowColor = 'rgba(255, 255, 255, 1)';
        }
        openCtx.fill();
        openCtx.shadowBlur = 0;

        if (ball.progress >= 1) {
            animationPhase = 'blast';
            // Trigger blast AND branding immediately
            for (let i = 0; i < 400; i++) {
                sakuraParticles.push(new SakuraBlast(ball.x, ball.y));
            }

            const brandOverlay = document.querySelector('.branding-overlay-content');
            brandOverlay.classList.add('visible');

            // Sequence to reveal actual hero (wait for branding phase to complete)
            setTimeout(() => {
                animationPhase = 'done';
                mainOverlay.style.opacity = '0';
                heroContent.classList.add('loaded');

                setTimeout(() => {
                    mainOverlay.style.display = 'none';
                }, 1000);
            }, 4000); // Wait for branding animation to play out
        }
    } else if (animationPhase === 'blast') {
        sakuraParticles.forEach((p, i) => {
            p.update();
            p.draw();
            if (p.opacity <= 0) sakuraParticles.splice(i, 1);
        });
    }

    if (animationPhase !== 'done') {
        requestAnimationFrame(animateOpening);
    }
}

window.addEventListener('load', () => {
    initOpening();
    animateOpening();
});

// --- Existing Animations ---

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Header Style on Scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.padding = '15px 0';
        header.style.backgroundColor = 'rgba(5, 5, 16, 0.95)';
    } else {
        header.style.padding = '20px 0';
        header.style.backgroundColor = 'rgba(5, 5, 16, 0.8)';
    }
});

// Intersection Observer for Reveal Animation
const revealOptions = {
    threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, revealOptions);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Sakura Particle Effect (Hero Background)
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

let width, height, backgroundParticles;

function initHeroBg() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    backgroundParticles = [];
    for (let i = 0; i < 50; i++) {
        backgroundParticles.push(new BgParticle());
    }
}

class BgParticle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.02 - 0.01;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spin;
        if (this.y > height || this.x < 0 || this.x > width) {
            this.y = -20;
            this.x = Math.random() * width;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 175, 204, ${this.opacity})`;
        ctx.fill();
        ctx.restore();
    }
}

function animateHeroBg() {
    ctx.clearRect(0, 0, width, height);
    backgroundParticles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateHeroBg);
}

window.addEventListener('resize', initHeroBg);
initHeroBg();
animateHeroBg();

// Magnetic Button Effect
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0, 0)`;
    });
});
