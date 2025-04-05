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
      newErrors.name = "Name cannot be empty";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address cannot be empty";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 8-digit phone number";
    }

    if (isEditing) {
      if (
        !formData.currentPassword &&
        (formData.newPassword || formData.confirmPassword)
      ) {
        newErrors.currentPassword =
          "Current password is required to change password";
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword =
          "Confirm password does not match new password";
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
          message: "Profile updated successfully",
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
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Error updating profile",
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
            My Profile
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
                  label="Name"
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
                label="Email Address"
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
                label="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.phone}
                helperText={
                  errors.phone || "Please enter an 8-digit phone number"
                }
              />

              {isEditing && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Change Password
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Current Password"
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
                      label="New Password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      error={!!errors.newPassword}
                      helperText={
                        errors.newPassword ||
                        "Password must be at least 8 characters"
                      }
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                {isEditing ? (
                  <>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Stack>
          </form>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
