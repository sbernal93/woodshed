# Woodshed Stage 4: Practice Mechanics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give steps the tools that make practice a challenge instead of a drill: live prompts that change every few bars, a drone to play over, and a BPM ladder; then rewrite the placeholder track into the session the user approved.

**Why:** User feedback (2026-11-15): counting out loud and running a box are boring; every step needs a twist, a goal or a musical context. This stage swaps the original Stage 4 (progress tracking) and Stage 5 (content) order: mechanics and content first, progress after.

**Spec:** `docs/superpowers/specs/2026-11-15-woodshed-design.md`

## Step schema additions (all optional)

- `prompt: { label, items: string[], everyBars, order: 'cycle'|'random', root? }`: shows `items[i]` large, changing every `everyBars` bars at the current metronome BPM (4/4). With `root`, degree items also show the spelled note (`b3` → `C` in A).
- `drone: { root }`: while the step runs (not paused), a low drone plays the root (octave 2) and its fifth. It has a mute toggle.
- `ladder: { by }`: a "Clean pass · +N BPM" button that raises the metronome BPM by `by`.

## Global Constraints

- Prompt timing is a pure function of elapsed step time and BPM; random order is seeded per session so it never flickers on re-render and never repeats an item twice in a row.
- The drone must stop on pause, step change, finish and leaving the screen. It fades in and out (no clicks), and is quiet enough to keep the metronome audible.
- Validator rejects malformed prompt/drone/ladder fields with the field name in the error.

## Review Focus

- A prompt with one item, `everyBars` 1, or BPM changing mid-step must not throw or show `undefined`.
- Pausing must not advance the prompt (elapsed time is frozen with the countdown).
- The drone must never keep sounding after the session screen unmounts.

---

## Task 1: Prompt timing (pure)

`src/session/prompts.js`: `promptState(prompt, elapsedMs, bpm, seed) => { index, item, barInWindow, barsPerWindow }`; seeded order via mulberry32; `cycle` wraps. Tests: cycle advance at 120 BPM (4 bars = 8 s), BPM 60 halves the rate, random is deterministic per seed and never repeats back-to-back, single item stays put, `barInWindow` counts 0..everyBars-1.

## Task 2: Drone

`src/audio/drone.js`: `startDrone(ctx, root) => stop()`; triangle on the root at octave 2 (A → 110 Hz) plus sine fifth (A → 164.81 Hz) at lower gain, 0.4 s fade in/out. `useDrone(root, active, muted)` hook. Tests on a fake context: frequencies, fade ramps, stop schedules oscillator stop after fade.

## Task 3: Validator, session UI, content

- Validator: prompt items non-empty strings, `everyBars` positive integer, order known; drone root a valid note; ladder `by` positive integer. Tests first.
- Session step view: prompt panel (label, huge item, spelled note, bar dots for the window), drone mute toggle, ladder button. Elapsed = step length − remaining.
- Rewrite `src/data/tracks/stub.js` into track `minor-pentatonic`, "Minor Pentatonic", session "Box 1: sequences and targets" (15/20/30) per the approved design: spider permutations with ladder, recall-a-lick review, sequence prompts cycling every 4 bars, three-note phrases landing on b3 → 5 → b7 → 1 over an A drone, vibrato cool-down.
- Browser check; commit.
