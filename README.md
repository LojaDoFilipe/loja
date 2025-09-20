
# LojaDoFilipe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Application Usage Notes

### Product Browsing & Images

* Select a brand on the home screen to view its products (routing uses lazy loaded standalone components and deferred rendering for faster initial load).
* Click a product image in the grid to open the full-screen viewer.
  * Navigate between images with keyboard arrows, on-screen arrows, swipe (touch), or ESC to close.

### Shopping Cart (Floating Button)

* The circular button (bottom-right) shows current total item count.
* Click it to open/close the cart panel.
* Close options:
  * Click the X button in the panel header.
  * Click / tap the semi-transparent backdrop outside the panel.
  * Re‑click the floating cart button.

### Cart Item Image Preview

Desktop / Large Screens:

* Hover or keyboard-focus (Tab) a cart item thumbnail to show a tooltip preview with a larger image.
* Tooltip auto-hides when pointer leaves or focus shifts.

Mobile (≤640px):

* Tap a cart item thumbnail to toggle an inline larger preview under that item.
* Tap the same thumbnail again to collapse it.
* Only one inline preview is expanded at a time.

### Managing Cart Items

* Press the red ✕ beside an item to remove it.
* Press “Limpar” to clear all items.
* (Future enhancements possible: quantity adjustment controls, line subtotals, checkout flow.)

### Persistence

* Cart contents persist across page reloads using `localStorage` (data keyed per app origin).

### Accessibility Notes

* Tooltip preview images are purely visual; primary image alt text is reused inside previews.
* Focus ring / outline added for thumbnail when active on mobile.
* Future improvements (optional): focus trap inside cart panel, ARIA live region for add/remove, ESC key to close cart.

### Performance Techniques Used

* Standalone Angular 20 components + signals (no NgModules overhead).
* Deferred (`@defer`) loading of product grid after idle.
* Lightweight cart state management using signals with a persistence effect.

### Watermarked Images

* Images were batch-processed with a custom Sharp-based script to apply a subtle diagonal watermark.
* Source script located under `scripts/` (see watermark generation logic if further customization is needed).

---

## Image Optimization Notes

Product images currently use large original source files (≈3024x4032). The UI renders them around 210x280. Angular's `NgOptimizedImage` may warn that intrinsic files are much larger than necessary. Short-term mitigations implemented:

* Added responsive `sizes` and an `ngSrcset` placeholder in `product-card`.
* Marked the first product image per brand view as `priority` to improve LCP.

Recommended next steps for efficient delivery:

1. Generate resized derivatives at 210w and 420w (2x) – optionally 560w for high-density displays – using a tool like `sharp`.
2. Store them alongside originals using a naming convention: `filename-210w.jpeg`, `filename-420w.jpeg`.
3. Update `buildSrcSet` in `product-card` to emit multiple width descriptors (e.g. `... 210w, ... 420w`).
4. (Optional) Move the large originals into an `original/` directory to avoid accidental direct serving.

Example Sharp script concept (not yet in repo):

```js
// scripts/generate-thumbs.mjs
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, parse } from 'path';

const SIZES = [210, 420];
const SRC = 'src/assets/images/watermarked';

async function process(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { await process(full); continue; }
    if (!/\.(jpe?g|png)$/i.test(e.name)) continue;
    for (const w of SIZES) {
      const { name, ext } = parse(e.name);
      const out = join(dir, `${name}-${w}w${ext}`);
      try { await stat(out); continue; } catch {}
      await sharp(full).resize(w).toFile(out);
      console.log('Created', out);
    }
  }
}
process(SRC).catch(e => { console.error(e); process.exit(1); });
```

After generating variants, modify `buildSrcSet` to return something like:

```ts
return `${base}-210w.${ext} 210w, ${base}-420w.${ext} 420w`;
```

This will let the browser choose the most appropriate size and eliminate oversize warnings.

If you add new interaction patterns (e.g., quantity steppers, mini checkout), extend this section to keep documentation current.
