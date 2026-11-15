# Woodshed Stage 1: App Shell, Theme, Data Model, Metronome — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the React + Vite + Tailwind app with the Ocean Drive (light) and Night Drive (dark) themes, build the lookahead-scheduling metronome, and define the curriculum data schema, proven by a home screen that lists a stub track, picks a duration, switches theme and runs the metronome.

**Architecture:** React 19 + Vite 8, plain JS/JSX (no TypeScript). Styling is Tailwind v4, configured CSS-first: theme colours live as CSS variables on `:root` and `[data-theme="dark"]`, and `@theme inline` maps them to Tailwind colour names, so `bg-bg text-ink` switches with the theme without any `dark:` classes. The metronome is framework-free (pure timing math plus a `Metronome` class on Web Audio), wrapped by a small `useMetronome` hook. Curriculum content is plain JS data validated by a shape checker and collected in a registry.

**Tech Stack:** react 19.3, react-dom 19.3, vite 8.3, @vitejs/plugin-react 6.3, tailwindcss 4.3 + @tailwindcss/vite 4.3, vitest 5.1, @fontsource/mr-dafoe, @fontsource/barlow-condensed, @fontsource/barlow.

**Spec:** `docs/superpowers/specs/2026-11-15-woodshed-design.md`; visual reference `docs/superpowers/specs/mockups-vice-themes.html`.

## Global Constraints

- Static site only, deployable to GitHub Pages; no server code.
- Dependencies limited to the Tech Stack list above. No UI kit, no state library, no CSS-in-JS.
- All styling through Tailwind utilities and the theme tokens in `src/styles/theme.css`. No hard-coded hex values in components.
- Fonts are self-hosted through @fontsource (the app must work offline), never from Google Fonts.
- Metronome playback uses Web Audio lookahead scheduling, never `setInterval`-driven clicks.
- Curriculum content lives in `src/data/`, separate from components and engine code.
- Tap targets at least 56px; body text at least 14px; nothing functional under 12px.
- Root-note labels are navy on pink in the light theme (white on pink fails contrast).

## Theme tokens (exact values)

| Token | Ocean Drive (light) | Night Drive (dark) | Used for |
|---|---|---|---|
| `bg` | `#14B8B0` | `#160B2E` | page ground |
| `ink` | `#0E1440` | `#F4EEFF` | text, strokes, fretboard labels |
| `ink-soft` | `#0E1440` | `#CFC6E6` | instructions |
| `kicker` | `#0E1440` | `#5FE3D6` | small caps labels |
| `brand` | `#FF2E93` | `#FF4FA8` | wordmark, next button, root notes |
| `on-brand` | `#0E1440` | `#160B2E` | text/arrow on brand |
| `line` | `#0E1440` | `#8C82AD` | fretboard strings and wires |
| `shadow` | `#0E1440` | `#05020D` | flat 2px offset shadow |
| `stripe-1/2/3` | `#FF2E93` / `#FFD23F` / `#0E1440` | `#FF4FA8` / `#FFC94D` / `#5FE3D6` | header deco stripes |
| `chip` / `chip-ink` | `#0E1440` / `#FFD23F` | `#5FE3D6` / `#160B2E` | BPM chip |

Fonts: `font-script` = Mr Dafoe (wordmark only), `font-display` = Barlow Condensed italic 600/800 (headings, timer, chips), `font-sans` = Barlow 500/600 (body).

## Review Focus

- Theme on first load with no saved choice must follow the OS `prefers-color-scheme`, with no flash of the wrong theme (set `data-theme` before React renders).
- BPM at the extremes (30, 300) and NaN/negative input must clamp, never produce a zero or negative interval.
- Tap tempo with one tap, or a long pause between taps, returns `null`, not NaN or a wild BPM.
- Changing BPM or subdivision while running must not double-fire or stall the schedule.
- Calling `start()` twice or `stop()` while stopped is a safe no-op; the AudioContext is only created on a user gesture (iOS Safari).

---

## File Structure

