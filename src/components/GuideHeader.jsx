const chip = (on) => `min-h-9 rounded-full px-3 font-display text-sm font-extrabold uppercase italic ${on ? 'bg-ink text-bg' : 'bg-fill hover:bg-fill-hover'}`;

// One row above the guide: what it's doing on the left, its few options on the right. Nothing sits on the board.
export default function GuideHeader({ following, playing, speed, onSpeed, tempoLabel, extras = [] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-2 font-display text-base font-extrabold uppercase italic">
        <span className={`size-2.5 rounded-full ${following ? 'animate-pulse bg-brand motion-reduce:animate-none' : playing ? 'bg-ink' : 'bg-line'}`} />
        {following ? 'Following the click' : playing ? 'Demo' : 'Demo paused · tap the board'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {!following && (
          <>
            <button type="button" aria-pressed={speed === 'slow'} onClick={() => onSpeed('slow')} className={chip(speed === 'slow')}>Slow</button>
            <button type="button" aria-pressed={speed === 'tempo'} onClick={() => onSpeed('tempo')} className={chip(speed === 'tempo')}>{tempoLabel}</button>
          </>
        )}
        {extras.map((x) => (
          <button key={x.label} type="button" aria-pressed={x.on} onClick={x.onToggle} className={chip(x.on)}>{x.label}</button>
        ))}
      </div>
    </div>
  );
}
