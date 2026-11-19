import Header from '../../components/Header/Header.jsx'
import './NotFound.css'

function NotFound({ cart }) {
    return (
        <>
            <title>Not Found</title>
            <Header cart={cart} />
            <p className="not-found-text">Not Found.</p>
        </>
    )
}

export default NotFound;