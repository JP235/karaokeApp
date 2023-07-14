import {
	CollectionReference,
	DocumentData,
	QueryDocumentSnapshot,
	getDoc,
	doc,
	collection,
	where,
	query,
	orderBy,
	limit,
	getCountFromServer,
	startAfter,
	QueryCompositeFilterConstraint,
	QueryNonFilterConstraint,
	QueryFieldFilterConstraint,
	or,
	and,
} from "firebase/firestore";
import { useContext, useState, useEffect } from "react";
import { LoadingStateContext, ErrorsContext } from "../../Contexts";
import { roomsCollectionRef, db } from "../../firebase-config";
import { Song, Room } from "../../myTypes";
import { catchErrorFunction } from "../../pages/users/landing/UserLanding";
import { getSongsFromQuery } from "../HelperFunctions";

type QueryConstrs = {
	["CompositeFilt"]: QueryCompositeFilterConstraint | null;
	["NonFiltConsts"]: QueryNonFilterConstraint[];
	["FiltConsts"]: QueryFieldFilterConstraint[];
};

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
	const [pageLimit, setPageLimit] = useState(30);
	const [numberOfPages, setNumberOfPages] = useState<number>();

	const [songsCollection, setSongsCollection] =
		useState<CollectionReference<DocumentData>>();
	const [currPage, setCurrPage] = useState(0);
	const [currConstraints, setCurrConstraints] = useState<QueryConstrs>({
		FiltConsts: [],
		CompositeFilt: null,
		NonFiltConsts: [],
	});

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
			startQuery();
		} else {
			setLoadingState("loaded");
		}
	}, [songsCollection]);

	const getFromId = async (val: string) => {
		if (!songsCollection) throw new Error("no songs collection");
		const songq = await getDoc(doc(songsCollection, val));
		if (songq.exists()) {
			const data = songq.data();
			const song = {
				id: val,
				artist: String(data.ARTISTA),
				song_name: String(data.TITULO).toLowerCase(),
				genre: String(data.GENERO).toLowerCase(),
			} as Song;
			return song;
		}
		const s: Song = {
			id: "-",
			song_name: "-",
			artist: "-",
			genre: "-",
		};
		return s;
	};

	const makeConstraints = (
		field?: "GENERO" | "ARTISTA" | "TITULO",
		val?: string
	) => {
		let constraints: QueryConstrs = {
			CompositeFilt: null,
			FiltConsts: [],
			NonFiltConsts: [limit(pageLimit)],
		};

		if (!field || !val) {
			return constraints;
		}

		let relevantInfo: string[];

		switch (field) {
			case "GENERO":
				relevantInfo = info.genres.filter((v) => {
					if (val === "BALADA") {
						return v.includes(val) || v.includes("B.") || v.includes("B ");
					}
					return v.includes(val);
				});
				constraints.FiltConsts = [where(field, "in", relevantInfo)];
				constraints.NonFiltConsts = [
					orderBy("ARTISTA"),
					orderBy("TITULO"),
					limit(pageLimit),
				];
				break;
			case "ARTISTA":
				relevantInfo = info.artists.filter((v) => v.includes(val));
				if (relevantInfo.length > 0) {
					constraints.FiltConsts = [where(field, "in", relevantInfo)];
					constraints.NonFiltConsts = [
						orderBy("ARTISTA"),
						orderBy("TITULO"),
						limit(pageLimit),
					];
				} else {
					constraints.CompositeFilt = or(
						and(
							where(field, ">=", val.toUpperCase()),
							where(field, "<=", `${val.toUpperCase()}~`)
						),
						and(
							where(field, ">=", `THE ${val.toUpperCase()}`),
							where(field, "<=", `THE ${val.toUpperCase()}~`)
						),
						and(
							where(field, ">=", `LOS ${val.toUpperCase()}`),
							where(field, "<=", `LOS ${val.toUpperCase()}~`)
						),
						and(
							where(field, ">=", `LAS ${val.toUpperCase()}`),
							where(field, "<=", `LAS ${val.toUpperCase()}~`)
						),
						and(
							where(field, ">=", `LA ${val.toUpperCase()}`),
							where(field, "<=", `LA ${val.toUpperCase()}~`)
						)
					);
					constraints.NonFiltConsts = [
						orderBy("ARTISTA"),
						orderBy("TITULO"),
						limit(pageLimit),
					];
				}
				break;
			case "TITULO":
				constraints.FiltConsts = [
					where(field, ">=", val.toUpperCase()),
					where(field, "<=", `${val.toUpperCase()}~`),
				];
				constraints.NonFiltConsts = [orderBy("TITULO")];
				break;
			default:
				break;
		}

		return constraints;
	};

	const makeQuery = async (constraints: QueryConstrs) => {
		if (!songsCollection) throw new Error("no songs collection");
		const q =
			constraints.CompositeFilt != null
				? query(
						songsCollection,
						constraints.CompositeFilt,
						...constraints.NonFiltConsts
				  )
				: query(
						songsCollection,
						...constraints.FiltConsts,
						...constraints.NonFiltConsts
				  );

		const { pageSongs, lastDoc } = await getSongsFromQuery(q);

		return { pageSongs, lastDoc };
	};

	const startQuery = async (
		field?: "GENERO" | "ARTISTA" | "TITULO",
		val?: string
	) => {
		setLoadingState("loading");
		setCurrPage(0);

		if (!songsCollection) throw new Error("no songs collection");

		try {
			const constraints = makeConstraints(field, val);

			const qcount =
				constraints.CompositeFilt != null
					? query(songsCollection, constraints.CompositeFilt)
					: query(songsCollection, ...constraints.FiltConsts);

			const qcountdoc = (await getCountFromServer(qcount)).data().count;
			// console.log(qcountdoc);

			setNumberOfPages(Math.ceil(qcountdoc / pageLimit));
			setCurrConstraints(constraints);
			const { pageSongs, lastDoc } = await makeQuery(constraints);

			setLastSongInBatch(lastDoc);
			setPaginatedSongs({
				prev_page: [],
				curr_page: [...pageSongs],
				next_page: [],
			});

			setLoadingState("loaded");
		} catch (e) {
			catchErrorFunction({
				e,
				fallbackMsg: "Error in filter",
				setLoadingState,
				setError,
			});
		}
	};

	const nextPage = async () => {
		setLoadingState("loading");
		try {
			if (
				paginatedSongs.next_page.length === 0 &&
				lastSongInBatch != undefined
			) {
				const { pageSongs, lastDoc } = await makeQuery({
					...currConstraints,
					NonFiltConsts: [
						...currConstraints.NonFiltConsts,
						startAfter(lastSongInBatch),
					],
				});

				if (pageSongs.length === 0) return;
				setLastSongInBatch(lastDoc);
				setPaginatedSongs((prev) => {
					return {
						prev_page: [...prev.prev_page, ...prev.curr_page],
						curr_page: [...pageSongs],
						next_page: [],
					};
				});
			} else {
				setPaginatedSongs((prev) => {
					return {
						prev_page: [...prev.prev_page, ...prev.curr_page],
						curr_page: [...prev.next_page.slice(0, pageLimit)],
						next_page: [...prev.next_page.slice(pageLimit)],
					};
				});
			}
			setCurrPage((c) => c + 1);
		} catch (error) {
			console.log(error);
		}
		setLoadingState("loaded");
	};

	const filterByTitle = (title: string) => {
		startQuery("TITULO", title);
	};
	const filterByArtist = (selectedArtist: string) => {
		startQuery("ARTISTA", selectedArtist);
	};
	const filterByGenre = (selectedGenre: string) => {
		if (!info.genres.includes(selectedGenre)) return;
		startQuery("GENERO", selectedGenre);
	};
	const filterByID = async (id: string) => {
		const song = await getFromId(id);
		setPaginatedSongs({
			prev_page: [],
			curr_page: [song],
			next_page: [],
		});
		setLoadingState("loaded");
	};

	const logSongs = () => {
		console.log(paginatedSongs);
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
		setPageLimit,
		info,
		logSongs,
		filterByArtist,
		filterByGenre,
		filterByID,
		filterByTitle,
	};
};

export type UseSongsReturntype = ReturnType<typeof useSongs>;
