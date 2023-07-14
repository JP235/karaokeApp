import { useRef, useEffect } from "react";
import { useLanguage, useLoadingState } from "../Contexts";
import { Song } from "../myTypes";
import { PrevButton, NextButton } from "./Buttons/Buttons";
import { UseSongsReturntype } from "./Hooks/useSongs";
import * as text from "../Language/text";

interface SongsTableParams {
	songs: UseSongsReturntype;
	roomId: string;
	setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>;
}

function SongsTable({ songs, setSelectedSong }: SongsTableParams) {
	const tableRef = useRef<HTMLTableElement>(null);
	const { paginatedSongs, currPage, prevPage, nextPage, numberOfPages } = songs;
	const { loadingState } = useLoadingState();
	const { language } = useLanguage();
	useEffect(() => {
		if (tableRef.current) {
			tableRef.current.scrollTop = -10;
		}
	}, [currPage]);

	return (
		<div ref={tableRef} className="songs-table">
			<table id="song-list-table" className="song-list">
				<caption>
					<h3 className="header">{text.songs[language]}</h3>
				</caption>
				<thead>
					<tr>
						<th data-cell={text.artist[language]}>{text.artist[language]}</th>
						<th data-cell={text.title[language]}>{text.title[language]}</th>
						{/* <th data-cell="Genero">{text.genre[language]}</th> */}
					</tr>
				</thead>
				<tbody>
					{paginatedSongs.curr_page.map((s, index) => {
						return (
							<tr key={index} onClick={() => setSelectedSong(s)}>
								<td data-cell={text.artist[language]}>{s.artist}</td>
								<td data-cell={text.title[language]}>{s.song_name}</td>
								{/* <td data-cell={text.genre[language]}>{s.genre}</td> */}
							</tr>
						);
					})}
					{paginatedSongs.curr_page.length === 0 && (
						<tr>
							<td style={{ textAlign: "center", fontStyle: "italic" }}>--</td>
							<td style={{ textAlign: "center", fontStyle: "italic" }}>--</td>
							{/* <td style={{ textAlign: "center", fontStyle: "italic" }} >--</td> */}
						</tr>
					)}
				</tbody>
			</table>
			<div className="toolbar">
				<div className="table-buttons">
					<PrevButton
						title={text.previousPage[language]}
						disabled={loadingState != "loaded" || currPage <= 0}
						onClick={() => prevPage()}
					/>
					{text.page[language]} {currPage + 1}
					{numberOfPages ? `/${numberOfPages}` : ""}
					<NextButton
						title={text.nextPage[language]}
						disabled={
							loadingState != "loaded" || currPage >= numberOfPages! - 1
						}
						onClick={() => nextPage()}
					/>
				</div>
			</div>
		</div>
	);
}

export default SongsTable;
