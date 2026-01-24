# 技術スタック

## アーキテクチャ

現状は最小構成のリポジトリで、アプリケーション構成や実装は未確定。

## コア技術

- **言語**: TypeScript
- **フレームワーク**: react, react-router
- **ランタイム**: Node.js 24+

## 主要ライブラリ

- react-router

## 開発標準

### 型安全性
Typescriptにより型安全性を担保する

### コード品質
biomeを利用したlint/format

### テスト
vitestを利用したテスト実行環境

## 開発環境

### 必須ツール
- Node.js 24.13.0（mise）
- pnpm（packageManagerで指定）

### 共通コマンド
```bash
# Dev
pnpm run dev
# Build
pnpm run build
# Test
pnpm run test
```

## 主要な技術的判断

- Node.js 24+ と pnpm を前提にする

---

updated_at: 2026-01-24
