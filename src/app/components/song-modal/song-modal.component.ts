import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ArtistForSelect } from '../../core/models/artist';
import { CountryForSelect } from '../../core/models/country';
import { GenreForSelect } from '../../core/models/genre';
import { SongPayload } from '../../core/models/song';
import { SafeAny } from '../../core/types/safe-any';
import { ArtistStore } from '../../stores/artist.store';
import { CompanyStore } from '../../stores/company.store';
import { SongStore } from '../../stores/song.store';
import { JsonPipe } from '@angular/common';
import { CompanyForSelect } from '../../core/models/company';

@Component({
  selector: 'app-song-modal',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    IftaLabelModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    InputNumberModule,
    MessageModule,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-modal.component.html',
})
export class SongModalComponent implements OnInit {
  readonly songStore = inject(SongStore);
  readonly companyStore = inject(CompanyStore);
  readonly artistStore = inject(ArtistStore);

  private readonly modalConfig = inject(DynamicDialogConfig);
  private readonly modalRef = inject(DynamicDialogRef);
  private readonly messageService = inject(MessageService);

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  // true -> edit mode, false -> add mode.
  $editMode = signal<boolean>(!!this.modalConfig.data?.songToEdit);

  countries = this.songStore.findAllCountriesForSelect();
  companies = this.companyStore.getAllCompaniesForSelect();
  artists = this.artistStore.getAllArtistsForSelect();
  genres = this.songStore.findAllGenresForSelect();

  songModalState = this.fb.group({
    title: ['', [Validators.required]],
    artist: [{} as ArtistForSelect, Validators.required],
    genre: [[] as GenreForSelect[], Validators.required],
    company: [{} as CompanyForSelect, Validators.required],
    country: [{} as CountryForSelect, Validators.required],
    year: [null as SafeAny, Validators.required],
    duration: [0, Validators.required],
    rating: [0, Validators.required],
  });

  ngOnInit(): void {
    // Will only populate the form if the modal is for editing a song
    if (this.$editMode()) this.parseAndPopulateSongModalStateFromToEdit();
  }

  /**
   * The idea is to delegate the logic to the store.
   * Then, the store method will return us the status code that will use to show a toast and close the modal
   */
  protected async onSubmit(): Promise<void> {
    if (!this.songModalState.valid) return;

    const payload = this.mapToPayload();

    try {
      if (this.$editMode()) {
        const responseCode = await this.songStore.updateSong(payload);
        this.handleUpdateResponse(responseCode);
        return;
      }
      const responseCode = await this.songStore.addSong(payload);
      this.handleCreateResponse(responseCode);
    } catch (error) {
      console.error(error);

      this.songStore.setLoadingState(false);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado al añadir la canción',
      });
    }
  }

  private handleCreateResponse(responseCode: number): void {
    if (responseCode === 201) {
      this.modalRef.close();
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'La canción se añadió correctamente',
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Código de respuesta: ' + responseCode,
      });
    }
  }

  private handleUpdateResponse(responseCode: number): void {
    if (responseCode === 200) {
      this.modalRef.close();
      this.messageService.add({
        severity: 'success',
        summary: 'Actualización exitosa',
        detail: 'La canción se actualizó correctamente',
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Código de respuesta: ' + responseCode,
      });
    }
  }

  private parseAndPopulateSongModalStateFromToEdit() {
    this.songModalState.patchValue({
      ...this.modalConfig.data.songToEdit,

      artist: this.artists.find(
        (artist: ArtistForSelect) =>
          artist.id == this.modalConfig.data.songToEdit.artist,
      ),

      genre: this.genres.filter((genre: GenreForSelect) =>
        this.modalConfig.data.songToEdit.genre.includes(genre.genre),
      ),

      company: this.companyStore.getCompanyBySongId(
        this.modalConfig.data.songToEdit.id,
      ),

      country: this.countries.find(
        (country: CountryForSelect) =>
          country.country == this.modalConfig.data.songToEdit.country,
      ),

      year: new Date(this.modalConfig.data.songToEdit.year, 0),
    });
  }

  private mapToPayload(): SongPayload {
    const { title, genre, country, company, year, duration, rating, artist } =
      this.songModalState.value;

    /** If at this point the validation already passed, then they are valid.
     * That is why we use the non-null assertion operator (!) here.
     * And it does not work with short-circuiting (title!).
     */
    const payload: SongPayload = {
      id: this.$editMode() ? this.modalConfig.data.songToEdit.id : null,
      title: title!,
      genre: genre ? genre.map((g: GenreForSelect) => g.genre) : [],
      country: country ? country.country : null,
      company: company ? company.id : null,
      // PrimeNG DatePicker returns a Date object, despite the user sees a number.
      year: year instanceof Date ? year.getFullYear() : +year!,
      duration: +duration!,
      rating: +rating!,
      artist: artist ? artist.id : null,
    };

    return payload;
  }
}
