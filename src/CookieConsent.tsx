"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { CookieConsentProps, ConsentLevel } from "./types";
import {
  DEFAULT_TEXTS,
  STORAGE_KEY,
  STORAGE_DATE_KEY,
  CONSENT_CHANGE_EVENT,
  DEFAULT_BRAND_COLOR,
  DEFAULT_EXPIRY_DAYS,
  DEFAULT_WAIT_FOR_UPDATE,
} from "./defaults";

// ─── Helpers ───

function detectLanguage(): "fr" | "en" {
  if (typeof navigator === "undefined") return "fr";
  const lang = navigator.language?.substring(0, 2);
  return lang === "en" ? "en" : "fr";
}

function isExpired(expiryDays: number): boolean {
  try {
    const d = localStorage.getItem(STORAGE_DATE_KEY);
    if (!d) return true;
    const age = (Date.now() - parseInt(d, 10)) / (1000 * 60 * 60 * 24);
    return age > expiryDays;
  } catch {
    return true;
  }
}

function getStoredConsent(expiryDays: number): ConsentLevel | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentLevel | null;
    if (stored && !isExpired(expiryDays)) return stored;
    // Expired — clean up
    if (stored) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_DATE_KEY);
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Injected CSS (hover, focus, responsive, glassmorphism) ───

function buildInjectCss(
  brandColor: string,
  glassmorphism: boolean,
  customCss: string,
): string {
  return `
#loi25-banner *{box-sizing:border-box;margin:0;padding:0;}
#loi25-banner button{cursor:pointer;transition:transform .15s,opacity .15s;}
#loi25-banner button:hover{transform:translateY(-1px);opacity:.9;}
#loi25-banner button:focus-visible,#loi25-banner a:focus-visible{outline:2px solid ${brandColor};outline-offset:2px;}
${glassmorphism ? "#loi25-banner.loi25-glass{backdrop-filter:blur(16px) saturate(1.8);-webkit-backdrop-filter:blur(16px) saturate(1.8);}" : ""}
#loi25-reconsent{transition:transform .2s,opacity .3s;}
#loi25-reconsent:hover{transform:scale(1.1)!important;}
@media(max-width:600px){
  #loi25-banner .loi25-inner{padding:16px!important;}
  #loi25-banner .loi25-btns{flex-direction:column!important;}
  #loi25-banner .loi25-btns button{width:100%!important;}
}
${customCss}`.trim();
}

// ─── Theme colors (matches WordPress plugin exactly) ───

function getThemeColors(theme: "light" | "dark", glassmorphism: boolean) {
  const dk = theme === "dark";
  return {
    bg: dk
      ? `rgba(24,24,27,${glassmorphism ? ".75" : "1"})`
      : `rgba(255,255,255,${glassmorphism ? ".8" : "1"})`,
    text: dk ? "#e4e4e7" : "#1e293b",
    muted: dk ? "#a1a1aa" : "#64748b",
    border: dk ? "#3f3f46" : "#e2e8f0",
    btnBg: dk ? "#27272a" : "#f1f5f9",
    btnText: dk ? "#e4e4e7" : "#334155",
  };
}

// ─── Main Component ───

