// frontend/src/components/layout/Footer.js
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        textAlign: "center",
        bgcolor: "background.paper",
        color: "text.secondary",
        borderTop: "1px solid",
        borderColor: "divider",
        transition: "background-color 220ms ease, color 220ms ease",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Jafaruttayyar Dahodwala. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
