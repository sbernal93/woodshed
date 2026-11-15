# Woodshed Stage 3: Session Runner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run a timed practice session: step view with countdown, instruction, target BPM, fretboard and success criteria; built-in metronome that follows each step's BPM; chime and auto-advance at step end; pause/prev/next with keyboard shortcuts; screen kept awake; a completion screen.

**Architecture:** Session timing is a pure reducer (`src/session/runner.js`) driven by wall-clock deltas, so it is unit-tested and cannot drift. One shared AudioContext (`src/audio/context.js`) is created on the Start tap (the iOS unlock gesture) and used by both the metronome and the chime. Screens are hash routes: `#session/<trackId>/<minutes>`.

**Tech Stack:** Stage 1–2 stack, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-15-woodshed-design.md`

## Global Constraints

- Countdown uses elapsed wall-clock time (performance.now deltas), never "one tick = one second".
- Readable at 1–2 m: countdown ≥ 72px, step title ≥ 28px, controls ≥ 56px.
- Keyboard: Space = pause/resume, ← = previous step, → = next step; ignored while typing in an input.
- Wake Lock is optional: unsupported or denied must not throw; re-request when the page becomes visible again.
- Theme tokens only; arrow-only prev/next (ArrowButton).

## Review Focus

- A backgrounded tab (no ticks for minutes) must not skip steps silently on return beyond what real time says, and must never go negative or past the last step.
- Prev on the first step and next on the last step behave sensibly (restart step 1 / finish).
- Pausing freezes the countdown exactly; resuming continues from the same remaining time.
- Changing steps sets the metronome to the new step's suggested BPM without stopping a running click; a step with `bpm: null` leaves the BPM alone.
- Leaving the session screen stops the metronome and releases the wake lock.

---

## Task 1: Session reducer and session picker

**Files:** `src/session/runner.js`, `tests/session/runner.test.js`, stub track gains 20- and 30-minute step lists.

**Produces:** `startSession(steps, nowMs) => state` with `{ steps, index, remainingMs, paused, finished, endedCount, lastTick }`; `sessionReducer(state, action)` for `{ type: 'tick', now }`, `{ type: 'next' }`, `{ type: 'prev' }`, `{ type: 'togglePause', now }`; `formatClock(ms) => 'm:ss'` (rounds up, so 0.2s shows 0:01 and 0 shows 0:00); `pickSession(track, minutes) => { session, minutes, steps }` choosing the first session with that duration, else the first session's closest duration.

Rules: `tick` subtracts `now - lastTick` while not paused; when time runs out the overflow carries into following steps, `endedCount` increments once per step that ended, and running past the last step sets `finished`. `next` on the last step finishes; `prev` within the first 3 s of a step goes back a step, otherwise restarts the current step; `prev` on step 1 restarts it.

- [ ] Tests first for each rule above, plus formatClock and pickSession. Fail, implement, pass, commit `feat: add session timing reducer and session picker`.

## Task 2: Shared audio context, chime and wake lock

**Files:** `src/audio/context.js` (`getAudioContext()` singleton, resumes if suspended), `src/audio/chime.js` (`playChime(ctx, when?)`: two soft sine partials, 880 Hz then 1320 Hz, ~1.2 s decay), `src/hooks/useWakeLock.js` (`useWakeLock(active)`), `useMetronome` switched to the shared context (cleanup stops, does not close).

- [ ] Test `playChime` schedules two oscillators with decaying gain on a fake context, and `getAudioContext` returns the same instance twice. Fail, implement, pass, commit `feat: share one AudioContext, add chime and wake lock`.

## Task 3: Session screen

**Files:** `src/screens/Session.jsx`, `src/screens/SessionDone.jsx`, `src/hooks/useSessionClock.js` (requestAnimationFrame + visibility-aware ticks into the reducer), `src/routes.js` (`#session/<trackId>/<minutes>`), Home Start button enabled.

- [ ] Route test for `#session/stub/20`; unknown track falls back to home.
- [ ] Step view per Global Constraints: segmented progress bar (one segment per step, current filled), step kind and title, countdown, instruction, BPM chip, `Fretboard` when `step.fretboard` is set (via `resolveFretboard`), "What good looks like" success line, compact metronome (−/+, start/stop, tap). Pause button between the arrows.
- [ ] Chime when `endedCount` increases; metronome BPM follows the step's `bpm.min` on step change.
- [ ] Keyboard shortcuts, wake lock while running.
- [ ] Done screen: steps completed, total time, back to home.
- [ ] Browser check at 390 and 1440, both themes. Commit `feat: add session runner screen`.
