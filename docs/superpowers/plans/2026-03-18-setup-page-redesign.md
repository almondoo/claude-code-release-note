# Setup ページ再設計 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存の Setup ページを 3 フェーズ構成（導入・活用・カスタマイズ）に再編し、非エンジニアでも導入できるよう全コンテンツを最新化する

**Architecture:** 10 個の JSON データファイル（うち 3 新規、7 更新）+ 3 UI ファイル更新。JSON は `phase`/`order` フィールドを追加し、UI はフェーズグループ見出し・Phase タブを追加。旧 5 ファイル削除。

**Tech Stack:** React Router v7, TypeScript, Tailwind CSS v4, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-18-setup-page-redesign-design.md`

**制約:**
- **Git 操作は全実装完了後に最後にまとめて行う**（途中コミット禁止）
- **agent-teams スキルを使い teammate を並列スポーンさせること**
- テストフレームワーク未導入のため TDD は不可。typecheck + build で検証

---

## ファイル構成

### 新規作成
- `app/data/setup/setup-intro.json` — Phase 1: はじめに
- `app/data/setup/setup-authentication.json` — Phase 1: 認証と初回起動
- `app/data/setup/setup-customization.json` — Phase 3: カスタマイズ概要

### 更新
- `app/data/setup/setup-installation.json` — Phase 1: インストール
- `app/data/setup/setup-first-steps.json` — Phase 1: まずは使ってみる
- `app/data/setup/setup-claude-md.json` — Phase 2: CLAUDE.md
- `app/data/setup/setup-ide.json` — Phase 2: IDE 連携
- `app/data/setup/setup-tips.json` — Phase 2: 便利な使い方
- `app/data/setup/setup-permissions.json` — Phase 2: 権限と安全性
- `app/data/setup/setup-troubleshooting.json` — Phase 3: トラブルシューティング
- `app/data/setup/index.ts` — インポート更新
- `app/routes/setup/constants.tsx` — 型定義・フェーズ定義・色・タブ
- `app/routes/setup/section-icons.tsx` — アイコン追加・削除
- `app/routes/setup/index.tsx` — フェーズ見出し・タブ・ヘッダー

### 削除
- `app/data/setup/setup-initial-setup.json`
- `app/data/setup/setup-skills.json`
- `app/data/setup/setup-mcp.json`
- `app/data/setup/setup-hooks.json`
- `app/data/setup/setup-best-practices.json`

---

## Phase A: JSON データファイル作成（並列実行可能）

以下の Task 1〜10 は互いに依存しないため **agent-teams で並列実行** すること。

各 JSON ファイルは以下のスキーマに従う:

```json
{
  "id": "セクションID",
  "name": "セクション名",
  "description": "セクションの説明",
  "phase": 1,
  "order": 1,
  "steps": [
    {
      "id": "ステップID",
      "title": "ステップタイトル",
      "description": "ステップの短い説明",
      "content": "詳細な説明（\\n\\n で段落区切り）",
      "code": [
        {
          "lang": "bash",
          "label": "コードブロックのラベル",
          "value": "コマンドやコード",
          "recommended": true
        }
      ],
      "callouts": [
        {
          "type": "tip|info|warning|important",
          "text": "補足情報"
        }
      ],
      "tags": ["必須", "初心者向け"]
    }
  ]
}
```

**タグは既存の 6 種から選択:** `必須`, `初心者向け`, `中級者向け`, `上級者向け`, `チーム向け`, `CI/CD`

**コンテンツのルール（CLAUDE.md より）:**
- サイトは日本語閲覧用のため、説明文・コードブロックのコメントもすべて日本語
- コード構文やファイル名・パス名はそのまま英語
- `content` フィールド内のリストは `\n\n` で区切って 1 項目 1 段落にする

---

### Task 1: setup-intro.json（新規作成）

**Files:**
- Create: `app/data/setup/setup-intro.json`

- [ ] **Step 1: setup-intro.json を作成**

`phase: 1`, `order: 1` で以下 3 ステップを含む:

1. **`what-is-claude-code`**: Claude Code とは
   - AI コーディングアシスタントの概要
   - ターミナル（黒い画面）で動くツール
   - コードの読み書き、バグ修正、質問応答ができる
   - プログラミング経験がなくても使える場面の紹介
   - tags: `["初心者向け"]`

2. **`requirements`**: 必要なもの
   - OS 要件: macOS 13.0+, Windows 10 1809+, Ubuntu 20.04+, Debian 10+, Alpine Linux 3.19+
   - RAM: 4 GB 以上
   - インターネット接続
   - Anthropic アカウント（Claude Pro / Max / Team / Enterprise）
   - 無料プランでは使えないことを明記
   - tags: `["必須", "初心者向け"]`

3. **`terminal-basics`**: ターミナルの基本
   - macOS: Spotlight → "ターミナル" で検索
   - Windows: スタート → "PowerShell" で検索
   - 基本操作: コマンドを入力して Enter、Ctrl+C で中断
   - code: OS 別のターミナル起動方法
   - tags: `["初心者向け"]`

---

### Task 2: setup-installation.json（更新）

**Files:**
- Modify: `app/data/setup/setup-installation.json`

- [ ] **Step 1: setup-installation.json を書き換え**

`phase: 1`, `order: 2` に変更。既存の 1 ステップを以下 3 ステップに拡充:

1. **`install`**: Claude Code をインストールする
   - ネイティブインストール推奨（自動更新）
   - code blocks: macOS/Linux/WSL, Windows PowerShell, Windows CMD, Homebrew, WinGet
   - npm は非推奨であることを callout で明記
   - tags: `["必須", "初心者向け"]`

2. **`windows-notes`**: Windows ユーザー向け補足
   - Git for Windows が必要（git-scm.com からダウンロード）
   - PowerShell と CMD でコマンドが異なる
   - Git Bash が見つからない場合: `CLAUDE_CODE_GIT_BASH_PATH` を設定
   - WSL での利用方法
   - tags: `["初心者向け"]`

3. **`verify-update`**: 確認とアップデート
   - `claude --version` でバージョン確認
   - `claude doctor` で環境診断
   - stable channel の紹介
   - 更新方法: ネイティブ版は自動、Homebrew/WinGet は手動
   - tags: `["必須", "初心者向け"]`

---

### Task 3: setup-authentication.json（新規作成）

**Files:**
- Create: `app/data/setup/setup-authentication.json`

- [ ] **Step 1: setup-authentication.json を作成**

`phase: 1`, `order: 3` で以下 3 ステップ:

1. **`login`**: Claude Code にログインする
   - `claude` コマンド実行 → ブラウザが開く → ログイン
   - ブラウザが開かない場合: `c` キーで URL コピー
   - 認証情報の保存先: macOS は Keychain、Linux/Windows は `~/.claude/.credentials.json`
   - code: `cd your-project && claude`
   - tags: `["必須", "初心者向け"]`

2. **`plans`**: 利用可能なプラン
   - Claude Pro / Max（個人）、Team / Enterprise（企業）
   - Console（API 課金）
   - Bedrock / Vertex AI / Foundry
   - 無料プランでは利用不可
   - tags: `["必須", "初心者向け"]`

3. **`verify-auth`**: 認証の確認
   - `/status` でアカウント情報確認
   - `/login` で再認証
   - `/logout` でログアウト
   - tags: `["初心者向け"]`

---

### Task 4: setup-first-steps.json（更新）

**Files:**
- Modify: `app/data/setup/setup-first-steps.json`

- [ ] **Step 1: setup-first-steps.json を書き換え**

`phase: 1`, `order: 4` に変更。既存の 2 ステップを以下 4 ステップに拡充:

1. **`first-conversation`**: はじめての会話
   - プロジェクトディレクトリで `claude` 起動
   - 具体例: 「このプロジェクトの構造を説明して」「README を日本語で書いて」
   - 自然な日本語で話しかけるだけ
   - tags: `["必須", "初心者向け"]`

2. **`typical-workflow`**: 典型的な使い方
   - バグ修正の流れ（エラー貼り付け → 原因調査 → 修正依頼 → テスト追加）
   - 新機能追加の流れ（既存コード理解 → 同パターンで追加 → コミット）
   - 段階的に依頼するのがコツ
   - tags: `["初心者向け", "中級者向け"]`

3. **`basic-commands`**: 基本コマンド
   - /help, /clear, /compact, /cost, /undo, /model
   - tags: `["必須", "初心者向け"]`

4. **`safety`**: ファイル変更時の安全性
   - Claude は変更前に確認を求める
   - /undo で元に戻せる
   - Git 管理下なら安心
   - tags: `["初心者向け"]`

---

### Task 5: setup-claude-md.json（更新）

**Files:**
- Modify: `app/data/setup/setup-claude-md.json`

- [ ] **Step 1: setup-claude-md.json を書き換え**

`phase: 2`, `order: 1` に変更。既存の 5 ステップを以下 4 ステップに再構成:

1. **`claude-md-overview`**: CLAUDE.md とは（既存ベース）
   - tags: `["必須", "初心者向け", "チーム向け"]`

2. **`claude-md-init`**: 生成方法（既存ベース）
   - /init、手動、Claude に依頼
   - 200 行以下が推奨
   - tags: `["必須", "初心者向け"]`

3. **`claude-md-writing`**: 効果的な書き方（既存ベース）
   - 簡潔に、具体的に
   - テンプレート例を含む
   - 機密情報を含めない Warning
   - tags: `["必須", "中級者向け", "チーム向け"]`

4. **`claude-md-hierarchy`**: 階層構造（既存の hierarchy + rules を統合）
   - 複数階層配置、マージ
   - .claude/rules/ ディレクトリ
   - tags: `["中級者向け", "チーム向け"]`

---

### Task 6: setup-ide.json（更新）

**Files:**
- Modify: `app/data/setup/setup-ide.json`

- [ ] **Step 1: setup-ide.json を書き換え**

`phase: 2`, `order: 2` に変更。3 ステップを最新情報で更新:

1. **`ide-vscode`**: VS Code 拡張
   - 要件: VS Code 1.98.0 以上
   - インストール: マーケットプレイスまたは CLI
   - Cursor 対応: `cursor:extension/anthropic.claude-code`
   - キーボードショートカット: Cmd+Esc, Option+K, Cmd+Shift+Esc
   - 機能: インライン diff、@メンション、複数タブ、権限モード選択
   - tags: `["初心者向け"]`

2. **`ide-jetbrains`**: JetBrains IDE プラグイン
   - 対応: IntelliJ IDEA, PyCharm, WebStorm, GoLand, PhpStorm, Android Studio
   - "Claude Code [Beta]" で検索 → インストール → 再起動
   - Cmd+Esc (Mac) / Ctrl+Esc (Win/Linux) で起動
   - IDE diff 表示、選択コンテキスト共有、Cmd+Option+K
   - リモート開発: リモートホストにインストール必要
   - tags: `["初心者向け"]`

3. **`ide-terminal`**: ターミナルベースの連携
   - tmux ペイン分割で並行利用
   - Web 版: claude.ai/code
   - どのエディタとも組み合わせ可能
   - tags: `["中級者向け"]`

---

### Task 7: setup-tips.json（更新）

**Files:**
- Modify: `app/data/setup/setup-tips.json`

- [ ] **Step 1: setup-tips.json を書き換え**

`phase: 2`, `order: 3` に変更。既存の 5 ステップを以下 4 ステップに再構成（カスタムコマンドは削除 → カスタマイズ概要に統合済み）:

1. **`tips-context`**: コンテキスト管理（既存ベース）
   - /compact, /clear, /cost
   - プロジェクトルートから起動する重要性
   - auto-memory: Claude が学習を自動保存する機能（`~/.claude/projects/` に保存、`/memory` で確認）
   - tags: `["初心者向け", "中級者向け"]`

2. **`tips-prompting`**: プロンプトのコツ（既存ベース）
   - 具体的結果、段階的依頼、参照ファイル、制約明示
   - 画像入力対応
   - tags: `["初心者向け", "中級者向け"]`

3. **`tips-models`**: モデルの使い分け（既存ベース）
   - Opus, Sonnet, Haiku の使い分け
   - /model、`claude --model opus`
   - tags: `["中級者向け"]`

4. **`tips-non-interactive`**: 非対話モード（既存ベース）
   - -p フラグ、パイプ入力、--output-format json
   - CI/CD での活用
   - tags: `["CI/CD", "上級者向け"]`

---

### Task 8: setup-permissions.json（更新）

**Files:**
- Modify: `app/data/setup/setup-permissions.json`

- [ ] **Step 1: setup-permissions.json を書き換え**

`phase: 2`, `order: 4` に変更。既存の 3 ステップを最新化:

1. **`permissions-model`**: 権限モデルの理解（更新）
   - plan, default, auto-accept edits, bypass の 4 モード
   - CI/CD 向け: `--dangerously-skip-permissions`
   - tags: `["必須", "初心者向け"]`

2. **`permissions-settings`**: settings.json での設定（更新）
   - permissions.allow / permissions.deny
   - ワイルドカード対応
   - 推奨設定例
   - tags: `["中級者向け", "チーム向け"]`

3. **`permissions-security`**: 安全な使い方（旧 best-practices のセキュリティ内容を吸収）
   - API キーを CLAUDE.md に含めない
   - .gitignore 設定
   - 生成コードのレビュー
   - tags: `["チーム向け"]`

---

### Task 9: setup-customization.json（新規作成）

**Files:**
- Create: `app/data/setup/setup-customization.json`

- [ ] **Step 1: setup-customization.json を作成**

`phase: 3`, `order: 1` で旧 skills + mcp + hooks を統合。3 ステップ:

1. **`skills-overview`**: スキル（カスタムコマンド）
   - SKILL.md を配置するだけでスラッシュコマンドを追加
   - `.claude/skills/<スキル名>/SKILL.md` に配置
   - 基本的な SKILL.md の構造例（YAML フロントマター + Markdown 本文）
   - callout: 詳細は → カスタマイズガイド（/customization）
   - tags: `["上級者向け"]`

2. **`mcp-overview`**: MCP（外部ツール連携）
   - Model Context Protocol で GitHub・DB・ブラウザ等を接続
   - `claude mcp add <name> -s project -- <command>`
   - `claude mcp list` で一覧確認
   - callout: 詳細は → カスタマイズガイド（/customization）
   - tags: `["上級者向け"]`

3. **`hooks-overview`**: フック（自動化）
   - ライフサイクルイベントにカスタムスクリプトを接続
   - 例: ファイル保存時に prettier 自動実行
   - settings.json の hooks プロパティで定義
   - callout: 詳細は → カスタマイズガイド（/customization）
   - tags: `["上級者向け"]`

---

### Task 10: setup-troubleshooting.json（更新）

**Files:**
- Modify: `app/data/setup/setup-troubleshooting.json`

- [ ] **Step 1: setup-troubleshooting.json を書き換え**

`phase: 3`, `order: 2` に変更。古いコマンドを全面的に最新化。5 ステップ:

1. **`ts-doctor`**: /doctor コマンド
   - セッション外: `claude doctor`、セッション内: `/doctor`
   - tags: `["初心者向け"]`

2. **`ts-auth`**: 認証の問題
   - `/login` で再認証（旧 `claude auth login` は削除）
   - `/logout` でログアウト（旧 `claude auth logout` は削除）
   - ブラウザが開かない場合: `c` キー
   - API キー漏洩時の対処
   - tags: `["初心者向け"]`

3. **`ts-install`**: インストールの問題
   - `command not found: claude`: PATH に `~/.local/bin` を追加
   - ターミナル再起動
   - Windows: Git for Windows、`CLAUDE_CODE_GIT_BASH_PATH`
   - Alpine Linux: `apk add libgcc libstdc++ ripgrep`
   - tags: `["初心者向け"]`

4. **`ts-performance`**: パフォーマンスの問題（既存ベース、最新化）
   - /compact、.claudeignore、MCP 無効化
   - tags: `["初心者向け"]`

5. **`ts-errors`**: よくあるエラー（全面最新化）
   - "Context window full" → /compact
   - "Rate limit exceeded" → 待機
   - "Tool execution failed" → 権限確認
   - 更新: `claude update`（npm ではなくネイティブ）
   - Issue 報告先
   - tags: `["初心者向け"]`

---

## Phase B: データ接続（Phase A 完了後）

### Task 11: index.ts 更新 + 旧ファイル削除

**Files:**
- Modify: `app/data/setup/index.ts`
- Delete: `app/data/setup/setup-initial-setup.json`
- Delete: `app/data/setup/setup-skills.json`
- Delete: `app/data/setup/setup-mcp.json`
- Delete: `app/data/setup/setup-hooks.json`
- Delete: `app/data/setup/setup-best-practices.json`

- [ ] **Step 1: index.ts を書き換え**

```typescript
import introSection from "~/data/setup/setup-intro.json";
import installationSection from "~/data/setup/setup-installation.json";
import authenticationSection from "~/data/setup/setup-authentication.json";
import firstStepsSection from "~/data/setup/setup-first-steps.json";
import claudeMdSection from "~/data/setup/setup-claude-md.json";
import ideSection from "~/data/setup/setup-ide.json";
import tipsSection from "~/data/setup/setup-tips.json";
import permissionsSection from "~/data/setup/setup-permissions.json";
import customizationSection from "~/data/setup/setup-customization.json";
import troubleshootingSection from "~/data/setup/setup-troubleshooting.json";

