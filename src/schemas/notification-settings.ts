import * as z from "zod";

export const notificationSettingsSchema = z.object({
  notifyLeadDays: z.enum(["THREE_DAYS", "FIVE_DAYS", "SEVEN_DAYS"]),
  notifyChannel: z.enum(["EMAIL", "SMS"]),
  notifyDeliveryPaused: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>;

export type NotificationSettingsFormValues = {
  notifyLeadDays: "THREE_DAYS" | "FIVE_DAYS" | "SEVEN_DAYS";
  notifyChannel: "EMAIL" | "SMS";
  notifyDeliveryPaused: boolean;
};

export type NotificationSettingsFieldErrors = Partial<
  Record<"notifyLeadDays" | "notifyChannel" | "form", string>
>;

export function notificationSettingsFieldErrorsFromZod(
  error: z.ZodError<NotificationSettingsInput>
): NotificationSettingsFieldErrors {
  const { fieldErrors } = error.flatten();
  return {
    notifyLeadDays: fieldErrors.notifyLeadDays?.[0],
    notifyChannel: fieldErrors.notifyChannel?.[0],
  };
}

export function toNotificationSettingsFormValues(input: {
  notifyLeadDays: NotificationSettingsFormValues["notifyLeadDays"];
  notifyChannel: NotificationSettingsFormValues["notifyChannel"];
  notifyDeliveryPaused: boolean;
}): NotificationSettingsFormValues {
  return {
    notifyLeadDays: input.notifyLeadDays,
    notifyChannel: input.notifyChannel,
    notifyDeliveryPaused: input.notifyDeliveryPaused,
  };
}
