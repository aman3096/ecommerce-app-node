import { useState } from "react";

const AddProduct = ({product}) => {
  const editing = false;
  const [title, setTitle] = useState(editing ? product?.title: "");
  const [price, setPrice] = useState(editing ? product?.price: "");
  const [description, setDescription] = useState(editing ? product?.description : "");

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
  return (
    <div>
        <form className="product-form" action={ editing ? "/admin/edit-product" : "/admin/add-product" } method="POST" encType="multipart/form-data">
            <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" id="title" value={title} onChange={(e)=>handleTitleChange(e)}/>
            </div>
             <div className="form-control">
                <label htmlFor="image">Image</label>
                <input 
                    type="file" 
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
    </div>
    );
}

export default AddProduct;