import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { LanguageOption } from '../../core/models/language-option';

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
  private readonly translate = inject(TranslateService);

  $drawerVisible = signal<boolean>(false);
  $languageDialogVisible = signal<boolean>(false);
  $languages = signal<LanguageOption[]>(this.buildLanguageOptions());
  $currentLanguage = signal<string>(
    this.$languages().find(
      (language) => language.value === this.translate.getBrowserLang(),
    )?.value || 'en',
  );

  constructor() {
    this.translate.use(this.$currentLanguage());
  }

  protected changeLanguage(lang: string): void {
    this.$currentLanguage.set(lang);
    this.translate.use(lang);

    if (this.$languageDialogVisible()) this.$languageDialogVisible.set(false);
  }

  private buildLanguageOptions(): LanguageOption[] {
    const codes = this.translate.getLangs();
    const labels: Record<string, string> = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      de: 'Deutsch',
    };

    return codes.map((code) => ({
      value: code,
      label: labels[code] || code,
    }));
  }
}
