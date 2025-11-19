import React, { useEffect, useState } from "react";
import { createGroup as createGroupHelper, listLocalGroups, deleteGroup } from "../utils/groups";
import { exportAllToXlsx, exportAllToCSV } from "../utils/exporter";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import GroupCard from "../components/GroupCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return setGroups([]);
    // load local groups and keep in sync via storage events
    const load = () => {
      const all = listLocalGroups();
      const filtered = all.filter(g => (g.members || []).includes(user.uid));
      setGroups(filtered.reverse());
    };
    load();
    const onStorage = (e) => {
      if (!e.key || e.key === 'splitclone:groups') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  async function createGroup() {
    if (!name || !name.trim()) return alert("Give group a name");
    setCreating(true);
    try {
      const created = await createGroupHelper({ name, ownerUid: user.uid });
      setName("");
      // append to UI immediately
      setGroups(prev => [created, ...(prev || [])]);
    } catch (err) {
      console.error("create group failed", err);
      alert(err.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteGroup(id) {
    if (!confirm('Delete this group and its local data?')) return;
    deleteGroup(id);
    setGroups(prev => (prev || []).filter(g => g.id !== id));
  }

  return (
    <div className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-gradient font-bold text-2xl mb-sm">
            Your Groups
          </h1>
          <p className="text-secondary">
            Manage your expense-splitting groups
          </p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm" style={{
            background: "var(--bg-primary)",
            padding: "var(--spacing-sm) var(--spacing-md)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--success-gradient)"
            }}></div>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary btn-sm" onClick={() => exportAllToXlsx()}>
              Export XLSX
            </button>
            <button className="btn-secondary btn-sm" onClick={() => exportAllToCSV()}>
              Export CSV
            </button>
            <button 
              onClick={() => { logout(); nav("/"); }}
              className="btn-secondary btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Section */}
      <div className="card mb-xl">
        <h3 className="font-semibold mb-md">Create New Group</h3>
        <div className="flex gap-md">
          <input 
            value={name} 
            placeholder="Enter group name..." 
            onChange={e => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createGroup()}
          />
          <button 
            onClick={createGroup}
            className="btn-primary"
            disabled={!name.trim() || creating}
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div>
        <h3 className="font-semibold mb-lg">Your Groups ({groups.length})</h3>
        {groups.length === 0 ? (
          <div className="card text-center" style={{ padding: "var(--spacing-3xl)" }}>
            <div style={{ fontSize: "48px", marginBottom: "var(--spacing-lg)" }}>📊</div>
            <h4 className="font-semibold mb-md">No groups yet</h4>
            <p className="text-secondary mb-lg">
              Create your first group to start splitting expenses with friends
            </p>
            <button 
              onClick={() => document.querySelector('input[placeholder="Enter group name..."]')?.focus()}
              className="btn-primary"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-2">
            {groups.map(g => <GroupCard key={g.id} group={g} onDelete={handleDeleteGroup} />)}
          </div>
        )}
      </div>
    </div>
  );
}
