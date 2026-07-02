import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

export const SUBSCRIPTION_TABLE_SECTION_INNER_CLASS =
  "mx-auto flex w-max flex-col items-start gap-4";

type SubscriptionTableSectionProps = {
  children: React.ReactNode;
  description?: React.ReactNode;
};

export function SubscriptionTableSection({
  children,
  description,
}: SubscriptionTableSectionProps) {
  return (
    <div className={APP_SCROLLBAR_X_CLASS}>
      <div className={SUBSCRIPTION_TABLE_SECTION_INNER_CLASS}>
        {description}
        {children}
      </div>
    </div>
  );
}
