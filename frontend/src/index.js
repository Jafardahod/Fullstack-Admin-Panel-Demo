import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProviderWrapper } from "./ThemeProviderWrapper";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProviderWrapper>
          <App />
        </ThemeProviderWrapper>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
