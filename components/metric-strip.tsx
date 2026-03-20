import {
  PlayerListHeaderLabel,
} from "@/components/player-list-header-label";
import type { MetricColumn, PlayerMetricKey } from "@/lib/types";

type MetricLegendProps = {
  columns: readonly MetricColumn[];
  activeKey?: PlayerMetricKey | null;
  onColumnClick?: (key: PlayerMetricKey) => void;
};

type MetricStripProps = {
  columns: readonly MetricColumn[];
  getValue: (key: PlayerMetricKey) => number;
  className?: string;
};

function MetricBar({
  metricKey,
  tooltip,
  value,
  grow,
}: {
  metricKey: PlayerMetricKey;
  tooltip: string;
  value: number;
  grow: number;
}) {
  return (
    <div
      data-metric-key={metricKey}
      aria-label={`${tooltip}: ${value}`}
      title={tooltip}
      className="min-w-0 border-[3px] border-white bg-white/25 px-1 py-2 text-center text-[12px] font-bold tabular-nums text-[#222]"
      style={{
        flexBasis: 0,
        flexGrow: grow,
        backgroundImage: `linear-gradient(to right, var(--pink) 0%, var(--pink) ${value}%, transparent ${value}%)`,
      }}
    >
      {value}
    </div>
  );
}

export function MetricLegend({
  columns,
  activeKey = null,
  onColumnClick,
}: MetricLegendProps) {
  return (
    <div className="ml-3 flex min-w-0 gap-1.5 md:ml-4 md:gap-2">
      {columns.map((column) => (
        <div
          key={column.key}
          className="min-w-0 border-x-[3px] border-x-transparent px-1 text-[12px] md:text-[14px]"
          style={{ flexBasis: 0, flexGrow: column.weight }}
        >
          <PlayerListHeaderLabel
            label={column.label}
            tooltip={column.tooltip}
            onClick={onColumnClick ? () => onColumnClick(column.key) : undefined}
            active={activeKey === column.key}
            className="-ml-1"
          />
        </div>
      ))}
    </div>
  );
}

export function MetricStrip({ columns, getValue, className = "" }: MetricStripProps) {
  return (
    <div className={`flex min-w-0 gap-1.5 sm:gap-2 ${className}`}>
      {columns.map((column) => {
        const value = getValue(column.key);

        return (
          <MetricBar
            key={column.key}
            metricKey={column.key}
              tooltip={column.tooltip}
              value={value}
              grow={column.weight}
          />
        );
      })}
    </div>
  );
}
