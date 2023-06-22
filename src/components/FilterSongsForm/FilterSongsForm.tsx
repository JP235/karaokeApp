import "./FilterSongsForm.css"

import { CancelButton, SearchButton } from "../Buttons/Buttons";

interface FilterFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    dataHints: string[];
    selected: string;
    setSelected: (value: string) => void;
    title: string

}
function FilterSongsForm({ onSubmit, dataHints, selected, setSelected, title }: FilterFormProps) {
    return (
        <form className="filter-songs-form"
            onSubmit={onSubmit}>
            <label>
                <CancelButton title={`cancel ${title}`} onClick={() => { setSelected("") }} />
                <input type="text"
                    value={selected}
                    onChange={(event) => {
                        setSelected(event.target.value)
                    }}
                    list={title}
                    placeholder={`${title}`} />
                <SearchButton
                    disabled={!dataHints.includes(selected)}
                    type="submit"
                    title={`${title}`} />

                <datalist id={title}>
                    {dataHints.map((val) => (
                        <option key={val} value={val} />
                    ))}
                </datalist>
            </label>
        </form>
    )
}

export default FilterSongsForm;
