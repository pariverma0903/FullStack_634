// App.jsx
import React, { useState, useEffect } from "react";

export default function App() {
  const BASE_URL = "http://localhost:5000";
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", author: "" });
  const [newComment, setNewComment] = useState({ text: "", post: "", author: "" });

  useEffect(() => {
    fetch(`${BASE_URL}/api/users`).then(res => res.json()).then(setUsers);
    fetch(`${BASE_URL}/api/posts`).then(res => res.json()).then(setPosts);
  }, []);

  async function addPost(e) {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    });
    const data = await res.json();
    setPosts([data, ...posts]);
    setNewPost({ title: "", content: "", author: "" });
  }

  async function addComment(e) {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment)
    });
    const data = await res.json();
    setComments([data, ...comments]);
    setNewComment({ text: "", post: "", author: "" });
  }

  async function loadComments(postId) {
    const res = await fetch(`${BASE_URL}/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(data);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>📝 Blog Platform</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Create New Post</h2>
        <form onSubmit={addPost}>
          <input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <select
            value={newPost.author}
            onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
          >
            <option value="">Select Author</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
          </select>
          <button type="submit">Add Post</button>
        </form>
      </section>

      <section>
        <h2>Posts</h2>
        {posts.map(post => (
          <div key={post._id} style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>By: {post.author?.username || "Unknown"}</small>
            <button onClick={() => loadComments(post._id)}>💬 View Comments</button>
          </div>
        ))}
      </section>

      <section>
        <h2>Add Comment</h2>
        <form onSubmit={addComment}>
          <input
            placeholder="Comment text"
            value={newComment.text}
            onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
          />
          <select
            value={newComment.author}
            onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
          >
            <option value="">Select Author</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
          </select>
          <select
            value={newComment.post}
            onChange={(e) => setNewComment({ ...newComment, post: e.target.value })}
          >
            <option value="">Select Post</option>
            {posts.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <button type="submit">Add Comment</button>
        </form>

        <h3>Comments</h3>
        {comments.map(c => (
          <div key={c._id} style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
            <p>{c.text}</p>
            <small>By {c.author?.username || "Unknown"}</small>
          </div>
        ))}
      </section>
    </div>
  );
}
