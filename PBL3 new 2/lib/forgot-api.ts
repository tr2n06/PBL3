export async function sendForgotPasswordOtp(payload: {
  email: string;
  reason: "forgot_password";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-otp`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to send verification code");
  }

  return res.json() as Promise<{
    message?: string;
    expiresInSeconds?: number;
  }>;
}

export async function verifyForgotPasswordOtp(payload: {
  email: string;
  code: string;
  reason: "forgot_password";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-otp`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Invalid verification code");
  }

  return res.json() as Promise<{
    resetToken?: string;
    verified?: boolean;
  }>;
}

export async function resetForgotPassword(payload: {
  email: string;
  newPassword: string;
  newPasswordConfirm: string;
  reason: "forgot_password";
  code?: string;
  resetToken?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password/reset`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to reset password");
  }

  return res.json();
}