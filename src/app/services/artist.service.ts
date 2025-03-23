import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Artist } from '../core/models/artist';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private readonly http: HttpClient = inject(HttpClient);

  getAllArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`/api/artists`);
  }
}
