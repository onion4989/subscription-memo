"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/features/subscription/AppSidebar";
import { SidebarToggleIcon } from "@/components/features/subscription/SidebarToggleIcon";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  displayName: string;
  avatarId: number | null;
};

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.subscriptions]: "サブスクリプション一覧",
  [ROUTES.subscriptionsNew]: "サブスクリプション登録・変更",
  [ROUTES.subscriptionsManage]: "サブスクリプション削除",
  [ROUTES.guide]: "使い方",
  [ROUTES.account]: "アカウント",
  [ROUTES.settings]: "各種設定",
};

const MOBILE_SIDEBAR_MEDIA_QUERY = "(max-width: 767px)";
const MOBILE_SIDEBAR_BACKDROP_CLASS =
  "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out md:hidden";
const MOBILE_SIDEBAR_DRAWER_CLASS =
  "fixed inset-y-[10px] left-[10px] z-50 w-[250px] transition-transform duration-300 ease-in-out will-change-transform md:hidden";
/** シェル padding (10px) 分も含めて画面外へ退避 */
const MOBILE_SIDEBAR_CLOSED_TRANSLATE_CLASS =
  "-translate-x-[calc(100%+10px)]";

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "";
}

function isMobileSidebarViewport(): boolean {
  return window.matchMedia(MOBILE_SIDEBAR_MEDIA_QUERY).matches;
}

export function AppShell({ children, displayName, avatarId }: AppShellProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  const closeMobileSidebar = () => {
    if (isMobileSidebarViewport()) {
      setExpanded(false);
    }
  };

  useEffect(() => {
    if (isMobileSidebarViewport()) {
      setExpanded(false);
    }
  }, [pathname]);

  const sidebarProps = {
    pathname,
    displayName,
    avatarId,
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 p-[10px]">
      <button
        type="button"
        aria-label="メニューを閉じる"
        aria-hidden={!expanded}
        tabIndex={expanded ? 0 : -1}
        onClick={() => setExpanded(false)}
        className={cn(
          MOBILE_SIDEBAR_BACKDROP_CLASS,
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
        className={cn(
          MOBILE_SIDEBAR_DRAWER_CLASS,
          expanded
            ? "translate-x-0"
            : cn("pointer-events-none", MOBILE_SIDEBAR_CLOSED_TRANSLATE_CLASS)
        )}
      >
        <AppSidebar
          {...sidebarProps}
          expanded
          onNavigate={closeMobileSidebar}
        />
      </div>

      <div className="flex min-h-[calc(100vh-20px)] w-full min-w-0 md:gap-4">
        <div className="hidden h-full shrink-0 md:block">
          <AppSidebar {...sidebarProps} expanded={expanded} />
        </div>

        <section className="flex min-w-0 w-full max-w-[1000px] flex-1 flex-col">
          <div className="mb-4 max-md:mt-4 flex h-10 items-center gap-3 text-white">
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

          <div className="min-w-0 flex-1 overflow-x-hidden rounded-lg pt-4 pr-4 pb-4 md:pt-6 md:pr-6 md:pb-6">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
