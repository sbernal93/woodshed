export default function Header({ right }) {
  return (
    <header>
      <div className="flex items-end justify-between">
        <h1 className="origin-bottom-left -rotate-6 font-script text-5xl leading-none text-brand [text-shadow:2px_2px_0_var(--wd-shadow)]">
          Woodshed
        </h1>
        {right}
      </div>
      <div aria-hidden="true" className="mt-3 grid gap-[3px]">
        <i className="block h-[3px] bg-stripe-1" />
        <i className="block h-[3px] bg-stripe-2" />
        <i className="block h-[3px] bg-stripe-3" />
      </div>
    </header>
  );
}
