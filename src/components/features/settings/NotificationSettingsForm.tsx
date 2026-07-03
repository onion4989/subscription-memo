"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updateNotificationSettings,
  type UpdateNotificationSettingsState,
} from "@/lib/actions/notification-settings";
import {
  NOTIFY_CHANNEL_OPTIONS,
  NOTIFY_LEAD_DAYS_OPTIONS,
} from "@/lib/renewal-notification/constants";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useHydrated } from "@/hooks/use-hydrated";
import type { NotificationSettingsFormValues } from "@/schemas/notification-settings";
import { cn } from "@/lib/utils";

const FIELD_LABEL_CLASS = "text-white";
const FIELD_HINT_CLASS = "text-sm text-white/70";
const RADIO_ROW_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white";

type NotificationSettingsFormProps = {
  initialValues: NotificationSettingsFormValues;
  emailVerified: boolean;
  totpEnabled: boolean;
};

const initialState: UpdateNotificationSettingsState = {
  success: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-300">{message}</p>;
}

export function NotificationSettingsForm({
  initialValues,
  emailVerified,
  totpEnabled,
}: NotificationSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateNotificationSettings,
    initialState
  );
  const hydrated = useHydrated();
  const viewState = hydrated ? state : initialState;
  const isPending = hydrated && pending;

  const showEmailUnverifiedWarning =
    initialValues.notifyChannel === "EMAIL" && !emailVerified;

  return (
    <div className="flex w-full max-w-lg flex-col gap-8 text-white">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">お知らせ設定</h2>
          <p className={cn("mt-1", FIELD_HINT_CLASS)}>
            更新日の何日前にお知らせするか、送信方法を選べます。サブスクごとの ON/OFF
            は登録・変更画面で設定します。
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <fieldset className="space-y-3">
            <legend className={cn("mb-2 text-sm font-medium", FIELD_LABEL_CLASS)}>
              お知らせのタイミング
            </legend>
            {NOTIFY_LEAD_DAYS_OPTIONS.map((option) => (
              <label key={option.value} className={RADIO_ROW_CLASS}>
                <input
                  type="radio"
                  name="notifyLeadDays"
                  value={option.value}
                  defaultChecked={initialValues.notifyLeadDays === option.value}
                  className="accent-white"
                />
                <span>{option.label}</span>
              </label>
            ))}
            <FieldError message={viewState.fieldErrors?.notifyLeadDays} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className={cn("mb-2 text-sm font-medium", FIELD_LABEL_CLASS)}>
              送信方法（どちらか一方）
            </legend>
            {NOTIFY_CHANNEL_OPTIONS.map((option) => (
              <label key={option.value} className={RADIO_ROW_CLASS}>
                <input
                  type="radio"
                  name="notifyChannel"
                  value={option.value}
                  defaultChecked={initialValues.notifyChannel === option.value}
                  className="accent-white"
                />
                <span>{option.label}</span>
              </label>
            ))}
            <FieldError message={viewState.fieldErrors?.notifyChannel} />
            {showEmailUnverifiedWarning ? (
              <p className="text-sm text-amber-200">
                メール未確認のため送信できません。確認メールのリンクを開いてからご利用ください。
              </p>
            ) : null}
          </fieldset>

          <div className="flex items-start gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-3">
            <input
              id="notify-delivery-paused"
              name="notifyDeliveryPaused"
              type="checkbox"
              value="on"
              defaultChecked={initialValues.notifyDeliveryPaused}
              className="mt-1 size-4 shrink-0 accent-white"
              aria-label="お知らせをすべて停止する"
            />
            <div className="space-y-1">
              <Label htmlFor="notify-delivery-paused" className={FIELD_LABEL_CLASS}>
                お知らせをすべて停止する
              </Label>
              <p className={FIELD_HINT_CLASS}>
                オンにすると、お知らせ ON のサブスクも含めすべて停止します。
              </p>
            </div>
          </div>

          {viewState.message ? (
            <p
              className={cn(
                "text-sm",
                viewState.success ? "text-emerald-200" : "text-red-300"
              )}
              role={viewState.success ? "status" : "alert"}
            >
              {viewState.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="bg-white text-slate-900 hover:bg-white/90"
          >
            {isPending ? "保存中..." : "保存"}
          </Button>
        </form>
      </section>

      <section className="space-y-3 border-t border-white/20 pt-6">
        <h2 className="text-lg font-semibold">二段階認証（MFA）</h2>
        <p className={FIELD_HINT_CLASS}>
          {totpEnabled
            ? "二段階認証は有効です。設定の変更はこちらから行えます。"
            : "認証アプリによる二段階認証を設定できます。"}
        </p>
        <Button
          asChild
          variant="outline"
          className="border-white/30 bg-transparent text-white hover:bg-white/10"
        >
          <Link href={ROUTES.mfaSetup}>
            {totpEnabled ? "MFA 設定を開く" : "MFA を設定する"}
          </Link>
        </Button>
      </section>
    </div>
  );
}
