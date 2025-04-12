"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/zh-hk";

// Initialize dayjs locale
dayjs.locale("zh-hk");

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
}

interface Order {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  promotion?: {
    id: string;
    discountPercentage: number;
    description: string;
    minimumOrder: number;
  };
}

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  preparing: "info",
  ready: "success",
  completed: "success",
  cancelled: "error",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        // Convert numeric fields to numbers
        const processedData = {
          ...data,
          subtotal: Number(data.subtotal),
          discount: Number(data.discount),
          total: Number(data.total),
          items: data.items.map((item: OrderItem) => ({
            ...item,
            price: Number(item.price),
          })),
          promotion: data.promotion
            ? {
                ...data.promotion,
                minimumOrder: Number(data.promotion.minimumOrder),
              }
            : undefined,
        };
        setOrder(processedData);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const formatDate = (date: string, format = "YYYY-MM-DD HH:mm") => {
    return dayjs(date).format(format);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>
          {error || "Order not found"}
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Order #{order.id}</Typography>
        <Button variant="outlined" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Information
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={ORDER_STATUS_LABELS[order.status.toLowerCase()]}
              color={statusColors[order.status.toLowerCase()]}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created Time
            </Typography>
            <Typography>{formatDate(order.createdAt)}</Typography>
          </Box>
          {order.guestName && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Guest Name
              </Typography>
              <Typography>{order.guestName}</Typography>
            </Box>
          )}
          {order.guestEmail && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Guest Email
              </Typography>
              <Typography>{order.guestEmail}</Typography>
            </Box>
          )}
          {order.guestPhone && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Guest Phone
              </Typography>
              <Typography>{order.guestPhone}</Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Stack spacing={2}>
          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="subtitle1">
                    {item.menuItem.name}
                    {order.promotion &&
                      item.price >= order.promotion.minimumOrder && (
                        <Chip
                          label={`-${order.promotion.discountPercentage}%`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                  </Typography>
                  {item.menuItem.description && (
                    <Typography variant="body2" color="text.secondary">
                      {item.menuItem.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1">
                    HK$ {item.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity}
                  </Typography>
                  <Typography variant="subtitle1">
                    Subtotal: HK$ {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>Subtotal</Typography>
            <Typography>HK$ {order.subtotal.toFixed(2)}</Typography>
          </Box>
          {order.promotion && (
            <>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "success.light",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="success.contrastText">
                  Applied Discount: {order.promotion.description}
                </Typography>
                <Typography variant="caption" color="success.contrastText">
                  Order Total HK$ {order.promotion.minimumOrder.toFixed(2)} or
                  more gets {order.promotion.discountPercentage}% off
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "success.main",
                }}
              >
                <Typography>
                  Discount ({order.promotion.discountPercentage}% off)
                </Typography>
                <Typography>- HK$ {order.discount.toFixed(2)}</Typography>
              </Box>
            </>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 2,
            }}
          >
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">HK$ {order.total.toFixed(2)}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
