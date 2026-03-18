# Setup ページ再設計: 3フェーズ構成 + 初心者向け最新化

**日付**: 2026-03-18
**スコープ**: `/setup` ページのコンテンツ再設計 + UI 変更
**対象ユーザー**: 完全な初心者（ターミナル未経験レベル）
**対象ツール**: Claude Code CLI のみ（Desktop App は対象外）

---

## 1. 背景と目的

### 現状の問題

- 既存の 12 セクション・約 23 ステップは情報量が薄い（インストール・初期セットアップが各 1 ステップ）
- 上級者向けセクション（スキル、MCP、フック等）が初心者を混乱させる
- 公式ドキュメントと整合しない古い情報がある（`claude auth logout` 等の非推奨コマンド）
- 非エンジニア向けの導線（ターミナルとは？レベルの説明）がない
- 最新機能（auto-memory、stable channel、認証フロー詳細等）が未反映

### 目的

1. 非エンジニアでも上から順に進めれば Claude Code を導入できるようにする
2. 全コンテンツを公式ドキュメント（code.claude.com/docs/en/）と整合させる
3. 3 フェーズ構成で「ここまでで使い始められる」を明確にする

---

## 2. アーキテクチャ: 3 フェーズ構成

### Phase 1: 導入（ここまでで使い始められる）

| 順番 | セクション ID    | セクション名     | ステップ数 |
| :--: | ---------------- | ---------------- | :--------: |
| 1-1  | `intro`          | はじめに         |     3      |
| 1-2  | `installation`   | インストール     |     3      |
| 1-3  | `authentication` | 認証と初回起動   |     3      |
| 1-4  | `first-steps`    | まずは使ってみる |     4      |

### Phase 2: 活用（日常的に使いこなす）

| 順番 | セクション ID | セクション名 | ステップ数 |
| :--: | ------------- | ------------ | :--------: |
| 2-1  | `claude-md`   | CLAUDE.md    |     4      |
| 2-2  | `ide`         | IDE 連携     |     3      |
| 2-3  | `tips`        | 便利な使い方 |     4      |
| 2-4  | `permissions` | 権限と安全性 |     3      |

### Phase 3: カスタマイズ（さらに深く使う）

| 順番 | セクション ID     | セクション名           | ステップ数 |
| :--: | ----------------- | ---------------------- | :--------: |
| 3-1  | `customization`   | カスタマイズ概要       |     3      |
| 3-2  | `troubleshooting` | トラブルシューティング |     5      |

**合計**: 10 セクション、約 35 ステップ（旧: 12 セクション、23 ステップ）

### 削除するセクション

以下の旧セクションは Phase 3「カスタマイズ概要」に統合（概要 + カスタマイズガイドへのリンクのみ）:

- `setup-skills.json` → 3-1 内のスキル紹介ステップに統合
- `setup-mcp.json` → 3-1 内の MCP 紹介ステップに統合
- `setup-hooks.json` → 3-1 内のフック紹介ステップに統合
- `setup-best-practices.json` → 関連内容を各セクションに分散（チーム開発→CLAUDE.md、セキュリティ→権限、CI/CD→非対話モード）

---

## 3. データ構造の変更

### TypeScript 型定義の変更

`constants.tsx` の `SetupSection` インターフェースに `phase` と `order` フィールドを追加:

```typescript
export interface SetupSection {
  id: string;
  name: string;
  description: string;
  phase: number; // 追加: 1, 2, or 3
  order: number; // 追加: フェーズ内の順番 (1-based)
  steps: Step[];
}
```

### JSON セクションスキーマ

各セクション JSON に `phase` と `order` フィールドを追加:

```json
{
  "id": "installation",
  "name": "インストール",
  "description": "Claude Code のインストール手順",
  "phase": 1,
  "order": 2,
  "steps": [...]
}
```

### ファイル構成

```
app/data/setup/
├── setup-intro.json              # 新規: 1-1 はじめに
├── setup-installation.json       # 更新: 1-2 インストール
├── setup-authentication.json     # 新規（旧 initial-setup を改名・拡充）: 1-3 認証
├── setup-first-steps.json        # 更新: 1-4 まずは使ってみる
├── setup-claude-md.json          # 更新: 2-1 CLAUDE.md
├── setup-ide.json                # 更新: 2-2 IDE 連携
├── setup-tips.json               # 更新: 2-3 便利な使い方
├── setup-permissions.json        # 更新: 2-4 権限と安全性
├── setup-customization.json      # 新規（スキル+MCP+フック統合）: 3-1 カスタマイズ概要
├── setup-troubleshooting.json    # 更新: 3-2 トラブルシューティング
└── index.ts                      # 更新: インポート変更
```

