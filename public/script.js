// JavaScript for interactivity
console.log("Portfolio loaded");

let currentSlideIndex = 0;
let slideInterval;
const slideDuration = 8000; // 8 seconds per slide

function initCarousel() {
    const sections = Array.from(document.querySelectorAll('main > section'));
    if (sections.length === 0) return;

    // Set initial active state
    sections.forEach((sec, idx) => {
        if (idx === 0) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    startAutoPlay();

    // Pause on hover
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.addEventListener('mouseenter', pauseAutoPlay);
        mainContainer.addEventListener('mouseleave', startAutoPlay);
    }
}

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
            // reset scroll position for the section
            sec.scrollTop = 0;

            // Highlight nav
            const activeId = sec.id;
            document.querySelectorAll('.nav-links a').forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('href') === '#' + activeId) {
                    nav.classList.add('active');
                }
            });
        } else {
            sec.classList.remove('active');
        }
    });
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

function startAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
}

function pauseAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// Carousel Navigation overrides
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId === '#' || !targetId) {
            return;
        }

        e.preventDefault();

        const sections = Array.from(document.querySelectorAll('main > section'));
        const targetIndex = sections.findIndex(sec => '#' + sec.id === targetId);

        if (targetIndex !== -1) {
            showSlide(targetIndex);
            // Reset timer on manual navigation
            startAutoPlay();
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add('js-enabled');

    initCarousel();

    // Fetch and render Credly badges dynamically
    fetchBadges();
});

async function fetchBadges() {
    const certGrid = document.querySelector('.cert-grid');
    if (!certGrid) return;

    try {
        // Use allorigins raw endpoint to avoid CORS issues
        const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.credly.com/users/jflip/badges.json');
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch badges');
        }

        const badgesData = await response.json();
        const badges = badgesData.data || [];

        // Prepend dynamically fetched badges instead of clearing in-progress ones
        const badgeElements = [];

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

            // Optional: Wrap in a link
            if (badge.badge_template.url) {
                const link = document.createElement('a');
                link.href = badge.badge_template.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.textDecoration = 'none';
                link.style.color = 'inherit';
                link.style.display = 'block';
                link.appendChild(card);
                badgeElements.push(link);
            } else {
                badgeElements.push(card);
            }
        });

        // Add all fetched badges at the beginning of the grid
        badgeElements.reverse().forEach(el => certGrid.prepend(el));

    } catch (error) {
        console.error('Error loading badges dynamically:', error);
        // Fallback to hardcoded HTML will not occur as we cleared it, but if it fails before clearing, the hardcoded HTML will remain.
    }
}
