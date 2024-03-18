// import { reduceTalkStyle } from "@/utils/reduceTalkStyle";

export async function synthesizeVoiceApi(
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
  
  // Free向けに感情を制限する
  // const reducedStyle = reduceTalkStyle(style);
  
  console.log(`SynthesizVvoice: message: ${message}`);

  const body = {
    message: message,
    speaker_id: speaker_id,
    sdp_ratio: sdp_ratio,
    noise: noise,
    noisew: noisew,
    length: length,
    language: language,
    auto_split: auto_split,
    split_interval: split_interval,
    assist_text: assist_text,
    assist_text_weight: assist_text_weight,
    style: style,
    style_weight: style_weight,
    reference_audio_path: reference_audio_path,
    given_tone: given_tone,
  };

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // 上記の res は以下の形式。res は handler から渡された NextApiResponse<Data> 形式。
  // res.status(200).json({ audio: base64 });

  console.log(`SynthesizVvoice: resの確認: ${res}`);
  const data = (await res.json()) as any;       // ★ココがあやしいと思ったけど、これで良さそう
  console.log(`SynthesizVvoice: dataの確認: ${data}`);
  return { audio: data.audio };                 // ★ココがあやしいと思ったけど、これで良さそう
}


