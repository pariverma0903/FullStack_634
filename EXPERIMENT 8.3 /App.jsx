// App.jsx
import React, { useState, useEffect } from "react";

export default function App() {
  const BASE_URL = "http://localhost:5000/api";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Fetch posts
  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setPosts)
        .catch(console.error);
    }
  }, [token]);

  // Fetch users if admin
  useEffect(() => {
    if (token && role === "admin") {
      fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUsers)
        .catch(console.error);
    }
  }, [token, role]);

  // Register
  const register = async (e) => {
    e.preventDefault();
    await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("Registered successfully. Please login.");
  };

  // Login
  const login = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setToken(data.token);
      setRole(data.role);
      alert(`Logged in as ${data.role}`);
    } else alert(data.error);
  };

  // Create post
  const addPost = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setContent("");
  };

  // Delete post (Admin)
  const deletePost = async (id) => {
    await fetch(`${BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(posts.filter((p) => p._id !== id));
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    setToken("");
    setRole("");
    setPosts([]);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🔐 RBAC Social App</h1>

      {!token ? (
        <>
          <h2>Register</h2>
          <form onSubmit={register}>
            <input
              placeholder="Username"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Register</button>
          </form>

          <h2>Login</h2>
          <form onSubmit={login}>
            <input
              placeholder="Username"
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
        </>
      ) : (
        <>
          <h2>Welcome, {role.toUpperCase()}</h2>
          <button onClick={logout}>Logout</button>

          <h3>Create a Post</h3>
          <form onSubmit={addPost}>
            <textarea
              placeholder="Share something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>

          <h3>Posts Feed</h3>
          {posts.map((p) => (
            <div key={p._id} style={{ border: "1px solid #ddd", margin: "1rem 0", padding: "1rem" }}>
              <b>{p.user?.username}</b> ({p.user?.role})
              <p>{p.content}</p>
              {role === "admin" && <button onClick={() => deletePost(p._id)}>🗑 Delete</button>}
            </div>
          ))}

          {role === "admin" && (
            <>
              <h3>👥 All Users (Admin Panel)</h3>
              <ul>
                {users.map((u) => (
                  <li key={u._id}>
                    {u.username} ({u.role})
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
