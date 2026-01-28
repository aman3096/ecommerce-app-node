import { useLocation } from 'react-router-dom'

const ProductDetail = () => {
    const location = useLocation();
    const { state } = location || {}
    const product = state;
    console.log("product", location);
    return (
            <main class="centered">
                <h1>
                    {product?.title}
                </h1>
                <hr/>
                <div class="image">
                    <img src={product?.imageUrl} alt={product?.title}/>
                </div>
                <h2>{product?.price}</h2>
                <p>
                    {product?.description}
                </p>
                <form action="/cart" method="post">
                    {/* <input type="hidden" name="_csrf" value="<%= csrfToken %>"/> */}
                    <button class="btn" type="submit">Add to Cart</button>
                    <input type="hidden" name="productId" value={product._id} />
                </form>
                {/* <%- include('../includes/add-to-cart.ejs', {product: product}) %> */}
            </main>
    )
} 
export default ProductDetail;