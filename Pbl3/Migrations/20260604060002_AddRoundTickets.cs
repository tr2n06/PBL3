using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class AddRoundTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoundTickets",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    codeTicket = table.Column<string>(type: "varchar(16)", nullable: false),
                    returnCodeTicket = table.Column<string>(type: "varchar(16)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoundTickets", x => x.id);
                    table.ForeignKey(
                        name: "FK_RoundTickets_Ticket_codeTicket",
                        column: x => x.codeTicket,
                        principalTable: "Ticket",
                        principalColumn: "codeTicket",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoundTickets_Ticket_returnCodeTicket",
                        column: x => x.returnCodeTicket,
                        principalTable: "Ticket",
                        principalColumn: "codeTicket",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoundTickets_codeTicket",
                table: "RoundTickets",
                column: "codeTicket",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoundTickets_returnCodeTicket",
                table: "RoundTickets",
                column: "returnCodeTicket",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoundTickets");
        }
    }
}
