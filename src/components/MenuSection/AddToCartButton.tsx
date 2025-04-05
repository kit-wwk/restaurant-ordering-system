"use client";

import { IconButton, Tooltip } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import type { MenuItem } from "@/types/restaurant";
import { useCart } from "@/contexts/CartContext";
import { useCartSidebar } from "@/contexts/CartSidebarContext";

interface AddToCartButtonProps {
  item: MenuItem;
}

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const { dispatch } = useCart();
  const { openCart } = useCartSidebar();

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: item });
    openCart();
  };

  return (
    <Tooltip title="Add to Cart">
      <IconButton
        color="primary"
        onClick={handleAddToCart}
        disabled={!item.isAvailable}
        size="small"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          "&:hover": {
            bgcolor: "primary.dark",
          },
          "&.Mui-disabled": {
            bgcolor: "action.disabledBackground",
          },
        }}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
}
