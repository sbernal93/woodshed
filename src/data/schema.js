import { pitchClass } from '../music/notes.js';

export const DURATIONS = [15, 20, 30];
export const CATEGORIES = ['fingerstyle', 'caged', 'scales', 'fretboard', 'electric', 'rhythm', 'application'];
export const STEP_KINDS = ['warmup', 'review', 'focus', 'apply', 'cooldown'];

const isText = (v) => typeof v === 'string' && v.trim() !== '';

function check(ok, where, message) {
  if (!ok) throw new Error(`${where}: ${message}`);
}

function validateStep(s, where) {
  check(STEP_KINDS.includes(s?.kind), where, `kind must be one of ${STEP_KINDS.join(', ')}`);
  check(isText(s.title), where, 'title is required');
  check(Number.isInteger(s.seconds) && s.seconds > 0, where, 'seconds must be a positive integer');
  check(isText(s.instruction), where, 'instruction is required');
  check(isText(s.success), where, 'success is required');
  check(s.bpm === null || (s.bpm?.min > 0 && s.bpm.max >= s.bpm.min), where, 'bpm must be null or { min, max } with max >= min');
  check(s.fretboard === null || typeof s.fretboard === 'object', where, 'fretboard must be null or an object');
  if (s.prompt !== undefined) {
    const p = s.prompt;
    check(isText(p?.label) && Array.isArray(p.items) && p.items.length > 0 && p.items.every(isText), where, 'prompt needs a label and non-empty text items');
    check(Number.isInteger(p.everyBars) && p.everyBars > 0, where, 'prompt.everyBars must be a positive integer');
    check(['cycle', 'random'].includes(p.order), where, 'prompt.order must be cycle or random');
    check(p.root === undefined || isNote(p.root), where, 'prompt.root must be a note name');
  }
  if (s.drone !== undefined) check(isNote(s.drone?.root), where, 'drone.root must be a note name');
  if (s.pattern !== undefined) {
    const p = s.pattern;
    const known = (spec) => (spec?.type === 'grid' ? validGrid(spec, where) : ['spider', 'sequence'].includes(spec?.type))
      && (spec.notesPerBeat === undefined || (Number.isInteger(spec.notesPerBeat) && spec.notesPerBeat > 0 && spec.notesPerBeat <= 4));
    check(Number.isInteger(p?.notesPerBeat) && p.notesPerBeat > 0, where, 'pattern.notesPerBeat must be a positive integer');
    if (p.byPrompt) {
      const keys = Object.keys(p.byPrompt);
      check(keys.every((k) => s.prompt?.items.includes(k)), where, 'pattern.byPrompt keys must be prompt items');
      check(keys.every((k) => known(p.byPrompt[k])), where, 'pattern specs must be spider or sequence, notesPerBeat 1-4');
    } else {
      check(known(p.spec), where, 'pattern.spec must be spider or sequence, notesPerBeat 1-4');
    }
  }
  if (s.ladder !== undefined) check(Number.isInteger(s.ladder?.by) && s.ladder.by > 0, where, 'ladder.by must be a positive integer');
}

const isPosition = (string, fret) => Number.isInteger(string) && string >= 1 && string <= 6 && Number.isInteger(fret) && fret >= 0 && fret <= 24;

function validGrid(g, where) {
  const slots = g.slotsPerBeat * g.beats;
  check([2, 3, 4].includes(g.slotsPerBeat) && Number.isInteger(g.beats) && g.beats > 0, where, 'grid needs slotsPerBeat 2-4 and whole beats');
  check(Array.isArray(g.shape) && g.shape.every(([s, f]) => isPosition(s, f)), where, 'grid shape must be [string, fret] pairs');
  for (const [slot, notes] of Object.entries(g.events ?? {})) {
    check(Number.isInteger(Number(slot)) && Number(slot) >= 0 && Number(slot) < slots, where, `grid event slot ${slot} is outside the bar`);
    check(notes.every(([s, f, hand]) => isPosition(s, f) && ['p', 'i', 'm', 'a'].includes(hand)), where, `grid notes at slot ${slot} need string, fret and hand p/i/m/a`);
  }
  return true;
}

function isNote(name) {
  try { pitchClass(name); return true; } catch { return false; }
}

export function validateTrack(track) {
  const at = `track "${track?.id}"`;
  check(isText(track?.id), at, 'id is required');
  check(isText(track.title), at, 'title is required');
  check(CATEGORIES.includes(track.category), at, `category must be one of ${CATEGORIES.join(', ')}`);
  check(isText(track.summary), at, 'summary is required');
  check(Array.isArray(track.sessions) && track.sessions.length > 0, at, 'sessions must be a non-empty array');

  for (const session of track.sessions) {
    const where = `${at} session "${session?.id}"`;
    check(isText(session?.id) && isText(session.title) && isText(session.focus), where, 'id, title and focus are required');
    const keys = Object.keys(session.durations ?? {});
    check(keys.length > 0, where, `needs at least one duration of ${DURATIONS.join('/')} minutes`);
    for (const key of keys) {
      const minutes = Number(key);
      check(DURATIONS.includes(minutes), where, `unknown duration ${key}`);
      const steps = session.durations[key];
      check(Array.isArray(steps) && steps.length > 0, where, `duration ${key} has no steps`);
      steps.forEach((s, i) => validateStep(s, `${where} ${key}min step ${i + 1}`));
      const total = steps.reduce((sum, s) => sum + s.seconds, 0);
      check(total === minutes * 60, where, `${key}min steps add up to ${total} seconds, expected ${minutes * 60}`);
    }
  }
}

export function createRegistry() {
  const tracks = new Map();
  return {
    register(track) {
      validateTrack(track);
      if (tracks.has(track.id)) throw new Error(`track "${track.id}" is already registered`);
      tracks.set(track.id, track);
    },
    get(id) {
      if (!tracks.has(id)) throw new Error(`no track "${id}"`);
      return tracks.get(id);
    },
    list: () => [...tracks.values()],
  };
}
