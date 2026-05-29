"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Check, 
  Landmark, 
  User, 
  Smartphone, 
  AlertCircle, 
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { getApiBaseUrl } from "@/lib/utils";


// ─── Constants ───────────────────────────────────────────────────────────────
const MOCK_BANKS_INFO = [
  {
    id: "CB Bank - Ngan hang Con Bo",
    shortName: "CB Bank",
    subName: "Con Bò Bank",
    initials: "CB",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "MEOMEUBank - Ngan hang Quoc Te Meo",
    shortName: "MEOMEUBank",
    subName: "Quốc Tế Mèo",
    initials: "🐱",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: "UUET Bank - Ngan hang Cong Nghe",
    shortName: "UUET Bank",
    subName: "Tech Bank",
    initials: "UU",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "VinaFake Bank - Chi nhanh Demo",
    shortName: "VinaFake Bank",
    subName: "Demo Branch",
    initials: "VF",
    gradient: "from-emerald-400 to-teal-500",
  }
];

const MOCK_BANKS = MOCK_BANKS_INFO.map(b => b.id);

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

// Separate search params loading logic into its own component
function SimulatorForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const amountStr = searchParams.get("amount") || "0";
  const amount = parseInt(amountStr, 10) || 0;
  const info = searchParams.get("info") || "Thanh toan ve may bay";

  // Form State
  const [selectedBank, setSelectedBank] = useState(MOCK_BANKS[0] || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Loaded Banks State (default initialized to static list to avoid blank UI)
  const [banksList, setBanksList] = useState<string[]>(MOCK_BANKS);

  // Load banks dynamically from SQL Server
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const backendBase = getApiBaseUrl();
        const res = await fetch(`${backendBase}/api/Payment/banks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanksList(data);
            return;
          }
        }
      } catch (err) {
        console.error("Fetch banks from SQL failed, falling back to static list:", err);
      }
      setBanksList(MOCK_BANKS);
    };

    fetchBanks();
  }, []);

  const activeBanksInfo = banksList.map((bankName) => {
    const matched = MOCK_BANKS_INFO.find((b) => b.id === bankName);
    if (matched) return matched;
    
    // Fallback parser for dynamically added banks in SQL Server
    const parts = bankName.split(" - ");
    const short = parts[0] || bankName;
    const sub = parts[1] || "Ngân hàng liên kết";
    return {
      id: bankName,
      shortName: short,
      subName: sub,
      initials: short.substring(0, 2).toUpperCase(),
      gradient: "from-slate-400 to-gray-500",
    };
  });

  // Automatically lookup account name when bank and account number are filled
  useEffect(() => {
    const lookupAccount = async () => {
      console.log("👉 [Simulator] Bắt đầu tra cứu tài khoản:", { selectedBank, accountNumber });
      if (!selectedBank || accountNumber.length < 5) {
        console.log("⚠️ [Simulator] Bỏ qua tra cứu do thiếu thông tin:", { selectedBank, len: accountNumber.length });
        setAccountName("");
        return;
      }
      setIsVerifying(true);
      setErrorMsg("");
      try {
        const backendBase = getApiBaseUrl();
        const url = `${backendBase}/api/Payment/get-account-name?accountNumber=${accountNumber}&bankName=${encodeURIComponent(selectedBank)}`;
        console.log("🌐 [Simulator] Đang gửi yêu cầu đến:", url);
        const res = await fetch(url);
        console.log("📡 [Simulator] Kết quả phản hồi HTTP:", res.status, res.statusText);
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [Simulator] Nhận dữ liệu:", data);
          if (data.success) {
            setAccountName(data.accountName);
            toast.success(`Đã xác thực chủ tài khoản: ${data.accountName}`);
          } else {
            setAccountName("");
            setErrorMsg("Không tìm thấy chủ tài khoản cho số tài khoản này.");
          }
        } else {
          setAccountName("");
          try {
            const errData = await res.json();
            setErrorMsg(errData.message || "Tài khoản ngân hàng không hợp lệ.");
          } catch {
            setErrorMsg("Không tìm thấy thông tin tài khoản hợp lệ.");
          }
        }
      } catch (err) {
        console.error("❌ [Simulator] Lỗi kết nối API:", err);
        setErrorMsg("Không thể kết nối đến máy chủ để xác thực tài khoản.");
      } finally {
        setIsVerifying(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      lookupAccount();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedBank, accountNumber]);

  const handleConfirmPayment = async () => {
    if (!selectedBank || !accountNumber || !accountName) {
      setErrorMsg("Vui lòng chọn ngân hàng và nhập đúng số tài khoản mẫu.");
      return;
    }

    setIsConfirming(true);
    setErrorMsg("");
    try {
      const backendBase = getApiBaseUrl();
      const res = await fetch(`${backendBase}/api/Payment/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          bankName: selectedBank,
          accountNumber,
          accountName,
          amount,
        }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        toast.success("Thanh toán thành công!");
      } else {
        const errData = await res.json();
        setErrorMsg(errData.message || "Xác nhận thanh toán thất bại.");
      }
    } catch (err) {
      console.error("Confirm payment failed:", err);
      setErrorMsg("Không thể kết nối đến máy chủ thanh toán.");
    } finally {
      setIsConfirming(false);
    }
  };


  if (paymentSuccess) {
    return (
      <div className="text-center p-8 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100">
          <Check className="w-10 h-10 text-emerald-600 stroke-[3px]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800">Thanh Toán Thành Công!</h2>
          <p className="text-sm text-gray-500">Hệ thống đã ghi nhận giao dịch của bạn.</p>
        </div>
        <div className="bg-gray-50 border rounded-2xl p-4 text-left space-y-2.5 max-w-sm mx-auto text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Mã đơn hàng:</span>
            <span className="font-bold text-gray-800 font-mono">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Số tiền chuyển:</span>
            <span className="font-bold text-[#0b5c66]">{formatVND(amount)} VND</span>
          </div>
          <div className="flex justify-between">
            <span>Người chuyển:</span>
            <span className="font-bold text-gray-800">{accountName}</span>
          </div>
          <div className="flex justify-between">
            <span>Ngân hàng:</span>
            <span className="font-bold text-gray-800">{selectedBank.split(" - ")[0]}</span>
          </div>
        </div>
        <div className="pt-4">
          <p className="text-xs text-amber-600 font-bold animate-pulse">
            ✓ Trình duyệt đặt vé chính sẽ tự động chuyển trang trong vài giây...
          </p>
          <p className="text-[10px] text-gray-400 mt-2">Bạn có thể đóng tab này an toàn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Order info summary */}
      <div className="bg-[#e9f5f8] border border-[#cbe4ec] rounded-2xl p-4 text-left space-y-1">
        <span className="text-[10px] uppercase font-extrabold text-[#0b5c66]/70 tracking-widest block">
          Hóa đơn dịch vụ quét mã
        </span>
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-black text-[#0b5c66]">{formatVND(amount)} VND</span>
          <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded border border-[#0b5c66]/20">
            {orderId}
          </span>
        </div>
        <p className="text-xs text-gray-600 font-medium pt-1">
          Nội dung: {info}
        </p>
      </div>

      {/* Simulator Bank Form */}
      <div className="space-y-4">
        <div className="space-y-2 text-left">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chọn Ngân Hàng Giả Lập</Label>
          <select 
            value={selectedBank} 
            onChange={(e) => {
              setSelectedBank(e.target.value);
              toast.info(`Đã chọn: ${e.target.value.split(" - ")[0]}`);
            }}
            className="block w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b5c66] focus:border-[#0b5c66] cursor-pointer"
          >
            {activeBanksInfo.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.shortName} ({bank.subName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-gray-500 uppercase">Số Tài Khoản</Label>
            <span className="text-[10px] text-gray-400 font-medium">
              Demo: <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">190354678120</code> hoặc <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">123456789</code>
            </span>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Nhập số tài khoản mẫu"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-10 pr-4 rounded-xl border-gray-200"
            />
            <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <Label className="text-xs font-bold text-gray-500 uppercase">Tên Chủ Tài Khoản</Label>
          <div className="relative">
            <Input
              type="text"
              disabled
              placeholder={isVerifying ? "Đang xác thực tài khoản..." : "Tên sẽ tự động tra cứu"}
              value={accountName}
              className={`h-12 pl-10 pr-4 rounded-xl border-gray-200 bg-gray-50 font-bold ${accountName ? "text-[#0b5c66]" : "text-gray-400"}`}
            />
            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2 items-start text-left text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Button
          disabled={!selectedBank || !accountNumber || !accountName || isConfirming || isVerifying}
          onClick={handleConfirmPayment}
          className="w-full h-13 rounded-xl bg-[#0b5c66] hover:bg-[#07464e] text-white font-bold text-base shadow-lg shadow-[#0b5c66]/20 transition-all duration-300 disabled:opacity-50"
        >
          {isConfirming ? "Đang xử lý..." : "XÁC NHẬN THANH TOÁN"}
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Toaster richColors position="top-center" />
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-0">
        {/* Mobile Header Style */}
        <CardHeader className="bg-[#0b5c66] text-white p-6 text-center space-y-1 relative">
          <div className="w-10 h-1 rounded bg-white/30 mx-auto mb-2" />
          <div className="flex justify-center items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
            <CardTitle className="text-lg font-black tracking-wide uppercase">Cổng Giả Lập QR Pay</CardTitle>
          </div>
          <CardDescription className="text-white/60 text-xs font-medium">
            Airport Booking Payment Simulator
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Suspense fallback={<div className="text-center p-4 text-sm text-gray-500">Đang tải thông tin đơn hàng...</div>}>
            <SimulatorForm />
          </Suspense>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>VietQR Standard Sandbox</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
