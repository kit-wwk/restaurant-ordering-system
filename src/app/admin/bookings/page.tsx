"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: "confirmed" | "pending" | "cancelled";
}

const statusLabels = {
  pending: "待確認",
  confirmed: "已確認",
  cancelled: "已取消",
};

const statusColors = {
  pending: "warning",
  confirmed: "success",
  cancelled: "error",
} as const;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [startDate, endDate]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    await handleStatusChange(bookingId, "confirmed");
  };

  const handleCancel = async (bookingId: string) => {
    await handleStatusChange(bookingId, "cancelled");
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        訂座管理
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
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
        <TextField
          label="搜尋客戶名稱"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>客戶名稱</TableCell>
              <TableCell>電話號碼</TableCell>
              <TableCell>日期</TableCell>
              <TableCell>時間</TableCell>
              <TableCell>人數</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>{booking.phoneNumber}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.numberOfPeople}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[booking.status]}
                    color={statusColors[booking.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {booking.status === "pending" && (
                    <>
                      <IconButton
                        onClick={() => handleConfirm(booking.id)}
                        color="success"
                        title="確認訂座"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleCancel(booking.id)}
                        color="error"
                        title="取消訂座"
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <IconButton
                      onClick={() => handleCancel(booking.id)}
                      color="error"
                      title="取消訂座"
                    >
                      <CancelIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
