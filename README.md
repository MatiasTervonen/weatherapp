Weather App

## 🚀 Live app

👉 [Try it here](https://weatherapp-chi-neon.vercel.app/)

## Features

- View overall weather in Finland
- Search weather by city
- Add favorite cities
- 10-day forecast
- Rain radar
- Daily weather report (chatGPT)
- Responsive design with smooth UX
- Installable as a PWA on your phone
- Change language and theme

**Core Desing**

- Weather data is fetched from the Finnish Meteorological Institute (FMI).
- Data is stored in Supabase and refreshed every 10 minutes via a cron job.
- Frontend uses SWR to fetch and cache data efficiently.
- Every morning at 5:00 AM, the app fetches weather data for all cities in Finland and saves the summaries to the database. Based on this data, a daily weather report is generated with ChatGPT and saved to database. All of this is fully automated with cron jobs.
- Rain radar images are processed on the server, generated, and stored in Supabase Storage.
  Metadata for each image is saved in a dedicated Supabase table. A cron job handles this entire process automatically.
  The client fetches the pre-generated images directly from the database, with caching and preloading in the browser for instant loading.

**Tech Stack**

- **Framework:** Next.js
- **Hosting:** Vercel
- **Database** Supabase
- **State Management:** Zustand
- **Styling:** Tailwind CSS

## 📸 Screenshots

<img src="./public/readme-frontpage.png" alt="Landing page" width="400"/>

<img src="./public/readme-searchpage.png" alt="City page" width="400"/>

## ⚙️ Getting Started

```bash
git clone https://github.com/MatiasTervonen/weatherapp.git
cd weather-app
pnpm install
pnpm dev
```
