import { Query, DocumentData, getDocs, QuerySnapshot } from "firebase/firestore";
import { Song } from "../myTypes";
import { Dispatch, SetStateAction } from "react";

export const formattedDate = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`

export const getSongsFromQuery = async (q: Query<DocumentData>) => {
  const docSnapshots = await getDocs(q);
  if (docSnapshots.docs.length === 0) {
    return { pageSongs: [], lastDoc: undefined }
  }
  const pageSongs = songListFromSnapshot(docSnapshots)
  const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];
  return { pageSongs, lastDoc }
}

export const songListFromSnapshot = (documentSnapshots: QuerySnapshot<DocumentData>) => {
  return documentSnapshots.docs.map(doc => {
    const data = doc.data()
    const song = {
      id: doc.id,
      artist: String(data.ARTISTA),
      song_name: String(data.TITULO).toLowerCase(),
      genre: String(data.GENERO).toLowerCase()
    } as Song
    return song
  })
}

export const changeRoomCode = (value: string) => {
  let val: string = ""

  // code too long
  if (value.length > 4) return val.slice(0, 4)

  // empty code
  if (value.length <= 0) {
    return val
  }

  // leading zeros
  if (String(parseInt(value)).length < value.length) {
    val = String(parseInt(value)).padStart(value.length, "0")
  }
  else {
    val = String(parseInt(value))
  }
  return val
}


export const clickAway = (event: MouseEvent, elementName: string, setter: Dispatch<SetStateAction<boolean>>) => {
  let target = event.target as HTMLElement;
  let shouldSetFalse = true;
  while (target && !target.className.includes('content')) {
    if (target.className.includes(elementName)) {
      shouldSetFalse = false;
      break;
    }
    target = target.parentElement as HTMLElement;
  }
  if (shouldSetFalse) {
    setter(false);
  }
}