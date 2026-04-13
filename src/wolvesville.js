// src/wolvesville.js
// Wrapper pour l'API Wolvesville

const axios = require('axios');

const BASE_URL = 'https://api.wolvesville.com';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bot ${process.env.WV_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Gestion globale des erreurs API ──────────────────────────────────────────
client.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const msg    = err.response?.data?.message || err.message;
    console.error(`[WV API] ${status} – ${msg}`);
    throw { status, message: msg };
  }
);

// ── Joueurs ──────────────────────────────────────────────────────────────────
async function getPlayerByUsername(username) {
  const res = await client.get(`/players/search`, { params: { username } });
  return res.data;
}

async function getPlayerById(playerId) {
  const res = await client.get(`/players/${playerId}`);
  return res.data;
}

async function getHighscores() {
  const res = await client.get('/players/highscores');
  return res.data;
}

// ── Clan ─────────────────────────────────────────────────────────────────────
async function getClanInfo(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/info`);
  return res.data;
}

async function getClanMembers(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/members`);
  return res.data;
}

async function getClanMembersDetailed(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/members/detailed`);
  return res.data;
}

async function getMemberDetailed(memberId, clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/members/${memberId}/detailed`);
  return res.data;
}

async function kickMember(memberId, reason = '', clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/members/${memberId}/kick`, { reason });
  return res.data;
}

async function blockMember(memberId, clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/members/${memberId}/block`);
  return res.data;
}

async function unblockMember(memberId, clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/members/${memberId}/unblock`);
  return res.data;
}

async function setMemberFlair(memberId, flair, clanId = process.env.WV_CLAN_ID) {
  const res = await client.put(`/clans/${clanId}/members/${memberId}/flair`, { flair });
  return res.data;
}

async function setMemberQuestParticipation(memberId, participate, clanId = process.env.WV_CLAN_ID) {
  const res = await client.put(`/clans/${clanId}/members/${memberId}/participateInQuests`, { participateInQuests: participate });
  return res.data;
}

async function setAllMembersQuestParticipation(participate, clanId = process.env.WV_CLAN_ID) {
  const res = await client.put(`/clans/${clanId}/members/all/participateInQuests`, { participateInQuests: participate });
  return res.data;
}

async function getBlocklist(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/blocklist`);
  return res.data;
}

// ── Chat clan ────────────────────────────────────────────────────────────────
async function getClanChat(oldest = null, clanId = process.env.WV_CLAN_ID) {
  const params = oldest ? { oldest } : {};
  const res = await client.get(`/clans/${clanId}/chat`, { params });
  return res.data;
}

async function sendClanChat(message, clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/chat`, { message });
  return res.data;
}

// ── Logs & Ledger ────────────────────────────────────────────────────────────
async function getClanLogs(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/logs`);
  return res.data;
}

async function getClanLedger(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/ledger`);
  return res.data;
}

// ── Quêtes ───────────────────────────────────────────────────────────────────
async function getAvailableQuests(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/quests/available`);
  return res.data;
}

async function getActiveQuest(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/quests/active`);
  return res.data;
}

async function getQuestHistory(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/quests/history`);
  return res.data;
}

async function claimQuest(questId, clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/quests/claim`, { questId });
  return res.data;
}

async function cancelActiveQuest(clanId = process.env.WV_CLAN_ID) {
  const res = await client.post(`/clans/${clanId}/quests/active/cancel`);
  return res.data;
}

async function getQuestVotes(clanId = process.env.WV_CLAN_ID) {
  const res = await client.get(`/clans/${clanId}/quests/votes`);
  return res.data;
}

// ── Recherche clan ───────────────────────────────────────────────────────────
async function searchClan(name) {
  const res = await client.get('/clans/search', { params: { name } });
  return res.data;
}

// ── Roles ────────────────────────────────────────────────────────────────────
async function getRoles(locale = 'fr') {
  const res = await client.get('/roles', { params: { locale } });
  return res.data;
}

module.exports = {
  getPlayerByUsername,
  getPlayerById,
  getHighscores,
  getClanInfo,
  getClanMembers,
  getClanMembersDetailed,
  getMemberDetailed,
  kickMember,
  blockMember,
  unblockMember,
  setMemberFlair,
  setMemberQuestParticipation,
  setAllMembersQuestParticipation,
  getBlocklist,
  getClanChat,
  sendClanChat,
  getClanLogs,
  getClanLedger,
  getAvailableQuests,
  getActiveQuest,
  getQuestHistory,
  claimQuest,
  cancelActiveQuest,
  getQuestVotes,
  searchClan,
  getRoles,
};