export const SECTIONS = [
  introSection,
  installationSection,
  authenticationSection,
  firstStepsSection,
  claudeMdSection,
  ideSection,
  tipsSection,
  permissionsSection,
  customizationSection,
  troubleshootingSection,
];
```

- [ ] **Step 2: 旧ファイルを削除**

以下の 5 ファイルを削除:

```bash
rm app/data/setup/setup-initial-setup.json
rm app/data/setup/setup-skills.json
rm app/data/setup/setup-mcp.json
rm app/data/setup/setup-hooks.json
rm app/data/setup/setup-best-practices.json
```

---

## Phase C: UI 更新（Phase B 完了後、順次実行）

### Task 12: constants.tsx 更新

**Files:**
- Modify: `app/routes/setup/constants.tsx`

- [ ] **Step 1: SetupSection 型に phase と order を追加**

```typescript
export interface SetupSection {
  id: string;
  name: string;
  description: string;
  phase: number;
  order: number;
  steps: Step[];
}
```

- [ ] **Step 2: PHASES と PHASE_COLORS を追加**

```typescript
export const PHASES = [
  { id: 1, label: "導入", description: "ここまでで使い始められます" },
  { id: 2, label: "活用", description: "日常的に使いこなす" },
  { id: 3, label: "カスタマイズ", description: "さらに深く使う" },
] as const;

