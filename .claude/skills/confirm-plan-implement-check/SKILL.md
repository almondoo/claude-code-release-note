---
name: confirm-plan-implement-check
description: Use when about to implement any code change, fix, or feature in this project. Required before writing any code.
---

# 確認 → 計画 → 実装 → チェック

## Overview

コードを書く前に必ず4ステップを踏む。実装後は必ず検証コマンドで確認する。

## The 4 Steps

### Step 1: 確認（Confirm）

実装を始める**前に**、ユーザーの意図を確認する。

- 何を変更するのか（スコープ）
- 何を変更しないのか（境界）
- 不明点があれば `AskUserQuestion` で確認する

```
❌ 判断に迷いながらそのまま実装を始める
✅ 不明点を先に解消してから始める
```

### Step 2: 計画（Plan）

実装前に変更する箇所を洗い出す。

- 影響するファイルを特定する
- 変更手順を頭の中で整理する
- 複数の選択肢があれば、どれを採用するか決めてから始める

### Step 3: 実装（Implement）

計画に従ってコードを書く。

- 計画外の変更は行わない
- 動作確認が必要な場合は開発サーバーを使う（`pnpm run dev`）

### Step 4: チェック（Check）

実装後は**必ず**以下のコマンドを順番に実行する。

```bash
# 1. 型チェック（react-router typegen + tsc）
pnpm run typecheck

# 2. Lint
pnpm run lint

# 3. ビルド（本番ビルドが通るか）
pnpm run build
```

**全て通過するまで「完了」を宣言しない。**

## Red Flags

以下の考えが浮かんだら止まること：

| 思考 | 現実 |
|------|------|
| 「小さな変更だからチェックは省略していい」 | 小さな変更ほど見落としがある |
| 「さっき確認したから大丈夫」 | 実装後に状態が変わっている |
| 「型エラーは既存のものだから無視していい」 | 自分の変更で増えていないか必ず確認 |
| 「buildは重いから省略」 | ビルドでしか検出できないエラーがある |

## Common Mistakes

- **lint エラーを無視してコミット** → `pnpm run lint` が必須
- **typecheck を typegen なしで実行** → `pnpm run typecheck` は typegen を含むので必ずこれを使う
- **dev サーバーが動いているまま build** → `pnpm run build` は独立して実行できるが、dev サーバーを止める必要はない

## Quick Reference

```bash
pnpm run typecheck   # react-router typegen && tsc
pnpm run lint        # eslint .
pnpm run build       # react-router build
pnpm run format      # prettier --write .（必要に応じて）
```
