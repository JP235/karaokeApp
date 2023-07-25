import { LoadignState } from "../myTypes";

export function catchErrorFunction({
	e,
	fallbackMsg,
	setLoadingState,
	setError,
}: {
	e: any;
	fallbackMsg: string;
	setLoadingState: (loadignState: LoadignState) => void;
	setError: (error: string | undefined) => void;
}) {
	if (e instanceof Error) {
		console.log(e);

		setError(e.message);
	} else {
		setError(fallbackMsg);
	}
	setLoadingState("error");
}