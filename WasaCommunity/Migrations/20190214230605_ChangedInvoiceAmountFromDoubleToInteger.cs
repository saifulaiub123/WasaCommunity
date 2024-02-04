using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class ChangedInvoiceAmountFromDoubleToInteger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Amount",
                table: "Invoices",
                nullable: false,
                oldClrType: typeof(double));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Amount",
                table: "Invoices",
                nullable: false,
                oldClrType: typeof(int));
        }
    }
}
