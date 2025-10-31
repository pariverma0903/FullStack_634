// App.jsx
import React, { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const BASE_URL = "http://localhost:5000/api/login";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ ${data.message}`);
    } else {
      setMessage(`❌ ${data.message}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "5rem",
        fontFamily: "Arial",
      }}
    >
      <h1>🔐 React Login Form</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          gap: "1rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "#f9f9f9",
        }}
      >
        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        <button
          type="submit"
          style={{
            padding: "0.7rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "1rem",
            color: message.startsWith("✅") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
