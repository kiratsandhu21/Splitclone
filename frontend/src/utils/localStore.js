// Simple local storage helper for offline development
const GROUPS_KEY = "splitclone:groups";
const USER_KEY = "splitclone:user";
const EXPENSES_KEY = "splitclone:expenses";
const MESSAGES_KEY = "splitclone:messages";

function safeParse(v) {
  try { return JSON.parse(v); } catch { return null; }
}

export function getLocalGroups() {
  const raw = localStorage.getItem(GROUPS_KEY);
  return safeParse(raw) || [];
}

export function saveLocalGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function addLocalGroup(payload) {
  const groups = getLocalGroups();
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const now = new Date().toISOString();
  const g = { id, ...payload, createdAt: payload.createdAt instanceof Date ? payload.createdAt.toISOString() : payload.createdAt || now };
  groups.push(g);
  saveLocalGroups(groups);
  return g;
}

// Expenses management (stored flat with groupId)
export function getLocalExpenses(groupId = null) {
  const raw = localStorage.getItem(EXPENSES_KEY);
  const all = safeParse(raw) || [];
  if (!groupId) return all;
  return all.filter(e => e.groupId === groupId);
}

export function saveLocalExpenses(expenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function addLocalExpense(groupId, payload) {
  if (!groupId) throw new Error('groupId is required');
  const expenses = getLocalExpenses();
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const now = new Date().toISOString();
  const e = { id, groupId, ...payload, createdAt: payload.createdAt instanceof Date ? payload.createdAt.toISOString() : payload.createdAt || now };
  expenses.push(e);
  saveLocalExpenses(expenses);
  return e;
}

export function deleteLocalExpense(groupId, expenseId) {
  const expenses = getLocalExpenses();
  const filtered = expenses.filter(e => !(e.groupId === groupId && e.id === expenseId));
  saveLocalExpenses(filtered);
  return true;
}

// Simple chat messages stored per-group
export function getLocalMessages(groupId = null) {
  const raw = localStorage.getItem(MESSAGES_KEY);
  const all = safeParse(raw) || [];
  if (!groupId) return all;
  return all.filter(m => m.groupId === groupId);
}

export function saveLocalMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function addLocalMessage(groupId, payload) {
  if (!groupId) throw new Error('groupId is required');
  const messages = getLocalMessages();
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const now = new Date().toISOString();
  const m = { id, groupId, ...payload, createdAt: payload.createdAt instanceof Date ? payload.createdAt.toISOString() : payload.createdAt || now };
  messages.push(m);
  saveLocalMessages(messages);
  return m;
}

// Group/member management
export function updateLocalGroup(id, patch) {
  const groups = getLocalGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return null;
  groups[idx] = { ...groups[idx], ...patch };
  saveLocalGroups(groups);
  return groups[idx];
}

export function addMemberToGroup(groupId, memberUid) {
  const g = getLocalGroupById(groupId);
  if (!g) return null;
  const members = Array.from(new Set([...(g.members || []), memberUid]));
  return updateLocalGroup(groupId, { members });
}

export function removeMemberFromGroup(groupId, memberUid) {
  const g = getLocalGroupById(groupId);
  if (!g) return null;
  const members = (g.members || []).filter(m => m !== memberUid);
  return updateLocalGroup(groupId, { members });
}

export function deleteLocalGroup(groupId) {
  const groups = getLocalGroups().filter(g => g.id !== groupId);
  saveLocalGroups(groups);
  // delete related expenses
  const expenses = getLocalExpenses().filter(e => e.groupId !== groupId);
  saveLocalExpenses(expenses);
  return true;
}

export function getLocalGroupById(id) {
  return getLocalGroups().find(g => g.id === id) || null;
}


export function saveUserLocally(user) {
  // store only minimal info
  if (!user) return localStorage.removeItem(USER_KEY);
  const payload = { uid: user.uid, email: user.email, displayName: user.displayName || null };
  localStorage.setItem(USER_KEY, JSON.stringify(payload));
}

export function getLocalUser() {
  return safeParse(localStorage.getItem(USER_KEY));
}

export function clearLocalUser() {
  localStorage.removeItem(USER_KEY);
}
