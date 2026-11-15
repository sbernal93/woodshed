import { useId } from 'react';
import { fretboardLayout } from '../fretboard/layout.js';

const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];
const STRING_NAMES = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'e' };
const SPOKEN_STRINGS = { 6: 'low E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'high e' };

const labelFor = (m, mode) => (mode === 'note' ? m.note : mode === 'degree' ? m.degree : mode === 'finger' ? (m.finger ?? '') : '');

// `active` / `upcoming` are 'string-fret' keys for a play-along playhead; `pulse` changes to replay the ring.
export default function Fretboard({ marks, fromFret, toFret, labelMode = 'note', orientation = 'vertical', title = 'Fretboard', active, upcoming, pulse }) {
  const descId = useId();
  const L = fretboardLayout({ fromFret, toFret, orientation });
  const { point } = L;
  const [acrossA, acrossB] = L.acrossSpan;
  const wires = Array.from({ length: L.cells + 1 }, (_, i) => L.firstWire + i);
  const cellFrets = wires.slice(1);
  const neckView = L.cells > 6;
  const showAllNumbers = !neckView;
  // Inlays help you find your place on a long neck; on a 4-fret shape they just sit behind notes.
  const inlays = (list) => (neckView ? cellFrets.filter((f) => list.includes(f)) : []);
  const between = (s1, s2) => (L.stringPos(s1) + L.stringPos(s2)) / 2;
  const line = (a1, c1, a2, c2) => {
    const p1 = point(a1, c1), p2 = point(a2, c2);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  };

  return (
    <svg viewBox={`0 0 ${L.width} ${L.height}`} width={L.width} height={L.height} role="img" aria-label={title} aria-describedby={descId}
      className={`mx-auto block h-auto font-display italic ${L.vertical ? 'max-w-full' : 'max-w-none'}`}>
      <desc id={descId}>
        {marks.filter((m) => !m.muted).map((m) => `${SPOKEN_STRINGS[m.string]} string, fret ${m.fret}: ${m.note}${m.root ? ', root' : ''}`).join('; ')}
      </desc>
      {inlays(SINGLE_INLAYS).map((f) => {
        const p = point(L.fretAlong(f), between(4, 3));
        return <circle key={`i${f}`} cx={p.x} cy={p.y} r="6" className="fill-fill" />;
      })}
      {inlays(DOUBLE_INLAYS).flatMap((f) =>
        [between(5, 4), between(3, 2)].map((c, i) => {
          const p = point(L.fretAlong(f), c);
          return <circle key={`d${f}${i}`} cx={p.x} cy={p.y} r="6" className="fill-fill" />;
        }))}

      {wires.map((w) => (
        <line key={`w${w}`} {...line(L.wirePos(w), acrossA, L.wirePos(w), acrossB)}
          className="stroke-line" strokeWidth={w === 0 ? 6 : 1.5} strokeLinecap="round" />
      ))}
      {[6, 5, 4, 3, 2, 1].map((s) => (
        <line key={`s${s}`} {...line(L.boardStart, L.stringPos(s), L.boardEnd, L.stringPos(s))}
          className="stroke-line" strokeWidth={1 + (s - 1) * 0.3} />
      ))}

      {cellFrets.filter((f) => showAllNumbers || SINGLE_INLAYS.includes(f) || DOUBLE_INLAYS.includes(f)).map((f) => {
        const p = point(L.fretAlong(f), 14);
        return <text key={`n${f}`} x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-sm font-semibold">{f}</text>;
      })}
      {[6, 5, 4, 3, 2, 1].map((s) => {
        const p = point(14, L.stringPos(s));
        return <text key={`l${s}`} x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="fill-ink-soft text-sm font-semibold">{STRING_NAMES[s]}</text>;
      })}

      {marks.map((m) => {
        const { x, y } = L.markPos(m.string, m.fret);
        const label = labelFor(m, labelMode);
        const key = `${m.string}-${m.fret}`;
        const isActive = key === active;
        const isNext = !isActive && key === upcoming;
        const playing = active !== undefined;
        const fill = isActive || (m.root && !playing) ? 'fill-brand' : 'fill-bg';
        const stroke = isNext ? 'stroke-brand' : 'stroke-ink';
        const dim = m.muted || (playing && !isActive && !isNext);
        return (
          <g key={key} className={dim ? 'opacity-30' : undefined}>
            {isActive && <circle key={pulse} cx={x} cy={y} r="14" className="wd-pulse fill-none stroke-brand" strokeWidth="3" />}
            <circle cx={x} cy={y} r="14" strokeWidth={isNext ? 3.5 : 2} className={`${fill} ${stroke}`} />
            {label !== '' && (
              <text x={x} y={y} dy="0.35em" textAnchor="middle"
                className={`text-[14px] font-extrabold ${isActive || (m.root && !playing) ? 'fill-on-brand' : 'fill-ink'}`}>
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
