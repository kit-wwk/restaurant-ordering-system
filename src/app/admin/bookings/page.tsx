"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Pagination,
  Chip,
  Typography,
  InputLabel,
  MenuItem,
  Box,
  TablePagination,
  Select,
  TextField,
  FormControl,
} from "@mui/material";
import type { AdminBooking } from "@/app/api/admin/bookings/route";

interface PaginationData {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bookings?page=${page}`);
      const data = await response.json();
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh the current page
        fetchBookings(pagination.currentPage);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    fetchBookings(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "primary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";
      case "PENDING":
        return "Pending";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <Typography variant="h4" gutterBottom>
        Booking Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>
                  {booking.customerName || "Unnamed Customer"}
                </TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.numberOfPeople}</TableCell>
                <TableCell>
                  <FormControl size="small" style={{ minWidth: "100px" }}>
                    <Select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(booking.id, e.target.value as string)
                      }
                      color="primary"
                      displayEmpty
                      native
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell
                  style={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {booking.notes}
                </TableCell>
                <TableCell>
                  {booking.status === "PENDING" && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() =>
                          handleStatusChange(booking.id, "CONFIRMED")
                        }
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleStatusChange(booking.id, "CANCELLED")
                        }
                      >
                        Cancel
                      </Button>
                    </Stack>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() =>
                        handleStatusChange(booking.id, "CANCELLED")
                      }
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.currentPage}
          onChange={handlePageChange}
          shape="rounded"
          size="large"
        />
      </Stack>
    </div>
  );
}
