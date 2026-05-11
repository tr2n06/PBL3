export type EmployeeItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  nationalId?: string;
  dateOfBirth?: string;
  status: "active" | "blocked" | "pending";
  createdAt: string;
  role: string;
};

export async function getEmployees() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employees`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load employees");
  }

  return res.json() as Promise<EmployeeItem[]>;
}

export async function blockEmployee(employeeId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employees/${employeeId}/block`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to block employee");
  }

  return res.json();
}

export async function unblockEmployee(employeeId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employees/${employeeId}/unblock`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to unblock employee");
  }

  return res.json();
}