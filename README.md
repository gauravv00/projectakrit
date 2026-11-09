# Project Akrit — Digital E-Waste Supply Chain

> **"Think of Akrit like Zomato, but for e-waste.**  
> Zomato does not cook food or own restaurants — it owns the data, the tracking, and the trust. Akrit does not recycle e-waste or own trucks. It owns the digital manifest, the verified supply chain, and the connection between the informal waste workers who aggregate waste and the authorized recyclers registered to process it."

[![Mobile First](https://img.shields.io/badge/Platform-Mobile--First%20Web%20App-0D5C63.svg)](#)
[![Zero Build](https://img.shields.io/badge/Dependencies-Zero%20Build%20Step-1E8450.svg)](#)
[![i18n](https://img.shields.io/badge/Languages-EN%20%7C%20हिन्दी%20%7C%20मराठी-F4A261.svg)](#)
[![Compliance](https://img.shields.io/badge/Regulatory-CPCB%20%26%20MPCB%20E--Waste%202022-blue.svg)](#)

---

## 📱 Live Functional Web-App

Open [`index.html`](index.html) in any modern mobile or desktop browser (Android Chrome, iOS Safari, desktop browsers). No server or npm build step required.

### Key Roles Supported
1. **Kabadiwala (Informal Waste Collector):** 1-tap camera log, category selector, fair rates vs middleman comparison (~38% extra earnings), and instant Digital Manifest generation.
2. **Repair Shop Owner:** Component turnover collection, doorstep tempo pickup scheduler, and the verifiable **Green Shop** badge.
3. **Recycler Desk:** Digital scale weighing input, delta tolerance check (<10% threshold), and anomaly flagging.
4. **Brand Compliance Officer:** EPR portfolio dashboard, Mumbai geographic heat map, searchable manifests, and 1-click audit-ready CPCB PDF report exports.

---

## 📋 Project Architecture

```
projectakrit/
├── index.html                   # Fully assembled standalone single-file mobile web app
├── a_head.html                  # Design tokens, CSS layout, and HTML header
├── b_core.js                    # Domain data, i18n dictionary, state store & PDF engine
├── c_views.js                   # Views: Onboarding, Kabadiwala, Repair Shop, Manifest modal
├── d_views2.js                  # Views: Compliance Officer, Recycler Desk, Dispatcher
├── assemble.py                  # Assembly & build pipeline script
├── PROJECT_AKRIT_DOCS.md        # Detailed project dossier, problem analysis & regulatory framework
└── README.md                    # Project overview & quick start
```

---

## 🏛️ Verified Recycler Network (Mumbai Region)

Mapped to confirmed, physically authorized recyclers within 60–90 km of Mumbai (Vasai, Palghar, Wada, Tarapur):
- **Eco-Recycling Ltd (Ecoreco)** — Vasai East (7,200 MT/year)
- **Evergreen Recyclekaro India** — Wada, Palghar (R2 & ISO 14001)
- **Justdispose Recycling Pvt Ltd** — Vasai East (1,200 MT/year)
- **E-Incarnation Recycling** — Tarapur, Palghar (950 MT/year)

---

## 🎯 UN Sustainable Development Goals (SDGs)
- **SDG 8: Decent Work & Economic Growth** — Formalizes daily-wage informal collectors and repair shops.
- **SDG 9: Industry, Innovation & Infrastructure** — Traceable urban mining infrastructure.
- **SDG 12: Responsible Consumption & Production** — Diverts hazardous components into certified recovery channels.

---

## 📄 Documentation
For detailed problem statements, market sizes, EPR credit economics, and SWOT analysis, see [`PROJECT_AKRIT_DOCS.md`](PROJECT_AKRIT_DOCS.md).
