"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  Rating,
  Chip,
  Divider,
  Alert,
  Skeleton,
} from "@mui/material";
import { AccessTime, Info } from "@mui/icons-material";
import { useState, useEffect } from "react";
import type {
  Restaurant,
  Category,
  Promotion,
  OperatingHours,
} from "@/types/restaurant";
import MenuSection from "@/components/MenuSection/MenuSection";
import MenuSkeleton from "@/components/MenuSection/MenuSkeleton";

export default function Home() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch restaurant data
    fetch("/api/restaurant/1")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch restaurant data");
        }
        return res.json();
      })
      .then((data) => {
        setRestaurant(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (isLoading || !restaurant) {
    return (
      <Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="30%" height={24} />
          </Box>
          <MenuSkeleton />
        </Container>
      </Box>
    );
  }

  // Get all menu items across categories
  const allItems = restaurant.categories.flatMap((category) => category.items);

  return (
    <Box>
      {/* Restaurant Header */}
      <Paper elevation={0} sx={{ bgcolor: "white", mb: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {restaurant.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating value={restaurant.rating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {restaurant.rating}/5 ({restaurant.totalReviews}+ reviews)
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Promotions */}
      {restaurant.promotions.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Promotions
            </Typography>
            {restaurant.promotions.map((promo: Promotion) => (
              <Box key={promo.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  {promo.discountPercentage}% OFF
                </Typography>
                <Typography variant="body2">
                  Minimum order: HK$ {promo.minimumOrder}. {promo.description}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Container>
      )}

      {/* Categories Navigation */}
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
          <Chip
            label="All Items"
            onClick={() => setSelectedCategory(undefined)}
            sx={{
              px: 2,
              bgcolor: !selectedCategory ? "primary.main" : "inherit",
              color: !selectedCategory ? "white" : "inherit",
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          />
          {restaurant.categories.map((category: Category) => (
            <Chip
              key={category.id}
              label={category.name}
              onClick={() => setSelectedCategory(category.name)}
              sx={{
                px: 2,
                bgcolor:
                  selectedCategory === category.name
                    ? "primary.main"
                    : "inherit",
                color: selectedCategory === category.name ? "white" : "inherit",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                },
              }}
            />
          ))}
        </Box>

        {/* Menu Items */}
        <Box sx={{ mb: 4 }}>
          <MenuSection items={allItems} selectedCategory={selectedCategory} />
        </Box>
      </Container>

      {/* Operating Hours & Info */}
      <Container maxWidth="lg">
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <AccessTime sx={{ mr: 1 }} /> Operating Hours
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {restaurant.operatingHours.map(
              (hours: OperatingHours, index: number) => (
                <Typography key={index} variant="body2">
                  {hours.days}: {hours.hours}
                </Typography>
              )
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Info sx={{ mr: 1 }} /> Restaurant Information
          </Typography>
          <Typography variant="body2">
            License Number: {restaurant.licenseNumber}
          </Typography>
          <Typography variant="body2">
            License Type: {restaurant.licenseType}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
