import Header from '../components/Header.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ArrowButton from '../components/ArrowButton.jsx';
import KeyPicker from '../components/KeyPicker.jsx';
import FretboardViewer from '../components/FretboardViewer.jsx';
import { cagedHref } from '../routes.js';

export default function CagedDetail({ root }) {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 lg:px-12 lg:pt-10">
      <Header right={<ThemeToggle />} />
      <div className="mt-8 flex items-center gap-3">
        <ArrowButton direction="prev" href="#library" label="Back to scale library" />
        <h2 className="font-display text-3xl font-extrabold uppercase italic leading-none">{root} major · CAGED</h2>
      </div>
      <div className="mt-8"><KeyPicker value={root} onChange={(k) => location.replace(cagedHref(k))} /></div>
      <div className="mt-10 grid gap-14 md:grid-cols-2 xl:grid-cols-3">
        {['C', 'A', 'G', 'E', 'D'].map((shape) => (
          <FretboardViewer key={`${root}-${shape}`} title={`${shape} shape`} spec={{ type: 'caged', root, shape }} />
        ))}
      </div>
    </main>
  );
}
