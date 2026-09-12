# Handoff: The Crooked Moon — Crossword + Leaderboard

## Overview

A single-page crossword game for a D&D campaign (themed on the folk-horror adventure book *The Crooked Moon*). No authentication: a player types a name or Discord tag, solves an 11×11 grid, and submits once. Their result is ranked on a leaderboard by **words solved first, then by elapsed time**. Three views in one page: name gate → grid → leaderboard.

## About the Design Files

The files in `reference/` are **design references created in HTML** — a working prototype that shows the intended look and behavior. They are **not production code to copy directly**.

- `reference/Crossword.dc.html` — the full prototype (markup + game logic in one file).
- `reference/modernist-styles.css` — the "Modernist" design-system stylesheet the prototype consumes. All tokens (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) and component classes (`.btn`, `.tag`, `.input`, `.table`, `.nav`, `.card`, `.hr`) live here.

The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Svelte, SwiftUI, etc.) using its established patterns, component library, and state conventions. If no environment exists yet, pick the most appropriate framework for the project and implement there. A React + TypeScript SPA with a small serverless API is the natural fit.

The prototype's HTML is written in a streaming-template dialect: `{{ name }}` are value holes, `<sc-for list as>` is a list loop, `<sc-if value>` is a conditional, and the `class Component extends DCLogic` block at the bottom is a React-class-like controller whose `renderVals()` returns the values the markup reads. Translate those to idiomatic components/hooks — do not try to run the dialect.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, rules and interaction states. Recreate the UI closely, but source every value from the design-system tokens in `modernist-styles.css` (or its equivalent in the target codebase) rather than hard-coding hexes.

## Design Tokens

From `modernist-styles.css` (`:root`). Use the variables, not the literals.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#f3f2f2` | page ground |
| `--color-surface` | `#eae9e9` | tinted panels (gate right column, results sidebar) |
| `--color-text` | `#201e1d` | ink; also the fill of **blocked crossword cells** |
| `--color-accent` | `#ec3013` | primary action, rank 01, active-clue rule, checkmarks |
| `--color-accent-100` | light accent tint | cells in the active word; active clue row; the submitting player's leaderboard row |
| `--color-accent-200` | one step deeper | the focused cell |
| `--color-accent-600 / -700` | deeper steps | button hover / pressed; accent-colored body copy (contrast) |
| `--color-divider` | `color-mix(in srgb, #201e1d 40%, transparent)` | 1px row rules, 2px section rules |
| `--font-heading` / `--font-body` | `"Archivo", system-ui, sans-serif` | headings weight 800, body weight 400 |
| `--radius-md` | `0` | **no rounded corners anywhere** |

Type sizes actually used: display `clamp(40px, 5.6vw, 78px)` / line-height 0.92 / letter-spacing -0.03em; section kickers 11px uppercase letter-spacing 0.16em; body 15–16px / line-height 1.5; clue text 14px / 1.4; grid letters `clamp(13px, 3.4vw, 20px)` weight 800; cell numbers `clamp(7px, 1.6vw, 9px)` weight 600; timer 20px weight 800 tabular-nums; result time 34px weight 800.

Spacing is fluid: panel padding `clamp(14px, 3.5vw, 32px)`, gate padding `clamp(28px, 5vw, 56px) clamp(20px, 4vw, 48px)`, stack gaps 8–24px.

Style rules inherited from the design system, all of them load-bearing here: zero border radius; everything flush left (including button labels); 2px rules between major sections, never softened to hairlines; accent used sparingly; keyboard focus is `outline: 2px solid var(--color-accent); outline-offset: 2px`.

## Screens / Views

A single `view` value drives which of three screens renders: `'gate' | 'play' | 'board'`.

### 1. Gate (`view === 'gate'`)

**Purpose:** collect the player's name/tag and start a run.

**Layout:** full-height two-column grid, `minmax(0, 1.1fr) minmax(0, 0.9fr)`, collapsing to one column below 860px. Left column has a 2px right divider (becomes a bottom divider when stacked).

