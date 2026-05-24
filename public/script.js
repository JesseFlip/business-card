// ═══════════════════════════════════════════════════════
// Theme System — light, dark, and terminal modes
// ═══════════════════════════════════════════════════════

/**
 * Initialises the theme toggle system with three modes:
 * light, dark, and terminal (hacker aesthetic).
 */
function initThemeSystem() {
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    const terminalBtn = document.getElementById('theme-terminal');
    const logTicker = document.getElementById('security-log-ticker');

    if (!lightBtn || !darkBtn || !terminalBtn) return;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);

        // Update active button states
        lightBtn.classList.toggle('active', theme === 'light');
        darkBtn.classList.toggle('active', theme === 'dark');
        terminalBtn.classList.toggle('active', theme === 'terminal');

        // Show/hide security log ticker in terminal mode
        if (logTicker) {
            logTicker.style.display = theme === 'terminal' ? 'block' : 'none';
        }

        localStorage.setItem('theme', theme);
    };

    // Apply saved preference on page load
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'terminal') {
        applyTheme(saved);
    } else {
        // Default to light mode
        applyTheme('light');
    }

    // Theme button click handlers
    lightBtn.addEventListener('click', () => applyTheme('light'));
    darkBtn.addEventListener('click', () => applyTheme('dark'));
    terminalBtn.addEventListener('click', () => applyTheme('terminal'));
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
// Interactive Command Terminal
// ═══════════════════════════════════════════════════════

/**
 * Implements the interactive command terminal with various commands.
 */
function initCommandTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    if (!input || !output) return;

    const commands = {
        help: () => `Available commands:
  help        - Show this help message
  about       - Learn about Jesse Flippen
  skills      - Display technical skills
  certifications - Show certifications
  projects    - List key projects
  contact     - Get contact information
  clear       - Clear terminal output
  whoami      - Display current user
  pwd         - Print working directory
  ls          - List directory contents
  sudo rm -rf / - Don't try this at home 😉`,

        about: () => `Jesse Flippen - Security Operations Specialist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Targeting SOC Analyst Roles
🔒 AWS Certified Cloud Practitioner
🛡️ CompTIA Security+ Candidate
📊 Splunk SIEM & Threat Detection
🐍 Python Automation Expert
📍 Dallas, TX

Transitioning to cybersecurity after building Python automation
systems in high-stakes enterprise environments.`,

        skills: () => `Core Technical Skills:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  Security Operations
    • SIEM / Log Analysis
    • Splunk SPL Query Writing
    • Incident Triage & Response
    • Threat Detection & Correlation
    • MITRE ATT&CK Framework

☁️  Cloud Security
    • AWS IAM & Security Groups
    • CloudTrail & VPC Flow Logs
    • Cloud Threat Modeling

🐍  Automation
    • Python (log parsing, automation)
    • Bash Scripting
    • FastAPI
    • SSH Key Management`,

        certifications: () => `Certifications & Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AWS Certified Cloud Practitioner (CLF-C02) - Jan 2026
📚 CompTIA Security+ (SY0-701) - In Progress
📚 Splunk Core Certified User - In Progress
📚 HTB Certified Junior Cyber Analyst - Expected Sep 2026
📚 CompTIA Linux+ - Expected Aug 2026
✅ Google AI Essentials - Completed`,

        projects: () => `Featured Projects:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Tailscale Raspberry Pi Security Wrap
   🔒 Hardened infrastructure with UFW, Fail2ban
   📊 Real-time Splunk monitoring & threat detection

2. Enterprise Log Parser & Anomaly Reporter
   🐍 Python automation for log analysis
   🔍 Outlier detection & anomaly flagging

3. Lumbergh Open Source Contribution
   🐛 Windows compatibility & subprocess optimization
   ✅ Merged to main branch

View all projects: https://github.com/JesseFlip`,

        contact: () => `Contact Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: jss.flppn@gmail.com
💼 LinkedIn: linkedin.com/in/flippen
🐙 GitHub: github.com/JesseFlip
🏆 Credly: credly.com/users/jflip
📍 Location: Dallas, TX`,

        clear: () => 'CLEAR_SCREEN',

        whoami: () => 'user',

        pwd: () => '/home/user/portfolio',

        ls: () => `about.txt
certifications/
contact.txt
projects/
skills/
README.md`,

        'sudo rm -rf /': () => `Permission denied. Nice try, hacker! 😎
This is a portfolio site, not a production server.
But I appreciate your sense of humor!`,
    };

    const addLine = (prompt, command, response) => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `
            <span class="terminal-prompt">${prompt}</span>
            <span class="terminal-command"> ${command}</span>
        `;
        output.appendChild(line);

        if (response && response !== 'CLEAR_SCREEN') {
            const responseLine = document.createElement('div');
            responseLine.className = 'terminal-response';
            responseLine.textContent = response;
            output.appendChild(responseLine);
        }

        output.scrollTop = output.scrollHeight;
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            const response = commands[command] ? commands[command]() : `Command not found: ${command}. Type 'help' for available commands.`;

            if (response === 'CLEAR_SCREEN') {
                output.innerHTML = '';
            } else {
                addLine('user@jflip-sec:~$', input.value, response);
            }

            input.value = '';
        }
    });
}

// ═══════════════════════════════════════════════════════
// Security Log Ticker
// ═══════════════════════════════════════════════════════

/**
 * Generates and displays a live scrolling security log ticker.
 */
