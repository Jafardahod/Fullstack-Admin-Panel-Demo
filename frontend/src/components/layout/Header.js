// frontend/src/components/layout/Header.js
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Box,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { debounce } from "../../utils/debounce";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const { setQ } = useSearch();

  const handleSearch = debounce((value) => {
    setQ(value);
  }, 400);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        bgcolor: "white",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 2 }}>
        <IconButton edge="start" onClick={onMenuClick}>
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
            maxWidth: "parent",
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.8,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "grey.300",
            bgcolor: "grey.50",
          }}
        >
          <SearchIcon
            fontSize="small"
            sx={{ mr: 1, color: "text.secondary" }}
          />
          <TextField
            placeholder="Search users, items..."
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            sx={{ width: { xs: 140, sm: 400 } }}
          />
        </Box>

        {/* User info */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Box sx={{ textAlign: "right", mr: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {user.fullName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ textTransform: "capitalize", color: "text.secondary" }}
              >
                {user.role}
              </Typography>
            </Box>
            <IconButton onClick={logout}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
