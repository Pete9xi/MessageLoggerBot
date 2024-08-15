const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { prefix, token, logsChannel } = require('./config.json');
const { MessageContent, GuildMessages, Guilds, MessageReactions } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildMessages, MessageContent, MessageReactions], partials: ['MESSAGE', 'REACTION', 'USER'] });

client.once('ready', () => {
    console.log('I am alive!');
});

// Function to check if a collection is empty
function isEmpty(collection) {
    return collection.size === 0;
}

// Messages log
client.on('messageCreate', message => {
    if (message.author.bot) return;

    let username = message.author.tag;
    let channel = message.channel.name;
    let serverAvatarURL = message.guild.iconURL();

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

// Message edit log
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return;

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

// Message delete log
client.on("messageDelete", async message => {
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

// Reaction add log
client.on('messageReactionAdd', async (reaction, user) => {
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
        .setColor('#FFB104')
        .setTitle("Reaction Added")
        .setDescription(`**Reaction:** ${reaction.emoji}\n**Message:** ${reaction.message.content}`)
        .setFooter({ text: "#" + reaction.message.channel.name })
        .setTimestamp();

    client.channels.cache.get(logsChannel).send({ embeds: [embed_reaction_add] });
});

// Reaction remove log
client.on('messageReactionRemove', async (reaction, user) => {
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

client.login(token);
