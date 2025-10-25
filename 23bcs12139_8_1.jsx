import React, { useState } from "react";

function LoginForm() {
// Step 1: Create state variables for username, password, and error message
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

// Step 2: Handle form submission
const handleSubmit = (e) => {
e.preventDefault(); // Prevent page reload

```
// Step 3: Basic validation
if (!username || !password) {
  setError("Please fill out both fields.");
  return;
}

// Step 4: Log the data to console
console.log("Username:", username);
console.log("Password:", password);

// Step 5: Clear form and error message
setUsername("");
setPassword("");
setError("");
```

};

return ( <div style={styles.container}> <h2 style={styles.title}>Login Form</h2> <form onSubmit={handleSubmit} style={styles.form}>
<input
type="text"
placeholder="Username"
value={username}
onChange={(e) => setUsername(e.target.value)}
style={styles.input}
/>
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.input}
/> <button type="submit" style={styles.button}>
Submit </button> </form>
{error && <p style={styles.error}>{error}</p>} </div>
);
}

// Inline styles for simplicity
const styles = {
container: {
width: "300px",
margin: "100px auto",
padding: "20px",
border: "1px solid #ccc",
borderRadius: "10px",
textAlign: "center",
backgroundColor: "#f9f9f9",
},
title: {
marginBottom: "15px",
},
form: {
display: "flex",
flexDirection: "column",
},
input: {
marginBottom: "10px",
padding: "8px",
fontSize: "14px",
},
button: {
padding: "8px",
backgroundColor: "#4CAF50",
color: "white",
border: "none",
borderRadius: "5px",
cursor: "pointer",
},
error: {
color: "red",
marginTop: "10px",
},
};

export default LoginForm;
