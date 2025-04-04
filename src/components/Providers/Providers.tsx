"use client";

import { ReactNode } from "react";
import { SnackbarProvider } from "notistack";
import { CartProvider } from "@/contexts/CartContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <CartProvider>{children}</CartProvider>
    </SnackbarProvider>
  );
}
