namespace Pbl3.DTOs.Flight
{
    public class LowBookingDTORequest
    {
        public int account_id {  get; set; }
        public string codeFlight {  get; set; }
        public string departureDate { get; set; }
        public string departureTime { get; set; }
        public int? discount { get; set; }
        public string type { get; set; } //insert, delete
        public string? state { get; set; }
    }
}
//