// App.jsx
import React, { useState } from "react";

// BookCard Component
const BookCard = ({ title, author, onRemove }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "16px",
        margin: "12px",
        width: "240px",
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";
      }}
    >
      <h3 style={{ marginBottom: "8px", fontWeight: "600", color: "#333" }}>
        {title}
      </h3>
      <p style={{ marginBottom: "12px", color: "#555" }}>✍️ {author}</p>
      <button
        onClick={onRemove}
        style={{
          backgroundColor: "#c62828",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        ❌ Remove
      </button>
    </div>
  );
};

// Main App Component
function App() {
  const [books, setBooks] = useState([
    { title: "Atomic Habits", author: "James Clear" },
    { title: "The Alchemist", author: "Paulo Coelho" },
    { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki" },
  ]);
  const [search, setSearch] = useState("");
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  // Add book
  const addBook = () => {
    if (newBook.title.trim() && newBook.author.trim()) {
      setBooks([...books, newBook]);
      setNewBook({ title: "", author: "" });
    }
  };

  // Remove book
  const removeBook = (index) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  // Filtered books
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontWeight: "700", marginBottom: "30px", fontSize: "28px" }}>
        📚 Library Management
      </h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="🔍 Search by title or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "20px",
        }}
      />

      {/* Add Book Form */}
      <div style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Book Title"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          style={{
            padding: "10px",
            width: "200px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginRight: "10px",
          }}
        />
        <input
          type="text"
          placeholder="Author"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          style={{
            padding: "10px",
            width: "200px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginRight: "10px",
          }}
        />
        <button
          onClick={addBook}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ➕ Add Book
        </button>
      </div>

      {/* Books List */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <BookCard
              key={index}
              title={book.title}
              author={book.author}
              onRemove={() => removeBook(index)}
            />
          ))
        ) : (
          <p style={{ color: "#777", marginTop: "20px" }}>No books found 📭</p>
        )}
      </div>
    </div>
  );
}

export default App;
