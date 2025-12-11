import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedExpiry = localStorage.getItem("expiry")
    // console.log("Stored Token:", storedToken);
    // console.log("Stored User:", storedUser);

    if (storedToken && storedUser && storedExpiry) {
      if (Date.now() > Number(storedExpiry)) {
        console.log("Session expired. Logging out.");
        localStorage.clear();
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }

    setInitialized(true);
  }, []);

  if (!initialized) return null;

  const login = (userData, jwtToken) => {
    const expiryTime = Date.now() + 1000 * 60 * 60;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("expiry", expiryTime);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
