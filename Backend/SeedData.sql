USE Pbl3Db;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. Disable all constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Drop the restrictive unique index on FlightSeat.codeSeat if it exists
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FlightSeat_codeSeat' AND object_id = object_id('FlightSeat'))
BEGIN
    DROP INDEX IX_FlightSeat_codeSeat ON FlightSeat;
END

-- 2. Clear old data in reverse order of dependencies
DELETE FROM [Baggage];
DELETE FROM [CancelRequest];
DELETE FROM [Ticket];
DELETE FROM [Booking];
DELETE FROM [Transaction];
DELETE FROM [FlightSeat];
DELETE FROM [DiscountFlights];
DELETE FROM [Promotion];
DELETE FROM [PromotionRequest];
DELETE FROM [PromotionCancelRequest];
DELETE FROM [FlightRequest];
DELETE FROM [Flight];
DELETE FROM [FromTo];
DELETE FROM [Seat];
DELETE FROM [TicketType];
DELETE FROM [City];
DELETE FROM [Passenger];
DELETE FROM [Staff];
DELETE FROM [Admin];
DELETE FROM [User];

-- Clear Accounts table if exists
IF OBJECT_ID(N'[dbo].[Accounts]', N'U') IS NOT NULL DELETE FROM [Accounts];

-- 3. Reset Identity columns
EXEC sp_MSforeachtable '
IF OBJECTPROPERTY(OBJECT_ID(''?''), ''TableHasIdentity'') = 1
    DBCC CHECKIDENT (''?'', RESEED, 0)
';

-- 3.5. Create and Seed Accounts table (if not exists)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Accounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Accounts] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [AccountNumber] NVARCHAR(100),
        [AccountName] NVARCHAR(250),
        [BankName] NVARCHAR(250),
        CONSTRAINT UC_Account UNIQUE (AccountNumber, BankName)
    );
END;

IF NOT EXISTS (SELECT * FROM Accounts)
BEGIN
    INSERT INTO Accounts (AccountNumber, AccountName, BankName) VALUES
    ('190354678120', 'NGUYEN VAN A', 'CB Bank - Ngan hang Con Bo'),
    ('123456789', 'TRAN THI B', 'MEOMEUBank - Ngan hang Quoc Te Meo'),
    ('987654321', 'PHAM VAN C', 'UUET Bank - Ngan hang Cong Nghe'),
    ('111111111', 'LE THI D', 'VinaFake Bank - Chi nhanh Demo');
END;

-- 4. Seed TicketType with synchronized pricing mapped to service indices
-- codeType = 1 -> Thương gia (Business) but mapped to bussiness price in backend (TicketType 1)
-- codeType = 2 -> Phổ thông (Economy) but mapped to economy price in backend (TicketType 2)
-- codeType = 3 -> Hạng nhất (First Class) but mapped to firstClass price in backend (TicketType 3)
SET IDENTITY_INSERT TicketType ON;
INSERT INTO TicketType (codeType, name, priceBooked, canBeUpgrade, canBeCanceled, weightBaggage) VALUES
(1, N'Thương gia (Business)', 1500000.00, 1, 1, 30),
(2, N'Phổ thông (Economy)', 800000.00, 1, 1, 20),
(3, N'Hạng nhất (First Class)', 2500000.00, 1, 1, 40);
SET IDENTITY_INSERT TicketType OFF;

-- 5. Seed all 10 cities matching Frontend options
INSERT INTO City (abbreviatedName, fullName, airplane) VALUES
('HAN', N'Hà Nội', N'Sân bay Quốc tế Nội Bài'),
('DAD', N'Đà Nẵng', N'Sân bay Quốc tế Đà Nẵng'),
('SGN', N'TP. Hồ Chí Minh', N'Sân bay Quốc tế Tân Sơn Nhất'),
('HUI', N'Huế', N'Sân bay Phú Bài'),
('CXR', N'Nha Trang', N'Sân bay Cam Ranh'),
('PQC', N'Phú Quốc', N'Sân bay Phú Quốc'),
('DLI', N'Đà Lạt', N'Sân bay Liên Khương'),
('VII', N'Vinh', N'Sân bay Vinh'),
('VCL', N'Chu Lai', N'Sân bay Chu Lai'),
('UIH', N'Quy Nhơn', N'Sân bay Phù Cát');

