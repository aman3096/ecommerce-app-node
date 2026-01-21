import { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
    const [ data, setData ] = useState([]);
    useEffect(()=>{
        async() => {
            const data = await axios.get("http://localhost:4000/api/v2/products?page=1");
            setData(data);
        };
    }, [])
  return (
    <div>
      <h2>Products Page</h2>
      {JSON.stringify(data)}
    </div>
    );
}

export default Products;