import { getDoc, doc, collection, query, orderBy, limit, DocumentData, Query, where, CollectionReference, QueryDocumentSnapshot, QueryFieldFilterConstraint, getCountFromServer, arrayRemove, arrayUnion, updateDoc, onSnapshot, startAfter, documentId } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { roomsCollectionRef, db } from "../firebase-config";
import { catchErrorFunction } from "../pages/users/landing/UserLanding";
import { formattedDate, getSongsFromQuery } from "./HelperFunctions";
import { LoadingStateContext, ErrorsContext } from "../Contexts";
import { Song, Room, QueueItem } from "../myTypes";



export const useSongs = (roomId: string | undefined, start?: boolean) => {
    const { setLoadingState } = useContext(LoadingStateContext)
    const { setError } = useContext(ErrorsContext)
    const [info, setInfo] = useState<{ artists: Array<string>, genres: Array<string>, open: Boolean }>({ artists: [], genres: [], open: false })
    const [songs, setSongs] = useState<{ prev_page: Song[], curr_page: Song[], next_page: Song[] }>({ prev_page: [], curr_page: [], next_page: [] })
    const [pageLimit, setPageLimit] = useState(35)

    const [songsCollection, setSongsCollection] = useState<CollectionReference<DocumentData>>()
    const [currPage, setCurrPage] = useState(0)
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
        if (songsCollection && start) {
            querySongs();
        } else {
            setLoadingState("loaded")
        }
    }, [songsCollection]);

    const querySongs = async (field?: "GENERO" | "ARTISTA" | "TITULO" | "id", val?: string,) => {
        setLoadingState("loading")
        setCurrPage(0)

        if (!songsCollection) throw new Error("no songs collection")

        const queryWithFieldValue = async (field: "GENERO" | "ARTISTA" | "TITULO" | "id", val: string) => {
            let whereQ: QueryFieldFilterConstraint[]
            let relevantInfo: string[]
            switch (field) {
                case "GENERO":
                    relevantInfo = info.genres
                        .filter(v => {
                            if (val === "BALADA") {
                                return v.includes(val) || v.includes("B.") || v.includes("B ")
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
                case "id":
                    whereQ = [where(documentId(), ">=", val), where(field, "<", `${val}~`)]
                    break
                default:
                    whereQ = []
                    break;
            }

            setCurrQuery(whereQ)
            const q = query(songsCollection!, ...whereQ, orderBy(field), limit(pageLimit))
            const qcount = query(songsCollection!, ...whereQ, orderBy("ARTISTA"))
            const qcountdoc = getCountFromServer(qcount)
            const fullData = getSongsFromQuery(qcount)
            console.log("count: ", (await qcountdoc).data().count)
            console.log((await fullData).pageSongs)
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
    const logSongs = () => {
        console.log(songs);

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
            next_songs = songs.next_page.slice(pageLimit + 1)
        }
        setSongs(prev => {
            return {
                prev_page: [...prev.prev_page, ...prev.curr_page],
                curr_page: [...prev.next_page.slice(0, pageLimit + 1)],
                next_page: [...next_songs]
            }
        })
        setLoadingState("loaded")
        setCurrPage(c => c + 1)
    }
    const prevPage = async () => {
        if (songs.prev_page.length <= 0) return
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
        songs, currPage, prevPage, nextPage, info, querySongs, logSongs
    }
}



export const useRoom = ({ roomId, subscribe }: { roomId?: string; subscribe?: boolean; }) => {
    const [currentQueue, setCurrentQueue] = useState<QueueItem[]>([]);
    const [pastQueue, setPastQueue] = useState<QueueItem[]>([]);
    const [room, setRoom] = useState<Omit<Room, "currentQueue" | "pastQueue">>()
    const [sortMethod, setSortMethod] = useState<"1" | "2">()

    useEffect(() => {
        if (roomId && subscribe) {
            const roomRef = doc(roomsCollectionRef, roomId);
            const unsubscribe = onSnapshot(roomRef, (roomSnap) => {
                if (roomSnap.exists()) {
                    const roomData = roomSnap.data() as Room
                    setRoom({ created_by: roomData.created_by, song_db: roomData.song_db })
                    setPastQueue(roomData.pastQueue ?? []);
                    setCurrentQueue(roomData.currentQueue ?? []);
                }
            });
            return () => unsubscribe();
        }
    }, [roomId]);

    useEffect(() => {
        switch (sortMethod) {
            case "1":
                setCurrentQueue(sortWithAlternatingTables(currentQueue) ?? []);
                break;
            case "2":
                setCurrentQueue(sortByTime(currentQueue) ?? []);
                break;
            default:
                console.log("here");
                break;
        }
    }, [sortMethod, currentQueue.length])


    async function addToQueue({ singer, song, tableNumber }: {
        singer: string
        song: Song, tableNumber?: number
    }) {
        if (!roomId) throw new Error("RoomId not defined")
        const roomRef = doc(roomsCollectionRef, roomId);
        const now = new Date()
        const item: QueueItem = {
            singer,
            song,
            table: tableNumber,
            created_at: formattedDate(now)
        }
        await updateDoc(roomRef, {
            currentQueue: arrayUnion(item)
        });
    }

    async function markDone({ item }: { item: QueueItem; }) {
        if (!roomId) throw new Error("RoomId not defined")
        const roomRef = doc(roomsCollectionRef, roomId);
        await updateDoc(roomRef, {
            currentQueue: arrayRemove(item),
            pastQueue: arrayUnion(item)
        });
    }

    async function setQueue(queue: QueueItem[]) {
        if (!roomId) throw new Error("RoomId not defined");
        if (!queue) return
        const roomRef = doc(roomsCollectionRef, roomId);
        await updateDoc(roomRef, { currentQueue: queue });
    }

    function sortByTime(currQueue: QueueItem[]) {
        const sortedQueue = [...currQueue];
        sortedQueue.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return sortedQueue
    }

    function sortWithAlternatingTables(currQueue: QueueItem[]) {
        // Create a copy of the queue array
        const sortedQueue = [...currQueue];

        // Sort the queue by created_at
        sortedQueue.sort((a, b) => a.created_at.localeCompare(b.created_at));

        // Group the queue items by table
        const groups = new Map<number, QueueItem[]>();
        for (const item of sortedQueue) {
            if (item.table !== undefined) {
                if (!groups.has(item.table)) {
                    groups.set(item.table, []);
                }
                groups.get(item.table)!.push(item);
            }
        }

        // Create a new queue with alternating tables
        const result: QueueItem[] = [];
        let done = false;
        while (!done) {
            done = true;
            for (const group of groups.values()) {
                if (group.length > 0) {
                    result.push(group.shift()!);
                    done = false;
                }
            }
        }

        // Add any remaining items without a table to the end of the queue
        for (const item of sortedQueue) {
            if (item.table === undefined) {
                result.push(item);
            }
        }

        return result;
    }

    return {
        addToQueue, markDone, currentQueue, pastQueue, room, setCurrentQueue, setQueue, setSortMethod
    }
}