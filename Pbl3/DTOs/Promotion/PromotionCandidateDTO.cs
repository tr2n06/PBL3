namespace Pbl3.DTOs.Promotion
{
    public class PromotionCandidateDTO
{
    public string flightId { get; set; }
    public string flightNumber { get; set; }
    public string route { get; set; }

    public string departureDate { get; set; }
    public double occupancyRate { get; set; }

    public decimal economyPrice { get; set; }
}
}