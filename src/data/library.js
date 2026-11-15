import { STEP_KINDS } from './schema.js';

const isText = (v) => typeof v === 'string' && v.trim() !== '';

function check(ok, where, message) {
  if (!ok) throw new Error(`${where}: ${message}`);
}

function validateExercise(ex) {
  const at = `exercise "${ex?.id}"`;
  check(isText(ex?.id) && isText(ex.title), at, 'id and title are required');
  check(Array.isArray(ex.roles) && ex.roles.length > 0 && ex.roles.every((r) => STEP_KINDS.includes(r)), at, `roles must be some of ${STEP_KINDS.join(', ')}`);
  check(Array.isArray(ex.tags) && ex.tags.every(isText), at, 'tags must be a list of text');
  check(Number.isInteger(ex.level) && ex.level >= 1 && ex.level <= 5, at, 'level must be 1-5');
  check(ex.variants === undefined || (Array.isArray(ex.variants) && ex.variants.length > 0), at, 'variants must be omitted or a non-empty list');
  check(typeof ex.build === 'function', at, 'build(variant) must be a function');
}

// Exercises are reusable step bodies; a variant (key, box, start fret…) is the parameter set it is built with.
export function createLibrary(list) {
  const byId = new Map();
  for (const ex of list) {
    validateExercise(ex);
    check(!byId.has(ex.id), `exercise "${ex.id}"`, 'is already registered');
    byId.set(ex.id, ex);
  }
  const get = (id) => {
    check(byId.has(id), 'library', `no exercise "${id}"`);
    return byId.get(id);
  };
  return {
    get,
    list: () => [...byId.values()],
    build(id, variant = 0) {
      const ex = get(id);
      const params = ex.variants ? ex.variants[variant] : variant === 0 ? {} : undefined;
      check(params !== undefined, `exercise "${id}"`, `has no variant ${variant}`);
      return { title: ex.title, ...ex.build(params), exercise: id, variant };
    },
  };
}

// A session is a recipe: which exercise (and variant) fills each slot, and how long each slot runs per duration.
export function expandSession({ id, title, focus, steps, timing }, library) {
  steps.forEach((s) => check(library.get(s.exercise).roles.includes(s.kind), `exercise "${s.exercise}"`, `cannot be used as ${s.kind}`));
  const durations = Object.fromEntries(Object.entries(timing).map(([minutes, seconds]) => {
    check(seconds.length === steps.length, `session "${id}"`, `${minutes}min timing has ${seconds.length} lengths for ${steps.length} steps`);
    return [minutes, steps.map((s, i) => ({ kind: s.kind, seconds: seconds[i], ...library.build(s.exercise, s.variant) }))];
  }));
  return { id, title, focus, durations };
}
