import { QueueItem } from "../../../myTypes";
import "./SongsQueueNoEdit.css";
import * as text from "../../../Language/text";
import { useLanguage } from "../../../Contexts";
import { Fragment } from "react";
import { useRoom } from "../../Hooks/useRoom";

export interface SongsQueueNoEditProps {
	roomId: string;
}

function SongsQueueNoEdit({ roomId }: SongsQueueNoEditProps) {
	const { currentQueue } = useRoom({
		roomId,
		subscribe: true,
	});
	const { language } = useLanguage();
	return (
		<>
			<thead>
				<tr className="queue-item">
					<th>
						<table className="header-data">
							<thead>
								<tr>
									<td data-cell={text.table[language]}>
										{text.table[language]}
									</td>
									<td data-cell={text.singers[language]}>
										{" "}
										{text.singers[language]}
									</td>
									<td data-cell={text.song[language]}>
										{" "}
										{text.song[language]}
									</td>
								</tr>
							</thead>
						</table>
					</th>
				</tr>
			</thead>
			<tbody>
				{currentQueue.map((item) => {
					return <QueueItemNoEdit item={item} />;
				})}
			</tbody>
		</>
	);
}
export default SongsQueueNoEdit;

export interface QueueItemNoEdit {
	item: QueueItem;
}

function QueueItemNoEdit({ item }: QueueItemNoEdit) {
	const { language } = useLanguage();
	return (
		<Fragment key={item.created_at}>
			<tr className="queue-item">
				<td className="inner-table-col">
					<table className="row-data">
						<InnerTable props={{ item, language, showId: false }} />
					</table>
				</td>
			</tr>
		</Fragment>
	);
}

export function InnerTable({
	props,
}: {
	props: {
		item: QueueItem;
		language: "en" | "es" | "fr" | "it";
		showId: boolean;
	};
}) {
	const { item, language, showId } = props;
	return (
		<table className="row-data">
			<tbody>
				<tr>
					{showId && <td data-cell={text.code[language]}>{item.song.id}</td>}
					<td data-cell={text.table[language]}>{item.table}</td>
					<td data-cell={text.singers[language]}>{item.singer}</td>
					<td data-cell={text.song[language]}>
						<ul>
							<li>
								<i>{item.song.song_name}</i>
							</li>
							<li>
								<strong>{item.song.artist}</strong>
							</li>
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	);
}
