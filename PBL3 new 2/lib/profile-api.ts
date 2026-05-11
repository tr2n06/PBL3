export type CurrentUser = {
  userId: string | number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  availablePoints?: number;
};

export async function getCurrentUser() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được thông tin người dùng");
  }

  return res.json() as Promise<CurrentUser>;
}
export async function updateCurrentUser(payload: {
  fullName?: string;
  phone?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cập nhật thông tin thất bại");
  }

  return res.json();
}
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me/password`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Đổi mật khẩu thất bại");
  }

  return res.json();
}
