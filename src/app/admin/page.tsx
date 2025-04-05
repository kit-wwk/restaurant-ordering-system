"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { ShoppingCart, AttachMoney, Event, People } from "@mui/icons-material";
import { formatPrice } from "@/utils/format";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: string;
  }>;
}

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  preparing: "info",
  ready: "success",
  completed: "success",
  cancelled: "error",
};

const orderStatusLabels: Record<string, string> = {
  pending: "待處理",
  confirmed: "已確認",
  preparing: "準備中",
  ready: "可取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const bookingStatusLabels: Record<string, string> = {
  pending: "待確認",
  confirmed: "已確認",
  cancelled: "已取消",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        總覽
      </Typography>
      <Box sx={{ display: "grid", gap: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {/* Statistics Cards */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ShoppingCart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總訂單</Typography>
              </Box>
              <Typography variant="h4">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總收入</Typography>
              </Box>
              <Typography variant="h4">
                HK$ {formatPrice(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總訂座</Typography>
              </Box>
              <Typography variant="h4">{stats.totalBookings}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總用戶</Typography>
              </Box>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Recent Orders */}
          <Paper
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              最近訂單
            </Typography>
            <TableContainer sx={{ flex: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>客戶</TableCell>
                    <TableCell>金額</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>時間</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>HK$ {formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={orderStatusLabels[order.status]}
                          color={statusColors[order.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString("zh-HK")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recent Bookings */}
          <Paper
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              最近訂座
            </Typography>
            <TableContainer sx={{ flex: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>客戶</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>時間</TableCell>
                    <TableCell>人數</TableCell>
                    <TableCell>狀態</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>{booking.numberOfPeople}</TableCell>
                      <TableCell>
                        <Chip
                          label={bookingStatusLabels[booking.status]}
                          color={statusColors[booking.status]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
