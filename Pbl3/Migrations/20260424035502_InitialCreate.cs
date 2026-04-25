using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "City",
                columns: table => new
                {
                    abbreviatedName = table.Column<string>(type: "varchar(10)", nullable: false),
                    fullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    airplane = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_City", x => x.abbreviatedName);
                });

            migrationBuilder.CreateTable(
                name: "TicketType",
                columns: table => new
                {
                    codeType = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    priceBooked = table.Column<int>(type: "int", nullable: false),
                    canBeUpgrade = table.Column<bool>(type: "bit", nullable: false),
                    canBeCanceled = table.Column<bool>(type: "bit", nullable: false),
                    weightBaggage = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketType", x => x.codeType);
                });

            migrationBuilder.CreateTable(
                name: "Transaction",
                columns: table => new
                {
                    codeTransaction = table.Column<string>(type: "varchar(30)", nullable: false),
                    sourceBank = table.Column<string>(type: "varchar(100)", nullable: false),
                    sourceAccount = table.Column<string>(type: "varchar(100)", nullable: false),
                    beneficiaryBank = table.Column<string>(type: "varchar(100)", nullable: false),
                    beneficiaryAccount = table.Column<string>(type: "varchar(100)", nullable: false),
                    transactionAmount = table.Column<int>(type: "int", nullable: false),
                    timeTransaction = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transaction", x => x.codeTransaction);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    gender = table.Column<int>(type: "int", nullable: false),
                    dateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    address = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phoneNumber = table.Column<string>(type: "varchar(10)", nullable: false),
                    email = table.Column<string>(type: "varchar(254)", nullable: false),
                    pass = table.Column<string>(type: "varchar(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "FromTo",
                columns: table => new
                {
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    from = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    to = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FromTo", x => x.codeFlight);
                    table.ForeignKey(
                        name: "FK_FromTo_City_from",
                        column: x => x.from,
                        principalTable: "City",
                        principalColumn: "abbreviatedName",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FromTo_City_to",
                        column: x => x.to,
                        principalTable: "City",
                        principalColumn: "abbreviatedName",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    joinedDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admin", x => x.id);
                    table.ForeignKey(
                        name: "FK_Admin_User_id",
                        column: x => x.id,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Booking",
                columns: table => new
                {
                    codeBooking = table.Column<string>(type: "varchar(8)", nullable: false),
                    idUser = table.Column<int>(type: "int", nullable: false),
                    codeTransaction = table.Column<string>(type: "varchar(30)", nullable: false),
                    bookedPrice = table.Column<int>(type: "int", nullable: false),
                    bookedTime = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking", x => x.codeBooking);
                    table.ForeignKey(
                        name: "FK_Booking_Transaction_codeTransaction",
                        column: x => x.codeTransaction,
                        principalTable: "Transaction",
                        principalColumn: "codeTransaction",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Booking_User_idUser",
                        column: x => x.idUser,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Passenger",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    pointReward = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Passenger", x => x.id);
                    table.ForeignKey(
                        name: "FK_Passenger_User_id",
                        column: x => x.id,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Staff",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    joinedDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Staff", x => x.id);
                    table.ForeignKey(
                        name: "FK_Staff_User_id",
                        column: x => x.id,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Flight",
                columns: table => new
                {
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    arriveDate = table.Column<DateOnly>(type: "date", nullable: false),
                    arriveTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    landingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    landingTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    price = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flight", x => new { x.codeFlight, x.arriveDate, x.arriveTime });
                    table.ForeignKey(
                        name: "FK_Flight_FromTo_codeFlight",
                        column: x => x.codeFlight,
                        principalTable: "FromTo",
                        principalColumn: "codeFlight",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Baggage",
                columns: table => new
                {
                    codeTransaction = table.Column<string>(type: "varchar(30)", nullable: false),
                    codeTicket = table.Column<string>(type: "varchar(6)", nullable: false),
                    weight = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Baggage", x => new { x.codeTicket, x.codeTransaction });
                    table.ForeignKey(
                        name: "FK_Baggage_Transaction_codeTransaction",
                        column: x => x.codeTransaction,
                        principalTable: "Transaction",
                        principalColumn: "codeTransaction",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FlightSeat",
                columns: table => new
                {
                    codeSeat = table.Column<string>(type: "varchar(3)", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    arriveDate = table.Column<DateOnly>(type: "date", nullable: false),
                    arriveTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    codeType = table.Column<int>(type: "int", nullable: false),
                    isBooked = table.Column<bool>(type: "bit", nullable: false),
                    ticketcodeTicket = table.Column<string>(type: "varchar(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightSeat", x => new { x.codeSeat, x.codeFlight, x.arriveDate, x.arriveTime });
                    table.ForeignKey(
                        name: "FK_FlightSeat_Flight_codeFlight_arriveDate_arriveTime",
                        columns: x => new { x.codeFlight, x.arriveDate, x.arriveTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "arriveDate", "arriveTime" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FlightSeat_TicketType_codeType",
                        column: x => x.codeType,
                        principalTable: "TicketType",
                        principalColumn: "codeType",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ticket",
                columns: table => new
                {
                    codeTicket = table.Column<string>(type: "varchar(6)", nullable: false),
                    codeBooking = table.Column<string>(type: "varchar(8)", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    arriveDate = table.Column<DateOnly>(type: "date", nullable: false),
                    arriveTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    codeSeat = table.Column<string>(type: "varchar(3)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    identityCard = table.Column<string>(type: "varchar(20)", nullable: false),
                    price = table.Column<int>(type: "int", nullable: false),
                    CanSelectSeat = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticket", x => x.codeTicket);
                    table.ForeignKey(
                        name: "FK_Ticket_Booking_codeBooking",
                        column: x => x.codeBooking,
                        principalTable: "Booking",
                        principalColumn: "codeBooking",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ticket_FlightSeat_codeSeat_codeFlight_arriveDate_arriveTime",
                        columns: x => new { x.codeSeat, x.codeFlight, x.arriveDate, x.arriveTime },
                        principalTable: "FlightSeat",
                        principalColumns: new[] { "codeSeat", "codeFlight", "arriveDate", "arriveTime" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ticket_Flight_codeFlight_arriveDate_arriveTime",
                        columns: x => new { x.codeFlight, x.arriveDate, x.arriveTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "arriveDate", "arriveTime" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Baggage_codeTransaction",
                table: "Baggage",
                column: "codeTransaction",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Booking_codeTransaction",
                table: "Booking",
                column: "codeTransaction",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Booking_idUser",
                table: "Booking",
                column: "idUser");

            migrationBuilder.CreateIndex(
                name: "IX_City_airplane",
                table: "City",
                column: "airplane",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_City_fullName",
                table: "City",
                column: "fullName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Flight_codeFlight",
                table: "Flight",
                column: "codeFlight",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_codeFlight_arriveDate_arriveTime",
                table: "FlightSeat",
                columns: new[] { "codeFlight", "arriveDate", "arriveTime" });

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_codeType",
                table: "FlightSeat",
                column: "codeType",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_ticketcodeTicket",
                table: "FlightSeat",
                column: "ticketcodeTicket");

            migrationBuilder.CreateIndex(
                name: "IX_FromTo_from",
                table: "FromTo",
                column: "from");

            migrationBuilder.CreateIndex(
                name: "IX_FromTo_to",
                table: "FromTo",
                column: "to");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeBooking",
                table: "Ticket",
                column: "codeBooking");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeFlight_arriveDate_arriveTime",
                table: "Ticket",
                columns: new[] { "codeFlight", "arriveDate", "arriveTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeSeat_codeFlight_arriveDate_arriveTime",
                table: "Ticket",
                columns: new[] { "codeSeat", "codeFlight", "arriveDate", "arriveTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketType_name",
                table: "TicketType",
                column: "name",
                unique: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Baggage_Ticket_codeTicket",
                table: "Baggage",
                column: "codeTicket",
                principalTable: "Ticket",
                principalColumn: "codeTicket",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlightSeat_Ticket_ticketcodeTicket",
                table: "FlightSeat",
                column: "ticketcodeTicket",
                principalTable: "Ticket",
                principalColumn: "codeTicket");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Booking_User_idUser",
                table: "Booking");

            migrationBuilder.DropForeignKey(
                name: "FK_FlightSeat_Ticket_ticketcodeTicket",
                table: "FlightSeat");

            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "Baggage");

            migrationBuilder.DropTable(
                name: "Passenger");

            migrationBuilder.DropTable(
                name: "Staff");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Ticket");

            migrationBuilder.DropTable(
                name: "Booking");

            migrationBuilder.DropTable(
                name: "FlightSeat");

            migrationBuilder.DropTable(
                name: "Transaction");

            migrationBuilder.DropTable(
                name: "Flight");

            migrationBuilder.DropTable(
                name: "TicketType");

            migrationBuilder.DropTable(
                name: "FromTo");

            migrationBuilder.DropTable(
                name: "City");
        }
    }
}
