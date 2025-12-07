// ==================================
// File: src/components/SidebarMenu.jsx
// ==================================
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
} from "@mui/material";
import { useState } from "react";

import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const iconMap = {
  dashboard: <DashboardIcon fontSize="small" />,
  subjects: <MenuBookIcon fontSize="small" />,
  practice: <PlayCircleIcon fontSize="small" />,
  results: <AssessmentIcon fontSize="small" />,
  leaderboard: <EmojiEventsIcon fontSize="small" />,
  settings: <SettingsIcon fontSize="small" />,
  logout: <LogoutIcon fontSize="small" />,
};

export default function SidebarMenu({ items, activePath, onNavigate }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleOpen = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Helper to detect selected state
  const isActive = (to) => activePath.startsWith(to);

  return (
    <List sx={{ width: "100%" }}>
      {items.map((item) => {
        const hasChildren = Array.isArray(item.children);
        const isOpen = openMenus[item.label] || false;
        const selected = isActive(item.to);

        return (
          <div key={item.label}>
            <Tooltip title={item.label} placement="right" arrow>
              <ListItemButton
                selected={selected}
                onClick={() =>
                  hasChildren ? toggleOpen(item.label) : onNavigate(item.to)
                }
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{iconMap[item.icon]}</ListItemIcon>
                <ListItemText primary={item.label} />

                {hasChildren ? (isOpen ? <ExpandLess /> : <ExpandMore />) : null}
              </ListItemButton>
            </Tooltip>

            {/* SUBMENU */}
            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {item.children.map((child) => {
                    const isChildActive = isActive(child.to);

                    return (
                      <ListItemButton
                        key={child.label}
                        selected={isChildActive}
                        onClick={() => onNavigate(child.to)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          bgcolor: isChildActive ? "action.selected" : "transparent",
                        }}
                      >
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </div>
        );
      })}
    </List>
  );
}
