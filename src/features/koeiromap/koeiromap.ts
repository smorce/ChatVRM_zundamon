// import { TalkStyle } from "../messages/messages";

/*
 * 指定されたメッセージを音声合成APIを使用して音声に変換し、
 * その音声データをBase64エンコードした文字列として返す非同期関数です。
 * 
 * @returns Base64エンコードされた音声データの文字列をPromiseで返します。
 */

export async function style_bert_vits2(
  message: string,
  speaker_id: number = 0,
  sdp_ratio: number = 0.6,
  noise: number = 0.6,
  noisew: number = 0.8,
  length: number = 0.8,
  language: string = 'JP',
  auto_split: string = 'true',
  split_interval: number = 1,
  assist_text: string | null = null,
  assist_text_weight: number = 1.0,
  style: string = 'Neutral',
  style_weight: number = 5.0,
  reference_audio_path: string | null = null,
  given_tone: boolean = false
): Promise<string> { // Base64エンコードされた文字列を返す

  // Request body
  const body = {
      // text: message,                          // 変換するテキスト（エラーが出るので、ここでは入れずにURLに含めるようにした）
      speaker_id: speaker_id,                    // 話者のID
      sdp_ratio: sdp_ratio,                      // SDP（Stochastic Duration Predictor）とDP（Duration Predictor）の混合比率
      noise: noise,                              // サンプルノイズの割合（ランダム性を増加させる）
      noisew: noisew,                            // SDPノイズの割合（発音の間隔のばらつきを増加させる）
      length: length,                            // 話速（1が標準）
      language: language,                        // テキストの言語
      auto_split: auto_split,                    // 自動でテキストを分割するか
      split_interval: split_interval,            // 分割した際の無音区間の長さ（秒）
      assist_text: assist_text,                  // 補助テキスト（読み上げと似た声音・感情になりやすい）
      assist_text_weight: assist_text_weight,    // 補助テキストの影響の強さ
      style: style,                              // 音声のスタイル
      style_weight: style_weight,                // スタイルの強さ
      reference_audio_path: reference_audio_path,   // 参照オーディオパス（スタイルを音声ファイルで指定）
      given_tone: given_tone                     // トーン指定の有無
    };
    
  // URLを構築し、クエリパラメータ`text`を追加
  // ★URL は毎回書き換える
  const PUBLIC_URL = "https://1b98-34-73-200-252.ngrok-free.app";
  const url = new URL(`${PUBLIC_URL}/voice`);
  url.searchParams.append('text', message); // `message`をクエリパラメータに追加

  // リクエストのURLとパラメータをコンソールに出力
  // ★ココはできている
  console.log(`koeiromap: メッセージの確認: ${message}`);
  console.log(`koeiromap: Requesting URL: ${url}`);
  console.log(`koeiromap: With params: ${JSON.stringify(body)}`);

  // `fetch`を使用してAPIリクエストを送信、URLにクエリパラメータを含める
  const response = await fetch(
    url,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
          'Content-Type': 'application/json'
      },
    }
  );

  // レスポンスのステータスをコンソールに出力
  // ★ここも200になっている
  console.log(`koeiromap: Response status: ${response.status}`);

  if (!response.ok) {
    console.error(`Request failed: ${response.status}`);
    throw new Error(`Request failed: ${response.status}`);
  }

  // レスポンスの内容（Blob）を取得
  const blob = await response.blob();
  
  // audio/wav タイプであり、空でないことを確認する
  console.log(`Blob type: ${blob.type}`);
  console.log(`Blob size: ${blob.size}`);
  
  
  // BlobをBase64エンコードされた文字列に変換
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReaderが完了したら結果を取得
      const base64data = reader.result as string;
      // データURLスキーマのプレフィックスを削除して、純粋なBase64文字列を取得(最初の10文字)
      const base64Encoded = base64data.split(',')[1];
      // 結果をコンソールに表示
      console.log(`結果を返す前にBase64エンコードされた最初の10文字を確認: ${base64Encoded.slice(0, 10)}`);
      // 結果を返す
      resolve(base64Encoded);
    };
    reader.onerror = () => {
      console.error("Failed to read blob as base64");
      reject("Failed to read blob as base64");
    };
    // FileReaderでBlobを読み込む
    reader.readAsDataURL(blob);
  });
}