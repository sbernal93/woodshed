# Woodshed Stage 2: Fretboard Generators and Renderer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate every note position from standard tuning (scales, pentatonic and 3-notes-per-string positions, CAGED chord shapes) and render them as an interactive themed SVG fretboard with note / degree / finger labels and position, 12-fret and 15-fret views.

**Architecture:** Pure music code in `src/music/` (no React): pitch math, tuning, scale and chord generators that return plain `Mark[]` arrays. A pure layout function maps (string, fret) to SVG coordinates so geometry is unit-tested. `<Fretboard>` draws marks from data; `<FretboardViewer>` adds the label and range toggles. Curriculum content (Stage 5) will reference generators by spec, e.g. `{ type: 'pentatonic', root: 'A', quality: 'minor', position: 1 }`, resolved by `resolveFretboard(spec)`.

**Tech Stack:** Stage 1 stack, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-15-woodshed-design.md`

## Global Constraints

- Standard tuning E A D G B E only. String 6 = low E, string 1 = high E.
- Positions are computed from pitch (MIDI numbers), never hand-typed per diagram.
- A note at fret f sits in the cell between fret wire f-1 and wire f; fret 0 sits above the nut.
- Colours only from theme tokens (`ink`, `line`, `brand`, `on-brand`, `bg`, `fill`); roots are `brand`.
- Labels ≥ 13px at phone width; marks ≥ 22px across.

## Spelling and fingering rules

- Scales and chords are defined as degree labels (`1 2 b3 4 #4 b5 5 b7 9` …). A note is spelled by letter: degree n takes the letter n−1 steps after the root letter, with the accidental that makes the pitch right. This gives F major → Bb, A blues → Eb (not D#), G major → F#.
- Fingers: 2-notes-per-string shapes use the hand frame (fret − lowest fret + 1). 3-notes-per-string shapes are fingered per string: first note 1, last note 4, middle note 3 if it is a half step below the last, else 2 (so 3-5-7 → 1-2-4, 5-7-8 → 1-3-4).

## Data shapes

`Mark = { string: 1..6, fret: 0..24, note: 'A'|'C#'|…, degree: '1'|'b3'|'5'|…, finger: 1..4|null, root: boolean }`

## Review Focus

