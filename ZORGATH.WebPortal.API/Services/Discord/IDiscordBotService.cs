namespace ZORGATH.WebPortal.API.Services.Discord;

public interface IDiscordBotService
{
    public Task<bool> SendVerificationDM(string discordID, string accountName, string verificationToken);
}
