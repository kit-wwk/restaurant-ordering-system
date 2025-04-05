"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import "dayjs/locale/zh-hk";

// Initialize dayjs locale
dayjs.locale("zh-hk");

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  confirmed: "info",
  preparing: "info",
  ready: "success",
  completed: "success",
  cancelled: "error",
};

const statusLabels: Record<string, string> = {
  pending: "待處理",
  confirmed: "已確認",
  preparing: "準備中",
  ready: "可取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
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
          onChange={(e) => setStatusFilter(e.target.value)}
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
              <TableCell>訂單金額</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[order.status]}
                    color={statusColors[order.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(order)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {nextStatus[order.status] && (
                      <Button
                        size="small"
                        variant="contained"
                        color={statusColors[nextStatus[order.status]]}
                        onClick={() =>
                          handleStatusUpdate(order.id, nextStatus[order.status])
                        }
                      >
                        {statusLabels[nextStatus[order.status]]}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>訂單詳情 #{selectedOrder.id}</DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography variant="subtitle1">客戶資料</Typography>
                <Typography>姓名：{selectedOrder.customerName}</Typography>
                <Typography>用戶ID：{selectedOrder.userId}</Typography>
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
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">${item.price}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${item.price * item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>總計</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>${selectedOrder.total}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={2}>
                <Typography variant="subtitle1">訂單狀態</Typography>
                <Chip
                  label={statusLabels[selectedOrder.status]}
                  color={statusColors[selectedOrder.status]}
                />
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle2">
                  建立時間：
                  {formatDate(selectedOrder.createdAt, "YYYY-MM-DD HH:mm:ss")}
                </Typography>
                <Typography variant="subtitle2">
                  更新時間：
                  {formatDate(selectedOrder.updatedAt, "YYYY-MM-DD HH:mm:ss")}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>關閉</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
