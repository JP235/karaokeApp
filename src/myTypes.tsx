import { DocumentReference, DocumentData } from "firebase/firestore";

export const Language = {
    EN: "EN",
    ES: "ES",
    // FR: "FR",
} 

export type TLanguages = keyof typeof Language


export type LoadignState = "idle" | "loading" | "loaded" | "error"

export type UserData = {
    name: string;
    email: string;
    permissions: string;
    active_room: string;
    songs_db: string;
    created_rooms: number
};

export type Song = {
    id: string
    song_name: string;
    artist: string;
    genre: string
}

export type QueueItem = {
    singer: string;
    song: Song;
    table?: number;
    created_at: string;
}

export type Room = {
    currentQueue: QueueItem[];
    pastQueue: QueueItem[],
    created_by: string;
    song_db: string;
}

