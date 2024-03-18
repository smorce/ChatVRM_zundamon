import { VRMExpression, VRMExpressionPresetName } from "@pixiv/three-vrm";
// import { KoeiroParam } from "../constants/koeiroParam";

// ChatGPT API
export type Message = {
  role: "assistant" | "system" | "user";
  content: string;
};

const talkStyles = [
  "talk",
  "happy",
  "sad",
  "angry",
  "fear",
  "surprised",
] as const;
export type TalkStyle = (typeof talkStyles)[number];

export type Talk = {
  // style: TalkStyle;
  // speakerX: number;
  // speakerY: number;
  // message: string;
  message: string;
  speaker_id: number;
  sdp_ratio: number;
  noise: number;
  noisew: number;
  length: number;
  language: string;
  auto_split: string;     // string に変更
  split_interval: number;
  assist_text: string | null;
  assist_text_weight: number;
  style: string;
  style_weight: number;
  reference_audio_path: string | null;
  given_tone: boolean;
};

const emotions = ["neutral", "happy", "angry", "sad", "relaxed"] as const;
type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName;

/**
 * 発話文と音声の感情と、モデルの感情表現がセットになった物
 */
export type Screenplay = {
  expression: EmotionType;
  talk: Talk;
};

export const splitSentence = (text: string): string[] => {
  const splitMessages = text.split(/(?<=[。．！？\n])/g);
  return splitMessages.filter((msg) => msg !== "");
};

// 感情表現のタグを抽出して設定する
export const textsToScreenplay = (
  texts: string[]
  // koeiroParam: KoeiroParam
): Screenplay[] => {
  const screenplays: Screenplay[] = [];
  let prevExpression = "neutral";
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    const match = text.match(/\[(.*?)\]/);

    const tag = (match && match[1]) || prevExpression;

    const message = text.replace(/\[(.*?)\]/g, "");

    let expression = prevExpression;
    if (emotions.includes(tag as any)) {
      expression = tag;
      prevExpression = tag;
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        // style: emotionToTalkStyle(expression as EmotionType),
        // speakerX: koeiroParam.speakerX,
        // speakerY: koeiroParam.speakerY,
        // message: message,
        message: message,
        speaker_id: 0,
        sdp_ratio: 0.6,
        noise: 0.6,
        noisew: 0.8,
        length: 0.8,
        language: 'JP',
        auto_split: 'true',
        split_interval: 1,
        assist_text: null,
        assist_text_weight: 1.0,
        style: 'Neutral',
        style_weight: 5.0,
        reference_audio_path: null,
        given_tone: false,
      },
    });
  }

  return screenplays;
};

const emotionToTalkStyle = (emotion: EmotionType): TalkStyle => {
  switch (emotion) {
    case "angry":
      return "angry";
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    default:
      return "talk";
  }
};
