using System.Threading.Tasks;
using Pbl3.DTOs.Bookings;

namespace Pbl3.Services.Interface
{
    public interface IPaymentService
    {
        Task<object> ProcessPaymentCompleteAsync(CompletePaymentRequestDTO request, int? loggedInUserId, string? userType, string? clientHost);
        Task<object> ConfirmPaymentAsync(string orderId, string bankName, string accountNumber, string accountName, long amount);
        Task<object> ConfirmSuccessPaymentAsync(PaymentConfirmSuccessRequestDTO request);
        Task<string> CheckBookingStatusAsync(string bookingRef);
    }
}
