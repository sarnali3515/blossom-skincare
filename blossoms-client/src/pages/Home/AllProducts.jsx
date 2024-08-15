import { useEffect, useState } from "react";

const AllProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data)
            });
    }, [])

    return (
        <div>
            {
                products.map(product => (
                    <p key={product._id}>{product.productName}</p>
                ))
            }
        </div>
    );
};

export default AllProducts;