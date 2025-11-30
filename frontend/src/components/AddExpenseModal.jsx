import React, { useState, useEffect } from "react";
import { addLocalExpense, getLocalGroupById, getLocalFriends } from "../utils/localStore";

export default function AddExpenseModal({ groupId, onClose, user }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal"); // equal, custom

  useEffect(() => {
    const group = getLocalGroupById(groupId);
    const friends = getLocalFriends();
    
    if (group) {
      const members = (group.members || []).map(memberId => {
        // Check if it's the current user
        if (memberId === user.uid) {
          return { id: memberId, name: "You", email: user.email };
        }
        // Check if it's a friend
        const friend = friends.find(f => f.id === memberId);
        if (friend) {
          return { id: friend.id, name: friend.name, email: friend.email };
        }
        // Fallback
        return { id: memberId, name: memberId, email: "" };
      });
      setAvailableMembers(members);
      // Auto-select all members
      setSelectedParticipants(members.map(m => m.id));
    }
  }, [groupId, user]);

  function toggleParticipant(memberId) {
    setSelectedParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  }

  async function submit() {
    if (!desc.trim()) return alert("Description is required");
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert("Valid amount required");
    if (selectedParticipants.length === 0) return alert("Select at least one participant");

    await addLocalExpense(groupId, {
      description: desc.trim(),
      amount: parseFloat(amount),
      payerId: user.uid,
      participants: selectedParticipants,
      category,
      splitType,
    });
    onClose();
  }

  return (
    <div style={{
      position: "fixed", 
      left: 0, 
      top: 0, 
      right: 0, 
      bottom: 0,
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ 
        width: "100%", 
        maxWidth: "560px",
        margin: "var(--spacing-lg)",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div className="flex items-center justify-between mb-lg">
          <h2 className="text-gradient font-bold text-xl" style={{ margin: 0 }}>
            Add Expense
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "var(--spacing-sm)"
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex-col gap-lg">
          <div>
            <label className="block text-sm font-medium mb-sm">Description</label>
            <input 
              placeholder="What was this expense for?" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-sm">Amount</label>
            <input 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              type="number"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-sm">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              style={{
                padding: "var(--spacing-md) var(--spacing-lg)",
                border: "2px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                width: "100%",
                background: "var(--bg-primary)"
              }}
            >
              <option value="General">General</option>
              <option value="Food">Food & Dining</option>
              <option value="Transport">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-sm">
              Paid by: <strong>You</strong>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-md">
              Split with ({selectedParticipants.length} selected)
            </label>
            <div className="flex-col gap-sm" style={{
              maxHeight: "200px",
              overflowY: "auto",
              padding: "var(--spacing-md)",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)"
            }}>
              {availableMembers.map(member => (
                <label 
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-md)",
                    padding: "var(--spacing-sm)",
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                    background: selectedParticipants.includes(member.id) ? "var(--bg-primary)" : "transparent"
                  }}
                >
                  <input 
                    type="checkbox"
                    checked={selectedParticipants.includes(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                    style={{ cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="font-medium">{member.name}</div>
                    {member.email && (
                      <div className="text-sm text-muted">{member.email}</div>
                    )}
                  </div>
                  {selectedParticipants.includes(member.id) && (
                    <div className="text-sm text-muted">
                      ${(parseFloat(amount || 0) / selectedParticipants.length).toFixed(2)}
                    </div>
                  )}
                </label>
              ))}
            </div>
            <p className="text-sm text-muted mt-sm">
              💡 Each person will be charged ${selectedParticipants.length > 0 ? (parseFloat(amount || 0) / selectedParticipants.length).toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="flex gap-md mt-lg">
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}