"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Integrations", href: "/" },
  { name: "Actions", href: "/actions" },
  { name: "Sync", href: "/sync" },
];

export function TabNavigation() {
  const pathname = usePathname();

  return (
    <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
      <nav className="-mb-px flex gap-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
