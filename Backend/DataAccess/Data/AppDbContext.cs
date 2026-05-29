using Microsoft.EntityFrameworkCore;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Promotions;

namespace Pbl3.DataAccess.Data
{
      public class AppDbContext : DbContext
      {

            public DbSet<User> User { get; set; }
            public DbSet<Passenger> Passenger { get; set; }
            public DbSet<Staff> Staff { get; set; }
            public DbSet<StaffRequest> StaffRequest { get; set; }
            public DbSet<Admin> Admin { get; set; }
            public DbSet<Transaction> Transaction { get; set; }
            public DbSet<Booking> Booking { get; set; }
            public DbSet<Ticket> Ticket { get; set; }
            public DbSet<CancelRequest> CancelRequest { get; set; }
            public DbSet<Flight> Flight { get; set; }
            public DbSet<Seat> Seat { get; set; }
            public DbSet<FlightSeat> FlightSeat { get; set; }
            public DbSet<DiscountFlight> DiscountFlight { get; set; }
            public DbSet<FlightRequest> FlightRequest { get; set; }
            public DbSet<TicketType> TicketType { get; set; }
            public DbSet<Baggage> Baggage { get; set; }
            public DbSet<City> City { get; set; }
            public DbSet<FromTo> FromTo { get; set; }
            public DbSet<Promotion> Promotions { get; set; }
            public DbSet<PromotionRequest> PromotionRequests { get; set; }
            public DbSet<PromotionCancelRequest> PromotionCancelRequests { get; set; }
            public DbSet<Request> Requests { get; set; }
            public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
            {
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
                  modelBuilder.Entity<Passenger>();
                  modelBuilder.Entity<Staff>();
                  modelBuilder.Entity<StaffRequest>();
                  modelBuilder.Entity<Admin>();
                  modelBuilder.Entity<Booking>(entity =>
                  {
                        entity.HasOne(b => b.user)
                        .WithMany(user => user.bookings)
                        .HasForeignKey(b => b.idUser)
                        .OnDelete(DeleteBehavior.SetNull);
                        entity.HasOne(b => b.transaction)
                        .WithOne()
                        .HasForeignKey<Booking>(b => b.codeTransaction)
                        .OnDelete(DeleteBehavior.Restrict);
                  });
                  modelBuilder.Entity<Ticket>(entity =>
                  {
                        entity.HasIndex(seat => new
                        {
                              seat.codeSeat,
                              seat.codeFlight,
                              seat.arriveDate,
                              seat.arriveTime
                        }).IsUnique();
                        entity.HasOne(t => t.booking)
                        .WithMany(b => b.tickets)
                        .HasForeignKey(t => t.codeBooking)
                        .OnDelete(DeleteBehavior.Restrict);
                        entity.HasOne(t => t.seat)
                        .WithOne()
                        .HasForeignKey<Ticket>(t => new { t.codeSeat, t.codeFlight, t.arriveDate, t.arriveTime })
                        .OnDelete(DeleteBehavior.NoAction);
                        entity.HasOne(t => t.flight)
                        .WithMany(f => f.tickets)
                        .HasForeignKey(t => new { t.codeFlight, t.arriveDate, t.arriveTime })
                        .OnDelete(DeleteBehavior.NoAction);
                  });
                  modelBuilder.Entity<CancelRequest>(entity =>
                  {
                        entity.HasOne(r => r.ticket)
                        .WithOne(t => t.request)
                        .HasForeignKey<CancelRequest>(r => r.codeTicket)
                        .OnDelete(DeleteBehavior.Restrict);
                  });
                  modelBuilder.Entity<TicketType>(entity =>
                  {
                        entity.HasIndex(type => type.name).IsUnique(true);
                  });
                  modelBuilder.Entity<Flight>(entity =>
                  {
                        entity.HasKey(f => new { f.codeFlight, f.arriveDate, f.arriveTime });
                        entity.HasOne(f => f.fromTo)
                        .WithOne()
                        .HasForeignKey<Flight>(f => f.codeFlight)
                        .OnDelete(DeleteBehavior.NoAction);
                  });
                  modelBuilder.Entity<Seat>(entity =>
                  {
                        entity.HasKey(seat => seat.codeSeat);
                        entity.HasOne(seat => seat.type)
                        .WithMany()
                        .HasForeignKey(seat => seat.codeType)
                        .OnDelete(DeleteBehavior.SetNull);
                  });
                  modelBuilder.Entity<FlightSeat>(entity =>
                  {
                        entity.HasKey(seat => new { seat.codeSeat, seat.codeFlight, seat.arriveDate, seat.arriveTime });
                        entity.HasOne(seat => seat.flight)
                        .WithMany(f => f.flightSeats)
                        .HasForeignKey(seat => new { seat.codeFlight, seat.arriveDate, seat.arriveTime })
                        .OnDelete(DeleteBehavior.Cascade);

                        entity.HasOne(seat => seat.seat)
                      .WithOne()
                      .HasForeignKey<FlightSeat>(seats => seats.codeSeat)
                      .OnDelete(DeleteBehavior.NoAction);
                  });
                  modelBuilder.Entity<DiscountFlight>(entity =>
                  {
                        entity.HasKey(f => new { f.codeFlight, f.arriveDate, f.arriveTime });
                        entity.HasOne(df => df.flight)
                        .WithOne(f => f.discountFlight)
                        .HasForeignKey<DiscountFlight>(df => new { df.codeFlight, df.arriveDate, df.arriveTime })
                        .OnDelete(DeleteBehavior.Cascade);
                  });
                  modelBuilder.Entity<FlightRequest>(entity =>
                  {
                        entity.HasOne(r => r.flight)
                        .WithMany(f => f.requests)
                        .HasForeignKey(r => new { r.codeFlight, r.arriveDate, r.arriveTime })
                        .OnDelete(DeleteBehavior.Restrict);
                  });
                  modelBuilder.Entity<FromTo>(entity =>
                  {
                        entity.HasOne(ft => ft.fromCity)
                        .WithMany()
                        .HasForeignKey(ft => ft.from)
                        .OnDelete(DeleteBehavior.NoAction);

                        entity.HasOne(ft => ft.toCity)
                        .WithMany()
                        .HasForeignKey(ft => ft.to)
                        .OnDelete(DeleteBehavior.NoAction);
                  });
                  modelBuilder.Entity<City>(entity =>
                  {
                        entity.HasIndex(c => c.fullName).IsUnique(true);
                        entity.HasIndex(c => c.airplane).IsUnique(true);
                  });
                  modelBuilder.Entity<Baggage>(entity =>
                  {
                        entity.HasOne(b => b.ticket)
                        .WithMany(t => t.baggages)
                        .HasForeignKey(b => b.codeTicket)
                        .OnDelete(DeleteBehavior.Cascade);
                        entity.HasOne(b => b.transaction)
                          .WithOne()
                          .HasForeignKey<Baggage>(b => b.codeTransaction)
                          .OnDelete(DeleteBehavior.Restrict);
                  });
                  modelBuilder.Entity<Promotion>(entity =>
                  {
                        entity.HasOne(p => p.flight)
                        .WithOne(f => f.promotion)
                        .HasForeignKey<Promotion>(p => new { p.codeFlight, p.arriveDate, p.arriveTime })
                        .OnDelete(DeleteBehavior.Cascade);
                  });
                  modelBuilder.Entity<PromotionRequest>(entity =>
                  {

                        entity.HasOne(p => p.flight)
                        .WithOne()
                        .HasForeignKey<PromotionRequest>(p => new { p.codeFlight, p.arriveDate, p.arriveTime })
                        .OnDelete(DeleteBehavior.Cascade);
                  });
                  modelBuilder.Entity<PromotionCancelRequest>(entity =>
                  {

                        entity.HasOne(p => p.promotion)
                        .WithOne(p => p.cancelRequest)
                        .HasForeignKey<PromotionCancelRequest>(p => new { p.promotion_id})
                        .OnDelete(DeleteBehavior.Cascade);
                  });
                  modelBuilder.Entity<Request>().UseTptMappingStrategy();
                  modelBuilder.Entity<Request>(entity =>
                  {
                        entity.HasOne(re => re.requester)
                              .WithMany(p => p.requests)
                              .HasForeignKey(re => re.requester_id)
                              .OnDelete(DeleteBehavior.SetNull);

                        entity.HasOne(re => re.reviewer)
                        .WithMany(p => p.solved)
                        .HasForeignKey(re => re.reviewer_id)
                        .OnDelete(DeleteBehavior.NoAction);

                  });

            }
      }
}
