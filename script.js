// Interactivity & Dynamic Data Fetching

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management
    // The .light-theme class is applied to <html> by an inline script in <head>
    // (before first paint) to avoid a flash of the wrong theme.
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');

    updateThemeIcon(root.classList.contains('light-theme') ? 'light' : 'dark');

    themeBtn.addEventListener('click', () => {
        const apply = () => {
            root.classList.toggle('light-theme');
            const currentTheme = root.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon(currentTheme);
            updateLeetCodeCardTheme(currentTheme);
            updateCodeforcesCardTheme(currentTheme);
        };
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Animated circular wipe from the toggle (View Transitions API).
        if (!document.startViewTransition || reduce) { apply(); return; }
        const rect = themeBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const transition = document.startViewTransition(apply);
        transition.ready.then(() => {
            root.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                { duration: 520, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' }
            );
        });
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'light') {
            themeBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            `;
            themeBtn.title = "Switch to Dark Mode";
        } else {
            themeBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            `;
            themeBtn.title = "Switch to Light Mode";
        }
    }

    // 2. Explore Work Dropdown
    const exploreBtn = document.getElementById('explore-btn');
    const exploreDropdown = document.getElementById('explore-dropdown');
    const dropdownContainer = exploreBtn.parentElement;
    
    exploreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownContainer.classList.toggle('open');
        if (isOpen) {
            exploreDropdown.classList.add('show');
        } else {
            exploreDropdown.classList.remove('show');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!dropdownContainer.contains(e.target)) {
            dropdownContainer.classList.remove('open');
            exploreDropdown.classList.remove('show');
        }
    });

    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            dropdownContainer.classList.remove('open');
            exploreDropdown.classList.remove('show');
        });
    });

    // 3. Skill Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-category-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            skillCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'flex';
                } else if (card.dataset.category === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 4. Stats Theme Sync
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
    updateLeetCodeCardTheme(initialTheme);
    updateGitHubCardTheme(initialTheme);
    updateCodeforcesCardTheme(initialTheme);

    // 5. Accessibility: hide decorative inline SVG icons from screen readers.
    // Every icon here is paired with visible text or an aria-label on its parent.
    document.querySelectorAll('svg:not([aria-hidden])').forEach(svg => {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
    });

    // 6. Graceful fallback for third-party stat cards (free services that can be
    // down or rate-limited): swap a broken image for a link to the profile.
    document.querySelectorAll('img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
            if (img.dataset.failed) return; // guard against re-entrancy
            img.dataset.failed = 'true';
            const link = document.createElement('a');
            link.href = img.dataset.fallback;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'stats-fallback';
            link.textContent = (img.dataset.fallbackLabel || 'View profile') + ' →';
            img.replaceWith(link);
        });
    });

    // 7. Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-links');
    if (navToggle && navMenu) {
        const closeNav = () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
        };
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeNav);
        });
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') &&
                !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeNav();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNav();
        });
    }

    // 8. Scroll-reveal for sections
    const revealEls = document.querySelectorAll('.reveal');
    const revealAll = () => revealEls.forEach(el => el.classList.add('is-visible'));
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
        revealEls.forEach(el => revealObserver.observe(el));
        // Failsafe: if the observer never reveals the first section (e.g. it
        // isn't firing in this environment), reveal everything so content is
        // never stuck hidden. Runs regardless of the load event.
        setTimeout(() => {
            if (revealEls.length && !revealEls[0].classList.contains('is-visible')) {
                revealAll();
            }
        }, 1500);
    } else {
        revealAll();
    }
    window.__revealReady = true;

    // 9. Active nav link on scroll (scrollspy)
    const spySections = document.querySelectorAll('main section[id]');
    const navLinkByHash = {};
    document.querySelectorAll('.nav-link').forEach(link => {
        navLinkByHash[link.getAttribute('href')] = link;
    });
    if ('IntersectionObserver' in window && spySections.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = navLinkByHash['#' + entry.target.id];
                    if (link) {
                        Object.keys(navLinkByHash).forEach(k => navLinkByHash[k].classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px' });
        spySections.forEach(s => spy.observe(s));
    }

    // 10. Kinetic hero name, then trigger the entrance after first paint
    kineticHero();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => document.documentElement.classList.add('ready'));
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 11. Scroll progress bar
    const progress = document.getElementById('scroll-progress');
    if (progress) {
        let ticking = false;
        const updateProgress = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            const pct = max > 0 ? h.scrollTop / max : 0;
            progress.style.transform = `scaleX(${pct})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateProgress);
            }
        }, { passive: true });
        updateProgress();
    }

    // The pointer-driven flourishes below are motion; skip when reduced motion
    // is requested or on touch-only devices (no real cursor to track).
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!reduceMotion && hasFinePointer) {

        // 12. Cursor spotlight on cards
        const spotlightCards = document.querySelectorAll('.card, .timeline-content');
        spotlightCards.forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
            });
        });

        // 13. Magnetic primary buttons
        const magnets = document.querySelectorAll('.btn-primary');
        const STRENGTH = 0.3;
        const RADIUS = 90;
        magnets.forEach(btn => {
            btn.addEventListener('pointermove', (e) => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                if (Math.hypot(dx, dy) < rect.width / 2 + RADIUS) {
                    btn.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
                }
            });
            btn.addEventListener('pointerleave', () => {
                btn.style.transform = '';
            });
        });

        // 14. Custom cursor — instant dot + smoothly-trailing ring.
        // The dot is positioned synchronously on pointermove (no easing) so it
        // tracks 1:1 and never feels laggy; only the ring trails, by design.
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (dot && ring) {
            document.documentElement.classList.add('has-custom-cursor');

            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let ringX = mouseX;
            let ringY = mouseY;
            let first = true;
            let shown = false;

            window.addEventListener('pointermove', (e) => {
                if (e.pointerType && e.pointerType !== 'mouse') return; // ignore touch/pen
                mouseX = e.clientX;
                mouseY = e.clientY;
                // Dot is instant — set transform right here, no lerp.
                dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                if (first) {
                    ringX = mouseX;
                    ringY = mouseY;
                    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
                    first = false;
                }
                if (!shown) {
                    shown = true;
                    dot.classList.add('is-active');
                    ring.classList.add('is-active');
                }
            }, { passive: true });

            // Ring trails with a light lerp (the only eased element).
            const ringLoop = () => {
                ringX += (mouseX - ringX) * 0.22;
                ringY += (mouseY - ringY) * 0.22;
                ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
                requestAnimationFrame(ringLoop);
            };
            requestAnimationFrame(ringLoop);

            // Hide when the pointer leaves the window, show on return.
            document.addEventListener('mouseleave', () => {
                dot.classList.remove('is-active');
                ring.classList.remove('is-active');
                shown = false;
            });
            document.addEventListener('mouseenter', () => {
                dot.classList.add('is-active');
                ring.classList.add('is-active');
                shown = true;
            });

            // Ring grows over interactive targets.
            const interactive = 'a, button, .filter-btn, .card, .timeline-content, [role="button"]';
            document.querySelectorAll(interactive).forEach(el => {
                el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
                el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
            });

            // Tighten on press.
            window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
            window.addEventListener('pointerup', () => ring.classList.remove('is-down'));
        }
    }

    // 15. Count-up numbers, live GitHub panel, timeline progress fill
    initCountUps();
    initGitHubPanel();
    initTimelineProgress();

    // 16. Command palette (⌘K / Ctrl+K)
    initCommandPalette();

    // 17. Skill usage tooltips (where each skill was used)
    initSkillUsage();
});

// ---------- Count-up animation ----------
function animateCount(el, target, decimals, suffix, prefix, duration) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = (v) => prefix + v.toFixed(decimals) + suffix;
    if (reduce) { el.textContent = fmt(target); return; }
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = fmt(target * ease(p));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
}

function setupCountUp(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const run = () => animateCount(el, target, decimals, suffix, prefix, 1600);
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { run(); o.unobserve(e.target); } });
        }, { threshold: 0.4 });
        obs.observe(el);
    } else {
        run();
    }
}

function initCountUps() {
    document.querySelectorAll('[data-count]').forEach(setupCountUp);
}

// ---------- Live GitHub panel ----------
async function initGitHubPanel() {
    const panel = document.getElementById('gh-panel');
    if (!panel) return;
    const user = panel.dataset.user;
    const statsEl = document.getElementById('gh-stats');
    const langsEl = document.getElementById('gh-langs');
    const reposEl = document.getElementById('gh-repos');
    try {
        const data = await fetchGitHubData(user);
        renderGitHubPanel(data, statsEl, langsEl, reposEl);
    } catch (e) {
        if (statsEl) statsEl.innerHTML = '';
        if (langsEl) langsEl.innerHTML = '';
        if (reposEl) {
            reposEl.innerHTML = '<a class="stats-fallback" href="https://github.com/' + user +
                '" target="_blank" rel="noopener">View GitHub profile →</a>';
        }
    }
}

async function fetchGitHubData(user) {
    const key = 'ghpanel:' + user;
    try { const c = sessionStorage.getItem(key); if (c) return JSON.parse(c); } catch (e) {}
    const [uRes, rRes] = await Promise.all([
        fetch('https://api.github.com/users/' + user),
        fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed')
    ]);
    if (!uRes.ok || !rRes.ok) throw new Error('GitHub API error');
    const u = await uRes.json();
    const repos = (await rRes.json()).filter(r => !r.fork);
    const langCount = {};
    repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const languages = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a]);
    const recent = repos
        .filter(r => r.name.toLowerCase() !== user.toLowerCase() && !/\.github\.io$/i.test(r.name))
        .slice(0, 4)
        .map(r => ({ name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, url: r.html_url }));
    const result = {
        repos: u.public_repos,
        projects: repos.length,
        languages: languages.length,
        topLanguages: languages.slice(0, 6),
        recent: recent
    };
    try { sessionStorage.setItem(key, JSON.stringify(result)); } catch (e) {}
    return result;
}

function ghEscape(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function langColor(lang) {
    const map = {
        Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
        CSS: '#563d7c', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8', Rust: '#dea584',
        Java: '#b07219', 'Jupyter Notebook': '#DA5B0B', Shell: '#89e051'
    };
    return map[lang] || 'var(--primary)';
}

function renderGitHubPanel(d, statsEl, langsEl, reposEl) {
    if (statsEl) {
        statsEl.innerHTML = [
            [d.repos, 'Repositories'],
            [d.projects, 'Projects'],
            [d.languages, 'Languages']
        ].map(([n, label]) =>
            `<div class="gh-stat"><span class="gh-stat-num" data-count="${n}">0</span><span class="gh-stat-label">${label}</span></div>`
        ).join('');
        statsEl.querySelectorAll('.gh-stat-num').forEach(setupCountUp);
    }
    if (langsEl) {
        langsEl.innerHTML = d.topLanguages.map(l =>
            `<span class="gh-lang"><span class="gh-lang-dot" style="background:${langColor(l)}"></span>${ghEscape(l)}</span>`
        ).join('');
    }
    if (reposEl) {
        reposEl.innerHTML = d.recent.map(r =>
            '<a class="gh-repo" href="' + ghEscape(r.url) + '" target="_blank" rel="noopener">' +
            '<span class="gh-repo-name">' + ghEscape(r.name) + '</span>' +
            '<span class="gh-repo-desc">' + ghEscape(r.description || 'No description provided.') + '</span>' +
            '<span class="gh-repo-meta">' +
            (r.language ? '<span><span class="gh-lang-dot" style="background:' + langColor(r.language) + '"></span>' + ghEscape(r.language) + '</span>' : '') +
            (r.stars > 0 ? '<span>★ ' + r.stars + '</span>' : '') +
            '</span></a>'
        ).join('');
    }
}

// ---------- Timeline scroll progress ----------
function initTimelineProgress() {
    const timeline = document.querySelector('.timeline');
    const fill = document.getElementById('timeline-progress');
    if (!timeline || !fill) return;
    const dots = Array.prototype.slice.call(document.querySelectorAll('.timeline-dot'));
    let ticking = false;
    const update = () => {
        ticking = false;
        const rect = timeline.getBoundingClientRect();
        const readLine = window.innerHeight * 0.6;
        let filled = Math.max(0, Math.min(readLine - rect.top, rect.height));
        fill.style.height = filled + 'px';
        dots.forEach(dot => {
            const dRect = dot.getBoundingClientRect();
            const dotY = dRect.top + dRect.height / 2 - rect.top;
            dot.classList.toggle('reached', dotY <= filled);
        });
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

// ---------- Skill usage: where each skill was actually used ----------
// 'p' = project, 'e' = experience. A string value = a plain note (no list).
const SKILL_USAGE = {
    'Python': [['AtlasInfer', 'p'], ['ECG Analysis Suite', 'p'], ['Livepeer', 'e'], ['IIT Bombay (NLP)', 'e']],
    'TypeScript': [['AutoMarket', 'e'], ['CodeQuorum', 'p']],
    'C/C++': 'Coursework — Data Structures & Operating Systems',
    'PyTorch': [['AtlasInfer', 'p'], ['ECG Analysis Suite', 'p']],
    'CUDA': [['AtlasInfer', 'p']],
    'Triton': [['AtlasInfer', 'p']],
    'HuggingFace Diffusers': [['Livepeer', 'e']],
    'LLM APIs (Anthropic, DeepSeek)': [['AutoMarket', 'e'], ['IIT Bombay (NLP)', 'e']],
    'Quantization (INT8/NF4)': [['AtlasInfer', 'p']],
    'scikit-learn': [['ECG Analysis Suite', 'p']],
    'OpenCV': [['ECG Analysis Suite', 'p']],
    'Docker': [['Livepeer', 'e']],
    'Git': 'Used across every project and role',
    'SQLite (WAL)': [['AutoMarket', 'e'], ['CodeQuorum', 'p']],
    'Multi-tenant Architecture': [['AutoMarket', 'e']],
    'Node.js': [['AutoMarket', 'e'], ['CodeQuorum', 'p']],
    'Express.js': [['AutoMarket', 'e']],
    'FastAPI': [['Livepeer', 'e']],
    'REST APIs': [['AutoMarket', 'e']],
    'WebSockets / Socket.IO': [['CodeQuorum', 'p']],
    'React.js': [['AutoMarket', 'e']],
    'Next.js': [['AutoMarket', 'e']],
    'HTML5/CSS3': 'Including this portfolio (hand-written, no framework)'
};

function initSkillUsage() {
    const badges = document.querySelectorAll('.skill-badge');
    if (!badges.length) return;

    const tip = document.createElement('div');
    tip.className = 'skill-tip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.appendChild(tip);

    const typeLabel = (t) => (t === 'p' ? 'Project' : 'Experience');

    const renderTip = (skill, uses) => {
        let body;
        if (Array.isArray(uses)) {
            body = '<div class="skill-tip-label">Used in</div>' + uses.map(([name, type]) =>
                '<div class="skill-tip-item">' +
                '<span class="skill-tip-name ' + type + '"><span class="dot"></span>' + name + '</span>' +
                '<span class="skill-tip-type ' + type + '">' + typeLabel(type) + '</span>' +
                '</div>').join('');
        } else {
            body = '<div class="skill-tip-note">' + (uses || 'Part of my core toolkit') + '</div>';
        }
        return '<div class="skill-tip-title">' + skill + '</div>' + body;
    };

    let current = null;

    const show = (badge) => {
        const skill = badge.textContent.trim();
        const uses = SKILL_USAGE[skill];
        current = badge;
        tip.innerHTML = renderTip(skill, uses);
        tip.hidden = false;
        tip.style.opacity = '0';
        // Measure, then position centered on the badge, clamped to the viewport.
        const r = badge.getBoundingClientRect();
        const tw = tip.offsetWidth;
        const th = tip.offsetHeight;
        const half = tw / 2;
        let cx = r.left + r.width / 2;
        cx = Math.max(8 + half, Math.min(cx, window.innerWidth - 8 - half));
        tip.style.left = cx + 'px';
        // Prefer above the badge; flip below when there isn't room.
        if (r.top - th - 12 < 8) {
            tip.style.top = (r.bottom + 10) + 'px';
            tip.style.transform = 'translate(-50%, 0)';
        } else {
            tip.style.top = (r.top - 10) + 'px';
            tip.style.transform = 'translate(-50%, -100%)';
        }
        tip.style.opacity = '1';
    };

    const hide = (badge) => {
        if (badge && badge !== current) return;
        current = null;
        tip.style.opacity = '0';
        tip.hidden = true;
    };

    badges.forEach(badge => {
        const skill = badge.textContent.trim();
        const uses = SKILL_USAGE[skill];
        if (Array.isArray(uses)) {
            badge.setAttribute('data-linked', '');
            badge.setAttribute('aria-label', skill + ' — used in ' + uses.map(u => u[0]).join(', '));
        } else {
            badge.setAttribute('aria-label', skill + (uses ? ' — ' + uses : ''));
        }
        badge.tabIndex = 0;
        badge.addEventListener('pointerenter', () => show(badge));
        badge.addEventListener('pointerleave', () => hide(badge));
        badge.addEventListener('focus', () => show(badge));
        badge.addEventListener('blur', () => hide(badge));
    });

    // Keep the fixed-position tooltip from detaching if the page scrolls.
    window.addEventListener('scroll', () => hide(current), { passive: true });
}

// ---------- Kinetic hero: split the name into animatable characters ----------
function kineticHero() {
    const h1 = document.querySelector('.hero h1');
    if (!h1 || h1.classList.contains('kinetic')) return;
    const nameSpan = h1.querySelector('span');
    const namePart = nameSpan ? nameSpan.textContent : '';
    let leadText = '';
    for (const node of h1.childNodes) {
        if (node === nameSpan) break;
        if (node.nodeType === 3) leadText += node.textContent;
    }
    h1.textContent = '';
    let idx = 0;
    const addChars = (text, gradient) => {
        Array.prototype.forEach.call(text, (ch) => {
            const s = document.createElement('span');
            s.className = 'char' + (gradient ? ' grad-char' : '');
            s.style.setProperty('--i', idx++);
            if (ch === ' ') s.innerHTML = '&nbsp;';
            else s.textContent = ch;
            h1.appendChild(s);
        });
    };
    addChars(leadText, false);
    addChars(namePart, true);
    h1.classList.add('kinetic');
}

// ---------- Command palette (Cmd/Ctrl + K) ----------
function initCommandPalette() {
    const cmdk = document.getElementById('cmdk');
    const input = document.getElementById('cmdk-input');
    const list = document.getElementById('cmdk-list');
    const empty = document.getElementById('cmdk-empty');
    const trigger = document.getElementById('cmdk-trigger');
    if (!cmdk || !input || !list) return;

    const ICONS = {
        nav: '<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"></polyline></svg>',
        action: '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>',
        link: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
    };

    const goTo = (sel) => () => {
        const t = document.querySelector(sel);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const openUrl = (url) => () => window.open(url, '_blank', 'noopener');

    const commands = [
        { label: 'About', hint: 'Section', type: 'nav', kw: 'bio who am i', action: goTo('#about') },
        { label: 'Experience', hint: 'Section', type: 'nav', kw: 'work history jobs career', action: goTo('#experience') },
        { label: 'Projects', hint: 'Section', type: 'nav', kw: 'work atlasinfer codequorum ecg', action: goTo('#projects') },
        { label: 'Skills', hint: 'Section', type: 'nav', kw: 'tech stack languages', action: goTo('#skills') },
        { label: 'Education', hint: 'Section', type: 'nav', kw: 'university degree bml munjal', action: goTo('#education') },
        { label: 'Open Source', hint: 'Section', type: 'nav', kw: 'github stats repos codeforces leetcode', action: goTo('#stats') },
        { label: 'Contact', hint: 'Section', type: 'nav', kw: 'email hire reach out', action: goTo('#contact') },
        { label: 'Toggle theme', hint: 'Action', type: 'action', kw: 'dark light mode appearance', action: () => { const b = document.getElementById('theme-toggle'); if (b) b.click(); } },
        { label: 'View Résumé (PDF)', hint: 'Open', type: 'link', kw: 'resume cv download', action: openUrl('resume.pdf') },
        { label: 'GitHub', hint: 'Profile', type: 'link', kw: 'code repos source', action: openUrl('https://github.com/nishantkluhera') },
        { label: 'LinkedIn', hint: 'Profile', type: 'link', kw: 'work network', action: openUrl('https://linkedin.com/in/nishantkluhera') },
        { label: 'Twitter', hint: 'Profile', type: 'link', kw: 'x social', action: openUrl('https://twitter.com/luheranishant') },
        { label: 'Email me', hint: 'Action', type: 'action', kw: 'mail contact hire', action: () => { window.location.href = 'mailto:nishantkluhera@gmail.com'; } },
        { label: 'Copy email address', hint: 'Action', type: 'action', kw: 'mail clipboard', action: () => { if (navigator.clipboard) navigator.clipboard.writeText('nishantkluhera@gmail.com'); } }
    ];

    let filtered = commands.slice();
    let active = 0;

    function render() {
        list.innerHTML = filtered.map((c, i) =>
            '<li class="cmdk-item' + (i === active ? ' is-active' : '') + '" role="option" data-i="' + i +
            '" aria-selected="' + (i === active) + '">' +
            '<span class="cmdk-ico">' + (ICONS[c.type] || ICONS.nav) + '</span>' +
            '<span class="cmdk-label">' + c.label + '</span>' +
            '<span class="cmdk-hint">' + (c.hint || '') + '</span></li>'
        ).join('');
        empty.hidden = filtered.length > 0;
        list.hidden = filtered.length === 0;
    }

    function filter(q) {
        q = q.trim().toLowerCase();
        filtered = !q ? commands.slice() : commands.filter(c =>
            (c.label + ' ' + (c.kw || '') + ' ' + (c.hint || '')).toLowerCase().indexOf(q) !== -1);
        active = 0;
        render();
    }

    function ensureVisible() {
        const el = list.querySelector('.cmdk-item.is-active');
        if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function openPalette() {
        cmdk.hidden = false;
        document.documentElement.style.overflow = 'hidden';
        input.value = '';
        filter('');
        input.focus();
    }

    function closePalette() {
        if (cmdk.hidden) return;
        cmdk.hidden = true;
        document.documentElement.style.overflow = '';
        if (trigger) trigger.focus();
    }

    function exec(i) {
        const c = filtered[i];
        if (!c) return;
        closePalette();
        setTimeout(() => c.action(), 0);
    }

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            cmdk.hidden ? openPalette() : closePalette();
            return;
        }
        if (cmdk.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); render(); ensureVisible(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); ensureVisible(); }
        else if (e.key === 'Enter') { e.preventDefault(); exec(active); }
        else if (e.key === 'Tab') { e.preventDefault(); } // keep focus trapped on the input
    });

    input.addEventListener('input', () => filter(input.value));
    list.addEventListener('click', (e) => {
        const item = e.target.closest('.cmdk-item');
        if (item) exec(parseInt(item.dataset.i, 10));
    });
    list.addEventListener('mousemove', (e) => {
        const item = e.target.closest('.cmdk-item');
        if (item) {
            const i = parseInt(item.dataset.i, 10);
            if (i !== active) { active = i; render(); }
        }
    });
    cmdk.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-cmdk-close')) closePalette();
    });
    if (trigger) trigger.addEventListener('click', openPalette);
}

// LeetCode Stats Card Theme Sync
function updateLeetCodeCardTheme(theme) {
    const lcImg = document.getElementById('leetcode-stats-img');
    if (lcImg) {
        lcImg.src = `https://github-readme-leetcode-card.romitsagu.com/nishantluhera?theme=${theme === 'light' ? 'light' : 'tokyonight'}&show=graph,recent`;
    }
}

// GitHub Stats Card Theme Sync
function updateGitHubCardTheme(theme) {
    const ghImg = document.getElementById('github-streak-img');
    if (ghImg) {
        ghImg.src = `https://github-readme-streak-stats.herokuapp.com/?user=nishantkluhera&theme=${theme === 'light' ? 'light' : 'tokyonight'}`;
    }
}

// Codeforces Stats Card Theme Sync
function updateCodeforcesCardTheme(theme) {
    const cfImg = document.getElementById('codeforces-card-img');
    if (cfImg) {
        cfImg.src = `https://codeforces-stats-vlx.vercel.app/api/card?username=nishantluhera&v2&theme=${theme === 'light' ? 'default' : 'tokyonight'}`;
    }
}
