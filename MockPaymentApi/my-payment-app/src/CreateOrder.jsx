import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

export default function CreateOrder() {
    const [amount, setAmount] = useState(50000);
    const [qrUrl, setQrUrl] = useState('');
    const [orderId, setOrderId] = useState('');

    const handleCreateOrder = async () => {
        try {
            // Thay đổi đúng port Backend của bạn (ví dụ 5000)
            const res = await axios.post('http://localhost:5000/api/payment/create-order', {
                Amount: amount,
                OrderInfo: "Thanh toan don hang demo"
            });
            setQrUrl(res.data.qrLink);
            setOrderId(res.data.orderId);
        } catch (err) {
            alert("Lỗi kết nối Backend");
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>Hệ Thống Bán Hàng - Demo Cổng Thanh Toán</h2>
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
                </div>
            )}
        </div>
    );
}