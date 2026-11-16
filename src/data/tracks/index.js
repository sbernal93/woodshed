import { createRegistry } from '../schema.js';
import fingerstyle from './fingerstyle.js';
import minorPentatonic from './minorPentatonic.js';
import caged from './caged.js';

export const tracks = createRegistry();
[fingerstyle, minorPentatonic, caged].forEach((t) => tracks.register(t));
