import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage/HomePage'
import Checkout from './pages/Checkout/Checkout'
import Orders from './pages/Orders/Orders'
import Tracking from './pages/Tracking/Tracking'
import NotFound from './pages/NotFound/NotFound'
import ResetApp from './components/ResetApp/ResetApp'

function App() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [productsQuantity, setProductsQuantity] = useState([]);
    const [addedToCartStatus, setAddedToCartStatus] = useState([]);
    const [isPaymentButtonActive, setIsPaymentButtonActive] = useState(false);
    const [orders, setOrders] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState({});


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
        setIsPaymentButtonActive(true);

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

    async function getOrders() {
        let response;
        try {
            response = await axios.get('/api/orders');
            const newOrders = response.data.map(
                item => {
                    const newProducts = item.products.map(item => ({ ...item, isAdding: false }));
                    return { ...item, products: newProducts }
                }
            );
            response.data.length !== 0 ? setOrders(newOrders) :
                setOrders(['empty']);
        } catch (error) {
            alert(error);
        }
    }

    useEffect(
        () => {
            async function getCart() {
                const response = await axios.get('/api/cart-items');
                setCart(response.data.map(cartItem => ({ ...cartItem, updating: false, inputValue: cartItem.quantity })));
                setIsPaymentButtonActive(!(response.data.length === 0));
            }

            getCart();

            async function getProducts() {
                const response = await axios.get('/api/products');
                setProducts(response.data);
                setProductsQuantity(response.data.map(productItem => ({ productId: productItem.id, quantity: 1 })));
                setAddedToCartStatus(response.data.map(productItem => ({ productId: productItem.id, isShowing: false })));
            }

            getProducts();

            async function firstGetOrders() {
                await getOrders(); // React 19 rule
            }

            firstGetOrders();
        }, []
    );

    const sharedProps = {
        cart,
        setCart,
        products,
        productsQuantity,
        setProductsQuantity,
        addedToCartStatus,
        setAddedToCartStatus,
        isPaymentButtonActive,
        setIsPaymentButtonActive,
        getOrders,
        paymentSummary,
        setPaymentSummary,
        addToCart,
        orders,
        setOrders
    }; // Pass this to every component, each takes only the ones it needs

    return (
        <>
            <Routes>
                <Route index element={<HomePage {...sharedProps} />}
                />
                <Route path="checkout" element={<Checkout {...sharedProps} />}
                />
                <Route path="orders" element={
                    <Orders {...sharedProps} />}
                />
                <Route path="tracking" element={
                    <Tracking {...sharedProps} />}
                />
                <Route path="*" element={<NotFound {...sharedProps} />} />
            </Routes>
            <ResetApp {...sharedProps} />
        </>
    )
}

export default App