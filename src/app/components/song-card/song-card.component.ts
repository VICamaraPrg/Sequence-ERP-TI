import { Component, inject, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Song } from '../../core/models/song';
import { SongStore } from '../../stores/song.store';

@Component({
  selector: 'app-song-card',
  imports: [CardModule, TagModule],
  templateUrl: './song-card.component.html',
})
export class SongCardComponent {
  song = input.required<Song>();

  private readonly songStore = inject(SongStore);

  get songWithArtist() {
    return this.songStore.getSongWithArtist(this.song());
  }
}
