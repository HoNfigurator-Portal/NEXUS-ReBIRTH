namespace ZORGATH.WebPortal.API.Services.Discord;

public class DiscordBotService(IOptions<OperationalConfiguration> configuration, ILogger<DiscordBotService> logger, IHttpClientFactory httpClientFactory) : IDiscordBotService
{
    private OperationalConfiguration Configuration { get; } = configuration.Value;
    private ILogger Logger { get; } = logger;
    private IHttpClientFactory HttpClientFactory { get; } = httpClientFactory;

    private const string DiscordAPIBaseURL = "https://discord.com/api/v10";

    public async Task<bool> SendVerificationDM(string discordID, string accountName, string verificationToken)
    {
        try
        {
            using HttpClient client = HttpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bot", Configuration.DiscordBot.BotToken);

            // Step 1: Create A DM Channel With The User
            HttpResponseMessage dmChannelResponse = await client.PostAsJsonAsync(
                $"{DiscordAPIBaseURL}/users/@me/channels",
                new { recipient_id = discordID }
            );

            if (!dmChannelResponse.IsSuccessStatusCode)
            {
                string error = await dmChannelResponse.Content.ReadAsStringAsync();
                Logger.LogError("Failed To Create DM Channel With Discord User {DiscordID}: {Error}", discordID, error);
                return false;
            }

            JsonDocument dmChannel = await JsonDocument.ParseAsync(await dmChannelResponse.Content.ReadAsStreamAsync());
            string channelId = dmChannel.RootElement.GetProperty("id").GetString()!;

            // Step 2: Build The Verification Link
            string verificationLink = $"{Configuration.DiscordBot.VerificationBaseURL}/verify?token={verificationToken}";

            // Step 3: Send The Verification Message
            var messagePayload = new
            {
                embeds = new[]
                {
                    new
                    {
                        title = "⚔️ Project KONGOR Re:BIRTH — Account Verification",
                        description = $"Welcome, **{accountName}**!\n\nPlease click the button below to verify your account and gain access to the web portal.",
                        color = 0x10B981, // Emerald-500
                        fields = new[]
                        {
                            new
                            {
                                name = "Verification Link",
                                value = $"[Click Here To Verify Your Account]({verificationLink})",
                                inline = false
                            }
                        },
                        footer = new
                        {
                            text = "This link will expire. If you did not create this account, please ignore this message."
                        }
                    }
                }
            };

            HttpResponseMessage messageResponse = await client.PostAsJsonAsync(
                $"{DiscordAPIBaseURL}/channels/{channelId}/messages",
                messagePayload
            );

            if (!messageResponse.IsSuccessStatusCode)
            {
                string error = await messageResponse.Content.ReadAsStringAsync();
                Logger.LogError("Failed To Send Verification DM To Discord User {DiscordID}: {Error}", discordID, error);
                return false;
            }

            Logger.LogInformation("Verification DM Sent To Discord User {DiscordID} For Account {AccountName}", discordID, accountName);
            return true;
        }
        catch (Exception exception)
        {
            Logger.LogError(exception, "Exception While Sending Verification DM To Discord User {DiscordID}", discordID);
            return false;
        }
    }
}
