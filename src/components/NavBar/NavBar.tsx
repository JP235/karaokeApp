import LanguagePicker from "../../Language/LanguagePicker";
import "./NavBar.css";

export const Navbar = () => {
	return (
		<nav className="navbar">
			<div className="navbar-title">KaraokeApp</div>
			<LanguagePicker />
		</nav>
	);
};
