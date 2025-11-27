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

    // Helper function to check if token is expired or expiring soon
    const isTokenExpiredOrExpiringSoon = (token: string): boolean => {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return true;
            
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            
            if (!decoded.exp) return true;
            
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const bufferTime = 2 * 60 * 1000; // 2 minutes buffer
            
            return currentTime >= (expirationTime - bufferTime);
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    };

    // Initialize auth on page load - check and refresh token if needed
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");
            
            if (!accessToken || !refreshToken) {
                setUser(null);
                return;
            }

            // Check if access token is expired or expiring soon
            if (isTokenExpiredOrExpiringSoon(accessToken)) {
                console.log('Access token expired/expiring on page load, attempting refresh...');
                // The request interceptor will handle the refresh automatically
                // We just need to make a request which will trigger the refresh
                try {
                    // This will trigger the request interceptor to refresh the token
                    await fetchProfile();
                } catch (error: any) {
                    // If fetchProfile fails after refresh attempt, check if tokens were cleared
                    const stillHasTokens = localStorage.getItem("accessToken") && localStorage.getItem("refreshToken");
                    if (!stillHasTokens) {
                        // Tokens were cleared, user needs to login again
                        console.log('Tokens were cleared, user needs to login');
                        setUser(null);
                    } else {
                        // Tokens still exist, might be a temporary error
                        console.warn('Failed to fetch profile but tokens still exist:', error);
                        setUser(null);
                    }
                }
            } else {
                // Token is still valid, fetch profile normally
                await fetchProfile();
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
