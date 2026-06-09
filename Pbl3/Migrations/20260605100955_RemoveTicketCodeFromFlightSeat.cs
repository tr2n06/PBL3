using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTicketCodeFromFlightSeat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlightSeat_Ticket_ticketcodeTicket",
                table: "FlightSeat");

            migrationBuilder.DropIndex(
                name: "IX_FlightSeat_ticketcodeTicket",
                table: "FlightSeat");

            migrationBuilder.DropColumn(
                name: "ticketcodeTicket",
                table: "FlightSeat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ticketcodeTicket",
                table: "FlightSeat",
                type: "varchar(16)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_ticketcodeTicket",
                table: "FlightSeat",
                column: "ticketcodeTicket");

            migrationBuilder.AddForeignKey(
                name: "FK_FlightSeat_Ticket_ticketcodeTicket",
                table: "FlightSeat",
                column: "ticketcodeTicket",
                principalTable: "Ticket",
                principalColumn: "codeTicket");
        }
    }
}
