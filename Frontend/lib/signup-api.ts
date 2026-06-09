export async function registerUser(payload: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      role: payload.role ?? "Passenger",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Register failed");
  }

  return res.json();
}

export async function requestRegisterOtp(payload: {
  email: string;
  purpose: "register";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/request-otp`,
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
    console.log("SERVER ERROR:", text);
    throw new Error(text || "Không gửi được mã xác thực");
  }

  return res.json();
}

export async function verifyRegisterOtp(payload: {
  email: string;
  code: string;
  purpose: "register";
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
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.log("SERVER ERROR:", text);
    throw new Error(text || "Không gửi được mã xác thực");
  }

  return res.json();
}

export async function resendRegisterOtp(payload: {
  email: string;
  purpose: "register";
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/request-otp`,
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