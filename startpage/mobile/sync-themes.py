#!/usr/bin/env python3
"""
Sync Themes Script:
# Reads theme definitions from Viyoga (../viyoga/static/style.css)
# and synchronizes them directly into mobile-startpages (style.css, app.js, index.html).
"""

import os
import re

VIYOGA_CSS = os.path.abspath(os.path.join(os.path.dirname(__file__), "../viyoga/static/style.css"))
MOBILE_DIR = os.path.dirname(os.path.abspath(__file__))
MOBILE_CSS = os.path.join(MOBILE_DIR, "style.css")
MOBILE_APP = os.path.join(MOBILE_DIR, "app.js")
MOBILE_HTML = os.path.join(MOBILE_DIR, "index.html")

NOCTALIA_PALETTES = {
    "amber": {
        "noctalia-primary": "#FFB454",
        "noctalia-primary-mid": "#9A5A1C",
        "noctalia-primary-dark": "#5C3410",
        "noctalia-primary-light": "#FFD9A0",
        "noctalia-surface": "#0B0906"
    },
    "mallow": {
        "noctalia-primary": "#C89BFF",
        "noctalia-primary-mid": "#8360C2",
        "noctalia-primary-dark": "#4A3670",
        "noctalia-primary-light": "#E2B8FF",
        "noctalia-surface": "#0A0712"
    },
    "gruvbox-material": {
        "noctalia-primary": "#a9b665",
        "noctalia-primary-mid": "#89b482",
        "noctalia-primary-dark": "#45403d",
        "noctalia-primary-light": "#ddc7a1",
        "noctalia-surface": "#282828"
    },
    "safelight": {
        "noctalia-primary": "#FF4D6A",
        "noctalia-primary-mid": "#A32444",
        "noctalia-primary-dark": "#5C1A28",
        "noctalia-primary-light": "#FFB3C0",
        "noctalia-surface": "#0B0406"
    },
    "tungsten": {
        "noctalia-primary": "#9FB0C4",
        "noctalia-primary-mid": "#6B7280",
        "noctalia-primary-dark": "#343A42",
        "noctalia-primary-light": "#F2F5FA",
        "noctalia-surface": "#0A0A0C"
    }
}

