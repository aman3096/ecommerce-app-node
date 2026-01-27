import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const Products = () => {
    const [ data, setData ] = useState([]);
    useEffect(()=>{
      axios.get(`${BACKEND_URL}/api/v2/products?page=1`)
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
                          <a href={`/products/${product._id}`} className="btn">Details</a>
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