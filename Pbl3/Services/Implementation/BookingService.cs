using Pbl3.DTOs.Bookings;
using Pbl3.Services.Interface;
using Pbl3.Repositories.Interface;

using Pbl3.Repositories.Interface;

namespace Pbl3.Services.Implementation
{
    public class BookingService : IBookingService
    {
        IBookingRepository repository;
        public BookingService(IBookingRepository reoository)
        {
            this.repository = reoository;
        }

        public async Task insertBooking(BookingRequestDTO dto)
        {
            await repository.insertBooking(dto);
        }
        //public async Task upDateBooking(BookingRequestDTO dto);
        public async Task<BookingResponseDTO> getBooking(string codeBooking)
        {
            return await repository.getBooking(codeBooking);

        }
        public async Task<string> createCodeBooking()
        {
            char[] arr = {'0','1','2','3','4','5','6','7','8','9',
                          'A','B','C','D','E','F','G','H','I','J','K','L','M',
                          'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                          'a','b','c','d','e','f','g','h','i','j','k','l','m',
                          'n','o','p','q','r','s','t','u','v','w','x','y','z'
                         };
            Random r = new Random();
            string code;
            do
            {
                code = "";
                for (int i = 0; i < 8; i++)
                {
                    code += r.Next(0, 64).ToString();
                }
            } while (await repository.existedCodeBooking(code));

            return code;

        }
        public async Task deleteBooking(BookingRequestDTO dto)
        {
            await repository.deleteBooking(dto);
        }
        public async Task<List<SeatResponseDTO>> getSeatMap(SeatRequestDTO dto)
        {
            return await repository.getSeatMap(dto);
        }
    }
}
