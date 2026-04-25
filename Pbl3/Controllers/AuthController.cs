using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
using Pbl3.Services.Implementation;
using Pbl3.Services.Interface;
using System.Text;

namespace Pbl3.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService service;
        private readonly IMailService mailService;
        public AuthController(IAuthService service, IMailService mailService)
        {
            this.service = service;
            this.mailService = mailService;
        }
        [HttpPost("register")]
        public IActionResult Register(RegisterDTO dtO)
        {
            service.register(dtO, "Passenger");

            return Ok(new { message = "Register success" });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequestDTO dto)
        {
            var user = service.findUserAcccount(dto).Result;

            if (user == null) return Unauthorized("Invalid");
            var token = GenerateJWT(user);
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });
            return Ok();
        }
        [HttpGet("forgotPassword")]
        [HttpGet("register")]
        public async Task<ActionResult<VerifyCodeDTO>> SendMail(EmailDTO dto)
        {
            var code = await service.sendVerifyCodeEmail(dto);
            if (dto.purpose == "register")
            {
                await mailService.SendMail(
                    dto.email,
                     "Account Registration Verification",
                     $@"
                     <div style='font-family: Arial, sans-serif; line-height:1.6'>
                        <h2>Welcome</h2>

                        <p>Thank you for registering an account with us.</p>
                        <p>Please use the verification code below to complete your registration:</p>

                        <div style='
                            font-size: 32px;
                            font-weight: bold;
                            color: #2d89ef;
                            letter-spacing: 5px;
                            margin: 20px 0;
                            text-align: center;'>
                            {code.code}
                        </div>

                        <p>This code will expire in <b>5 minutes</b>.</p>

                        <p>If you did not request this registration, you can safely ignore this email.</p>

                        <br/>

                        <p>Best regards,<br/>
                        <b>Your Ticketing System</b></p>

                        <hr/>
                        <p style='font-size:12px; color:gray'>
                            This is an automated email. Please do not reply.
                        </p>
                     </div>
                     "
                );
            }
            else
            {
                await mailService.SendMail(
                    dto.email,
                    "Password Reset Verification",
                    $@"
                    <div style='font-family: Arial, sans-serif; line-height:1.6'>
                        <h2>Password Reset Request 🔐</h2>

                        <p>We received a request to reset your password.</p>
                        <p>Please use the verification code below to proceed:</p>

                        <div style='
                            font-size: 32px;
                            font-weight: bold;
                            color: #e74c3c;
                            letter-spacing: 5px;
                            margin: 20px 0;
                            text-align: center;'>
                            {code.code}
                        </div>

                        <p>This code will expire in <b>5 minutes</b>.</p>

                        <p>If you did not request a password reset, please ignore this email or secure your account immediately.</p>

                        <br/>

                        <p>Best regards,<br/>
                        <b>Your Ticketing System</b></p>

                        <hr/>
                        <p style='font-size:12px; color:gray'>
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                    "
                );
            }
            return Ok(code);
        }
        /*public async Task<IActionResult> Check() {
            await mailService.SendMail(
                 "lucy06072006@gmail.com",
                 "Test",
                 "<h1>Hello</h1>"
             );
            return Ok();
        }*/
        private string GenerateJWT(LoginResponseDTO dto) {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("Information_Of_User_Secret_Key"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new System.Security.Claims.Claim("id", dto.id.ToString()),
                new System.Security.Claims.Claim("name", dto.name),
                new System.Security.Claims.Claim("type", dto.type)
            };
            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );
            return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
