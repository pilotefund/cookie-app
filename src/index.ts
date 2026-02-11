// ─── Components ───
export { CookieConsent } from './CookieConsent';

// ─── Hooks ───
export { useConsent } from './use-consent';

// ─── Google Consent Mode v2 ───
export { getConsentModeScript } from './consent-mode';
export type { ConsentModeDefaults } from './consent-mode';

// ─── Types ───
export type {
  ConsentLevel,
  Language,
  BannerStyle,
  BannerPosition,
  BannerTheme,
  Animation,
  ConsentTexts,
  CookieConsentProps,
  ConsentState,
} from './types';

// ─── Constants ───
export {
  STORAGE_KEY,
  STORAGE_DATE_KEY,
  CONSENT_CHANGE_EVENT,
  DEFAULT_BRAND_COLOR,
  DEFAULT_EXPIRY_DAYS,
  DEFAULT_WAIT_FOR_UPDATE,
  DEFAULT_TEXTS,
} from './defaults';
