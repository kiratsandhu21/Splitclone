import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatBox from "../components/ChatBox";
import AddExpenseModal from "../components/AddExpenseModal";
import computeBalances from "../utils/computeBalances";
import { getLocalGroupById, getLocalExpenses, deleteLocalExpense, addMemberToGroup, removeMemberFromGroup } from "../utils/localStore";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

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


  const balances = computeBalances(expenses);

  return (
    <div className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
      {/* Group Header */}
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
          <div className="flex items-center gap-lg">
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary"
          >
            Add Expense
          </button>
          <button 
            onClick={() => {
              const m = prompt('Enter new member UID (or email):');
              if (!m) return;
              const updated = addMemberToGroup(groupId, m);
              if (updated) setGroup(updated);
            }}
            className="btn-secondary"
          >
            Add Member
          </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 400px", gap: "var(--spacing-xl)" }}>
        {/* Chat Section */}
        <div className="card">
          <h3 className="font-semibold mb-lg flex items-center gap-sm">
            💬 Group Chat
          </h3>
          <ChatBox groupId={groupId} />
        </div>

        {/* Expenses Section */}
        <div className="flex-col gap-lg">
          {/* Balances Card */}
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
                {Object.entries(balances).map(([uid, amt]) => (
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
                        {uid === user.uid ? "You" : uid.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">
                        {uid === user.uid ? "You" : uid}
                      </span>
                    </div>
                    <span className={`font-semibold ${Number(amt) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(amt) >= 0 ? '+' : ''}${Number(amt).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses List */}
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
                      Paid by {e.payerId === user.uid ? "You" : e.payerId}
                    </div>
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button className="btn-secondary btn-sm" onClick={() => { if (confirm('Delete this expense?')) { deleteLocalExpense(groupId, e.id); setExpenses(getLocalExpenses(groupId)); } }}>
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
    </div>
  );
}
