import "./DialogWrapped.css";
import { ReactNode, useRef, useEffect } from "react";

interface DialogWrappedProps extends React.HTMLAttributes<HTMLDialogElement> {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

function DialogWrapped({
	open,
	onClose,
	children,
	...props
}: DialogWrappedProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dialogRef.current &&
				!dialogRef.current.contains(event.target as Node)
			) {
				event.stopPropagation();
				onClose();
			}
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open, onClose]);

	return (
		<>
			{open && <div className="dialog-backdrop" />}
			<dialog ref={dialogRef} open={open} {...props}>
				{children}
			</dialog>
		</>
	);
}
export default DialogWrapped;
