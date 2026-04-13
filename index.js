// index.js
// Point d'entrée principal du bot Discord ↔ Wolvesville

require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');
const { dispatch }       = require('./src/handlers');
const { registerTasks }  = require('./src/tasks');

// ── Vérification de la config ─────────────────────────────────────────────────
const REQUIRED = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'WV_API_KEY', 'WV_CLAN_ID'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
  console.error('   → Copie .env.example en .env et complète-le.');
  process.exit(1);
}

// ── Création du client Discord ────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Événements ────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  console.log(`🏰 Clan Wolvesville : ${process.env.WV_CLAN_ID}`);
  registerTasks(client);
});

// Relai Discord → Chat clan :
// Si quelqu'un écrit dans le channel CLAN_CHAT_CHANNEL_ID, on envoie dans le chat du clan
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (msg.channelId !== process.env.CLAN_CHAT_CHANNEL_ID) return;

  const { sendClanChat } = require('./src/wolvesville');
  const text = `[Discord] ${msg.author.displayName}: ${msg.content}`.substring(0, 200);
  try {
    await sendClanChat(text);
  } catch (e) {
    console.error('[Discord→Clan]', e.message ?? e);
  }
});

// Commandes slash
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await dispatch(interaction);
});

// ── Gestion des erreurs non captées ───────────────────────────────────────────
process.on('unhandledRejection', err => {
  console.error('[unhandledRejection]', err);
});

// ── Connexion ─────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
