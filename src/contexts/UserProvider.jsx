import { createContext, useContext, useState } from "react";

// 1. Create the Context
const UserContext = createContext(null);

export function UserProvider({ children }) {
  // 2. Safely initialize state from LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("session");
      // If valid JSON exists, use it. Otherwise, default to logged out.
      return saved
        ? JSON.parse(saved)
        : { isLoggedIn: false, name: "", email: "" };
    } catch (e) {
      return { isLoggedIn: false, name: "", email: "" };
    }
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // 3. Login Function
  const login = async (email, password) => {
    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for Cookies!
      });

      if (result.status === 200) {
        const newUser = { isLoggedIn: true, name: "", email: email };
        setUser(newUser);
        localStorage.setItem("session", JSON.stringify(newUser));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };

  // 4. Logout Function
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
    // Always clear local state even if API fails
    const newUser = { isLoggedIn: false, name: "", email: "" };
    setUser(newUser);
    localStorage.setItem("session", JSON.stringify(newUser));
  };

  const updateUserEmail = (email) => {
    const updatedUser = { ...user, email };
    setUser(updatedUser);
    localStorage.setItem("session", JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUserEmail }}>
      {children}
    </UserContext.Provider>
  );
}

// 5. Custom Hook for easy access
export function useUser() {
  return useContext(UserContext);
}
