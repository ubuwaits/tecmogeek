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
};

export function SelectionTabs({
  items,
  activeId,
  onChange,
  tabTestIdPrefix,
  mobileSelectLabel,
  mobileSelectTestId,
  collapseToSelectOnMobile = true,
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
              className="min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 pr-11 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[background-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id} className="text-black">
                  {item.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
          </div>
        </label>
      ) : null}

      <div className={cn(collapseToSelectOnMobile && "hidden sm:block")}>
        <Tabs value={activeId} onValueChange={handleSelect}>
          <TabsList variant="line" className="flex flex-wrap gap-x-5 gap-y-2 text-left">
            {items.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                data-testid={`${tabTestIdPrefix}-${item.id}`}
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
