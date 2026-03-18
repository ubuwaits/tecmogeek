import { TooltipLabel } from "@/components/tooltip-label";
import type { MetricColumn, PlayerMetricKey } from "@/lib/types";

type MetricLegendProps = {
  columns: readonly MetricColumn[];
  mobile?: boolean;
  activeKey?: PlayerMetricKey | null;
  onColumnClick?: (key: PlayerMetricKey) => void;
};

type MetricStripProps = {
  columns: readonly MetricColumn[];
  getValue: (key: PlayerMetricKey) => number;
  className?: string;
};

export function MetricLegend({
  columns,
  mobile = false,
  activeKey = null,
  onColumnClick,
}: MetricLegendProps) {
  return (
    <div className={`flex min-w-0 gap-1.5 sm:gap-2 ${mobile ? "" : "ml-3 md:ml-4"}`}>
      {columns.map((column) => {
        if (mobile) {
          const sharedClassName =
            "inline-flex min-h-9 w-full items-center justify-center rounded-lg border px-1.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

          return (
            <div
              key={column.key}
              className="min-w-0"
              style={{ flexBasis: 0, flexGrow: column.weight }}
            >
              {onColumnClick ? (
                <button
                  type="button"
                  onClick={() => onColumnClick(column.key)}
                  className={`${sharedClassName} ${
                    activeKey === column.key
                      ? "border-white/45 bg-white/14 text-white"
                      : "border-white/15 bg-white/6 text-white/72 hover:border-white/35 hover:text-white"
                  }`}
                  aria-label={column.tooltip}
                  title={column.tooltip}
                >
                  {column.label}
                </button>
              ) : (
                <span
                  className={`${sharedClassName} pointer-events-none border-white/10 bg-white/6 text-white/72`}
                  aria-label={column.tooltip}
                  title={column.tooltip}
                >
                  {column.label}
                </span>
              )}
            </div>
          );
        }

        return (
          <div
            key={column.key}
            className="min-w-0 text-[12px] sm:text-[14px]"
            style={{ flexBasis: 0, flexGrow: column.weight }}
          >
            <TooltipLabel
              label={column.label}
              tooltip={column.tooltip}
              onClick={onColumnClick ? () => onColumnClick(column.key) : undefined}
              active={activeKey === column.key}
            />
          </div>
        );
      })}
    </div>
  );
}

export function MetricStrip({ columns, getValue, className = "" }: MetricStripProps) {
  return (
    <div className={`flex min-w-0 gap-1.5 sm:gap-2 ${className}`}>
      {columns.map((column) => {
        const value = getValue(column.key);

        return (
          <div
            key={column.key}
            data-metric-key={column.key}
            aria-label={`${column.tooltip}: ${value}`}
            title={column.tooltip}
            className="min-w-0 rounded-[8px] border-[2px] border-white/80 bg-white/25 px-1 py-2 text-center text-[11px] font-bold tabular-nums text-[#222] sm:rounded-none sm:border-[3px] sm:text-[12px]"
            style={{
              flexBasis: 0,
              flexGrow: column.weight,
              backgroundImage: `linear-gradient(to right, var(--pink) 0%, var(--pink) ${value}%, transparent ${value}%)`,
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
}