**削除するファイル**:

- `setup-initial-setup.json`（→ `setup-authentication.json` に置き換え）
- `setup-skills.json`（→ `setup-customization.json` に統合）
- `setup-mcp.json`（→ `setup-customization.json` に統合）
- `setup-hooks.json`（→ `setup-customization.json` に統合）
- `setup-best-practices.json`（→ 各セクションに分散）

### index.ts の更新

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

---

## 4. UI の変更

### 4.1 フェーズグループ見出し

`index.tsx` のセクションレンダリング部分に、フェーズごとのグループ見出しを追加。

```
┌──────────────────────────────────────────────┐
│  Phase 1: 導入                               │
│  ここまでで使い始められます                       │
├──────────────────────────────────────────────┤
│  1-1 はじめに         [カード][カード][カード]   │
│  1-2 インストール      [カード][カード][カード]   │
│  1-3 認証と初回起動    [カード][カード][カード]   │
│  1-4 まずは使ってみる  [カード][カード][カード]   │
├──────────────────────────────────────────────┤
│  Phase 2: 活用                               │
│  日常的に使いこなす                              │
├──────────────────────────────────────────────┤
│  2-1 CLAUDE.md        [カード][カード][カード]   │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### 4.2 constants.tsx にフェーズ定義を追加

```typescript
export const PHASES = [
  { id: 1, label: "導入", description: "ここまでで使い始められます" },
  { id: 2, label: "活用", description: "日常的に使いこなす" },
  { id: 3, label: "カスタマイズ", description: "さらに深く使う" },
] as const;

// フェーズの色定義（見出しのアクセントカラー）
export const PHASE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: "#6EE7B7", bg: "rgba(16,185,129,0.08)" }, // green 系
  2: { color: "#C4B5FD", bg: "rgba(139,92,246,0.08)" }, // purple 系
  3: { color: "#FDBA74", bg: "rgba(249,115,22,0.08)" }, // orange 系
};
```

### 4.3 タブの変更

`tabSectionMap` を使って Phase タブからセクション群へのマッピングを定義:

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

`usePageState` に `tabSectionMap` を渡す:

```typescript
const { ... } = usePageState({
  sections: SECTIONS.map((s) => ({ id: s.id, name: s.name, items: s.steps })),
  searchFields: (item) => [...],
  tabSectionMap: TAB_SECTION_MAP,
});
```

### 4.4 セクションヘッダーの番号表記

セクションヘッダーの番号バッジを `1` → `1-1`、`2` → `1-2` のように変更。`SECTION_INDEX_MAP` を廃止し、JSON の `phase` + `order` フィールドから直接表示文字列を生成:

```typescript
// 旧: SECTION_INDEX_MAP[section.id] → 0-based index → "1"
// 新: section の phase + order → "1-2"
const sectionData = SECTIONS.find((s) => s.id === section.id);
const badge = sectionData ? `${sectionData.phase}-${sectionData.order}` : "";
```

### 4.5 フェーズグループ見出しのレンダリングロジック

`index.tsx` でセクションをフェーズごとにグループ化して表示:

```typescript
// filteredSections をフェーズ番号でグループ化
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
```

**エッジケース対応:**

- 検索やタブフィルタでフェーズ内の全セクションが除外された場合 → そのフェーズの見出しを非表示
- Phase タブが選択されている場合 → フェーズ見出しは表示する（1フェーズのみなので冗長だが、コンテキストとして有用）
- セクション個別タブが選択されている場合 → フェーズ見出しは非表示（1セクションのみ表示なので不要）

### 4.6 SECTION_COLORS と SECTION_ICONS の更新

新しいセクション ID に対応する色とアイコンを定義。不要なエントリを削除:

```typescript
// constants.tsx
export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  intro: PALETTE.blue, // 新規: はじめに
  installation: PALETTE.green, // 維持
  authentication: PALETTE.cyan, // 新規（旧 initial-setup の色を継承）
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" }, // 維持
  "claude-md": PALETTE.purple, // 維持
  ide: PALETTE.blueDark, // 維持
  tips: PALETTE.pinkBright, // 維持
  permissions: PALETTE.yellow, // 維持
  customization: PALETTE.indigo, // 新規（旧 best-practices の色を継承）
  troubleshooting: PALETTE.red, // 維持
  // 削除: initial-setup, skills, hooks, mcp, best-practices
};
```

```typescript
// section-icons.tsx
// 追加するアイコン:
//   intro: 情報アイコン（i マーク / circle-info）
//   authentication: 鍵アイコン（key / lock-open）
//   customization: 設定アイコン（sliders / settings）
// 削除するアイコン:
//   initial-setup, skills, hooks, mcp, best-practices
```

### 4.7 タグ体系

既存のタグ体系（`必須`, `初心者向け`, `中級者向け`, `上級者向け`, `チーム向け`, `CI/CD`）はそのまま維持。`TAG_COLORS` の変更は不要。

### 4.8 メタ情報とヘッダーの更新

`index.tsx` の `meta()` と `PageHeader` を新しい構成に合わせて更新:

```typescript
export function meta() {
  return [
    { title: "Claude Code セットアップガイド" },  // 維持
    { name: "description", content: "導入から活用、カスタマイズまで。Claude Code を始めるためのステップバイステップガイド。" },
  ];
}

