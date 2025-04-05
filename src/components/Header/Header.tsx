"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Restaurant, AdminPanelSettings, Event } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/user";

export default function Header() {
  const {
    state: { user, isLoading, error },
    login,
    logout,
    clearError,
  } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const getDefaultTime = () => {
    const now = new Date();
    // Get the next hour
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    // Format as HH:mm
    return now.getHours().toString().padStart(2, "0") + ":00";
  };

  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: getDefaultTime(),
    numberOfPeople: 2,
    notes: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });
  const [bookingErrors, setBookingErrors] = useState({
    date: "",
    time: "",
    numberOfPeople: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });
  const [bookingApiError, setBookingApiError] = useState("");

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Email validation
    if (!loginData.email) {
      newErrors.email = "電郵地址為必填";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "請輸入有效的電郵地址";
      isValid = false;
    }

    // Password validation
    if (!loginData.password) {
      newErrors.password = "密碼為必填";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  useEffect(() => {
    if (!error && !isLoading && user) {
      setLoginOpen(false);
      setLoginData({ email: "", password: "" });
      setFormErrors({ email: "", password: "" });
    }
  }, [error, isLoading, user]);

  const validateBookingForm = () => {
    let isValid = true;
    const newErrors = {
      date: "",
      time: "",
      numberOfPeople: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
    };

    // Guest information validation (only if user is not logged in)
    if (!user) {
      if (!bookingData.guestName) {
        newErrors.guestName = "姓名為必填";
        isValid = false;
      }

      if (!bookingData.guestPhone) {
        newErrors.guestPhone = "電話為必填";
        isValid = false;
      } else if (!/^[0-9]{8}$/.test(bookingData.guestPhone)) {
        newErrors.guestPhone = "請輸入有效的8位電話號碼";
        isValid = false;
      }

      // Email is optional, but validate format if provided
      if (
        bookingData.guestEmail &&
        !/\S+@\S+\.\S+/.test(bookingData.guestEmail)
      ) {
        newErrors.guestEmail = "請輸入有效的電郵地址";
        isValid = false;
      }
    }

    // Date validation
    if (!bookingData.date) {
      newErrors.date = "日期為必填";
      isValid = false;
    } else {
      const selectedDate = new Date(bookingData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "不能選擇過去的日期";
        isValid = false;
      }
    }

    // Time validation
    if (!bookingData.time) {
      newErrors.time = "時間為必填";
      isValid = false;
    }

    // Number of people validation
    if (!bookingData.numberOfPeople) {
      newErrors.numberOfPeople = "人數為必填";
      isValid = false;
    } else if (
      bookingData.numberOfPeople < 1 ||
      bookingData.numberOfPeople > 10
    ) {
      newErrors.numberOfPeople = "人數必須在1至10人之間";
      isValid = false;
    }

    setBookingErrors(newErrors);
    return isValid;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBookingForm()) {
      return;
    }

    try {
      setBookingApiError(""); // Clear any previous API errors
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bookingData.date,
          time: bookingData.time,
          numberOfPeople: bookingData.numberOfPeople,
          notes: bookingData.notes,
          userId: user?.id,
          guestName: !user ? bookingData.guestName : undefined,
          guestEmail: !user ? bookingData.guestEmail : undefined,
          guestPhone: !user ? bookingData.guestPhone : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "預訂失敗");
      }

      // Only close and reset if successful
      setBookingOpen(false);
      setBookingData({
        date: new Date().toISOString().split("T")[0],
        time: getDefaultTime(),
        numberOfPeople: 2,
        notes: "",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
      });
      setBookingErrors({
        date: "",
        time: "",
        numberOfPeople: "",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
      });
      setBookingApiError("");
    } catch (error) {
      console.error("Booking error:", error);
      setBookingApiError((error as Error).message);
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Restaurant sx={{ mr: 2 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            flexGrow: 1,
          }}
          onClick={() => router.push("/")}
        >
          <Typography variant="h6" component="div">
            餐廳點餐系統
          </Typography>
        </Box>

        <Button
          color="inherit"
          startIcon={<Event />}
          onClick={() => setBookingOpen(true)}
        >
          訂座
        </Button>

        {!isLoading && (
          <>
            {user ? (
              <>
                {user.role === UserRole.ADMIN && (
                  <Button
                    color="inherit"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => router.push("/admin")}
                    sx={{ mr: 2 }}
                  >
                    管理後台
                  </Button>
                )}
                <IconButton onClick={handleMenu} sx={{ ml: 2 }}>
                  <Avatar src={user.avatar} alt={user.name}>
                    {user.name[0]}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => router.push("/profile")}>
                    個人資料
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/bookings")}>
                    我的訂座
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      logout();
                    }}
                  >
                    登出
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => {
                  clearError();
                  setLoginOpen(true);
                }}
              >
                登入
              </Button>
            )}
          </>
        )}
      </Toolbar>

      {/* Login Dialog */}
      <Dialog
        open={loginOpen}
        onClose={() => {
          if (!isLoading) {
            clearError();
            setLoginOpen(false);
            setLoginData({ email: "", password: "" });
            setFormErrors({ email: "", password: "" });
          }
        }}
      >
        <form onSubmit={handleLoginSubmit}>
          <DialogTitle>登入</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="電郵地址"
              type="email"
              fullWidth
              value={loginData.email}
              onChange={(e) => {
                setLoginData({ ...loginData, email: e.target.value });
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: "" });
                }
              }}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="dense"
              label="密碼"
              type="password"
              fullWidth
              value={loginData.password}
              onChange={(e) => {
                setLoginData({ ...loginData, password: e.target.value });
                if (formErrors.password) {
                  setFormErrors({ ...formErrors, password: "" });
                }
              }}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setLoginOpen(false);
                setFormErrors({ email: "", password: "" });
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !loginData.email || !loginData.password}
            >
              登入
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingErrors({
            date: "",
            time: "",
            numberOfPeople: "",
            guestName: "",
            guestEmail: "",
            guestPhone: "",
          });
          setBookingApiError("");
        }}
      >
        <form onSubmit={handleBookingSubmit}>
          <DialogTitle>預訂座位</DialogTitle>
          <DialogContent>
            {bookingApiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingApiError}
              </Alert>
            )}
            <TextField
              margin="dense"
              label="姓名"
              fullWidth
              value={user ? user.name : bookingData.guestName}
              onChange={(e) => {
                setBookingData({
                  ...bookingData,
                  guestName: e.target.value,
                });
                if (bookingErrors.guestName) {
                  setBookingErrors({ ...bookingErrors, guestName: "" });
                }
              }}
              error={!!bookingErrors.guestName}
              helperText={bookingErrors.guestName}
              disabled={!!user}
            />
            <TextField
              margin="dense"
              label="電話"
              fullWidth
              value={user ? user.phone || "" : bookingData.guestPhone}
              onChange={(e) => {
                setBookingData({
                  ...bookingData,
                  guestPhone: e.target.value,
                });
                if (bookingErrors.guestPhone) {
                  setBookingErrors({ ...bookingErrors, guestPhone: "" });
                }
              }}
              error={!!bookingErrors.guestPhone}
              helperText={bookingErrors.guestPhone}
              disabled={!!user}
            />
            <TextField
              margin="dense"
              label="電郵地址（選填）"
              type="email"
              fullWidth
              value={user ? user.email : bookingData.guestEmail}
              onChange={(e) => {
                setBookingData({
                  ...bookingData,
                  guestEmail: e.target.value,
                });
                if (bookingErrors.guestEmail) {
                  setBookingErrors({ ...bookingErrors, guestEmail: "" });
                }
              }}
              error={!!bookingErrors.guestEmail}
              helperText={bookingErrors.guestEmail}
              disabled={!!user}
            />
            <TextField
              margin="dense"
              label="日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={bookingData.date}
              onChange={(e) => {
                setBookingData({ ...bookingData, date: e.target.value });
                if (bookingErrors.date) {
                  setBookingErrors({ ...bookingErrors, date: "" });
                }
              }}
              error={!!bookingErrors.date}
              helperText={bookingErrors.date}
            />
            <TextField
              margin="dense"
              label="時間"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={bookingData.time}
              onChange={(e) => {
                setBookingData({ ...bookingData, time: e.target.value });
                if (bookingErrors.time) {
                  setBookingErrors({ ...bookingErrors, time: "" });
                }
              }}
              error={!!bookingErrors.time}
              helperText={bookingErrors.time}
            />
            <TextField
              margin="dense"
              label="人數"
              type="number"
              fullWidth
              value={bookingData.numberOfPeople}
              onChange={(e) => {
                setBookingData({
                  ...bookingData,
                  numberOfPeople: parseInt(e.target.value),
                });
                if (bookingErrors.numberOfPeople) {
                  setBookingErrors({ ...bookingErrors, numberOfPeople: "" });
                }
              }}
              inputProps={{ min: 1, max: 10 }}
              error={!!bookingErrors.numberOfPeople}
              helperText={bookingErrors.numberOfPeople}
            />
            <TextField
              margin="dense"
              label="備註"
              multiline
              rows={4}
              fullWidth
              value={bookingData.notes}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  notes: e.target.value,
                })
              }
              placeholder="如有特別要求，請在此說明"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setBookingOpen(false);
                setBookingErrors({
                  date: "",
                  time: "",
                  numberOfPeople: "",
                  guestName: "",
                  guestEmail: "",
                  guestPhone: "",
                });
              }}
            >
              取消
            </Button>
            <Button type="submit">預訂</Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppBar>
  );
}
