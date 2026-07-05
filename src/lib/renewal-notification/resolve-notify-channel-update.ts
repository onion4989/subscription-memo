import type { NotifyChannel } from "@prisma/client";
import { SMS_NOTIFICATION_UI_ENABLED } from "@/lib/renewal-notification/constants";

type ResolveNotifyChannelUpdateParams = {
  submittedChannel: string | null;
  currentChannel: NotifyChannel;
};

type ResolveNotifyChannelUpdateResult =
  | { ok: true; notifyChannel: NotifyChannel }
  | { ok: false; error: string };

/**
 * SMS UI 無効時は DB の SMS 選択を維持しつつ、新規の SMS への変更だけ拒否する。
 * disabled なラジオは submit されないため、既存 SMS ユーザーは current を温存する。
 */
export function resolveNotifyChannelUpdate(
  params: ResolveNotifyChannelUpdateParams
): ResolveNotifyChannelUpdateResult {
  const submitted = params.submittedChannel?.trim() ?? "";

  if (SMS_NOTIFICATION_UI_ENABLED) {
    if (submitted !== "EMAIL" && submitted !== "SMS") {
      return { ok: false, error: "送信方法を選択してください。" };
    }

    return { ok: true, notifyChannel: submitted };
  }

  if (submitted === "SMS" && params.currentChannel !== "SMS") {
    return {
      ok: false,
      error: "ショートメッセージでのお知らせは現在ご利用いただけません。",
    };
  }

  if (params.currentChannel === "SMS" && submitted !== "EMAIL") {
    return { ok: true, notifyChannel: "SMS" };
  }

  if (submitted === "EMAIL") {
    return { ok: true, notifyChannel: "EMAIL" };
  }

  if (params.currentChannel === "EMAIL") {
    return { ok: true, notifyChannel: "EMAIL" };
  }

  return { ok: false, error: "送信方法を選択してください。" };
}
