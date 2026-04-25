using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Account;
using Pbl3.DTOs.Auth;
using Pbl3.Repositories.Interface;
using System.Reflection;
namespace Pbl3.Repositories.Implementation
{
    public class UserRepository : IUserRepository
    {
        AppDbContext context { get; set; }

        public UserRepository(AppDbContext context) { 
            this.context = context;
        }
        public async Task InsertPassenger(RegisterDTO p)
        {
            int gen = p.gender == "Nam" ? 1 : 0;
            int current = await context.Passenger.MaxAsync(u => u.id) + 1;
            await context.User.AddAsync(new Passenger
            {
                id = (current > 51) ? current : 51,
                name = p.name,
                gender = gen,
                dateOfBirth = p.dateOfBirth,
                phoneNumber = p.phoneNumber,
                email = p.email,
                pointReward = 0,
                pass = p.password,
            }); 
        }

        public async Task<string> InsertStaff(RegisterDTO p)
        {
            int gen = p.gender == "Nam" ? 1 : 0;
            int current = await context.Staff.MaxAsync(u => u.id) + 1;
            if (current > 50) return "Staff limit reached";
            await context.User.AddAsync(new Staff
            {
                id = (current > 11) ? current : 11,
                name = p.name,
                gender = gen,
                dateOfBirth = p.dateOfBirth,
                phoneNumber = p.phoneNumber,
                email = p.email,
                joinedDate = DateOnly.FromDateTime(DateTime.Now),
                pass = p.password,
            });
            return "Staff added successfully";
        }
        public async Task<User> GetUserById(int id)
        {
            var user = await (from u in context.User
                              where (u.id == id)
                              select u)
                              .FirstOrDefaultAsync<User>();
            return user switch
            {
                Passenger p => p,
                Staff s => s,
                Admin a => a,
                _ => null
            };
        }

        public async Task<User> GetUserByEmail(string email)
        {
            var user = await (from u in context.User
                             where (u.email == email)
                             select u)
                              .FirstOrDefaultAsync<User>();
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
                if (p.gender != null) passenger.gender = (p.gender == "Nam") ? 1 : 0;
                passenger.dateOfBirth = p.dateOfBirth ?? passenger.dateOfBirth;
                passenger.phoneNumber = p.phoneNumber ?? passenger.phoneNumber;
                passenger.email = p.email ?? passenger.email;
                passenger.pass = p.password ?? passenger.pass;
                await context.SaveChangesAsync();
            }
        }
        public async Task UpdateStaff(UpdateUserDTO p)
        {
            var staff = await context.Staff.FindAsync(p.id);
            if (staff != null)
            {
                if (p.gender != null) staff.gender = (p.gender == "Nam") ? 1 : 0;
                staff.dateOfBirth = p.dateOfBirth ?? staff.dateOfBirth;
                staff.phoneNumber = p.phoneNumber ?? staff.phoneNumber;
                staff.email = p.email ?? staff.email;
                staff.pass = p.password ?? staff.pass;
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
    }
}
