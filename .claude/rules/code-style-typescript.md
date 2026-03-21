---
paths:
  - "app/**/*.{ts,tsx}"
---
<!-- generated-by: sync-rules, last-synced: 2026-03-20 -->

# TypeScript コードスタイル

<!-- sync-rules:begin:formatting-deferral -->
## フォーマット

- **フォーマット規則** — Prettier に委譲（`.prettierrc`: printWidth 100, ダブルクォート, trailing commas, 2スペースインデント）
  - Rationale: Prettier が自動整形するため、手動ルールは不要
- **コード品質** — ESLint に委譲（`eslint.config.js`: typescript-eslint, react, react-hooks, eslint-config-prettier）
  - Rationale: ESLint が検出・修正するルールを重複させない
- **型チェック** — TypeScript に委譲（`tsconfig.json`: strict モード有効）
  - Rationale: `pnpm run typecheck` で型安全性を担保
<!-- sync-rules:end:formatting-deferral -->

<!-- sync-rules:begin:function-style -->
## 関数スタイル

- **React コンポーネントおよび関数はアロー関数で統一する**
  - Rationale: プロジェクト全体で `function` 宣言ではなくアロー関数に統一されている

### Examples

```tsx
// Good: アロー関数でコンポーネントを定義
export const PageHeader = ({ title }: PageHeaderProps) => {
  return <h1>{title}</h1>;
};

// Bad: function 宣言でコンポーネントを定義
export function PageHeader({ title }: PageHeaderProps) {
  return <h1>{title}</h1>;
}
```
<!-- sync-rules:end:function-style -->

<!-- sync-rules:begin:naming -->
## 命名規則

- **コンポーネント**: PascalCase（例: `PageHeader`, `Badge`, `DetailModalShell`）
  - Rationale: React の慣例に従い、JSX 要素と区別する
- **フック**: camelCase + `use` プレフィックス（例: `usePageState`, `useModalLock`）
  - Rationale: React Hooks の公式命名規則
- **ユーティリティ関数**: camelCase（例: `matchesQuery`, `renderInlineMarkdown`）
  - Rationale: JavaScript/TypeScript の標準的な関数命名
- **定数**: UPPER_SNAKE_CASE（例: `TAG_COLORS`, `ALL_PAGES`）
  - Rationale: 変更されない値であることを明示する

### Examples

```ts
// Good: 適切な命名規則
export const SearchInput = ({ ... }: SearchInputProps) => { ... };  // コンポーネント
export const usePageState = (config: Config) => { ... };            // フック
export const matchesQuery = (fields: string[], q: string) => { ... }; // ユーティリティ
export const TAG_COLORS: Record<string, string> = { ... };         // 定数

// Bad: 命名規則の混在
export const search_input = () => { ... };  // コンポーネントに snake_case
export const PageState = () => { ... };     // フックに PascalCase（use なし）
export const tag_colors = { ... };          // 定数に snake_case
```
<!-- sync-rules:end:naming -->

<!-- sync-rules:begin:imports -->
## インポート順序

- **React / ライブラリのインポートを先頭に配置する**
  - Rationale: 外部依存と内部コードを視覚的に区別する
- **`~/` エイリアスを使ったローカルインポートをその後に配置する**
  - Rationale: `tsconfig.json` の paths 設定に従い、相対パスの深いネストを避ける
- **型インポートは `import type` で分離する**
  - Rationale: ランタイムと型のみの依存を明確に区別する

### Examples

```ts
// Good: 正しいインポート順序
import { Links, Meta, Outlet } from "react-router";
import { motion } from "motion/react";

import type { Route } from "./+types/root";
import { Badge } from "~/components/badge";
import { usePageState } from "~/hooks/usePageState";
import "./app.css";

// Bad: インポートが混在
import { Badge } from "~/components/badge";
import { Links, Meta } from "react-router";
import type { Route } from "./+types/root";
import { motion } from "motion/react";
```
<!-- sync-rules:end:imports -->

<!-- sync-rules:begin:path-alias -->
## パスエイリアス

- **`~/` エイリアスで `app/` ディレクトリを参照する**
  - Rationale: `tsconfig.json` の `paths` 設定（`~/*` → `./app/*`）に統一する

### Examples

```ts
// Good: パスエイリアスを使用
import { Badge } from "~/components/badge";

// Bad: 相対パスで深くネスト
import { Badge } from "../../../components/badge";
```
<!-- sync-rules:end:path-alias -->
