// frontend/src/components/layout/Sidebar.js
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const drawerWidth = 240;

const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const adminMenu = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    { label: "User Master", path: "/users", icon: <PeopleIcon /> },
    { label: "Item Master", path: "/items", icon: <CategoryIcon /> },
  ];

  const userMenu = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    { label: "Profile", path: "/dummy1", icon: <PersonIcon /> },
    { label: "Orders", path: "/dummy2", icon: <ReceiptIcon /> },
    { label: "Support", path: "/dummy3", icon: <HelpOutlineIcon /> },
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  const drawerSx = {
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      bgcolor: "background.sidebar",
      color: "text.primary",
      borderRight: "1px solid",
      borderColor: "divider",
      transition: "background-color 220ms ease, color 220ms ease",
    },
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.sidebar",
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Inventory
        </Typography>
      </Toolbar>

      <Box sx={{ flex: 1, py: 1 }}>
        <List>
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (!isDesktop) onToggle(); // close on mobile
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  transition: "background-color 180ms ease, color 180ms ease",
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "action.hover"
                        : "action.selected",
                  },
                  ...(active && {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isDesktop ? "persistent" : "temporary"}
      open={open}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }}
      sx={drawerSx}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
