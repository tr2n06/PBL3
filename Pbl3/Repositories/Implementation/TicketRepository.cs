using Pbl3.DTOs.Bookings;
using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DTOs.Flight;
using Microsoft.EntityFrameworkCore;

namespace Pbl3.Repositories.Implementation
{
    public class TicketRepository : ITicketRepository
    {
        AppDbContext context;
        public TicketRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task insertTicket(TicketRequestDTO dto)
        {
            await context.Ticket.AddAsync(new Ticket
            {
                codeTicket = dto.codeTicket,
                codeBooking = dto.codeBooking ?? "",
                codeFlight = dto.codeFlight ?? "",
                codeSeat = dto.codeSeat,
                arriveDate = dto.arriveDate ?? default,
                arriveTime = dto.arriveTime ?? default,
                name = dto.name ?? "",
                identityCard = dto.identityCard ?? "",
                email = dto.email ?? "",
                status = "pending",
                CanSelectSeat = dto.CanSelectSeat ?? false
            });
            await context.SaveChangesAsync();
        }
        public async Task updateTicket(TicketRequestDTO dto)
        {
            var ticket = await (from t in context.Ticket
                                where dto.codeTicket == t.codeTicket
                                select t).FirstOrDefaultAsync();
            if (ticket != null)
            {
                ticket.codeSeat = dto.codeSeat ?? ticket.codeSeat;
                ticket.arriveDate = dto.arriveDate ?? ticket.arriveDate;
                ticket.arriveTime = dto.arriveTime ?? ticket.arriveTime;
                ticket.name = dto.name ?? ticket.name;
                ticket.identityCard = dto.identityCard ?? ticket.identityCard;
                ticket.CanSelectSeat = dto.CanSelectSeat ?? ticket.CanSelectSeat;
                ticket.status = dto.state ?? "pending";
                await context.SaveChangesAsync();
            }

        }
        public async Task deleteTicket(TicketRequestDTO dto)
        {
            var ticket = await (from t in context.Ticket
                                where dto.codeTicket == t.codeTicket
                                select t).FirstOrDefaultAsync();
            if (ticket != null)
            {
                context.Ticket.Remove(ticket);
                await context.SaveChangesAsync();
            }

        }
        public async Task<TicketResponseDTO> getTicket(string codeTicket)
        {
            var ticket = await (from t in context.Ticket
                                where codeTicket == t.codeTicket
                                select new TicketResponseDTO
                                {
                                    id = t.codeTicket,
                                    bookingRef = t.codeBooking,
                                    status = t.status,
                                    seatNumber = t.codeSeat?? "",
                                    passengerName = t.name,
                                    price = t.price,
                                    ticketClass = t.seat.seat.type.name,
                                }).FirstOrDefaultAsync();
            return ticket;

        }
        public async Task<List<TicketDTO>> getTicketByBookingCode(string codeBooking)
        {
            var tickets = await (from t in context.Ticket
                                 where codeBooking == t.codeBooking
                                 select new TicketDTO
                                 {
                                     id = t.codeTicket,
                                     bookingRef = t.codeBooking,
                                     bookedAt = t.booking.bookedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                     totalPrice = t.price,
                                     status = t.status,
                                     seatNumber = t.codeSeat,
                                     passengerName = t.name,
                                     passengerEmail = t.email,
                                     ticketClass = t.seat.seat.type.name,
                                 }).ToListAsync();
            return tickets;
        }
        public async Task<int> getNumberOfTicketByCode(string code)
        {
            var number = await (from t in context.Ticket
                                where code == t.codeTicket.Substring(0, 14)
                                select t).CountAsync();
            return number;
        }
        public async Task<BaggageApiDTO> getBaggageByTickets(string codeTicket)
        {
            var bs = await (from b in context.Baggage
                            where b.codeTicket == codeTicket
                            select b).ToListAsync();
            BaggageApiDTO dto = new BaggageApiDTO();
            dto.cabin = 0;
            dto.checkedBaggage = 0;
            foreach (var b in bs)
            {
                if (b.type == "cabin") dto.cabin++;
                else dto.checkedBaggage++;
            }
            return dto;
        }
        public async Task<List<TicketDTO>> getTickets(int id)
        {
            var tickets = await (from t in context.Ticket
                                 where id == t.booking.idUser
                                 select new TicketDTO
                                 {
                                     id = t.codeTicket,
                                     bookingRef = t.codeBooking,
                                     bookedAt = t.booking.bookedTime.ToString("dd/MM/yyyy HH:mm:ss"),
                                     totalPrice = t.price,
                                     status = t.status,
                                     seatNumber = t.codeSeat,
                                     passengerName = t.name,
                                     passengerEmail = t.email,
                                     ticketClass = t.seat.seat.type.name,
                                 }).ToListAsync();
            return tickets;
        }
    }
}
