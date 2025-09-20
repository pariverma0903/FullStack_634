// App.jsx
import React from "react";

// ProductCard component
const ProductCard = ({ name, price, inStock }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "20px",
        margin: "15px",
        width: "220px",
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
      <h3 style={{ fontWeight: "600", marginBottom: "10px", color: "#333" }}>
        {name}
      </h3>
      <p style={{ margin: "6px 0", color: "#555" }}>💲 {price}</p>
      <p
        style={{
          margin: "6px 0",
          color: inStock ? "#2e7d32" : "#c62828",
          fontWeight: "500",
        }}
      >
        {inStock ? "✅ In Stock" : "❌ Out of Stock"}
      </p>
    </div>
  );
};

// Main App component
function App() {
  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontWeight: "700",
          marginBottom: "30px",
          color: "#222",
          fontSize: "28px",
        }}
      >
        🛒 Products List
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <ProductCard name="Wireless Mouse" price={25.99} inStock={true} />
        <ProductCard name="Keyboard" price={45.5} inStock={false} />
        <ProductCard name="Monitor" price={199.99} inStock={true} />
      </div>
    </div>
  );
}

export default App;
