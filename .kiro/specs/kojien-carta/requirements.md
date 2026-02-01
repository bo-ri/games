# Requirements Document

## Introduction
広辞苑かるたリーダーは、広辞苑かるたを選択したプレイヤー向けに上の句/下の句をランダムに提示し、読み手の代わりとなって二人でも遊べるようにする。

## Requirements

### Requirement 1: データ取得と整合性
**Objective:** As a プレイヤー, I want かるたのデータを読み込めること, so that ゲームを開始できる

#### Acceptance Criteria
1. When アプリが起動する, the Kojien Carta Reader shall `assets/data/{gameId}.json` からかるたデータを取得する
2. When データ取得が完了する, the Kojien Carta Reader shall `meta` と `items` を含むデータ構造を検証する
3. When データ取得が完了する, the Kojien Carta Reader shall `items` に `description` と `howtoread_description` と `answer` と `howtoread_answer` が揃っていることを検証する
4. If データ取得に失敗する, the Kojien Carta Reader shall 取得失敗を示すメッセージを表示する
5. If データ構造が不正である, the Kojien Carta Reader shall ゲーム開始を無効化し理由を表示する
6. The Kojien Carta Reader shall データ取得の成否を画面で確認できる状態にする

### Requirement 2: 選択済みゲームの表示
**Objective:** As a プレイヤー, I want 選択済みのゲーム情報を確認できること, so that 正しいゲームで開始できる

#### Acceptance Criteria
1. When トップページから広辞苑かるたを選択して遷移する, the Kojien Carta Reader shall 選択済みゲームとして広辞苑かるたを表示する
2. When 選択済みゲームが読み込み完了する, the Kojien Carta Reader shall `meta` の `description` を画面に表示する
3. When `meta` の `description` が表示される, the Kojien Carta Reader shall `meta` の `title` を表示する
4. If 選択済みゲームのメタ情報が取得できない, the Kojien Carta Reader shall 取得失敗を示すメッセージを表示する
5. The Kojien Carta Reader shall 現在選択中のゲーム名を常に表示する

### Requirement 3: 出題順と進行
**Objective:** As a プレイヤー, I want 上の句と下の句がランダムに提示されること, so that 毎回公平に遊べる

#### Acceptance Criteria
1. When ゲームが開始される, the Kojien Carta Reader shall `items` から出題順をランダムに決定する
2. When 札の読み上げが2回完了する, the Kojien Carta Reader shall 次へボタンを表示する
3. When プレイヤーが次へボタンを押す, the Kojien Carta Reader shall 未出題の札から次の札を選択する
4. If 未出題の札が残っていない, the Kojien Carta Reader shall ゲーム終了状態を表示する
5. When 全ての札を読み終える, the Kojien Carta Reader shall リセットボタンを表示する
6. The Kojien Carta Reader shall 最終的に全ての札を重複なく読み上げる
7. The Kojien Carta Reader shall 現在の出題番号と残り枚数を表示する

### Requirement 4: 読み上げスケジュール
**Objective:** As a プレイヤー, I want 読み札の読み上げが一定の間隔で進行すること, so that 札取りのタイミングを合わせられる

#### Acceptance Criteria
1. When プレイヤーが次へボタンを押してから3秒経過する, the Kojien Carta Reader shall 選択した札の `howtoread_description` を1回読み上げる
2. While 次へボタン押下後の3秒間が経過するまで, the Kojien Carta Reader shall ローディング表示を行う
3. When 1回目の `howtoread_description` 読み上げが完了してから3秒経過する, the Kojien Carta Reader shall 同じ札の `howtoread_description` を2回目として読み上げる
4. When 2回目の `howtoread_description` 読み上げが完了してから10秒経過する, the Kojien Carta Reader shall 同じ札の `howtoread_answer` を1回読み上げる

### Requirement 5: 読み札の提示
**Objective:** As a プレイヤー, I want description と answer を順番に確認できること, so that 読み手なしで遊べる

