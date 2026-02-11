import { STORAGE_KEY, STORAGE_DATE_KEY, DEFAULT_EXPIRY_DAYS } from './defaults';

// ─── Types ───

/** Options for the synchronous consent mode default script. */
export interface ConsentModeDefaults {
  /** Default state for advertising cookie storage. @default 'denied' */
  analytics_storage?: 'granted' | 'denied';
  /** Default state for analytics cookie storage. @default 'denied' */
  ad_storage?: 'granted' | 'denied';
  /** Default state for sending user data to Google for advertising. @default 'denied' */
  ad_user_data?: 'granted' | 'denied';
  /** Default state for personalized advertising. @default 'denied' */
  ad_personalization?: 'granted' | 'denied';
  /** Default state for functionality storage (e.g. language settings). @default 'granted' */
  functionality_storage?: 'granted' | 'denied';
  /** Default state for personalization storage (e.g. video recommendations). @default 'granted' */
  personalization_storage?: 'granted' | 'denied';
  /** Default state for security storage (e.g. authentication, fraud prevention). @default 'granted' */
  security_storage?: 'granted' | 'denied';
  /**
   * Milliseconds Google tags wait for a consent update before firing.
   * Required for async consent banners (React components always load async).
   * @default 500
   */
  wait_for_update?: number;
  /**
   * ISO 3166-2 region codes to scope the consent defaults.
   * Example: `['CA-QC']` for Quebec only.
   */
  region?: string[];
  /**
   * When `true` and `ad_storage` is denied, ad click identifiers in pings
   * are redacted and requests go through a cookieless domain.
   * @default false
   */
  ads_data_redaction?: boolean;
  /**
   * When `true`, passes ad click information (GCLID/DCLID) through URL
   * parameters across pages when `ad_storage` is denied.
   * @default false
   */
  url_passthrough?: boolean;
  /**
   * Number of days before stored consent expires.
   * Must match the `expiryDays` prop on `<CookieConsent>`.
   * @default 365
   */
  expiry_days?: number;
}

// ─── Script Generator ───

/**
 * Returns a self-contained JavaScript string that sets Google Consent Mode v2
 * defaults **synchronously**. Place this in `<head>` **before** the Google tag
 * (gtag.js or GTM) so that consent defaults are visible when tags initialize.
 *
 * On returning visits where the user previously accepted all cookies, the
 * script also calls `consent('update', ...)` immediately so tags fire with
 * full measurement data without waiting for the React banner to hydrate.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { getConsentModeScript } from 'cookie-app';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="fr">
 *       <head>
 *         // Consent defaults — MUST come before the Google tag
 *         <script dangerouslySetInnerHTML=&#123;&#123; __html: getConsentModeScript() &#125;&#125; />
 *         // Google tag (gtag.js) goes AFTER the consent default
 *       </head>
 *       <body>
 *         {children}
 *         <CookieConsent consentMode />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function getConsentModeScript(options?: ConsentModeDefaults): string {
  const opts = options ?? {};

  const adStorage = opts.ad_storage ?? 'denied';
  const adUserData = opts.ad_user_data ?? 'denied';
  const adPersonalization = opts.ad_personalization ?? 'denied';
  const analyticsStorage = opts.analytics_storage ?? 'denied';
  const functionalityStorage = opts.functionality_storage ?? 'granted';
  const personalizationStorage = opts.personalization_storage ?? 'granted';
  const securityStorage = opts.security_storage ?? 'granted';
  const waitForUpdate = opts.wait_for_update ?? 500;
  const region = opts.region;
  const adsDataRedaction = opts.ads_data_redaction ?? false;
  const urlPassthrough = opts.url_passthrough ?? false;
  const expiryDays = opts.expiry_days ?? DEFAULT_EXPIRY_DAYS;

  // Build the consent default object as a JSON-safe string
  const defaultObj: Record<string, unknown> = {
    ad_storage: adStorage,
    ad_user_data: adUserData,
    ad_personalization: adPersonalization,
    analytics_storage: analyticsStorage,
    functionality_storage: functionalityStorage,
    personalization_storage: personalizationStorage,
    security_storage: securityStorage,
    wait_for_update: waitForUpdate,
  };

  if (region && region.length > 0) {
    defaultObj.region = region;
  }

  const defaultJson = JSON.stringify(defaultObj);

  // Build optional gtag('set', ...) calls
  const setCalls: string[] = [];
  if (adsDataRedaction) {
    setCalls.push("gtag('set','ads_data_redaction',true);");
  }
  if (urlPassthrough) {
    setCalls.push("gtag('set','url_passthrough',true);");
  }

  // The inline script:
  // 1. Defines dataLayer + gtag
  // 2. Sets consent defaults (always denied for tracking types)
  // 3. Optionally sets ads_data_redaction / url_passthrough
  // 4. Checks localStorage for returning users and calls consent('update')
  return [
    // Define dataLayer and gtag
    `window.dataLayer=window.dataLayer||[];`,
    `function gtag(){dataLayer.push(arguments);}`,

    // Set consent defaults
    `gtag('consent','default',${defaultJson});`,

    // Optional set calls
    ...setCalls,

    // Check for returning user with stored consent
    `(function(){`,
    `  try{`,
    `    var c=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});`,
    `    var d=localStorage.getItem(${JSON.stringify(STORAGE_DATE_KEY)});`,
    `    if(c&&d){`,
    `      var age=(Date.now()-parseInt(d,10))/(1000*60*60*24);`,
    `      if(age<=${expiryDays}&&c==='all'){`,
    `        gtag('consent','update',{`,
    `          'ad_storage':'granted',`,
    `          'ad_user_data':'granted',`,
    `          'ad_personalization':'granted',`,
    `          'analytics_storage':'granted'`,
    `        });`,
    `      }`,
    `    }`,
    `  }catch(e){}`,
    `})();`,
  ].join('\n');
}
