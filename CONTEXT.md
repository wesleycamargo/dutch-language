# Project Context

## What this project is

This repository contains a small static web app for practicing Dutch vocabulary used in inburgering-style formal texts. The current content focuses on signaalwoorden and official-letter vocabulary: obligation, permission, time limits, conditions, connectors, quantities, formal verbs, document/procedure words, and exceptions/scope.

The app is served as static HTML by Nginx in Docker. There is no package manager, build step, backend, database, or test suite in the repository.

## User-facing product

The app is a browser-based quiz game in Dutch. It teaches vocabulary through multiple exercise modes and lightweight gamification.

Main UI features:

- Header/HUD with XP and streak counters.
- Mode navigation:
  - `Invullen` — choose the missing word/phrase in a sentence.
  - `Typen` — type the missing word/phrase.
  - `Puzzel` — unscramble letters or phrase chunks.
  - `Koppelen` — match Dutch vocabulary to English translations.
  - `Zinsbouw` — rebuild a Dutch sentence from shuffled word chips.
- Word explanation popup showing:
  - Dutch word or phrase.
  - Word type/tag.
  - English meaning.
  - Word-part breakdown.
  - Learning tip.
- Round-end summary with missed words and replay option.
- Feedback effects: emoji flash, streak toast, confetti.

## Repository layout

```text
.
├── AGENTS.md                     # Agent behavior guidelines
├── CLAUDE.md                     # Points to AGENTS.md
├── README.md                     # Minimal Docker run instructions
├── Dockerfile                    # Runtime image: nginx:1.27-alpine
├── docker/nginx.conf             # Nginx config for static site
├── src/woordenschat_oefeningen_v1.html
│                                  # App shell: HTML, CSS, JS quiz logic
├── src/vocab.json                 # External vocabulary dataset
├── docs/VOCABULARY_SCHEMA.md      # Schema for adding vocabulary items
├── .dockerignore                 # Excludes git, devcontainer, opencode, md files from runtime image
├── .devcontainer/                # Development container config/tooling
└── .opencode/opencode.json       # Opencode commands/skills config
```

## Runtime and deployment

The production/runtime container is intentionally simple:

- Base image: `nginx:1.27-alpine`.
- Copies `src/` to `/usr/share/nginx/html/`.
- Copies `docker/nginx.conf` to `/etc/nginx/conf.d/default.conf`.
- Exposes port `80`.
- Healthcheck requests `http://127.0.0.1/`.

Nginx serves `woordenschat_oefeningen_v1.html` as the index page. Unknown paths return `404` via `try_files`.

Run locally:

```bash
docker build -t dutch-language .
docker run --rm -p 8080:80 dutch-language
```

Open `http://localhost:8080`.

## Application architecture

The app is implemented as a static HTML app plus an external JSON dataset:

- `src/woordenschat_oefeningen_v1.html`
  - HTML structure for the game screens and popup.
  - Inline CSS using CSS custom properties for colors and spacing.
  - Inline JavaScript for state, rendering, quiz logic, scoring, effects, and startup data loading.
- `src/vocab.json`
  - Vocabulary dataset loaded with `fetch()` during startup.

There are no external client-side dependencies. All state is in memory and resets on page reload.

Important JavaScript concepts:

- `vocab`: central array of vocabulary items and all exercise content, loaded from `src/vocab.json`.
- `ROUND_SIZE = 7`: default number of questions per round for most modes.
- Global state:
  - `mode`
  - `xp`, `streak`
  - `roundQueue`, `missedWords`
  - `qIndex`
  - per-mode state such as `matchSelected`, `scrState`, `buildState`.
- Main flow:
  - `startRound()` shuffles vocabulary and starts the selected mode.
  - `showQ()` dispatches to mode renderers.
  - `nextQ()` advances to the next question.
  - `endRound()` renders score and missed-word review.
