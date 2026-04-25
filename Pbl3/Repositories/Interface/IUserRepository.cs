using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
namespace Pbl3.Repositories.Interface
{
    public interface  IUserRepository
    {
        public Task InsertPassenger(RegisterDTO p);
        public Task<string> InsertStaff(RegisterDTO p);
        public Task<User> GetUserById(int id);
        public Task<User> GetUserByEmail(string email);
        public Task UpdatePassenger(UpdateUserDTO p);
        public Task UpdateStaff(UpdateUserDTO p);
        public Task DeleteUserById(int id);
    }
}
