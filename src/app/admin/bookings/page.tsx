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
        return "已確認";
      case "PENDING":
        return "待確認";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
        >
          預訂管理
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
    <div style={{ padding: "40px" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        預訂管理
      </h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: 150 }}>客人</TableCell>
              <TableCell style={{ width: 120 }}>電話</TableCell>
              <TableCell style={{ width: 100 }}>日期</TableCell>
              <TableCell style={{ width: 80 }}>時間</TableCell>
              <TableCell style={{ width: 80 }}>人數</TableCell>
              <TableCell style={{ width: 200 }}>備註</TableCell>
              <TableCell style={{ width: 100 }}>狀態</TableCell>
              <TableCell style={{ width: 150 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>{booking.phoneNumber}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.numberOfPeople}</TableCell>
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
                  <Chip
                    label={getStatusText(booking.status)}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
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
                        確認
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleStatusChange(booking.id, "CANCELLED")
                        }
                      >
                        取消
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
                      取消
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
