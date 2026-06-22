import { cn } from "@/lib/utils";

type SidebarToggleIconProps = {
  className?: string;
};

export function SidebarToggleIcon({ className }: SidebarToggleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
    </svg>
  );
}
