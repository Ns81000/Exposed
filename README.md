# 🚨 Exposed

> **"uBlock hides them. Exposed names them."**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-5.4-646cff.svg)

---

## 📖 What is Exposed?

**Exposed** is a privacy-intelligence platform that reveals the hidden corporate surveillance network active on every website you visit. Unlike ad blockers that silently eliminate trackers, Exposed *exposes* them—showing you exactly who is watching, what they collect, and why it matters.

### The Problem

Every modern website loads dozens of third-party trackers without your knowledge:
- **Ad pixels** tracking your browsing behavior
- **Session recorders** capturing user interactions
- **Fingerprinting scripts** building unique profiles of you
- **Analytics beacons** reporting your activity back to companies

Tools like uBlock Origin block these requests silently. Exposed takes the opposite approach: **let them run, then show you what happened.**

### The Solution

Two tightly integrated components working together:

1. **Chrome Extension** — Acts as your surveillance sensor, intercepting network requests and matching them against 50,000+ known trackers
2. **React Dashboard** — Visualizes the entire tracking ecosystem with interactive D3 graphs, timeline views, and detailed tracker information

All data stays on your machine. Zero cloud. Zero servers. Zero accounts.

---

## ✨ Key Features

### 🔍 **Real-Time Tracker Detection**
Automatically intercepts and identifies every third-party request using the uBlock Origin tracker database. See who's watching *while* you browse.

### 📊 **Interactive D3.js Visualization**
Explore the tracking network as a force-directed graph. Click nodes to see detailed information about each tracker's parent company, category, and risk level.

### 📅 **Sessions & Archives**
Daily sessions auto-archive. Browse historical data, track patterns over time, and understand long-term exposure. Auto-delete after a configurable period (default: 7 days).

### 📤 **Export as HTML Reports**
Generate standalone, shareable HTML reports of your session data. No external dependencies—everything embedded in a single file.

### 🔐 **100% Local-First**
- **No cloud backend.** All data lives in your browser's IndexedDB.
- **No account required.** No signup, no email, no password.
- **No data leaves your machine.** We can't see it. Hackers can't see it. Advertisers definitely can't see it.
- **Open source.** Audit every line. Verify the tracker list. Trust the code.

### 🖥️ **Desktop-Optimized**
Chrome on Windows, macOS, or Linux. Not a mobile tool—intentionally designed for in-depth analysis on a proper screen.

---

## 🛠️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           CHROME EXTENSION (Sensor Layer)               │  │
│  │                                                          │  │
│  │  • Intercepts all network requests                      │  │
│  │  • Matches against uBlock tracker DB (50,000+ sources)  │  │
│  │  • Classifies by company, category, risk level          │  │
│  │  • Stores locally in IndexedDB                          │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │  Real-time messaging                  │
│                         ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          REACT DASHBOARD (Visualization Layer)          │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ D3.js Node Graph | Visit Timeline | Tracker Info │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Daily Archives | HTML Export | Settings Panel    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 The Data Flow

1. **User browses normally** — All pages load exactly as they would without the extension
2. **Extension intercepts requests** — Every HTTP/HTTPS request is analyzed
3. **Tracker matching** — Unknown hosts are matched against the uBlock tracker database
4. **Classification** — Trackers are grouped by company, category, and risk level
5. **Storage** — All data saved locally in browser's IndexedDB
6. **Real-time sync** — Dashboard receives live updates via Chrome messaging API
7. **Visualization** — Interactive graphs, timelines, and details appear instantly

---

## 📁 Project Structure

```
exposed/
│
├── extension/                      # Chrome Extension (Manifest V3)
│   ├── manifest.json              # Extension config & permissions
│   ├── background.js              # Service worker - request interceptor
│   ├── content.js                 # Page metadata extraction
│   ├── popup.html / popup.js       # Extension popup UI
│   ├── data/
│   │   ├── trackers.json          # Compiled uBlock tracker list
│   │   └── companies.json         # Domain → Company + risk mapping
│   └── icons/                     # 16/48/128px extension icons
│
└── dashboard/                      # React + Vite Dashboard
    ├── index.html
    ├── vite.config.js             # Vite build configuration
    ├── tailwind.config.js          # Design system config
    ├── package.json
    ├── postcss.config.js
    ├── public/
    ├── dist/                       # Built & optimized for Vercel
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Routing (Landing → Dashboard)
        ├── components/
        │   ├── Landing.jsx        # Public landing page
        │   ├── Dashboard.jsx       # Main tracker visualization
        │   ├── MobileGate.jsx      # Desktop-only warning
        │   ├── NodeGraph.jsx       # D3.js force-directed graph
        │   ├── Sidebar.jsx         # Sites list panel
        │   ├── VisitTimeline.jsx   # Per-site visit history
        │   ├── TrackerDetailPanel.jsx  # Detailed tracker info
        │   ├── SettingsPanel.jsx   # Session TTL & data control
        │   ├── DailyArchive.jsx    # Archive browser
        │   ├── ExportButton.jsx    # HTML export generator
        │   └── ConnectPrompt.jsx   # Extension connection status
        ├── hooks/
        │   ├── useTrackerStore.js  # Zustand store (IndexedDB bridge)
        │   └── useLiveUpdates.js   # Chrome messaging listener
        ├── db/
        │   └── schema.js           # Dexie.js IndexedDB schema
        ├── utils/
        │   ├── archiver.js         # Session auto-archiving
        │   ├── exportHtml.js       # HTML report generation
        │   └── riskColor.js        # Risk-level color coding
        └── styles/
            └── globals.css         # Design system variables
```

