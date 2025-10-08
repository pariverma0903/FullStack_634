// server.js
// STEP-1
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const catalogRoutes = require("./routes/catalogRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ecommerceCatalog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Use Routes
app.use("/api/catalog", catalogRoutes);

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

//STEP-2
// models/catalogModel.js
const mongoose = require("mongoose");

// Review Schema (nested inside Product)
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

// Product Schema (nested inside Category)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  reviews: [reviewSchema],
});

// Category Schema (main document)
const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  description: { type: String },
  products: [productSchema],
});

module.exports = mongoose.model("Category", categorySchema);


//STEP-3

// controllers/catalogController.js
const Category = require("../models/catalogModel");

// ✅ Create Category
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating category", error: error.message });
  }
};

// ✅ Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// ✅ Add Product to Category
exports.addProduct = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, price, inStock } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.products.push({ name, price, inStock });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Error adding product", error: error.message });
  }
};

// ✅ Add Review to Product
exports.addReview = async (req, res) => {
  try {
    const { categoryId, productId } = req.params;
    const { user, rating, comment } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const product = category.products.id(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push({ user, rating, comment });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Error adding review", error: error.message });
  }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted", deleted });
  } catch (error) {
    res.status(400).json({ message: "Error deleting category", error: error.message });
  }
};


//STEP-4

// routes/catalogRoutes.js
const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");

// Routes
router.post("/", catalogController.createCategory);             // Create Category
router.get("/", catalogController.getAllCategories);            // Get All
router.post("/:categoryId/products", catalogController.addProduct); // Add Product
router.post("/:categoryId/products/:productId/reviews", catalogController.addReview); // Add Review
router.delete("/:id", catalogController.deleteCategory);        // Delete Category

module.exports = router;


//STEP-5

mkdir ecommerce-nested
cd ecommerce-nested
npm init -y
npm install express mongoose cors body-parser
node server.js

