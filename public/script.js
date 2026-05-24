// ═══════════════════════════════════════════════════════
// Dark Mode — manual toggle with localStorage persistence
// Falls back to prefers-color-scheme when no preference saved
// ═══════════════════════════════════════════════════════

/**
 * Initialises the dark/light mode toggle.
 * Reads saved preference from localStorage; applies `data-theme` attribute
 * on <html>. CSS media query handles the system-preference default case.
 */
function initDarkMode() {
    const btn  = document.getElementById('dark-mode-toggle');
    const icon = document.getElementById('dark-mode-icon');
    if (!btn) return;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    };

    // Apply saved preference on page load
    const saved = localStorage.getItem('darkMode');
    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    }
    // No saved value → CSS media query handles it automatically

    btn.addEventListener('click', () => {
        // Determine what the effective current mode is
        const currentAttr = document.documentElement.getAttribute('data-theme');
        const systemDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark      = currentAttr === 'dark' || (currentAttr !== 'light' && systemDark);

        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('darkMode', next);
    });
}

// ═══════════════════════════════════════════════════════
// Mobile Navigation — hamburger toggle
// ═══════════════════════════════════════════════════════

/**
 * Wires the hamburger button to open/close the nav on mobile.
 * Closes on nav-link click or outside click.
 */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks  = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    const closeNav = () => {
        navLinks.classList.remove('nav-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('nav-open');
        hamburger.classList.toggle('is-active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when a nav link is clicked (also triggers carousel navigation)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            closeNav();
        }
    });
}

// ═══════════════════════════════════════════════════════
// Carousel — section-based auto-playing slide engine
// ═══════════════════════════════════════════════════════

let currentSlideIndex = 0;
let slideInterval;
const slideDuration = 8000; // ms per slide

/**
 * Initialises the carousel: activates the first section,
 * starts auto-play, and pauses on mouse hover.
 */
function initCarousel() {
    const sections = Array.from(document.querySelectorAll('main > section'));
    if (sections.length === 0) return;

    sections.forEach((sec, idx) => {
        sec.classList.toggle('active', idx === 0);
    });

    startAutoPlay();

    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.addEventListener('mouseenter', pauseAutoPlay);
        mainContainer.addEventListener('mouseleave', startAutoPlay);
    }
}

/**
 * Transitions to the section at `index`, wrapping around.
 * Updates active nav link to match.
 * @param {number} index - Target section index
 */
function showSlide(index) {
    const sections = Array.from(document.querySelectorAll('main > section'));
    if (index >= sections.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = sections.length - 1;
    } else {
        currentSlideIndex = index;
    }

    sections.forEach((sec, idx) => {
        if (idx === currentSlideIndex) {
            sec.classList.add('active');
            sec.scrollTop = 0;

            // Sync active state on nav links
            const activeId = sec.id;
            document.querySelectorAll('.nav-links a').forEach(nav => {
                nav.classList.toggle('active', nav.getAttribute('href') === '#' + activeId);
            });
        } else {
            sec.classList.remove('active');
        }
    });
}

function nextSlide()    { showSlide(currentSlideIndex + 1); }
function startAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
}
function pauseAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
}

// ═══════════════════════════════════════════════════════
// Carousel nav-link click overrides
// ═══════════════════════════════════════════════════════
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;

        e.preventDefault();
        const sections   = Array.from(document.querySelectorAll('main > section'));
        const targetIndex = sections.findIndex(sec => '#' + sec.id === targetId);
        if (targetIndex !== -1) {
            showSlide(targetIndex);
            startAutoPlay();
        }
    });
});

// ═══════════════════════════════════════════════════════
// GitHub repository fetcher — displays recent projects
// ═══════════════════════════════════════════════════════

/**
 * Fetches recent GitHub repositories and displays them
 * in a clean grid format with language, stars, and update info.
 */
