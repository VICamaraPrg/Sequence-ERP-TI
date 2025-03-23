import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { Artist, ArtistForSelect } from '../core/models/artist';
import { ArtistService } from '../services/artist.service';

interface IArtistStore {
  artists: Artist[];
  loading: boolean;
}

const initialState: IArtistStore = {
  artists: [],
  loading: false,
};

export const ArtistStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialState),
  withMethods((store, artistService = inject(ArtistService)) => ({
    async getAllArtists(): Promise<void> {
      patchState(store, { loading: true });

      const artists = await lastValueFrom(artistService.getAllArtists());

      patchState(store, {
        artists,
        loading: false,
      });
    },

    getAllArtistsForSelect(): ArtistForSelect[] {
      return store.artists().map((artist: Artist) => ({
        artist: artist.name,
        id: artist.id,
      }));
    },
  })),
  withHooks({
    onInit(store) {
      store.getAllArtists();
    },
  }),
);
