# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.
---

## Summary
- **Feature**: `kojien-carta`
- **Discovery Scope**: Extension
- **Key Findings**:
  - Web Speech API の SpeechSynthesis と SpeechSynthesisUtterance を使用して読み上げ速度（rate）やイベント（boundary/end）を制御できる
  - 読み上げの進捗表示は SpeechSynthesisUtterance の boundary イベントで文字単位の進行を取得できる
  - データは `assets/data/{gameId}.json` の静的 JSON とし、`meta` と `items` の検証が必須
  - 読み上げは `howtoread_*` フィールド、表示は `description`/`answer` を使う分離が必要
  - answer はモーダルで提示し、`howtoread_answer` をふりがなとして併記する必要がある
  - 読み札カードは高さ 50vh を固定し、本文は 15 文字ごとの改行ルールを適用する
  - 読み上げ速度のサンプル再生は専用ボタンで実行し、スライダー変更では再生しない

## Research Log

### Web Speech API の仕様確認
- **Context**: 読み上げ速度調整と文字単位の表示に必要な API を特定するため
- **Sources Consulted**:
  - https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- **Findings**:
  - SpeechSynthesisUtterance の `rate` プロパティで読み上げ速度を制御できる
  - `boundary` / `end` / `error` イベントで読み上げ進行と終了を検知できる
  - `speechSynthesis.speak()` で読み上げ開始、`speechSynthesis.cancel()` で停止可能
- **Implications**:
  - 読み上げ速度スライダーは `rate` に反映し、サンプル読み上げはボタン操作でのみ実行する
  - 文字単位の表示は boundary イベントの進捗情報に同期させる

### UI 表示要件の整理
- **Context**: 読み札の改行と解答モーダルの表示制約を整理するため
- **Sources Consulted**: requirements.md
- **Findings**:
  - 読み札カードは高さ 50vh を固定し、本文は 15 文字ごとに改行する必要がある
  - `answer` はモーダルで表示し、`howtoread_answer` をふりがなとして併記する
  - 次へボタンは解答モーダル内に配置する必要がある
- **Implications**:
  - CartaCardView は高さ固定と 15 文字改行の両方を満たすレイアウトが必要
  - AnswerModalView は answer とふりがなを同時に表示する

### 静的 JSON データ仕様
- **Context**: データ取得と表示の制約を明確化するため
- **Sources Consulted**: `.kiro/steering/tech-stack.md`
- **Findings**:
  - `assets/data/{gameId}.json` を標準配置とし、`meta` と `items` を持つ
  - `items` は `description` と `answer` に加え `howtoread_description` と `howtoread_answer` を含む
- **Implications**:
  - GameDataLoader は JSON 構造と読み上げ用フィールドの検証を行い、エラー時は UI に明示する

### 読み上げと表示の分離
- **Context**: 読み上げと画面表示で参照するフィールドが異なるため
- **Sources Consulted**: requirements.md
- **Findings**:
  - 読み上げは `howtoread_description`/`howtoread_answer` を使用する
  - 画面表示は `description`/`answer` を使用する
- **Implications**:
  - ReadingFlowController と SpeechController は読み上げ用フィールドを受け取り、UI は表示用フィールドを保持する

### 待機時間とローディング
- **Context**: 待機中のローディングと待機時間の要件が更新されたため
- **Sources Consulted**: requirements.md
- **Findings**:
  - ローディングは次の札開始前の 3 秒間のみ表示する
  - 2回目の `howtoread_description` と `howtoread_answer` の間は 10 秒待機する
- **Implications**:
  - 読み上げフローはローディング状態を最初の待機に限定し、10 秒待機は表示を伴わない

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Feature Scoped Controller | ページ単位の状態管理とサービス層を分離 | 境界が明確、実装の並行性が高い | 状態遷移が複雑化しやすい | SPA 前提に合致 |
| Global Store | 全画面で状態を共有 | 将来拡張に備えやすい | 現時点では過剰設計 | 現段階では採用しない |

## Design Decisions

### Decision: 読み上げ制御の専用アダプタを設ける
- **Context**: 読み上げ速度変更、文字単位表示、エラー処理を UI から分離する必要がある
- **Alternatives Considered**:
  1. UI で直接 SpeechSynthesis を制御する
  2. SpeechController で一元管理する
- **Selected Approach**: SpeechController を用意し、読み上げ開始/終了/進行イベントを集約する
- **Rationale**: UI からの依存を減らし、読み上げフローの再利用とテスト容易性を確保する
- **Trade-offs**: コンポーネント数が増える
- **Follow-up**: 実装時に boundary イベントが文字単位で取得できるか確認する

### Decision: 読み上げ進行の状態機械を採用する
- **Context**: 3秒待機、2回読み上げ、次へボタン表示など複数の時間条件がある
- **Alternatives Considered**:
  1. UI のイベントで逐次制御する
  2. ReadingFlowController で状態とタイマーを管理する
- **Selected Approach**: ReadingFlowController による状態管理とタイマー制御
- **Rationale**: 複雑な遷移を明示し、後続タスクのテストを容易にする
- **Trade-offs**: 状態定義が増える
- **Follow-up**: タイマーの中断とキャンセル動作を明確化する

## Risks & Mitigations
- ブラウザで SpeechSynthesis が無効な場合 — 機能非対応メッセージと手動表示のみへのフォールバック
- 読み上げイベント取得のばらつき — `end`/`error` イベントを使ったフェイルセーフ設計
- 読み上げ中の遷移で音声が残る — 画面遷移時に cancel を必ず実行する

## References
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — 仕様と利用方法
- [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) — rate とイベント仕様
