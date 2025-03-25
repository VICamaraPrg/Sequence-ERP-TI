import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

const translateServiceStub = {
  getBrowserLang: jest.fn(),
  getLangs: jest.fn(),
  use: jest.fn(),
};

describe('LanguageService', () => {
  let languageService: LanguageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translateServiceStub },
      ],
    });

    languageService = TestBed.inject(LanguageService);

    translateServiceStub.getBrowserLang.mockReset();
    translateServiceStub.getLangs.mockReset();
    translateServiceStub.use.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getCurrentLanguage', () => {
    it('should return stored language if it is available in localStorage', () => {
      localStorage.setItem('language', 'es');
      const currentLang = languageService.getCurrentLanguage();
      expect(currentLang).toBe('es');
    });

    it('should return browser language when the stored language is not available and it exists in langs', () => {
      translateServiceStub.getBrowserLang.mockReturnValue('fr');
      translateServiceStub.getLangs.mockReturnValue(['en', 'fr', 'es']);

      const currentLang = languageService.getCurrentLanguage();
      expect(translateServiceStub.getBrowserLang).toHaveBeenCalled();
      expect(translateServiceStub.getLangs).toHaveBeenCalled();
      expect(currentLang).toBe('fr');
    });

    it('should return default "en" when stored language is not available and browser language is not in langs', () => {
      localStorage.removeItem('language');
      translateServiceStub.getBrowserLang.mockReturnValue('it');
      translateServiceStub.getLangs.mockReturnValue(['en', 'es', 'fr']);

      const currentLang = languageService.getCurrentLanguage();
      expect(currentLang).toBe('en');
    });
  });

  describe('setCurrentLanguage', () => {
    it('should set language in localStorage and call translate.use()', () => {
      languageService.setCurrentLanguage('de');
      expect(localStorage.getItem('language')).toBe('de');
      expect(translateServiceStub.use).toHaveBeenCalledWith('de');
    });

    it('should close language dialog if it is visible', () => {
      // Simulates that the language dialog is visible (mobile view)
      languageService.$languageDialogVisible.set(true);
      expect(languageService.$languageDialogVisible()).toBe(true);

      // Simulates that the used selects English.
      languageService.setCurrentLanguage('en');
      expect(languageService.$languageDialogVisible()).toBe(false);
    });
  });

  describe('getLanguageOptions', () => {
    it('should return correct language options based on available languages', () => {
      const availableLangs = ['es', 'en', 'fr', 'de'];
      translateServiceStub.getLangs.mockReturnValue(availableLangs);

      const labels: Record<string, string> = {
        es: 'Español',
        en: 'English',
        fr: 'Français',
        de: 'Deutsch',
      };

      const options = languageService.getLanguageOptions();

      expect(options).toHaveLength(availableLangs.length);

      options.forEach((option) => {
        expect(option.label).toBe(labels[option.value]);
      });
    });
  });
});
