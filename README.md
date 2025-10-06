<img src="text-cleaner-logo.svg" alt="Text Cleaner logo" width="120" />

# Text Cleaner

Tiny, private, browser-based tool for tidying text: remove line breaks, downcase ALL-CAPS words, and strip repeated or unwanted phrases.

Live demo: https://renabazinin.github.io/text-cleaner/

## Features

- Replace line breaks with spaces and collapse extra whitespace.
- Optional downcasing of ALL-CAPS words (configurable minimum length).
- Smart "Suggest" that finds repeated multi-word phrases (configurable minimum words per phrase).
- Per-row removal rules (add, suggest, remove, clear all).
- Inline error/info messaging (no blocking alerts).
- Copy result to clipboard.

## Quick start

Open the app in your browser:

- Double-click `index.html` or drop the folder into a static-server.

Quick local server (PowerShell / Windows):

```powershell
# from project root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or using Node.js `serve` (if installed):

```powershell
npx serve .
```

## File overview

- `index.html` — main UI.
- `styles.css` — styling and layout.
- `script.js` — application logic (cleaning, suggest, UI wiring).
- `text-cleaner-logo.svg` — project logo used in the header and favicon.

## Development notes

- Suggest uses a sliding-window approach to detect repeated phrases. Adjust the "Minimum words per phrase (Suggest)" slider in the Remove Sentences card to control detection.
- Removals are applied automatically when non-empty rules exist. Use "Clear All" to remove all rules.
- To change behavior, edit `script.js` (cleaning pipeline) or `styles.css` (visuals).

## Contributing

PRs welcome. Please open issues for feature requests or bugs.

## License

No license file included. Add a `LICENSE` (for example MIT) if you want to publish this project under a specific license.

---

Built with ♥ — hosted: https://renabazinin.github.io/text-cleaner/