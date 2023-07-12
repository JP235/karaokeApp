import {
	User,
	setPersistence,
	browserLocalPersistence,
	signInWithPopup,
	signOut,
	getAuth,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { googleAuthProvider } from "../../firebase-config";

export function usefireAuthProvider(callbacks?: {
	loggedInCallback: VoidFunction;
	notLoggedInCallback: VoidFunction;
}) {
	const [isAuthenticated, setIsAuth] = useState(false);
	const [checkingStatus, setCheckingStatus] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const fireAuth = getAuth();

	useEffect(() => {
		// auth listener to keep track of user signing in and out
		fireAuth.onAuthStateChanged((user) => {
			if (user) {
				setUser(user);
				setIsAuth(true);
				callbacks?.loggedInCallback();
			} else {
				setUser(null);
				setIsAuth(false);
			}

			setCheckingStatus(false);
		});
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
		if (isAuthenticated) {
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
			setIsAuth(true);
			callback();
		});
	};
	const signinWithGoogle = ({ callback }: { callback: VoidFunction }) => {
		if (isAuthenticated) {
			callback();
			return;
		}
		setPersistence(fireAuth, browserLocalPersistence).then(async () => {
			const result = await signInWithPopup(fireAuth, googleAuthProvider);
			const user = result.user;
			setUser(user);
			setIsAuth(true);
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
	return {
		user,
		checkingStatus,
		isAuthenticated,
		signinWithGoogle,
		signInWithPassword,
		signout,
	};
}
