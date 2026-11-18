import { createRegistry } from '../schema.js';
import fingerstyle from './fingerstyle.js';
import minorPentatonic from './minorPentatonic.js';
import caged from './caged.js';
import triads from './triads.js';
import jazz from './jazz.js';
import styles from './styles.js';

export const tracks = createRegistry();
[fingerstyle, minorPentatonic, caged, triads, styles, jazz].forEach((t) => tracks.register(t));
