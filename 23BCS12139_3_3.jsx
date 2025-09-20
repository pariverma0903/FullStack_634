// App.jsx
import React from "react";

// Base Class
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getDetails() {
    return `${this.name}, Age: ${this.age}`;
  }
}

// Subclass Student
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  getDetails() {
    return `${super.getDetails()}, Grade: ${this.grade}`;
  }
}

// Subclass Teacher
class Teacher extends Person {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  getDetails() {
    return `${super.getDetails()}, Subject: ${this.subject}`;
  }
}

// Card Component
const InfoCard = ({ title, details }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "20px",
        margin: "15px",
        width: "260px",
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
      <h3 style={{ marginBottom: "12px", fontWeight: "600", color: "#333" }}>
        {title}
      </h3>
      <p style={{ color: "#555" }}>{details}</p>
    </div>
  );
};

// Main App
function App() {
  // Create objects
  const person = new Person("Alex Johnson", 40);
  const student = new Student("Emma Watson", 20, "A");
  const teacher = new Teacher("Mr. Smith", 45, "Mathematics");

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
          fontSize: "28px",
          color: "#222",
        }}
      >
        👨‍🏫 Inheritance in JavaScript (ES6 Classes)
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <InfoCard title="Person" details={person.getDetails()} />
        <InfoCard title="Student" details={student.getDetails()} />
        <InfoCard title="Teacher" details={teacher.getDetails()} />
      </div>
    </div>
  );
}

export default App;
