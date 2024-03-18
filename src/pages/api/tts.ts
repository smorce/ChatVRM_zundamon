// ここでBlobをBase64エンコーディングされたテキストに変換する
// このファイルはサーバーサイドで、クライアントからのリクエストデータの受け取り、リクエストに基づいた処理の実行（データベースへの問い合わせ、外部APIの呼び出し、ビジネスロジックの適用など）、処理結果のクライアントへの返信 などを行う
// よって、FileReader はブラウザのAPIであり、Node.jsの標準ライブラリには含まれていません。そのため、Next.jsのAPIルートや他のNode.js環境でこのコードを実行しようとすると
// FileReader is not defined というエラーが発生する

import { style_bert_vits2 } from "@/features/koeiromap/koeiromap";

console.log(`TTS: デバッグ出力 aaa`);

import type { NextApiRequest, NextApiResponse } from "next";
import { Blob } from 'fetch-blob';

console.log(`TTS: デバッグ出力 bbb`);


// 以下はクライアントサイドのコードであり、このファイルはサーバーサイドなので動作しない
// BlobをBase64エンコーディングされたテキストに変換する関数
// const blobToBase64 = (blob: Blob): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       resolve(reader.result as string);
//     };
//     reader.onerror = () => {
//       reject(new Error('BlobをBase64に変換中にエラーが発生しました'));
//     };
//     reader.readAsDataURL(blob);
//   });
// };


// サーバーサイドでやる場合は、BlobをBufferに変換し、そのBufferをBase64文字列にエンコーディングする、という2段階の処理をしないといけない
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}


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

    // Step1. BlobをBufferに変換
    const buffer = await blobToBuffer(blob);

    // Step2. BufferからBase64文字列に変換
    const base64 = buffer.toString('base64');
    // 最初の10文字だけ表示
    console.log(`Base64エンコーディングされた音声データ: ${base64.substring(0, 10)}...`);

    // 成功したレスポンスをクライアントに返します。本のコードの voice は { audio: base64 } というJSONデータ(keyがaudio, value の base64 がBase64エンコーディングされた音声データ)なので、こちらもJSONデータにする。
    res.status(200).json({ audio: base64 });
  } catch (error) {
    // `error`が`Error`のインスタンスであるかを確認
    if (error instanceof Error) {
      console.error("エラーが発生しました:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      // `error`が`Error`のインスタンスでない場合の処理
      console.error("予期せぬエラーが発生しました:", error);
      res.status(500).json({ error: "Unknown error" });
    }
  }    
}