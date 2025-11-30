import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import Friends from "./pages/Friends";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <nav style={{
        background: "#00800fff",
        padding: "var(--spacing-lg) var(--spacing-xl)",
        boxShadow: "0px 6px 0px 0px rgba(0, 0, 0, 1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "4px solid #000000"
      }}>
        <div className="flex justify-between">
          <div className="flex items-center gap-lg" >
            <h1 style={{
              margin: 0,
              color: "white",
              fontWeight: 900,
              fontSize: "24px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              textShadow: "3px 3px 0px rgba(0, 0, 0, 0.3)"
            }}>
              💰 SplitClone
            </h1>
          </div>
          <div className="flex items-center gap-md">
            <Link to="/" className="nav-link">
              🏠 Home
            </Link>

            <Link to="/dashboard" className="nav-link">
              📊 Dashboard
            </Link>

            <Link to="/friends" className="nav-link">
              👥 Friends
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ minHeight: "calc(100vh - 80px)" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}