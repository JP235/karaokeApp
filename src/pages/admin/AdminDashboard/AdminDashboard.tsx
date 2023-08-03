import { FormEvent, useEffect, useState } from "react";
import {
	useErrors,
	useLanguage,
	useLoadingState,
	usePageName,
	useUserAuth,
} from "../../../Contexts";
import "./AdminDashboard.css";
import {
	roomsCollectionRef,
	usersCollectionRef,
} from "../../../firebase-config";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { changeRoomCode, generateRandomNumber } from "../../../components/HelperFunctions";
import * as text from "../../../Language/text";
import { catchErrorFunction } from "../../../components/catchErrorFunction";
import DialogWrapped from "../../../components/DialogWrapped/DialogWrapped";

function AdminDashboard() {
	const navigate = useNavigate();
	const { setError } = useErrors();
	const { language } = useLanguage();
	const { setLoadingState } = useLoadingState();
	const { userData, signout: fireSingOut, refreshUserData } = useUserAuth();
	const [creatingRoom, setCreatigRoom] = useState(false);
	const [roomCode, setRoomCode] = useState(String(generateRandomNumber()));
	const [roomName, setRoomName] = useState("Karaoke");
	const { setPageName } = usePageName();

	useEffect(() => {
		setPageName("KaraokeApp - Admin");
	}, []);

	const createRoom = async () => {
		try {
			await setDoc(doc(roomsCollectionRef, String(roomCode)), {
				queue: [],
				created_by: userData.name,
				song_db: userData.songs_db,
			});
			const userRef = doc(usersCollectionRef, userData.email);
			await updateDoc(userRef, {
				created_rooms: userData.created_rooms + 1,
				active_room: roomCode,
			});
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

	const deleteRoom = async () => {
		try {
			await deleteDoc(doc(roomsCollectionRef, String(userData.active_room)));
			const userRef = doc(usersCollectionRef, userData.email);
			updateDoc(userRef, {
				active_room: "-1",
			}).then(() => {
				refreshUserData();
			});
		} catch (e) {
			catchErrorFunction({
				e,
				fallbackMsg: "Error deleting room",
				setLoadingState: setLoadingState,
				setError: setError,
			});
		}
	};

	function handleLogout() {
		fireSingOut(() => {});
	}
	const handleCreateRoomSubmit = (event: FormEvent) => {
		event.preventDefault();
		createRoom();
	};
	return (
		<div className="admin-dash">
			<header className="admin-dash-header">
				<h1>
					{text.hello[language]} {userData.name}!
				</h1>
				<div className="admin-dash-actions">
					<button onClick={() => handleLogout()}>Logout</button>
					{/* <button className="admin-dash-actions-button">Actions</button> */}
				</div>
			</header>
			<main className="admin-dash-body">
				<p>
					{text.createdRooms[language]}: {userData.created_rooms}{" "}
				</p>
				{userData.active_room !== "-1" ? (
					<>
						<p>
							{text.activeRoomCode[language]}: {userData.active_room}
						</p>
						<button
							className="goToRoom"
							onClick={() => {
								const url = "/admin/" + userData.active_room;
								navigate(url);
							}}
						>
							{text.goToActiveRoom[language]}
						</button>
						<button onClick={() => deleteRoom()}>Delete Room</button>
					</>
				) : (
					<>
						<p>{text.noActiveRoom[language]}</p>
						{userData.permissions === "active" && (
							<button className="new-room" onClick={() => setCreatigRoom(true)}>
								{text.createRoom[language]}
							</button>
						)}
					</>
				)}
				<DialogWrapped
					id="create-room-dialog"
					className={
						creatingRoom ? "create-room-dialog open" : "create-room-dialog"
					}
					open={creatingRoom}
					onClose={() => setCreatigRoom(false)}
				>
					<div>
						<h1>{text.createRoom[language]}</h1>
					</div>
					<form className="create-room-form" onSubmit={handleCreateRoomSubmit}>
						<label className="label-span-input">
							<span className="labelName">{text.code[language]}</span>
							<input
								className="labelInput input-without-arrow"
								type="number"
								value={roomCode}
								onChange={(event) => {
									setRoomCode(changeRoomCode(event.target.value));
								}}
							/>
						</label>
						<label className="label-span-input">
							<span className="labelName">{text.name[language]}</span>
							<input
								className="labelInput input-without-arrow"
								type="text"
								value={roomName}
								onChange={(event) => setRoomName(event.target.value)}
							/>
						</label>
						<div className="create-room-buttons">
							<button
								type="button"
								className="create-room-cancel"
								onClick={() => setCreatigRoom(false)}
							>
								{text.cancel[language]}
							</button>
							<button
								type="submit"
								value="Create"
								className="create-room-create"
							>
								{text.create[language]}
							</button>
						</div>
					</form>
				</DialogWrapped>
			</main>
		</div>
	);
}

export default AdminDashboard;

