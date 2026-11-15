# Woodshed — Design

## Intent

A personal guitar practice web app for an intermediate electric/acoustic
guitarist (standard tuning) who has plateaued. The core problem it solves:
when picking up the guitar to practice, there's no structure, so practice
time gets wasted deciding what to do or drilling things that don't move
the needle. Woodshed removes that decision: open it on a phone or tablet
on a music stand, pick a track and a duration, and it hands over a timed,
step-by-step session with a metronome, diagrams, and a clear focus.

This is a single-user tool. No sign-up flow, no social features, no
content marketplace — just a well-built practice coach for one person.

## Goals

- Eliminate "what should I practice" friction: pick track + duration (or
  "surprise me"), get a structured session immediately.
- Push past beginner material — assumes open chords, basic barre chords,
  minor pentatonic box, basic fingerpicking already known.
- Make advanced fingerstyle (Neon-style thumb-independence playing) the
  flagship track, built from original exercises/etudes, not transcriptions.
- Bake in practice principles that actually work: metronome-driven slow
  practice, one focus per session, musical application (not just drills),
  spaced review of older material, warm-up/cool-down every session.
- Usable hands-free-ish while holding a guitar: big type, big tap targets,
  screen stays awake, chime on step transitions, readable from a music
  stand 1-2 metres away.
- Track tempo progress per exercise over time, with session completion
  and streaks.
- Progress (and its per-exercise BPM history) available on more than one
  device, without a login/password screen.
- Musically and theoretically correct content: CAGED shapes, scale
  patterns, fingerings, tab, all checked against standard tuning
  (E A D G B E), generated programmatically where feasible, with unit
  tests on the generators.

## Non-goals / anti-goals

