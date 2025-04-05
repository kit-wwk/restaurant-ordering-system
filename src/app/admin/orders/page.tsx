"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
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
  Chip,
  Stack,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/orders";
      const params = new URLSearchParams();

      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (startDate) {
        params.append("startDate", startDate.format("YYYY-MM-DD"));
      }
      if (endDate) {
        params.append("endDate", endDate.format("YYYY-MM-DD"));
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const formatDate = (date: string, format = "YYYY-MM-DD HH:mm") => {
    return dayjs(date).format(format);
  };

  if (loading) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        訂單管理
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          select
          label="訂單狀態"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStatusFilter(e.target.value)
          }
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="pending">待處理</MenuItem>
          <MenuItem value="confirmed">已確認</MenuItem>
          <MenuItem value="preparing">準備中</MenuItem>
          <MenuItem value="ready">可取餐</MenuItem>
          <MenuItem value="completed">已完成</MenuItem>
          <MenuItem value="cancelled">已取消</MenuItem>
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="開始日期"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            format="YYYY-MM-DD"
          />
          <DatePicker
            label="結束日期"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            format="YYYY-MM-DD"
          />
        </LocalizationProvider>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>訂單編號</TableCell>
              <TableCell>客戶名稱</TableCell>
              <TableCell>小計</TableCell>
              <TableCell>優惠</TableCell>
              <TableCell>總計</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.guestName || order.user?.name || "未命名客戶"}
                </TableCell>
                <TableCell>HK$ {order.subtotal.toFixed(2)}</TableCell>
                <TableCell>
                  {order.promotion ? (
                    <Stack spacing={0.5}>
                      <Chip
                        label={`-${order.promotion.discountPercentage}%`}
                        color="success"
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {order.promotion.description}
                        <br />
                        折扣金額：HK$ {order.discount.toFixed(2)}
                      </Typography>
                    </Stack>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    HK$ {order.total.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e: SelectChangeEvent<string>) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    size="small"
                  >
                    <MenuItem value="pending">待處理</MenuItem>
                    <MenuItem value="confirmed">已確認</MenuItem>
                    <MenuItem value="preparing">準備中</MenuItem>
                    <MenuItem value="ready">可取餐</MenuItem>
                    <MenuItem value="completed">已完成</MenuItem>
                    <MenuItem value="cancelled">已取消</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOrderClick(order)}
                  >
                    查看詳情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                訂單詳情 #{selectedOrder.id}
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle1">客戶資料</Typography>
                <Typography>
                  姓名：
                  {selectedOrder.guestName ||
                    selectedOrder.user?.name ||
                    "未命名客戶"}
                </Typography>
                <Typography>
                  電郵：
                  {selectedOrder.guestEmail || selectedOrder.user?.email || "-"}
                </Typography>
                <Typography>電話：{selectedOrder.guestPhone || "-"}</Typography>
                <Typography>
                  用戶ID：
                  {selectedOrder.userId || selectedOrder.user?.id || "-"}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                訂單項目
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>品項</TableCell>
                      <TableCell align="right">單價</TableCell>
                      <TableCell align="right">數量</TableCell>
                      <TableCell align="right">小計</TableCell>
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
                                  折扣後：HK${" "}
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
                                  折扣後：HK${" "}
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
                        <strong>小計</strong>
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
                                已使用優惠：
                                {selectedOrder.promotion.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="success.contrastText"
                              >
                                訂單滿 HK${" "}
                                {selectedOrder.promotion.minimumOrder.toFixed(
                                  2
                                )}{" "}
                                即減{" "}
                                {selectedOrder.promotion.discountPercentage}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>
                              折扣 ({selectedOrder.promotion.discountPercentage}
                              % off)
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
                        <Typography variant="subtitle1">總計</Typography>
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
          <Button onClick={() => setIsDialogOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
