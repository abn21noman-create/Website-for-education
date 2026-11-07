# Contributing to Nokkhotro / নক্ষত্রে অবদান

Thank you for helping improve Nokkhotro for HSC students. First-time contributors are welcome. বাংলা বা English—দুই ভাষাতেই issue ও pull request করা যাবে।

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Ways to contribute

- Fix a confirmed bug.
- Improve accessibility, mobile usability, offline behavior, or performance.
- Improve Bengali or English wording and documentation.
- Add tests or make existing checks clearer.
- Propose a focused learning feature or correct educational content with reliable sources.

Look for [`good first issue`](https://github.com/abn21noman-create/Website-for-education/labels/good%20first%20issue) and [`help wanted`](https://github.com/abn21noman-create/Website-for-education/labels/help%20wanted), or open a [feature request](https://github.com/abn21noman-create/Website-for-education/issues/new/choose) to agree on scope before a large change.

## Before you start

1. Search existing issues to avoid duplicate work.
2. Open an issue for substantial UI, data-model, dependency, or architecture changes.
3. Keep each pull request focused on one problem.
4. Do not add copyrighted exam questions, books, images, or other content unless the project can legally redistribute them. Include reliable sources for factual educational or admission information.

Small typo, documentation, and clearly scoped test fixes can go directly to a pull request.

## Local setup

### Requirements

- [Node.js](https://nodejs.org/) 22 or newer
- npm 10 or newer
- Git

### Run the app

```bash
git clone https://github.com/YOUR-USERNAME/Website-for-education.git
cd Website-for-education
npm ci
npm run dev
```

Then open `http://localhost:5173`.

The core student experience is local-first and can be tested while signed out. For authentication, cloud sync, Admin, or database work, create your own Supabase project and configure a local environment file:

```bash
cp .env.example .env.local
```

Replace both values with your **own development Supabase project** values. Follow [`supabase/README.md`](supabase/README.md) for migrations and backend checks.

> Never run development migrations, destructive SQL, synthetic writes, or test accounts against the production Supabase project. Never commit service-role keys, passwords, tokens, `.env.local`, or real student data. The browser-facing anon key is not a substitute for Row Level Security.

## Development workflow

1. Fork the repository on GitHub.
2. Create a descriptive branch in your fork, for example:

   ```bash
   git checkout -b fix/analytics-keyboard-focus
   ```

3. Make the smallest complete change that solves the issue.
4. Add or update tests and documentation when behavior changes.
5. Run the full validation suite:

   ```bash
   npm run smoke
   git diff --check
   ```

6. Push your fork and open a pull request against `main`.

Useful commands:

```bash
npm run dev         # Vite development server
npm run build       # TypeScript check and production build
npm run smoke       # Build, source checks, regressions, and production boot
npm run prod-check  # Boot-check an existing production build
```

## Project expectations

### Student privacy and security

- Use synthetic data only; never include names, emails, credentials, or identifiable student records in tests, screenshots, logs, or issues.
- Preserve account isolation and least-privilege RLS for all Supabase changes.
- Do not expose individual survey responses, private study data, admin membership, or internal identifiers.
- Report vulnerabilities privately according to [`SECURITY.md`](SECURITY.md), not in a public issue.

### Accessibility and interface quality

- Support keyboard navigation and visible focus.
- Keep interactive targets at least 44×44 CSS pixels where practical.
- Preserve responsive mobile layouts, readable contrast, reduced-motion preferences, and screen-reader names/statuses.
- Update both Bengali and English copy when the affected interface is bilingual.
- Avoid dark patterns, forced sharing, misleading rankings, and unnecessary collection of data.

### Local-first and offline behavior

- A temporary network failure must not silently lose a learner's work.
- Keep stored-data changes backward compatible or provide a safe migration.
- Include new student-owned local keys in Cloud Vault/portable backup behavior when applicable.
- Test signed-out, signed-in, offline, and reconnect states for persistence changes.

### Database changes

- Add a new, forward-only SQL file under `supabase/migrations/`; do not rewrite an already-applied migration.
- Enable RLS and define explicit policies for every user-owned table.
- Avoid destructive changes and document rollout/verification steps in `supabase/README.md`.
- Test against your own Supabase project. Maintainers apply approved migrations to production after review.

## Pull-request review

A maintainer will review correctness, scope, privacy, accessibility, offline behavior, and CI results. You may be asked for changes. Approval is not guaranteed, but respectful feedback and iteration are welcome.

By submitting a contribution, you agree that it is your original work (or appropriately licensed) and that it may be distributed under this repository's [MIT License](LICENSE).
