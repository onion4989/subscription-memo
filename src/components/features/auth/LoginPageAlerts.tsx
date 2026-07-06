"use client";

type LoginPageAlertsProps = {
  errorMessage: string | null;
  verifiedMessage: string | null;
};

export function LoginPageAlerts({
  errorMessage,
  verifiedMessage,
}: LoginPageAlertsProps) {
  return (
    <>
      {verifiedMessage ? (
        <div className="mb-4 w-full rounded-md border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">{verifiedMessage}</p>
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-4 w-full rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      ) : null}
    </>
  );
}
