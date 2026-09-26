"use client";

// frontend/src/components/chat/StreamdownMessage.jsx
//
// Phase 4 — guide item 2.2 (Streamdown).
//
// Renders markdown + LaTeX safely while text is still streaming in. Streamdown
// ships rehype-sanitize + rehype-harden, so AI output is sanitised by the
// library instead of relying on the app's own tokeniser + dangerouslySetInnerHTML.
// The §2.2 note in DUOMATH_AGENT_INTEGRATION_GUIDE.md also allows the backend to
// stop hand-wrapping $...$ / $$...$$ once this renderer is in place.
import { useMemo } from "react";
import { Streamdown } from "streamdown";
import { createMathPlugin } from "@streamdown/math";
import "streamdown/styles.css";
import "katex/dist/katex.min.css";

// Built once per page: the plugin object is stateless and cheap to reuse.
let cachedMathPlugin = null;

function getMathPlugin() {
  if (!cachedMathPlugin) {
    // singleDollarTextMath keeps DuoMath's existing "$...$" inline-math habit.
    cachedMathPlugin = createMathPlugin({ singleDollarTextMath: true });
  }
  return cachedMathPlugin;
}

export default function StreamdownMessage({
  content,
  isStreaming = false,
  className,
  style,
}) {
  const plugins = useMemo(() => ({ math: getMathPlugin() }), []);

  if (content === null || content === undefined || content === "") return null;

  return (
    <div className={className} style={style}>
      <Streamdown plugins={plugins} isAnimating={isStreaming}>
        {String(content)}
      </Streamdown>
    </div>
  );
}
