import React from "react";
import { Link } from "react-router-dom";

export default function GroupCard({ group, onDelete }) {
  const memberCount = (group.members || []).length;

  const accentColors = [
    "#ff006e",  // Pink
    "#ffbe0b",  // Yellow
    "#06ffa5",  // Green
    "#8338ec",  // Purple
    "#3a86ff",  // Blue
    "#fb5607",  // Orange
  ];

  const colorIndex = group.id.charCodeAt(0) % accentColors.length;

  return (
    <div className="card card-hover animate-fade-in" style={{
      position: "relative",
      overflow: "visible"
    }}>
      {/* Vibrant accent bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "8px",
        background: accentColors[colorIndex],
        border: "2px solid #000000",
        borderBottom: "none"
      }}></div>

      <div className="flex items-center justify-between" style={{ marginTop: "8px" }}>
        <div className="flex items-center gap-md">
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "0px",
            background: accentColors[colorIndex],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "white",
            fontWeight: "900",
            border: "3px solid #000000",
            boxShadow: "4px 4px 0px 0px rgba(0, 0, 0, 1)"
          }}>
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold mb-sm" style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>
              {group.name}
            </h4>
            <div className="flex items-center gap-sm">
              <span className="text-sm text-secondary" style={{ fontWeight: "600" }}>
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
              Open
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
