# AppPacha Website

React/Vite website for AppPacha, connected to the same backend used by the mobile app.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t apppacha-website --build-arg VITE_API_URL=https://api.charly.ezequielrozicki.com.ar .
docker run --rm -p 8080:80 apppacha-website
```
