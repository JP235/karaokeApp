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
    const [room, setRoom] = useState<Room>({
        queue: null,
        created_by: '',
        song_db: ''
    });

    const tableRef = useRef<HTMLTableElement>(null)

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
        if (tableRef.current) {
            tableRef.current.scrollTop = -10;
        }
    }, [currPage, currQuery])

    useEffect(() => {
        if (roomId) {
            // startRoom()
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
                setRoom(data)

                const first = query(songsColl, orderBy("ARTISTA"), limit(pageLimit))
                const { pageSongs, lastDoc } = await getSongsFromQuery(first)

                setSongs(prev => { return { ...prev, curr_page: pageSongs } })
                setLoadingState("loaded")
                if (pageSongs.length < 20) return

                const next = query(songsColl, orderBy("ARTISTA"), startAfter(lastDoc), limit(pageLimit))
                const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(next)
                setSongs(prev => { return { ...prev, next_page: page2Songs } })
                setLastSongLoaded(lastDoc2)

            } catch (error) {
                catchError({
                    e: error, fallbackMsg: "Error en sala", setLoadingState: setLoadingState,
                    setError: setError
                })
            }
        }
    }, [roomId]);


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
            <div onClick={() => setFilter(true)} className={filter ? "filter-songs" : "filter-songs collapse"}>
                <span className="searchicon"></span>
                <span className="filter-form-title">
                    <h3>Filtrar</h3>
                    <div className="dummy" />
                </span>
                <div className="filter-form">
                    <form className="filter-songs-form">
                        <label>
                            {/* <span>Artista</span> */}
                            <input
                                type="text"
                                value={selectedArtist}
                                onChange={(event) => {
                                    setSelectedArtist(event.target.value);
                                }}
                                list="artists"
                                placeholder="--Filtrar por Artista--"
                            />
                            {/* <option value="">--Filtrar por Artista--</option> */}
                            <datalist id="artists">
                                {info.artists.map((artist) => (
                                    <option key={artist} value={artist} />
                                ))}
                            </datalist>
                        </label>
                        <label>
                            {/* <span > Genero  </span> */}
                            <input
                                type="text"
                                value={selectedGenre}
                                placeholder="--Filtrar por Genero--"
                                onChange={(event) => {
                                    setSelectedGenre(event.target.value);
                                }}
                                list="genres"
                            />
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
            <div className="songs-table">
                <table ref={tableRef} id="song-list-table" className='song-list'>
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
                        <button disabled={loadingState != "loaded" || currPage <= 0} onClick={() => prevPage()}>{"<"}</button>
                        {currPage}
                        <button disabled={loadingState != "loaded" || (songs.next_page.length === 0)} onClick={() => nextPage()}>{">"}</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default UserRoom

