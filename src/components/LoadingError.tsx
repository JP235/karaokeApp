import { useErrors, useLoadingState } from "../Contexts";

export function LoadingError() {
	const { error } = useErrors();
	const { loadingState } = useLoadingState();
	return (
		<>
			{loadingState === "loading" && <span className="loading" />}
			{error && <div className="error-msg">{error}</div>}
		</>
	);
}