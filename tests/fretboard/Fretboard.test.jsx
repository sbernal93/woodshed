import { renderToStaticMarkup } from 'react-dom/server';
import Fretboard from '../../src/components/Fretboard.jsx';
import { positionMarks } from '../../src/music/scales.js';

test('the diagram describes every note for screen readers', () => {
  const marks = positionMarks({ root: 'A', scale: 'minorPentatonic', position: 1 });
  const html = renderToStaticMarkup(<Fretboard marks={marks} fromFret={5} toFret={8} title="A minor pentatonic" />);
  expect(html).toMatch(/<desc[^>]*>.*low E string, fret 5: A, root/);
  expect(html).toMatch(/high e string, fret 8: C/);
  expect(html).toMatch(/aria-describedby/);
});

test('muted marks render faded and are left out of the description', () => {
  const marks = [
    { string: 6, fret: 5, note: 'A', degree: '1', finger: null, root: true },
    { string: 6, fret: 8, note: 'C', degree: 'b3', finger: null, root: false, muted: true },
  ];
  const html = renderToStaticMarkup(<Fretboard marks={marks} fromFret={5} toFret={8} title="t" />);
  expect(html).toMatch(/opacity-30/);
  expect(html).not.toMatch(/fret 8: C/);
});
