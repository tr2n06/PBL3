SET NOCOUNT ON;

-- 1. Bảng tạm chứa danh sách tuyến đường bay lấy TRỰC TIẾP từ bảng FromTo
DECLARE @FlightRoutes TABLE (
    Seq INT IDENTITY(1,1),
    codeFlight VARCHAR(20),
    length INT
);

INSERT INTO @FlightRoutes (codeFlight, length)
SELECT [codeFlight], [length]
FROM [Pbl3Db].[dbo].[FromTo];

DECLARE @MaxRoute INT = (SELECT COUNT(*) FROM @FlightRoutes);

-- 2. Định nghĩa số lượng chuyến bay muốn sinh
DECLARE @TotalFlightsToGenerate INT = CAST((RAND() * 11) + 45 AS INT);
DECLARE @Counter INT = 1;

-- Các biến tạm phục vụ tính toán
DECLARE @SelectedSeq INT;
DECLARE @CodeFlight VARCHAR(20);
DECLARE @Length INT;

DECLARE @RandomDaysOffset INT;
DECLARE @DepartureDate DATE;
DECLARE @RandomHour INT;
DECLARE @RandomMinute INT;
DECLARE @DepartureTime TIME;

DECLARE @PriceIndex NUMERIC(3,1);
DECLARE @DayOfWeek INT;
DECLARE @Price INT;

DECLARE @FlightDurationMinutes INT;
DECLARE @DepartDateTime DATETIME;
DECLARE @ArrivalDateTime DATETIME;
DECLARE @LandingDate DATE;
DECLARE @LandingTime TIME;
DECLARE @Status VARCHAR(20);

-- 3. Vòng lặp sinh dữ liệu rải rác
WHILE @Counter <= @TotalFlightsToGenerate
BEGIN
    -- Bốc ngẫu nhiên một đường bay có sẵn
    SET @SelectedSeq = CAST((RAND() * @MaxRoute) + 1 AS INT);

    SELECT
        @CodeFlight = codeFlight,
        @Length = length
    FROM @FlightRoutes
    WHERE Seq = @SelectedSeq;

    -- Sinh ngày bay ngẫu nhiên trong vòng 30 ngày tới
    SET @RandomDaysOffset = CAST(RAND() * 30 AS INT);
    SET @DepartureDate = DATEADD(DAY, @RandomDaysOffset, CAST(GETDATE() AS DATE));

    -- Sinh giờ cất cánh ngẫu nhiên
    SET @RandomHour = CAST(RAND() * 24 AS INT);

    SET @RandomMinute =
        CASE CAST(RAND() * 4 AS INT)
            WHEN 0 THEN 0
            WHEN 1 THEN 15
            WHEN 2 THEN 30
            ELSE 45
        END;

    SET @DepartureTime = TIMEFROMPARTS(@RandomHour, @RandomMinute, 0, 0, 0);

    -- Tính giá vé
    SET @DayOfWeek = DATEPART(WEEKDAY, @DepartureDate);

    IF @DayOfWeek = 1 OR @DayOfWeek = 7
        SET @PriceIndex = 1.5;
    ELSE
        SET @PriceIndex = 1.2;

    SET @Price = CAST((1200 * @PriceIndex * @Length) AS INT) + 200000;

    -- Giả lập thời gian bay
    SET @FlightDurationMinutes =
        CAST((CAST(@Length AS FLOAT) / 700.0) * 60.0 AS INT) + 30;

    -- Tính thời gian hạ cánh
    SET @DepartDateTime =
        CAST(@DepartureDate AS DATETIME) +
        CAST(@DepartureTime AS DATETIME);

    SET @ArrivalDateTime =
        DATEADD(MINUTE, @FlightDurationMinutes, @DepartDateTime);

    SET @LandingDate = CAST(@ArrivalDateTime AS DATE);
    SET @LandingTime = CAST(@ArrivalDateTime AS TIME);

    -- Trạng thái chuyến bay
    IF @DepartDateTime < GETDATE()
        SET @Status = 'arrived';
    ELSE
        SET @Status =
            CASE
                WHEN RAND() < 0.05 THEN 'cancelled'
                ELSE 'scheduled'
            END;

    -- Kiểm tra trùng khóa chính
    IF NOT EXISTS (
        SELECT 1
        FROM [dbo].[Flight]
        WHERE [codeFlight] = @CodeFlight
          AND [departureDate] = @DepartureDate
          AND [departureTime] = @DepartureTime
    )
    BEGIN
        INSERT INTO [Pbl3Db].[dbo].[Flight]
        (
            [codeFlight],
            [departureDate],
            [departureTime],
            [landingDate],
            [landingTime],
            [price],
            [status]
        )
        VALUES
        (
            @CodeFlight,
            @DepartureDate,
            @DepartureTime,
            @LandingDate,
            @LandingTime,
            @Price,
            @Status
        );

        SET @Counter = @Counter + 1;
    END
END

PRINT N'Đã sinh dữ liệu Flight thành công! ✈️';

SET NOCOUNT OFF;
GO

-- Kiểm tra dữ liệu
SELECT
    [codeFlight],
    [departureDate],
    [departureTime],
    [landingDate],
    [landingTime],
    [price],
    [status]
FROM [Pbl3Db].[dbo].[Flight]
ORDER BY
    [departureDate] ASC,
    [departureTime] ASC;