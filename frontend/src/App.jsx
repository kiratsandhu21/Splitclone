import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="app">
      <nav className="gradient-bg" style={{ 
        padding: "var(--spacing-md) var(--spacing-xl)",
        boxShadow: "var(--shadow-lg)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div className="flex justify-between">
            <div className="flex items-center gap-lg" >
              <h1 className="text-white font-bold text-xl" style={{ margin: 0, color: "white" }}>
                💰 SplitClone
              </h1>
            </div>
            <div className="flex items-center gap-md">
             
              <Link 
                to="/" 
                className='text-white hover:text-gray-200 transition-colors font-medium text-lg'
              >
                Home
              </Link>
              
              <Link 
                to="/dashboard" 
                className="text-white hover:text-gray-200 transition-colors font-medium text-lg"
              >
                Dashboard
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
