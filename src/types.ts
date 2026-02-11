/** The level of consent granted by the user. */
export type ConsentLevel = "all" | "necessary";

/** Banner language. `'auto'` detects from `navigator.language`. */
export type Language = "fr" | "en" | "auto";

/** Banner display style. */
export type BannerStyle = "bar" | "popup" | "corner";

/** Banner position (applies to bar and corner styles). */
export type BannerPosition = "top" | "bottom";

/** Color theme for the banner. */
export type BannerTheme = "light" | "dark";

/** Animation type for the banner entrance/exit. */
export type Animation = "slide" | "fade";

/** Custom text overrides for one language. */
export interface ConsentTexts {
  /** Banner title. */
  title?: string;
  /** Banner message/description. */
  message?: string;
  /** Accept button label. */
  accept?: string;
  /** Reject button label. */
  reject?: string;
  /** Privacy policy link text. */
  privacy?: string;
  /** "Powered by" text (only shown when `poweredBy` is true). */
  powered?: string;
}

/** Props for the `<CookieConsent>` component. */
export interface CookieConsentProps {
  /**
   * Banner language. `'auto'` detects from `navigator.language`.
   * @default 'fr'
   */
  lang?: Language;

  /**
   * Banner position — applies to `bar` and `corner` styles.
   * @default 'bottom'
   */
  position?: BannerPosition;

  /**
   * Color theme.
   * @default 'light'
   */
  theme?: BannerTheme;

  /**
   * Banner display style.
   * - `'bar'` — full-width bar fixed to top or bottom.
   * - `'popup'` — centered modal with overlay.
   * - `'corner'` — small widget in the corner.
   * @default 'bar'
   */
  style?: BannerStyle;

  /**
   * Enable glassmorphism (frosted glass) effect.
   * @default false
   */
  glassmorphism?: boolean;

  /**
   * URL to your privacy policy page.
   * @default '/politique-de-confidentialite'
   */
  privacyUrl?: string;

  /**
   * Show a "Powered by Pomme&Olive" attribution link.
   * @default false
   */
  poweredBy?: boolean;

  /**
   * Brand color for the Accept button and reconsent button.
   * Any valid CSS color string.
   * @default '#1d4ed8'
   */
  brandColor?: string;

  /**
   * Number of days before consent expires and the banner reappears.
   * @default 365
   */
  expiryDays?: number;

  /**
   * Show a floating reconsent button after the user makes a choice.
   * @default true
   */
  showReconsent?: boolean;

  /**
   * Animation type for banner entrance and exit.
   * @default 'slide'
   */
  animation?: Animation;

  /**
   * Show cookie emoji icon in the banner title and reconsent button.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom CSS injected as a `<style>` tag. Target `#loi25-banner`
   * and `#loi25-reconsent`.
   * @default ''
   */
  customCss?: string;

  /**
   * Custom texts for the French banner. Unset fields use built-in defaults.
   */
  textsFr?: ConsentTexts;

  /**
   * Custom texts for the English banner. Unset fields use built-in defaults.
   */
  textsEn?: ConsentTexts;

  /**
   * Callback fired when the user makes a consent choice.
   * Use this to log consent to your backend, analytics, etc.
   */
  onConsent?: (level: ConsentLevel) => void;

  /**
   * Enable Google Consent Mode v2. Automatically manages `ad_storage`,
   * `analytics_storage`, `ad_user_data`, and `ad_personalization` signals.
   *
   * For full compliance, also place a synchronous `<script>` in `<head>`
   * using `getConsentModeScript()` **before** the Google tag loads.
   * @default false
   */
  consentMode?: boolean;

  /**
   * When `true` and `ad_storage` is denied, ad click identifiers in pings
   * are redacted and requests go through a cookieless domain.
   * Maps to `gtag('set', 'ads_data_redaction', true)`.
   * @default false
   */
  adsDataRedaction?: boolean;

  /**
   * When `true`, passes ad click information (GCLID / DCLID) through URL
   * parameters across pages when `ad_storage` is denied.
   * Maps to `gtag('set', 'url_passthrough', true)`.
   * @default false
   */
  urlPassthrough?: boolean;

  /**
   * ISO 3166-2 region codes to scope the consent default.
   * Example: `['CA-QC']` for Quebec only.
   * When set, the consent defaults only apply to visitors from those regions,
   * preserving full measurement for visitors elsewhere.
   */
  consentModeRegion?: string[];

  /**
   * Milliseconds Google tags wait for a consent update before firing.
   * Required because React banners always load asynchronously.
   * @default 500
   */
  waitForUpdate?: number;

  /**
   * Raw HTML string of analytics/tracking scripts to block until consent.
   * Scripts are only injected into `<head>` after the user clicks "Accept All".
   *
   * Supports Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, etc.
   * @default ''
   */
  scripts?: string;

  /**
   * Force a page reload after "Accept All" when `scripts` are provided.
   * Useful for scripts that must run at page load time (e.g., GTM).
   * @default false
   */
  reloadOnConsent?: boolean;
}

/** Return type for the `useConsent` hook. */
export interface ConsentState {
  /** Current consent level, or `null` if no valid consent exists. */
  consent: ConsentLevel | null;

  /** Whether the user has given any consent that hasn't expired. */
  hasConsent: boolean;

  /** Reset consent — clears stored consent and triggers the banner to reappear. */
  resetConsent: () => void;

  /** Programmatically set the consent level. */
  setConsent: (level: ConsentLevel) => void;
}