- Mode renderers/checkers:
  - Fill: `showFill()`, `handleFill()`
  - Type: `showType()`, `checkType()`, `showTypeHint()`
  - Scramble: `showScramble()`, `renderScramble()`, `checkScramble()`
  - Match: `startMatch()`, `handleMatch()`
  - Sentence build: `showBuild()`, `renderBuild()`, `checkBuild()`
- Scoring/effects:
  - `handleCorrect()` awards XP and increments streak.
  - `handleWrong()` resets streak and records missed words.
  - `updateHUD()`, `flashEmoji()`, `showToast()`, `confetti()`.

## Vocabulary item shape

Each `vocab` entry is a plain object. Most entries use this shape:

```js
{
  nl: "verplicht",
  en: "obligatory / required",
  topic: "⚠️ Verplichting",
  tag: "bijvoeglijk naamwoord",
  fill: "U bent ___ een zorgverzekering te hebben.",
  answer: "verplicht",
  fill_en: "You are ___________ to have health insurance.",
  dis: ["bevoegd", "vrij", "gemachtigd"],
  sentence: {
    nl: "U bent verplicht dit formulier in te vullen.",
    en: "You are required to fill in this form.",
    words: ["U", "bent", "verplicht", "dit", "formulier", "in", "te", "vullen."]
  },
  info: {
    translation: "obligatory, required — you have no choice",
    parts: [
      { piece: "ver-", cls: "part-prefix", role: "prefix", meaning: "..." }
    ],
    tip: "..."
  }
}
```

Notes:

- `nl` is also used as the lookup key for popups and matching.
- `answer` may differ in capitalization from the displayed `nl`/sentence position for sentence-initial words.
- `dis` contains distractors for fill-in-the-blank mode.
- `sentence.words` is the canonical sequence for sentence-build mode.
- `info.parts[].cls` maps to popup CSS classes such as `part-prefix`, `part-base`, `part-suffix`, `part-prep`, `part-particle`, and `part-word`.

## Domain vocabulary currently covered

Topics in the current dataset:

- `⚠️ Verplichting` — obligation, permission, entitlement, eligibility.
- `⏰ Tijd` — deadlines, start/end dates, time windows, urgency.
- `🔀 Voorwaarden` — conditions and conditional phrases.
- `🔗 Verbindingswoorden` — connectors and contrast/addition words.
- `📊 Hoeveelheid` — limits, minimums, maximums.
- `📋 Formele werkwoorden` — formal verbs common in administrative language.
- `📄 Documenten` — official documents and procedures.
- `🚫 Uitzonderingen` — exceptions, applicability, scope.

## Development conventions and constraints

- Keep changes surgical; avoid broad refactors unless explicitly requested.
- Match the existing single-file style unless the task asks for restructuring.
- Because there is no build step, changes to the app should remain browser-compatible plain HTML/CSS/JS.
- The runtime Docker build excludes Markdown, `.git`, `.devcontainer`, and `.opencode` via `.dockerignore`.
- If adding assets, ensure Docker copies them from `src/` or update the Dockerfile/Nginx config deliberately.
- If adding vocabulary, edit `src/vocab.json` and follow `docs/VOCABULARY_SCHEMA.md` so all modes continue to work.
- If changing scoring or flow, consider all five modes because they share `handleCorrect()`, `handleWrong()`, `missedWords`, and `endRound()`.

## Known gaps / things not present

- No automated tests.
- No linting or formatting configuration.
- No CI configuration.
- No persistence of XP/streak/progress across reloads.
- No separate source modules; the app is currently one HTML file.
- No accessibility audit is documented.

## Useful verification commands

Basic Docker verification:

```bash
docker build -t dutch-language .
docker run --rm -p 8080:80 dutch-language
```

Then visit:

```text
http://localhost:8080
```

Quick static file check without Docker:

```bash
python3 -m http.server 8080 --directory src
```

Then visit:

```text
http://localhost:8080/woordenschat_oefeningen_v1.html
```

Use an HTTP server for local checks; opening the HTML directly with `file://` can prevent `fetch('vocab.json')` from loading the dataset.
