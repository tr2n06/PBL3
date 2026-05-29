import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

export default function CreateOrder() {
    const [amount, setAmount] = useState(50000);
    const [qrUrl, setQrUrl] = useState('');
    const [orderId, setOrderId] = useState('');
    const [isPaid, setIsPaid] = useState(false);

    const handleCreateOrder = async () => {
        try {
            setIsPaid(false);
            // Thay đổi đúng port Backend của bạn (ví dụ 5000)
            const res = await axios.post('http://localhost:5000/api/payment/create-order', {
                Amount: parseInt(amount) || 0,
                OrderInfo: "Thanh toan don hang demo"
            });
            setQrUrl(res.data.qrLink);
            setOrderId(res.data.orderId);
        } catch (err) {
            alert("Lỗi kết nối Backend");
        }
    };

    // Polling kiểm tra trạng thái đơn hàng mỗi 2 giây
    useEffect(() => {
        if (!orderId || isPaid) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/payment/check-status/${orderId}`);
                if (res.data.isPaid) {
                    setIsPaid(true);
                    setQrUrl(''); // Xoá mã QR đi không cho quét nữa
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [orderId, isPaid]);

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>Hệ Thống Bán Hàng - Demo Cổng Thanh Toán</h2>
            
            {isPaid ? (
                <div style={{ padding: '30px', background: '#e6f4ea', color: '#137333', borderRadius: '10px', display: 'inline-block', marginTop: '20px', border: '1px solid #137333' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
                    <h3>Thanh Toán Thành Công!</h3>
                    <p>Đơn hàng <strong>{orderId}</strong> đã hoàn tất thanh toán.</p>
                    <button 
                        onClick={() => { setIsPaid(false); setOrderId(''); setAmount(50000); }} 
                        style={{ marginTop: '15px', padding: '10px 20px', fontSize: '15px', cursor: 'pointer', background: '#137333', color: '#fff', border: 'none', borderRadius: '5px' }}
                    >
                        Tạo đơn hàng mới
                    </button>
                </div>
            ) : (
                <>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px', marginRight: '10px' }}
                    />
                    <button onClick={handleCreateOrder} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                        Tạo mã QR Thanh Toán
                    </button>

                    {qrUrl && (
                        <div style={{ marginTop: '30px' }}>
                            <h3>Mã đơn hàng: {orderId}</h3>
                            <p>Dùng điện thoại quét mã dưới đây (phải chung mạng Wifi với máy tính):</p>
                            <div style={{ padding: '20px', background: '#fff', display: 'inline-block', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                <QRCodeCanvas value={qrUrl} size={220} />
                            </div>
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f4f6f9', borderRadius: '8px', display: 'inline-block', border: '1px dashed #ccc' }}>
                                <p style={{ color: '#555', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>💻 Mẹo test nhanh không cần dùng điện thoại & Wi-Fi:</p>
                                <a 
                                    href={qrUrl.replace('https://btl-thanh-toan-vjp.loca.lt', 'http://localhost:5173')} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-block', padding: '10px 20px', background: '#0f4c81', color: '#fff', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' }}
                                >
                                    👉 Click vào đây để tự thanh toán trong Tab mới
                                </a>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}