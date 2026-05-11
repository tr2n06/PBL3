export type EmployeeProfile = {
  userId: string | number;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  nationalId?: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt?: string;
};

export type PendingProfileUpdate = {
  requestId: string | number;
  status: "pending" | "approved" | "rejected";
  address?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
};

export async function getEmployeeProfile() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được hồ sơ nhân viên");
  }

  return res.json() as Promise<EmployeeProfile>;
}

export async function getMyPendingProfileUpdate() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile-update-requests/me/latest`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không lấy được trạng thái yêu cầu cập nhật");
  }

  return res.json() as Promise<PendingProfileUpdate | null>;
}

export async function submitProfileUpdateRequest(payload: {
  address?: string;
  email?: string;
  phone?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile-update-requests`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không gửi được yêu cầu cập nhật");
  }

  return res.json();
}

export async function changeEmployeePassword(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me/password`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Đổi mật khẩu thất bại");
  }

  return res.json();
}