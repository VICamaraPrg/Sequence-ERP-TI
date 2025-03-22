import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { delay, lastValueFrom } from 'rxjs';
import { Song } from '../core/models/song';
import { SongService } from '../services/song.service';
import { ArtistStore } from './artist.store';
import { Artist } from '../core/models/artist';

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
          songService.findAllSongs().pipe(delay(1500)),
        );

        patchState(store, {
          songs,
          loading: false,
        });
      },

      getSongWithArtist(song: Song): string {
        // Double equal is used because the origin data is a string.
        const artist = artistStore
          .artists()
          .find((artist: Artist) => Number(artist.id) === song.artist);

        return `${song.title} (${artist?.name})`;
      },

      async addSong(song: Song) {
        patchState(store, { loading: true });

        await lastValueFrom(songService.saveSong(song).pipe(delay(1500)));
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.findAllSongs();
    },
  }),
);
