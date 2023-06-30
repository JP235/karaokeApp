import { browserLocalPersistence, getAuth, setPersistence, signInWithEmailAndPassword } from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { usersCollectionRef } from "../../../firebase-config"
import { UserData } from "../../../myTypes"
import { useState, FormEvent, useContext, useEffect } from "react"
import { ErrorsContext, LoadingStateContext, UserContext, useAuth } from "../../../Contexts"
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { usefireAuthProvider } from "../../../components/Hooks/useFireAuth"

export function RequireAuth() {
    const auth = useAuth();
    const location = useLocation();

    if (!auth.user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }
        } />;
    }

    return <Outlet />;
}

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { from: Location };
    const from = state ? state.from.pathname : '/';
    const [redirecting, setRedirecting] = useState(false)
    const callback = () => navigate(from, { replace: true })
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const auth = usefireAuthProvider(
        {
            loggedInCallback: () => navigate(from, { replace: true }),
            notLoggedInCallback: () => navigate("/", { replace: true })
        }

    );
    useEffect(() => {
        if (redirecting) return
        if (auth.user) {
            setRedirecting(true)
            navigate(from, { replace: true });
        }
    }, [auth.user])


    const {
        setLoggedIn,
        setUser
    } = useContext(UserContext)
    const { setLoadingState } = useContext(LoadingStateContext)


    const { setError } = useContext(ErrorsContext)

    const login = async ({ email, password }: { email: string, password: string }) => {
        setLoadingState("loading")
        try {
            const fireAuth = getAuth()
            await setPersistence(fireAuth, browserLocalPersistence)
            const userCredential = await signInWithEmailAndPassword(fireAuth, email, password)
            const useremail = userCredential.user.email
            if (useremail) {
                const user = await getDoc(doc(usersCollectionRef, useremail))
                if (!user.exists) throw new Error("User Doc doesn't exist")
                const userData = user.data() as unknown as UserData

                setUser({ ...userData })
                setLoadingState("loaded")
                setLoggedIn(true)
                if (userData.permissions === "ALL") navigate("/admin/superadmin")
                else navigate("/admin/dashboard")

            } else {
                throw new Error("User Not Found")
            }
        } catch (error) {
            setLoadingState("error")
            if (error instanceof Error) {
                const errorMessage = error.message;
                setError(errorMessage)
            } else {
                setError("Error")
            }
        }
    }
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        auth.signInWithPassword({ email, password, callback });
    };

    return (
        <div className="admin-login">
            <form className="login-form" onSubmit={handleSubmit}>
                <label>
                    <span className="labelName">
                        Email
                    </span>
                    <input
                        className="labelInput"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>
                <label>
                    <span className="labelName">
                        Contraseña
                    </span>
                    <input
                        className="labelInput"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <button type="submit" value="Sign In" >Enviar</button>
            </form>
            OR
            <button onClick={() => auth.signinWithGoogle({ callback })}>
                login with google
            </button>
        </div>
    );
};




export default LoginForm