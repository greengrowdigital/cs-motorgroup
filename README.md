# CS Motor Group · Demo

Demo multi-página para **CS Motor Group** (520 Hicksville Rd, Massapequa, NY 11758). Auto group: detailing (Black Label AutoSpa), alquiler de autos (economy → exotic), reparaciones y **ventas de usados** (marketplace en standby).

## Stack

- HTML estático multi-página
- Tailwind CSS via CDN + `assets/styles.css` (design system negro + dorado)
- Google Fonts: Syne (display) + Inter (body) + JetBrains Mono (labels)
- Vanilla JS (`assets/app.js`): reveals IntersectionObserver, parallax, counters, carousel, i18n, before/after slider
- Bilingüe EN/ES con localStorage persistente
- Listo para Vercel (`vercel.json`, `cleanUrls: true`)

## Páginas

- `index.html` — Hero, categorías, why-choose-us, marcas, promesa+checklist, before/after slider, paquetes, rentals, proceso, reviews, ubicación+mapa, FAQ
- `services.html` — Catálogo completo: Gold/Platinum + add-ons + mecánica (repairs, oil, body, fuel)
- `carwash.html` — Detailing: paquetes Gold/Platinum + membresías + proceso
- `rentals.html` — 4 tiers (Economy/Luxury/Large SUV/Exotic) + requisitos + form
- `sales.html` — **Marketplace de usados (standby)**: SOLO inventario. Search + chips + sliders (precio/millaje) + filtros body/make + sort + grid, todo funcional. Sin formularios
- `booking.html` — Flow de reserva 4 pasos con confirmación
- `contact.html` — Form, info, mapa

## Sales / Inventario — conectado a Square

**El código ya está wireado.** `sales.html` hace `fetch('/api/inventory')` al cargar; la función serverless vive en [`api/inventory.js`](api/inventory.js) y lee el catálogo de Square. Falta **un solo paso**: la variable de entorno.

### Cuenta Square

- Merchant: **APS UNITED INC** (`MLETADEZT66G0`)
- Location: `L8TDTNPKHBYME` — 520 Hicksville Rd, Massapequa NY 11758
- MCC 7538 (taller automotriz), con `CREDIT_CARD_PROCESSING` activo

### Paso que falta: el access token

⚠️ El token del MCP de Square **no sirve** para esto (es de la pasarela `mcp.squareup.com`, da 401 contra `connect.squareup.com`). La web necesita su propio token:

1. Entrar a [developer.squareup.com/apps](https://developer.squareup.com/apps) **con la cuenta APS UNITED INC**
2. Crear una aplicación (o usar una existente) → pestaña **Credentials** → copiar el **Production Access Token** (empieza con `EAAA`)
3. En Vercel → proyecto `cs-motorgroup` → Settings → Environment Variables:

   | Variable | Valor | Requerida |
   |---|---|---|
   | `SQUARE_ACCESS_TOKEN` | el token `EAAA…` | Sí |
   | `SQUARE_ENVIRONMENT` | `sandbox` para pruebas; omitir en producción | No |
   | `SQUARE_CATEGORY_ID` | ID de categoría si quieres filtrar solo vehículos | No |

4. Redeploy. Listo.

**Sin el token la web no se rompe**: el endpoint responde `{configured:false, vehicles:[]}` y `sales.html` se queda en el estado "first lot in preparation".

### Cómo carga los autos

Cada vehículo es **un item de catálogo** con una variación:

- **Nombre del item** → título de la card (ej. `2021 Audi Q5`)
- **Precio de la variación** → precio mostrado (Square lo guarda en centavos, el endpoint divide)
- **Fotos del item** → galería; la primera es la portada
- **Inventario**: cantidad 1 por auto. Al llegar a 0 **desaparece solo de la web**
- **Custom attributes** del item (opcionales, todos por nombre):
  `mileage`, `drivetrain`, `transmission`, `body`, `make`, `year`, `vin`, `lot`, `trim`, `status`
  (poner `status = pending` pinta el badge "Sale pending")

El `body` se normaliza solo a `sedan / suv / truck / coupe` para que funcionen los filtros, así que da igual si escriben "Pickup Truck" o "Crossover".

Se filtran los items **sin precio** y los que están **sin stock**. Cache de 5 min (`s-maxage=300`) para no golpear Square en cada visita.

Pagos: el marketplace es de *listado*; depósitos/apartados vía Square Checkout Links.

## Deploy

```
vercel --prod
```

Repo: `greengrowdigital/cs-motorgroup` · Live: https://cs-motorgroup.vercel.app

## Notas

- Diseño v3 clonando la estructura de **stampedeauto.com** (dealer layout: hero + categorías, why-choose-us, checklist, reviews, ubicación, FAQ) con la paleta negro + gold de la marca.
- Flat design: colores sólidos, sin gradientes ni glow. Header sticky de dos filas (util bar + nav) que no se encima con nada.
- Imágenes: hero local (`assets/img/hero-rolls.jpg`); resto Unsplash placeholder hasta tener fotos reales del taller.
- Todos los forms son `data-fake` (mock). Conectar a n8n/backend en producción.
- Los precios/paquetes son ilustrativos del demo.

## Negocio

- **Phone**: (631) 992-2920
- **Address**: 520 Hicksville Rd, Massapequa, NY 11758
