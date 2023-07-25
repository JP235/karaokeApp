import {
	doc,
	onSnapshot,
	updateDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { roomsCollectionRef } from "../../firebase-config";
import { QueueItem, Room, Song } from "../../myTypes";

export const useRoom = ({
	roomId,
	subscribe,
}: {
	roomId?: string;
	subscribe?: boolean;
}) => {
	const [currentQueue, setCurrentQueue] = useState<QueueItem[]>([]);
	const [pastQueue, setPastQueue] = useState<QueueItem[]>([]);
	const [room, setRoom] =
		useState<Omit<Room, "currentQueue" | "pastQueue" | "order">>();
	const [sortMethod, setSortMethod] = useState<"1" | "2" | "3">();
	const roomRef = doc(roomsCollectionRef, roomId);

	useEffect(() => {
		if (roomId && subscribe) {
			const roomRef = doc(roomsCollectionRef, roomId);
			const unsubscribe = onSnapshot(roomRef, (roomSnap) => {
				if (roomSnap.exists()) {
					const roomData = roomSnap.data() as Room;
					setRoom({
						created_by: roomData.created_by,
						song_db: roomData.song_db,
					});
					setSortMethod(roomData.order);

					switch (roomData.order) {
						case "1":
							const sortedAlter = sortWithAlternatingTables(
								roomData.currentQueue
							);
							setCurrentQueue(sortedAlter);
							break;
						case "2":
							const sorted = sortByTime(roomData.currentQueue);
							setCurrentQueue(sorted);
							break;
						default:
							setCurrentQueue(roomData.currentQueue ?? []);
							break;
					}
					setPastQueue(roomData.pastQueue ?? []);
				} else {
					throw new Error("Room not found");
				}
			});
			return () => unsubscribe();
		}
	}, [roomId]);

	useEffect(() => {
		switch (sortMethod) {
			case "1":
				const sortedAlter = sortWithAlternatingTables(currentQueue);
				setCurrentQueue(sortedAlter);
				break;
			case "2":
				const sorted = sortByTime(currentQueue);
				setCurrentQueue(sorted);
				break;
			default:
				break;
		}
	}, [currentQueue.length]);

	useEffect(() => {
		switch (sortMethod) {
			case "1":
				updateDoc(roomRef, { order: "1" });
				const sortedAlter = sortWithAlternatingTables(currentQueue);
				setCurrentQueue(sortedAlter);
				break;
			case "2":
				updateDoc(roomRef, { order: "2" });
				const sorted = sortByTime(currentQueue);
				setCurrentQueue(sorted);
				break;
			default:
				updateDoc(roomRef, { order: "3" });
				break;
		}
	}, [sortMethod]);

	async function addToQueue({
		singer,
		song,
		tableNumber,
	}: {
		singer: string;
		song: Song;
		tableNumber?: number;
	}) {
		if (!roomId) throw new Error("RoomId not defined");

		const now = new Date();
		const item: QueueItem = {
			singer,
			song,
			table: tableNumber,
			created_at: now.getTime(),
		};
		await updateDoc(roomRef, {
			currentQueue: arrayUnion(item),
		});
	}

	async function markDone({ item }: { item: QueueItem }) {
		if (!roomId) throw new Error("RoomId not defined");
		await updateDoc(roomRef, {
			currentQueue: arrayRemove(item),
			pastQueue: arrayUnion(item),
		});
	}

	async function setQueue(queue: QueueItem[]) {
		if (!roomId) throw new Error("RoomId not defined");
		if (!queue) return;
		const roomRef = doc(roomsCollectionRef, roomId);
		setCurrentQueue(queue);
		await updateDoc(roomRef, { currentQueue: queue });
	}

	function sortByTime(currQueue: QueueItem[]) {
		const sortedQueue = [...currQueue];
		sortedQueue.sort((a, b) => a.created_at - b.created_at);
		return sortedQueue;
	}

	function sortWithAlternatingTables(currQueue: QueueItem[]) {
		// Create a copy of the queue array
		const sortedQueue = [...currQueue];

		// Sort the queue by created_at
		sortedQueue.sort((a, b) => a.created_at - b.created_at);

		// Group the queue items by table
		const groups = new Map<number, QueueItem[]>();
		for (const item of sortedQueue) {
			if (item.table !== undefined) {
				if (!groups.has(item.table)) {
					groups.set(item.table, []);
				}
				groups.get(item.table)!.push(item);
			}
		}

		// Create a new queue with alternating tables
		const result: QueueItem[] = [];
		let done = false;
		// queues are short enough that using a while is not dangerous
		while (!done) {
			done = true;
			for (const group of groups.values()) {
				if (group.length > 0) {
					result.push(group.shift()!);
					done = false;
				}
			}
		}

		// Add any remaining items without a table to the end of the queue
		for (const item of sortedQueue) {
			if (item.table === undefined) {
				result.push(item);
			}
		}

		return result;
	}

	return {
		addToQueue,
		markDone,
		currentQueue,
		pastQueue,
		room,
		setCurrentQueue,
		setQueue,
		setSortMethod,
		sortMethod,
	};
};
