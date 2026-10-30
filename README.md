# La Caseta — tienda del peluche de Snoopy

Landing de producto único, interactiva y con estética de **tira cómica dominical**.
HTML + CSS + JS sin dependencias ni proceso de compilación.

```bash
python3 -m http.server 8000   # y abre http://localhost:8000
```

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Marcado y textos (en español) |
| `styles.css` | Sistema visual: tokens de color, tipografía, componentes "de cómic" |
| `script.js` | Catálogo, selector de variantes, abrazo interactivo, carrito, quiz |
| `assets/img/` | Fotos del producto: `clasico.jpg`, `aviador.jpg`, `astronauta.jpg`, `navidad.jpg` (si falta alguna se muestra `placeholder.svg`) |

Precios, variantes y textos de cada atuendo están en el objeto `VARIANTS` de `script.js`.

## Decisiones de UI/UX

**Estilo visual — "papel de periódico"**
- Fondo crema con trama de puntos (impresión offset), contorno negro de 3 px en todo y sombras duras desplazadas: se ve dibujado a mano y da al mismo tiempo pistas claras de "esto se pulsa".
- Paleta plana y reducida: rojo caseta (CTA y acciones), amarillo (destacados), cielo y hierba (fondos de sección).
- Tres tipografías con roles fijos: *Fredoka* (titulares), *Patrick Hand* (texto, rotulado de cómic), *Bangers* (solo onomatopeyas).
- Ligeras rotaciones (±1–2°) en tarjetas y viñetas para romper la rigidez sin perder legibilidad.

**Conversión**
- El hero cuenta una mini‑historia en 3 viñetas (lunes → paquete → abrazo) y dos CTA: compra directa o quiz para indecisos.
- Panel de compra con un solo camino: atuendo → tamaño → cantidad → añadir. Precio y nombre se actualizan al instante.
- Regla visual de tamaño (silueta junto a una mano) para resolver la duda nº 1 en peluches online.
- Barra de envío gratis en el carrito para subir el ticket medio; envoltorio de regalo como venta adicional de baja fricción.
- En móvil, barra de compra fija que aparece solo cuando el panel de compra ya ha quedado atrás.
- Señales de confianza junto al CTA: envío, devoluciones, licencia y norma de seguridad EN‑71.

**Interacción con intención (no decoración)**
- *Mantén pulsado para abrazar*: el peluche se aplasta y salen corazones. Refuerza el atributo "blandito" y engancha emocionalmente.
- Al añadir al carrito: onomatopeya ("¡WOOF!") + contador que rebota → confirmación clara de la acción.
- Quiz de 3 preguntas que termina en "Elegir este atuendo" y te lleva al producto ya configurado.

**Accesibilidad**
- Navegable por teclado (variantes y tallas son radios nativos, el abrazo funciona con Espacio/Enter, carrito con trampa de foco y cierre con Esc).
- `prefers-reduced-motion` desactiva animaciones; `aria-live` para avisos y resultado del quiz; enlace "saltar al producto".
- Contraste AA en texto sobre los fondos de la paleta.

## Pendiente antes de publicar
- **Licencia**: Snoopy y PEANUTS son marcas registradas. Vender el peluche y usar nombre/imágenes requiere ser distribuidor autorizado o vender producto licenciado; revisad textos legales y las afirmaciones "licencia oficial" y "EN‑71" con vuestro proveedor.
- Fotos reales del producto en `assets/img/` (fondo transparente o liso, 1:1, ≥1200 px).
- Las opiniones son texto de ejemplo: sustituidlas por reseñas reales.
- Conectar "Finalizar compra" con la pasarela (Shopify Buy Button, Stripe Checkout…).
