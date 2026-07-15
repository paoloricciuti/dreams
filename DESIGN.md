<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

---

name: Dreams
description: A public dream diary rendered into AI-generated images — an eerie, overexposed light-world where the dreams carry all the color.
---

# Design System: Dreams

## 1. Overview

**Creative North Star: "The Overexposed Dream"**

Most dream sites reach for darkness — starry indigo, purple-black, fog machines. This one goes the other way: a world with too much light. Pale, washed-out, faintly cold, like waking at noon with a dream still clinging to you, or a photograph left in the sun. The eeriness comes from overexposure and stillness, not shadow. Against that bleached frame, the AI-generated dream images are the only saturated things on any screen — windows cut into the fog.

The register is brand: the page IS the artwork ("eerie, cinematic, mysterious" — dreamlike wonder, per PRODUCT.md). Motion is choreographed like a film sequence — orchestrated entrances, scroll-driven pacing — but the piece must survive stillness: with `prefers-reduced-motion`, it becomes a quiet, overexposed artifact and loses nothing essential.

This system explicitly rejects the generic SaaS landing page, the Instagram-style uniform grid, goth/horror kitsch, and the anonymous minimal portfolio template.

**Key Characteristics:**

- Eerie through light, never through darkness
- Dream imagery is the only saturation; the frame is bleached and quiet
- Cinematic, choreographed pacing with a genuine still fallback
- Each dream entry is its own world, never a uniform tile

## 2. Colors

A restrained strategy: pale fog surfaces, near-total quiet, one accent under 10% — the dream images supply all remaining color.

### Primary

- **Fog accent** `[to be resolved during implementation]`: the single accent, used on ≤10% of any screen. Cold and specific, drawn from the fog world itself — not a "brand color" bolted onto it.

### Neutral

- **Pale fog surfaces** `[to be resolved during implementation]`: the light-drenched ground. Must be a _cold or truly neutral_ pale — chroma near zero, or tinted toward the fog hue itself. Explicitly NOT the warm cream/sand/bone band (OKLCH L 0.84–0.97, C < 0.06, hue 40–100); warm parchment is the saturated AI default and the opposite of this world's temperature.
- **Ink** `[to be resolved during implementation]`: text color deep enough for WCAG AA (≥4.5:1) on the pale ground, including over any veiling.

### Named Rules

**The Overexposed Rule.** Eeriness comes from too much light, never from darkness. If a surface trends warm-cream or drops toward moody black, it has left the world.
**The Only-Color Rule.** The dream images are the only saturated color on any screen. The frame never competes with them.

## 3. Typography

**Display Font:** `[font pairing to be chosen at implementation]` — a strange, characterful serif for dream titles
**Body Font:** `[to be chosen at implementation]` — a quiet sans for the diary voice

**Character:** Two voices: the serif speaks the dream (strange, slightly wrong, memorable), the sans records it (calm, first-person, diary-plain). Pairing must sit on a real contrast axis (serif + sans), and the display serif must not come from the training-data default list (no Fraunces, Playfair, Cormorant, Crimson, et al.) — find something genuinely uncanny.

### Hierarchy

`[to be resolved during implementation — modular scale, fluid clamp() for display, ≥1.25 ratio between steps, body capped at 65–75ch]`

### Named Rules

**The Two Voices Rule.** The serif only ever speaks dream content — titles and dream fragments. Everything functional (dates, navigation, notes) belongs to the sans. Neither borrows the other's role.

## 4. Elevation

Flat, atmospheric depth. No drop shadows — depth in this world is conveyed by veils of light: translucency, soft blur used sparingly and purposefully (not decorative glassmorphism), and layered pacing during choreographed sequences. If an element needs to feel closer, it gets _clearer_, not shadowed.

## 6. Do's and Don'ts

### Do:

- **Do** keep every text/background pairing at WCAG AA (≥4.5:1 body, ≥3:1 large) — a washed-out world is not an excuse for washed-out text.
- **Do** ship a genuine `prefers-reduced-motion` alternative for every choreographed sequence; the still version is a complete artwork, not a degraded one.
- **Do** write alt text in the diary's voice — each image described the way the dream would describe itself.
- **Do** let each dream entry have its own composition; "each dream is its own world" (PRODUCT.md).

### Don't:

- **Don't** build a "generic SaaS landing page: hero + features + CTA scaffolding, gradient accents, card grids" (PRODUCT.md anti-reference, verbatim).
- **Don't** flatten dreams into an "Instagram-style image grid — a uniform thumbnail wall" (PRODUCT.md anti-reference).
- **Don't** drift into "goth/horror kitsch — no fog overlays, dripping fonts, or purple-black clichés" (PRODUCT.md anti-reference); this world is eerie by light.
- **Don't** default to the "tasteful-but-anonymous minimal portfolio template with small gray captions" (PRODUCT.md anti-reference).
- **Don't** warm the neutrals into cream/sand/parchment; the fog is cold or it is nothing.
- **Don't** borrow an existing aesthetic lane — no reference site exists on purpose; the look is invented from the dream register itself.
