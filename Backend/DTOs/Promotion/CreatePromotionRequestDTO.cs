namespace Pbl3.DTOs.Promotion
{
    public class CreatePromotionRequestDTO
{
    public int? requester_id { get; set; }
    public string flightId { get; set; }
    public int discount { get; set; }
    public string reason { get; set; }

    public string? codeFlight { get; set; }
    public DateOnly? arriveDate { get; set; }
    public TimeOnly? arriveTime { get; set; }
} 
}
