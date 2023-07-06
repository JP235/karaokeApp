import React, { createContext, useEffect, useState } from 'react';
import { TLanguages, LoadignState, Room, UserData } from './myTypes';
import { getDoc, doc } from 'firebase/firestore';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { usersCollectionRef } from './firebase-config';
import { usefireAuthProvider } from './components/Hooks/useFireAuth';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import useLanguageOrLocal from './components/Hooks/useLanguage';


export function DndProviderTouchAndMouse({ children }: { children: React.ReactNode }) {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const backend = isTouchDevice ? TouchBackend : HTML5Backend;

    return (
        <DndProvider backend={backend}>
            {children}
        </DndProvider>
    );

}

interface LoadignStateContextValue {
    loadingState: LoadignState
    setLoadingState: (loadignState: LoadignState) => void;
}

export const LoadingStateContext = createContext<LoadignStateContextValue>({
    loadingState: "idle",
    setLoadingState: () => { },
});

export function LoadignStateProvider({ children }: { children: React.ReactNode }) {
    const [loadingState, setLoadingState] = useState<LoadignState>("idle")
    useEffect(() => {
        // console.log(loadingState);
    }, [loadingState])
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
    language: "es",
    setLanguage: () => { },
});

// Create a provider component for the language context
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Set up state to store the language preference
    const [language, setLanguage] = useLanguageOrLocal()
    
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
    // refreshUser: () => Promise<void>

}

export const UserContext = createContext<UserContextValue>({
    loggedIn: false,
    // refreshUser: async () => { },
    setLoggedIn: () => { },
    user: {
        name: '',
        email: '',
        permissions: '',
        active_room: "-1",
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
        active_room: "-1",
        songs_db: "",
        created_rooms: 0
    });

    useEffect(() => {
        const fireAuth = getAuth()
        const unsub = onAuthStateChanged(fireAuth, currUser => {
            if (currUser?.email) {
                getDoc(doc(usersCollectionRef, currUser.email)).then(user => {
                    if (!user.exists) throw new Error("User Doc doesn't exist")
                    const userData = user.data() as unknown as UserData
                    setLoggedIn(true)
                    setUser({ ...userData })
                })
            }
        })
        return () => {
            unsub()
        }
    }, [])


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

interface AuthContextValue {
    user: User | null;
    signinWithGoogle: (callback: VoidFunction) => void;
    signInWithPassword: ({ callback, email, password }: { callback: VoidFunction, email: string, password: string }) => void
    signout: (callback: VoidFunction) => void;
}

export const AuthContext = React.createContext<AuthContextValue>(null!);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const fireAuthProvider = usefireAuthProvider()

    const signinWithGoogle = (callback: VoidFunction) => {
        return fireAuthProvider.signinWithGoogle({ callback });
    };
    const signInWithPassword = ({ callback, email, password }: { callback: VoidFunction, email: string, password: string }) => fireAuthProvider.signInWithPassword({ callback, email, password });

    const signout = (callback: VoidFunction) => {
        return fireAuthProvider.signout(() => {
            callback();
        });
    };

    const value = { user: fireAuthProvider.user, signInWithPassword, signinWithGoogle, signout };
    // console.log(value.user);
    // console.log(fireAuthProvider.user);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return React.useContext(AuthContext);
}

