# MERN Stack med Leaflet Kart

Dette prosjektet er en fullstack MERN (MongoDB, Express, React, Node.js) applikasjon med Leaflet kart-integrasjon.

## Struktur

```
Demo_mikroplan/
├── client/          # React frontend med Vite
│   └── src/
│       └── components/
│           └── MapComponent.jsx  # Leaflet kartkomponent
└── server/          # Node.js/Express backend
    ├── config/      # Database konfigurasjon
    ├── controllers/ # API controllers
    ├── models/      # Mongoose modeller
    └── routes/      # API routes
```

## Komme i gang

### Backend (Server)

1. Naviger til server-mappen:
```bash
cd server
```

2. Installer dependencies:
```bash
npm install
```

3. Sørg for at MongoDB kjører lokalt, eller oppdater `MONGO_URI` i `.env`

4. Start serveren:
```bash
npm run dev
```

Serveren kjører på: http://localhost:5000

### Frontend (Client)

1. Naviger til client-mappen:
```bash
cd client
```

2. Installer dependencies:
```bash
npm install
```

3. Start utviklingsserveren:
```bash
npm run dev
```

Frontend kjører på: http://localhost:5173

## Leaflet Kart

Kartet er satt opp med:
- **react-leaflet** - React wrapper for Leaflet
- **OpenStreetMap** - Gratis basiskart
- Sentrert på Kristiansand (58.1599, 8.0182)

### Legge til kommunekart WMS-lag

For å legge til offisielle kartlag fra Kristiansand kommune:

1. Kontakt Kristiansand kommune for å få WMS-URL
2. Oppdater `MapComponent.jsx` med riktig WMS endpoint

Eksempel:
```jsx
<TileLayer
  url="https://kart.kristiansand.kommune.no/wms?..."
  layers="plankart"
  format="image/png"
  transparent={true}
/>
```

## API Endpoints

- `GET /api/users` - Hent alle brukere
- `GET /api/users/:id` - Hent én bruker
- `POST /api/users` - Opprett ny bruker
- `PUT /api/users/:id` - Oppdater bruker
- `DELETE /api/users/:id` - Slett bruker

## Teknologier

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

### Frontend
- React
- Vite
- Leaflet
- React-Leaflet
