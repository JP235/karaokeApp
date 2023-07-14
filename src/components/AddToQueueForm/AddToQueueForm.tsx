import "./AddToQueueForm.css"
import { FormEvent, useState } from "react";
import { Song } from "../../myTypes";
import { LoadingError, catchErrorFunction } from "../../pages/users/landing/UserLanding";
import { useRoom } from "../Hooks/useRoom";
import DialogWrapped from "../DialogWrapped/DialogWrapped";
import * as text from "../../Language/text";
import { useErrors, useLanguage, useLoadingState } from "../../Contexts";

function AddToQueueForm({ roomId, song, close, admin, open, onSubmit }: { onSubmit?: VoidFunction, open: boolean, admin?: boolean, close: () => void, roomId: string, song?: Song }) {
    const { language } = useLanguage() 
    const { setError } = useErrors()
    const { setLoadingState } = useLoadingState()
    const [singer, setSinger] = useState("");
    const [tableNumber, setTableNumber] = useState<number>(-1);
    const { addToQueue } = useRoom({ roomId, subscribe: false })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (song === undefined || singer === "" || tableNumber === -1) return
        setLoadingState("loading")
        try {
            await addToQueue({ singer, tableNumber, song })
            setLoadingState("loaded")
            close()
        } catch (e) {
            catchErrorFunction({ e, fallbackMsg: "error adding song to queue", setLoadingState, setError })
        }
        onSubmit && onSubmit()
    }

    return (
        <DialogWrapped id="queue-song-dialog" className={open ? "queue-song-dialog open" : "queue-song-dialog"} open={open ? true : false}
            onClose={() => close()}
        >
            <div >
                <h3>
                    {text.addToQueue[language]}
                    <p>
                        <i>{song?.song_name.toLocaleUpperCase()} </i>
                    </p>
                    <p>
                        <i>- {song?.artist}</i>
                    </p>

                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                {admin && <></>}
                <label>
                    <input
                        className="labelInput"
                        type="number"
                        value={tableNumber != -1 ? tableNumber : ""}
                        onChange={(event) => {
                            if (event.target.value.length > 3) return
                            setTableNumber(event.target.value ? parseInt(event.target.value) : -1)
                        }}
                    />
                    <span className="labelName">
                        {text.table[language]}
                    </span>
                </label>
                <label>
                    <input
                        className="labelInput"
                        type="text"
                        value={singer}
                        onChange={(event) => setSinger(event.target.value)}
                    />
                    <span className="labelName">
                        {text.singers[language]}
                    </span>
                </label>
                <div className="create-room-buttons">
                    <button type="button" className="create-room-cancel" onClick={() => close()} >{text.cancel[language]}</button>
                    <button type="submit" value="Create" className="create-room-create" >{text.add[language]}</button>
                </div>
            </form>
            <LoadingError />
        </DialogWrapped >
    )
}

export default AddToQueueForm;
