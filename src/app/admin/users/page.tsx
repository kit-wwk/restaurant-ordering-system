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
  IconButton,
  Stack,
  TextField,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditUserDialog from "./components/EditUserDialog";
import AddUserDialog from "./components/AddUserDialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

interface NewUser {
  name: string;
  email: string;
  role: string;
  password: string;
  phone?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error fetching users", "error");
    }
  };

  const handleEditUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        fetchUsers();
        setIsEditDialogOpen(false);
        showSnackbar("User updated successfully", "success");
      } else {
        const data = await response.json();
        showSnackbar(data.error || "Error updating user", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar("Error updating user", "error");
    }
  };

  const handleAddUser = async (newUser: NewUser) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        fetchUsers();
        setIsAddDialogOpen(false);
        showSnackbar("User added successfully", "success");
      } else {
        const data = await response.json();
        showSnackbar(data.error || "Error adding user", "error");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      showSnackbar("Error adding user", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        showSnackbar("User deleted successfully", "success");
      } else {
        const data = await response.json();
        showSnackbar(data.error || "Error deleting user", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Error deleting user", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Management
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          label="Search users by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add User
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditUserDialog
        open={isEditDialogOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
      />

      <AddUserDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddUser}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
