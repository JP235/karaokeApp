import "./UserLanding.css"
import { ErrorsContext, LanguageContext, LoadingStateContext } from "../../../Contexts"
import * as text from "../../../text"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { roomsCollectionRef } from "../../../firebase-config"
import { LoadignState } from "../../../myTypes"

function UserLanding() {
    const navigate = useNavigate()
    const { setError } = useContext(ErrorsContext)
    const { setLoadingState } = useContext(LoadingStateContext)
    const { language } = useContext(LanguageContext)
    const [roomCode, setRoomCode] = useState("")
    const welcomeText = text.landing[language].split(" ")

    const changeRoomCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        // code too long
        if (event.target.value.length > 4) return
        // empty code
        if (event.target.value.length <= 0) {
            setRoomCode("")
            return
        }
        let val: string = ""

        // leading zeros
        if (String(parseInt(event.target.value)).length < event.target.value.length) {
            val = String(parseInt(event.target.value)).padStart(event.target.value.length, "0")
        }
        else {
            val = String(parseInt(event.target.value))
        }
        setRoomCode(val)
    }

    const findRoom = () => {
        setError(undefined)
        setLoadingState("loading")
        getDoc(doc(roomsCollectionRef, roomCode))
            .then(d => {
                if (d.exists()) {
                    const url = "room/" + roomCode
                    navigate(url)
                } else {
                    setLoadingState("loaded")
                    setError("Sala no encontrada")
                }
            }).catch(e => {
                catchError({
                    e, fallbackMsg: "Error finding room",
                    setLoadingState: setLoadingState,
                    setError: setError
                })
            })
    }

    return <div className="user-landing">
        <span className="landingText">
            {welcomeText.map((w, i) =>
                <span key={i} className="word" >{w}</span>
            )}
        </span>
        <div className="room-code">
            <form onSubmit={(event) => {
                event.preventDefault()
                findRoom()
            }}>
                <input
                    className="set-room"
                    type="number"
                    value={roomCode}
                    placeholder={text.roomCode[language]}
                    onChange={(event) => {
                        changeRoomCode(event)
                    }}
                />

                <button className="set-room button" type="submit">
                    {text.sentButton[language]}
                </button>
            </form>
            <LoadingError />
        </div>
    </div >
}

export default UserLanding


export function catchError({ e, fallbackMsg, setLoadingState, setError }: { e: any; fallbackMsg: string; setLoadingState: (loadignState: LoadignState) => void; setError: (error: string | undefined) => void }) {
    if (e instanceof Error) {
        setError(e.message)
    } else {
        setError(fallbackMsg)
    }
    setLoadingState("error")
}

export function LoadingError() {
    const { error } = useContext(ErrorsContext)
    const { loadingState } = useContext(LoadingStateContext)
    return (
        <div className="loading-error-container">
            {loadingState === "loading" &&
                <span className="loading" />
            }
            {error && <div className="error-msg">
                {error}
            </div>}
        </div>
    )
}