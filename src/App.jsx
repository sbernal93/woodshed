import { useSyncExternalStore } from 'react';
import { parseRoute } from './routes.js';
import Home from './screens/Home.jsx';
import Library from './screens/Library.jsx';
import ScaleDetail from './screens/ScaleDetail.jsx';
import CagedDetail from './screens/CagedDetail.jsx';

const subscribe = (cb) => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); };

export default function App() {
  const route = parseRoute(useSyncExternalStore(subscribe, () => location.hash));
  if (route.name === 'library') return <Library />;
  if (route.name === 'scale') return <ScaleDetail key={`${route.scale}-${route.root}`} scale={route.scale} root={route.root} />;
  if (route.name === 'caged') return <CagedDetail root={route.root} />;
  return <Home />;
}
