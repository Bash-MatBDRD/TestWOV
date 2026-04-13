// deploy-commands.js
// Lance ce script UNE SEULE FOIS pour enregistrer les commandes slash sur Discord.
// node deploy-commands.js

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const commands = require('./src/commands');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`📤 Enregistrement de ${commands.length} commandes slash...`);
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Commandes enregistrées avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de l\'enregistrement :', err);
  }
})();
