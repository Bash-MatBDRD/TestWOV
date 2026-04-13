// src/commands.js
// Définition de toutes les commandes slash

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [

  // ── JOUEURS ───────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('player')
    .setDescription('Affiche le profil d\'un joueur Wolvesville')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du joueur').setRequired(true)),

  new SlashCommandBuilder()
    .setName('highscores')
    .setDescription('Affiche les meilleurs scores du moment')
    .addStringOption(o =>
      o.setName('type')
       .setDescription('Période')
       .setRequired(false)
       .addChoices(
         { name: 'Tous les temps', value: 'allTime' },
         { name: 'Ce mois-ci',     value: 'monthly'  },
         { name: 'Cette semaine',  value: 'weekly'   },
         { name: 'Aujourd\'hui',   value: 'daily'    },
       )
    ),

  // ── CLAN ─────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('clan-info')
    .setDescription('Affiche les infos du clan'),

  new SlashCommandBuilder()
    .setName('clan-membres')
    .setDescription('Liste les membres du clan'),

  new SlashCommandBuilder()
    .setName('clan-membre')
    .setDescription('Affiche les stats détaillées d\'un membre du clan')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du membre').setRequired(true)),

  // ── GESTION MEMBRES ───────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulse un membre du clan')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du membre').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison du kick').setRequired(false)),

  new SlashCommandBuilder()
    .setName('kick-ip')
    .setDescription('Expulse ET bloque un membre du clan (kick + ban)')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du membre').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(false)),

  new SlashCommandBuilder()
    .setName('block')
    .setDescription('Bloque un joueur (ajoute à la blacklist du clan)')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du joueur').setRequired(true)),

  new SlashCommandBuilder()
    .setName('unblock')
    .setDescription('Débloque un joueur de la blacklist du clan')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du joueur').setRequired(true)),

  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Affiche la blacklist du clan'),

  new SlashCommandBuilder()
    .setName('flair')
    .setDescription('Modifie le flair d\'un membre du clan')
    .addStringOption(o => o.setName('pseudo').setDescription('Pseudo du membre').setRequired(true))
    .addStringOption(o => o.setName('flair').setDescription('Nouveau flair (laisser vide pour supprimer)').setRequired(false)),

  // ── QUÊTES ────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('quest-active')
    .setDescription('Affiche la quête en cours du clan'),

  new SlashCommandBuilder()
    .setName('quest-dispo')
    .setDescription('Liste les quêtes disponibles à acheter'),

  new SlashCommandBuilder()
    .setName('quest-historique')
    .setDescription('Affiche l\'historique des quêtes du clan'),

  new SlashCommandBuilder()
    .setName('quest-claim')
    .setDescription('Démarre une quête pour le clan')
    .addStringOption(o => o.setName('id').setDescription('ID de la quête à démarrer').setRequired(true)),

  new SlashCommandBuilder()
    .setName('quest-annuler')
    .setDescription('Annule la quête active en cours'),

  // ── CHAT CLAN ─────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('chat-envoyer')
    .setDescription('Envoie un message dans le chat du clan')
    .addStringOption(o => o.setName('message').setDescription('Ton message').setRequired(true)),

  new SlashCommandBuilder()
    .setName('chat-voir')
    .setDescription('Affiche les derniers messages du chat du clan'),

  // ── LOGS ──────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Affiche les derniers logs du clan'),

].map(cmd => cmd.toJSON());
