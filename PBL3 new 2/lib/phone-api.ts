export type CustomerPhoneLookupResponse = {
  customerId: string | number;
  fullName: string;
  phone: string;
  email?: string;
  availablePoints?: number;
};

export async function getCustomerByPhone(phone: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers/by-phone?phone=${encodeURIComponent(cleanPhone)}`,
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
    throw new Error(text || "Không tìm thấy khách hàng theo số điện thoại");
  }

  return res.json() as Promise<CustomerPhoneLookupResponse>;
}
