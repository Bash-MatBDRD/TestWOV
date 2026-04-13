# 🐺 Wolvesville Discord Bot

Bot Discord connecté à l'API publique Wolvesville pour gérer ton clan.

---

## ⚡ Installation rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18 ou supérieur
- Un bot Discord créé sur le [portail développeur](https://discord.com/developers/applications)
- Une clé API Wolvesville (Settings → Wolvesville public API dans l'app)

### 2. Installation
```bash
npm install
```

### 3. Configuration
Copie `.env.example` en `.env` et remplis toutes les valeurs :
```bash
cp .env.example .env
```

| Variable                | Description                                              |
|-------------------------|----------------------------------------------------------|
| `DISCORD_TOKEN`         | Token de ton bot Discord                                 |
| `DISCORD_CLIENT_ID`     | ID de l'application Discord                              |
| `WV_API_KEY`            | Clé API Wolvesville                                      |
| `WV_CLAN_ID`            | ID de ton clan Wolvesville                               |
| `CLAN_CHAT_CHANNEL_ID`  | Channel Discord pour le relai du chat clan               |
| `CLAN_LOGS_CHANNEL_ID`  | Channel Discord pour les logs du clan                    |
| `CLAN_QUESTS_CHANNEL_ID`| Channel Discord pour les mises à jour de quête           |
| `ADMIN_ROLE_ID`         | Rôle Discord autorisé pour les commandes de gestion      |

### 4. Enregistrement des commandes slash
```bash
node deploy-commands.js
```
> ⚠️ À exécuter **une seule fois** (ou après l'ajout de nouvelles commandes).

### 5. Démarrage
```bash
npm start
# ou en mode développement avec rechargement auto :
npm run dev
```

---

## 📋 Commandes disponibles

### 👤 Joueurs
| Commande | Description |
|---|---|
| `/player <pseudo>` | Profil complet d'un joueur |
| `/highscores [période]` | Top joueurs (allTime / monthly / weekly / daily) |

### 🏰 Clan
| Commande | Description |
|---|---|
| `/clan-info` | Infos générales du clan |
| `/clan-membres` | Liste de tous les membres |
| `/clan-membre <pseudo>` | Stats détaillées d'un membre |

### ⚔️ Gestion membres *(rôle admin requis)*
| Commande | Description |
|---|---|
| `/kick <pseudo> [raison]` | Expulse un membre |
| `/kick-ip <pseudo> [raison]` | Expulse + bloque (ban) un membre |
| `/block <pseudo>` | Ajoute à la blacklist |
| `/unblock <pseudo>` | Retire de la blacklist |
| `/blacklist` | Affiche la blacklist |
| `/flair <pseudo> [flair]` | Modifie le flair d'un membre |

### 🗺️ Quêtes
| Commande | Description |
|---|---|
| `/quest-active` | Quête en cours et progression |
| `/quest-dispo` | Quêtes disponibles à acheter |
| `/quest-historique` | 5 dernières quêtes terminées |
| `/quest-claim <id>` | Démarre une quête *(admin)* |
| `/quest-annuler` | Annule la quête active *(admin)* |

### 💬 Chat clan
| Commande | Description |
|---|---|
| `/chat-envoyer <message>` | Envoie un message dans le chat du clan |
| `/chat-voir` | Affiche les 10 derniers messages |

### 📋 Logs
| Commande | Description |
|---|---|
| `/logs` | 10 derniers événements du clan |

---

## 🔄 Automatisations

| Tâche | Fréquence | Channel |
|---|---|---|
| Relai chat clan → Discord | Toutes les 30s | `CLAN_CHAT_CHANNEL_ID` |
| Relai logs clan → Discord | Toutes les 60s | `CLAN_LOGS_CHANNEL_ID` |
| Résumé quête active | Toutes les heures | `CLAN_QUESTS_CHANNEL_ID` |
| Messages Discord → Chat clan | Temps réel | `CLAN_CHAT_CHANNEL_ID` |

---

## 🗂️ Structure du projet

```
wolvesville-bot/
├── index.js              # Point d'entrée
├── deploy-commands.js    # Script d'enregistrement des commandes
├── .env.example          # Template de configuration
├── package.json
└── src/
    ├── wolvesville.js    # Wrapper API Wolvesville
    ├── commands.js       # Définitions des commandes slash
    ├── handlers.js       # Logique de chaque commande
    ├── tasks.js          # Tâches automatiques (cron)
    └── embeds.js         # Helpers pour les embeds Discord
```

---

## 🔐 Permissions Discord requises

Dans le portail développeur Discord, active ces permissions pour ton bot :
- `bot` scope
- `applications.commands` scope
- Permissions : **Send Messages**, **Embed Links**, **Read Message History**

---

## ⚠️ Notes importantes

- Le bot Wolvesville doit être **ajouté à ton clan** pour accéder aux endpoints restreints (chat, logs, gestion membres).
- Seul le **leader** du clan peut ajouter un bot.
- Le relai Discord → Clan formate le message comme : `[Discord] Pseudo: message`
