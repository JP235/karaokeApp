import { useParams } from "react-router-dom"
import "./UserRoom.css"
import { CollectionReference, DocumentData, QueryFieldFilterConstraint, QueryDocumentSnapshot, getDoc, doc, collection, query, orderBy, limit, startAfter, Query, where, getDocs, QuerySnapshot } from "firebase/firestore"
import { useContext, useState, useEffect } from "react"
import { clickAway } from "../../../App"
import { LoadingStateContext, ErrorsContext } from "../../../Contexts"
import { CancelButton, SearchButton } from "../../../components/Buttons/Buttons"
import SongsTable from "../../../components/SongsList"
import { roomsCollectionRef, db } from "../../../firebase-config"
import { Song, Room } from "../../../myTypes"
import { catchErrorFunction, LoadingError } from "../landing/UserLanding"
import FilterSongsForm from "../../../components/FilterSongsForm/FilterSongsForm"


function UserRoom() {
    const { roomId } = useParams()
    const { setLoadingState } = useContext(LoadingStateContext)
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

                const first = query(songsColl, orderBy("ARTISTA"), limit(pageLimit))
                const { pageSongs, lastDoc } = await getSongsFromQuery(first)

                setSongs(prev => { return { ...prev, curr_page: pageSongs } })
                setLoadingState("loaded")
                if (pageSongs.length < pageLimit) return

                const next = query(songsColl, orderBy("ARTISTA"), startAfter(lastDoc), limit(pageLimit))
                const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(next)
                setSongs(prev => { return { ...prev, next_page: page2Songs } })
                setLastSongLoaded(lastDoc2)

            } catch (e) {
                catchErrorFunction({
                    e, fallbackMsg: "Error en sala", setLoadingState: setLoadingState,
                    setError: setError
                })
            }
        }
    }, [roomId]);

    const filterByArtist = () => {
        if (!info.artists.includes(selectedArtist)) return
        filterSongs("ARTISTA", selectedArtist)
    }
    const filterByGenre = () => {
        if (!info.genres.includes(selectedGenre)) return
        filterSongs("GENERO", selectedGenre)
    }
    const filterSongs = async (field: "GENERO" | "ARTISTA" | "none", val?: string, startAt?: number) => {
        setLoadingState("loading")
        setCurrPage(0)
        try {
            let q: Query<DocumentData>
            const whereQ = where(field, "==", val ?? "none")

            if (field !== "none" && val) {
                setCurrQuery(whereQ)
                q = query(songsCollection!, whereQ, orderBy(field), limit(pageLimit))
            } else {
                setCurrQuery(undefined)
                q = query(songsCollection!, orderBy(field), limit(pageLimit))
            }

            const { pageSongs, lastDoc } = await getSongsFromQuery(q)
            setSongs({ prev_page: [], curr_page: [...pageSongs], next_page: [] })
            setLoadingState("loaded")
            if (pageSongs.length < pageLimit) return

            let nextq: Query<DocumentData>
            if (field !== "none") {
                nextq = query(songsCollection!, whereQ, orderBy(field), limit(pageLimit), startAfter(lastDoc))
            } else {
                nextq = query(songsCollection!, orderBy(field), limit(pageLimit), startAfter(lastDoc))
            }
            const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(nextq)
            setSongs(prev => { return { ...prev, next_page: page2Songs } })
            setLastSongLoaded(lastDoc2)
        } catch (e) {
            catchErrorFunction({ e, fallbackMsg: "Error Buscando Artista", setLoadingState, setError })
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
            <div className="user-room-content-wrapper">
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
                                filterByArtist()
                            }}
                            dataHints={info.artists}
                            selected={selectedArtist}
                            setSelected={setSelectedArtist}
                            title={"Filtrar por Artista"} />
                        <FilterSongsForm
                            onSubmit={(e) => {
                                e.preventDefault()
                                filterByGenre()
                            }}
                            dataHints={info.genres}
                            selected={selectedGenre}
                            setSelected={setSelectedGenre}
                            title={"Filtrar por Genero"} />

                    </div>
                </div>
                <SongsTable songs={songs} currPage={currPage} prevPage={prevPage} nextPage={nextPage} />


            </div>
            <LoadingError />
        </div>
    )
}

export default UserRoom

