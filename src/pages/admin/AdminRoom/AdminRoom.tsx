import "./AdminRoom.css"
import { FormEvent, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { roomsCollectionRef } from '../../../firebase-config';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../../Contexts';
import { Room, QueueItem, formattedDate } from "../../../myTypes";

const AdminRoom = () => {
    const { user } = useContext(UserContext)
    const params = useParams()
    const roomId = params.roomId
    const [room, setRoom] = useState<Room>()
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [addingToQueue, setAddingToQueue] = useState(false)

    useEffect(() => {
        if (roomId) {
            const unsubscribe =
                onSnapshot(doc(roomsCollectionRef, roomId), (snapshot) => {
                    if (snapshot.exists()) {

                        const roomData = snapshot.data() as Room
                        setRoom(roomData)
                    }
                });
            return () => unsubscribe();
        };

    }, [roomId]);


    if (!roomId) {
        return (
            <h1 className="admin no-room">
                Sala no encontrada
            </h1>
        )
    }

    return (
        <>
            <div>
                <h1>Codigo de Sala: {roomId}</h1>
                <hr />
                <table className='admin-queue'>
                    <caption>
                        <div className="header">
                            <div className='queue-info'>
                                <div className="created_by">
                                    Fila {room?.created_by} {user.songs_db}
                                </div>
                                <button onClick={() => { setAddingToQueue(true) }}>&#43;</button>
                            </div>
                        </div>
                    </caption>
                    <thead>
                        <tr>
                            <th data-cell="Código">Codigo</th>
                            <th data-cell="Info">Info</th>
                            <th data-cell="Mesa">Mesa</th>
                            <th data-cell="Canta">Canta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.map((s, index) => {
                            return (
                                <tr key={index}>
                                    <th data-cell="Código">{s.song.id}</th>
                                    <th data-cell="Info">
                                        <ul>
                                            <li>
                                                Titulo: {s.song.song_name}
                                            </li>
                                            <li>
                                                Artista: {s.song.artist}
                                            </li>
                                        </ul>
                                    </th>
                                    {s.table && <th data-cell="Mesa">{s.table}</th>}
                                    <th data-cell="Canta">{s.singer}</th>
                                </tr >
                            )
                        })}

                    </tbody>
                </table>
            </div>
            {addingToQueue &&
                <AddToQueueDialog roomId={roomId} open={addingToQueue} setOpen={setAddingToQueue} />}
        </>

    );
};

export default AdminRoom

export const addToQueue = (roomId: string, data: Omit<QueueItem, 'created_at'>) => {
    const created_at = formattedDate(new Date())
    console.log(roomId, created_at, data);

}

// const SongSearchForm = ({ songs }: { songs: Song[] }) => {
//     const [artist, setArtist] = useState('');
//     const [genre, setGenre] = useState('');

//     const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         const filteredSongs = songs.filter(
//             (song) =>
//                 (!artist || song.artist === artist) &&
//                 (!genre || song.genre === genre)
//         );
//         // do something with filteredSongs
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <label>
//                 Artist:
//                 <input
//                     type="text"
//                     value={artist}
//                     onChange={(event) => setArtist(event.target.value)}
//                 />
//             </label>
//             <br />
//             <label>
//                 Genre:
//                 <input
//                     type="text"
//                     value={genre}
//                     onChange={(event) => setGenre(event.target.value)}
//                 />
//             </label>
//             <br />
//             <button type="submit">Search</button>
//         </form>
//     );
// };

function AddToQueueDialog({ roomId, open, setOpen }: { roomId: string, open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {

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
        if (data) addToQueue(roomId, data)
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
                {/* <label>
                    <input
                        className="labelInput"
                        type="text"
                        value={data.song}
                        onChange={(event) => {
                            setData((d) => { return { ...d, singer: event.target.value } })
                        }}
                    />
                    <span className="labelName">
                        Canta
                    </span>
                </label> */}
                <div className="create-room-buttons">
                    <button type="button" className="create-room-cancel" onClick={() => setOpen(false)} >Cancelar</button>
                    <button type="submit" value="Create" className="create-room-create" >Crear</button>
                </div>
            </form>
        </dialog >
    )
}