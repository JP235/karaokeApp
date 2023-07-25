import "./SongsQueueEdit.css";
import { QueueItem } from "../../../myTypes";
import * as text from "../../../Language/text";
import { useLanguage } from "../../../Contexts";
import {
	InnerTable,
	QueueItemNoEdit,
	SongsQueueNoEditProps,
} from "../SongsQueueNoEdit/SongsQueueNoEdit";
import { DoneButton, HambButton, OnOffButton } from "../../Buttons/Buttons";
import { useRoom } from "../../Hooks/useRoom";
import { useDrag, useDrop } from "react-dnd";

interface SongsQueueEditProps extends SongsQueueNoEditProps {
	children: JSX.Element;
}

function SongsQueueEdit({
	roomId,
	children: addSongButton,
}: SongsQueueEditProps) {
	const { language } = useLanguage();
	const { currentQueue, markDone, setQueue, setSortMethod, sortMethod } =
		useRoom({
			roomId,
			subscribe: true,
		});
	const moveItem = (dragIndex: number, hoverIndex: number) => {
		const draggedItem = currentQueue[dragIndex];
		const updatedQueue = [...currentQueue];
		updatedQueue.splice(dragIndex, 1);
		updatedQueue.splice(hoverIndex, 0, draggedItem);
		setQueue(updatedQueue);
		setSortMethod("3");
	};

	return (
		<div className="queue-table-container">
			<table className="admin-queue">
				<caption>
					<h2 className="admin-room-title text-border-1px">
						{text.room[language]}:{roomId}
					</h2>
					<div className="caption-utils">
						<div className="order-buttons-container">
							<span>{text.alternatingTables[language]}</span>
							<OnOffButton
								onText={"ON"}
								offText={"OFF"}
								title="order-button"
								className={sortMethod === "3" ? "customOrder" : ""}
								onToggle={() => {
									setSortMethod((p) => (p === "2" ? "1" : "2"));
								}}
							/>
						</div>
						{addSongButton}
					</div>
				</caption>
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
				<tbody>
					{currentQueue.map((item, index) => {
						return (
							<QueueItemEdit
								key={item.created_at}
								index={index}
								item={item}
								moveItem={moveItem}
								markDone={markDone}
							/>
						);
					})}
					<tr className="queueEnd queue-item">
						<td>
							<table className="row-data"></table>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
export default SongsQueueEdit;
interface QueueItemEditProps extends QueueItemNoEdit {
	index: number;
	moveItem: (dragIndex: number, hoverIndex: number) => void;
	markDone: ({ item }: { item: QueueItem }) => Promise<void>;
}
function QueueItemEdit({
	index,
	item,
	moveItem,
	markDone,
}: QueueItemEditProps) {
	const { language } = useLanguage();
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
				<td className="inner-table-col">
					<InnerTable props={{ item, language, showId: true }} />
				</td>
				<td data-cell="queue-song-buttons-col">
					<div className="queue-song-buttons-container">
						{/* <DeleteButton className="delete-from-queue-button" /> */}
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
