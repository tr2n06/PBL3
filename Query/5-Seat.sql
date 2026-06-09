
-- Chèn dữ liệu cho hạng Nhất (First Class) - Mã loại: 3 (Gồm 8 ghế)
INSERT INTO [Pbl3Db].[dbo].[Seat] ([codeSeat], [codeType])
VALUES 
    ('1A', 3), ('1B', 3),
    ('2A', 3), ('2B', 3),
    ('3A', 3), ('3B', 3),
    ('4A', 3), ('4B', 3);

-- Chèn dữ liệu cho hạng Thương gia (Business) - Mã loại: 1 (Gồm 24 ghế)
INSERT INTO [Pbl3Db].[dbo].[Seat] ([codeSeat], [codeType])
VALUES 
    ('5A', 1), ('5B', 1), ('5C', 1), ('5D', 1),
    ('6A', 1), ('6B', 1), ('6C', 1), ('6D', 1),
    ('7A', 1), ('7B', 1), ('7C', 1), ('7D', 1),
    ('8A', 1), ('8B', 1), ('8C', 1), ('8D', 1),
    ('9A', 1), ('9B', 1), ('9C', 1), ('9D', 1),
    ('10A', 1), ('10B', 1), ('10C', 1), ('10D', 1);

-- Chèn dữ liệu cho hạng Phổ thông (Economy) - Mã loại: 2 (Gồm 48 ghế)
INSERT INTO [Pbl3Db].[dbo].[Seat] ([codeSeat], [codeType])
VALUES 
    ('20A', 2), ('20B', 2), ('20C', 2), ('20D', 2), ('20E', 2), ('20F', 2),
    ('21A', 2), ('21B', 2), ('21C', 2), ('21D', 2), ('21E', 2), ('21F', 2),
    ('22A', 2), ('22B', 2), ('22C', 2), ('22D', 2), ('22E', 2), ('22F', 2),
    ('23A', 2), ('23B', 2), ('23C', 2), ('23D', 2), ('23E', 2), ('23F', 2),
    ('24A', 2), ('24B', 2), ('24C', 2), ('24D', 2), ('24E', 2), ('24F', 2),
    ('25A', 2), ('25B', 2), ('25C', 2), ('25D', 2), ('25E', 2), ('25F', 2),
    ('26A', 2), ('26B', 2), ('26C', 2), ('26D', 2), ('26E', 2), ('26F', 2),
    ('27A', 2), ('27B', 2), ('27C', 2), ('27D', 2), ('27E', 2), ('27F', 2);

PRINT 'Da do thanh cong 80 ghe vao bang Seat rui nhe chi oi! 🎉✈️';
SET NOCOUNT OFF;
GO

-- Kiểm tra lại kết quả sau khi đổ dữ liệu 📋
SELECT [codeSeat]
      ,[codeType]
  FROM [Pbl3Db].[dbo].[Seat]
  ORDER BY [codeType] DESC, LEN([codeSeat]) ASC, [codeSeat] ASC;