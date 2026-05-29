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
    [Route("api/flights")]
    [ApiController]
    public class FlightController : ControllerBase
    {
        private readonly IFlightService service;
        private readonly IBookingService bookingService;

        public FlightController(IFlightService service, IBookingService bookingService)
        {
            this.service = service;
            this.bookingService = bookingService;
        }
        //      <<BOOKING API>>

        [HttpGet("search")]
        public async Task<IActionResult> SearchFlights([FromQuery] FlightSearchRequestDTO request)
        {
            try
            {
                var flights = await service.SearchFlights(request);
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
                var key = service.getKeyFromId(flightId).Result;
                var seats = await bookingService.getSeatMap(new SeatRequestDTO
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
        //      <<FLIGHT API ADMIN>>
        [HttpGet()]
        public IActionResult GetAllFlights()
        {
            try
            {
                var flights = service.getAllFlights().Result;
                return Ok(flights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpPost()]
        public IActionResult InsertFlight(CreateFlightDTO dto)
        {
            try
            {
                service.insertFlight(dto).Wait();
                return Ok("Flight inserted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpPatch("{flightId}")]
        public IActionResult UpdateFlight(string flightId, UpdateFlightDTO dto)
        {
            try
            {
                service.updateFlight(flightId, dto).Wait();
                return Ok("Flight updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpDelete("{flightId}")]
        public IActionResult DeleteFlight(string flightId)
        {
            try
            {
                var dto = service.getKeyFromId(flightId).Result;
                service.deleteFlight(dto).Wait();
                return Ok(new { message = "Delete success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }

        }
    }
}