import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const AddProduct = ({product}) => {
  const editing = false;
  const navigate = useNavigate();
  const [title, setTitle] = useState(editing ? product?.title: "");
  // const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(editing ? product?.price: "");
  const [description, setDescription] = useState(editing ? product?.description : "");
  const [error, setError] = useState("");

  const handleTitleChange = (e) => { 
      e.preventDefault();
      setTitle(e.target.value);
  }
  const handlePriceChange = (e) => { 
      e.preventDefault();
      setPrice(e.target.value);
  }
  const handleDescriptionChange = (e) => {
      e.preventDefault();
      setDescription(e.target.value);
  }

  // const handleFileChange = (e) => { - for image ssr
  //   e.preventDefault();
  //   setFile(e.target.files[0]);
  // }
  const handleImageChange = (e) => {
    e.preventDefault();
    setImage(e.target.value);
  }

  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    // formData.append('image', file); - for image ssr
    formData.append('image', image);
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    
    const data = await axios.post(`${BACKEND_URL}/api/v2/add-product`, formData);
    if(data.status!=202) {
      setError("Unable to create the product");
    } else {
      navigate('/products', { replace: true });
    }
  }
  return (
    <div className="add-product">
        <form className="product-form" onSubmit={submitForm} method="POST" encType="multipart/form-data">
            <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" id="title" value={title} onChange={(e)=>handleTitleChange(e)}/>
            </div>
             <div className="form-control">
                <label htmlFor="image">Image</label>
                {/* <input 
                    type="file" 
                    onChange={handleFileChange}
                    name="image"
                    accept="image/*"
                    id="image" /> */}
                <input 
                    type="text" 
                    onChange={handleImageChange}
                    name="image"
                    id="image" />
            </div>
            <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" name="price" id="price" step="0.01" value={price} onChange={(e)=>handlePriceChange(e)}/>
            </div>
            <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" rows="5" value={description} onChange={(e)=>handleDescriptionChange(e)}/>
            </div>
            {editing &&
                <input type="hidden" value={product?._id} name="productId"/>
            }

            <input type="hidden" name="_csrf" value="<%= csrfToken %>"/>
            <button className="btn" type="submit">{editing?"Update Product": "Add Product"} </button>
        </form>
        {error.length? error: ""}
    </div>
    );
}

export default AddProduct;