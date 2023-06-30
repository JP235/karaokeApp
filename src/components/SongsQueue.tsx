import React, { Children, useState } from "react";
import { OnOffButton, PlusButton, HambButton, DeleteButton, DoneButton } from "./Buttons/Buttons";
import { useRoom } from "./Hooks/useRoom";
import { QueueItem } from "../myTypes";
import { Outlet } from "react-router-dom";



function SongsQueue({ roomId, canEdit, children: addSongButton }: { roomId: string, canEdit: boolean, children: JSX.Element }) {
    const { currentQueue, markDone, setQueue, setSortMethod } = useRoom({ roomId, subscribe: true })

    const tableHead = () => {
        return canEdit ? (
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
        ) : (<thead>
            <tr className="queue-item">
                <th><table className="header-data">
                    <thead>
                        <tr>
                            <td data-cell="Mesa">Mesa</td>
                            <td data-cell="Canta">Canta</td>
                            <td data-cell="Canción" >Canción</td>
                        </tr>
                    </thead>
                </table></th>
            </tr>
        </thead>)
    }

    return (
        <div className="queue-table-container">
            <table className='admin-queue'>
                {canEdit && (<caption>
                    <div className="capltion-utils">
                        <div className="order-buttons-container">
                            <span>
                                Alternar Mesas
                            </span>
                            <OnOffButton onText={"ON"} offText={"OFF"} onToggle={() => {
                                setSortMethod(p => p === "1" ? "2" : "1")
                            }} />
                        </div>
                        {addSongButton}
                    </div>
                </caption>)}
                {tableHead()}
                {canEdit ? <QueueBodyCanEdit currentQueue={currentQueue} markDone={markDone} setQueue={setQueue} /> : <QueueBodyNoEdit currentQueue={currentQueue} />}
            </table>
        </div >
    )
}

export default SongsQueue;


function QueueBodyCanEdit(
    { currentQueue, markDone, setQueue }: {
        currentQueue: QueueItem[],
        markDone: ({ item }: { item: QueueItem }) => Promise<void>,
        setQueue: (queue: QueueItem[]) => Promise<void>
    }) {
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
    return (<tbody>
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
    </tbody>)
}
function QueueBodyNoEdit({ currentQueue }: { currentQueue: QueueItem[] }) {
    return (<tbody>
        {currentQueue.map((item) => {
            return (
                <React.Fragment key={item.created_at}>
                    <tr className="queue-item">
                        <td><table className="row-data">
                            <tbody>
                                <tr>
                                    {item.table && <td data-cell="Mesa">{item.table}</td>}
                                    <td data-cell="Canta">{item.singer}</td>
                                    <td data-cell="Canción"><ul><li><i>{item.song.song_name}</i></li>
                                        <li><strong>{item.song.artist}</strong></li>
                                    </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table></td>
                    </tr >

                </React.Fragment>
            )
        })}
    </tbody>)
}