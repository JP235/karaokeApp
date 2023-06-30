import { useState } from "react";
import { useParams } from "react-router-dom";
import AddToQueueForm from "../../../components/AddToQueueForm/AddToQueueForm";
import { PlusButton, CancelButton } from "../../../components/Buttons/Buttons";
import FilterSongsForm from "../../../components/FilterSongsForm/FilterSongsForm";
import { useSongs } from "../../../components/Hooks/useSongs";
import SongsList from "../../../components/SongsList";
import SongsQueue from "../../../components/SongsQueue";
import { Song } from "../../../myTypes";
import "./AdminRoom.css"


const AdminRoom = () => {
    const params = useParams()
    const roomId = params.roomId
    const [addingSong, setAddingSong] = useState(false);


    if (!roomId) {
        return (<h1 className="admin no-room">Sala no encontrada </h1>)
    }
    return (
        <>
            <h1>Sala {roomId}</h1>
            <SongsQueue roomId={roomId} canEdit={true} >
                <PlusButton className="add-song-to-queue" onClick={() => setAddingSong(true)} />
            </SongsQueue>
            <AdminAddToQueueDialog roomId={roomId} open={addingSong} close={() => setAddingSong(false)} />

        </>
    );
};

export default AdminRoom

function AdminAddToQueueDialog({ roomId, open, close }: { roomId: string, open: boolean, close: VoidFunction }) {
    const { info, songs, filterByArtist, filterByGenre, filterByID } = useSongs(roomId)
    const [selectedId, setSelectedId] = useState("")
    const [selectedArtist, setSelectedArtist] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedSong, setSelectedSong] = useState<Song>()


    return (
        <div className="admin-add-song-container">
            <dialog id="queue-song-dialog" className={open ? "queue-song-dialog open" : "queue-song-dialog"} open={open}>
                <div className="admin-add-song-header">
                    <h1>
                        Añadir Cancion
                    </h1>
                    <CancelButton className="close-admin-add-song" onClick={() => close()} />
                </div>
                <div className="filter-forms">
                    <FilterSongsForm
                        onSubmit={(e) => {
                            e.preventDefault()
                            setSelectedArtist("")
                            setSelectedGenre("")
                            filterByID(selectedId)
                        }}
                        selected={selectedId} setSelected={setSelectedId} title={"Buscar por ID"} />
                    <FilterSongsForm
                        onSubmit={(e) => {
                            e.preventDefault()
                            setSelectedGenre("")
                            setSelectedId("")
                            filterByArtist(selectedArtist)
                        }}
                        dataHints={info.artists} selected={selectedArtist} setSelected={setSelectedArtist} title={"Filtrar por Artista"} />
                    <FilterSongsForm
                        onSubmit={(e) => {
                            e.preventDefault()
                            setSelectedArtist("")
                            setSelectedId("")
                            filterByGenre(selectedGenre)
                        }}
                        dataHints={info.genres} selected={selectedGenre} setSelected={setSelectedGenre} title={"Filtrar por Genero"} />

                </div>
                <SongsList
                    songs={songs}
                    setSelectedSong={setSelectedSong}
                    roomId={roomId}
                />
                <AddToQueueForm
                    song={selectedSong}
                    admin={true}
                    open={selectedSong !== undefined && selectedSong.song_name !== ""}
                    close={() => { 
                        setSelectedSong(undefined) 
                        close()
                    }}
                    roomId={roomId} />
            </dialog >
        </div>
    )
}