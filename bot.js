// Zusätzliche API-Routen für Ihren bestehenden Discord Bot
const express = require('express');
const { Client, EmbedBuilder } = require('discord.js');

// Express Server Setup (falls noch nicht vorhanden)
const app = express();
app.use(express.json());

// API Route für das Senden von Embeds
app.post('/api/send-embed', async (req, res) => {
    try {
        const { 
            channelId, 
            userId, 
            embed, 
            type // 'channel' oder 'dm'
        } = req.body;

        // Embed erstellen
        const embedMessage = new EmbedBuilder()
            .setTitle(embed.title)
            .setDescription(embed.description)
            .setColor(embed.color || 0x3498db);

        // Optionale Felder hinzufügen
        if (embed.thumbnail) embedMessage.setThumbnail(embed.thumbnail);
        if (embed.image) embedMessage.setImage(embed.image);
        if (embed.footer) embedMessage.setFooter({ text: embed.footer });
        if (embed.author) embedMessage.setAuthor({ name: embed.author });
        if (embed.url) embedMessage.setURL(embed.url);
        if (embed.timestamp) embedMessage.setTimestamp();

        // Fields hinzufügen falls vorhanden
        if (embed.fields && Array.isArray(embed.fields)) {
            embed.fields.forEach(field => {
                embedMessage.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline || false
                });
            });
        }

        let targetChannel;

        if (type === 'dm' && userId) {
            // DM senden
            const user = await client.users.fetch(userId);
            await user.send({ embeds: [embedMessage] });
            res.json({ success: true, message: 'Embed in DM gesendet' });
        } else if (type === 'channel' && channelId) {
            // Kanal-Nachricht senden
            targetChannel = await client.channels.fetch(channelId);
            if (!targetChannel) {
                return res.status(404).json({ error: 'Kanal nicht gefunden' });
            }
            await targetChannel.send({ embeds: [embedMessage] });
            res.json({ success: true, message: 'Embed in Kanal gesendet' });
        } else {
            res.status(400).json({ error: 'Ungültige Parameter' });
        }

    } catch (error) {
        console.error('Fehler beim Senden des Embeds:', error);
        res.status(500).json({ error: 'Embed konnte nicht gesendet werden' });
    }
});

// API Route um verfügbare Kanäle zu laden
app.get('/api/channels/:guildId', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(req.params.guildId);
        const channels = await guild.channels.fetch();
        
        const textChannels = channels
            .filter(channel => channel.type === 0) // Text channels
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                position: channel.position
            }))
            .sort((a, b) => a.position - b.position);

        res.json(textChannels);
    } catch (error) {
        res.status(500).json({ error: 'Kanäle konnten nicht geladen werden' });
    }
});

// API Route um verfügbare Server zu laden
app.get('/api/guilds', async (req, res) => {
    try {
        const guilds = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount
        }));
        res.json(guilds);
    } catch (error) {
        res.status(500).json({ error: 'Server konnten nicht geladen werden' });
    }
});

// API Route um Nutzer zu suchen
app.get('/api/users/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const users = [];
        
        // Durch alle Guilds iterieren und nach Nutzern suchen
        for (const guild of client.guilds.cache.values()) {
            const members = await guild.members.fetch({ query, limit: 10 });
            members.forEach(member => {
                if (!users.find(u => u.id === member.id)) {
                    users.push({
                        id: member.id,
                        username: member.user.username,
                        displayName: member.displayName,
                        avatar: member.user.displayAvatarURL()
                    });
                }
            });
        }
        
        res.json(users.slice(0, 20));
    } catch (error) {
        res.status(500).json({ error: 'Nutzer konnten nicht gesucht werden' });
    }
});

// Server starten
const PORT = process.env.PORT || 7523;
app.listen(PORT, () => {
    console.log(`API Server läuft auf Port ${PORT}`);
});

// Discord Bot Setup mit Token aus Umgebungsvariablen
require('dotenv').config(); // npm install dotenv

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Discord Client mit Token aus .env Datei
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// Bot einloggen
client.login(process.env.DISCORD_BOT_TOKEN);

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}!`);
    console.log(`🌐 Express API server starting on port ${PORT}...`);
});

// Event Handler für Fehler
client.on('error', console.error);
