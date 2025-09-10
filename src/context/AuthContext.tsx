// src/context/AuthContext.tsx
import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { api } from "@/lib/api";

// Define shape of user data (adjust fields based on your API response)
export interface User {
    id: string;
    name: string;
    email: string;
    // add more fields if your backend returns them
}

// Define context value shape
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
}

// Props for provider
interface AuthProviderProps {
    children: ReactNode;
}

// 👇 default export for context (no HMR issues)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string): Promise<void> => {
        const { data } = await api.post("api/auth/login", { email, password });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        await fetchProfile();
    };

    const logout = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await api.post("api/auth/logout", { refreshToken });
            }
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
        }
    };

    const fetchProfile = async (): Promise<void> => {
        try {
            const { data } = await api.get<User>("api/auth/profile");
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            fetchProfile();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// 👇 safer hook, no need for null checks
export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}

export default AuthContext;
