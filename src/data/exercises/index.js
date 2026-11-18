import { createLibrary } from '../library.js';
import pentatonic from './pentatonic.js';
import fingerstyle from './fingerstyle.js';
import caged from './caged.js';
import triads from './triads.js';
import jazz from './jazz.js';
import styles from './styles.js';

export const exercises = createLibrary([...pentatonic, ...fingerstyle, ...caged, ...triads, ...styles, ...jazz]);
