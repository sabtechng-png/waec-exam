// ==================================
// File: src/components/SidebarMenu.jsx
// ==================================
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

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
  return (
    <>
      {items.map((it) => {
        const selected = activePath === it.to;
        return (
          <Tooltip title={it.label} placement="right" arrow key={it.to}>
            <ListItemButton
              selected={selected}
              onClick={() => onNavigate(it.to)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{iconMap[it.icon]}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </Tooltip>
        );
      })}
    </>
  );
}
