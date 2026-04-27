// JavaScript for interactivity
console.log("Portfolio loaded");

// Example: smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Ignore plain '#' links or empty links
        if (targetId === '#' || !targetId) {
            return;
        }

        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for scroll animations
document.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add('js-enabled');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once it's visible
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    const fadeElements = document.querySelectorAll('.fade-in-section');
    fadeElements.forEach((el) => observer.observe(el));

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
