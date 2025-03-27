import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { LanguageService } from '../../services/language/language.service';
import { DrawerComponent } from '../drawer/drawer.component';
import { LanguageSelectComponent } from '../language-select/language-select.component';

@Component({
  selector: 'app-header',
  imports: [
    ButtonModule,
    DialogModule,
    DividerModule,
    DrawerComponent,
    DrawerModule,
    FormsModule,
    LanguageSelectComponent,
    RouterModule,
    SelectButtonModule,
    SelectModule,
    TooltipModule,
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
  private readonly dialogService = inject(DialogService);

  $drawerVisible = signal<boolean>(false);

  protected openLanguageDialog(): void {
    this.dialogService.open(LanguageSelectComponent, {
      width: '50vw',
      modal: true,
      closable: true,
      maximizable: true,
      baseZIndex: 10000,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      // Being in a dynamic dialog, I could not find a way to translate in real time the header.
      header: this.translateService.instant('header.selectLanguage'),
    });
  }
}
