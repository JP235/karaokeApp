import "./AdminRoom.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddToQueueForm from "../../../components/AddToQueueForm/AddToQueueForm";
import { PlusButton, CancelButton } from "../../../components/Buttons/Buttons";
import FilterSongsForm from "../../../components/FilterSongsForm/FilterSongsForm";
import { useSongs } from "../../../components/Hooks/useSongs";
import SongsList from "../../../components/SongsList";
import SongsQueue from "../../../components/SongsQueue";
import { Song } from "../../../myTypes";
import DialogWrapped from "../../../components/DialogWrapped/DialogWrapped";
import * as text from "../../../Language/text";
import { useLanguage, useNavTitle } from "../../../Contexts";

const AdminRoom = () => {
	const params = useParams();
	const roomId = params.roomId;
	const [addingSong, setAddingSong] = useState(false);
	const { language } = useLanguage();
	const { setNavTitle } = useNavTitle();

	if (!roomId) {
		return <h1 className="admin no-room">{text.roomNotFound[language]}</h1>;
	}

	useEffect(() => {
		setNavTitle(
			<>
				Admin {text.room[language]} {roomId}
			</>
		);
	}, [language, roomId]);

	return (
		<>
			<SongsQueue roomId={roomId} canEdit={true}>
				<PlusButton
					className="add-song-to-queue"
					onClick={() => setAddingSong(true)}
				/>
			</SongsQueue>
			<AdminAddToQueueDialog
				roomId={roomId}
				open={addingSong}
				close={() => setAddingSong(false)}
			/>
		</>
	);
};

export default AdminRoom;

function AdminAddToQueueDialog({
	roomId,
	open,
	close,
}: {
	roomId: string;
	open: boolean;
	close: VoidFunction;
}) {
	const songs = useSongs(roomId);
	const { language } = useLanguage();
	const { info, filterByArtist, filterByGenre, filterByID } = songs;
	const [selectedId, setSelectedId] = useState("");
	const [selectedArtist, setSelectedArtist] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("");
	const [selectedSong, setSelectedSong] = useState<Song>();

	return (
		<div className="admin-add-song-container">
			<DialogWrapped
				id="admin-queue-song-dialog"
				className={
					open ? "admin-queue-song-dialog open" : "admin-queue-song-dialog"
				}
				open={open}
				onClose={() => close()}
			>
				<div className="admin-add-song-header">
					<h1>{text.addSong[language]}</h1>
					<CancelButton
						className="close-admin-add-song"
						onClick={() => close()}
					/>
				</div>
				<div className="filter-forms">
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
					<FilterSongsForm
						onSubmit={(e) => {
							e.preventDefault();
							if (selectedArtist === "") {
								return;
							}
							setSelectedGenre("");
							setSelectedId("");
							filterByArtist(selectedArtist);
						}}
						dataHints={info.artists}
						selected={selectedArtist}
						setSelected={setSelectedArtist}
						title={text.filterByArtist[language]}
					/>
					<FilterSongsForm
						onSubmit={(e) => {
							e.preventDefault();
							if (selectedGenre === "") {
								return;
							}
							setSelectedArtist("");
							setSelectedId("");
							filterByGenre(selectedGenre);
						}}
						dataHints={info.genres}
						selected={selectedGenre}
						setSelected={setSelectedGenre}
						title={text.filterByGenre[language]}
					/>
				</div>
				<SongsList
					songs={songs}
					setSelectedSong={setSelectedSong}
					roomId={roomId}
				/>
				<AddToQueueForm
					song={selectedSong}
					admin={true}
					onSubmit={close}
					open={selectedSong !== undefined && selectedSong.song_name !== "-"}
					close={() => {
						setSelectedSong(undefined);
					}}
					roomId={roomId}
				/>
			</DialogWrapped>
		</div>
	);
}
