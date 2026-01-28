import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const Products = () => {
    const [ data, setData ] = useState([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const openDetailedPage = (e, product)=>{
        e.preventDefault();
        const productId = product._id
        console.log("pid", product);
        navigate(`/products/${productId}`, { state: product })
    }
    useEffect(()=>{
      axios.get(`${BACKEND_URL}/api/v2/products?page=${page}`)
        .then(response => {
          console.log("data", response.data);
          setData(response.data.prods);
        })
        .catch(error => {
          console.error("Error fetching products:", error);
        });
    }, [])
  return (
    <div>
        {data.length > 0 ? (
          <div className="grid">
              { data.map (product =>  <article className="card product-item" id={product._id}>
                      <header className="card__header">
                          <h1 className="product__title">
                             {product.title}
                          </h1>
                      </header>
                      <div className="card__image">
                          <img className="product-img" src={product.imageUrl} alt={product.title}/>
                      </div>
                      <div className="card__content">
                          <h2 className="product__price">
                              ${product.price}
                          </h2>
                          <p className="product__description">
                              {product.description}
                          </p>
                      </div>
                      <div className="card__actions">
                          <button onClick={(e)=>openDetailedPage(e, product)} className="btn">Details</button>
                          {/* <% if (isAuthenticated) { %>
                              <%- include('../includes/add-to-cart.ejs', {product: product}) %>
                          <% } %> */}
                      </div>
                  </article>)} 
          </div>
          ) : <h2>No Products Found!</h2>}
    </div>
    );
}

export default Products;