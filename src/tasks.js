// src/tasks.js
// Tâches automatiques : relai chat clan ↔ Discord, alertes logs

const cron      = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const wv        = require('./wolvesville');

// Stocke le dernier message vu pour éviter les doublons
let lastChatDate = new Date().toISOString();
let lastLogDate  = new Date().toISOString();

const ACTION_EMOJI = {
  PLAYER_JOINED:  '📥', PLAYER_LEFT: '📤', PLAYER_KICKED: '🥾',
  CO_LEADER_PROMOTED: '🥈', CO_LEADER_DEMOTED: '⬇️', LEADER_CHANGED: '👑',
  BLACKLIST_ADDED: '🚫', BLACKLIST_REMOVED: '✅',
  PLAYER_QUEST_PARTICIPATION_ENABLED: '⚔️', PLAYER_QUEST_PARTICIPATION_DISABLED: '💤',
};

// ── Relai Chat Clan → Discord ─────────────────────────────────────────────────
async function pollClanChat(client) {
  const channelId = process.env.CLAN_CHAT_CHANNEL_ID;
  if (!channelId) return;

  try {
    const msgs = await wv.getClanChat();
    const newMsgs = msgs.filter(m => m.date > lastChatDate);
    if (!newMsgs.length) return;

    lastChatDate = newMsgs[newMsgs.length - 1].date;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    for (const msg of newMsgs) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: msg.isSystem ? '⚙️ Système Wolvesville' : `🐺 ${msg.playerId.substring(0, 12)}…` })
        .setDescription(msg.msg)
        .setTimestamp(new Date(msg.date));
      await channel.send({ embeds: [embed] });
    }
  } catch (e) {
    console.error('[Chat Poll]', e.message ?? e);
  }
}

// ── Relai Logs Clan → Discord ─────────────────────────────────────────────────
async function pollClanLogs(client) {
  const channelId = process.env.CLAN_LOGS_CHANNEL_ID;
  if (!channelId) return;

  try {
    const logs    = await wv.getClanLogs();
    const newLogs = logs.filter(l => l.creationTime > lastLogDate);
    if (!newLogs.length) return;

    lastLogDate = newLogs[0].creationTime; // logs triés du plus récent au plus vieux

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    for (const log of newLogs.reverse()) {
      const emoji  = ACTION_EMOJI[log.action] ?? '▪️';
      const who    = log.playerUsername ?? log.playerBotOwnerUsername ?? '?';
      const target = log.targetPlayerUsername ? ` → **${log.targetPlayerUsername}**` : '';
      const embed  = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setDescription(`${emoji} **${who}**${target}\n\`${log.action}\``)
        .setTimestamp(new Date(log.creationTime));
      await channel.send({ embeds: [embed] });
    }
  } catch (e) {
    console.error('[Logs Poll]', e.message ?? e);
  }
}

// ── Résumé quête active (toutes les heures) ────────────────────────────────────
async function questStatusUpdate(client) {
  const channelId = process.env.CLAN_QUESTS_CHANNEL_ID;
  if (!channelId) return;

  try {
    const quest = await wv.getActiveQuest();
    if (!quest?.quest) return; // pas de quête active

    const progress = `${quest.xp.toLocaleString()} / ${quest.xpPerReward.toLocaleString()} XP`;
    const pct      = Math.min(100, Math.round((quest.xp / quest.xpPerReward) * 100));
    const bar      = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
    const ends     = quest.tierEndTime
      ? `<t:${Math.floor(new Date(quest.tierEndTime).getTime() / 1000)}:R>`
      : 'Inconnu';

    const embed = new EmbedBuilder()
      .setColor(0xF4900C)
      .setTitle(`⚔️ Quête — Tier ${quest.tier} — ${pct}%`)
      .addFields(
        { name: '📈 Progression', value: `\`${bar}\` ${progress}`, inline: false },
        { name: '⏰ Se termine',  value: ends, inline: true },
      )
      .setTimestamp();

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('[Quest Status]', e.message ?? e);
  }
}

// ── Enregistrement des tâches ─────────────────────────────────────────────────
function registerTasks(client) {
  // Poll chat toutes les 30 secondes
  cron.schedule('*/30 * * * * *', () => pollClanChat(client));

  // Poll logs toutes les 60 secondes
  cron.schedule('*/60 * * * * *', () => pollClanLogs(client));

  // Résumé quête toutes les heures à l'heure pile
  cron.schedule('0 * * * *', () => questStatusUpdate(client));

  console.log('[Tasks] Tâches automatiques enregistrées ✅');
}

module.exports = { registerTasks };
