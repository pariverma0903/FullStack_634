// Backend: Express API (Node.js)
//Install dependencies:
mkdir product-api
cd product-api
npm init -y
npm install express cors

//server.js:
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS so frontend can access the API
app.use(cors());

const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 45 }
];

// Route to get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


//Frontend: React App
npx create-react-app product-frontend
cd product-frontend
npm install axios


//src/components/ProductList.js:
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching products');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-container">
      <h2>Product List</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <button className="buy-button">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;


//src/components/ProductList.css:

.product-container {
  background-color: #222;
  color: #fff;
  padding: 20px;
  text-align: center;
}

.product-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  background-color: #333;
  border: 1px solid #666;
  border-radius: 10px;
  padding: 20px;
  width: 200px;
}

.buy-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  border-radius: 5px;
}

//src/App.js:
import React from 'react';
import ProductList from './components/ProductList';

function App() {
  return (
    <div>
      <ProductList />
    </div>
  );
}

export default App;
