import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { LanguageOption } from '../../core/models/language-option';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-header',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterModule,
    DividerModule,
    TooltipModule,
    SelectModule,
    SelectButtonModule,
    DialogModule,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly languageService = inject(LanguageService);

  $drawerVisible = signal<boolean>(false);
  $languages = signal<LanguageOption[]>(
    this.languageService.getLanguageOptions(),
  );
  $currentLanguage = signal<string>(this.languageService.getCurrentLanguage());

  constructor() {
    this.languageService.setCurrentLanguage(this.$currentLanguage());
  }

  protected changeLanguage(lang: string): void {
    this.$currentLanguage.set(lang);
    this.languageService.setCurrentLanguage(lang);
  }
}
