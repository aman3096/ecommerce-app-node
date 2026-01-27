import { useNavigate } from "react-router-dom";

const Navigation = () => {
    const navigate = useNavigate();

    const LeftNavItems = [
        {
            path: '/shop',
            name: 'Shop'
        },
        {
            path: '/products',
            name: 'Products'
        },
        {
            path: '/products',
            name: 'Products'
        },
        {
            path: '/cart',
            name: 'Cart',
        },
        {
            path: '/orders',
            name: 'Orders'
        },
        {
            path: '/add-product',
            name: 'Add Product'
        }, 
        {
            path: '/admin-products',
            name: 'Admin Products'
        }
    ]

    const RightNavItems = [
        {
            path: '/login',
            name: 'Login'
        },
        {
            path: '/signup',
            name: 'Signup'
        }
    ]

    return (
        <header className="main-header">
            <nav className="nav-half left-nav-half">
                {LeftNavItems.map(leftNavItem=> {
                    return (
                        <a className="nav-item" onClick={()=> navigate(leftNavItem.path)}>{leftNavItem.name}</a>
                    )
                })}
            </nav>
            <div className="nav-half right-nav-half">
                {RightNavItems.map(item=> {
                    return <a className="nav-item" onClick = {() => navigate(item.path)}>{item.name}</a>      
                })}
            </div>
        </header>
  );
}

export default Navigation;