# Claude Code Release Note

Claude Code のリリースノートを日本語で閲覧できる Web アプリケーション。

## 技術スタック

| カテゴリ             | 技術                                                            |
| -------------------- | --------------------------------------------------------------- |
| フレームワーク       | [React Router v7](https://reactrouter.com/) (SSR モード)        |
| UI ライブラリ        | [React](https://react.dev/) 19                                  |
| アニメーション       | [Motion](https://motion.dev/)                                   |
| 言語                 | TypeScript 5.9                                                  |
| ビルドツール         | [Vite](https://vite.dev/) 7                                     |
| パッケージマネージャ | pnpm                                                            |
| フォント             | Noto Sans JP / JetBrains Mono (Google Fonts)                    |
| スタイリング         | インラインスタイル (`CSSProperties`) — CSS フレームワーク不使用 |

## リリースノート収録バージョン

全 88 バージョンを収録 (2.0.0 〜 2.1.34)

## コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動 (http://localhost:5173)
pnpm run dev

# プロダクションビルド
pnpm run build

# ビルド済みアプリの起動
pnpm run start

# 型生成 + TypeScript 型チェック
pnpm run typecheck
```

## プロジェクト構成

```
app/
├── data/
│   └── releases.json      # 日本語翻訳済みリリースデータ
├── routes.ts               # ルート定義
├── root.tsx                # ルートレイアウト
└── routes/
    └── release-note.tsx    # メインページ
```

## データフロー

`https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md` (英語) → `app/data/releases.json` (日本語 JSON) → `app/routes/release-note.tsx` (表示)

## 機能

- バージョンごとの折りたたみカード表示
- タグによるフィルタリング (`新機能` / `バグ修正` / `改善` / `SDK` / `IDE` / `Platform` / `Security` / `Perf` / `非推奨` / `Plugin`)
- キーワード検索
