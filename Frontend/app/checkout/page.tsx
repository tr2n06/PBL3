"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const amount = searchParams.get('amount') || '0';
    const info = searchParams.get('info') || '';

    const [bankName, setBankName] = useState('CB Bank - Ngan hang Con Bo');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const bankList = [
        "CB Bank - Ngan hang Con Bo",
        "MEOMEUBank - Ngan hang Quoc Te Meo",
        "UUET Bank - Ngan hang Cong Nghe",
        "VinaFake Bank - Chi nhanh Demo"
    ];

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountNumber || !accountName) {
            alert("Vui lòng nhập đầy đủ Số tài khoản và Tên tài khoản!");
            return;
        }

        setLoading(true);
        try {
            const backendParam = searchParams.get('backend');
            const confirmUrl = backendParam 
                ? `${backendParam}/api/payment/confirm-payment`
                : `http://localhost:5290/api/payment/confirm-payment`;
            
            const response = await fetch(confirmUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    OrderId: orderId,
                    orderId: orderId,
                    BankName: bankName,
                    bankName: bankName,
                    AccountNumber: accountNumber,
                    accountNumber: accountNumber,
                    AccountName: accountName,
                    accountName: accountName,
                    Amount: parseInt(amount),
                    amount: parseInt(amount)
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Kết nối API thất bại.");
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Thanh toán không hợp lệ hoặc không tìm thấy Booking.");
            }

            setStatus('success');
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi gửi thông tin.");
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
                <style>{`
                    @keyframes pulse-ring {
                        0% { transform: scale(0.95); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.5; }
                        100% { transform: scale(1.2); opacity: 0; }
                    }
                    .animate-ring {
                        position: absolute;
                        inset: -10px;
                        border: 3px solid #10b981;
                        border-radius: 50%;
                        animation: pulse-ring 2s infinite ease-out;
                    }
                `}</style>
                <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-lg border border-slate-100 animate-in fade-in duration-500">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="animate-ring"></div>
                        <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold relative z-10 shadow-md">
                            ✓
                        </div>
                    </div>
                    <h2 className="text-slate-900 text-2xl font-extrabold mb-2">Thanh Toán Thành Công!</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Giao dịch đã được xác thực và xử lý thành công bởi hệ thống VjpGateway.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-5 text-left mb-6 border border-slate-100">
                        <div className="flex justify-between mb-3 items-center">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mã Booking</span>
                            <span className="text-sm text-slate-800 font-mono font-bold">{orderId}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-3"></div>
                        <div className="flex justify-between mb-3 items-center">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đơn vị thụ hưởng</span>
                            <span className="text-sm text-slate-800 font-bold">Skylines Airlines</span>
                        </div>
                        <div className="flex justify-between mb-3 items-center">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ngân hàng gửi</span>
                            <span className="text-sm text-slate-800 font-semibold">{bankName}</span>
                        </div>
                        <div className="flex justify-between mb-3 items-center">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tên người chuyển</span>
                            <span className="text-sm text-slate-800 font-bold">{accountName}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng số tiền</span>
                            <span className="text-lg text-sky-700 font-extrabold">
                                {Number(amount).toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">
                        Trạng thái vé trên máy tính của bạn sẽ tự động được cập nhật. Bạn có thể đóng trình duyệt này.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-sky-900 min-h-screen flex flex-col justify-center items-center p-4 font-sans text-white">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 text-slate-800 shadow-xl">
                <div className="text-center border-b-2 border-slate-100 pb-4 mb-6">
                    <h3 className="text-lg font-bold text-sky-800">GATEWAY DEMO SYSTEM</h3>
                    <span className="text-xs text-slate-500">Mã giao dịch: {orderId}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Số tiền cần thanh toán</span>
                    <div className="text-2xl font-extrabold text-sky-700 my-1">
                        {Number(amount).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <span className="text-xs text-slate-600">Nội dung: {info}</span>
                </div>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <div>
                        <label className="block font-bold text-xs text-slate-500 mb-1">Ngân hàng thụ hưởng</label>
                        <select 
                            value={bankName} 
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            {bankList.map((b, idx) => <option key={idx} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-xs text-slate-500 mb-1">Số tài khoản ngân hàng</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: 190354678120"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-xs text-slate-500 mb-1">Tên chủ tài khoản (Không dấu)</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: NGUYEN VAN A"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                            className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full p-4 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận giao dịch'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-sky-900 flex justify-center items-center text-white font-sans text-sm">
                Đang tải cổng thanh toán...
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
