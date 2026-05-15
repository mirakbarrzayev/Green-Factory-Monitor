import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const generateSensorData = () => ({
  energy: +(60 + Math.random() * 40).toFixed(1),
  water: +(80 + Math.random() * 120).toFixed(1),
  co2: +(6 + Math.random() * 9).toFixed(2),
  timestamp: new Date().toLocaleTimeString("az-AZ"),
});

const mockHistory = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(8 + i).padStart(2, "0")}:00`,
  energy: +(45 + Math.random() * 55).toFixed(1),
  water: +(70 + Math.random() * 130).toFixed(1),
  co2: +(5 + Math.random() * 10).toFixed(2),
}));

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface User {
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface StoredUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

interface AlertThreshold {
  turbineMaxLoad: number;
  turbineMinFuel: number;
  boilerMaxTemp: number;
  boilerMaxCO2: number;
  chillerMaxPower: number;
  compMaxPressure: number;
  solarMinBattery: number;
}

interface AlertEvent {
  id: string;
  timestamp: string;
  equipmentId: string;
  equipmentName: string;
  paramName: string;
  currentValue: string;
  threshold: string;
  severity: "warning" | "critical";
  telegramSent: boolean;
}

const DEFAULT_THRESHOLDS: AlertThreshold = {
  turbineMaxLoad: 85,
  turbineMinFuel: 15,
  boilerMaxTemp: 200,
  boilerMaxCO2: 40,
  chillerMaxPower: 38,
  compMaxPressure: 9.5,
  solarMinBattery: 50,
};

function loadThresholds(): AlertThreshold {
  try { return { ...DEFAULT_THRESHOLDS, ...JSON.parse(localStorage.getItem("gf_thresholds") || "{}") }; }
  catch { return DEFAULT_THRESHOLDS; }
}

function loadAlertHistory(): AlertEvent[] {
  try { return JSON.parse(localStorage.getItem("gf_alerts") || "[]"); }
  catch { return []; }
}

function checkAlerts(equips: EquipItem[], thresholds: AlertThreshold): Array<Omit<AlertEvent, "id"|"timestamp"|"telegramSent">> {
  const out: Array<Omit<AlertEvent, "id"|"timestamp"|"telegramSent">> = [];
  const p = (eq: EquipItem, label: string) => eq.params.find(x => x.label === label);
  for (const eq of equips) {
    if (eq.id === "turbine") {
      const load = p(eq, "Cari yük (Peak)");
      if (load && +load.value > thresholds.turbineMaxLoad)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Cari yük", currentValue: `${load.value} kW`, threshold: `≤ ${thresholds.turbineMaxLoad} kW`, severity: "critical" });
      const fuel = p(eq, "Yanacaq səviyyəsi");
      if (fuel && +fuel.value < thresholds.turbineMinFuel)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Yanacaq səviyyəsi", currentValue: `${fuel.value}%`, threshold: `≥ ${thresholds.turbineMinFuel}%`, severity: "critical" });
    }
    if (eq.id === "boiler") {
      const temp = p(eq, "Temperatur");
      if (temp && +temp.value > thresholds.boilerMaxTemp)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Temperatur", currentValue: `${temp.value} °C`, threshold: `≤ ${thresholds.boilerMaxTemp} °C`, severity: +temp.value > thresholds.boilerMaxTemp + 10 ? "critical" : "warning" });
      const co2 = p(eq, "Carbon Footprint");
      if (co2 && +co2.value > thresholds.boilerMaxCO2)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "CO₂ emissiyası", currentValue: `${co2.value} kg/h`, threshold: `≤ ${thresholds.boilerMaxCO2} kg/h`, severity: "warning" });
    }
    if (eq.id === "chiller") {
      const pwr = p(eq, "Elektrik sərfiyyatı");
      if (pwr && +pwr.value > thresholds.chillerMaxPower)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Elektrik sərfiyyatı", currentValue: `${pwr.value} kW`, threshold: `≤ ${thresholds.chillerMaxPower} kW`, severity: "warning" });
    }
    if (eq.id === "compressor") {
      const pres = p(eq, "Sıxışdırma");
      if (pres && +pres.value > thresholds.compMaxPressure)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Sıxışdırma", currentValue: `${pres.value} bar`, threshold: `≤ ${thresholds.compMaxPressure} bar`, severity: "warning" });
    }
    if (eq.id === "solar") {
      const bat = p(eq, "Batareya dolumu");
      if (bat && +bat.value < thresholds.solarMinBattery)
        out.push({ equipmentId: eq.id, equipmentName: eq.name, paramName: "Batareya dolumu", currentValue: `${bat.value}%`, threshold: `≥ ${thresholds.solarMinBattery}%`, severity: "warning" });
    }
  }
  return out;
}

interface SensorData {
  energy: number;
  water: number;
  co2: number;
  timestamp: string;
}

interface HistoryEntry {
  time: string;
  energy: number;
  water: number;
  co2: number;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconDroplets = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);
const IconWind = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    )}
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconFactory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
);
const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/>
    <path d="M10 2c0 2.5 2 4 2 4s2-1.5 2-4"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6"/>
    <path d="M15.5 7.5l3 3L22 7l-3-3"/>
  </svg>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const gfStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050d0a;
    --bg2: #0a1a12;
    --bg3: #0f2318;
    --card: #0d1f16;
    --card2: #122a1c;
    --border: #1a3d28;
    --border2: #22503a;
    --green: #00e87a;
    --green2: #00c264;
    --green3: #00ff88;
    --teal: #00d4aa;
    --amber: #ffb830;
    --red: #ff4d6d;
    --blue: #4db8ff;
    --purple: #b48cff;
    --text: #e8f5ee;
    --text2: #8aab98;
    --text3: #4d7a61;
    --font-head: 'Inter', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --r: 12px;
    --r2: 8px;
    --shadow: 0 8px 32px rgba(0,232,122,0.08);
    --shadow2: 0 2px 12px rgba(0,0,0,0.4);
  }

  /* LIGHT MODE */
  .gf-root.gf-light {
    --bg: #f0f7f4;
    --bg2: #e2efe8;
    --bg3: #d4e8db;
    --card: #ffffff;
    --card2: #f0f7f4;
    --border: #b8d9c6;
    --border2: #94c4ad;
    --text: #0a1f14;
    --text2: #2d5e42;
    --text3: #5a8a70;
    --shadow: 0 8px 32px rgba(0,180,90,0.10);
    --shadow2: 0 2px 12px rgba(0,0,0,0.10);
  }
  .gf-root.gf-light body,
  .gf-root.gf-light { background: var(--bg); color: var(--text); }
  .gf-root.gf-light .sidebar { background: var(--bg2); }
  .gf-root.gf-light .dash-main { background: var(--bg); }
  .gf-root.gf-light .form-input { background: var(--card2); }
  .gf-root.gf-light .calc-input { background: var(--card2); }
  .gf-root.gf-light .settings-val { background: var(--card2); }
  .gf-root.gf-light .user-card { background: var(--card2); }
  .gf-root.gf-light .onboard-left { background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%); }
  .gf-root.gf-light .onboard-right { background: var(--bg); }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }

  .gf-root { min-height: 100vh; }

  /* PARTICLES */
  .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .particle {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,232,122,0.6) 0%, transparent 70%);
    animation: gf-float linear infinite;
  }
  @keyframes gf-float {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.3; }
    100% { transform: translateY(-100px) scale(1); opacity: 0; }
  }

  /* ONBOARDING */
  .onboard-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    position: relative; overflow: hidden;
  }
  .onboard-left {
    background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    padding: 60px; position: relative; z-index: 1; border-right: 1px solid var(--border);
  }
  .onboard-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 56px; }
  .onboard-logo-icon {
    width: 48px; height: 48px; background: linear-gradient(135deg, var(--green), var(--teal));
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    color: var(--bg); box-shadow: 0 0 24px rgba(0,232,122,0.4);
  }
  .onboard-logo span { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--text); }
  .onboard-logo span em { color: var(--green); font-style: normal; }
  .onboard-headline {
    font-family: var(--font-head); font-size: 52px; font-weight: 800; line-height: 1.05;
    color: var(--text); margin-bottom: 24px; letter-spacing: -1.5px;
  }
  .onboard-headline span { color: var(--green); }
  .onboard-sub { font-size: 17px; color: var(--text2); line-height: 1.7; max-width: 400px; margin-bottom: 48px; font-weight: 300; }
  .feature-list { display: flex; flex-direction: column; gap: 16px; }
  .feature-item { display: flex; align-items: center; gap: 14px; }
  .feature-dot {
    width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    background: rgba(0,232,122,0.1); border: 1px solid rgba(0,232,122,0.2); color: var(--green); flex-shrink: 0;
  }
  .feature-item span { font-size: 14px; color: var(--text2); font-weight: 400; }
  .onboard-bg-circle {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,232,122,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* RIGHT PANEL */
  .onboard-right {
    background: var(--bg); display: flex; flex-direction: column;
    justify-content: center; align-items: center; padding: 60px 48px;
    position: relative; z-index: 1; min-height: 100vh;
  }
  .auth-box { width: 100%; max-width: 420px; }
  .tab-switcher {
    display: flex; gap: 4px; background: var(--bg2); border-radius: 10px;
    padding: 4px; margin-bottom: 32px; border: 1px solid var(--border);
  }
  .tab-btn {
    flex: 1; padding: 10px; border: none; border-radius: 7px; cursor: pointer;
    font-family: var(--font-body); font-size: 14px; font-weight: 500; transition: all 0.2s;
    background: transparent; color: var(--text2);
  }
  .tab-btn.active { background: var(--green); color: var(--bg); font-weight: 600; }
  .auth-title { font-family: var(--font-head); font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .auth-sub { font-size: 14px; color: var(--text2); margin-bottom: 28px; }

  /* FORM */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 500; color: var(--text2); margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .form-input {
    width: 100%; padding: 12px 14px 12px 42px; background: var(--card);
    border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    transition: all 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--green); background: var(--card2); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .form-input::placeholder { color: var(--text3); }
  .form-input.err { border-color: var(--red); }
  .eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px;
  }
  .eye-btn:hover { color: var(--text2); }
  .err-msg { font-size: 11px; color: var(--red); margin-top: 4px; }
  .pw-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pw-bar { height: 3px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .pw-bar.weak { background: var(--red); }
  .pw-bar.medium { background: var(--amber); }
  .pw-bar.strong { background: var(--green); }
  .pw-label { font-size: 11px; color: var(--text3); margin-top: 4px; }

  .submit-btn {
    width: 100%; padding: 14px; background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px;
    letter-spacing: 0.3px;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,232,122,0.3); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* DASHBOARD */
  .dash-layout { min-height: 100vh; display: grid; grid-template-columns: 240px 1fr; }
  .sidebar {
    background: var(--bg2); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 0; position: sticky; top: 0; height: 100vh;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 24px 32px; }
  .sidebar-logo-icon {
    width: 36px; height: 36px; background: linear-gradient(135deg, var(--green), var(--teal));
    border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--bg);
    box-shadow: 0 0 16px rgba(0,232,122,0.3);
  }
  .sidebar-logo span { font-family: var(--font-head); font-size: 16px; font-weight: 800; color: var(--text); }
  .sidebar-logo span em { color: var(--green); font-style: normal; }
  .nav-section { padding: 0 12px; flex: 1; overflow-y: auto; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: 1.5px; text-transform: uppercase; padding: 0 12px; margin-bottom: 8px; margin-top: 20px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px;
    cursor: pointer; transition: all 0.15s; color: var(--text2); font-size: 14px; margin-bottom: 2px;
    border: 1px solid transparent;
  }
  .nav-item:hover { background: rgba(0,232,122,0.05); color: var(--text); }
  .nav-item.active { background: rgba(0,232,122,0.1); color: var(--green); border-color: rgba(0,232,122,0.15); }
  .nav-item .nav-icon { width: 20px; display: flex; align-items: center; justify-content: center; }
  .sidebar-bottom { padding: 0 12px; }
  .user-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r2);
    padding: 12px; display: flex; align-items: center; gap: 10px;
  }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 800; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--text3); }
  .logout-btn {
    background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px;
    transition: color 0.15s;
  }
  .logout-btn:hover { color: var(--red); }

  /* MAIN CONTENT */
  .dash-main { background: var(--bg); padding: 32px; overflow-y: auto; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .dash-title { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: var(--text); }
  .dash-title span { color: var(--green); }
  .live-badge {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
    background: rgba(0,232,122,0.1); border: 1px solid rgba(0,232,122,0.2); border-radius: 20px;
    font-size: 12px; color: var(--green); font-weight: 500;
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: gf-pulse 1.5s ease-in-out infinite; }
  @keyframes gf-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }

  /* KPI CARDS */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r);
    padding: 20px; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s;
    backdrop-filter: blur(12px);
  }
  .kpi-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  }
  .kpi-card.energy::before { background: linear-gradient(90deg, var(--amber), transparent); }
  .kpi-card.water::before { background: linear-gradient(90deg, var(--blue), transparent); }
  .kpi-card.co2::before { background: linear-gradient(90deg, var(--green), transparent); }
  .kpi-card.score::before { background: linear-gradient(90deg, var(--teal), transparent); }
  .kpi-card.transport::before { background: linear-gradient(90deg, var(--purple), transparent); }
  .kpi-card.food::before { background: linear-gradient(90deg, #4caf50, transparent); }
  .kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .kpi-icon.energy { background: rgba(255,184,48,0.12); color: var(--amber); }
  .kpi-icon.water { background: rgba(77,184,255,0.12); color: var(--blue); }
  .kpi-icon.co2 { background: rgba(0,232,122,0.12); color: var(--green); }
  .kpi-icon.score { background: rgba(0,212,170,0.12); color: var(--teal); }
  .kpi-icon.transport { background: rgba(180,140,255,0.12); color: var(--purple); }
  .kpi-icon.food { background: rgba(76,175,80,0.12); color: #4caf50; }
  .kpi-trend { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
  .kpi-trend.up { background: rgba(255,77,109,0.12); color: var(--red); }
  .kpi-trend.down { background: rgba(0,232,122,0.12); color: var(--green); }
  .kpi-value { font-family: var(--font-head); font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; }
  .kpi-unit { font-size: 13px; color: var(--text2); margin-top: 4px; font-weight: 300; }
  .kpi-label { font-size: 12px; color: var(--text3); margin-top: 8px; font-weight: 400; }

  /* GRID SECTIONS */
  .section-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .section-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .section-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .panel {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px;
    backdrop-filter: blur(12px);
  }
  .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .panel-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--text); }
  .panel-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }

  /* MINI CHART */
  .mini-chart { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bar {
    width: 100%; border-radius: 3px 3px 0 0; transition: height 0.5s ease;
    min-height: 4px;
  }
  .bar.energy { background: linear-gradient(180deg, var(--amber), rgba(255,184,48,0.4)); }
  .bar.water { background: linear-gradient(180deg, var(--blue), rgba(77,184,255,0.4)); }
  .bar.co2 { background: linear-gradient(180deg, var(--green), rgba(0,232,122,0.4)); }
  .bar-time { font-size: 9px; color: var(--text3); }

  /* LINE CHART */
  .line-chart-wrap { position: relative; }
  .line-chart-wrap svg { width: 100%; height: 100%; }

  /* WATER METER */
  .water-container {
    width: 100%; height: 120px; border: 1px solid rgba(77,184,255,0.3);
    border-radius: 8px; overflow: hidden; background: rgba(77,184,255,0.05); position: relative;
  }
  .water-fill {
    position: absolute; bottom: 0; left: 0; right: 0; border-radius: 0 0 8px 8px;
    background: linear-gradient(180deg, rgba(77,184,255,0.7), rgba(77,184,255,0.3));
    transition: height 1s ease; display: flex; align-items: center; justify-content: center;
  }
  .water-waves {
    position: absolute; top: 0; width: 200%; height: 100%;
    background: repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);
    animation: gf-waves 3s linear infinite;
  }
  @keyframes gf-waves { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .water-val { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: #fff; position: relative; z-index: 1; }

  /* ALERT */
  .alert-banner {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2);
    border-radius: var(--r2); margin-bottom: 16px; animation: gf-slideIn 0.3s ease;
  }
  @keyframes gf-slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .alert-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); flex-shrink: 0; }
  .alert-text { font-size: 13px; color: var(--red); }

  /* PAGE VIEWS */
  .gf-page { animation: gf-fadeIn 0.3s ease; }
  @keyframes gf-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* REPORTS */
  .report-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .report-item:last-child { border-bottom: none; }
  .report-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .report-title { font-size: 13px; font-weight: 500; color: var(--text); }
  .report-date { font-size: 11px; color: var(--text3); }
  .report-badge { margin-left: auto; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .rb-ok { background: rgba(0,232,122,0.1); color: var(--green); }
  .rb-warn { background: rgba(255,184,48,0.1); color: var(--amber); }
  .rb-crit { background: rgba(255,77,109,0.1); color: var(--red); }

  /* CARBON CALCULATOR */
  .calc-section { margin-bottom: 24px; }
  .calc-input-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .calc-input-group { display: flex; flex-direction: column; gap: 6px; }
  .calc-label { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .calc-input {
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 15px; padding: 10px 14px;
    outline: none; transition: all 0.2s;
  }
  .calc-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .calc-result {
    background: linear-gradient(135deg, rgba(0,232,122,0.08), rgba(0,212,170,0.08));
    border: 1px solid rgba(0,232,122,0.2); border-radius: var(--r);
    padding: 24px; text-align: center; margin-bottom: 16px;
  }
  .calc-result-val { font-family: var(--font-head); font-size: 48px; font-weight: 800; color: var(--green); }
  .calc-result-unit { font-size: 16px; color: var(--text2); margin-top: 4px; }
  .calc-tips { display: flex; flex-direction: column; gap: 10px; }
  .calc-tip {
    display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px;
    background: rgba(0,232,122,0.05); border: 1px solid rgba(0,232,122,0.1); border-radius: var(--r2);
  }
  .calc-tip-icon { color: var(--green); margin-top: 1px; flex-shrink: 0; }
  .calc-tip-text { font-size: 13px; color: var(--text2); line-height: 1.5; }
  .calc-tip-text strong { color: var(--text); }

  /* SETTINGS */
  .settings-section { margin-bottom: 28px; }
  .settings-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .settings-card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px;
  }
  .profile-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg);
    font-family: var(--font-head); font-size: 22px; font-weight: 800; flex-shrink: 0;
  }
  .profile-info { flex: 1; }
  .profile-name { font-family: var(--font-head); font-size: 18px; font-weight: 700; color: var(--text); }
  .profile-email { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .profile-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(0,232,122,0.1); color: var(--green); border: 1px solid rgba(0,232,122,0.2); }
  .settings-field { margin-bottom: 14px; }
  .settings-field label { display: block; font-size: 12px; color: var(--text2); font-weight: 500; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .settings-val { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 10px 14px; font-size: 14px; color: var(--text); }
  .notif-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .notif-row:last-child { border-bottom: none; }
  .notif-label { font-size: 14px; color: var(--text); }
  .notif-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .toggle-wrap { position: relative; width: 44px; height: 24px; }
  .toggle-input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; cursor: pointer; inset: 0; background: var(--border2);
    border-radius: 24px; transition: all 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px;
    background: white; border-radius: 50%; transition: all 0.2s;
  }
  .toggle-input:checked + .toggle-slider { background: var(--green); }
  .toggle-input:checked + .toggle-slider::before { transform: translateX(20px); }
  .about-version { font-family: var(--font-head); font-size: 32px; font-weight: 800; color: var(--green); margin-bottom: 8px; }
  .about-desc { font-size: 14px; color: var(--text2); line-height: 1.7; margin-bottom: 20px; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .about-item { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px; }
  .about-item-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .about-item-val { font-size: 14px; font-weight: 600; color: var(--text); }

  /* PASSWORD CHANGE */
  .pw-change-form { display: flex; flex-direction: column; gap: 14px; }
  .pw-input-wrap { position: relative; }
  .pw-input-wrap .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
  .pw-field-input {
    width: 100%; padding: 12px 44px 12px 42px; background: var(--card2);
    border: 1px solid var(--border); border-radius: var(--r2);
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    transition: all 0.2s; outline: none;
  }
  .pw-field-input:focus { border-color: var(--green); background: var(--card2); box-shadow: 0 0 0 3px rgba(0,232,122,0.1); }
  .pw-field-input::placeholder { color: var(--text3); }
  .pw-field-input.err { border-color: var(--red); }
  .pw-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px; }
  .pw-eye-btn:hover { color: var(--text2); }
  .pw-submit-btn {
    padding: 12px 24px; background: linear-gradient(135deg, var(--green), var(--teal));
    border: none; border-radius: var(--r2); color: var(--bg); font-family: var(--font-head);
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; align-self: flex-start;
  }
  .pw-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,232,122,0.3); }
  .pw-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* THEME TOGGLE ROW */
  .theme-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
  .theme-row-label { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: var(--text); }
  .theme-row-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .theme-btn-group { display: flex; gap: 6px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 4px; }
  .theme-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 500; transition: all 0.2s; background: transparent; color: var(--text2); }
  .theme-btn.active { background: var(--card); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 1px solid var(--border); }
  .gf-root.gf-light .theme-btn.active { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  /* TRANSPORT & FOOD */
  .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-mini { flex: 1; background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 14px; text-align: center; }
  .stat-mini-val { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--text); }
  .stat-mini-label { font-size: 11px; color: var(--text3); margin-top: 4px; }
  .fuel-bars { display: flex; flex-direction: column; gap: 10px; }
  .fuel-row { display: flex; flex-direction: column; gap: 4px; }
  .fuel-label-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text2); }
  .fuel-bar-bg { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .fuel-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .waste-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .waste-item { background: var(--card2); border: 1px solid var(--border); border-radius: var(--r2); padding: 16px; }
  .waste-icon { margin-bottom: 10px; }
  .waste-val { font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--text); }
  .waste-label { font-size: 12px; color: var(--text3); margin-top: 4px; }

  /* TOAST */
  .gf-toast {
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: var(--card); border: 1px solid var(--border); border-radius: var(--r);
    padding: 14px 20px; display: flex; align-items: center; gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: gf-slideIn 0.3s ease;
    max-width: 360px;
  }
  .gf-toast.error { border-color: rgba(255,77,109,0.4); background: rgba(255,77,109,0.08); }
  .gf-toast.success { border-color: rgba(0,232,122,0.4); background: rgba(0,232,122,0.08); }
  .gf-toast-icon { font-size: 18px; flex-shrink: 0; }
  .gf-toast-msg { font-size: 13px; color: var(--text); }

  /* SECURITY & ALERTS */
  .admin-badge { display:inline-block; background:rgba(251,191,36,0.12); color:#FBBF24; border:1px solid rgba(251,191,36,0.3); border-radius:6px; padding:2px 8px; font-size:11px; font-weight:700; margin-left:8px; vertical-align:middle; }
  .sec-crit-badge { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#EF4444; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; }
  .sec-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
  .sec-stat-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:14px 16px; text-align:center; }
  .sec-stat-card.critical { border-color:rgba(239,68,68,0.3); }
  .sec-stat-card.warning { border-color:rgba(245,158,11,0.3); }
  .sec-stat-num { font-family:var(--font-head); font-size:28px; font-weight:800; color:var(--text); line-height:1; }
  .sec-stat-lbl { font-size:11px; color:var(--text3); margin-top:4px; }
  .sec-tab-bar { margin-bottom:16px; }
  .sec-violations, .sec-hist-list { display:flex; flex-direction:column; gap:8px; }
  .sec-violation-row { display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:14px 16px; transition:border-color 0.2s; }
  .sec-violation-row.critical { border-color:rgba(239,68,68,0.35); background:rgba(239,68,68,0.04); }
  .sec-violation-row.warning { border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.03); }
  .sec-violation-icon { font-size:18px; flex-shrink:0; }
  .sec-violation-info { flex:1; min-width:0; }
  .sec-violation-equip { font-size:14px; font-weight:700; color:var(--text); font-family:var(--font-head); }
  .sec-violation-param { font-size:12px; color:var(--text3); margin-top:2px; }
  .sec-violation-vals { text-align:right; }
  .sec-violation-current { font-size:15px; font-weight:700; color:var(--text); }
  .sec-violation-thresh { font-size:11px; color:var(--text3); margin-top:2px; }
  .sec-sev-badge { font-size:10px; font-weight:800; padding:3px 7px; border-radius:5px; letter-spacing:0.5px; flex-shrink:0; }
  .sec-sev-badge.critical { background:rgba(239,68,68,0.18); color:#EF4444; }
  .sec-sev-badge.warning { background:rgba(245,158,11,0.15); color:#F59E0B; }
  .sec-hist-row { display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:12px 14px; }
  .sec-hist-row.critical { border-color:rgba(239,68,68,0.25); }
  .sec-hist-row.warning { border-color:rgba(245,158,11,0.2); }
  .sec-hist-equip { font-size:13px; font-weight:600; color:var(--text); }
  .sec-hist-meta { font-size:11px; color:var(--text3); margin-top:2px; }
  .sec-hist-val { font-size:13px; font-weight:700; color:var(--text); }
  .sec-hist-thresh { font-size:11px; color:var(--text3); }
  .sec-empty { text-align:center; padding:48px 20px; color:var(--text2); }
  .sec-empty-title { font-size:18px; font-weight:700; margin-top:12px; color:var(--text); }
  .sec-empty-sub { font-size:13px; margin-top:6px; }
  .sec-admin-notice { background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:var(--r); padding:12px 16px; font-size:13px; color:rgba(139,92,246,0.9); margin-bottom:16px; }
  .sec-thresh-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; margin-bottom:20px; }
  .sec-thresh-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:16px; }
  .sec-thresh-label { font-size:13px; font-weight:600; color:var(--text); margin-bottom:10px; }
  .sec-thresh-row { display:flex; align-items:center; gap:10px; }
  .sec-slider { flex:1; accent-color:var(--green); cursor:pointer; height:4px; }
  .sec-slider:disabled { opacity:0.4; cursor:not-allowed; }
  .sec-thresh-val-box { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .sec-num-input { width:60px; background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:4px 8px; color:var(--text); font-size:13px; font-weight:600; text-align:center; }
  .sec-num-input:disabled { opacity:0.4; cursor:not-allowed; }
  .sec-thresh-unit { font-size:12px; color:var(--text3); }
  .sec-save-btn { display:block; margin:0 auto; padding:12px 32px; background:var(--green); color:#000; font-size:14px; font-weight:700; border:none; border-radius:10px; cursor:pointer; transition:all 0.2s; }
  .sec-save-btn:hover { opacity:0.88; }
  .sec-save-btn.saved { background:#00c466; }
  @media(max-width:600px) { .sec-stats-row { grid-template-columns:repeat(2,1fr); } }

  /* FACTORY MAP */
  .map-wrap { position: relative; margin-bottom: 16px; border-radius: var(--r); overflow: hidden; }
  .factory-svg { width: 100%; height: auto; display: block; border-radius: var(--r); border: 1px solid var(--border); background: rgba(5,14,9,0.85); }
  @keyframes equip-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.1;transform:scale(0.5)} }
  .equip-blink { animation: equip-blink 0.9s ease-in-out infinite; transform-origin: center; }
  .map-legend { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
  .map-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text2); }
  .map-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .map-heat-btn {
    padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text2); cursor: pointer; font-size: 13px; font-weight: 500;
    transition: all 0.2s; white-space: nowrap;
  }
  .map-heat-btn:hover { border-color: var(--green); color: var(--green); }
  .map-heat-btn.active { background: rgba(0,232,122,0.08); border-color: var(--green); color: var(--green); }
  .map-tooltip {
    position: absolute; z-index: 50; pointer-events: none;
    background: rgba(4,12,8,0.97); border: 1px solid rgba(0,232,122,0.28);
    border-radius: 14px; padding: 14px 16px; min-width: 230px; max-width: 264px;
    backdrop-filter: blur(16px); box-shadow: 0 8px 40px rgba(0,0,0,0.55);
  }
  .map-tt-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .map-tt-status { font-size: 12px; font-weight: 600; margin-bottom: 10px; }
  .map-tt-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .map-tt-row:last-of-type { border-bottom: none; }
  .map-tt-row span { font-size: 12px; color: var(--text3); }
  .map-tt-row strong { font-size: 12px; color: var(--text); font-weight: 600; }
  .map-tt-crit { color: var(--red) !important; }
  .map-tt-spark { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); }
  .equip-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
  .equip-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; transition: border-color 0.2s, transform 0.2s; }
  .equip-card:hover { transform: translateY(-2px); }
  .equip-card.warning { border-color: rgba(245,158,11,0.35); }
  .equip-card.critical { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.03); }
  .equip-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .equip-card-emoji { font-size: 22px; flex-shrink: 0; line-height: 1; }
  .equip-card-name { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--text); }
  .equip-params { display: flex; flex-direction: column; gap: 7px; }
  .equip-param-row { display: flex; justify-content: space-between; align-items: center; }
  .equip-param-lbl { font-size: 12px; color: var(--text3); }
  .equip-param-val { font-size: 13px; font-weight: 600; color: var(--text); }
  .equip-crit-val { color: var(--red) !important; }

  /* MOBILE NAV */
  .mobile-topbar {
    display: none; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: var(--bg2); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .mobile-topbar-brand { display: flex; align-items: center; gap: 8px; }
  .mobile-topbar-brand span { font-family: var(--font-head); font-size: 17px; font-weight: 800; color: var(--text); }
  .mobile-topbar-brand em { color: var(--green); font-style: normal; }
  .mobile-topbar-right { display: flex; align-items: center; gap: 10px; }
  .hamburger-btn {
    width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text); cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hamburger-btn:hover { border-color: var(--green); color: var(--green); }
  .mobile-avatar-sm {
    width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--teal));
    display: flex; align-items: center; justify-content: center; color: var(--bg);
    font-family: var(--font-head); font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .mobile-drawer {
    position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
    background: var(--bg2); border-right: 1px solid var(--border);
    z-index: 300; display: flex; flex-direction: column; padding: 28px 0 20px;
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
  }
  .mobile-drawer.open { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,0.4); }
  .mobile-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); z-index: 299; backdrop-filter: blur(2px);
  }
  .mobile-overlay.visible { display: block; }
  .mobile-drawer-close {
    position: absolute; top: 18px; right: 16px;
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--text3); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .mobile-drawer-close:hover { color: var(--text); border-color: var(--border2); }

  @media (max-width: 1100px) {
    .onboard-wrap { grid-template-columns: 1fr; }
    .onboard-left { display: none; }
    .onboard-right { padding: 40px 32px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .section-grid { grid-template-columns: 1fr; }
    .section-grid-3 { grid-template-columns: 1fr; }
    .section-grid-2 { grid-template-columns: 1fr; }
    .calc-input-row { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .dash-layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .mobile-topbar { display: flex !important; }
    .dash-main { padding: 0; }
    .gf-page { padding: 16px 16px 24px; }
    .dash-header { margin-bottom: 16px; }
    .dash-title { font-size: 20px; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
    .kpi-value { font-size: 26px; }
    .kpi-card { padding: 14px; }
    .panel { padding: 16px; }
    .form-row { grid-template-columns: 1fr; }
    .onboard-right { padding: 28px 20px; }
    .auth-title { font-size: 22px; }
    .waste-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 420px) {
    .kpi-grid { grid-template-columns: 1fr; }
    .kpi-value { font-size: 24px; }
    .onboard-right { padding: 24px 16px; }
    .tab-switcher { margin-bottom: 20px; }
  }
`;

