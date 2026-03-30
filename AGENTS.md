# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

exif-edit is a client-side Vue.js 2 SPA for EXIF metadata editing and watermark compositing. There is **no backend**; all image processing runs in the browser via `piexifjs` and `konva`.

### Development commands

See `README.md` for the full list. Key commands:

- `yarn serve` — start Webpack dev server with HMR (default port 8080)
- `yarn lint` — run ESLint (uses `vue-cli-service lint`)
- `yarn build:app` — production build to `dist/`

### Gotchas

- **`yarn install` requires `--ignore-engines`** because the transitive dependency `@achrinza/node-ipc@9.2.6` declares an engine constraint that excludes Node 22+. The VM ships Node 22. Always run `yarn install --ignore-engines`.
- The `caniuse-lite` browserslist warning is cosmetic and does not affect builds.
- `fs.Stats` deprecation warning from Webpack is harmless on Node 22.
