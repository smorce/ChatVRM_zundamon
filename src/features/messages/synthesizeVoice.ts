import { reduceTalkStyle } from "@/utils/reduceTalkStyle";
// import { koeiromapV0 } from "../koeiromap/koeiromap";
import { style_bert_vits2 } from "../koeiromap/koeiromap";
import { TalkStyle } from "../messages/messages";

export async function synthesizeVoice(
  message: string,
  speaker_id: number,
  sdp_ratio: number,
  noise: number,
  noisew: number,
  length: number,
  language: string,
  auto_split: string,     // string に変更
  split_interval: number,
  assist_text: string | null,
  assist_text_weight: number,
  style: string,
  style_weight: number,
  reference_audio_path: string | null,
  given_tone: boolean
  ) {

  console.log(`message: ${message}`);

  // style_bert_vits2関数を呼び出して、音声データをBase64エンコーディングされた文字列で取得
  const base64EncodedAudio = await style_bert_vits2(message, speaker_id, sdp_ratio, noise, noisew, length, language, auto_split, split_interval, assist_text, assist_text_weight, style, style_weight, reference_audio_path, given_tone);
  // return { audio: koeiroRes.audio };
  // 取得したBase64エンコーディングされた音声データをオブジェクトのプロパティとして返す
  return { audio: base64EncodedAudio };
}

export async function synthesizeVoiceApi(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle,
  apiKey: string
) {
  // Free向けに感情を制限する
  const reducedStyle = reduceTalkStyle(style);

  const body = {
    message: message,
    speakerX: speakerX,
    speakerY: speakerY,
    style: reducedStyle,
    apiKey: apiKey,
  };

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as any;

  return { audio: data.audio };
}
