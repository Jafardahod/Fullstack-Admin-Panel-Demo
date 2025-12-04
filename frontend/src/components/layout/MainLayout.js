// frontend/src/components/layout/MainLayout.js
import { useEffect, useState } from "react";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar, { drawerWidth } from "./Sidebar";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // sidebar open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        // use theme page background so dark mode applies to whole shell
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 220ms ease, color 220ms ease",
      }}
    >
      <Header onMenuClick={handleToggleSidebar} />
      <Sidebar open={sidebarOpen} onToggle={handleToggleSidebar} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          pt: 8, // space for AppBar
          pb: 2,
          px: { xs: 1.5, md: 3 },
          transition: theme.transitions.create(["margin", "background-color"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          ml: {
            xs: 0,
            md: sidebarOpen ? `${drawerWidth}px` : 0,
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={(t) => ({
            flex: 1,
            mt: 1,
            mb: 1,
            p: { xs: 1.5, md: 3 },
            borderRadius: 3,
            // use theme paper so it adapts to light/dark
            bgcolor: "background.paper",
            // subtle border that adapts to mode to avoid harsh contrast
            border: "1px solid",
            borderColor:
              t.palette.mode === "light"
                ? "rgba(15,23,42,0.04)"
                : "rgba(255,255,255,0.04)",
            // box shadow only on desktop for depth in light mode; darker mode keep it minimal
            boxShadow:
              t.palette.mode === "light"
                ? { xs: "none", md: t.shadows[3] }
                : { xs: "none", md: "none" },
            transition: "background-color 220ms ease, border-color 220ms ease",
          })}
        >
          {children}
        </Container>

        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
