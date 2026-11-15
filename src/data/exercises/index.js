import { createLibrary } from '../library.js';
import pentatonic from './pentatonic.js';
import fingerstyle from './fingerstyle.js';

export const exercises = createLibrary([...pentatonic, ...fingerstyle]);
