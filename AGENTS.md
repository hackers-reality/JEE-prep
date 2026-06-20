# JEE Prep — Build Agent Notes

## Phase 1 (Complete)
- Next.js 16 (App Router) scaffolded
- Prisma 7 + SQLite with provided schema
- Prisma client generated to `src/generated/prisma/`
- Initial migration applied — `prisma/migrations/`
- Prisma client singleton at `src/lib/prisma.ts`

## Prerequisites for Later Phases

### Tauri (Phase 7 — Desktop .exe)
- Requires Rust toolchain: install from https://rustup.rs
- After install, verify with `rustc --version && cargo --version`
- Then: `cargo install tauri-cli`

### Capacitor (Phase 7 — Android .apk)
- Requires Android SDK (Android Studio)
- Then: `npm install @capacitor/core @capacitor/cli @capacitor/android`
