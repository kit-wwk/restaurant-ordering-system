"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/zh-hk";

// Initialize dayjs locale
dayjs.locale("zh-hk");

interface Booking {
  id: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
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

export default function UserBookings() {
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: dayjs(),
    time: dayjs().hour(19).minute(0),
    numberOfPeople: 2,
  });

  const {
    state: { user },
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date.format("YYYY-MM-DD"),
          time: formData.time.format("HH:mm"),
          numberOfPeople: formData.numberOfPeople,
        }),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchBookings();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">我的訂座</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          新增訂座
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              <TableCell>時間</TableCell>
              <TableCell>人數</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
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
                  {mounted
                    ? new Date(booking.createdAt).toLocaleString("zh-HK")
                    : booking.createdAt}
                </TableCell>
                <TableCell>
                  {booking.status !== "cancelled" && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleCancel(booking.id)}
                    >
                      取消
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>新增訂座</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <DatePicker
                label="日期"
                value={formData.date}
                onChange={(newValue) =>
                  setFormData({ ...formData, date: newValue || dayjs() })
                }
                disablePast
              />
              <TimePicker
                label="時間"
                value={formData.time}
                onChange={(newValue) =>
                  setFormData({ ...formData, time: newValue || dayjs() })
                }
              />
              <TextField
                label="人數"
                type="number"
                value={formData.numberOfPeople}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfPeople: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1, max: 10 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>取消</Button>
            <Button type="submit" variant="contained">
              確認
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
