import { useMemo } from 'react';
import Fretboard from './Fretboard.jsx';
import { usePlayhead } from '../hooks/usePlayhead.js';

const key = (n) => `${n.string}-${n.fret}`;

// Animated guide for pattern steps: the note to play now pulses, the next one is outlined.
export default function PlayAlong({ pattern, notesPerBeat, metronome, frozen, labelMode, title }) {
  const { index, countIn } = usePlayhead({ metronome, frozen, notesPerBeat, length: pattern.length });
  const marks = useMemo(() => [...new Map(pattern.map((n) => [key(n), n])).values()], [pattern]);
  const frets = marks.map((m) => m.fret);
  const fromFret = Math.min(...frets);
  const toFret = Math.max(Math.max(...frets), fromFret + 3);
  const now = pattern[index];

  return (
    <figure className="mt-6">
      <div className="overflow-x-auto">
        <Fretboard marks={marks} fromFret={fromFret} toFret={toFret} labelMode={labelMode} title={title}
          active={key(now)} upcoming={key(pattern[(index + 1) % pattern.length])} pulse={index} />
      </div>
      <figcaption className="mt-3 text-center text-[15px] text-ink-soft">
        {countIn ? 'Count-in: the pattern starts on the next beat 1' : (
          <>
            Note {index + 1} of {pattern.length}
            {now.finger ? ` · finger ${now.finger}` : ''}
            {metronome.running ? '' : ' · preview: start the click to play along'}
          </>
        )}
      </figcaption>
    </figure>
  );
}
