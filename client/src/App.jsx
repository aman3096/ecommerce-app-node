import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import Products from './components/products';
import Login from './components/login';
import Signup from './components/signup';
import Shop from "./components/shop"
import Navigation from './components/navigation'

function App() {

  return (
    <BrowserRouter>
        <Navigation />
        <Routes>
              <Route path="/products" element={<Products />} />
              <Route path="/" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
