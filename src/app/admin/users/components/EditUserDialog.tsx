import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  SelectChangeEvent,
} from "@mui/material";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleTextChange =
    (field: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>編輯用戶</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="名稱"
              value={formData.name}
              onChange={handleTextChange("name")}
              fullWidth
              required
            />
            <TextField
              label="電郵"
              value={formData.email}
              onChange={handleTextChange("email")}
              fullWidth
              required
              type="email"
            />
            <FormControl fullWidth required>
              <InputLabel>角色</InputLabel>
              <Select
                value={formData.role}
                label="角色"
                onChange={handleSelectChange}
              >
                <MenuItem value="ADMIN">管理員</MenuItem>
                <MenuItem value="STAFF">職員</MenuItem>
                <MenuItem value="CUSTOMER">客戶</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="電話"
              value={formData.phone}
              onChange={handleTextChange("phone")}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button type="submit" variant="contained">
            儲存
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
