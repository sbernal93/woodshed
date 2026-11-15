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
