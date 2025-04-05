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
        message: "Failed to load promotions",
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
            message: `This promotion is currently in use and cannot be deleted (${errorData.orderCount} orders)`,
            severity: "error",
          });
        } else {
          throw new Error(errorData.message || "Failed to delete promotion");
        }
      } else {
        await fetchPromotions();
        setSnackbar({
          open: true,
          message: "Promotion successfully deleted",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete promotion",
        severity: "error",
      });
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
        throw new Error(
          currentPromotion
            ? "Failed to update promotion"
            : "Failed to add promotion"
        );
      }

      await fetchPromotions();
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: currentPromotion
          ? "Promotion successfully updated"
          : "Promotion successfully added",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving promotion:", error);
      setSnackbar({
        open: true,
        message: currentPromotion
          ? "Failed to update promotion"
          : "Failed to add promotion",
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
        <Typography variant="h4">Promotion Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPromotion}
        >
          Add Promotion
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Discount Percentage</TableCell>
                <TableCell>Minimum Order</TableCell>
                <TableCell>Auto Apply</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No promotions found
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
                        <Chip label="Yes" color="primary" size="small" />
                      ) : (
                        <Chip label="No" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.createdAt).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditPromotion(promotion)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeletePrompt(promotion)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentPromotion ? "Edit Promotion" : "Add Promotion"}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            margin="dense"
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            helperText={formErrors.description && "Description is required"}
          />

          <TextField
            margin="dense"
            fullWidth
            label="Discount Percentage"
            name="discountPercentage"
            type="number"
            value={formData.discountPercentage}
            onChange={handleInputChange}
            error={formErrors.discountPercentage}
            helperText={
              formErrors.discountPercentage &&
              "Discount must be between 0 and 100%"
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />

          <TextField
            margin="dense"
            fullWidth
            label="Minimum Order"
            name="minimumOrder"
            type="number"
            value={formData.minimumOrder}
            onChange={handleInputChange}
            error={formErrors.minimumOrder}
            helperText={
              formErrors.minimumOrder && "Minimum order must be positive"
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
                checked={formData.isAutoApplied}
                onChange={handleInputChange}
                name="isAutoApplied"
                color="primary"
              />
            }
            label="Automatically apply this promotion"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this promotion?
          </Typography>
          {promotionToDelete && (
            <Box mt={2}>
              <Typography variant="body2" fontWeight="bold">
                {promotionToDelete.description}
              </Typography>
              <Typography variant="body2">
                Discount: {promotionToDelete.discountPercentage}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePromotion}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
