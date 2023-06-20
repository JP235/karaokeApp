import { FormEvent, useContext, useState } from "react";
import { ErrorsContext, UserContext } from "../../../Contexts"
import "./AdminDashboard.css"
import { roomsCollectionRef, usersCollectionRef } from "../../../firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



function AdminDashboard() {
    const navigate = useNavigate()
    const { setError } = useContext(ErrorsContext)
    const { user } = useContext(UserContext)
    const [creatingRoom, setCreatigRoom] = useState(false)

    const [roomCode, setRoomCode] = useState(generateRandomNumber())
    const [roomName, setRoomName] = useState("Karaoke")

    const createRoom = async () => {
        console.log(roomCode, roomName);
        try {
            await setDoc(doc(roomsCollectionRef, String(roomCode)), {
                queue: [],
                created_by: user.name,
                song_db: user.songs_db,

            })
            await setDoc(doc(usersCollectionRef, user.email), { created_rooms: user.created_rooms + 1, active_room: roomCode }, { merge: true })
            const url = "/admin/" + roomCode
            navigate(url)
        } catch (error) {
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
        createRoom()
    }

    return (
        <>
            <div className="greeting">
                <p>Hola {user.name} </p>
                <p>Salar creadas: {user.created_rooms} </p>
                {user.active_room === -1 ?
                    <p> No hay salas activas</p> :
                    <p>Codigo de sala activa:  {user.active_room} </p>
                }
            </div>
            {(user.permissions === "active" || user.permissions === "ALL") &&
                < div className="admin-dashboard">
                    {user.active_room === -1 ?
                        <button className="new-room" onClick={() => setCreatigRoom(true)}>
                            Crear Sala
                        </button> :
                        <button className="goToRoom">
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
                                if (event.target.value.length > 4) return
                                setRoomCode(parseInt(event.target.value))
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
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1))
}