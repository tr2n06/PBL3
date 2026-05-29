@echo off
:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Dang chay voi quyen Administrator.
) else (
    echo [ERROR] Vui long CLIK CHUOT PHAI vao file nay va chon "Run as administrator" (Chay voi quyen quan tri)!
    pause
    exit /b
)

echo.
echo Dang mo cong tuong lua cho PBL3...
echo.

:: Add firewall rule for port 5290 (C# Backend)
netsh advfirewall firewall delete rule name="PBL3 C# Backend 5290" >nul 2>&1
netsh advfirewall firewall add rule name="PBL3 C# Backend 5290" dir=in action=allow protocol=TCP localport=5290 profile=any
if %errorLevel% == 0 (
    echo [+] Da mo cong 5290 thanh cong!
) else (
    echo [!] Loi mo cong 5290.
)

:: Add firewall rule for port 3000 (Next.js Frontend)
netsh advfirewall firewall delete rule name="PBL3 Next.js Frontend 3000" >nul 2>&1
netsh advfirewall firewall add rule name="PBL3 Next.js Frontend 3000" dir=in action=allow protocol=TCP localport=3000 profile=any
if %errorLevel% == 0 (
    echo [+] Da mo cong 3000 thanh cong!
) else (
    echo [!] Loi mo cong 3000.
)

echo.
echo ========================================================
echo   DA CAU HINH TUONG LUA XONG!
echo   Bay gio dien thoai cua ban da co the ket noi vao PC.
echo ========================================================
echo.
pause
