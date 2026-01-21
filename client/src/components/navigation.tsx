import { Routes, Route } from 'react-router-dom'
import Shop from './shop';
import Products from './products';
import Login from './login';
import Signup from './signup';

const Navigation = () => {
  return (
        <header className="main-header">
            <div className="nav-half">
                <div>Shop</div>
                <div>Products</div>
            </div>
            <div className="nav-half">
                <div>Login</div>
                <div>Signup</div>

            </div>
        </header>

  );
}

export default Navigation;