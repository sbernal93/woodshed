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
