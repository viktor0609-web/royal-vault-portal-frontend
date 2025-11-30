// src/context/AuthContext.tsx
import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { api, setOnTokensCleared, authService } from "@/services/api";
import type { User } from "@/types";

// User type is now imported from @/types

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
            const { data } = await authService.login(email, password);
            
            // Validate that we received access token
            if (!data.accessToken) {
                console.error('Login response missing accessToken:', data);
                throw new Error('Login failed: No access token received');
            }
            
            // Store token
            localStorage.setItem("accessToken", data.accessToken);
            
            console.log('Access token stored successfully');
            await fetchProfile();
        } catch (error: any) {
            console.error('Login error:', error);
            // Clear token on error
            localStorage.removeItem("accessToken");
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
        }
    };

    const fetchProfile = async (): Promise<void> => {
        try {
            const { data } = await authService.getUser();
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    // Initialize auth on page load
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");
            
            if (!accessToken) {
                setUser(null);
                return;
            }

            // Fetch profile to verify token is still valid
            try {
                await fetchProfile();
            } catch (error: any) {
                // If fetchProfile fails, token might be invalid
                console.log('Failed to fetch profile, user needs to login');
                setUser(null);
            }
        };

        initializeAuth();

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