```
index.html                     theme bootstrap script, #root
vite.config.js                 react + tailwind plugins, vitest config
src/main.jsx                   mounts <App/>, imports styles and fonts
src/App.jsx                    renders <Home/>
src/styles/theme.css           Tailwind import, tokens, @theme mapping
src/theme/theme.js             getInitialTheme(), applyTheme(), toggle
src/theme/useTheme.js          React hook over theme.js
src/audio/metronome.js         clampBpm, nextNoteTime, tapTempoBpm, Metronome
src/audio/useMetronome.js      React hook wrapping one Metronome
src/data/schema.js             DURATIONS, CATEGORIES, validateTrack, registry
src/data/tracks/index.js       imports track modules, re-exports registry
src/data/tracks/stub.js        one minimal valid track
src/components/ArrowButton.jsx shared prev/next control
src/components/Header.jsx      wordmark, slot for right side, deco stripes
src/components/MetronomePanel.jsx
src/screens/Home.jsx
tests/audio/metronome.test.js
tests/data/schema.test.js
tests/theme/theme.test.js
```

## Task 1: Scaffold React + Vite + Tailwind with the two themes

**Files:** Create `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles/theme.css`, `src/theme/theme.js`, `src/theme/useTheme.js`, `.gitignore`. Test: `tests/theme/theme.test.js`.

**Interfaces:**
- Produces: `getInitialTheme({ stored, prefersDark }) => 'light' | 'dark'` (stored wins when it is `'light'` or `'dark'`, otherwise `prefersDark ? 'dark' : 'light'`); `applyTheme(theme)` sets `document.documentElement.dataset.theme` and saves `localStorage['woodshed:theme']`; `useTheme() => [theme, toggleTheme]`. Tailwind colour names from the token table (`bg-bg`, `text-ink`, `bg-brand`, `text-on-brand`, `border-line`, `bg-stripe-1` …) and font names `font-script`, `font-display`, `font-sans`. Utility `shadow-flat` = `2px 2px 0 var(--wd-shadow)`.

- [ ] **Step 1:** Install: `npm i react react-dom @fontsource/mr-dafoe @fontsource/barlow-condensed @fontsource/barlow` and `npm i -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest`. Scripts: `dev`, `build`, `preview`, `test` (`vitest run`).
- [ ] **Step 2: Write the failing test** `tests/theme/theme.test.js`:

```js
import { getInitialTheme } from '../../src/theme/theme.js';
test('stored choice wins', () => expect(getInitialTheme({ stored: 'dark', prefersDark: false })).toBe('dark'));
test('falls back to OS preference', () => expect(getInitialTheme({ stored: null, prefersDark: true })).toBe('dark'));
test('ignores junk in storage', () => expect(getInitialTheme({ stored: 'purple', prefersDark: false })).toBe('light'));
```

- [ ] **Step 3:** Run `npx vitest run tests/theme` — expect FAIL (module missing).
- [ ] **Step 4:** Implement `src/theme/theme.js` and `useTheme.js`. In `index.html`, an inline script before `#root` repeats the same rule (read storage, else media query) and sets `data-theme`, so the first paint is already correct.
- [ ] **Step 5:** Write `src/styles/theme.css`: `@import "tailwindcss";`, the token values as `--wd-*` variables on `:root` and `[data-theme="dark"]` (exact table values), `@theme inline { --color-bg: var(--wd-bg); … --font-script: "Mr Dafoe", cursive; --font-display: "Barlow Condensed", sans-serif; --font-sans: "Barlow", system-ui, sans-serif; --shadow-flat: 2px 2px 0 var(--wd-shadow); }`, and `body { @apply bg-bg text-ink font-sans; }` with a 0.3s colour transition (disabled under `prefers-reduced-motion`). `main.jsx` imports this file and the fontsource weights `mr-dafoe/400`, `barlow-condensed/600-italic`, `barlow-condensed/800-italic`, `barlow/500`, `barlow/600`.
- [ ] **Step 6:** Run `npx vitest run tests/theme` — expect PASS. Run `npm run build` — expect a clean build.
- [ ] **Step 7: Commit** `chore: scaffold React, Vite and Tailwind with Ocean/Night Drive themes`.

