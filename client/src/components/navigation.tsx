import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navigation = () => {
    const [ isActive, setIsActive ] = useState(false);
    const navigate = useNavigate();
    return (
        <header className="main-header">
            <nav className="nav-half left-nav-half">
                <a className="nav-item" onClick = { ()=> navigate(`/shop`)}>Shop</a>
                <a className="nav-item" onClick = { () => navigate(`/products`)}>Products</a>
                <a className="nav-item" onClick = { () => navigate(`/cart`)}>Cart</a>
                <a className="nav-item" onClick = { () => navigate(`/orders`)}>Orders</a>
                <a className="nav-item" onClick = { () => navigate(`/add-product`)}>Add Product</a>
                <a className="nav-item" onClick = { () => navigate(`/products`)}>Admin Products</a>
            </nav>
            <div className="nav-half right-nav-half">
                <a className="nav-item" onClick = { ()=> navigate(`/login`)}>Login</a>
                <a className="nav-item" onClick = { ()=> navigate(`/signup`)}>Signup</a>
            </div>
        </header>
  );
}

export default Navigation;