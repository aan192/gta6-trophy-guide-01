[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) [![rank](https://make.fun/badge/gta6-trophy-guide-01/aan192/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) [![reward](https://make.fun/badge/gta6-trophy-guide-01/aan192/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Grand Theft Auto VI Trophy & Achievement Hub

A professional, offline-first trophy guide and progress tracker web application for **Grand Theft Auto VI** (PlayStation 5). It covers all 55 official trophies with original, grounded strategy guides, step-by-step walkthroughs, missable warnings, platinum roadmap stages, and source citations.

---

## Features

1. **Complete 55 Trophy Checklist & Tracker**:
   - Every official trophy name, description, and grade (Platinum, Gold, Silver, Bronze).
   - Real-time persistent checklist stored locally in `localStorage`.
   - Progress bar, percentage completion, and per-grade summary cards.
   - **Export & Import**: Back up your trophy progress to a JSON file and restore it anytime.

2. **Advanced Filtering & Search**:
   - Filter by trophy kind (`Story`, `Missable`, `Collectibles`, `Activities`, `Online`).
   - Filter by grade (`Platinum`, `Gold`, `Silver`, `Bronze`).
   - Filter by completion status (`Earned` / `Unearned`).
   - Instant text search across all trophy names, descriptions, and guides.

3. **Spoiler Protection Mode**:
   - Toggle setting to mask hidden and story trophy names and descriptions until marked earned.

4. **Dedicated Guide Hub**:
   - Detailed strategy breakdown for each of the 55 trophies.
   - Step-by-step bullet points and point-of-no-return warnings for missables.
   - Cited references and source links (Exophase, PSNProfiles, PowerPyx, GTA Wiki).

5. **Platinum Roadmap (6 Stages)**:
   - Chronological stage-by-stage walkthrough strategy from prologue to 100% completion.

6. **Missables Alert Hub**:
   - Dedicated view highlighting every missable trophy and how to avoid locking them out.

7. **Zero Network / Pure Offline Static Architecture**:
   - Zero runtime network requests. Built with vanilla ES modules and pure CSS.

---

## How to Run Locally

### 1. Development Server
Start the lightweight static development server:
```bash
node serve.ts
```
Then open your browser at **http://localhost:8080**.

### 2. Build & Packaging Test
Generate the output distribution and verify the frontend dossier:
```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

## Screenshot Capture Modes (`?shot=`)
The app supports screenshot capture parameterization:
- `/?shot=checklist` — Checklist view with seeded demo progress (~40%).
- `/?shot=guide` — Guide hub view with strategy details.
- `/?shot=roadmap` — Platinum roadmap view.
- `/?shot=missables` — Missable warnings view.

---

## License
MIT License. Clean design with zero copyrighted artwork, logos, or game screenshots.
