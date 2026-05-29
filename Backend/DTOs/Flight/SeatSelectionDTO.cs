namespace Pbl3.DTOs.Flight
{
    public class SeatSelectionDTO
    {
        public string codeSeat { get; set; }
        public string codeFlight { get; set; }
        public DateOnly arriveDate { get; set; }
        public TimeOnly arriveTime { get; set; }
        public int? codeType { get; set; }
        public Boolean? isBooked { get; set; }
    }
}