// ─── FACTORY MAP DATA ─────────────────────────────────────────────────────────
interface EquipParam { label: string; value: string; unit: string; }
interface EquipItem {
  id: string; name: string; icon: string;
  cx: number; cy: number;
  status: "normal" | "warning" | "critical";
  blinking: boolean;
  params: EquipParam[];
  history: number[];
}

function generateEquipData(): EquipItem[] {
  const fuel = +(5 + Math.random() * 93).toFixed(0);
  const boilerTemp = +(150 + Math.random() * 88).toFixed(0);
  const compHours = +(2000 + Math.random() * 6760).toFixed(0);
  const compLeak = Math.random() > 0.87;
  const battery = +(40 + Math.random() * 60).toFixed(0);
  const chillerIn = +(18 + Math.random() * 6).toFixed(1);
  return [
    {
      id: "turbine", name: "Enerji Turbini", icon: "⚡",
      cx: 140, cy: 215,
      status: +fuel < 10 ? "critical" : +fuel < 20 ? "warning" : "normal",
      blinking: +fuel < 10,
      params: [
        { label: "Gərginlik", value: String(+(380 + Math.random()*42).toFixed(0)), unit: "V" },
        { label: "Cari yük (Peak)", value: String(+(60 + Math.random()*38).toFixed(1)), unit: "kW" },
        { label: "Yanacaq səviyyəsi", value: String(fuel), unit: "%" },
        { label: "Yağ təzyiqi", value: String(+(2.0 + Math.random()*2.0).toFixed(1)), unit: "bar" },
      ],
      history: Array.from({length: 14}, () => +(60 + Math.random()*40)),
    },
    {
      id: "boiler", name: "Sənaye Qazanı", icon: "🔥",
      cx: 380, cy: 215,
      status: +boilerTemp > 215 ? "critical" : +boilerTemp > 195 ? "warning" : "normal",
      blinking: false,
      params: [
        { label: "Temperatur", value: String(boilerTemp), unit: "°C" },
        { label: "Buxar təzyiqi", value: String(+(5 + Math.random()*10).toFixed(1)), unit: "bar" },
        { label: "Su səviyyəsi", value: String(+(60 + Math.random()*36).toFixed(0)), unit: "%" },
        { label: "Carbon Footprint", value: String(+(18 + Math.random()*36).toFixed(1)), unit: "kg CO₂/h" },
      ],
      history: Array.from({length: 14}, () => +(150 + Math.random()*88)),
    },
    {
      id: "chiller", name: "Soyutma Qüləsi", icon: "❄️",
      cx: 185, cy: 385,
      status: "normal",
      blinking: false,
      params: [
        { label: "Giriş suyu", value: String(chillerIn), unit: "°C" },
        { label: "Çıxış suyu", value: String(+(+chillerIn - 5.5 - Math.random()*2).toFixed(1)), unit: "°C" },
        { label: "Fan sürəti (RPM)", value: String(+(800 + Math.random()*700).toFixed(0)), unit: "RPM" },
        { label: "Elektrik sərfiyyatı", value: String(+(20 + Math.random()*26).toFixed(1)), unit: "kW" },
      ],
      history: Array.from({length: 14}, () => +(18 + Math.random()*6)),
    },
    {
      id: "compressor", name: "Hava Kompressoru", icon: "💨",
      cx: 450, cy: 385,
      status: compLeak ? "critical" : +compHours > 7500 ? "warning" : "normal",
      blinking: compLeak,
      params: [
        { label: "Hava sızması", value: compLeak ? "Aşkarlandı!" : "Yoxdur", unit: "" },
        { label: "İşləmə saatı", value: String(compHours), unit: "h" },
        { label: "Servis qalır", value: String(Math.max(0, 8760 - +compHours)), unit: "h" },
        { label: "Sıxışdırma", value: String(+(6 + Math.random()*4).toFixed(1)), unit: "bar" },
      ],
      history: Array.from({length: 14}, () => +(6 + Math.random()*4)),
    },
    {
      id: "solar", name: "Günəş Panelləri", icon: "☀️",
      cx: 560, cy: 95,
      status: +battery < 45 ? "warning" : "normal",
      blinking: false,
      params: [
        { label: "Anlıq istehsal", value: String(+(200 + Math.random()*600).toFixed(0)), unit: "W/m²" },
        { label: "Panel təmizliyi", value: String(+(70 + Math.random()*30).toFixed(0)), unit: "%" },
        { label: "Batareya dolumu", value: String(battery), unit: "%" },
      ],
      history: Array.from({length: 14}, () => +(200 + Math.random()*600)),
    },
  ];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 2) + 1,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width: 80, height: 28, flexShrink: 0, display: "block"}}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function PasswordStrength({ password }: { password: string }) {
  const s = getPasswordStrength(password);
  const labels = ["", "Zəif", "Orta", "Güclü", "Çox Güclü"];
  const cls = s <= 1 ? "weak" : s <= 2 ? "medium" : "strong";
  if (!password) return null;
  return (
    <div>
      <div className="pw-strength">
        {[1,2,3,4].map(i => <div key={i} className={`pw-bar ${i <= s ? cls : ""}`} />)}
      </div>
      <div className="pw-label">{labels[s]}</div>
    </div>
  );
}

