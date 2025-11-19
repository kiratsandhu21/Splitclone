import React from "react";
import { Link } from "react-router-dom";

export default function GroupCard({ group, onDelete }) {
  const memberCount = (group.members || []).length;
  
  return (
    <div className="card card-hover animate-fade-in" style={{
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Gradient accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "var(--accent-gradient)"
      }}></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            background: "var(--primary-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "white",
            fontWeight: "bold"
          }}>
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold mb-sm" style={{ margin: 0 }}>
              {group.name}
            </h4>
            <div className="flex items-center gap-sm">
              <span className="text-sm text-secondary">
                👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
              {group.description && (
                <span className="text-sm text-muted">
                  • {group.description}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/groups/${group.id}`}>
            <button className="btn-primary btn-sm">
              Open Group
            </button>
          </Link>
          {onDelete && (
            <button className="btn-secondary btn-sm" onClick={() => onDelete(group.id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
