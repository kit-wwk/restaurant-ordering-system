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
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Restaurant, AdminPanelSettings, Event } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/user";

export default function Header() {
  const {
    state: { user, isLoading },
    login,
    logout,
  } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    numberOfPeople: 1,
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
    setLoginOpen(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) throw new Error("Booking failed");
      setBookingOpen(false);
    } catch (error) {
      console.error("Booking error:", error);
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
              <Button color="inherit" onClick={() => setLoginOpen(true)}>
                登入
              </Button>
            )}
          </>
        )}
      </Toolbar>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)}>
        <form onSubmit={handleLoginSubmit}>
          <DialogTitle>登入</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="電郵地址"
              type="email"
              fullWidth
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="密碼"
              type="password"
              fullWidth
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginOpen(false)}>取消</Button>
            <Button type="submit">登入</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)}>
        <form onSubmit={handleBookingSubmit}>
          <DialogTitle>預訂座位</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="日期"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={bookingData.date}
              onChange={(e) =>
                setBookingData({ ...bookingData, date: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="時間"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={bookingData.time}
              onChange={(e) =>
                setBookingData({ ...bookingData, time: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="人數"
              type="number"
              fullWidth
              value={bookingData.numberOfPeople}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  numberOfPeople: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 1, max: 10 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingOpen(false)}>取消</Button>
            <Button type="submit">預訂</Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppBar>
  );
}
