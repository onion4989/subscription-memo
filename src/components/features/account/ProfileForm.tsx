"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/lib/actions/update-profile";
import {
  AVATAR_IDS,
  avatarImagePath,
  type AvatarId,
} from "@/lib/user/avatar";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  FORM_FIELD_HINT_CLASS,
  FORM_FIELD_LABEL_CLASS,
  FORM_PANEL_CLASS,
  FORM_SAVE_BUTTON_CLASS,
} from "@/components/features/app-form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileFormValues } from "@/schemas/profile";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "border-white/30 bg-white text-slate-900 placeholder:text-slate-500";

type ProfileFormProps = {
  initialValues: ProfileFormValues;
};

const initialState: UpdateProfileState = {
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

function getEffectiveValues(
  initialValues: ProfileFormValues,
  viewState: UpdateProfileState
): ProfileFormValues {
  return viewState.values ?? initialValues;
}

function getSelectedAvatarId(values: ProfileFormValues): AvatarId {
  if (values.avatarId && AVATAR_IDS.includes(values.avatarId as AvatarId)) {
    return values.avatarId as AvatarId;
  }

  return 1;
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );
  const hydrated = useHydrated();
  const viewState = hydrated ? state : initialState;
  const isPending = hydrated && pending;
  const values = getEffectiveValues(initialValues, viewState);
  const selectedAvatarId = getSelectedAvatarId(values);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className={FORM_PANEL_CLASS}>
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <Label htmlFor="name" className={FORM_FIELD_LABEL_CLASS}>
              ニックネーム / 15文字以内
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              maxLength={15}
              defaultValue={values.name}
              aria-invalid={viewState.fieldErrors?.name ? true : undefined}
              className={INPUT_CLASS}
            />
            <FieldError message={viewState.fieldErrors?.name} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className={FORM_FIELD_LABEL_CLASS}>
              メールアドレス / ＠必須の半角英数字
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={values.email}
              readOnly={values.emailReadonly}
              disabled={values.emailReadonly}
              aria-invalid={viewState.fieldErrors?.email ? true : undefined}
              className={cn(
                INPUT_CLASS,
                values.emailReadonly && "cursor-not-allowed opacity-70"
              )}
            />
            <FieldError message={viewState.fieldErrors?.email} />
            <p className={FORM_FIELD_HINT_CLASS}>
              Google / GitHubなどでログインした場合は、それぞれ登録されているメールアドレスとなるため、変更することができません。
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber" className={FORM_FIELD_LABEL_CLASS}>
              電話番号 / 半角数字のみ
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="09011112222"
              defaultValue={values.phoneNumber}
              readOnly={values.phoneReadonly}
              disabled={values.phoneReadonly}
              aria-invalid={viewState.fieldErrors?.phoneNumber ? true : undefined}
              className={cn(
                INPUT_CLASS,
                values.phoneReadonly && "cursor-not-allowed opacity-70"
              )}
            />
            <FieldError message={viewState.fieldErrors?.phoneNumber} />
            <p className={FORM_FIELD_HINT_CLASS}>
              {values.phoneReadonly
                ? "ショートメッセージでのお知らせは現在ご利用いただけません。"
                : "電話番号を設定しておくと、各種設定の「電話のショートメッセージに送信する」を選択している場合にお知らせを受け取ることができます。"}
            </p>
          </div>

          {values.hasPassword ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className={FORM_FIELD_LABEL_CLASS}>
                  現在のパスワード
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={
                    viewState.fieldErrors?.currentPassword ? true : undefined
                  }
                  className={INPUT_CLASS}
                />
                <FieldError message={viewState.fieldErrors?.currentPassword} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword" className={FORM_FIELD_LABEL_CLASS}>
                  新しいパスワード / 8文字以上の英数字や記号
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={
                    viewState.fieldErrors?.newPassword ? true : undefined
                  }
                  className={INPUT_CLASS}
                />
                <FieldError message={viewState.fieldErrors?.newPassword} />
              </div>
            </>
          ) : null}

          <fieldset className="space-y-2">
            <legend className={FORM_FIELD_LABEL_CLASS}>アバター</legend>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_IDS.map((avatarId) => (
                <label
                  key={avatarId}
                  className="cursor-pointer"
                  aria-label={`アバター ${avatarId}`}
                >
                  <input
                    type="radio"
                    name="avatarId"
                    value={avatarId}
                    defaultChecked={selectedAvatarId === avatarId}
                    className="peer sr-only"
                  />
                  <Image
                    src={avatarImagePath(avatarId)}
                    alt=""
                    width={50}
                    height={50}
                    className="size-[50px] rounded-full object-cover ring-2 ring-transparent transition-shadow peer-checked:ring-white peer-focus-visible:ring-white"
                  />
                </label>
              ))}
            </div>
            <FieldError message={viewState.fieldErrors?.avatarId} />
          </fieldset>

          <FieldError message={viewState.fieldErrors?.form} />

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
  );
}
