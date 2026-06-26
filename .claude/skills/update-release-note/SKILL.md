---
name: update-release-note
description: >
  Fetches the latest Claude Code release information from the official CHANGELOG,
  cross-checks it against the official docs, and updates this repository's
  Japanese release-note JSON data. Use this whenever the user wants to add a new
  Claude Code version to the release notes, sync the site with the upstream
  CHANGELOG, or otherwise touch the release-note data — including phrasings like
  "リリースノートに追加", "add version", "update release note", "バージョン追加",
  "CHANGELOG 更新", "新バージョン追加", "リリースノート更新", or "update-release-note" —
  even when the user does not name the skill explicitly.
user-invocable: true
---

# Update Release Note

Pull the newest release entries from Claude Code's official CHANGELOG, verify them
against the official docs, translate them into natural Japanese, and append them to
the release-note JSON data in this repository.

## Language convention (read this first)

This skill's *instructions* are written in English, but the *data it produces stays
Japanese*. The site is a Japanese-language reader for Claude Code release notes, so
every value written into the JSON — `t` summaries, `detail` / `content` prose, and the
Japanese link labels — must be Japanese.

Crucially, some tokens are **literal data values, not prose, and must never be
translated**:

- Tag values (`新機能`, `バグ修正`, `SDK`, `MCP`, …)
- `category` values (`コマンド`, `パーミッション`, …)
- The Japanese column of the change-type prefix table (`修正:`, `追加:`, …)

These exact strings are consumed by the data files and by the UI code in
`app/components/badge.tsx` and `app/routes/release-note/constants.tsx`. Translating
`新機能` to "New feature" would write an unrecognized tag into the JSON and break badge
rendering and tag filtering. When in doubt: translate *sentences*, preserve *identifiers*.

## Workflow checklist

**At the start**, turn the four steps below into tasks with `TaskCreate`, then work them
one at a time from Step 1, marking each `completed` with `TaskUpdate` as you finish it.
Tracking the steps keeps the verification (`git diff`, typecheck) from being skipped under
time pressure.

This skill is **subagent-driven for information gathering**: fetching the CHANGELOG and
researching the docs are large, read-only, parallelizable jobs that would otherwise flood
your context, so they go to subagents. You keep the *integration* work — deciding the gap,
translating, choosing tags, and editing the JSON. See "Subagent delegation" below for the
division of labor and the exact dispatch prompts.

1. **Gather official info + existing data (subagents, in parallel)** — In one turn, dispatch
   the CHANGELOG-fetch subagent and the existing-data subagent together (they have no
   dependency). The first returns the recent change items as structured data; the second
   returns the latest version already present. See "Fetch the CHANGELOG + existing data"
   under "Information sources".
   - If the user supplied the change details directly, you may skip the CHANGELOG subagent —
     but still run the docs-research subagent in Step 3 for the cross-check.
2. **Detect the gap (main)** — Compare the returned change items against the latest present
   version and identify the not-yet-added versions. This is an integration judgment, so do
   it yourself rather than delegating.
   - Comparison key: `v` (the version number).
   - Existing data is immutable. Only check whether the newest versions are missing; do
     not edit versions that are already present.
   - If the CHANGELOG alone leaves you unsure, confirm with `AskUserQuestion` rather than
     guessing — CHANGELOG one-liners are easy to misread.
   - If there is no gap (every recent version is already present), skip Step 3 entirely and go
     straight to the all-skipped report in Step 4 — don't dispatch docs-research subagents for
     zero versions.
