namespace ZORGATH.WebPortal.API.Controllers;

[ApiController]
[Route("[controller]")]
[Consumes("application/json")]
[EnableRateLimiting(RateLimiterPolicies.Strict)]
public class UserController(MerrickContext databaseContext, ILogger<UserController> logger, IEmailService emailService, IDiscordBotService discordBotService, IOptions<OperationalConfiguration> configuration, IWebHostEnvironment hostEnvironment) : ControllerBase
{
    private MerrickContext MerrickContext { get; } = databaseContext;
    private ILogger Logger { get; } = logger;
    private IEmailService EmailService { get; } = emailService;
    private IDiscordBotService DiscordBotService { get; } = discordBotService;
    private OperationalConfiguration Configuration { get; } = configuration.Value;
    private IWebHostEnvironment HostEnvironment { get; } = hostEnvironment;

    [HttpPost("Register", Name = "Register User And Main Account")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetBasicUserDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegisterUserAndMainAccount([FromBody] RegisterUserAndMainAccountDTO payload)
    {
        if (payload.Password.Equals(payload.ConfirmPassword).Equals(false))
            return BadRequest($@"Password ""{payload.ConfirmPassword}"" Does Not Match ""{payload.Password}"" (These Values Are Only Visible To You)");

        if (HostEnvironment.IsDevelopment() is false)
        {
            ValidationResult result = await new PasswordValidator().ValidateAsync(payload.Password);

            if (result.IsValid is false)
                return BadRequest(result.Errors.Select(error => error.ErrorMessage));
        }

        Token? token = await MerrickContext.Tokens.SingleOrDefaultAsync(token => token.Value.ToString().Equals(payload.Token) && token.Purpose.Equals(TokenPurpose.EmailAddressVerification));

        if (token is null)
        {
            return NotFound($@"Email Registration Token ""{payload.Token}"" Was Not Found");
        }

        if (token.TimestampConsumed is not null)
        {
            return Conflict($@"Email Registration Token ""{payload.Token}"" Has Already Been Consumed");
        }

        string sanitizedEmailAddress = token.Data;

        if (await MerrickContext.Users.AnyAsync(user => user.EmailAddress.Equals(sanitizedEmailAddress)))
        {
            return Conflict($@"User With Email ""{token.EmailAddress}"" Already Exists");
        }

        if (await MerrickContext.Accounts.AnyAsync(account => account.Name.Equals(payload.Name)))
        {
            return Conflict($@"Account With Name ""{payload.Name}"" Already Exists");
        }

        Role? role = await MerrickContext.Roles.SingleOrDefaultAsync(role => role.Name.Equals(UserRoles.User));

        if (role is null)
        {
            return NotFound($@"User Role ""{UserRoles.User}"" Was Not Found");
        }

        string salt = SRPRegistrationHandlers.GenerateSRPPasswordSalt();

        User user = new ()
        {
            EmailAddress = sanitizedEmailAddress,
            Role = role,
            SRPPasswordSalt = salt,
            SRPPasswordHash = SRPRegistrationHandlers.ComputeSRPPasswordHash(payload.Password, salt)
        };

        user.PBKDF2PasswordHash = new PasswordHasher<User>().HashPassword(user, payload.Password);

        await MerrickContext.Users.AddAsync(user);

        Account account = new ()
        {
            Name = payload.Name,
            User = user,
            IsMain = true
        };

        user.Accounts.Add(account);

        token.TimestampConsumed = DateTimeOffset.UtcNow;

        await MerrickContext.SaveChangesAsync();

        await EmailService.SendEmailAddressRegistrationConfirmation(user.EmailAddress, account.Name);

        return CreatedAtAction(nameof(GetUser), new { id = user.ID },
            new GetBasicUserDTO(user.ID, user.EmailAddress, [new GetBasicAccountDTO(account.ID, account.Name)]));
    }

    [HttpPost("LogIn", Name = "Log In User")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetAuthenticationTokenDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> LogInUser([FromBody] LogInUserDTO payload)
    {
        Account? account = await MerrickContext.Accounts
            .Include(account => account.User).ThenInclude(user => user.Role)
            .Include(account => account.Clan)
            .SingleOrDefaultAsync(account => account.Name.Equals(payload.Name));

        if (account is null)
            return NotFound($@"Account ""{payload.Name}"" Was Not Found");

        User user = account.User;

        PasswordVerificationResult result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PBKDF2PasswordHash, payload.Password);

        if (result is not PasswordVerificationResult.Success)
            return Unauthorized("Invalid User Name And/Or Password");

        if (new [] { UserRoles.Administrator, UserRoles.User }.Contains(user.Role.Name).Equals(false))
        {
            Logger.LogError(@"[BUG] Unknown User Role ""{User.Role.Name}""", user.Role.Name);

            return UnprocessableEntity($@"Unknown User Role ""{user.Role.Name}""");
        }

        IEnumerable<Claim> userRoleClaims = user.Role.Name is UserRoles.Administrator ? UserRoleClaims.Administrator : UserRoleClaims.User;

        IEnumerable<Claim> openIDClaims = new List<Claim>
        {
            # region JWT Claims Documentation
            // OpenID (This Implementation): https://openid.net/specs/openid-connect-core-1_0.html#IDToken
            // auth0: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims
            // Internet Assigned Numbers Authority: https://www.iana.org/assignments/jwt/jwt.xhtml
            // RFC7519: https://www.rfc-editor.org/rfc/rfc7519.html#section-4
            # endregion

            new (JwtRegisteredClaimNames.Sub, account.Name, ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new (JwtRegisteredClaimNames.AuthTime, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new (JwtRegisteredClaimNames.Nonce, Guid.CreateVersion7().ToString(), ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString(), ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Email, user.EmailAddress, ClaimValueTypes.Email)
        };

        IEnumerable<Claim> customClaims = new List<Claim>
        {
            new (Claims.UserID, user.ID.ToString(), ClaimValueTypes.String),
            new (Claims.AccountID, account.ID.ToString(), ClaimValueTypes.String),
            new (Claims.AccountIsMain, account.IsMain.ToString(), ClaimValueTypes.Boolean),
            new (Claims.ClanName, account.Clan?.Name ?? string.Empty, ClaimValueTypes.String),
            new (Claims.ClanTag, account.Clan?.Tag ?? string.Empty, ClaimValueTypes.String)
        };

        IEnumerable<Claim> allTokenClaims = Enumerable.Empty<Claim>().Union(userRoleClaims).Union(openIDClaims).Union(customClaims).OrderBy(claim => claim.Type);

        JwtSecurityToken token = new
        (
            issuer: Configuration.JWT.Issuer,
            audience: Configuration.JWT.Audience,
            claims: allTokenClaims,
            expires: DateTimeOffset.UtcNow.AddHours(Configuration.JWT.DurationInHours).DateTime,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration.JWT.SigningKey)), SecurityAlgorithms.HmacSha256) // TODO: Put The Signing Key In A Secrets Vault
        );

        string jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new GetAuthenticationTokenDTO(user.ID, "JWT", jwt, user.IsVerified));
    }

    [HttpGet("{id}", Name = "Get User")]
    [Authorize(UserRoles.AllRoles)]
    [ProducesResponseType(typeof(GetBasicUserDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(int id)
    {
        User? user = await MerrickContext.Users
            .Include(record => record.Role)
            .Include(record => record.Accounts).ThenInclude(record => record.Clan)
            .SingleOrDefaultAsync(record => record.ID.Equals(id));

        if (user is null)
            return NotFound($@"User With ID ""{id}"" Was Not Found");

        // TODO: [OutputCache] On Get Requests

        string role = User.Claims.GetUserRole();

        if (role.Equals(UserRoles.Administrator))
        {
            return Ok(new GetBasicUserDTO(user.ID, user.EmailAddress,
                user.Accounts.Select(account => new GetBasicAccountDTO(account.ID, account.NameWithClanTag)).ToList()));
        }

        if (role.Equals(UserRoles.User))
        {
            return Ok(new GetBasicUserDTO(user.ID,
                new string(user.EmailAddress.Select(character => char.IsLetterOrDigit(character) ? '*' : character).ToArray()),
                user.Accounts.Select(account => new GetBasicAccountDTO(account.ID, account.NameWithClanTag)).ToList()));
        }

        Logger.LogError(@"[BUG] Unknown User Role ""{User.Role}""", role);

        return BadRequest($@"Unknown User Role ""{role}""");
    }

    [HttpPost("LoginDiscord", Name = "Log In User Via Discord")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetAuthenticationTokenDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> LogInDiscordUser([FromBody] LogInDiscordDTO payload)
    {
        User? user = await MerrickContext.Users
            .Include(record => record.Role)
            .Include(record => record.Accounts).ThenInclude(record => record.Clan)
            .SingleOrDefaultAsync(record => record.DiscordID != null && record.DiscordID.Equals(payload.DiscordID));

        if (user is null)
            return NotFound($@"User With Discord ID ""{payload.DiscordID}"" Was Not Found");

        Account? account = user.Accounts.FirstOrDefault(account => account.IsMain) ?? user.Accounts.FirstOrDefault();

        if (account is null)
            return NotFound($@"User With Discord ID ""{payload.DiscordID}"" Has No Accounts");

        if (new [] { UserRoles.Administrator, UserRoles.User }.Contains(user.Role.Name).Equals(false))
        {
            Logger.LogError(@"[BUG] Unknown User Role ""{User.Role.Name}""", user.Role.Name);

            return UnprocessableEntity($@"Unknown User Role ""{user.Role.Name}""");
        }

        IEnumerable<Claim> userRoleClaims = user.Role.Name is UserRoles.Administrator ? UserRoleClaims.Administrator : UserRoleClaims.User;

        IEnumerable<Claim> openIDClaims = new List<Claim>
        {
            new (JwtRegisteredClaimNames.Sub, account.Name, ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new (JwtRegisteredClaimNames.AuthTime, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new (JwtRegisteredClaimNames.Nonce, Guid.CreateVersion7().ToString(), ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString(), ClaimValueTypes.String),
            new (JwtRegisteredClaimNames.Email, user.EmailAddress, ClaimValueTypes.Email)
        };

        IEnumerable<Claim> customClaims = new List<Claim>
        {
            new (Claims.UserID, user.ID.ToString(), ClaimValueTypes.String),
            new (Claims.AccountID, account.ID.ToString(), ClaimValueTypes.String),
            new (Claims.AccountIsMain, account.IsMain.ToString(), ClaimValueTypes.Boolean),
            new (Claims.ClanName, account.Clan?.Name ?? string.Empty, ClaimValueTypes.String),
            new (Claims.ClanTag, account.Clan?.Tag ?? string.Empty, ClaimValueTypes.String)
        };

        IEnumerable<Claim> allTokenClaims = Enumerable.Empty<Claim>().Union(userRoleClaims).Union(openIDClaims).Union(customClaims).OrderBy(claim => claim.Type);

        JwtSecurityToken token = new
        (
            issuer: Configuration.JWT.Issuer,
            audience: Configuration.JWT.Audience,
            claims: allTokenClaims,
            expires: DateTimeOffset.UtcNow.AddHours(Configuration.JWT.DurationInHours).DateTime,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration.JWT.SigningKey)), SecurityAlgorithms.HmacSha256)
        );

        string jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new GetAuthenticationTokenDTO(user.ID, "JWT", jwt, user.IsVerified));
    }

    [HttpGet("Discord/{discordId}", Name = "Get User By Discord ID")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetDiscordUserDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserByDiscordID(string discordId)
    {
        User? user = await MerrickContext.Users
            .Include(record => record.Accounts).ThenInclude(record => record.Clan)
            .SingleOrDefaultAsync(record => record.DiscordID != null && record.DiscordID.Equals(discordId));

        if (user is null)
            return NotFound($@"User With Discord ID ""{discordId}"" Was Not Found");

        return Ok(new GetDiscordUserDTO(
            user.ID,
            user.DiscordID!,
            user.DiscordUsername ?? string.Empty,
            user.DiscordAvatarHash,
            user.EmailAddress,
            user.IsVerified,
            user.Accounts.Select(account => new GetBasicAccountDTO(account.ID, account.NameWithClanTag)).ToList()));
    }

    [HttpPost("RegisterDiscord", Name = "Register User Via Discord")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GetDiscordUserDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegisterDiscordUser([FromBody] RegisterDiscordUserDTO payload)
    {
        if (payload.Password.Equals(payload.ConfirmPassword).Equals(false))
            return BadRequest($@"Password ""{payload.ConfirmPassword}"" Does Not Match ""{payload.Password}"" (These Values Are Only Visible To You)");

        if (HostEnvironment.IsDevelopment() is false)
        {
            ValidationResult result = await new PasswordValidator().ValidateAsync(payload.Password);

            if (result.IsValid is false)
                return BadRequest(result.Errors.Select(error => error.ErrorMessage));
        }

        if (await MerrickContext.Users.AnyAsync(user => user.DiscordID != null && user.DiscordID.Equals(payload.DiscordID)))
        {
            return Conflict($@"User With Discord ID ""{payload.DiscordID}"" Already Exists");
        }

        if (await MerrickContext.Accounts.AnyAsync(account => account.Name.Equals(payload.AccountName)))
        {
            return Conflict($@"Account With Name ""{payload.AccountName}"" Already Exists");
        }

        Role? role = await MerrickContext.Roles.SingleOrDefaultAsync(role => role.Name.Equals(UserRoles.User));

        if (role is null)
        {
            return BadRequest($@"User Role ""{UserRoles.User}"" Was Not Found");
        }

        string salt = SRPRegistrationHandlers.GenerateSRPPasswordSalt();

        User user = new()
        {
            EmailAddress = payload.DiscordEmail,
            Role = role,
            DiscordID = payload.DiscordID,
            DiscordUsername = payload.DiscordUsername,
            DiscordAvatarHash = payload.DiscordAvatarHash,
            SRPPasswordSalt = salt,
            SRPPasswordHash = SRPRegistrationHandlers.ComputeSRPPasswordHash(payload.Password, salt)
        };

        user.PBKDF2PasswordHash = new PasswordHasher<User>().HashPassword(user, payload.Password);

        await MerrickContext.Users.AddAsync(user);

        Account account = new()
        {
            Name = payload.AccountName,
            User = user,
            IsMain = true
        };

        user.Accounts.Add(account);

        // Generate Verification Token
        Token verificationToken = new()
        {
            Purpose = TokenPurpose.DiscordVerification,
            EmailAddress = payload.DiscordEmail,
            Value = Guid.CreateVersion7(),
            Data = payload.DiscordID
        };

        await MerrickContext.Tokens.AddAsync(verificationToken);

        await MerrickContext.SaveChangesAsync();

        // Send Verification DM Via Discord Bot
        await DiscordBotService.SendVerificationDM(payload.DiscordID, payload.AccountName, verificationToken.Value.ToString());

        return CreatedAtAction(nameof(GetUser), new { id = user.ID },
            new GetDiscordUserDTO(
                user.ID,
                user.DiscordID!,
                user.DiscordUsername ?? string.Empty,
                user.DiscordAvatarHash,
                user.EmailAddress,
                user.IsVerified,
                [new GetBasicAccountDTO(account.ID, account.Name)]));
    }

    [HttpGet("CheckAccountName/{name}", Name = "Check Account Name Availability")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckAccountNameDTO), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckAccountName(string name)
    {
        bool exists = await MerrickContext.Accounts.AnyAsync(account => account.Name.Equals(name));

        return Ok(new CheckAccountNameDTO(!exists, name));
    }

    [HttpGet("VerifyDiscord/{tokenValue}", Name = "Verify Discord Account")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> VerifyDiscordAccount(string tokenValue)
    {
        if (!Guid.TryParse(tokenValue, out Guid parsedToken))
            return BadRequest("Invalid verification token format.");

        Token? token = await MerrickContext.Tokens.SingleOrDefaultAsync(
            t => t.Value == parsedToken && t.Purpose == TokenPurpose.DiscordVerification);

        if (token is null)
            return NotFound("Verification token was not found.");

        if (token.TimestampConsumed is not null)
            return Conflict("This verification token has already been used.");

        User? user = await MerrickContext.Users.SingleOrDefaultAsync(
            u => u.DiscordID != null && u.DiscordID.Equals(token.Data));

        if (user is null)
            return NotFound("User associated with this verification token was not found.");

        user.IsVerified = true;
        token.TimestampConsumed = DateTimeOffset.UtcNow;

        await MerrickContext.SaveChangesAsync();

        return Ok("Account verified successfully.");
    }

    [HttpPost("ResendVerification", Name = "Resend Discord Verification")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ResendVerification([FromBody] LogInDiscordDTO payload)
    {
        User? user = await MerrickContext.Users
            .Include(record => record.Accounts)
            .SingleOrDefaultAsync(record => record.DiscordID != null && record.DiscordID.Equals(payload.DiscordID));

        if (user is null)
            return NotFound($@"User with Discord ID ""{payload.DiscordID}"" was not found.");

        if (user.IsVerified)
            return Conflict("User is already verified.");

        Account? account = user.Accounts.FirstOrDefault(a => a.IsMain) ?? user.Accounts.FirstOrDefault();
        string accountName = account?.Name ?? "Player";

        // Generate New Verification Token
        Token verificationToken = new()
        {
            Purpose = TokenPurpose.DiscordVerification,
            EmailAddress = user.EmailAddress,
            Value = Guid.CreateVersion7(),
            Data = payload.DiscordID
        };

        await MerrickContext.Tokens.AddAsync(verificationToken);
        await MerrickContext.SaveChangesAsync();

        // Send Verification DM Via Discord Bot
        await DiscordBotService.SendVerificationDM(payload.DiscordID, accountName, verificationToken.Value.ToString());

        return Ok("Verification link has been resent to your Discord DM.");
    }
}
