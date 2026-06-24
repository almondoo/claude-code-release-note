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

1. **Fetch official info + load existing data** — Pull the change items from the
   CHANGELOG and, in parallel, read the current JSON files to find the latest version
   already present.
   - If the user supplied the change details directly, you may skip the CHANGELOG
     `WebFetch` — but still do the Step 2 cross-check.
2. **Detect the gap + cross-check** — Compare the official info against the current JSON
   and identify the not-yet-added versions.
   - Comparison key: `v` (the version number).
   - Existing data is immutable. Only check whether the newest versions are missing; do
     not edit versions that are already present.
   - If the CHANGELOG alone leaves you unsure, confirm with `AskUserQuestion` rather than
     guessing — CHANGELOG one-liners are easy to misread.
3. **Translate + edit JSON** — Translate the verified gap into Japanese and update the
   files per the schema below.
   - Before editing: run `git diff` to check for uncommitted changes (tell the user if any
     exist — this repo is sometimes edited by parallel sessions).
   - After editing: run `git diff` again to confirm nothing unintended changed.
   - On error: if a JSON syntax error or type error appears, confirm with the user before
     reverting your changes.
4. **Validate + report** — Run the JSON syntax check + `pnpm run typecheck`, then report in
   this format:

```
更新結果:
- 追加: N件（新規追加したバージョン一覧）
- スキップ: N件（既に最新のため変更なし）
```

## Data files

- `app/data/releases/releases-*.json` — Per-version-range release list (split every 10
  versions).
- `app/data/releases/version-details-*.json` — Per-version-range detail entries (split
  every 10 versions).
- `app/data/releases/index.ts` — Imports and merges every file, then re-exports.

## Information sources

### Step 1: Pull change items from the CHANGELOG

```
WebFetch https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
```

Extract the change items from the target version's section. The full CHANGELOG is large,
so pull only the versions you need. This feeds mainly the `t` (one-line summary) field in
`releases-*.json`.

### Step 2: Pull background detail from the Claude Code Docs

```
WebFetch https://code.claude.com/docs/en/overview
```

For each change item, fill in the technical background, usage, and scope from the docs.
This feeds the `detail` field in `version-details-*.json`.

- The CHANGELOG only gives a one-line summary, so consult the docs to write a real
  explanation.
- If the docs have nothing on it, build `detail` from the CHANGELOG plus general technical
  knowledge.
- Identify the official docs page for each item and embed it as an inline link at the end
  of `detail` (see the link syntax below).
- Add a fragment (`#section-name`) to the URL so the link jumps straight to the section.
- If no URL exists or it is unreachable, add no link.

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

1. Cross-checked against the official docs.
2. JSON syntax is valid: `node -e "require('<file-path>')"`.
3. Typecheck passes: `pnpm run typecheck`.
4. The translation reads as natural Japanese.

## Out of scope

- UI / design fixes (those need code changes).
- Re-adding data that already exists correctly.
- Updating pages other than the release notes.
- Release notes for products other than Claude Code.

## Constraints & cautions

- Do not add a version already present in `releases-*.json` (duplicate check is mandatory).
- Always append to the **end** of the array in `releases-*.json` — inserting mid-array breaks
  the display order.
- Make the `t` in `version-details-*.json` match the `t` in `releases-*.json` exactly.
- Keep each JSON file under 50KB; if a file would exceed it, split into the next
  10-version-range file.

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
