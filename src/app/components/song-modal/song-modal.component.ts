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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ArtistForSelect } from '../../core/models/artist';
import { CompanyForSelect } from '../../core/models/company';
import { CountryForSelect } from '../../core/models/country';
import { GenreForSelect } from '../../core/models/genre';
import { SongPayload } from '../../core/models/song';
import { Crud } from '../../core/types/crud';
import { SafeAny } from '../../core/types/safe-any';
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
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

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
    console.log(this.translate.getLangs());

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
    console.log(payload);

    try {
      if (this.$editMode()) {
        const responseCode = await this.songStore.updateSong(payload);

        // Dumb if statement to not use non-null assertion operator (!) in the next line.
        if (payload.id && payload.company)
          this.companyStore.setSongToCompany(payload.id, payload.company);

        this.handleResponse(responseCode, 'update');
        return;
      }
      const responseCode = await this.songStore.addSong(payload);
      this.handleResponse(responseCode, 'create');
    } catch (error) {
      console.error(error);

      this.songStore.setLoadingState(false);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant(
          'songModal.form.action.error.unexpected',
        ),
      });
    }
  }

  protected async onDelete(event: Event): Promise<void> {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translate.instant('songModal.form.action.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: this.translate.instant('songModal.form.action.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translate.instant('songModal.form.action.delete'),
        severity: 'danger',
      },
      accept: async () => {
        const responseStatus = await this.songStore.deleteSong(
          this.modalConfig.data.songToEdit.id,
        );

        this.handleResponse(responseStatus, 'delete');
      },
    });
  }

  private handleResponse(responseCode: number, type: Crud): void {
    let expectedCode = 0;
    let successSummary = '';
    let successDetail = '';

    switch (type) {
      case 'create':
        expectedCode = 201;
        successSummary = this.translate.instant(
          'songModal.form.action.success.title.create',
        );
        successDetail = this.translate.instant(
          'songModal.form.action.success.message.create',
        );
        break;
      case 'update':
        expectedCode = 200;
        successSummary = this.translate.instant(
          'songModal.form.action.success.title.create',
        );
        successDetail = this.translate.instant(
          'songModal.form.action.success.message.update',
        );
        break;
      case 'delete':
        expectedCode = 200;
        successSummary = this.translate.instant(
          'songModal.form.action.success.title.create',
        );
        successDetail = this.translate.instant(
          'songModal.form.action.success.message.delete',
        );
        break;
    }

    if (responseCode === expectedCode) {
      this.modalRef.close();
      this.messageService.add({
        severity: 'success',
        summary: successSummary,
        detail: successDetail,
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('songModal.form.action.warning.title'),
        detail: this.translate.instant('songModal.form.action.warning.title', {
          responseCode,
        }),
      });
    }
  }

  private parseAndPopulateSongModalStateFromToEdit() {
    console.log(
      this.companyStore.getCompanyBySongId(this.modalConfig.data.songToEdit.id),
    );

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
