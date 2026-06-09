import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function MockCheckout() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount') || 0;
    const info = searchParams.get('info') || '';

    // State lưu thông tin nhập liệu
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

    const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!accountNumber || !accountName) {
        alert("Vui lòng nhập đầy đủ Số tài khoản và Tên tài khoản!");
        return;
    }

    setLoading(true);
    try {
        // 🔥 Hỗ trợ lấy URL từ query param để tránh sửa cứng IP!
        const backendParam = searchParams.get('backend');
        const confirmUrl = backendParam 
            ? `${backendParam}/api/payment/confirm-payment`
            : `http://192.168.1.21:5000/api/payment/confirm-payment`;
        
        await axios.post(confirmUrl, {
            OrderId: orderId,
            BankName: bankName,
            AccountNumber: accountNumber,
            AccountName: accountName,
            Amount: parseInt(amount)
        });

        setStatus('success');
    } catch (err) {
        console.error(err); // In lỗi ra console để dễ debug nếu có biến cố
        alert("Không thể gửi thông tin về Backend.");
    } finally {
        setLoading(false);
    }
};

    if (status === 'success') {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh', 
                backgroundColor: '#f4f6f9', 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', 
                padding: '20px', 
                boxSizing: 'border-box' 
            }}>
                {/* CSS for custom animations */}
                <style>{`
                    @keyframes pulse-ring {
                        0% { transform: scale(0.95); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.5; }
                        100% { transform: scale(1.2); opacity: 0; }
                    }
                    @keyframes scale-in {
                        0% { transform: scale(0); }
                        100% { transform: scale(1); }
                    }
                    @keyframes fade-slide-up {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .animate-ring {
                        position: absolute;
                        inset: -10px;
                        border: 3px solid #10b981;
                        border-radius: 50%;
                        animation: pulse-ring 2s infinite ease-out;
                    }
                    .animate-tick {
                        animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                    .animate-card {
                        animation: fade-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}</style>

                <div className="animate-card" style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    background: '#ffffff', 
                    borderRadius: '24px', 
                    padding: '30px 24px', 
                    textAlign: 'center', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)', 
                    boxSizing: 'border-box'
                }}>
                    {/* Icon Success */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                        <div className="animate-ring"></div>
                        <div className="animate-tick" style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%', 
                            backgroundColor: '#10b981', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '40px',
                            fontWeight: 'bold',
                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            ✓
                        </div>
                    </div>

                    <h2 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800' }}>
                        Thanh Toán Thành Công!
                    </h2>
                    <p style={{ color: '#64748b', margin: '0 0 28px 0', fontSize: '14px', lineHeight: '1.5' }}>
                        Giao dịch đã được xác thực và xử lý thành công bởi hệ thống VjpGateway.
                    </p>

                    {/* Receipt Details */}
                    <div style={{ 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '16px', 
                        padding: '20px', 
                        textAlign: 'left', 
                        marginBottom: '28px',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã Booking</span>
                            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700', fontFamily: 'monospace', marginLeft: 'auto' }}>{orderId}</span>
                        </div>
                        
                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đơn vị thụ hưởng</span>
                            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700', marginLeft: 'auto' }}>Skylines Airlines</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngân hàng gửi</span>
                            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', marginLeft: 'auto' }}>{bankName}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tên người chuyển</span>
                            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700', marginLeft: 'auto' }}>{accountName}</span>
                        </div>

                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng số tiền</span>
                            <span style={{ fontSize: '18px', color: '#0f4c81', fontWeight: '800', marginLeft: 'auto' }}>
                                {Number(amount).toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    </div>

                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0' }}>
                        Trạng thái vé trên máy tính của bạn sẽ tự động được cập nhật. Bạn có thể đóng trình duyệt này.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#0f4c81', minHeight: '100vh', fontFamily: 'Arial', padding: '15px', color: '#fff', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '450px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '20px', color: '#333', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                
                {/* Header cổng thanh toán */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
                    <h3 style={{ color: '#0f4c81', margin: '0 0 5px 0' }}>GATEWAY DEMO SYSTEM</h3>
                    <span style={{ fontSize: '12px', color: '#666' }}>Mã giao dịch: {orderId}</span>
                </div>

                {/* Thông tin số tiền */}
                <div style={{ backgroundColor: '#f4f6f9', borderRadius: '8px', padding: '15px', margin: '20px 0', textAlign: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Số tiền cần thanh toán</span>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f4c81', margin: '5px 0' }}>
                        {Number(amount).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <span style={{ fontSize: '13px', color: '#555' }}>Nội dung: {info}</span>
                </div>

                {/* Form nhập liệu */}
                <form onSubmit={handleSubmitPayment}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', color: '#555' }}>Ngân hàng thụ hưởng</label>
                        <select 
                            value={bankName} 
                            onChange={(e) => setBankName(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
                        >
                            {bankList.map((b, idx) => <option key={idx} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', color: '#555' }}>Số tài khoản ngân hàng</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: 190354678120"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', color: '#555' }}>Tên chủ tài khoản (Không dấu)</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: NGUYEN VAN A"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', backgroundColor: '#0f4c81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận giao dịch'}
                    </button>
                </form>
            </div>
        </div>
    );
}