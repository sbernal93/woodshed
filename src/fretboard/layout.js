// Geometry only. A note at fret f sits mid-cell between wire f-1 and wire f; fret 0 sits above/left of the nut.
export function fretboardLayout({ fromFret, toFret, orientation = 'vertical', cell = 56, stringGap = 40 }) {
  const gutter = 30;
  const pad = 18;
  const openRow = fromFret === 0 ? Math.round(cell * 0.7) : 14;
  const firstWire = Math.max(fromFret, 1) - 1;
  const cells = toFret - firstWire;

  const start = gutter + openRow;
  const along = (w) => start + (w - firstWire) * cell;
  const boardEnd = along(toFret);
  const alongLength = boardEnd + 28;
  const acrossLength = gutter + pad * 2 + stringGap * 5;

  const vertical = orientation !== 'horizontal';
  // Vertical: low E on the left. Horizontal: high e on top (like tab).
  const across = (s) => gutter + pad + (vertical ? 6 - s : s - 1) * stringGap;
  const fretAlong = (fret) => (fret === 0 ? start - openRow / 2 : (along(fret - 1) + along(fret)) / 2);

  const point = (a, c) => (vertical ? { x: c, y: a } : { x: a, y: c });
  return {
    vertical,
    cells,
    firstWire,
    width: vertical ? acrossLength : alongLength,
    height: vertical ? alongLength : acrossLength,
    boardStart: along(firstWire),
    boardEnd,
    wirePos: along,
    stringPos: across,
    acrossSpan: [across(vertical ? 6 : 1), across(vertical ? 1 : 6)],
    fretAlong,
    point,
    markPos: (string, fret) => point(fretAlong(fret), across(string)),
  };
}
