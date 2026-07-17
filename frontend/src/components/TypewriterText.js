"use client";
import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 60, delay = 0, className = "", style = {} }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    let timer;
    
    const startTyping = () => {
      timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
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
      <span className="typewriter-cursor" style={{ animation: "lastChanceFlash 0.8s infinite", marginLeft: "2px", color: "#38bdf8" }}>|</span>
    </span>
  );
}
