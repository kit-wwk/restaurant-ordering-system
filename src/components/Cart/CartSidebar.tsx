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
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/format";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { state, dispatch } = useCart();
  const { state: authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("/api/admin/restaurant-profile");
        const data = await res.json();
        if (data.promotions) {
          dispatch({ type: "UPDATE_PROMOTIONS", payload: data.promotions });
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    if (open) {
      fetchPromotions();
    }
  }, [open, dispatch]);

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

  const handlePlaceOrder = async () => {
    if (!authState.user) {
      enqueueSnackbar("Please log in before placing an order", {
        variant: "error",
      });
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
          promotionId: state.appliedPromotion?.id,
          subtotal: state.subtotal,
          discount: state.discount,
          total: state.total,
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

      enqueueSnackbar("Order submitted successfully!", { variant: "success" });
      dispatch({ type: "CLEAR_CART" });
      router.push("/orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : "Error submitting order, please try again later.",
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
        <Typography variant="h6" className="font-semibold p-4 border-b">
          Your Order Items
        </Typography>

        {state.items.length === 0 ? (
          <Box className="p-4 text-center text-gray-400">
            <Typography>Your cart is empty</Typography>
          </Box>
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

            <Box className="p-4 border-t">
              <Box className="flex justify-between mb-2">
                <Typography>Subtotal</Typography>
                <Typography>{formatPrice(state.total)}</Typography>
              </Box>

              {/* Discount */}
              {state.appliedPromotion && (
                <Box className="flex justify-between mb-2 text-green-600">
                  <Typography>
                    Discount ({state.appliedPromotion.discountPercentage}% off)
                  </Typography>
                  <Typography>
                    -{" "}
                    {formatPrice(
                      (state.total *
                        state.appliedPromotion.discountPercentage) /
                        100
                    )}
                  </Typography>
                </Box>
              )}

              <Box className="flex justify-between mt-4 text-lg font-bold">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {formatPrice(
                    state.appliedPromotion
                      ? state.total -
                          (state.total *
                            state.appliedPromotion.discountPercentage) /
                            100
                      : state.total
                  )}
                </Typography>
              </Box>

              {/* Applied Promotion */}
              {state.appliedPromotion && (
                <Box className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                  Best discount applied: {state.appliedPromotion.description}
                </Box>
              )}

              {/* Available Promotions */}
              {state.availablePromotions.length > 0 &&
                !state.appliedPromotion && (
                  <Box className="mt-4">
                    <Typography className="text-sm font-medium mb-2">
                      Available Promotions:
                    </Typography>
                    {state.availablePromotions.map((promo) => (
                      <Box
                        key={promo.id}
                        className="p-2 mb-2 border rounded-md text-sm flex flex-col"
                      >
                        <Typography className="text-sm font-medium">
                          {promo.description}
                        </Typography>
                        <Typography className="text-xs text-gray-500">
                          (Spend HK$ {formatPrice(promo.minimumOrder)} to get{" "}
                          {promo.discountPercentage}% off)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

              <Button onClick={() => onClose()}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlaceOrder}
                disabled={state.items.length === 0 || isSubmitting}
              >
                Place Order
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
