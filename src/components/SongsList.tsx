import { useRef, useContext, useEffect } from "react";
import { LoadingStateContext } from "../Contexts";
import { Song } from "../myTypes";
import { PrevButton, NextButton } from "./Buttons/Buttons";
import { UseSongsReturntype, useSongs } from "./Hooks/useSongs";


interface SongsTableParams {
    songs: UseSongsReturntype,
    roomId: string,
    setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>,
}


function SongsTable({ songs, setSelectedSong }: SongsTableParams) {
    const tableRef = useRef<HTMLTableElement>(null)
    const { paginatedSongs, currPage, prevPage, nextPage } = songs
    const { loadingState } = useContext(LoadingStateContext)

    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.scrollTop = -10;
        }
    }, [currPage])

    return (
        <div ref={tableRef} className="songs-table">
            <table id="song-list-table" className='song-list'>
                <caption>
                    <h3 className="header">
                        Canciones
                    </h3>
                </caption>
                <thead>
                    <tr>
                        <th data-cell="Artista">Artista</th>
                        <th data-cell="Titulo">Titulo</th>
                        {/* <th data-cell="Genero">Genero</th> */}
                    </tr>
                </thead>
                <tbody>
                    {paginatedSongs.curr_page.map((s, index) => {
                        return (
                            <tr key={index} onClick={() => setSelectedSong(s)
                            }>
                                <td data-cell="Artista">{s.artist}</td>
                                <td data-cell="Titulo">{s.song_name}</td>
                                {/* <td data-cell="Genero">{s.genre}</td> */}
                            </tr >
                        )
                    })}
                    {paginatedSongs.curr_page.length === 0 &&
                        <tr>
                            <td style={{ textAlign: "center", fontStyle: "italic" }} >--</td>
                            <td style={{ textAlign: "center", fontStyle: "italic" }} >--</td>
                            {/* <td style={{ textAlign: "center", fontStyle: "italic" }} >--</td> */}
                        </tr >}

                </tbody>
            </table>
            <div className="toolbar">
                <div className="table-buttons">
                    <PrevButton title={"previus page"}
                        disabled={loadingState != "loaded" || currPage <= 0}
                        onClick={() => prevPage()} />
                    Pagina {currPage + 1}
                    <NextButton
                        title={"next page"}
                        disabled={loadingState != "loaded" || (paginatedSongs.next_page.length === 0)}
                        onClick={() => nextPage()}
                    />
                </div>
            </div>
        </div >
    )
}

export default SongsTable;
