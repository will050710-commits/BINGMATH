"use client";
import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 60, delay = 0, className = "", style = {} }) {
  const [displayedText, setDisplayedText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setDone(false);
    let index = 0;
    let timer;

    const startTyping = () => {
      timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          // Hide cursor 800ms after finishing
          setTimeout(() => setDone(true), 800);
        }
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [text, speed, delay]);

  return (
    <span className={className} style={style}>
      {displayedText}
      {!done && (
        <span
          className="typewriter-cursor"
          style={{ animation: "lastChanceFlash 0.8s infinite", marginLeft: "2px", color: "#38bdf8" }}
        >|</span>
      )}
    </span>
  );
}
