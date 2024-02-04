using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class UpdatedCalendarAppointmentSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Subject",
                table: "Appointments",
                newName: "UniqueId");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "Appointments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Text",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "UniqueId",
                table: "Appointments",
                newName: "Subject");
        }
    }
}
