import {
	CollectionReference,
	DocumentData,
	QueryFieldFilterConstraint,
	QueryDocumentSnapshot,
	getDoc,
	doc,
	collection,
	where,
	documentId,
	query,
	orderBy,
	limit,
	getCountFromServer,
	startAfter,
	Query,
	FieldPath,
} from "firebase/firestore";
import { useContext, useState, useEffect } from "react";
import { LoadingStateContext, ErrorsContext } from "../../Contexts";
import { roomsCollectionRef, db } from "../../firebase-config";
import { Song, Room } from "../../myTypes";
import { catchErrorFunction } from "../../pages/users/landing/UserLanding";
import { getSongsFromQuery } from "../HelperFunctions";

export const useSongs = (roomId?: string, start?: boolean) => {
	const { setLoadingState } = useContext(LoadingStateContext);
	const { setError } = useContext(ErrorsContext);
	const [info, setInfo] = useState<{
		artists: Array<string>;
		genres: Array<string>;
		open: Boolean;
	}>({ artists: [], genres: [], open: false });
	const [paginatedSongs, setPaginatedSongs] = useState<{
		prev_page: Song[];
		curr_page: Song[];
		next_page: Song[];
	}>({ prev_page: [], curr_page: [], next_page: [] });
	const [pageLimit, setPageLimit] = useState(35);
	const [numberOfPages, setNumberOfPages] = useState<number>();

	const [songsCollection, setSongsCollection] =
		useState<CollectionReference<DocumentData>>();
	const [currPage, setCurrPage] = useState(0);
	const [currQuery, setCurrQuery] = useState<QueryFieldFilterConstraint[]>();

	const [lastSongInBatch, setLastSongInBatch] =
		useState<QueryDocumentSnapshot<DocumentData>>();

	useEffect(() => {
		if (roomId) {
			startRoom();
		}
		async function startRoom() {
			setLoadingState("loading");
			try {
				const roomDoc = await getDoc(doc(roomsCollectionRef, roomId));
				if (!roomDoc.exists()) throw new Error("Sala no existe");

				const data = roomDoc.data() as Room;
				if (!data.song_db) throw new Error("Songs_db no existe");

				const songsColl = collection(db, data.song_db);
				const songsInfo = await getDoc(doc(songsColl, "info"));
				if (!songsInfo.exists()) throw new Error("No songs info");

				const info = songsInfo.data();
				setInfo({
					artists: info.artists,
					genres: info.genres,
					open: info.open ? true : false,
				});
				setSongsCollection(songsColl);
				setLoadingState("loaded");
			} catch (e) {
				catchErrorFunction({
					e,
					fallbackMsg: "Error en sala",
					setLoadingState: setLoadingState,
					setError: setError,
				});
			}
		}
	}, [roomId]);

	useEffect(() => {
		if (songsCollection && start) {
			querySongs();
		} else {
			setLoadingState("loaded");
		}
	}, [songsCollection]);

	const querySongs = async (
		field?: "GENERO" | "ARTISTA" | "TITULO" | "id",
		val?: string,
		lastDocRef?: QueryDocumentSnapshot<DocumentData>
	) => {
		setLoadingState("loading");
		setCurrPage(0);

		if (!songsCollection) throw new Error("no songs collection");

		const queryWithFieldValue = async (
			field: "GENERO" | "ARTISTA" | "TITULO",
			val: string
		) => {
			let whereQ: QueryFieldFilterConstraint[];
			let relevantInfo: string[];

			switch (field) {
				case "GENERO":
					relevantInfo = info.genres.filter((v) => {
						if (val === "BALADA") {
							return v.includes(val) || v.includes("B.") || v.includes("B ");
						}
						return v.includes(val);
					});
					whereQ = [where(field, "in", relevantInfo)];
					break;
				case "ARTISTA":
					relevantInfo = info.artists.filter((v) => v.includes(val));
					whereQ = [where(field, "in", relevantInfo)];
					break;
				case "TITULO":
					whereQ = [where(field, ">=", val), where(field, "<", `${val}~`)];
					break;
				default:
					whereQ = [];
					break;
			}

			setCurrQuery(whereQ);
			const q = query(
				songsCollection!,
				...whereQ,
				orderBy(field),
				limit(pageLimit)
			);
			const qcount = query(songsCollection!, ...whereQ, orderBy("ARTISTA"));
			const qcountdoc = (await getCountFromServer(qcount)).data().count;
			setNumberOfPages(Math.ceil(qcountdoc / pageLimit));
			console.log("count: ", qcountdoc);
			const { pageSongs, lastDoc } = await getSongsFromQuery(q);

			const nextq = query(
				songsCollection!,
				...whereQ,
				orderBy("ARTISTA"),
				orderBy("TITULO"),
				limit(pageLimit),
				startAfter(lastDoc)
			);
			const { pageSongs: page2Songs, lastDoc: lastDoc2 } =
				await getSongsFromQuery(nextq);

			return { pageSongs, page2Songs, lastDoc2 };
		};
		const queryAllSongs = async () => {
			const q = query(songsCollection, orderBy("ARTISTA"), limit(pageLimit));
			const { pageSongs, lastDoc } = await getSongsFromQuery(q);

			const nextq = query(
				songsCollection,
				orderBy("ARTISTA"),
				startAfter(lastDoc),
				limit(pageLimit)
			);
			const { pageSongs: page2Songs, lastDoc: lastDoc2 } =
				await getSongsFromQuery(nextq);
			return { pageSongs, page2Songs, lastDoc2 };
		};

		try {
			// "preload" next page
			if (field == "id") {
				const songq = await getDoc(doc(songsCollection, val));
				if (songq.exists()) {
					const data = songq.data();
					const song = {
						id: val,
						artist: String(data.ARTISTA),
						song_name: String(data.TITULO).toLowerCase(),
						genre: String(data.GENERO).toLowerCase(),
					} as Song;
					setPaginatedSongs({
						prev_page: [],
						curr_page: [song],
						next_page: [],
					});
					setLoadingState("loaded");
				}
				return {
					id: "",
					artist: "",
					song_name: "",
					genre: "",
				};
			}
			const { pageSongs, page2Songs, lastDoc2 } =
				field && val
					? await queryWithFieldValue(field, val)
					: await queryAllSongs();

			setPaginatedSongs({
				prev_page: [],
				curr_page: [...pageSongs],
				next_page: page2Songs,
			});
			setLastSongInBatch(lastDoc2);
			setLoadingState("loaded");
		} catch (e) {
			catchErrorFunction({
				e,
				fallbackMsg: "Error in filter",
				setLoadingState,
				setError,
			});
			// throw new Error(e)
		}
	};

	const filterByArtist = (selectedArtist: string) => {
		if (!info.artists.includes(selectedArtist)) return;
		// filterSongs("ARTISTA", selectedArtist)
		querySongs("ARTISTA", selectedArtist);
	};
	const filterByGenre = (selectedGenre: string) => {
		if (!info.genres.includes(selectedGenre)) return;
		querySongs("GENERO", selectedGenre);
	};
	const filterByID = (id: string) => {
		querySongs("id", id);
	};

	const logSongs = () => {
		console.log(paginatedSongs);
	};
	const nextPage = async () => {
		setLoadingState("loading");
		let next_songs: Song[] = [];

		if (paginatedSongs.next_page.length === pageLimit) {
			let next: Query<DocumentData>;
			if (currQuery) {
				next = query(
					songsCollection!,
					...currQuery,
					orderBy("ARTISTA"),
					startAfter(lastSongInBatch),
					limit(pageLimit)
				);
			} else {
				next = query(
					songsCollection!,
					orderBy("ARTISTA"),
					startAfter(lastSongInBatch),
					limit(pageLimit)
				);
			}
			const { pageSongs, lastDoc } = await getSongsFromQuery(next);
			setLastSongInBatch(lastDoc);
			next_songs = pageSongs;
		} else {
			next_songs = paginatedSongs.next_page.slice(pageLimit + 1);
		}
		setPaginatedSongs((prev) => {
			return {
				prev_page: [...prev.prev_page, ...prev.curr_page],
				curr_page: [...prev.next_page.slice(0, pageLimit + 1)],
				next_page: [...next_songs],
			};
		});
		setLoadingState("loaded");
		setCurrPage((c) => c + 1);
	};
	const prevPage = async () => {
		if (paginatedSongs.prev_page.length <= 0) return;
		setPaginatedSongs((prev) => {
			return {
				prev_page: [...prev.prev_page.slice(0, -pageLimit)],
				curr_page: [...prev.prev_page.slice(-pageLimit)],
				next_page: [...prev.curr_page, ...prev.next_page],
			};
		});
		setCurrPage((c) => c - 1);
	};

	return {
		paginatedSongs,
		currPage,
		prevPage,
		nextPage,
		numberOfPages,
		info,
		querySongs,
		logSongs,
		filterByArtist,
		filterByGenre,
		filterByID,
	};
};

export type UseSongsReturntype = ReturnType<typeof useSongs>;
