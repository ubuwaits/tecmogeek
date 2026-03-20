"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PlayerListHeaderLabelProps = {
  label: string;
  tooltip?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

export function PlayerListHeaderLabel({
  label,
  tooltip,
  onClick,
  active = false,
  className = "",
}: PlayerListHeaderLabelProps) {
  const labelContent = (
    <span
      className={`inline-flex border-b border-dotted border-white/30 text-inherit transition hover:text-white focus-visible:outline-none ${
        active ? "text-white" : ""
      } items-end pb-0 whitespace-nowrap text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-white/72 ${className}`}
    >
      <span>{label}</span>
    </span>
  );

  const trigger = onClick ? (
    <button type="button" onClick={onClick} className="inline-flex">
      {labelContent}
    </button>
  ) : (
    <span tabIndex={tooltip ? 0 : undefined} className="inline-flex">
      {labelContent}
    </span>
  );

  return (
    <div className="flex min-h-8 w-full items-end justify-start">
      {tooltip ? (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
    </div>
  );
}
