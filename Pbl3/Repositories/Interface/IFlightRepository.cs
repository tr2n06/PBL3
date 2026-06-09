using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
using Pbl3.DTOs.Bookings;

namespace Pbl3.Repositories.Interface
{
    public interface IFlightRepository
    {
        public Task insertFlight(CreateFlightDTO dto);
        public Task insertDiscountFlight(LowBookingDTORequest dto);
        public Task updateFlight(UpdateFlightDTO dto, FlightSearchDTO key);
        public Task<List<FlightDTO>> getFlights(FlightSearchDTO dto);
        public Task<FlightDTO> getFlight(FlightSearchDTO dto);
        public Task<List<FlightDTO>> getAllFlights();
        public Task<LowBookingDTORequest> getDiscountFlight(FlightSearchDTO dto);
        public Task deleteFlight (FlightSearchDTO dto);
         public Task deleteDiscountFlight (FlightSearchDTO dto);
        public Task<FromToDTO> getFlightDetail(FlightSearchDTO dto);
        public Task<FromToDTO> getInformationDetail(CreateFlightDTO dto);
        public Task<TicketTypeDTO> getTicketType(int codeType);
        public Task insertRequest(LowBookingDTORequest dto); 
        public Task<List<LowBookingDTOResponse>> getRequestById(int account_id);
        public Task updateRequest(LowBookingDTORequest dto);
        public Task updateRequests(LowBookingDTORequest dto);
        public Task deleteRequest(LowBookingDTORequest dto); 
        public Task insertSeatFlight(SeatSelectionDTO dto);
        public Task updateSeatFlight(SeatSelectionDTO dto);
        //public Task deleteSeatFlight(FlightSearchDTO dto); // xóa ghế khi hủy chuyến bay
        public Task<List<SeatSelectionDTO>> getAvailableSeatFlight(FlightSearchDTO dto);
        public Task<List<SeatSelectionDTO>> getSelectedSeatFlight(FlightSearchDTO dto);
        public Task<int> getTypeSeat(string code);
        public Task<List<string>> getAllSeats();
        public Task<Boolean> haveTicket(FlightSearchDTO dto);
        public Task<FlightApiDTO> getFlightFromCodeTicket(string codeTicket);
        public Task<List<PassengerFlightDTO>> getPassengerFlight(FlightSearchDTO dto);
        public Task<string> getFlightNumber(string departureCode, string arrivalCode);
    }
}
