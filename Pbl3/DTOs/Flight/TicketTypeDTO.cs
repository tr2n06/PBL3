namespace Pbl3.DTOs.Flight
{
    public class TicketTypeDTO
    {
        public int codeType { get; set; }
        public string name { get; set; }
        public decimal priceBooked { get; set; }
        public Boolean canBeUpgrade { get; set; }
        public Boolean canBeCanceled { get; set; }
        public int weightBaggage { get; set; }
    }
}