def sync():
    if not os.path.exists(VIYOGA_CSS):
        print(f"Error: Viyoga stylesheet not found at {VIYOGA_CSS}")
        return

    with open(VIYOGA_CSS, "r", encoding="utf-8") as f:
        viyoga_content = f.read()

    # Extract all theme blocks
    theme_pattern = re.compile(r'\[data-theme="([^"]+)"\]\s*\{([^}]+)\}', re.MULTILINE)
    matches = theme_pattern.findall(viyoga_content)

    themes = {}
    for name, body in matches:
        # merge: viyoga may split a theme across blocks (e.g. cat ramps)
        vars_dict = themes.setdefault(name, {})
        for line in body.strip().split("\n"):
            line = line.strip()
            if line.startswith("--"):
                k, v = line.split(":", 1)
                vars_dict[k.strip()] = v.rstrip(";").strip()

    theme_order = ["amber", "mallow", "gruvbox-material", "safelight", "tungsten"]
    valid_themes = [t for t in theme_order if t in themes]
    for t in themes:
        if t not in valid_themes:
            valid_themes.append(t)

    print(f"Found {len(valid_themes)} themes in Viyoga: {', '.join(valid_themes)}")

    # Build new theme CSS block
    css_blocks = []
    for i, t in enumerate(valid_themes):
        v = themes[t]
        noc = NOCTALIA_PALETTES.get(t, {
            "noctalia-primary": v.get("--accent", "#d9a78b"),
            "noctalia-primary-mid": v.get("--accent-soft", "#cf906c"),
            "noctalia-primary-dark": v.get("--border-strong", "#bf6d3f"),
            "noctalia-primary-light": v.get("--accent-bright", "#ebd0c1"),
            "noctalia-surface": v.get("--bg", "#1a2026")
        })

        selector = f':root,\n[data-theme="{t}"]' if i == 0 else f'[data-theme="{t}"]'
        lines = [f"{selector} {{"]
        lines.append(f"  --bg: {v.get('--bg', '#1A2026')};")
        lines.append(f"  --bg-panel: {v.get('--bg-panel', '#20272E')};")
        lines.append(f"  --bg-panel-alt: {v.get('--bg-panel-alt', '#313C47')};")
        lines.append(f"  --border: {v.get('--border', 'var(--line)')};")
        lines.append(f"  --border-strong: {v.get('--border-strong', 'var(--line-hi)')};")
        lines.append(f"  --line: {v.get('--line', 'rgba(255, 255, 255, 0.15)')};")
        lines.append(f"  --line-hi: {v.get('--line-hi', 'rgba(255, 255, 255, 0.40)')};")
        lines.append(f"  --glass: {v.get('--glass', 'rgba(0, 0, 0, 0.40)')};")
        lines.append(f"  --glass-hi: {v.get('--glass-hi', 'rgba(255, 255, 255, 0.50)')};")
        lines.append(f"  --sheen: {v.get('--sheen', 'rgba(255, 255, 255, 0.08)')};")
        lines.append(f"  --sat: {v.get('--sat', '155%')};")
        lines.append(f"  --fg: {v.get('--fg', '#D9D1BA')};")
        lines.append(f"  --fg-dim: {v.get('--fg-dim', '#9E9783')};")
        lines.append(f"  --fg-muted: {v.get('--fg-muted', '#667858')};")
        lines.append(f"  --accent: {v.get('--accent', '#D9A78B')};")
        lines.append(f"  --accent-bright: {v.get('--accent-bright', '#F2BEA0')};")
        lines.append(f"  --accent-soft: {v.get('--accent-soft', '#7794A6')};")
        lines.append(f"  --accent-dim: {v.get('--accent-dim', '#8BA37A')};")
        lines.append(f"  --link: {v.get('--link', v.get('--accent-soft', '#7794A6'))};")
        lines.append(f"  --link-hover: {v.get('--link-hover', v.get('--accent-bright', '#F2BEA0'))};")
        lines.append(f"  --focus-ring: {v.get('--focus-ring', v.get('--accent', '#D9A78B'))};")
        lines.append(f"  --bg-glow: {v.get('--bg-glow', v.get('--bg-panel', '#20272E'))};")
        lines.append(f"  --bg-core: {v.get('--bg-core', v.get('--bg', '#1A2026'))};")
        lines.append(f"  --bar-a: {v.get('--bar-a', v.get('--accent', '#D9A78B'))};")
        lines.append(f"  --bar-b: {v.get('--bar-b', v.get('--accent-soft', '#7794A6'))};")
        lines.append(f"  --bar-c: {v.get('--bar-c', v.get('--accent-dim', '#8BA37A'))};")
        lines.append(f"  --orange: {v.get('--orange', v.get('--accent', '#D9A78B'))};")
        lines.append(f"  --orange-deep: {v.get('--orange-deep', '#A67A61')};")
        lines.append(f"  --red: {v.get('--red', '#D96C6C')};")
        lines.append(f"  --red-deep: {v.get('--red-deep', '#A64F4F')};")
        lines.append(f"  --cyan: {v.get('--cyan', '#77A3A0')};")
        lines.append(f"  --cyan-deep: {v.get('--cyan-deep', '#547875')};")
        lines.append(f"  --yellow: {v.get('--yellow', '#F2BEA0')};")
        lines.append(f"  --text-xs: {v.get('--text-xs', '0.75rem')};")
        lines.append(f"  --text-sm: {v.get('--text-sm', '0.875rem')};")
        lines.append(f"  --text-base: {v.get('--text-base', '1rem')};")
        lines.append(f"  --text-lg: {v.get('--text-lg', '1.25rem')};")
        lines.append(f"  --text-xl: {v.get('--text-xl', '1.8125rem')};")
        lines.append(f"  --text-2xl: {v.get('--text-2xl', '2.5625rem')};")
        lines.append(f"  --content-w: {v.get('--content-w', '720px')};")
        lines.append(f"  --content-w-wide: {v.get('--content-w-wide', '1100px')};")
        lines.append(f"  --content-w-list: {v.get('--content-w-list', '960px')};")
        lines.append(f"  --grid-fade: {v.get('--grid-fade', v.get('--bg', '#1A2026'))};")
        lines.append(f"  --grid-line: {v.get('--grid-line', 'rgba(217, 167, 139, 0.08)')};")
        lines.append(f"  --grid-dot: {v.get('--grid-dot', 'rgba(217, 167, 139, 0.28)')};")
        for nk, nv in noc.items():
            lines.append(f"  --{nk}: {nv};")
        lines.append("  --cat-head: var(--noctalia-primary);")
        lines.append("  --cat-body: var(--noctalia-primary-mid);")
        lines.append("  --cat-tail: var(--noctalia-primary-dark);")
        lines.append("  --cat-ear: var(--noctalia-primary-light);")
        lines.append("  --cat-paw: var(--noctalia-primary-light);")
        lines.append("  --cat-whiskers: var(--noctalia-primary-light);")
        lines.append("  --cat-z: var(--noctalia-primary-light);")
        lines.append("  --font-mono: 'Maple Mono NF', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;")
        lines.append("}")
        css_blocks.append("\n".join(lines))

    glass_tokens = """/* ── Glass Tokens: auto-derived from active theme ── */
:root {
  --glass-bg: color-mix(in srgb, var(--bg-panel) 24%, transparent);
  --glass-bg-hover: color-mix(in srgb, var(--bg-panel) 38%, transparent);
  --glass-bg-strong: color-mix(in srgb, var(--bg-panel) 82%, transparent);
  --glass-blur: 16px;
  --glass-hi: color-mix(in srgb, var(--fg) 20%, transparent);
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 var(--glass-hi);
  --glass-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.60), 0 0 16px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 var(--glass-hi);
}"""

    new_themes_css = "\n\n".join(css_blocks) + "\n\n" + glass_tokens

    # Replace in mobile style.css
    with open(MOBILE_CSS, "r", encoding="utf-8") as f:
        mob_css = f.read()

    start_marker = ":root,"
    end_marker = "/* ── Reset & Screen Lock ── */"

    idx_start = mob_css.find(start_marker)
    idx_end = mob_css.find(end_marker)
    if idx_start != -1 and idx_end != -1:
        updated_css = mob_css[:idx_start] + new_themes_css + "\n\n" + mob_css[idx_end:]
        with open(MOBILE_CSS, "w", encoding="utf-8") as f:
            f.write(updated_css)
        print("Updated style.css with latest Viyoga themes!")
    else:
        print("Warning: Could not match theme markers in mobile style.css")

    # Update app.js THEMES and THEME_COLORS
    theme_colors_map = {t: themes[t].get("--bg", "#1A2026") for t in valid_themes}
    theme_colors_str = ",\n    ".join([f"{t}: '{theme_colors_map[t]}'" for t in valid_themes])

    with open(MOBILE_APP, "r", encoding="utf-8") as f:
        app_content = f.read()

    app_content = re.sub(
        r"const THEMES = \[[^\]]+\];",
        f"const THEMES = {repr(valid_themes)};",
        app_content
    )
    app_content = re.sub(
        r"const THEME_COLORS = \{[^}]+\};",
        f"const THEME_COLORS = {{\n    {theme_colors_str}\n  }};",
        app_content
    )
    with open(MOBILE_APP, "w", encoding="utf-8") as f:
        f.write(app_content)
    print("Updated app.js with latest Viyoga theme lists & background colors!")

if __name__ == "__main__":
    sync()
