# UX Next Steps (Ideas & Roadmap)

These are optional enhancements to continue refining the fishing shop experience.

## Performance & Perceived Speed

- Skeleton loaders for product cards while images load.
- Lazy-load product images below the fold (NgOptimizedImage already helps – extend with priority hints for first row).
- Preload hover/zoom images using IntersectionObserver.

## Product Discovery

- Brand logos (swap text pills with logo+name chips when assets available).
- Filters: price range slider, size/grammage, lure type.
- Sorting: price asc/desc, newest first.
- Recently viewed strip.

## Cart & Checkout UX

- Persistent mini-cart summary bar at top on mobile once items exist.
- Undo toast when removing an item (timed restore).
- Save cart to a shareable link (serialize product ids/qty in URL param).
- Discount code input (expandable panel) when threshold logic expands.

## Engagement & Guidance

- Gamified progress: after free shipping, show next milestone (e.g., “+10% off at 120 €”).
- Micro-copy tips on empty state: suggest popular brands or seasonal picks.
- Highlight NEW badge with small sparkle animation (one-time per session).

## Visual Polish

- Subtle background SVG wave pattern behind header (very low opacity).
- Animated water ripple when adding to cart (originates from button center).
- Light/dark theme toggle (persist preference in localStorage).

## Accessibility Improvements

- Add skip-to-content link (visually shown on focus only).
- High contrast mode toggle (increase color contrast & underline links).
- Focus order audit for keyboard-only navigation.

## Internationalization

- Prepare i18n structure (keys for labels, pluralization rules).
- Currency pipe usage / currency toggle (EUR → other markets).

## Data & Validation (If backend added later)

- Graceful fallback when product list fetch fails (retry + message).
- Optimistic UI for adding/removing items.

## Search & Intelligence

- Fuzzy search matching brand + product type.
- Recent searches memory (localStorage).

## Analytics (Privacy respectful)

- Anonymous event queue (add_to_cart, brand_switch) to help improve UX later.

## Admin / Maintenance

- Feature flag system (e.g., enable experimental layout or promotional banner).

---
Feel free to ask for any of these and I can implement them incrementally.
