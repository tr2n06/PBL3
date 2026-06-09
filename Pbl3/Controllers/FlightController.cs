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
        private readonly IMailService mailService;

        public FlightController(IFlightService service, IBookingService bookingService, IMailService mailService)
        {
            this.service = service;
            this.bookingService = bookingService;
            this.mailService = mailService;
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

        [HttpGet("search-round")]
        public async Task<IActionResult> SearchRoundFlights([FromQuery] FlightSearchRequestDTO request)
        {
            try
            {
                var flights = await service.GetRoundFlights(request);
                return Ok(flights);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{flightId}/seats")]
        public async Task<IActionResult> GetAvailableSeats(string flightId, [FromQuery] string @class)
        {
            try
            {
                var key = await service.getKeyFromId(flightId);
                int typeTicket = 2; // default to economy
                if (!string.IsNullOrEmpty(@class))
                {
                    string clsLower = @class.ToLower().Trim();
                    if (clsLower == "business") typeTicket = 1;
                    else if (clsLower == "economy") typeTicket = 2;
                    else if (clsLower == "firstclass" || clsLower == "first class") typeTicket = 3;
                }
                var seats = await bookingService.getSeatMap(new SeatRequestDTO
                {
                    flightcode = key.codeFlight,
                    departureDate = key.departureDate ?? DateOnly.FromDateTime(DateTime.Now),
                    departureTime = key.departureTime ?? TimeOnly.FromDateTime(DateTime.Now),
                    typeTicket = typeTicket
                });
                if (seats == null) return NotFound(new { message = "Flight not found"});
                return Ok(seats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        //      <<FLIGHT API ADMIN>>
        [HttpGet()]
        public async Task<IActionResult> GetAllFlights()
        {
            try
            {
                var flights = await service.getAllFlights();
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
                return Ok(new { message = "Flight inserted successfully"});
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpPatch("{flightId}")]
        public async Task<IActionResult> UpdateFlight(string flightId, UpdateFlightDTO dto)
        {
            try
            {
                if (dto.status != null && dto.status == "canceled")
                {
                    var key = await service.getKeyFromId(flightId);
                    var passengers = await service.getPassengerFlight(key);
                    foreach (var item in passengers)
                    {
                        await sendCancelledFlightMail(flightId, item.name, item.email);
                    }
                }
                else if (dto.departureDate != null || dto.departureTime != null)
                {
                    var key = await service.getKeyFromId(flightId);
                    var passengers = await service.getPassengerFlight(key);

                    var oldDate = key.departureDate?.ToString("yyyy-MM-dd") ?? "";
                    var oldTime = key.departureTime?.ToString("HH:mm:ss") ?? "";

                    var newDate = dto.departureDate ?? oldDate;
                    var newTime = dto.departureTime ?? oldTime;

                    if (newDate != oldDate || newTime != oldTime)
                    {
                        foreach (var item in passengers)
                        {
                            await SendRescheduledFlightMail(key.codeFlight, item.name, item.email, oldDate, oldTime, newDate, newTime);
                        }
                    }
                }

                await service.updateFlight(flightId, dto);
                return Ok(new { message = "Flight updated successfully" });
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
        [HttpGet("flight-number")]
        public async Task<IActionResult> GetFlightNumber([FromQuery] string departureCode, [FromQuery] string arrivalCode)
        {
            try
            {
                var flightNumber = await service.getFlightNumber(departureCode, arrivalCode);
                if (flightNumber == null) return NotFound(new { message = "Flight not found" });
                return Ok(new { flightNumber = flightNumber });
            }  
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        private async Task sendCancelledFlightMail(string flightId, string name, string email)
        {
            try
            {
                string flightNumber = flightId.Split('-')[0];
                await mailService.SendMail(
                    email,
                    "Important Notice: Flight Cancellation",
                    $@"
                    <div style='font-family: Arial, sans-serif; line-height:1.8; color:#333'>
                        <h2 style='color:#d9534f;'>Flight Cancellation Notice</h2>

                        <p>Dear Mr./Ms. {name},</p>

                        <p>
                            We regret to inform you that flight <b>{flightNumber}</b> has been cancelled
                            due to unforeseen circumstances beyond our control.
                        </p>

                        <p>
                            We sincerely apologize for the inconvenience and disruption this may
                            cause to your travel plans. The safety and well-being of our passengers
                            remain our highest priority.
                        </p>

                        <p>
                            Please be assured that a full refund for your ticket will be processed
                            automatically. The refunded amount is expected to be credited back to
                            your original payment account within <b>2 to 3 business days</b>,
                            depending on your bank or payment provider.
                        </p>

                        <p>
                            If you require additional assistance, our customer support team will
                            be available to help with any questions regarding your booking and refund.
                        </p>

                        <br/>

                        <p>
                            Thank you for your understanding and continued trust in Skylines.
                        </p>

                        <p>
                            Sincerely,<br/>
                            <b>Skylines</b>
                        </p>

                        <hr/>

                        <p style='font-size:12px; color:gray'>
                            This is an automated notification from Skylines.
                            Please do not reply to this email.
                        </p>
                    </div>"
                );
            }
            catch (Exception e)
            {
                throw new Exception("Invalid email: " + e.Message);
            }
        }

        private async Task SendRescheduledFlightMail(string flightNumber, string name, string email, string oldDate, string oldTime, string newDate, string newTime)
        {
            try
            {
                await mailService.SendMail(
                    email,
                    "Important Notice: Flight Schedule Change",
                    $@"
                    <div style='font-family: Arial, sans-serif; line-height:1.8; color:#333'>
                        <h2 style='color:#f0ad4e;'>Flight Schedule Update</h2>

                        <p>Dear Mr./Ms. {name},</p>

                        <p>
                            We would like to inform you that the schedule of flight
                            <b>{flightNumber}</b> has been updated.
                        </p>

                        <div style='background-color:#f8f9fa;padding:15px;border-radius:5px;margin:20px 0'>
                            <p><b>Flight Number:</b> {flightNumber}</p>
                            <p><b>Original Departure:</b> {oldDate} at {oldTime}</p>
                            <p><b>Updated Departure:</b> {newDate} at {newTime}</p>
                        </div>

                        <p>
                            We sincerely apologize for any inconvenience this schedule change may cause.
                            Please review the updated departure information and plan your journey accordingly.
                        </p>

                        <p>
                            Should you have any questions or require assistance, please contact
                            our customer support team.
                        </p>

                        <br/>

                        <p>
                            Thank you for your understanding and for choosing Skylines Airlines.
                        </p>

                        <p>
                            Sincerely,<br/>
                            <b>Skylines</b>
                        </p>

                        <hr/>

                        <p style='font-size:12px; color:gray'>
                            This is an automated notification from Skylines.
                            Please do not reply to this email.
                        </p>
                    </div>"
                );
            }
            catch (Exception e)
            {
                throw new Exception("Invalid email: " + e.Message);
            }
        }
    }
}