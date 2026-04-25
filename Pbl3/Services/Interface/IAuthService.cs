using Pbl3.DTOs.Auth;
using Pbl3.DTOs.Account;
namespace Pbl3.Services.Interface
{
    public interface IAuthService
    {
        Task<string> register(RegisterDTO dtO, string type);
        Task<LoginResponseDTO> findUserAcccount(LoginRequestDTO dtO);
        Task updateNewPass(ResetPasswordDTO dtO);
        Task<VerifyCodeDTO> sendVerifyCodeEmail(EmailDTO dto);
    }
}