// PageHeader
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

### 4.9 ステップ ID とブックマーク互換性

旧セクション内のステップ ID が変更される場合がある（`first-run` → `login` 等）。URLクエリパラメータによるモーダル直接リンク機能は現在存在しないため、ステップ ID 変更による後方互換性の問題はない。新しいステップには意味的に明確な ID を付与する。

### 4.10 ルーティングとナビゲーション

`/setup` ルートは変更なし（`app/routes.ts` の変更不要）。`page-header.tsx` の `ALL_PAGES` も変更不要（セットアップの表示名・パスは同一）。

---

## 5. コンテンツ詳細

### Phase 1: 導入

#### 1-1 はじめに（新規: `setup-intro.json`）

**Step: Claude Code とは**

- AI コーディングアシスタントの概要
- ターミナル（黒い画面）で動くツール
- コードの読み書き、バグ修正、質問応答ができる
- プログラミング経験がなくても使える場面の紹介

**Step: 必要なもの**

- OS 要件: macOS 13.0+, Windows 10 1809+, Ubuntu 20.04+, Debian 10+, Alpine Linux 3.19+
- RAM: 4 GB 以上
- インターネット接続
- Anthropic アカウント（Claude Pro / Max / Team / Enterprise）
- 無料プランでは使えないことを明記

**Step: ターミナルの基本**

- macOS: Spotlight → "ターミナル" で検索
- Windows: スタート → "PowerShell" で検索
- 基本操作: コマンドを入力して Enter、Ctrl+C で中断

#### 1-2 インストール（更新: `setup-installation.json`）

**Step: Claude Code をインストールする**

- ネイティブインストール推奨（自動更新）
  - macOS/Linux/WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
  - Windows CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
- Homebrew: `brew install --cask claude-code`（手動更新）
- WinGet: `winget install Anthropic.ClaudeCode`（手動更新）
- npm は非推奨（deprecated）であることを明記

**Step: Windows ユーザー向け補足**

- Git for Windows が必要（git-scm.com からダウンロード）
- PowerShell と CMD でコマンドが異なる
- Git Bash が見つからない場合: `CLAUDE_CODE_GIT_BASH_PATH` を設定
- WSL での利用方法

**Step: 確認とアップデート**

- `claude --version` でバージョン確認
- `claude doctor` で環境診断
- stable channel: `curl -fsSL https://claude.ai/install.sh | bash -s stable`
- 更新: ネイティブ版は自動。Homebrew: `brew upgrade claude-code`、WinGet: `winget upgrade Anthropic.ClaudeCode`

#### 1-3 認証と初回起動（新規: `setup-authentication.json`）

**Step: Claude Code にログインする**

- `claude` コマンド実行 → ブラウザが自動的に開く → ログイン
- ブラウザが開かない場合: `c` キーでURLをコピーして手動で開く
- 認証情報の保存先: macOS は Keychain、Linux/Windows は `~/.claude/.credentials.json`

