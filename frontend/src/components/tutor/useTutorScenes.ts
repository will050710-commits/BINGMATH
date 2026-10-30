"use client";

import { useCallback, useMemo, useState } from "react";
import { extractMathvizBlock } from "@/lib/mathvizExtract";
import type { MathVizData, ParsedTutorMessage, TutorMessage, TutorScene } from "./scene.types";

/** Selection belongs to a conversation; typing never reparses the transcript. */
export function useTutorScenes(messages: TutorMessage[], conversationKey: string | null) {
  const [selection, setSelection] = useState<{ conversationKey: string | null; id: string } | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const parsedMessages = useMemo<ParsedTutorMessage[]>(() => messages.map((message) => {
    const { text, vizData } = extractMathvizBlock(message.content || "");
    const data = vizData as MathVizData | null;
    const scene: TutorScene | null = message.role === "assistant" && data?.type === "mathviz.v1" && typeof data.widget === "string"
      ? {
          id: `${conversationKey ?? "pending"}:${message.id}`,
          messageId: message.id,
          title: typeof data.title === "string" && data.title.trim() ? data.title : "Hình minh họa toán học",
          source: message.content || "",
          data,
        }
      : null;
    return { ...message, cleanContent: text, scene };
  }), [messages, conversationKey]);

  const scenes = useMemo(() => parsedMessages.flatMap((message) => message.scene ? [message.scene] : []), [parsedMessages]);
  const activeScene = (selection?.conversationKey === conversationKey
    ? scenes.find((scene) => scene.id === selection.id)
    : null) ?? scenes.at(-1) ?? null;

  const selectScene = useCallback((id: string) => {
    setSelection({ conversationKey, id });
    // Increment even for the same scene so its transcript button can reopen it.
    setRevealKey((value) => value + 1);
  }, [conversationKey]);

  return { parsedMessages, activeScene, selectScene, revealKey };
}
