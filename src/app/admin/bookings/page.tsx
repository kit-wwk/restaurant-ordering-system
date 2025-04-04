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
  Stack,
  TextField,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
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
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchBookings();
  }, [startDate, endDate]); // Add back date dependencies since we're filtering on the server

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings...");

      // Build URL with date range parameters
      const url = new URL("/api/admin/bookings", window.location.origin);
      if (startDate) {
        url.searchParams.set("startDate", startDate.format("YYYY-MM-DD"));
      }
      if (endDate) {
        url.searchParams.set("endDate", endDate.format("YYYY-MM-DD"));
      }

      console.log("Fetching from URL:", url.toString());
      const response = await fetch(url);
      const data = await response.json();
      console.log("Raw API response:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bookings");
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array of bookings, got:", typeof data);
        throw new Error("Invalid data format received");
      }

      // Validate each booking object
      const validatedBookings = data.map((booking) => {
        if (
          !booking.id ||
          !booking.customerName ||
          !booking.date ||
          !booking.time ||
          !booking.status
        ) {
          console.error("Invalid booking object:", booking);
          throw new Error("Invalid booking data received");
        }
        return booking;
      });

      console.log("Validated bookings:", validatedBookings);
      setBookings(validatedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setSnackbar({
        open: true,
        message: "載入訂座資料失敗",
        severity: "error",
      });
      setBookings([]); // Reset bookings on error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      console.log("Updating booking status:", { bookingId, newStatus });
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }

      console.log("Status update response:", data);
      await fetchBookings();
      setSnackbar({
        open: true,
        message: "更新訂座狀態成功",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      setSnackbar({
        open: true,
        message: "更新訂座狀態失敗",
        severity: "error",
      });
    }
  };

  const handleConfirm = async (bookingId: string) => {
    await handleStatusChange(bookingId, "confirmed");
  };

  const handleCancel = async (bookingId: string) => {
    await handleStatusChange(bookingId, "cancelled");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredBookings = bookings.filter((booking) => {
    // Only filter by search term since date filtering is handled by the API
    return booking.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

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
          slotProps={{
            textField: {
              placeholder: "選擇開始日期",
            },
          }}
        />
        <DatePicker
          label="結束日期"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              placeholder: "選擇結束日期",
            },
          }}
        />
        <TextField
          label="搜尋客戶名稱"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Stack>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">沒有找到訂座記錄</Typography>
          </Box>
        ) : (
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
        )}
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
