import "./AdminRoom.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PlusButton, CancelButton } from "../../../components/Buttons/Buttons";
import SongsQueue from "../../../components/SongsQueue";
import DialogWrapped from "../../../components/DialogWrapped/DialogWrapped";
import * as text from "../../../Language/text";
import { useLanguage, usePageName } from "../../../Contexts";
import FilterSongsList from "../../../components/FilterSongsList/FilterSongsList";

const AdminRoom = () => {
	const params = useParams();
	const roomId = params.roomId;
	const [addingSong, setAddingSong] = useState(false);
	const { language } = useLanguage();
	const { setPageName } = usePageName();

	if (!roomId) {
		return <h1 className="admin no-room">{text.roomNotFound[language]}</h1>;
	}

	useEffect(() => {
		setPageName(`Admin ${text.room[language]} ${roomId}`);
	}, [language, roomId]);

	return (
		<>
			<SongsQueue roomId={roomId} canEdit={true}>
				<PlusButton
					className="add-song-to-queue"
					onClick={() => setAddingSong(true)}
				/>
			</SongsQueue>
			{addingSong && (
				<AdminAddToQueueDialog
					roomId={roomId}
					open={addingSong}
					close={() => setAddingSong(false)}
				/>
			)}
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
	const { language } = useLanguage();

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
				<FilterSongsList roomId={roomId} admin/>
			</DialogWrapped>
		</div>
	);
}
