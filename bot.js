var Discord       = require('discord.js');
var ChildProcess  = require("child_process");
var Bot           = new Discord.Client();
var Embed         = Discord.MessageEmbed;

var Permission  = require(__dirname + '/util/permissions.js');

// Sheikh's ID, Saad's ID
var Developers = [`552885697527283713`, `692505234571788359`];
var botProcessId = -1;
var RestartChannel = null;
var BotId = -1;

const prefix = ">"

var magic = 
{
    jpg: 'ffd8ff',
    png: '89504e',
    gif: '474946'
};

Bot.on("ready", async () =>
{
    console.log("_____________________");
    console.log("Connected to Discord!");
    console.log("---------------------");
    console.log('Bot is online - ' + Bot.user.tag);
    try
    {
        let link = Bot.generateInvite(["ADMINISTRATOR"]).then(console.log)
    }
    catch (e)
    {
        console.log(e);
    }
  
    Bot.user.setActivity("Testing the API", { type: 'CUSTOM_STATUS' });
	BotId = Bot.user.id
	
    if (RestartChannel) 
    {
        Bot.channels.fetch(RestartChannel).then(channel => channel.send("> :tools: Update complete"));
        process.send({channel: null});
    }
});

Bot.on("message", async message => 
{
    if (!message.content.startsWith(prefix) && message.content.indexOf(BotId) > 5 || !message.content.startsWith(prefix) && message.content.indexOf(BotId) <= -1) return;
    let command = message.content.indexOf(BotId) != -1 ? message.content.split(">")[1] : message.content.split(prefix)[1].split(" ")[0];
	
    if (!command) return;

    command = command.toLowerCase().trim().split(" ")[0];
    let args = [];
    if (message.content.split(command)[1]) 
    {
        let cbits = message.content.split(command);
        cbits.shift();
        args = cbits.join(command).trim().split(" ");
    }
	
    if (message.channel.type == "text" && commands[command])
    {
		let CommandObject = commands[command].alias ? commands[commands[command].alias] : commands[command]
		if (!CommandObject) return message.channel.send("Something went wrong internally! Contact my developer!");
		try
		{
			let data = {};
			
            data["permission"] = Developers.includes(message.author.id) ? 100 : await Permission.GetPermissionLevel(Bot, message.guild, message.author.id);

            if (!CommandObject.permission) CommandObject.permission = 1;
          
            if (data.permission >= CommandObject.permission)
            {
                let error = await CommandObject.run(message, args, data);
                if (error)
                {
                    let embed = new Embed()
                        .setColor(`#FF0000`)
                        .setDescription(error);

                    message.channel.send(embed);
                }
            }
            else
            {
                message.channel.send("Sorry, but you do not have enough permission to do that! (Type `" + prefix + "commands` to see what commands you can use!)");
            }
		}
		catch (e)
		{
			if (e.message.toLowerCase().includes("missing permissions"))
            {
                let embed = new Embed()
				embed.setTitle("__Not Enough Permission__")
				embed.setColor(`#FF22222`)
				embed.setDescription(`Sorry, but I do not have the permissions in this server to execute that command!`);

                message.channel.send(embed);
				
				console.log("Insufficient server permissions to execute \"" + command + "\" in " + message.guild.name + ".");
            }
			else
			{
				console.error(e);
			}
		}
	}
});

