import { useEffect, useState, Fragment, useRef } from 'react'
import { Link } from 'react-router'
import { formatPriceCents } from '../../utils/formatPrice.js'
import dayjs from 'dayjs'
import axios from 'axios'
import Header from '../../components/Header/Header'
import buyAgain from '../../assets/images/icons/buy-again.png'
import checkMarkWhite from '../../assets/images/icons/checkmark-white.png'
import './Orders.css'

function Orders({ cart, addToCart, products }) {
    const [orders, setOrders] = useState([]);

    useEffect(
        () => {
            (async () => {
                let response;
                try {
                    response = await axios.get('/api/orders');
                    const newOrders = response.data.map(
                        item => {
                            const newProducts = item.products.map(item => ({ ...item, isAdding: false }));
                            return { ...item, products: newProducts }
                        }
                    );
                    setOrders(newOrders);
                } catch (error) {
                    alert(error);
                }
            })();
        }, []
    );

    const timersRef = useRef({});

    function buyAgainProduct(productId, orderId) {
        addToCart(productId, 1);

        setOrders(prev => prev.map(item => {
            const newProducts = item.products.map(item =>
                item.productId === productId ? { ...item, isAdding: true } : item);
            return { ...item, products: newProducts }
        }));

        timersRef.current[orderId] ??= {};

        clearTimeout(timersRef.current[orderId][productId]);
        timersRef.current[orderId][productId] = setTimeout(() => {
            setOrders(prev => prev.map(item => {
                const newProducts = item.products.map(item =>
                    item.productId === productId ? { ...item, isAdding: false } : item);
                return { ...item, products: newProducts }
            }));
        }, 2000);
    }

    return (
        <>
            <title>Orders</title>
            <link rel="icon" type="image/png" href="/images/orders-favicon.png" />

            <Header cart={cart}  />
            <div className="orders-page">
                <div className="page-title">Your Orders</div>

                <div className="orders-grid">
                    {
                        orders.length === 0 ?
                            <p>Loading...</p> :
                            orders.map(
                                orderItem => (
                                    <div className="order-container" key={orderItem.id}>

                                        <div className="order-header">
                                            <div className="order-header-left-section">
                                                <div className="order-date">
                                                    <div className="order-header-label">Order Placed:</div>
                                                    <div>{dayjs(orderItem.orderTimeMs).format('MMMM DD')}</div>
                                                </div>
                                                <div className="order-total">
                                                    <div className="order-header-label">Total:</div>
                                                    <div>${formatPriceCents(orderItem.totalCostCents)}</div>
                                                </div>
                                            </div>

                                            <div className="order-header-right-section">
                                                <div className="order-header-label">Order ID:</div>
                                                <div>{orderItem.id}</div>
                                            </div>
                                        </div>

                                        <div className="order-details-grid">
                                            {
                                                orderItem.products.map(
                                                    item => {
                                                        const productItem = products.find(
                                                            prItem => prItem.id === item.productId
                                                        );

                                                        return (
                                                            <Fragment key={item.productId}>
                                                                <div className="product-image-container">
                                                                    <img src={productItem?.image} />
                                                                </div>
                                                                <div className="product-details">
                                                                    <div className="product-name">
                                                                        {productItem?.name}
                                                                    </div>
                                                                    <div className="product-delivery-date">
                                                                        Arriving on: {
                                                                            dayjs(item.estimatedDeliveryTimeMs).format('MMMM DD')
                                                                        }
                                                                    </div>
                                                                    <div className="product-quantity">
                                                                        Quantity: {item.quantity}
                                                                    </div>
                                                                    <button className="buy-again-button button-primary" onClick={() => buyAgainProduct(item.productId, orderItem.id)}>
                                                                        {
                                                                            item.isAdding ?
                                                                                <>
                                                                                    <img className="buy-again-icon" src={checkMarkWhite} />
                                                                                    <span className="buy-again-message">Added</span>
                                                                                </>
                                                                                :
                                                                                <>
                                                                                    <img className="buy-again-icon" src={buyAgain} />
                                                                                    <span className="buy-again-message">Add to Cart</span>
                                                                                </>
                                                                        }

                                                                    </button>
                                                                </div>
                                                                <div className="product-actions">
                                                                    <Link to="/tracking">
                                                                        <button className="track-package-button button-secondary">
                                                                            Track package
                                                                        </button>
                                                                    </Link>
                                                                </div>
                                                            </Fragment>)
                                                    }
                                                )
                                            }
                                        </div>
                                    </div>)
                            )
                    }
                </div>
            </div>
        </>
    )
}

export default Orders;