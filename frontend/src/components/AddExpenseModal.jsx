import React, { useState } from "react";
import { addLocalExpense } from "../utils/localStore";

export default function AddExpenseModal({ groupId, onClose, user }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [participantsText, setParticipantsText] = useState(""); // comma separated uids or emails; simple approach

  async function submit() {
    if (!amount || isNaN(amount)) return alert("Valid amount required");
    // For simplicity participants are comma-separated uids; in a real app you'd show checkboxes from group members
    const participants = participantsText.split(",").map(s => s.trim()).filter(Boolean);
    await addLocalExpense(groupId, {
      description: desc,
      amount: parseFloat(amount),
      payerId: user.uid,
      participants,
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
        maxWidth: "480px",
        margin: "var(--spacing-lg)"
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
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-sm">Participants</label>
            <input 
              placeholder="Enter user IDs separated by commas" 
              value={participantsText} 
              onChange={e => setParticipantsText(e.target.value)}
            />
            <p className="text-sm text-muted mt-sm">
              💡 Separate multiple user IDs with commas (e.g., user1, user2, user3)
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
