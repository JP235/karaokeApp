import { useParams } from "react-router-dom"
import "./UserRoom.css"
import { useContext, useEffect, useRef, useState } from "react"
import { Room, Song } from "../../../myTypes"
import { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, QueryFieldFilterConstraint, QuerySnapshot, collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore"
import { db, roomsCollectionRef } from "../../../firebase-config"
import { LoadingError, catchError } from "../landing/UserLanding"
import { ErrorsContext, LoadingStateContext } from "../../../Contexts"
import { clickAway } from "../../../App"

function UserRoom() {
    const { roomId } = useParams()
    const { loadingState, setLoadingState } = useContext(LoadingStateContext)
    const { setError } = useContext(ErrorsContext)


    const [info, setInfo] = useState<{ artists: Array<string>, genres: Array<string>, open: Boolean }>({ artists: [], genres: [], open: false })
    const [songsCollection, setSongsCollection] = useState<CollectionReference<DocumentData>>()
    const [songs, setSongs] = useState<{ prev_page: Song[], curr_page: Song[], next_page: Song[] }>({ prev_page: [], curr_page: [], next_page: [] })
    const [currPage, setCurrPage] = useState(0)
    const [currQuery, setCurrQuery] = useState<QueryFieldFilterConstraint>()
    const [lastSongLoaded, setLastSongLoaded] = useState<QueryDocumentSnapshot<DocumentData>>()
    const [filter, setFilter] = useState(false)
    const [selectedArtist, setSelectedArtist] = useState("")
    const [selectedGenre, setSelectedGenre] = useState('');

    const pageLimit = 20

    useEffect(() => {
        document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));

        return () => {
            document.addEventListener("click", (e) => clickAway(e, "filter-songs", setFilter));
        };
    }, []);



    useEffect(() => {
        if (roomId) {
            startRoom()
            setCurrPage(0)
        }
        async function startRoom() {
            setLoadingState("loading")
            try {
                const roomDoc = await getDoc(doc(roomsCollectionRef, roomId))
                if (!roomDoc.exists()) throw new Error("Sala no existe")
                const data = roomDoc.data() as Room
                if (!data.song_db) throw new Error("Songs_db no existe")
                const songsColl = collection(db, data.song_db)
                const songsInfo = await getDoc(doc(songsColl, "info"))
                if (!songsInfo.exists()) throw new Error("No songsInfo")
                const info = songsInfo.data()
                setInfo({
                    artists: info.artists,
                    genres: info.genres,
                    open: info.open ? true : false
                })
                setSongsCollection(songsColl)

                const first = query(songsColl, orderBy("ARTISTA"), limit(pageLimit))
                const { pageSongs, lastDoc } = await getSongsFromQuery(first)

                setSongs(prev => { return { ...prev, curr_page: pageSongs } })
                setLoadingState("loaded")
                if (pageSongs.length < 20) return

                const next = query(songsColl, orderBy("ARTISTA"), startAfter(lastDoc), limit(pageLimit))
                const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(next)
                setSongs(prev => { return { ...prev, next_page: page2Songs } })
                setLastSongLoaded(lastDoc2)

            } catch (e) {
                catchError({
                    e, fallbackMsg: "Error en sala", setLoadingState: setLoadingState,
                    setError: setError
                })
            }
        }
    }, [roomId]);

    const filterByArtist = () => {
        if (!info.artists.includes(selectedArtist)) return
        filterBy("ARTISTA", selectedArtist)
    }
    const filterByGenre = () => {
        if (!info.genres.includes(selectedGenre)) return
        filterBy("GENERO", selectedGenre)
    }
    const filterBy = async (field: "GENERO" | "ARTISTA", val: string) => {
        setLoadingState("loading")
        setCurrPage(0)
        try {
            const whereQ = where(field, "==", val)
            setCurrQuery(whereQ)
            const q = query(songsCollection!, whereQ, orderBy(field), limit(pageLimit))
            const { pageSongs, lastDoc } = await getSongsFromQuery(q)
            setSongs({ prev_page: [], curr_page: [...pageSongs], next_page: [] })
            setLoadingState("loaded")
            if (pageSongs.length < 20) return

            const nextq = query(songsCollection!, whereQ, orderBy(field), limit(pageLimit), startAfter(lastDoc))
            const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(nextq)
            setSongs(prev => { return { ...prev, next_page: page2Songs } })
            setLastSongLoaded(lastDoc2)
        } catch (e) {
            catchError({
                e, fallbackMsg: "Error Buscando Artista", setLoadingState: setLoadingState,
                setError: setError
            })
        }
    }

    const getSongsFromQuery = async (q: Query<DocumentData>) => {
        const docSnapshots = await getDocs(q);
        if (docSnapshots.docs.length === 0) throw new Error("No docs in songsColl")
        const pageSongs = songListFromSnapshot(docSnapshots)
        const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];
        return { pageSongs, lastDoc }
    }

    const songListFromSnapshot = (documentSnapshots: QuerySnapshot<DocumentData>) => {
        return documentSnapshots.docs.map(doc => {
            const data = doc.data()
            const song = {
                id: doc.id,
                artist: String(data.ARTISTA),
                song_name: String(data.TITULO).toLowerCase(),
                genre: String(data.GENERO).toLowerCase()
            } as Song
            return song
        })
    }
    const nextPage = async () => {
        setLoadingState("loading")
        let next_songs: Song[] = []

        if (songs.next_page.length === pageLimit) {
            let next: Query<DocumentData>
            if (currQuery) {
                next = query(songsCollection!, currQuery, orderBy("ARTISTA"), startAfter(lastSongLoaded), limit(pageLimit))
            } else {
                next = query(songsCollection!, orderBy("ARTISTA"), startAfter(lastSongLoaded), limit(pageLimit))
            }
            const { pageSongs, lastDoc } = await getSongsFromQuery(next)
            setLastSongLoaded(lastDoc)
            next_songs = pageSongs
        }
        else {
            next_songs = songs.next_page.slice(pageLimit)
        }
        setSongs(prev => {
            return {
                prev_page: [...prev.prev_page, ...prev.curr_page],
                curr_page: [...prev.next_page.slice(0, pageLimit)],
                next_page: [...next_songs]
            }
        })
        setLoadingState("loaded")
        setCurrPage(c => c + 1)
    }
    const prevPage = async () => {
        setSongs(prev => {
            return {
                prev_page: [...prev.prev_page.slice(0, - pageLimit)],
                curr_page: [...prev.prev_page.slice(- pageLimit)],
                next_page: [...prev.curr_page, ...prev.next_page]
            }
        })
        setCurrPage(c => c - 1)

    }

    return (
        <div className="user-room">
            <h1>{roomId}</h1>
            <LoadingError />
            <div className="user-room-content-wrapper">
                <div onClick={() => setFilter(true)} className={filter ? "filter-songs" : "filter-songs collapse"}>
                    <span className="searchicon"></span>
                    <span className="filter-form-title">
                        <h3>Filtrar</h3>
                        <div className="dummy" />
                    </span>
                    <div className="filter-form">
                        <form className="filter-songs-form">
                            <label>
                                <button className="cancelButton" disabled={selectedArtist.length === 0} type="button" title={"filter by genre"}
                                    onClick={() => { setSelectedArtist("") }}
                                >
                                    <span className="cancelButton-span"></span>
                                </button>
                                <input
                                    type="text"
                                    value={selectedArtist}
                                    onChange={(event) => {
                                        setSelectedArtist(event.target.value);
                                    }}
                                    list="artists"
                                    placeholder="--Filtrar por Artista--"
                                />
                                <button className="searchButton" disabled={!info.artists.includes(selectedArtist)} type="button" title={"filter by artist"}
                                    onClick={() => { filterByArtist() }}
                                >
                                    <span className="search-span"></span>
                                </button>

                                {/* <option value="">--Filtrar por Artista--</option> */}
                                <datalist id="artists">
                                    {info.artists.map((artist) => (
                                        <option key={artist} value={artist} />
                                    ))}
                                </datalist>
                            </label>
                            <label>
                                <button className="cancelButton" disabled={selectedGenre.length === 0} type="button" title={"filter by genre"}
                                    onClick={() => { setSelectedGenre("") }}
                                >
                                    <span className="cancelButton-span"></span>
                                </button>
                                <input
                                    type="text"
                                    value={selectedGenre}
                                    placeholder="--Filtrar por Genero--"
                                    onChange={(event) => {
                                        setSelectedGenre(event.target.value);
                                    }}
                                    list="genres"
                                /><button className="searchButton" disabled={!info.genres.includes(selectedGenre)} type="button" title={"filter by genre"}
                                    onClick={() => { filterByGenre() }}
                                >
                                    <span className="search-span"></span>
                                </button>
                                <datalist id="genres">
                                    {info.genres.map((genre) => (
                                        <option key={genre} value={genre}>
                                            {genre}
                                        </option>
                                    ))}
                                </datalist>
                            </label>
                        </form>
                    </div>
                </div>
                <SongsTable songs={songs} currPage={currPage} prevPage={prevPage} nextPage={nextPage} />


            </div>
        </div>
    )
}

