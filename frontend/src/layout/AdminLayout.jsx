import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  List,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useTheme } from "@mui/material/styles";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;
const appBarHeight = 64;

export default function AdminLayout() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const displayName = user?.full_name || "Admin";

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const items = [
    { label: "Dashboard", to: "/admin", icon: "dashboard" },
    { label: "Manage Users", to: "/admin/users", icon: "settings" },
    { label: "Subjects", to: "/admin/subjects", icon: "subjects" },
    { label: "Upload Questions", to: "/admin/questions", icon: "practice" },
	  { label: "Manage Questions", to: "/admin/manage-questions", icon: "practice" },
    { label: "Analytics", to: "/admin/analytics", icon: "leaderboard" },
    { label: "Logout", to: "/logout", icon: "logout" },
  ];

  const drawer = (
    <>
      <Box sx={{ height: appBarHeight }} />
      <Divider />
      <List sx={{ p: 1 }}>
        <SidebarMenu
          items={items}
          activePath={location.pathname}
          onNavigate={(to) => {
            if (to === "/logout") {
              logout();
              return;
            }
            navigate(to);
            setMobileOpen(false);
          }}
        />
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          height: appBarHeight,
          justifyContent: "center",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: appBarHeight, px: 2 }}>
          {!mdUp && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            CBT Master — Admin Panel
          </Typography>
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountCircleIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Welcome, {displayName}
            </Typography>
            <IconButton aria-label="logout" onClick={logout}>
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Box sx={{ height: appBarHeight }} />
        <Outlet />
      </Box>
    </Box>
  );
}
