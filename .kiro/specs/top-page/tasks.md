# Tasks Document

## 目的
トップページのゲーム一覧機能を設計に沿って実装し、静的 JSON からの読み込み、状態表示、遷移導線までを整える。

## タスク一覧

### 1. データ取得と型定義
- [x] `GameMeta` と `GameSummary` の型定義を追加する
- [x] `assets/data/index.json` と `assets/data/{gameId}.json` の取得ロジックを作成する
- [x] `gameIds` の検証（配列でない場合はエラー）を実装する
- [x] `meta.title` / `meta.description` が欠落したデータを除外する

### 2. TopPage の状態管理
- [x] `TopPage` に `status` / `games` / `error` の state を追加する
- [x] マウント時に index を取得し、ゲーム詳細を順次取得する
- [x] 取得結果に応じて `loading` / `ready` / `empty` / `error` を切り替える
- [x] 一部の gameId 取得失敗時は該当カードを除外し、全件失敗時はエラーにする

### 3. UI コンポーネント実装
- [x] `GameList` を実装し `GameSummary[]` を一覧表示する
- [x] `GameCard` を実装し `meta.title` / `meta.description` と「開始」ボタンを表示する
- [x] `LoadingState` / `ErrorState` / `EmptyState` を実装する
- [x] アクセシビリティのため `h1`/`h2` と明確なボタンラベルを付与する

### 4. ルーティングと遷移
- [x] `/` に TopPage を割り当てる
- [x] `/game/:gameId` への遷移を `GameCard` の「開始」ボタンで行う
- [x] 選択した gameId が無効な場合の通知 UI を追加する

### 5. エラーハンドリングと再試行
- [x] index 取得失敗時のエラーメッセージを表示する
- [x] 取得失敗時の再読み込みボタンを実装する
- [x] エラー文言が画面読み上げで伝わるようにする

### 6. 静的データの整備
- [x] `assets/data/index.json` を用意する（`gameIds` を含める）
- [x] `assets/data/{gameId}.json` に `meta` を含める

### 7. テストと動作確認
- [ ] ローディング/エラー/空状態/正常表示の UI を手動で確認する
- [ ] `gameIds` が空の場合に空状態が出ることを確認する
- [ ] `meta` 欠落データが一覧に出ないことを確認する

## 進行チェック
- 仕様の受け入れ条件（Requirements 1〜3）に紐づく動作を確認する
- デザインの状態遷移と UI 要件を満たすか確認する