#### Acceptance Criteria
1. When 新しい札の `howtoread_description` の読み上げが開始される, the Kojien Carta Reader shall `description` の内容を表示する
2. While `howtoread_description` の読み上げ中である, the Kojien Carta Reader shall 現在読み上げている文字を1文字ずつ表示する
3. When `howtoread_description` の読み上げが完了する, the Kojien Carta Reader shall `description` を全文表示の状態にする
4. While `description` が画面の表示領域を超える, the Kojien Carta Reader shall 改行して読み札を表示する
5. When `howtoread_answer` の読み上げが開始される, the Kojien Carta Reader shall 同じ札の `answer` をモーダルで表示する
6. When `howtoread_answer` の読み上げが開始される, the Kojien Carta Reader shall `howtoread_answer` を `answer` のふりがなとして表示する
7. While `howtoread_answer` の読み上げ中である, the Kojien Carta Reader shall 現在読み上げている文字を1文字ずつ表示する
8. When `howtoread_answer` の読み上げが完了する, the Kojien Carta Reader shall `answer` を全文表示の状態にする
9. While 札が提示中である, the Kojien Carta Reader shall `description` と `answer` の内容を保持表示する
10. When 札の読み上げが完了する, the Kojien Carta Reader shall `description` と `answer` を含む読み上げ済みの札を画面下部に表示する
11. The Kojien Carta Reader shall 読み上げ済みの札を全て保持して表示する
12. The Kojien Carta Reader shall 読み上げ済みの札を直近の読み上げ順で上から表示する
13. The Kojien Carta Reader shall 読み上げ済みの札をリスト形式で区切って表示する
14. When `answer` のモーダルが表示される, the Kojien Carta Reader shall 次へボタンをモーダル上に表示する
15. If 次の札に進む, the Kojien Carta Reader shall 前の札の表示を終了し次の札に切り替える

### Requirement 6: セッション制御
**Objective:** As a プレイヤー, I want ゲーム進行を操作できること, so that 二人でテンポよく遊べる

#### Acceptance Criteria
1. When プレイヤーが開始を押す, the Kojien Carta Reader shall 最初の札を提示する
2. When プレイヤーが一時停止を押す, the Kojien Carta Reader shall 出題を停止し再開操作を待つ
3. While 一時停止中である, the Kojien Carta Reader shall 読み上げの進行を行わない
4. When プレイヤーが再開を押す, the Kojien Carta Reader shall 直前の進行状態を再開する
5. When プレイヤーがリセットを押す, the Kojien Carta Reader shall 出題順と状態を初期化する
6. When リセットが完了する, the Kojien Carta Reader shall 最初の出題前の状態に戻す
7. When プレイヤーがトップに戻るボタンを押す, the Kojien Carta Reader shall トップページへ遷移する
8. The Kojien Carta Reader shall 進行状態（待機/出題中/終了）を表示する

### Requirement 7: 札UIの表現
**Objective:** As a プレイヤー, I want かるた札らしい見た目で読札を確認できること, so that 実際のかるたに近い体験になる

#### Acceptance Criteria
1. The Kojien Carta Reader shall 札の表示を縦書きで行う
2. The Kojien Carta Reader shall 読み札をかるた札を想起させるカードUIとして表示する
3. The Kojien Carta Reader shall 読み札UIを画面中央に固定して配置する
4. The Kojien Carta Reader shall 読み札UIの表示領域を画面の60%から80%に収める
5. The Kojien Carta Reader shall 読み札カードの高さを50vhとする
6. While 読み札を表示する, the Kojien Carta Reader shall 15文字ごとに改行する

### Requirement 8: 読み上げ速度の調整
**Objective:** As a プレイヤー, I want 読み上げ速度を調整できること, so that 自分に合ったテンポで遊べる

#### Acceptance Criteria
1. The Kojien Carta Reader shall 右上に読み上げ速度を調整するスライドバーを表示する
2. The Kojien Carta Reader shall 読み上げ速度スライドバーの横にサンプル再生ボタンを表示する
3. When プレイヤーがサンプル再生ボタンを押す, the Kojien Carta Reader shall サンプルテキスト「ふるいけやかわずとびこむなつのおと」を読み上げる
4. When プレイヤーがスライドバーの値を変更する, the Kojien Carta Reader shall サンプル音声を再生しない
5. When 読み上げ速度が設定される, the Kojien Carta Reader shall 以降の全ての札の読み上げにその速度を適用する
