// App.jsx
import React, { useState } from "react";

export default function App() {
  const BASE_URL = "http://localhost:5000/api";
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [profile, setProfile] = useState(null);
  const [secretMsg, setSecretMsg] = useState("");

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("Registered successfully! Please log in.");
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      alert("Login successful!");
    } else {
      alert(data.error || "Login failed");
    }
  };

  // Fetch Profile
  const fetchProfile = async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfile(data.user);
  };

  // Access Secret
  const fetchSecret = async () => {
    const res = await fetch(`${BASE_URL}/secret`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSecretMsg(data.message);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setProfile(null);
    setSecretMsg("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🔐 JWT Authentication Demo</h1>

      {!token ? (
        <>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit">Register</button>
          </form>

          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Email"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
        </>
      ) : (
        <>
          <h2>✅ Logged In</h2>
          <button onClick={logout}>Logout</button>
          <hr />
          <button onClick={fetchProfile}>View Profile</button>
          <button onClick={fetchSecret} style={{ marginLeft: "1rem" }}>
            Access Secret Route
          </button>

          {profile && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Profile Info:</h3>
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </div>
          )}

          {secretMsg && (
            <div style={{ marginTop: "1rem", color: "green" }}>
              <strong>{secretMsg}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}
