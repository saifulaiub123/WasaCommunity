using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WasaCommunity.Migrations
{
    public partial class UpdatedAlertMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertReceivers");

            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.CreateTable(
                name: "AlertMessages",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    AuthorId = table.Column<string>(nullable: false),
                    Title = table.Column<string>(nullable: false),
                    Body = table.Column<string>(nullable: true),
                    SentAt = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertMessages_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlertRecipients",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    AlertId = table.Column<string>(nullable: true),
                    RecipientId = table.Column<string>(nullable: true),
                    IsRead = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertRecipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertRecipients_AlertMessages_AlertId",
                        column: x => x.AlertId,
                        principalTable: "AlertMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AlertRecipients_Users_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertMessages_AuthorId",
                table: "AlertMessages",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertRecipients_AlertId",
                table: "AlertRecipients",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertRecipients_RecipientId",
                table: "AlertRecipients",
                column: "RecipientId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertRecipients");

            migrationBuilder.DropTable(
                name: "AlertMessages");

            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    AuthorId = table.Column<string>(nullable: false),
                    Body = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    IsRead = table.Column<bool>(nullable: false),
                    Title = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alerts_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlertReceivers",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    AlertId = table.Column<string>(nullable: true),
                    ReceiverId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertReceivers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertReceivers_Alerts_AlertId",
                        column: x => x.AlertId,
                        principalTable: "Alerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AlertReceivers_Users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertReceivers_AlertId",
                table: "AlertReceivers",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertReceivers_ReceiverId",
                table: "AlertReceivers",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_AuthorId",
                table: "Alerts",
                column: "AuthorId");
        }
    }
}
