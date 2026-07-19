import { describe, expect, it } from "vitest";
import {
  NewPasswordSchema,
  RegisterShema,
  ResetSchema,
  loginFormSchema,
  signupFieldErrorsFromZod,
  signupSchema,
} from "@/schemas/index";

describe("signupSchema / loginFormSchema (AUTH1–AUTH2)", () => {
  it("accepts a valid email and password", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
    expect(loginFormSchema.safeParse(result.success ? result.data : {})
      .success).toBe(true);
  });

  it("rejects invalid email and short passwords", () => {
    expect(
      signupSchema.safeParse({ email: "", password: "password1" }).success
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        email: "not-an-email",
        password: "password1",
      }).success
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        email: "user@example.com",
        password: "short",
      }).success
    ).toBe(false);
  });

  it("maps Zod field errors", () => {
    const parsed = signupSchema.safeParse({ email: "", password: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = signupFieldErrorsFromZod(parsed.error);
      expect(errors.email).toBeTruthy();
      expect(errors.password).toBeTruthy();
    }
  });
});

describe("ResetSchema / NewPasswordSchema (AUTH3)", () => {
  it("validates reset email", () => {
    expect(ResetSchema.safeParse({ email: "user@example.com" }).success).toBe(
      true
    );
    expect(ResetSchema.safeParse({ email: "bad" }).success).toBe(false);
  });

  it("requires NewPasswordSchema password of at least 8 characters", () => {
    expect(NewPasswordSchema.safeParse({ password: "1234567" }).success).toBe(
      false
    );
    expect(NewPasswordSchema.safeParse({ password: "12345678" }).success).toBe(
      true
    );
  });
});
describe("RegisterShema (AUTH4)", () => {
  it("requires matching confirmPassword", () => {
    expect(
      RegisterShema.safeParse({
        email: "user@example.com",
        password: "password1",
        confirmPassword: "password1",
      }).success
    ).toBe(true);

    const mismatch = RegisterShema.safeParse({
      email: "user@example.com",
      password: "password1",
      confirmPassword: "different",
    });
    expect(mismatch.success).toBe(false);
  });
});
