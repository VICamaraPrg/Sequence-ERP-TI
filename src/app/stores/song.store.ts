import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { delay, finalize, lastValueFrom, tap } from 'rxjs';
import { SongModalComponent } from '../components/song-modal/song-modal.component';
import { Artist } from '../core/models/artist';
import { CountryForSelect } from '../core/models/country';
import { GenreForSelect } from '../core/models/genre';
import { Song, SongPayload } from '../core/models/song';
import { HandleErrorService } from '../services/handle-error.service';
import { NotificationService } from '../services/notification.service';
import { SongService } from '../services/song.service';
import { ArtistStore } from './artist.store';

interface ISongStore {
  songs: Song[];
  loading: boolean;
  activeDialogRef?: DynamicDialogRef<SongModalComponent>;
}

const initialState: ISongStore = {
  // Based on how json-server works, it directly returns an array.
  // In a real world scenario the response should be: { songs: [] }
  songs: [],
  loading: false,
  activeDialogRef: undefined,
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
      notificationService = inject(NotificationService),
      translateService = inject(TranslateService),
      handleErrorService = inject(HandleErrorService),
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

        return Array.from(uniqueCountries).map((country: string) => ({
          country,
          id: country.substring(0, 2),
        }));
      },

      async addSong(song: SongPayload): Promise<void> {
        patchState(store, { loading: true });

        const newSong$ = songService.saveSong(song).pipe(
          delay(1000),
          tap((addedSong) => {
            patchState(store, (state) => ({
              songs: [...state.songs, addedSong.body as Song],
              loading: false,
            }));
          }),
          handleErrorService.handle(),
          tap((addedSong) => {
            if (addedSong.status === 201) {
              notificationService.showSuccess(
                translateService.instant(
                  'songModal.form.action.success.title.create',
                ),
                translateService.instant(
                  'songModal.form.action.success.message.create',
                ),
              );
              if (store.activeDialogRef) store.activeDialogRef()?.close();
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );

        await lastValueFrom(newSong$);
      },

      async updateSong(songToUpdate: SongPayload): Promise<void> {
        patchState(store, { loading: true });

        const updatedSong$ = songService.updateSong(songToUpdate).pipe(
          delay(1000),
          tap((updatedSong) => {
            patchState(store, (state) => ({
              songs: state.songs.map((songFromState) =>
                String(songFromState.id) === String(songToUpdate.id) // Parsing both to string because json-server, whever it creates a new resource, it generates a random string.
                  ? (updatedSong.body as Song)
                  : songFromState,
              ),
              loading: false,
            }));
          }),
          handleErrorService.handle(),
          tap((deletedSong) => {
            if (deletedSong.status === 200) {
              notificationService.showSuccess(
                translateService.instant(
                  'songModal.form.action.success.title.update',
                ),
                translateService.instant(
                  'songModal.form.action.success.message.update',
                ),
              );
              if (store.activeDialogRef) store.activeDialogRef()?.close();
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );

        await lastValueFrom(updatedSong$);
      },

      async deleteSong(songId: string): Promise<void> {
        patchState(store, { loading: true });

        const deletedSong$ = songService.deleteSong(songId).pipe(
          delay(1000),
          tap(() => {
            patchState(store, (state) => ({
              songs: state.songs.filter((song) => String(song.id) !== songId),
              loading: false,
            }));
          }),
          handleErrorService.handle(),
          tap((deletedSong) => {
            if (deletedSong.status === 200 || deletedSong.status === 204) {
              notificationService.showSuccess(
                translateService.instant(
                  'songModal.form.action.success.title.delete',
                ),
                translateService.instant(
                  'songModal.form.action.success.message.delete',
                ),
              );
              if (store.activeDialogRef) store.activeDialogRef()?.close();
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );

        /**
         * It will return the last value emitted by the observable.
         * It is necesary to trigger the RxJs pipeline.
         * Otherwise, the observable will not be executed.
         */
        await lastValueFrom(deletedSong$);
      },

      setDialogRef(dialogRef: DynamicDialogRef<SongModalComponent>): void {
        patchState(store, { activeDialogRef: dialogRef });
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
