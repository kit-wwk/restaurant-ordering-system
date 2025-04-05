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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/en";

// Initialize dayjs locale
dayjs.locale("en");

interface Booking {
  id: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "error",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "cancelled",
};

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
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
        >
          My Bookings
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">My Bookings</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add Booking
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>People</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
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
                    label={statusLabels[booking.status.toLowerCase()]}
                    color={statusColors[booking.status.toLowerCase()]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {mounted
                    ? new Date(booking.createdAt).toLocaleString("en-US")
                    : booking.createdAt}
                </TableCell>
                <TableCell>
                  {booking.status.toLowerCase() !== "cancelled" && (
                    <Stack direction="row" spacing={1}>
                      {booking.status.toLowerCase() === "pending" && (
                        <Button
                          variant="contained"
                          size="small"
                          color={
                            statusColors[
                              nextStatus[booking.status.toLowerCase()]
                            ]
                          }
                          onClick={() =>
                            handleStatusChange(booking.id, "confirmed")
                          }
                        >
                          {statusLabels["confirmed"]}
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Make a Reservation</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, minWidth: 300 }}>
              <Stack spacing={3}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({ ...prev, date: newValue }));
                    }
                  }}
                  disablePast
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TimePicker
                  label="Time"
                  value={formData.time}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({ ...prev, time: newValue }));
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TextField
                  label="Number of People"
                  type="number"
                  value={formData.numberOfPeople}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      setFormData((prev) => ({
                        ...prev,
                        numberOfPeople: value,
                      }));
                    }
                  }}
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Book
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
