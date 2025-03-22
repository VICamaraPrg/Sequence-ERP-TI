import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'songs', pathMatch: 'full' },
  { path: '**', redirectTo: 'songs' },
];
