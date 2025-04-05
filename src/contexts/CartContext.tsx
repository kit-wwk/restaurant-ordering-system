"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import type { MenuItem, Promotion } from "@/types/restaurant";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  appliedPromotion: Promotion | null;
  discount: number;
  total: number;
  availablePromotions: Promotion[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_PROMOTIONS"; payload: Promotion[] }
  | { type: "CLEAR_CART" };

const findBestPromotion = (
  subtotal: number,
  promotions: Promotion[]
): Promotion | null => {
  // Filter promotions that meet minimum order
  const applicablePromotions = promotions.filter(
    (promo) => subtotal >= promo.minimumOrder
  );

  if (applicablePromotions.length === 0) {
    return null;
  }

  // Return the promotion with highest discount
  return applicablePromotions.reduce((best, current) =>
    current.discountPercentage > best.discountPercentage ? current : best
  );
};

const calculateTotals = (items: CartItem[], promotions: Promotion[] = []) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const bestPromotion = findBestPromotion(subtotal, promotions);
  const discount = bestPromotion
    ? (subtotal * bestPromotion.discountPercentage) / 100
    : 0;

  const total = subtotal - discount;

  return { subtotal, appliedPromotion: bestPromotion, discount, total };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.availablePromotions),
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.availablePromotions),
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.availablePromotions),
      };
    }

    case "UPDATE_PROMOTIONS": {
      return {
        ...state,
        availablePromotions: action.payload,
        ...calculateTotals(state.items, action.payload),
      };
    }

    case "CLEAR_CART":
      return {
        items: [],
        subtotal: 0,
        appliedPromotion: null,
        discount: 0,
        total: 0,
        availablePromotions: state.availablePromotions,
      };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  appliedPromotion: null,
  discount: 0,
  total: 0,
  availablePromotions: [],
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
