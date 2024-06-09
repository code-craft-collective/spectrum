import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PURCHASE_API, FLIGHTS_ALL_API } from '../utils/endpoints';
import { Flight } from '../@types/flight';
import { CartContextType, CartItem } from '../@types/cartContext';

type CartContextProviderProps = {
  children: React.ReactNode;
};

const fetchingData = async (): Promise<Flight[]> => {
  const response = await axios.get(FLIGHTS_ALL_API);
  const returnedData = response.data;
  return returnedData;
};

const CartContext = createContext<CartContextType | null>(null);

function CartContextProvider(props: CartContextProviderProps) {
  const [initData, setInitData] = useState<Flight[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlightData = async () => {
      const returnedData = await fetchingData();
      setInitData(returnedData);
    };
    fetchFlightData();
  }, []);

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const ticket in cart) {
      if (cart[ticket] > 0) {
        const ticketData = initData.find((t) => t._id.toString() === ticket);
        if (ticketData) {
          totalAmount += ticketData.price * cart[ticket];
        }
      }
    }
    return totalAmount;
  };

  const getCartItems = () => {
    return Object.keys(cart)
      .map((id) => {
        const item = initData.find((f) => f._id.toString() === id);
        if (!item) return null;

        return {
          ...item,
          quantity: cart[id],
        };
      })
      .filter((item): item is CartItem => item !== null);
  };

  const addToCart = (id: string) => {
    setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };

      if (updatedCart[id] === 1) {
        delete updatedCart[id];
        return updatedCart;
      }

      updatedCart[id] -= 1;
      return updatedCart;
    });
  };

  const checkout = async (userId: string) => {
    const cartItems = getCartItems();
    const ticketInfo = {
      tickets: cartItems,
      userId,
    };
    try {
      const res = await axios.post(PURCHASE_API, ticketInfo);
      if (res.status === 200) {
        navigate('/confirmation');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const contextValue: CartContextType = {
    initData,
    cart,
    getCartItems,
    getTotalCartAmount,
    addToCart,
    removeFromCart,
    checkout,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {props.children}
    </CartContext.Provider>
  );
}

export { CartContext, CartContextProvider };
