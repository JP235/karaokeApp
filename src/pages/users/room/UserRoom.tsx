import { useParams } from "react-router-dom"
import "./UserRoom.css"
import { useEffect, useState } from "react"
import { Room, Song } from "../../../myTypes"
import { doc, getDoc } from "firebase/firestore"
import { roomsCollectionRef } from "../../../firebase-config"


function UserRoom() {
    const { roomId } = useParams()

    const [songs, setSongs] = useState<Song[]>([])
    const [room, setRoom] = useState<Room>({
        queue: [],
        created_by: '',
        song_db: ''
    });

    useEffect(() => {
        if (roomId) {
            getDoc(doc(roomsCollectionRef, roomId)).then(d => {
                if (d.exists()) {
                    const data = d.data() as Room
                    setRoom(data)
                }
            })
        }
    }, [roomId]);

    return (
        <div className="user-room">
            <h1>Wellcome to room: {roomId}</h1>
        </div>
    )
}

export default UserRoom