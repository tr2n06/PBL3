using System.Collections.Generic;

namespace Pbl3.DTOs.Bookings
{
    public class ListTicketDTO
    {
        public List<RoundTicketsDTO> roundTickets { get; set; } = new List<RoundTicketsDTO>();
        public List<TicketDTO> tickets { get; set; } = new List<TicketDTO>();
    }

    public class RoundTicketsDTO
    {
        public TicketDTO ticket { get; set; }
        public TicketDTO returnTicket { get; set; }
    }
}
