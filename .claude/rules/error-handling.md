---
paths:
  - "app/**/*.{ts,tsx}"
---
<!-- generated-by: sync-rules, last-synced: 2026-03-20 -->

# エラーハンドリング

<!-- sync-rules:begin:strategy -->
## 基本方針

- **TypeScript strict モードを主要な安全機構として利用する**
  - Rationale: コンパイル時に型エラーを検出し、ランタイムエラーを未然に防ぐ
- **明示的な try/catch は最小限にする**
  - Rationale: フロントエンド表示専用アプリケーションのため、複雑なエラー処理は不要
<!-- sync-rules:end:strategy -->

<!-- sync-rules:begin:error-boundary -->
## React Error Boundary

- **`root.tsx` の `ErrorBoundary` コンポーネントでランタイムエラーをキャッチする**
  - Rationale: React Router の `isRouteErrorResponse` で 404 等のルートエラーと一般エラーを区別する
- **開発環境のみスタックトレースを表示する（`import.meta.env.DEV`）**
  - Rationale: 本番環境でのエラー詳細の漏洩を防ぐ

### Examples

```tsx
// Good: React Router の ErrorBoundary パターン
export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (isRouteErrorResponse(error)) {
    // ルートエラー（404 等）の処理
    return <p>{error.status === 404 ? "ページが見つかりません" : error.statusText}</p>;
  }
  // 開発環境のみ詳細表示
  if (import.meta.env.DEV && error instanceof Error) {
    return <pre>{error.stack}</pre>;
  }
  return <p>予期しないエラーが発生しました</p>;
};

// Bad: 各コンポーネントで個別に try/catch
export const MyComponent = () => {
  try {
    const data = processData();
    return <div>{data}</div>;
  } catch (e) {
    return <div>エラー</div>;
  }
};
```
<!-- sync-rules:end:error-boundary -->
