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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ArtistForSelect } from '../../core/models/artist';
import { CompanyForSelect } from '../../core/models/company';
import { CountryForSelect } from '../../core/models/country';
import { GenreForSelect } from '../../core/models/genre';
import { SongPayload } from '../../core/models/song';
import { SafeAny } from '../../core/types/safe-any';
import { CustomConfirmDialogService } from '../../services/confirm-dialog.service';
import { ArtistStore } from '../../stores/artist.store';
import { CompanyStore } from '../../stores/company.store';
import { SongStore } from '../../stores/song.store';

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
    ConfirmPopupModule,
    ToastModule,
    TranslatePipe,
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
  private readonly confirmDialogService = inject(CustomConfirmDialogService);

  private readonly translate = inject(TranslateService);

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
    // set the dialogRef in the store to be able to close it from the store (And not pasing the reference on every call).
    this.songStore.setDialogRef(this.modalRef);

    // Will only populate the form if the modal is for editing a song
    if (this.$editMode()) this.parseAndPopulateSongModalStateFromToEdit();
  }

  protected async onSubmit(): Promise<void> {
    // It should never trigger since we already disable the submit button.
    if (!this.songModalState.valid) return;

    const payload = this.mapToPayload();

    if (this.$editMode()) this.songStore.updateSong(payload);
    else this.songStore.addSong(payload);

    // Dumb if statement to not use non-null assertion operator (!) in the next line.
    if (payload.id && payload.company)
      this.companyStore.setSongToCompany(payload.id, payload.company);
  }

  protected onDelete(event: Event) {
    this.confirmDialogService.confirm(
      event.target as EventTarget,
      this.translate.instant('songModal.form.action.confirmDelete'),
      this.translate.instant('songModal.form.action.delete'),
      () => {
        this.songStore.deleteSong(this.modalConfig.data.songToEdit.id);
      },
    );
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
      id: this.$editMode() ? this.modalConfig.data.songToEdit.id : undefined,
      title: title!,
      genre: genre ? genre.map((g: GenreForSelect) => g.genre) : [],
      country: country ? country.country : undefined,
      company: company ? company.id : undefined,
      // PrimeNG DatePicker returns a Date object, despite the user sees a number.
      year: year instanceof Date ? year.getFullYear() : +year!,
      duration: +duration!,
      rating: +rating!,
      artist: artist ? artist.id : undefined,
    };

    return payload;
  }
}
