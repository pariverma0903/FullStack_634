// App.jsx
// Minimal React single-file UI to demonstrate: register/login, list posts, create post, comment, view profile.
// NOTE: This is intentionally compact for demonstration. Integrate into a proper React app (CRA, Vite) for production.
//
// Usage: Place in a React project as src/App.jsx and run dev server. Ensure backend is at BASE_URL below.

import React, { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:5000';

function authToken() {
  return localStorage.getItem('bp_token');
}
function authHeaders() {
  const token = authToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function useAuth() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bp_user');
    return raw ? JSON.parse(raw) : null;
  });

  function saveAuth(u, token) {
    localStorage.setItem('bp_user', JSON.stringify(u));
    localStorage.setItem('bp_token', token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('bp_user');
    localStorage.removeItem('bp_token');
    setUser(null);
  }

  return { user, saveAuth, logout };
}

function LoginRegister({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // for register
  const [email, setEmail] = useState(''); // for register
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    try {
      if (mode === 'login') {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        onAuth(data.user, data.token);
      } else {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Register failed');
        onAuth(data.user, data.token);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Error');
    }
  }

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setMode('login')} disabled={mode === 'login'}>Login</button>
        <button onClick={() => setMode('register')} disabled={mode === 'register'}>Register</button>
      </div>

      <form onSubmit={submit} style={{ marginTop: 12 }}>
        {mode === 'login' ? (
          <>
            <input placeholder="Username or Email" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          </>
        ) : (
          <>
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          </>
        )}
        <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
      {message && <div style={{ color: 'red', marginTop: 8 }}>{message}</div>}
    </div>
  );
}

function PostCard({ post, currentUser, onCommentAdded, onDelete, onRefresh }) {
  const [commentText, setCommentText] = useState('');

  async function addComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text: commentText.trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Comment failed');
      }
      const newComment = await res.json();
      setCommentText('');
      onCommentAdded(post._id, newComment);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error adding comment');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete post?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }
      onDelete(post._id);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error deleting post');
    }
  }

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>{post.title}</strong>
          <div style={{ fontSize: 12, color: '#555' }}>by {post.author?.username || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {currentUser && currentUser.id === post.author?._id && (
          <div>
            <button onClick={handleDelete} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Delete</button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 8 }}>{post.body}</p>
      {post.tags && post.tags.length > 0 && <div style={{ fontSize: 12, color: '#777' }}>Tags: {post.tags.join(', ')}</div>}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 'bold' }}>Comments</div>
        {post.comments && post.comments.length === 0 && <div style={{ color: '#777' }}>No comments yet</div>}
        <ul style={{ paddingLeft: 18 }}>
          {post.comments && post.comments.map(c => (
            <li key={c._id} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{c.author?.username || 'Anon'}</span>: {c.text} <span style={{ fontSize: 11, color: '#888' }}>• {new Date(c.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>

        {currentUser ? (
          <form onSubmit={addComment} style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." style={{ flex: 1, padding: 8 }} />
            <button type="submit">Comment</button>
          </form>
        ) : (
          <div style={{ color: '#777', marginTop: 8 }}>Log in to comment</div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const auth = useAuth();
  const { user, saveAuth, logout } = auth;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [profileView, setProfileView] = useState(null); // user id to view
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(u, token) {
    saveAuth(u, token);
    // update UI
  }

  async function createPost(e) {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return alert('Title and body required');
    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title: newPostTitle.trim(), body: newPostBody.trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Create failed');
      }
      const p = await res.json();
      setPosts(prev => [p, ...prev]);
      setNewPostTitle('');
      setNewPostBody('');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error creating post');
    }
  }

  function handleCommentAdded(postId, comment) {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p));
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p._id !== postId));
  }

  async function viewProfile(userId) {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${userId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Profile load failed');
      }
      const data = await res.json();
      setProfileView(data);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not load profile');
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, Arial', padding: 20, background: '#fafafa', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h1>Simple Blog</h1>
            <div>
              {user ? (
                <>
                  <span style={{ marginRight: 8 }}>Hello, <strong>{user.username}</strong></span>
                  <button onClick={() => viewProfile(user.id)}>My Profile</button>
                  <button onClick={() => { logout(); window.location.reload(); }} style={{ marginLeft: 8 }}>Logout</button>
                </>
              ) : (
                <span style={{ color: '#666' }}>Not logged in</span>
              )}
            </div>
          </header>

          <section style={{ marginBottom: 16 }}>
            <h2>Create Post</h2>
            {user ? (
              <form onSubmit={createPost} style={{ display: 'grid', gap: 8 }}>
                <input placeholder="Title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} style={{ padding: 8 }} />
                <textarea placeholder="Body" value={newPostBody} onChange={e => setNewPostBody(e.target.value)} rows={6} style={{ padding: 8 }} />
                <div>
                  <button type="submit">Publish</button>
                </div>
              </form>
            ) : (
              <div style={{ color: '#666' }}>Login to create posts</div>
            )}
          </section>

          <section>
            <h2>Posts</h2>
            {loading ? <div>Loading...</div> : posts.length === 0 ? <div>No posts yet</div> : posts.map(p => (
              <div key={p._id}>
                <PostCard
                  post={p}
                  currentUser={user}
                  onCommentAdded={handleCommentAdded}
                  onDelete={handleDelete}
                  onRefresh={loadPosts}
                />
              </div>
            ))}
          </section>
        </div>

        <aside>
          <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
            {!user ? (
              <>
                <h3>Authenticate</h3>
                <LoginRegister onAuth={(u, token) => { handleAuth(u, token); }} />
              </>
            ) : (
              <>
                <h3>Your Profile</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.username}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => viewProfile(user.id)}>View profile</button>
                  <button onClick={() => { logout(); window.location.reload(); }} style={{ marginLeft: 8 }}>Logout</button>
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Quick actions</h4>
            <button onClick={() => loadPosts()}>Reload posts</button>
          </div>

          {profileView && (
            <div style={{ marginTop: 12, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
              <h4>Profile: {profileView.user.username}</h4>
              <div style={{ fontSize: 13, color: '#555' }}>
                <div>Bio: {profileView.user.bio || '—'}</div>
                <div>Posts: {profileView.postCount}</div>
                <div style={{ marginTop: 8 }}>
                  <strong>Recent Posts</strong>
                  <ul>
                    {profileView.recentPosts && profileView.recentPosts.map(rp => (
                      <li key={rp._id}>{rp.title} • {new Date(rp.createdAt).toLocaleDateString()}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button onClick={() => setProfileView(null)} style={{ marginTop: 8 }}>Close</button>
            </div>
          )}
        </aside>
      </div>

      {message && <div style={{ color: 'red', marginTop: 12 }}>{message}</div>}
    </div>
  );
}