/**
 * Quebec Law 25 cookie consent banner.
 *
 * Drop-in React component with script blocking, Google Consent Mode v2,
 * 3 banner styles (bar / popup / corner), bilingual support, and smooth
 * animations. Zero external dependencies.
 *
 * **Google Consent Mode v2 compliance** requires a synchronous inline
 * `<script>` in `<head>` that sets consent defaults **before** Google tags
 * load. Use `getConsentModeScript()` for this. The `<CookieConsent>`
 * component then handles the `consent('update', ...)` calls when the user
 * interacts with the banner.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js 15 App Router)
 * import { CookieConsent, getConsentModeScript } from 'cookie-app';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="fr">
 *       <head>
 *         // 1. Consent defaults — MUST come before the Google tag
 *         <script dangerouslySetInnerHTML=&#123;&#123; __html: getConsentModeScript() &#125;&#125; />
 *         // 2. Google tag (gtag.js)
 *         <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" />
 *       </head>
 *       <body>
 *         {children}
 *         // 3. Consent banner — handles consent('update') on user choice
 *         <CookieConsent
 *           lang="auto"
 *           style="popup"
 *           theme="dark"
 *           glassmorphism
 *           consentMode
 *           adsDataRedaction
 *           urlPassthrough
 *           privacyUrl="/privacy"
 *           onConsent={(level) => console.log('Consent:', level)}
 *         />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function CookieConsent({
  lang = "fr",
  position = "bottom",
  theme = "light",
  style = "bar",
  glassmorphism = false,
  privacyUrl = "/politique-de-confidentialite",
  poweredBy = false,
  brandColor = DEFAULT_BRAND_COLOR,
  expiryDays = DEFAULT_EXPIRY_DAYS,
  showReconsent = true,
  animation = "slide",
  showIcon = true,
  customCss = "",
  textsFr,
  textsEn,
  onConsent,
  consentMode = false,
  adsDataRedaction = false,
  urlPassthrough = false,
  consentModeRegion,
  waitForUpdate = DEFAULT_WAIT_FOR_UPDATE,
  scripts = "",
  reloadOnConsent = false,
}: CookieConsentProps) {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsentState] = useState<ConsentLevel | null>(null);
  const scriptsInjectedRef = useRef(false);
  const consentModeInitRef = useRef(false);

  // ─── Resolve language ───
  const resolvedLang =
    lang === "auto" ? (mounted ? detectLanguage() : "fr") : lang;

  // ─── Resolve texts ───
  const defaults = DEFAULT_TEXTS[resolvedLang] || DEFAULT_TEXTS.fr;
  const customTexts = resolvedLang === "fr" ? textsFr : textsEn;
  const texts = {
    title: customTexts?.title || defaults.title,
    message: customTexts?.message || defaults.message,
    accept: customTexts?.accept || defaults.accept,
    reject: customTexts?.reject || defaults.reject,
    privacy: customTexts?.privacy || defaults.privacy,
    powered: customTexts?.powered || defaults.powered,
  };

  // ─── Theme colors ───
  const colors = getThemeColors(theme, glassmorphism);

  // ─── Initialize on mount ───
  useEffect(() => {
    setMounted(true);
    const stored = getStoredConsent(expiryDays);
    setConsentState(stored);
    if (!stored) {
      setShowBanner(true);
    }
  }, [expiryDays]);

  // ─── Sync with external consent changes (e.g. useConsent().resetConsent) ───
  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      const stored = getStoredConsent(expiryDays);
      setConsentState(stored);
      if (!stored && !showBanner) {
        setIsVisible(false);
        setShowBanner(true);
      }
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [mounted, expiryDays, showBanner]);

  // ─── Animate banner in ───
  useEffect(() => {
    if (!showBanner || !mounted) return;

    // Double rAF — matches the WordPress plugin's animation trigger
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    // Focus accept button for accessibility
    const timer = setTimeout(() => {
      const btn = document.getElementById("loi25-yes");
      if (btn) btn.focus();
    }, 500);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(timer);
    };
  }, [showBanner, mounted]);

  // ─── Google Consent Mode v2 ───
  useEffect(() => {
    if (!consentMode || !mounted) return;

    // Set up dataLayer and gtag
    const w = window as unknown as Record<string, unknown>;
    w.dataLayer = (w.dataLayer as unknown[]) || [];
    if (!w.gtag) {
      w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        (w.dataLayer as unknown[]).push(arguments);
      };
    }

    const gtag = w.gtag as (...args: unknown[]) => void;

    // Only set defaults once
    if (!consentModeInitRef.current) {
      consentModeInitRef.current = true;

      // Google requires defaults to ALWAYS start as 'denied' for tracking
      // types. Functional/security types default to 'granted'.
      const defaultConsent: Record<string, unknown> = {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        functionality_storage: "granted",
        personalization_storage: "granted",
        security_storage: "granted",
        wait_for_update: waitForUpdate,
      };

      // Scope defaults to specific regions if provided
      if (consentModeRegion && consentModeRegion.length > 0) {
        defaultConsent.region = consentModeRegion;
      }

      gtag("consent", "default", defaultConsent);

      // Redact ad click identifiers when ad_storage is denied
      if (adsDataRedaction) {
        gtag("set", "ads_data_redaction", true);
      }

      // Pass GCLID/DCLID through URL params when cookies are denied
      if (urlPassthrough) {
        gtag("set", "url_passthrough", true);
      }

      // If the user previously granted consent, immediately update so
      // tags fire with full measurement data without waiting for the banner.
      if (consent === "all") {
        gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
        });
      }
    }
  }, [
    consentMode,
    consent,
    mounted,
    waitForUpdate,
    consentModeRegion,
    adsDataRedaction,
    urlPassthrough,
  ]);

  // ─── Script Vault: inject scripts when consent is 'all' ───
  useEffect(() => {
    if (!scripts || consent !== "all" || !mounted || scriptsInjectedRef.current)
      return;
    scriptsInjectedRef.current = true;

    const tmp = document.createElement("div");
    tmp.innerHTML = scripts;
    const els = tmp.querySelectorAll("script");
    els.forEach((el) => {
      const ns = document.createElement("script");
      if (el.src) {
        ns.src = el.src;
      } else {
        ns.textContent = el.text || el.textContent || "";
      }
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== "src") ns.setAttribute(attr.name, attr.value);
      });
      document.head.appendChild(ns);
    });
  }, [scripts, consent, mounted]);

  // ─── Keyboard: Escape = Necessary Only ───
  useEffect(() => {
    if (!showBanner) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleConsent("necessary");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBanner]);

  // ─── Handle consent ───
  const handleConsent = useCallback(
    (level: ConsentLevel) => {
      // Store in localStorage
      try {
        localStorage.setItem(STORAGE_KEY, level);
        localStorage.setItem(STORAGE_DATE_KEY, Date.now().toString());
      } catch {
        // Silently fail
      }

      setConsentState(level);
      setIsVisible(false); // Trigger exit animation

      // Update Google Consent Mode — always send the update for both
      // 'all' (granted) and 'necessary' (denied). This is critical for
      // the reconsent flow where a user revokes previously granted consent.
      if (consentMode) {
        const w = window as unknown as Record<string, unknown>;
        const gtag = w.gtag as ((...args: unknown[]) => void) | undefined;
        if (gtag) {
          const granted = level === "all";
          gtag("consent", "update", {
            ad_storage: granted ? "granted" : "denied",
            ad_user_data: granted ? "granted" : "denied",
            ad_personalization: granted ? "granted" : "denied",
            analytics_storage: granted ? "granted" : "denied",
          });
        }
      }

      // Fire callback
      onConsent?.(level);

      // Dispatch custom event for useConsent hook
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));

      // Remove banner after animation completes
      setTimeout(() => {
        setShowBanner(false);

        // Reload if scripts need to run from page start
        if (reloadOnConsent && level === "all" && scripts) {
          window.location.reload();
        }
      }, 400);
    },
    [consentMode, onConsent, reloadOnConsent, scripts],
  );

  // ─── Handle reconsent ───
  const handleReconsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_DATE_KEY);
    } catch {
      // Silently fail
    }
    setConsentState(null);
    setIsVisible(false);
    setShowBanner(true);
    scriptsInjectedRef.current = false;
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  // ─── SSR guard ───
  if (!mounted) return null;

  // ─── Banner styles ───
  const getBannerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily:
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif",
      lineHeight: 1.5,
      boxSizing: "border-box" as const,
      zIndex: 999999,
    };

    if (style === "bar") {
      const borderSide = position === "top" ? "borderBottom" : "borderTop";
      return {
        ...base,
        position: "fixed" as const,
        left: 0,
        right: 0,
        ...(position === "top" ? { top: 0 } : { bottom: 0 }),
        background: colors.bg,
        [borderSide]: `1px solid ${colors.border}`,
        padding: 0,
        color: colors.text,
        boxShadow: `0 ${position === "top" ? "2" : "-2"}px 20px rgba(0,0,0,.1)`,
        transition:
          animation === "slide"
            ? "transform .4s cubic-bezier(.4,0,.2,1), opacity .4s ease"
            : "opacity .5s ease",
        transform: isVisible
          ? "translateY(0)"
          : animation === "slide"
            ? `translateY(${position === "bottom" ? "100%" : "-100%"})`
            : "none",
        opacity: isVisible ? 1 : 0,
      };
    }

    if (style === "popup") {
      return {
        ...base,
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        maxWidth: 480,
        width: "calc(100% - 40px)",
        borderRadius: 16,
        padding: 0,
        background: colors.bg,
        color: colors.text,
        boxShadow: "0 25px 60px rgba(0,0,0,.2)",
        transition: "transform .35s cubic-bezier(.4,0,.2,1), opacity .35s ease",
        transform: isVisible
          ? "translate(-50%, -50%) scale(1)"
          : "translate(-50%, -50%) scale(.9)",
        opacity: isVisible ? 1 : 0,
      };
    }

    // corner
    return {
      ...base,
      position: "fixed" as const,
      ...(position === "top" ? { top: 20 } : { bottom: 20 }),
      right: 20,
      maxWidth: 380,
      width: "calc(100% - 40px)",
      borderRadius: 16,
      padding: 0,
      background: colors.bg,
      color: colors.text,
      boxShadow: "0 8px 30px rgba(0,0,0,.12)",
      border: `1px solid ${colors.border}`,
      transition:
        animation === "slide"
          ? "transform .4s cubic-bezier(.4,0,.2,1), opacity .4s ease"
          : "opacity .5s ease",
      transform: isVisible
        ? "translateX(0)"
        : animation === "slide"
          ? "translateX(120%)"
          : "none",
      opacity: isVisible ? 1 : 0,
    };
  };

  return (
    <>
      {/* ─── Injected styles for hover, focus, responsive, glassmorphism ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: buildInjectCss(brandColor, glassmorphism, customCss),
        }}
      />

      {/* ─── Popup overlay ─── */}
      {showBanner && style === "popup" && (
        <div
          id='loi25-overlay'
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999998,
            background: "rgba(0,0,0,.4)",
            opacity: isVisible ? 1 : 0,
            transition: "opacity .35s ease",
          }}
        />
      )}

      {/* ─── Consent Banner ─── */}
      {showBanner && (
        <div
          id='loi25-banner'
          role='dialog'
          aria-label={
            resolvedLang === "fr"
              ? "Consentement aux cookies"
              : "Cookie consent"
          }
          aria-modal={style === "popup" ? "true" : undefined}
          className={glassmorphism ? "loi25-glass" : undefined}
          style={getBannerStyle()}
        >
          <div className='loi25-inner' style={{ padding: "24px 28px" }}>
            {/* Title */}
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {showIcon && <span style={{ fontSize: 22 }}>🍪</span>}
              {texts.title}
            </div>

            {/* Message */}
            <p
              style={{
                margin: "0 0 18px",
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {texts.message}
            </p>

            {/* Buttons */}
            <div
              className='loi25-btns'
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              <button
                id='loi25-yes'
                type='button'
                onClick={() => handleConsent("all")}
                style={{
                  background: brandColor,
                  color: "#fff",
                  border: "none",
                  padding: "11px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {texts.accept}
              </button>
              <button
                id='loi25-no'
                type='button'
                onClick={() => handleConsent("necessary")}
                style={{
                  background: colors.btnBg,
                  color: colors.btnText,
                  border: `1px solid ${colors.border}`,
                  padding: "11px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {texts.reject}
              </button>
            </div>

            {/* Footer links */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <a
                href={privacyUrl}
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  textDecoration: "underline",
                }}
                target='_blank'
                rel='noopener noreferrer'
              >
                {texts.privacy}
              </a>
              {poweredBy && (
                <a
                  href='https://rayelsconsulting.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    marginLeft: "auto",
                    textDecoration: "none",
                    opacity: 0.6,
                  }}
                >
                  {texts.powered} Pomme&Olive
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Reconsent floating button ─── */}
      {!showBanner && consent !== null && showReconsent && (
        <button
          id='loi25-reconsent'
          type='button'
          onClick={handleReconsent}
          aria-label={
            resolvedLang === "fr" ? "Gérer les cookies" : "Manage cookies"
          }
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 999998,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: brandColor,
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showIcon ? "🍪" : "⚙️"}
        </button>
      )}
    </>
  );
}
