using Pbl3.DTOs.Auth;
using Pbl3.Repositories.Implementation;
using Pbl3.DataAccess.Data;
using Pbl3.DTOs.Account;
using Pbl3.Services.Interface;

namespace Pbl3.Services.Implementation
{
    public class AuthService : IAuthService
    {
        UserRepository userRepository;
        public AuthService(AppDbContext context)
        {
            userRepository = new UserRepository(context);
        }
        public async Task<string> register(RegisterDTO dtO, string type) 
        {
            if (type == "Passenger") { 
                await userRepository.InsertPassenger(dtO);
                return "Passenger added successfully";
            }
            else if (type == "Staff") {
                return await userRepository.InsertStaff(dtO);
            }
            return "Invalid user type";
        }
        public async Task<LoginResponseDTO> findUserAcccount(LoginRequestDTO dtO)
        {
            var user = await userRepository.GetUserByEmail(dtO.email);
            if (user == null) return null;
            return new LoginResponseDTO
            {
                id = user.id,
                name = user.name,
                type = (user.id > 50) ? "Passenger" : (user.id > 10) ? "Staff" : "Admin"
            };
        }
        public async Task updateNewPass(ResetPasswordDTO dtO)
        {
            UpdateUserDTO updateUserDTO = new UpdateUserDTO
            {
                id = dtO.id,
                password = dtO.password
            };
            await userRepository.UpdatePassenger(updateUserDTO);
        }
        public async Task<VerifyCodeDTO> sendVerifyCodeEmail(EmailDTO dto)
        {
            Random rd = new Random();
            string _code = "";
            for (int i = 0; i < 6; i++)
            {
                _code += rd.Next(0, 10).ToString();
            }
            var user = await userRepository.GetUserByEmail(dto.email);
            return new VerifyCodeDTO
            {
                id = user.id,
                code = _code
            };
        }
    }
}
