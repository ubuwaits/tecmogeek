"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SelectionTabItem = {
  id: string;
  label: string;
  href?: Route;
};

type SelectionTabsProps = {
  items: readonly SelectionTabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  tabTestIdPrefix: string;
  mobileSelectLabel?: string;
  mobileSelectTestId?: string;
  collapseToSelectOnMobile?: boolean;
  lineTone?: "dark" | "light";
};

export function SelectionTabs({
  items,
  activeId,
  onChange,
  tabTestIdPrefix,
  mobileSelectLabel,
  mobileSelectTestId,
  collapseToSelectOnMobile = true,
  lineTone = "dark",
}: SelectionTabsProps) {
  const router = useRouter();

  function handleSelect(nextId: string) {
    const nextItem = items.find((item) => item.id === nextId);

    if (!nextItem) {
      return;
    }

    if (nextItem.href) {
      router.push(nextItem.href);
      return;
    }

    onChange?.(nextItem.id);
  }

  return (
    <div className="mb-3 sm:mb-4">
      {collapseToSelectOnMobile && mobileSelectLabel && mobileSelectTestId ? (
        <label className="block sm:hidden">
          <span className="sr-only">{mobileSelectLabel}</span>
          <div className="relative">
            <select
              data-testid={mobileSelectTestId}
              aria-label={mobileSelectLabel}
              value={activeId}
              onChange={(event) => handleSelect(event.target.value)}
              className={cn(
                "min-h-11 w-full cursor-pointer appearance-none rounded-xl px-4 py-3 pr-11 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none transition-[background-color,box-shadow,border-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2",
                lineTone === "dark"
                  ? "border border-white/15 bg-[#0f4faa]/60 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus-visible:ring-white/40"
                  : "border border-[#165ec9]/20 bg-white text-[#3a3a3a] shadow-[0_1px_0_rgba(22,94,201,0.08)] focus-visible:ring-[#165ec9]/30",
              )}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id} className="text-black">
                  {item.label}
                </option>
              ))}
            </select>
            <span
              className={cn(
                "pointer-events-none absolute right-4 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[6px] border-t-[6px] border-x-transparent",
                lineTone === "dark" ? "border-t-white" : "border-t-[#165ec9]",
              )}
            />
          </div>
        </label>
      ) : null}

      <div className={cn(collapseToSelectOnMobile && "hidden sm:block")}>
        <Tabs value={activeId} onValueChange={handleSelect}>
          <TabsList
            variant="line"
            className={cn(
              "flex flex-wrap gap-x-5 gap-y-2 text-left",
              lineTone === "light" && "!border-b-[#d5dfef] !text-[#6f7785]",
            )}
          >
            {items.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                data-testid={`${tabTestIdPrefix}-${item.id}`}
                className={cn(
                  lineTone === "light" &&
                    "!text-[#6f7785] hover:!text-[#3a3a3a] focus-visible:!ring-[#165ec9]/30 data-[state=active]:!border-[#165ec9] data-[state=active]:!text-[#165ec9]",
                )}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
