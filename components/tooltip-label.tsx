type TooltipLabelProps = {
  label: string;
  tooltip?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

function TooltipBubble({ tooltip }: { tooltip: string }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded bg-black px-2 py-2 text-center text-[11px] leading-[1.4] text-white shadow-sm group-hover:block group-focus-visible:block sm:max-w-[200px]">
      {tooltip}
    </span>
  );
}

export function TooltipLabel({
  label,
  tooltip,
  onClick,
  active = false,
  className = "",
}: TooltipLabelProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group relative inline-flex border-b border-dotted border-white/30 text-inherit transition hover:text-white focus-visible:outline-none ${
          active ? "text-white" : ""
        } ${className}`}
      >
        <span>{label}</span>
        {tooltip ? <TooltipBubble tooltip={tooltip} /> : null}
      </button>
    );
  }

  return (
    <span
      className={`group relative inline-flex border-b border-dotted border-white/30 text-inherit transition hover:text-white focus-visible:outline-none ${className}`}
    >
      <span>{label}</span>
      {tooltip ? <TooltipBubble tooltip={tooltip} /> : null}
    </span>
  );
}
