using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.Services.Implementation;
using Pbl3.Services.Interface;
using System.Text;

namespace Pbl3.Controllers
{
    [Route("api/bookings")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IFlightService flightService;
        private readonly IBookingService service;

        public BookingController(IFlightService flightService, IBookingService service)
        {
            this.flightService = flightService;
            this.service = service;
        }
        //      <<BOOKING API>>

        [HttpGet("search")]
        public async Task<IActionResult> SearchFlights([FromQuery] FlightSearchRequestDTO request)
        {
            try
            {
                var flights = await flightService.SearchFlights(request);
                return Ok(flights);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{flightId}/seats")]
        public async Task<IActionResult> GetAvailableSeats(string flightId, [FromQuery] string @class)
        {
            try
            {
                var key = flightService.getKeyFromId(flightId).Result;
                var seats = await service.getSeatMap(new SeatRequestDTO
                {
                    flightcode = key.codeFlight,
                    arriveDate = key.arriveDate?? DateOnly.FromDateTime(DateTime.Now),
                    arriveTime = key.arriveTime?? TimeOnly.FromDateTime(DateTime.Now)
                });
                if (seats == null) return NotFound("Flight not found");
                return Ok(seats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}