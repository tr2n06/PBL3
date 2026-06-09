-- Sử dụng Database của dự án PBL3
USE [Pbl3Db];
GO

-- Xóa dữ liệu cũ nếu có (chị có thể cân nhắc trước khi chạy dòng này nha)
-- TRUNCATE TABLE [dbo].[FromTo];

-- Thực hiện chèn dữ liệu tự động
WITH CityList AS (
    -- Lấy danh sách thành phố kèm theo một ID tự tăng để phục vụ thuật toán tính khoảng cách (length)
    SELECT 
        [abbreviatedName],
        [fullName],
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS [CityIndex]
    FROM [Pbl3Db].[dbo].[City]
),
FlightPairs AS (
    -- Tạo tất cả các cặp chặng bay từ thành phố này sang thành phố khác
    SELECT 
        c1.[abbreviatedName] AS [FromCity],
        c2.[abbreviatedName] AS [ToCity],
        -- Thuật toán giả lập khoảng cách địa lý thực tế dựa trên khoảng cách Index Bắc-Nam
        -- Đảm bảo khoảng cách dao động hợp lý từ ~150km đến ~1200km và có tính ngẫu nhiên nhẹ
        CAST(
            ABS(c1.[CityIndex] - c2.[CityIndex]) * 55 
            + (ABS(CHECKSUM(NewID())) % 40) -- Tạo độ lệch ngẫu nhiên nhỏ cho tự nhiên
            + 120 -- Khoảng cách tối thiểu cho các chặng gần nhau
            AS INT
        ) AS [CalculatedLength],
        -- Đánh số thứ tự tăng dần cho từng chặng bay để sinh mã codeFlight
        ROW_NUMBER() OVER (ORDER BY c1.[abbreviatedName], c2.[abbreviatedName]) AS [RowSeq]
    FROM CityList c1
    CROSS JOIN CityList c2
    WHERE c1.[abbreviatedName] <> c2.[abbreviatedName] -- Loại bỏ chặng bay đi và đến cùng một nơi
)
INSERT INTO [Pbl3Db].[dbo].[FromTo] 
    ([codeFlight], [from], [to], [length])
SELECT 
    'VN' + RIGHT('0000' + CAST([RowSeq] AS VARCHAR(4)), 4) AS [codeFlight], -- Định dạng VN0001, VN0002...
    [FromCity] AS [from],
    [ToCity] AS [to],
    [CalculatedLength] AS [length]
FROM FlightPairs;
GO

-- Kiểm tra lại kết quả sau khi đổ dữ liệu thành công 🎉
SELECT TOP (1000) [codeFlight]
      ,[from]
      ,[to]
      ,[length]
  FROM [Pbl3Db].[dbo].[FromTo]
  ORDER BY [codeFlight] ASC;