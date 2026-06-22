"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/features/subscription/AppSidebar";
import { SidebarToggleIcon } from "@/components/features/subscription/SidebarToggleIcon";
import { ROUTES } from "@/lib/routes";

type AppShellProps = {
  children: React.ReactNode;
  userLabel: string;
};

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.subscriptions]: "サブスクリプション一覧",
  [ROUTES.subscriptionsNew]: "サブスクリプション登録・変更",
  [ROUTES.subscriptionsManage]: "サブスクリプション削除",
  [ROUTES.guide]: "使い方",
};

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "";
}

export function AppShell({ children, userLabel }: AppShellProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <div className="flex min-h-screen w-full min-w-0 p-[10px]">
      <div className="flex min-h-[calc(100vh-20px)] w-full min-w-0 gap-4">
        <AppSidebar pathname={pathname} userLabel={userLabel} expanded={expanded} />

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 flex h-10 items-center gap-3 text-white">
            <button
              type="button"
              aria-label={expanded ? "メニューを折りたたむ" : "メニューを展開する"}
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity hover:opacity-80"
            >
              <SidebarToggleIcon />
            </button>
            <span
              className="h-6 w-px shrink-0 bg-white/40"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-white">{pageTitle}</p>
          </div>

          <div className="min-w-0 flex-1 overflow-x-hidden rounded-lg p-4 md:p-6">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
