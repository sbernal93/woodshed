import { createLibrary } from '../library.js';
import pentatonic from './pentatonic.js';
import fingerstyle from './fingerstyle.js';
import caged from './caged.js';
import triads from './triads.js';

export const exercises = createLibrary([...pentatonic, ...fingerstyle, ...caged, ...triads]);
