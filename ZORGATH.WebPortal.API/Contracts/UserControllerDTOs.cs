namespace ZORGATH.WebPortal.API.Contracts;

public record RegisterUserAndMainAccountDTO(string Token, string Name, string Password, string ConfirmPassword);

public record LogInUserDTO(string Name, string Password);

public record GetBasicUserDTO(int ID, string EmailAddress, List<GetBasicAccountDTO> Accounts);

public record GetBasicAccountDTO(int ID, string Name);

public record GetAuthenticationTokenDTO(int UserID, string TokenType, string Token, bool IsVerified);

public record RegisterDiscordUserDTO(string DiscordID, string DiscordUsername, string DiscordEmail, string? DiscordAvatarHash, string AccountName, string Password, string ConfirmPassword);

public record GetDiscordUserDTO(int UserID, string DiscordID, string DiscordUsername, string? DiscordAvatarHash, string EmailAddress, bool IsVerified, List<GetBasicAccountDTO> Accounts);

public record CheckAccountNameDTO(bool IsAvailable, string AccountName);

public record LogInDiscordDTO(string DiscordID);
