import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  didIdentifier: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  publicKey: string;
  didDocument: any;
  isVerified: boolean;
}

interface AuthContext {
  user: User | null;
  login: (credentials: { username?: string; password?: string; didIdentifier?: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username?: string; password?: string; didIdentifier?: string }) => {
    try {
      let endpoint = "/api/auth/login";
      let body = credentials;

      // Use DID login if didIdentifier is provided
      if (credentials.didIdentifier) {
        endpoint = "/api/auth/did-login";
        body = { didIdentifier: credentials.didIdentifier };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem("token", token);
        setUser(user);
        toast({
          title: "Login successful",
          description: "Welcome back to MedChain!",
        });
      } else {
        const { error } = await response.json();
        throw new Error(error);
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem("token", token);
        setUser(user);
        toast({
          title: "Registration successful",
          description: "Welcome to MedChain!",
        });
      } else {
        const { error } = await response.json();
        throw new Error(error);
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
