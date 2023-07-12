import "./NavBar.css";
import { useContext } from "react";
import { NavTitleStateContext } from "../../Contexts";
import LanguagePicker from "../../Language/LanguagePicker";

export const Navbar = () => {
	const { navTitle } = useContext(NavTitleStateContext);
	return (
		<nav className="navbar">
			<div className="navbar-title">{navTitle}</div>
			<LanguagePicker />
		</nav>
	);
};
