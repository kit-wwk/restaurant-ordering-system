"use client";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import {
  Dashboard,
  Restaurant,
  ShoppingCart,
  Event,
  People,
  Settings,
  LocalOffer,
} from "@mui/icons-material";

const drawerWidth = 280;

// Define menu items with their required roles
const menuItems = [
  {
    text: "Dashboard",
    path: "/admin",
    icon: <Dashboard />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    text: "Menu Management",
    path: "/admin/menu",
    icon: <Restaurant />,
    roles: ["ADMIN"],
  },
  {
    text: "Order Management",
    path: "/admin/orders",
    icon: <ShoppingCart />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    text: "Booking Management",
    path: "/admin/bookings",
    icon: <Event />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    text: "Promotion Management",
    path: "/admin/promotions",
    icon: <LocalOffer />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    text: "User Management",
    path: "/admin/users",
    icon: <People />,
    roles: ["ADMIN"],
  },
  {
    text: "Restaurant Settings",
    path: "/admin/restaurant",
    icon: <Settings />,
    roles: ["ADMIN"],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    state: { user, isLoading },
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || !["ADMIN", "STAFF"].includes(user.role))) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !["ADMIN", "STAFF"].includes(user.role)) {
    return null;
  }

  // Filter menu items based on user role
  const accessibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "64px", // Height of the main header
            height: "calc(100% - 64px)",
          },
        }}
      >
        <List>
          {accessibleMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={pathname === item.path}
                onClick={() => router.push(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
