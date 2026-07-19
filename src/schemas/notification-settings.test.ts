import { afterEach, describe, expect, it, vi } from "vitest";
import {
  notificationSettingsFieldErrorsFromZod,
  notificationSettingsSchema,
  toNotificationSettingsFormValues,
} from "@/schemas/notification-settings";
import { resolveNotifyChannelUpdate } from "@/lib/renewal-notification/resolve-notify-channel-update";

describe("notificationSettingsSchema (N1)", () => {
  it("parses enums and maps notifyDeliveryPaused checkbox", () => {
    const withPause = notificationSettingsSchema.safeParse({
      notifyLeadDays: "THREE_DAYS",
      notifyChannel: "EMAIL",
      notifyDeliveryPaused: "on",
    });
    expect(withPause.success).toBe(true);
    if (withPause.success) {
      expect(withPause.data.notifyDeliveryPaused).toBe(true);
    }

    const withoutPause = notificationSettingsSchema.safeParse({
      notifyLeadDays: "SEVEN_DAYS",
      notifyChannel: "SMS",
    });
    expect(withoutPause.success).toBe(true);
    if (withoutPause.success) {
      expect(withoutPause.data.notifyDeliveryPaused).toBe(false);
    }
  });

  it("maps Zod field errors", () => {
    const parsed = notificationSettingsSchema.safeParse({
      notifyLeadDays: "INVALID",
      notifyChannel: "EMAIL",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        notificationSettingsFieldErrorsFromZod(parsed.error).notifyLeadDays
      ).toBeTruthy();
    }
  });

  it("builds form values", () => {
    expect(
      toNotificationSettingsFormValues({
        notifyLeadDays: "FIVE_DAYS",
        notifyChannel: "EMAIL",
        notifyDeliveryPaused: true,
      })
    ).toEqual({
      notifyLeadDays: "FIVE_DAYS",
      notifyChannel: "EMAIL",
      notifyDeliveryPaused: true,
    });
  });
});

describe("resolveNotifyChannelUpdate (N2–N3)", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/lib/renewal-notification/constants");
  });

  it("with SMS UI disabled: keeps existing SMS and rejects new SMS", async () => {
    // SMS_NOTIFICATION_UI_ENABLED is currently false in source.
    expect(
      resolveNotifyChannelUpdate({
        submittedChannel: "SMS",
        currentChannel: "EMAIL",
      })
    ).toEqual({
      ok: false,
      error: "ショートメッセージでのお知らせは現在ご利用いただけません。",
    });

    expect(
      resolveNotifyChannelUpdate({
        submittedChannel: null,
        currentChannel: "SMS",
      })
    ).toEqual({ ok: true, notifyChannel: "SMS" });

    expect(
      resolveNotifyChannelUpdate({
        submittedChannel: "EMAIL",
        currentChannel: "SMS",
      })
    ).toEqual({ ok: true, notifyChannel: "EMAIL" });
  });

  it("with SMS UI enabled: accepts EMAIL and SMS", async () => {
    vi.doMock("@/lib/renewal-notification/constants", async (importOriginal) => {
      const actual =
        await importOriginal<
          typeof import("@/lib/renewal-notification/constants")
        >();
      return {
        ...actual,
        SMS_NOTIFICATION_UI_ENABLED: true,
      };
    });

    const { resolveNotifyChannelUpdate: resolveEnabled } = await import(
      "@/lib/renewal-notification/resolve-notify-channel-update"
    );

    expect(
      resolveEnabled({
        submittedChannel: "SMS",
        currentChannel: "EMAIL",
      })
    ).toEqual({ ok: true, notifyChannel: "SMS" });

    expect(
      resolveEnabled({
        submittedChannel: "EMAIL",
        currentChannel: "SMS",
      })
    ).toEqual({ ok: true, notifyChannel: "EMAIL" });

    expect(
      resolveEnabled({
        submittedChannel: "",
        currentChannel: "EMAIL",
      }).ok
    ).toBe(false);
  });
});
