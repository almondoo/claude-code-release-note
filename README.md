# Claude Code Release Note

Claude Code のリリースノートを日本語で閲覧できる Web アプリケーションです。

## このプロジェクトについて

[Claude Code](https://claude.ai/code) は Anthropic が提供する CLI ツールですが、公式の [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) は英語のみで提供されています。このプロジェクトは、そのリリースノートを日本語に翻訳し、見やすい形式で閲覧できるようにしたものです。

## 主な機能

- **日本語リリースノート** — 公式 CHANGELOG の各バージョン情報を日本語で表示（v2.0.0 以降を収録）
- **バージョンごとの折りたたみカード** — バージョンごとに内容をまとめ、展開・折りたたみで閲覧可能
- **タグフィルタリング** — `新機能` / `バグ修正` / `改善` / `非推奨` の変更タイプと、`SDK` / `IDE` / `Platform` / `Windows` / `Security` / `Perf` / `Plugin` / `MCP` / `Agent` の対象領域でフィルタリング
- **キーワード検索** — リリースノート全体をキーワードで横断検索
- **バージョン詳細** — 主要バージョンの変更内容を専用ページでより詳しく解説
- **日英切り替え** — UI の表示言語を日本語と英語で切り替え可能

## ページ構成

| パス                   | 内容                                          |
| ---------------------- | --------------------------------------------- |
| `/`                    | リリースノート一覧                            |
| `/version/:version`    | バージョン詳細                                |
| `/best-practices`      | ベストプラクティス                            |
| `/hands-on`            | ハンズオン（`/hands-on/:topic` で各トピック） |
| `/harness-engineering` | ハーネスエンジニアリング                      |
| `/workflows`           | ワークフロー                                  |

## 技術スタック

- React 19 + [React Router v7](https://reactrouter.com/)（SSR モード）
- Tailwind CSS v4
- Vitest
- Vercel（デプロイ）

## 開発

```bash
pnpm install     # 依存関係のインストール
pnpm run dev     # 開発サーバーの起動
pnpm run test    # テストの実行
pnpm run check   # 型チェック + ESLint + Prettier
```

## データの流れ

公式 CHANGELOG（英語）の内容を日本語に翻訳し、`app/data/releases/` 配下の JSON データとして管理しています。新しいバージョンがリリースされるたびに、翻訳データを追加して更新しています。
