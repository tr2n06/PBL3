import React, { useState, useEffect } from 'react';
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

    // State kiểm tra trạng thái đơn hàng
    const [isValid, setIsValid] = useState(true);
    const [checking, setChecking] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const bankList = [
        "CB Bank - Ngan hang Con Bo",
        "MEOMEUBank - Ngan hang Quoc Te Meo",
        "UUET Bank - Ngan hang Cong Nghe",
        "VinaFake Bank - Chi nhanh Demo"
    ];

    const backEndIp = "192.168.2.223";

    // Kiểm tra trạng thái đơn hàng khi truy cập trang
    useEffect(() => {
        const checkOrder = async () => {
            if (!orderId) {
                setIsValid(false);
                setErrorMessage('Mã đơn hàng không hợp lệ!');
                setChecking(false);
                return;
            }
            try {
                // Sử dụng đường dẫn tương đối (Vite Proxy sẽ chuyển hướng về port 5000)
                const res = await axios.get(`/api/payment/check-status/${orderId}`, { timeout: 3000 });
                if (!res.data.exists) {
                    setIsValid(false);
                    setErrorMessage('Đơn hàng này không tồn tại trên hệ thống!');
                } else if (res.data.isPaid) {
                    setIsValid(false);
                    setErrorMessage('Mã QR này đã được thanh toán hoặc không còn hoạt động!');
                } else {
                    setIsValid(true);
                }
            } catch (err) {
                console.error("Lỗi kết nối kiểm tra đơn hàng:", err);
                // Cảnh báo thông minh nếu không thể kết nối tới proxy/backend
                alert("Không thể kết nối đến máy chủ Backend thông qua Proxy của Frontend.\n\nVui lòng đảm bảo rằng bạn đã khởi động cả Terminal 1 (Backend C# cổng 5000) và Terminal 2 (Frontend cổng 5173).");
                setIsValid(true); // Dự phòng cho người dùng tiếp tục giao diện
            } finally {
                setChecking(false);
            }
        };
        checkOrder();
    }, [orderId]);

    // Tự động tìm kiếm tên chủ tài khoản từ Backend khi số tài khoản và ngân hàng thay đổi
    useEffect(() => {
        const fetchAccountName = async () => {
            if (!accountNumber || accountNumber.length < 6) {
                if (!accountNumber) setAccountName('');
                return;
            }

            try {
                const res = await axios.get(`/api/payment/get-account-name`, {
                    params: {
                        accountNumber: accountNumber.trim(),
                        bankName: bankName
                    },
                    timeout: 2000
                });
                if (res.data.success) {
                    setAccountName(res.data.accountName);
                }
            } catch (err) {
                // Không tìm thấy hoặc lỗi kết nối thì bỏ qua để người dùng tự nhập tay
                console.log("Không tự động lấy được tên chủ tài khoản:", err.message);
            }
        };

        const timer = setTimeout(() => {
            fetchAccountName();
        }, 500); // Debounce 500ms để tránh gửi request liên tục khi đang gõ

        return () => clearTimeout(timer);
    }, [accountNumber, bankName]);

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!accountNumber || !accountName) {
            alert("Vui lòng nhập đầy đủ Số tài khoản và Tên tài khoản!");
            return;
        }

        setLoading(true);
        try {
            // Gọi thông qua Proxy Frontend để kết nối tới cổng 5000
            await axios.post(`/api/payment/confirm-payment`, {
                OrderId: orderId,
                BankName: bankName,
                AccountNumber: accountNumber,
                AccountName: accountName,
                Amount: parseInt(amount)
            }, { timeout: 5000 });

            setStatus('success');
        } catch (err) {
            console.error(err); // In lỗi ra console để dễ debug nếu có biến cố
            alert("Không thể gửi thông tin về Backend. Vui lòng đảm bảo Terminal 1 (Backend) đang hoạt động.");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f4c81', fontFamily: 'Arial', color: '#fff' }}>
                <h3>Đang xác thực thông tin đơn hàng...</h3>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fdf2f2', fontFamily: 'Arial', color: '#9b1c1c', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>⚠</div>
                <h2>Giao Dịch Không Hợp Lệ</h2>
                <p style={{ fontSize: '16px', maxWidth: '400px', lineHeight: '1.5' }}>{errorMessage}</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#e6f4ea', fontFamily: 'Arial', color: '#137333' }}>
                <div style={{ fontSize: '64px' }}>✓</div>
                <h2>Thanh Toán Thành Công!</h2>
                <p>Hệ thống Backend đã ghi nhận đơn hàng {orderId}.</p>
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