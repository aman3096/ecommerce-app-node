import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import ProductDetail from './components/product-detail';
import Products from './components/products';
import Login from './components/login';
import Signup from './components/signup';
import Shop from "./components/shop";
import Navigation from './components/navigation';
import Cart from "./components/cart";
import AddProduct from "./components/add-product";
import AdminProducts from "./components/admin-products";
import Orders from "./components/orders";

function App() {
  const AllRoutesMap = [
    {
      path: "products",
      element: <Products/>,
    },
    {
      path: "products/:productId",
      element: <ProductDetail/>
    },
    {
      path: "/",
      element: <Shop />
    },
    {
      path: "shop",
      element: <Shop />
    },
    {
      path: "login",
      element: <Login />
    },
    {
      path: "signup",
      element: <Signup />
    },
    {
      path: "cart",
      element: <Cart />
    },
    {
      path: "add-product",
      element: <AddProduct />
    },
    {
      path: "admin-products",
      element: <AdminProducts />
    },
    {
      path: "orders",
      element: <Orders />
    }
  ]
  return (
    <BrowserRouter>
        <Navigation />
        <Routes>
             {AllRoutesMap.map(routeMap => (
                <Route key={routeMap.path} path={routeMap.path} element={routeMap.element} />
             ))}
        </Routes>
    </BrowserRouter>
  )
}

export default App
