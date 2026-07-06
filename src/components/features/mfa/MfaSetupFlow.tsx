"use client";

import { useActionState, useEffect } from "react";
import {
  confirmMfaSetup,
  type MfaSetupState,
} from "@/lib/actions/mfa-setup";
import {
  MfaEnrollmentPanel,
  MfaSetupCompleteView,
} from "@/components/features/mfa/mfa-setup-shared";

const initialState: MfaSetupState = { step: "generate" };

type MfaSetupFlowProps = {
  initialSetupData: MfaSetupState;
  tokenInputId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  autoNotifyOnComplete?: boolean;
};

export function MfaSetupFlow({
  initialSetupData,
  tokenInputId,
  onComplete,
  onCancel,
  autoNotifyOnComplete = false,
}: MfaSetupFlowProps) {
  const [state, formAction, pending] = useActionState(
    confirmMfaSetup,
    initialState
  );

  const enrollmentData =
    state.step === "verify" && state.secret ? state : initialSetupData;

  useEffect(() => {
    if (state.step === "complete" && autoNotifyOnComplete && onComplete) {
      onComplete();
    }
  }, [autoNotifyOnComplete, onComplete, state.step]);

  if (state.step === "complete") {
    return (
      <MfaSetupCompleteView
        onDone={autoNotifyOnComplete ? undefined : onComplete}
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
