import { FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext, ErrorsContext, LoadingStateContext, UserContext } from "../../../Contexts"
import "./AdminDashboard.css"
import { roomsCollectionRef, usersCollectionRef } from "../../../firebase-config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../../myTypes";
import { catchErrorFunction } from "../../users/landing/UserLanding";
import { changeRoomCode } from "../../../components/HelperFunctions";
import { usefireAuthProvider } from "../../../components/Hooks/useFireAuth";



function AdminDashboard() {
    const navigate = useNavigate()
    const { setError } = useContext(ErrorsContext)
    const { setLoadingState } = useContext(LoadingStateContext)
    const { user, setUser } = useContext(UserContext)
    const [creatingRoom, setCreatigRoom] = useState(false)
    // const {auth} = useContext() 
    const [roomCode, setRoomCode] = useState(String(generateRandomNumber()))
    const [roomName, setRoomName] = useState("Karaoke")
    const { signout } = useContext(AuthContext)

    function handleLogout() {
        signout(() => {
            navigate("/")
        })

    }
    useEffect(() => {
        if (user.email) {
            const unsubscribe =
                onSnapshot(doc(usersCollectionRef, user.email), (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.data() as unknown as UserData
                        setUser({ ...userData })
                    }
                });
            return () => unsubscribe();
        };

    }, [user.email]);

    const createRoom = async () => {
        try {
            await setDoc(doc(roomsCollectionRef, String(roomCode)), {
                queue: [],
                created_by: user.name,
                song_db: user.songs_db,

            })
            await setDoc(doc(usersCollectionRef, user.email), { created_rooms: user.created_rooms + 1, active_room: roomCode }, { merge: true })
            const url = "/admin/" + roomCode
            navigate(url)
        } catch (e) {
            catchErrorFunction({
                e, fallbackMsg: "Error creating room",
                setLoadingState: setLoadingState,
                setError: setError
            })
        }
    }
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        createRoom()
    }

    return (
        <>
            <div className="greeting">
                <p>Hola {user.name} </p>
                <button onClick={() => handleLogout()}>Logout</button>
                <p>Salar creadas: {user.created_rooms} </p>
                {user.active_room === "-1" ?
                    <p> No hay salas activas</p> :
                    <p>Codigo de sala activa:  {user.active_room} </p>
                }
            </div>
            {(user.permissions === "active" || user.permissions === "ALL") &&
                < div className="admin-dashboard">
                    {user.active_room === "-1" ?
                        <button className="new-room" onClick={() => setCreatigRoom(true)}>
                            Crear Sala
                        </button> :
                        <button className="goToRoom" onClick={() => {
                            const url = "/admin/" + user.active_room
                            navigate(url)
                        }}>
                            Ir a Sala Activa
                        </button>
                    }
                </div>
            }

            <dialog id="create-room-dialog" className={creatingRoom ? "create-room-dialog open" : "create-room-dialog"} open={creatingRoom}>
                <div >
                    <h1>
                        Crear Sala
                    </h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <label>
                        <input
                            className="labelInput"
                            type="number"
                            value={roomCode}
                            onChange={(event) => {
                                setRoomCode(changeRoomCode(event.target.value))
                            }}
                        />
                        <span className="labelName">
                            Codigo
                        </span>
                    </label>
                    <label>
                        <input
                            className="labelInput"
                            type="text"
                            value={roomName}
                            onChange={(event) => setRoomName(event.target.value)}
                        />
                        <span className="labelName">
                            Nombre
                        </span>
                    </label>
                    <div className="create-room-buttons">
                        <button type="button" className="create-room-cancel" onClick={() => setCreatigRoom(false)} >Cancelar</button>
                        <button type="submit" value="Create" className="create-room-create" >Crear</button>
                    </div>
                </form>
            </dialog >

        </>
    )
}

export default AdminDashboard

function generateRandomNumber() {
    return Math.floor(1000 + Math.random() * 9000)
}