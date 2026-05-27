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
                dto.flightId = $"{p.codeFlight}-{p.arriveDate:ddMMyyyy}-{p.arriveTime:HHmmss}";
                dto.flightNumber = p.codeFlight;
                dto.airline = "Skylines";

                dto.route = p.flight.fromTo.fromCity + " - " + p.flight.fromTo.toCity;

                dto.discount = p.discount;

                var detail = flightService.getFlight(new FlightSearchDTO
                {
                    codeFlight = p.codeFlight,
                    arriveDate = p.arriveDate,
                    arriveTime = p.arriveTime
                }).Result;

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
                dto.flightId = $"{p.codeFlight}-{p.arriveDate:ddMMyyyy}-{p.arriveTime:HHmmss}";
                dto.flightNumber = p.codeFlight;
                dto.route = p.fromTo.toCity + " - " + p.fromTo.fromCity;

                var detail = flightService.getFlight(new FlightSearchDTO
                {
                    codeFlight = p.codeFlight,
                    arriveDate = p.arriveDate,
                    arriveTime = p.arriveTime
                }).Result;

                dto.economyPrice = detail.price.economy;
                dto.departureDate = p.landingDate.ToDateTime(p.landingTime);
                int totalSeats = (detail.bookingCount ?? 0) + detail.seatsAvailable.economy + detail.seatsAvailable.bussiness + detail.seatsAvailable.firstClass;
                dto.occupancyRate = totalSeats == 0 ? 0 : (double)(detail.bookingCount ?? 0) / totalSeats;
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
            var entity = new Promotion
            {
                codeFlight = key.codeFlight,
                arriveDate = key.arriveDate?? DateOnly.FromDateTime(DateTime.Now),
                arriveTime = key.arriveTime?? TimeOnly.FromDateTime(DateTime.Now),
                discount = dto.discount,
                createAt = DateTime.Now,
            };

            await _repo.Add(entity);

            return entity; 
        }

        // =========================
        // DELETE (soft delete)
        // =========================
        public async Task<bool> DeletePromotion(string id)
        {
            var promo = await _repo.GetById(id);
            if (promo == null) return false;

           await  _repo.Delete(id);

            return true;
        }

        public async Task<bool> isPromotion(string codeFlight, DateOnly arriveDate, TimeOnly arriveTime)
        {
            return await _repo.isPromotion(codeFlight, arriveDate, arriveTime);
        }
    }
}
