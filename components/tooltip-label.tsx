type TooltipLabelProps = {
  label: string;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
};

function TooltipBubble({ tooltip }: { tooltip: string }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded bg-black px-2 py-2 text-center text-[11px] leading-[1.4] text-white shadow-sm group-hover:block group-focus-visible:block sm:max-w-[200px]">
      {tooltip}
    </span>
  );
}

export function TooltipLabel({ label, tooltip, onClick, active = false }: TooltipLabelProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group relative inline-flex items-center justify-center border-b border-dotted border-white/30 pb-px text-inherit transition hover:text-white focus-visible:outline-none ${
          active ? "text-white" : ""
        }`}
      >
        <span>{label}</span>
        <TooltipBubble tooltip={tooltip} />
      </button>
    );
  }

  return (
    <span className="group relative inline-flex items-center justify-center border-b border-dotted border-white/30 pb-px text-inherit transition hover:text-white focus-visible:outline-none">
      <span>{label}</span>
      <TooltipBubble tooltip={tooltip} />
    </span>
  );
}
