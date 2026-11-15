import { createRegistry } from '../schema.js';
import fingerstyle from './fingerstyle.js';
import minorPentatonic from './minorPentatonic.js';

export const tracks = createRegistry();
[fingerstyle, minorPentatonic].forEach((t) => tracks.register(t));
