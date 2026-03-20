"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export type SkillTabItem = {
  id: string;
  label: string;
  href?: Route;
};

type SkillTabsProps = {
  items: readonly SkillTabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  tabTestIdPrefix: string;
  mobileSelectLabel?: string;
  mobileSelectTestId?: string;
  collapseToSelectOnMobile?: boolean;
};

function getTabClass(active: boolean) {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-3 font-bold no-underline transition-[background-color,color,box-shadow] duration-150 ease-out ${
    active
      ? "bg-white/14 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
      : "bg-white/6 text-white/72 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-white/10 hover:text-white"
  }`;
}

export function SkillTabs({
  items,
  activeId,
  onChange,
  tabTestIdPrefix,
  mobileSelectLabel,
  mobileSelectTestId,
  collapseToSelectOnMobile = true,
}: SkillTabsProps) {
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
    <div className="mb-4 sm:mb-8">
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

      <ul
        className={`flex flex-wrap justify-center gap-2 text-left ${
          collapseToSelectOnMobile ? "hidden sm:flex" : ""
        }`}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const testId = `${tabTestIdPrefix}-${item.id}`;
          const className = getTabClass(active);

          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  data-testid={testId}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  data-testid={testId}
                  onClick={() => onChange?.(item.id)}
                  className={className}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
