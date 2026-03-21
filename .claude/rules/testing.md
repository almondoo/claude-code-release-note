---
paths:
  - "app/**/*.test.{ts,tsx}"
---
<!-- generated-by: sync-rules, last-synced: 2026-03-20 -->

# テスト

<!-- sync-rules:begin:framework -->
## テストフレームワーク

- **Vitest を使用する（jsdom 環境）**
  - Rationale: `vitest.config.ts` で jsdom 環境が設定済み。React コンポーネントのテストに対応
- **React コンポーネントのテストには `@testing-library/react` を使用する**
  - Rationale: `render`, `screen` による DOM ベースのテストが既存パターン
<!-- sync-rules:end:framework -->

<!-- sync-rules:begin:file-placement -->
## ファイル配置

- **テストファイルはソースファイルと同階層の `__tests__/` ディレクトリに配置する**
  - Rationale: 既存パターン（`app/components/__tests__/`, `app/utils/__tests__/`）に従う
- **テストファイル名は `{対象ファイル名}.test.{ts,tsx}` とする**
  - Rationale: `.test.ts` はユーティリティ関数、`.test.tsx` は JSX を含むコンポーネントテストに使い分ける

### Examples

```
// Good: __tests__ ディレクトリに配置
app/components/
  ├── paragraph-list.tsx
  └── __tests__/
      └── paragraph-list.test.tsx

app/utils/
  ├── search.ts
  └── __tests__/
      └── search.test.ts

// Bad: ソースと同階層にテストファイルを混在
app/components/
  ├── paragraph-list.tsx
  └── paragraph-list.test.tsx
```
<!-- sync-rules:end:file-placement -->

<!-- sync-rules:begin:test-structure -->
## テスト構造

- **`describe` で対象の関数・コンポーネント名をグルーピングする**
  - Rationale: テスト対象ごとにスコープを明確にする
- **`it` の説明は日本語で記述する**
  - Rationale: サイト全体が日本語で統一されている
- **セクション区切りにコメントブロックを使用する**
  - Rationale: 複数の `describe` ブロック間の視認性を向上させる

### Examples

```ts
// Good: 日本語の説明 + セクション区切り
/* ================================================================
 *  parseHeading
 * ================================================================ */
describe("parseHeading", () => {
  it("# を h1 として解析する", () => {
    expect(parseHeading("# タイトル")).toEqual({ level: 1, text: "タイトル" });
  });

  it("通常のテキストは null を返す", () => {
    expect(parseHeading("これは段落です")).toBeNull();
  });
});

// Bad: 英語の説明 + 区切りなし
describe("parseHeading", () => {
  it("should parse # as h1", () => { ... });
  it("should return null for plain text", () => { ... });
});
```
<!-- sync-rules:end:test-structure -->
