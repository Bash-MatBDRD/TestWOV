// src/embeds.js
// Helpers pour créer des embeds Discord jolis et cohérents

const { EmbedBuilder } = require('discord.js');

const COLOR = {
  INFO:    0x5865F2, // bleu Discord
  SUCCESS: 0x57F287, // vert
  WARN:    0xFEE75C, // jaune
  ERROR:   0xED4245, // rouge
  CLAN:    0xEB459E, // rose – couleur Wolvesville
  QUEST:   0xF4900C, // orange
};

// ── Joueur ───────────────────────────────────────────────────────────────────
function playerEmbed(player) {
  const totalGames = (player.gameStats?.totalWinCount ?? 0) + (player.gameStats?.totalLoseCount ?? 0);
  const winRate = totalGames > 0
    ? ((player.gameStats.totalWinCount / totalGames) * 100).toFixed(1)
    : '0.0';

  return new EmbedBuilder()
    .setColor(COLOR.INFO)
    .setTitle(`🐺 ${player.username}`)
    .setThumbnail(player.equippedAvatar?.url ?? null)
    .addFields(
      { name: '📊 Niveau',        value: `${player.level}`,          inline: true },
      { name: '🏆 Ranked skill',  value: `${player.rankedSeasonSkill === -1 ? 'Non classé' : player.rankedSeasonSkill}`, inline: true },
      { name: '🌹 Roses reçues',  value: `${player.receivedRosesCount ?? 0}`, inline: true },
      { name: '🎮 Parties totales', value: `${totalGames}`,          inline: true },
      { name: '✅ Winrate',       value: `${winRate}%`,               inline: true },
      { name: '⚔️ Victoires',     value: `${player.gameStats?.totalWinCount ?? 0}`, inline: true },
    )
    .setFooter({ text: `ID : ${player.id}` })
    .setTimestamp();
}

// ── Info clan ────────────────────────────────────────────────────────────────
function clanInfoEmbed(clan) {
  return new EmbedBuilder()
    .setColor(COLOR.CLAN)
    .setTitle(`🏰 Clan : ${clan.name}  [${clan.tag}]`)
    .setDescription(clan.description || '*Pas de description*')
    .addFields(
      { name: '👥 Membres',      value: `${clan.memberCount}`,            inline: true },
      { name: '⭐ XP',           value: `${clan.xp.toLocaleString()}`,    inline: true },
      { name: '🔒 Accès',        value: clan.joinType,                    inline: true },
      { name: '🌍 Langue',       value: clan.language,                    inline: true },
      { name: '📜 Quêtes faites',value: `${clan.questHistoryCount}`,      inline: true },
      { name: '📅 Créé le',      value: new Date(clan.creationTime).toLocaleDateString('fr-FR'), inline: true },
    )
    .setFooter({ text: `ID : ${clan.id}` })
    .setTimestamp();
}

// ── Liste membres ─────────────────────────────────────────────────────────────
function membersEmbed(members, clan) {
  const sorted = [...members].sort((a, b) => b.xp - a.xp);
  const lines = sorted.map((m, i) => {
    const rank   = i === 0 ? '👑' : m.isCoLeader ? '🥈' : '▪️';
    const online = isRecentlyOnline(m.lastOnline) ? '🟢' : '⚫';
    return `${rank} ${online} **${m.username}** — niv. ${m.level} | XP: ${m.xp.toLocaleString()}`;
  });

  return new EmbedBuilder()
    .setColor(COLOR.CLAN)
    .setTitle(`👥 Membres du clan ${clan.name} (${members.length})`)
    .setDescription(lines.join('\n') || '*Aucun membre*')
    .setTimestamp();
}

// ── Quête active ──────────────────────────────────────────────────────────────
function activeQuestEmbed(quest) {
  if (!quest?.quest) {
    return new EmbedBuilder()
      .setColor(COLOR.WARN)
      .setTitle('📭 Aucune quête active')
      .setDescription('Aucune quête en cours pour le moment.');
  }

  const progress = `${quest.xp.toLocaleString()} / ${quest.xpPerReward.toLocaleString()} XP`;
  const tier     = quest.tier;
  const ends     = quest.tierEndTime ? `<t:${Math.floor(new Date(quest.tierEndTime).getTime() / 1000)}:R>` : 'Inconnu';
  const participants = quest.participants.map(p => `▪️ **${p.username}** — ${p.xp.toLocaleString()} XP`).join('\n');

  return new EmbedBuilder()
    .setColor(COLOR.QUEST)
    .setTitle(`⚔️ Quête active — Tier ${tier}`)
    .setThumbnail(quest.quest.promoImageUrl ?? null)
    .addFields(
      { name: '📈 Progression', value: progress,       inline: true },
      { name: '⏰ Se termine',  value: ends,           inline: true },
      { name: '👥 Participants', value: participants || '*Aucun*' },
    )
    .setTimestamp();
}

// ── Quêtes disponibles ────────────────────────────────────────────────────────
function availableQuestsEmbed(quests) {
  const lines = quests.map((q, i) => {
    const gem = q.purchasableWithGems ? '💎' : '🪙';
    return `**${i + 1}.** ${gem} \`${q.id}\``;
  });

  return new EmbedBuilder()
    .setColor(COLOR.QUEST)
    .setTitle('🗺️ Quêtes disponibles')
    .setDescription(lines.join('\n') || '*Aucune quête disponible*')
    .setFooter({ text: 'Utilise /quest-claim <id> pour démarrer une quête' })
    .setTimestamp();
}

// ── Message chat clan ─────────────────────────────────────────────────────────
function chatMessageEmbed(msg) {
  return new EmbedBuilder()
    .setColor(COLOR.INFO)
    .setAuthor({ name: msg.isSystem ? '⚙️ Système' : `🐺 ${msg.playerId}` })
    .setDescription(msg.msg)
    .setTimestamp(new Date(msg.date));
}

// ── Succès / Erreur simples ───────────────────────────────────────────────────
function successEmbed(title, desc) {
  return new EmbedBuilder().setColor(COLOR.SUCCESS).setTitle(`✅ ${title}`).setDescription(desc).setTimestamp();
}

function errorEmbed(title, desc) {
  return new EmbedBuilder().setColor(COLOR.ERROR).setTitle(`❌ ${title}`).setDescription(desc).setTimestamp();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isRecentlyOnline(lastOnline, minutes = 30) {
  if (!lastOnline) return false;
  return (Date.now() - new Date(lastOnline).getTime()) < minutes * 60 * 1000;
}

module.exports = {
  playerEmbed,
  clanInfoEmbed,
  membersEmbed,
  activeQuestEmbed,
  availableQuestsEmbed,
  chatMessageEmbed,
  successEmbed,
  errorEmbed,
};
