import en from '@bot/locale/en';
import ru from '@bot/locale/ru';

type Language = 'en' | 'ru';

export class Localization {
  getLocale(lang: Language) {
    switch (lang) {
      case 'en':
        return en;
      case 'ru':
        return ru;
      default:
        return en;
    }
  }
}

export default Localization;
