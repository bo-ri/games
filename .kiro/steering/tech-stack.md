# 技術スタック運用ガイド

## 目的

このファイルは、広辞苑カルタの技術スタックに関する運用指針をまとめる。
依存関係の追加やツール選定時に迷いを減らし、判断基準を一貫させるための指針とする。

## 対象範囲

- 言語・ランタイム・フレームワーク
- 主要ライブラリの役割
- ビルド/開発ツールの使い分け
- 依存追加の判断基準

## 現状のスタック前提

リポジトリは最小構成で、実装はこれから拡張される前提。
以下は現時点の基準として扱い、変更時は本ファイルを更新する。

## 言語とランタイム

- **言語**: TypeScript
- **ランタイム**: Node.js 24+（`package.json` の `engines` に準拠）
- **パッケージマネージャ**: pnpm 10.x（`packageManager` に準拠）

### 運用ルール

- 実装は TypeScript を前提とし、JS での追加実装は避ける
- 新しいツール導入時は Node 24+ で動作確認する

```ts
// TypeScript を前提とした型定義を優先
type RouteId = string
```

## フレームワーク/ルーティング

- **UI**: React
- **ルーティング**: react-router（最新バージョン）

### 運用ルール

- UI 層は React を基準に設計する
- ルーティングは react-router の最新バージョンを標準とし、他のルータ導入は避ける
- SPA 構成を前提にし、サーバーサイドレンダリングは行わない

```tsx
import { Route, Routes } from "react-router"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}
```

## 開発ツール

- **Lint/Format**: Biome
- **Test Runner**: Vitest

### 運用ルール

- コードスタイルは Biome を唯一の基準とする
- テストは Vitest に統一し、別ランナーの混在を避ける

```bash
pnpm run lint
pnpm run format
pnpm run test
```

## ビルド/開発フロー

### 想定コマンド

- `pnpm run dev` : 開発サーバ
- `pnpm run build` : 本番ビルド
- `pnpm run test` : テスト実行

### 運用ルール

- コマンドは `pnpm` 経由で統一する
- バージョン管理に `npm`/`yarn` を混在させない
- 本番デプロイは静的ファイルを CDN に配置する前提とする
- 本番環境ではサーバー/DB を利用せず、開発時のみ開発サーバを起動する

## 配信/デプロイ方針

- **配信形態**: SPA を静的ビルドして CDN に配置
- **データ**: かるたのお題は JSON の静的ファイルとして CDN で配信
- **サーバー/DB**: 不要（API サーバや DB は運用しない）

## 静的 JSON 仕様

かるたの種類が増えても扱えるよう、標準フォーマットを固定する。
`assets/data/kojien.json` は `meta` と `items` を持つオブジェクト形式とする。
標準配置パスは `assets/data/kojien.json` とする。
ゲーム選択 UI のために `assets/data/{gameId}.json` の命名規則を採用する。
`gameId` は小文字のケバブケース（例: `kojien`, `edo-utsushi`）に統一する。

- `description`: お題（読み札の文章）
- `howtoread_description`: お題の読み方（音声読み上げ/AI リーディング用）
- `answer`: 答え
- `howtoread_answer`: 答えの読み方

```json
{
  "meta": {
    "title": "広辞苑カルタ",
    "description": "広辞苑から選んだ語句で遊ぶカルタ"
  },
  "items": [
    {
      "description": "あさくさで つけたるけんは あさくさに",
      "howtoread_description": "あさくさで つけたるけんは あさくさに",
      "answer": "浅草",
      "howtoread_answer": "あさくさ"
    }
  ]
}
```

### メタ情報の扱い

ゲーム一覧で表示する情報は `assets/data/kojien.json` の `meta` を参照する。

```ts
type GameMeta = {
  title: string
  description: string
}
```

- `title`: UI に表示するゲーム名
- `description`: ゲームの簡易説明

```ts
// 静的 JSON を取得する前提
const response = await fetch("/assets/cards.json")
const cards = await response.json()
```

## 主要ライブラリの扱い

### 導入判断の基準

- 既存のスタックで解決できるかを優先的に検討する
- 導入時は「目的」「置き換え対象」「メンテ負荷」を説明できること
- 依存追加は `tech.md` と本ファイルの双方に反映する

### 例: 追加時のメモ

```markdown
- 目的: ルーティング強化
- 置き換え対象: react-router
- 理由: 既存より小さなAPIで済む
```

## バージョンポリシー

- Node は LTS 相当の 24 系を前提とする
- pnpm は `packageManager` の指定バージョンを基準とする
- 新しい大規模依存を導入する場合は互換性を明記する
- react-router は最新安定版に追従する

## 更新時のチェック

- `package.json` の `engines`/`packageManager` と整合するか
- 既存のステアリング（`tech.md`）と重複/矛盾がないか
- 秘密情報が含まれていないか

---

updated_at: 2026-01-24
