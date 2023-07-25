import { useState } from "react";
import "./Buttons.css";

interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	baseClassName: string;
}

function MyButton({ baseClassName, className, ...props }: MyButtonProps) {
	return (
		<button
			type="button"
			className={`customButton ${baseClassName} ${className || ""}`}
			{...props}
		>
			<span className={`${baseClassName}-span`}></span>
		</button>
	);
}

export function GoogleButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="googleButton" {...props} />;
}
export function PrevButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="prevButton" {...props} />;
}
export function NextButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="nextButton" {...props} />;
}

export function CancelButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="cancelButton" {...props} />;
}

export function SearchButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="searchButton" {...props} />;
}
export function DeleteButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="deleteButton" {...props} />;
}

export function DoneButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="doneButton" {...props} />;
}
export function PlusButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return <MyButton baseClassName="plusButton" {...props} />;
}
export function HambButton(
	props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
	return (
		<button type="button" {...props}>
			<div className="hamb-bar"></div>
			<div className="hamb-bar"></div>
			<div className="hamb-bar"></div>
		</button>
	);
}

interface OnOffButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	onText: string;
	offText: string;
	onToggle: () => void;
}

export function OnOffButton({
	onText,
	offText,
	onToggle,
	...props
}: OnOffButtonProps) {
	const [isOn, setIsOn] = useState(true);

	const handleToggle = () => {
		setIsOn(!isOn);
		onToggle();
	};

	return (
		<button
			{...props}
			onClick={handleToggle}
            type="button"
			className={`onOffButton ${props.className || ""}`}
		>
			{isOn ? onText : offText}
		</button>
	);
}
