import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { LanguageOption } from '../../core/models/language-option';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-language-select',
  imports: [SelectModule, DialogModule, CommonModule, FormsModule],
  templateUrl: './language-select.component.html',
})
export class LanguageSelectComponent {
  private readonly languageService = inject(LanguageService);

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
