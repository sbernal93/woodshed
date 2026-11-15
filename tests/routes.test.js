import { parseRoute, scaleHref, cagedHref } from '../src/routes.js';

test('empty hash is home', () => expect(parseRoute('')).toEqual({ name: 'home' }));
test('#library is the library', () => expect(parseRoute('#library')).toEqual({ name: 'library' }));
test('scale route carries scale and root', () =>
  expect(parseRoute('#scale/minorPentatonic/A')).toEqual({ name: 'scale', scale: 'minorPentatonic', root: 'A' }));
test('sharps survive the round trip', () => expect(parseRoute(scaleHref('major', 'F#'))).toEqual({ name: 'scale', scale: 'major', root: 'F#' }));
test('unknown scale or root falls back to the library', () => {
  expect(parseRoute('#scale/kazoo/A')).toEqual({ name: 'library' });
  expect(parseRoute('#scale/major/H')).toEqual({ name: 'library' });
});
test('caged route', () => expect(parseRoute(cagedHref('Bb'))).toEqual({ name: 'caged', root: 'Bb' }));
test('unknown hash is home', () => expect(parseRoute('#nope')).toEqual({ name: 'home' }));
