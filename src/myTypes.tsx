export const Language = {
    EN: "EN",
    ES: "ES",
} as const

export type Languages = keyof typeof Language


export type LoadignState = "idle" | "loading" | "loaded" | "error"

export type UserData = {
    name: string;
    permissions: string;
    active_room: number;
    songs_db: string
};

export type Room = {
    code: number;
    name: string;
    ask_for_table: boolean
}