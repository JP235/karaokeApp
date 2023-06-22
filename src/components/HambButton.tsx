function HambButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type='button' {...props}  >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
        </button>)
}

export default HambButton