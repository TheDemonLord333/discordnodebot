// Embed-Nachrichten Funktionalität
const { EmbedBuilder } = require('discord.js');

/**
 * Sendet eine Embed-Nachricht an einen Kanal oder DM
 * @param {Object} client - Discord.js Client
 * @param {string} channelId - ID des Zielkanals
 * @param {Object} embedData - Daten für die Embed-Nachricht
 * @returns {Promise<Message>} - Die gesendete Nachricht
 */
const sendEmbed = async (client, channelId, embedData) => {
  try {
    // Kanal abrufen
    const channel = await client.channels.fetch(channelId);
    
    if (!channel) {
      throw new Error(`Kanal mit ID ${channelId} wurde nicht gefunden`);
    }
    
    // Embed erstellen
    const embed = new EmbedBuilder();
    
    // Pflichtfelder setzen
    if (embedData.title) {
      embed.setTitle(embedData.title);
    }
    
    if (embedData.description) {
      embed.setDescription(embedData.description);
    }
    
    // Optionale Felder setzen
    if (embedData.color) {
      embed.setColor(embedData.color);
    }
    
    if (embedData.author) {
      embed.setAuthor({
        name: embedData.author.name,
        iconURL: embedData.author.iconURL || null,
        url: embedData.author.url || null
      });
    }
    
    if (embedData.thumbnail && embedData.thumbnail.url) {
      embed.setThumbnail(embedData.thumbnail.url);
    }
    
    if (embedData.image && embedData.image.url) {
      embed.setImage(embedData.image.url);
    }
    
    if (embedData.timestamp) {
      embed.setTimestamp(embedData.timestamp);
    }
    
    if (embedData.footer) {
      embed.setFooter({
        text: embedData.footer.text,
        iconURL: embedData.footer.iconURL || null
      });
    }
    
    // Felder hinzufügen, wenn vorhanden
    if (embedData.fields && Array.isArray(embedData.fields)) {
      embedData.fields.forEach(field => {
        if (field.name && field.value) {
          embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline || false
          });
        }
      });
    }
    
    // Embed senden
    return await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Fehler beim Senden des Embeds: ${error.message}`);
    throw error;
  }
};

/**
 * Erstellt einen einfachen Embed mit Standard-Farbe und aktueller Zeit
 * @param {string} title - Titel der Embed-Nachricht
 * @param {string} description - Beschreibung der Embed-Nachricht
 * @returns {Object} - Embed-Daten
 */
const createSimpleEmbed = (title, description) => {
  return {
    title,
    description,
    color: '#3498db',
    timestamp: new Date()
  };
};

module.exports = {
  sendEmbed,
  createSimpleEmbed
};
