// App.jsx
import React, { useEffect, useState } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  // Change this to your ALB or backend endpoint
  const BASE_URL = "http://your-alb-dns-or-ip/api";

  // Fetch todos
  useEffect(() => {
    fetch(`${BASE_URL}/todos`)
      .then((res) => res.json())
      .then(setTodos)
      .catch((err) => console.error("Failed to fetch todos:", err));
  }, []);

  // Add new todo
  async function addTodo(e) {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setTodos([...todos, data]);
    setText("");
  }

  // Toggle completed
  async function toggleComplete(id, completed) {
    const res = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    const data = await res.json();
    setTodos(todos.map((t) => (t._id === id ? data : t)));
  }

  // Delete todo
  async function deleteTodo(id) {
    await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t._id !== id));
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>✅ Todo App (Load Balanced)</h1>

      <form onSubmit={addTodo} style={{ marginBottom: "1rem" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo..."
          style={{ padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo._id || todo.text}
            style={{
              padding: "0.5rem 0",
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              onClick={() => toggleComplete(todo._id, todo.completed)}
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo._id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
