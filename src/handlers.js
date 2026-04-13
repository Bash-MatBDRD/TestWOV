// src/handlers.js
// Logique de chaque commande slash

const wv = require('./wolvesville');
const {
  playerEmbed, clanInfoEmbed, membersEmbed,
  activeQuestEmbed, availableQuestsEmbed,
  successEmbed, errorEmbed,
} = require('./embeds');
const { EmbedBuilder } = require('discord.js');

// ── Helper : trouve un membre par pseudo ──────────────────────────────────────
async function resolveMember(pseudo) {
  // 1) Cherche le joueur global
  const player = await wv.getPlayerByUsername(pseudo);
  // 2) Vérifie qu'il est dans le clan
  const members = await wv.getClanMembers();
  const member  = members.find(m => m.playerId === player.id);
  if (!member) throw new Error(`**${pseudo}** n'est pas membre de ton clan.`);
  return { player, member };
}

// ── Vérification rôle admin Discord ──────────────────────────────────────────
function isAdmin(interaction) {
  const adminRoleId = process.env.ADMIN_ROLE_ID;
  if (!adminRoleId) return true; // si pas configuré, on laisse passer
  return interaction.member.roles.cache.has(adminRoleId);
}

// ════════════════════════════════════════════════════════════════════════════
// JOUEURS
// ════════════════════════════════════════════════════════════════════════════
async function handlePlayer(interaction) {
  await interaction.deferReply();
  const pseudo = interaction.options.getString('pseudo');
  try {
    const player = await wv.getPlayerByUsername(pseudo);
    await interaction.editReply({ embeds: [playerEmbed(player)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Joueur introuvable', `Aucun joueur trouvé avec le pseudo **${pseudo}**.`)] });
  }
}

async function handleHighscores(interaction) {
  await interaction.deferReply();
  const type = interaction.options.getString('type') ?? 'allTime';
  try {
    const data  = await wv.getHighscores();
    const list  = data[type] ?? [];
    const label = { allTime: 'Tous les temps', monthly: 'Ce mois-ci', weekly: 'Cette semaine', daily: "Aujourd'hui" }[type];
    const lines = list.slice(0, 10).map((p, i) => `**${i + 1}.** ${p.username} — ${p.xp.toLocaleString()} XP`);
    const embed = new EmbedBuilder()
      .setColor(0xF4900C)
      .setTitle(`🏆 Highscores — ${label}`)
      .setDescription(lines.join('\n') || '*Aucun résultat*')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer les highscores.')] });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CLAN
// ════════════════════════════════════════════════════════════════════════════
async function handleClanInfo(interaction) {
  await interaction.deferReply();
  try {
    const clan = await wv.getClanInfo();
    await interaction.editReply({ embeds: [clanInfoEmbed(clan)] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer les infos du clan.')] });
  }
}

async function handleClanMembres(interaction) {
  await interaction.deferReply();
  try {
    const [clan, members] = await Promise.all([wv.getClanInfo(), wv.getClanMembers()]);
    await interaction.editReply({ embeds: [membersEmbed(members, clan)] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer les membres.')] });
  }
}

async function handleClanMembre(interaction) {
  await interaction.deferReply();
  const pseudo = interaction.options.getString('pseudo');
  try {
    const player = await wv.getPlayerByUsername(pseudo);
    const member = await wv.getMemberDetailed(player.id);
    const embed  = new EmbedBuilder()
      .setColor(0xEB459E)
      .setTitle(`👤 ${member.username}`)
      .addFields(
        { name: '📊 Niveau',       value: `${member.level}`,                          inline: true },
        { name: '⭐ XP clan',      value: `${member.xp.toLocaleString()}`,            inline: true },
        { name: '🗺️ Quêtes or',   value: `${member.goldQuests}`,                     inline: true },
        { name: '📅 Rejoint le',   value: new Date(member.creationTime).toLocaleDateString('fr-FR'), inline: true },
        { name: '🟢 Vu dernièrement', value: member.lastOnline ? `<t:${Math.floor(new Date(member.lastOnline).getTime()/1000)}:R>` : 'Inconnu', inline: true },
        { name: '⚔️ Participe quêtes', value: member.participateInClanQuests ? 'Oui ✅' : 'Non ❌', inline: true },
        { name: '📆 XP semaine',   value: `${member.xpDurations?.week?.toLocaleString() ?? 0}`,  inline: true },
        { name: '📆 XP mois',      value: `${member.xpDurations?.month?.toLocaleString() ?? 0}`, inline: true },
        { name: '🎖️ Flair',        value: member.flair || '*Aucun*',                  inline: true },
      )
      .setFooter({ text: `ID : ${member.playerId}` })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Introuvable', `**${pseudo}** n'est pas dans le clan ou n'existe pas.`)] });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GESTION MEMBRES
// ════════════════════════════════════════════════════════════════════════════
async function handleKick(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const pseudo = interaction.options.getString('pseudo');
  const raison = interaction.options.getString('raison') ?? '';
  try {
    const { player } = await resolveMember(pseudo);
    await wv.kickMember(player.id, raison);
    await interaction.editReply({ embeds: [successEmbed('Membre expulsé', `**${pseudo}** a été expulsé du clan.\nRaison : ${raison || '*Aucune*'}`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible d\'expulser ce membre.')] });
  }
}

async function handleKickIp(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const pseudo = interaction.options.getString('pseudo');
  const raison = interaction.options.getString('raison') ?? '';
  try {
    const { player } = await resolveMember(pseudo);
    await wv.kickMember(player.id, raison);
    await wv.blockMember(player.id);
    await interaction.editReply({ embeds: [successEmbed('Membre expulsé & bloqué', `**${pseudo}** a été expulsé ET ajouté à la blacklist.\nRaison : ${raison || '*Aucune*'}`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible d\'exécuter cette action.')] });
  }
}

async function handleBlock(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const pseudo = interaction.options.getString('pseudo');
  try {
    const player = await wv.getPlayerByUsername(pseudo);
    await wv.blockMember(player.id);
    await interaction.editReply({ embeds: [successEmbed('Joueur bloqué', `**${pseudo}** a été ajouté à la blacklist du clan.`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible de bloquer ce joueur.')] });
  }
}

async function handleUnblock(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const pseudo = interaction.options.getString('pseudo');
  try {
    const player = await wv.getPlayerByUsername(pseudo);
    await wv.unblockMember(player.id);
    await interaction.editReply({ embeds: [successEmbed('Joueur débloqué', `**${pseudo}** a été retiré de la blacklist.`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible de débloquer ce joueur.')] });
  }
}

async function handleBlacklist(interaction) {
  await interaction.deferReply();
  try {
    const list  = await wv.getBlocklist();
    const lines = list.map(e => `▪️ **${e.playerUsername}** — bloqué le ${new Date(e.creationTime).toLocaleDateString('fr-FR')}`);
    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🚫 Blacklist du clan')
      .setDescription(lines.join('\n') || '*Aucun joueur bloqué*')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer la blacklist.')] });
  }
}

async function handleFlair(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const pseudo = interaction.options.getString('pseudo');
  const flair  = interaction.options.getString('flair') ?? '';
  try {
    const { player } = await resolveMember(pseudo);
    await wv.setMemberFlair(player.id, flair);
    await interaction.editReply({ embeds: [successEmbed('Flair modifié', `Le flair de **${pseudo}** est maintenant : ${flair || '*vide*'}`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible de modifier le flair.')] });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// QUÊTES
// ════════════════════════════════════════════════════════════════════════════
async function handleQuestActive(interaction) {
  await interaction.deferReply();
  try {
    const quest = await wv.getActiveQuest();
    await interaction.editReply({ embeds: [activeQuestEmbed(quest)] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer la quête active.')] });
  }
}

async function handleQuestDispo(interaction) {
  await interaction.deferReply();
  try {
    const quests = await wv.getAvailableQuests();
    await interaction.editReply({ embeds: [availableQuestsEmbed(quests)] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer les quêtes disponibles.')] });
  }
}

async function handleQuestHistorique(interaction) {
  await interaction.deferReply();
  try {
    const history = await wv.getQuestHistory();
    const last5   = history.slice(0, 5);
    const lines   = last5.map(q => {
      const tiers = q.tier;
      const xp    = q.xp.toLocaleString();
      const date  = new Date(q.tierStartTime).toLocaleDateString('fr-FR');
      return `▪️ Tier **${tiers}** — ${xp} XP — ${date}`;
    });
    const embed = new EmbedBuilder()
      .setColor(0xF4900C)
      .setTitle('📜 Historique des quêtes (5 dernières)')
      .setDescription(lines.join('\n') || '*Aucun historique*')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer l\'historique.')] });
  }
}

async function handleQuestClaim(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  const questId = interaction.options.getString('id');
  try {
    await wv.claimQuest(questId);
    await interaction.editReply({ embeds: [successEmbed('Quête démarrée !', `La quête \`${questId}\` a été lancée avec succès.`)] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible de démarrer cette quête.')] });
  }
}

async function handleQuestAnnuler(interaction) {
  await interaction.deferReply();
  if (!isAdmin(interaction)) return interaction.editReply({ embeds: [errorEmbed('Accès refusé', 'Tu n\'as pas la permission.')] });

  try {
    await wv.cancelActiveQuest();
    await interaction.editReply({ embeds: [successEmbed('Quête annulée', 'La quête active a été annulée. Un remboursement partiel a été effectué.')] });
  } catch (e) {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', e.message ?? 'Impossible d\'annuler la quête.')] });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CHAT CLAN
// ════════════════════════════════════════════════════════════════════════════
async function handleChatEnvoyer(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const message = interaction.options.getString('message');
  try {
    await wv.sendClanChat(message);
    await interaction.editReply({ embeds: [successEmbed('Message envoyé', `Ton message a été envoyé dans le chat du clan.`)] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible d\'envoyer le message.')] });
  }
}

async function handleChatVoir(interaction) {
  await interaction.deferReply();
  try {
    const msgs  = await wv.getClanChat();
    const last  = msgs.slice(-10).reverse();
    const lines = last.map(m => {
      const who  = m.isSystem ? '⚙️ Système' : `🐺 \`${m.playerId.substring(0,8)}…\``;
      const when = `<t:${Math.floor(new Date(m.date).getTime()/1000)}:t>`;
      return `${when} **${who}** : ${m.msg}`;
    });
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💬 Chat du clan (10 derniers)')
      .setDescription(lines.join('\n') || '*Aucun message*')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer le chat.')] });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LOGS
// ════════════════════════════════════════════════════════════════════════════
async function handleLogs(interaction) {
  await interaction.deferReply();
  try {
    const logs  = await wv.getClanLogs();
    const last  = logs.slice(0, 10);
    const ACTION_EMOJI = {
      PLAYER_JOINED:  '📥', PLAYER_LEFT: '📤', PLAYER_KICKED: '🥾',
      CO_LEADER_PROMOTED: '🥈', CO_LEADER_DEMOTED: '⬇️', LEADER_CHANGED: '👑',
      BLACKLIST_ADDED: '🚫', BLACKLIST_REMOVED: '✅',
      PLAYER_QUEST_PARTICIPATION_ENABLED: '⚔️', PLAYER_QUEST_PARTICIPATION_DISABLED: '💤',
    };
    const lines = last.map(log => {
      const emoji  = ACTION_EMOJI[log.action] ?? '▪️';
      const who    = log.playerUsername ?? log.playerBotOwnerUsername ?? '?';
      const target = log.targetPlayerUsername ? ` → **${log.targetPlayerUsername}**` : '';
      const when   = `<t:${Math.floor(new Date(log.creationTime).getTime()/1000)}:R>`;
      return `${emoji} ${when} **${who}**${target} — \`${log.action}\``;
    });
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Logs du clan (10 derniers)')
      .setDescription(lines.join('\n') || '*Aucun log*')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de récupérer les logs.')] });
  }
}

// ── Router central ────────────────────────────────────────────────────────────
const HANDLERS = {
  'player':           handlePlayer,
  'highscores':       handleHighscores,
  'clan-info':        handleClanInfo,
  'clan-membres':     handleClanMembres,
  'clan-membre':      handleClanMembre,
  'kick':             handleKick,
  'kick-ip':          handleKickIp,
  'block':            handleBlock,
  'unblock':          handleUnblock,
  'blacklist':        handleBlacklist,
  'flair':            handleFlair,
  'quest-active':     handleQuestActive,
  'quest-dispo':      handleQuestDispo,
  'quest-historique': handleQuestHistorique,
  'quest-claim':      handleQuestClaim,
  'quest-annuler':    handleQuestAnnuler,
  'chat-envoyer':     handleChatEnvoyer,
  'chat-voir':        handleChatVoir,
  'logs':             handleLogs,
};

async function dispatch(interaction) {
  const handler = HANDLERS[interaction.commandName];
  if (!handler) return;
  try {
    await handler(interaction);
  } catch (err) {
    console.error(`[Commande] Erreur sur /${interaction.commandName}:`, err);
    const errEmbed = errorEmbed('Erreur inattendue', 'Une erreur interne s\'est produite. Vérifie les logs du bot.');
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errEmbed] }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
    }
  }
}

module.exports = { dispatch };
