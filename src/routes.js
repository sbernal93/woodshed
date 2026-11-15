import { SCALES } from './music/scales.js';
import { KEYS } from './data/scaleLibrary.js';

const validRoot = (r) => KEYS.includes(r);

export const scaleHref = (scale, root) => `#scale/${scale}/${encodeURIComponent(root)}`;
export const cagedHref = (root) => `#caged/${encodeURIComponent(root)}`;

export function parseRoute(hash) {
  const [name, ...rest] = hash.replace(/^#/, '').split('/').map(decodeURIComponent);
  if (name === 'library') return { name: 'library' };
  if (name === 'scale') {
    const [scale, root] = rest;
    return SCALES[scale] && validRoot(root) ? { name: 'scale', scale, root } : { name: 'library' };
  }
  if (name === 'caged') return validRoot(rest[0]) ? { name: 'caged', root: rest[0] } : { name: 'library' };
  return { name: 'home' };
}
