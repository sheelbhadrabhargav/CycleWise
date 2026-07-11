# CycleWise — a mini project for the Menstrupedia internship application

A small, plain HTML/CSS/JavaScript app built to match the Menstrupedia Software
Developer Intern JD — no frameworks, no build tools, just three clean files
working together, applied directly to their mission of making period education
easy and stigma-free.

## Files

- `index.html` — page structure and content
- `style.css` — all styling (colors, layout, typography, animations)
- `script.js` — all behaviour (cycle math, wheel drawing, form updates, flip cards)

## What it does

- **Cycle wheel** — an interactive SVG ring, drawn and updated with vanilla JS
  DOM methods, showing the four cycle phases (Menstrual, Follicular, Ovulation,
  Luteal) with a marker for today.
- **Tracker** — enter your last period date, average cycle length, and period
  length; it live-calculates your current phase, next period date, and estimated
  fertile window using plain `Date` math. All calculation happens client-side —
  no data leaves the browser.
- **Myth vs. Fact cards** — six flip cards busting common period myths, in the
  same spirit as Menstrupedia's comics, built with a CSS 3D flip and a click
  listener per card.

## How to run

Just open `index.html` in a browser. Nothing to install, no server needed.

## Putting this on GitHub for your application

1. Create a new repo, e.g. `cyclewise`, and add these three files at the root.
2. Add a screenshot to the README (open the page, take a screenshot, drop it in).
3. Push to GitHub and link the repo in your CV / cover note.

## Why this project, for this JD

- Uses exactly the essential stack from the JD: **JavaScript, HTML, CSS** —
  written by hand, in separate files, the way a real small project is structured.
- Responsive and interactive UI (hover states, flip animations, live-updating
  form) — matches "contribute to UI development, ensuring responsiveness."
- Directly themed around Menstrupedia's actual mission rather than a generic
  to-do app, which is the kind of signal a recruiter notices.
- If you later want to show React familiarity too, the same logic in `script.js`
  maps cleanly onto components (`CycleWheel`, `Tracker`, `MythCard`) — happy to
  build that version as a second repo if useful.
