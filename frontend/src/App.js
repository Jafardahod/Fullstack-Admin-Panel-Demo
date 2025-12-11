import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { SearchProvider } from "./context/SearchContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RedirectIfLoggedIn from "./routes/RedirectIfLoggedIn";
import MainLayout from "./components/layout/MainLayout";
import { Box } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import UserMasterPage from "./pages/UserMasterPage";
import ItemMasterPage from "./pages/ItemMasterPage";
import DummyPage1 from "./pages/DummyPage1";
import DummyPage2 from "./pages/DummyPage2";
import DummyPage3 from "./pages/DummyPage3";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  // console.log("App User:", user);
  return (
    <SearchProvider>
      {/* <Router> */}
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />
        {/* Protected + layout wrapped */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MainLayout>
                <UserMasterPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MainLayout>
                <ItemMasterPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Dummy pages for normal user (no role restriction, just logged in) */}
        <Route
          path="/dummy1"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DummyPage1 />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dummy2"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DummyPage2 />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dummy3"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DummyPage3 />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* </Router> */}
    </SearchProvider>
  );
};

export default App;
