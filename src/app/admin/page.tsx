"use client";

import { useEffect, useState } from "react";
import {
  Grid,
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
    status: "pending" | "completed" | "cancelled";
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: "pending" | "confirmed" | "cancelled";
  }>;
}

const statusColors = {
  pending: "warning",
  completed: "success",
  confirmed: "success",
  cancelled: "error",
} as const;

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
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ShoppingCart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總訂單</Typography>
              </Box>
              <Typography variant="h4">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總訂座</Typography>
              </Box>
              <Typography variant="h4">{stats.totalBookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">總用戶</Typography>
              </Box>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              最近訂單
            </Typography>
            <TableContainer>
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
                          label={
                            order.status === "completed"
                              ? "已完成"
                              : order.status === "pending"
                              ? "處理中"
                              : "已取消"
                          }
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
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              最近訂座
            </Typography>
            <TableContainer>
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
                          label={
                            booking.status === "confirmed"
                              ? "已確認"
                              : booking.status === "pending"
                              ? "待確認"
                              : "已取消"
                          }
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
        </Grid>
      </Grid>
    </Box>
  );
}
