import React from 'react';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      
      const productExistsOnCart = cart.find(product => product.id === productId);
      const productExists = await api.get(`/products/${productId}`);

      if(!productExists){
        return;  
      }
      
      const currentAmount = productExistsOnCart ? productExistsOnCart.amount : 0;
      const stockProductAdded =  await api.get(`/stock/${productId}`);
     
      const amount = currentAmount + 1;

      // const productAdded = setCart(...cart, productFind); 
      const response =  await api.get(`/products/${productId}`);

      if(amount > stockProductAdded.data){
        toast.error('Quantidade solicitada maior que o estoque disponível!');
        return;
      }

      const data = {
        ...response.data,
        amount:1,
      }

      setCart([...cart, data]);

      
    } catch {
      // TODO
      toast.error('Não foi possível adicionar o produto')
    }
  };

  useEffect(() => {
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart]);


  const removeProduct = (productId: number) => {
    try {
      // TODO

        const productIndex = cart.findIndex(
          product => product.id === productId
        );

        if (productIndex >= 0) {
          cart.splice(productIndex, 1);
        }

      return setCart([...cart,]);

    } catch {
      // TODO
      toast.error('Não foi possível remover o produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
      toast.error('Não foi possível atualizar o produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
