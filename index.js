// Hauptdatei für den Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const winston = require('winston');
const { setupCommands } = require('./commands');
const { sendEmbed } = require('./embed');
const config = require('./config');

// Logger konfigurieren
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'bot.log' })
  ]
});

// Discord Client initialisieren
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// API Server initialisieren
const app = express();
const PORT = process.env.API_PORT || 7523;

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// API Authentifizierung Middleware
const authenticateAPI = (req, res, next) => {
  const apiSecret = req.headers['x-api-secret'];
  
  if (!apiSecret || apiSecret !== process.env.API_SECRET) {
    logger.warn(`Unauthorized API access attempt from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// API Endpunkte
app.post('/api/send-embed', authenticateAPI, async (req, res) => {
  try {
    const { channelId, embedData } = req.body;
    
    if (!channelId || !embedData) {
      return res.status(400).json({ error: 'Fehlende Parameter' });
    }
    
    const result = await sendEmbed(client, channelId, embedData);
    logger.info(`Embed-Nachricht gesendet an Kanal: ${channelId}`);
    
    return res.status(200).json({ success: true, messageId: result.id });
  } catch (error) {
    logger.error(`Fehler beim Senden der Embed-Nachricht: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/servers', authenticateAPI, async (req, res) => {
  try {
    const guilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL()
    }));
    
    return res.status(200).json({ guilds });
  } catch (error) {
    logger.error(`Fehler beim Abrufen der Server: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/channels/:serverId', authenticateAPI, async (req, res) => {
  try {
    const { serverId } = req.params;
    const guild = client.guilds.cache.get(serverId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Server nicht gefunden' });
    }
    
    const channels = guild.channels.cache
      .filter(channel => channel.type === 0) // Nur Textkanäle
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        parentId: channel.parentId
      }));
    
    return res.status(200).json({ channels });
  } catch (error) {
    logger.error(`Fehler beim Abrufen der Kanäle: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

// Bot Events
client.once(Events.ClientReady, () => {
  logger.info(`Bot erfolgreich eingeloggt als ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  
  try {
    await setupCommands(interaction);
  } catch (error) {
    logger.error(`Fehler bei der Befehlsausführung: ${error.message}`);
    await interaction.reply({ 
      content: 'Bei der Ausführung des Befehls ist ein Fehler aufgetreten.', 
      ephemeral: true 
    });
  }
});

// Server und Bot starten
const startApp = async () => {
  try {
    // Discord Bot starten
    await client.login(process.env.BOT_TOKEN);
    
    // API Server starten
    app.listen(PORT, () => {
      logger.info(`API Server läuft auf Port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Fehler beim Starten der Anwendung: ${error.message}`);
    process.exit(1);
  }
};

startApp();
