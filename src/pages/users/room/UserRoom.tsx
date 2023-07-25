import "./UserRoom.css";
import { useParams } from "react-router-dom";
import { LoadingError } from "../landing/UserLanding";
import * as text from "../../../Language/text";
import { useLanguage, usePageName } from "../../../Contexts";
import { useEffect } from "react";
import FilterSongsList from "../../../components/FilterSongsList/FilterSongsList";

function UserRoom() {
	const { roomId } = useParams();

	const { language } = useLanguage();
	const { setPageName } = usePageName();

	useEffect(() => {
		setPageName(`${text.room[language]} ${roomId}`);
	}, [language, roomId]);

	return (
		<div className="user-room">
			<LoadingError />
			<div className="user-room-content-wrapper">
				{/* <button onClick={() => logSongs()}>log</button> */}
				<FilterSongsList roomId={roomId} />
			</div>
		</div>
	);
}

export default UserRoom;
