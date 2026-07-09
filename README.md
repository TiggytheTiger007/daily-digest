# AI Daily Digest & Morning Briefing

A full-stack mobile application that aggregates live global news, financial market data, and software engineering internship postings, synthesizing them into a clean, actionable morning briefing using Google's Gemini LLM.

## Overview

Instead of acting as a simple news feed, this application uses a large language model as an active data synthesizer. The backend ingests multiple disparate data streams (JSON from REST APIs and raw Markdown scraped from GitHub), feeds them to Gemini 2.5 Flash with strict layout constraints, and serves a structured JSON payload to the React Native frontend. 

The mobile app's UI is entirely data-driven, dynamically mounting different React Native components (metrics rows, bulleted lists, or clickable links) based on the layout tags assigned by the AI.

## Features

* **Multi-Stream Aggregation:** Pulls live breaking news, sports updates, and stock market sentiment via NewsAPI, while simultaneously scraping live SWE/MLE internship drops directly from the Simplify GitHub repository.
* **LLM Data Structuring:** Uses Gemini to filter noise, prioritize relevant data (e.g., highlighting Big Tech or sophomore-friendly roles), and enforce a strict JSON schema.
* **Dynamic UI Rendering:** The React Native frontend dynamically maps the AI's layout choices (`bullets`, `links`, or `metrics`) to specific, styled UI components.
* **Deep Linking:** Automatically extracts application URLs and article links, rendering them as interactive touch targets in the mobile app.

## Tech Stack

**Frontend (Mobile):**
* React Native (Expo)
* TypeScript
* `Linking` for native browser handoff

**Backend (API & AI):**
* Node.js & Express.js
* `@google/genai` (Gemini 2.5 Flash)
* `axios` for external API requests & Markdown scraping

## 💻 Local Development Setup

To run this project locally, you will need a free [NewsAPI Key](https://newsapi.org/) and a free [Google Gemini API Key](https://aistudio.google.com/).

### 1. Clone the repository
```bash
git clone [https://github.com/YourUsername/daily-digest.git](https://github.com/YourUsername/daily-digest.git)
cd daily-digest
