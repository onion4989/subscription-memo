"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { checkSubscriptionRegisterRateLimit } from "@/lib/subscription/rate-limit";
import {
  computeNextRenewalDateYmd,
  todayYmdInJst,
  ymdToUtcDate,
} from "@/lib/subscription/renewal-date";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import {
  subscriptionRegisterFieldErrorsFromZod,
  subscriptionRegisterSchema,
  type SubscriptionRegisterFieldErrors,
  type SubscriptionRegisterFormValues,
  type SubscriptionRegisterInput,
  subscriptionRegisterInputFromFormValues,
} from "@/schemas/subscription";

export type RegisterSubscriptionResult =
  | {
      success: true;
      subscription: SavedSubscriptionRow;
    }
  | {
      success: false;
      fieldErrors?: SubscriptionRegisterFieldErrors;
      message?: string;
    };

function toSavedSubscriptionRow(
  subscription: {
    id: string;
    name: string;
    planName: string;
    paymentPlan: SavedSubscriptionRow["paymentPlan"];
    monthlyAmount: number | null;
    annualAmount: number | null;
    notifyEnabled: boolean;
  },
  contractDateYmd: string,
  nextRenewalDateYmd: string
): SavedSubscriptionRow {
  return {
    id: subscription.id,
    name: subscription.name,
    planName: subscription.planName,
    paymentPlan: subscription.paymentPlan,
    monthlyAmount: subscription.monthlyAmount,
    annualAmount: subscription.annualAmount,
    contractDate: contractDateYmd,
    nextRenewalDate: nextRenewalDateYmd,
    notifyEnabled: subscription.notifyEnabled,
  };
}

function duplicateSubscriptionFieldError(): RegisterSubscriptionResult {
  return {
    success: false,
    fieldErrors: {
      form: "同じサブスクリプション名とプラン名の組み合わせは既に登録されています。",
    },
  };
}

async function parseSubscriptionFormValues(
  values: SubscriptionRegisterFormValues
): Promise<
  | { success: true; data: SubscriptionRegisterInput }
  | { success: false; fieldErrors: SubscriptionRegisterFieldErrors }
> {
  const parsed = subscriptionRegisterSchema.safeParse(
    subscriptionRegisterInputFromFormValues(values)
  );

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: subscriptionRegisterFieldErrorsFromZod(parsed.error),
    };
  }

  return { success: true, data: parsed.data };
}

export async function registerSubscription(
  values: SubscriptionRegisterFormValues
): Promise<RegisterSubscriptionResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  if (!checkSubscriptionRegisterRateLimit(userId)) {
    return {
      success: false,
      message: "登録回数が多すぎます。しばらく待ってから再度お試しください。",
    };
  }

  const parsed = await parseSubscriptionFormValues(values);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.fieldErrors };
  }

  const data = parsed.data;
  const asOfYmd = todayYmdInJst();
  const nextRenewalDateYmd = computeNextRenewalDateYmd(
    data.contractDate,
    data.paymentPlan,
    asOfYmd
  );

  try {
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name: data.name,
        planName: data.planName,
        paymentPlan: data.paymentPlan,
        monthlyAmount: data.monthlyAmount,
        annualAmount: data.annualAmount,
        contractDate: ymdToUtcDate(data.contractDate),
        nextRenewalDate: ymdToUtcDate(nextRenewalDateYmd),
        notifyEnabled: data.notifyEnabled,
      },
    });

    revalidatePath(ROUTES.subscriptions);
    revalidatePath(ROUTES.subscriptionsNew);

    return {
      success: true,
      subscription: toSavedSubscriptionRow(
        subscription,
        data.contractDate,
        nextRenewalDateYmd
      ),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return duplicateSubscriptionFieldError();
    }

    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  values: SubscriptionRegisterFormValues
): Promise<RegisterSubscriptionResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  if (!checkSubscriptionRegisterRateLimit(userId)) {
    return {
      success: false,
      message: "更新回数が多すぎます。しばらく待ってから再度お試しください。",
    };
  }

  const existing = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!existing) {
    return { success: false, message: "更新対象が見つかりません。" };
  }

  const parsed = await parseSubscriptionFormValues(values);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.fieldErrors };
  }

  const data = parsed.data;
  const asOfYmd = todayYmdInJst();
  const nextRenewalDateYmd = computeNextRenewalDateYmd(
    data.contractDate,
    data.paymentPlan,
    asOfYmd
  );

  try {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        name: data.name,
        planName: data.planName,
        paymentPlan: data.paymentPlan,
        monthlyAmount: data.monthlyAmount,
        annualAmount: data.annualAmount,
        contractDate: ymdToUtcDate(data.contractDate),
        nextRenewalDate: ymdToUtcDate(nextRenewalDateYmd),
        notifyEnabled: data.notifyEnabled,
      },
    });

    revalidatePath(ROUTES.subscriptions);
    revalidatePath(ROUTES.subscriptionsNew);

    return {
      success: true,
      subscription: toSavedSubscriptionRow(
        subscription,
        data.contractDate,
        nextRenewalDateYmd
      ),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return duplicateSubscriptionFieldError();
    }

    throw error;
  }
}
