# web-startpages

A collection of personal browser startpages and Manifest V3 new-tab extensions, styled with frosted glass, terminal aesthetics, live clocks, and fast keyboard workflows.

## 🌐 Live Demos

- **Suite Portal:** [https://viyoga.github.io/web-startpages/](https://viyoga.github.io/web-startpages/)
- **Jobkitty (Desktop):** [https://viyoga.github.io/web-startpages/startpage/jobkitty/](https://viyoga.github.io/web-startpages/startpage/jobkitty/)
- **Mobile Startpage:** [https://viyoga.github.io/web-startpages/startpage/mobile/](https://viyoga.github.io/web-startpages/startpage/mobile/)
- **Abeyant (New Tab):** [https://viyoga.github.io/web-startpages/startpage/abeyant/](https://viyoga.github.io/web-startpages/startpage/abeyant/)
- **Sonder (New Tab):** [https://viyoga.github.io/web-startpages/startpage/sonder/](https://viyoga.github.io/web-startpages/startpage/sonder/)
- **Mist Glass (New Tab):** [https://viyoga.github.io/web-startpages/startpage/mist-glass/](https://viyoga.github.io/web-startpages/startpage/mist-glass/)

---

## 📦 Projects Overview

### 1. `jobkitty` (Desktop Startpage)
- **Terminal Chrome:** Traffic lights, `kabir@esoteric — tty` bar, and fall-in animation.
- **Bookmarks:** Categories (`dev`, `play`, `tools`, `media`) with gradient hover sweeps.
- **Scout Search Bar:** Permanent gradient underline, block caret, and bang search shortcuts (`@yt`, `@rd`, `@ss`, `@brave`, `@dd`).
- **Live Clock:** Status bar clock.

### 2. `mobile` (Retro Minimal Mobile Startpage)
- **Zero-Scroll Fit:** Designed specifically for mobile browser screens.
- **Header:** Pixel cat logo, theme toggle (5 palettes: amber, mallow, gruvbox, safelight, tungsten), and font switcher.
- **Kitty Terminal Panel:** Day progress meter, live time, and purring status.
- **2x2 Touch Shortcuts & Search:** Large tap targets and clean search bar.

### 3. `abeyant` (Ambient Minimal New Tab Extension)
- **Glassmorphism:** Frosted glass panels, cursor spotlight sheen, and spring dot canvas.
- **Header & Search:** Pill badges, quick `λ` search bar, and side terminal widget.
- **Customizable Shortcuts:** Stored in `chrome.storage.local`.

### 4. `sonder` (Terminal Dashboard Startpage Extension)
- **System Stats Integration:** Optional live host metrics via daemon (`127.0.0.1:9191`).
- **Keyboard Task Manager:** Add, complete, and delete tasks directly from your new tab.
- **Hotkeys & Bangs:** Direct navigation and search overlays.

### 5. `mist-glass` (Glass Minimal New Tab Extension)
- **Ambient Glow:** Subtle radial gradients and frosted surfaces.
- **Inline Editing:** Click the pencil icon to edit or remove shortcut badges.
- **Auto-Favicons:** Uses Chrome's built-in `_favicon` cache without third-party leaks.

---

## 🛠️ How to Load Unpacked (Chrome / Brave / Edge)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/viyoga/web-startpages.git
   ```
2. Open `chrome://extensions` or `brave://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and choose any extension folder:
   - `startpage/abeyant/`
   - `startpage/sonder/`
   - `startpage/mist-glass/`
   - `startpage/jobkitty/`
5. Open a new tab to see your new dashboard!

---

## 🦊 Firefox Setup

- For extensions with Firefox Gecko manifests (`abeyant/`, `sonder/`), go to `about:debugging#/runtime/this-firefox` and select **Load Temporary Add-on...** on the `manifest.json`.
- Alternatively, use [New Tab Override](https://addons.mozilla.org/firefox/addon/new-tab-override/) and set the URL to any of the live demo links above.

---

## 📂 Repository Structure

```text
web-startpages/
├── .github/workflows/deploy.yml   # Automatic GitHub Pages deployment
├── index.html                     # Suite portal hub
├── README.md                      # Documentation
└── startpage/
    ├── abeyant/                   # Abeyant Manifest V3 extension
    ├── jobkitty/                  # Jobkitty terminal startpage
    ├── mist-glass/                # Mist Glass Manifest V3 extension
    ├── mobile/                    # Mobile retro startpage
    └── sonder/                    # Sonder terminal dashboard extension
```

---

## 🚀 Deployment

Pushing to `main` automatically triggers GitHub Actions to build and deploy all startpages and extensions to GitHub Pages.
