import "./Buttons.css"

export function PrevButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type='button' className="nextbutton"  {...props}  >
        <span className="prevButton-span"></span>
    </button>
}
export function NextButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type='button' className="nextbutton"  {...props}  >
        <span className="nextButton-span"></span>
    </button>
}

export function CancelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type='button' className="cancelButton"  {...props}  >
        <span className="cancelButton-span"></span>
    </button>
}
export function SearchButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type='button' className="searchButton"  {...props}  >
        <span className="searchButton-span"></span>
    </button>
}
