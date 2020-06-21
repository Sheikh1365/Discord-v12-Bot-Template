var OFFICIAL_GUILD = 476268941723959298

async function GetPermissionLevel(bot, guild, ID)
{
    let role_permission   = -1;
    let server_permission = -1;

	let in_guild = bot.guilds.resolve(OFFICIAL_GUILD);
	if (in_guild)
	{
		in_guild.members.fetch(ID).then(member => 
		{
			if (!member) return;
			let role = member.roles.highest;

			if (role)
			{
				switch (role.id)
				{
					// 8 is highest permission level (All commands), 1 is normal member
					  // Highest Role
					case "432263079259275275":
						role_permission = 8;
					// Other roles here
					case "432572352098992150":
						role_permission = 4;
					default:
						break;
				}
			}
		});
    }
  
    await guild.members.fetch(ID).then(member => 
	{
		if (member.hasPermission("ADMINISTRATOR"))
		{
			server_permission = 8;
		}
		else if (member.hasPermission("MANAGE_GUILD"))
		{
			server_permission = 7;
		}
		else if (member.hasPermission("BAN_MEMBERS"))
		{
			server_permission = 6;
		}
		else if (member.hasPermission("KICK_MEMBERS"))
		{
			server_permission = 5;
		}
		else if (member.hasPermission("MANAGE_MESSAGES"))
		{
			server_permission = 4;
		}
		else if (member.hasPermission("MUTE_MEMBERS"))
		{
			server_permission = 3;
		}
		else if (member.hasPermission("USE_EXTERNAL_EMOJIS"))
		{
			server_permission = 2;
		}
		else if (member.hasPermission("SEND_MESSAGES"))
		{
			server_permission = 1;
		}
		else
		{
			server_permission = 0;
		}
	});    

    return Math.max(role_permission, server_permission);
}

module.exports = {
	GetPermissionLevel: GetPermissionLevel
}
