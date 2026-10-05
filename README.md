# web-startpages

A personal browser startpage, styled as a terminal window with a live clock and a `scout` search bar.

## Live demo

**https://viyoga.github.io/web-startpages/startpage/jobkitty/**

![startpage preview](startpage/jobkitty/showcase.gif)

## Features

- **Terminal-window chrome** — traffic-light dots and a `kabir@esoteric — tty` title bar
- **Fall-in animation** on the `> cd ~/_` header
- **4 bookmark categories** — dev, play, tools, media — with gradient underline hover
- **scout search bar** — permanent gradient underline, block caret, autofocus, and bang shortcuts (`@yt`, `@rd`, `@ss`, `@brave`, `@dd`) plus raw-URL support
- **Live clock** in the status bar
- **Dark purple theme** that adapts colors via CSS variables

## Install as a new-tab page

### Chrome / Edge / Brave (load unpacked)

1. Clone or download this repo
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select `startpage/jobkitty/`
5. Open a new tab — you're home

The `manifest.json` uses `chrome_url_overrides.newtab` to replace the new-tab page with `index.html`.

### Firefox

Use the [Firefox multi-account containers](https://support.mozilla.org/en-US/kb/containers) trick, or pin the URL as a homepage and set `browser.newtab.url` via [New Tab Override](https://addons.mozilla.org/firefox/addon/new-tab-override/).

## Usage

- Type a URL (`https://github.com`) or a bare domain (`github.com`) and press Enter — opens in a new tab
- Prefix a query with a bang for a targeted search:
  - `@yt cats` → YouTube
  - `@rd linux` → Reddit
  - `@ss how to css` → Startpage
  - `@brave rust` → Brave Search
  - `@dd web dev` → DuckDuckGo
  - plain text → Google

## Structure

```
startpage/jobkitty/
├── index.html      # page markup + search logic + clock
├── style.css       # terminal theme (colors via CSS variables)
├── cat.gif         # sidebar art
├── newtab.svg      # favicon
├── manifest.json   # chrome extension manifest
├── showcase.gif    # animated preview used in this README
└── startpage.gif
```

## Development

The styles are mirrored from a localhost startpage rendered by the [noctalia](https://github.com/anomalyco/noctalia) theme engine — edit the template there and copy the generated CSS back here. Static HTML needs no build step; `style.css` is loaded with a cache-busting `?v=Date.now()` query.

Deploy: push to `main` and [GitHub Actions](.github/workflows/deploy.yml) publishes to Pages automatically.
