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

const menuItems = [
  { text: "總覽", path: "/admin", icon: <Dashboard /> },
  { text: "菜單管理", path: "/admin/menu", icon: <Restaurant /> },
  { text: "訂單管理", path: "/admin/orders", icon: <ShoppingCart /> },
  { text: "訂座管理", path: "/admin/bookings", icon: <Event /> },
  { text: "優惠管理", path: "/admin/promotions", icon: <LocalOffer /> },
  { text: "用戶管理", path: "/admin/users", icon: <People /> },
  { text: "餐廳設定", path: "/admin/restaurant", icon: <Settings /> },
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
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return null;
  }

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
          {menuItems.map((item) => (
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
