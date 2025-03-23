import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { delay, lastValueFrom } from 'rxjs';
import { Artist } from '../core/models/artist';
import { CountryForSelect } from '../core/models/country';
import { GenreForSelect } from '../core/models/genre';
import { Song, SongPayload } from '../core/models/song';
import { SongService } from '../services/song.service';
import { ArtistStore } from './artist.store';

interface ISongStore {
  songs: Song[];
  loading: boolean;
}

const initialState: ISongStore = {
  // Based on how json-server works, it directly returns an array.
  // In a real world scenario the response should be: { songs: [] }
  songs: [],
  loading: false,
};

export const SongStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialState),
  withMethods(
    (
      store,
      songService = inject(SongService),
      artistStore = inject(ArtistStore),
    ) => ({
      async findAllSongs() {
        patchState(store, { loading: true });

        const songs = await lastValueFrom(
          songService.findAllSongs().pipe(delay(1000)),
        );

        patchState(store, {
          songs,
          loading: false,
        });
      },

      getSongWithArtist(song: Song): string {
        // Double equal is used because the origin data is a string or could be a string.
        const artist = artistStore
          .artists()
          .find((artist: Artist) => artist.id == song.artist);

        return `${song.title} (${artist?.name})`;
      },

      // As we don't have a genre store, we can use this method to get all genres.
      // Since all the genres are spread across all songs.
      findAllGenresForSelect(): GenreForSelect[] {
        const uniqueGenres = new Set<string>(
          store.songs().flatMap((song: Song) => song.genre),
        );

        return Array.from(uniqueGenres).map((genre: string) => ({
          genre,
          id: genre.substring(0, 2),
        }));
      },

      findAllCountriesForSelect(): CountryForSelect[] {
        const uniqueCountries = new Set<string>(
          store.songs().map((song: Song) => song.country),
        );

        console.log(uniqueCountries);

        return Array.from(uniqueCountries).map((country: string) => ({
          country,
          id: country.substring(0, 2),
        }));
      },

      async addSong(song: SongPayload): Promise<number> {
        patchState(store, { loading: true });

        // I intentionally add a delay to simulate a real-world scenario.
        const newSong = await lastValueFrom(
          songService.saveSong(song).pipe(delay(1000)),
        );

        patchState(store, (state) => ({
          songs: [...state.songs, newSong.body as Song],
          loading: false,
        }));

        return newSong.status;
      },

      async updateSong(song: SongPayload): Promise<number> {
        patchState(store, { loading: true });

        const updatedSong = await lastValueFrom(
          songService.updateSong(song).pipe(delay(1000)),
        );

        // Parsing both to string because json-server, whever it creates a new resource, it generates a random string.
        patchState(store, (state) => ({
          songs: state.songs.map((s) =>
            String(s.id) === String(song.id) ? (updatedSong.body as Song) : s,
          ),
          loading: false,
        }));

        return updatedSong.status;
      },

      async deleteSong(songId: string): Promise<number> {
        patchState(store, { loading: true });

        const deletedSong = await lastValueFrom(
          songService.deleteSong(songId).pipe(delay(1000)),
        );

        patchState(store, (state) => ({
          songs: state.songs.filter((song) => String(song.id) !== songId),
          loading: false,
        }));

        return deletedSong.status;
      },

      setLoadingState(loading: boolean) {
        patchState(store, { loading });
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.findAllSongs();
    },
  }),
);
