"use client";

import { useActionState } from "react";
import {
  updateNotificationSettings,
  type UpdateNotificationSettingsState,
} from "@/lib/actions/notification-settings";
import { MfaDisableDialog } from "@/components/features/settings/MfaDisableDialog";
import { MfaSettingsDialog } from "@/components/features/settings/MfaSettingsDialog";
import {
  NOTIFY_CHANNEL_OPTIONS,
  NOTIFY_LEAD_DAYS_OPTIONS,
  SMS_NOTIFICATION_DISABLED_HINT,
  SMS_NOTIFICATION_UI_ENABLED,
} from "@/lib/renewal-notification/constants";
import {
  FORM_FIELD_HINT_CLASS,
  FORM_FIELD_LABEL_CLASS,
  FORM_PANEL_CLASS,
  FORM_SAVE_BUTTON_CLASS,
} from "@/components/features/app-form-styles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useHydrated } from "@/hooks/use-hydrated";
import type { NotificationSettingsFormValues } from "@/schemas/notification-settings";
import { cn } from "@/lib/utils";

const RADIO_ROW_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-colors has-[:checked]:border-white has-[:checked]:bg-white/25";

const RADIO_INDICATOR_CLASS =
  "relative size-4 shrink-0 rounded-full border-2 border-white after:absolute after:inset-0 after:m-auto after:size-2 after:rounded-full after:bg-white after:opacity-0 after:content-[''] peer-checked:after:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-white/50";

type RadioOptionRowProps = {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
};

function RadioOptionRow({
  name,
  value,
  label,
  defaultChecked,
  disabled = false,
}: RadioOptionRowProps) {
  return (
    <label
      className={cn(
        RADIO_ROW_CLASS,
        disabled &&
          "cursor-not-allowed opacity-60 has-[:checked]:border-white/20 has-[:checked]:bg-white/10"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span aria-hidden="true" className={RADIO_INDICATOR_CLASS} />
      <span>{label}</span>
    </label>
  );
}

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

  return (
    <p className="text-xs text-red-300" role="alert">
      {message}
    </p>
  );
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
  const showSmsChannelInactiveWarning =
    !SMS_NOTIFICATION_UI_ENABLED && initialValues.notifyChannel === "SMS";

  return (
    <div className="flex w-full flex-col gap-6 text-white">
      <form action={formAction} className="flex flex-col gap-6">
        <div className={FORM_PANEL_CLASS}>
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold">お知らせ設定</h2>
              <p className={cn("mt-1", FORM_FIELD_HINT_CLASS)}>
                更新日の何日前にお知らせするか、送信方法を選べます。サブスクごとの
                ON/OFF は登録・変更画面で設定します。
              </p>
            </div>

            <fieldset className="space-y-3">
              <legend
                className={cn("mb-2 text-sm font-medium", FORM_FIELD_LABEL_CLASS)}
              >
                お知らせのタイミング
              </legend>
              {NOTIFY_LEAD_DAYS_OPTIONS.map((option) => (
                <RadioOptionRow
                  key={option.value}
                  name="notifyLeadDays"
                  value={option.value}
                  label={option.label}
                  defaultChecked={
                    initialValues.notifyLeadDays === option.value
                  }
                />
              ))}
              <FieldError message={viewState.fieldErrors?.notifyLeadDays} />
            </fieldset>

            <fieldset className="space-y-3">
              <legend
                className={cn("mb-2 text-sm font-medium", FORM_FIELD_LABEL_CLASS)}
              >
                送信方法（どちらか一方）
              </legend>
              {NOTIFY_CHANNEL_OPTIONS.map((option) => (
                <RadioOptionRow
                  key={option.value}
                  name="notifyChannel"
                  value={option.value}
                  label={option.label}
                  defaultChecked={
                    initialValues.notifyChannel === option.value
                  }
                  disabled={
                    !SMS_NOTIFICATION_UI_ENABLED && option.value === "SMS"
                  }
                />
              ))}
              <FieldError message={viewState.fieldErrors?.notifyChannel} />
              {!SMS_NOTIFICATION_UI_ENABLED ? (
                <p className={FORM_FIELD_HINT_CLASS}>
                  {SMS_NOTIFICATION_DISABLED_HINT}
                </p>
              ) : null}
              {showEmailUnverifiedWarning ? (
                <p className="text-sm text-amber-200">
                  メール未確認のため送信できません。確認メールのリンクを開いてからご利用ください。
                </p>
              ) : null}
              {showSmsChannelInactiveWarning ? (
                <p className="text-sm text-amber-200">
                  現在ショートメッセージは送信されません。メールへの変更をご検討ください。
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
                <Label
                  htmlFor="notify-delivery-paused"
                  className={FORM_FIELD_LABEL_CLASS}
                >
                  お知らせをすべて停止する
                </Label>
                <p className={FORM_FIELD_HINT_CLASS}>
                  オンにすると、お知らせ ON のサブスクも含めすべて停止します。
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className={FORM_SAVE_BUTTON_CLASS}
              >
                {isPending ? "保存中..." : "保存"}
              </Button>
            </div>
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
      </form>

      <section className={FORM_PANEL_CLASS}>
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold">二段階認証（MFA）</h2>
            <p className={cn("mt-1", FORM_FIELD_HINT_CLASS)}>
              {totpEnabled
                ? "二段階認証は有効です。ログイン時に認証アプリの 6 桁コードが必要です。"
                : "メールとパスワードに加え、認証アプリ（Google Authenticator 等）でログインを保護できます。設定は任意です。"}
            </p>
          </div>

          <div className="flex flex-wrap justify-start gap-3">
            <MfaSettingsDialog totpEnabled={totpEnabled} />
            {totpEnabled ? <MfaDisableDialog /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
