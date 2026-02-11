/** localStorage key for consent level ('all' | 'necessary'). */
export const STORAGE_KEY = 'loi25-consent';

/** localStorage key for consent timestamp. */
export const STORAGE_DATE_KEY = 'loi25-consent-date';

/** Custom event name dispatched when consent changes programmatically. */
export const CONSENT_CHANGE_EVENT = 'loi25-consent-change';

/** Default brand color (blue). */
export const DEFAULT_BRAND_COLOR = '#1d4ed8';

/** Default consent expiry in days. */
export const DEFAULT_EXPIRY_DAYS = 365;

/** Default wait_for_update value in milliseconds for Google Consent Mode v2. */
export const DEFAULT_WAIT_FOR_UPDATE = 500;

/** Default banner texts for both languages. */
export const DEFAULT_TEXTS = {
  fr: {
    title: 'Respect de votre vie privée',
    message:
      'Ce site utilise des témoins (cookies) pour améliorer votre expérience. Conformément à la Loi 25 du Québec, nous demandons votre consentement.',
    accept: 'Tout accepter',
    reject: 'Nécessaires seulement',
    privacy: 'Politique de confidentialité',
    powered: 'Propulsé par',
  },
  en: {
    title: 'Your Privacy Matters',
    message:
      "This website uses cookies to improve your experience. In compliance with Quebec's Law 25, we ask for your consent.",
    accept: 'Accept All',
    reject: 'Necessary Only',
    privacy: 'Privacy Policy',
    powered: 'Powered by',
  },
} as const;
