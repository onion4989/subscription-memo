import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resetDemoAccount } = vi.hoisted(() => ({
  resetDemoAccount: vi.fn(),
}));

vi.mock("@/lib/demo/reset-demo-account", () => ({
  resetDemoAccount,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { tag: "prisma-mock" },
}));

import { POST } from "@/app/api/cron/demo-reset/route";
import { DEMO_USER_EMAIL } from "@/lib/demo/constants";

const SECRET = "test-demo-reset-secret";

function request(url: string, authorization?: string | null) {
  const headers = new Headers();
  if (authorization !== null && authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return new Request(url, { method: "POST", headers });
}

describe("POST /api/cron/demo-reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_RESET_JOB_SECRET = SECRET;
    resetDemoAccount.mockResolvedValue({
      userId: "demo-user-id",
      email: DEMO_USER_EMAIL,
      subscriptionCount: 6,
      asOfYmd: "2026-08-02",
    });
  });

  afterEach(() => {
    delete process.env.DEMO_RESET_JOB_SECRET;
  });

  it("returns 500 when DEMO_RESET_JOB_SECRET is not configured", async () => {
    delete process.env.DEMO_RESET_JOB_SECRET;

    const response = await POST(request("http://localhost/api/cron/demo-reset"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "DEMO_RESET_JOB_SECRET is not configured",
    });
    expect(resetDemoAccount).not.toHaveBeenCalled();
  });

  it("returns 401 for missing or invalid bearer token", async () => {
    const missing = await POST(request("http://localhost/api/cron/demo-reset"));
    expect(missing.status).toBe(401);

    const wrong = await POST(
      request("http://localhost/api/cron/demo-reset", "Bearer wrong")
    );
    expect(wrong.status).toBe(401);
    expect(resetDemoAccount).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid asOfYmd", async () => {
    const response = await POST(
      request(
        "http://localhost/api/cron/demo-reset?asOfYmd=08-02-2026",
        `Bearer ${SECRET}`
      )
    );

    expect(response.status).toBe(400);
    expect(resetDemoAccount).not.toHaveBeenCalled();
  });

  it("resets the demo account and returns the result", async () => {
    const response = await POST(
      request(
        "http://localhost/api/cron/demo-reset?asOfYmd=2026-08-02",
        `Bearer ${SECRET}`
      )
    );

    expect(response.status).toBe(200);
    expect(resetDemoAccount).toHaveBeenCalledWith(
      { tag: "prisma-mock" },
      { asOfYmd: "2026-08-02" }
    );
    await expect(response.json()).resolves.toEqual({
      ok: true,
      userId: "demo-user-id",
      email: DEMO_USER_EMAIL,
      subscriptionCount: 6,
      asOfYmd: "2026-08-02",
    });
  });
});
