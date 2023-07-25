import { useEffect, useState } from "react";
import AddToQueueForm from "./AddToQueueForm/AddToQueueForm";
import FilterSongsForm from "./FilterSongsForm/FilterSongsForm";
import SongsTable from "./SongsList/SongsList";
import { useSongs } from "../Hooks/useSongs";
import * as text from "../../Language/text";
import { useLanguage } from "../../Contexts";
import { Song } from "../../myTypes";
import useDebounced from "../Hooks/useDebouncedInput";

function FilterSongsList({
	roomId,
	admin,
}: {
	roomId?: string;
	admin?: boolean;
}) {
	const songs = useSongs(roomId, admin ? false : true);
	const { info, filterByArtist, filterByGenre, filterByID, filterByTitle } =
		songs;
	const { language } = useLanguage();
	const [filter, setFilter] = useState(true);
	const [selectedId, setSelectedId] = useState("");
	const [selectedArtist, setSelectedArtist] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("");
	const [selectedTitle, setSelectedTitle] = useState("");
	const [selectedSong, setSelectedSong] = useState<Song>();

	const debouncedTitle = useDebounced(selectedTitle);

	useEffect(() => {
		debouncedTitle && songs.filterByTitle(selectedTitle);
	}, [debouncedTitle]);

	useEffect(() => {
		if (songs.currQuery[0] == "id") {
			setSelectedArtist("");
			setSelectedGenre("");
			setSelectedTitle("");
			setSelectedId(songs.currQuery[1]);
		} else if (songs.currQuery[0] == "ARTISTA") {
			setSelectedTitle("");
			setSelectedId("");
			setSelectedGenre("");
			setSelectedArtist(songs.currQuery[1]);
		} else if (songs.currQuery[0] == "GENERO") {
			setSelectedArtist("");
			setSelectedId("");
			setSelectedTitle("");
			setSelectedGenre(songs.currQuery[1]);
		} else if (songs.currQuery[0] == "TITULO") {
			setSelectedArtist("");
			setSelectedId("");
			setSelectedGenre("");
			setSelectedTitle(songs.currQuery[1]);
		}
	}, [songs.currQuery[0], songs.currQuery[1]]);

	return (
		<>
			<div
				onClick={() => setFilter(true)}
				className={filter ? "filter-songs" : "filter-songs collapse"}
			>
				<div className="filter-forms">
					<FilterSongsForm
						onSubmit={(e) => {
							e.preventDefault();
							setSelectedGenre("");
							setSelectedArtist("");
							filterByTitle(selectedTitle);
						}}
						selected={selectedTitle}
						setSelected={setSelectedTitle}
						title={text.searchByTitle[language]}
					/>

					<FilterSongsForm
						onSubmit={(e) => {
							e.preventDefault();
							setSelectedGenre("");
							setSelectedTitle("");
							filterByArtist(selectedArtist);
						}}
						dataHints={songs.info.artists}
						selected={selectedArtist}
						setSelected={setSelectedArtist}
						title={text.filterByArtist[language]}
					/>
					<FilterSongsForm
						onSubmit={(e) => {
							e.preventDefault();
							setSelectedArtist("");
							setSelectedTitle("");
							filterByGenre(selectedGenre);
						}}
						dataHints={info.genres}
						selected={selectedGenre}
						setSelected={setSelectedGenre}
						title={text.filterByGenre[language]}
					/>
					{admin && (
						<FilterSongsForm
							onSubmit={(e) => {
								e.preventDefault();
								if (selectedId === "") {
									return;
								}
								setSelectedArtist("");
								setSelectedGenre("");
								filterByID(selectedId);
							}}
							selected={selectedId}
							setSelected={setSelectedId}
							title={text.searchByID[language]}
						/>
					)}
				</div>
			</div>
			{roomId && (
				<>
					<SongsTable
						setSelectedSong={setSelectedSong}
						roomId={roomId}
						songs={songs}
					/>

					<AddToQueueForm
						song={selectedSong}
						close={() => {
							setSelectedSong(undefined);
						}}
						roomId={roomId}
						open={selectedSong ? true : false}
					/>
				</>
			)}
		</>
	);
}
export default FilterSongsList;
