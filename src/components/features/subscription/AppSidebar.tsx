"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRightFromBracket,
  FaBook,
  FaCirclePlus,
  FaGear,
  FaListUl,
  FaPenToSquare,
} from "react-icons/fa6";
import { GoPerson } from "react-icons/go";
import { IoPersonCircle } from "react-icons/io5";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/lib/routes";
import { avatarImagePath, isAvatarId } from "@/lib/user/avatar";
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
  displayName: string;
  avatarId: number | null;
  onNavigate?: () => void;
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
    label: "サブスク一覧",
  },
  {
    href: ROUTES.subscriptionsNew,
    icon: <FaCirclePlus aria-hidden="true" />,
    label: "サブスク登録・変更",
  },
  {
    href: ROUTES.subscriptionsManage,
    icon: <FaPenToSquare aria-hidden="true" />,
    label: "サブスク削除",
  },
  {
    href: ROUTES.guide,
    icon: <FaBook aria-hidden="true" />,
    label: "使い方",
  },
];

/** Portal 先ではテーマ CSS 変数が届かないため、視認できる固定色を使う */
const SIDEBAR_TOOLTIP_CONTENT_CLASS =
  "border-0 bg-[#C9C9C9] text-black shadow-md";

const SIDEBAR_TOOLTIP_ARROW_CLASS = "bg-[#C9C9C9] fill-[#C9C9C9]";

const SIDEBAR_ITEM_TEXT_CLASS =
  "text-sm text-[color:var(--app-sidebar-fg)]";

const SIDEBAR_ICON_CLASS =
  "text-sm text-[color:var(--app-sidebar-muted-fg)]";

const SIDEBAR_INTERACTIVE_CLASS =
  "rounded-md text-sm text-[color:var(--app-sidebar-fg)] transition-colors hover:bg-[var(--app-sidebar-hover)]";

const SIDEBAR_ACTIVE_CLASS = "bg-[var(--app-sidebar-active)] font-medium";

/** 折りたたみ時の選択面を正方形に近いレクタングルにする */
const SIDEBAR_COLLAPSED_HIT_CLASS = "size-9 shrink-0 justify-center px-0";

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
  onNavigate?: () => void;
};

function SidebarLink({
  href,
  icon,
  label,
  pathname,
  expanded,
  onNavigate,
}: SidebarLinkProps) {
  const isActive = isNavItemActive(pathname, href);
  const linkClassName = cn(
    "flex items-center",
    SIDEBAR_INTERACTIVE_CLASS,
    expanded
      ? "h-9 w-full justify-start gap-2 px-2"
      : SIDEBAR_COLLAPSED_HIT_CLASS,
    isActive && SIDEBAR_ACTIVE_CLASS
  );
  const content = (
    <Link
      href={href}
      className={linkClassName}
      aria-label={label}
      onClick={onNavigate}
    >
      <span className={SIDEBAR_ICON_CLASS}>{icon}</span>
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
        "flex items-center",
        SIDEBAR_ITEM_TEXT_CLASS,
        expanded
          ? "h-[46px] w-full justify-start gap-2 px-2"
          : "size-[46px] shrink-0 justify-center px-0"
      )}
      aria-label={label}
    >
      <span className={SIDEBAR_ICON_CLASS}>{icon}</span>
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

function UserAvatarIcon({ avatarId }: { avatarId: number | null }) {
  if (avatarId && isAvatarId(avatarId)) {
    return (
      <Image
        src={avatarImagePath(avatarId)}
        alt=""
        width={46}
        height={46}
        className="size-[46px] shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-black text-white"
      aria-hidden="true"
    >
      <GoPerson className="size-5" />
    </span>
  );
}

export function AppSidebar({
  displayName,
  avatarId,
  pathname,
  expanded,
  onNavigate,
}: AppSidebarProps) {
  const signOutButton = (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: ROUTES.login })}
      className={cn(
        "flex cursor-pointer items-center",
        SIDEBAR_INTERACTIVE_CLASS,
        expanded
          ? "h-9 w-full justify-start gap-2 px-2"
          : SIDEBAR_COLLAPSED_HIT_CLASS
      )}
      aria-label="ログアウト"
    >
      <span className={SIDEBAR_ICON_CLASS}>
        <FaArrowRightFromBracket aria-hidden="true" />
      </span>
      {expanded ? <span className="whitespace-nowrap">ログアウト</span> : null}
    </button>
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col rounded-lg bg-[var(--app-sidebar-bg)] py-4 text-[color:var(--app-sidebar-fg)] transition-[width,padding] duration-300 ease-in-out",
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
              onNavigate={onNavigate}
              {...item}
            />
          ))}
        </nav>

        <div className={cn("mt-auto flex flex-col gap-2", !expanded && "items-center")}>
          <SidebarItem
            expanded={expanded}
            icon={<UserAvatarIcon avatarId={avatarId} />}
            label={displayName}
          />
          <SidebarLink
            href={ROUTES.account}
            pathname={pathname}
            expanded={expanded}
            onNavigate={onNavigate}
            icon={<IoPersonCircle aria-hidden="true" className="size-4" />}
            label="アカウント"
          />
          <SidebarLink
            href={ROUTES.settings}
            pathname={pathname}
            expanded={expanded}
            onNavigate={onNavigate}
            icon={<FaGear aria-hidden="true" />}
            label="各種設定"
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
