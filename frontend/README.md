# SpeechFlow frontend

React 18 + Vite single-page application.

## Run
```bash
npm install
npm run dev
```
The development server is `http://localhost:5173`; Vite proxies `/api` to the backend at `http://localhost:8080`. For a separately deployed API, set `VITE_API_BASE_URL` to the API base path, e.g. `https://your-api.example.com/api`.

Speech recognition uses the browser Web Speech API when available. Use a supported browser and allow microphone access; HTTPS or localhost is normally required.
