import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const discount = 0;

const price = 149 * (discount || 10);

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const { data } = await api.get<Product[]>('/products');
      
      setProducts(data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price),
        })))
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    return addProduct(id);
  }

  const cartItemsAmount = cart.reduce<CartItemsAmount>((sumAmount, product) => {
    if(sumAmount){
      sumAmount[product.id] = product.amount;  
    }
    return sumAmount;
  }, {})

 

  return (
    <ProductList>
      {products.map(product => (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{formatPrice(product.price)}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] ?? 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
      ))}
    </ProductList>
  );
};

export default Home;
