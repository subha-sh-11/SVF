"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeControls from "./ThemeControls";

const NAV = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
    ),
  },
  {
    href: "/admin/theatres",
    label: "Theatres",
    icon: (
      <path d="M4 4h16v4H4V4Zm0 6h16v10H4V10Zm3 3v4m5-4v4m5-4v4" />
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 flex h-screen w-60 shrink-0 flex-col text-neutral-300"
      style={{ backgroundColor: "#17251a" }}
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <span
          className="grid h-9 w-9 place-items-center rounded-md text-sm font-bold tracking-tight text-white"
          style={{ backgroundColor: "#417e37" }}
        >
          SVF
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Distribution</p>
          <p className="text-[11px] text-neutral-500">Nizam Territory</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/[0.10] font-medium text-white"
                  : "text-neutral-200 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-white/[0.06] p-4">
        <ThemeControls />
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
            AD
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium text-white">Admin</p>
            <p className="text-[11px] text-neutral-500">admin@svf</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
