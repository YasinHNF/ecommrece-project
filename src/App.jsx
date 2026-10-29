import HomePage from './pages/HomePage/HomePage'
import Checkout from './pages/Checkout/Checkout'
import Orders from './pages/Orders/Orders'
import Tracking from './pages/Tracking/Tracking'
import NotFound from './pages/NotFound/NotFound'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="orders" element={<Orders />} />
      <Route path="tracking" element={<Tracking />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App