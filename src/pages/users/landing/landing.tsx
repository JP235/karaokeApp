import "./landing.css"
import { LanguageContext } from "../../../Contexts"
// import { RoomContext } from "../../../Contexts"
import * as text from "../../../text"
import { useContext } from "react"

function UserLanding() {
    const { language } = useContext(LanguageContext)
    const welcomeText = text.landing[language].split(" ")

    return <div className="user-landing">
        <span className="landingText">
            {welcomeText.map((w, i) =>
                <span key={i} className="word" >{w}</span>
            )}
        </span>
        <div className="room-code">
            <input className="set-room" type="text" placeholder={text.roomCode[language]} />
            <button className="set-room button">
                {text.sentButton[language]}
            </button>
        </div>
    </div>
}

export default UserLanding