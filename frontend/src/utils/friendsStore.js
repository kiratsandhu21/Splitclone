// frontend/src/utils/friendsStore.js
// Friends storage management with local persistence

import * as XLSX from 'xlsx';

const FRIENDS_KEY = "splitclone:friends";

function safeParse(v) {
  try { return JSON.parse(v); } catch { return null; }
}

export function getLocalFriends(userId = null) {
  const raw = localStorage.getItem(FRIENDS_KEY);
  const all = safeParse(raw) || [];
  if (!userId) return all;
  return all.filter(f => f.ownerId === userId);
}

export function saveLocalFriends(friends) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export function addLocalFriend(userId, friendData) {
  if (!userId) throw new Error('userId is required');
  const friends = getLocalFriends();

  // Check if friend already exists
  const exists = friends.some(f =>
    f.ownerId === userId &&
    (f.uid === friendData.uid || f.email === friendData.email)
  );
  if (exists) throw new Error('Friend already added');

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const now = new Date().toISOString();
  const friend = {
    id,
    ownerId: userId,
    uid: friendData.uid || friendData.email,
    email: friendData.email || '',
    name: friendData.name || friendData.uid || friendData.email,
    createdAt: now
  };

  friends.push(friend);
  saveLocalFriends(friends);
  return friend;
}

export function deleteLocalFriend(userId, friendId) {
  const friends = getLocalFriends();
  const filtered = friends.filter(f => !(f.ownerId === userId && f.id === friendId));
  saveLocalFriends(filtered);
  return true;
}

export function updateLocalFriend(userId, friendId, patch) {
  const friends = getLocalFriends();
  const idx = friends.findIndex(f => f.ownerId === userId && f.id === friendId);
  if (idx === -1) return null;
  friends[idx] = { ...friends[idx], ...patch };
  saveLocalFriends(friends);
  return friends[idx];
}

export function getFriendById(userId, friendId) {
  return getLocalFriends(userId).find(f => f.id === friendId) || null;
}

// Export friends to Excel
export function exportFriendsToXlsx(userId) {
  const friends = getLocalFriends(userId);

  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(friends.map(f => ({
    'Name': f.name,
    'Email': f.email,
    'UID/ID': f.uid,
    'Added': new Date(f.createdAt).toLocaleDateString()
  })));
  XLSX.utils.book_append_sheet(wb, sheet, 'Friends');
  XLSX.writeFile(wb, `splitclone-friends-${Date.now()}.xlsx`);
}

// Import friends from Excel
export async function importFriendsFromFile(userId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        const friends = getLocalFriends();
        let added = 0;

        data.forEach(row => {
          const uid = row['UID/ID'] || row['uid'] || '';
          const email = row['Email'] || row['email'] || '';
          const name = row['Name'] || row['name'] || uid || email;

          if (!uid && !email) return;

          const exists = friends.some(f =>
            f.ownerId === userId && (f.uid === uid || f.email === email)
          );

          if (!exists) {
            const friend = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              ownerId: userId,
              uid,
              email,
              name,
              createdAt: new Date().toISOString()
            };
            friends.push(friend);
            added++;
          }
        });

        saveLocalFriends(friends);
        resolve({ imported: added, total: data.length });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}