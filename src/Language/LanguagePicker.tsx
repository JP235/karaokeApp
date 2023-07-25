import { useState, useEffect } from "react";
import { useLanguage } from "../Contexts";
import { HambButton } from "../components/Buttons/Buttons";
import { TLanguages } from "../myTypes";
import { clickAway } from "../components/HelperFunctions";
import { Language } from "./text";

function LanguagePicker() {
	const [show, setShow] = useState(false);
	const { language, setLanguage } = useLanguage();

	useEffect(() => {
		document.addEventListener("click", (e) =>
			clickAway(e, "language-hamb", setShow)
		);

		return () => {
			document.removeEventListener("click", (e) =>
				clickAway(e, "language-hamb", setShow)
			);
		};
	}, []);

	return (
		<>
			<div className="language-picker">
				<HambButton
					className="language-hamb"
					onClick={() => setShow((p) => !p)}
					title={language}
				/>
				<div className={show ? "language-selector show" : "language-selector"}>
					<div
						className="selector-buttons"
						n-langs={Object.keys(Language).length}
					>
						{Object.keys(Language).map((key, i) => {
							const k = key as TLanguages;
							return (
								<span key={i}>
									<button
										type="button"
										className={language === k ? "selected-lang" : ""}
										key={i}
										onClick={() => setLanguage(k)}
									>
										{Language[k]}
									</button>
									<span></span>
								</span>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}
export default LanguagePicker;
