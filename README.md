# EnglEuphoria

**Live, story-led English lessons for children, taught one to one, with AI used where it helps and humans where it matters.**

Founder: Fatima Zahra Djaanine · founder@engleuphoria.com · [www.engleuphoria.com](https://www.engleuphoria.com)

> This repository is an **evaluation showcase**. The full production code, lesson content and artwork are private. Everything here is representative of how the real platform is built and the standards it follows. A live demo of the full product is available on request.

---

## The problem

Children learning English online usually get one of two things: a game with no teacher, or a video call with no structure. Families in many regions also struggle to find lessons in their own language, at fair prices, with a safe place for the child.

## What EnglEuphoria does

- **Live, one-to-one lessons** with a real teacher, built around a story world with a small cast of friendly characters.
- **A complete curriculum**, from first words (Pre-A1) to upper B2, with the same speaking-first method at every level.
- **Three spaces in one platform:** child, parent and teacher, each with its own simple screen.
- **Three languages for families:** Arabic, French and English.
- **Safe by design:** parent-managed child profiles, calm content, no public rankings, no pressure.

## Live demo

The platform is deployed and public: **https://www.engleuphoria.com**

Lessons and dashboards need a signed-in account. A ready-to-use **test account** for judges (child, parent and teacher views) is supplied in the competition submission form, so no credentials are stored in this repository.

## Run it locally

The full application is a private codebase, so this repository does not build on its own. For reference, this is how the real app runs:

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Supabase (accounts, database, realtime, server functions).

```bash
npm install
npm run dev        # http://localhost:8080
npm test           # unit tests
```

The app needs a few private environment values (a backend URL and a public client key) in a local `.env` file. These are not published. Access to the full source can be arranged with the founder under an agreement: founder@engleuphoria.com.

## Who built what

| Part | Built by |
|---|---|
| Product idea, curriculum and lesson design, teaching method | Fatima Zahra Djaanine |
| Web app: child, parent, teacher spaces and live classroom | Fatima Zahra Djaanine, working with an AI coding assistant (Claude Code) |
| Content: story worlds, voices, pictures | Fatima Zahra Djaanine, using AI generation tools, with every item reviewed and approved by hand |
| Quality rules, child-safety checks, testing | Fatima Zahra Djaanine |

EnglEuphoria is a solo-founder project. AI tools speed up the work; every design decision and release is made and checked by the founder.

## Screens

| | |
|---|---|
| ![Live classroom](docs/screenshots/live-classroom.jpg) | ![Child home](docs/screenshots/child-home.jpg) |
| Live classroom: video, shared lesson screen, chat, teacher tools | Child home: a learning map with one clear next step |
| ![Parent dashboard](docs/screenshots/parent-dashboard.jpg) | ![Lesson title](docs/screenshots/lesson-title.jpg) |
| Parent dashboard: several children, each with their own profile | A lesson opens in a story world |
| ![Place and speak](docs/screenshots/lesson-place-and-speak.jpg) | ![Match and sort](docs/screenshots/lesson-match.jpg) |
| Place a character, then say where he is | Match and sort activity |

Student names are not shown in any screenshot.

## Where AI is used

AI is a tool in the content pipeline and the learning experience, never a replacement for the teacher.

| Area | How AI helps | Human control |
|---|---|---|
| **Voices** | Natural recorded character voices are generated ahead of time, so every child hears the same clear model | Each voice and line is checked for accent and pronunciation before release |
| **Lesson creation** | AI assists with drafting activities and pictures inside a fixed lesson design | Every lesson passes a written quality checklist before children see it |
| **Learner help** | A rule-based help assistant answers parent and student questions in five languages | Answers come from a reviewed guide |
| **Safety** | Automatic checks reject content that breaks child-safety rules | Rules are written by the founder, a teacher |

**Principles we hold ourselves to**
1. **No live voice dependency.** Lesson audio is pre-generated and cached, so lessons work reliably and cost little.
2. **One voice standard.** Every voice a child hears is a standard native English voice saying each word correctly. A guard blocks any device voice from being used.
3. **Child-safe media.** Generated pictures and video follow a written gate: a brief, an automatic lint, owner approval, then one test item before anything more is made.
4. **Comfort first.** The student must always see and reach everything on screen. Screens are tested in a real browser.

## Architecture (high level)

See [docs/architecture.md](docs/architecture.md).

## Code samples

Two short, self-contained files show the style and care behind the platform:

- [`code-samples/noBrowserVoice.ts`](code-samples/noBrowserVoice.ts): a startup guard that reroutes any device text-to-speech call to the platform's recorded voices, so no child ever hears a wrong accent.
- [`code-samples/DialoguePlate.tsx`](code-samples/DialoguePlate.tsx): the accessible, theme-aware dialogue component used across story lessons.

They are excerpts: some imports point to private modules, so they will not build on their own.

## Status

- **Pre-A1:** 72 lessons in 10 units, built on the same unit structure used across the course.
- **Launched** in October 2026.

## What is not in this repository

Lesson content, characters and artwork, voice and audio files, the full database design, prompts and the complete source code are private. This is intentional.

## License and use

Copyright © EnglEuphoria. **All rights reserved.** This repository is shared for evaluation only. You may read it for that purpose. You may not copy, modify, redistribute or use any part of it commercially without written permission. See [LICENSE](LICENSE).
