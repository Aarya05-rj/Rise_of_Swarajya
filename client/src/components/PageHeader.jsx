export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">Rise of Swarajya</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-royalBrown dark:text-white">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-royalBrown/70 dark:text-white/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
