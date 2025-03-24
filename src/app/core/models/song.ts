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
  id: string | undefined;
  title: string;
  genre: string[];
  country: string | undefined;
  company: string | undefined;
  year: number;
  duration: number;
  rating: number;
  artist: number | undefined;
}

export interface SongResponse {
  songs: Song[];
}
