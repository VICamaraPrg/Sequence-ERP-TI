import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageOption } from '../core/models/language-option';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  $languageDialogVisible = signal<boolean>(false);

  constructor(private translate: TranslateService) {}

  getCurrentLanguage(): string {
    const storedLang = localStorage.getItem('language');

    if (storedLang) return storedLang;

    const browserLang = this.translate.getBrowserLang();
    const langs = this.translate.getLangs();

    return langs.find((code) => code === browserLang) || 'en';
  }

  setCurrentLanguage(lang: string): void {
    localStorage.setItem('language', lang);
    this.translate.use(lang);

    if (this.$languageDialogVisible()) this.$languageDialogVisible.set(false);
  }

  getLanguageOptions(): LanguageOption[] {
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
