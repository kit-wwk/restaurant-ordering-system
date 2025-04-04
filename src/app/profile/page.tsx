"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Avatar,
  Alert,
  Snackbar,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const {
    state: { user },
  } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    // Pre-fill form with user data
    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    }));
  }, [user, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "姓名不能為空";
    }

    if (!formData.email.trim()) {
      newErrors.email = "電郵地址不能為空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "請輸入有效的電郵地址";
    }

    if (formData.phone && !/^[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "請輸入有效的8位電話號碼";
    }

    if (isEditing) {
      if (
        !formData.currentPassword &&
        (formData.newPassword || formData.confirmPassword)
      ) {
        newErrors.currentPassword = "更改密碼時需要輸入目前密碼";
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = "新密碼必須至少8個字符";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "確認密碼與新密碼不符";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: "個人資料已成功更新",
          severity: "success",
        });
        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error("更新失敗");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "更新個人資料時發生錯誤",
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4, mt: 2 }}>
        <Stack spacing={4}>
          <Typography variant="h4" align="center" gutterBottom>
            個人資料
          </Typography>

          <Box display="flex" justifyContent="center">
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 120, height: 120 }}
            >
              {user.name?.[0]}
            </Avatar>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="center">
                <TextField
                  fullWidth
                  label="姓名"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="電郵地址"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.email}
                helperText={errors.email}
                required
              />

              <TextField
                fullWidth
                label="電話號碼"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.phone}
                helperText={errors.phone || "請輸入8位數字電話號碼"}
              />

              {isEditing && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    更改密碼
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="目前密碼"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                      error={!!errors.currentPassword}
                      helperText={errors.currentPassword}
                    />

                    <TextField
                      fullWidth
                      label="新密碼"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      error={!!errors.newPassword}
                      helperText={errors.newPassword || "密碼必須至少8個字符"}
                    />

                    <TextField
                      fullWidth
                      label="確認新密碼"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                    />
                  </Stack>
                </Box>
              )}

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      size="large"
                    >
                      取消
                    </Button>
                    <Button type="submit" variant="contained" size="large">
                      儲存
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    size="large"
                  >
                    編輯
                  </Button>
                )}
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
