import { addLocalGroup, getLocalGroups, deleteLocalGroup } from "./localStore";

/**
 * Create a new group locally (no Firestore).
 * Returns the created group object (with `id` and ISO `createdAt`).
 */
export async function createGroup({ name, ownerUid, members = [], description = "" }) {
  if (!name || !name.trim()) throw new Error("Group name is required");
  if (!ownerUid) throw new Error("Owner UID is required");

  const payload = {
    name: name.trim(),
    owner: ownerUid,
    members: Array.from(new Set([ownerUid, ...(members || [])])),
    description: description || "",
    settings: { currency: "USD" },
    createdAt: new Date(),
  };

  // persist locally and return the created group object
  const group = addLocalGroup(payload);
  return group;
}

export function listLocalGroups() {
  return getLocalGroups();
}

export function deleteGroup(id) {
  return deleteLocalGroup(id);
}
