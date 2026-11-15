import { createRegistry } from '../schema.js';
import minorPentatonic from './minorPentatonic.js';

export const tracks = createRegistry();
[minorPentatonic].forEach((t) => tracks.register(t));
