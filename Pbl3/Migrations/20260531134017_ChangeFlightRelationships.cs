using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFlightRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Flight_codeFlight",
                table: "Flight");

            // Drop existing foreign keys referencing Flight composite key
            migrationBuilder.DropForeignKey(
                name: "FK_Ticket_Flight_codeFlight_departureDate_departureTime",
                table: "Ticket");

            migrationBuilder.DropForeignKey(
                name: "FK_FlightSeat_Flight_codeFlight_departureDate_departureTime",
                table: "FlightSeat");

            migrationBuilder.DropForeignKey(
                name: "FK_DiscountFlight_Flight_codeFlight_departureDate_departureTime",
                table: "DiscountFlight");

            migrationBuilder.DropForeignKey(
                name: "FK_FlightRequest_Flight_codeFlight_departureDate_departureTime",
                table: "FlightRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotion_Flight_codeFlight_departureDate_departureTime",
                table: "Promotion");

            migrationBuilder.DropForeignKey(
                name: "FK_PromotionRequest_Flight_codeFlight_departureDate_departureTime",
                table: "PromotionRequest");

            // Re-create foreign keys with onUpdate: ReferentialAction.Cascade
            migrationBuilder.AddForeignKey(
                name: "FK_Ticket_Flight_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onUpdate: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlightSeat_Flight_codeFlight_departureDate_departureTime",
                table: "FlightSeat",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade,
                onUpdate: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DiscountFlight_Flight_codeFlight_departureDate_departureTime",
                table: "DiscountFlight",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade,
                onUpdate: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlightRequest_Flight_codeFlight_departureDate_departureTime",
                table: "FlightRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Restrict,
                onUpdate: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Promotion_Flight_codeFlight_departureDate_departureTime",
                table: "Promotion",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade,
                onUpdate: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PromotionRequest_Flight_codeFlight_departureDate_departureTime",
                table: "PromotionRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade,
                onUpdate: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Flight_codeFlight",
                table: "Flight",
                column: "codeFlight",
                unique: true);

            // Drop Cascade foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Ticket_Flight_codeFlight_departureDate_departureTime",
                table: "Ticket");

            migrationBuilder.DropForeignKey(
                name: "FK_FlightSeat_Flight_codeFlight_departureDate_departureTime",
                table: "FlightSeat");

            migrationBuilder.DropForeignKey(
                name: "FK_DiscountFlight_Flight_codeFlight_departureDate_departureTime",
                table: "DiscountFlight");

            migrationBuilder.DropForeignKey(
                name: "FK_FlightRequest_Flight_codeFlight_departureDate_departureTime",
                table: "FlightRequest");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotion_Flight_codeFlight_departureDate_departureTime",
                table: "Promotion");

            migrationBuilder.DropForeignKey(
                name: "FK_PromotionRequest_Flight_codeFlight_departureDate_departureTime",
                table: "PromotionRequest");

            // Restore original foreign keys (without onUpdate Cascade)
            migrationBuilder.AddForeignKey(
                name: "FK_Ticket_Flight_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" });

            migrationBuilder.AddForeignKey(
                name: "FK_FlightSeat_Flight_codeFlight_departureDate_departureTime",
                table: "FlightSeat",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DiscountFlight_Flight_codeFlight_departureDate_departureTime",
                table: "DiscountFlight",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlightRequest_Flight_codeFlight_departureDate_departureTime",
                table: "FlightRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Promotion_Flight_codeFlight_departureDate_departureTime",
                table: "Promotion",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PromotionRequest_Flight_codeFlight_departureDate_departureTime",
                table: "PromotionRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                principalTable: "Flight",
                principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                onDelete: ReferentialAction.Cascade);
        }
    }
}
