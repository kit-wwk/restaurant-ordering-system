"use client";

import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/format";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { state, dispatch } = useCart();
  const { state: authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: itemId });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id: itemId, quantity: newQuantity },
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (!authState.user) {
      enqueueSnackbar("請先登入後再下單", { variant: "error" });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format items for the API
      const formattedItems = state.items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      console.log("Submitting order with:", {
        userId: authState.user.id,
        itemsCount: formattedItems.length,
        items: formattedItems,
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authState.user.id,
          items: formattedItems,
        }),
      });

      const responseData = await response.json();
      console.log("Order response:", {
        status: response.status,
        data: responseData,
      });

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit order");
      }

      dispatch({ type: "CLEAR_CART" });
      onClose();
      enqueueSnackbar("訂單已成功提交！", { variant: "success" });
    } catch (error) {
      console.error("Error submitting order:", error);
      enqueueSnackbar(
        error instanceof Error ? error.message : "提交訂單時出錯，請稍後再試。",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 } },
      }}
    >
      <Box
        sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          你的訂購項目
        </Typography>

        {state.items.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            購物車是空的
          </Typography>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: "auto" }}>
              {state.items.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={item.name}
                    secondary={`HK$ ${formatPrice(item.price)}`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        {item.quantity === 1 ? <DeleteIcon /> : <RemoveIcon />}
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Box sx={{ pt: 2 }}>
              <Divider />
              <Box sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>小計</Typography>
                  <Typography>HK$ {formatPrice(state.subtotal)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">總計</Typography>
                  <Typography variant="h6">
                    HK$ {formatPrice(state.total)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "提交中..." : "提交訂單"}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
