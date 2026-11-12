import { useSearchParams } from 'react-router';
import Header from '../../components/Header/Header';
import { formatPriceCents } from '../../utils/formatPrice.js';
import checkmark from '../../assets/images/icons/checkmark.png'
import './HomePage.css'

function HomePage({
    cart,
    products,
    productsQuantity,
    addedToCartStatus,
    setProductsQuantity,
    addToCart
}) {
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