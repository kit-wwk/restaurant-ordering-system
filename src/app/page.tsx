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
import type { MenuItem } from "@/types/restaurant";
import MenuSection from "@/components/MenuSection/MenuSection";
import MenuSkeleton from "@/components/MenuSection/MenuSkeleton";

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
  restaurantId: string;
}

interface Promotion {
  id: string;
  discountPercentage: number;
  minimumOrder: number;
  description: string;
  restaurantId: string;
  isAutoApplied: boolean;
}

interface OpeningHours {
  [key: string]: { open: string; close: string } | undefined;
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

interface RestaurantProfile {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  openingHours: OpeningHours;
  facebook?: string;
  instagram?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  maxBookingDays: number;
  maxBookingPerSlot: number;
  maxTableSize: number;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  metaTitle?: string;
  metaDescription?: string;
  rating: number;
  totalReviews: number;
  licenseNumber?: string;
  categories: Category[];
  promotions: Promotion[];
}

export default function Home() {
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch restaurant data
    fetch("/api/admin/restaurant-profile")
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
            <Typography variant="body1" color="text.secondary">
              {restaurant.description}
            </Typography>
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
                  Minimum order: {restaurant.currency} {promo.minimumOrder}.{" "}
                  {promo.description}
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
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map(
              (day) =>
                restaurant.openingHours[day] && (
                  <Box key={day} sx={{ display: "flex", gap: 2 }}>
                    <Typography variant="body2" sx={{ width: 100 }}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </Typography>
                    <Typography variant="body2">
                      {restaurant.openingHours[day].open} -{" "}
                      {restaurant.openingHours[day].close}
                    </Typography>
                  </Box>
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
          <Typography variant="body2">Address: {restaurant.address}</Typography>
          <Typography variant="body2">Phone: {restaurant.phone}</Typography>
          {restaurant.email && (
            <Typography variant="body2">Email: {restaurant.email}</Typography>
          )}
          {restaurant.licenseNumber && (
            <Typography variant="body2">
              License Number: {restaurant.licenseNumber}
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
