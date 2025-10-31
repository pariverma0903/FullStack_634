// App.jsx
});
const data = await res.json();
setTodos([data, ...todos]);
setNewTodo('');
}


async function toggleTodo(id, completed) {
const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ completed: !completed })
});
const updated = await res.json();
setTodos(todos.map(t => t._id === id ? updated : t));
}


async function deleteTodo(id) {
await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE' });
setTodos(todos.filter(t => t._id !== id));
}


return (
<div style={{ fontFamily: 'sans-serif', padding: '2rem', background: '#f4f4f4', minHeight: '100vh' }}>
<div style={{ maxWidth: '600px', margin: 'auto', background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
<h2 style={{ textAlign: 'center' }}>📝 Todo List</h2>
<form onSubmit={addTodo} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
<input
type="text"
placeholder="Add a new task..."
value={newTodo}
onChange={e => setNewTodo(e.target.value)}
style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
/>
<button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>Add</button>
</form>


{loading ? <p>Loading...</p> : (
<ul style={{ listStyle: 'none', padding: 0 }}>
{todos.length === 0 ? (
<p style={{ textAlign: 'center', color: '#888' }}>No todos yet</p>
) : (
todos.map(todo => (
<li key={todo._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
<input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id, todo.completed)} />
<span style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? '#888' : '#000' }}>{todo.text}</span>
</div>
<button onClick={() => deleteTodo(todo._id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>❌</button>
</li>
))
)}
</ul>
)}
</div>
</div>
);
}
