using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class AddedOrders : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    OrderNumber = table.Column<int>(nullable: false),
                    CustomerNumber = table.Column<int>(nullable: false),
                    CustomerName = table.Column<string>(nullable: true),
                    RegistrationDate = table.Column<DateTime>(nullable: true),
                    SalesPerson = table.Column<string>(nullable: true),
                    InvoicedDate = table.Column<DateTime>(nullable: true),
                    InvoicedAmount = table.Column<int>(nullable: false),
                    RemainingAmount = table.Column<int>(nullable: false),
                    OrderAmount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
