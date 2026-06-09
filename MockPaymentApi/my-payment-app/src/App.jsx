import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateOrder from './CreateOrder';     // Trang máy tính hiển thị QR
import MockCheckout from './MockCheckout';   // Trang điện thoại nhập bank

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vào trang chủ (http://localhost:5173/) sẽ hiện trang tạo QR */}
        <Route path="/" element={<CreateOrder />} />
        
        {/* Quét QR (http://ip_may_tinh:5173/checkout) sẽ hiện giao diện ngân hàng */}
        <Route path="/checkout" element={<MockCheckout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;