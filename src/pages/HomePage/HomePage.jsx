import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../../components/Header/Header';
import { formatPriceCents } from '../../utils/formatPrice.js';
import checkmark from '../../assets/images/icons/checkmark.png'
import './HomePage.css'

function HomePage({ cart, setCart, products }) {
    const [productsQuantity, setProductsQuantity] = useState([]);
    useEffect(
        () => {
            setProductsQuantity(products.map(productItem => ({ productId: productItem.id, quantity: 1 })));
        }, [products]
    );

    console.log(productsQuantity)

    function addToCart(productId, quantity) {
        async function add() {
            if (!quantity) return;

            const response = await axios.post('/api/cart-items/', { productId, quantity });
            const cartItem = cart.find(item => item.productId === response.data.productId);
            if (cartItem) {
                console.log(response);
                setCart(
                    prev => prev.map(
                        item => item.productId === cartItem.productId ?
                            { ...item, quantity: response.data.quantity } :
                            item
                    )
                );
                return
            }

            setCart(
                prev => ([
                    ...prev,
                    response.data
                ])
            );
        }

        add();
    }

    return (
        <>
            <title>Ecommerce Project</title>
            <link rel="icon" type="image/png" href="/images/home-favicon.png" />

            <Header cart={cart} />

            <div className="home-page">
                <div className="products-grid">
                    {
                        products.map(
                            productItem => {
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

                                        <div className="added-to-cart">
                                            <img src={checkmark} />
                                            Added
                                        </div>

                                        <button className="add-to-cart-button button-primary" onClick={() => addToCart(productItem.id, productQuantity?.quantity)}>
                                            Add to Cart
                                        </button>
                                    </div>
                                )
                            }
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default HomePage;