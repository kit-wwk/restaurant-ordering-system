"use client";

import { createContext, useContext } from "react";

interface CartSidebarContextType {
  openCart: () => void;
}

export const CartSidebarContext = createContext<CartSidebarContextType | null>(
  null
);

export function useCartSidebar() {
  const context = useContext(CartSidebarContext);
  if (!context) {
    throw new Error("useCartSidebar must be used within a CartSidebarProvider");
  }
  return context;
}
