# INSANYCK — Spec do Wordmark (TEMP)

> Temporário: SVG com `<text>` (Inter, 170px, letter-spacing: 20 unidades, baseline Y=170).  
> Quando recebermos o vetor final (um `<path>` único com `fill="currentColor"`), substituir `public/brand/logo.svg` e manter as dimensões.

- viewBox: `0 0 1200 240`
- altura visual usada no Navbar: **96px** (`size="sm"`)
- cor padrão: `currentColor` (herda do CSS)
- variantes: `primary` (currentColor), `mono` (#fff), `outline` (stroke 8px)

## Overlay / verificação
1. Abra `ref-hero-home.png` numa camada base.
2. Sobreponha `logo.svg` rasterizado a **96px**: alinhamento perfeito com kerning de 20.
3. Eventuais micro-deltas (< 1px) vêm da engine de texto; serão eliminadas ao trocar por `<path>`.

