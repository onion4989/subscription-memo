"use client";

import { useActionState } from "react";
import {
  confirmMfaSetup,
  type MfaSetupState,
} from "@/lib/actions/mfa-setup";
import { MfaBackupCodesView } from "@/components/features/mfa/MfaBackupCodesView";
import { MfaEnrollmentPanel } from "@/components/features/mfa/mfa-setup-shared";

const initialState: MfaSetupState = { step: "generate" };

type MfaSetupFlowProps = {
  initialSetupData: MfaSetupState;
  tokenInputId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
};

export function MfaSetupFlow({
  initialSetupData,
  tokenInputId,
  onComplete,
  onCancel,
}: MfaSetupFlowProps) {
  const [state, formAction, pending] = useActionState(
    confirmMfaSetup,
    initialState
  );

  const enrollmentData =
    state.step === "verify" && state.secret ? state : initialSetupData;

  // バックアップコードは再表示できないため、完了は利用者の明示操作を待つ
  if (state.step === "backup-codes") {
    return (
      <MfaBackupCodesView
        codes={state.backupCodes ?? []}
        onDone={onComplete}
        doneLabel="完了"
      />
    );
  }

  if (initialSetupData.error && initialSetupData.step !== "verify") {
    return (
      <p className="text-center text-sm text-red-600" role="alert">
        {initialSetupData.error}
      </p>
    );
  }

  if (enrollmentData.step === "verify" && enrollmentData.uri) {
    return (
      <MfaEnrollmentPanel
        setupData={enrollmentData}
        formAction={formAction}
        pending={pending}
        error={state.error ?? initialSetupData.error}
        tokenInputId={tokenInputId}
        onCancel={onCancel}
      />
    );
  }

  return <p className="text-center text-sm text-slate-500">読み込み中...</p>;
}
