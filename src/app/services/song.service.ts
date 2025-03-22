import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from '../core/models/song';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private readonly http: HttpClient = inject(HttpClient);

  // Based on how json-server works, it directly returns an array.
  // In a real world scenario the response should be: { songs: [] }
  // My idea was to return an object typed as { songs: Song[] } (SongResponse).
  findAllSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`/api/songs`);
  }

  saveSong(song: Song): Observable<Song> {
    return this.http.post<Song>(`/api/songs`, song);
  }
}
