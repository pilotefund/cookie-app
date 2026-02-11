import { useState } from "react";
import { CookieConsent, useConsent } from "cookie-app";
import type {
  BannerStyle,
  BannerTheme,
  Animation,
  BannerPosition,
} from "cookie-app";

// ─── Controls panel to test every prop live ───

function Controls({
  config,
  setConfig,
}: {
  config: BannerConfig;
  setConfig: React.Dispatch<React.SetStateAction<BannerConfig>>;
}) {
  return (
    <section style={card}>
      <h2 style={heading}>Banner Settings</h2>
      <p style={hint}>Change these to preview different configurations live.</p>

      <div style={grid}>
        <Field label='Style'>
          <select
            value={config.style}
            onChange={(e) =>
              setConfig((c) => ({ ...c, style: e.target.value as BannerStyle }))
            }
            style={select}
          >
            <option value='bar'>Bar</option>
            <option value='popup'>Popup</option>
            <option value='corner'>Corner</option>
          </select>
        </Field>

        <Field label='Position'>
          <select
            value={config.position}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                position: e.target.value as BannerPosition,
              }))
            }
            style={select}
          >
            <option value='bottom'>Bottom</option>
            <option value='top'>Top</option>
          </select>
        </Field>

        <Field label='Theme'>
          <select
            value={config.theme}
            onChange={(e) =>
              setConfig((c) => ({ ...c, theme: e.target.value as BannerTheme }))
            }
            style={select}
          >
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </select>
        </Field>

        <Field label='Animation'>
          <select
            value={config.animation}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                animation: e.target.value as Animation,
              }))
            }
            style={select}
          >
            <option value='slide'>Slide</option>
            <option value='fade'>Fade</option>
          </select>
        </Field>

        <Field label='Language'>
          <select
            value={config.lang}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                lang: e.target.value as "fr" | "en" | "auto",
              }))
            }
            style={select}
          >
            <option value='fr'>Français</option>
            <option value='en'>English</option>
            <option value='auto'>Auto-detect</option>
          </select>
        </Field>

        <Field label='Brand Color'>
          <input
            type='color'
            value={config.brandColor}
            onChange={(e) =>
              setConfig((c) => ({ ...c, brandColor: e.target.value }))
            }
            style={{
              width: 48,
              height: 36,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              cursor: "pointer",
            }}
          />
        </Field>
      </div>

      <div
        style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}
      >
        <label style={checkLabel}>
          <input
            type='checkbox'
            checked={config.glassmorphism}
            onChange={(e) =>
              setConfig((c) => ({ ...c, glassmorphism: e.target.checked }))
            }
          />
          Glassmorphism
        </label>
        <label style={checkLabel}>
          <input
            type='checkbox'
            checked={config.showIcon}
            onChange={(e) =>
              setConfig((c) => ({ ...c, showIcon: e.target.checked }))
            }
          />
          Cookie Icon
        </label>
        <label style={checkLabel}>
          <input
            type='checkbox'
            checked={config.showReconsent}
            onChange={(e) =>
              setConfig((c) => ({ ...c, showReconsent: e.target.checked }))
            }
          />
          Reconsent Button
        </label>
        <label style={checkLabel}>
          <input
            type='checkbox'
            checked={config.consentMode}
            onChange={(e) =>
              setConfig((c) => ({ ...c, consentMode: e.target.checked }))
            }
          />
          Google Consent Mode
        </label>
        <label style={checkLabel}>
          <input
            type='checkbox'
            checked={config.poweredBy}
            onChange={(e) =>
              setConfig((c) => ({ ...c, poweredBy: e.target.checked }))
            }
          />
          Powered By
        </label>
      </div>
    </section>
  );
}

// ─── Consent status display ───