async function fetchGitHubRepos() {
    const repoGrid = document.getElementById('github-repos-grid');
    if (!repoGrid) return;

    try {
        const response = await fetch('https://api.github.com/users/JesseFlip/repos?sort=updated&per_page=12');
        if (!response.ok) throw new Error('Failed to fetch repositories');

        const repos = await response.json();

        // Clear loading spinner
        repoGrid.innerHTML = '';

        // Filter out forks unless they have significant activity
        const filteredRepos = repos.filter(repo => !repo.fork || repo.stargazers_count > 0);

        // Take top 12 most recently updated
        const recentRepos = filteredRepos.slice(0, 12);

        recentRepos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'github-repo-card';

            // Language badge
            let languageBadge = '';
            if (repo.language) {
                const langClass = repo.language.toLowerCase().replace(/[^a-z0-9]/g, '-');
                languageBadge = `<span class="language-badge lang-${langClass}">${repo.language}</span>`;
            }

            // Format last update date
            const lastUpdate = new Date(repo.updated_at);
            const now = new Date();
            const diffDays = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
            let updateText;
            if (diffDays === 0) updateText = 'Updated today';
            else if (diffDays === 1) updateText = 'Updated yesterday';
            else if (diffDays < 7) updateText = `Updated ${diffDays} days ago`;
            else if (diffDays < 30) updateText = `Updated ${Math.floor(diffDays / 7)} weeks ago`;
            else if (diffDays < 365) updateText = `Updated ${Math.floor(diffDays / 30)} months ago`;
            else updateText = `Updated ${Math.floor(diffDays / 365)} years ago`;

            card.innerHTML = `
                <div class="repo-header">
                    <h4><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github" aria-hidden="true"></i> ${repo.name}
                    </a></h4>
                    ${languageBadge}
                </div>
                <p class="repo-description">${repo.description || 'No description provided'}</p>
                <div class="repo-meta">
                    ${repo.stargazers_count > 0 ? `<span><i class="fas fa-star" aria-hidden="true"></i> ${repo.stargazers_count}</span>` : ''}
                    ${repo.forks_count > 0 ? `<span><i class="fas fa-code-branch" aria-hidden="true"></i> ${repo.forks_count}</span>` : ''}
                    <span class="repo-updated"><i class="fas fa-clock" aria-hidden="true"></i> ${updateText}</span>
                </div>
            `;

            repoGrid.appendChild(card);
        });

    } catch (error) {
        console.error('GitHub repository fetch failed:', error);
        repoGrid.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Unable to load repositories. <a href="https://github.com/JesseFlip?tab=repositories" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>';
    }
}

// ═══════════════════════════════════════════════════════
// Credly badge fetcher — dynamically prepends earned badges
// ═══════════════════════════════════════════════════════

/**
 * Fetches earned Credly badges via allorigins proxy and
 * prepends them to the certifications grid.
 */
async function fetchBadges() {
    const certGrid = document.querySelector('.cert-grid');
    if (!certGrid) return;

    try {
        const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.credly.com/users/jflip/badges.json');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch badges');

        const badgesData = await response.json();
        const badges     = badgesData.data || [];
        const elements   = [];

        badges.forEach(badge => {
            const card = document.createElement('div');
            card.className = 'cert-card';

            const iconContainer = document.createElement('div');
            iconContainer.className = 'cert-icon';
            const img = document.createElement('img');
            img.src = badge.image_url;
            img.alt = badge.badge_template.name;
            iconContainer.appendChild(img);

            const title = document.createElement('h3');
            title.textContent = badge.badge_template.name;

            const earnedBadge = document.createElement('span');
            earnedBadge.className = 'cert-badge earned';
            earnedBadge.textContent = 'Earned';

            card.appendChild(iconContainer);
            card.appendChild(title);
            card.appendChild(earnedBadge);

            if (badge.badge_template.url) {
                const link = document.createElement('a');
                link.href   = badge.badge_template.url;
                link.target = '_blank';
                link.rel    = 'noopener noreferrer';
                Object.assign(link.style, { textDecoration: 'none', color: 'inherit', display: 'block' });
                link.appendChild(card);
                elements.push(link);
            } else {
                elements.push(card);
            }
        });

        elements.reverse().forEach(el => certGrid.prepend(el));

    } catch (error) {
        console.error('Credly badge fetch failed (static fallback displayed):', error);
    }
}

// ═══════════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('js-enabled');
    initDarkMode();
    initMobileNav();
    initCarousel();
    fetchBadges();
    fetchGitHubRepos();
});