Left column, `space-between` in a vertical flex:
- Kicker: `Puzzle No. 01 / 16 words` — 11px, uppercase, letter-spacing 0.16em, `--color-accent`.
- Title: `THE / CROOKED / MOON` on three lines, display scale, weight 800, flush left.
- Sub-kicker: `A campaign crossword` — 13px uppercase, 60% ink.
- 2px `.hr`.
- Body: "No hints, no checking, no account. Type a name, fill the grid, submit once. You are ranked by words solved first, then by time." 16px, max-width 440px, `text-wrap: pretty`.
- Field group: label `Name or Discord tag` (11px uppercase, 60% ink); a row of `.input` (46px tall, `flex: 1 1 210px`, placeholder `e.g. thornwick#0421`) + `.btn.btn-primary` (46px tall, 22px side padding) labelled **Enter the hollow**; the row wraps.
- Error line: 12px, `--color-accent-700`, reserved 18px min-height so nothing shifts. Copy: `Give me at least two characters.`
- `.btn.btn-ghost` with zero padding: `Skip to leaderboard →`.

Right column, `--color-surface` ground, vertically centered:
- Kicker `Standing at the top` (11px uppercase, 60% ink).
- Top three rows, each a grid `36px | 1fr | auto` with a 2px top divider: rank number (24px, weight 800, accent), name (17px weight 800, `overflow-wrap: anywhere`) over a 12px "n / 16" sub-line, and time (16px tabular-nums).
- Footnote: `Scores are kept in this browser.` — 12px, 60% ink.

### 2. Play (`view === 'play'`)

**Purpose:** solve the grid against a running clock.

**Header** — the design system's `.nav` (2px bottom rule), `flex-wrap: wrap`, `row-gap: 8px`: brand = puzzle title (`clamp(15px, 3.4vw, 18px)`, weight 800); a `Player` kicker + name pair; a `Time` kicker + `mm:ss` timer (20px weight 800 tabular-nums); a `.tag.tag-outline` reading `41 / 61 letters`; a `.btn.btn-secondary` `Leaderboard`.

**Body** — two columns, `minmax(0, 548px) minmax(0, 1fr)`, one column below 860px. Left panel has a 2px right divider (bottom when stacked).

Left panel:
- **The grid.** `display: grid; grid-template-columns: repeat(11, minmax(0, 1fr))`, `width: 100%`, `max-width: 484px`, with a 2px top and left border on the container. Each of the 121 cells: `aspect-ratio: 1`, 2px right and bottom border in `--color-text` (so rules read as a single continuous 2px lattice), and a background of
  - blocked cell → `--color-text`
  - focused cell → `--color-accent-200`
  - cell in the active word → `--color-accent-100`
  - otherwise → `#ffffff`
- Open cells contain an absolutely positioned clue number (top 1px, left 2px, `pointer-events: none`) and a full-size transparent `<input maxlength-like single char>`: centered, uppercase, `--font-heading` weight 800, `caret-color: transparent`, `outline: none`, `cursor: pointer`, `autocomplete=off autocapitalize=characters autocorrect=off spellcheck=false`.
- **Active clue block.** Left 2px accent border, 12px left padding, max-width 520px. First row: clue label (`4 down`, 13px uppercase weight 800 accent) + clue text (15px). Second row: three `.btn.btn-secondary` at 40px — `←` previous clue, `→` next clue, and a direction toggle whose label is the current direction (`Across` / `Down`). These exist so the puzzle is playable by touch, where arrow and space keys aren't available.
- **Action row**, wrapping: `.btn.btn-primary` 44px **Submit result**; `.btn.btn-ghost` 44px **Clear grid**; a 12px 60%-ink hint `Arrows move · Space flips direction · Enter next clue`.

Right panel — clue lists in `repeat(auto-fit, minmax(min(100%, 230px), 1fr))` so Across and Down sit side by side and stack when narrow. Each list: an 11px uppercase heading over a 2px ink rule, then rows of `26px | 1fr` grid, 1px bottom divider, `cursor: pointer`. The active clue's row is filled `--color-accent-100` with its number in `--color-accent-700`; a fully and correctly filled clue's number drops to 45% ink (this is the only completion feedback — there is deliberately **no** answer checking during play).

