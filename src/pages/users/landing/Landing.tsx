import "./Landing.css";

import * as text from "../../../Language/text";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { roomsCollectionRef } from "../../../firebase-config";
import { changeRoomCode } from "../../../components/HelperFunctions";
import { useErrors, useLanguage, useLoadingState } from "../../../Contexts";
import { catchErrorFunction } from "../../../components/catchErrorFunction";
import { LoadingError } from "../../../components/LoadingError";

function Landing() {
	const navigate = useNavigate();
	const { setError } = useErrors();
	const { setLoadingState } = useLoadingState();
	const { language } = useLanguage();
	const [roomCode, setRoomCode] = useState("");
	const welcomeText = text.landing[language].split(" ");

	const findRoom = () => {
		setError(undefined);
		setLoadingState("loading");
		getDoc(doc(roomsCollectionRef, roomCode))
			.then((d) => {
				if (d.exists()) {
					const url = "room/" + roomCode;
					navigate(url);
				} else {
					setLoadingState("loaded");
					setError("Sala no encontrada");
				}
			})
			.catch((e) => {
				catchErrorFunction({
					e,
					fallbackMsg: "Error finding room",
					setLoadingState: setLoadingState,
					setError: setError,
				});
			});
	};

	return (
		<>
			<div className="user-landing">
				<span className="landingText text-border-1px">
					{welcomeText.map((w, i) => (
						<span key={i} className="word">
							{w}
						</span>
					))}
				</span>
				<div className="room-code-container">
					<form
						className="room-code-form"
						onSubmit={(event) => {
							event.preventDefault();
							findRoom();
						}}
					>
						<input
							className="set-room"
							type="number"
							value={roomCode}
							placeholder={text.roomCode[language]}
							onChange={(event) => {
								setRoomCode(changeRoomCode(event.target.value));
							}}
						/>

						<button className="set-room button" type="submit">
							{text.sentButton[language]}
						</button>
					</form>
					<div className="loading-error-container">
						<LoadingError />
					</div>
				</div>
			</div>
			<div className="admin-link">
				<a href="/admin">Admin</a>
			</div>
		</>
	);
}

export default Landing;
