import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json' with { type: 'json' };
import gu from './locales/gu.json' with { type: 'json' };
import hi from './locales/hi.json' with { type: 'json' };

const resources = {
  en: { translation: en },
  gu: { translation: gu },
  hi: { translation: hi }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
