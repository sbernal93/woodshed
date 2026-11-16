import { positionMarks, scaleMarks } from './scales.js';
import { cagedMarks, cagedScaleMarks } from './chords.js';

const frame = (marks) => {
  const frets = marks.map((m) => m.fret);
  const fromFret = Math.min(...frets);
  return { marks, fromFret, toFret: Math.max(Math.max(...frets), fromFret + 3) };
};

// Curriculum data points at generators instead of hand-placed dots.
export function resolveFretboard(spec) {
  switch (spec.type) {
    case 'pentatonic':
      return frame(positionMarks({ root: spec.root, scale: spec.quality === 'major' ? 'majorPentatonic' : 'minorPentatonic', position: spec.position }));
    case 'scale':
      if (spec.position) return frame(positionMarks({ root: spec.root, scale: spec.scale, position: spec.position, perString: spec.perString }));
      return { marks: scaleMarks(spec), fromFret: spec.fromFret ?? 0, toFret: spec.toFret ?? 12 };
    case 'caged-scale':
      return frame(cagedScaleMarks(spec));
    case 'caged':
      return frame(cagedMarks({ root: spec.root, shape: spec.shape, quality: spec.quality }));
    default:
      throw new Error(`unknown fretboard spec type "${spec.type}"`);
  }
}
