import "./UserRoom.css"
import { useState  } from "react";
import { useParams } from "react-router-dom";
import FilterSongsForm from "../../../components/FilterSongsForm/FilterSongsForm";
import SongsTable from "../../../components/SongsList";
import { LoadingError } from "../landing/UserLanding";
import { Song } from "../../../myTypes";
import AddToQueueForm from "../../../components/AddToQueueForm/AddToQueueForm";
import { useSongs } from "../../../components/Hooks/useSongs";


function UserRoom() {
    const { roomId } = useParams()
    const [filter, setFilter] = useState(true)

    const songs = useSongs(roomId, true)

    const [selectedArtist, setSelectedArtist] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedSong, setSelectedSong] = useState<Song>()

    // useEffect(() => {
    //     document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));

    //     return () => {
    //         document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));
    //     };
    // }, []);

    return (
        <div className="user-room">
            <h1>{roomId}</h1>
            <div className="user-room-content-wrapper">
                {/* <button onClick={() => logSongs()}>log</button> */}
                <div onClick={() => setFilter(true)} className={filter ? "filter-songs" : "filter-songs collapse"}>
                    <span className="filter-form-title">
                        <span className="searchButton-span"></span>
                        <h3>Filtrar</h3>
                        <div className="dummy space-fill" />
                    </span>
                    <div className="filter-forms">
                        <FilterSongsForm
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSelectedGenre("")
                                songs.filterByArtist(selectedArtist)
                            }} dataHints={songs.info.artists} selected={selectedArtist} setSelected={setSelectedArtist} title={"Filtrar por Artista"} />
                        <FilterSongsForm
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSelectedArtist("")
                                songs.filterByGenre(selectedGenre)
                            }}
                            dataHints={songs.info.genres} selected={selectedGenre} setSelected={setSelectedGenre} title={"Filtrar por Genero"} />

                    </div>
                </div>
                {roomId && <>
                    <SongsTable setSelectedSong={setSelectedSong} roomId={roomId} songs={songs} />
                    <AddToQueueForm
                        song={selectedSong}
                        close={() => {
                            setSelectedSong(undefined);
                        }}
                        roomId={roomId}
                        open={selectedSong ? true : false}
                    />
                </>
                }
            </div>
            <LoadingError />
        </div>
    )
}

export default UserRoom

