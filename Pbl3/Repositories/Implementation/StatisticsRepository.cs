using Microsoft.EntityFrameworkCore;
using Pbl3.DataAccess.Data;
using Pbl3.DTOs.Statistics;
using Pbl3.Repositories.Interfaces;


namespace Pbl3.Repositories.Implementations
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly AppDbContext _context;

        public StatisticsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<StatisticsResponseDTO> GetStatistics(string period)
        {
            // TODO: xử lý filter theo period
            // ví dụ: 1month, 3months, 6months, 1year

            DateOnly now = DateOnly.FromDateTime(DateTime.Now);

            DateOnly currentStart;
            DateOnly previousStart;
            DateOnly previousEnd;

            switch (period)
            {
                case "1month":
                    currentStart = now.AddMonths(-1);

                    previousStart = now.AddMonths(-2);
                    previousEnd = currentStart.AddDays(-1);
                    break;

                case "3months":
                    currentStart = now.AddMonths(-3);

                    previousStart = now.AddMonths(-6);
                    previousEnd = currentStart.AddDays(-1);
                    break;

                case "6months":
                    currentStart = now.AddMonths(-6);

                    previousStart = now.AddMonths(-12);
                    previousEnd = currentStart.AddDays(-1);
                    break;

                case "1year":
                    currentStart = now.AddYears(-1);

                    previousStart = now.AddYears(-2);
                    previousEnd = currentStart.AddDays(-1);
                    break;

                default:
                    currentStart = now.AddMonths(-1);

                    previousStart = now.AddMonths(-2);
                    previousEnd = currentStart.AddDays(-1);
                    break;
            }
            var allTickets = await (from t in _context.Ticket
                                    select t).ToListAsync();

            decimal currentRevenue = 0;
            decimal previousRevenue = 0;

            int currentBookings = 0;
            int previousBookings = 0;

            int currentCancellations = 0;
            int previousCancellations = 0;

            foreach (var t in allTickets)
            {
                DateOnly bookingTime = DateOnly.FromDateTime(t.booking.bookedTime);
                bool isCancelled = t.status == "Cancelled" || t.status == "cancelled" || t.status == "cancel";

                // CURRENT PERIOD
                if (bookingTime >= currentStart)
                {
                    currentRevenue += t.price;
                    currentBookings++;

                    if (isCancelled)
                    {
                        currentCancellations++;
                    }
                }
                // PREVIOUS PERIOD
                else if (
                    bookingTime >= previousStart &&
                    bookingTime <= previousEnd)
                {
                    previousRevenue += t.price;
                    previousBookings++;

                    if (isCancelled)
                    {
                        previousCancellations++;
                    }
                }
            }

            // ===== RATE =====

            double currentCancellationRate = 0;
            double previousCancellationRate = 0;

            if (currentBookings > 0)
            {
                currentCancellationRate = (double)currentCancellations / currentBookings * 100;
            }

            if (previousBookings > 0)
            {
                previousCancellationRate = (double)previousCancellations / previousBookings * 100;
            }

            // ===== CHANGE =====
            double revenueChange = 0;
            double bookingsChange = 0;
            double cancellationsChange = 0;
            double cancellationRateChange = 0;

            if (previousRevenue > 0)
            {
                revenueChange = (double)((currentRevenue - previousRevenue) / previousRevenue * 100);
            }

            if (previousBookings > 0)
            {
                bookingsChange = (double)(currentBookings - previousBookings) / previousBookings * 100;
            }

            if (previousCancellations > 0)
            {
                cancellationsChange = (double)(currentCancellations - previousCancellations) / previousCancellations * 100;
            }

            if (previousCancellationRate > 0)
            {
                cancellationRateChange = (currentCancellationRate - previousCancellationRate) / previousCancellationRate * 100;
            }

            // ===== RESPONSE =====

            var response = new StatisticsResponseDTO();

            response.Overview = new StatisticsOverviewDTO
            {
                TotalRevenue = currentRevenue,
                RevenueChange = Math.Round(revenueChange, 2),

                TotalBookings = currentBookings,
                BookingsChange = Math.Round(bookingsChange, 2),

                Cancellations = currentCancellations,
                CancellationsChange = Math.Round(cancellationsChange, 2),

                CancellationRate = Math.Round(currentCancellationRate, 2),

                CancellationRateChange = Math.Round(cancellationRateChange, 2)
            };
            // Revenue 

            var revenueMap = new Dictionary<int, RevenuePointDTO>();
            for (int month = 1; month <= 12; month++)
            {
                revenueMap[month] = new RevenuePointDTO
                {
                    Month = new DateTime(
                        now.Year,
                        month,
                        1
                    ).ToString("MMM"),

                    Revenue = 0,
                    Bookings = 0
                };
            }

            foreach (var t in allTickets)
            {
                DateOnly bookingTime =
                    DateOnly.FromDateTime(t.booking.bookedTime);

                if (bookingTime.Year != now.Year)
                {
                    continue;
                }

                int monthNumber = bookingTime.Month;

                if (!revenueMap.ContainsKey(monthNumber))
                {
                    revenueMap[monthNumber] = new RevenuePointDTO
                    {
                        Month = new DateTime(
                            now.Year,
                            monthNumber,
                            1
                        ).ToString("MMM"),

                        Revenue = 0,
                        Bookings = 0
                    };
                }

                revenueMap[monthNumber].Revenue += t.price;
                revenueMap[monthNumber].Bookings++;
            }

            response.RevenueData = revenueMap.Values.OrderBy(x =>
                                            DateTime.ParseExact(
                                                x.Month,
                                                "MMM",
                                                null
                                            ).Month).ToList();
            //CancellationData
            var cancellationMap = new Dictionary<int, CancellationTrendPointDTO>();

            // init đủ 12 tháng
            for (int month = 1; month <= 12; month++)
            {
                cancellationMap[month] = new CancellationTrendPointDTO
                {
                    Month = new DateTime(
                                                    now.Year,
                                                    month,
                                                    1
                                                ).ToString("MMM"),

                    Cancellations = 0,
                    Rate = 0
                };
            }

            foreach (var t in allTickets)
            {
                DateOnly bookingTime = DateOnly.FromDateTime(t.booking.bookedTime);
                if (bookingTime.Year != now.Year)
                {
                    continue;
                }

                int monthNumber = bookingTime.Month;

                // tổng bookings tháng đó
                cancellationMap[monthNumber].Rate++;

                // booking bị hủy
                if (t.status == "Cancelled" || t.status == "cancelled" || t.status == "cancel")
                {
                    cancellationMap[monthNumber]
                        .Cancellations++;
                }
            }

            // tính rate %
            foreach (var item in cancellationMap.Values)
            {
                if (item.Rate > 0)
                {
                    item.Rate =
                        Math.Round(
                            item.Cancellations
                            / item.Rate * 100,
                            2
                        );
                }
            }

            response.CancellationData = cancellationMap.Values.ToList();
            //CancellationReason
            var cancellationReasonMap = new Dictionary<string, int>();
            foreach (var t in allTickets)
            {
                if (t.status != "Cancelled" && t.status != "cancelled" && t.status != "cancel")
                {
                    continue;
                }

                string reason = t.request?.reason ?? "Unknown";

                if (!cancellationReasonMap.ContainsKey(reason))
                {
                    cancellationReasonMap[reason] = 0;
                }

                cancellationReasonMap[reason]++;
            }
            response.CancellationReasons = cancellationReasonMap.Select(x => new CancellationReasonItemDTO
            {
                Name = x.Key,
                Value = x.Value,

                // optional
                Color = x.Key switch
                {
                    "Payment Failed" => "#ff4d4f",
                    "Customer Changed Plan" => "#1890ff",
                    "Wrong Information" => "#faad14",
                    _ => "#52c41a"
                }
            }).ToList();

            //FrequentCancellers

            var customerMap = new Dictionary<int, HighRiskCustomerItemDTO>();

            foreach (var t in allTickets)
            {
                if (t.booking.idUser == null) continue;
                int customerId = t.booking.idUser ?? 0;

                if (!customerMap.ContainsKey(customerId))
                {
                    customerMap[customerId] = new HighRiskCustomerItemDTO
                    {
                        Id = customerId,
                        Name = t.booking.user.name,
                        Email = t.booking.user.email,
                        Cancellations = 0,
                        TotalBookings = 0,
                        Rate = 0,
                        Status = t.booking.user.status
                    };
                }

                customerMap[customerId].TotalBookings++;

                if (t.status == "Cancelled" || t.status == "cancelled" || t.status == "cancel")
                {
                    customerMap[customerId]
                        .Cancellations++;
                }
            }
            foreach (var customer in customerMap.Values)
            {
                if (customer.TotalBookings > 0)
                {
                    customer.Rate =
                        Math.Round(
                            (double)customer.Cancellations
                            / customer.TotalBookings * 100,
                            2
                        );
                }
            }
            response.FrequentCancellers = customerMap.Values
                                                    .Where(x =>
                                                        x.TotalBookings >= 5 &&
                                                        x.Rate >= 80)
                                                    .OrderByDescending(x => x.Rate)
                                                    .ToList();

            // CustommerOverview
            var totalCustomers = await _context.User.CountAsync();

            var activeCustomers = await _context.User.CountAsync(u => u.status == "active");

            var blockedCustomers = totalCustomers - activeCustomers;

            response.CustomerOverview = new CustomerOverviewDTO
            {
                TotalCustomers = totalCustomers,
                ActiveCustomers = activeCustomers,
                BlockedCustomers = blockedCustomers
            };

            return await Task.FromResult(response);
        }
    }
}