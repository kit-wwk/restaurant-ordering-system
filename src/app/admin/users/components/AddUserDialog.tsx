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
import { useState } from "react";

interface NewUser {
  name: string;
  email: string;
  role: string;
  password: string;
  phone?: string;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newUser: NewUser) => void;
}

export default function AddUserDialog({
  open,
  onClose,
  onAdd,
}: AddUserDialogProps) {
  const [formData, setFormData] = useState<NewUser>({
    name: "",
    email: "",
    role: "CUSTOMER",
    password: "",
    phone: "",
  });

  const handleTextChange =
    (field: keyof NewUser) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    onAdd(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>新增用戶</DialogTitle>
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
            <TextField
              label="密碼"
              value={formData.password}
              onChange={handleTextChange("password")}
              fullWidth
              required
              type="password"
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
            新增
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
