import React, { useContext } from "react";
import {
	OnOffButton,
	HambButton,
	DeleteButton,
	DoneButton,
} from "./Buttons/Buttons";
import { useRoom } from "./Hooks/useRoom";
import { QueueItem } from "../myTypes";
import { useDrag, useDrop } from "react-dnd";
import { LanguageContext } from "../Contexts";
import * as text from "../Language/text";

function SongsQueue({
	roomId,
	canEdit,
	children: addSongButton,
}: {
	roomId: string;
	canEdit: boolean;
	children: JSX.Element;
}) {
	const { currentQueue, markDone, setQueue, setSortMethod } = useRoom({
		roomId,
		subscribe: true,
	});
	const { language } = useContext(LanguageContext);

	const tableHead = () => {
		return canEdit ? (
			<thead>
				<tr className="queue-item">
					<th></th>
					<th>
						<table className="header-data">
							<thead>
								<tr>
									<td data-cell={text.code[language]}>
										{" "}
										{text.code[language]}
									</td>
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
					<th></th>
				</tr>
			</thead>
		) : (
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
		);
	};

	return (
		<div className="queue-table-container">
			<table className="admin-queue">
				{canEdit && (
					<caption>
						<div className="caption-utils">
							<div className="order-buttons-container">
								<span>{text.alternatingTables[language]}</span>
								<OnOffButton
									onText={"ON"}
									offText={"OFF"}
									onToggle={() => {
										setSortMethod((p) => (p === "1" ? "2" : "1"));
									}}
								/>
							</div>
							{addSongButton}
						</div>
					</caption>
				)}
				{tableHead()}
				{canEdit ? (
					<QueueBodyCanEdit
						currentQueue={currentQueue}
						markDone={markDone}
						setQueue={setQueue}
					/>
				) : (
					<QueueBodyNoEdit currentQueue={currentQueue} />
				)}
			</table>
		</div>
	);
}

export default SongsQueue;

function QueueBodyCanEdit({
	currentQueue,
	markDone,
	setQueue,
}: {
	currentQueue: QueueItem[];
	markDone: ({ item }: { item: QueueItem }) => Promise<void>;
	setQueue: (queue: QueueItem[]) => Promise<void>;
}) {
	const moveItem = (dragIndex: number, hoverIndex: number) => {
		const draggedItem = currentQueue[dragIndex];
		const updatedQueue = [...currentQueue];
		updatedQueue.splice(dragIndex, 1);
		updatedQueue.splice(hoverIndex, 0, draggedItem);
		setQueue(updatedQueue);
	};

	const RenderQueueItems = () => {
		return currentQueue.map((item, index) => {
			return (
				<QueueItem
					key={item.created_at}
					index={index}
					item={item}
					moveItem={moveItem}
					markDone={markDone}
				/>
			);
		});
	};

	return (
		<tbody>
			{RenderQueueItems()}
			<tr className="queueEnd queue-item">
				<td>
					<table className="row-data"></table>
				</td>
			</tr>
		</tbody>
	);
}

function QueueItem({
	index,
	item,
	moveItem,
	markDone,
}: {
	index: number;
	item: QueueItem;
	moveItem: (dragIndex: number, hoverIndex: number) => void;
	markDone: ({ item }: { item: QueueItem }) => Promise<void>;
}) {
	const { language } = useContext(LanguageContext);
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: "queue-item",
			item: { index },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
			}),
		}),
		[index]
	);
	const [{ isOver, isAbove, isSame, isBelow }, drop] = useDrop(
		() => ({
			accept: "queue-item",
			drop: (draggedItem: { type: string; index: number }) => {
				moveItem(draggedItem.index, index);
			},
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
				isAbove: monitor.getItem()?.index > index,
				isSame: monitor.getItem()?.index == index,
				isBelow: monitor.getItem()?.index < index,
			}),
		}),
		[index]
	);

	const opacity = isDragging ? 0.5 : 1;

	return (
		<>
			{isOver && (isAbove || isSame) && (
				<tr
					key={`top-preview-line ${index}`}
					className="preview-line top-line show "
				/>
			)}
			<tr ref={drop} className="queue-item" style={{ opacity }}>
				<td data-cell="queue-song-move-col" ref={drag} draggable="true">
					<div className="queue-song-move-container">
						<HambButton className="queue-song-move" />
					</div>
				</td>
				<td>
					<table className="row-data">
						<tbody>
							<tr>
								<td data-cell={text.code[language]}>{item.song.id}</td>
								{item.table && (
									<td data-cell={text.table[language]}>{item.table}</td>
								)}
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
				</td>
				<td data-cell="queue-song-buttons-col">
					<div className="queue-song-buttons-container">
						<DeleteButton className="delete-from-queue-button" />
						<DoneButton
							onClick={() => {
								markDone({ item });
							}}
							className="mark-done-button "
						/>
					</div>
				</td>
			</tr>
			{isOver && (isBelow || isSame) && (
				<tr
					key={`bottom-preview-line ${index}`}
					className="preview-line bottom-line show "
				/>
			)}
		</>
	);
}

function QueueBodyNoEdit({ currentQueue }: { currentQueue: QueueItem[] }) {
	return (
		<tbody>
			{currentQueue.map((item) => {
				return (
					<React.Fragment key={item.created_at}>
						<tr className="queue-item">
							<td>
								<table className="row-data">
									<tbody>
										<tr>
											{item.table && <td data-cell="Mesa">{item.table}</td>}
											<td data-cell="Canta">{item.singer}</td>
											<td data-cell="Canción">
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
							</td>
						</tr>
					</React.Fragment>
				);
			})}
		</tbody>
	);
}
