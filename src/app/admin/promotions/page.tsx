"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Tooltip,
  Stack,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface Promotion {
  id: string;
  description: string;
  discountPercentage: number;
  minimumOrder: number;
  isAutoApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    discountPercentage: 0,
    minimumOrder: 0,
    isAutoApplied: false,
  });
  const [formErrors, setFormErrors] = useState({
    description: false,
    discountPercentage: false,
    minimumOrder: false,
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(
    null
  );

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/promotions");
      if (!response.ok) throw new Error("Failed to fetch promotions");
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setSnackbar({
        open: true,
        message: "優惠數據載入失敗",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // For Switch component
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // For number inputs
    if (name === "discountPercentage" || name === "minimumOrder") {
      const numValue = Number(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));

      // Validate discount percentage (0-100)
      if (name === "discountPercentage") {
        setFormErrors((prev) => ({
          ...prev,
          [name]: numValue < 0 || numValue > 100 || isNaN(numValue),
        }));
      }

      // Validate minimum order (must be positive)
      if (name === "minimumOrder") {
        setFormErrors((prev) => ({
          ...prev,
          [name]: numValue < 0 || isNaN(numValue),
        }));
      }
      return;
    }

    // For text inputs
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate description (not empty)
    if (name === "description") {
      setFormErrors((prev) => ({ ...prev, [name]: !value.trim() }));
    }
  };

  const handleAddPromotion = () => {
    setCurrentPromotion(null);
    setFormData({
      description: "",
      discountPercentage: 10,
      minimumOrder: 100,
      isAutoApplied: true,
    });
    setFormErrors({
      description: false,
      discountPercentage: false,
      minimumOrder: false,
    });
    setOpenDialog(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      description: promotion.description,
      discountPercentage: promotion.discountPercentage,
      minimumOrder: promotion.minimumOrder,
      isAutoApplied: promotion.isAutoApplied,
    });
    setFormErrors({
      description: false,
      discountPercentage: false,
      minimumOrder: false,
    });
    setOpenDialog(true);
  };

  const handleDeletePrompt = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/promotions/${promotionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setSnackbar({
            open: true,
            message: `此優惠正在被使用中，無法刪除 (${errorData.orderCount} 個訂單)`,
            severity: "error",
          });
        } else {
          throw new Error(errorData.message || "刪除優惠失敗");
        }
      } else {
        await fetchPromotions();
        setSnackbar({
          open: true,
          message: "優惠已成功刪除",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      setSnackbar({ open: true, message: "刪除優惠失敗", severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const errors = {
      description: !formData.description.trim(),
      discountPercentage:
        formData.discountPercentage < 0 || formData.discountPercentage > 100,
      minimumOrder: formData.minimumOrder < 0,
    };

    setFormErrors(errors);

    if (
      errors.description ||
      errors.discountPercentage ||
      errors.minimumOrder
    ) {
      return;
    }

    try {
      let response;

      if (currentPromotion) {
        // Update existing promotion
        response = await fetch(`/api/admin/promotions/${currentPromotion.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new promotion
        response = await fetch("/api/admin/promotions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(currentPromotion ? "更新優惠失敗" : "新增優惠失敗");
      }

      await fetchPromotions();
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: currentPromotion ? "優惠已成功更新" : "優惠已成功新增",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving promotion:", error);
      setSnackbar({
        open: true,
        message: currentPromotion ? "更新優惠失敗" : "新增優惠失敗",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">優惠管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPromotion}
        >
          新增優惠
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>描述</TableCell>
                <TableCell>折扣百分比</TableCell>
                <TableCell>最低消費</TableCell>
                <TableCell>自動套用</TableCell>
                <TableCell>創建時間</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    載入中...
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    沒有找到優惠
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>{promotion.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${promotion.discountPercentage}%`}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      HK$ {promotion.minimumOrder.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {promotion.isAutoApplied ? (
                        <Chip label="是" color="primary" size="small" />
                      ) : (
                        <Chip label="否" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.createdAt).toLocaleString("zh-HK")}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="編輯">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditPromotion(promotion)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="刪除">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePrompt(promotion)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Promotion Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{currentPromotion ? "編輯優惠" : "新增優惠"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} noValidate>
            <TextField
              margin="dense"
              label="優惠描述"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              required
              error={formErrors.description}
              helperText={formErrors.description ? "請輸入有效的優惠描述" : ""}
              placeholder="例如: 滿$100減$20"
            />
            <TextField
              margin="dense"
              label="折扣百分比"
              name="discountPercentage"
              type="number"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              fullWidth
              required
              error={formErrors.discountPercentage}
              helperText={
                formErrors.discountPercentage ? "折扣必須在 0-100% 之間" : ""
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <TextField
              margin="dense"
              label="最低消費"
              name="minimumOrder"
              type="number"
              value={formData.minimumOrder}
              onChange={handleInputChange}
              fullWidth
              required
              error={formErrors.minimumOrder}
              helperText={
                formErrors.minimumOrder ? "最低消費必須大於或等於0" : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">HK$</InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  name="isAutoApplied"
                  checked={formData.isAutoApplied}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="自動套用優惠"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <Typography>
            你確定要刪除優惠 "{promotionToDelete?.description}"
            嗎？此操作無法撤銷。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleDeletePromotion}
            color="error"
            variant="contained"
          >
            刪除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
