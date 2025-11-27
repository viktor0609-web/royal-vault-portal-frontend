// src/context/AuthContext.tsx
import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { api, setOnTokensCleared } from "@/lib/api";

// Define shape of user data (MongoDB only - for AuthContext)
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "user" | "admin";
    supaadmin?: boolean;
    client_type?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
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
        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            
            // Validate that we received both tokens
            if (!data.accessToken) {
                console.error('Login response missing accessToken:', data);
                throw new Error('Login failed: No access token received');
            }
            
            if (!data.refreshToken) {
                console.error('Login response missing refreshToken:', data);
                throw new Error('Login failed: No refresh token received. Token refresh will not work.');
            }
            
            // Store tokens
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            
            console.log('Both tokens stored successfully');
            await fetchProfile();
        } catch (error: any) {
            console.error('Login error:', error);
            // Clear any partial tokens on error
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await api.post("/api/auth/logout", { refreshToken });
            }
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
        }
    };

    const fetchProfile = async (): Promise<void> => {
        try {
            const { data } = await api.get<User>("/api/auth/user");
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            fetchProfile();
        }

        // Register callback to clear user state when tokens are cleared
        setOnTokensCleared(() => {
            setUser(null);
        });

        // Cleanup on unmount
        return () => {
            setOnTokensCleared(() => {});
        };
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
