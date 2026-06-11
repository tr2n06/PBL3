using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
using Pbl3.Repositories.Interface;
using System.Reflection;
namespace Pbl3.Repositories.Implementation
{
    public class UserRepository : IUserRepository
    {
        AppDbContext context { get; set; }

        public UserRepository(AppDbContext context)
        {
            this.context = context;
        }
        public async Task InsertPassenger(RegisterDTO p)
        {
            int gen = p.gender == "Male" ? 1 : 0;

            var passenger = await (from u in context.User
                                   where u.phoneNumber == p.phoneNumber
                                   select u).FirstOrDefaultAsync();
            if (passenger != null) throw new Exception("This number phone existed");

            int current = (await context.Passenger.MaxAsync(u => (int?)u.id) ?? 0) + 1;
            await context.User.AddAsync(new Passenger
            {
                id = (current > 51) ? current : 51,
                name = p.name,
                gender = gen,
                dateOfBirth = p.dateOfBirth,
                address = p.address,
                phoneNumber = p.phoneNumber,
                email = p.email,
                pointReward = 0,
                status = "active",
                pass = p.password,
                createdAt = DateTime.Now
            });

            await context.SaveChangesAsync();
        }

        public async Task<string> InsertStaff(RegisterDTO p)
        {
            int gen = p.gender == "Male" ? 1 : 0;

            var staff = await (from u in context.User
                                   where u.phoneNumber == p.phoneNumber
                                   select u).FirstOrDefaultAsync();
            if (staff != null) throw new Exception("This number phone existed");

            int current = (await context.Staff.MaxAsync(u => (int?)u.id) ?? 10) + 1;
            if (current > 50) return "Staff limit reached";
            await context.User.AddAsync(new Staff
            {
                id = (current > 11) ? current : 11,
                name = p.name,
                gender = gen,
                dateOfBirth = p.dateOfBirth,
                address = p.address,
                phoneNumber = p.phoneNumber,
                email = p.email,
                joinedDate = DateOnly.FromDateTime(DateTime.Now),
                pass = p.password,
                createdAt = DateTime.Now,
                status = "active",
            });

            await context.SaveChangesAsync();
            return "Staff added successfully";
        }
        public async Task<Passenger> GetPassengerById(int id)
        {
            return await context.Passenger.FirstOrDefaultAsync(u => u.id == id);
        }
        public async Task<Staff> GetStaffById(int id)
        {
            return await context.Staff.FirstOrDefaultAsync(u => u.id == id);
        }
        public async Task<Admin> GetAdminById(int id)
        {
            return await context.Admin.FirstOrDefaultAsync(u => u.id == id);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            var user = await (from u in context.User
                              where (u.email == email)
                              select u)
                              .FirstOrDefaultAsync();
            return user switch
            {
                Passenger p => p,
                Staff s => s,
                Admin a => a,
                _ => null
            };
        }
        public async Task UpdatePassenger(UpdateUserDTO p)
        {
            var passenger = await context.Passenger.FindAsync(p.id);
            if (passenger != null)
            {
                if (p.gender != null) passenger.gender = (p.gender == "Male") ? 1 : 0;
                passenger.name = p.fullName ?? passenger.name;
                passenger.dateOfBirth = p.dateOfBirth ?? passenger.dateOfBirth;
                passenger.phoneNumber = p.phone ?? passenger.phoneNumber;
                passenger.email = p.email ?? passenger.email;
                passenger.address = p.address ?? passenger.address;
                passenger.pass = p.password ?? passenger.pass;
                passenger.status = p.status ?? passenger.status;
                await context.SaveChangesAsync();
            }
        }
        public async Task UpdateStaff(UpdateUserDTO p)
        {
            var staff = await context.Staff.FindAsync(p.id);
            if (staff != null)
            {
                if (p.gender != null) staff.gender = (p.gender == "Male") ? 1 : 0;
                staff.dateOfBirth = p.dateOfBirth ?? staff.dateOfBirth;
                staff.name = p.fullName ?? staff.name;
                staff.phoneNumber = p.phone ?? staff.phoneNumber;
                staff.email = p.email ?? staff.email;
                staff.address = p.address ?? staff.address;
                staff.pass = p.password ?? staff.pass;
                staff.status = p.status ?? staff.status;
                await context.SaveChangesAsync();
            }
        }
        public async Task DeleteUserById(int id)
        {
            var user = await (from u in context.User
                              where (u.id == id)
                              select u)
                             .FirstOrDefaultAsync<User>();
            if (user != null)
            {
                context.User.Remove(user);
                await context.SaveChangesAsync();
            }
        }
        public async Task BlockCustomer(int customerId)
        {
            var customer = await context.User
                .FirstOrDefaultAsync(x => x.id == customerId);

            if (customer == null)
            {
                throw new Exception("Customer not found");
            }

            customer.status = "blocked";
            await context.SaveChangesAsync();
        }
        public async Task<Passenger> findPassengerByPhone(string phone)
        {
            var user = await context.Passenger.FirstOrDefaultAsync(x => x.phoneNumber == phone);
            return user;
        }
        
        public async Task updatePassword(int id, string oldPass, string newPass)
        {
            var u = await context.User.FirstOrDefaultAsync(p => p.id == id);
            if (u == null) throw new Exception("Not existed user");
            if (oldPass != u.pass) throw new Exception("Invalid old password");
            u.pass = newPass;
            await context.SaveChangesAsync();
        }
        public async Task<List<StaffDTO>> getAllStaffs()
        {
            var staffs = await (from s in context.Staff
                                select new StaffDTO
                                {
                                    id = s.id,
                                    name = s.name,
                                    gender = (s.gender == 1) ? "Male" : "Female",
                                    address = s.address?? "",
                                    phoneNumber = s.phoneNumber,
                                    email = s.email,
                                    dateOfBirth = s.dateOfBirth,
                                    joinedDate = s.joinedDate,
                                    password = s.pass,
                                    status = s.status,
                                    createdAt = s.createdAt                                  
                                }).ToListAsync();
            return staffs;

        }
        public async Task updateStateUser(int id, string state)
        {
            var user = await context.User.FirstOrDefaultAsync(u => u.id == id);
            if (user == null) throw new Exception("Not existed user");
            user.status = state;
            await context.SaveChangesAsync();
        }
    }
}
