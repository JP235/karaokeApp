import React, { createContext, useState } from 'react';
import { Languages, LoadignState, UserData } from './myTypes';

// Define the shape of the language context value


interface LoadignStateContextValue {
    loadingState: LoadignState
    setLoadingState: (loadignState: LoadignState) => void;
}

// Create a context for the language preference
export const LoadingStateContext = createContext<LoadignStateContextValue>({
    loadingState: "idle",
    setLoadingState: () => { },
});

// Create a provider component for the language context
export function LoadignStateProvider({ children }: { children: React.ReactNode }) {
    // Set up state to store the language preference
    const [loadingState, setLoadingState] = useState<LoadignState>("idle")

    // Return the provider component with the language value and setter function
    return (
        <LoadingStateContext.Provider value={{ loadingState, setLoadingState }}>
            {children}
        </LoadingStateContext.Provider>
    );
};
interface ErrorsContextValue {
    error?: string
    setError: (error: string) => void;
}

// Create a context for the language preference
export const ErrorsContext = createContext<ErrorsContextValue>({
    error: undefined,
    setError: () => { },
});

// Create a provider component for the language context
export function ErrorsProvider({ children }: { children: React.ReactNode }) {
    // Set up state to store the language preference
    const [error, setError] = useState<string>();

    // Return the provider component with the language value and setter function
    return (
        <ErrorsContext.Provider value={{ error, setError }}>
            {children}
        </ErrorsContext.Provider>
    );
};

interface LanguageContextValue {
    language: Languages
    setLanguage: (language: Languages) => void;
}

// Create a context for the language preference
export const LanguageContext = createContext<LanguageContextValue>({
    language: "ES",
    setLanguage: () => { },
});

// Create a provider component for the language context
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Set up state to store the language preference
    const [language, setLanguage] = useState<Languages>("ES");

    // Return the provider component with the language value and setter function
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

interface RoomContextValue {
    room: string;
    setRoom: (room: string) => void;
}

export const RoomContext = createContext<RoomContextValue>({
    room: 'NULL',
    setRoom: () => { },
});

export function RoomProvider({ children }: { children: React.ReactNode }) {
    const [room, setRoom] = useState<string>('NULL');

    return (
        <RoomContext.Provider value={{ room, setRoom }}>
            {children}
        </RoomContext.Provider>
    );
};

interface UserContextValue {
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    user: UserData;
    setUser: (user: UserData) => void

}

export const UserContext = createContext<UserContextValue>({
    loggedIn: false,
    setLoggedIn: () => { },
    user: {
        name: '',
        email: '',
        permissions: '',
        active_room: -1,
        songs_db: '',
        created_rooms: -1
    },
    setUser: () => { }
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<UserData>({
        name: "",
        email: "",
        permissions: "",
        active_room: -1,
        songs_db: "",
        created_rooms: -1
    });

    return (
        <UserContext.Provider value={{
            loggedIn,
            setLoggedIn,
            user,
            setUser
        }}>
            {children}
        </UserContext.Provider>
    );
};