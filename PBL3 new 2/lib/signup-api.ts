export async function requestRegisterOtp(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  reason: "register";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register/request-otp`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không gửi được mã xác thực");
  }

  return res.json();
}

export async function verifyRegisterOtp(payload: {
  email: string;
  code: string;
  reason: "register";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register/verify-otp`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Mã xác thực không hợp lệ");
  }

  return res.json();
}

export async function resendRegisterOtp(payload: {
  email: string;
  reason: "register";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register/resend-otp`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không gửi lại được mã xác thực");
  }

  return res.json();
}