export const PHASE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: "#6EE7B7", bg: "rgba(16,185,129,0.08)" },
  2: { color: "#C4B5FD", bg: "rgba(139,92,246,0.08)" },
  3: { color: "#FDBA74", bg: "rgba(249,115,22,0.08)" },
};
```

- [ ] **Step 3: SECTION_COLORS を更新**

旧エントリ（`initial-setup`, `skills`, `hooks`, `mcp`, `best-practices`）を削除し、新エントリ（`intro`, `authentication`, `customization`）を追加:

```typescript
export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  intro: PALETTE.blue,
  installation: PALETTE.green,
  authentication: PALETTE.cyan,
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" },
  "claude-md": PALETTE.purple,
  ide: PALETTE.blueDark,
  tips: PALETTE.pinkBright,
  permissions: PALETTE.yellow,
  customization: PALETTE.indigo,
  troubleshooting: PALETTE.red,
};
```

- [ ] **Step 4: TAB_SECTION_MAP を追加し TAB_DEFS を更新**

```typescript
export const TAB_SECTION_MAP: Record<string, string[]> = {
  "phase-1": ["intro", "installation", "authentication", "first-steps"],
  "phase-2": ["claude-md", "ide", "tips", "permissions"],
  "phase-3": ["customization", "troubleshooting"],
};

