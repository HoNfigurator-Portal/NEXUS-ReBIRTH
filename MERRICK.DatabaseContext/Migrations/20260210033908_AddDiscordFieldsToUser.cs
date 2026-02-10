using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MERRICK.DatabaseContext.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscordFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DiscordAvatarHash",
                schema: "core",
                table: "Users",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiscordID",
                schema: "core",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiscordUsername",
                schema: "core",
                table: "Users",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_DiscordID",
                schema: "core",
                table: "Users",
                column: "DiscordID",
                unique: true,
                filter: "[DiscordID] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_DiscordID",
                schema: "core",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DiscordAvatarHash",
                schema: "core",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DiscordID",
                schema: "core",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DiscordUsername",
                schema: "core",
                table: "Users");
        }
    }
}
