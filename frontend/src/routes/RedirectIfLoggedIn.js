import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectIfLoggedIn = ({ children }) => {
  console.log(location)
  const { user } = useAuth();
  if (user) return <Navigate to={"/"} replace />;
  return children;
};

export default RedirectIfLoggedIn;
