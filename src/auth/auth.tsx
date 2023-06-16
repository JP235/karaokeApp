import { signInWithEmailAndPassword } from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { fireAuth, usersCollectionRef } from "../firebase-config"
import { UserData } from "../myTypes"
import { useState, FormEvent, useContext } from "react"
import { ErrorsContext, LoadingStateContext, UserContext } from "../Contexts"
import { useNavigate } from "react-router-dom"


 const LoginForm = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {
        setLoggedIn,
        setUserName,
        setPermissions,
        setActiveRoom,
        setSongsDBName
    } = useContext(UserContext)
    const { setLoadingState } = useContext(LoadingStateContext)


    const { setError } = useContext(ErrorsContext)

    const login = async ({ email, password }: { email: string, password: string }) => {
        setLoadingState("loading")
        try {
            const userCredential = await signInWithEmailAndPassword(fireAuth, email, password)
            const useremail = userCredential.user.email
            if (useremail) {
                const user = await getDoc(doc(usersCollectionRef, useremail))
                if (!user.exists) throw new Error("User Doc doesn't exist")
                const userData = user.data() as unknown as UserData

                console.log(userData["name"],
                    userData["permissions"],
                    userData["active_room"],
                    userData["songs_db"]);

                setUserName(userData["name"])
                setPermissions(userData["permissions"])
                setActiveRoom(userData["active_room"])
                setSongsDBName(userData["songs_db"])
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
        login({ email, password });
    };

    return (
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
    );
};

export default LoginForm