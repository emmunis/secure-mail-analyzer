using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RubyApi.Migrations
{
    /// <inheritdoc />
    public partial class LlmEntegrasyonu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LlmAciklama",
                table: "AnalizKayitlari",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LlmBasarili",
                table: "AnalizKayitlari",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LlmIstendi",
                table: "AnalizKayitlari",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LlmOnerileri",
                table: "AnalizKayitlari",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LlmAciklama",
                table: "AnalizKayitlari");

            migrationBuilder.DropColumn(
                name: "LlmBasarili",
                table: "AnalizKayitlari");

            migrationBuilder.DropColumn(
                name: "LlmIstendi",
                table: "AnalizKayitlari");

            migrationBuilder.DropColumn(
                name: "LlmOnerileri",
                table: "AnalizKayitlari");
        }
    }
}
