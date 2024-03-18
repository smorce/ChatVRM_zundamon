// ここでBlobをBase64エンコーディングされたテキストに変換する

import { style_bert_vits2 } from "@/features/koeiromap/koeiromap";

console.log(`TTS: デバッグ出力 aaa`);

import type { NextApiRequest, NextApiResponse } from "next";

console.log(`TTS: デバッグ出力 bbb`);


// BlobをBase64エンコーディングされたテキストに変換する関数
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('BlobをBase64に変換中にエラーが発生しました'));
    };
    reader.readAsDataURL(blob);
  });
};


// Data型を拡張して、エラー情報をオプショナルで持てるようにします。
type Data = {
  audio?: string;
  error?: string;
};

console.log(`TTS: デバッグ出力 ccc`);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const message = req.body.message;
  const speaker_id = req.body.speaker_id;
  const sdp_ratio = req.body.sdp_ratio;
  const noise = req.body.noise;
  const noisew = req.body.noisew;
  const length = req.body.length;
  const language = req.body.language;
  const auto_split = req.body.auto_split;
  const split_interval = req.body.split_interval;
  const assist_text = req.body.assist_text;
  const assist_text_weight = req.body.assist_text_weight;
  const style = req.body.style;
  const style_weight = req.body.style_weight;
  const reference_audio_path = req.body.reference_audio_path;
  const given_tone = req.body.given_tone;
  
  try {
    // `style_bert_vits2`関数を呼び出し、音声データのBlobを取得
    const blob = await style_bert_vits2(
      message,
      speaker_id,
      sdp_ratio,
      noise,
      noisew,
      length,
      language,
      auto_split,
      split_interval,
      assist_text,
      assist_text_weight,
      style,
      style_weight,
      reference_audio_path,
      given_tone
    );

    // BlobをBase64エンコーディングされたテキストに変換し、コンソールに表示
    blobToBase64(blob).then(base64 => {
      // 最初の10文字だけ表示
      console.log(`Base64エンコーディングされた音声データ: ${base64.substring(0, 10)}...`);
    }).catch(error => {
      console.error(error.message);
    });
    // 成功したレスポンスをクライアントに返します。本のコードの voice は { audio: base64 } というJSONデータ(keyがaudio, value の base64 がBase64エンコーディングされた音声データ)なので、こちらもJSONデータにする。
    res.status(200).json({ audio: base64 });
  } catch (error) {
    // エラーハンドリング: エラーが発生した場合は、500のステータスコードとともにエラーメッセージを返します。
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}



