import { useClientContext } from "@/client/components/contexts/ClientContextReactContext";
import { useEffectAsync } from "@/client/util/hooks";
import type {
  ChatVoiceRequest,
  ChatVoiceResponse,
} from "@/pages/api/voices/text_to_speech";
import { jsonPost } from "@/shared/util/fetch_helpers";
import React from "react";

export const VoiceChat: React.FunctionComponent<{
  text?: string;
  voice?: string;
  language?: string;
}> = ({ text, voice, language }) => {
  const { audioManager } = useClientContext();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const latestText = React.useRef(text);

  latestText.current = text;

  useEffectAsync(async () => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.pause();
    audioRef.current.src = "";

    if (!text?.length || !voice?.length) {
      return;
    }

    // Text-to-speech is optional: it requires an external provider key
    // (e.g. ElevenLabs). When that isn't configured the endpoint returns an
    // error, which we swallow so NPC dialogue still works silently.
    let res: ChatVoiceResponse;
    try {
      res = await jsonPost<ChatVoiceResponse, ChatVoiceRequest>(
        "/api/voices/text_to_speech",
        {
          text,
          voice,
          language,
        }
      );
    } catch (error) {
      return;
    }
    if (
      latestText.current === text &&
      audioRef.current &&
      res?.url &&
      audioRef.current.src !== res.url
    ) {
      audioRef.current.src = res.url;
      audioRef.current.volume = audioManager.getVolume("settings.volume.voice");
    }
  }, [text, voice]);

  return <audio ref={audioRef} autoPlay={true} />;
};
