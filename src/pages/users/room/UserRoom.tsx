import "./UserRoom.css"
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { clickAway } from "../../../App";
import FilterSongsForm from "../../../components/FilterSongsForm/FilterSongsForm";
import SongsTable from "../../../components/SongsList";
import { useSongs } from "../../../components/hooks";
import { LoadingError } from "../landing/UserLanding";
import { Song } from "../../../myTypes";
import AddToQueueForm from "../../../components/AddToQueueForm/AddToQueueForm";


function UserRoom() {
    const { roomId } = useParams()
    const [filter, setFilter] = useState(false)

    const { songs, currPage, prevPage, nextPage, info, querySongs, logSongs } = useSongs(roomId)

    const [selectedArtist, setSelectedArtist] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedSong, setSelectedSong] = useState<Song>()

    useEffect(() => {
        document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));

        return () => {
            document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));
        };
    }, []);

    const filterByArtist = () => {
        if (!info.artists.includes(selectedArtist)) return
        // filterSongs("ARTISTA", selectedArtist)
        querySongs("ARTISTA", selectedArtist)
    }
    const filterByGenre = () => {
        if (!info.genres.includes(selectedGenre)) return
        querySongs("GENERO", selectedGenre)
    }

    return (
        <div className="user-room">
            <h1>{roomId}</h1>
            <div className="user-room-content-wrapper">
                {/* <button onClick={() => logSongs()}>log</button> */}
                <div onClick={() => setFilter(true)} className={filter ? "filter-songs" : "filter-songs collapse"}>
                    <span className="filter-form-title">
                        <span className="searchButton-span"></span>
                        <h3>Filtrar</h3>
                        <div className="dummy" />
                    </span>
                    <div className="filter-forms">
                        <FilterSongsForm
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSelectedGenre("")
                                filterByArtist()
                            }} dataHints={info.artists} selected={selectedArtist} setSelected={setSelectedArtist} title={"Filtrar por Artista"} />
                        <FilterSongsForm
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSelectedArtist("")
                                filterByGenre()
                            }}
                            dataHints={info.genres} selected={selectedGenre} setSelected={setSelectedGenre} title={"Filtrar por Genero"} />

                    </div>
                </div>
                <SongsTable setSelectedSong={setSelectedSong} songs={songs} currPage={currPage} prevPage={prevPage} nextPage={nextPage} />
                <AddToQueueForm
                    song={selectedSong}
                    close={() => {
                        setSelectedSong(undefined);
                    }}
                    roomId={roomId ?? ""}
                    open={selectedSong ? true : false}
                />
            </div>
            <LoadingError />
        </div>
    )
}

export default UserRoom

