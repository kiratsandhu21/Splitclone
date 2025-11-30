import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getLocalFriends, addLocalFriend, deleteLocalFriend } from "../utils/friendsStore";

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
    const onStorage = (e) => {
      if (!e.key || e.key === 'splitclone:friends') loadFriends();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  function loadFriends() {
    if (!user) return;
    const allFriends = getLocalFriends(user.uid);
    setFriends(allFriends);
  }

  function handleAddFriend() {
    if (!name.trim() || !email.trim()) {
      alert("Please enter both name and email");
      return;
    }

    try {
      const friend = addLocalFriend(user.uid, {
        name: name.trim(),
        email: email.trim()
      });

      setFriends(prev => [...prev, friend]);
      setName("");
      setEmail("");
      setShowAdd(false);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleDeleteFriend(friendId) {
    if (!confirm('Delete this friend?')) return;
    deleteLocalFriend(user.uid, friendId);
    setFriends(prev => prev.filter(f => f.id !== friendId));
  }

  return (
    <div className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-gradient font-bold text-2xl mb-sm">
            Friends
          </h1>
          <p className="text-secondary">
            Manage your friends to add them to groups
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          + Add Friend
        </button>
      </div>

      {/* Friends List */}
      <div>
        <h3 className="font-semibold mb-lg">Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <div className="card text-center" style={{ padding: "var(--spacing-3xl)" }}>
            <div style={{ fontSize: "48px", marginBottom: "var(--spacing-lg)" }}>👥</div>
            <h4 className="font-semibold mb-md">No friends yet</h4>
            <p className="text-secondary mb-lg">
              Add friends to easily include them in your expense groups
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary"
            >
              Add Your First Friend
            </button>
          </div>
        ) : (
          <div className="grid grid-2">
            {friends.map(friend => (
              <div key={friend.id} className="card card-hover animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--accent-gradient)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      color: "white",
                      fontWeight: "bold"
                    }}>
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-sm" style={{ margin: 0 }}>
                        {friend.name}
                      </h4>
                      <div className="flex items-center gap-sm">
                        <span className="text-sm text-secondary">
                          {friend.email}
                        </span>
                      </div>
                      <div className="text-sm text-muted mt-sm">
                        ID: {friend.id}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleDeleteFriend(friend.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAdd && (
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
                Add Friend
              </h2>
              <button
                onClick={() => setShowAdd(false)}
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

            <form onSubmit={(e) => { e.preventDefault(); handleAddFriend(); }} className="flex-col gap-lg">
              <div>
                <label className="block text-sm font-medium mb-sm">Name</label>
                <input
                  placeholder="Enter friend's name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-sm">Email</label>
                <input
                  placeholder="Enter friend's email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              <div className="flex gap-md mt-lg">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
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
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}