---

## 🚀 Quick Start

### Prerequisites

- **Chrome** (Windows, macOS, or Linux)
- **Node.js** 18+ and **pnpm**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Ns81000/Exposed.git
cd Exposed
```

#### 2. Install Dashboard Dependencies

```bash
cd dashboard
pnpm install
pnpm build
```

#### 3. Load the Extension in Chrome

1. Open **chrome://extensions**
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository
5. The Exposed icon should appear in your Chrome toolbar

#### 4. Start the Dashboard

```bash
# From the dashboard/ directory
pnpm dev
```

The dashboard will be available at **http://localhost:5173** (or the next available port).

#### 5. Start Using It

- Click the Exposed icon in your Chrome toolbar to see a live connection status
- Browse normally—trackers will appear in the dashboard in real-time
- Click on any domain in the sidebar to see detailed tracker activity
- Explore the D3 graph, visit timeline, and tracker profiles

---

## 🎨 Design System

Exposed follows a **calm, minimal design philosophy** with zero visual clutter:

| Aspect | Value |
|--------|-------|
| **Background** | `#09090B` (near-black dark) |
| **Text (Primary)** | `#FAFAFA` (near-white) |
| **Text (Secondary)** | `#A1A1AA` (medium gray) |
| **Surface Levels** | `#111111`, `#1A1A1A`, `#242424` (4-step hierarchy) |
| **Risk Colors** | 🔴 High: `#DC2626` • 🟠 Medium: `#D97706` • 🔵 Low: `#2563EB` |
| **Type Scale** | 11px (labels), 13px (body), 15px (headers), 24px (display) |
| **Font** | Inter or system-ui (no external font loads) |
| **Interactions** | Ghost buttons only, no shadows or gradients |
| **Animations** | Opacity & transform only, capped at 150ms |
| **Spacing** | 4px grid (all spacing in multiples of 4) |

---

## 🌳 Architecture Deep Dive

### Extension Layer

The extension runs as a Manifest V3 service worker, intercepting all network requests:

```javascript
// Simplified flow
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const hostname = new URL(details.url).hostname;
    const tracker = matchAgainstDatabase(hostname);
    
    if (tracker) {
      // Store + broadcast to dashboard
      chrome.storage.local.set({ lastTracker: tracker });
      chrome.runtime.sendMessage({ type: 'TRACKER_FOUND', data: tracker });
    }
  },
  { urls: ['<all_urls>'] }
);
```

### Dashboard Layer

The dashboard is a React SPA using:

- **Zustand** for state management (synced with IndexedDB)
- **Dexie.js** for structured local database
- **D3.js** for force-directed graph visualization
- **Tailwind CSS** for styling
- **Vite** for blazing-fast builds

Real-time updates flow from the extension to the dashboard via `chrome.runtime.sendMessage`:

```javascript
// In dashboard
useEffect(() => {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.source !== 'EXPOSED_EXTENSION') return;
    
    // Tracker found! Update store, re-render graph
    updateTrackerStore(event.data.tracker);
  });
}, []);
```

---

## 💾 Data & Storage

All data is stored in **IndexedDB** with the following schema:

```javascript
{
  sites: [
    { domain: "example.com", firstSeen: Date, trackerCount: Number }
  ],
  trackers: [
    { 
      company: "Google LLC",
      domain: "google-analytics.com",
      category: "Analytics",
      riskLevel: "high"
    }
  ],
  trackerEvents: [
    {
      timestamp: Date,
      siteDomain: "example.com",
      trackingDomain: "google-analytics.com",
      companyName: "Google LLC"
    }
  ],
  visits: [
    {
      domain: "example.com",
      timestamp: Date,
      path: "/page-path",
      section: "main"
    }
  ],
  archives: [
    {
      date: "2026-03-20",
      sitesCount: 42,
      trackersCount: 1203,
      createdAt: Date
    }
  ]
}
```

---

## 📦 Dependencies

