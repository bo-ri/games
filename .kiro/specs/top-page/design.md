# Design Document

## Overview
トップページは静的 JSON から利用可能なゲームを取得し、一覧表示と選択導線を提供する。
読み込み中/エラー/空状態を明確に分け、選択したゲームの開始画面へ遷移する。

## Goals
- 静的 JSON のみでゲーム一覧を構成する
- `meta.title` と `meta.description` を使った一覧表示を行う
- 読み込み/エラー/空状態をユーザーに伝える

## Non-Goals
- ゲーム開始後の進行ロジックの実装
- サーバー API や DB の導入

## Assumptions
- ゲーム一覧は `assets/data/index.json` に `gameIds` 配列で保持する
- 各ゲームの詳細は `assets/data/{gameId}.json` の `meta` を参照する

## Data Design

### Game Index
`assets/data/index.json`
```json
{
  "gameIds": ["kojien"]
}
```

### Game Meta
`assets/data/{gameId}.json`
```json
{
  "meta": {
    "title": "広辞苑カルタ",
    "description": "広辞苑から選んだ語句で遊ぶカルタ"
  },
  "items": []
}
```

### TypeScript Types
```ts
type GameMeta = {
  title: string
  description: string
}

type GameSummary = {
  gameId: string
  meta: GameMeta
}
```

## UI/UX
- ページ構成: タイトル、説明文、ゲーム一覧カード
- ゲームカード: `meta.title` を見出し、`meta.description` を本文、CTA は「開始」
- ローディング表示: スピナーと「読み込み中」テキスト
- エラー表示: 取得失敗時のメッセージと再読み込みボタン
- 空状態: 「利用可能なゲームがありません」を表示

## Routing
- `/` : Top Page
- `/game/:gameId` : 選択したゲームの開始画面

## Behavior

### Data Flow
1. Top Page マウント時に `assets/data/index.json` を取得
2. `gameIds` を順に `assets/data/{gameId}.json` で取得
3. 取得した `meta` を `GameSummary` に整形して一覧に表示

### Error Handling
- `index.json` 取得失敗: エラーメッセージ表示
- `gameId` の JSON 取得失敗: そのゲームを一覧から除外し、全件失敗ならエラー表示
- `meta` が欠落: エラーとして扱い、一覧から除外

### Empty State
- `gameIds` が空、または有効な `GameSummary` が 0 件の場合は空状態表示

## Component Structure
- `TopPage`: データ取得と状態制御
- `GameList`: `GameSummary[]` を受け取り一覧表示
- `GameCard`: 単一ゲームの表示と遷移ボタン
- `LoadingState` / `ErrorState` / `EmptyState`: 画面状態の切り替え用

## State Management
React の `useState`/`useEffect` で管理し、以下の状態を持つ。

- `status`: `"loading" | "ready" | "error" | "empty"`
- `games`: `GameSummary[]`
- `error`: `string | null`

## Accessibility
- 見出しは `h1`/`h2` を使用
- ボタンに明確なラベルを付与
- ローディングとエラーは画面読み上げで伝わるテキストを含める

## Validation
- `meta.title`/`meta.description` が未定義なら無効データとして除外
- `gameIds` が配列でない場合はエラーとして扱う
