import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ 
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--spacing-xl)"
    }}>
      <div className="card animate-fade-in" style={{ 
        maxWidth: 420, 
        width: "100%",
        textAlign: "center"
      }}>
        <div className="mb-xl">
          <h1 className="text-gradient font-bold text-2xl mb-md">
            {isLogin ? "Welcome Back!" : "Join SplitClone"}
          </h1>
          <p className="text-secondary">
            {isLogin ? "Sign in to manage your expense groups" : "Create your account to get started"}
          </p>
        </div>

        {err && (
          <div className="mb-lg" style={{
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            color: "#dc2626",
            padding: "var(--spacing-md)",
            borderRadius: "var(--radius-md)",
            border: "1px solid #fca5a5"
          }}>
            {err}
          </div>
        )}

        <form onSubmit={submit} className="flex-col gap-md">
          <div style={{marginBottom: "10px"}}>
            <input 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary btn-lg" style={{marginTop: "10px"}}>
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-xl">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="btn-secondary"
            style={{ width: "100%" }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-lg">
          <p className="text-sm text-muted">
            💡 Tip: Create multiple accounts to test multi-user behavior
          </p>
        </div>
      </div>
    </div>
  );
}
