export async function sendForgotPasswordOtp(payload: {
  email: string;
  purpose: "resetPassword";
}) {
  const res = await fetch(
    `http://localhost:5290/api/auth/request-otp`,
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
  purpose: "resetPassword";
}) {
  const res = await fetch(
    `http://localhost:5290/api/auth/verify-otp`,
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
  password: string;
  purpose: "resetPassword";
  code?: string;
  resetToken?: string;
}) {
  const res = await fetch(
    `http://localhost:5290/api/auth/reset-password`,
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