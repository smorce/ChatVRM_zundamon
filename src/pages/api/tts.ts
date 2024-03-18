import { style_bert_vits2 } from "@/features/koeiromap/koeiromap";

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  audio: string;
};

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
    // `style_bert_vits2`関数を呼び出し、音声データのBase64エンコードされた文字列を取得します。
    const base64EncodedAudio = await style_bert_vits2(
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
    // 成功したレスポンスをクライアントに返します。
    res.status(200).json({ audio: base64EncodedAudio });
  } catch (error) {
    // エラーハンドリング: エラーが発生した場合は、500のステータスコードとともにエラーメッセージを返します。
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}



