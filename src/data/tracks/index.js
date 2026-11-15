import { createRegistry } from '../schema.js';
import stub from './stub.js';

export const tracks = createRegistry();
[stub].forEach((t) => tracks.register(t));
