"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function AuthPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
            if (mode === "signup") {
          const cleanEmail = email.trim();
          const cleanPassword = password.trim();

          if (!cleanEmail || !cleanPassword) {
            setMessage("Enter both email and password.");
            setLoading(false);
            return;
          }

          const redirectBase = window.location.origin;

          const { error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
            emailRedirectTo: "https://myhvacrtool.com/auth/",
            },
          });

          if (error) {
            setMessage(error.message);
          } else {
            setMessage("Sign-up submitted. Check your email if confirmation is enabled.");
          }

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Sign-up submitted. Check your email if confirmation is enabled.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
       if (error) {
  setMessage(error.message);
} else {
  alert("LOGIN SUCCESS");
  window.location.href = "/";
}
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Skilled Trades AI Login</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => setMode("login")}
          style={{ padding: "10px 14px", fontWeight: 900 }}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          style={{ padding: "10px 14px", fontWeight: 900 }}
        >
          Sign Up
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <div>
          <label style={{ fontWeight: 900 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 900 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: "10px 14px", fontWeight: 900 }}
        >
          {loading ? "Working..." : mode === "signup" ? "Create account" : "Login"}
        </button>

        <button
          onClick={handleSignOut}
          style={{ padding: "10px 14px", fontWeight: 900 }}
        >
          Sign out
        </button>

        {message ? <div>{message}</div> : null}
      </div>
    </div>
  );
}