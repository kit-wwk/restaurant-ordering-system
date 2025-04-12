"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
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

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // If orderId is provided in URL, fetch specific order
        if (orderId) {
          const response = await fetch(`/api/orders/${orderId}`);
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
            items: data.items.map((item: any) => ({
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
          setSelectedOrder(processedData);
          setIsDialogOpen(true);
        } else {
          // Otherwise fetch all orders
          const response = await fetch("/api/orders");
          const data = await response.json();
          // Convert numeric fields to numbers for all orders
          const processedData = data.map((order: any) => ({
            ...order,
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            total: Number(order.total),
            items: order.items.map((item: any) => ({
              ...item,
              price: Number(item.price),
            })),
            promotion: order.promotion
              ? {
                  ...order.promotion,
                  minimumOrder: Number(order.promotion.minimumOrder),
                }
              : undefined,
          }));
          setOrders(processedData);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderId]);

  const handleOrderClick = (order: Order) => {
    // Ensure numeric fields are numbers
    const processedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
      promotion: order.promotion
        ? {
            ...order.promotion,
            minimumOrder: Number(order.promotion.minimumOrder),
          }
        : undefined,
    };
    setSelectedOrder(processedOrder);
    setIsDialogOpen(true);
  };

  const handleLookupOrder = async () => {
    if (!orderIdInput.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderIdInput.trim()}`);
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
        items: data.items.map((item: any) => ({
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
      setSelectedOrder(processedData);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch order"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string, format = "YYYY-MM-DD HH:mm") => {
    return dayjs(date).format(format);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Look up an order
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Order ID"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            onClick={handleLookupOrder}
            disabled={!orderIdInput.trim()}
          >
            Look Up
          </Button>
        </Stack>
      </Box>

      {orders.length === 0 ? (
        <Typography>No orders found</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Time</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      HK$ {order.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ORDER_STATUS_LABELS[order.status.toLowerCase()]}
                      color={statusColors[order.status.toLowerCase()]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOrderClick(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <DialogContent>
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                Order Details #{selectedOrder.id}
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle1">Order Information</Typography>
                <Typography>
                  Status:{" "}
                  <Chip
                    label={
                      ORDER_STATUS_LABELS[selectedOrder.status.toLowerCase()]
                    }
                    color={statusColors[selectedOrder.status.toLowerCase()]}
                    size="small"
                  />
                </Typography>
                <Typography>
                  Created: {formatDate(selectedOrder.createdAt)}
                </Typography>
                {selectedOrder.guestName && (
                  <Typography>Guest Name: {selectedOrder.guestName}</Typography>
                )}
                {selectedOrder.guestEmail && (
                  <Typography>
                    Guest Email: {selectedOrder.guestEmail}
                  </Typography>
                )}
                {selectedOrder.guestPhone && (
                  <Typography>
                    Guest Phone: {selectedOrder.guestPhone}
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {item.menuItem?.name}
                              {selectedOrder.promotion &&
                                item.price >=
                                  selectedOrder.promotion.minimumOrder && (
                                  <Chip
                                    label={`-${selectedOrder.promotion.discountPercentage}%`}
                                    color="success"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                            </Typography>
                            {item.menuItem?.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.menuItem.description}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5} alignItems="flex-end">
                            <Typography variant="body2">
                              HK$ {item.price.toFixed(2)}
                            </Typography>
                            {selectedOrder.promotion &&
                              item.price >=
                                selectedOrder.promotion.minimumOrder && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  Discounted Price: HK${" "}
                                  {(
                                    item.price *
                                    (1 -
                                      selectedOrder.promotion
                                        .discountPercentage /
                                        100)
                                  ).toFixed(2)}
                                </Typography>
                              )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          <Stack spacing={0.5} alignItems="flex-end">
                            <Typography variant="body2">
                              HK$ {(item.price * item.quantity).toFixed(2)}
                            </Typography>
                            {selectedOrder.promotion &&
                              item.price >=
                                selectedOrder.promotion.minimumOrder && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  Discounted Subtotal: HK${" "}
                                  {(
                                    item.price *
                                    item.quantity *
                                    (1 -
                                      selectedOrder.promotion
                                        .discountPercentage /
                                        100)
                                  ).toFixed(2)}
                                </Typography>
                              )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Subtotal</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>HK$ {selectedOrder.subtotal.toFixed(2)}</strong>
                      </TableCell>
                    </TableRow>
                    {selectedOrder.promotion && (
                      <>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 0 }}>
                            <Box
                              sx={{
                                p: 1,
                                bgcolor: "success.light",
                                borderRadius: 1,
                                my: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="success.contrastText"
                              >
                                Applied Discount:
                                {selectedOrder.promotion.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="success.contrastText"
                              >
                                Order Total HK${" "}
                                {selectedOrder.promotion.minimumOrder.toFixed(
                                  2
                                )}{" "}
                                or more gets{" "}
                                {selectedOrder.promotion.discountPercentage}%
                                off
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>
                              Discount (
                              {selectedOrder.promotion.discountPercentage}% off)
                            </strong>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "success.main" }}
                          >
                            <strong>
                              - HK$ {selectedOrder.discount.toFixed(2)}
                            </strong>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1">Total</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">
                          HK$ {selectedOrder.total.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
