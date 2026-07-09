document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu ---
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mainNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', mainNav.classList.contains('open'));
        });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mainNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Opening Animation ---
    const openCanvas = document.getElementById('opening-canvas');
    if (openCanvas) {
        const mainOverlay = document.getElementById('opening-overlay');

        // 同セッション内で既に見ていた場合・reduced-motion設定時はスキップ
        if (sessionStorage.getItem('opening-seen') || prefersReducedMotion) {
            mainOverlay.style.display = 'none';
            document.body.classList.remove('loading');
            const heroContentEl = document.querySelector('.hero-content');
            if (heroContentEl) heroContentEl.classList.add('loaded');
        } else {
            sessionStorage.setItem('opening-seen', '1');

        const openCtx = openCanvas.getContext('2d');
        const heroContent = document.querySelector('.hero-content');
        const body = document.body;

        let oWidth, oHeight, ball, sakuraParticles = [];
        let animationPhase = 'ball-flying'; // ball-flying, blast, done

        function initOpening() {
            oWidth = openCanvas.width = window.innerWidth;
            oHeight = openCanvas.height = window.innerHeight;

            ball = {
                x: oWidth * 0.5,
                y: oHeight * 0.45,
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

                const p0 = { x: oWidth * 0.5, y: oHeight * 0.45 };
                const p1 = { x: oWidth * 0.05, y: oHeight * 0.2 };
                const p2 = { x: oWidth * 0.5, y: oHeight * 0.5 };

                const bx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
                const by = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

                const maxBallSize = Math.max(oWidth, oHeight) * 0.8;
                const bSize = 2 + (t * t * t) * maxBallSize;

                // Motion Blur
                for (let i = 0; i < 8; i++) {
                    const prevT = Math.max(0, t - (i * 0.02));
                    const dbx = (1 - prevT) * (1 - prevT) * p0.x + 2 * (1 - prevT) * prevT * p1.x + prevT * prevT * p2.x;
                    const dby = (1 - prevT) * (1 - prevT) * p0.y + 2 * (1 - prevT) * prevT * p1.y + prevT * prevT * p2.y;
                    openCtx.beginPath();
                    openCtx.arc(dbx, dby, bSize * (1 - i * 0.12), 0, Math.PI * 2);
                    openCtx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.04})`;
                    openCtx.fill();
                }

                // Main Ball
                openCtx.beginPath();
                openCtx.arc(bx, by, bSize, 0, Math.PI * 2);
                openCtx.fillStyle = '#fff';
                if (t < 0.9) {
                    openCtx.shadowBlur = 40;
                    openCtx.shadowColor = 'rgba(255, 255, 255, 1)';
                }
                openCtx.fill();
                openCtx.shadowBlur = 0;

                if (ball.progress >= 1) {
                    animationPhase = 'blast';
                    for (let i = 0; i < 400; i++) {
                        sakuraParticles.push(new SakuraBlast(bx, by));
                    }

                    const brandOverlay = document.querySelector('.branding-overlay-content');
                    if (brandOverlay) brandOverlay.classList.add('visible');

                    setTimeout(finishOpening, 1800);
                }
            } else if (animationPhase === 'blast') {
                for (let i = sakuraParticles.length - 1; i >= 0; i--) {
                    const p = sakuraParticles[i];
                    p.update();
                    p.draw();
                    if (p.opacity <= 0) sakuraParticles.splice(i, 1);
                }
            }

            if (animationPhase !== 'done') {
                requestAnimationFrame(animateOpening);
            }
        }

        function finishOpening() {
            if (animationPhase === 'done') return;
            animationPhase = 'done';
            mainOverlay.style.opacity = '0';
            if (heroContent) heroContent.classList.add('loaded');
            body.classList.remove('loading');
            setTimeout(() => {
                mainOverlay.style.display = 'none';
            }, 1000);
        }

        // タップ / クリックでスキップ
        mainOverlay.addEventListener('click', finishOpening);

        window.addEventListener('resize', initOpening);
        initOpening();
        animateOpening();
        } // end else (opening-seen)
    }

    // --- Hero Sakura Background ---
    const sakuraCanvas = document.getElementById('sakura-canvas');
    if (sakuraCanvas && !prefersReducedMotion) {
        const sCtx = sakuraCanvas.getContext('2d');
        let sWidth, sHeight, backgroundParticles;

        class BgParticle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * sWidth;
                this.y = Math.random() * sHeight;
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
                if (this.y > sHeight || this.x < 0 || this.x > sWidth) {
                    this.y = -20;
                    this.x = Math.random() * sWidth;
                }
            }
            draw() {
                sCtx.save();
                sCtx.translate(this.x, this.y);
                sCtx.rotate(this.angle);
                sCtx.beginPath();
                sCtx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
                sCtx.fillStyle = `rgba(255, 175, 204, ${this.opacity})`;
                sCtx.fill();
                sCtx.restore();
            }
        }

        function initHeroBg() {
            sWidth = sakuraCanvas.width = window.innerWidth;
            sHeight = sakuraCanvas.height = window.innerHeight;
            backgroundParticles = [];
            for (let i = 0; i < 50; i++) {
                backgroundParticles.push(new BgParticle());
            }
        }

        function animateHeroBg() {
            sCtx.clearRect(0, 0, sWidth, sHeight);
            backgroundParticles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateHeroBg);
        }

        window.addEventListener('resize', initHeroBg);
        initHeroBg();
        animateHeroBg();
    }

    // Reveal Observer (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- microCMS Integration ---
    // 接続設定は config.js（全ページ共通）にあります
    const { serviceDomain: MICROCMS_SERVICE_DOMAIN, apiKey: MICROCMS_API_KEY } = window.JSTYLE_CONFIG.microcms;
    const newsContainer = document.getElementById('news-container');

    function escapeHtml(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;');
    }

    async function fetchNews() {
        if (!newsContainer) return;

        try {
            const response = await fetch(
                `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/news?limit=3`,
                {
                    headers: {
                        'X-MICROCMS-API-KEY': MICROCMS_API_KEY
                    }
                }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            renderNews(data.contents);
        } catch (error) {
            console.error('ニュースの取得に失敗しました:', error);
            newsContainer.innerHTML = '<p style="color:var(--color-error); grid-column:1/-1; text-align:center;">ニュースの読み込みに失敗しました。</p>';
        }
    }

    function renderNews(contents) {
        if (!newsContainer) return;
        newsContainer.innerHTML = '';

        contents.forEach(content => {
            const date = new Date(content.publishedAt || content.createdAt);
            const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;

            const card = document.createElement('article');
            card.className = 'news-card reveal';
            card.style.cursor = 'pointer';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', content.title);

            // 画像がある場合のみ表示
            const imageHtml = content.image
                ? `<div class="news-image"><img src="${escapeHtml(content.image.url)}" alt="${escapeHtml(content.title)}" loading="lazy" width="400" height="225"></div>`
                : '';

            card.innerHTML = `
                ${imageHtml}
                <div class="news-content">
                    <span class="news-date">${formattedDate}</span>
                    <span class="news-tag">${escapeHtml(content.category || 'お知らせ')}</span>
                    <h3 class="news-title">${escapeHtml(content.title)}</h3>
                </div>
            `;

            const goToDetail = () => {
                // ポップアップではなく詳細ページへ遷移（IDを渡す）
                window.location.href = `news-detail.html?id=${encodeURIComponent(content.id)}`;
            };
            card.addEventListener('click', goToDetail);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToDetail();
                }
            });

            newsContainer.appendChild(card);
            observer.observe(card);
        });
    }

    fetchNews();
});
