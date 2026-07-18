# OpenAI Hackathon submission checklist

Use this as the final, evidence-based pass before clicking Submit. Items that depend on YouTube, Devpost, repository access, or team invitations must be confirmed manually.

## Required submission items

- [ ] The demo video is public or unlisted on YouTube, under three minutes, and the exact URL opens in a signed-out/private browser window.
- [ ] The voiceover clearly shows what was built, how Codex was used, and how GPT-5.6 was used.
- [ ] A Codex `/feedback` Session ID—not a Git commit SHA, GitHub Actions run ID, or chat URL—is entered in the form.
- [ ] The private repository has been shared with the exact Devpost and OpenAI accounts listed in the competition instructions.
- [x] The README contains setup instructions, a judge testing path, project architecture, and a truthful Codex/GPT-5.6 explanation.
- [ ] If the submission category treats this project as a developer tool or plugin, add explicit installation and judge test instructions to the form. This repository is currently a web application, not a Codex plugin.
- [ ] Every team member is listed and has accepted the invitation.
- [ ] A category has been selected.
- [ ] The submission is submitted, not left as a draft.

## Retrieve the Codex Session ID

1. Return to the Codex conversation used to build and review this project.
2. Enter `/feedback`.
3. Choose the option to share the existing session and include the requested session context/logs.
4. Submit the feedback dialog.
5. Copy the Session ID returned after submission into the hackathon form.

The Session ID must be retrieved by the account owner from Codex; repository code cannot generate or recover it. Official command reference: https://learn.chatgpt.com/docs/developer-commands.md?surface=ide

## Suggested form copy

**Project name:** Show Me the Saju (쇼미더사주)

**One-line description:** A privacy-first, multilingual Four Pillars experience that turns complex Manseryeok calculations into clear, traceable, interactive readings in the browser.

**What makes it useful:** Traditional Saju apps often expose dense tables without explaining where a result came from. This project keeps the full technical chart while organizing it into nine approachable themes and linking every summary back to supporting calculations.

**How OpenAI tools were used:** Codex and GPT-5.6 were used as the engineering and review partner for deployment debugging, TypeScript calculation logic, UI/UX redesign, multilingual consistency, privacy-safe analytics, regression tests, and documentation. The shipped site is deterministic and does not invoke an OpenAI model at runtime.

## Final evidence pass

```bash
npm ci
npm run check
```

- [ ] The live URL loads from a signed-out/private browser window.
- [ ] The demo follows the same path described in the README.
- [ ] `npm run check` passes on the exact submitted commit.
- [ ] The GitHub Actions Pages deployment is green for that commit.
- [ ] The video description includes the project URL and repository link if competition rules allow it.
- [ ] No draft placeholders, secrets, private birth examples, or unsupported accuracy claims appear in the form or video.

## Values to paste only after manual confirmation

- YouTube URL: `TODO`
- Codex Session ID: `TODO`
- Submission category: `TODO`
- Submitted commit SHA: `TODO`
- Team members accepted: `TODO`
- Devpost/OpenAI repository access confirmed: `TODO`
