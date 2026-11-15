import { useEffect } from 'react';
import { getAudioContext } from './context.js';
import { startDrone } from './drone.js';

// Plays while `root` is set and `active`; any change or unmount fades it out.
export function useDrone(root, active) {
  useEffect(() => {
    if (!root || !active) return undefined;
    return startDrone(getAudioContext(), root);
  }, [root, active]);
}
