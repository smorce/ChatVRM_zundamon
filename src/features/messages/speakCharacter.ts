import { wait } from "@/utils/wait";
import { synthesizeVoiceApi } from "./synthesizeVoice";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    // koeiroApiKey: string,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      // const buffer = await fetchAudio(screenplay.talk, koeiroApiKey).catch(
      const buffer = await fetchAudio(screenplay.talk).catch(
        () => null
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (
  talk: Talk
  // apiKey: string
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceApi(
    // talk.message,
    // talk.speakerX,
    // talk.speakerY,
    // talk.style,
    // apiKey
    talk.message,
    talk.speaker_id,
    talk.sdp_ratio,
    talk.noise,
    talk.noisew,
    talk.length,
    talk.language,
    talk.auto_split,
    talk.split_interval,
    talk.assist_text,
    talk.assist_text_weight,
    talk.style,
    talk.style_weight,
    talk.reference_audio_path,
    talk.given_tone
    );

  // ttsVoice は { audio: data.audio } というJSONデータ。.audio でデータにアクセスする
  // 以下の url は data.audio であり、Base64エンコーディングされた音声データ(data:audio/wav;base64,UklGRiSUAQBXQ ~)
  const url = ttsVoice.audio;

  if (url == null) {
    throw new Error("Something went wrong");
  }

  const resAudio = await fetch(url);
  const buffer = await resAudio.arrayBuffer();
  return buffer;
};
