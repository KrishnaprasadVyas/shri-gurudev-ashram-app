import axios from "axios";

export type ErrorOverride = {
  match: RegExp | string;
  message: string;
};

function extractApiMessage(error: unknown): string {
  if (!error) return "";

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: unknown; error?: unknown; errors?: unknown }
      | string
      | undefined;

    if (typeof responseData === "string") {
      return responseData;
    }

    const message = responseData?.message ?? responseData?.error;
    if (typeof message === "string") return message;
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }

  return "";
}

function isTechnicalJargon(msg: string): boolean {
  const technicalPatterns = [
    /Unexpected token/i,
    /JSON at position/i,
    /Cast to ObjectId/i,
    /E11000 duplicate key/i,
    /BSONError/i,
    /Cannot read propert/i,
    /is not a function/i,
    /MongoError/i,
    /Mongoose/i,
    /AxiosError/i,
    /status code (500|502|503|504)/i,
    /at \w+ \(/i,
  ];
  return technicalPatterns.some((pattern) => pattern.test(msg));
}

export function getFriendlyApiError(
  error: unknown,
  fallbackMessage: string = "Something went wrong. Please try again.",
  overrides: ErrorOverride[] = []
): string {
  const rawMessage = extractApiMessage(error);
  const rawLower = rawMessage.toLowerCase();

  // 1. Check custom overrides first
  for (const override of overrides) {
    const matches =
      override.match instanceof RegExp
        ? override.match.test(rawMessage)
        : rawMessage === override.match;

    if (matches) {
      return override.message;
    }
  }

  // 2. Firebase Phone Authentication Errors
  if (rawLower.includes("auth/too-many-requests")) {
    return "Multiple sign-in attempts detected. For your security, please wait a few minutes before trying again.";
  }
  if (
    rawLower.includes("auth/invalid-verification-code") ||
    rawLower.includes("invalid-verification-code") ||
    rawLower.includes("invalid otp")
  ) {
    return "The 6-digit verification code you entered is incorrect. Please check the SMS and try again.";
  }
  if (rawLower.includes("auth/code-expired") || rawLower.includes("session-expired")) {
    return "The verification code has expired. Please request a new OTP to continue.";
  }
  if (rawLower.includes("auth/invalid-phone-number")) {
    return "Please enter a valid 10-digit Indian mobile number.";
  }
  if (rawLower.includes("auth/quota-exceeded")) {
    return "SMS delivery is temporarily busy. Please wait a few moments and try again.";
  }
  if (rawLower.includes("auth/network-request-failed")) {
    return "Unable to reach the phone verification service. Please check your internet connection.";
  }

  // 3. Razorpay Checkout / Payment Failures
  if (
    rawLower.includes("payment cancelled") ||
    rawLower.includes("payment was cancelled") ||
    rawLower.includes("checkout dismissed") ||
    rawLower.includes("user cancelled")
  ) {
    return "Payment was cancelled. You can retry your contribution whenever you are ready.";
  }
  if (
    rawLower.includes("bad_request_error") ||
    rawLower.includes("gateway_error") ||
    rawLower.includes("payment failed")
  ) {
    return "Your bank was unable to complete the payment. Please verify your payment details or try another payment method.";
  }

  // 4. Fetch Abort / Network Request Failed
  if (error instanceof Error && error.name === "AbortError") {
    return "The request took longer than expected. Please check your connection and try again.";
  }
  if (
    error instanceof Error &&
    (error.name === "TypeError" && error.message.toLowerCase().includes("network request failed"))
  ) {
    return "Unable to connect to the Ashram servers. Please check your internet connection and try again.";
  }

  // 5. Axios Specific Errors
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error" || rawLower.includes("econnrefused")) {
      return "Unable to connect to the Ashram servers. Please check your internet connection and try again.";
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "The request took longer than expected. Please check your connection and try again.";
    }

    const status = error.response?.status;

    if (status === 413) {
      return "The uploaded file is too large. Please select an image under 10 MB.";
    }

    if (status === 401) {
      return "Your session has expired. Please sign in to continue.";
    }

    if (status === 403) {
      if (rawLower.includes("disabled")) {
        return "Your collector account is currently disabled. Please contact the Ashram administration for assistance.";
      }
      return "You do not have permission to perform this action. Please sign in again.";
    }

    if (status && status >= 500) {
      return "The Ashram service is temporarily experiencing high load. Please try again shortly.";
    }

    if (status === 400 && rawMessage && !isTechnicalJargon(rawMessage)) {
      return rawMessage;
    }

    if (status === 409 && rawMessage && !isTechnicalJargon(rawMessage)) {
      return rawMessage;
    }
  }

  // 6. Generic Non-Axios Errors
  // If the error is not an Axios error and not a recognized SDK code, return the context-specific fallbackMessage
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  // 7. Plain non-technical messages are safe to display
  if (rawMessage && !isTechnicalJargon(rawMessage)) {
    return rawMessage;
  }

  return fallbackMessage;
}
