using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
using Pbl3.DTOs.Promotion;
using Pbl3.Services.Interface;
using Pbl3.Repositories.Interface;
using Pbl3.Repositories.Implementation;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DataAccess.Models.Promotions;

namespace Pbl3.Services.Implementation
{
    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepository _repo;
        private readonly IFlightService flightService;

        public PromotionService(IPromotionRepository repo, IFlightService flightService)
        {
            _repo = repo;
            this.flightService = flightService;
        }

        // =========================
        // ACTIVE PROMOTIONS
        // =========================
        public async Task<List<PromotionDTO>> GetActivePromotions()
        {
            var list = await _repo.GetActivePromotions();

            List<PromotionDTO> dtos = new List<PromotionDTO>();
            foreach (var p in list)
            {
                PromotionDTO dto = new PromotionDTO();
                dto.id = p.id;
                dto.flightId = $"{p.codeFlight}-{p.departureDate:ddMMyyyy}-{p.departureTime:HHmmss}";
                dto.flightNumber = p.codeFlight;
                dto.airline = "Skylines";

                dto.route = p.flight.fromTo.fromCity.fullName + " - " + p.flight.fromTo.toCity.fullName;

                dto.discount = p.discount;

                var detail = await flightService.getFlight(new FlightSearchDTO
                {
                    codeFlight = p.codeFlight,
                    departureDate = p.departureDate,
                    departureTime = p.departureTime
                });

                dto.departureCode = detail.departure.code;
                dto.departureCity = detail.departure.city;
                dto.departureTime = detail.departure.time;
                dto.departureDate = detail.departure.date;

                dto.arrivalCode = detail.arrival.code;
                dto.arrivalCity = detail.arrival.city;
                dto.arrivalTime = detail.arrival.time;
                dto.arrivalDate = detail.arrival.date;

                dto.duration = detail.duration;

                dto.economyPrice = detail.price.economy;
                dto.createAt = p.createAt;
                dtos.Add(dto);
            }
            return dtos;
        }

        // =========================
        // CANDIDATES
        // =========================
        public async Task<List<PromotionCandidateDTO>> GetCandidates()
        {
            var list = await _repo.GetCandidateFlights();

            List<PromotionCandidateDTO> dtos = new List<PromotionCandidateDTO>();
            foreach (var p in list)
            {
                PromotionCandidateDTO dto = new PromotionCandidateDTO();
                dto.flightId = $"{p.codeFlight}-{p.departureDate:ddMMyyyy}-{p.departureTime:HHmmss}";
                dto.flightNumber = p.codeFlight;
                dto.route = p.fromTo.fromCity.fullName + " - " + p.fromTo.toCity.fullName;

                var detail = await flightService.getFlight(new FlightSearchDTO
                {
                    codeFlight = p.codeFlight,
                    departureDate = p.departureDate,
                    departureTime = p.departureTime
                });

                dto.economyPrice = detail.price.economy;
                dto.departureDate = $"{p.departureDate:yyyy-MM-dd}T{p.departureTime:HH:mm:ss}";
                int totalSeats = (detail.bookedCount ?? 0) + detail.seatsAvailable.economy + detail.seatsAvailable.business + detail.seatsAvailable.firstClass;
                dto.occupancyRate = totalSeats == 0 ? 0 : (double)(detail.bookedCount ?? 0) / totalSeats;
                dtos.Add(dto);
            } 
            return dtos;
        }

        // =========================
        // CREATE PROMOTION 
        // =========================
        public async Task<Promotion> CreatePromotion(CreatePromotionRequestDTO dto)
        {
            var key = await flightService.getKeyFromId(dto.flightId);
            DateOnly depDate = key.departureDate ?? DateOnly.FromDateTime(DateTime.Parse("0000-00-00T00:00:00"));
            TimeOnly depTime = key.departureTime ?? TimeOnly.FromDateTime(DateTime.Parse("0000-00-00T00:00:00"));

            // Check if there is an existing promotion for this flight and remove it to avoid unique constraint violations
            var existingPromos = await _repo.GetActivePromotions();
            var existingPromo = existingPromos.FirstOrDefault(p => p.codeFlight == key.codeFlight && p.departureDate == depDate && p.departureTime == depTime);
            if (existingPromo != null)
            {
                await _repo.Delete(existingPromo.id);
                try
                {
                    await flightService.deleteDiscountFlight(new FlightSearchDTO
                    {
                        codeFlight = key.codeFlight,
                        departureDate = depDate,
                        departureTime = depTime
                    });
                }
                catch (Exception) { }
            }

            var entity = new Promotion
            {
                codeFlight = key.codeFlight,
                departureDate = depDate,
                departureTime = depTime,
                discount = dto.discount,
                createAt = DateTime.Now,
            };

            await _repo.Add(entity);

            try
            {
                await flightService.insertDiscountFlight(new LowBookingDTORequest
                {
                    codeFlight = key.codeFlight,
                    departureDate = depDate.ToString("yyyy-MM-dd"),
                    departureTime = depTime.ToString("HH:mm:ss"),
                    discount = dto.discount
                });
            }
            catch (Exception) { }

            return entity; 
        }

        // =========================
        // DELETE (soft delete)
        // =========================
        public async Task<bool> DeletePromotion(string id)
        {
            var promo = await _repo.GetById(id);
            if (promo == null) return false;

            await _repo.Delete(id);

            try
            {
                await flightService.deleteDiscountFlight(new FlightSearchDTO
                {
                    codeFlight = promo.codeFlight,
                    departureDate = promo.departureDate,
                    departureTime = promo.departureTime
                });
            }
            catch (Exception) { }

            return true;
        }

        public async Task<bool> isPromotion(string codeFlight, DateOnly arriveDate, TimeOnly arriveTime)
        {
            return await _repo.isPromotion(codeFlight, arriveDate, arriveTime);
        }
    }
}
