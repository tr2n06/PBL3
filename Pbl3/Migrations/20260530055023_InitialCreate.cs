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
                    priceBooked = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                    id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    gender = table.Column<int>(type: "int", nullable: false),
                    dateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    address = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phoneNumber = table.Column<string>(type: "varchar(10)", nullable: false),
                    email = table.Column<string>(type: "varchar(254)", nullable: false),
                    status = table.Column<string>(type: "varchar(10)", nullable: false),
                    pass = table.Column<string>(type: "varchar(100)", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    to = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    length = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FromTo", x => x.codeFlight);
                    table.ForeignKey(
                        name: "FK_FromTo_City_from",
                        column: x => x.from,
                        principalTable: "City",
                        principalColumn: "abbreviatedName");
                    table.ForeignKey(
                        name: "FK_FromTo_City_to",
                        column: x => x.to,
                        principalTable: "City",
                        principalColumn: "abbreviatedName");
                });

            migrationBuilder.CreateTable(
                name: "Seat",
                columns: table => new
                {
                    codeSeat = table.Column<string>(type: "varchar(3)", nullable: false),
                    codeType = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seat", x => x.codeSeat);
                    table.ForeignKey(
                        name: "FK_Seat_TicketType_codeType",
                        column: x => x.codeType,
                        principalTable: "TicketType",
                        principalColumn: "codeType",
                        onDelete: ReferentialAction.SetNull);
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
                    idUser = table.Column<int>(type: "int", nullable: true),
                    codeTransaction = table.Column<string>(type: "varchar(30)", nullable: false),
                    bookedPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Booking_User_idUser",
                        column: x => x.idUser,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
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
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    landingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    landingTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flight", x => new { x.codeFlight, x.departureDate, x.departureTime });
                    table.ForeignKey(
                        name: "FK_Flight_FromTo_codeFlight",
                        column: x => x.codeFlight,
                        principalTable: "FromTo",
                        principalColumn: "codeFlight");
                });

            migrationBuilder.CreateTable(
                name: "Request",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    requester_id = table.Column<int>(type: "int", nullable: true),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    reviewer_id = table.Column<int>(type: "int", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Request", x => x.id);
                    table.ForeignKey(
                        name: "FK_Request_Admin_reviewer_id",
                        column: x => x.reviewer_id,
                        principalTable: "Admin",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_Request_User_requester_id",
                        column: x => x.requester_id,
                        principalTable: "User",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DiscountFlight",
                columns: table => new
                {
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    discountPercentage = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscountFlight", x => new { x.codeFlight, x.departureDate, x.departureTime });
                    table.ForeignKey(
                        name: "FK_DiscountFlight_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Promotion",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    discount = table.Column<int>(type: "int", nullable: false),
                    createAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotion", x => x.id);
                    table.ForeignKey(
                        name: "FK_Promotion_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FlightRequest",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    discount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightRequest", x => x.id);
                    table.ForeignKey(
                        name: "FK_FlightRequest_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FlightRequest_Request_id",
                        column: x => x.id,
                        principalTable: "Request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PromotionRequest",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    discount = table.Column<int>(type: "int", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionRequest", x => x.id);
                    table.ForeignKey(
                        name: "FK_PromotionRequest_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PromotionRequest_Request_id",
                        column: x => x.id,
                        principalTable: "Request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffRequest",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    address = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phoneNumber = table.Column<string>(type: "varchar(10)", nullable: false),
                    email = table.Column<string>(type: "varchar(254)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffRequest", x => x.id);
                    table.ForeignKey(
                        name: "FK_StaffRequest_Request_id",
                        column: x => x.id,
                        principalTable: "Request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PromotionCancelRequest",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    promotion_id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionCancelRequest", x => x.id);
                    table.ForeignKey(
                        name: "FK_PromotionCancelRequest_Promotion_promotion_id",
                        column: x => x.promotion_id,
                        principalTable: "Promotion",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PromotionCancelRequest_Request_id",
                        column: x => x.id,
                        principalTable: "Request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Baggage",
                columns: table => new
                {
                    codeBaggage = table.Column<string>(type: "varchar(19)", nullable: false),
                    codeTransaction = table.Column<string>(type: "varchar(30)", nullable: false),
                    codeTicket = table.Column<string>(type: "varchar(16)", nullable: false),
                    weight = table.Column<int>(type: "int", nullable: false),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Baggage", x => x.codeBaggage);
                    table.ForeignKey(
                        name: "FK_Baggage_Transaction_codeTransaction",
                        column: x => x.codeTransaction,
                        principalTable: "Transaction",
                        principalColumn: "codeTransaction",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CancelRequest",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    codeTicket = table.Column<string>(type: "varchar(16)", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Userid = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CancelRequest", x => x.id);
                    table.ForeignKey(
                        name: "FK_CancelRequest_Request_id",
                        column: x => x.id,
                        principalTable: "Request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CancelRequest_User_Userid",
                        column: x => x.Userid,
                        principalTable: "User",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "FlightSeat",
                columns: table => new
                {
                    codeSeat = table.Column<string>(type: "varchar(3)", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    isBooked = table.Column<bool>(type: "bit", nullable: false),
                    ticketcodeTicket = table.Column<string>(type: "varchar(16)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightSeat", x => new { x.codeSeat, x.codeFlight, x.departureDate, x.departureTime });
                    table.ForeignKey(
                        name: "FK_FlightSeat_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FlightSeat_Seat_codeSeat",
                        column: x => x.codeSeat,
                        principalTable: "Seat",
                        principalColumn: "codeSeat");
                });

            migrationBuilder.CreateTable(
                name: "Ticket",
                columns: table => new
                {
                    codeTicket = table.Column<string>(type: "varchar(16)", nullable: false),
                    codeBooking = table.Column<string>(type: "varchar(8)", nullable: false),
                    codeFlight = table.Column<string>(type: "varchar(6)", nullable: false),
                    departureDate = table.Column<DateOnly>(type: "date", nullable: false),
                    departureTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    codeSeat = table.Column<string>(type: "varchar(3)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    gender = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    identityCard = table.Column<string>(type: "varchar(20)", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CanSelectSeat = table.Column<bool>(type: "bit", nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    passengerType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    dateOfBirth = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticket", x => x.codeTicket);
                    table.ForeignKey(
                        name: "FK_Ticket_Booking_codeBooking",
                        column: x => x.codeBooking,
                        principalTable: "Booking",
                        principalColumn: "codeBooking",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ticket_FlightSeat_codeSeat_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeSeat, x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "FlightSeat",
                        principalColumns: new[] { "codeSeat", "codeFlight", "departureDate", "departureTime" });
                    table.ForeignKey(
                        name: "FK_Ticket_Flight_codeFlight_departureDate_departureTime",
                        columns: x => new { x.codeFlight, x.departureDate, x.departureTime },
                        principalTable: "Flight",
                        principalColumns: new[] { "codeFlight", "departureDate", "departureTime" });
                });

            migrationBuilder.CreateIndex(
                name: "IX_Baggage_codeTicket",
                table: "Baggage",
                column: "codeTicket");

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
                name: "IX_CancelRequest_codeTicket",
                table: "CancelRequest",
                column: "codeTicket",
                unique: true,
                filter: "[codeTicket] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CancelRequest_Userid",
                table: "CancelRequest",
                column: "Userid");

            migrationBuilder.CreateIndex(
                name: "IX_City_airplane",
                table: "City",
                column: "airplane",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Flight_codeFlight",
                table: "Flight",
                column: "codeFlight",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlightRequest_codeFlight_departureDate_departureTime",
                table: "FlightRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" });

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_codeFlight_departureDate_departureTime",
                table: "FlightSeat",
                columns: new[] { "codeFlight", "departureDate", "departureTime" });

            migrationBuilder.CreateIndex(
                name: "IX_FlightSeat_codeSeat",
                table: "FlightSeat",
                column: "codeSeat",
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
                name: "IX_Promotion_codeFlight_departureDate_departureTime",
                table: "Promotion",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromotionCancelRequest_promotion_id",
                table: "PromotionCancelRequest",
                column: "promotion_id",
                unique: true,
                filter: "[promotion_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionRequest_codeFlight_departureDate_departureTime",
                table: "PromotionRequest",
                columns: new[] { "codeFlight", "departureDate", "departureTime" },
                unique: true,
                filter: "[codeFlight] IS NOT NULL AND [departureDate] IS NOT NULL AND [departureTime] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Request_requester_id",
                table: "Request",
                column: "requester_id");

            migrationBuilder.CreateIndex(
                name: "IX_Request_reviewer_id",
                table: "Request",
                column: "reviewer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Seat_codeType",
                table: "Seat",
                column: "codeType");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeBooking",
                table: "Ticket",
                column: "codeBooking");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeFlight", "departureDate", "departureTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_codeSeat_codeFlight_departureDate_departureTime",
                table: "Ticket",
                columns: new[] { "codeSeat", "codeFlight", "departureDate", "departureTime" },
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
                name: "FK_CancelRequest_Ticket_codeTicket",
                table: "CancelRequest",
                column: "codeTicket",
                principalTable: "Ticket",
                principalColumn: "codeTicket",
                onDelete: ReferentialAction.Restrict);

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
                name: "Baggage");

            migrationBuilder.DropTable(
                name: "CancelRequest");

            migrationBuilder.DropTable(
                name: "DiscountFlight");

            migrationBuilder.DropTable(
                name: "FlightRequest");

            migrationBuilder.DropTable(
                name: "Passenger");

            migrationBuilder.DropTable(
                name: "PromotionCancelRequest");

            migrationBuilder.DropTable(
                name: "PromotionRequest");

            migrationBuilder.DropTable(
                name: "Staff");

            migrationBuilder.DropTable(
                name: "StaffRequest");

            migrationBuilder.DropTable(
                name: "Promotion");

            migrationBuilder.DropTable(
                name: "Request");

            migrationBuilder.DropTable(
                name: "Admin");

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
                name: "Seat");

            migrationBuilder.DropTable(
                name: "FromTo");

            migrationBuilder.DropTable(
                name: "TicketType");

            migrationBuilder.DropTable(
                name: "City");
        }
    }
}
