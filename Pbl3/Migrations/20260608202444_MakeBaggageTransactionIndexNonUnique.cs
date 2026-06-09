using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pbl3.Migrations
{
    /// <inheritdoc />
    public partial class MakeBaggageTransactionIndexNonUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Baggage_codeTransaction' AND object_id = OBJECT_ID('Baggage'))
                BEGIN
                    DROP INDEX IX_Baggage_codeTransaction ON Baggage;
                END
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Baggage_codeTransaction",
                table: "Baggage",
                column: "codeTransaction");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Baggage_codeTransaction' AND object_id = OBJECT_ID('Baggage'))
                BEGIN
                    DROP INDEX IX_Baggage_codeTransaction ON Baggage;
                END
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Baggage_codeTransaction",
                table: "Baggage",
                column: "codeTransaction",
                unique: true);
        }
    }
}