var commands = {
    ping:
    {
        name: "Ping",
        description: "A simple command to check the latency of the bot.",
        category: "General",
        arguments: [],
        permission: 1, // everyone
        usage: `${prefix}ping`,
        exampleusage: `${prefix}ping`,
        run: function(message, args, data)
        {
            message.delete();
            message.channel.send(`:ping_pong: Pong! \`${(new Date().getTime() - message.createdTimestamp)}ms\``);
        }
    },
    permission:
    {
        name: "Permission",
        description: "Sends the permission level of the user",
        category: "General",
        arguments: [],
        permission: 1, // everyone
        usage: `${prefix}permission`,
        exampleusage: `${prefix}permission`,
        run: function(message, args, data)
        {
            message.channel.send(`Permission level for <@${message.author.id}>: **${data.permission}**`);
        }
    },
    eval:
    {
        name: "Eval",
        description: "Runs the code specified. Should only be accessed by a developer.",
        category: "Development",
        arguments: ["-r code"],
        permission: 100, // developers
        usage: `${prefix}eval <code>`,
        exampleusage: `${prefix}eval message.reply(103 * 513);`,
        run: function(message, args, data)
        {
            let code = args.join(" ");
            try
            {
                console.log("Evaluating: " + code);
                eval(code);
            }
            catch (e)
            {
                let embed = new Embed();
                embed.setTitle("__Evaluation Error__");
                embed.setColor("#FF0000");
                embed.addField("Your Code", "```js\n" + code + "```");
                embed.addField("Error", e.message);
                embed.setFooter("Response to Evaluation Command by " + message.member.displayName);

                message.channel.send(embed);
            }
        }
    },
    restart:
    {
        name: "Restart",
        description: "Restarts the bot.",
        category: "General",
        arguments: [],
        permission: 100, // developer only
        usage: `${prefix}restart`,
        exampleusage: `${prefix}restart`,
        run: function(message, args, data)
        {
            message.channel.send("> :stopwatch: Update Queued!").then(msg =>
			{
				if (botProcessId == -1) return msg.channel.send("> :x: Bot process ID has not been set via node messaging. ");
				else
				{
					console.log("\n" + message.author.username + " authorised an update!");
					process.send({channel: message.channel.id});
					process.kill(botProcessId);
				}
			});
        }
    },
    slowmode:
    {
        name: "Slowmode",
        description: "Enables slowmode in the channel the command is called from",
        category: "General",
        arguments: [],
        permission: 4, // moderators
        usage: `${prefix}slowmode <seconds>`,
        exampleusage: `${prefix}slowmode 5`,
        run: function(message, args, data)
        {
			if (!args[0]) return "No amount of time specified for slowmode!";
			if (args[0] == "none" || args[0] == "off") args[0] = 0;
			
			try
			{
				message.channel.setRateLimitPerUser(parseInt(args[0]), "Changed via command");
			}
			catch (e)
			{
				return message.channel.send("You must specify the slowmode with a number, e.g. `" + prefix + "slowmode 10`!");
			}
        }
    },
	ban: {
		name: "Ban",
        description: "Bans the user specified",
        category: "General",
        arguments: ["-r user", "-o reason"],
        permission: 4, // moderators
        usage: `${prefix}ban <@user or user ID> <reason>`,
        exampleusage: `${prefix}ban @Jerome#2313 DM advertising OR ${prefix}ban 0129611422104123 DM avertising :rage:`,
        run: function(message, args, data)
        {
			if (!args[0]) return "You need to specify who to ban!";
			let member = message.mentions.members.first();
			if (!member)
			{
				member = args[0];
				if (isNaN(member)) return "You didn't mention a valid user, nor provide a valid ID.";
			}
			else member = member.id;
			
			let reason = args[1] || "Banned by " + message.author.username + "."
			
			message.guild.members.ban(member, {reason: reason}).then(user => 
			{
				message.channel.send(":white_check_mark: Banned **" + user.tag + "** with reason **" + reason + "**");
			});
        }
	},
	unban: {
		name: "Unan",
        description: "Unbans the user specified",
        category: "General",
        arguments: ["-r user", "-o reason"],
        permission: 4, // moderators
        usage: `${prefix}unban <@user or user ID> <reason>`,
        exampleusage: `${prefix}unban @Jerome#2313 Forgiven for DM advertising OR ${prefix}unban 0129611422104123 Forgiven for DM avertising :rage:`,
        run: function(message, args, data)
        {
			if (!args[0]) return "You need to specify who to unban!";
			let member = message.content.split("<@")[1];
			if (!member)
			{
				member = args[0];
				if (isNaN(member)) return "You didn't mention a valid user, nor provide a valid ID.";
			}
			else member = message.content.split("<@!")[1].split(">")[0];
			
			let reason = args[1] || "Unbanned by " + message.author.username + "."
			
			message.guild.members.unban(member, {reason: reason}).then(user => 
			{
				message.channel.send(":white_check_mark: Unbanned **" + user.tag + "** with reason **" + reason + "**");
			});
        }
	},
    ratelimit:
    {
      alias: "slowmode"
    },
    update:
    {
        alias: "restart"
    },
    execute:
    {
        alias: "eval"
    }
}

Bot.login(process.env.TOKEN);

process.on('message', (m) =>
{
    if (m.pID) botProcessId = m.pID;
    if (m.channel) RestartChannel = m.channel
});
