using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class ChangeTicketFlightSeatToManyToOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ticket_codeSeat_codeFlight_departureDate_departureTime",
                table: "Ticket");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeSeat_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeSeat", "codeFlight", "departureDate", "departureTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ticket_codeSeat_codeFlight_departureDate_departureTime",
                table: "Ticket");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeSeat_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeSeat", "codeFlight", "departureDate", "departureTime" },
                unique: true);
        }
    }
}
