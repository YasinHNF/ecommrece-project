import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import dayjs from 'dayjs'
import { formatPriceCents } from '../../utils/formatPrice.js'
import logo from '../../assets/images/logo.png'
import mobileLogo from '../../assets/images/mobile-logo.png'
import lockIcon from '../../assets/images/icons/checkout-lock-icon.png'
import './Checkout.css'
import './Checkout-header.css'

function CheckoutHeader({ cartLength }) {
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
                        to="/">{cartLength} items</Link>)
                </div>

                <div className="checkout-header-right-section">
                    <img src={lockIcon} />
                </div>
            </div>
        </div>
    );
}

function PaymentSummary({ cart }) {
    const [paymentSummary, setPaymentSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getPaymentSummary() {
            const response = await axios.get('/api/payment-summary');
            setPaymentSummary(response.data);
            setIsLoading(false);
        }

        getPaymentSummary();
    }, [cart]);

    return (
        isLoading ? (
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

                <button className={`place-order-button button-primary ${paymentSummary.totalItems < 1 && 'disabled'}`}>
                    Place your order
                </button>
            </div>)
    )
}

function ResetCart({ cart, setCart }) {
    function resetCart() {
        Promise.all(
            cart.map(item => axios.delete(`/api/cart-items/${item.productId}`))
        ).then(
            () => setCart([])
        );
    }

    return (
        <button className="reset-button button-primary" onClick={resetCart}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" fill="#FFFFFF"></path></svg>
            Delete all
        </button>
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

function Checkout({ cart, products, setCart }) {
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
            setCart(prev => prev.filter(item => item.productId !== productId));

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

    const [quantityUpdate, setQuantityUpdate] = useState([]);
    function setQuantityUpdateToggle(productId) {
        setQuantityUpdate(prev => prev.map(item => item.productId === productId ? { ...item, updating: !item.updating } : item));
    }

    useEffect(
        () => {
            setQuantityUpdate(prev => cart.map(cartItem => {
                const matchingQuantityUpdate = prev.find(updateItem => updateItem.productId === cartItem.productId);
                if (cartItem.productId === matchingQuantityUpdate?.productId) {
                    return matchingQuantityUpdate
                }

                return {
                    productId: cartItem.productId,
                    updating: false,
                    inputValue: cartItem.quantity
                }
            }));
        }, [cart]
    );

    function saveNewQuantity(productId, inputValue) {
        async function saveToBackend() {
            try {
                await axios.put(`/api/cart-items/${productId}`, { quantity: inputValue });
            } catch (error) {
                alert(`Error: ${error}. Please try again later.`)
            }
        }

        if (inputValue > 999 || inputValue < 1) {
            alert('Quantity cannot be higher than 999 or lower than 1');
            return;
        }

        setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: inputValue } : item));
        setQuantityUpdateToggle(productId);
        saveToBackend();
    }

    return (
        <>
            <title>Checkout</title>
            <link rel="icon" type="image/png" href="/images/cart-favicon.png" />

            <CheckoutHeader cartLength={cart.length} />
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
                                            let quantityUpdateObject;

                                            if (quantityUpdate.length > 1) {
                                                console.log(quantityUpdate)
                                                quantityUpdateObject = quantityUpdate.find(item => item.productId === cartItem.productId);
                                            }

                                            return (<div key={cartItem.productId} className="cart-item-container">
                                                <div className="delivery-date">
                                                    Delivery date: {dayjs().add((deliveryOptions.find(delOption => delOption.id === cartItem.deliveryOptionId)).deliveryDays, 'days').format('dddd, MMMM DD')}
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
                                                                Quantity: <span className="quantity-label">{quantityUpdateObject?.updating ? '' : cartItem?.quantity}</span>
                                                            </span>

                                                            {
                                                                quantityUpdateObject?.updating ?
                                                                    <>
                                                                        <input
                                                                            type='number'
                                                                            value={quantityUpdateObject.inputValue}
                                                                            className="update-quantity-input"
                                                                            onChange={e => setQuantityUpdate(prev => prev.map(item => item === quantityUpdateObject ? { ...item, inputValue: e.target.value } : item))}
                                                                        />
                                                                        <span className="save-quantity-link link-primary" onClick={() => saveNewQuantity(cartItem.productId, Number(quantityUpdateObject.inputValue))}>Save</span>
                                                                    </>

                                                                    :
                                                                    <span className="update-quantity-link link-primary">
                                                                        <span onClick={() => setQuantityUpdateToggle(cartItem.productId, quantityUpdateObject.inputValue)}>Update</span>
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

                    <PaymentSummary cart={cart} />
                </div>
                <ResetCart cart={cart} setCart={setCart} />
            </div >
        </>
    )
}

export default Checkout;