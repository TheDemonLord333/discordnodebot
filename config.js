// Konfigurationsdatei für den Discord Bot
module.exports = {
  // Standard-Embed-Einstellungen
  defaultEmbed: {
    color: '#3498db', // Discord Blau
    footer: {
      text: 'Powered by Discord Embed Bot'
    }
  },
  
  // Verfügbare Farben für Embeds
  colors: {
    blurple: '#5865F2', // Discord Blurple
    green: '#57F287',   // Discord Grün
    yellow: '#FEE75C',  // Discord Gelb
    red: '#ED4245',     // Discord Rot
    grey: '#95A5A6',    // Grau
    black: '#000000',   // Schwarz
    white: '#FFFFFF'    // Weiß
  },
  
  // API-Einstellungen
  api: {
    rateLimitPerMinute: 60, // Maximale Anzahl von Anfragen pro Minute
    maxPayloadSize: '1mb'   // Maximale Größe der Anfragen
  },
  
  // Bot-Einstellungen
  bot: {
    presence: {
      status: 'online',
      activities: [
        {
          type: 0, // Playing
          name: 'Embed Messages'
        }
      ]
    }
  }
};
