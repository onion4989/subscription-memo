"use client";

import Link from "next/link";
import {
  FaArrowRightFromBracket,
  FaBook,
  FaCirclePlus,
  FaGear,
  FaListUl,
  FaPenToSquare,
  FaRegCircleUser,
  FaShieldHalved,
} from "react-icons/fa6";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/lib/routes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  expanded: boolean;
  pathname: string;
  userLabel: string;
};

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const SUBSCRIPTION_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.subscriptions,
    icon: <FaListUl aria-hidden="true" />,
    label: "サブスクリプション一覧",
  },
  {
    href: ROUTES.subscriptionsNew,
    icon: <FaCirclePlus aria-hidden="true" />,
    label: "サブスクリプション登録・変更",
  },
  {
    href: ROUTES.subscriptionsManage,
    icon: <FaPenToSquare aria-hidden="true" />,
    label: "サブスクリプション削除",
  },
  {
    href: ROUTES.guide,
    icon: <FaBook aria-hidden="true" />,
    label: "使い方",
  },
];

const SIDEBAR_TOOLTIP_CONTENT_CLASS =
  "border-0 bg-[#C9C9C9] text-black shadow-md";

const SIDEBAR_TOOLTIP_ARROW_CLASS = "bg-[#C9C9C9] fill-[#C9C9C9]";

function SidebarTooltipContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipContent
      side="right"
      sideOffset={8}
      className={SIDEBAR_TOOLTIP_CONTENT_CLASS}
      arrowClassName={SIDEBAR_TOOLTIP_ARROW_CLASS}
    >
      {children}
    </TooltipContent>
  );
}

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === ROUTES.subscriptions) {
    return pathname === ROUTES.subscriptions;
  }

  return pathname === href;
}

type SidebarLinkProps = NavItem & {
  expanded: boolean;
  pathname: string;
};

function SidebarLink({ href, icon, label, pathname, expanded }: SidebarLinkProps) {
  const isActive = isNavItemActive(pathname, href);
  const linkClassName = cn(
    "flex h-9 items-center rounded-md text-sm text-slate-800 transition-colors hover:bg-slate-200",
    expanded ? "justify-start gap-2 px-2" : "justify-center px-0",
    isActive && "bg-slate-200 font-medium"
  );
  const content = (
    <Link href={href} className={linkClassName} aria-label={label}>
      <span className="text-sm text-slate-700">{icon}</span>
      {expanded ? <span className="whitespace-nowrap">{label}</span> : null}
    </Link>
  );

  if (expanded) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <SidebarTooltipContent>{label}</SidebarTooltipContent>
    </Tooltip>
  );
}

type SidebarItemProps = {
  expanded: boolean;
  icon: React.ReactNode;
  label: string;
};

function SidebarItem({ icon, label, expanded }: SidebarItemProps) {
  const content = (
    <div
      className={cn(
        "flex h-9 items-center rounded-md text-sm text-slate-800",
        expanded ? "justify-start gap-2 px-2" : "justify-center px-0"
      )}
      aria-label={label}
    >
      <span className="text-sm text-slate-700">{icon}</span>
      {expanded ? <span className="whitespace-nowrap">{label}</span> : null}
    </div>
  );

  if (expanded) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <SidebarTooltipContent>{label}</SidebarTooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({ userLabel, pathname, expanded }: AppSidebarProps) {
  const signOutButton = (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: ROUTES.login })}
      className={cn(
        "flex h-9 w-full cursor-pointer items-center rounded-md text-sm text-slate-800 transition-colors hover:bg-slate-200",
        expanded ? "justify-start gap-2 px-2" : "justify-center px-0"
      )}
      aria-label="ログアウト"
    >
      <span className="text-sm text-slate-700">
        <FaArrowRightFromBracket aria-hidden="true" />
      </span>
      {expanded ? <span className="whitespace-nowrap">ログアウト</span> : null}
    </button>
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col rounded-lg bg-white/90 py-4 transition-[width,padding] duration-300 ease-in-out",
          expanded ? "w-[250px] px-3" : "w-[50px] px-1"
        )}
      >
        <nav
          className={cn("flex flex-col gap-2", !expanded && "items-center")}
          aria-label="サブスクリプション管理"
        >
          {SUBSCRIPTION_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              pathname={pathname}
              expanded={expanded}
              {...item}
            />
          ))}
        </nav>

        <div className={cn("mt-auto flex flex-col gap-2", !expanded && "items-center")}>
          <SidebarItem
            expanded={expanded}
            icon={<FaRegCircleUser aria-hidden="true" />}
            label={userLabel}
          />
          <SidebarItem
            expanded={expanded}
            icon={<FaGear aria-hidden="true" />}
            label="アカウント"
          />
          <SidebarItem
            expanded={expanded}
            icon={<FaShieldHalved aria-hidden="true" />}
            label="セキュリティ"
          />
          {expanded ? (
            signOutButton
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>{signOutButton}</TooltipTrigger>
              <SidebarTooltipContent>ログアウト</SidebarTooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
