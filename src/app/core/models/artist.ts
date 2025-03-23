export interface Artist {
  id: number;
  name: string;
  bornCity: string;
  birthDate: string;
  img: string;
  rating: number;
  songs: number[];
}

export interface ArtistResponse {
  artists: Artist[];
}

export interface ArtistForSelect {
  artist: string;
  id: number;
}
