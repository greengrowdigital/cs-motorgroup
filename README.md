# Global Gas Station · Demo

Demo de landing multi-página para Global Gas Station (520 Hicksville Rd, Massapequa, NY 11758).

## Stack

- HTML estático multi-página
- Tailwind CSS via CDN
- Google Fonts: Inter + Space Grotesk + Space Mono + Bricolage Grotesque
- Vanilla JS para animaciones (IntersectionObserver, scroll progress, modal, i18n, price ticker animado)
- Bilingüe EN/ES con localStorage persistente
- Listo para Vercel (`vercel.json` incluido, `cleanUrls: true`)

## Páginas

- `index.html` — Hero con price ticker, marquee, servicios, historia, rewards, reviews
- `services.html` — Catálogo completo (combustible, lavado, tienda, café, ATM/lottery/aire, extras)
- `carwash.html` — Paquetes Basic/Deluxe/Premium + membresías ilimitadas + proceso
- `store.html` — Aisles grid + items populares
- `contact.html` — Form, info, mapa embebido

## Diseño

- Tema: retro highway / mid-century neon — dark cálido con acentos amber + orange + green
- Pylons con look de letrero de gasolinera (Mobil/Sunoco vibe)
- Price ticker animado simula pumps reales con jitter ligero
- Fonts contrasten Space Grotesk display + Space Mono para precios/ticker

## Deploy

```
vercel --prod
```

## Notas

- Las imágenes son de Unsplash como placeholder. Cuando esté disponible la info real del negocio, reemplazar.
- Los servicios son **mock** — no hay info real del negocio en Google Maps salvo el teléfono y dirección. Los precios, paquetes y todo lo demás son ilustrativos.
- El form de contacto es `data-fake`. Conectar a n8n/Formspree cuando se ponga en producción.

## Negocio

- **Phone**: (516) 882-4437
- **Address**: 520 Hicksville Rd, Massapequa, NY 11758
- **Google Maps**: GLOBAL gas station
