// frontend/src/components/layout/Header.js
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Box,
  Button,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { debounce } from "../../utils/debounce";
import ThemeToggle from "./ThemeToggle";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { setQ } = useSearch();
  const theme = useTheme();

  const handleSearch = debounce((value) => {
    setQ(value);
  }, 400);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 1,
        transition: "background-color 220ms ease, color 220ms ease",
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 2 }}>
        <IconButton edge="start" onClick={onMenuClick} size="large">
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}
        >
          Inventory Dashboard
        </Typography>

        {/* Center search bar */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.6,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            bgcolor:
              theme.palette.mode === "light" ? "grey.50" : "action.selected",
            maxWidth: 900,
            gap: 1,
            transition: "background-color 220ms ease, border-color 220ms ease",
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <TextField
            placeholder="Search users, items..."
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              width: "100%",
              "& .MuiInputBase-input": {
                px: 0,
              },
            }}
          />
        </Box>

        {/* User actions */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 0.5, gap: 1 }}>
            <ThemeToggle />

            <Button
              variant="contained"
              onClick={logout}
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: "error.main",
                color: "error.contrastText",
                "&:hover": {
                  bgcolor: "error.dark",
                },
                boxShadow: "none",
                minWidth: 60,
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
