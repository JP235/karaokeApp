import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db, roomsCollectionRef } from '../../../firebase-config';
import { useParams } from 'react-router-dom';

type Room = {
    queue: Song[]
    created_by: string
    song_db: string
}

type Song = {
    id: string
    code: number;
    song_name: string;
    artist: string;
    genre: string
}

const AdminRoom = () => {
    const params = useParams()
    const roomId = params.roomID
    const [queue, setQueue] = useState<Song[]>([]);

    useEffect(() => {
        if (roomId) {
            const unsubscribe =
                onSnapshot(doc(roomsCollectionRef, roomId), (snapshot) => {
                    if (snapshot.exists()) {

                        const roomData = snapshot.data() as Room
                        setQueue(roomData.queue);
                    }
                });
            return () => unsubscribe();
        };

    }, [roomId]);

    return (
        <div>
            {queue.map(s => {
                return <div>{s.song_name}</div>
            })}
        </div>
    );
};

export default AdminRoom