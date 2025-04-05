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
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
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
}

interface FieldProps {
  field: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    value: string | number | undefined;
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

export function RestaurantProfileForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, reset } = useForm<RestaurantProfile>();

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Basic Information */}
        <Box>
          <Typography variant="h6" gutterBottom>
            基本資料
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "餐廳名稱為必填" }}
            render={({ field, fieldState }: FieldProps) => (
              <TextField
                {...field}
                label="餐廳名稱"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            rules={{ required: "聯絡電話為必填" }}
            render={({ field, fieldState }: FieldProps) => (
              <TextField
                {...field}
                label="聯絡電話"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="address"
            control={control}
            rules={{ required: "地址為必填" }}
            render={({ field, fieldState }: FieldProps) => (
              <TextField
                {...field}
                label="地址"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="description"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="餐廳簡介"
                fullWidth
                multiline
                rows={4}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="email"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="電郵地址" fullWidth />
            )}
          />
        </Box>

        {/* Business Settings */}
        <Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            營業設定
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="maxBookingDays"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="最長預訂天數"
                type="number"
                fullWidth
              />
            )}
          />

          <Controller
            name="maxBookingPerSlot"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="每時段最多訂位數"
                type="number"
                fullWidth
              />
            )}
          />

          <Controller
            name="maxTableSize"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="最大餐桌人數"
                type="number"
                fullWidth
              />
            )}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="currency"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="貨幣" fullWidth />
            )}
          />

          <Controller
            name="taxRate"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="稅率 (%)"
                type="number"
                fullWidth
                inputProps={{ step: "0.1" }}
              />
            )}
          />

          <Controller
            name="serviceCharge"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="服務費 (%)"
                type="number"
                fullWidth
                inputProps={{ step: "0.1" }}
              />
            )}
          />
        </Box>

        {/* Social Media */}
        <Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            社交媒體
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="facebook"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="Facebook 連結" fullWidth />
            )}
          />

          <Controller
            name="instagram"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="Instagram 連結" fullWidth />
            )}
          />
        </Box>

        {/* Images */}
        <Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            圖片設定
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="logoUrl"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="Logo 圖片連結" fullWidth />
            )}
          />

          <Controller
            name="bannerUrl"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="Banner 圖片連結" fullWidth />
            )}
          />
        </Box>

        {/* SEO Settings */}
        <Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            SEO 設定
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Controller
            name="metaTitle"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField {...field} label="Meta 標題" fullWidth />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="metaDescription"
            control={control}
            render={({ field }: FieldProps) => (
              <TextField
                {...field}
                label="Meta 描述"
                fullWidth
                multiline
                rows={2}
              />
            )}
          />
        </Box>

        {/* Form Actions */}
        <Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "儲存設定"}
            </Button>
          </Box>
        </Box>

        {/* Messages */}
        {error && (
          <Box>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {success && (
          <Box>
            <Alert severity="success">設定已成功更新</Alert>
          </Box>
        )}
      </Box>
    </form>
  );
}
