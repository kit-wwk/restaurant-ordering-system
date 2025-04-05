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
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleTextChange("name")}
              fullWidth
              required
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={handleTextChange("email")}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Password"
              value={formData.password}
              onChange={handleTextChange("password")}
              fullWidth
              required
              type="password"
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={handleSelectChange}
              >
                <MenuItem value="ADMIN">Administrator</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="CUSTOMER">Customer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={handleTextChange("phone")}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
