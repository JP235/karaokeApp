import React, { createContext, useEffect, useState } from 'react';
import { TLanguages, LoadignState, Room, UserData } from './myTypes';
import { fireAuth, usersCollectionRef } from './firebase-config';
import { getDoc, doc } from 'firebase/firestore';

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
    setError: (error: string | undefined) => void;
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
    language: TLanguages
    setLanguage: (language: TLanguages) => void;
}

// Create a context for the language preference
export const LanguageContext = createContext<LanguageContextValue>({
    language: "ES",
    setLanguage: () => { },
});

// Create a provider component for the language context
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Set up state to store the language preference
    const [language, setLanguage] = useState<TLanguages>("ES");

    // Return the provider component with the language value and setter function
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// interface RoomContextValue {
//     room: Room;
//     setRoom: (room: Room) => void;
// }

// export const RoomContext = createContext<RoomContextValue>({
//     setRoom: () => { },
//     room: {
//         queue: [],
//         created_by: '',
//         song_db: ''
//     }
// });

// export function RoomProvider({ children }: { children: React.ReactNode }) {
//     const [room, setRoom] = useState<Room>({
//         queue: [],
//         created_by: '',
//         song_db: ''
//     });

//     return (
//         <RoomContext.Provider value={{ room, setRoom }}>
//             {children}
//         </RoomContext.Provider>
//     );
// };

interface UserContextValue {
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    user: UserData;
    setUser: (user: UserData) => void;
    refreshUser: () => Promise<void>

}

export const UserContext = createContext<UserContextValue>({
    loggedIn: false,
    refreshUser: async () => { },
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

    useEffect(() => {
        refreshUser()
    }, [])

    const refreshUser = async () => {
        const currUser = fireAuth.currentUser
        if (currUser?.email) {
            const user = await getDoc(doc(usersCollectionRef, currUser.email))
            if (!user.exists) throw new Error("User Doc doesn't exist")
            const userData = user.data() as unknown as UserData

            setUser({ ...userData })
        }
    }

    return (
        <UserContext.Provider value={{
            loggedIn,
            setLoggedIn,
            user,
            setUser, refreshUser
        }}>
            {children}
        </UserContext.Provider>
    );
};