import { positionMarks, scaleMarks } from './scales.js';
import { cagedLayers, cagedMarks, cagedScaleMarks } from './chords.js';
import { triadVoicings } from './triads.js';
import { cagedArpeggio, nearestShell, shellVoicing } from './jazz.js';

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
    case 'triad': {
      // A named inversion (its lowest place on the neck), or whichever voicing sits closest to `near`.
      const voicings = triadVoicings(spec);
      const mid = (v) => (v.from + v.to) / 2;
      const pick = spec.near === undefined
        ? voicings.find((v) => v.inversion === spec.inversion)
        : voicings.reduce((best, v) => (Math.abs(mid(v) - spec.near) < Math.abs(mid(best) - spec.near) ? v : best));
      if (!pick) throw new Error(`no ${spec.root} ${spec.quality} triad for ${JSON.stringify(spec)}`);
      return frame(pick.marks);
    }
    case 'shell':
      return frame(spec.near === undefined ? shellVoicing(spec) : nearestShell(spec));
    case 'caged-arpeggio':
      return frame(cagedArpeggio(spec));
    case 'caged-layers':
      return frame(cagedLayers(spec));
    case 'caged-scale':
      return frame(cagedScaleMarks(spec));
    case 'caged':
      return frame(cagedMarks({ root: spec.root, shape: spec.shape, quality: spec.quality }));
    default:
      throw new Error(`unknown fretboard spec type "${spec.type}"`);
  }
}
