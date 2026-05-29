using Pbl3.DTOs.Auth;
using Pbl3.Repositories.Implementation;
using Pbl3.DataAccess.Data;
using Pbl3.DTOs.Account;
using Pbl3.Services.Interface;
using Microsoft.Extensions.Caching.Memory;
using Pbl3.Repositories.Interface;

namespace Pbl3.Services.Implementation
{
    public class AuthService : IAuthService
    {
        IUserRepository userRepository;
        private readonly IMemoryCache _cache;

        public AuthService(IMemoryCache cache, IUserRepository userRepository)
        {
            _cache = cache;
            this.userRepository = userRepository;
        }

        public async Task<string> register(RegisterDTO dtO, string type)
        {
            _cache.Remove(dtO.email);
            if (type == "Passenger")
            {
                await userRepository.InsertPassenger(dtO);
                return "Passenger added successfully";
            }
            else if (type == "Staff")
            {
                return await userRepository.InsertStaff(dtO);
            }
            return "Invalid user type";
        }
        public async Task<LoginResponseDTO> findUserAcccount(LoginRequestDTO dtO)
        {

            var user = await userRepository.GetUserByEmail(dtO.email);
            if (user == null) return null;
            if (user.pass != dtO.password) return null;
            if (user.status == "blocked") return null;
            return new LoginResponseDTO
            {
                id = user.id,
                name = user.name,
                type = (user.id > 50) ? "Passenger" : (user.id > 10) ? "Staff" : "Admin"
            };
        }
        public async Task updateNewPass(ResetPasswordDTO dtO)
        {
            var user = await userRepository.GetUserByEmail(dtO.email);
            if (user == null) return;
            UpdateUserDTO updateUserDTO = new UpdateUserDTO
            {
                id = user.id,
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
            _cache.Set(dto.email, _code, TimeSpan.FromSeconds(30));
            return new VerifyCodeDTO
            {
                email = user?.email ?? "",
                code = _code
            };
        }
        public bool VerifyOTP(VerifyCodeDTO dto)
        {
            if (!_cache.TryGetValue(dto.email, out string savedCode))
            {
                return false;
            }

            return savedCode == dto.code;
        }
        public bool isUsedEmail(string email)
        {
            var user = userRepository.GetUserByEmail(email).Result;
            return user != null;
        }
        public async Task BlockCustomer(int customerId)
        {
            try
            {
                await userRepository.BlockCustomer(customerId);
            }
            catch (Exception e)
            {
                throw new Exception("Invalid!");
            }

        }
        public async Task<PassengerDTO> findUserByPhone(string phone)
        {
            try
            {
                var user = await userRepository.findPassengerByPhone(phone);
                if (user.status == "blocked") throw new Exception("This user is blocked!");
                return new PassengerDTO
                {
                    id = user.id,
                    name = user.name,
                    phoneNumber = phone,
                    email = user.email,
                    pointReward = user.pointReward
                };
            }
            catch (Exception e)
            {
                throw new Exception("Invalid!");
            }
        }
        public async Task<PassengerDTO> GetPassengerById(int id)
        {
            var p = await userRepository.GetPassengerById(id);
            var u = new PassengerDTO();
            u.id = id;
            u.name = p.name;
            u.gender = (p.gender == 1) ? "Male" : "Female";
            u.email = p.email;
            u.phoneNumber = p.phoneNumber;
            u.dateOfBirth = p.dateOfBirth;
            u.pointReward = p.pointReward;
            u.password = p.pass;
            u.status = p.status ?? "Active";
            u.createdAt = p.createdAt;

            return u;
        }
        public async Task<StaffDTO> GetStaffById(int id)
        {
            var p = await userRepository.GetStaffById(id);
            var u = new StaffDTO();
            u.id = id;
            u.name = p.name;
            u.gender = (p.gender == 1) ? "Male" : "Female";
            u.email = p.email;
            u.phoneNumber = p.phoneNumber;
            u.dateOfBirth = p.dateOfBirth ?? DateOnly.FromDateTime(DateTime.Now);
            u.joinedDate = p.joinedDate;
            u.password = p.pass;
            u.status = p.status ?? "Active";
            u.createdAt = p.createdAt;

            return u;
        }
        public async Task<AdminDTO> GetAdminById(int id)
        {
            var p = await userRepository.GetAdminById(id);
            var u = new AdminDTO();
            u.id = id;
            u.name = p.name;
            u.gender = (p.gender == 1) ? "Male" : "Female";
            u.email = p.email;
            u.phoneNumber = p.phoneNumber;
            u.dateOfBirth = p.dateOfBirth ?? DateOnly.FromDateTime(DateTime.Now);
            u.joinedDate = p.joinedDate;
            u.password = p.pass;
            u.status = p.status ?? "Active";
            u.createdAt = p.createdAt;

            return u;
        }
        public async Task updatePassword(int id, string oldPass, string newPass)
        {
            try
            {
                await userRepository.updatePassword(id, oldPass, newPass);
            }
            catch(Exception e)
            {
                throw e;
            }
        }
        public async Task updateUser(UpdateUserDTO dto)
        {
            try
            {
                if (dto.id >= 51) await userRepository.UpdatePassenger(dto);
                else if (dto.id >= 11) await userRepository.UpdateStaff(dto);
                throw new Exception("Invalid type of user");
            }
            catch(Exception e)
            {
                throw e;
            }
        }
        public async Task<List<StaffDTO>> getAllStaffs()
        {
            try
            {
                return await userRepository.getAllStaffs();
            }
            catch(Exception e)
            {
                throw e;
            }
        }
        public async Task updateStateUser(int id, string state)
        {
            try
            {
                await userRepository.updateStateUser(id, state);
            }
            catch(Exception e)
            {
                throw e;
            }
        }
    }
}