### 3. Leaderboard (`view === 'board'`)

**Purpose:** show the ranking and the player's own run.

`.nav` header: brand `Leaderboard`, a `.tag.tag-accent` with the puzzle title, and a `.btn.btn-secondary` reading `Back to the grid` (or `Start a run` if no name has been entered yet).

Body: grid `minmax(0, 2fr) minmax(240px, 1fr)`, one column below 860px.

- **Table** (`.table`, `min-width: 320px` inside an `overflow-x: auto` wrapper): columns `#` (44px), `Player`, `Words` (100px), `Time` (90px). Rank and name are weight 800; rank 01 is accent; numeric cells are tabular-nums. The row just submitted is filled `--color-accent-100`. Footnote below: `Ranked by words solved, then by time. Scores are kept in this browser.`
- **Results sidebar**: `--color-surface` ground, 2px left accent border, 24px padding. Accent kicker `Your last run`; the time at 34px weight 800 tabular-nums (`--:--` when nothing submitted); a 14px note `13 of 16 words solved as thornwick#0421.`; then, once a run exists, an **Answer key** list — rows of `34px | 1fr | 14px`, 1px dividers, showing `1A` / `1D` style labels, the answer in weight 800 with 0.04em letter-spacing, and a `✓` in accent or a `·` at 40% ink. Then a 2px `.hr`, a 44px `.btn.btn-primary` **Play again**, and a `.btn.btn-ghost` **Change name**.

## The Puzzle

11×11 grid, 16 words, 61 open cells, zero-indexed `(row, col)` for the first letter. Clue numbers follow standard scan order. This layout is verified: every maximal run of two or more adjacent filled cells is exactly one of these words, and all crossings agree.

**Across**

| # | Start (r,c) | Answer | Clue |
| --- | --- | --- | --- |
| 1 | 0,0 | CROWS | Black birds that gather where the road bends |
| 3 | 0,6 | ALTAR | Stone where the offering is left |
| 4 | 2,2 | HOLLY | Red-berried evergreen of the hedgerow |
| 5 | 4,0 | EAVES | Where the charm is nailed, above the door |
| 6 | 4,6 | STAGS | Antlered watchers of the wood |
| 8 | 6,2 | NIGHT | When the lanterns go out |
| 11 | 8,0 | ELDER | Both a village authority and a flowering tree |
| 12 | 8,6 | MASKS | Worn by the whole village on festival night |
| 13 | 10,2 | OMENS | Signs read in milk, smoke or entrails |

**Down**

| # | Start (r,c) | Answer | Clue |
| --- | --- | --- | --- |
| 1 | 0,0 | CRONE | The old woman at the edge of the village |
| 2 | 0,4 | SALTS | Poured across a threshold to keep things out |
| 3 | 0,6 | ABYSS | What the well seems to have no bottom for |
| 4 | 2,2 | HAVEN | Sanctuary, of a sort |
| 7 | 4,8 | ASHES | All that the pyre leaves behind |
| 9 | 6,4 | GORSE | Thorny yellow-flowered scrub of the moor |
| 10 | 6,6 | TOMBS | Where the barrow-folk keep their dead |

A cell is blocked (ink-filled) if no word covers it. Derive the solution grid and the numbering from this list rather than hard-coding 121 cells.

## Interactions & Behavior

**Grid input**
- Typing a letter writes it into the focused cell (uppercased) and advances to the next open cell in the current direction. Non-letters are rejected.
- `Backspace`: clears the focused cell if it has a letter; otherwise moves back one open cell and clears that.
- `Delete`: clears the focused cell, no movement.
- `Space`: flips direction.
- `Enter` / `Tab`: jumps to the first cell of the next word (`Shift` for previous), and sets the direction to that word's.
- Arrow keys: set the direction to match the axis and move to the next open cell on it; movement skips blocked cells and stops at the grid edge.
- Clicking a cell focuses it; clicking the **already focused** cell flips direction.
- Clicking a clue focuses that word's first cell and sets its direction.

