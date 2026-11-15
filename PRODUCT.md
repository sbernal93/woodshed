# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind v4 (plain JS/JSX), deployed as a static PWA to GitHub Pages (`woodshed.bernaland.com`). No backend server; Supabase used only as a hosted data store for progress sync (no password auth — a client-generated id keyed by Row Level Security).

## Users

A single user: an intermediate electric/acoustic guitarist (standard tuning, years of experience, has plateaued) who already knows open chords, basic barre chords, the minor pentatonic box, and basic fingerpicking. They open the app on a phone or tablet propped on a music stand, guitar in hand, immediately before or during a practice session.

## Product Purpose

Woodshed removes the "what should I practice" decision paralysis that wastes practice time. It hands the user a structured, timed practice session (warm-up, focus work, musical application, cool-down) for a chosen track and duration, runs a drift-free metronome, shows fretboard/tab diagrams, and tracks tempo progress per exercise over time so slow, deliberate practice actually compounds.

## Positioning

Not a tab site, not a generic metronome app, not a course platform. It is a personal practice *coach* that sequences intermediate-to-advanced technique work (especially advanced fingerstyle in the style of thumb-independence players) into musically-applied sessions, built from original exercises rather than song transcriptions, with per-exercise tempo history as the proof of progress.

## Operating Context

Used hands-occupied: guitar in hand, device on a stand, viewed from roughly 1-2 metres away, often with inconsistent practice-room wifi. Sessions run for a fixed 15/20/30 minutes. The user may rate each exercise ("too easy / just right / too hard") immediately after playing it, without putting the guitar down for long.

## Capabilities and Constraints

- No accounts, no password login. A per-device id (localStorage) keys Supabase rows for cross-device progress; copying that id across devices is the only "linking" mechanism.
- Must work fully offline once loaded; Supabase sync is opportunistic, never blocking practice.
- Fretboard diagrams/tab must be generated programmatically from standard tuning (E A D G B E), not hand-authored per diagram, and covered by unit tests for correctness.
- No transcriptions or tab of copyrighted songs — all exercises/etudes are original.
- Metronome must use Web Audio lookahead scheduling (no `setInterval` drift).
- Screen must stay awake during a session (Wake Lock API, with graceful degradation where unsupported, notably iOS Safari).
- Curriculum content (tracks/sessions/exercises) lives in data files separate from UI/engine code, so it can be edited without touching app logic.

## Brand Commitments

Name: "Woodshed" (guitarist slang for focused solo practice). No existing visual identity yet — this init precedes the first visual direction work.

## Evidence on Hand

None (no existing screenshots, logos, or copy to preserve). This is a from-scratch build.

## Product Principles

- Decide for the user, never make them decide: one obvious next action at any moment in a session.
- Legible from arm's length while holding an instrument outranks density or cleverness.
- Practice principles (metronome-anchored tempo climbs, one focus per session, musical application, spaced review) are structural, not optional flourishes layered on top.
- Content correctness (music theory, fretboard geometry) is non-negotiable; generated-from-data beats hand-authored-and-hoped-correct.
- Offline-first and account-free: the tool must never block practice on network state.

## Accessibility & Inclusion

Large type and large tap targets are a core requirement (not just nice-to-have) because the device is read from a distance and operated with hands that may be mid-chord-change. No other specific accessibility standard has been set.
