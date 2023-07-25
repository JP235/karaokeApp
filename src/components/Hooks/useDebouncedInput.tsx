import { useState, useEffect } from "react";

function useDebounced<T>(value: T, delay?: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay ?? 500]);

	return debouncedValue;
}
export default useDebounced;
