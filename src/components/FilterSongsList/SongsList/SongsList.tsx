import "./SongsList.css";
import { useRef, useEffect, Fragment, useState } from "react";
import { useLanguage, useLoadingState } from "../../../Contexts";
import { Song } from "../../../myTypes";
import { PrevButton, NextButton } from "../../Buttons/Buttons";
import { UseSongsReturntype } from "../../Hooks/useSongs";
import * as text from "../../../Language/text";

interface SongsTableProps {
	songs: UseSongsReturntype;
	roomId: string;
	setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>;
}

function SongsTable({ songs, setSelectedSong }: SongsTableProps) {
	const tableRef = useRef<HTMLTableElement>(null);
	const {
		paginatedSongs,
		currPage,
		prevPage,
		nextPage,
		numberOfPages,
		filterByArtist,
	} = songs;
	const { loadingState } = useLoadingState();
	const { language } = useLanguage();
	const paginatedByArtist = paginatedSongs.curr_page.reduce((acc, curr) => {
		if (!acc[curr.artist]) {
			acc[curr.artist] = [];
		}
		acc[curr.artist].push(curr);
		return acc;
	}, {} as Record<string, Song[]>);

	useEffect(() => {
		if (tableRef.current) {
			tableRef.current.scrollTop = -10;
		}
	}, [paginatedSongs]);

	const handleClickArtist = (artist: string) => {
		filterByArtist(artist);
		// if (e.detail === 2) {
		// }
	};

	return (
		<div ref={tableRef} className="songs-table">
			<table id="song-list-table" className="song-list">
				<tbody>
					<>
						{Object.entries(paginatedByArtist).map(([artist, songs], index) => {
							return (
								<Fragment key={index}>
									<tr
										onClick={() => {
											handleClickArtist(artist);
										}}
									>
										<td className="artist-name" colSpan={2}>
											<span>{artist}</span>
										</td>
									</tr>
									{songs.map((song, index) => {
										return (
											<Fragment key={index}>
												<tr
													className={index % 2 === 0 ? "even" : "odd"}
													onClick={() => setSelectedSong(song)}
												>
													<td></td>
													<td data-cell={text.title[language]}>
														<span>{song.song_name}</span>
													</td>
												</tr>
											</Fragment>
										);
									})}
								</Fragment>
							);
						})}
						{paginatedSongs.curr_page.length === 0 && (
							<tr>
								<td colSpan={2}>--</td>
							</tr>
						)}
					</>
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
							loadingState != "loaded" ||
							!numberOfPages ||
							currPage >= numberOfPages! - 1
						}
						onClick={() => nextPage()}
					/>
				</div>
			</div>
		</div>
	);
}

export default SongsTable;
