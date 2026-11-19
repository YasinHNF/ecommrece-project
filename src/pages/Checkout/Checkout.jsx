import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import dayjs from 'dayjs'
import { formatPriceCents } from '../../utils/formatPrice.js'
import logo from '../../assets/images/logo.png'
import mobileLogo from '../../assets/images/mobile-logo.png'
import lockIcon from '../../assets/images/icons/checkout-lock-icon.png'
import './Checkout.css'
import './Checkout-header.css'

function CheckoutHeader({ totalItems }) {
    return (
        <div className="checkout-header">
            <div className="header-content">
                <div className="checkout-header-left-section">
                    <Link to="/">
                        <img className="logo" src={logo} />
                        <img className="mobile-logo" src={mobileLogo} />
                    </Link>
                </div>

                <div className="checkout-header-middle-section">
                    Checkout (<Link className="return-to-home-link"
                        to="/">{totalItems} items</Link>)
                </div>

                <div className="checkout-header-right-section">
                    <img src={lockIcon} />
                </div>
            </div>
        </div>
    );
}

function PaymentSummary({
    paymentSummary,
    setCart,
    isPaymentButtonActive,
    setIsPaymentButtonActive,
    getOrders
}) {
    const navigate = useNavigate();

    async function placeOrder() {
        setIsPaymentButtonActive(false);
        try {
            await axios.post('/api/orders');
            setCart([]);
            getOrders();
            navigate('/orders');
        } catch (error) {
            alert(error);
            if (!isPaymentButtonActive) return;
            setIsPaymentButtonActive(true);
        }
    }

    return (
        Object.keys(paymentSummary) === 0 ? (
            <p>Loading</p>
        ) : (
            <div className="payment-summary">
                <div className="payment-summary-title">
                    Payment Summary
                </div>

                <div className="payment-summary-row">
                    <div>Items ({paymentSummary.totalItems}):</div>
                    <div className="payment-summary-money">${formatPriceCents(paymentSummary.productCostCents) || '0.00'}</div>
                </div>

                <div className="payment-summary-row">
                    <div>Shipping &amp; handling:</div>
                    <div className="payment-summary-money">${formatPriceCents(paymentSummary.shippingCostCents) || '0.00'}</div>
                </div>

                <div className="payment-summary-row subtotal-row">
                    <div>Total before tax:</div>
                    <div className="payment-summary-money">${formatPriceCents(paymentSummary.totalCostBeforeTaxCents) || '0.00'}</div>
                </div>

                <div className="payment-summary-row">
                    <div>Estimated tax (10%):</div>
                    <div className="payment-summary-money">${formatPriceCents(paymentSummary.taxCents) || '0.00'}</div>
                </div>

                <div className="payment-summary-row total-row">
                    <div>Order total:</div>
                    <div className="payment-summary-money">${formatPriceCents(paymentSummary.totalCostCents) || '0.00'}</div>
                </div>

                <button
                    className="place-order-button button-primary"
                    onClick={placeOrder}
                    disabled={!isPaymentButtonActive && 'disabled'}
                >
                    Place your order
                </button>
            </div>)
    )
}

function CartEmpty() {
    return (
        <div>
            <p>Your cart is empty.</p>
            <Link className="button-primary view-products-link" to="/">View products</Link>
        </div>
    )
}

