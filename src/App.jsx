import { useState, useEffect, useRef } from 'react'
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

  const addedToCartTimer = useRef({});
  function addToCart(productId, quantity) {
    const previousCart = cart;

    const cartItem = cart.find(item => item.productId === productId);

    if (cartItem) {
      setCart(
        prev => prev.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } :
            item)
      );

    } else {
      setCart(prev => [...prev, {
        productId, quantity, deliveryOptionId: '1', updating: false, inputValue: quantity
      }]);
    }

    setAddedToCartStatus(
      prev => prev.map(
        item => item.productId === productId ? { ...item, isShowing: true } : item
      )
    );

    const hideTimer = setTimeout(() => {
      setAddedToCartStatus(
        prev => prev.map(item => item.productId === productId ? { ...item, isShowing: false } : item)
      )
    }, 2000);

    const timerObject = addedToCartTimer.current[productId];

    if (timerObject) clearTimeout(timerObject);

    addedToCartTimer.current[productId] = hideTimer;


    async function addToBackend() {
      if (!quantity) return;

      let response;
      try {
        response = await axios.post('/api/cart-items/', { productId, quantity });
      } catch (error) {
        setCart(previousCart);
        alert(`${error}. Please try again later.`);
        return;
      }

      setCart(
        prev => prev.map(
          item => item.productId === productId ?
            { ...response.data, updating: false, inputValue: response.data.quantity } :
            item
        )
      );
    }
    addToBackend();

  }

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
          addToCart={addToCart}

        />}
      />
      <Route path="checkout" element={<Checkout cart={cart} setCart={setCart} products={products} />} />
      <Route path="orders" element={<Orders cart={cart} setCart={setCart} products={products} addToCart={addToCart} />} />
      <Route path="tracking" element={<Tracking cart={cart} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App