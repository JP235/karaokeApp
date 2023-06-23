import { Query, DocumentData, getDocs, QuerySnapshot } from "firebase/firestore";
import { Song } from "../myTypes";

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