3. **Research docs + translate + edit JSON** — Dispatch one docs-research subagent per gap
   version (in parallel) to gather the `detail` background, **cross-check each CHANGELOG line
   against the docs**, and verify doc URLs (see "Research background detail from the docs"
   under "Information sources"). Then, on main, reconcile any discrepancy the subagent flagged
   in `cross_check` (the CHANGELOG one-liner is not authoritative — fix the summary if the
   docs say otherwise), translate into Japanese, choose tags / `category`, and edit the files
   per the schema below.
   - If the new versions fall outside the newest existing range file (each file covers 10
     versions — e.g. `releases-2.1.18x.json` = 180–189), first create the new
     `releases-2.1.Nx.json` + `version-details-2.1.Nx.json` and add their imports to `index.ts`
     (see "index.ts rule"), then write the data. Otherwise append to the existing range files.
   - Before editing: run `git diff` to check for uncommitted changes (tell the user if any
     exist — this repo is sometimes edited by parallel sessions).
   - After editing: run `git diff` again to confirm nothing unintended changed.
   - On error: if a JSON syntax error or type error appears, confirm with the user before
     reverting your changes.
4. **Validate + report** — Run the JSON syntax check, then run `pnpm run typecheck` in the
   background or via a `test-verifier` subagent (it takes ≥10s, so don't block on it).
   Optionally dispatch a reviewer subagent to check the diff with a fresh lens (see
   "Subagent delegation"). Then report in this format:

```
更新結果:
- 追加: N件（新規追加したバージョン一覧）
- スキップ: N件（既に最新のため変更なし）
```

## Subagent delegation

The fetch/research work is large, read-only, and parallelizable — exactly what subagents
are good at — while the decisions that need full context stay with you on the main thread.

| Step | Work | Who | Why |
|------|------|-----|-----|
| 1 | Fetch CHANGELOG + extract change items | subagent (`Explore`) | The full CHANGELOG floods context; return structured data instead |
| 1 | Find the latest version already present | subagent (`Explore`) | A multi-file read; you only need the version number back |
| 2 | Detect the gap (which versions are missing) | **main** | Integration judgment over the two returns |
| 3 | Per-version docs background + URL verification | subagent (`docs-researcher`), one per version, in parallel | Read-only research; parallelizes across versions; verifying URLs in the subagent keeps dead links out |
| 3 | Translate, choose tags / `category`, edit JSON | **main** | Literal tag/`category` values and the exact `t` match across two files are integration decisions — easy to get wrong if delegated |
| 3 | `git diff` safety gate (before/after editing) | **main** | You need to see uncommitted changes directly |
| 4 | `pnpm run typecheck` validation | background / `test-verifier` subagent | Takes ≥10s; don't block the main thread |
| 4 | Final diff review (optional) | reviewer subagent | A fresh lens catches tag mis-classification and `t` mismatches |

**Agent types**: this repo has no custom `.claude/agents/`, so use broadly-available types —
`Explore` (read-only, has `WebFetch`) — or `docs-researcher`, which also has `WebFetch` — for
the CHANGELOG fetch and existing-data reads, `docs-researcher` for docs lookup (fall back to
`Explore` / `general-purpose` if it isn't registered), and any reviewer agent for the optional
final check.

**Make subagents return data, not prose.** Each dispatch prompt below specifies a JSON
return shape — insist on it, because you compute and translate from these returns and loose
prose forces re-work. Run independent dispatches in the **same turn** so they execute
concurrently (CHANGELOG + existing-data together; then all per-version docs subagents
together).

**Caveat**: if the `Agent` tool isn't available — e.g. this skill is running inside a
subagent, which typically can't spawn further subagents — fall back to doing the
fetch/research inline with `WebFetch`. The rest of the workflow is unchanged.

## Data files

- `app/data/releases/releases-*.json` — Per-version-range release list (split every 10
  versions).
- `app/data/releases/version-details-*.json` — Per-version-range detail entries (split
  every 10 versions).
- `app/data/releases/index.ts` — Imports and merges every file, then re-exports.

## Information sources

### Fetch the CHANGELOG + existing data (subagents, in parallel)

Don't `WebFetch` the CHANGELOG yourself — the full file is large and pollutes your context.
Dispatch a read-only subagent (the built-in `Explore` agent works; it has `WebFetch`) and
have it return only the structured change items. In the **same turn**, dispatch a second
subagent to read the existing data, since the two are independent. You compute the gap from
their two returns yourself (the Detect step of the workflow).

**CHANGELOG-fetch subagent** (label e.g. `fetch-changelog`):

> With `WebFetch`, get the **raw** CHANGELOG at
> `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` — use the raw
> URL, not the `github.com/.../blob/...` page: raw returns clean Markdown, while the blob page
> returns HTML chrome that is harder to parse reliably. Extract every change item for the
> **most recent ~15 versions** (newest first). The file is large — return data, not prose, and
> do not translate or drop any item. For each version return JSON:
> `{ "v": "X.Y.Z", "items": [{ "en": "<verbatim CHANGELOG line>", "area_hint": "<SDK|MCP|IDE|Windows|... or empty>" }] }`.

**Existing-data subagent** (label e.g. `read-existing`):

> In `app/data/releases/`, list the `releases-2.1.*.json` files and pick the newest range
> **numerically** — parse the digits before the `x` in each filename and take the largest.
> (Plain alphabetical sort is wrong: `releases-2.1.9x.json` sorts after `releases-2.1.18x.json`,
> but `18x` (180–189) is the newer range.) Read that file, look at the **end** of its array,
> and return JSON:
> `{ "latest_version": "X.Y.Z", "release_file": "releases-2.1.Nx.json", "detail_file": "version-details-2.1.Nx.json" }`.

This feeds mainly the `t` (one-line summary) field in `releases-*.json`. Filter the
CHANGELOG return down to versions newer than `latest_version` to get the gap.

### Research background detail from the docs (one subagent per version, in parallel)

Once you know the gap versions, dispatch **one docs-research subagent per version** in a
single turn so they run in parallel (one subagent even if there's only one version; if there
are many, dispatch them all together). Inline that version's items (each `en` + `area_hint`)
into the prompt as a JSON array — include all of them, even 10+. Use the `docs-researcher`
agent if available (it's tuned for authoritative docs lookup); otherwise `Explore` or
`general-purpose` work. Each
subagent does three jobs: fills in the technical background for that version's items,
**cross-checks each CHANGELOG line against the docs** (the one-liners are AI-written and can
misstate the change — this is the fact-check that keeps wrong summaries out of the release
notes), and **verifies the doc URLs so you never embed a dead link**.

**Docs-research subagent** (label e.g. `docs:2.1.84`):

> For Claude Code version `<v>`, here are the change items: `<items with en text + area_hint>`.
> For each item, research the official docs (start at
> `https://code.claude.com/docs/en/overview` and the relevant section) and return JSON per
> item: `{ "en": "<original line>", "background": "<2-4 sentences: what the problem was, what changed, the user benefit, the technical background>", "doc_url": "<verified https://code.claude.com/docs/en/...#fragment, or empty>", "cross_check": "<'matches' if the docs confirm the line; otherwise a short note on what the one-liner gets wrong, omits, or overstates>", "category_hint": "<suggested Japanese category or empty>" }`.
> **Cross-check the line against the docs.** The CHANGELOG one-liner is AI-written and can be
> inaccurate. Confirm the docs describe the same change; if they contradict it, materially
> refine it, or omit part of it, describe the gap in `cross_check` (otherwise set `matches`).
> If the docs say nothing about the item, set `cross_check` to `not in docs` — don't treat
> silence as confirmation.
> **Verify each `doc_url` by actually fetching it** — confirm the page resolves and the
> `#fragment` matches a real heading. If you can't verify a URL, return an empty `doc_url`
> rather than guessing. Use only the `https://code.claude.com/docs/en/` URL form.
> A doc link is worth finding for: new CLI commands/subcommands, new settings/env vars, new
> hooks events, MCP/plugin configuration, permission/security-model changes, and new
> platform support. For pure internal bug fixes, performance/memory fixes, and
> rendering/display fixes there is usually no useful page — return an empty `doc_url`.
> Likely pages: `/cli-usage`, `/hooks`, `/mcp`, `/settings`, `/security`, `/plugins`,
> `/discover-plugins`, `/ide-integrations`, `/overview`.

(This guidance is inlined into the dispatch prompt on purpose — the subagent never receives
the rest of this SKILL.md, so a "see the section below" reference would be a dead link to
it. The final call on whether to embed a link still happens on main, per the "Documentation
link rules" and "Official docs URL reference" sections below.)

The returns feed the `detail` field in `version-details-*.json`. You still own the final
Japanese prose, the `category` choice, and which link (if any) to embed — the subagent gives
you verified raw material, not the finished `detail`. **Act on each `cross_check`:**

- `matches` → translate the CHANGELOG line into the Japanese `t` as-is.
- a discrepancy note (the line contradicts the docs, overstates, or omits something) → trust
  the docs: write `t` to reflect what the docs actually say, not the wrong one-liner, and
  spell out the correct behavior in `detail`.
- `not in docs` → the docs are silent, so the CHANGELOG line is your only source; translate it
  as-is with no doc link, and if the claim looks doubtful, confirm with `AskUserQuestion`
  rather than guessing.

Treat `area_hint` (from the CHANGELOG-fetch return) and `category_hint` as *advisory* inputs
to your tag / `category` decision — weigh them against the Tags and category sections below;
don't adopt them blindly.

- The CHANGELOG only gives a one-line summary, so the subagent's `background` is what lets
  you write a real explanation instead of paraphrasing the CHANGELOG.
- If the docs have nothing on an item, the subagent returns an empty `doc_url`; build
  `detail` from the CHANGELOG line plus general technical knowledge, with no link.

## Data schema

### releases-*.json

Append to the **end** of the array in the matching version-range file (e.g.
`releases-2.1.8x.json`):

```json
{
  "v": "X.Y.Z",
  "items": [{ "t": "日本語の変更要約（1行）", "tags": ["タグ1", "タグ2"] }]
}
```

### version-details-*.json

Add a key to the object in the matching version-range file (e.g.
`version-details-2.1.8x.json`):

```json
"X.Y.Z": [
  {
    "t": "releases-*.json の t と同一",
    "tags": ["タグ1", "タグ2"],
    "detail": "技術的背景・影響範囲・ユーザーメリットを含む詳細解説。詳しくは[公式ドキュメント](https://code.claude.com/docs/en/hooks#worktreecreate)を参照してください。",
    "category": "分類カテゴリ"
  }
]
```

Inside `detail` you can use Markdown inline-link syntax `[ラベル](URL#fragment)`; it renders
as a cyan underlined link.

### Worked example

One CHANGELOG line → both files. Note the `追加:` prefix, the literal `新機能` tag, the `t`
values matching exactly, the inline doc link, and the Japanese `category`.

**Input (CHANGELOG):**
```
Added `/usage` command to view your current usage limits
```

**Output — releases-2.1.8x.json (appended at the end):**
```json
{
  "v": "2.1.84",
  "items": [{ "t": "追加: 現在の利用上限を確認できる /usage コマンドを追加", "tags": ["新機能"] }]
}
```

**Output — version-details-2.1.8x.json:**
```json
"2.1.84": [
  {
    "t": "追加: 現在の利用上限を確認できる /usage コマンドを追加",
    "tags": ["新機能"],
    "detail": "これまで利用状況の上限はコマンドから確認できなかった。\n\n本バージョンで /usage コマンドが追加され、現在の利用上限と残量をその場で確認できるようになった。詳しくは[CLI リファレンス](https://code.claude.com/docs/en/cli-usage#cli-commands)を参照してください。",
    "category": "コマンド"
  }
]
```

## Tags (13 total)

These tag strings are literal values — keep them exactly as written. One item may carry
multiple tags.

**Change type (4):**

| Tag | Use for |
|------|------|
| `新機能` | Adding a new feature |
| `バグ修正` | Fixing a bug |
| `改善` | Improving / changing an existing feature |
| `非推奨` | Deprecation / removal |

**Target area (9):**

| Tag | Use for |
|------|------|
| `SDK` | Claude Agent SDK related |
| `IDE` | VS Code extension related |
| `Platform` | Bedrock / Vertex and other platform related |
| `Windows` | Windows-specific changes |
| `Security` | Security related |
| `Perf` | Performance improvements |
| `Plugin` | Plugin related |
| `MCP` | MCP related |
| `Agent` | Agent / multi-agent related |

## category examples

Pick a Japanese category string. Existing values include:

`IDE`, `入力`, `パーミッション`, `レンダリング`, `セキュリティ`, `パフォーマンス`, `コマンド`, `UX`, `API`, `セッション管理`, `SDK`, `サンドボックス`, `設定`, `ツール改善`, `MCP 連携`, `Git 連携`, `プラットフォーム互換性`, `国際化`, `安定性`, `マルチエージェント`, `エージェント設定`, `メモリ`, `会話管理`, `ネットワーク`

## Documentation link rules

The goal is to link when a reader, after finishing `detail`, would want to know "how do I
actually use / configure this?"

**Add a link for:**

- A new CLI command / subcommand (e.g. `claude auth login` → CLI reference)
- A new setting / environment variable (e.g. `CLAUDE_CODE_SIMPLE` → settings env-var section)
- A new hooks event or behavior change (e.g. `WorktreeCreate` → the relevant hooks section)
- MCP / plugin configuration or new capability (e.g. MCP connector support → MCP settings)
- Permission / security-model changes (e.g. permission-classifier improvements → security docs)
- New platform support (e.g. Windows ARM64 → install instructions)

**Do not add a link for:**

- Internal bug fixes that need no extra setup or action from the user
- Performance optimizations / memory-leak fixes
- Rendering / display fixes
- Changes that map to no specific docs page or section
- Anything whose docs URL does not exist or is unreachable

## Official docs URL reference

Base URL: `https://code.claude.com/docs/en`

| Area | Path | Common fragments |
|---|---|---|
| Overview / install | `/overview` | `#get-started` |
| CLI reference | `/cli-usage` | `#cli-commands`, `#cli-flags` |
| Hooks | `/hooks` | `#hook-events`, `#sessionstart`, `#pretooluse`, `#posttooluse`, `#stop`, `#worktreecreate`, `#configchange`, `#exit-code-output` |
| MCP | `/mcp` | `#installing-mcp-servers`, `#use-mcp-servers-from-claudeai`, `#managed-mcp-configuration` |
| Settings | `/settings` | `#environment-variables`, `#permission-settings`, `#plugin-settings` |
| Security | `/security` | `#permission-based-architecture`, `#mcp-security` |
| IDE integrations | `/ide-integrations` | -- |
| Plugins (authoring) | `/plugins` | `#share-your-plugins`, `#quickstart` |
| Plugins (using) | `/discover-plugins` | `#install-plugins`, `#manage-installed-plugins` |

> Verify each URL when you use it; do not add a link for an invalid URL. Derive fragments
> from the docs page headings (lowercase the heading text and join words with hyphens).

## Translation rules

- Translate into natural Japanese — readable phrasing, not a literal word-for-word rendering.
- Keep technical terms and proper nouns as-is: OAuth, MCP, CLI, SDK, API, PR, vim, bash, etc.
- Split the `detail` / `content` fields into paragraphs with `\n\n` (the `ParagraphList`
  component splits on `\n\n`; a lone `\n` collapses to a space inside a `<p>` and produces no
  line break).
- In `detail`, use Markdown inline-link syntax `[ラベル](URL#fragment)`; embed a link when a
  matching official docs page exists.
- Normalize every URL to the `https://code.claude.com/docs/en/` form (do not use the old
  `https://docs.anthropic.com/en/docs/claude-code/` form).

Change-type prefixes — the Japanese side is the literal text that goes into `t`:

| English | Japanese |
|------|--------|
| `Fixed` | `修正:` |
| `Added` | `追加:` |
| `Improved` | `改善:` |
| `Changed` | `変更:` |
| `Removed` | `削除:` |

- Keep `t` to a single concise line.
- In `detail`, cover: what the problem was, what changed, the user benefit, and the technical
  background.
- Write the doc-link label in Japanese (e.g. 「公式ドキュメント」「hooks のドキュメント」
  「CLI リファレンス」「セキュリティドキュメント」).

## index.ts rule

If you create a new 10-version-range file (e.g. v2.1.90+ → `releases-2.1.9x.json` +
`version-details-2.1.9x.json`), add the import to `app/data/releases/index.ts`. For a version
that fits an existing 10-version range, `index.ts` needs no change. (Do **not** add imports to
`constants.tsx` — that is a common mix-up; the import target is `index.ts`.)

## Validation checklist

1. Cross-checked against the official docs — the docs-research subagent fact-checked each
   CHANGELOG line (its `cross_check` field). Confirm you reconciled every flagged discrepancy
   and didn't write a summary the docs contradict; spot-check anything that looks off, since
   you own the final `detail`.
2. JSON syntax is valid: run `node -e "require('<file-path>')"` on **every JSON file you
   edited** — the `releases-*.json` and the `version-details-*.json` (and a new range file if
   you added one). (`index.ts` is TypeScript, so the typecheck below covers it.)
3. Typecheck passes: `pnpm run typecheck` — run it in the background or via a
   `test-verifier` subagent so it doesn't block you (it takes ≥10s).
4. The translation reads as natural Japanese.
5. (Optional) A reviewer subagent checked the diff for tag / `category` errors and `t`
   mismatches between the two files.

## Out of scope

- UI / design fixes (those need code changes).
- Re-adding data that already exists correctly.
- Updating pages other than the release notes.
- Release notes for products other than Claude Code.

## Constraints & cautions

- Do not add a version already present in `releases-*.json` — duplicates render as repeated
  cards in the UI.
- Always append to the **end** of the array in `releases-*.json` — the list renders in array
  order, so a mid-array insert reorders the displayed history.
- Make the `t` in `version-details-*.json` match the `t` in `releases-*.json` exactly — the
  card reads from `releases-*.json` and the detail modal reads from `version-details-*.json`,
  so a mismatch shows two different summaries for the same entry.
- Keep each JSON file under 50KB; if a file would exceed it, split into the next
  10-version-range file (and add its import to `index.ts`) — oversized data files bloat the
  bundle and are harder to edit safely.

## Common mistakes

| Mistake | Fix |
|------|------|
| Trusting the CHANGELOG's AI summary verbatim | Always cross-check against the official docs |
| Separating paragraphs with `\n` | Use `\n\n` (that is what `ParagraphList` splits on) |
| Adding info that is not in the official docs | Do not guess; when unsure, use `AskUserQuestion` |
| Using the old URL form | Normalize to `https://code.claude.com/docs/en/` |
| Inserting mid-array | Always append to the **end** of `releases-*.json`; mid-array insert breaks display order |
| Missing or mis-classifying a tag | Multiple tags per item are fine; re-check the tag list when unsure |
| Overlooking a CHANGELOG item | Count every item in the version section to confirm |
| `t` and the detail `t` disagree | Make `version-details-*.json`'s `t` match `releases-*.json`'s `t` exactly |
| Re-adding an existing version | Always confirm the latest version at the end of `releases-*.json` before adding |
| `detail` copies the CHANGELOG verbatim | Enrich with background from the docs and spell out the user benefit |
| Adding the import to `constants.tsx` | The import target is `app/data/releases/index.ts` |
| Translating a tag / category value | Tag and `category` strings are literal data — keep them in Japanese |
| Letting a fetch / research subagent return prose | Demand the JSON return shape in the dispatch prompt; you translate and decide `category` / links on main |
| `WebFetch`-ing the CHANGELOG on the main thread when subagents are available | Delegate it to a subagent (see "Subagent delegation") so the large file doesn't flood your context; only fall back to inline `WebFetch` when you can't spawn subagents |
