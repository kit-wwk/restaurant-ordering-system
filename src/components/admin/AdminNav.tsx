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
          <ListItemText primary="Dashboard" />
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
          <ListItemText primary="Order Management" />
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
          <ListItemText primary="Menu Management" />
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
          <ListItemText primary="Booking Management" />
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
          <ListItemText primary="Restaurant Settings" />
        </ListItem>
      </Link>
    </List>
  );
}