## Task 2: Metronome engine and hook

**Files:** Create `src/audio/metronome.js`, `src/audio/useMetronome.js`. Test: `tests/audio/metronome.test.js`.

**Interfaces:**
- Produces: `clampBpm(n) => number` (round, clamp 30–300, non-finite → 80); `nextNoteTime(t, bpm, subdivision) => t + 60 / clampBpm(bpm) / subdivision`; `tapTempoBpm(timesMs) => number | null` (null under 2 taps or when the last gap > 2000ms; else 60000 / mean of the last ≤4 gaps, clamped); `class Metronome({ audioContext, lookaheadMs = 25, scheduleAheadSec = 0.1 })` with `setBpm`, `setSubdivision(1|2|3|4)`, `setAccent(bool)`, `start()`, `stop()`, `isRunning()`, `onBeat(cb(beatInBar, isAccent, time)) => unsubscribe`, `tap(nowMs)`, `_poll()` (the scheduling tick, public for tests). Beats per bar fixed at 4. Each scheduled pulse plays a short oscillator click (accent 1500Hz, beat 1000Hz, subdivision 700Hz at lower gain). `useMetronome(initialBpm) => { bpm, setBpm, running, toggle, tap, subdivision, setSubdivision, accent, setAccent }`, creating the AudioContext lazily inside `toggle` (user gesture).

- [ ] **Step 1: Write the failing tests:**

```js
import { clampBpm, nextNoteTime, tapTempoBpm, Metronome } from '../../src/audio/metronome.js';

test('quarter note at 120bpm is 0.5s', () => expect(nextNoteTime(0, 120, 1)).toBeCloseTo(0.5));
test('subdivision divides the beat', () => expect(nextNoteTime(0, 120, 2)).toBeCloseTo(0.25));
test('bpm is clamped', () => { expect(clampBpm(5)).toBe(30); expect(clampBpm(999)).toBe(300); expect(clampBpm(NaN)).toBe(80); });
test('tap tempo needs two taps', () => expect(tapTempoBpm([1000])).toBeNull());
test('tap tempo from steady taps', () => expect(tapTempoBpm([0, 500, 1000, 1500])).toBeCloseTo(120, 0));
test('long pause restarts tapping', () => expect(tapTempoBpm([0, 500, 1000, 5000])).toBeNull());

const fakeCtx = () => ({ currentTime: 0, destination: {}, createOscillator: () => ({ connect(){}, start(){}, stop(){}, frequency: { value: 0 } }),
  createGain: () => ({ connect(){}, gain: { setValueAtTime(){}, exponentialRampToValueAtTime(){} } }) });

test('schedules evenly spaced beats with accent on 1', () => {
  const ctx = fakeCtx(), beats = [];
  const m = new Metronome({ audioContext: ctx, scheduleAheadSec: 0.5 });
  m.setBpm(120); m.setAccent(true); m.onBeat((i, acc, t) => beats.push({ i, acc, t }));
  m.start(); ctx.currentTime = 1.6; m._poll(); m.stop();
  expect(beats[1].t - beats[0].t).toBeCloseTo(0.5);
  expect(beats.map(b => b.acc)).toEqual(beats.map(b => b.i === 0));
});
test('double start/stop are no-ops', () => {
  const m = new Metronome({ audioContext: fakeCtx() });
  expect(() => { m.start(); m.start(); m.stop(); m.stop(); }).not.toThrow();
});
```

- [ ] **Step 2:** `npx vitest run tests/audio` — expect FAIL.
- [ ] **Step 3:** Implement. The class keeps `nextTime`, `beatInBar`, `subIndex`; `_poll` loops while `nextTime < ctx.currentTime + scheduleAheadSec`, plays a click, notifies listeners only on main beats (`subIndex === 0`), then advances with `nextNoteTime`. `start` resumes the context if suspended and sets `nextTime = ctx.currentTime + 0.05`; the `setTimeout` loop calls `_poll` every `lookaheadMs`.
- [ ] **Step 4:** `npx vitest run tests/audio` — expect PASS.
- [ ] **Step 5: Commit** `feat: add lookahead metronome engine and hook`.

