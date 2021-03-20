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
      const productExistInCart = cart.find(product => product.id === productId);
      const {data: product} = await api.get<Product>(`/products/${productId}`);
      const {data: stock} =  await api.get<Stock>(`/stock/${ productId}`);

      console.log(productExistInCart);
      
      if(product){

        if(productExistInCart){

          if (productExistInCart.amount < stock.amount){
            const newCart = cart.map((item) => {
              if(item.id === productId){
                item.amount += 1;
              }

              return item;
            });
            setCart(newCart);

          } else{
            toast.error('Quantidade solicitada fora de estoque');
          }

        } else {
          if(product){
            const newCart = [...cart, {...product, amount: 1}];
            setCart(newCart);
          } else{
            toast.error('Erro na adição do produto');
          }
      }
    } 
      
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

useEffect(()=>{
  localStorage.setItem('@RocketShoes:cart',JSON.stringify(cart));
},[cart]);

  const removeProduct = async (productId: number) => {
    try {
      // TODO
      const productIndex = cart.findIndex(product => product.id === productId);
      if(productIndex !== -1){
        const productRemovedFromCart = cart.filter(product => product.id !== productId);
        setCart(productRemovedFromCart);
      } else {
        throw new Error('Erro na remoção do produto');
      }

    } catch {
      // TODO
      toast.error('Não foi possível remover o produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount}: UpdateProductAmount) => {
    try {
      // TODO
      const {data: product} = await api.get<Product>(`/products/${productId}`);

      if(amount <= 0){
        toast.error('Não foi possivel atualizar a quantidade')
        return;
      }


      const {data} =  await api.get(`/stock/${productId}`);

      if(amount > data.amount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const amountData = {
        ...product,
        amount: amount,
      }

      setCart([...cart, amountData]);


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
