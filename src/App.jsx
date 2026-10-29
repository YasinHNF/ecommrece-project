import { useState, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage/HomePage'
import Checkout from './pages/Checkout/Checkout'
import Orders from './pages/Orders/Orders'
import Tracking from './pages/Tracking/Tracking'
import NotFound from './pages/NotFound/NotFound'

function App() {
  const [cart, setCart] = useState([]);

  useEffect(
    () => {
      async function getCart() {
        const response = await axios.get('/api/cart-items');
        setCart(response.data);
      }
      getCart();
    }
  );

  return (
    <Routes>
      <Route index element={<HomePage cart={cart} setCart={setCart} />} />
      <Route path="checkout" element={<Checkout cart={cart} />} />
      <Route path="orders" element={<Orders />} />
      <Route path="tracking" element={<Tracking />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App