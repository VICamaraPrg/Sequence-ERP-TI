import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'songs',
    loadComponent: () =>
      import('./routes/song-list/song-list.component').then(
        (c) => c.SongListComponent,
      ),
  },
  { path: '', redirectTo: 'songs', pathMatch: 'full' },
  { path: '**', redirectTo: 'songs' },
];
