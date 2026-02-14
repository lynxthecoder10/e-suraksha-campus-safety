import { AuthClient } from "@dfinity/auth-client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Identity, Actor, HttpAgent } from "@dfinity/agent";

// Define the shape of our context
interface InternetIdentityContextType {
    identity: Identity | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: () => void;
    logout: () => void;
    loginStatus: string;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | null>(null);

export const useInternetIdentity = () => {
    const context = useContext(InternetIdentityContext);
    if (!context) {
        throw new Error("useInternetIdentity must be used within an InternetIdentityProvider");
    }
    return context;
};

export const InternetIdentityProvider = ({ children }: { children: ReactNode }) => {
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            const client = await AuthClient.create();
            setAuthClient(client);

            if (await client.isAuthenticated()) {
                const identity = client.getIdentity();
                setIdentity(identity);
                setIsAuthenticated(true);
            }

            setIsInitializing(false);
        };

        initAuth();
    }, []);

    const login = async () => {
        if (authClient) {
            setIsLoggingIn(true);
            await authClient.login({
                identityProvider: process.env.II_URL || "https://identity.internetcomputer.org",
                onSuccess: () => {
                    const identity = authClient.getIdentity();
                    setIdentity(identity);
                    setIsAuthenticated(true);
                    setIsLoggingIn(false);
                    window.location.reload(); // Refresh to ensure state is clean
                },
                onError: () => {
                    setIsLoggingIn(false);
                }
            });
        }
    };

    const logout = async () => {
        if (authClient) {
            await authClient.logout();
            setIdentity(null);
            setIsAuthenticated(false);
            window.location.reload();
        }
    };

    const loginStatus = isLoggingIn ? 'logging-in' : 'idle';

    return (
        <InternetIdentityContext.Provider value={{ identity, isAuthenticated, isInitializing, login, logout, loginStatus }}>
            {children}
        </InternetIdentityContext.Provider>
    );
};
