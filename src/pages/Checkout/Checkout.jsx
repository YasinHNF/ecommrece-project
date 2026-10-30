import { Link } from 'react-router'
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

function Checkout({ cart, products }) {
    const productsPrice = cart.reduce(
        (priceSum, cartItem) => priceSum + (cartItem.quantity * (products.find(productItem => productItem.id === cartItem.productId)).priceCents),
        0
    );

    const shippingPrice = 100; // Just for now
    const taxPrice = (productsPrice + shippingPrice) * 0.1;

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
                            cart.map(
                                cartItem => {
                                    const product = products.find(productItem => productItem.id === cartItem.productId);

                                    return (<div key={cartItem.productId} className="cart-item-container">
                                        <div className="delivery-date">
                                            Delivery date: {dayjs(cartItem.createdAt).format('dddd, MMMM DD')}
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
                                                        Quantity: <span className="quantity-label">{cartItem?.quanttiy}</span>
                                                    </span>
                                                    <span className="update-quantity-link link-primary">
                                                        Update
                                                    </span>
                                                    <span className="delete-quantity-link link-primary">
                                                        Delete
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="delivery-options">
                                                <div className="delivery-options-title">
                                                    Choose a delivery option:
                                                </div>
                                                <div className="delivery-option">
                                                    <input type="radio" checked
                                                        className="delivery-option-input"
                                                        name="delivery-option-1" />
                                                    <div>
                                                        <div className="delivery-option-date">
                                                            Tuesday, June 21
                                                        </div>
                                                        <div className="delivery-option-price">
                                                            FREE Shipping
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="delivery-option">
                                                    <input type="radio"
                                                        className="delivery-option-input"
                                                        name="delivery-option-1" />
                                                    <div>
                                                        <div className="delivery-option-date">
                                                            Wednesday, June 15
                                                        </div>
                                                        <div className="delivery-option-price">
                                                            $4.99 - Shipping
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="delivery-option">
                                                    <input type="radio"
                                                        className="delivery-option-input"
                                                        name="delivery-option-1" />
                                                    <div>
                                                        <div className="delivery-option-date">
                                                            Monday, June 13
                                                        </div>
                                                        <div className="delivery-option-price">
                                                            $9.99 - Shipping
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)
                                }
                            )
                        }

                    </div>

                    <div className="payment-summary">
                        <div className="payment-summary-title">
                            Payment Summary
                        </div>

                        <div className="payment-summary-row">
                            <div>Items ({cart.length}):</div>
                            {console.log(productsPrice)}
                            <div className="payment-summary-money">${formatPriceCents(productsPrice)}</div>
                        </div>

                        <div className="payment-summary-row">
                            <div>Shipping &amp; handling:</div>
                            <div className="payment-summary-money">${formatPriceCents(shippingPrice)}</div>
                        </div>

                        <div className="payment-summary-row subtotal-row">
                            <div>Total before tax:</div>
                            <div className="payment-summary-money">${formatPriceCents(productsPrice + shippingPrice)}</div>
                        </div>

                        <div className="payment-summary-row">
                            <div>Estimated tax (10%):</div>
                            <div className="payment-summary-money">${formatPriceCents(taxPrice)}</div>
                        </div>

                        <div className="payment-summary-row total-row">
                            <div>Order total:</div>
                            <div className="payment-summary-money">${formatPriceCents(productsPrice + shippingPrice + taxPrice)}</div>
                        </div>

                        <button className="place-order-button button-primary">
                            Place your order
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Checkout;