**Timer**
- Starts on the first letter entered — not on entering the play view. Ticks once a second while `running`.
- Stops on submit. `Play again` resets it to 0 and sets `running` false.

**Submit**
- Always enabled, single press. Computes `words` = number of the 16 words whose cells all match the answer, and `time` = elapsed seconds. Appends `{ name, words, time }` to the scores, persists, and switches to the leaderboard with that run highlighted.
- No confirmation dialog and no mid-game checking — that was an explicit product decision ("no help at all").

**Validation**
- The name must be ≥ 2 characters after trimming, else show the error and stay on the gate. `Enter` in the field submits the gate.

**Ranking**
- `sort((a, b) => (b.words - a.words) || (a.time - b.time))`. Ranks are 1-indexed and zero-padded to two digits (`01`).

**Responsive behavior**
- One breakpoint at **860px**: below it, the gate, the play body, and the leaderboard body all collapse to a single column, and the panel dividers move from right to bottom.
- The grid is fluid (`repeat(11, minmax(0, 1fr))`, capped at 484px) so it fits a 320px viewport; letters and clue numbers scale with `clamp()`.
- All `.nav` headers wrap with an 8px row gap.
- Touch targets: primary actions are 44px tall, clue-navigation buttons 40px with a 46px min-width. The `←` / `→` / direction toggle trio is the touch substitute for keyboard navigation. Grid cells at a 320px viewport are ~27px — below the 44px guideline, which is inherent to an 11×11 crossword; the on-screen keyboard plus auto-advance is what makes it usable. If the target platform allows, consider a zoom/pan affordance or a larger cell size with horizontal scroll.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` and `-webkit-text-size-adjust: 100%` are required.

## State Management

```
view: 'gate' | 'play' | 'board'
name: string
gateError: string
letters: string[]            // 121 entries, '' for empty; only open cells are ever set
active: number               // focused cell index (row * 11 + col)
dir: 'across' | 'down'
elapsed: number              // seconds
running: boolean
scores: { name, words, time }[]
lastRun: { name, words, time } | null
narrow: boolean              // window.innerWidth < 860, tracked on resize
```

Derived, not stored: the solution grid and clue numbers (from the word list), the active word (the word in `dir` containing `active`, falling back to the other direction), the set of solved words, and the filled-letter count.

**Transitions:** gate → play on a valid name (focus cell `(0,0)` after the view paints); play → board on submit; board → play on `Play again` (grid, timer and focus all reset) or `Back to the grid` (state preserved); board → gate on `Change name`.

## Data & Persistence

The prototype persists to `localStorage` under `crooked-moon-crossword-scores-v1`, seeded on first load with three demo entries (`thornwick#0421` 16/16 in 604s, `meg.of.the.mire` 14/16 in 513s, `brannoc` 11/16 in 448s).

**This is the one thing that must change in production.** The requirement is a *shared* leaderboard, which `localStorage` cannot provide — every player currently sees only their own board. Implement instead:

- `GET /api/scores?puzzle=crooked-moon-01` → `[{ name, words, time, createdAt }]`, sorted server-side by `words desc, time asc`, limited to the top N.
- `POST /api/scores` → `{ puzzle, name, words, time }`. Validate server-side: trim and length-cap the name (≥2, ≤32 chars), clamp `words` to 0–16, reject implausible times (e.g. under 20s), and rate-limit per IP. **Do not trust the client's `words` count** — post the submitted grid and score it on the server against the solution, otherwise the board is trivially forgeable.
- Keep the client optimistic: show the submitted run immediately, reconcile on the next fetch.
- Any small hosted store works (Postgres, KV, Firestore). Note that shipping the answers in the client bundle also makes cheating easy; if that matters, serve clues only and validate submissions server-side.

## Assets

None. No images, no icons, no illustrations — the design is type, rules and the accent. Archivo is loaded by `modernist-styles.css` via a Google Fonts `@import`; in production, self-host it or use the codebase's existing font pipeline.

## Files

- `reference/Crossword.dc.html` — the prototype: all three views, the puzzle data, keyboard handling, timer, ranking, and persistence.
- `reference/modernist-styles.css` — the design-system tokens and component classes the prototype styles against.
