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
        root.classList.toggle('light-theme');
        const currentTheme = root.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon(currentTheme);
        updateLeetCodeCardTheme(currentTheme);
        updateGitHubCardTheme(currentTheme);
        updateCodeforcesCardTheme(currentTheme);
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
});

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
