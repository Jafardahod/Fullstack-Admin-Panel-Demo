// src/components/ThemeToggle.js
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeMode } from "../../ThemeProviderWrapper";

const ThemeToggle = () => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Tooltip
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <IconButton onClick={toggleMode} sx={{ color: "text.primary" }}>
        {mode === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