**Step: 利用可能なプラン**

- Claude Pro / Max（個人向け）
- Claude for Teams / Enterprise（企業向け）
- Claude Console（API 課金）
- クラウドプロバイダー: Amazon Bedrock, Google Vertex AI, Microsoft Foundry
- 無料プランでは Claude Code は利用不可

**Step: 認証の確認**

- セッション内で `/status` でアカウント情報を確認
- `/login` で再認証（アカウント切り替え）
- `/logout` でログアウト

#### 1-4 まずは使ってみる（更新: `setup-first-steps.json`）

**Step: はじめての会話**

- プロジェクトディレクトリで `claude` 起動
- 具体例: 「このプロジェクトの構造を説明して」「README を日本語で書いて」
- 自然な日本語で話しかけるだけ

**Step: 典型的な使い方**

- バグ修正の流れ（エラー貼り付け → 原因調査 → 修正依頼 → テスト追加）
- 新機能追加の流れ（既存コード理解 → 同パターンで追加 → コミット）
- 段階的に依頼するのがコツ

**Step: 基本コマンド**

- `/help`: コマンド一覧
- `/clear`: セッションクリア
- `/compact`: コンテキスト圧縮
- `/cost`: 使用量確認
- `/undo`: 最後の操作を元に戻す
- `/model`: モデル切り替え

**Step: ファイル変更時の安全性**

- Claude は変更前に確認を求める
- `/undo` で最後の変更を元に戻せる
- Git 管理下ならいつでも戻せるので安心
- 失敗を恐れずに試してみよう

### Phase 2: 活用

#### 2-1 CLAUDE.md（更新: `setup-claude-md.json`）

**Step: CLAUDE.md とは**

- プロジェクト固有の指示ファイル
- セッション開始時に自動読み込み
- Git で共有可能

**Step: 生成方法**

- `/init` コマンドで自動生成（推奨）
- 手動作成
- Claude に作成を依頼
- 200 行以下が推奨

**Step: 効果的な書き方**

- 簡潔に、具体的に
- ビルド/テスト/リントコマンドを明記
- 技術スタック明記
- 機密情報は含めない（Warning）
- 具体的なテンプレート例

**Step: 階層構造**

- 複数階層に配置可能（プロジェクトルート、サブディレクトリ、ユーザーグローバル）
- マージされて読み込まれる
- .claude/rules/ ディレクトリでの条件付きルール

#### 2-2 IDE 連携（更新: `setup-ide.json`）

**Step: VS Code 拡張**

- 要件: VS Code 1.98.0 以上
- インストール: マーケットプレイスで "Claude Code" 検索、または `code --install-extension anthropic.claude-code`
- Cursor でも利用可能: `cursor:extension/anthropic.claude-code`
- キーボードショートカット: Cmd+Esc（フォーカス切替）、Option+K（@メンション）、Cmd+Shift+Esc（新タブ）
- 機能: インライン diff、@メンション、複数タブ、権限モード選択

**Step: JetBrains IDE プラグイン**

- 対応 IDE: IntelliJ IDEA, PyCharm, WebStorm, GoLand, PhpStorm, Android Studio
- インストール: Marketplace → "Claude Code [Beta]" → インストール → IDE 再起動
- 起動: Cmd+Esc (Mac) / Ctrl+Esc (Win/Linux)
- 機能: IDE diff 表示、選択コンテキスト共有、ファイル参照（Cmd+Option+K）
- リモート開発: プラグインはリモートホストにインストールが必要

**Step: ターミナルベースの連携**

- Vim/Neovim: tmux ペイン分割で並行利用
- Web 版: claude.ai/code（ローカルセットアップ不要）
- どのエディタとも組み合わせ可能

#### 2-3 便利な使い方（更新: `setup-tips.json`）

**Step: コンテキスト管理**

- `/compact` でコンテキスト圧縮
- `/clear` でセッションリフレッシュ
- `/cost` で使用量確認
- プロジェクトルートから起動する重要性

**Step: プロンプトのコツ**

- 具体的な結果を述べる
- 段階的に依頼
- 参照ファイルを示す
- 制約を明示
- 画像入力対応

**Step: モデルの使い分け**

