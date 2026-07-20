import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { runRenewalNotificationDailyJob } = vi.hoisted(() => ({
  runRenewalNotificationDailyJob: vi.fn(),
}));

vi.mock("@/lib/renewal-notification/daily-job", () => ({
  runRenewalNotificationDailyJob,
}));

import { POST } from "@/app/api/cron/renewal-notifications/route";

const SECRET = "test-renewal-job-secret";

function request(url: string, authorization?: string | null) {
  const headers = new Headers();
  if (authorization !== null && authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return new Request(url, { method: "POST", headers });
}

describe("POST /api/cron/renewal-notifications (C1–C4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RENEWAL_JOB_SECRET = SECRET;
    runRenewalNotificationDailyJob.mockResolvedValue({
      asOfYmd: "2026-07-21",
      phase1: {
        targetSubscriptions: 0,
        sentUsers: 0,
        sentSubscriptions: 0,
        failedUsers: 0,
      },
      phase2: { advancedSubscriptions: 0 },
    });
  });

  afterEach(() => {
    delete process.env.RENEWAL_JOB_SECRET;
  });

  it("C1: returns 500 when RENEWAL_JOB_SECRET is not configured", async () => {
    delete process.env.RENEWAL_JOB_SECRET;

    const response = await POST(
      request("http://localhost/api/cron/renewal-notifications")
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "RENEWAL_JOB_SECRET is not configured",
    });
    expect(runRenewalNotificationDailyJob).not.toHaveBeenCalled();
  });

  it("C2: returns 401 for missing or invalid bearer token", async () => {
    const missing = await POST(
      request("http://localhost/api/cron/renewal-notifications")
    );
    expect(missing.status).toBe(401);

    const wrong = await POST(
      request(
        "http://localhost/api/cron/renewal-notifications",
        "Bearer wrong-token"
      )
    );
    expect(wrong.status).toBe(401);
    expect(runRenewalNotificationDailyJob).not.toHaveBeenCalled();
  });

  it("C3: returns 400 for invalid asOfYmd", async () => {
    const response = await POST(
      request(
        "http://localhost/api/cron/renewal-notifications?asOfYmd=07-21-2026",
        `Bearer ${SECRET}`
      )
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid asOfYmd. Use YYYY-MM-DD format.",
    });
    expect(runRenewalNotificationDailyJob).not.toHaveBeenCalled();
  });

  it("C4: runs job with asOfYmd and returns result", async () => {
    const response = await POST(
      request(
        "http://localhost/api/cron/renewal-notifications?asOfYmd=2026-07-21",
        `Bearer ${SECRET}`
      )
    );

    expect(response.status).toBe(200);
    expect(runRenewalNotificationDailyJob).toHaveBeenCalledWith({
      asOfYmd: "2026-07-21",
    });
    await expect(response.json()).resolves.toMatchObject({
      asOfYmd: "2026-07-21",
      phase1: expect.any(Object),
      phase2: expect.any(Object),
    });
  });
});
