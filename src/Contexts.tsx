import React, { createContext, useContext, useEffect, useState } from "react";
import { TLanguages, LoadignState, UserData } from "./myTypes";
import { getDoc, doc } from "firebase/firestore";
import {
	User,
	browserLocalPersistence,
	getAuth,
	setPersistence,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { googleAuthProvider, usersCollectionRef } from "./firebase-config";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import useLanguageOrLocal from "./components/Hooks/useLanguageOrLocal";

export function DndProviderTouchAndMouse({
	children,
}: {
	children: React.ReactNode;
}) {
	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;
	const backend = isTouchDevice ? TouchBackend : HTML5Backend;

	return <DndProvider backend={backend}>{children}</DndProvider>;
}

interface NavTitleContextValue {
	navTitle: JSX.Element;
	setNavTitle: (loadignState: JSX.Element) => void;
}

export const NavTitleStateContext = createContext<NavTitleContextValue>(null!);

export function NavTitleStateProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [navTitle, setNavSub] = useState<JSX.Element>(<>KaraokeApp</>);
	const setNavTitle = (navTitle: JSX.Element) => {
		setNavSub(<>KaraokeApp - {navTitle}</>);
	};
	return (
		<NavTitleStateContext.Provider value={{ navTitle, setNavTitle }}>
			{children}
		</NavTitleStateContext.Provider>
	);
}

export const useNavTitle = () => useContext(NavTitleStateContext);

interface LoadignContextValue {
	loadingState: LoadignState;
	setLoadingState: (loadignState: LoadignState) => void;
}

export const LoadingContext = createContext<LoadignContextValue>(null!);

export function LoadignProvider({ children }: { children: React.ReactNode }) {
	const [loadingState, setLoadingState] = useState<LoadignState>("idle");
	useEffect(() => {
		// console.log(loadingState);
	}, [loadingState]);
	return (
		<LoadingContext.Provider value={{ loadingState, setLoadingState }}>
			{children}
		</LoadingContext.Provider>
	);
}
export const useLoadingState = () => useContext(LoadingContext);

interface ErrorsContextValue {
	error?: string;
	setError: (error: string | undefined) => void;
}

// Create a context for the language preference
export const ErrorsContext = createContext<ErrorsContextValue>(null!);

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
}

export const useErrors = () => useContext(ErrorsContext);

interface LanguageContextValue {
	language: TLanguages;
	setLanguage: (language: TLanguages) => void;
}

// Create a context for the language preference
export const LanguageContext = createContext<LanguageContextValue>(null!);

// Create a provider component for the language context
export function LanguageProvider({ children }: { children: React.ReactNode }) {
	// Set up state to store the language preference
	const [language, setLanguage] = useLanguageOrLocal();

	// Return the provider component with the language value and setter function
	return (
		<LanguageContext.Provider value={{ language, setLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
}
export const useLanguage = () => useContext(LanguageContext);

const emptyUser: UserData = {
	name: "",
	email: "",
	permissions: "",
	active_room: "-1",
	songs_db: "",
	created_rooms: -1,
} as const;

interface UserAuthContextValue {
	isAuth: boolean;
	user: User | null;
	userData: UserData;
	signinWithGoogle: (callback: VoidFunction) => void;
	signInWithPassword: ({
		callback,
		email,
		password,
	}: {
		callback: VoidFunction;
		email: string;
		password: string;
	}) => void;
	signout: (callback: VoidFunction) => void;
}

export const UserAuthContext = createContext<UserAuthContextValue>(null!);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuth, setIsAuth] = useState(false);
	const [userData, setUserData] = useState<UserData>(emptyUser);
	const fireAuth = getAuth();
	useEffect(() => {
		const unsub = fireAuth.onAuthStateChanged((fireUser) => {
			if (!fireUser) {
				setUser(null);
				setIsAuth(false);
				setUserData(emptyUser);
				return;
			}
			if (!fireUser.email) throw new Error("User Email doesn't exist");
			getDoc(doc(usersCollectionRef, fireUser.email)).then((userDoc) => {
				if (!userDoc.exists) throw new Error("User Doc doesn't exist");
				const userData = userDoc.data() as unknown as UserData;
				setUserData({ ...userData });
				setUser(fireUser);
				setIsAuth(true);
			});
		});
		return () => {
			unsub();
		};
	}, []);

	const signInWithPassword = ({
		callback,
		email,
		password,
	}: {
		callback: VoidFunction;
		email: string;
		password: string;
	}) => {
		if (isAuth) {
			callback();
			return;
		}
		setPersistence(fireAuth, browserLocalPersistence).then(async () => {
			const result = await signInWithEmailAndPassword(
				fireAuth,
				email,
				password
			);
			const user = result.user;
			setUser(user);
			callback();
		});
	};
	const signinWithGoogle = (callback: VoidFunction) => {
		if (isAuth) {
			callback();
			return;
		}
		setPersistence(fireAuth, browserLocalPersistence).then(async () => {
			const result = await signInWithPopup(fireAuth, googleAuthProvider);
			const user = result.user;
			setUser(user);
			callback();
		});
	};
	const signout = (callback: VoidFunction) => {
		signOut(fireAuth).then(() => {
			setUser(null);
			setIsAuth(false);
			callback();
		});
	};

	const value = {
		user,
		userData,
		isAuth,
		signinWithGoogle,
		signInWithPassword,
		signout,
	};
	return (
		<UserAuthContext.Provider value={value}>
			{children}
		</UserAuthContext.Provider>
	);
}
export function useUserAuth() {
	return useContext(UserAuthContext);
}
