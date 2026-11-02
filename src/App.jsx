import { useState, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage/HomePage'
import Checkout from './pages/Checkout/Checkout'
import Orders from './pages/Orders/Orders'
import Tracking from './pages/Tracking/Tracking'
import NotFound from './pages/NotFound/NotFound'

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(
    () => {
      async function getCart() {
        const response = await axios.get('/api/cart-items');
        setCart(response.data);
      }

      getCart();

      async function getProducts() {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      }

      getProducts();
    }, []
  );

  return (
    <Routes>
      <Route index element={<HomePage cart={cart} products={products} />} />
      <Route path="checkout" element={<Checkout cart={cart} setCart={setCart} products={products} />} />
      <Route path="orders" element={<Orders />} />
      <Route path="tracking" element={<Tracking />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App