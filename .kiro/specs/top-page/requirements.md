# Requirements Document

## Introduction
広辞苑カルタリーダーのトップページとして、利用可能なゲームを一覧表示し、
静的 JSON データからゲームを選択できる体験を提供する。

## Requirements

### Requirement 1: ゲーム一覧の提示
**Objective:** As a プレイヤー, I want 利用可能なゲームを一覧で確認する, so that 遊びたいカルタを選べる

#### Acceptance Criteria
1. [1.1] When ユーザーがトップページを開いたとき, the Top Page shall 利用可能なゲームの一覧を表示する
2. [1.2] While ゲーム一覧データを読み込み中のとき, the Top Page shall 読み込み中の状態を表示する
3. [1.3] The Top Page shall 各ゲームの `meta.title` と `meta.description` を表示する
4. [1.4] If ゲーム一覧データの読み込みに失敗したとき, the Top Page shall エラー内容をユーザーに通知する
5. [1.5] If 利用可能なゲームが存在しないとき, the Top Page shall ゲームがない旨を表示する

### Requirement 2: ゲームの選択と遷移
**Objective:** As a プレイヤー, I want ゲームを選択して開始画面へ移動する, so that すぐにカルタを開始できる

#### Acceptance Criteria
1. [2.1] When ユーザーがゲームを選択したとき, the Top Page shall 選択したゲームの開始画面へ遷移する
2. [2.2] When ユーザーがゲームを選択したとき, the Top Page shall 選択したゲームに対応する JSON データを参照する
3. [2.3] If 選択したゲームのデータが存在しないとき, the Top Page shall 選択に失敗した旨をユーザーに通知する

### Requirement 3: 静的データの前提
**Objective:** As a 運用者, I want 静的ファイルだけでトップページが動作する, so that CDN 配信だけで運用できる

#### Acceptance Criteria
1. [3.1] The Top Page shall `assets/data/{gameId}.json` の静的 JSON からゲーム情報を取得する
2. [3.2] The Top Page shall サーバー API やデータベースを前提としない
3. [3.3] Where 静的 JSON に `meta` 情報が含まれる場合, the Top Page shall 一覧表示に `meta.title` と `meta.description` を使用する