-- 6. Generate FromTo automatically for all 90 directional pairs
INSERT INTO FromTo (codeFlight, [from], [to], length)
SELECT 
    'VN' + CAST(100 + ROW_NUMBER() OVER (ORDER BY c1.abbreviatedName, c2.abbreviatedName) AS VARCHAR(4)),
    c1.abbreviatedName,
    c2.abbreviatedName,
    CAST(300 + (ABS(CHECKSUM(NEWID())) % 1200) AS FLOAT)
FROM City c1
CROSS JOIN City c2
WHERE c1.abbreviatedName <> c2.abbreviatedName;

-- 7. Seed Seats with proper layout and types matching Frontend expectations
-- First class: rows 1-4, A-B (codeType = 3)
INSERT INTO Seat (codeSeat, codeType) VALUES
('1A', 3), ('1B', 3),
('2A', 3), ('2B', 3),
('3A', 3), ('3B', 3),
('4A', 3), ('4B', 3);

-- Business: rows 5-10, A-D (codeType = 2)
INSERT INTO Seat (codeSeat, codeType) VALUES
('5A', 2), ('5B', 2), ('5C', 2), ('5D', 2),
('6A', 2), ('6B', 2), ('6C', 2), ('6D', 2),
('7A', 2), ('7B', 2), ('7C', 2), ('7D', 2),
('8A', 2), ('8B', 2), ('8C', 2), ('8D', 2),
('9A', 2), ('9B', 2), ('9C', 2), ('9D', 2),
('10A', 2), ('10B', 2), ('10C', 2), ('10D', 2);

-- Economy: rows 20-27, A-F (codeType = 1)
INSERT INTO Seat (codeSeat, codeType) VALUES
('20A', 1), ('20B', 1), ('20C', 1), ('20D', 1), ('20E', 1), ('20F', 1),
('21A', 1), ('21B', 1), ('21C', 1), ('21D', 1), ('21E', 1), ('21F', 1),
('22A', 1), ('22B', 1), ('22C', 1), ('22D', 1), ('22E', 1), ('22F', 1),
('23A', 1), ('23B', 1), ('23C', 1), ('23D', 1), ('23E', 1), ('23F', 1),
('24A', 1), ('24B', 1), ('24C', 1), ('24D', 1), ('24E', 1), ('24F', 1),
('25A', 1), ('25B', 1), ('25C', 1), ('25D', 1), ('25E', 1), ('25F', 1),
('26A', 1), ('26B', 1), ('26C', 1), ('26D', 1), ('26E', 1), ('26F', 1),
('27A', 1), ('27B', 1), ('27C', 1), ('27D', 1), ('27E', 1), ('27F', 1);

-- 8. Seed Flights: exactly one flight per route (codeFlight has unique index)
INSERT INTO Flight (codeFlight, arriveDate, arriveTime, landingDate, landingTime, price, status)
SELECT 
    ft.codeFlight,
    CAST('2026-06-15' AS DATE),
    CAST('08:00:00' AS TIME),
    CAST('2026-06-15' AS DATE),
    CAST('10:15:00' AS TIME),
    1200000.00,
    'scheduled'
FROM FromTo ft;

-- 9. Populate FlightSeat mapping for ALL generated flights
INSERT INTO FlightSeat (codeSeat, codeFlight, arriveDate, arriveTime, isBooked)
SELECT s.codeSeat, f.codeFlight, f.arriveDate, f.arriveTime, 0
FROM Flight f
CROSS JOIN Seat s;

-- 10. Seed Mock Users matching TPT mapping strategy (Admin=1-10, Staff=11-50, Passenger=51+)
-- Common User properties
INSERT INTO [User] (id, name, gender, phoneNumber, email, status, pass, createdAt, dateOfBirth, address) VALUES
(1, 'Admin', 1, '0000000001', 'admin@airline.com', 'active', '123456', GETDATE(), NULL, NULL),
(11, 'Staff A', 1, '0000000002', 'staff@airline.com', 'active', '123456', GETDATE(), NULL, NULL),
(51, N'Nguyễn Văn A', 1, '0912345678', 'meomeo@gmail.com', 'active', '123456', GETDATE(), '1998-05-15', N'Đà Nẵng');

-- Specific child table insertions
INSERT INTO [Admin] (id, joinedDate) VALUES (1, CAST(GETDATE() AS DATE));
INSERT INTO [Staff] (id, joinedDate) VALUES (11, CAST(GETDATE() AS DATE));
INSERT INTO [Passenger] (id, pointReward) VALUES (51, 100);

-- 11. Re-enable all constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';

PRINT N'Thành công! Toàn bộ cơ sở dữ liệu đã được khởi tạo hoàn hảo!';
