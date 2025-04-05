import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard,
  Restaurant,
  MenuBook,
  EventNote,
  Settings,
} from "@mui/icons-material";
import Link from "next/link";

export function AdminNav() {
  return (
    <List>
      <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
        <ListItem component="div">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="總覽" />
        </ListItem>
      </Link>

      <Link
        href="/admin/orders"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <ListItem component="div">
          <ListItemIcon>
            <Restaurant />
          </ListItemIcon>
          <ListItemText primary="訂單管理" />
        </ListItem>
      </Link>

      <Link
        href="/admin/menu"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <ListItem component="div">
          <ListItemIcon>
            <MenuBook />
          </ListItemIcon>
          <ListItemText primary="菜單管理" />
        </ListItem>
      </Link>

      <Link
        href="/admin/bookings"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <ListItem component="div">
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="訂座管理" />
        </ListItem>
      </Link>

      <Link
        href="/admin/restaurant"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <ListItem component="div">
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="餐廳設定" />
        </ListItem>
      </Link>
    </List>
  );
}