- Pentatonic and 3nps walks crossing the G→B string (major third, not fourth) must land on correct frets.
- Roots in keys whose low-E root is fret 0 (E) or high (D#/Eb at 11) must not produce negative or off-board frets.
- Flats in input (`Bb`, `Eb`) must resolve to the same pitch as sharps.
- Every CAGED shape for every root sounds only chord tones and includes the root.
- No mark may fall outside the drawn board area for the chosen range (the bug that hid fret-5 notes in early mockups).

---

## File Structure

```
src/music/notes.js          NOTE_NAMES, pitchClass(name), noteName(pc), interval names
src/music/tuning.js         STANDARD_TUNING (midi per string 6..1), noteAt(string, fret)
src/music/scales.js         SCALES, scaleNotes, scaleMarks, positionMarks
src/music/chords.js         CHORDS, chordTones, CAGED_SHAPES, cagedMarks
src/music/resolve.js        resolveFretboard(spec) -> { marks, fromFret, toFret }
src/fretboard/layout.js     fretboardLayout({...}) -> { width, height, x(string), y(fret)... }
src/components/Fretboard.jsx
src/components/FretboardViewer.jsx
src/screens/Lab.jsx         dev-only gallery at #lab
tests/music/*.test.js, tests/fretboard/layout.test.js
```

## Task 1: Pitch math and tuning

**Interfaces — Produces:** `pitchClass('Bb') === pitchClass('A#') === 10`; `noteName(pc, preferFlats=false)`; `STANDARD_TUNING = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }` (MIDI); `noteAt(string, fret) => { midi, pc, name }`.

- [ ] Tests first: open strings are E A D G B E; `noteAt(6, 5).name === 'A'`; `noteAt(2, 1).name === 'C'`; `noteAt(3, 4).name === 'B'` (G→B third); flats equal sharps; unknown name throws. Watch fail, implement, pass, commit `feat: add pitch math and standard tuning`.

## Task 2: Scales and positions

**Interfaces — Produces:** `SCALES` interval sets for `major`, `minor` (natural), `minorPentatonic`, `majorPentatonic`, `blues`, and modes `ionian dorian phrygian lydian mixolydian aeolian locrian`; `scaleNotes(root, scale) => names`; `scaleMarks({ root, scale, fromFret, toFret }) => Mark[]` (every occurrence in range); `positionMarks({ root, scale, position, perString })`: start on the lowest fret ≥ 0 of degree `position` on string 6 (degree 1 = root), walk the scale upward in pitch, `perString` notes per string (2 for pentatonics, 3 for 3nps), then next string; fingers = fret − lowest fret in the shape + 1, clamped 1–4.

- [ ] Tests first:
  - `scaleNotes('G','major')` = G A B C D E F#; `scaleNotes('F','major')` uses Bb (flat key spelling: keys F, Bb, Eb, Ab, Db, Gb and their relative minors prefer flats).
  - A minor pentatonic position 1 = strings 6..1 frets [5,8] [5,7] [5,7] [5,7] [5,8] [5,8], roots at (6,5) (4,7) (1,5).
  - A minor pentatonic positions 1–5 start on frets 5, 8, 10, 12, 15 of string 6.
  - E minor pentatonic position 1 starts at fret 0 and has no negative frets.
  - G major 3nps position 1 string 6 = [3,5,7], string 3 = [4,5,7], string 2 = [5,7,8]; fingers string 6 = [1,2,4], string 2 = [1,3,4].
  - `scaleNotes('A','blues')` = A C D Eb E G.
  - Every mark's note is in the scale (property check over all 12 roots × pentatonic positions 1–5).
- [ ] Implement, pass, commit `feat: add scale and position generators`.

## Task 3: Chords and CAGED

**Interfaces — Produces:** `CHORDS` formulas for `maj m 7 maj7 m7 9 sus2 sus4`; `chordTones(root, quality) => names`; `CAGED_SHAPES = { C: 'x32010', A: 'x02220', G: '320003', E: '022100', D: 'xx0232' }` (strings 6→1, open-chord templates); `cagedMarks({ root, shape }) => Mark[]` moving the open shape up by `(pc(root) − pc(shapeRoot)) mod 12`, with degree labels and roots flagged.

- [ ] Tests first: `chordTones('A','m7')` = A C E G; `cagedMarks({ root:'C', shape:'A' })` = x 3 5 5 5 3; for all 12 roots × 5 shapes every mark's pitch class is a major-triad tone and the root is present.
- [ ] Implement, pass, commit `feat: add chord formulas and CAGED shapes`.

## Task 4: Layout and Fretboard component

**Interfaces — Produces:** `fretboardLayout({ fromFret, toFret, orientation: 'vertical'|'horizontal', cell = 56, stringGap = 40 })` returning `{ width, height, stringPos(s), wirePos(w), markPos(string, fret) }` where `markPos` for fret 0 sits outside the nut and every other fret sits mid-cell; `<Fretboard marks fromFret toFret labelMode orientation />` drawing wires (nut thicker when fromFret ≤ 1), strings, inlay dots at 3 5 7 9 12(double) 15 17 19 21, fret numbers, marks (root = filled `brand`, others = `bg` with `ink` stroke), labels per `labelMode` (`note` | `degree` | `finger` | `none`), `role="img"` with an `aria-label` listing the shape. `resolveFretboard(spec)` for the Stage 5 data.

- [ ] Tests first (layout): every mark of A minor pentatonic position 1 lies strictly inside the board for range 4–8; fret 0 lies outside the nut; wires are evenly spaced; horizontal layout swaps axes.
- [ ] Tests first (resolve): `resolveFretboard({ type:'pentatonic', root:'A', quality:'minor', position:1 })` returns the Task 2 marks with `fromFret` 4 and `toFret` 8; unknown type throws.
- [ ] Implement, pass, commit `feat: add fretboard layout and renderer`.

## Task 5: Viewer and dev gallery

- [ ] `<FretboardViewer spec />`: Chip toggles for labels (Notes / Degrees / Fingers) and range (Shape / 12 frets / 15 frets); vertical under `lg`, horizontal at `lg` and up.
- [ ] `src/screens/Lab.jsx` shown when `location.hash === '#lab'`: A minor pentatonic positions 1–5, G major 3nps position 1, C via all five CAGED shapes, in both themes.
- [ ] Browser check at 390px and 1440px: marks inside the board, labels readable, toggles work, both themes. `npm test`, `npm run build`. Commit `feat: add fretboard viewer and lab gallery`.
