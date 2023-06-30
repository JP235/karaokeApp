import "./AddToQueueForm.css"
import { FormEvent, useContext, useEffect, useState } from "react";
import { Song } from "../../myTypes";
import { ErrorsContext, LoadingStateContext } from "../../Contexts";
import { LoadingError, catchErrorFunction } from "../../pages/users/landing/UserLanding";
import { useRoom } from "../Hooks/useRoom";

function AddToQueueForm({ roomId, song, close, admin, open }: { open: boolean, admin?: boolean, close: () => void, roomId: string, song?: Song }) {
    const [singer, setSinger] = useState("");
    const [tableNumber, setTableNumber] = useState<number>(-1);
    const { setError } = useContext(ErrorsContext)
    const { setLoadingState } = useContext(LoadingStateContext)
    const { addToQueue } = useRoom({ roomId, subscribe: false })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoadingState("loading")
        if (song === undefined || singer === "" || tableNumber === -1) return
        try {
            console.log(singer, tableNumber, song);
            await addToQueue({ singer, tableNumber, song })
            setLoadingState("loaded")
            close()
        } catch (e) {
            catchErrorFunction({ e, fallbackMsg: "error adding song to queue", setLoadingState, setError })
        }

    }


    return (
        <dialog id="queue-song-dialog" className={open ? "queue-song-dialog open" : "queue-song-dialog"} open={open ? true : false}>
            <div >
                <h3>
                    Añadir a la fila
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
                        Mesa
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
                        Cantantes
                    </span>
                </label>
                <div className="create-room-buttons">
                    <button type="button" className="create-room-cancel" onClick={() => close()} >Cancelar</button>
                    <button type="submit" value="Create" className="create-room-create" >Añadir</button>
                </div>
            </form>
            <LoadingError />
        </dialog >
    )
}

export default AddToQueueForm;
