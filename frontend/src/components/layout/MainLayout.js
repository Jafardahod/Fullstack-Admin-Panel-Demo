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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.100" }}>
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
          transition: theme.transitions.create("margin", {
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
          sx={{
            flex: 1,
            mb: 2,
            p: { xs: 1.5, md: 3 },
            borderRadius: 3,
            bgcolor: "white",
            boxShadow: { xs: 0, md: 3 },
          }}
        >
          {children}
        </Container>

        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