- Opus: 複雑なアーキテクチャ設計、大規模リファクタリング
- Sonnet: 日常的なコーディング、バグ修正（デフォルト）
- Haiku: 簡単な質問、コード読解（高速・低コスト）
- `/model` で切り替え、`claude --model opus` で起動時指定

**Step: 非対話モード**

- `-p` フラグでプロンプトを直接渡す
- パイプ入力: `cat error.log | claude -p "このエラーの原因は？"`
- `--output-format json` で JSON 出力
- CI/CD パイプラインでの活用

#### 2-4 権限と安全性（更新: `setup-permissions.json`）

**Step: 権限モデルの理解**

- plan モード: 計画の承認が必要
- default モード: 書き込み操作に承認が必要
- auto-accept edits: 編集を自動承認
- bypass モード: すべて自動承認（CI/CD 向け、信頼できる環境のみ）

**Step: settings.json での設定**

- `.claude/settings.json` の permissions.allow / permissions.deny
- ワイルドカード対応
- 推奨設定例（Read, Glob, Grep は許可、rm -rf は拒否など）

**Step: 安全な使い方**

- API キーを CLAUDE.md や settings.json に含めない
- .gitignore 設定（.claude/settings.local.json, .env 等）
- 生成コードは必ずレビュー
- 定期的な API キーローテーション

### Phase 3: カスタマイズ

#### 3-1 カスタマイズ概要（新規: `setup-customization.json`）

**Step: スキル（カスタムコマンド）**

- SKILL.md を配置するだけでスラッシュコマンドを追加
- `.claude/skills/<スキル名>/SKILL.md` に配置
- 基本的な SKILL.md の構造例
- 詳細は → カスタマイズガイド（/customization）

**Step: MCP（外部ツール連携）**

- Model Context Protocol で GitHub・DB・ブラウザ等を接続
- 基本コマンド: `claude mcp add <name> -s project -- <command>`
- `claude mcp list` で一覧確認
- 詳細は → カスタマイズガイド（/customization）

**Step: フック（自動化）**

- ライフサイクルイベントにカスタムスクリプトを接続
- 例: ファイル保存時に prettier 自動実行
- settings.json の hooks プロパティで定義
- 詳細は → カスタマイズガイド（/customization）

#### 3-2 トラブルシューティング（更新: `setup-troubleshooting.json`）

**Step: /doctor コマンド**

- セッション外: `claude doctor`
- セッション内: `/doctor`
- 環境診断を自動実行（Node.js、認証、MCP 等）

**Step: 認証の問題**

- `/login` で再認証（旧 `claude auth login` は使用不可）
- `/logout` でログアウト（旧 `claude auth logout` は使用不可）
- ブラウザが開かない場合: `c` キーで URL コピー
- API キー漏洩時: console.anthropic.com で即無効化

**Step: インストールの問題**

- `command not found: claude`: PATH に `~/.local/bin` を追加
- ターミナル再起動（`source ~/.bashrc` or `source ~/.zshrc`）
- Windows: Git for Windows が必要、`CLAUDE_CODE_GIT_BASH_PATH` の設定
- Alpine Linux: `apk add libgcc libstdc++ ripgrep`

**Step: パフォーマンスの問題**

- `/compact` でコンテキスト圧縮
- `.claudeignore` で不要ファイル除外
- 不要 MCP サーバーの無効化
- ネットワーク接続の確認

**Step: よくあるエラー**

- "Context window full": `/compact` または `/clear`
- "Rate limit exceeded": しばらく待機
- "Tool execution failed": 権限設定を確認
- 更新: `claude update`（npm ではなくネイティブコマンド）
- 未解決の場合: github.com/anthropics/claude-code/issues

---

## 6. 公式ドキュメントとの整合性チェックポイント

以下の項目は公式ドキュメント（code.claude.com/docs/en/）との照合が必要:

- [ ] インストールコマンド（setup）
- [ ] 認証フロー（authentication）
- [ ] 認証情報の保存先（authentication）
- [ ] サポートアカウント種別（authentication）
- [ ] VS Code 最小バージョン（vs-code）
- [ ] VS Code キーボードショートカット（vs-code）
- [ ] JetBrains 対応 IDE 一覧（jetbrains）
- [ ] JetBrains キーボードショートカット（jetbrains）
- [ ] 権限モード名称（settings）
- [ ] settings.json スキーマ（settings）
- [ ] スラッシュコマンド名称と動作（cli-reference）
- [ ] エラーメッセージと対処法（troubleshooting）

