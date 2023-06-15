import React, { createContext, useState } from 'react';

// Define the shape of the language context value


export const Language = {
    EN: "EN",
    ES: "ES",
} 

export type Languages = keyof typeof Language

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