export default UserRoom

interface SongsTableParams {
    songs: {
        prev_page: Song[];
        curr_page: Song[];
        next_page: Song[];
    },
    currPage: number,
    prevPage: () => void
    nextPage: () => void
}


function SongsTable({ songs, currPage, prevPage, nextPage }: SongsTableParams) {
    const tableRef = useRef<HTMLTableElement>(null)
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
                        <th colSpan={3}>
                        </th>
                    </tr>
                    <tr>
                        <th data-cell="Artista">Artista</th>
                        <th data-cell="Titulo">Titulo</th>
                        <th data-cell="Genero">Genero</th>
                        {/* <th data-cell="Código">Codigo</th> */}
                    </tr>
                </thead>
                <tbody>
                    {songs.curr_page.map((s, index) => {
                        return (
                            <tr key={index}>
                                <td data-cell="Artista">{s.artist}</td>
                                <td data-cell="Titulo">{s.song_name}</td>
                                <td data-cell="Genero">{s.genre}</td>
                                {/* <th data-cell="Código">{s.id}</th> */}
                            </tr >
                        )
                    })}

                </tbody>
            </table>
            <div className="toolbar">
                <div className="table-buttons">
                    <button type="button" title={"previus page"} className="prevButton" disabled={loadingState != "loaded" || currPage <= 0} onClick={() => prevPage()}><span className="icon-prevButton" />
                    </button>
                    Pagina {currPage + 1}
                    <button type="button" title={"next page"} className="nextbutton" disabled={loadingState != "loaded" || (songs.next_page.length === 0)} onClick={() => nextPage()} ><span className="icon-nextButton" />
                    </button>
                </div>
            </div>
        </div>
    )
}