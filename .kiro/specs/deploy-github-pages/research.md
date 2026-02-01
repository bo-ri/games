# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.
---

## Summary
- **Feature**: `deploy-github-pages`
- **Discovery Scope**: Complex Integration
- **Key Findings**:
  - GitHub Pages のカスタムワークフローでは `configure-pages` / `upload-pages-artifact` / `deploy-pages` の一連を用い、`pages: write` と `id-token: write` 権限が必要。
  - GitHub Pages は `github-pages` 環境でのデプロイを推奨し、ワークフローからの最新デプロイ URL を取得可能。
  - デプロイ記録は GitHub Actions の実行ログ/サマリと環境デプロイ履歴に集約でき、外部 DB を追加せずに可観測性を満たせる。

## Research Log

### GitHub Pages の公開方式とワークフロー要件
- **Context**: main マージ済み commit に対して任意でデプロイする要件に適合する公開方式の確認。
- **Sources Consulted**:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
  - https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- **Findings**:
  - ブランチ公開とカスタム GitHub Actions の二択で、任意実行はカスタムワークフローが前提。
  - `configure-pages` / `upload-pages-artifact` / `deploy-pages` の使用が推奨され、デプロイは `github-pages` 環境に紐付く。
  - `deploy-pages` 実行には `pages: write` と `id-token: write` の権限が必要。
- **Implications**: デプロイの主体は GitHub Actions ワークフローに統一し、権限設計と環境保護を設計要素として扱う。

### GitHub Pages の公開特性と制約
- **Context**: SPA 配信と成果物完全性に関する制約の把握。
- **Sources Consulted**:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
  - https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- **Findings**:
  - GitHub Pages は静的成果物の公開を前提とし、公開後は公開 URL が安定して提供される。
  - Pages はワークフロー実行履歴でデプロイの状態を確認できる。
- **Implications**: SPA のルーティング互換は成果物構成で担保し、失敗時の記録はワークフロー実行ログに集約する。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Branch Publish | `gh-pages` ブランチに成果物を配置して公開 | シンプル | 任意デプロイ制御が弱い | 要件の任意実行に不適合 | 
| Custom Workflow | GitHub Actions でビルドとデプロイを分離 | 任意実行・検証・可観測性 | ワークフロー設計が必要 | 要件に適合、採用 | 

## Design Decisions

### Decision: GitHub Actions カスタムワークフローを採用
- **Context**: main マージ済み commit に対する任意デプロイを要件で要求。
- **Alternatives Considered**:
  1. Branch Publish — `gh-pages` ブランチへの push で公開
  2. Custom Workflow — Actions でビルドとデプロイを実行
- **Selected Approach**: Custom Workflow を採用し、手動トリガーと commit 検証を組み合わせて運用する。
- **Rationale**: 手動実行とデプロイ条件を制御でき、デプロイ結果の記録も一元化できる。
- **Trade-offs**: ワークフロー設計と権限管理が必要。
- **Follow-up**: main ブランチの commit 祖先判定ロジックの妥当性を実装時に確認する。

### Decision: デプロイ記録は GitHub Actions 実行履歴に集約
- **Context**: 成否・失敗理由・実行中の状態記録が要件に含まれる。
- **Alternatives Considered**:
  1. 外部ストレージに履歴保存
  2. GitHub Actions の実行ログ/サマリに集約
- **Selected Approach**: GitHub Actions に集約し、外部 DB を追加しない。
- **Rationale**: 既存スタック方針に合致し、運用負荷が低い。
- **Trade-offs**: 詳細な履歴検索には GitHub UI 依存。
- **Follow-up**: 必要なら将来的に API 連携で履歴抽出を追加する。

## Risks & Mitigations
- main 以外の commit を誤ってデプロイするリスク — commit 祖先判定で拒否し、失敗理由を記録する。
- SPA 直リンクで 404 になるリスク — ルーティング互換の成果物構成を要求に含める。
- 権限過多のリスク — `pages: write` と `id-token: write` を最小権限で付与する。

## References
- [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) — 公開方式の公式説明
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) — Actions でのデプロイ構成
