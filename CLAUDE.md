# CLAUDE.md — project instructions for Claude Code

Static multilingual saju (사주) site. Astro 4, plain CSS tokens, client-side TypeScript engine,
GitHub Pages. Calculation conventions live in `docs/saju-methodology.md`; launch verification is tracked in `KASI-CHECKLIST.md`.

## Working style (owner's preferences)
- **One system at a time.** Make targeted, minimal changes to a single system per session.
  Never refactor neighboring code "while you're there."
- **Every change ends with a test checklist.** Run `npm run check` when practical (`npm run build` at minimum).
- Respond in English.

## Hard rules (never violate)
1. **Do not rewrite `src/lib/saju-engine.ts`.** It is verified against known anchors.
   Bug fixes only, each with a failing test case first. New features (대운, 신살, 12운성) go in
   new files such as `src/lib/saju-extras.ts`.
2. **No hardcoded UI strings** in .astro/.ts files. Every user-visible string comes from
   `src/i18n/*.json` via `t()`/`ns()`. When adding a key, add it to **both** en.json and ko.json
   Add new keys to every locale and keep placeholder parity valid.
3. **Do not invent deterministic fortune claims.** Long-form practitioner interpretation and personal family material require owner review; calculated summaries must stay traceable and clearly framed as traditional reference layers.
4. **Keep the site fully static.** No servers, no API keys in client code, no localStorage of
   birth data. The privacy claim "your birth data never leaves your device" must stay true —
   if a change would break it (analytics with PII, server calls), stop and flag it.
5. **Result URLs stay stateless**: all sensitive reading state lives in the URL fragment, never the query string.
6. Vermilion (`--vermilion`) is used ONLY for the seal stamp and primary CTA (design system rule).
7. `/reading` stays `noindex` and out of the sitemap.
8. Don't add dependencies without stating why; prefer zero-dep solutions. Pin versions
   (note: @astrojs/sitemap is pinned 3.1.6 for Astro 4 compatibility — don't bump casually).

## Token efficiency (important — owner watches usage)
- **Read only the methodology/checklist sections needed for the task.** Same for this file.
- **Don't re-read files you just wrote.** Trust your own edits; verify with `npm run build`,
  not by dumping file contents.
- **Edit surgically**: change the exact lines needed; never regenerate a whole file to change
  a few lines. Never re-emit unchanged files "for completeness."
- **Don't cat/print large files** (package-lock.json, dist/, node_modules — never open these).
  Use `grep -n` to locate, then read only the relevant range.
- **Terse output**: after a change, report what changed + checklist results in a few lines.
  No summaries of code you just wrote, no restating the plan back.
- **Batch related shell commands** into one call; don't run `npm install` unless
  package.json changed; don't rebuild between edits that will be tested together.
- If a task looks like it needs >~10 file changes, stop and propose a split into
  smaller sessions instead of doing it in one go.

## Commands
```bash
npm run dev       # localhost:4321
npm run build     # must pass before any phase is "done"
npm run preview   # serve dist/ locally
npm run check     # engine + locale + build + production smoke gate
```

## Verification quick refs
- Engine anchors: 2000-01-07 = 甲子일; 1984 = 갑자년; 입춘 2024 ≈ Feb 4 17:2x KST.
- Launch gate: `KASI-CHECKLIST.md` — 20+ KASI 만세력 matches + 5 foreign birthplaces. Not optional.
- i18n smoke test: /ja/ must render with English fallback, /ko/ with Korean; 12 hreflang
  tags per page; language switcher preserves sub-path.

## Current state (update this section as phases complete)
- Phases 0–5 building (85 pages). Learn collection live with 3 en+ko articles (§6.3);
  day-master profile articles still owner-written/pending.
- Reading page: 13 panels incl. 지장간/12운성/신살/대운/세운/월운, 격국, 신강약+희기신,
  조후용신, 태원/명궁, 삼재 (extras in src/lib/saju-extras.ts — engine untouched).
- Done: self-hosted fonts (scripts/fetch-fonts.mjs), favicon/OG/robots, GA4 consent
  analytics, share cards v2 (square+story+Web Share), engine test harness
  (`npm run test:engine`, 6 anchors green).
- Custom-domain cutover complete: `showmethesaju.com` is canonical and Astro builds at `/`.
  GitHub Pages uses a custom Actions workflow, so the repository Pages setting owns the domain and no CNAME file is required.
- Open owner checks: KASI verification (launch gate), About biography/photo, final Smart Store/Kakao deep links, and native-speaker editorial review of all locales.
- Note: article pages hreflang only en+ko (Base `altLocales`), so the "12 hreflang tags"
  smoke test applies to non-article pages.
