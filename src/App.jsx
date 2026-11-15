import { useSyncExternalStore } from 'react';
import Home from './screens/Home.jsx';
import Lab from './screens/Lab.jsx';

const subscribe = (cb) => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); };

export default function App() {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  return hash === '#lab' ? <Lab /> : <Home />;
}
