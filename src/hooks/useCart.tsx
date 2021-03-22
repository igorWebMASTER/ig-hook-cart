import React from 'react';
import { createContext, ReactNode, useContext, useState } from 'react';
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
      const productExistInCart = cart.find(product => product.id === productId);
      const { data: stock } = await api.get<Stock>(`stock/${productId}`);
      
      if (!productExistInCart) {
        
        if (stock.amount > 0) {
          const { data: product } = await api.get<Product>(`products/${productId}`);
          setCart([...cart, { ...product, amount: 1 }])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, { ...product, amount: 1 }]));
          toast.success(`Produto adicionado ${product.title}`);

          return;
        }
      }  else{

        if (stock.amount > productExistInCart.amount) {
          const { data: product } = await api.get<Product>(`products/${productId}`);
          const updatedCart = cart.map(product => product.id === productId ? {
            ...product,
            amount: product.amount + 1
          } : product);

          setCart(updatedCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
          toast.success(`Produto adicionado ${product.title}`);
          return;
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };


  const removeProduct = async (productId: number) => {
    try {
      // TODO
      const productIndex = cart.findIndex(product => product.id === productId);
      
      if(productIndex !== -1){
        const updatedCart = cart.filter(item => item.id !== productId)
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      } else {
         toast.error('Erro na remoção do produto');;
      }

    } catch {
      // TODO
      toast.error('Erro ao remover produto do carrinho');
    }
  };  

  const updateProductAmount = async ({
    productId,
    amount}: UpdateProductAmount) => {
    try {
      // TODO  
      if (amount <= 0) return;

      const stockResponse = await api.get<Stock>(`stock/${productId}`);
      if (amount <= stockResponse.data.amount) {
        const newCart = cart.map((product) =>
          product.id === productId ? { ...product, amount } : { ...product }
        );
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

        setCart(newCart);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
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
