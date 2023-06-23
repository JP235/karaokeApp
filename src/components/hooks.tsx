import { getDoc, doc, collection, query, orderBy, limit, startAfter, DocumentData, Query, where, CollectionReference, QueryDocumentSnapshot, QueryFieldFilterConstraint, getDocs, getCountFromServer } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { roomsCollectionRef, db } from "../firebase-config";
import { Room, Song } from "../myTypes";
import { catchErrorFunction } from "../pages/users/landing/UserLanding";
import { getSongsFromQuery } from "./HelperFunctions";
import { LoadingStateContext, ErrorsContext } from "../Contexts";


export const useSongs = (roomId: string | undefined) => {
    const { setLoadingState } = useContext(LoadingStateContext)
    const { setError } = useContext(ErrorsContext)
    const [info, setInfo] = useState<{ artists: Array<string>, genres: Array<string>, open: Boolean }>({ artists: [], genres: [], open: false })
    const [songs, setSongs] = useState<{ prev_page: Song[], curr_page: Song[], next_page: Song[] }>({ prev_page: [], curr_page: [], next_page: [] })
    const [pageLimit, setPageLimit] = useState(20)

    const [songsCollection, setSongsCollection] = useState<CollectionReference<DocumentData>>()
    const [currPage, setCurrPage] = useState(0)
    const [currField, setCurrField] = useState<"GENERO" | "ARTISTA" | "TITULO" | "id">()
    const [currQuery, setCurrQuery] = useState<QueryFieldFilterConstraint[]>()

    const [lastSongInBatch, setLastSongInBatch] = useState<QueryDocumentSnapshot<DocumentData>>()

    useEffect(() => {
        if (roomId) {
            startRoom()
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
                if (!songsInfo.exists()) throw new Error("No songs info")

                const info = songsInfo.data()
                setInfo({
                    artists: info.artists,
                    genres: info.genres,
                    open: info.open ? true : false
                })
                setSongsCollection(songsColl)
                setLoadingState("loaded")

            } catch (e) {
                catchErrorFunction({
                    e, fallbackMsg: "Error en sala", setLoadingState: setLoadingState,
                    setError: setError
                })
            }

        }
    }, [roomId]);

    useEffect(() => {
        if (songsCollection) {
            querySongs();
        }
    }, [songsCollection]);

    const querySongs = async (field?: "GENERO" | "ARTISTA" | "TITULO", val?: string,) => {
        setLoadingState("loading")
        setCurrPage(0)

        if (!songsCollection) throw new Error("no songs collection")

        const queryWithFieldValue = async (field: "GENERO" | "ARTISTA" | "TITULO", val: string) => {
            setCurrField(field)
            let whereQ: QueryFieldFilterConstraint[]
            let relevantInfo: string[]
            setCurrField(field)
            switch (field) {
                case "GENERO":
                    relevantInfo = info.genres
                        .filter(v => {
                            if (val === "BALADA") {
                                return v.includes(val) || v.includes("B.")
                            }
                            return v.includes(val)
                        })
                    whereQ = [where(field, "in", relevantInfo)]
                    break
                case "ARTISTA":
                    relevantInfo = info.artists.filter(v => v.includes(val))
                    whereQ = [where(field, "in", relevantInfo)]
                    break
                case "TITULO":
                    whereQ = [where(field, ">=", val), where(field, "<", `${val}~`)]
                    break
                default:
                    whereQ = []
                    break;
            }

            setCurrQuery(whereQ)
            const q = query(songsCollection!, ...whereQ, orderBy(field), limit(pageLimit))
            const qcount = query(songsCollection!, ...whereQ)
            const qcountdoc = getCountFromServer(qcount)
            console.log("count: ", (await qcountdoc).data().count)
            const { pageSongs, lastDoc } = await getSongsFromQuery(q)

            const nextq = query(songsCollection!, ...whereQ, orderBy("ARTISTA"), limit(pageLimit), startAfter(lastDoc))
            const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(nextq)

            return { pageSongs, page2Songs, lastDoc2 }
        }
        const queryAllSongs = async () => {

            const q = query(songsCollection, orderBy("ARTISTA"), limit(pageLimit))
            const { pageSongs, lastDoc } = await getSongsFromQuery(q)

            const nextq = query(songsCollection, orderBy("ARTISTA"), startAfter(lastDoc), limit(pageLimit))
            const { pageSongs: page2Songs, lastDoc: lastDoc2 } = await getSongsFromQuery(nextq)
            return { pageSongs, page2Songs, lastDoc2 }
        }

        try {
            // "preload" next page
            const { pageSongs, page2Songs, lastDoc2 } = (field && val) ? await queryWithFieldValue(field, val) : await queryAllSongs()
            setSongs({ prev_page: [], curr_page: [...pageSongs], next_page: page2Songs })
            setLastSongInBatch(lastDoc2)
            setLoadingState("loaded")
        } catch (e) {
            catchErrorFunction({ e, fallbackMsg: "Error in filter", setLoadingState, setError })
            // throw new Error(e)
        }
    }

    const nextPage = async () => {
        setLoadingState("loading")
        let next_songs: Song[] = []

        if (songs.next_page.length === pageLimit) {
            let next: Query<DocumentData>
            if (currQuery) {
                next = query(songsCollection!, ...currQuery, orderBy("ARTISTA"), startAfter(lastSongInBatch), limit(pageLimit))
            } else {
                next = query(songsCollection!, orderBy("ARTISTA"), startAfter(lastSongInBatch), limit(pageLimit))
            }
            const { pageSongs, lastDoc } = await getSongsFromQuery(next)
            setLastSongInBatch(lastDoc)
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
        if (songs.prev_page.length < pageLimit) return
        setSongs(prev => {
            return {
                prev_page: [...prev.prev_page.slice(0, - pageLimit)],
                curr_page: [...prev.prev_page.slice(- pageLimit)],
                next_page: [...prev.curr_page, ...prev.next_page]
            }
        })
        setCurrPage(c => c - 1)

    }

    return {
        songs, currPage, prevPage, nextPage, info, querySongs
    }
} 