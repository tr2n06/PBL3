-- Sử dụng CROSS JOIN để nhân bản đúng 80 ghế từ bảng Seat cho từng chuyến bay trong bảng Flight
WITH FlightSeatData AS (
    SELECT
        s.[codeSeat],
        f.[codeFlight],
        f.[departureDate],
        f.[departureTime]
    FROM [Pbl3Db].[dbo].[Flight] f
    CROSS JOIN [Pbl3Db].[dbo].[Seat] s
)
INSERT INTO [Pbl3Db].[dbo].[FlightSeat]
(
    [codeSeat],
    [codeFlight],
    [departureDate],
    [departureTime],
    [isBooked],
    [ticketcodeTicket]
)
SELECT
    [codeSeat],
    [codeFlight],
    [departureDate],
    [departureTime],
    0 AS [isBooked],
    NULL AS [ticketcodeTicket]
FROM FlightSeatData;

PRINT N'Đã đổ thành công 80 ghế trống cho từng chuyến bay vào bảng FlightSeat! ✈️';
GO

-- Kiểm tra kết quả
SELECT TOP (100)
      [codeSeat]
    , [codeFlight]
    , [departureDate]
    , [departureTime]
    , [isBooked]
    , [ticketcodeTicket]
FROM [Pbl3Db].[dbo].[FlightSeat]
ORDER BY
      [departureDate] ASC
    , [departureTime] ASC
    , LEN([codeSeat]) ASC
    , [codeSeat] ASC FROM [Pbl3Db].[dbo].[FlightSeat];