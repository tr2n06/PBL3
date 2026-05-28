export type CustomerPhoneLookupResponse = {
  customerId: number;
  fullName: string;
  phone: string;
  email?: string;
  availablePoints?: number;
};

//nhập số điện thoại mới xuất hiện điểm giám giá
export async function getCustomerByPhone(phone: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  const res = await fetch(
    `http://localhost:5290/api/customers/by-phone?phone=${encodeURIComponent(cleanPhone)}`,
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