export const TAB_DEFS: TabItem[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  { id: "phase-1", label: "Phase 1: 導入", color: PHASE_COLORS[1].color },
  { id: "phase-2", label: "Phase 2: 活用", color: PHASE_COLORS[2].color },
  { id: "phase-3", label: "Phase 3: カスタマイズ", color: PHASE_COLORS[3].color },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: `${s.phase}-${s.order} ${s.name}`,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];
```

- [ ] **Step 5: SECTION_INDEX_MAP を削除**

`SECTION_INDEX_MAP` の定義を削除（`index.tsx` で `phase-order` 表記に置き換えるため）。

---

### Task 13: section-icons.tsx 更新

**Files:**
- Modify: `app/routes/setup/section-icons.tsx`

- [ ] **Step 1: 旧アイコンを削除し新アイコンを追加**

**削除するエントリ:** `initial-setup`, `skills`, `hooks`, `mcp`, `best-practices`

**追加するエントリ:**

```typescript
// intro: 情報アイコン（circle with i）
intro: () => (
  <svg {...ICON_BASE}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
),

// authentication: 鍵アイコン
authentication: () => (
  <svg {...ICON_BASE}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
),

// customization: スライダーアイコン
customization: () => (
  <svg {...ICON_BASE}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
),
```

---

### Task 14: index.tsx 更新

**Files:**
- Modify: `app/routes/setup/index.tsx`

- [ ] **Step 1: インポートを更新**

React の `useMemo` を追加し、`SECTION_INDEX_MAP` のインポートを削除し、`PHASES`, `PHASE_COLORS`, `TAB_SECTION_MAP` を追加:

```typescript
import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// ... 既存の component imports ...