function LineChartSVG({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 400, H = 140, PAD = 10;
  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - 2 * PAD),
    y: H - PAD - ((v - min) / range) * (H - 2 * PAD),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
  const safeColor = color.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id={`grad-${safeColor}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${safeColor})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="var(--bg)" strokeWidth="2"/>
      ))}
    </svg>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "error"|"success"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`gf-toast ${type}`}>
      <span className="gf-toast-icon">{type === "error" ? "⚠️" : "✅"}</span>
      <span className="gf-toast-msg">{msg}</span>
    </div>
  );
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }: { onLogin: (u: User) => void }) {
  const [tab, setTab] = useState<"signin"|"signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"error"|"success"}|null>(null);

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });

  const getUsers = (): StoredUser[] => {
    try { return JSON.parse(localStorage.getItem("gf_users") || "[]"); } catch { return []; }
  };

  const validateSignUp = () => {
    const e: Record<string, string> = {};
    if (!signUp.firstName.trim()) e.firstName = "Ad tələb olunur";
    if (!signUp.lastName.trim()) e.lastName = "Soyad tələb olunur";
    if (!signUp.email.includes("@")) e.email = "Düzgün email daxil edin";
    if (signUp.password.length < 8) e.password = "Şifrə minimum 8 simvol olmalıdır";
    if (signUp.password !== signUp.confirm) e.confirm = "Şifrələr uyğun gəlmir";

    const users = getUsers();
    if (users.some((u: any) => u.email === signUp.email)) {
      e.email = "Bu email artıq qeydiyyatdadır";
    }
    const fullName = `${signUp.firstName} ${signUp.lastName}`.toLowerCase();
    if (users.some((u: any) => (u.firstName + " " + u.lastName).toLowerCase() === fullName)) {
      e.firstName = "Bu ad/soyad artıq istifadə olunur";
    }
    return e;
  };

  const handleSignUp = () => {
    const e = validateSignUp();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getUsers();
      const isFirstUser = users.length === 0;
      const newUser: StoredUser = { firstName: signUp.firstName, lastName: signUp.lastName, email: signUp.email, password: signUp.password, isAdmin: isFirstUser };
      localStorage.setItem("gf_users", JSON.stringify([...users, newUser]));
      onLogin({ name: `${signUp.firstName} ${signUp.lastName}`, email: signUp.email, isAdmin: isFirstUser });
    }, 1200);
  };

  const handleSignIn = () => {
    const e: Record<string, string> = {};
    if (!signIn.email) e.email = "Email tələb olunur";
    if (!signIn.password) e.password = "Şifrə tələb olunur";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getUsers();
      const found = users.find((u: any) => u.email === signIn.email);
      if (!found) {
        setToast({ msg: "Bu email ilə istifadəçi tapılmadı", type: "error" });
        return;
      }
      if (found.password !== signIn.password) {
        setToast({ msg: "Şifrə yanlışdır. Yenidən cəhd edin", type: "error" });
        return;
      }
      onLogin({ name: `${(found as StoredUser).firstName} ${(found as StoredUser).lastName}`, email: (found as StoredUser).email, isAdmin: !!(found as StoredUser).isAdmin });
    }, 1000);
  };

  const upd = (field: string, val: string) => {
    setSignUp(p => ({...p, [field]: val}));
    setErrors(p => ({...p, [field]: ""}));
  };
  const updIn = (field: string, val: string) => {
    setSignIn(p => ({...p, [field]: val}));
    setErrors(p => ({...p, [field]: ""}));
  };

  return (
    <div className="onboard-wrap">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="onboard-left">
        <div className="onboard-bg-circle" style={{width:500,height:500,top:-100,right:-100}}/>
        <div className="onboard-bg-circle" style={{width:300,height:300,bottom:-50,left:-50}}/>
        <div className="onboard-logo">
          <div className="onboard-logo-icon"><IconLeaf/></div>
          <span>Green<em>Factory</em></span>
        </div>
        <h1 className="onboard-headline">
          Daha Ağıllı.<br/>Daha <span>Yaşıl.</span><br/>Daha Güclü.
        </h1>
        <p className="onboard-sub">
          Sənaye müəssisənizin enerji, su və karbon göstəricilərini real vaxt rejimində izləyin. Bərpa olunan enerji, nəqliyyat və qida tullantılarını idarə edin.
        </p>
        <div className="feature-list">
          {[
            [<IconZap/>, "Real-vaxt Enerji Monitorinqi"],
            [<IconDroplets/>, "Su İstifadəsi Analizi"],
            [<IconWind/>, "CO₂ Emissiya İzləmə"],
            [<IconShield/>, "Kiber-Təhlükəsizlik Auditi"],
          ].map(([icon, label], i) => (
            <div className="feature-item" key={i}>
              <div className="feature-dot">{icon}</div>
              <span>{label as string}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="onboard-right">
        <div className="auth-box">
          <div className="tab-switcher">
            <button
              data-testid="tab-signin"
              className={`tab-btn ${tab === "signin" ? "active" : ""}`}
              onClick={() => { setTab("signin"); setErrors({}); }}
            >Daxil ol</button>
            <button
              data-testid="tab-signup"
              className={`tab-btn ${tab === "signup" ? "active" : ""}`}
              onClick={() => { setTab("signup"); setErrors({}); }}
            >Qeydiyyat</button>
          </div>

          {tab === "signin" ? (
            <div className="gf-page">
              <h2 className="auth-title">Xoş gəldiniz!</h2>
              <p className="auth-sub">Sistemə daxil olmaq üçün məlumatlarınızı daxil edin</p>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconMail/></span>
                  <input
                    data-testid="input-email"
                    className={`form-input ${errors.email ? "err" : ""}`}
                    type="email"
                    placeholder="adınız@email.com"
                    value={signIn.email}
                    onChange={e => updIn("email", e.target.value)}
                  />
                </div>
                {errors.email && <div className="err-msg">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Şifrə</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input
                    data-testid="input-password"
                    className={`form-input ${errors.password ? "err" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Şifrənizi daxil edin"
                    value={signIn.password}
                    onChange={e => updIn("password", e.target.value)}
                  />
                  <button className="eye-btn" onClick={() => setShowPw(p => !p)}><IconEye off={showPw}/></button>
                </div>
                {errors.password && <div className="err-msg">{errors.password}</div>}
              </div>
              <button data-testid="button-signin" className="submit-btn" onClick={handleSignIn} disabled={loading}>
                {loading ? "Yoxlanılır..." : "Daxil ol →"}
              </button>
            </div>
          ) : (
            <div className="gf-page">
              <h2 className="auth-title">Hesab yaradın</h2>
              <p className="auth-sub">Green Factory platformasına qoşulun</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ad</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconUser/></span>
                    <input data-testid="input-firstname" className={`form-input ${errors.firstName?"err":""}`} placeholder="Adınız" value={signUp.firstName} onChange={e=>upd("firstName",e.target.value)}/>
                  </div>
                  {errors.firstName && <div className="err-msg">{errors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Soyad</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconUser/></span>
                    <input data-testid="input-lastname" className={`form-input ${errors.lastName?"err":""}`} placeholder="Soyadınız" value={signUp.lastName} onChange={e=>upd("lastName",e.target.value)}/>
                  </div>
                  {errors.lastName && <div className="err-msg">{errors.lastName}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gmail / Email</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconMail/></span>
                  <input data-testid="input-email-register" className={`form-input ${errors.email?"err":""}`} type="email" placeholder="adınız@gmail.com" value={signUp.email} onChange={e=>upd("email",e.target.value)}/>
                </div>
                {errors.email && <div className="err-msg">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Şifrə <span style={{color:"var(--text3)",fontWeight:300}}>(min. 8 simvol)</span></label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input data-testid="input-password-register" className={`form-input ${errors.password?"err":""}`} type={showPw?"text":"password"} placeholder="Şifrə yaradın" value={signUp.password} onChange={e=>upd("password",e.target.value)}/>
                  <button className="eye-btn" onClick={()=>setShowPw(p=>!p)}><IconEye off={showPw}/></button>
                </div>
                {errors.password && <div className="err-msg">{errors.password}</div>}
                <PasswordStrength password={signUp.password}/>
              </div>
              <div className="form-group">
                <label className="form-label">Şifrəni təsdiqləyin</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconLock/></span>
                  <input data-testid="input-confirm-password" className={`form-input ${errors.confirm?"err":""}`} type={showPw2?"text":"password"} placeholder="Şifrəni təkrar daxil edin" value={signUp.confirm} onChange={e=>upd("confirm",e.target.value)}/>
                  <button className="eye-btn" onClick={()=>setShowPw2(p=>!p)}><IconEye off={showPw2}/></button>
                </div>
                {errors.confirm && <div className="err-msg">{errors.confirm}</div>}
              </div>
              <button data-testid="button-signup" className="submit-btn" onClick={handleSignUp} disabled={loading}>
                {loading ? "Hesab yaradılır..." : "Qeydiyyatdan keç →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CARBON CALCULATOR ────────────────────────────────────────────────────────
function CarbonCalculator({ sensor }: { sensor: SensorData }) {
  const [energy, setEnergy] = useState(sensor.energy.toString());
  const [fuel, setFuel] = useState("120");
  const [food, setFood] = useState("45");

  const co2 = (parseFloat(energy||"0") * 0.233) + (parseFloat(fuel||"0") * 2.31) + (parseFloat(food||"0") * 0.9);

  const tips: string[] = [];
  if (parseFloat(energy) > 80) tips.push("Enerji sərfiyyatı yüksəkdir. Günəş panelləri ilə 40% qənaət edin.");
  if (parseFloat(fuel) > 100) tips.push("Yanacaq istehlakı artıqdır. Elektrik nəqliyyatına keçidi düşünün.");
  if (parseFloat(food) > 30) tips.push("Qida tullantısı yüksəkdir. Kompost sistemi qurun, 30% azaldın.");
  if (co2 > 500) tips.push("Ümumi emissiya kritik həddədir. 50 ağac əkmək bu emissiyaları kompensasiya edər.");
  if (tips.length === 0) tips.push("Əla! Emissiya göstəriciləriniz qənaətbəxşdir. Bu tempi saxlayın.");

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Karbon <span>Kalkulyatoru</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>Real-vaxt CO₂ emissiya hesablaması</div>
        </div>
      </div>
      <div className="calc-section">
        <div className="panel" style={{marginBottom:16}}>
          <div className="panel-header"><div className="panel-title">Məlumatları daxil edin</div></div>
          <div className="calc-input-row">
            <div className="calc-input-group">
              <label className="calc-label">Enerji (kWh)</label>
              <input data-testid="input-energy-calc" className="calc-input" type="number" value={energy} onChange={e=>setEnergy(e.target.value)} min="0"/>
            </div>
            <div className="calc-input-group">
              <label className="calc-label">Yanacaq (Litr)</label>
              <input data-testid="input-fuel-calc" className="calc-input" type="number" value={fuel} onChange={e=>setFuel(e.target.value)} min="0"/>
            </div>
            <div className="calc-input-group">
              <label className="calc-label">Qida Tullantısı (kg)</label>
              <input data-testid="input-food-calc" className="calc-input" type="number" value={food} onChange={e=>setFood(e.target.value)} min="0"/>
            </div>
          </div>
        </div>
        <div className="calc-result">
          <div style={{fontSize:13,color:"var(--text2)",marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>Ümumi CO₂ Emissiyası</div>
          <div data-testid="text-co2-result" className="calc-result-val">{co2.toFixed(1)}</div>
          <div className="calc-result-unit">kg CO₂/gün</div>
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Tövsiyələr</div></div>
          <div className="calc-tips">
            {tips.map((tip, i) => (
              <div className="calc-tip" key={i}>
                <span className="calc-tip-icon"><IconLeaf/></span>
                <span className="calc-tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSPORT PAGE ───────────────────────────────────────────────────────────
function TransportPage({ history }: { history: HistoryEntry[] }) {
  const vehicles = [
    { name: "Yük maşını A-12", type: "Diesel", efficiency: 72, km: 340 },
    { name: "Van B-07", type: "Benzin", efficiency: 85, km: 210 },
    { name: "Elektrik Auto C-03", type: "Elektrik", efficiency: 96, km: 180 },
    { name: "Yük maşını D-18", type: "Diesel", efficiency: 61, km: 520 },
  ];
  const avgEff = (vehicles.reduce((a,b) => a + b.efficiency, 0) / vehicles.length).toFixed(0);
  const totalKm = vehicles.reduce((a,b) => a + b.km, 0);

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Nəqliyyat <span>Paneli</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>Logistika və yanacaq səmərəliliyi</div>
        </div>
        <div className="live-badge"><div className="live-dot"/>Canlı</div>
      </div>
      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="kpi-card transport">
          <div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div>
          <div className="kpi-value">{vehicles.length}</div>
          <div className="kpi-unit">Aktiv Nəqliyyat Vasitəsi</div>
        </div>
        <div className="kpi-card transport">
          <div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div>
          <div className="kpi-value">{avgEff}%</div>
          <div className="kpi-unit">Orta Yanacaq Səmərəliliyi</div>
        </div>
        <div className="kpi-card transport">
          <div className="kpi-header"><div className="kpi-icon transport"><IconTruck/></div></div>
          <div className="kpi-value">{totalKm}</div>
          <div className="kpi-unit">Günlük km</div>
        </div>
      </div>
      <div className="section-grid">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Nəqliyyat Siyahısı</div></div>
          <div className="fuel-bars">
            {vehicles.map((v, i) => (
              <div className="fuel-row" key={i}>
                <div className="fuel-label-row">
                  <span>{v.name} <span style={{color:"var(--text3)",fontSize:11}}>({v.type})</span></span>
                  <span style={{color: v.efficiency > 80 ? "var(--green)" : v.efficiency > 65 ? "var(--amber)" : "var(--red)"}}>{v.efficiency}%</span>
                </div>
                <div className="fuel-bar-bg">
                  <div className="fuel-bar-fill" style={{
                    width: `${v.efficiency}%`,
                    background: v.efficiency > 80 ? "var(--green)" : v.efficiency > 65 ? "var(--amber)" : "var(--red)"
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Yanacaq Trendi</div></div>
          <div className="line-chart-wrap" style={{height:200}}>
            <LineChartSVG data={history.map(h => h.energy * 0.3)} color="var(--purple)"/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOD PAGE ────────────────────────────────────────────────────────────────
function FoodPage() {
  const wasteItems = [
    { label: "Xammal Tullantısı", val: "42 kg", color: "var(--amber)", icon: <IconApple/> },
    { label: "Yenidən İstifadə", val: "78%", color: "var(--green)", icon: <IconLeaf/> },
    { label: "Kompost", val: "18 kg", color: "var(--teal)", icon: <IconLeaf/> },
    { label: "Çöp Həcmi", val: "12 kg", color: "var(--red)", icon: <IconWind/> },
  ];

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Qida <span>Paneli</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>Tullantı azaldılması və resurs idarəetməsi</div>
        </div>
      </div>
      <div className="waste-grid" style={{marginBottom:24}}>
        {wasteItems.map((item, i) => (
          <div className="waste-item" key={i}>
            <div className="waste-icon" style={{color: item.color}}>{item.icon}</div>
            <div className="waste-val" style={{color: item.color}}>{item.val}</div>
            <div className="waste-label">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">Tullantı Azaldılması Hədəfi</div></div>
        <div className="fuel-bars">
          {[
            { label: "Aylıq Hədəf: 50 kg azaldılma", current: 42, max: 50, color: "var(--green)" },
            { label: "Yenidən İstifadə Hədəfi: 85%", current: 78, max: 85, color: "var(--teal)" },
            { label: "Kompost Hədəfi: 25 kg", current: 18, max: 25, color: "var(--amber)" },
          ].map((g, i) => (
            <div className="fuel-row" key={i}>
              <div className="fuel-label-row">
                <span>{g.label}</span>
                <span style={{color: g.color}}>{Math.round((g.current/g.max)*100)}%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{width:`${(g.current/g.max)*100}%`,background:g.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user, theme, setTheme }: { user: User; theme: string; setTheme: (t: string) => void }) {
  const [notifs, setNotifs] = useState({
    energyLimit: true,
    co2Alert: true,
    weeklyReport: false,
    waterLimit: true,
  });
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [pwShow, setPwShow] = useState({ old: false, new1: false, new2: false });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwToast, setPwToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handlePwChange = () => {
    const e: Record<string, string> = {};
    if (!pwForm.old) e.old = "Köhnə şifrə tələb olunur";
    if (pwForm.new1.length < 8) e.new1 = "Yeni şifrə minimum 8 simvol olmalıdır";
    if (pwForm.new1 !== pwForm.new2) e.new2 = "Şifrələr uyğun gəlmir";
    if (Object.keys(e).length) { setPwErrors(e); return; }

    try {
      const users: any[] = JSON.parse(localStorage.getItem("gf_users") || "[]");
      const idx = users.findIndex(u => u.email === user.email);
      if (idx === -1 || users[idx].password !== pwForm.old) {
        setPwErrors({ old: "Köhnə şifrə yanlışdır" });
        return;
      }
      setPwLoading(true);
      setTimeout(() => {
        users[idx].password = pwForm.new1;
        localStorage.setItem("gf_users", JSON.stringify(users));
        setPwLoading(false);
        setPwForm({ old: "", new1: "", new2: "" });
        setPwErrors({});
        setPwToast({ msg: "Şifrə uğurla dəyişdirildi!", type: "success" });
      }, 800);
    } catch {
      setPwErrors({ old: "Xəta baş verdi, yenidən cəhd edin" });
    }
  };

  const upd = (f: keyof typeof pwForm, v: string) => {
    setPwForm(p => ({ ...p, [f]: v }));
    setPwErrors(p => ({ ...p, [f]: "" }));
  };

  return (
    <div className="gf-page">
      {pwToast && <Toast msg={pwToast.msg} type={pwToast.type} onClose={() => setPwToast(null)} />}
      <div className="dash-header">
        <div className="dash-title">Ayarlar & <span>Fərdiləşdirmə</span></div>
      </div>

      {/* PROFILE */}
      <div className="settings-section">
        <div className="settings-title"><IconUser/> Profil</div>
        <div className="settings-card">
          <div className="profile-row">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <div className="profile-badge"><IconShield/> Operator</div>
            </div>
          </div>
          <div className="settings-field">
            <label>Ad Soyad</label>
            <div data-testid="text-profile-name" className="settings-val">{user.name}</div>
          </div>
          <div className="settings-field">
            <label>Email</label>
            <div data-testid="text-profile-email" className="settings-val">{user.email}</div>
          </div>
          <div className="settings-field">
            <label>Rol</label>
            <div className="settings-val">Zavod Operatoru</div>
          </div>
        </div>
      </div>

      {/* PASSWORD CHANGE */}
      <div className="settings-section">
        <div className="settings-title"><IconKey/> Şifrəni Dəyiş</div>
        <div className="settings-card">
          <div className="pw-change-form">
            {/* Old password */}
            <div className="settings-field" style={{marginBottom:0}}>
              <label>Köhnə Şifrə</label>
              <div className="pw-input-wrap">
                <span className="input-icon"><IconLock/></span>
                <input
                  className={`pw-field-input ${pwErrors.old ? "err" : ""}`}
                  type={pwShow.old ? "text" : "password"}
                  placeholder="Mövcud şifrənizi daxil edin"
                  value={pwForm.old}
                  onChange={e => upd("old", e.target.value)}
                />
                <button className="pw-eye-btn" onClick={() => setPwShow(p => ({ ...p, old: !p.old }))}><IconEye off={pwShow.old}/></button>
              </div>
              {pwErrors.old && <div className="err-msg">{pwErrors.old}</div>}
            </div>
            {/* New password */}
            <div className="settings-field" style={{marginBottom:0}}>
              <label>Yeni Şifrə <span style={{color:"var(--text3)",fontWeight:400,textTransform:"none"}}>(min. 8 simvol)</span></label>
              <div className="pw-input-wrap">
                <span className="input-icon"><IconLock/></span>
                <input
                  className={`pw-field-input ${pwErrors.new1 ? "err" : ""}`}
                  type={pwShow.new1 ? "text" : "password"}
                  placeholder="Yeni şifrənizi daxil edin"
                  value={pwForm.new1}
                  onChange={e => upd("new1", e.target.value)}
                />
                <button className="pw-eye-btn" onClick={() => setPwShow(p => ({ ...p, new1: !p.new1 }))}><IconEye off={pwShow.new1}/></button>
              </div>
              {pwErrors.new1 && <div className="err-msg">{pwErrors.new1}</div>}
              {pwForm.new1 && <PasswordStrength password={pwForm.new1}/>}
            </div>
            {/* Confirm new password */}
            <div className="settings-field" style={{marginBottom:0}}>
              <label>Yeni Şifrəni Təsdiqləyin</label>
              <div className="pw-input-wrap">
                <span className="input-icon"><IconLock/></span>
                <input
                  className={`pw-field-input ${pwErrors.new2 ? "err" : ""}`}
                  type={pwShow.new2 ? "text" : "password"}
                  placeholder="Yeni şifrəni təkrarlayın"
                  value={pwForm.new2}
                  onChange={e => upd("new2", e.target.value)}
                />
                <button className="pw-eye-btn" onClick={() => setPwShow(p => ({ ...p, new2: !p.new2 }))}><IconEye off={pwShow.new2}/></button>
              </div>
              {pwErrors.new2 && <div className="err-msg">{pwErrors.new2}</div>}
            </div>
            <button className="pw-submit-btn" onClick={handlePwChange} disabled={pwLoading}>
              {pwLoading ? "Yenilənir..." : "Şifrəni Dəyiş →"}
            </button>
          </div>
        </div>
      </div>

      {/* APPEARANCE / THEME */}
      <div className="settings-section">
        <div className="settings-title"><IconSun/> Görünüş</div>
        <div className="settings-card">
          <div className="theme-row">
            <div>
              <div className="theme-row-label">Tema seçimi</div>
              <div className="theme-row-desc">Tətbiqin rəng sxemini seçin</div>
            </div>
            <div className="theme-btn-group">
              <button className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
                <IconMoon/> Tünd
              </button>
              <button className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                <IconSun/> İşıqlı
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-section">
        <div className="settings-title"><IconBell/> Bildiriş Sistemi</div>
        <div className="settings-card">
          {[
            { key: "energyLimit", label: "Enerji Limiti Xəbərdarlığı", desc: "80% enerji limiti aşıldıqda bildir" },
            { key: "co2Alert", label: "CO₂ Emissiya Xəbərdarlığı", desc: "Emissiya kritik həddə çatdıqda bildir" },
            { key: "waterLimit", label: "Su Limiti Xəbərdarlığı", desc: "Su istehlakı limitini keçdikdə bildir" },
            { key: "weeklyReport", label: "Həftəlik Hesabat", desc: "Hər həftə email ilə hesabat göndər" },
          ].map(item => (
            <div className="notif-row" key={item.key}>
              <div>
                <div className="notif-label">{item.label}</div>
                <div className="notif-desc">{item.desc}</div>
              </div>
              <label className="toggle-wrap">
                <input
                  data-testid={`toggle-${item.key}`}
                  type="checkbox"
                  className="toggle-input"
                  checked={notifs[item.key as keyof typeof notifs]}
                  onChange={e => setNotifs(p => ({ ...p, [item.key]: e.target.checked }))}
                />
                <span className="toggle-slider"/>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <div className="settings-section">
        <div className="settings-title"><IconInfo/> Haqqında</div>
        <div className="settings-card">
          <div className="about-version">v1.2</div>
          <div className="about-desc">
            Green Factory Dashboard — sənaye müəssisələri üçün hərtərəfli dayanıqlılıq monitorinq platforması.
            Real-vaxt enerji, su, karbon emissiyası, nəqliyyat və qida resurs idarəetməsi imkanları.
          </div>
          <div className="about-grid">
            {[
              { label: "Versiya", val: "1.2.0" },
              { label: "Texnologiya", val: "React 18 + TypeScript" },
              { label: "Lisenziya", val: "MIT Open Source" },
              { label: "Son Yeniləmə", val: "May 2025" },
              { label: "Müəllif", val: "Green Factory Team" },
              { label: "Platform", val: "Web (PWA hazır)" },
            ].map((item, i) => (
              <div className="about-item" key={i}>
                <div className="about-item-label">{item.label}</div>
                <div className="about-item-val">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECURITY ALERTS PAGE ────────────────────────────────────────────────────
function SecurityAlerts({ isAdmin, thresholds, setThresholds, alertHistory }: {
  isAdmin: boolean;
  thresholds: AlertThreshold;
  setThresholds: (t: AlertThreshold) => void;
  alertHistory: AlertEvent[];
}) {
  const [activeTab, setActiveTab] = useState<"status"|"history"|"config">("status");
  const [local, setLocal] = useState<AlertThreshold>(thresholds);
  const [saved, setSaved] = useState(false);

  const criticalCount = alertHistory.filter(a => a.severity === "critical").length;
  const warningCount = alertHistory.filter(a => a.severity === "warning").length;
  const todayStr = new Date().toLocaleDateString("az-AZ");
  const todayCount = alertHistory.filter(a => a.timestamp.startsWith(todayStr) || a.timestamp.includes(new Date().getFullYear().toString())).length;

  const liveEquips = generateEquipData();
  const violations = checkAlerts(liveEquips, thresholds);

  const thresholdRows: { label: string; key: keyof AlertThreshold; unit: string; min: number; max: number; step: number }[] = [
    { label: "Turbin — Maks. yük", key: "turbineMaxLoad", unit: "kW", min: 50, max: 100, step: 1 },
    { label: "Turbin — Min. yanacaq", key: "turbineMinFuel", unit: "%", min: 5, max: 40, step: 1 },
    { label: "Qazan — Maks. temperatur", key: "boilerMaxTemp", unit: "°C", min: 150, max: 240, step: 5 },
    { label: "Qazan — Maks. CO₂", key: "boilerMaxCO2", unit: "kg/h", min: 15, max: 60, step: 1 },
    { label: "Soyuducu — Maks. elektrik", key: "chillerMaxPower", unit: "kW", min: 20, max: 50, step: 1 },
    { label: "Kompressor — Maks. sıxışdırma", key: "compMaxPressure", unit: "bar", min: 5, max: 12, step: 0.5 },
    { label: "Günəş — Min. batareya", key: "solarMinBattery", unit: "%", min: 20, max: 70, step: 5 },
  ];

  const handleSave = () => {
    setThresholds(local);
    try { localStorage.setItem("gf_thresholds", JSON.stringify(local)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Təhlükəsizlik &amp; <span>Alertlər</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>
            Threshold monitorinqi — real vaxt xəbərdarlıq sistemi
            {isAdmin && <span className="admin-badge">👑 Admin</span>}
          </div>
        </div>
        {violations.length > 0 && (
          <div className="sec-crit-badge">🔴 {violations.length} aktiv xəbərdarlıq</div>
        )}
      </div>

      <div className="sec-stats-row">
        {[
          { num: alertHistory.length, lbl: "Ümumi alert", cls: "" },
          { num: criticalCount, lbl: "Kritik", cls: "critical" },
          { num: warningCount, lbl: "Xəbərdarlıq", cls: "warning" },
          { num: todayCount, lbl: "Bu gün", cls: "" },
        ].map(s => (
          <div key={s.lbl} className={`sec-stat-card ${s.cls}`}>
            <div className="sec-stat-num" style={s.cls === "critical" ? {color:"#EF4444"} : s.cls === "warning" ? {color:"#F59E0B"} : {}}>
              {s.num}
            </div>
            <div className="sec-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar sec-tab-bar">
        {([["status","🔍 Cari Status"],["history","📋 Alert Tarixi"],["config","⚙️ Hədd Konfiqurasiyası"]] as const).map(([t, lbl]) => (
          <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{lbl}</button>
        ))}
      </div>

      {activeTab === "status" && (
        violations.length === 0 ? (
          <div className="sec-empty">
            <div style={{fontSize:48}}>✅</div>
            <div className="sec-empty-title">Bütün sistemlər normal işləyir</div>
            <div className="sec-empty-sub">Heç bir threshold aşılmayıb — sistemlər stabildir</div>
          </div>
        ) : (
          <div className="sec-violations">
            {violations.map((v, i) => (
              <div key={i} className={`sec-violation-row ${v.severity}`}>
                <div className="sec-violation-icon">{v.severity === "critical" ? "🔴" : "🟡"}</div>
                <div className="sec-violation-info">
                  <div className="sec-violation-equip">{v.equipmentName}</div>
                  <div className="sec-violation-param">{v.paramName}</div>
                </div>
                <div className="sec-violation-vals">
                  <div className="sec-violation-current">{v.currentValue}</div>
                  <div className="sec-violation-thresh">Hədd: {v.threshold}</div>
                </div>
                <div className={`sec-sev-badge ${v.severity}`}>
                  {v.severity === "critical" ? "KRİTİK" : "XƏBƏRDARLIQ"}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "history" && (
        alertHistory.length === 0 ? (
          <div className="sec-empty">
            <div style={{fontSize:48}}>📋</div>
            <div className="sec-empty-title">Alert tarixi boşdur</div>
            <div className="sec-empty-sub">Threshold aşıldıqda bura yazılacaq</div>
          </div>
        ) : (
          <div className="sec-hist-list">
            {alertHistory.map(a => (
              <div key={a.id} className={`sec-hist-row ${a.severity}`}>
                <div style={{fontSize:16,flexShrink:0}}>{a.severity === "critical" ? "🔴" : "🟡"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="sec-hist-equip">{a.equipmentName} — {a.paramName}</div>
                  <div className="sec-hist-meta">{a.timestamp}{a.telegramSent && " · ✈️ Telegram"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div className="sec-hist-val">{a.currentValue}</div>
                  <div className="sec-hist-thresh">Hədd: {a.threshold}</div>
                </div>
                <div className={`sec-sev-badge ${a.severity}`}>{a.severity === "critical" ? "KRİTİK" : "XƏBƏR"}</div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "config" && (
        <div>
          {!isAdmin && (
            <div className="sec-admin-notice">
              🔒 Threshold dəyişdirmək yalnız <strong>Admin</strong> üçündür. Hal-hazırda mövcud həddlər göstərilir.
            </div>
          )}
          <div className="sec-thresh-grid">
            {thresholdRows.map(row => (
              <div key={row.key} className="sec-thresh-card">
                <div className="sec-thresh-label">{row.label}</div>
                <div className="sec-thresh-row">
                  <input
                    type="range" min={row.min} max={row.max} step={row.step}
                    value={local[row.key]} disabled={!isAdmin}
                    className="sec-slider"
                    onChange={e => setLocal(p => ({...p, [row.key]: +e.target.value}))}
                  />
                  <div className="sec-thresh-val-box">
                    <input
                      type="number" min={row.min} max={row.max} step={row.step}
                      value={local[row.key]} disabled={!isAdmin}
                      className="sec-num-input"
                      onChange={e => setLocal(p => ({...p, [row.key]: +e.target.value}))}
                    />
                    <span className="sec-thresh-unit">{row.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button className={`sec-save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
              {saved ? "✅ Yadda saxlanıldı!" : "💾 Hədləri Yadda Saxla"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FACTORY MAP COMPONENT ───────────────────────────────────────────────────
function FactoryMap() {
  const [equips, setEquips] = useState<EquipItem[]>(generateEquipData());
  const [hovered, setHovered] = useState<EquipItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setEquips(generateEquipData()), 4000);
    return () => clearInterval(t);
  }, []);

  const statusColor = (s: EquipItem["status"]) =>
    s === "critical" ? "#EF4444" : s === "warning" ? "#F59E0B" : "#00E87A";

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: Math.min(e.clientX - rect.left + 16, rect.width - 270),
      y: Math.max(e.clientY - rect.top - 20, 4),
    });
  };

  return (
    <div className="gf-page">
      <div className="dash-header">
        <div>
          <div className="dash-title">Fabrik <span>Xəritəsi</span></div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>İnteraktiv avadanlıq monitorinqi — canlı status izləmə</div>
        </div>
        <button className={`map-heat-btn ${showHeatmap ? "active" : ""}`} onClick={() => setShowHeatmap(v => !v)}>
          🌡️ İstilik Xəritəsi
        </button>
      </div>

      <div className="map-legend">
        {[["#00E87A","Normal işləmə"],["#F59E0B","Xəbərdarlıq — texniki baxış"],["#EF4444","Kritik / Yüksək sərfiyyat"]].map(([c,l]) => (
          <div key={l} className="map-legend-item">
            <div className="map-legend-dot" style={{background:c}}/>{l}
          </div>
        ))}
      </div>

      <div ref={containerRef} className="map-wrap">
        <svg viewBox="0 0 700 480" className="factory-svg"
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHovered(null)}>

          {/* Building shell */}
          <rect x="10" y="10" width="680" height="460" rx="10"
            fill="rgba(6,16,11,0.8)" stroke="rgba(0,232,122,0.18)" strokeWidth="1.5"/>

          {/* Zone: Solar (top-right) */}
          <rect x="412" y="22" width="266" height="148" rx="6"
            fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.22)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="545" y="40" textAnchor="middle" fontSize="10" fill="rgba(251,191,36,0.65)"
            fontFamily="system-ui" letterSpacing="1.2">GÜNƏŞ ENERJİSİ ZOLASI</text>

          {/* Zone: Turbine (middle-left) */}
          <rect x="22" y="155" width="210" height="178" rx="6"
            fill="rgba(245,158,11,0.04)" stroke="rgba(245,158,11,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="127" y="172" textAnchor="middle" fontSize="10" fill="rgba(245,158,11,0.6)"
            fontFamily="system-ui" letterSpacing="1.2">ENERJİ ZOLASI</text>

          {/* Zone: Boiler (middle-right) */}
          <rect x="255" y="155" width="215" height="178" rx="6"
            fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="362" y="172" textAnchor="middle" fontSize="10" fill="rgba(239,68,68,0.6)"
            fontFamily="system-ui" letterSpacing="1.2">QAZANXANA</text>

          {/* Zone: Production floor (bottom) */}
          <rect x="22" y="348" width="656" height="110" rx="6"
            fill="rgba(0,180,219,0.04)" stroke="rgba(0,180,219,0.18)" strokeWidth="1" strokeDasharray="5 3"/>
          <text x="350" y="366" textAnchor="middle" fontSize="10" fill="rgba(0,180,219,0.6)"
            fontFamily="system-ui" letterSpacing="1.2">İSTEHSAL MƏRTƏBƏSİ — Resource Waste Monitoring</text>

          {/* Pipe / connection lines */}
          <line x1="185" y1="215" x2="255" y2="215" stroke="rgba(0,232,122,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="362" y1="335" x2="230" y2="358" stroke="rgba(0,180,219,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="362" y1="335" x2="410" y2="358" stroke="rgba(0,180,219,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="548" y1="122" x2="385" y2="200" stroke="rgba(251,191,36,0.2)" strokeWidth="1.5" strokeDasharray="6 3"/>
          <line x1="127" y1="175" x2="127" y2="195" stroke="rgba(245,158,11,0.15)" strokeWidth="1" strokeDasharray="4 2"/>

          {/* Heatmap overlay */}
          {showHeatmap && (
            <g>
              <defs>
                <radialGradient id="hm0"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.38"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm1"><stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32"/><stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm2"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.28"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0"/></radialGradient>
                <radialGradient id="hm3"><stop offset="0%" stopColor="#00B4DB" stopOpacity="0.22"/><stop offset="100%" stopColor="#00B4DB" stopOpacity="0"/></radialGradient>
              </defs>
              <ellipse cx="140" cy="215" rx="115" ry="88" fill="url(#hm0)"/>
              <ellipse cx="380" cy="215" rx="108" ry="82" fill="url(#hm1)"/>
              <ellipse cx="185" cy="385" rx="80" ry="58" fill="url(#hm2)"/>
              <ellipse cx="450" cy="385" rx="72" ry="52" fill="url(#hm3)"/>
            </g>
          )}

          {/* Equipment nodes */}
          {equips.map(eq => {
            const sc = statusColor(eq.status);
            const isHov = hovered?.id === eq.id;
            return (
              <g key={eq.id} onMouseEnter={() => setHovered(eq)} onMouseLeave={() => setHovered(null)} style={{cursor:"pointer"}}>
                {/* Pulse ring on hover */}
                {isHov && <circle cx={eq.cx} cy={eq.cy} r="42" fill="none" stroke={sc} strokeWidth="1" strokeDasharray="4 2" opacity="0.5"/>}
                {/* Glow halo */}
                <circle cx={eq.cx} cy={eq.cy} r="36" fill={`${sc}0d`} stroke={`${sc}28`} strokeWidth="1"/>
                {/* Body circle */}
                <circle cx={eq.cx} cy={eq.cy} r="26" fill="rgba(5,14,9,0.95)" stroke={sc} strokeWidth={isHov ? "2.5" : "2"}/>
                {/* Status dot (blinks if critical) */}
                <circle cx={eq.cx + 19} cy={eq.cy - 19} r="6" fill={sc} className={eq.blinking ? "equip-blink" : ""}/>
                {/* Icon */}
                <text x={eq.cx} y={eq.cy + 7} textAnchor="middle" fontSize="19">{eq.icon}</text>
                {/* Name label */}
                <text x={eq.cx} y={eq.cy + 52} textAnchor="middle" fontSize="9.5"
                  fill="rgba(230,255,240,0.78)" fontFamily="system-ui" fontWeight="600">{eq.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hovered && (
          <div className="map-tooltip" style={{left: tooltipPos.x, top: tooltipPos.y}}>
            <div className="map-tt-title">{hovered.icon} {hovered.name}</div>
            <div className="map-tt-status" style={{color: statusColor(hovered.status)}}>
              ● {hovered.status === "critical" ? "Kritik vəziyyət" : hovered.status === "warning" ? "Texniki xəbərdarlıq" : "Normal işləmə"}
            </div>
            {hovered.params.map((p, i) => (
              <div key={i} className="map-tt-row">
                <span>{p.label}</span>
                <strong className={p.value === "Aşkarlandı!" ? "map-tt-crit" : ""}>{p.value}{p.unit ? ` ${p.unit}` : ""}</strong>
              </div>
            ))}
            <div className="map-tt-spark">
              <div style={{fontSize:10,color:"var(--text3)",marginBottom:3}}>Son trend</div>
              <MiniSparkline data={hovered.history} color={statusColor(hovered.status)}/>
            </div>
          </div>
        )}
      </div>

      {/* Equipment cards */}
      <div className="equip-cards-grid">
        {equips.map(eq => (
          <div key={eq.id} className={`equip-card ${eq.status}`}>
            <div className="equip-card-head">
              <span className="equip-card-emoji">{eq.icon}</span>
              <div style={{flex:1, minWidth:0}}>
                <div className="equip-card-name">{eq.name}</div>
                <div style={{fontSize:11,color:statusColor(eq.status),marginTop:2}}>
                  {eq.status === "critical" ? "🔴 Kritik" : eq.status === "warning" ? "🟡 Xəbərdarlıq" : "🟢 Normal"}
                </div>
              </div>
              <MiniSparkline data={eq.history} color={statusColor(eq.status)}/>
            </div>
            <div className="equip-params">
              {eq.params.map((p, i) => (
                <div key={i} className="equip-param-row">
                  <span className="equip-param-lbl">{p.label}</span>
                  <span className={`equip-param-val ${p.value === "Aşkarlandı!" ? "equip-crit-val" : ""}`}>
                    {p.value}{p.unit ? ` ${p.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, theme, setTheme }: { user: User; onLogout: () => void; theme: string; setTheme: (t: string) => void }) {
  const [activePage, setActivePage] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sensor, setSensor] = useState<SensorData>(generateSensorData());
  const [history, setHistory] = useState<HistoryEntry[]>(mockHistory);
  const [thresholds, setThresholds] = useState<AlertThreshold>(() => loadThresholds());
  const [alertHistory, setAlertHistory] = useState<AlertEvent[]>(() => loadAlertHistory());
  const [activeAlerts, setActiveAlerts] = useState<AlertEvent[]>([]);
  const sentRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const t = setInterval(() => {
      const s = generateSensorData();
      setSensor(s);
      setHistory(prev => {
        const next = [...prev, { time: s.timestamp, energy: s.energy, water: s.water, co2: s.co2 }];
        return next.slice(-20);
      });
      const currentThresholds = loadThresholds();
      const equips = generateEquipData();
      const violations = checkAlerts(equips, currentThresholds);
      if (violations.length > 0) {
        const now = Date.now();
        const newEvents: AlertEvent[] = [];
        for (const v of violations) {
          const key = `${v.equipmentId}:${v.paramName}`;
          const lastSeen = sentRef.current.get(key) ?? 0;
          if (now - lastSeen > 30_000) {
            sentRef.current.set(key, now);
            const ev: AlertEvent = { ...v, id: `${key}-${now}`, timestamp: new Date().toLocaleString("az-AZ"), telegramSent: false };
            newEvents.push(ev);
            fetch("/api/alerts/telegram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ equipmentName: v.equipmentName, paramName: v.paramName, currentValue: v.currentValue, threshold: v.threshold, severity: v.severity }),
            }).catch(() => {});
          }
        }
        if (newEvents.length > 0) {
          setAlertHistory(prev => {
            const updated = [...newEvents, ...prev].slice(0, 100);
            try { localStorage.setItem("gf_alerts", JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActiveAlerts(newEvents);
          setTimeout(() => setActiveAlerts([]), 20_000);
        }
      }
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const energyHistory = history.map(h => h.energy);
  const waterHistory = history.map(h => h.water);
  const co2History = history.map(h => h.co2);
  const highEnergy = sensor.energy > 80;

  const navItems = [
    { id: "overview", label: "İcmal", icon: <IconFactory/>, section: "Əsas" },
    { id: "energy", label: "Enerji Sərfiyyatı", icon: <IconZap/>, section: "Əsas" },
    { id: "water", label: "Su Sərfiyyatı", icon: <IconDroplets/>, section: "Əsas" },
    { id: "emissions", label: "Karbon Emissiyası", icon: <IconWind/>, section: "Əsas" },
    { id: "transport", label: "Nəqliyyat", icon: <IconTruck/>, section: "Panellər" },
    { id: "food", label: "Qida Resursları", icon: <IconApple/>, section: "Panellər" },
    { id: "map", label: "Fabrik Xəritəsi", icon: <IconMap/>, section: "Analitika" },
    { id: "carbon", label: "Karbon Kalk.", icon: <IconBarChart/>, section: "Analitika" },
    { id: "reports", label: "Hesabatlar", icon: <IconBarChart/>, section: "Analitika" },
    { id: "security", label: "Təhlükəsizlik", icon: <IconShield/>, section: "Sistem" },
    { id: "settings", label: "Ayarlar", icon: <IconSettings/>, section: "Sistem" },
  ];

  const sections = [...new Set(navItems.map(n => n.section))];

  return (
    <div className="dash-layout">
      {/* Mobile overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "visible" : ""}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile slide-in drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}><IconX/></button>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><IconLeaf/></div>
          <span>Green<em>Factory</em></span>
        </div>
        <div className="nav-section">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-label">{section}</div>
              {navItems.filter(n => n.section === section).map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">Operator</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Çıxış"><IconLogOut/></button>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><IconLeaf/></div>
          <span>Green<em>Factory</em></span>
        </div>
        <div className="nav-section">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-label">{section}</div>
              {navItems.filter(n => n.section === section).map(item => (
                <div
                  key={item.id}
                  data-testid={`nav-${item.id}`}
                  className={`nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div data-testid="text-username" className="user-name">{user.name}</div>
              <div className="user-role">Operator</div>
            </div>
            <button data-testid="button-logout" className="logout-btn" onClick={onLogout} title="Çıxış"><IconLogOut/></button>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        {/* Mobile top bar — visible only on small screens */}
        <div className="mobile-topbar">
          <div className="mobile-topbar-brand">
            <div className="sidebar-logo-icon" style={{width:32,height:32,borderRadius:8}}><IconLeaf/></div>
            <span>Green<em>Factory</em></span>
          </div>
          <div className="mobile-topbar-right">
            <div className="mobile-avatar-sm">{initials}</div>
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}><IconMenu/></button>
          </div>
        </div>

        {activePage === "map" && <FactoryMap/>}
        {activePage === "security" && (
          <SecurityAlerts
            isAdmin={!!user.isAdmin}
            thresholds={thresholds}
            setThresholds={setThresholds}
            alertHistory={alertHistory}
          />
        )}
        {activePage === "overview" && (
          <div className="gf-page">
            <div className="dash-header">
              <div>
                <div className="dash-title">Sistem <span>İcmalı</span></div>
                <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>Salam, {user.name.split(" ")[0]} — Bütün sistemlər aktiv</div>
              </div>
              <div className="live-badge"><div className="live-dot"/>Canlı</div>
            </div>

            {(activeAlerts.length > 0 || highEnergy) && (
              <div className="alert-banner" onClick={() => setActivePage("security")} style={{cursor:"pointer"}}>
                <div className="alert-dot"/>
                <div className="alert-text">
                  {activeAlerts.length > 0
                    ? `⚠️ ${activeAlerts.length} yeni xəbərdarlıq: ${activeAlerts[0].equipmentName} — ${activeAlerts[0].paramName}: ${activeAlerts[0].currentValue}`
                    : `Enerji sərfiyyatı kritik həddə çatıb: ${sensor.energy} kWh — Dərhal yoxlayın`}
                </div>
                <span style={{marginLeft:"auto",fontSize:11,opacity:0.75,flexShrink:0}}>→ Təhlükəsizlik</span>
              </div>
            )}

            <div className="kpi-grid">
              <div className="kpi-card energy">
                <div className="kpi-header">
                  <div className="kpi-icon energy"><IconZap/></div>
                  <div className={`kpi-trend ${sensor.energy > 70 ? "up" : "down"}`}>{sensor.energy > 70 ? "↑" : "↓"} {(Math.random()*5+1).toFixed(1)}%</div>
                </div>
                <div data-testid="text-energy-value" className="kpi-value">{sensor.energy}</div>
                <div className="kpi-unit">kWh</div>
                <div className="kpi-label">Enerji Sərfiyyatı</div>
              </div>
              <div className="kpi-card water">
                <div className="kpi-header">
                  <div className="kpi-icon water"><IconDroplets/></div>
                  <div className="kpi-trend down">↓ 2.4%</div>
                </div>
                <div data-testid="text-water-value" className="kpi-value">{sensor.water}</div>
                <div className="kpi-unit">Litr</div>
                <div className="kpi-label">Su İstifadəsi</div>
              </div>
              <div className="kpi-card co2">
                <div className="kpi-header">
                  <div className="kpi-icon co2"><IconWind/></div>
                  <div className={`kpi-trend ${sensor.co2 > 10 ? "up" : "down"}`}>{sensor.co2 > 10 ? "↑" : "↓"} {(Math.random()*3+1).toFixed(1)}%</div>
                </div>
                <div data-testid="text-co2-value" className="kpi-value">{sensor.co2}</div>
                <div className="kpi-unit">kg CO₂</div>
                <div className="kpi-label">Karbon Emissiyası</div>
              </div>
              <div className="kpi-card score">
                <div className="kpi-header">
                  <div className="kpi-icon score"><IconLeaf/></div>
                  <div className="kpi-trend down">↑ Yaxşı</div>
                </div>
                <div className="kpi-value">82</div>
                <div className="kpi-unit">/ 100</div>
                <div className="kpi-label">Yaşıl Bal</div>
              </div>
            </div>

            <div className="section-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Enerji Trendi</div>
                    <div className="panel-sub">Son 20 ölçüm — hər 3 saniyədə yenilənir</div>
                  </div>
                </div>
                <div className="line-chart-wrap" style={{height:160}}>
                  <LineChartSVG data={energyHistory} color="var(--amber)"/>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Su Göstəricisi</div>
                </div>
                <div className="water-container" style={{marginBottom:12}}>
                  <div className="water-fill" style={{height:`${Math.min(100,(sensor.water/200)*100)}%`}}>
                    <div className="water-waves"/>
                    <div className="water-val">{sensor.water}L</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)"}}>
                  <span>Minimum: 50L</span><span>Maksimum: 200L</span>
                </div>
              </div>
            </div>

            <div className="section-grid-3">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Enerji Histoqramı</div></div>
                <div className="mini-chart">
                  {history.slice(-10).map((h, i) => (
                    <div className="bar-wrap" key={i}>
                      <div className="bar energy" style={{height:`${(h.energy/100)*100}%`}}/>
                      <div className="bar-time">{h.time?.slice(0,5)||""}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">CO₂ Trendi</div></div>
                <div className="line-chart-wrap" style={{height:100}}>
                  <LineChartSVG data={co2History} color="var(--green)"/>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Su Trendi</div></div>
                <div className="line-chart-wrap" style={{height:100}}>
                  <LineChartSVG data={waterHistory} color="var(--blue)"/>
                </div>
              </div>
            </div>

            <div className="section-grid-3">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Bərpa Olunan Enerji</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--sun,#ffd700)",marginBottom:8}}><IconSun/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--amber)"}}>34%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Günəş Enerjisi payı</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}>
                  <div className="fuel-bar-fill" style={{width:"34%",background:"var(--amber)"}}/>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Külək Enerjisi</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--blue)",marginBottom:8}}><IconWind/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--blue)"}}>21%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Külək enerjisi payı</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}>
                  <div className="fuel-bar-fill" style={{width:"21%",background:"var(--blue)"}}/>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Şəbəkə Enerjisi</div></div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{color:"var(--text3)",marginBottom:8}}><IconZap/></div>
                  <div style={{fontFamily:"var(--font-head)",fontSize:28,fontWeight:800,color:"var(--text2)"}}>45%</div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Şəbəkə payı</div>
                </div>
                <div className="fuel-bar-bg" style={{marginTop:8}}>
                  <div className="fuel-bar-fill" style={{width:"45%",background:"var(--text3)"}}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "energy" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Enerji <span>Sərfiyyatı</span></div>
              <div className="live-badge"><div className="live-dot"/>Canlı</div>
            </div>
            {highEnergy && <div className="alert-banner"><div className="alert-dot"/><div className="alert-text">Kritik enerji sərfiyyatı aşkarlandı: {sensor.energy} kWh</div></div>}
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card energy">
                <div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div>
                <div className="kpi-value">{sensor.energy}</div>
                <div className="kpi-unit">kWh — Cari</div>
              </div>
              <div className="kpi-card energy">
                <div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div>
                <div className="kpi-value">{(energyHistory.reduce((a,b)=>a+b,0)/energyHistory.length||0).toFixed(1)}</div>
                <div className="kpi-unit">kWh — Ortalama</div>
              </div>
              <div className="kpi-card energy">
                <div className="kpi-header"><div className="kpi-icon energy"><IconZap/></div></div>
                <div className="kpi-value">{Math.max(...energyHistory).toFixed(1)}</div>
                <div className="kpi-unit">kWh — Pik</div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">Enerji Sərfiyyatı — Zaman Cədvəli</div></div>
              <div className="line-chart-wrap" style={{height:200}}>
                <LineChartSVG data={energyHistory} color="var(--amber)"/>
              </div>
            </div>
          </div>
        )}

        {activePage === "water" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Su <span>Sərfiyyatı</span></div>
              <div className="live-badge"><div className="live-dot"/>Canlı</div>
            </div>
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{sensor.water}</div><div className="kpi-unit">Litr — Cari</div></div>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{(waterHistory.reduce((a,b)=>a+b,0)/waterHistory.length||0).toFixed(1)}</div><div className="kpi-unit">Litr — Ortalama</div></div>
              <div className="kpi-card water"><div className="kpi-header"><div className="kpi-icon water"><IconDroplets/></div></div><div className="kpi-value">{Math.max(...waterHistory).toFixed(1)}</div><div className="kpi-unit">Litr — Pik</div></div>
            </div>
            <div className="section-grid">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Su İstifadəsi Trendi</div></div>
                <div className="line-chart-wrap" style={{height:200}}>
                  <LineChartSVG data={waterHistory} color="var(--blue)"/>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Cari Dolluq Səviyyəsi</div></div>
                <div className="water-container" style={{height:200}}>
                  <div className="water-fill" style={{height:`${Math.min(100,(sensor.water/200)*100)}%`}}>
                    <div className="water-waves"/>
                    <div className="water-val">{sensor.water}L</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "emissions" && (
          <div className="gf-page">
            <div className="dash-header">
              <div className="dash-title">Karbon <span>Emissiyası</span></div>
              <div className="live-badge"><div className="live-dot"/>Canlı</div>
            </div>
            <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{sensor.co2}</div><div className="kpi-unit">kg CO₂ — Cari</div></div>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{(co2History.reduce((a,b)=>a+b,0)/co2History.length||0).toFixed(2)}</div><div className="kpi-unit">kg CO₂ — Ortalama</div></div>
              <div className="kpi-card co2"><div className="kpi-header"><div className="kpi-icon co2"><IconWind/></div></div><div className="kpi-value">{co2History.reduce((a,b)=>a+b,0).toFixed(1)}</div><div className="kpi-unit">kg CO₂ — Ümumi</div></div>
            </div>
            <div className="panel">
              <div className="panel-header"><div className="panel-title">CO₂ Emissiya Trendi</div></div>
              <div className="line-chart-wrap" style={{height:200}}>
                <LineChartSVG data={co2History} color="var(--green)"/>
              </div>
            </div>
          </div>
        )}

        {activePage === "transport" && <TransportPage history={history}/>}
        {activePage === "food" && <FoodPage/>}
        {activePage === "carbon" && <CarbonCalculator sensor={sensor}/>}
        {activePage === "settings" && <SettingsPage user={user} theme={theme} setTheme={setTheme}/>}

        {activePage === "reports" && (
          <div className="gf-page">
            <div className="dash-header"><div className="dash-title">Sistem <span>Hesabatları</span></div></div>
            <div className="section-grid">
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Avtomatik Hesabatlar</div></div>
                {[
                  {title:"Aylıq Enerji Hesabatı",date:"May 2025",status:"rb-ok",statusTxt:"Hazır",color:"var(--amber)"},
                  {title:"Su İstehlakı Analizi",date:"May 2025",status:"rb-ok",statusTxt:"Hazır",color:"var(--blue)"},
                  {title:"CO₂ Emissiya Hesabatı",date:"May 2025",status:"rb-warn",statusTxt:"Gözlənilir",color:"var(--green)"},
                  {title:"Nəqliyyat Yanacaq Hesabatı",date:"May 2025",status:"rb-warn",statusTxt:"Gözlənilir",color:"var(--purple)"},
                  {title:"Tullantı İdarəetməsi",date:"Aprel 2025",status:"rb-ok",statusTxt:"Hazır",color:"var(--teal)"},
                ].map((r,i) => (
                  <div className="report-item" key={i}>
                    <div className="report-icon" style={{background:`rgba(0,0,0,0.1)`,color:r.color}}><IconBarChart/></div>
                    <div>
                      <div className="report-title">{r.title}</div>
                      <div className="report-date">{r.date}</div>
                    </div>
                    <div className={`report-badge ${r.status}`}>{r.statusTxt}</div>
                  </div>
                ))}
              </div>
              <div className="panel">
                <div className="panel-header"><div className="panel-title">Sistem Vəziyyəti</div></div>
                {[
                  {label:"Enerji Sistemi",val:"Normal",ok:true},
                  {label:"Su Sistemi",val:"Normal",ok:true},
                  {label:"CO₂ Sensorları",val:"Aktiv",ok:true},
                  {label:"Nəqliyyat GPS",val:"Bağlı",ok:false},
                  {label:"Qida Sensorları",val:"Aktiv",ok:true},
                ].map((item,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>{item.label}</span>
                    <span style={{fontSize:12,fontWeight:600,color:item.ok?"var(--green)":"var(--amber)"}}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({length: 12}, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 6,
  }));
  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
        }}/>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function GreenFactory() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<string>("dark");

  return (
    <>
      <style>{gfStyles}</style>
      <div className={`gf-root${theme === "light" ? " gf-light" : ""}`}>
        {!user && <Particles/>}
        {!user
          ? <AuthScreen onLogin={setUser}/>
          : <Dashboard user={user} onLogout={() => setUser(null)} theme={theme} setTheme={setTheme}/>
        }
      </div>
    </>
  );
}
