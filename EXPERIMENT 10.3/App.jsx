// App.jsx
import React, { useState, useEffect } from "react";

export default function App() {
  const BASE_URL = "http://your-backend-ec2-dns-or-alb/api";

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

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

  const register = async (e) => {
    e.preventDefault();
    await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("Registered! Now login.");
  };

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      alert("Logged in!");
    } else {
      alert("Invalid credentials");
    }
  };

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

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setPosts([]);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🌐 Social Media App</h1>

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
          <h2>Welcome!</h2>
          <button onClick={logout}>Logout</button>

          <h3>Create a Post</h3>
          <form onSubmit={addPost}>
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>

          <h3>Recent Posts</h3>
          {posts.map((p) => (
            <div key={p._id} style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "1rem" }}>
              <b>{p.user?.username}</b>
              <p>{p.content}</p>
              <small>{new Date(p.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
