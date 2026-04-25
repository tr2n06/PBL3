using Microsoft.EntityFrameworkCore;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Flights;

namespace Pbl3.DataAccess.Data
{
    public class AppDbContext : DbContext
    {
        private string connectionString = "Server=.\\SQLEXPRESS;Database=Pbl3Db;User Id=sa;Password=Sa@1234567890;TrustServerCertificate=True;";

        public DbSet<User> User { get; set; }
        public DbSet<Passenger> Passenger { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<Admin> Admin { get; set; }
        public DbSet<Transaction> Transaction { get; set; }
        public DbSet<Booking> Booking { get; set; }
        public DbSet<Ticket> Ticket { get; set; }
        public DbSet<Flight> Flight { get; set; }
        public DbSet<FlightSeat> FlightSeat { get; set; }
        public DbSet<TicketType> TicketType { get; set; }
        public DbSet<Baggage> Baggage { get; set; }
        public DbSet<City> City { get; set; }
        public DbSet<FromTo> FromTo { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        private ILoggerFactory GetLoggerFactory()
        {
            IServiceCollection serviceCollection = new ServiceCollection();
            serviceCollection.AddLogging(builder =>
                    builder.AddConsole()
                           .AddFilter(DbLoggerCategory.Database.Command.Name, LogLevel.Information));
            return serviceCollection.BuildServiceProvider().GetService<ILoggerFactory>();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            ILoggerFactory loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            optionsBuilder.UseSqlServer(connectionString)            // thiết lập làm việc với SqlServer
                          .UseLoggerFactory(loggerFactory)      // thiết lập logging
                          .UseLazyLoadingProxies();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().UseTptMappingStrategy();
            modelBuilder.Entity<User>(entity => 
            {
                entity.HasIndex(p => p.name).IsUnique(true);
                entity.HasIndex(p => p.phoneNumber).IsUnique(true);
                entity.HasIndex(p => p.email).IsUnique(true);
            });
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasOne(b => b.user)
                      .WithMany(user => user.bookings)
                      .HasForeignKey(b => b.idUser)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(b => b.transaction)
                      .WithOne()
                      .HasForeignKey<Booking>(b => b.codeTransaction)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasIndex(seat => new {
                    seat.codeSeat,
                    seat.codeFlight,
                    seat.arriveDate,
                    seat.arriveTime
                }).IsUnique();
                entity.HasOne(t => t.booking)
                      .WithMany(b => b.tickets)
                      .HasForeignKey(t => t.codeBooking)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(t => t.seat)
                      .WithOne()
                      .HasForeignKey<Ticket>(t => new { t.codeSeat, t.codeFlight, t.arriveDate, t.arriveTime })
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(t => t.flight)
                      .WithMany(f => f.tickets)
                      .HasForeignKey(t => new { t.codeFlight, t.arriveDate, t.arriveTime })
                      .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<TicketType>(entity => {
                entity.HasIndex(type => type.name).IsUnique(true);
            });
            modelBuilder.Entity<Flight>(entity =>
            {
                entity.HasKey(f => new { f.codeFlight, f.arriveDate, f.arriveTime });
                entity.HasOne(f => f.fromTo)
                      .WithOne()
                      .HasForeignKey<Flight>(f => f.codeFlight)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<FlightSeat>(entity =>
            {
                entity.HasKey(seat => new { seat.codeSeat, seat.codeFlight, seat.arriveDate, seat.arriveTime });
                entity.HasOne(seat => seat.flight)
                      .WithMany(f => f.flightSeats)
                      .HasForeignKey(seat => new { seat.codeFlight, seat.arriveDate, seat.arriveTime })
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(seat => seat.type)
                      .WithOne()
                      .HasForeignKey<FlightSeat>(seat => seat.codeType)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<FromTo>(entity =>
            {
                entity.HasOne(ft => ft.fromCity)
                      .WithMany()
                      .HasForeignKey(ft => ft.from)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ft => ft.toCity)
                      .WithMany()
                      .HasForeignKey(ft => ft.to)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<City>(entity => {
                entity.HasIndex(c => c.fullName).IsUnique(true);
                entity.HasIndex(c => c.airplane).IsUnique(true);
            });
            modelBuilder.Entity<Baggage>(entity =>
            {
                entity.HasKey(fb => new { fb.codeTicket, fb.codeTransaction });
                entity.HasOne(b => b.ticket)
                      .WithMany(t => t.baggages)
                      .HasForeignKey(b => b.codeTicket)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(b => b.transaction)
                        .WithOne()
                        .HasForeignKey<Baggage>(b => b.codeTransaction)
                        .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
