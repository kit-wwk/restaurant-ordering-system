"use client";

import { ReactNode, useState } from "react";
import CartSidebar from "../Cart/CartSidebar";
import { CartSidebarContext } from "@/contexts/CartSidebarContext";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartSidebarContext.Provider value={{ openCart }}>
      {children}
      <CartSidebar open={isCartOpen} onClose={closeCart} />
    </CartSidebarContext.Provider>
  );
}