### Frontend

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-router-dom": "6.30.1",
  "d3": "7.9.0",
  "zustand": "5.0.8",
  "dexie": "4.0.8",
  "lucide-react": "0.542.0",
  "tailwindcss": "3.4.17",
  "vite": "5.4.20"
}
```

### Why These?

- **React + React Router** → Modern component architecture with client-side routing
- **D3.js** → Industry-standard for complex data visualization
- **Zustand** → Lightweight state management (vs Redux bloat)
- **Dexie.js** → Clean wrapper around IndexedDB
- **Tailwind CSS** → Utility-first styling with design system constraints
- **Vite** → Near-instant hot module replacement + optimized builds

---

## 🛡️ Security & Privacy

### What Exposed Does NOT Do

- ❌ It does **not** block any requests (no content filtering)
- ❌ It does **not** send data to any external server
- ❌ It does **not** require an account or cloud login
- ❌ It does **not** work on mobile (desktop only, by design)
- ❌ It does **not** use analytics, crash reporting, or telemetry

### What This Means

Your browsing data is **100% private**:
- ✅ Open source code—audit every line
- ✅ Local-first architecture—zero external dependencies
- ✅ Verifiable tracker database—inspect the uBlock lists yourself
- ✅ Transparent data model—understand exactly what gets stored

---

## 📦 Deployment

### Vercel (Dashboard)

The dashboard is production-ready for Vercel deployment:

1. **Push to GitHub** (linked to your Vercel account)
2. **Set Build Command:** `cd dashboard && pnpm install && pnpm build`
3. **Set Output Directory:** `dashboard/dist`
4. **Deploy**

```bash
# Local preview
pnpm build
pnpm preview
```

### Chrome Web Store (Extension)

To submit the extension to the Chrome Web Store:

1. Bundle the `extension/` folder as a `.zip`
2. Create a developer account at [Chrome Web Store](https://chrome.google.com/webstore/category/extensions)
3. Upload the ZIP and fill in metadata
4. Wait for review (~1-3 days)

---

## 🧪 Development

### Running Locally

**Terminal 1 — Dashboard Dev Server:**
```bash
cd dashboard
pnpm dev
# Opens http://localhost:5173
```

**Terminal 2 — Extension Development:**
- Keep the extension loaded in chrome://extensions (Developer mode)
- Changes to extension code require a refresh in Chrome
- Use the dashboard's dev server for instant feedback on UI changes

### Hot Reload Workflow

1. **Dashboard changes** → See instantly (Vite HMR)
2. **Extension code changes** → Refresh the extension in chrome://extensions, then refresh the dashboard page
3. **Tracker database changes** → Copy new data/trackers.json, refresh dashboard

---

## 🎯 Roadmap

### Current (v1.0)

- ✅ Real-time tracker detection
- ✅ D3.js visualization
- ✅ Daily auto-archive
- ✅ HTML export
- ✅ LocalStorage configuration
- ✅ Landing page + mobile gate

### Future (v1.1+)

- [ ] Firefox extension support
- [ ] Tracker pattern detection (fingerprinting, session recording, etc.)
- [ ] Company profile pages with risk assessments
- [ ] Tracker blocking toggle (opt-in)
- [ ] Data usage analytics (bandwidth, CPU cost of trackers)
- [ ] Browser sync via encrypted backup

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test thoroughly
4. **Commit with clear messages** (`git commit -m 'Add amazing feature'`)
5. **Push to your fork** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request** with a clear description

### Code Style

- Use **ES6+** syntax
- **JSX for React components** (proper indentation, clear structure)
- **No console.log in production** code
- **Comments only for complex logic** (code should be self-documenting)
- **Test changes** before submitting PRs

---

## 📄 License

**MIT License** — Use Exposed freely in personal and commercial projects.

See [LICENSE](./LICENSE) for full details.

---

## 🙋 Support

### Issues & Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/Ns81000/Exposed/issues) with:
- What you were doing
- What you expected
- What actually happened
- Your browser version + OS

### Questions & Discussions

Have questions about how Exposed works? Check [GitHub Discussions](https://github.com/Ns81000/Exposed/discussions) or open a new discussion thread.

---

## 📚 Resources

- **[uBlock Origin](https://github.com/gorhill/uBlock)** — Tracker database source
- **[OWASP Top 10](https://owasp.org/www-project-top-ten/)** — Privacy/security context
- **[Privacy International](https://privacy.international/)** — Tracker research
- **[D3.js Documentation](https://d3js.org/)** — Graph visualization
- **[IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** — Local storage

---

## 👥 Authors

- **Ns8pc** — Core architecture, extension, dashboard design

---

## 🎓 Educational Purpose

Exposed is designed to educate users about corporate surveillance on the web. Understanding the tracking ecosystem is the first step toward digital privacy.

Use responsibly. Stay informed. Stay private.

---

<div align="center">

**"The best time to be paranoid about privacy was yesterday. The second-best time is now."**

[⬆ back to top](#-exposed)

</div>
