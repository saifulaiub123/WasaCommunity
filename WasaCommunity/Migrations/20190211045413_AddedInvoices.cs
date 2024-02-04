using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class AddedInvoices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    IsCredit = table.Column<bool>(nullable: false),
                    InvoiceNumber = table.Column<int>(nullable: false),
                    CompanyName = table.Column<string>(nullable: true),
                    Warehouse = table.Column<string>(nullable: true),
                    InvoiceDate = table.Column<DateTime>(nullable: true),
                    ExpiryDate = table.Column<DateTime>(nullable: true),
                    Amount = table.Column<double>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Invoices");
        }
    }
}
