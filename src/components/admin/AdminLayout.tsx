import { Box, Container, Paper } from "@mui/material";
import { AdminNav } from "./AdminNav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        <Paper
          sx={{
            height: "100%",
            p: 2,
            borderRadius: 0,
          }}
          elevation={0}
        >
          <AdminNav />
        </Paper>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
