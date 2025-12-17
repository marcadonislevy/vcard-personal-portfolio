# Quoralinex Theme

This site defines the source-of-truth theme used across Quoralinex web properties. All apps should use the same tokens for colours, typography and shape.

## Colour tokens

| Token | Light | Dark |
| --- | --- | --- |
| `bg.page` | `#f8fafc` | `#0b1221` |
| `bg.surface` | `#ffffff` | `#0f172a` |
| `bg.header` | `#e2e8f0` | `#0f172a` |
| `text.primary` | `#0f172a` | `#e2e8f0` |
| `text.muted` | `#475569` | `#cbd5e1` |
| `accent.primary` | `#0ea5e9` | `#22d3ee` |
| `accent.hover` | `#0284c7` | `#67e8f9` |

## Typography scale

- `h1`: `3rem`
- `h2`: `2.25rem`
- `h3`: `1.5rem`
- `h4`: `1.25rem`
- `body`: `1rem`
- `small`: `0.9rem`

## Shape tokens

- Border radius: `card = 16px`, `button = 999px`
- Shadows: `card = 0 10px 30px rgba(15, 23, 42, 0.08)` (light) / `0 10px 30px rgba(0, 0, 0, 0.45)` (dark), `header = 0 12px 32px rgba(15, 23, 42, 0.06)` (light) / `0 12px 32px rgba(0, 0, 0, 0.4)` (dark)

## Usage

The tokens are codified in `src/react-app/src/theme.ts` as a `theme` object with `light` and `dark` variants. The accompanying `ThemeProvider` reads `quoralinex-theme` from `localStorage`, defaults to light, applies CSS variables on `document.documentElement`, and exposes a toggle control for the shared header. All sites should reuse these tokens rather than hard-coding colours.

- The `bg.page` token (`#f8fafc` light, `#0b1221` dark) is the reference page background used on the CPMS SaaS workspace. The group site uses the same token directly for the main background to avoid future drift.
