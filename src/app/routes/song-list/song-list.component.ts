import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { SongCardComponent } from '../../components/song-card/song-card.component';
import { SongModalComponent } from '../../components/song-modal/song-modal.component';
import { ArtistStore } from '../../stores/artist.store';
import { CompanyStore } from '../../stores/company.store';
import { SongStore } from '../../stores/song.store';
import { SafeAny } from '../../core/types/safe-any';
import { Song } from '../../core/models/song';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-song-list',
  imports: [
    SongCardComponent,
    CommonModule,
    ButtonModule,
    SkeletonModule,
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: './song-list.component.html',
})
export class SongListComponent {
  // Both wildcard and no route will lead to SongListComponent.
  // So, we get all the data we need here once.
  readonly songStore = inject(SongStore);
  readonly artistStore = inject(ArtistStore);
  readonly companyStore = inject(CompanyStore);

  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);

  ref: DynamicDialogRef | undefined;

  customEmptyArray(numberOfItems: number): SafeAny[] {
    return Array(numberOfItems);
  }

  showModal(songToEdit?: Song) {
    this.ref = this.dialogService.open(SongModalComponent, {
      width: '50vw',
      modal: true,
      closable: true,
      maximizable: true,
      baseZIndex: 10000,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      header: songToEdit
        ? this.translate.instant('songList.currentEdit', {
            songTitle: this.songStore.getSongWithArtist(songToEdit),
          })
        : this.translate.instant('songList.createSong'),
      data: songToEdit ? { songToEdit } : undefined,
    });
  }
}
