---
paths:
  - "app/**/*.{ts,tsx}"
---
<!-- generated-by: sync-rules, last-synced: 2026-03-20 -->

# アーキテクチャ

<!-- sync-rules:begin:layer-structure -->
## レイヤー構造

- **ルート層** (`app/routes/*/`): 各ルートは `index.tsx` + `detail-modal.tsx` + `constants.tsx` のセットで構成する
  - Rationale: ルートごとに表示・モーダル・定数を分離し、責務を明確にする
- **コンポーネント層** (`app/components/`): 複数ルートで共有する再利用可能な UI コンポーネント
  - Rationale: `PageHeader`, `BaseCard`, `DetailModalShell` 等の共通部品を一元管理する
- **データ層** (`app/data/*/`): JSON ファイルによる構造化コンテンツ + `index.ts` でエクスポート
  - Rationale: コンテンツとロジックを分離し、データ追加時にコード変更を最小化する
- **フック層** (`app/hooks/`): ページ状態管理等のカスタムフック
  - Rationale: `usePageState` 等の共通ロジックを再利用可能にする

### Examples

```
// Good: ルートの標準構成
app/routes/release-note/
  ├── index.tsx          // メインページコンポーネント
  ├── detail-modal.tsx   // 詳細モーダル
  └── constants.tsx      // ルート固有の定数

// Bad: ルートに全てを詰め込む
app/routes/release-note/
  └── index.tsx          // 全ロジック・定数・モーダルが1ファイルに
```
<!-- sync-rules:end:layer-structure -->

<!-- sync-rules:begin:data-flow -->
## データフロー

- **JSON データファイル → `index.ts` でインポート・結合 → ルートコンポーネントで表示**
  - Rationale: データの追加・更新時に JSON ファイルの編集のみで済む設計
- **データファイルはバージョン範囲ごとに分割する（10刻み）**
  - Rationale: ファイルサイズを 50KB 以下に維持し、管理性を保つ
- **新しい10刻み範囲のファイル作成時は `index.ts` にインポートを1行追加するのみ**
  - Rationale: コード変更の影響範囲を最小限に抑える

### Examples

```ts
// Good: データ層の構成
// app/data/releases/index.ts
import releases_2_1_0x from "./releases-2.1.0x.json";
import releases_2_1_1x from "./releases-2.1.1x.json";

export const allReleases = [...releases_2_1_0x, ...releases_2_1_1x];

// Bad: ルートコンポーネント内でデータを直接定義
// app/routes/release-note/index.tsx
const releases = [{ version: "2.1.0", ... }, { version: "2.1.1", ... }];
```
<!-- sync-rules:end:data-flow -->

<!-- sync-rules:begin:shared-components -->
## 共有コンポーネントパターン

- **ページ共通の状態管理は `usePageState` フックで統一する**
  - Rationale: タブフィルタ・検索・モーダル状態の管理ロジックを各ルートで重複させない
- **共通コンポーネント (`PageHeader`, `BaseCard`, `ItemGrid`, `DetailModalShell` 等) を活用する**
  - Rationale: 新規ページ追加時に既存の UI パターンを再利用し、一貫した UX を維持する

### Examples

```tsx
// Good: 共有フックとコンポーネントを活用
import { usePageState } from "~/hooks/usePageState";
import { PageHeader } from "~/components/page-header";
import { ItemGrid } from "~/components/item-grid";

export const MyPage = () => {
  const { filteredItems, ... } = usePageState(config);
  return (
    <>
      <PageHeader title="ページ名" />
      <ItemGrid items={filteredItems} />
    </>
  );
};

// Bad: 各ルートで状態管理を個別実装
export const MyPage = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  // ... フィルタロジックを毎回書く
};
```
<!-- sync-rules:end:shared-components -->
