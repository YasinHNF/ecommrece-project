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

  const [productsQuantity, setProductsQuantity] = useState([]);
  const [addedToCartStatus, setAddedToCartStatus] = useState([]);

  useEffect(
    () => {
      async function getCart() {
        const response = await axios.get('/api/cart-items');
        setCart(response.data.map(cartItem => ({ ...cartItem, updating: false, inputValue: cartItem.quantity })));
      }

      getCart();

      async function getProducts() {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setProductsQuantity(response.data.map(productItem => ({ productId: productItem.id, quantity: 1 })));
        setAddedToCartStatus(response.data.map(productItem => ({ productId: productItem.id, isShowing: false })));
      }

      getProducts();
    }, []
  );

  return (
    <Routes>
      <Route index element={
        <HomePage
          cart={cart}
          setCart={setCart}
          products={products}
          productsQuantity={productsQuantity}
          addedToCartStatus={addedToCartStatus}
          setAddedToCartStatus={setAddedToCartStatus}
          setProductsQuantity={setProductsQuantity}
        />}
      />
      <Route path="checkout" element={<Checkout cart={cart} setCart={setCart} products={products} />} />
      <Route path="orders" element={<Orders cart={cart} />} />
      <Route path="tracking" element={<Tracking cart={cart} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App