- No beginner content (no open-chord-shapes-101, no "what is a pentatonic
  scale" explainers).
- No transcriptions or tab of copyrighted songs (e.g. no "Neon" tab) —
  original exercises only, the user brings the actual song themselves.
- No social features, no sharing, no multi-user accounts, no password
  auth, no admin panel.
- No heavy framework or large dependency tree — this is a small static
  app, not a product.
- Would count as a failure even if "technically working": a session
  runner that drifts out of tempo (setInterval metronome jitter), a UI
  that's unreadable from a stand-mounted phone, incorrect fretboard
  diagrams/tab, or content so generic it doesn't actually target the
  stated skills (thumb independence, CAGED, etc).

## Constraints

- No backend server to operate/maintain — static site only, deployed to
  GitHub Pages.
- Hosted at `woodshed.bernaland.com` (new CNAME in existing GoDaddy DNS
  for bernaland.com) — kept fully separate from the existing S3-hosted
  blog so nothing about that site is touched or risked. GitHub Pages
  gives HTTPS automatically, which the Web Audio and Wake Lock APIs need.
- Progress must survive a single device being lost/cleared and should be
  visible from a second device — this pulls in Supabase (hosted Postgres
  + REST API) as the one external dependency, used purely as a data
  store, not as an app backend. No password-based auth; a per-device
  generated user id (stored in localStorage) is the row key, with a
  Supabase RLS policy scoped to that id. Supabase's anon key is public by
  nature (expected for a client-only app) — row-level security, not
  secrecy, is what keeps user rows separate.
- Must work fully offline once loaded (practice room may have poor wifi):
  local state in localStorage is authoritative for the current session;
  Supabase sync happens opportunistically (on load and after writes, when
  online) and never blocks the practice flow.
- Mobile-first, dark theme, must remain usable if a sync call fails or
  times out.

## Decisions made during brainstorming (my calls, confirmed with user)

- **Repo/hosting**: new standalone repo (this one), deployed to GitHub
  Pages, `woodshed.bernaland.com` via CNAME — chosen over a new S3+CloudFront
  setup or a `/woodshed` path on the existing bucket because it's free,
  gets HTTPS for free, and can't break the existing blog.
- **Build tooling**: React + Vite, styled with Tailwind v4 (user's call,
  replacing the original vanilla JS choice). Plain JS/JSX, no TypeScript.
  vite-plugin-pwa for the service worker/manifest in Stage 6.
- **Visual direction**: Vice City. "Ocean Drive" light theme (flat teal,
  hot pink, navy) and "Night Drive" dark theme (flat midnight purple, no
  neon glow), sharing every component so a theme switch only swaps
  colour tokens. Reference: `mockups-vice-themes.html`.
- **Sync approach**: Supabase table keyed by a client-generated UUID
  stored in localStorage, no login UI. If the user wants a second device
  to share progress, they copy that ID across (exposed in a small
  Settings view). This was explicitly accepted by the user ("no need to
  have password protection").
- **Data split**: curriculum content (tracks/sessions/exercises) lives in
  static JS/JSON data modules, decoupled from UI/rendering code and from
  progress data, so content can be added/edited without touching app
  logic.
- **Repo visibility**: public repo, confirmed by user — required for free
  GitHub Pages hosting. No secrets in the codebase; the Supabase anon key
  is meant to be public, with RLS (not secrecy) protecting rows.
- **Supabase project**: user already has a Supabase account and project
  created for this app. The plan can go straight to schema/RLS setup
  against it rather than walking through account creation.
- **Sessions are pre-authored**, not dynamically assembled at runtime:
  each (track, duration) combination is a defined list of steps in the
  content data, so content stays something the user can read/edit
  directly, per their "data files I can edit later" requirement.
- **Spaced review**: a simple recency rule (resurface the exercise/material
  not practiced for the longest time within a track) rather than a full
  SM-2-style spacing algorithm — satisfies the stated goal without adding
  real complexity.
- **BPM progression rule**: "too easy" bumps target BPM up ~5 (within the
  +4 to +6 range the user gave), "just right" holds, "too hard" holds or
  drops slightly — exact step is a builder-level tuning knob, not a
  user decision.
- **v1 content scope**: already specified in the original request — all
  listed tracks included at launch (advanced fingerstyle, CAGED, scales,
  fretboard knowledge, electric technique, rhythm/chords, application),
  each with 4-6 progressive sessions, fingerstyle built first per the
  stated build order.
- **Visual/interaction quality**: built using the impeccable design skill
  (and ponytail for code structure/cleanliness) — dark theme, large
  type/tap targets, animations used only where they clarify state
  (step transitions, countdown, chime cues), not decoration for its own
  sake.
- **Platform support**: both iOS and Android are in scope. iOS Safari has
  real quirks around Wake Lock support and Web Audio autoplay unlocking;
  the app must handle an explicit "start" gesture to unlock audio and
  degrade gracefully (no crash, just no wake lock) where the Wake Lock
  API is unavailable.

## What's left to the builder (implementation plan will cover specifics)

- Exact Supabase schema (tables for progress log, session completions,
  per-exercise BPM history) and the RLS policy definition.
- Exact file/module layout for data vs. rendering vs. session-runner vs.
  metronome vs. progress/sync code.
- The metronome's lookahead-scheduling implementation details.
- Fretboard SVG renderer's internal data format (as long as it's
  generated from tuning + fret math, not hand-coded per diagram).
- Full exercise/session content for all tracks (fingerstyle track first,
  per the user's stated build order), written to the data schema above.
- PWA manifest/icons and offline caching strategy specifics.
- Test coverage for scale/chord/note-position generators.

## Build order (per user's original request)

1. App shell, data model, metronome engine
2. Fretboard renderer (SVG, generated from tuning)
3. Session runner (steps, timers, chime, pause/next/prev)
4. Progress tracking (localStorage + Supabase sync, BPM rating → next BPM)
5. Content for all tracks, starting with advanced fingerstyle
6. PWA + polish (wake lock, install, offline, keyboard shortcuts)

Each stage run and manually checked locally before moving to the next.
