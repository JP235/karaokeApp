import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Contexts"
import "./dashboard.css"


function AdminDashboard() {
    const { userName, activeRoom, permissions } = useContext(UserContext)
    const [creatingRoom, setCreatigRoom] = useState(false)

    const [roomCode, setRoomCode] = useState(generateRandomNumber())
    const [roomName, setRoomName] = useState("Karaoke")

    useEffect(() => {

    }, [])

    return (
        <>
            <div className="greeting">
                <p>Hola {userName} </p>
                {activeRoom === -1 ?
                    <p> No hay salas activas</p> :
                    <p>Codigo de sala activa:  {activeRoom} </p>
                }
            </div>
            {(permissions === "active" || permissions === "ALL") &&
                < div className="admin-dashboard">
                    {activeRoom === -1 ?
                        <button className="new-room" onClick={() => setCreatigRoom(true)}>
                            Crear Sala
                        </button> :
                        <button className="goToRoom">
                            Ir a Sala Activa
                        </button>
                    }
                </div>
            }

            <dialog className={creatingRoom ? "create-room-dialog open" : "create-room-dialog"} open={creatingRoom}>
                <div >
                    <h1>
                        Crear Sala
                    </h1>
                </div>
                <form >
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
                </form>
                <div className="create-room-buttons">
                    <button type="button" className="create-room-cancel" onClick={() => setCreatigRoom(false)} >Cancelar</button>
                    <button type="button" className="create-room-create" >Crear</button>
                </div>
            </dialog>

        </>
    )
}

export default AdminDashboard

function generateRandomNumber() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1))
}