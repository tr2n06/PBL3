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
using Pbl3.Services.Implementation;
using Pbl3.Services.Interface;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Pbl3.Services.Implementations;

namespace Pbl3.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService service;
        private readonly IMailService mailService;
        private readonly IRequestService requestService;

        public AuthController(IAuthService service, IMailService mailService, IRequestService requestService)
        {
            this.requestService = requestService;
            this.service = service;
            this.mailService = mailService;
        }
        [HttpPost("register")]
        public IActionResult Register(RegisterDTO dtO)
        {
            string mess = service.register(dtO, "Passenger").Result;

            if (mess == "Invalid user type")
            {
                return BadRequest(new { error = mess });
            }   //tracy06072006@gmail.com

            return Ok(new { message = mess });
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
            return Ok(new
            {
                user = new
                {
                    id = user.id,
                    name = user.name,
                    type = user.type
                }
            });
        }
        [HttpPost("request-otp")]
        public async Task<ActionResult<VerifyCodeDTO>> SendMail(EmailDTO dto)
        {
            // 1️⃣ Kiểm tra email đã tồn tại khi mục đích là đăng ký
            if (dto.purpose == "register")
            {
                var exists = service.isUsedEmail(dto.email);
                if (exists)
                {
                    // Trả về lỗi 409 Conflict để frontend hiển thị
                    return Conflict(new { error = "Email already exists" });
                }
            }

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
            return Ok(new { message = "success" });
        }
        /*public async Task<IActionResult> Check() {
            await mailService.SendMail(
                 "lucy06072006@gmail.com",
                 "Test",
                 "<h1>Hello</h1>"
             );
            return Ok();
        }*/
        [HttpPost("verify-otp")]
        public ActionResult VerifyOTP(VerifyCodeDTO dto)
        {
            var isValid = service.VerifyOTP(dto);
            if (!isValid)
            {
                return BadRequest(new { error = "Invalid or expired OTP" });
            }
            return Ok(new { message = "OTP verified successfully" });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO dto)
        {
            await service.updateNewPass(dto);
            return Ok(new { message = "Password reset successfully" });
        }
        [HttpPatch("{customerId}/block")]
        public async Task<IActionResult> BlockCustomer(int customerId)
        {
            try
            {
                await service.BlockCustomer(customerId);
                return Ok(new { success = true, message = "Blocked successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("by-phone")]
        [HttpGet("/api/customers/by-phone")]
        public async Task<IActionResult> GetByPhone([FromQuery] string phone)
        {
            try
            {
                var result = await service.findUserByPhone(phone);
                return Ok(new
                {
                    customerId = result.id,
                    fullName = result.name,
                    phone = result.phoneNumber,
                    email = result.email,
                    availablePoints = result.pointReward
                });
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpGet("me")]
        public IActionResult GetProfile()
        {
            // Đọc token từ cookie có tên là "jwt"
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);

                var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                int idUser = int.Parse(id);
                var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                switch (type)
                {
                    case "Passenger":
                        var p = service.GetPassengerById(idUser).Result;
                        return Ok(new
                        {
                            userId = idUser,
                            fullName = p.name,
                            gender = p.gender,
                            dateOfBirth = p.dateOfBirth?.ToString("yyyy-MM-dd"),
                            address = p.address ?? "",
                            nationalId = "+84",
                            availablePoints = p.pointReward,
                            role = "Customer",
                            email = p.email,
                            phone = p.phoneNumber,
                            status = p.status,
                            createdAt = p.createdAt.ToString("dd/MM/yyyyHH:mm:ss")
                        });
                    case "Staff":
                        var u = service.GetStaffById(idUser).Result;
                        return Ok(new
                        {
                            userId = idUser,
                            fullName = u.name,
                            gender = u.gender,
                            role = "Staff",
                            dateOfBirth = u.dateOfBirth?.ToString("yyyy-MM-dd"),
                            address = u.address ?? "",
                            nationalId = "+84",
                            email = u.email,
                            phone = u.phoneNumber,
                            status = u.status,
                            createdAt = u.createdAt.ToString("dd/MM/yyyyHH:mm:ss")
                        });
                    case "Admin":
                        var a = service.GetAdminById(idUser).Result;
                        return Ok(new
                        {
                            userId = idUser,
                            fullName = a.name,
                            gender = a.gender,
                            dateOfBirth = a.dateOfBirth.ToString("yyyy-MM-dd"),
                            address = a.address ?? "",
                            role = "Manager",
                            nationalId = "+84",
                            email = a.email,
                            phone = a.phoneNumber,
                            status = a.status,
                            createdAt = a.createdAt.ToString("dd/MM/yyyyHH:mm:ss")
                        });
                    default:
                        return Unauthorized(new { message = "Không tìm thấy cookie hoặc cookie đã hết hạn"});
                }
                ;
            }
            return Unauthorized(new { message = "Không tìm thấy cookie hoặc cookie đã hết hạn"});
        }
        [HttpPatch("me")]
        public async Task<IActionResult> UpdateMe(UpdateUserDTO dto)
        { 
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    dto.id = int.Parse(id);
                    await service.updateUser(dto);
                    return Ok(new { message = "Successfull"});
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }
            }
            else return BadRequest(new { message = "Can't find this user"});
        }
        [HttpPost("profile-update-requests")]
        public async Task<IActionResult> SubmitUpdateRequest(StaffRequestDTO dto)
        {
            // 1. Lấy user từ JWT cookie
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    dto.id = int.Parse(id);
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type != "Staff") return BadRequest(new { message = "Can't find this user"});
                    await requestService.insertRequest(dto);
                    await service.updateStateUser(int.Parse(id), "pending");
                    return Ok(new { message = "Successful"});
                }
                catch (Exception e)
                {
                    return BadRequest(new { message = e.ToString()});
                }
            }
            else return BadRequest(new { message = "Can't find this user"});
        }
        [HttpGet("profile-update-requests")]
        public async Task<ActionResult<StaffRequestResponseDTO>> getRequest()
        {
            // 1. Lấy user từ JWT cookie
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    int userId = int.Parse(id);
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type != "Staff") return BadRequest(new { message = "Can't find this user"});
                    var result = await requestService.getRequest(userId);
                    if (result == null) return NotFound();
                    return Ok(result);
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }
            }
            else return BadRequest(new { message = "Can't find this user"});
        }
        [HttpPatch("password")]
        public async Task<IActionResult> ChangePassword([FromBody] dynamic payload)
        {
            // 1. Lấy user từ JWT cookie
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;

                if (userIdClaim == null) return Unauthorized(new { message = "Missing user"});

                if (!int.TryParse(userIdClaim, out int userId)) return BadRequest(new { message = "Invalid user id"});

                string currentPassword = payload.currentPassword;
                string newPassword = payload.newPassword;
                string newPasswordConfirm = payload.newPasswordConfirm;

                if (newPassword != newPasswordConfirm) return BadRequest(new { message = "Password confirm not match"});

                await service.updatePassword(userId, currentPassword, newPassword);

                return Ok(new
                {
                    message = "Change password success"
                });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }
        [HttpGet("employees")]
        public async Task<IActionResult> GetAllStaffs()
        {
            try
            {
                var staffs = await service.getAllStaffs();
                var result = new List<StaffResponseDTO>();

                //Console.WriteLine("Số lượng: " + staffs.Count);

                foreach (var s in staffs)
                {
                    result.Add(new StaffResponseDTO
                    {
                        id = s.id,
                        name = s.name,
                        email = s.email,
                        phone = s.phoneNumber,
                        gender = s.gender,
                        address = s.address,
                        nationalId = "+84",
                        dateOfBirth = s.dateOfBirth?.ToString("yyyy-MM-dd"),
                        status = s.status,
                        role = "employee",
                        createdAt = s.createdAt.ToString("yyyy-MM-dd")
                    });
                }

                return Ok(result);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = "Invalid"});
            }
        }
        [HttpPatch("employees/{employeeId}/block")]
        public async Task<IActionResult> BlockEmployee(int employeeId)
        {
            try
            {
                await service.updateStateUser(employeeId, "blocked");
                return Ok(new { message = "Blocked successfully" });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }

        [HttpPatch("employees/{employeeId}/unblock")]
        public async Task<IActionResult> UnblockEmployee(int employeeId)
        {
            try
            {
                await service.updateStateUser(employeeId, "active");
                return Ok(new { message = "Blocked successfully" });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }

        private string GenerateJWT(LoginResponseDTO dto)
        {

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("this_is_my_super_secret_jwt_key_2026_072406_072406_super_super_long_very_much"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new System.Security.Claims.Claim("id", dto.id.ToString()),
                new System.Security.Claims.Claim("name", dto.name),
                new System.Security.Claims.Claim("type", dto.type)
            };
            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );
            return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
