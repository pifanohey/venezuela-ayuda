# Terremoto Venezuela 2026 — Hub de recursos verificados

Página pública y ligera para **encontrar familiares** y **ayudar de forma segura** tras los terremotos del 24 de junio de 2026 en Venezuela (magnitudes 7,2 y 7,5, epicentro en Yaracuy).

**En vivo:** https://venezuela-ayuda-drab.vercel.app

## Qué es (y qué no)

Este hub **no replica** las bases de datos de desaparecidos: las **dirige**. Crear un registro paralelo fragmentaría la información justo cuando lo crítico es centralizarla. En lugar de eso, reúne en un solo lugar:

1. **Buscar a un familiar** — enlaces directos a las plataformas ciudadanas que ya existen + Restoring Family Links de la Cruz Roja, y los números de emergencia reales.
2. **Cómo donar** — organizaciones verificadas con operación real sobre el terreno.
3. **Donar sin estafas** — checklist anti-fraude.
4. **Compartir** — para enviar a la gente a los canales correctos.

## Dos caras

- **`index.html`** — la página para personas (español, móvil primero, estática, sin base de datos).
- **`data.json`** — los mismos datos estructurados y limpios, para que una app o un agente de IA los consuma de una sola lectura: `https://venezuela-ayuda-drab.vercel.app/data.json`

## Estructura

```
index.html    Página principal
data.json     Datos estructurados (endpoint para agentes)
```

Sitio estático: no requiere build ni servidor. Cualquier cambio en `main` se publica automáticamente vía Vercel.

## Aviso

Reúne enlaces y números de terceros; no recauda dinero ni gestiona datos personales. Verifica siempre en la fuente oficial antes de donar o difundir información. Las cifras se verificaron el 25 de junio de 2026 y cambian con frecuencia.
