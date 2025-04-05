"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useForm, Controller, FieldError } from "react-hook-form";

interface OpeningHours {
  [key: string]: { open: string; close: string } | null | undefined;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Promotion {
  id: string;
  discountPercentage: number;
  minimumOrder: number;
  description: string;
}

interface RestaurantProfile {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  openingHours: OpeningHours;
  facebook?: string;
  instagram?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  maxBookingDays: number;
  maxBookingPerSlot: number;
  maxTableSize: number;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  metaTitle?: string;
  metaDescription?: string;
  rating: number;
  totalReviews: number;
  licenseNumber?: string;
  promotions: Promotion[];
  categories: Category[];
}

interface FieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: string | number | null | undefined;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  };
}

interface OpeningHourFieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: string | null | undefined;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  };
}

type FieldType = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  value: string | number | null | undefined;
  name: string;
  ref: React.Ref<HTMLInputElement>;
};

const SafeTextField = ({
  field,
  ...props
}: {
  field: FieldType;
} & Omit<
  React.ComponentProps<typeof TextField>,
  "value" | "onChange" | "onBlur" | "name" | "ref"
>) => (
  <TextField
    {...field}
    {...props}
    value={field.value === null ? "" : field.value || ""}
  />
);

export function RestaurantProfileForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, reset } = useForm<RestaurantProfile>({
    defaultValues: {
      openingHours: {
        monday: { open: "", close: "" },
        tuesday: { open: "", close: "" },
        wednesday: { open: "", close: "" },
        thursday: { open: "", close: "" },
        friday: { open: "", close: "" },
        saturday: { open: "", close: "" },
        sunday: { open: "", close: "" },
      },
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/admin/restaurant-profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      reset(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load restaurant profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RestaurantProfile) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/admin/restaurant-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update restaurant profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        width: "100%",
        p: 3,
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Restaurant name is required" }}
                  render={({ field, fieldState }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Restaurant Name"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="licenseNumber"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Business License Number"
                      fullWidth
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Restaurant Description"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Contact Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone number is required" }}
                  render={({ field, fieldState }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Phone Number"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Email"
                      fullWidth
                      type="email"
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: "Address is required" }}
                  render={({ field, fieldState }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Address"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Business Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Business Settings
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Currency" fullWidth />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="taxRate"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Tax Rate (%)"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="serviceCharge"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Service Charge (%)"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Booking Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Settings
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="maxBookingDays"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Max Booking Days"
                      fullWidth
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="maxBookingPerSlot"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Max Bookings Per Slot"
                      fullWidth
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="maxTableSize"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Max Table Size"
                      fullWidth
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Opening Hours */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Opening Hours
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <Box
                  key={day}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Typography
                    sx={{ minWidth: 100, textTransform: "capitalize" }}
                  >
                    {day}
                  </Typography>
                  <Controller
                    name={`openingHours.${day}.open` as const}
                    control={control}
                    defaultValue=""
                    render={({ field }: OpeningHourFieldProps) => (
                      <SafeTextField
                        field={field}
                        label="Open"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                  <Typography>to</Typography>
                  <Controller
                    name={`openingHours.${day}.close` as const}
                    control={control}
                    defaultValue=""
                    render={({ field }: OpeningHourFieldProps) => (
                      <SafeTextField
                        field={field}
                        label="Close"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Social Media and Links */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Social Media and Links
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Website" fullWidth />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="facebook"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Facebook" fullWidth />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Instagram" fullWidth />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Images */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="logoUrl"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Logo URL" fullWidth />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="bannerUrl"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Banner URL" fullWidth />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* SEO */}
          <Box>
            <Typography variant="h6" gutterBottom>
              SEO Settings
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <Controller
                  name="metaTitle"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField field={field} label="Meta Title" fullWidth />
                  )}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Controller
                  name="metaDescription"
                  control={control}
                  render={({ field }: FieldProps) => (
                    <SafeTextField
                      field={field}
                      label="Meta Description"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </Box>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Restaurant profile updated successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </form>
    </Box>
  );
}
