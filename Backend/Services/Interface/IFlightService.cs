using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
namespace Pbl3.Services.Interface
{
    public interface IFlightService
    {
        public Task insertFlight(CreateFlightDTO dto);
        public Task insertDiscountFlight(LowBookingDTORequest dto);
        public Task updateFlight(string flightId, UpdateFlightDTO dto);
        public Task<List<FlightDTO>> getFlights(FlightSearchDTO dto);
        public Task<List<FlightDTO>> getAllFlights();
        public Task<FlightDTO> getFlight(FlightSearchDTO dto);
        public Task<List<FlightSearchResponseDTO>> SearchFlights(FlightSearchRequestDTO dto);
        public Task deleteFlight(FlightSearchDTO dto);
        public Task deleteDiscountFlight(FlightSearchDTO dto);
        public Task insertRequest(LowBookingDTORequest dto);
        public Task<List<LowBookingDTOResponse>> getRequestsById(int account_id);
        public Task updateRequest(LowBookingDTORequest dto);
        public Task deleteRequest(LowBookingDTORequest dto);
        public Task insertSeatFlight(CreateFlightDTO dto);
        public Task updateSeatFlight(SeatSelectionDTO dto);
        // public Task deleteSeatFlight(FlightSearchDTO dto); // xóa ghế khi hủy chuyến bay
        public Task<List<SeatSelectionDTO>> getAvailableSeatFlight(FlightSearchDTO dto);
        public Task<FlightSearchDTO> getKeyFromId(string flightId);
        public Task<FlightApiDTO> getFlightFromCodeTicket(string codeTicket);


    }
}
