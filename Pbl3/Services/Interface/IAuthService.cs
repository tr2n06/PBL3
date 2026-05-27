using Pbl3.DTOs.Auth;
using Pbl3.DTOs.Account;
namespace Pbl3.Services.Interface
{
    public interface IAuthService
    {
        public Task<string> register(RegisterDTO dtO, string type);
        public Task<LoginResponseDTO> findUserAcccount(LoginRequestDTO dtO);
        public Task updateNewPass(ResetPasswordDTO dtO);
        public Task<VerifyCodeDTO> sendVerifyCodeEmail(EmailDTO dto);
        public bool VerifyOTP(VerifyCodeDTO dto);
        public bool isUsedEmail(string email);
        public Task  BlockCustomer(int customerId);
        public Task<PassengerDTO> findUserByPhone(string phone);
        public Task<PassengerDTO> GetPassengerById(int id);
        public Task<StaffDTO> GetStaffById(int id);
        public Task<AdminDTO> GetAdminById(int id);
        public Task updatePassword(int id, string oldPass, string newPass);
        public Task updateUser(UpdateUserDTO dto);
        public Task<List<StaffDTO>> getAllStaffs();
        public Task updateStateUser(int id, string state);
    }
}
