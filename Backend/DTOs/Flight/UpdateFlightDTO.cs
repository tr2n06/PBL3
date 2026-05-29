namespace Pbl3.DTOs.Flight
{
    public class UpdateFlightDTO
    {
       public string? flightNumber { get; set; }
        //tên viết tắt
        public string arrivalCode { get; set; }
        public string departureCode { get; set; }
        public DateOnly arriveDate { get; set; }
        public TimeOnly arriveTime { get; set; }
        public DateOnly departureDate { get; set; }
        public TimeOnly departureTime { get; set; }
        public int? price { get; set; }
        

    }
}
