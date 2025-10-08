// server.js
// Step - 1
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/studentDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/students", studentRoutes);

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

// Step-2
// models/studentModel.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Student name is required"]
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be positive"]
  },
  course: {
    type: String,
    required: [true, "Course is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  }
});

module.exports = mongoose.model("Student", studentSchema);

//Step-3

// controllers/studentController.js
const Student = require("../models/studentModel");

// ✅ Create Student
exports.createStudent = async (req, res) => {
  try {
    const { name, age, course, email } = req.body;
    const newStudent = new Student({ name, age, course, email });
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: "Error creating student", error: error.message });
  }
};

// ✅ Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// ✅ Get Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID", error: error.message });
  }
};

// ✅ Update Student
exports.updateStudent = async (req, res) => {
  try {
    const { name, age, course, email } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, age, course, email },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: "Error updating student", error: error.message });
  }
};

// ✅ Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully", student: deletedStudent });
  } catch (error) {
    res.status(400).json({ message: "Error deleting student", error: error.message });
  }
};

//Step-4
// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// CRUD Routes
router.post("/", studentController.createStudent);      // Create
router.get("/", studentController.getAllStudents);      // Read All
router.get("/:id", studentController.getStudentById);   // Read by ID
router.put("/:id", studentController.updateStudent);    // Update
router.delete("/:id", studentController.deleteStudent); // Delete

module.exports = router;

//step-5
mkdir student-mvc
cd student-mvc
npm init -y
npm install express mongoose cors body-parser
