import { describe, expect, it } from "vitest";
import {
  profileFieldErrorsFromZod,
  profileUpdateSchema,
  toProfileFormValues,
} from "@/schemas/profile";

const base = {
  name: "太郎",
  email: "user@example.com",
  phoneNumber: "09011112222",
  avatarId: 1,
  currentPassword: "",
  newPassword: "",
  emailEditable: true,
  hasPassword: true,
};

describe("profileUpdateSchema (P1–P5)", () => {
  it("accepts valid profile data without password change", () => {
    expect(profileUpdateSchema.safeParse(base).success).toBe(true);
  });

  it("validates phone as empty or 0-prefixed 11 digits", () => {
    expect(
      profileUpdateSchema.safeParse({ ...base, phoneNumber: "" }).success
    ).toBe(true);
    expect(
      profileUpdateSchema.safeParse({ ...base, phoneNumber: "0901111222" })
        .success
    ).toBe(false);
  });

  it("requires both passwords when changing password", () => {
    const onlyCurrent = profileUpdateSchema.safeParse({
      ...base,
      currentPassword: "oldpass12",
      newPassword: "",
    });
    expect(onlyCurrent.success).toBe(false);

    const onlyNew = profileUpdateSchema.safeParse({
      ...base,
      currentPassword: "",
      newPassword: "newpass12",
    });
    expect(onlyNew.success).toBe(false);
  });

  it("enforces new password length 8–128", () => {
    expect(
      profileUpdateSchema.safeParse({
        ...base,
        currentPassword: "oldpass12",
        newPassword: "short",
      }).success
    ).toBe(false);

    expect(
      profileUpdateSchema.safeParse({
        ...base,
        currentPassword: "oldpass12",
        newPassword: "a".repeat(129),
      }).success
    ).toBe(false);

    expect(
      profileUpdateSchema.safeParse({
        ...base,
        currentPassword: "oldpass12",
        newPassword: "newpass12",
      }).success
    ).toBe(true);
  });

  it("rejects password change when hasPassword is false", () => {
    const result = profileUpdateSchema.safeParse({
      ...base,
      hasPassword: false,
      currentPassword: "oldpass12",
      newPassword: "newpass12",
    });
    expect(result.success).toBe(false);
  });
});

describe("profile helpers (P6)", () => {
  it("builds form values and maps Zod errors", () => {
    const values = toProfileFormValues({
      name: "  花子  ",
      email: "user@example.com",
      phoneNumber: null,
      avatarId: 2,
      emailReadonly: true,
      hasPassword: false,
    });
    expect(values.name).toBe("花子");
    expect(values.phoneNumber).toBe("");
    expect(values.phoneReadonly).toBe(true);

    const parsed = profileUpdateSchema.safeParse({ ...base, name: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(profileFieldErrorsFromZod(parsed.error).name).toBeTruthy();
    }
  });
});
