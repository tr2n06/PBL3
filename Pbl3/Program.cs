using Pbl3.Config;
using Pbl3.DataAccess.Data;
using Pbl3.Services.Implementation;
using Pbl3.Services.Interface;
using Pbl3.Repositories.Implementation;
using Pbl3.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using Pbl3.Repositories.Interfaces;
using Pbl3.Repositories.Implementations;
using Pbl3.Services.Interfaces;
using Pbl3.Services.Implementations;

public partial class Program
{
    static Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
                builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseLazyLoadingProxies()
           .EnableSensitiveDataLogging()
           .EnableDetailedErrors()
);
        builder.Services.AddLogging(logging =>
        {
            logging.AddConsole();
            logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Information);
        });

        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<ITicketRepository, TicketRepository>();
        builder.Services.AddScoped<IFlightRepository, FlightRepository>();
        builder.Services.AddScoped<IBookingRepository, BookingRepository>();
        builder.Services.AddScoped<IBaggageRepository, BaggageRepository>();
        builder.Services.AddScoped<IStatisticsRepository, StatisticsRepository>();
        builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
        builder.Services.AddScoped<IRequestRepository, RequestRepository>();
        builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IMailService, MailService>();
        builder.Services.AddScoped<IBookingService, BookingService>();
        builder.Services.AddScoped<IFlightService, FlightService>();
        builder.Services.AddScoped<ITicketService, TicketService>();
        builder.Services.AddScoped<IBaggageService, BaggageService>();
        builder.Services.AddScoped<IStatisticsService, StatisticsService>();
        builder.Services.AddScoped<IPromotionService, PromotionService>();
        builder.Services.AddScoped<IRequestService, RequestService>();
        builder.Services.AddScoped<IPaymentService, PaymentService>();

        builder.Services.AddMemoryCache();

        builder.Services.Configure<MailSettings>(
            builder.Configuration.GetSection("MailSettings")
        );

        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var allowedOrigins = new List<string>
        {
            "http://localhost:3000",
            "http://localhost:5173"
        };

        try
        {
            var host = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    string ipStr = ip.ToString();
                    if (ipStr != "127.0.0.1")
                    {
                        allowedOrigins.Add($"http://{ipStr}:3000");
                        allowedOrigins.Add($"http://{ipStr}:5173");
                    }
                }
            }
        }
        catch (Exception) { }

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.SetIsOriginAllowed(origin => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseRouting();

        app.UseCors("AllowFrontend");

        app.UseAuthentication(); // nếu có cookie auth/login
        app.UseAuthorization();

        app.UseStaticFiles();

        app.MapControllers();

        using (var scope = app.Services.CreateScope())
        {
            try
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                context.Database.ExecuteSqlRaw(@"
                    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Baggage_codeTransaction' AND object_id = OBJECT_ID('Baggage'))
                    BEGIN
                        DROP INDEX IX_Baggage_codeTransaction ON Baggage;
                    END
                ");
                Console.WriteLine("[DB SETUP] Successfully verified/dropped unique index IX_Baggage_codeTransaction.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DB SETUP] Warning: Could not drop index IX_Baggage_codeTransaction: {ex.Message}");
            }
        }

        app.Run();
        return Task.CompletedTask;
    }
}