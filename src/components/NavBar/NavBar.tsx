import { useNavTitle } from "../../Contexts";
import LanguagePicker from "../../Language/LanguagePicker";
import "./NavBar.css";

export const Navbar = () => {
	const { navTitle } = useNavTitle()
	return (
		<nav className="navbar">
			<div className="navbar-title">{navTitle}</div>
			<LanguagePicker />
		</nav>
	);
};