import {
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  PHASES,
  PHASE_COLORS,
  TAB_DEFS,
  TAB_SECTION_MAP,
  ITEM_SECTION_MAP,
} from "./constants";
```

**注意:** `detail-modal.tsx` と `item-card.tsx` は変更不要。`detail-modal.tsx` は `SECTIONS` と `SECTION_ICONS` を参照するが、新しいセクション ID で正常に動作する（旧 ID のステップは存在しないため fallback SVG は使用されない）。

- [ ] **Step 2: meta() と PageHeader を更新**

```typescript
export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code セットアップガイド" },
    { name: "description", content: "導入から活用、カスタマイズまで。Claude Code を始めるためのステップバイステップガイド。" },
  ];
}
```

PageHeader の description と stats を更新:

```typescript
<PageHeader
  title="セットアップガイド"
  description="導入から活用、カスタマイズまで。3つのフェーズで Claude Code を使いこなそう。"
  stats={[
    { value: PHASES.length, label: "フェーズ" },
    { value: SECTIONS.length, label: "セクション" },
    { value: TOTAL_ITEMS, label: "ステップ" },
  ]}
  gradient={["rgba(139,92,246,0.08)", "rgba(16,185,129,0.05)"]}
/>
```

- [ ] **Step 3: usePageState に tabSectionMap を渡す**

```typescript
const { ... } = usePageState({
  sections: SECTIONS.map((s) => ({ id: s.id, name: s.name, items: s.steps })),
  searchFields: (item) => [
    item.title,
    item.description,
    item.content,
    ...item.code.map((c) => c.value),
    ...item.callouts.map((c) => c.text),
    ...item.tags,
  ],
  tabSectionMap: TAB_SECTION_MAP,
});
```

- [ ] **Step 4: renderTabIcon を更新**

Phase タブにはアイコンを表示しない（`SECTION_ICONS` に `phase-*` キーがないため `null` が返る）。既存の `renderTabIcon` はそのまま動作するため変更不要。

- [ ] **Step 5: フェーズグループ見出しを追加**

セクションカードのレンダリング部分を変更。`filteredSections` をフェーズごとにグループ化し、フェーズ見出しを挿入:

```typescript
const groupedByPhase = useMemo(() => {
  const groups = new Map<number, typeof filteredSections>();
  for (const section of filteredSections) {
    const sectionData = SECTIONS.find((s) => s.id === section.id);
    const phase = sectionData?.phase ?? 1;
    if (!groups.has(phase)) groups.set(phase, []);
    groups.get(phase)!.push(section);
  }
  return groups;
}, [filteredSections]);

