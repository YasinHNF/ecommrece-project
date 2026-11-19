import { Link } from 'react-router'
import NotFound from '../NotFound/NotFound'
import { useSearchParams } from 'react-router'
import dayjs from 'dayjs'
import Header from '../../components/Header/Header'
import './Tracking.css'

function Tracking({ cart, orders, products }) {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const productId = searchParams.get('productId');
    let hasFound = true;
    if (!orderId || !productId) hasFound = false;

    let orderItem;
    let productOrder;
    let productInfo;

    if (hasFound) {
        orderItem = orders?.find(item => item.id === orderId);
        if (!orderItem) hasFound = false
        else {
            productOrder = orderItem.products.find(item => item.productId === productId);
            if (!productOrder) hasFound = false;
        }

        if (hasFound) {
            productInfo = products?.find(item => item.id === productId);
        }
    }

    let deliverStatus;
    if (hasFound) {
        deliverStatus = ((dayjs().valueOf() - orderItem.orderTimeMs) /
            (productOrder.estimatedDeliveryTimeMs - orderItem.orderTimeMs)) * 100;
    }

    return (
        !hasFound ?
            <NotFound cart={cart} />
            :
            <>
                <title>Tracking</title>
                <link rel="icon" type="image/png" href="/images/tracking-favicon.png" />

                <Header cart={cart} />
                <div className="tracking-page">
                    <div className="order-tracking">
                        <Link className="back-to-orders-link link-primary" to="/orders">
                            View all orders
                        </Link>

                        <div className="delivery-date">
                            Arriving on {dayjs(productOrder.estimatedDeliveryTimeMs).format('dddd, MMMM DD')}
                        </div>

                        <div className="product-info">
                            {productInfo.name}
                        </div>

                        <div className="product-info">
                            Quantity: {productOrder.quantity}
                        </div>

                        <img className="product-image" src={productInfo.image} />

                        <div className="progress-labels-container">
                            <div className={`progress-label ${deliverStatus < 50 ? 'current-status' : ''}`}>
                                Preparing
                            </div>
                            <div className={`progress-label ${deliverStatus > 50 && deliverStatus < 100 ? 'current-status' : ''}`}>
                                Shipped
                            </div>
                            <div className={`progress-label ${deliverStatus >= 100 ? 'current-status' : ''}`}>
                                Delivered
                            </div>
                        </div>

                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${deliverStatus}%` }}></div>
                        </div>
                    </div>
                </div>
            </>
    )
}

export default Tracking;