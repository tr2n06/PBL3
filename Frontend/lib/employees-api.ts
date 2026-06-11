export type EmployeeItem = {
  id: number;
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

export type CreateEmployeeRequest = {
  name: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber: string;
  email: string;
  password: string;
};

export async function getEmployees() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/employees`,
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

export async function createEmployee(payload: CreateEmployeeRequest) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/employees`,
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
    throw new Error(text || "Failed to create employee");
  }

  return res.json() as Promise<{ message: string }>;
}

export async function blockEmployee(employeeId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/employees/${employeeId}/block`,
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

export async function unblockEmployee(employeeId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/employees/${employeeId}/unblock`,
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
