import { Box, Typography, Paper } from "@mui/material";
import { RestaurantProfileForm } from "@/components/admin/RestaurantProfileForm";

export default function RestaurantProfilePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Restaurant Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <RestaurantProfileForm />
      </Paper>
    </Box>
  );
}
