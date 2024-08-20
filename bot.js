const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");
const { token, logsChannel, excludedChannels } = require('./config');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.User] 
});

client.once('ready', () => {
    console.log('I am alive!');
});

function isEmpty(collection) {
    return collection.size === 0;
}

function shouldLogChannel(channelId) {
    return !excludedChannels.includes(channelId);
}

// Log messages
client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!shouldLogChannel(message.channel.id)) return;

    let username = message.author.tag;
    let channel = message.channel.name;

    let attachment = Array.from(message.attachments.values());
    let img = isEmpty(message.attachments) ? null : attachment[0].url;

    let embed_send = new EmbedBuilder()
        .setAuthor({ name: username, iconURL: message.author.avatarURL() })
        .setColor('23c115')
        .setTitle("Message sent!")
        .setDescription(message.content + (img ? " " + img : ""))
        .setFooter({ text: "#" + channel })
        .setTimestamp();

    if (img) {
        embed_send.setImage(img);
    }

    client.channels.cache.get(logsChannel).send({ embeds: [embed_send] });
});

// Log message edits
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return;
    if (!oldMessage.author || !newMessage.author) return;
    if (!shouldLogChannel(newMessage.channel.id)) return;

    let attachment = Array.from(oldMessage.attachments.values());
    let img = isEmpty(oldMessage.attachments) ? null : attachment[0].url;

    let embed_edit = new EmbedBuilder()
        .setAuthor({ name: oldMessage.author.tag, iconURL: oldMessage.author.avatarURL() })
        .setColor('2615c1')
        .setTitle("Message edited!")
        .addFields(
            { name: "Old", value: oldMessage.content + (img ? " " + img : ""), inline: true },
            { name: "New", value: newMessage.content + (img ? " " + img : ""), inline: true }
        )
        .setFooter({ text: "#" + oldMessage.channel.name })
        .setTimestamp();

    if (img) {
        embed_edit.setImage(img);
    }

    client.channels.cache.get(logsChannel).send({ embeds: [embed_edit] });
});

// Log message deletes
client.on("messageDelete", async message => {
    if (!shouldLogChannel(message.channel.id)) return;
    let attachment = Array.from(message.attachments.values());
    let img = isEmpty(message.attachments) ? null : attachment[0].url;

    let embed_delete = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
        .setColor('c11515')
        .setTitle("Message deleted!")
        .setDescription(message.content + (img ? " " + img : ""))
        .setFooter({ text: "#" + message.channel.name })
        .setTimestamp();

    if (img) {
        embed_delete.setImage(img);
    }

    client.channels.cache.get(logsChannel).send({ embeds: [embed_delete] });
});

// Log reaction additions
client.on('messageReactionAdd', async (reaction, user) => {
    if (!shouldLogChannel(reaction.message.channel.id)) return;
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    let embed_reaction_add = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setColor('23c115')
        .setTitle("Reaction Added")
        .setDescription(`**Reaction:** ${reaction.emoji}\n**Message:** ${reaction.message.content}`)
        .setFooter({ text: "#" + reaction.message.channel.name })
        .setTimestamp();

    client.channels.cache.get(logsChannel).send({ embeds: [embed_reaction_add] });
});

// Log reaction removals
client.on('messageReactionRemove', async (reaction, user) => {
    if (!shouldLogChannel(reaction.message.channel.id)) return;
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    let embed_reaction_remove = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setColor('c11515')
        .setTitle("Reaction Removed")
        .setDescription(`**Reaction:** ${reaction.emoji}\n**Message:** ${reaction.message.content}`)
        .setFooter({ text: "#" + reaction.message.channel.name })
        .setTimestamp();

    client.channels.cache.get(logsChannel).send({ embeds: [embed_reaction_remove] });
});

// Log when the bot is triggered
client.on('interactionCreate', async interaction => {
    if (!shouldLogChannel(interaction.channelId)) return;
    
    let user = interaction.user;
    let interactionType = interaction.type;
    let interactionName = interaction.commandName || interaction.customId || "Unknown Interaction";
    
    let embed_interaction = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setColor('ff9900')
        .setTitle("Bot Interaction Detected")
        .setDescription(`**Interaction:** ${interactionType}\n**Command/Action:** ${interactionName}`)
        .setFooter({ text: "#" + interaction.channel.name })
        .setTimestamp();

    client.channels.cache.get(logsChannel).send({ embeds: [embed_interaction] });
});

client.login(token);
