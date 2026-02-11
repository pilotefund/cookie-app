'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { ConsentLevel, ConsentState } from './types';
import {
  STORAGE_KEY,
  STORAGE_DATE_KEY,
  CONSENT_CHANGE_EVENT,
  DEFAULT_EXPIRY_DAYS,
} from './defaults';

// ─── External store helpers ───

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

// ─── Helpers ───

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

// ─── Hook ───

/**
 * React hook to read and manage cookie consent state.
 *
 * SSR-safe — returns `null` consent on the server.
 * Automatically syncs across tabs and with the `<CookieConsent>` component.
 *
 * @param expiryDays - Number of days before consent expires. Default: 365.
 *
 * @example
 * ```tsx
 * const { consent, hasConsent, resetConsent } = useConsent();
 *
 * if (hasConsent && consent === 'all') {
 *   // User accepted all cookies
 * }
 * ```
 */
export function useConsent(expiryDays: number = DEFAULT_EXPIRY_DAYS): ConsentState {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Validate that consent hasn't expired
  const isValid = (() => {
    if (!raw) return false;
    if (typeof window === 'undefined') return false;
    return !isExpired(expiryDays);
  })();

  const consent: ConsentLevel | null = isValid ? (raw as ConsentLevel) : null;

  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_DATE_KEY);
    } catch {
      // Silently fail if localStorage is unavailable
    }
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  const setConsent = useCallback((level: ConsentLevel) => {
    try {
      localStorage.setItem(STORAGE_KEY, level);
      localStorage.setItem(STORAGE_DATE_KEY, Date.now().toString());
    } catch {
      // Silently fail if localStorage is unavailable
    }
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }, []);

  return {
    consent,
    hasConsent: consent !== null,
    resetConsent,
    setConsent,
  };
}
