# CS Motor Group · Demo

Demo multi-página para **CS Motor Group** (520 Hicksville Rd, Massapequa, NY 11758). Auto group: detailing (Black Label AutoSpa), alquiler de autos (economy → exotic), reparaciones y **ventas de usados** (marketplace en standby).

## Stack

- HTML estático multi-página
- Tailwind CSS via CDN + `assets/styles.css` (design system negro + dorado)
- Google Fonts: Syne (display) + Fraunces (serif itálica) + Inter (body) + JetBrains Mono (labels)
- Vanilla JS (`assets/app.js`): reveals IntersectionObserver, parallax, counters, carousel, i18n, before/after slider
- Bilingüe EN/ES con localStorage persistente
- Listo para Vercel (`vercel.json`, `cleanUrls: true`)

## Páginas

- `index.html` — Hero Rolls-Royce, marquee de marcas atendidas, métricas, feature Black Label, before/after slider, fleet rentals, teaser de sales, proceso, reviews
- `services.html` — Catálogo completo: Gold/Platinum + add-ons + mecánica (repairs, oil, body, fuel)
- `carwash.html` — Detailing: paquetes Gold/Platinum + membresías + proceso
- `rentals.html` — 4 tiers (Economy/Luxury/Large SUV/Exotic) + requisitos + form
- `sales.html` — **Marketplace de usados (standby)**: search + filtros + sort + grid listos; inventario vacío con empty state de captura de leads + form concierge "we source it"
- `booking.html` — Flow de reserva 4 pasos con confirmación
- `contact.html` — Form, info, mapa

## Sales / Inventario — cómo activarlo con Square

El marketplace de `sales.html` está **completo pero en standby** (`const INVENTORY = []`). Cuando entreguen la cuenta Square:

1. Crear serverless function en Vercel `/api/inventory` que llame a **Square Catalog API + Inventory API** (access token en env var, nunca en cliente). Filtrar items con stock 0.
2. En `sales.html`, reemplazar el array por `fetch('/api/inventory')`.
3. El shape de cada item ya está soportado por el renderer:
   `{ id, title, trim, price, miles, drivetrain, trans, body, img, photos, lot, badge }`
4. Cada auto en Square = 1 item de catálogo con cantidad 1; al venderse (stock 0) desaparece solo de la web.

Pagos: el marketplace es de *listado*; depósitos/apartados vía Square Checkout Links.

## Deploy

```
vercel --prod
```

Repo: `greengrowdigital/cs-motorgroup` · Live: https://cs-motorgroup.vercel.app

## Notas

- Diseño inspirado en estudios high-end de detailing (Blackout Auto Detailing, AMMO NYC, Topaz) + marketplace de The Car Guys (`thecarguysnyc.com/inventory`).
- Imágenes: hero local (`assets/img/hero-rolls.jpg`); resto Unsplash placeholder hasta tener fotos reales del taller.
- Todos los forms son `data-fake` (mock). Conectar a n8n/backend en producción.
- Los precios/paquetes son ilustrativos del demo.

## Negocio

- **Phone**: (631) 601-9865
- **Address**: 520 Hicksville Rd, Massapequa, NY 11758
