export interface Song {
  id: number;
  title: string;
  poster: string;
  genre: string[];
  country: string;
  year: number;
  duration: number;
  rating: number;
  artist: number;
}

export interface SongPayload {
  id: string | null;
  title: string;
  genre: string[];
  country: string | null;
  company: string | null;
  year: number;
  duration: number;
  rating: number;
  artist: number | null;
}

export interface SongResponse {
  songs: Song[];
}
