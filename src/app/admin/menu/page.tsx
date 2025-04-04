"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { Category, MenuItem } from "@/types/restaurant";
import { formatPrice } from "@/utils/format";

export default function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
  });
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    isAvailable: true,
    image: "",
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      setLoading(false);
    }
  };

  const handleAddItem = (categoryId: string) => {
    setEditItem(null);
    setEditCategoryId(categoryId);
    setFormData({
      name: "",
      description: "",
      price: 0,
      isAvailable: true,
      image: "",
    });
    setDialogOpen(true);
  };

  const handleEditItem = (categoryId: string, item: MenuItem) => {
    setEditItem(item);
    setEditCategoryId(categoryId);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    if (!confirm("確定要刪除此項目嗎？")) return;

    try {
      const res = await fetch(
        `/api/admin/menu?categoryId=${categoryId}&itemId=${itemId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete item");
      fetchMenu();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editItem ? "PUT" : "POST";
      const res = await fetch("/api/admin/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editCategoryId,
          item: {
            ...formData,
            id: editItem?.id,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save item");
      setDialogOpen(false);
      fetchMenu();
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setCategoryFormData({ name: "" });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditCategory(category);
    setCategoryFormData({ name: category.name });
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editCategory ? "PUT" : "POST";
      const res = await fetch("/api/admin/menu/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCategory?.id,
          ...categoryFormData,
        }),
      });
      if (!res.ok) throw new Error("Failed to save category");
      setCategoryDialogOpen(false);
      fetchMenu();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  if (loading) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">菜單管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          新增分類
        </Button>
      </Stack>

      {categories.map((category) => (
        <Accordion key={category.id} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              "& .MuiAccordionSummary-content": {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
            }}
          >
            <Typography variant="h6">{category.name}</Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditCategory(category);
              }}
            >
              <EditIcon />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddItem(category.id)}
              >
                新增項目
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>名稱</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>價格</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>HK$ {formatPrice(item.price)}</TableCell>
                      <TableCell>
                        {item.isAvailable ? "供應中" : "已下架"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditItem(category.id, item)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteItem(category.id, item.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
      >
        <form onSubmit={handleCategorySubmit}>
          <DialogTitle>{editCategory ? "編輯分類" : "新增分類"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="分類名稱"
              fullWidth
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  name: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoryDialogOpen(false)}>取消</Button>
            <Button type="submit" variant="contained">
              儲存
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editItem ? "編輯項目" : "新增項目"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="名稱"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="描述"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="價格"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
            />
            <TextField
              margin="dense"
              label="圖片網址"
              fullWidth
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              helperText="請輸入圖片的URL地址"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                />
              }
              label="供應中"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button type="submit" variant="contained">
              儲存
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