function Checkout({
    paymentSummary,
    setPaymentSummary,
    cart,
    products,
    setCart,
    isPaymentButtonActive,
    setIsPaymentButtonActive,
    getOrders }) {
    async function updateDeliveryOption(productId, optionId) {
        if (!productId) return

        try {
            const updatedCartItem = await axios.put(`/api/cart-items/${productId}`, { deliveryOptionId: optionId });

            const editedCart = structuredClone(cart);
            editedCart.find(cartItem => cartItem.productId === updatedCartItem.data.productId).deliveryOptionId =
                updatedCartItem.data.deliveryOptionId;
            setCart(editedCart);

        } catch (error) {
            alert(`Error : ${error}`);
        }
    }

    async function deleteCartItem(productId) {
        try {
            await axios.delete(`/api/cart-items/${productId}`);
            const newCart = cart.filter(item => item.productId !== productId);
            setCart(newCart);
            if (newCart.length === 0) setIsPaymentButtonActive(false);

        } catch (error) {
            alert(`Error: ${error}`);
        }
    }

    const [deliveryOptions, setDeliveryOptions] = useState(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    useEffect(
        () => {
            async function getDeliveryOptions() {
                const response = await axios.get('/api/delivery-options');
                setDeliveryOptions(response.data);
                setIsLoadingProducts(false);
            }

            getDeliveryOptions();
        }, []
    );

    function quantityUpdateToggle(productId) {
        setCart(prev => prev.map(item => item.productId === productId ? { ...item, updating: !item.updating } : item));
    }


    useEffect(
        () => {
            async function getPaymentSummary() {
                const response = await axios.get('/api/payment-summary');
                setPaymentSummary(response.data);
            }

            getPaymentSummary();
        }, [cart]
    );


    function saveNewQuantity(productId, inputValue) {
        async function saveToBackend() {
            try {
                await axios.put(`/api/cart-items/${productId}`, { quantity: inputValue });
            } catch (error) {
                alert(`Error: ${error}. Please try again later.`)
                return;
            }
        }

        if (inputValue > 999 || inputValue < 1) {
            alert('Quantity cannot be higher than 999 or lower than 1');
            return;
        }

        setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: inputValue } : item));
        quantityUpdateToggle(productId);
        saveToBackend();
    }

    return (
        <>
            <title>Checkout</title>
            <link rel="icon" type="image/png" href="/images/cart-favicon.png" />

            <CheckoutHeader
                totalItems={paymentSummary.totalItems} setcart={setCart} cart={cart} />
            <div className="checkout-page">
                <div className="page-title">Review your order</div>

                <div className="checkout-grid">
                    <div className="order-summary">
                        {
                            isLoadingProducts ? <p>Loading...</p> :
                                cart.length === 0 ? <CartEmpty /> :
                                    cart.map(
                                        cartItem => {
                                            const product = products.find(productItem => productItem.id === cartItem.productId);

                                            return (<div key={cartItem.productId} className="cart-item-container">
                                                <div className="delivery-date">
                                                    Delivery date: {dayjs().add(
                                                        (deliveryOptions.find(delOption => delOption.id === cartItem.deliveryOptionId))
                                                            .deliveryDays, 'days').format('dddd, MMMM DD')}
                                                </div>

                                                <div className="cart-item-details-grid">
                                                    <img className="product-image"
                                                        src={product?.image} />

                                                    <div className="cart-item-details">
                                                        <div className="product-name">
                                                            {
                                                                product?.name
                                                            }
                                                        </div>
                                                        <div className="product-price">
                                                            ${formatPriceCents(product?.priceCents)}
                                                        </div>
                                                        <div className="product-quantity">
                                                            <span>
                                                                Quantity: <span className="quantity-label">{cartItem?.updating ? '' : cartItem?.quantity}</span>
                                                            </span>

                                                            {
                                                                cartItem?.updating ?
                                                                    <>
                                                                        <input
                                                                            type='number'
                                                                            value={cartItem.inputValue}
                                                                            className="update-quantity-input"
                                                                            onChange={e => setCart(prev =>
                                                                                prev.map(item => item.productId === cartItem.productId ?
                                                                                    { ...item, inputValue: e.target.value } : item))}
                                                                            onKeyDown={e => e.key === 'Enter' && saveNewQuantity(cartItem.productId, Number(cartItem.inputValue))}
                                                                        />
                                                                        <span className="save-quantity-link link-primary" onClick={() =>
                                                                            saveNewQuantity(cartItem.productId, Number(cartItem.inputValue))}>Save</span>
                                                                    </>

                                                                    :
                                                                    <span className="update-quantity-link link-primary">
                                                                        <span onClick={() => quantityUpdateToggle(cartItem.productId)}>Update</span>
                                                                    </span>
                                                            }


                                                            <span className="delete-quantity-link link-primary"
                                                                onClick={() => deleteCartItem(product.id)}
                                                            >
                                                                Delete
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="delivery-options">
                                                        <div className="delivery-options-title">
                                                            Choose a delivery option:
                                                        </div>
                                                        <label className="delivery-option">
                                                            <input type="radio"
                                                                className="delivery-option-input"
                                                                name={`delivery-option-${product?.id}`}
                                                                value="1"
                                                                onChange={
                                                                    () => {
                                                                        updateDeliveryOption(product?.id, '1');
                                                                    }
                                                                }
                                                                checked={cartItem?.deliveryOptionId === '1'} />
                                                            <div htmlFor={`${product?.id}-1`}>
                                                                <div className="delivery-option-date">
                                                                    Tuesday, June 21
                                                                </div>
                                                                <div className="delivery-option-price">
                                                                    FREE Shipping
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <label className="delivery-option">
                                                            <input type="radio"
                                                                className="delivery-option-input"
                                                                name={`delivery-option-${product?.id}`}
                                                                value="2"
                                                                onChange={
                                                                    () => {
                                                                        updateDeliveryOption(product?.id, '2');
                                                                    }
                                                                }
                                                                checked={cartItem?.deliveryOptionId === '2'} />
                                                            <div>
                                                                <div className="delivery-option-date">
                                                                    Wednesday, June 15
                                                                </div>
                                                                <div className="delivery-option-price">
                                                                    $4.99 - Shipping
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <label className="delivery-option">
                                                            <input type="radio"
                                                                className="delivery-option-input"
                                                                name={`delivery-option-${product?.id}`}
                                                                value="3"
                                                                onChange={
                                                                    () => {
                                                                        updateDeliveryOption(product.id, '3');
                                                                    }
                                                                }
                                                                checked={cartItem?.deliveryOptionId === '3'} />
                                                            <div>
                                                                <div className="delivery-option-date">
                                                                    Monday, June 13
                                                                </div>
                                                                <div className="delivery-option-price">
                                                                    $9.99 - Shipping
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>)
                                        }
                                    )
                        }

                    </div>

                    <PaymentSummary
                        paymentSummary={paymentSummary}
                        setCart={setCart}
                        isPaymentButtonActive={isPaymentButtonActive}
                        setIsPaymentButtonActive={setIsPaymentButtonActive}
                        getOrders={getOrders}
                    />
                </div>
            </div >
        </>
    )
}

export default Checkout;