function ConsentStatus() {
  const { consent, hasConsent, resetConsent } = useConsent();

  return (
    <section style={card}>
      <h2 style={heading}>Consent Status (useConsent hook)</h2>

      <div style={grid}>
        <div
          style={{
            background: hasConsent ? "#f0fdf4" : "#fef2f2",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: hasConsent ? "#16a34a" : "#dc2626",
            }}
          >
            {hasConsent ? "Yes" : "No"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Has Consent</div>
        </div>
        <div
          style={{
            background: "#f0f9ff",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>
            {consent ?? "null"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Consent Level</div>
        </div>
      </div>

      {/* Conditional messages */}
      <div style={{ marginTop: 16 }}>
        {consent === "all" && (
          <div
            style={{
              ...alert,
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
              color: "#166534",
            }}
          >
            Analytics scripts are loaded. All cookies accepted.
          </div>
        )}
        {consent === "necessary" && (
          <div
            style={{
              ...alert,
              background: "#fef9c3",
              borderColor: "#fde047",
              color: "#854d0e",
            }}
          >
            Only necessary cookies active. Analytics are blocked.
          </div>
        )}
        {!hasConsent && (
          <div
            style={{
              ...alert,
              background: "#fef2f2",
              borderColor: "#fecaca",
              color: "#991b1b",
            }}
          >
            No consent yet. The banner should be visible.
          </div>
        )}
      </div>

      <button onClick={resetConsent} style={primaryBtn}>
        Reset Consent
      </button>
    </section>
  );
}

// ─── Code snippet ───

function CodeSnippet() {
  return (
    <section
      style={{
        ...card,
        background: "#1e293b",
        color: "#e2e8f0",
        border: "none",
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 12,
          color: "#94a3b8",
        }}
      >
        Vanilla JS API
      </h2>
      <pre style={{ fontSize: 13, lineHeight: 1.6, overflow: "auto" }}>
        <code>{`// Check consent from anywhere
localStorage.getItem('loi25-consent')
// → 'all' | 'necessary' | null

// Check consent timestamp
localStorage.getItem('loi25-consent-date')
// → Unix timestamp string`}</code>
      </pre>
    </section>
  );
}

// ─── Config type ───

interface BannerConfig {
  lang: "fr" | "en" | "auto";
  style: BannerStyle;
  position: BannerPosition;
  theme: BannerTheme;
  animation: Animation;
  brandColor: string;
  glassmorphism: boolean;
  showIcon: boolean;
  showReconsent: boolean;
  consentMode: boolean;
  poweredBy: boolean;
}

// ─── App ───

export function App() {
  const [config, setConfig] = useState<BannerConfig>({
    lang: "auto",
    style: "popup",
    position: "bottom",
    theme: "dark",
    animation: "slide",
    brandColor: "#7c3aed",
    glassmorphism: true,
    showIcon: true,
    showReconsent: true,
    consentMode: false,
    poweredBy: false,
  });

  return (
    <>
      <main
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 120px" }}
      >
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
            cookie-app
          </h1>
          <p style={{ color: "#64748b", fontSize: 16 }}>
            Quebec Law 25 cookie consent — interactive demo
          </p>
        </div>

        <Controls config={config} setConfig={setConfig} />
        <ConsentStatus />
        <CodeSnippet />

        <footer
          style={{
            marginTop: 40,
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          cookie-app v2.0.0 — by{" "}
          <a href='https://pomme-olive.com/' style={{ color: "#1d4ed8" }}>
            Pomme & Olive
          </a>
          , Montreal, Quebec
        </footer>
      </main>

      {/* ─── The consent banner — all settings driven by the controls above ─── */}
      <CookieConsent
        lang={config.lang}
        style={config.style}
        position={config.position}
        theme={config.theme}
        animation={config.animation}
        brandColor={config.brandColor}
        glassmorphism={config.glassmorphism}
        showIcon={config.showIcon}
        showReconsent={config.showReconsent}
        consentMode={config.consentMode}
        poweredBy={config.poweredBy}
        privacyUrl='/politique-de-confidentialite'
        expiryDays={365}
        textsFr={{
          title: "Respect de votre vie privée",
          message:
            "Ce site utilise des témoins (cookies) pour améliorer votre expérience. Conformément à la Loi 25 du Québec, nous demandons votre consentement.",
          accept: "Tout accepter",
          reject: "Nécessaires seulement",
        }}
        textsEn={{
          title: "Your Privacy Matters",
          message:
            "This website uses cookies to improve your experience. In compliance with Quebec's Law 25, we ask for your consent.",
          accept: "Accept All",
          reject: "Necessary Only",
        }}
        onConsent={(level) => {
          console.log("Consent:", level);
        }}
      />
    </>
  );
}

// ─── Shared styles ───

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 4,
          color: "#334155",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 24,
  marginBottom: 24,
};

const heading: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 4,
};

const hint: React.CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  marginBottom: 16,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 16,
};

const select: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  background: "#fff",
};

const checkLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  fontWeight: 500,
  color: "#334155",
  cursor: "pointer",
};

const alert: React.CSSProperties = {
  border: "1px solid",
  borderRadius: 8,
  padding: 16,
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = {
  marginTop: 16,
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
