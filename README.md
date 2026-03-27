# Quant Trading Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-47B275?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)

Institutional-grade web terminal for real-time monitoring of automated quantitative trading strategies on Binance. 

This repository contains the **Frontend Dashboard** of the Quant Framework. It connects seamlessly to a PostgreSQL database via WebSockets to visualize the performance of a remote Python-based trading engine.

## Key Features

* **⚡ Real-Time Telemetry:** Instantaneous updates of Total Equity, Available Balance, and Daily Drawdown using Supabase Realtime (WebSockets).
* **Premium Charting:** Interactive, high-performance financial charts powered by TradingView's `lightweight-charts` (v5).
* **Dynamic Universe Tracking:** Live monitoring of the bot's active trading pairs and sector allocation (e.g., L1, DeFi, AI, Meme).
* **Risk Management UI:** Visual indicators for Kill-Switch status and system health.
* **Responsive Design:** Built with Tailwind CSS to look perfect on both multi-monitor desktop setups and mobile devices.

## System Architecture

The complete system consists of three decoupled layers:
1. **Trading Engine (Backend):** Python asynchronous bot running on a dedicated server, executing trades via Binance WebSocket API.
2. **Data Warehouse:** Supabase (PostgreSQL) acting as the central nervous system, storing logs and broadcasting state changes.
3. **Frontend Terminal (This Repo):** Next.js application subscribing to database changes and rendering the UI.

## Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed. You also need a Supabase project set up and connected to your Python Trading Bot.

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/quant-dashboard.git](https://github.com/your-username/quant-dashboard.git)
cd quant-dashboard