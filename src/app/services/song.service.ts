import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song, SongPayload } from '../core/models/song';
import { SafeAny } from '../core/types/safe-any';

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

  saveSong(song: SongPayload): Observable<HttpResponse<Song>> {
    return this.http.post<Song>(`/api/songs`, song, {
      observe: 'response',
    });
  }

  updateSong(song: SongPayload): Observable<HttpResponse<Song>> {
    return this.http.patch<Song>(`/api/songs/${song.id}`, song, {
      observe: 'response',
    });
  }

  deleteSong(songId: string): Observable<HttpResponse<SafeAny>> {
    return this.http.delete(`/api/songs/${songId}`, {
      observe: 'response',
    });
  }
}