function initSecurityLogTicker() {
    const ticker = document.getElementById('log-ticker-content');
    if (!ticker) return;

    const logMessages = [
        { level: 'info', message: 'Tailscale Pi Wrap running smoothly. 0 unauthorized attempts intercepted.' },
        { level: 'success', message: 'Log Parser automated reports delivered successfully.' },
        { level: 'info', message: 'Splunk dashboard updated. All threat indicators nominal.' },
        { level: 'success', message: 'UFW firewall rules validated. All ports secure.' },
        { level: 'warning', message: 'GitHub repo fetch complete. 12 projects indexed.' },
        { level: 'info', message: 'SSH key authentication active. Password auth disabled.' },
        { level: 'success', message: 'Fail2ban monitoring active. 0 banned IPs in last 24h.' },
        { level: 'info', message: 'Python automation scripts running on schedule.' },
        { level: 'critical', message: 'Coffee levels low. Initiating reorder protocol.' },
        { level: 'success', message: 'AWS CloudTrail logs forwarded to SIEM successfully.' },
    ];

    const timestamp = () => new Date().toISOString().split('T')[0];

    // Duplicate messages for seamless loop
    const allLogs = [...logMessages, ...logMessages];

    allLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-level ${log.level}">[${log.level.toUpperCase()}]</span>
            <span>${timestamp()}:</span>
            <span>${log.message}</span>
        `;
        ticker.appendChild(entry);
    });
}

// ═══════════════════════════════════════════════════════
// IP/Browser Auditing Tool
// ═══════════════════════════════════════════════════════

/**
 * Fetches and displays the visitor's network footprint.
 */
async function fetchIPInfo() {
    const display = document.getElementById('ip-info-display');
    if (!display) return;

    try {
        display.innerHTML = '<div class="loading-indicator"><i class="fas fa-circle-notch" aria-hidden="true"></i> Scanning...</div>';

        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch IP info');

        const data = await response.json();

        const userAgent = navigator.userAgent;
        const browserInfo = {
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'Not set',
        };

        display.innerHTML = `
            <div class="ip-info-label">Public IP:</div>
            <div class="ip-info-value">${data.ip}</div>

            <div class="ip-info-label">Location:</div>
            <div class="ip-info-value">${data.city}, ${data.region}, ${data.country_name}</div>

            <div class="ip-info-label">ISP:</div>
            <div class="ip-info-value">${data.org}</div>

            <div class="ip-info-label">Timezone:</div>
            <div class="ip-info-value">${data.timezone}</div>

            <div class="ip-info-label">Browser:</div>
            <div class="ip-info-value">${userAgent}</div>

            <div class="ip-info-label">Platform:</div>
            <div class="ip-info-value">${browserInfo.platform}</div>

            <div class="ip-info-label">Language:</div>
            <div class="ip-info-value">${browserInfo.language}</div>

            <div class="ip-info-label">Do Not Track:</div>
            <div class="ip-info-value">${browserInfo.doNotTrack}</div>
        `;

        // Add warning message
        const warning = document.createElement('div');
        warning.style.cssText = 'grid-column: 1 / -1; margin-top: 15px; padding: 10px; background: rgba(255, 159, 10, 0.1); border: 1px solid rgba(255, 159, 10, 0.3); border-radius: 4px; font-size: 0.85rem; color: var(--text-light);';
        warning.innerHTML = '<i class="fas fa-shield-alt" aria-hidden="true"></i> Your data is not being stored. This is a client-side demonstration using public APIs.';
        display.appendChild(warning);

    } catch (error) {
        console.error('Failed to fetch IP info:', error);
        display.innerHTML = `<div class="ip-info-value" style="grid-column: 1 / -1; color: #ff3b30;">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Unable to fetch network information. Please try again later.
        </div>`;
    }
}

function initIPAuditor() {
    const refreshBtn = document.getElementById('refresh-ip-info');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchIPInfo);
    }
    fetchIPInfo(); // Auto-load on page load
}

// ═══════════════════════════════════════════════════════
// Base64/Hex Decoder Utility
// ═══════════════════════════════════════════════════════

/**
 * Implements Base64 and Hex encoding/decoding functionality.
 */
function initDecoder() {
    const input = document.getElementById('decoder-input');
    const output = document.getElementById('decoder-output');
    const decodeBase64Btn = document.getElementById('decode-base64');
    const encodeBase64Btn = document.getElementById('encode-base64');
    const decodeHexBtn = document.getElementById('decode-hex');
    const clearBtn = document.getElementById('clear-decoder');

    if (!input || !output) return;

    decodeBase64Btn?.addEventListener('click', () => {
        try {
            const decoded = atob(input.value.trim());
            output.value = decoded;
        } catch (error) {
            output.value = 'Error: Invalid Base64 string';
        }
    });

    encodeBase64Btn?.addEventListener('click', () => {
        try {
            const encoded = btoa(input.value);
            output.value = encoded;
        } catch (error) {
            output.value = 'Error: Unable to encode string';
        }
    });

    decodeHexBtn?.addEventListener('click', () => {
        try {
            const hex = input.value.trim().replace(/\s/g, '');
            if (!/^[0-9A-Fa-f]*$/.test(hex)) {
                throw new Error('Invalid hex string');
            }
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            output.value = str;
        } catch (error) {
            output.value = 'Error: Invalid hexadecimal string';
        }
    });

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        output.value = '';
    });
}

// ═══════════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('js-enabled');
    initThemeSystem();
    initMobileNav();
    initCarousel();
    fetchBadges();
    fetchGitHubRepos();

    // Initialize terminal features
    initCommandTerminal();
    initSecurityLogTicker();
    initIPAuditor();
    initDecoder();
});
