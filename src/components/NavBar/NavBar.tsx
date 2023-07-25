import LanguagePicker from "../../Language/LanguagePicker";
import "./NavBar.css";
import { useEffect, useState } from "react";

export const Navbar = () => {
	const [isTop, setIsTop] = useState(true);

	const hideNavbar = () => {
		(document.querySelector(".navbar") as HTMLElement).style.top = "-4rem";
	};

	const showNavbar = () => {
		(document.querySelector(".navbar") as HTMLElement).style.top = "0";
	};

	// useEffect(() => {
	//   const onScroll = () => {
	//     let currentPosition = window.pageYOffset;
	//     if (currentPosition === 0) {
	//       setIsTop(true);
	//     } else {
	//       setIsTop(false);
	//     }
	//   };
	//   document.addEventListener('scroll', onScroll);
	//   return () => document.removeEventListener('scroll', onScroll);
	// }, []);

	// useEffect(() => {
	// 	isTop ? showNavbar() : hideNavbar();
	// }, [isTop]);

	return (
		<nav className="navbar">
			<div className="navbar-title">
				<a href="/">KaraokeApp</a>
			</div>
			<LanguagePicker />
		</nav>
	);
};
