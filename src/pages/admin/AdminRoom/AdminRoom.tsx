import "./AdminRoom.css"
import { useParams } from 'react-router-dom';
import { QueueItem } from "../../../myTypes";
import { useSongs, useRoom } from "../../../components/hooks";
import { DeleteButton, DoneButton, HambButton, OnOffButton } from "../../../components/Buttons/Buttons";
import React, { useState, FormEvent } from "react";

const AdminRoom = () => {

    const params = useParams()
    const roomId = params.roomId
    const { currentQueue, markDone, setQueue, setSortMethod } = useRoom({ roomId, subscribe: true })
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null) return
        setDropTargetIndex(index);
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null) return
        const newQueue = [...currentQueue];
        newQueue.splice(index, 0, newQueue.splice(draggedIndex, 1)[0]);
        setQueue(newQueue);
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    if (!roomId) {
        return (<h1 className="admin no-room">Sala no encontrada </h1>)
    }
    return (
        <>
            <h1>Sala {roomId}</h1>
            <div className="queue-table-container">
                <table className='admin-queue'>
                    <caption>
                        <div className="order-buttons-container">
                            <span>
                                Alternar Mesas
                            </span>
                            <OnOffButton onText={"ON"} offText={"OFF"} onToggle={() => {
                                setSortMethod(p => p === "1" ? "2" : "1")
                            }} />
                        </div>
                    </caption>
                    <thead>
                        <tr className="queue-item">
                            <th></th>
                            <th><table className="header-data">
                                <thead>
                                    <tr>
                                        <td data-cell="Código">Codigo</td>
                                        <td data-cell="Mesa">Mesa</td>
                                        <td data-cell="Canta">Canta</td>
                                        <td data-cell="Canción" >Canción</td>
                                    </tr>
                                </thead>
                            </table></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentQueue.map((item, index) => {
                            return (
                                <React.Fragment key={item.created_at}>
                                    {(dropTargetIndex! <= draggedIndex!) && (dropTargetIndex === index)
                                        && <tr key={`top-preview-line ${index}`} className="preview-line" />}
                                    <tr
                                        key={index}
                                        className="queue-item"
                                        draggable="true"
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}

                                    >

                                        <td data-cell="queue-song-move-col">
                                            <div className="queue-song-move-container">
                                                <HambButton
                                                    className="queue-song-move"
                                                    draggable="true"
                                                    onDragStart={() => handleDragStart(index)}

                                                />
                                            </div>
                                        </td>
                                        <td><table className="row-data">
                                            <tbody>
                                                <tr>
                                                    <td data-cell="Código">{item.song.id}</td>
                                                    {item.table && <td data-cell="Mesa">{item.table}</td>}
                                                    <td data-cell="Canta">{item.singer}</td>
                                                    <td data-cell="Canción"><ul><li><i>{item.song.song_name}</i></li>
                                                        <li><strong>{item.song.artist}</strong></li>
                                                    </ul>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table></td>
                                        <td data-cell="queue-song-buttons-col">
                                            <div className="queue-song-buttons-container">
                                                <DeleteButton className="delete-from-queue-button" />
                                                <DoneButton onClick={() => { markDone({ item: item }) }} className="mark-done-button " />
                                            </div>
                                        </td>
                                    </tr >
                                    {(dropTargetIndex! >= draggedIndex!) && (dropTargetIndex === index)
                                        && <tr key={`bottom-preview-line ${index}`} className="preview-line" />}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div >
        </>
    );
};

export default AdminRoom

function AdminAddToQueueDialog({ roomId, open, setOpen }: { roomId: string, open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { addToQueue } = useRoom({ roomId, subscribe: true })
    const { songs, querySongs } = useSongs(roomId)
    const [data, setData] = useState<Omit<QueueItem, 'created_at'>>({
        singer: "",
        table: 0,
        song: {
            id: "",
            song_name: "",
            artist: "",
            genre: ""
        }

    })

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (data) addToQueue({ ...data })
    }
    return (
        <dialog id="queue-song-dialog" className={open ? "queue-song-dialog open" : "queue-song-dialog"} open={open}>
            <div >
                <h1>
                    Añadir Cancion
                </h1>
            </div>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        className="labelInput"
                        type="number"
                        value={data.table}
                        onChange={(event) => {
                            setData((d) => { return { ...d, table: parseInt(event.target.value) } })
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
                        value={data.singer}
                        onChange={(event) => {
                            setData((d) => { return { ...d, singer: event.target.value } })
                        }}
                    />
                    <span className="labelName">
                        Canta
                    </span>
                </label>
                <div className="create-room-buttons">
                    <button type="button" className="create-room-cancel" onClick={() => setOpen(false)} >Cancelar</button>
                    <button type="submit" value="Create" className="create-room-create" >Crear</button>
                </div>
            </form>
        </dialog >
    )
}