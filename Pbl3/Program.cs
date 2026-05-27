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

        builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
                                                                      .UseLazyLoadingProxies());
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

        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IMailService, MailService>();
        builder.Services.AddScoped<IBookingService, BookingService>();
        builder.Services.AddScoped<IFlightService, FlightService>();
        builder.Services.AddScoped<ITicketService, TicketService>();
        builder.Services.AddScoped<IBaggageService, BaggageService>();
        builder.Services.AddScoped<IStatisticsService, StatisticsService>();
        builder.Services.AddScoped<IPromotionService, PromotionService>();
        builder.Services.AddScoped<IRequestService, RequestService>();

        builder.Services.AddMemoryCache();

        builder.Services.Configure<MailSettings>(
            builder.Configuration.GetSection("MailSettings")
        );

        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
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

        app.Run();
        return Task.CompletedTask;
    }
}