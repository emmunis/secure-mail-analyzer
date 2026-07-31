using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RubyApi.Migrations
{
    /// <inheritdoc />
    public partial class RiskPuanDetaylari : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RiskPuanDetaylari",
                table: "AnalizKayitlari",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RiskPuanDetaylari",
                table: "AnalizKayitlari");
        }
    }
}
