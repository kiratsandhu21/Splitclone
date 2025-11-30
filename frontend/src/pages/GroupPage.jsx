import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatBox from "../components/ChatBox";
import AddExpenseModal from "../components/AddExpenseModal";
import computeBalances from "../utils/computeBalances";
import { getLocalGroupById, getLocalExpenses, deleteLocalExpense, addMemberToGroup } from "../utils/localStore";
import { getLocalFriends } from "../utils/friendsStore";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    const load = () => {
      const g = getLocalGroupById(groupId);
      setGroup(g);
      setExpenses(getLocalExpenses(groupId));
    };
    load();
    const onStorage = (e) => { if (!e.key || e.key.startsWith('splitclone:')) load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [groupId]);

  useEffect(() => {
    if (user) {
      setFriends(getLocalFriends(user.uid));
    }
  }, [user]);

  const handleAddMember = (friend) => {
    if (!group || !friend) return;
    const updatedGroup = addMemberToGroup(groupId, friend.uid || friend.email);
    if (updatedGroup) {
      setGroup(updatedGroup);
      setShowAddMember(false);
    }
  };

  const balances = computeBalances(expenses);

  const availableFriends = friends.filter(f => {
    const memberId = f.uid || f.email;
    return !group?.members?.includes(memberId);
  });

  const getDisplayName = (uid) => {
    if (uid === user.uid) return "You";
    const friend = friends.find(f => f.uid === uid);
    if (friend) return friend.name;
    return uid.split('@')[0] || uid;
  };

  return (
    <div className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
      <div className="card mb-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-xl)",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              fontWeight: "bold"
            }}>
              {group?.name?.charAt(0).toUpperCase() || "G"}
            </div>
            <div>
              <h1 className="text-gradient font-bold text-2xl mb-sm" style={{ margin: 0 }}>
                {group?.name || "Group"}
              </h1>
              <p className="text-secondary">
                👥 {(group?.members || []).length} members • 💰 {expenses.length} expenses
              </p>
            </div>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-secondary"
            >
              Add Member
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 400px", gap: "var(--spacing-xl)" }}>
        <div className="card">
          <h3 className="font-semibold mb-lg flex items-center gap-sm">
            💬 Group Chat
          </h3>
          <ChatBox groupId={groupId} />
        </div>

        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="font-semibold mb-lg flex items-center gap-sm">
              💰 Balances
            </h3>
            {Object.entries(balances).length === 0 ? (
              <div className="text-center py-lg">
                <div style={{ fontSize: "32px", marginBottom: "var(--spacing-md)" }}>📊</div>
                <p className="text-secondary">No expenses yet</p>
              </div>
            ) : (
              <div className="flex-col gap-sm">
                {Object.entries(balances).map(([uid, amt]) => {
                  const displayName = getDisplayName(uid);
                  return (
                    <div key={uid} className="flex items-center justify-between" style={{
                      padding: "var(--spacing-md)",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)"
                    }}>
                      <div className="flex items-center gap-sm">
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: uid === user.uid ? "var(--primary-gradient)" : "var(--accent-gradient)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "white",
                          fontWeight: "bold"
                        }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">
                          {displayName}
                        </span>
                      </div>
                      <span className={`font-semibold ${Number(amt) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(amt) >= 0 ? '+' : ''}${Number(amt).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-lg flex items-center gap-sm">
              📋 Recent Expenses
            </h3>
            {expenses.length === 0 ? (
              <div className="text-center py-lg">
                <div style={{ fontSize: "32px", marginBottom: "var(--spacing-md)" }}>💸</div>
                <p className="text-secondary">No expenses yet</p>
              </div>
            ) : (
              <div className="flex-col gap-sm">
                {expenses.slice(0, 5).map(e => (
                  <div key={e.id} style={{
                    padding: "var(--spacing-md)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-primary)"
                  }}>
                    <div className="flex items-center justify-between mb-sm">
                      <span className="font-semibold">{e.description || "Expense"}</span>
                      <span className="font-bold text-lg">${Number(e.amount).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-secondary">
                      Paid by {getDisplayName(e.payerId)}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary btn-sm" onClick={() => {
                        if (confirm('Delete this expense?')) {
                          deleteLocalExpense(groupId, e.id);
                          setExpenses(getLocalExpenses(groupId));
                        }
                      }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {expenses.length > 5 && (
                  <p className="text-sm text-muted text-center mt-md">
                    +{expenses.length - 5} more expenses
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAdd && <AddExpenseModal groupId={groupId} onClose={() => setShowAdd(false)} user={user} />}

      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-lg">Add Member from Friends</h2>
            {availableFriends.length === 0 ? (
              <p className="text-secondary">No friends available to add.</p>
            ) : (
              <div className="flex-col gap-sm">
                {availableFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-sm border rounded hover:bg-tertiary cursor-pointer" onClick={() => handleAddMember(friend)}>
                    <div>
                      <div className="font-semibold">{friend.name}</div>
                      <div className="text-xs text-secondary">{friend.email}</div>
                    </div>
                    <button className="btn-primary btn-sm">Add</button>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-secondary mt-lg w-full" onClick={() => setShowAddMember(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}