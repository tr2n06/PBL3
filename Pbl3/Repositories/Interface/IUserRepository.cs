using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
namespace Pbl3.Repositories.Interface
{
    public interface  IUserRepository
    {
        public Task InsertPassenger(RegisterDTO p);
        public Task<string> InsertStaff(RegisterDTO p);
        public Task<Passenger> GetPassengerById(int id);
        public Task<Staff> GetStaffById(int id);
        public Task<Admin> GetAdminById(int id);
        public Task<User> GetUserByEmail(string email);
        public Task UpdatePassenger(UpdateUserDTO p); 
        public Task UpdateStaff(UpdateUserDTO p);
        public Task DeleteUserById(int id);
        public Task BlockCustomer(int customerId);
        public Task<Passenger> findPassengerByPhone(string phone);
        public Task updatePassword(int id, string oldPass, string nemPass);
        public Task<List<StaffDTO>> getAllStaffs();
        public Task updateStateUser(int id, string state);
    }
}
