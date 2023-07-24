import { useState, useEffect } from "react";
import { TLanguages } from "../../myTypes";

function useLanguageOrLocal() {
	const [language, setLanguage] = useState<TLanguages>("es");

	useEffect(() => {
		// Get the language from local storage
		const languageFromLocalStorage: TLanguages =
			(window.localStorage.getItem("language") as TLanguages) ?? "es";

		// If the language exists in local storage, use its value
		if (languageFromLocalStorage) {
			setLanguage(languageFromLocalStorage);
		} else {
			// Otherwise, set the language based on the user's preferred language
			const preferredLanguage = navigator.language;
			if (preferredLanguage.startsWith("es")) {
				setLanguage("es");
			} else if (preferredLanguage.startsWith("it")) {
				setLanguage("it");
			} else if (preferredLanguage.startsWith("fr")) {
				setLanguage("fr");
			} else {
				setLanguage("en");
			}
		}
	}, []);

	// Function to handle language changes
	const handleLanguageChange = (newLanguage: TLanguages) => {
		// Update the state
		setLanguage(newLanguage);

		// Set the language in local storage
		window.localStorage.setItem("language", newLanguage);
	};

	return [language, handleLanguageChange] as const;
}
export default useLanguageOrLocal;
