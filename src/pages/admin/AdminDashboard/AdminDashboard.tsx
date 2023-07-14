import { FormEvent, useState } from "react";
import {
	useErrors,
	useLanguage,
	useLoadingState,
	useUserAuth,
} from "../../../Contexts";
import "./AdminDashboard.css";
import {
	roomsCollectionRef,
	usersCollectionRef,
} from "../../../firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { catchErrorFunction } from "../../users/landing/UserLanding";
import { changeRoomCode } from "../../../components/HelperFunctions";
import * as text from "../../../Language/text";

function AdminDashboard() {
	const navigate = useNavigate();
	const { setError } = useErrors();
	const { language } = useLanguage();
	const { setLoadingState } = useLoadingState();
	const { userData, signout } = useUserAuth();
	const [creatingRoom, setCreatigRoom] = useState(false);
	const [roomCode, setRoomCode] = useState(String(generateRandomNumber()));
	const [roomName, setRoomName] = useState("Karaoke");

	function handleLogout() {
		signout(() => {
			navigate("/");
		});
	}

	const createRoom = async () => {
		try {
			await setDoc(doc(roomsCollectionRef, String(roomCode)), {
				queue: [],
				created_by: userData.name,
				song_db: userData.songs_db,
			});
			await setDoc(
				doc(usersCollectionRef, userData.email),
				{ created_rooms: userData.created_rooms + 1, active_room: roomCode },
				{ merge: true }
			);
			const url = "/admin/" + roomCode;
			navigate(url);
		} catch (e) {
			catchErrorFunction({
				e,
				fallbackMsg: "Error creating room",
				setLoadingState: setLoadingState,
				setError: setError,
			});
		}
	};
	const handleCreateRoomSubmit = (event: FormEvent) => {
		event.preventDefault();
		createRoom();
	};

	return (
		<>
			<div className="greeting">
				<p>
					{text.hello[language]} {userData.name}{" "}
				</p>
				<button onClick={() => handleLogout()}>Logout</button>
				<p>
					{text.createdRooms[language]}: {userData.created_rooms}{" "}
				</p>
				{userData.active_room === "-1" ? (
					<p>{text.noActiveRoom[language]} </p>
				) : (
					<p>
						{text.activeRoomCode[language]}: {userData.active_room}{" "}
					</p>
				)}
			</div>
			{(userData.permissions === "active" ||
				userData.permissions === "ALL") && (
				<div className="admin-dashboard">
					{userData.active_room === "-1" ? (
						<button className="new-room" onClick={() => setCreatigRoom(true)}>
							{text.createRoom[language]}
						</button>
					) : (
						<button
							className="goToRoom"
							onClick={() => {
								const url = "/admin/" + userData.active_room;
								navigate(url);
							}}
						>
							{text.goToActiveRoom[language]}
						</button>
					)}
				</div>
			)}

			<dialog
				id="create-room-dialog"
				className={
					creatingRoom ? "create-room-dialog open" : "create-room-dialog"
				}
				open={creatingRoom}
			>
				<div>
					<h1>{text.createRoom[language]}</h1>
				</div>
				<form onSubmit={handleCreateRoomSubmit}>
					<label>
						<input
							className="labelInput"
							type="number"
							value={roomCode}
							onChange={(event) => {
								setRoomCode(changeRoomCode(event.target.value));
							}}
						/>
						<span className="labelName">{text.code[language]}</span>
					</label>
					<label>
						<input
							className="labelInput"
							type="text"
							value={roomName}
							onChange={(event) => setRoomName(event.target.value)}
						/>
						<span className="labelName">{text.name[language]}</span>
					</label>
					<div className="create-room-buttons">
						<button
							type="button"
							className="create-room-cancel"
							onClick={() => setCreatigRoom(false)}
						>
							{text.cancel[language]}
						</button>
						<button type="submit" value="Create" className="create-room-create">
							{text.create[language]}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}

export default AdminDashboard;

function generateRandomNumber() {
	return Math.floor(1000 + Math.random() * 9000);
}
