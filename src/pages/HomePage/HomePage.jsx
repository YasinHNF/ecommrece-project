import { useRef } from 'react'
import { useSearchParams } from 'react-router';
import axios from 'axios'
import Header from '../../components/Header/Header';
import { formatPriceCents } from '../../utils/formatPrice.js';
import checkmark from '../../assets/images/icons/checkmark.png'
import './HomePage.css'

function HomePage({
    cart,
    setCart,
    products,
    productsQuantity,
    addedToCartStatus,
    setAddedToCartStatus,
    setProductsQuantity
}) {
    const addedToCartTimer = useRef({});

    function addToCart(productId, quantity) {
        const previousCart = cart;

        const cartItem = cart.find(item => item.productId === productId);

        if (cart.length === 0) {
            setCart([{
                productId, quantity, deliveryOptionId: '1'
            }])

        } else if (cartItem) {
            setCart(
                prev => prev.map(item =>
                    item.productId === productId ? { ...item, quantity: item.quantity + quantity } :
                        item)
            );
        } else {
            setCart(prev => [...prev, {
                productId, quantity, deliveryOptionId: '1'
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
                        response.data :
                        item
                )
            );
        }
        addToBackend();

    }

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search');

    const filteredProducts = products.map(
        (productItem) => {
            if (!search) return productItem;

            if (productItem.name.toLowerCase().includes(search.toLowerCase()) ||
                productItem.keywords.find(kw => kw.includes(search.toLowerCase())))
                return productItem;
        }
    );

    return (
        <>
            <title>Ecommerce Project</title>
            <link rel="icon" type="image/png" href="/images/home-favicon.png" />

            <Header cart={cart} search={search} setSearchParams={setSearchParams} />

            <div className="home-page">
                <div className="products-grid">
                    {
                        filteredProducts[0] ?
                            filteredProducts.map(
                                productItem => {
                                    if (!productItem) return;
                                    const productQuantity = productsQuantity.find(prItem => prItem.productId === productItem.id);
                                    return (
                                        <div key={productItem.id} className="product-container">
                                            <div className="product-image-container">
                                                <img className="product-image"
                                                    src={productItem.image} />
                                            </div>

                                            <div className="product-name limit-text-to-2-lines">
                                                {productItem.name}
                                            </div>

                                            <div className="product-rating-container">
                                                <img className="product-rating-stars"
                                                    src={`images/ratings/rating-${productItem.rating.stars * 10}.png`} />
                                                <div className="product-rating-count link-primary">
                                                    {productItem.rating.count}
                                                </div>
                                            </div>

                                            <div className="product-price">
                                                ${formatPriceCents(productItem.priceCents)}
                                            </div>

                                            <div className="product-quantity-container">
                                                <select onChange={e => setProductsQuantity(prev => prev.map(item => item.productId === productItem.id ? { ...item, quantity: Number(e.target.value) } : item))}>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                    <option value="6">6</option>
                                                    <option value="7">7</option>
                                                    <option value="8">8</option>
                                                    <option value="9">9</option>
                                                    <option value="10">10</option>
                                                </select>
                                            </div>

                                            <div className="product-spacer"></div>

                                            <div className={`added-to-cart 
                                            ${addedToCartStatus.find(
                                                item => item.productId === productItem.id
                                            )?.isShowing ? 'visible' : ''}`
                                            }>
                                                <img src={checkmark} />
                                                Added
                                            </div>

                                            <button className="add-to-cart-button button-primary" onClick={() => addToCart(productItem.id, productQuantity?.quantity)}>
                                                Add to Cart
                                            </button>
                                        </div>
                                    )
                                }
                            ) : products.length !== 0 ? <p style={{ margin: '5px' }}>Could not find.</p> : ''
                    }

                    {

                    }
                </div>
            </div>
        </>
    )
}

export default HomePage;