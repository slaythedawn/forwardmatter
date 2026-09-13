# Design handoff

The `.dc.html` files are the original design prototypes and `README.md` is the
designer's handoff note. They are the reference for this site, not shippable code:
they are authored in a bespoke template runtime (`support.js`, `<x-dc>`, `{{ }}`
holes, `<sc-for>` / `<sc-if>`) that is deliberately not checked in, so opening them
directly will not render.

Not checked in, kept in the client's brand bundle:

- `support.js` — the design-tool runtime, explicitly not for production.
- The full-resolution portraits and case photograph. Optimised WebP versions sized
  for their slots live in `public/people` and `public/media`.

`brain-field.js` is checked in at `public/vendor/brain-field.js`; it is a dependency
free web component and ships as-is.