// 個別セクションタブ選択時はフェーズ見出し非表示
const showPhaseHeaders = activeTab === "all" || activeTab.startsWith("phase-");
```

レンダリング部分:

```tsx
<div className="flex flex-col gap-8">
  {Array.from(groupedByPhase.entries()).map(([phaseId, sections]) => {
    const phaseInfo = PHASES.find((p) => p.id === phaseId);
    const phaseColor = PHASE_COLORS[phaseId];
    return (
      <div key={phaseId}>
        {/* フェーズ見出し */}
        {showPhaseHeaders && phaseInfo && (
          <div
            className="mb-4 px-4 py-3 rounded-lg border"
            style={{
              borderColor: phaseColor?.color + "30",
              background: phaseColor?.bg,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold"
                style={{ color: phaseColor?.color }}
              >
                Phase {phaseId}: {phaseInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              {phaseInfo.description}
            </p>
          </div>
        )}

        {/* セクションとカード */}
        {sections.map((section) => {
          const colors = SECTION_COLORS[section.id] || {
            color: "#3B82F6",
            bg: "rgba(59,130,246,0.15)",
          };
          const sectionData = SECTIONS.find((s) => s.id === section.id);
          const badge = sectionData
            ? `${sectionData.phase}-${sectionData.order}`
            : "";
          return (
            <div key={section.id} className="mb-6">
              <div className="flex items-center gap-2.5 mb-3 px-1">
                {/* w-7 h-6 + rounded-full でピル型バッジ（"1-1" の3文字を収めるため旧 w-6 から拡大） */}
                <div
                  className="w-7 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.color}`,
                    color: colors.color,
                  }}
                >
                  {badge}
                </div>
                {SECTION_ICONS[section.id] && (
                  <span
                    className="flex items-center"
                    style={{ color: colors.color }}
                  >
                    {SECTION_ICONS[section.id]()}
                  </span>
                )}
                <h2
                  className="text-base font-bold m-0"
                  style={{ color: colors.color }}
                >
                  {section.name}
                </h2>
                <span className="text-xs text-slate-500">
                  {section.items.length} 件
                </span>
              </div>
              <ItemGrid
                items={section.items}
                keyExtractor={(item) => item.id}
                renderItem={(item) => (
                  <ItemCard
                    item={item}
                    accentColor={colors.color}
                    sectionName={section.name}
                    onClick={() => openModal(item.id)}
                  />
                )}
                reducedMotion={reducedMotion}
              />
            </div>
          );
        })}
      </div>
    );
  })}
</div>
```

---

## Phase D: 検証

### Task 15: 型チェック + ビルド

**Files:** なし（検証のみ）

- [ ] **Step 1: TypeScript 型チェック**

Run: `pnpm run typecheck`
Expected: エラーなし

- [ ] **Step 2: プロダクションビルド**

Run: `pnpm run build`
Expected: ビルド成功

- [ ] **Step 3: 開発サーバーで動作確認**

Run: `pnpm run dev`

手動で以下を確認:
1. `/setup` ページが正常表示
2. フェーズ見出し（Phase 1/2/3）が表示される
3. セクション番号が `1-1`, `1-2` 等の形式で表示される
4. 「すべて」タブで全セクション表示
5. Phase 1/2/3 タブでフィルタリングが動作
6. 個別セクションタブで 1 セクションのみ表示
7. 検索が全ステップを対象に動作
8. カードクリックでモーダルが正常表示
9. モーダル内のコードブロック・callout が表示される

**確認後、開発サーバーを必ず停止すること**

---

## Phase E: Git コミット（全実装完了後）

### Task 16: コミット

- [ ] **Step 1: 全変更をコミット**

```bash
git add app/data/setup/ app/routes/setup/constants.tsx app/routes/setup/section-icons.tsx app/routes/setup/index.tsx
git commit -m "feat: setup ページを3フェーズ構成に再設計し初心者向けに最新化

- 12セクション→10セクション（3フェーズ: 導入・活用・カスタマイズ）に再編
- 全コンテンツを公式ドキュメント（code.claude.com/docs/en/）と整合
- 非エンジニア向けの説明を追加（ターミナル基礎、OS要件等）
- 旧5ファイル削除（initial-setup, skills, mcp, hooks, best-practices）
- UIにフェーズグループ見出しとPhaseタブを追加"
```