## Task 3: Curriculum schema and registry

**Files:** Create `src/data/schema.js`, `src/data/tracks/index.js`, `src/data/tracks/stub.js`. Test: `tests/data/schema.test.js`.

**Interfaces:**
- Produces: `DURATIONS = [15, 20, 30]`; `CATEGORIES = ['fingerstyle','caged','scales','fretboard','electric','rhythm','application']`; `validateTrack(track)` throws an `Error` naming the track id and the bad field. Shape: `{ id, title, category, summary, sessions: [{ id, title, focus, durations: { 15?|20?|30?: Step[] } }] }`; `Step = { kind: 'warmup'|'review'|'focus'|'apply'|'cooldown', title, seconds, instruction, bpm: { min, max } | null, fretboard: object | null, success: string }`. A session's step seconds for a duration must sum to that duration × 60. `createRegistry() => { register, get, list }` (register validates, rejects duplicate ids; get throws on unknown id). `src/data/tracks/index.js` exports one registry with the stub registered.

- [ ] **Step 1: Write the failing tests:** a valid stub passes; unknown category throws `/category/`; a session with no durations throws `/duration/`; step seconds that don't add up throw `/seconds/`; duplicate registration throws `/already registered/`; `get('nope')` throws; `list()` contains the stub.
- [ ] **Step 2:** `npx vitest run tests/data` — expect FAIL.
- [ ] **Step 3:** Implement `schema.js`, then the stub track (category `application`, one session with a 15-minute list: warmup 180s, focus 420s, apply 240s, cooldown 60s) and `tracks/index.js`.
- [ ] **Step 4:** `npx vitest run tests/data` — expect PASS.
- [ ] **Step 5: Commit** `feat: add curriculum schema validator and track registry`.

## Task 4: Shared components and the home screen

**Files:** Create `src/components/ArrowButton.jsx`, `src/components/Header.jsx`, `src/components/MetronomePanel.jsx`, `src/screens/Home.jsx`; modify `src/App.jsx`.

**Interfaces:**
- Consumes: `useTheme`, `useMetronome`, the registry's `list()`, `DURATIONS`.
- Produces: `<ArrowButton direction="prev"|"next" onClick label />` (56px button, 44px disc; `prev` = 2.5px `border-ink` ring, `next` = `bg-brand text-on-brand shadow-flat`; SVG arrow, stroke 3.2, round caps; presses 1px down-right on `:active`). `<Header right={node} />` (Mr Dafoe wordmark rotated −6°, `text-brand`, flat shadow; three 3px stripes). `<MetronomePanel />` (BPM readout in `font-display`, −/+ steps of 4, tap button, subdivision select 1–4, accent toggle, start/stop).

- [ ] **Step 1:** Build the components with Tailwind classes only, matching `mockups-vice-themes.html`.
- [ ] **Step 2:** `Home` renders: `Header` with a theme toggle on the right; a list of tracks (title in `font-display` italic uppercase, category as kicker); duration choice 15/20/30 as skewed chips (selected = `bg-chip text-chip-ink`); a "Surprise me" button (for now picks a random track, logged); `MetronomePanel`.
- [ ] **Step 3:** Run `npm run dev` and check in a browser at 390px and 1280px: both themes render with correct colours and no flash on reload; the toggle switches theme and survives reload; the metronome clicks steadily for 30 seconds, accent audible on beat 1, tap tempo updates BPM. Run `npm test` and `npm run build`.
- [ ] **Step 4: Commit** `feat: add themed home screen with metronome panel`.

---

## Self-review

- Spec coverage for this stage: scaffold, theme (light/dark, offline fonts), metronome (lookahead, BPM, tap, accent, subdivision), data model separated from UI. Fretboard, session runner, progress/Supabase, content and PWA are Stages 2–6.
- Review Focus items each have a test (theme fallback, clamping, tap tempo, double start/stop) or a manual check in Task 4 Step 3 (no theme flash, iOS audio unlock on gesture).
