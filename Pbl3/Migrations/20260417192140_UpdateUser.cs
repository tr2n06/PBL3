using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_type",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_Staff_email",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Staff_name",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Staff_phoneNumber",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Passenger_email",
                table: "Passenger");

            migrationBuilder.DropIndex(
                name: "IX_Passenger_name",
                table: "Passenger");

            migrationBuilder.DropIndex(
                name: "IX_Passenger_phoneNumber",
                table: "Passenger");

            migrationBuilder.DropIndex(
                name: "IX_Admin_email",
                table: "Admin");

            migrationBuilder.DropIndex(
                name: "IX_Admin_name",
                table: "Admin");

            migrationBuilder.DropIndex(
                name: "IX_Admin_phoneNumber",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "type",
                table: "User");

            migrationBuilder.DropColumn(
                name: "address",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "dateOfBirth",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "email",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "name",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "pass",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "phoneNumber",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "address",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "dateOfBirth",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "email",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "name",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "pass",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "phoneNumber",
                table: "Passenger");

            migrationBuilder.DropColumn(
                name: "address",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "dateOfBirth",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "email",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "name",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "pass",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "phoneNumber",
                table: "Admin");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "User",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "dateOfBirth",
                table: "User",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "User",
                type: "varchar(254)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "User",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "pass",
                table: "User",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phoneNumber",
                table: "User",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_User_email",
                table: "User",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_name",
                table: "User",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_phoneNumber",
                table: "User",
                column: "phoneNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_email",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_User_name",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_User_phoneNumber",
                table: "User");

            migrationBuilder.DropColumn(
                name: "address",
                table: "User");

            migrationBuilder.DropColumn(
                name: "dateOfBirth",
                table: "User");

            migrationBuilder.DropColumn(
                name: "email",
                table: "User");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "User");

            migrationBuilder.DropColumn(
                name: "name",
                table: "User");

            migrationBuilder.DropColumn(
                name: "pass",
                table: "User");

            migrationBuilder.DropColumn(
                name: "phoneNumber",
                table: "User");

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "User",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "Staff",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "dateOfBirth",
                table: "Staff",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "Staff",
                type: "varchar(254)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "Staff",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "Staff",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "pass",
                table: "Staff",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phoneNumber",
                table: "Staff",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "Passenger",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "dateOfBirth",
                table: "Passenger",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "Passenger",
                type: "varchar(254)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "Passenger",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "Passenger",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "pass",
                table: "Passenger",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phoneNumber",
                table: "Passenger",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "Admin",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "dateOfBirth",
                table: "Admin",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "Admin",
                type: "varchar(254)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "Admin",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "Admin",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "pass",
                table: "Admin",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phoneNumber",
                table: "Admin",
                type: "varchar(10)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_User_type",
                table: "User",
                column: "type",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_email",
                table: "Staff",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_name",
                table: "Staff",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_phoneNumber",
                table: "Staff",
                column: "phoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Passenger_email",
                table: "Passenger",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Passenger_name",
                table: "Passenger",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Passenger_phoneNumber",
                table: "Passenger",
                column: "phoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admin_email",
                table: "Admin",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admin_name",
                table: "Admin",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admin_phoneNumber",
                table: "Admin",
                column: "phoneNumber",
                unique: true);
        }
    }
}
