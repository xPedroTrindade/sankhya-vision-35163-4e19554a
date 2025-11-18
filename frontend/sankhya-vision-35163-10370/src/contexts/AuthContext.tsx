import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  role: "admin" | "client";
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciais de teste fixas
const CREDENTIALS = {
  admin: {
    username: "adminMaster",
    password: "Master123",
    role: "admin" as const,
  },
  client: {
    username: "Cliente123456",
    password: "Cliente123456",
    role: "client" as const,
  },
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (
      username === CREDENTIALS.admin.username &&
      password === CREDENTIALS.admin.password
    ) {
      const userData = {
        username: CREDENTIALS.admin.username,
        role: CREDENTIALS.admin.role,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    if (
      username === CREDENTIALS.client.username &&
      password === CREDENTIALS.client.password
    ) {
      const userData = {
        username: CREDENTIALS.client.username,
        role: CREDENTIALS.client.role,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
