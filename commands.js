// Befehls-Handler für den Discord Bot
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { sendEmbed } = require('./embed');
const config = require('./config');

// Slash-Commands definieren
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Überprüft die Latenz des Bots'),
  
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Sendet eine Embed-Nachricht in den aktuellen Kanal')
    .addStringOption(option => 
      option.setName('titel')
        .setDescription('Der Titel der Embed-Nachricht')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('beschreibung')
        .setDescription('Die Beschreibung der Embed-Nachricht')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('farbe')
        .setDescription('Die Farbe des Embeds (HEX-Code oder vordefinierte Farbe)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('bild')
        .setDescription('URL zu einem Bild für den Embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('URL zu einem Thumbnail für den Embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer-Text für den Embed')
        .setRequired(false))
];

// Befehle registrieren
const registerCommands = async (client) => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    
    console.log('Slash-Commands werden registriert...');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    
    console.log('Slash-Commands erfolgreich registriert!');
  } catch (error) {
    console.error(`Fehler beim Registrieren der Commands: ${error}`);
  }
};

// Befehlsausführung
const setupCommands = async (interaction) => {
  const { commandName } = interaction;
  
  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const pingTime = sent.createdTimestamp - interaction.createdTimestamp;
    
    await interaction.editReply(
      `Pong! Latenz: ${pingTime}ms | API Latenz: ${Math.round(interaction.client.ws.ping)}ms`
    );
  }
  
  if (commandName === 'embed') {
    const titel = interaction.options.getString('titel');
    const beschreibung = interaction.options.getString('beschreibung');
    const farbe = interaction.options.getString('farbe') || '#3498db';
    const bild = interaction.options.getString('bild');
    const thumbnail = interaction.options.getString('thumbnail');
    const footer = interaction.options.getString('footer');
    
    const embedData = {
      title: titel,
      description: beschreibung,
      color: farbe,
      image: bild ? { url: bild } : null,
      thumbnail: thumbnail ? { url: thumbnail } : null,
      footer: footer ? { text: footer } : null,
      timestamp: new Date(),
    };
    
    await sendEmbed(interaction.client, interaction.channelId, embedData);
    await interaction.reply({ content: 'Embed-Nachricht wurde gesendet!', ephemeral: true });
  }
};

module.exports = {
  setupCommands,
  registerCommands
};
