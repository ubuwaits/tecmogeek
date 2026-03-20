import { TooltipLabel } from "@/components/tooltip-label";

const PLAYER_LIST_HEADER_LABEL_CLASS =
  "items-end pb-0 whitespace-nowrap text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-white/72";
const PLAYER_LIST_HEADER_CELL_CLASS = "flex min-h-8 w-full items-end";

type HeaderLabelAlign = "left" | "center" | "right";

type PlayerListHeaderLabelProps = {
  label: string;
  tooltip?: string;
  onClick?: () => void;
  active?: boolean;
  align?: HeaderLabelAlign;
  className?: string;
};

function getAlignmentClass(align: HeaderLabelAlign): string {
  if (align === "left") {
    return "justify-start text-left";
  }

  if (align === "right") {
    return "justify-end text-right";
  }

  return "justify-center text-center";
}

export function PlayerListHeaderLabel({
  label,
  tooltip,
  onClick,
  active = false,
  align = "left",
  className = "",
}: PlayerListHeaderLabelProps) {
  return (
    <div className={`${PLAYER_LIST_HEADER_CELL_CLASS} ${getAlignmentClass(align)}`}>
      <TooltipLabel
        label={label}
        tooltip={tooltip}
        onClick={onClick}
        active={active}
        className={`${PLAYER_LIST_HEADER_LABEL_CLASS} ${className}`}
      />
    </div>
  );
}

export { PLAYER_LIST_HEADER_LABEL_CLASS };
