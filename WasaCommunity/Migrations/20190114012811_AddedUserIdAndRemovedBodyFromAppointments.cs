using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class AddedUserIdAndRemovedBodyFromAppointments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Body",
                table: "Appointments");

            migrationBuilder.AddColumn<bool>(
                name: "AllDay",
                table: "Appointments",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllDay",
                table: "Appointments");

            migrationBuilder.AddColumn<string>(
                name: "Body",
                table: "Appointments",
                nullable: true);
        }
    }
}