---

## 7. 変更対象ファイル

### データファイル（JSON）

- `app/data/setup/setup-intro.json` — **新規作成**
- `app/data/setup/setup-installation.json` — **更新**
- `app/data/setup/setup-authentication.json` — **新規作成**（旧 initial-setup の置き換え）
- `app/data/setup/setup-first-steps.json` — **更新**
- `app/data/setup/setup-claude-md.json` — **更新**
- `app/data/setup/setup-ide.json` — **更新**
- `app/data/setup/setup-tips.json` — **更新**
- `app/data/setup/setup-permissions.json` — **更新**
- `app/data/setup/setup-customization.json` — **新規作成**（3セクション統合）
- `app/data/setup/setup-troubleshooting.json` — **更新**
- `app/data/setup/index.ts` — **更新**

### 削除ファイル

- `app/data/setup/setup-initial-setup.json`
- `app/data/setup/setup-skills.json`
- `app/data/setup/setup-mcp.json`
- `app/data/setup/setup-hooks.json`
- `app/data/setup/setup-best-practices.json`

### UI ファイル

- `app/routes/setup/constants.tsx` — **更新**（型定義変更、フェーズ定義追加、SECTION_COLORS/TAB_DEFS/SECTION_INDEX_MAP 更新、tabSectionMap 追加）
- `app/routes/setup/section-icons.tsx` — **更新**（新セクション ID のアイコン追加、旧 ID のアイコン削除）
- `app/routes/setup/index.tsx` — **更新**（フェーズグループ見出し、タブ変更、meta/PageHeader 更新）

### 変更不要ファイル

- `app/routes.ts` — 変更不要（`/setup` ルートは既存のまま）
- `app/components/page-header.tsx` — 変更不要（ALL_PAGES のセットアップリンクは同一）
- `app/hooks/usePageState.ts` — 変更不要（既に `tabSectionMap` をサポート済み）

### 前提条件

- `/customization` ルートは既に存在する（Phase 3 からのリンク先として使用）

---

## 8. ファイルサイズ見積もり

CLAUDE.md の制約: 各 JSON ファイルは 50KB 以下。

| ファイル                   | 推定ステップ数 | 推定サイズ |
| -------------------------- | :------------: | ---------- |
| setup-intro.json           |       3        | ~5KB       |
| setup-installation.json    |       3        | ~8KB       |
| setup-authentication.json  |       3        | ~6KB       |
| setup-first-steps.json     |       4        | ~10KB      |
| setup-claude-md.json       |       4        | ~8KB       |
| setup-ide.json             |       3        | ~8KB       |
| setup-tips.json            |       4        | ~8KB       |
| setup-permissions.json     |       3        | ~7KB       |
| setup-customization.json   |       3        | ~6KB       |
| setup-troubleshooting.json |       5        | ~10KB      |

全ファイル 50KB 以下の見込み。最大は setup-first-steps.json と setup-troubleshooting.json（各 ~10KB）。

---

## 9. 実装上の制約

### Git 操作

- **git commit / push 等の Git 操作は全ての実装が完了してから最後にまとめて行う**
- 実装途中での中間コミットは行わない

### 実装方式

- **agent-teams スキルを使い、teammate をスポーンさせて並列実装すること**
- 独立した JSON データファイルの作成は並列で実行可能
- UI ファイル（constants.tsx, section-icons.tsx, index.tsx）はデータファイル完成後に順次実装

---

## 10. テスト計画

テストフレームワークは未導入のため、手動確認:

- [ ] `pnpm run typecheck` が通る
- [ ] `pnpm run build` が成功
- [ ] 開発サーバーで `/setup` ページが正常表示
- [ ] 全タブ（すべて、Phase 1/2/3、各セクション）が正常動作
- [ ] 検索機能が全ステップを対象に動作
- [ ] モーダル表示が全ステップで正常
- [ ] レスポンシブ表示（モバイル幅）の確認
- [ ] フェーズ見出しの表示確認
- [ ] セクション番号（1-1, 1-2 等）の表示確認
