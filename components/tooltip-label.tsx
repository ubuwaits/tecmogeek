type TooltipLabelProps = {
  label: string;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
};

export function TooltipLabel({ label, tooltip, onClick, active = false }: TooltipLabelProps) {
  const sharedClassName =
    "group relative inline-flex items-center justify-center border-b border-dotted border-white/30 pb-px text-inherit transition hover:text-white focus-visible:outline-none";
  const tooltipClassName =
    "pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded bg-black px-2 py-2 text-center text-[11px] leading-[1.4] text-white shadow-sm group-hover:block group-focus-visible:block sm:max-w-[200px]";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClassName} ${active ? "text-white" : ""}`}
      >
        <span>{label}</span>
        <span className={tooltipClassName}>
          {tooltip}
        </span>
      </button>
    );
  }

  return (
    <span className={sharedClassName}>
      <span>{label}</span>
      <span className={tooltipClassName}>
        {tooltip}
      </span>
    </span>
  );
}
