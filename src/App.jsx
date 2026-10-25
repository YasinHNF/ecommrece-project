import HomePage from './pages/HomePage/HomePage'
import Checkout from './pages/Checkout/Checkout'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <Routes>
      <Route index element={ <HomePage /> } />
      <Route path="checkout" element={ <Checkout /> } />
      
    </Routes>
  )
}

export default App