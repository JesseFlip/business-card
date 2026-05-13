# Jesse Flippen | SOC Analyst & Security Operations Specialist

Portfolio website for Jesse Flippen — Security Operations Specialist targeting SOC Analyst roles. Built entirely in vanilla HTML, CSS, and JavaScript with no framework dependencies.

**Live Site:** [jflip.netlify.app](https://jflip.netlify.app/)

---

## 🚀 Overview

Transitioning into cybersecurity after building Python automation systems in enterprise environments. This portfolio showcases hands-on security projects, certifications in progress, and a decade of business experience that directly informs threat detection and risk analysis.

Actively pursuing CompTIA Security+, Splunk Core Certified User, and the HTB Junior Cyber Analyst certification while completing the Per Scholas Cybersecurity program (Mar–Jul 2026).

---

## 🛠 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES2020+) — no framework dependencies
- **Deployment:** Netlify with CI/CD via `netlify.toml`
- **Local Dev:** Express.js static server (`server.js`)
- **Design:** CSS custom properties token system, dark mode (auto + manual toggle), responsive mobile-first layout

---

## ✨ Key JavaScript Features

| Feature | Implementation |
|---|---|
| **Section carousel** | Auto-playing slide engine with 8s interval, pause-on-hover, manual navigation |
| **Dark mode toggle** | `data-theme` attribute + `localStorage` persistence; respects `prefers-color-scheme` by default |
| **Mobile hamburger nav** | Animated 3-bar → X transition; closes on link click or outside click |
| **Dynamic Credly badges** | Async `fetch()` via allorigins proxy; earned badges prepended to cert grid at runtime |
| **Active nav highlighting** | Syncs highlighted nav link to the currently visible section |

---

## 📂 Project Structure

```text
├── public/
│   ├── index.html          # Semantic HTML structure (1 h1, 8 sections, proper landmark roles)
│   ├── styles.css          # CSS custom property token system + component styles
│   ├── script.js           # Carousel, dark mode, hamburger nav, Credly badge fetcher
│   ├── images/             # Profile photo (WebP + JPG fallback)
│   └── assets/             # Resume PDF
├── server.js               # Express static server for local development
├── netlify.toml            # Netlify publish dir + redirect configuration
└── package.json            # Node dependencies (Express)
```

---

## 🏃 Running Locally

```bash
npm install
npm run dev       # starts Express server at http://localhost:3000
```

Or serve `public/` directly with any static server:

```bash
npx live-server public/
```

---

## 🔒 Featured Project: Tailscale Raspberry Pi Security Wrap

Built a hardened Raspberry Pi infrastructure for the PyTexas community (~300 attendees at PyTexas 2026) and used it as a live security monitoring exercise:

- UFW firewall with least-privilege port exposure + Fail2ban for SSH brute-force protection
- Tailscale mesh VPN for network-agnostic remote access
- Splunk log forwarding with real-time threat detection dashboard and unauthorized access alerts
- systemd unit for unattended auto-start; validated at live public venue

**Stack:** Python · FastAPI · Tailscale · Splunk · UFW · Fail2ban · Raspberry Pi · systemd

---

## 🎨 CSS Architecture

`styles.css` is organized into clearly delimited sections:

1. **Custom Properties** — color tokens, shadows, radius, transitions (`:root`)
2. **Dark Mode** — `prefers-color-scheme` media query + `html[data-theme]` manual override
3. **Reset & Base** — box-sizing, body, image defaults
4. **Navigation** — sticky header, hamburger, dark mode toggle button
5. **Layout** — carousel section engine, section height/overflow
6. **Components** — hero card, bio, cert grid, skill categories, project cards, learning cards, experience/education items
7. **Footer**
8. **Responsive** — mobile hamburger nav + single-column grid breakpoints at 768px

---

## 🤝 Connect

- **LinkedIn:** [linkedin.com/in/flippen](https://www.linkedin.com/in/flippen/)
- **Email:** [jss.flppn@gmail.com](mailto:jss.flppn@gmail.com)
- **Credly:** [credly.com/users/jflip](https://www.credly.com/users/jflip/badges)
- **Location:** Dallas, TX
