using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class AddedPropertiesOnNotificationSubscriber : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Auth",
                table: "NotificationSubscribers",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "P256dh",
                table: "NotificationSubscribers",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Auth",
                table: "NotificationSubscribers");

            migrationBuilder.DropColumn(
                name: "P256dh",
                table: "NotificationSubscribers");
        }
    }
}
